-- Pilot invite tracking list.
--
-- Records when a pilot invite was sent, and exposes an admin-only list that
-- joins the grant (profiles) with auth.users so the Pilot invite page can show
-- who was invited, when, when their access expires, whether they accepted
-- (set their password / confirmed) and when they were last active.

alter table public.profiles
  add column if not exists pilot_invited_at timestamptz;

comment on column public.profiles.pilot_invited_at is
  'When the most recent pilot invite was sent to this account. Admin/service set only.';

-- Admin-only: the pilots (accounts with a pilot access window). security definer
-- so it can read auth.users; the is_admin() gate means non-admins get no rows.
create or replace function public.admin_list_pilots()
returns table (
  id uuid,
  email text,
  full_name text,
  company_name text,
  pilot_invited_at timestamptz,
  early_access_until timestamptz,
  elos_enabled boolean,
  email_confirmed_at timestamptz,
  last_sign_in_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select
    u.id,
    u.email::text,
    p.full_name,
    p.company_name,
    p.pilot_invited_at,
    p.early_access_until,
    coalesce(p.elos_enabled, false),
    u.email_confirmed_at,
    u.last_sign_in_at
  from public.profiles p
  join auth.users u on u.id = p.id
  where public.is_admin()
    and p.early_access_until is not null
  order by coalesce(p.pilot_invited_at, u.created_at) desc;
$$;

revoke all on function public.admin_list_pilots() from public;
grant execute on function public.admin_list_pilots() to authenticated;
