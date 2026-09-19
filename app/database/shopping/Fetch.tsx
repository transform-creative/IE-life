import { supabase } from "~/database/SupabaseClient";
import { logError } from "~/database/Auth";
import type {
  Ingredient,
  Meal,
  MealWithLines,
  RecipeLine,
  WeekDay,
  WeekPlan,
  WeekTemplate,
} from "~/data/CustomTypes";

/******************************
 * shopping/Fetch
 * Every SELECT for the shopping module. Rows come back nested and are flattened
 * into the domain types from `~/data/CustomTypes` here, so nothing downstream
 * has to know the shape of a Supabase join.
 *
 * No household filter appears in these queries — RLS already restricts every
 * row to the caller's household, so adding one would be redundant.
 */

/** The nested `shopping_meal_ingredients -> shopping_ingredients` shape. */
type RawLine = {
  ingredient_id: string;
  quantity: number;
  unit: string | null;
  ingredient: { name: string } | null;
};

function toLines(
  raw: RawLine[] | null,
): RecipeLine[] {
  return (raw ?? []).map((l) => ({
    ingredient_id: l.ingredient_id,
    ingredient_name: l.ingredient?.name ?? "",
    quantity: Number(l.quantity),
    unit: l.unit,
  }));
}

const MEAL_FIELDS =
  "id, name, prep_minutes, cuisine, recipe_url, recipe_note";

const MEAL_WITH_LINES = `
  ${MEAL_FIELDS},
  lines:shopping_meal_ingredients (
    ingredient_id, quantity, unit,
    ingredient:shopping_ingredients ( name )
  )
`;

/******************************
 * fetchMeals
 * Every meal, for the meal list and the week selector's dropdown. Capped well
 * under the 200-meal ceiling, so there is no pagination by design.
 */
export async function fetchMeals(): Promise<
  Meal[]
> {
  const { data, error } = await supabase
    .from("shopping_meals")
    .select(MEAL_FIELDS)
    .is("deleted_at", null)
    .order("name");

  if (error) {
    logError(error, ["fetchMeals"]);
    throw error;
  }
  return data ?? [];
}

/******************************
 * fetchMealWithLines
 * One meal and its recipe lines — what the edit modal loads.
 */
export async function fetchMealWithLines(
  mealId: string,
): Promise<MealWithLines | null> {
  const { data, error } = await supabase
    .from("shopping_meals")
    .select(MEAL_WITH_LINES)
    .eq("id", mealId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    logError(error, ["fetchMealWithLines"]);
    throw error;
  }
  if (!data) return null;

  return {
    ...data,
    lines: toLines(data.lines as RawLine[]),
  };
}

/******************************
 * fetchIngredients
 * The canonical ingredient list, for the edit modal's ingredient picker.
 */
export async function fetchIngredients(): Promise<
  Ingredient[]
> {
  const { data, error } = await supabase
    .from("shopping_ingredients")
    .select("id, name, default_unit")
    .is("deleted_at", null)
    .order("name");

  if (error) {
    logError(error, ["fetchIngredients"]);
    throw error;
  }
  return data ?? [];
}

/******************************
 * fetchWeekPlan
 * A whole week in one round trip: the days, each day's meal and recipe lines,
 * and any per-week ingredient overrides. Returns null when the week has never
 * been planned — callers create the plan lazily on first edit.
 */
export async function fetchWeekPlan(
  weekStart: string,
): Promise<WeekPlan | null> {
  const { data, error } = await supabase
    .from("shopping_week_plans")
    .select(
      `
      id, week_start_date,
      days:shopping_week_plan_days (
        id, day_index, slot_type,
        meal:shopping_meals ( ${MEAL_WITH_LINES} ),
        overrides:shopping_week_plan_day_ingredients (
          ingredient_id, quantity, unit,
          ingredient:shopping_ingredients ( name )
        )
      )
    `,
    )
    .eq("week_start_date", weekStart)
    .maybeSingle();

  if (error) {
    logError(error, ["fetchWeekPlan"]);
    throw error;
  }
  if (!data) return null;

  const days: WeekDay[] = (data.days ?? []).map(
    (d: any) => ({
      id: d.id,
      day_index: d.day_index,
      slot_type: d.slot_type,
      meal: d.meal
        ? {
            ...d.meal,
            lines: toLines(d.meal.lines),
          }
        : null,
      overrides: toLines(d.overrides),
    }),
  );

  return {
    id: data.id,
    week_start_date: data.week_start_date,
    days,
  };
}

/******************************
 * fetchWeekTemplates
 * The named reusable weeks ("SIMPLE AS", "AUTUMN FEAST"), used to fill a week
 * in one action.
 */
export async function fetchWeekTemplates(): Promise<
  WeekTemplate[]
> {
  const { data, error } = await supabase
    .from("shopping_week_templates")
    .select(
      `
      id, name, sort_order,
      days:shopping_week_template_days (
        day_index, slot_type, meal_id
      )
    `,
    )
    .order("sort_order");

  if (error) {
    logError(error, ["fetchWeekTemplates"]);
    throw error;
  }

  return (data ?? []).map((t: any) => ({
    id: t.id,
    name: t.name,
    sort_order: t.sort_order,
    days: (t.days ?? []).sort(
      (a: any, b: any) =>
        a.day_index - b.day_index,
    ),
  }));
}

/******************************
 * fetchCheckedIngredientIds
 * Which of the week's ingredients have been ticked off. The list itself is
 * derived from the week's meals — only the ticks are stored.
 */
export async function fetchCheckedIngredientIds(
  weekPlanId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("shopping_checked_items")
    .select("ingredient_id")
    .eq("week_plan_id", weekPlanId);

  if (error) {
    logError(error, [
      "fetchCheckedIngredientIds",
    ]);
    throw error;
  }
  return (data ?? []).map((r) => r.ingredient_id);
}
