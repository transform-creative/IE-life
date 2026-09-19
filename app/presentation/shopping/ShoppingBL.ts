import { DateTime } from "luxon";
import type {
  AggregatedIngredient,
  RecipeLine,
  SlotType,
  WeekDay,
} from "~/data/CustomTypes";

/******************************
 * ShoppingBL
 * Pure logic for the shopping module — no React, no Supabase, so it can be
 * tested directly. See ./CLAUDE.md for the domain rules these implement.
 */

/** Monday-first, matching the day strip in the designs. */
export const DAY_LETTERS = [
  "M",
  "T",
  "W",
  "T",
  "F",
  "S",
  "S",
] as const;

export const DAY_NAMES = [
  "Mon",
  "Tues",
  "Wed",
  "Thurs",
  "Fri",
  "Sat",
  "Sun",
] as const;

/** Non-meal slots a day can hold. `none` is "nothing planned yet". */
export const SLOT_LABELS: Record<
  SlotType,
  string
> = {
  meal: "Meal",
  takeaway: "Takeaway",
  leftovers: "Leftovers",
  none: "",
};

/******************************
 * normaliseIngredientName
 * Canonical form for comparing/deduping an ingredient the user typed. The
 * source data has the same thing many ways ("Beef mince" / "beef mince"), and
 * aggregation is only as good as the normalisation in front of it.
 */
export function normaliseIngredientName(
  raw: string,
): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/******************************
 * getWeekStart
 * The Monday of the week containing `date`, as an ISO date string.
 */
export function getWeekStart(
  date: DateTime = DateTime.now(),
): string {
  return date.startOf("week").toISODate()!;
}

/******************************
 * getWeekDays
 * The seven DateTimes of a week, Monday first.
 */
export function getWeekDays(
  weekStart: string,
): DateTime[] {
  const start = DateTime.fromISO(weekStart);
  return Array.from({ length: 7 }, (_, i) =>
    start.plus({ days: i }),
  );
}

/******************************
 * dayIndexOf
 * 0 = Monday ... 6 = Sunday. Luxon's `weekday` is already 1-7 Monday-first.
 */
export function dayIndexOf(
  date: DateTime = DateTime.now(),
): number {
  return date.weekday - 1;
}

/******************************
 * resolveDayIngredients
 * The recipe lines that actually count for a planned day. A non-empty override
 * set REPLACES the meal's own lines — that is what makes editing a meal from
 * the week page a week-only change.
 */
export function resolveDayIngredients(
  day: WeekDay,
): RecipeLine[] {
  if (day.slot_type !== "meal") return [];
  if (day.overrides.length > 0)
    return day.overrides;
  return day.meal?.lines ?? [];
}

/******************************
 * aggregateWeekIngredients
 * Sum a week's recipe lines per ingredient, in cooking units.
 *
 * Lines are grouped by (ingredient, unit), NOT by ingredient alone: `400 g` and
 * `1 can` of tinned tomatoes are both real, and adding them would produce a
 * number that means nothing. Converting them into a single purchase unit is a
 * later job that needs per-ingredient purchase data.
 */
export function aggregateWeekIngredients(
  days: WeekDay[],
): AggregatedIngredient[] {
  const byKey = new Map<
    string,
    AggregatedIngredient
  >();

  for (const day of days) {
    for (const line of resolveDayIngredients(
      day,
    )) {
      const unit = line.unit?.trim() || null;
      const key = `${line.ingredient_id}|${unit ?? ""}`;
      const existing = byKey.get(key);

      if (existing) {
        existing.quantity += line.quantity;
        continue;
      }

      byKey.set(key, {
        key,
        ingredient_id: line.ingredient_id,
        ingredient_name: line.ingredient_name,
        quantity: line.quantity,
        unit,
      });
    }
  }

  return Array.from(byKey.values())
    .map((row) => ({
      ...row,
      // Sums of 0.25/0.5 steps can drift in binary floating point.
      quantity:
        Math.round(row.quantity * 100) / 100,
    }))
    .sort((a, b) =>
      a.ingredient_name.localeCompare(
        b.ingredient_name,
      ),
    );
}

/******************************
 * formatQuantity
 * "500 g", "0.5 pack", or just "2" for a countable whole item.
 */
export function formatQuantity(
  quantity: number,
  unit: string | null,
): string {
  const qty = Number.isInteger(quantity)
    ? String(quantity)
    : String(Math.round(quantity * 100) / 100);
  return unit ? `${qty} ${unit}` : qty;
}

/******************************
 * formatPrepTime
 * "~30 mins" for the home card. Null when the meal has no recorded time.
 */
export function formatPrepTime(
  minutes: number | null,
): string | null {
  if (!minutes || minutes <= 0) return null;
  return `~ ${minutes} mins`;
}

/******************************
 * describeDay
 * What to show in a day slot: the meal name, "Takeaway"/"Leftovers", or "".
 */
export function describeDay(
  day: WeekDay | undefined,
): string {
  if (!day || day.slot_type === "none") return "";
  if (day.slot_type === "meal")
    return day.meal?.name ?? "";
  return SLOT_LABELS[day.slot_type];
}

/******************************
 * emptyWeekDays
 * Seven blank slots, used before a week plan exists so the selector always has
 * something to render.
 */
export function emptyWeekDays(): WeekDay[] {
  return Array.from(
    { length: 7 },
    (_, day_index) => ({
      id: null,
      day_index,
      slot_type: "none" as SlotType,
      meal: null,
      overrides: [],
    }),
  );
}

/******************************
 * mergeDays
 * Overlay the days a week plan actually has onto seven blank slots, so callers
 * can always index 0-6 without a null check.
 */
export function mergeDays(
  days: WeekDay[],
): WeekDay[] {
  const merged = emptyWeekDays();
  for (const day of days) {
    if (day.day_index < 0 || day.day_index > 6)
      continue;
    merged[day.day_index] = day;
  }
  return merged;
}
