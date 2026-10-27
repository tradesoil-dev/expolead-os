-- Pilot activity + campaign tag on the admin Pilot invite list.
--
-- 1. profiles.pilot_campaign: an optional label set when a pilot is invited
--    (e.g. "Gulfood 2027 outreach"), so the list can show which outreach a
--    pilot came from. Written only by the server (service role). Clients keep
--    their column-limited UPDATE from 0040, which does not include it.
-- 2. admin_list_pilots() gains real usage: connections, opportunities, ELOS
--    chats and the date of the last thing they added. "Last sign-in" alone is
--    misleading because sessions persist for weeks.
--
-- The return type changes, so the function is dropped and recreated. Still
-- security definer, still gated by is_admin(): non-admins get no rows.
-- Safe to re-run.

alter table public.profiles
  add column if not exists pilot_campaign text
  check (pilot_campaign is null or char_length(pilot_campaign) <= 80);

comment on column public.profiles.pilot_campaign is
  'Outreach campaign a pilot was invited under (admin/service set only).';

drop function if exists public.admin_list_pilots();

create function public.admin_list_pilots()
returns table (
  id uuid,
  email text,
  full_name text,
  company_name text,
  pilot_invited_at timestamptz,
  early_access_until timestamptz,
  elos_enabled boolean,
  email_confirmed_at timestamptz,
  last_sign_in_at timestamptz,
  pilot_campaign text,
  connections_count bigint,
  opportunities_count bigint,
  elos_chats_count bigint,
  last_activity_at timestamptz
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
    u.last_sign_in_at,
    p.pilot_campaign,
    (select count(*) from public.suppliers s where s.user_id = u.id),
    (select count(*) from public.opportunities o where o.user_id = u.id),
    (select count(*) from public.ai_conversations c where c.user_id = u.id),
    greatest(
      (select max(s.created_at) from public.suppliers s where s.user_id = u.id),
      (select max(o.created_at) from public.opportunities o where o.user_id = u.id),
      (select max(c.created_at) from public.ai_conversations c where c.user_id = u.id),
      (select max(e.created_at) from public.exhibitions e where e.user_id = u.id)
    )
  from public.profiles p
  join auth.users u on u.id = p.id
  where public.is_admin()
    and p.early_access_until is not null
  order by coalesce(p.pilot_invited_at, u.created_at) desc;
$$;

revoke all on function public.admin_list_pilots() from public;
grant execute on function public.admin_list_pilots() to authenticated;
