-- Seed -------------------------------------------------------------------------
-- Data lifted from app/presentation/shopping/SpreadsheetSource.md and cleaned:
-- meal/ingredient spellings fixed, ingredient names canonicalised to lowercase
-- so recipe lines actually aggregate, units normalised (grams->g, cans/tin->can,
-- tablespoons->tbsp, cups->cup), and the duplicate "Chicken corn soup" merged to
-- the row carrying a recipe URL.
--
-- Deliberately NOT merged, because they are different products on a shelf:
--   chicken / chicken breast / chicken thigh
--   thin cream / thickened cream
--   shaved ham / shredded ham
--
-- Prep-time buckets map 10-20 -> 15, 20-40 -> 30, 40+ -> 50, blank -> null.
--
-- Idempotent: safe to re-run. The household uuid is fixed so re-runs are stable.

-- The household ---------------------------------------------------------------
insert into public.households (id, name)
values ('00000000-0000-4000-8000-000000000001', 'Isaac & Eloise')
on conflict (id) do nothing;

-- ONE-TIME, BY HAND: after inviting each user from the Supabase dashboard
-- (Authentication -> Users -> Invite), link them to the household. Nothing is
-- visible to a signed-in user until this row exists.
--
--   insert into public.household_members (household_id, user_id, role)
--   select '00000000-0000-4000-8000-000000000001', id, 'owner'
--   from auth.users where email = 'you@example.com'
--   on conflict do nothing;

-- Ingredients -----------------------------------------------------------------
insert into public.shopping_ingredients (household_id, name, default_unit)
select
  '00000000-0000-4000-8000-000000000001',
  v.name,
  nullif(v.unit, '')
from (values
  ('bacon', 'g'),
  ('baby spinach', ''),
  ('bean sprouts', 'g'),
  ('beef brisket', 'g'),
  ('beef mince', 'g'),
  ('beef patties', ''),
  ('breadcrumbs', 'pack'),
  ('broccoli', 'g'),
  ('burger buns', ''),
  ('butter', 'g'),
  ('butter chicken sauce', ''),
  ('carrot', ''),
  ('celery', 'stalk'),
  ('chicken', 'g'),
  ('chicken breast', 'g'),
  ('chicken thigh', ''),
  ('chocolate mousse mix', ''),
  ('chorizo sausage', ''),
  ('coconut milk', 'can'),
  ('corn', 'can'),
  ('corn chips', 'pack'),
  ('creamed corn', 'can'),
  ('cucumber', ''),
  ('enchilada kit', 'pack'),
  ('frozen peas', ''),
  ('frozen puff pastry', 'sheet'),
  ('frozen shortcrust pastry', 'sheet'),
  ('grated cheese', 'pack'),
  ('hokkien noodles', 'g'),
  ('lasagne sheets', ''),
  ('leek', ''),
  ('lettuce', 'head'),
  ('meatballs', 'packet'),
  ('minced lamb', 'g'),
  ('naan bread', 'pack'),
  ('paella rice', 'g'),
  ('pasta', 'packet'),
  ('pasta sauce', 'jar'),
  ('peas', 'g'),
  ('pesto sauce', 'jar'),
  ('pineapple', 'can'),
  ('pizza base', 'pack'),
  ('pizza sauce', 'bottle'),
  ('pork tenderloin', 'g'),
  ('prosciutto', 'g'),
  ('pumpkin', ''),
  ('red capsicum', ''),
  ('red curry paste', 'tbsp'),
  ('refried beans', 'can'),
  ('rice paper sheets', 'pack'),
  ('shaved ham', 'g'),
  ('shredded ham', 'g'),
  ('spaghetti', 'pack'),
  ('spring onion', 'bunch'),
  ('thickened cream', 'cup'),
  ('thin cream', 'ml'),
  ('tikka masala sauce', ''),
  ('tinned tomatoes', 'can'),
  ('tomato', ''),
  ('tortillas', ''),
  ('tuna', 'can'),
  ('wrap', 'pack'),
  ('zucchini', ''),
  ('avocado', '')
) as v(name, unit)
on conflict (household_id, lower(name)) where deleted_at is null do nothing;

-- Meals -----------------------------------------------------------------------
-- The last four have no recipe lines: they appear only in week templates and
-- were never given ingredients in the spreadsheet.
insert into public.shopping_meals
  (household_id, name, prep_minutes, cuisine, recipe_url, recipe_note)
select
  '00000000-0000-4000-8000-000000000001',
  v.name,
  nullif(v.prep, 0),
  nullif(v.cuisine, ''),
  nullif(v.url, ''),
  nullif(v.note, '')
from (values
  ('Burrito bowls', 15, 'Mexican', '', ''),
  ('Spaghetti bolognese', 30, 'Italian', '', ''),
  ('Butter chicken', 30, 'Indian', '', ''),
  ('Chicken tikka masala', 30, 'Indian', '', ''),
  ('Thai red curry', 30, 'Thai', '', ''),
  ('Chicken wraps', 15, 'Global', '', ''),
  ('Roast', 50, 'Western', '', ''),
  ('Lasagne', 50, 'Italian', '', ''),
  ('Pizza', 30, 'Italian', '', ''),
  ('Nachos', 15, 'Mexican', '', ''),
  ('Shepherd''s pie', 30, 'British', '', ''),
  ('Burgers', 30, 'American', '', ''),
  ('Pesto pasta', 30, 'Italian', '', ''),
  ('Chicken carbonara', 30, 'Italian', '', ''),
  ('Fried rice (with spring rolls & dumplings)', 30, 'Asian', '', ''),
  ('Chicken parmigiana', 15, 'Australian/Italian', '', ''),
  ('Pork bao buns', 15, 'Chinese', '', ''),
  ('Tuna mornay (pasta)', 30, 'Global', '', ''),
  ('Spinach and ricotta cannelloni', 30, 'Italian', '', ''),
  ('Stir fry', 15, 'Asian', '', ''),
  ('Pumpkin soup', 30, '', '', ''),
  ('Chicken corn soup', 15, '', 'https://www.taste.com.au/recipes/chicken-sweet-corn-soup/042e515d-321c-48eb-973b-05a820035e74', ''),
  ('Coconut chicken curry', 30, '', '', ''),
  ('Pea and ham soup', 30, '', '', ''),
  ('Enchiladas', 15, '', '', ''),
  ('Chicken pie', 30, '', '', ''),
  ('Pasta & meatballs', 15, '', '', ''),
  ('Salmon', 15, '', '', ''),
  ('Tomato soup', 30, '', '', ''),
  ('Chocolate mousse', 30, '', '', ''),
  ('Chorizo couscous', 30, '', '', 'pg. 77'),
  ('Pea pesto pasta', 0, '', '', ''),
  ('Baked beef burritos', 0, '', '', ''),
  ('Red lentil soup', 15, '', '', 'pg. 108'),
  ('Beef pie', 0, '', 'https://www.taste.com.au/recipes/family-beef-pie/47c924cb-749d-4ea5-8651-ffa7d84ea8bf', ''),
  ('Prosciutto wrapped pork', 0, '', '', 'pg. 190'),
  ('One-pot chicken tomato pasta', 0, '', '', 'pg. 176'),
  ('Slow cooker beef curry', 0, '', '', ''),
  ('Chicken schnitzel', 15, '', '', ''),
  ('Chicken chorizo paella', 0, '', 'https://www.jamieoliver.com/recipes/rice/chicken-chorizo-paella/', ''),
  ('Cold rolls', 0, '', '', ''),
  ('Beetroot pasta', 0, '', '', ''),
  ('Beef ragu', 0, '', '', ''),
  ('Tuna mornay (rice)', 0, '', '', ''),
  ('Mince wraps', 0, '', '', ''),
  ('One-pot cajun chicken & rice', 0, '', '', 'pg. 196')
) as v(name, prep, cuisine, url, note)
on conflict (household_id, lower(name)) where deleted_at is null do nothing;

-- Recipe lines ----------------------------------------------------------------
insert into public.shopping_meal_ingredients
  (household_id, meal_id, ingredient_id, quantity, unit)
select
  '00000000-0000-4000-8000-000000000001',
  m.id,
  i.id,
  v.qty::numeric,
  nullif(v.unit, '')
from (values
  ('Burrito bowls', 'chicken', 500, 'g'),
  ('Burrito bowls', 'cucumber', 1, ''),
  ('Burrito bowls', 'tomato', 2, ''),
  ('Spaghetti bolognese', 'beef mince', 500, 'g'),
  ('Spaghetti bolognese', 'spaghetti', 0.5, 'pack'),
  ('Spaghetti bolognese', 'pasta sauce', 1, 'jar'),
  ('Spaghetti bolognese', 'zucchini', 0.5, ''),
  ('Spaghetti bolognese', 'carrot', 0.5, ''),
  ('Butter chicken', 'butter chicken sauce', 1, ''),
  ('Butter chicken', 'tomato', 2, ''),
  ('Butter chicken', 'chicken breast', 500, 'g'),
  ('Chicken tikka masala', 'tikka masala sauce', 1, ''),
  ('Chicken tikka masala', 'chicken breast', 500, 'g'),
  ('Thai red curry', 'coconut milk', 2, 'cup'),
  ('Thai red curry', 'red curry paste', 2, 'tbsp'),
  ('Thai red curry', 'chicken breast', 300, 'g'),
  ('Thai red curry', 'zucchini', 1, ''),
  ('Chicken wraps', 'chicken breast', 0.5, ''),
  ('Chicken wraps', 'wrap', 1, 'pack'),
  ('Chicken wraps', 'lettuce', 0.5, 'head'),
  ('Chicken wraps', 'tomato', 1, ''),
  ('Chicken wraps', 'cucumber', 0.25, ''),
  ('Chicken wraps', 'avocado', 1, ''),
  ('Chicken wraps', 'grated cheese', 0.25, 'pack'),
  ('Lasagne', 'grated cheese', 0.5, 'pack'),
  ('Lasagne', 'thickened cream', 0.5, 'cup'),
  ('Lasagne', 'butter', 60, 'g'),
  ('Lasagne', 'beef mince', 500, 'g'),
  ('Lasagne', 'tinned tomatoes', 2, 'can'),
  ('Lasagne', 'lasagne sheets', 1, ''),
  ('Pizza', 'grated cheese', 0.5, 'pack'),
  ('Pizza', 'tomato', 2, ''),
  ('Pizza', 'shredded ham', 200, 'g'),
  ('Pizza', 'pineapple', 0.5, 'can'),
  ('Pizza', 'pizza base', 1, 'pack'),
  ('Pizza', 'pizza sauce', 0.25, 'bottle'),
  ('Burgers', 'burger buns', 2, ''),
  ('Burgers', 'beef patties', 2, ''),
  ('Burgers', 'pineapple', 1, ''),
  ('Burgers', 'cucumber', 1, ''),
  ('Burgers', 'lettuce', 1, ''),
  ('Pesto pasta', 'chicken breast', 300, 'g'),
  ('Pesto pasta', 'pesto sauce', 1, 'jar'),
  ('Tuna mornay (pasta)', 'tuna', 0.5, 'can'),
  ('Stir fry', 'carrot', 1, ''),
  ('Stir fry', 'peas', 50, 'g'),
  ('Stir fry', 'bean sprouts', 50, 'g'),
  ('Stir fry', 'hokkien noodles', 300, 'g'),
  ('Stir fry', 'broccoli', 15, 'g'),
  ('Stir fry', 'spring onion', 0.25, 'bunch'),
  ('Pumpkin soup', 'leek', 1, ''),
  ('Pumpkin soup', 'thin cream', 125, 'ml'),
  ('Pumpkin soup', 'pumpkin', 1, ''),
  ('Enchiladas', 'chicken', 500, 'g'),
  ('Enchiladas', 'zucchini', 1, ''),
  ('Enchiladas', 'grated cheese', 1, ''),
  ('Enchiladas', 'enchilada kit', 1, 'pack'),
  ('Pasta & meatballs', 'meatballs', 1, 'packet'),
  ('Pasta & meatballs', 'pasta sauce', 1, 'jar'),
  ('Pasta & meatballs', 'pasta', 1, 'packet'),
  ('Chocolate mousse', 'chocolate mousse mix', 1, ''),
  ('Chorizo couscous', 'chorizo sausage', 1, ''),
  ('Pea pesto pasta', 'chicken thigh', 1, ''),
  ('Pea pesto pasta', 'baby spinach', 1, ''),
  ('Pea pesto pasta', 'frozen peas', 1, ''),
  ('Baked beef burritos', 'beef mince', 500, 'g'),
  ('Baked beef burritos', 'red capsicum', 1, ''),
  ('Baked beef burritos', 'tortillas', 1, ''),
  ('Red lentil soup', 'coconut milk', 400, 'ml'),
  ('Red lentil soup', 'tinned tomatoes', 400, 'g'),
  ('Beef pie', 'beef mince', 500, 'g'),
  ('Beef pie', 'frozen shortcrust pastry', 1, 'sheet'),
  ('Beef pie', 'frozen puff pastry', 1, 'sheet'),
  ('Chicken corn soup', 'shaved ham', 100, 'g'),
  ('Chicken corn soup', 'corn', 1, 'can'),
  ('Chicken corn soup', 'chicken breast', 300, 'g'),
  ('Chicken corn soup', 'creamed corn', 1, 'can'),
  ('Prosciutto wrapped pork', 'pork tenderloin', 600, 'g'),
  ('Prosciutto wrapped pork', 'prosciutto', 100, 'g'),
  ('One-pot chicken tomato pasta', 'chicken', 500, 'g'),
  ('One-pot chicken tomato pasta', 'tinned tomatoes', 1, 'can'),
  ('Slow cooker beef curry', 'beef brisket', 500, 'g'),
  ('Slow cooker beef curry', 'tinned tomatoes', 400, 'g'),
  ('Slow cooker beef curry', 'coconut milk', 1, 'can'),
  ('Slow cooker beef curry', 'naan bread', 1, 'pack'),
  ('Chicken schnitzel', 'breadcrumbs', 1, 'pack'),
  ('Chicken schnitzel', 'chicken breast', 500, 'g'),
  ('Pea and ham soup', 'peas', 250, 'g'),
  ('Pea and ham soup', 'shaved ham', 500, 'g'),
  ('Pea and ham soup', 'celery', 1, 'stalk'),
  ('Pea and ham soup', 'carrot', 1, ''),
  ('Shepherd''s pie', 'minced lamb', 750, 'g'),
  ('Chicken chorizo paella', 'chorizo sausage', 70, 'g'),
  ('Chicken chorizo paella', 'chicken', 300, 'g'),
  ('Chicken chorizo paella', 'paella rice', 300, 'g'),
  ('Chicken carbonara', 'bacon', 175, 'g'),
  ('Chicken carbonara', 'thin cream', 0.5, 'cup'),
  ('Chicken carbonara', 'chicken', 500, 'g'),
  ('Cold rolls', 'rice paper sheets', 1, 'pack'),
  ('Cold rolls', 'tuna', 1, 'can'),
  ('Nachos', 'refried beans', 1, 'can'),
  ('Nachos', 'corn chips', 1, 'pack'),
  ('Nachos', 'grated cheese', 0.5, 'cup')
) as v(meal, ingredient, qty, unit)
join public.shopping_meals m
  on m.household_id = '00000000-0000-4000-8000-000000000001'
 and m.name = v.meal
join public.shopping_ingredients i
  on i.household_id = '00000000-0000-4000-8000-000000000001'
 and i.name = v.ingredient
on conflict (meal_id, ingredient_id) do nothing;

-- Week templates --------------------------------------------------------------
insert into public.shopping_week_templates (household_id, name, sort_order)
select '00000000-0000-4000-8000-000000000001', v.name, v.ord
from (values
  ('SIMPLE AS', 0),
  ('SUMMER SPECIAL', 1),
  ('AUTUMN FEAST', 2),
  ('AUSSIE / ASIAN', 3),
  ('Week H', 4),
  ('Week J', 5),
  ('MEXICAN', 6),
  ('Week K', 7)
) as v(name, ord)
on conflict (household_id, lower(name)) do nothing;

-- day_index is 0 = Monday. Takeaway/Leftovers/none carry no meal_id.
insert into public.shopping_week_template_days
  (household_id, template_id, day_index, slot_type, meal_id)
select
  '00000000-0000-4000-8000-000000000001',
  t.id,
  v.day_index,
  v.slot::public.shopping_slot_type,
  case when v.slot = 'meal' then m.id else null end
from (values
  ('SIMPLE AS', 0, 'meal', 'Chicken wraps'),
  ('SIMPLE AS', 1, 'meal', 'Lasagne'),
  ('SIMPLE AS', 2, 'meal', 'Chicken tikka masala'),
  ('SIMPLE AS', 3, 'meal', 'Tuna mornay (pasta)'),
  ('SIMPLE AS', 4, 'takeaway', ''),
  ('SIMPLE AS', 5, 'meal', 'Pizza'),
  ('SIMPLE AS', 6, 'leftovers', ''),
  ('SUMMER SPECIAL', 0, 'meal', 'Spaghetti bolognese'),
  ('SUMMER SPECIAL', 1, 'meal', 'Thai red curry'),
  ('SUMMER SPECIAL', 2, 'meal', 'Burrito bowls'),
  ('SUMMER SPECIAL', 3, 'meal', 'Pesto pasta'),
  ('SUMMER SPECIAL', 4, 'takeaway', ''),
  ('SUMMER SPECIAL', 5, 'meal', 'Burgers'),
  ('SUMMER SPECIAL', 6, 'leftovers', ''),
  ('AUTUMN FEAST', 0, 'meal', 'Chicken corn soup'),
  ('AUTUMN FEAST', 1, 'meal', 'Baked beef burritos'),
  ('AUTUMN FEAST', 2, 'meal', 'Chicken pie'),
  ('AUTUMN FEAST', 3, 'meal', 'Stir fry'),
  ('AUTUMN FEAST', 4, 'meal', 'Pizza'),
  ('AUTUMN FEAST', 5, 'meal', 'Roast'),
  ('AUTUMN FEAST', 6, 'leftovers', ''),
  ('AUSSIE / ASIAN', 0, 'meal', 'Burgers'),
  ('AUSSIE / ASIAN', 1, 'meal', 'Pumpkin soup'),
  ('AUSSIE / ASIAN', 2, 'meal', 'Thai red curry'),
  ('AUSSIE / ASIAN', 3, 'meal', 'Mince wraps'),
  ('AUSSIE / ASIAN', 4, 'meal', 'Nachos'),
  ('AUSSIE / ASIAN', 5, 'meal', 'Stir fry'),
  ('AUSSIE / ASIAN', 6, 'leftovers', ''),
  ('Week H', 0, 'meal', 'Beef pie'),
  ('Week H', 1, 'meal', 'Pizza'),
  ('Week H', 2, 'meal', 'Burrito bowls'),
  ('Week H', 3, 'meal', 'One-pot chicken tomato pasta'),
  ('Week H', 4, 'takeaway', ''),
  ('Week H', 5, 'meal', 'Burgers'),
  ('Week H', 6, 'meal', 'Burgers'),
  ('Week J', 0, 'meal', 'Beef ragu'),
  ('Week J', 1, 'meal', 'Butter chicken'),
  ('Week J', 2, 'meal', 'Pumpkin soup'),
  ('Week J', 3, 'meal', 'Pea pesto pasta'),
  ('Week J', 4, 'meal', 'Tuna mornay (rice)'),
  ('Week J', 5, 'none', ''),
  ('Week J', 6, 'leftovers', ''),
  ('MEXICAN', 0, 'meal', 'One-pot cajun chicken & rice'),
  ('MEXICAN', 1, 'meal', 'Burgers'),
  ('MEXICAN', 2, 'meal', 'Tuna mornay (pasta)'),
  ('MEXICAN', 3, 'meal', 'Enchiladas'),
  ('MEXICAN', 4, 'takeaway', ''),
  ('MEXICAN', 5, 'meal', 'Nachos'),
  ('MEXICAN', 6, 'leftovers', ''),
  ('Week K', 0, 'meal', 'Chicken corn soup'),
  ('Week K', 1, 'meal', 'Burrito bowls'),
  ('Week K', 2, 'meal', 'Pasta & meatballs'),
  ('Week K', 3, 'meal', 'Red lentil soup'),
  ('Week K', 4, 'meal', 'Pizza'),
  ('Week K', 5, 'meal', 'Beef pie'),
  ('Week K', 6, 'leftovers', '')
) as v(template, day_index, slot, meal)
join public.shopping_week_templates t
  on t.household_id = '00000000-0000-4000-8000-000000000001'
 and t.name = v.template
left join public.shopping_meals m
  on m.household_id = '00000000-0000-4000-8000-000000000001'
 and m.name = v.meal
on conflict (template_id, day_index) do nothing;
