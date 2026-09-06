-- V1.4 — Trial AI usage caps
-- Trial accounts get a limited taste of the paid AI features:
--   recording (transcribe + AI summary): 5 per account for the whole trial
--   business-card scan:                  10 per account for the whole trial
-- Paid (subscription_status = 'active'), early_access accounts and admins are
-- unlimited (reuses has_unlimited_plan() from 0022).
--
-- These are a PERMANENT per-account counter (they never reset), unlike the
-- hourly anti-abuse rate limit in 0042. The limits live in the database
-- (trial_ai_limit) so the client cannot tamper with them; the API endpoints
-- only name the feature, never the number.
--
-- Run in Supabase SQL Editor. Idempotent — safe to re-run.

-- ─── 1. The counter table ──────────────────────────────────────────────────
-- One row per (user, feature). No RLS policies are added on purpose: all access
-- goes through the SECURITY DEFINER functions below, so authenticated/anon get
-- no direct read or write.

create table if not exists public.ai_trial_usage (
  user_id    uuid not null references auth.users(id) on delete cascade,
  feature    text not null,
  used       integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, feature)
);

alter table public.ai_trial_usage enable row level security;
revoke all on public.ai_trial_usage from anon, authenticated;

-- ─── 2. Server-authoritative limits ────────────────────────────────────────
-- Single source of truth for the caps. Change the numbers here (and nowhere in
-- the client) to retune. An unknown feature returns 0 => fail closed.

create or replace function public.trial_ai_limit(p_feature text)
returns integer language sql immutable as $$
  select case p_feature
    when 'recording' then 5
    when 'card_scan' then 10
    else 0
  end;
$$;

-- ─── 3. Peek (read-only) — gates a request and drives the "X of N left" UI ──
-- Returns unlimited=true for paid/early-access/admin (remaining is null).

create or replace function public.peek_trial_quota(p_feature text)
returns jsonb language plpgsql security definer set search_path = public stable as $$
declare
  v_limit integer := public.trial_ai_limit(p_feature);
  v_used  integer;
begin
  if v_limit <= 0 then
    return jsonb_build_object('unlimited', false, 'used', 0, 'limit', 0, 'remaining', 0);
  end if;
  if public.has_unlimited_plan() then
    return jsonb_build_object('unlimited', true, 'used', 0, 'limit', v_limit, 'remaining', null);
  end if;
  select used into v_used from public.ai_trial_usage
    where user_id = auth.uid() and feature = p_feature;
  v_used := coalesce(v_used, 0);
  return jsonb_build_object(
    'unlimited', false, 'used', v_used, 'limit', v_limit,
    'remaining', greatest(v_limit - v_used, 0)
  );
end;
$$;

-- ─── 4. Bump — records one successful use (called AFTER the paid API call) ──
-- No-op for unlimited accounts. Caps `used` at the limit so it never runs away.

create or replace function public.bump_trial_quota(p_feature text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_limit integer := public.trial_ai_limit(p_feature);
  v_used  integer;
begin
  if v_limit <= 0 then
    return jsonb_build_object('unlimited', false, 'used', 0, 'limit', 0, 'remaining', 0);
  end if;
  if public.has_unlimited_plan() then
    return jsonb_build_object('unlimited', true, 'used', 0, 'limit', v_limit, 'remaining', null);
  end if;
  insert into public.ai_trial_usage (user_id, feature, used, updated_at)
    values (auth.uid(), p_feature, 1, now())
  on conflict (user_id, feature) do update
    set used = least(ai_trial_usage.used + 1, v_limit), updated_at = now()
  returning used into v_used;
  return jsonb_build_object(
    'unlimited', false, 'used', v_used, 'limit', v_limit,
    'remaining', greatest(v_limit - v_used, 0)
  );
end;
$$;

-- ─── 5. Grants ─────────────────────────────────────────────────────────────
revoke all on function public.trial_ai_limit(text)   from public;
revoke all on function public.peek_trial_quota(text)  from public;
revoke all on function public.bump_trial_quota(text)  from public;
grant execute on function public.peek_trial_quota(text) to authenticated;
grant execute on function public.bump_trial_quota(text) to authenticated;

-- ─── 6. Verify after running ────────────────────────────────────────────────
-- Limits resolve as expected:
--   select public.trial_ai_limit('recording'), public.trial_ai_limit('card_scan');
-- Your own quota (run while signed in via the app, not the SQL editor, to see
-- a real auth.uid()):
--   select public.peek_trial_quota('recording');
-- To reset a specific account's AI trial usage (e.g. for a pilot):
--   delete from public.ai_trial_usage where user_id = '<user-uuid>';
-- Or lift all caps for that account:
--   update profiles set early_access = true where id = '<user-uuid>';
