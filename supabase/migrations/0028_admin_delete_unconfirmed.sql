-- One-click cleanup of bot / abandoned signups from the People admin page,
-- so Gladwin never has to hand-delete rows in the Supabase SQL editor again.
--
-- Security-definer so it can reach auth.users; the is_admin() gate means only
-- the founder can ever run it. It ONLY removes accounts that never confirmed
-- their email AND are older than 24 hours, so confirmed users and fresh
-- in-flight signups are never touched. Confirmed = no session = they are
-- inert bots anyway (see the email-confirmation gate in middleware).

create or replace function public.admin_delete_unconfirmed()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if not public.is_admin() then
    raise exception 'Not permitted';
  end if;

  -- profile rows first, then the auth users, so it works regardless of how
  -- the profiles foreign key is configured.
  delete from public.profiles
  where id in (
    select id from auth.users
    where email_confirmed_at is null
      and created_at < now() - interval '1 day'
  );

  delete from auth.users
  where email_confirmed_at is null
    and created_at < now() - interval '1 day';
  get diagnostics v_count = row_count;

  return v_count;
end;
$$;

revoke all on function public.admin_delete_unconfirmed() from public;
grant execute on function public.admin_delete_unconfirmed() to authenticated;

-- Verification. Expect 1 row.
-- select proname from pg_proc where proname = 'admin_delete_unconfirmed';
