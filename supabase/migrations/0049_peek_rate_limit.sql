-- Read-only companion to check_rate_limit (0042): report how much of a bucket's
-- current fixed window remains WITHOUT consuming a slot. Drives the
-- "N of 30 questions left this hour" counter in the ELOS chat drawer.
--
-- SECURITY DEFINER so it can read ai_rate_limits (RLS-locked with grants
-- revoked in 0042), scoped to the caller via auth.uid(). It never writes.
create or replace function public.peek_rate_limit(
  p_bucket text,
  p_window_seconds integer,
  p_limit integer
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_window_start timestamptz;
  v_count integer;
begin
  if v_user is null then
    return jsonb_build_object('remaining', 0, 'limit', p_limit);
  end if;

  -- Same window alignment as check_rate_limit so the count matches what gating sees.
  v_window_start := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  select count into v_count
  from public.ai_rate_limits
  where user_id = v_user and bucket = p_bucket and window_start = v_window_start;

  v_count := coalesce(v_count, 0);
  return jsonb_build_object('remaining', greatest(p_limit - v_count, 0), 'limit', p_limit);
end;
$$;

revoke all on function public.peek_rate_limit(text, integer, integer) from public, anon;
grant execute on function public.peek_rate_limit(text, integer, integer) to authenticated;
