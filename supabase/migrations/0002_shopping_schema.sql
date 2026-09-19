-- Shopping module ------------------------------------------------------------
-- Plan a week of dinners -> roll the recipe lines into one list -> tick it off.
-- Domain notes live in app/presentation/shopping/CLAUDE.md.
--
-- household_id is denormalised onto EVERY table, including the join tables, so
-- all policies are the same one-liner and none of them need a join to evaluate.
-- The redundancy is deliberate.

create type public.shopping_slot_type as enum (
  'meal',
  'takeaway',
  'leftovers',
  'none'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Ingredients ----------------------------------------------------------------
-- A canonical entity, not a free-text column: recipe lines reference it so the
-- week's list can actually aggregate. purchase_unit/purchase_size are unused in
-- v1 (we sum in cooking units) but exist now so ingredients aren't re-seeded
-- when purchase-unit conversion lands.

create table if not exists public.shopping_ingredients (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null
    references public.households (id) on delete cascade
    default public.current_household_id(),
  name text not null check (length(trim(name)) > 0),
  default_unit text,
  purchase_unit text,
  purchase_size numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists shopping_ingredients_name_key
  on public.shopping_ingredients (household_id, lower(name))
  where deleted_at is null;

-- Meals ----------------------------------------------------------------------
-- prep_minutes is a single integer; the source spreadsheet's 10-20 / 20-40 / 40+
-- buckets are mapped to 15 / 30 / 50 at seed time.

create table if not exists public.shopping_meals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null
    references public.households (id) on delete cascade
    default public.current_household_id(),
  name text not null check (length(trim(name)) > 0),
  prep_minutes integer check (prep_minutes is null or prep_minutes > 0),
  cuisine text,
  recipe_url text,
  recipe_note text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists shopping_meals_name_key
  on public.shopping_meals (household_id, lower(name))
  where deleted_at is null;

create trigger shopping_meals_set_updated_at
  before update on public.shopping_meals
  for each row execute function public.set_updated_at();

create trigger shopping_ingredients_set_updated_at
  before update on public.shopping_ingredients
  for each row execute function public.set_updated_at();

-- Recipe lines ---------------------------------------------------------------

create table if not exists public.shopping_meal_ingredients (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null
    references public.households (id) on delete cascade
    default public.current_household_id(),
  meal_id uuid not null
    references public.shopping_meals (id) on delete cascade,
  ingredient_id uuid not null
    references public.shopping_ingredients (id) on delete restrict,
  quantity numeric not null check (quantity > 0),
  unit text,
  created_at timestamptz not null default now(),
  unique (meal_id, ingredient_id)
);

create index if not exists shopping_meal_ingredients_meal_idx
  on public.shopping_meal_ingredients (meal_id);

-- Week plans -----------------------------------------------------------------
-- week_start_date is always a Monday (the designs run M-S).

create table if not exists public.shopping_week_plans (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null
    references public.households (id) on delete cascade
    default public.current_household_id(),
  week_start_date date not null,
  created_at timestamptz not null default now(),
  unique (household_id, week_start_date)
);

-- A day slot can hold a meal, Takeaway, Leftovers, or nothing — so meal_id is
-- nullable and slot_type carries the meaning. The check keeps the two honest.
create table if not exists public.shopping_week_plan_days (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null
    references public.households (id) on delete cascade
    default public.current_household_id(),
  week_plan_id uuid not null
    references public.shopping_week_plans (id) on delete cascade,
  day_index smallint not null check (day_index between 0 and 6),
  slot_type public.shopping_slot_type not null default 'none',
  meal_id uuid references public.shopping_meals (id) on delete set null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (week_plan_id, day_index),
  constraint shopping_week_plan_days_meal_matches_slot check (
    (slot_type = 'meal' and meal_id is not null)
    or (slot_type <> 'meal' and meal_id is null)
  )
);

create index if not exists shopping_week_plan_days_meal_idx
  on public.shopping_week_plan_days (meal_id);

create trigger shopping_week_plan_days_set_updated_at
  before update on public.shopping_week_plan_days
  for each row execute function public.set_updated_at();

-- Per-week ingredient override. An empty set means "use the meal's own recipe
-- lines"; any rows here replace them wholesale for this week only. This is what
-- makes editing a meal from the week page not touch the meal itself.
create table if not exists public.shopping_week_plan_day_ingredients (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null
    references public.households (id) on delete cascade
    default public.current_household_id(),
  week_plan_day_id uuid not null
    references public.shopping_week_plan_days (id) on delete cascade,
  ingredient_id uuid not null
    references public.shopping_ingredients (id) on delete restrict,
  quantity numeric not null check (quantity > 0),
  unit text,
  created_at timestamptz not null default now(),
  unique (week_plan_day_id, ingredient_id)
);

create index if not exists shopping_week_plan_day_ingredients_day_idx
  on public.shopping_week_plan_day_ingredients (week_plan_day_id);

-- Ticked-off items. The list itself is derived live from the week's meals; only
-- the ticks persist, so the list self-heals when a meal changes mid-week.
-- `bought` is per shopping run, which is why this hangs off the week plan.
create table if not exists public.shopping_checked_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null
    references public.households (id) on delete cascade
    default public.current_household_id(),
  week_plan_id uuid not null
    references public.shopping_week_plans (id) on delete cascade,
  ingredient_id uuid not null
    references public.shopping_ingredients (id) on delete cascade,
  checked_at timestamptz not null default now(),
  unique (week_plan_id, ingredient_id)
);

create index if not exists shopping_checked_items_week_idx
  on public.shopping_checked_items (week_plan_id);

-- Week templates -------------------------------------------------------------
-- Named reusable weeks ("SIMPLE AS", "AUTUMN FEAST") applied as a starting point.

create table if not exists public.shopping_week_templates (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null
    references public.households (id) on delete cascade
    default public.current_household_id(),
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Expression uniqueness needs a separate index; it is not valid inline.
create unique index if not exists shopping_week_templates_name_key
  on public.shopping_week_templates (household_id, lower(name));

create table if not exists public.shopping_week_template_days (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null
    references public.households (id) on delete cascade
    default public.current_household_id(),
  template_id uuid not null
    references public.shopping_week_templates (id) on delete cascade,
  day_index smallint not null check (day_index between 0 and 6),
  slot_type public.shopping_slot_type not null default 'none',
  meal_id uuid references public.shopping_meals (id) on delete set null,
  unique (template_id, day_index),
  constraint shopping_week_template_days_meal_matches_slot check (
    (slot_type = 'meal' and meal_id is not null)
    or (slot_type <> 'meal' and meal_id is null)
  )
);

-- RLS ------------------------------------------------------------------------
-- Identical policy on every table, which is the payoff for denormalising
-- household_id. Members get full read/write; non-members see nothing.

do $$
declare
  t text;
begin
  foreach t in array array[
    'shopping_ingredients',
    'shopping_meals',
    'shopping_meal_ingredients',
    'shopping_week_plans',
    'shopping_week_plan_days',
    'shopping_week_plan_day_ingredients',
    'shopping_checked_items',
    'shopping_week_templates',
    'shopping_week_template_days'
  ]
  loop
    execute format(
      'alter table public.%I enable row level security', t
    );
    execute format(
      'create policy %I on public.%I for all to authenticated '
      || 'using (public.is_household_member(household_id)) '
      || 'with check (public.is_household_member(household_id))',
      t || '_member_all', t
    );
    execute format(
      'grant select, insert, update, delete on public.%I to authenticated', t
    );
  end loop;
end;
$$;
