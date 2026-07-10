-- Admin-only signup list for the founder "People" analytics page.
-- Security-definer so it can read auth.users; the is_admin() gate in the
-- WHERE clause means non-admins get zero rows. Run in Supabase SQL editor.

create or replace function public.admin_list_signups()
returns table (
  id uuid,
  email text,
  created_at timestamptz,
  confirmed_at timestamptz,
  full_name text,
  company_name text,
  trial_ends_at timestamptz,
  subscription_status text,
  is_admin boolean
)
language sql
security definer
stable
set search_path = public
as $$
  select
    u.id,
    u.email::text,
    u.created_at,
    u.email_confirmed_at,
    p.full_name,
    p.company_name,
    p.trial_ends_at,
    p.subscription_status,
    coalesce(p.is_admin, false)
  from auth.users u
  left join public.profiles p on p.id = u.id
  where public.is_admin()
  order by u.created_at desc;
$$;

revoke all on function public.admin_list_signups() from public;
grant execute on function public.admin_list_signups() to authenticated;
