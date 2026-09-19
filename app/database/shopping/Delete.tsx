import { supabase } from "~/database/SupabaseClient";
import { logError } from "~/database/Auth";

/******************************
 * shopping/Delete
 * Removals for the shopping module.
 *
 * Meals are soft-deleted: past weeks reference them, and the statistics view
 * reads that history, so a hard delete would rewrite what we actually ate.
 * Week day slots are cleared rather than removed, so the seven rows stay put.
 */

/******************************
 * softDeleteMeal
 * Retire a meal. It disappears from the list and the picker, but stays attached
 * to the weeks it was already planned in.
 */
export async function softDeleteMeal(
  mealId: string,
): Promise<void> {
  const { error } = await supabase
    .from("shopping_meals")
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq("id", mealId);

  if (error) {
    logError(error, ["softDeleteMeal"]);
    throw error;
  }
}

/******************************
 * clearWeekDay
 * Empty one day slot.
 *
 * The row is kept (so the week always has seven), which means the per-week
 * ingredient override hanging off it would survive and silently reappear if the
 * same meal were planned there again. So it is deleted explicitly first.
 */
export async function clearWeekDay(
  weekPlanId: string,
  dayIndex: number,
): Promise<void> {
  const { data: day, error: findError } =
    await supabase
      .from("shopping_week_plan_days")
      .select("id")
      .eq("week_plan_id", weekPlanId)
      .eq("day_index", dayIndex)
      .maybeSingle();

  if (findError) {
    logError(findError, ["clearWeekDay", "find"]);
    throw findError;
  }
  if (!day) return;

  const { error: overrideError } = await supabase
    .from("shopping_week_plan_day_ingredients")
    .delete()
    .eq("week_plan_day_id", day.id);

  if (overrideError) {
    logError(overrideError, [
      "clearWeekDay",
      "overrides",
    ]);
    throw overrideError;
  }

  const { error } = await supabase
    .from("shopping_week_plan_days")
    .update({ slot_type: "none", meal_id: null })
    .eq("id", day.id);

  if (error) {
    logError(error, ["clearWeekDay"]);
    throw error;
  }
}
