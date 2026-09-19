-- Supabase grants EXECUTE on new public functions to anon by default. Neither
-- helper has any meaning for a signed-out caller, so take it back.
--
-- `authenticated` must keep EXECUTE: RLS policies and the household_id column
-- default are both evaluated as the calling user, not as the function owner.
-- Both functions only ever reveal the caller's own membership, so that is safe.
revoke execute on function public.is_household_member(uuid) from anon;
revoke execute on function public.current_household_id() from anon;
