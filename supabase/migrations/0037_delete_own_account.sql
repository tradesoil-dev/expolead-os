-- Let a signed-in user delete their OWN account and all their data. Deleting
-- the auth.users row cascades to profiles/suppliers/opportunities/etc via the
-- on-delete-cascade foreign keys (profiles removed first to be safe). Runs as a
-- SECURITY DEFINER function scoped strictly to the caller (auth.uid()).
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;
  delete from public.profiles where id = v_uid;
  delete from auth.users where id = v_uid;
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
