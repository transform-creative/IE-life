# Shopping & meal planning

Plan a week of dinners → roll the recipes' ingredients into one consolidated list → tick it off
while placing a Woolworths online order.

Replaces [this spreadsheet](https://docs.google.com/spreadsheets/d/1YhQNqPtkCjadfluEdskly3BYJAlX1cmbVMZrgTLlAhM/edit).
A local copy of the extracted source data lives in `SpreadsheetSource.md` — read that instead of
re-fetching the sheet.

## Domain model

Five concepts, taken from the spreadsheet's five tabs:

| Concept           | What it is                                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| **Meal**          | A dinner. Name, prep-time bucket (`10-20` / `20-40` / `40+`), cuisine, source (URL or cookbook page) |
| **Recipe line**   | One `(meal, qty, unit, ingredient)` row. A meal has many                                             |
| **Week plan**     | Seven day-slots, each holding a meal or a non-meal marker                                            |
| **Week template** | A named, reusable week plan ("SIMPLE AS", "AUTUMN FEAST", "MEXICAN") to load as a starting point     |
| **Staple**        | A recurring item bought independently of any recipe (fruit, salad veg), with a persistent note       |

## The two unit systems — the core rule

Recipe lines are in **cooking units** (`500 g` beef mince, `0.5 pack` spaghetti, `0.25 bunch`
spring onion). The shopping list must be in **purchase units** — how Woolworths actually sells the
thing (`1 kg` beef mince, `1 pack` spaghetti, `1 tin` corn).

So generating a list is three steps, not one:

1. **Normalise** the ingredient name (see below), so lines that mean the same thing can combine.
2. **Sum** the recipe lines per normalised ingredient, in cooking units.
3. **Convert and round up** to the nearest whole purchase unit. `0.5 pack` + `0.5 pack` is
   `1 pack`; `0.5 pack` alone is still `1 pack` — you cannot buy half a packet.

Step 3 needs a per-ingredient purchase-unit mapping (`corn → tin`, `chicken → grams`,
`pasta sauce → jar`). That mapping is data, not a heuristic — an ingredient without one can't be
converted, and should surface as-is rather than being silently guessed at.

## Ingredient names are dirty

The source data has no canonical ingredient list, so the same thing appears many ways: casing
(`Beef mince` / `mince`), typos (`zuccini`, `Enciladas`, `chorizo suassage`, `Tuna morney` vs
`Tuna mornay`), and specificity (`chicken` / `chicken breast` / `Chicken thigh`). **Aggregation is
only as good as the normalisation in front of it** — without a canonical ingredient table, one meal
plan produces three separate "chicken" rows. Treat the ingredient as its own entity that recipe
lines reference, not as a free-text column.

## Non-meal day slots

A day can hold `Takeaway`, `Leftovers`, or `-` (nothing planned) instead of a meal. These are
legitimate, common, and contribute **zero** ingredients. Don't model a day slot as a required
foreign key to a meal.

## `bought` is transient

The `bought` flag belongs to a shopping-list run, not to the ingredient or the staple — it resets
every shop. A staple's **note** (`"don't get"`, `"only 3"`) is the opposite: it persists across
weeks and is how the list gets tuned over time. Don't conflate them.
