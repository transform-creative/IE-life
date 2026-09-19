# Spreadsheet source data

Extracted 2026-09-19 from the meal-planning
[Google Sheet](https://docs.google.com/spreadsheets/d/1YhQNqPtkCjadfluEdskly3BYJAlX1cmbVMZrgTLlAhM/edit).

Reference only — this is the seed data and the shape of the problem, **not** a schema. Typos and
inconsistencies below are reproduced verbatim from the source; see `CLAUDE.md` in this folder for
why that matters.

---

## Meals

Prep-time buckets are `10-20`, `20-40`, `40+`. Blank = not recorded in the source.

| Meal                                       | Time  | Cuisine            | Source                                              |
| ------------------------------------------ | ----- | ------------------ | --------------------------------------------------- |
| Burrito bowls                              | 10-20 | Mexican            |                                                     |
| Spaghetti bolognese                        | 20-40 | Italian            |                                                     |
| Butter chicken                             | 20-40 | Indian             |                                                     |
| Chicken tika masala                        | 20-40 | Indian             |                                                     |
| Thai red curry                             | 20-40 | Thai               |                                                     |
| Chicken wraps                              | 10-20 | Global             |                                                     |
| Roast                                      | 40+   | Western            |                                                     |
| Lasagne                                    | 40+   | Italian            |                                                     |
| Pizza                                      | 20-40 | Italian            |                                                     |
| Nachos                                     | 10-20 | Mexican            |                                                     |
| Shepherds pie                              | 20-40 | British            |                                                     |
| Burgers                                    | 20-40 | American           |                                                     |
| Pesto pasta                                | 20-40 | Italian            |                                                     |
| Chicken carbonara                          | 20-40 | Italian            |                                                     |
| Fried rice (with spring rolls & dumplings) | 20-40 | Asian              |                                                     |
| Chicken parmagana                          | 10-20 | Australian/Italian |                                                     |
| Pork bau buns                              | 10-20 | Chinese            |                                                     |
| Tuna mornay (pasta)                        | 20-40 | Global             |                                                     |
| Spinich and ricotta canaloni               | 20-40 | Italian            |                                                     |
| Stir fry                                   | 10-20 | Asian              |                                                     |
| Pumpkin soup                               | 20-40 |                    |                                                     |
| Chicken corn soup                          | 10-20 |                    | taste.com.au/recipes/chicken-sweet-corn-soup        |
| Coconut chicken curry                      | 20-40 |                    |                                                     |
| Pea and ham soup                           | 20-40 |                    |                                                     |
| Enciladas                                  | 10-20 |                    |                                                     |
| Chicken pie                                | 20-40 |                    |                                                     |
| Pasta & meatballs                          | 10-20 |                    |                                                     |
| Salmon                                     | 10-20 |                    |                                                     |
| Tomato soup                                | 20-40 |                    |                                                     |
| Choclate moose                             | 20-40 |                    |                                                     |
| Chorizo couscous                           | 20-40 |                    | pg. 77                                              |
| Pea Pesto Pasta                            |       |                    |                                                     |
| baked beef buritos                         |       |                    |                                                     |
| Red lentil soup                            | 10-20 |                    | pg. 108                                             |
| Beef pie                                   |       |                    | taste.com.au/recipes/family-beef-pie                |
| Prosciutto wrapped pork                    |       |                    | pg. 190                                             |
| One-pot chicken tomato pasta               |       |                    | pg. 176                                             |
| Slow cooker beef curry                     |       |                    |                                                     |
| Chicken schnitzel                          | 10-20 |                    |                                                     |
| Chicken Choriza Paella                     |       |                    | jamieoliver.com/recipes/rice/chicken-chorizo-paella |
| Cold rolls                                 |       |                    |                                                     |
| Beetroot pasta                             |       |                    |                                                     |

> `Chicken corn soup` appears twice in the source with conflicting times (`20-40` and `10-20`).
> Merged above to the row that carries a recipe URL.

---

## Recipe lines

`(meal, qty, unit, ingredient)`. Blank unit = a countable whole item.

| Meal                         | Qty  | Unit        | Ingredient               |
| ---------------------------- | ---- | ----------- | ------------------------ |
| Burrito bowls                | 500  | g           | chicken                  |
| Burrito bowls                | 1    |             | cucumber                 |
| Burrito bowls                | 2    |             | tomato                   |
| Spaghetti bolognese          | 500  | g           | Beef mince               |
| Spaghetti bolognese          | 0.5  | pack        | spaghetti                |
| Spaghetti bolognese          | 1    | jar         | pasta sauce              |
| Spaghetti bolognese          | 0.5  |             | zuccini                  |
| Spaghetti bolognese          | 0.5  |             | carrot                   |
| Butter chicken               | 1    |             | Butter chicken sauce     |
| Butter chicken               | 2    |             | tomato                   |
| Butter chicken               | 500  | g           | chicken breast           |
| Chicken tika masala          | 1    |             | Tika masala sauce        |
| Chicken tika masala          | 500  | g           | chicken breast           |
| Thai red curry               | 2    | cups        | coconut milk             |
| Thai red curry               | 2    | tablespoons | red curry paste          |
| Thai red curry               | 300  | grams       | chicken breast           |
| Thai red curry               | 1    |             | zuccini                  |
| Chicken wraps                | 0.5  |             | chicken breast           |
| Chicken wraps                | 1    | pack        | wrap                     |
| Chicken wraps                | 0.5  | head        | lettuce                  |
| Chicken wraps                | 1    |             | tomato                   |
| Chicken wraps                | 0.25 |             | cucumber                 |
| Chicken wraps                | 1    |             | avocado                  |
| Chicken wraps                | 0.25 | pack        | grated cheese            |
| Lasagne                      | 0.5  | pack        | grated cheese            |
| Lasagne                      | 0.5  | cup         | thickened cream          |
| Lasagne                      | 60   | g           | butter                   |
| Lasagne                      | 500  | g           | Beef mince               |
| Lasagne                      | 2    | cans        | tinned tomatos           |
| Lasagne                      | 1    |             | lasagne sheets           |
| Pizza                        | 0.5  | pack        | grated cheese            |
| Pizza                        | 2    |             | tomato                   |
| Pizza                        | 200  | g           | shredded ham             |
| Pizza                        | 0.5  | can         | pineapple                |
| Pizza                        | 1    | pack        | pizza base               |
| Pizza                        | 0.25 | bottle      | pizza sauce              |
| Burgers                      | 2    |             | burger buns              |
| Burgers                      | 2    |             | beef patties             |
| Burgers                      | 1    |             | pineapple                |
| Burgers                      | 1    |             | cucumber                 |
| Burgers                      | 1    |             | lettuce                  |
| Pesto pasta                  | 300  | g           | Chicken breast           |
| Pesto pasta                  | 1    | jar         | pesto sauce              |
| Tuna mornay (pasta)          | 0.5  | can         | tuna                     |
| Stir fry                     | 1    |             | carrot                   |
| Stir fry                     | 50   | g           | peas                     |
| Stir fry                     | 50   | g           | bean sprouts             |
| Stir fry                     | 300  | g           | hokkien noodles          |
| Stir fry                     | 15   | g           | broccoli                 |
| Stir fry                     | 0.25 | bunch       | spring onion             |
| Pumpkin soup                 | 1    |             | leek                     |
| Pumpkin soup                 | 125  | ml          | thin cream               |
| Pumpkin soup                 | 1    |             | pumpkin                  |
| Enciladas                    | 500  | g           | chicken                  |
| Enciladas                    | 1    |             | zuccini                  |
| Enciladas                    | 1    |             | grated cheese            |
| Enciladas                    | 1    | pack        | encilada pack            |
| Pasta & meatballs            | 1    | packet      | meatballs                |
| Pasta & meatballs            | 1    | jar         | pasta sauce              |
| Pasta & meatballs            | 1    | packet      | pasta                    |
| Choclate moose               | 1    |             | Chocolate mouse mix      |
| Chorizo couscous             | 1    |             | chorizo suassage         |
| Pea Pesto Pasta              | 1    |             | Chicken thigh            |
| Pea Pesto Pasta              | 1    |             | Baby spinach             |
| Pea Pesto Pasta              | 1    |             | Frozen peas              |
| baked beef buritos           | 500  | g           | mince                    |
| baked beef buritos           | 1    |             | red capsicum             |
| baked beef buritos           | 1    |             | tortillas                |
| Red lentil soup              | 400  | ml          | coconut milk             |
| Red lentil soup              | 400  | g           | canned tomatos           |
| Beef pie                     | 500  | g           | Beef mince               |
| Beef pie                     | 1    | sheet       | frozen shortcrust pastry |
| Beef pie                     | 1    | sheet       | frozen puff pastry       |
| Chicken corn soup            | 100  | g           | shaved ham               |
| Chicken corn soup            | 1    | can         | corn                     |
| Chicken corn soup            | 300  | g           | chicken breast           |
| Chicken corn soup            | 1    | tin         | creamed corn             |
| Prosciutto wrapped pork      | 600  | g           | Pork Tendorloin          |
| Prosciutto wrapped pork      | 100  | g           | prosciutto               |
| One-pot chicken tomato pasta | 500  | g           | chicken                  |
| One-pot chicken tomato pasta | 1    | can         | crushed tomatoes         |
| Slow cooker beef curry       | 500  | g           | beef brisket             |
| Slow cooker beef curry       | 400  | g           | canned tomatoes          |
| Slow cooker beef curry       | 1    | can         | coconut milk             |
| Slow cooker beef curry       | 1    | pack        | Naan bread               |
| Chicken schnitzel            | 1    | pack        | Breadcrumbs              |
| Chicken schnitzel            | 500  | g           | Chicken breast           |
| Pea and ham soup             | 250  | g           | peas                     |
| Pea and ham soup             | 500  | g           | shaved ham               |
| Pea and ham soup             | 1    | stalk       | celery                   |
| Pea and ham soup             | 1    |             | carrot                   |
| Shepherds pie                | 750  | g           | minced lamb              |
| Chicken Choriza Paella       | 70   | g           | chorizo suassage         |
| Chicken Choriza Paella       | 300  | g           | chicken                  |
| Chicken Choriza Paella       | 300  | g           | paella rice              |
| Chicken carbonara            | 175  | g           | Bacon                    |
| Chicken carbonara            | 0.5  | cup         | thin cream               |
| Chicken carbonara            | 500  | g           | chicken                  |
| Cold rolls                   | 1    | pack        | rice paper sheets        |
| Cold rolls                   | 1    | tin         | tuna                     |
| Nachos                       | 1    | tin         | Refried beans            |
| Nachos                       | 1    | pack        | Corn chips               |
| Nachos                       | 0.5  | cups        | Grated cheese            |

Meals with no recipe lines recorded: Roast, Fried rice, Chicken parmagana, Pork bau buns,
Spinich and ricotta canaloni, Coconut chicken curry, Chicken pie, Salmon, Tomato soup,
Beetroot pasta.

---

## Week templates

| Template       | Mon                          | Tue                        | Wed                   | Thu                   | Fri                | Sat      | Sun       |
| -------------- | ---------------------------- | -------------------------- | --------------------- | --------------------- | ------------------ | -------- | --------- |
| SIMPLE AS      | Chicken wraps                | Lasagne                    | Chicken Tika masala   | Tuna mornay (pasta)   | Takeaway           | Pizza    | Leftovers |
| SUMMER SPECIAL | Spaghetti bolognese          | Red curry                  | Buritto bowls         | Pesto pasta           | Takeaway           | Burgers  | Leftovers |
| AUTUMN FEAST   | Chicken corn soup            | Baked Beef burritos        | Chicken pie           | Stir fry              | Pizza              | Roast    | Leftovers |
| AUSSIE / ASIAN | Burgers                      | Pumpkin soup               | Thai curry            | Mince wraps           | Nachos             | Stir fry | Leftovers |
| Week H         | Beef pie + salad             | Pizza                      | Burrito bowls         | One pot chicken pasta | Takeaway           | Burgers  | Burgers   |
| Week J         | Beef Ragu                    | Butter chicken             | Pumpkin soup          | Pea pesto pasta       | Tuna mornay (rice) | –        | Leftovers |
| MEXICAN        | One pot kajun chicken + rice | Burgers                    | Tuna mornay           | Enchiladas            | Takeaway           | Nachos   | Leftovers |
| Week K         | Chicken corn soup            | Burrito bowls + corn chips | Spaghetti & meatballs | Red lentil soup       | Pizza              | Beef pie | Leftovers |

Note the non-meal slots (`Takeaway`, `Leftovers`, `–`) and that some entries are variants not in
the meals list (`Beef Ragu`, `Tuna mornay (rice)`, `Mince wraps`, `Beef pie + salad`).

---

## Staples

Bought independently of the meal plan. The note is a persistent preference, not a one-off.

| Item                       | Note      |
| -------------------------- | --------- |
| 2x Apples                  | don't get |
| 4x Kiwis                   | only 3    |
| 3x Carrots                 | don't get |
| 1x Cucumbers               | don't get |
| 1x Capsicum                |           |
| 1x Lettuce                 | don't get |
| 1x Grape bag               |           |
| 1x Avo bag                 |           |
| 1x Strawberries (optional) | don't get |
| 1x Raspberries (optional)  | don't get |
| 1x Zuccini                 | don't get |

---

## Worked example — a generated list

The sheet's own output format is `qty | Item | bought`, with quantities already converted to
Woolworths purchase units. This is the target shape:

| Qty    | Item                       | Bought |
| ------ | -------------------------- | ------ |
| 1 kg   | Beef mince                 | false  |
| 1 pack | Gravy powder               | false  |
| 1 pack | Shortcrust pastry (frozen) | false  |
| 1 pack | Puff pastry (frozen)       | false  |
| 1 bag  | Frozen greens mix          | false  |
| 1 bag  | Plain flour                | false  |
| 1 L    | Milk                       | false  |
| 1 pack | Grated cheese              | false  |
| 1 can  | Tuna                       | false  |
| 1 can  | Coconut milk               | false  |
| 1 can  | Canned tomatoes            | false  |
| 1 pack | Dried red lentils          | false  |
| 1 pack | Spaghetti                  | false  |
| 1 jar  | Pasta sauce                | false  |
| 1      | Zucchini                   | false  |
| 1      | Carrot                     | false  |
| 1 pack | Burger buns                | false  |
| 1 pack | Beef patties               | false  |
| 1 can  | Sliced pineapple           | false  |
| 1      | Cucumber                   | false  |
| 1      | Lettuce                    | false  |
| 1 jar  | Pickles                    | false  |

Note what the human did that naive summing would not: `500 g` + `500 g` beef mince became
`1 kg` (unit promotion), and items never present in any recipe line (gravy powder, flour, milk,
pickles) were added from knowledge of the recipe. The app should get the arithmetic right and make
the manual additions easy, not pretend the recipe lines are complete.
