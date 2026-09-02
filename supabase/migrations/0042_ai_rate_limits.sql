-- Durable per-user rate limiting for the cost-bearing AI endpoints
-- (transcribe, summarize, and the upcoming business-card scan). Vercel is
-- serverless, so an in-memory limiter does nothing; this uses a Postgres
-- fixed-window counter.
--
-- The table is written only through check_rate_limit(), a SECURITY DEFINER
-- function that runs as the owner and identifies the caller via auth.uid().
-- RLS is enabled with no policies and direct grants are revoked, so
-- authenticated users cannot read or write the table directly.

create table if not exists public.ai_rate_limits (
  user_id uuid not null,
  bucket text not null,
  window_start timestamptz not null,
  count integer not null default 0,
  primary key (user_id, bucket, window_start)
);

alter table public.ai_rate_limits enable row level security;
revoke all on public.ai_rate_limits from anon, authenticated;

create or replace function public.check_rate_limit(
  p_bucket text,
  p_limit integer,
  p_window_seconds integer
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
    return jsonb_build_object('allowed', false, 'reason', 'unauthenticated');
  end if;

  -- Align "now" to the start of the current fixed window.
  v_window_start := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.ai_rate_limits (user_id, bucket, window_start, count)
  values (v_user, p_bucket, v_window_start, 1)
  on conflict (user_id, bucket, window_start)
  do update set count = public.ai_rate_limits.count + 1
  returning count into v_count;

  -- Keep the table tiny: drop this user's older windows for this bucket.
  delete from public.ai_rate_limits
  where user_id = v_user and bucket = p_bucket and window_start < v_window_start;

  if v_count > p_limit then
    return jsonb_build_object('allowed', false, 'remaining', 0, 'limit', p_limit);
  end if;

  return jsonb_build_object('allowed', true, 'remaining', p_limit - v_count, 'limit', p_limit);
end;
$$;

revoke all on function public.check_rate_limit(text, integer, integer) from public, anon;
grant execute on function public.check_rate_limit(text, integer, integer) to authenticated;
