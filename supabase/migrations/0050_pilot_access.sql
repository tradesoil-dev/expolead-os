-- Pilot access + per-account ELOS.
--
-- Two new profile fields that an admin sets (via the service role in
-- /api/admin/invite), never the user:
--   early_access_until  timestamptz  full, unlimited access that AUTO-EXPIRES on
--                                    this date. Unlike early_access (permanent),
--                                    a pilot locks itself when this passes, which
--                                    is the natural "your pilot has ended" nudge.
--   elos_enabled        boolean      turn ELOS on for just this account, so we
--                                    can show it to pilots without un-gating it
--                                    for everyone.
--
-- The profiles column lockdown (0040) only grants authenticated UPDATE on a
-- fixed set of safe columns; these two are deliberately NOT in that set, so a
-- user cannot grant themselves access or ELOS from the browser. Only the service
-- role (admin invite endpoint) writes them. SELECT is unchanged, so the app can
-- read a user's own flags for gating.

alter table public.profiles
  add column if not exists early_access_until timestamptz,
  add column if not exists elos_enabled boolean not null default false;

comment on column public.profiles.early_access_until is
  'Full, unlimited access until this moment, then the account auto-locks. Admin/service set only (pilots).';
comment on column public.profiles.elos_enabled is
  'Per-account ELOS access. Admin/service set only. ELOS is also always on for admins.';

-- has_unlimited_plan(): lifts the trial row caps + unlocks export. Add a live
-- early_access_until window so pilots are unlimited while their pilot runs.
create or replace function public.has_unlimited_plan()
returns boolean language sql security definer stable as $$
  select public.is_admin() or exists (
    select 1 from public.profiles
    where id = auth.uid()
      and (
        subscription_status = 'active'
        or early_access = true
        or (early_access_until is not null and early_access_until > now())
      )
  );
$$;

-- user_can_create(): the trial gate on INSERTs. Add the same live window so a
-- pilot can keep adding records after the normal 14-day trial has lapsed.
create or replace function public.user_can_create()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and (
      subscription_status = 'active'
      or trial_ends_at > now()
      or early_access = true
      or (early_access_until is not null and early_access_until > now())
    )
  );
$$;

-- Verify after running:
--   select column_name from information_schema.columns
--   where table_name='profiles' and column_name in ('early_access_until','elos_enabled');
