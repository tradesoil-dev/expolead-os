-- V1.3 — Trial usage caps
-- Enforces the limits the pricing page has been advertising:
--   Trial: 1 exhibition, 25 connections, 25 opportunities
-- Paid (subscription_status = 'active'), early_access accounts and admins are
-- unlimited. Counts are enforced at the database level so they cannot be
-- bypassed by calling the API directly.
--
-- Run in Supabase SQL Editor. Idempotent — safe to re-run.

-- ─── 0. Make sure new accounts start empty ─────────────────────────────────
-- 0007 installed a second seeder (seed_sample_data) that creates 2 sample
-- exhibitions + 3 sample suppliers on signup. 0014 removed a DIFFERENT seeder
-- and left this one in place. If it is still live, a brand new trial user would
-- already be over the 1-exhibition cap and could never add their own show.
-- Dropping it here. Harmless if it was already gone.

drop trigger if exists on_profile_created_seed on public.profiles;
drop function if exists public.seed_sample_data();

-- ─── 1. Who is exempt from the caps ────────────────────────────────────────
-- Mirrors the admin bypass already added to user_can_create() in 0015, so the
-- ExpoLead team never hits a wall while supporting users.

create or replace function public.has_unlimited_plan()
returns boolean language sql security definer stable as $$
  select public.is_admin() or exists (
    select 1 from public.profiles
    where id = auth.uid()
      and (
        subscription_status = 'active'
        or early_access = true
      )
  );
$$;

-- ─── 2. Per-table cap checks ───────────────────────────────────────────────
-- security definer so the count sees all of the user's own rows regardless of
-- the SELECT policy.

create or replace function public.within_exhibition_cap()
returns boolean language sql security definer stable as $$
  select public.has_unlimited_plan()
      or (select count(*) from public.exhibitions where user_id = auth.uid()) < 1;
$$;

create or replace function public.within_connection_cap()
returns boolean language sql security definer stable as $$
  select public.has_unlimited_plan()
      or (select count(*) from public.suppliers where user_id = auth.uid()) < 25;
$$;

create or replace function public.within_opportunity_cap()
returns boolean language sql security definer stable as $$
  select public.has_unlimited_plan()
      or (select count(*) from public.opportunities where user_id = auth.uid()) < 25;
$$;

-- ─── 3. Apply caps to INSERT policies ──────────────────────────────────────
-- user_can_create() keeps the existing 14-day trial gate. The cap check is
-- additive: a trial user must be inside BOTH the 14 days and the row limit.

drop policy if exists "exhibitions insert" on exhibitions;
create policy "exhibitions insert" on exhibitions for insert
  with check (
    auth.uid() = user_id
    and public.user_can_create()
    and public.within_exhibition_cap()
  );

drop policy if exists "suppliers insert" on suppliers;
create policy "suppliers insert" on suppliers for insert
  with check (
    auth.uid() = user_id
    and public.user_can_create()
    and public.within_connection_cap()
  );

drop policy if exists "opportunities insert" on opportunities;
create policy "opportunities insert" on opportunities for insert
  with check (
    auth.uid() = user_id
    and public.user_can_create()
    and public.within_opportunity_cap()
  );

-- ─── 4. Verify after running ───────────────────────────────────────────────
-- Confirm the three INSERT policies now carry their cap function:
--
--   select tablename, policyname, with_check
--   from pg_policies
--   where schemaname = 'public'
--     and policyname in ('exhibitions insert','suppliers insert','opportunities insert');
--
-- Confirm the sample-data seeder is gone (expect 0 rows):
--
--   select tgname from pg_trigger where tgname = 'on_profile_created_seed';
--
-- To lift all caps for a pilot account:
--
--   update profiles set early_access = true where id = '<user-uuid>';
