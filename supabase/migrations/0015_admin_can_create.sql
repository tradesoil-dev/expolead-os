-- Let admins create records regardless of trial status.
-- The trial gate in user_can_create() (0008) blocks all inserts once
-- trial_ends_at passes, which also locks out the ExpoLead team (admins)
-- from adding/editing exhibitions, connections, and opportunities while
-- testing or supporting users. Admins should never hit the trial wall.
-- Additive and safe to re-run.

create or replace function public.user_can_create()
returns boolean language sql security definer stable as $$
  select public.is_admin() or exists (
    select 1 from public.profiles
    where id = auth.uid()
    and (
      subscription_status = 'active'
      or trial_ends_at > now()
    )
  );
$$;
