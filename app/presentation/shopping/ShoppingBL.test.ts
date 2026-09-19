import { describe, it, expect } from "vitest";
import { DateTime } from "luxon";
import type {
  RecipeLine,
  SlotType,
  WeekDay,
} from "~/data/CustomTypes";
import {
  aggregateWeekIngredients,
  dayIndexOf,
  describeDay,
  emptyWeekDays,
  formatPrepTime,
  formatQuantity,
  getWeekDays,
  getWeekStart,
  mergeDays,
  normaliseIngredientName,
  resolveDayIngredients,
} from "./ShoppingBL";

/** A recipe line, keyed by ingredient name for readability in the assertions. */
function line(
  name: string,
  quantity: number,
  unit: string | null = null,
): RecipeLine {
  return {
    ingredient_id: `id-${name}`,
    ingredient_name: name,
    quantity,
    unit,
  };
}

function day(
  day_index: number,
  slot_type: SlotType,
  lines: RecipeLine[] = [],
  overrides: RecipeLine[] = [],
): WeekDay {
  return {
    id: `day-${day_index}`,
    day_index,
    slot_type,
    meal:
      slot_type === "meal"
        ? {
            id: `meal-${day_index}`,
            name: `Meal ${day_index}`,
            prep_minutes: 30,
            cuisine: null,
            recipe_url: null,
            recipe_note: null,
            lines,
          }
        : null,
    overrides,
  };
}

describe("normaliseIngredientName", () => {
  it("lowercases, trims and collapses whitespace", () => {
    expect(
      normaliseIngredientName("  Beef   Mince "),
    ).toBe("beef mince");
  });

  it("maps the source data's casing variants together", () => {
    expect(
      normaliseIngredientName("Chicken breast"),
    ).toBe(
      normaliseIngredientName("chicken breast"),
    );
  });
});

describe("week boundaries", () => {
  it("starts the week on Monday", () => {
    // 2026-09-19 is a Saturday.
    expect(
      getWeekStart(
        DateTime.fromISO("2026-09-19"),
      ),
    ).toBe("2026-09-14");
  });

  it("treats Monday as its own week start", () => {
    expect(
      getWeekStart(
        DateTime.fromISO("2026-09-14"),
      ),
    ).toBe("2026-09-14");
  });

  it("keeps Sunday in the week that began the Monday before", () => {
    expect(
      getWeekStart(
        DateTime.fromISO("2026-09-20"),
      ),
    ).toBe("2026-09-14");
  });

  it("returns seven consecutive days", () => {
    const days = getWeekDays("2026-09-14");
    expect(days).toHaveLength(7);
    expect(days[0].toISODate()).toBe(
      "2026-09-14",
    );
    expect(days[6].toISODate()).toBe(
      "2026-09-20",
    );
  });

  it("indexes Monday as 0 and Sunday as 6", () => {
    expect(
      dayIndexOf(DateTime.fromISO("2026-09-14")),
    ).toBe(0);
    expect(
      dayIndexOf(DateTime.fromISO("2026-09-20")),
    ).toBe(6);
  });
});

describe("resolveDayIngredients", () => {
  it("uses the meal's own lines when there is no override", () => {
    const d = day(0, "meal", [
      line("beef mince", 500, "g"),
    ]);
    expect(resolveDayIngredients(d)).toEqual([
      line("beef mince", 500, "g"),
    ]);
  });

  it("lets an override replace the meal's lines entirely", () => {
    const d = day(
      0,
      "meal",
      [line("beef mince", 500, "g")],
      [line("chicken", 300, "g")],
    );
    expect(resolveDayIngredients(d)).toEqual([
      line("chicken", 300, "g"),
    ]);
  });

  it("contributes nothing for takeaway, leftovers or an empty slot", () => {
    for (const slot of [
      "takeaway",
      "leftovers",
      "none",
    ] as SlotType[]) {
      expect(
        resolveDayIngredients(day(0, slot)),
      ).toEqual([]);
    }
  });
});

describe("aggregateWeekIngredients", () => {
  it("sums the same ingredient in the same unit", () => {
    const rows = aggregateWeekIngredients([
      day(0, "meal", [
        line("beef mince", 500, "g"),
      ]),
      day(1, "meal", [
        line("beef mince", 500, "g"),
      ]),
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0].quantity).toBe(1000);
    expect(rows[0].unit).toBe("g");
  });

  it("keeps the same ingredient in different units apart", () => {
    // Tinned tomatoes really are recorded as both `400 g` and `1 can`.
    const rows = aggregateWeekIngredients([
      day(0, "meal", [
        line("tinned tomatoes", 400, "g"),
      ]),
      day(1, "meal", [
        line("tinned tomatoes", 1, "can"),
      ]),
    ]);

    expect(rows).toHaveLength(2);
    expect(
      rows.map((r) => r.unit).sort(),
    ).toEqual(["can", "g"]);
  });

  it("adds fractional packs without floating-point drift", () => {
    const rows = aggregateWeekIngredients([
      day(0, "meal", [
        line("spaghetti", 0.5, "pack"),
      ]),
      day(1, "meal", [
        line("spaghetti", 0.25, "pack"),
      ]),
      day(2, "meal", [
        line("spaghetti", 0.25, "pack"),
      ]),
    ]);

    expect(rows[0].quantity).toBe(1);
  });

  it("treats a unitless line as its own group", () => {
    const rows = aggregateWeekIngredients([
      day(0, "meal", [line("tomato", 2)]),
      day(1, "meal", [line("tomato", 1)]),
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0].quantity).toBe(3);
    expect(rows[0].unit).toBeNull();
  });

  it("prefers the override when aggregating", () => {
    const rows = aggregateWeekIngredients([
      day(
        0,
        "meal",
        [line("beef mince", 500, "g")],
        [line("chicken", 300, "g")],
      ),
    ]);

    expect(
      rows.map((r) => r.ingredient_name),
    ).toEqual(["chicken"]);
  });

  it("ignores non-meal days", () => {
    expect(
      aggregateWeekIngredients([
        day(0, "takeaway"),
        day(1, "leftovers"),
        day(2, "none"),
      ]),
    ).toEqual([]);
  });

  it("sorts alphabetically so the list is stable between renders", () => {
    const rows = aggregateWeekIngredients([
      day(0, "meal", [
        line("zucchini", 1),
        line("avocado", 1),
        line("leek", 1),
      ]),
    ]);

    expect(
      rows.map((r) => r.ingredient_name),
    ).toEqual(["avocado", "leek", "zucchini"]);
  });
});

describe("formatQuantity", () => {
  it("drops the decimal on whole numbers", () => {
    expect(formatQuantity(500, "g")).toBe(
      "500 g",
    );
  });

  it("keeps a fraction", () => {
    expect(formatQuantity(0.5, "pack")).toBe(
      "0.5 pack",
    );
  });

  it("omits the unit for a countable item", () => {
    expect(formatQuantity(2, null)).toBe("2");
  });
});

describe("formatPrepTime", () => {
  it("formats recorded minutes", () => {
    expect(formatPrepTime(30)).toBe("~ 30 mins");
  });

  it("returns null when no time is recorded", () => {
    expect(formatPrepTime(null)).toBeNull();
    expect(formatPrepTime(0)).toBeNull();
  });
});

describe("describeDay", () => {
  it("names the meal", () => {
    expect(describeDay(day(0, "meal", []))).toBe(
      "Meal 0",
    );
  });

  it("labels the non-meal slots", () => {
    expect(describeDay(day(0, "takeaway"))).toBe(
      "Takeaway",
    );
    expect(describeDay(day(0, "leftovers"))).toBe(
      "Leftovers",
    );
  });

  it("is blank for an unplanned or missing day", () => {
    expect(describeDay(day(0, "none"))).toBe("");
    expect(describeDay(undefined)).toBe("");
  });
});

describe("mergeDays", () => {
  it("always yields seven slots indexed 0-6", () => {
    const merged = mergeDays([
      day(3, "meal", [line("tuna", 1, "can")]),
    ]);

    expect(merged).toHaveLength(7);
    expect(merged[3].slot_type).toBe("meal");
    expect(merged[0].slot_type).toBe("none");
    expect(
      merged.map((d) => d.day_index),
    ).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it("ignores an out-of-range day rather than throwing", () => {
    expect(
      mergeDays([day(9, "meal", [])]),
    ).toEqual(emptyWeekDays());
  });
});
