-- Meal statistics -------------------------------------------------------------
-- shopping_week_plan_days is the fact table: every planned dinner is already a
-- dated row, so "what do we cook most" and "what haven't we had for ages" fall
-- out of history with no extra event logging.
--
-- security_invoker means the view runs under the caller's RLS, not the owner's.
-- Without it a view in public would happily leak another household's rows.

create or replace view public.shopping_meal_stats
with (security_invoker = true)
as
select
  m.household_id,
  m.id as meal_id,
  m.name,
  m.cuisine,
  m.prep_minutes,
  count(d.id) as times_planned,
  max(p.week_start_date) as last_planned_on,
  case
    when max(p.week_start_date) is null then null
    else current_date - max(p.week_start_date)
  end as days_since_last
from public.shopping_meals m
left join public.shopping_week_plan_days d
  on d.meal_id = m.id
left join public.shopping_week_plans p
  on p.id = d.week_plan_id
where m.deleted_at is null
group by m.household_id, m.id, m.name, m.cuisine, m.prep_minutes;

grant select on public.shopping_meal_stats to authenticated;
