import { supabase } from "~/database/SupabaseClient";
import { logError } from "~/database/Auth";
import type {
  Meal,
  SlotType,
} from "~/data/CustomTypes";
import type { NewMeal } from "./Insert";

/******************************
 * shopping/Update
 * UPDATEs and upserts for the shopping module.
 *
 * The two "replace lines" helpers delete-then-insert rather than diffing. With
 * a handful of rows per meal that is simpler and always converges; the cost of
 * a diff is not worth paying here.
 */

/** One editable ingredient row in the meal modal. */
export interface EditableLine {
  ingredient_id: string;
  quantity: number;
  unit: string | null;
}

/******************************
 * updateMeal
 * Edit a meal's own details.
 */
export async function updateMeal(
  mealId: string,
  patch: Partial<NewMeal>,
): Promise<Meal> {
  const { data, error } = await supabase
    .from("shopping_meals")
    .update(patch)
    .eq("id", mealId)
    .select(
      "id, name, prep_minutes, cuisine, recipe_url, recipe_note",
    )
    .single();

  if (error) {
    logError(error, ["updateMeal"]);
    throw error;
  }
  return data;
}

/******************************
 * replaceMealLines
 * Replace a meal's recipe lines. This is the permanent edit — it changes the
 * meal everywhere it is ever planned.
 */
export async function replaceMealLines(
  mealId: string,
  lines: EditableLine[],
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("shopping_meal_ingredients")
    .delete()
    .eq("meal_id", mealId);

  if (deleteError) {
    logError(deleteError, [
      "replaceMealLines",
      "delete",
    ]);
    throw deleteError;
  }

  if (lines.length === 0) return;

  const { error } = await supabase
    .from("shopping_meal_ingredients")
    .insert(
      lines.map((l) => ({
        meal_id: mealId,
        ingredient_id: l.ingredient_id,
        quantity: l.quantity,
        unit: l.unit,
      })),
    );

  if (error) {
    logError(error, [
      "replaceMealLines",
      "insert",
    ]);
    throw error;
  }
}

/******************************
 * replaceWeekDayOverrides
 * Replace the per-week ingredient override for one planned day. Passing an
 * empty list clears the override, so the day falls back to the meal's own
 * recipe. This never touches the meal itself.
 */
export async function replaceWeekDayOverrides(
  weekPlanDayId: string,
  lines: EditableLine[],
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("shopping_week_plan_day_ingredients")
    .delete()
    .eq("week_plan_day_id", weekPlanDayId);

  if (deleteError) {
    logError(deleteError, [
      "replaceWeekDayOverrides",
      "delete",
    ]);
    throw deleteError;
  }

  if (lines.length === 0) return;

  const { error } = await supabase
    .from("shopping_week_plan_day_ingredients")
    .insert(
      lines.map((l) => ({
        week_plan_day_id: weekPlanDayId,
        ingredient_id: l.ingredient_id,
        quantity: l.quantity,
        unit: l.unit,
      })),
    );

  if (error) {
    logError(error, [
      "replaceWeekDayOverrides",
      "insert",
    ]);
    throw error;
  }
}

/******************************
 * setWeekDay
 * Put a meal (or Takeaway / Leftovers / nothing) in a day slot. Returns the row
 * id, which the caller needs to attach a per-week override to.
 */
export async function setWeekDay(
  weekPlanId: string,
  dayIndex: number,
  slotType: SlotType,
  mealId: string | null,
): Promise<string> {
  const { data, error } = await supabase
    .from("shopping_week_plan_days")
    .upsert(
      {
        week_plan_id: weekPlanId,
        day_index: dayIndex,
        slot_type: slotType,
        // The DB check constraint insists these agree.
        meal_id:
          slotType === "meal" ? mealId : null,
      },
      { onConflict: "week_plan_id,day_index" },
    )
    .select("id")
    .single();

  if (error) {
    logError(error, ["setWeekDay"]);
    throw error;
  }
  return data.id;
}

/******************************
 * setIngredientChecked
 * Tick or untick one ingredient on the week's shopping list. `bought` belongs
 * to the shopping run, which is why this is keyed by week plan.
 */
export async function setIngredientChecked(
  weekPlanId: string,
  ingredientId: string,
  checked: boolean,
): Promise<void> {
  if (!checked) {
    const { error } = await supabase
      .from("shopping_checked_items")
      .delete()
      .eq("week_plan_id", weekPlanId)
      .eq("ingredient_id", ingredientId);

    if (error) {
      logError(error, [
        "setIngredientChecked",
        "uncheck",
      ]);
      throw error;
    }
    return;
  }

  const { error } = await supabase
    .from("shopping_checked_items")
    .upsert(
      {
        week_plan_id: weekPlanId,
        ingredient_id: ingredientId,
      },
      {
        onConflict: "week_plan_id,ingredient_id",
      },
    );

  if (error) {
    logError(error, [
      "setIngredientChecked",
      "check",
    ]);
    throw error;
  }
}
