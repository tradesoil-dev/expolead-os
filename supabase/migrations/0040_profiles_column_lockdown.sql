-- P0 security fix (audit 2026-08-27, finding C1).
--
-- Before this, `authenticated` and `anon` held table-wide UPDATE on profiles
-- (Supabase's default GRANT ALL). Combined with the "update own profile" RLS
-- policy, a signed-in user could update their OWN row's is_admin / plan /
-- subscription_status / trial_ends_at / early_access / paid_until columns from
-- the browser, self-granting admin and bypassing trial/billing.
--
-- RLS row policies are not column-aware, so the fix is column-level privileges:
-- revoke UPDATE, then grant it back only on the columns real app flows write
-- (Settings form + the signup_country / welcome_sent stamps in app/(app)/layout).
-- Privileged columns stay writable only by SECURITY DEFINER RPCs (admin_*,
-- claim/confirm, renewals) and the service role, which do not rely on the
-- `authenticated` grant.
--
-- INSERT/SELECT are intentionally untouched: handle_new_user() creates each
-- profile row and users have no DELETE on profiles, so the INSERT path cannot be
-- used to forge an is_admin row (PK conflict routes upsert to the UPDATE path).

revoke update on public.profiles from anon;          -- anon never updates profiles
revoke update on public.profiles from authenticated; -- drop table-wide UPDATE

grant update (
  full_name, company_name, role, country, linkedin_url, about,
  avatar_url, avatar_position_y, quantity_unit, currency,
  signup_country, welcome_sent
) on public.profiles to authenticated;
