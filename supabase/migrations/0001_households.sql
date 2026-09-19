-- Households -----------------------------------------------------------------
-- IE Life is private and invite-only. Every domain row belongs to a household,
-- and RLS grants access purely on membership — so a second family could use the
-- app without any change to a module's schema.
--
-- There are deliberately NO insert/update/delete policies on these two tables.
-- Membership is administered by hand (dashboard or service role), which is what
-- "invite only, I'll add users manually" means in practice.

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.household_members (
  household_id uuid not null
    references public.households (id) on delete cascade,
  user_id uuid not null
    references auth.users (id) on delete cascade,
  role text not null default 'member'
    check (role in ('member', 'owner')),
  created_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create index if not exists household_members_user_id_idx
  on public.household_members (user_id);

-- SECURITY DEFINER so a policy can read household_members without recursing
-- into that table's own policy. search_path is pinned per Supabase guidance.
create or replace function public.is_household_member(hh uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.household_members m
    where m.household_id = hh
      and m.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_household_member(uuid) from public;
grant execute on function public.is_household_member(uuid) to authenticated;

-- The caller's household. Client code never needs to know the uuid — inserts
-- default to this, and reads are filtered by RLS anyway.
create or replace function public.current_household_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select m.household_id
  from public.household_members m
  where m.user_id = (select auth.uid())
  order by m.created_at
  limit 1;
$$;

revoke all on function public.current_household_id() from public;
grant execute on function public.current_household_id() to authenticated;

alter table public.households enable row level security;
alter table public.household_members enable row level security;

create policy "households_select_member"
  on public.households for select
  to authenticated
  using (public.is_household_member(id));

create policy "household_members_select_member"
  on public.household_members for select
  to authenticated
  using (public.is_household_member(household_id));

grant select on public.households to authenticated;
grant select on public.household_members to authenticated;
