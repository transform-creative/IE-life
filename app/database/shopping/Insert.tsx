import { supabase } from "~/database/SupabaseClient";
import { logError } from "~/database/Auth";
import type {
  Ingredient,
  Meal,
  SlotType,
  WeekTemplate,
} from "~/data/CustomTypes";

/******************************
 * shopping/Insert
 * INSERTs for the shopping module.
 *
 * `household_id` is never passed: the column defaults to
 * `current_household_id()`, so the database stamps it from the caller's JWT and
 * there is no way for the client to write into another household.
 */

export interface NewMeal {
  name: string;
  prep_minutes: number | null;
  cuisine: string | null;
  recipe_url: string | null;
  recipe_note: string | null;
}

/******************************
 * insertMeal
 * Create a meal. The unique index on (household, lower(name)) means a duplicate
 * name fails loudly rather than quietly creating a second "Pizza".
 */
export async function insertMeal(
  meal: NewMeal,
): Promise<Meal> {
  const { data, error } = await supabase
    .from("shopping_meals")
    .insert(meal)
    .select(
      "id, name, prep_minutes, cuisine, recipe_url, recipe_note",
    )
    .single();

  if (error) {
    logError(error, ["insertMeal"]);
    throw error;
  }
  return data;
}

/******************************
 * ensureIngredient
 * Find an ingredient by name, or create it. Names are matched case-insensitively
 * so the user typing "Beef Mince" reuses the existing "beef mince" row instead
 * of creating a near-duplicate the shopping list can't aggregate.
 */
export async function ensureIngredient(
  name: string,
  defaultUnit: string | null = null,
): Promise<Ingredient> {
  const clean = name.trim();

  const { data: found, error: findError } =
    await supabase
      .from("shopping_ingredients")
      .select("id, name, default_unit")
      .ilike("name", clean)
      .is("deleted_at", null)
      .maybeSingle();

  if (findError) {
    logError(findError, [
      "ensureIngredient",
      "find",
    ]);
    throw findError;
  }
  if (found) return found;

  const { data, error } = await supabase
    .from("shopping_ingredients")
    .insert({
      name: clean.toLowerCase(),
      default_unit: defaultUnit,
    })
    .select("id, name, default_unit")
    .single();

  if (error) {
    logError(error, [
      "ensureIngredient",
      "insert",
    ]);
    throw error;
  }
  return data;
}

/******************************
 * ensureWeekPlan
 * The week plan for a Monday, created on demand. Weeks are only persisted once
 * something is actually planned, so browsing an empty future week writes nothing.
 */
export async function ensureWeekPlan(
  weekStart: string,
): Promise<string> {
  const { data: found, error: findError } =
    await supabase
      .from("shopping_week_plans")
      .select("id")
      .eq("week_start_date", weekStart)
      .maybeSingle();

  if (findError) {
    logError(findError, [
      "ensureWeekPlan",
      "find",
    ]);
    throw findError;
  }
  if (found) return found.id;

  const { data, error } = await supabase
    .from("shopping_week_plans")
    .insert({ week_start_date: weekStart })
    .select("id")
    .single();

  if (error) {
    logError(error, ["ensureWeekPlan", "insert"]);
    throw error;
  }
  return data.id;
}

/******************************
 * applyWeekTemplate
 * Overwrite all seven days of a week from a template. Days the template leaves
 * unset become empty slots, so applying a template is a clean replace rather
 * than a merge — which is what "load a starting point" should mean.
 */
export async function applyWeekTemplate(
  weekPlanId: string,
  template: WeekTemplate,
): Promise<void> {
  const byIndex = new Map(
    template.days.map((d) => [d.day_index, d]),
  );

  const rows = Array.from(
    { length: 7 },
    (_, day_index) => {
      const d = byIndex.get(day_index);
      const slot_type: SlotType =
        d?.slot_type ?? "none";
      return {
        week_plan_id: weekPlanId,
        day_index,
        slot_type,
        meal_id:
          slot_type === "meal"
            ? d!.meal_id
            : null,
      };
    },
  );

  const { error } = await supabase
    .from("shopping_week_plan_days")
    .upsert(rows, {
      onConflict: "week_plan_id,day_index",
    });

  if (error) {
    logError(error, ["applyWeekTemplate"]);
    throw error;
  }
}
