-- Manual per-row / bulk delete from the People admin page. Unlike
-- admin_delete_unconfirmed (which is a safe automatic sweep of never-confirmed
-- bots), this deletes SPECIFIC accounts the founder ticks, including confirmed
-- real users and their data, so it is deliberately manual and confirmed in the
-- UI. Two guards baked in so it can never be a foot-gun:
--   * you can never delete your own account (auth.uid())
--   * you can never delete another admin
-- Deleting an auth user cascades to their suppliers/opportunities/etc via the
-- on-delete-cascade foreign keys; profiles are removed first to be safe.

create or replace function public.admin_delete_users(p_ids uuid[])
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ids   uuid[];
  v_count integer;
begin
  if not public.is_admin() then
    raise exception 'Not permitted';
  end if;

  -- Resolve the deletable set up front: only the ids passed in, minus the
  -- caller and minus any admin account.
  select array_agg(u.id) into v_ids
  from auth.users u
  left join public.profiles p on p.id = u.id
  where u.id = any(p_ids)
    and u.id <> auth.uid()
    and coalesce(p.is_admin, false) = false;

  if v_ids is null then
    return 0;
  end if;

  delete from public.profiles where id = any(v_ids);
  delete from auth.users where id = any(v_ids);
  get diagnostics v_count = row_count;

  return v_count;
end;
$$;

revoke all on function public.admin_delete_users(uuid[]) from public;
grant execute on function public.admin_delete_users(uuid[]) to authenticated;

-- Verification. Expect 1 row.
-- select proname from pg_proc where proname = 'admin_delete_users';
