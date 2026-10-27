-- Grants hardening (defence in depth; Row Level Security already blocks these).
--
-- Signed-out visitors (anon) only ever need to READ two tables: the public
-- Exhibition Library (homepage, trade shows) and plan prices (pricing page).
-- Everything else is removed from anon, so a signed-out request is refused at
-- the permission check instead of relying on RLS alone.
--
-- 1. anon loses all access to private user tables, and write access to the
--    exhibition library. It keeps SELECT on exhibition_library and plan_pricing.
-- 2. Signed-in users can no longer INSERT or DELETE profiles directly. The app
--    never does: new profiles come from the handle_new_user trigger and
--    deletion goes through delete_own_account() / admin functions, all
--    SECURITY DEFINER.
-- 3. RPC functions the app calls with a signed-in session are no longer
--    callable by anon (they returned nothing for anon anyway). Functions used
--    inside RLS policies (is_admin, user_can_create, within_*_cap,
--    has_unlimited_plan) are left as they are so policy checks keep working;
--    trial_ai_limit stays server-internal as set in 0045.
-- 4. New functions created later no longer get EXECUTE for anon by default;
--    a future public RPC must grant it explicitly.
--
-- Safe to re-run.

-- 1. Signed-out access.
revoke all on
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
  public.profiles
from anon;

revoke insert, update, delete on public.exhibition_library from anon;
grant select on public.exhibition_library to anon;
grant select on public.plan_pricing to anon;

-- 2. Profiles: no direct insert or delete from the browser.
revoke insert, delete on public.profiles from authenticated;

-- 3. RPCs: signed-in (and server) only.
do $$
declare
  f record;
begin
  for f in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'admin_cancel_upgrade', 'admin_confirm_upgrade', 'admin_delete_unconfirmed',
        'admin_delete_users', 'admin_list_pilots', 'admin_list_signups',
        'admin_list_upgrade_requests', 'admin_mark_renewed', 'admin_update_pricing',
        'bump_trial_quota', 'check_rate_limit', 'claim_upgrade_payment',
        'delete_own_account', 'new_upgrade_reference', 'peek_rate_limit',
        'peek_trial_quota'
      )
  loop
    execute format('revoke execute on function %s from public, anon', f.sig);
    execute format('grant execute on function %s to authenticated, service_role', f.sig);
  end loop;
end $$;

-- 4. Future functions: no automatic EXECUTE for anon.
alter default privileges in schema public revoke execute on functions from anon;
