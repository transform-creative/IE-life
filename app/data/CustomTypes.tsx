import type { Enums } from "~/data/supabase";

/******************************
 * CustomTypes
 * Composite/domain types shared across layers. These live here rather than in a
 * feature folder so `app/database/*` and `app/presentation/*` can both use them
 * without the database layer importing from the presentation layer.
 *
 * They are the *flattened* shapes the app works with — the nested rows Supabase
 * returns are mapped into these by the fetchers in `app/database/shopping/`.
 */

/** A day slot holds a meal, or one of the non-meal markers. */
export type SlotType =
  Enums<"shopping_slot_type">;

export interface Ingredient {
  id: string;
  name: string;
  default_unit: string | null;
}

/**
 * One line of a recipe, in COOKING units (`500 g`, `0.5 pack`). Carries the
 * ingredient name so the UI and the aggregator never need a second lookup.
 */
export interface RecipeLine {
  ingredient_id: string;
  ingredient_name: string;
  quantity: number;
  unit: string | null;
}

export interface Meal {
  id: string;
  name: string;
  prep_minutes: number | null;
  cuisine: string | null;
  recipe_url: string | null;
  recipe_note: string | null;
}

export interface MealWithLines extends Meal {
  lines: RecipeLine[];
}

/**
 * One day of a week plan. `overrides` is the per-week ingredient edit: when it
 * has any rows they REPLACE the meal's own lines for this week only, which is
 * what keeps a week-page edit from changing the meal itself.
 */
export interface WeekDay {
  id: string | null;
  day_index: number;
  slot_type: SlotType;
  meal: MealWithLines | null;
  overrides: RecipeLine[];
}

export interface WeekPlan {
  id: string;
  week_start_date: string;
  days: WeekDay[];
}

export interface WeekTemplateDay {
  day_index: number;
  slot_type: SlotType;
  meal_id: string | null;
}

export interface WeekTemplate {
  id: string;
  name: string;
  sort_order: number;
  days: WeekTemplateDay[];
}

/**
 * A row of the week's shopping list. `key` is `ingredient_id|unit` — lines that
 * share an ingredient but differ in unit stay separate, because `400 g` and
 * `1 can` of tinned tomatoes cannot be added together.
 */
export interface AggregatedIngredient {
  key: string;
  ingredient_id: string;
  ingredient_name: string;
  quantity: number;
  unit: string | null;
}
