-- Explicit Data API grants for every existing table.
--
-- From 30 Oct 2026 Supabase no longer auto-grants API access to new tables in
-- "public". Our live tables keep their grants, but our older migrations never
-- wrote grants down (they relied on the old auto-grant). If the database were
-- ever rebuilt from these migrations (new project, disaster recovery, a
-- preview branch, `supabase db reset`), those tables would come up with no API
-- access and the app would fail with "permission denied".
--
-- This file records the access the LIVE database has today (read from
-- information_schema on 2026-10-22), so a rebuild reproduces it. GRANT only
-- adds privileges, and every privilege below already exists on live, so
-- running it on the live database changes nothing.
--
-- Deliberate restrictions are preserved, not widened:
--   * profiles: no table-wide UPDATE; signed-in users may update only the safe
--     columns (security fix 0040). Admin/plan/billing columns stay locked.
--   * plan_pricing: public read-only; edits only via admin_update_pricing().
--   * ai_rate_limits, ai_trial_usage: server only (SECURITY DEFINER functions).
--   * security_events: users may read their own events only.
-- Row Level Security still decides which rows each user can see.
--
-- RULE FOR NEW TABLES (from 0054 on): put the grants in the same migration
-- that creates the table, for authenticated and service_role only. Grant anon
-- only when a signed-out page genuinely needs to read it.

-- Standard user-data tables (RLS restricts rows to the owner).
grant select, insert, update, delete on
  public.suppliers,
  public.contacts,
  public.products,
  public.meetings,
  public.documents,
  public.exhibitions,
  public.opportunities,
  public.opportunity_followups,
  public.opportunity_products,
  public.opportunity_status_history,
  public.upgrade_requests,
  public.ai_conversations,
  public.ai_messages,
  public.exhibition_library
to anon, authenticated, service_role;

-- Public read-only pricing.
grant select on public.plan_pricing to anon, authenticated;
grant select, insert, update, delete on public.plan_pricing to service_role;

-- Profiles: matches live exactly. No table-wide UPDATE for clients.
grant select, insert, delete on public.profiles to anon, authenticated;
grant update (
  full_name, company_name, role, country, linkedin_url, about,
  avatar_url, avatar_position_y, quantity_unit, currency,
  signup_country, welcome_sent
) on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;

-- Server-only tables.
grant select, insert, update, delete on public.ai_rate_limits to service_role;
grant select, insert, update, delete on public.ai_trial_usage to service_role;

-- Security audit log: users read their own rows (RLS), only the server writes.
grant select on public.security_events to authenticated;
grant select, insert, update, delete on public.security_events to service_role;
