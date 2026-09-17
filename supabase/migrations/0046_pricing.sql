-- V1.5 — Admin-editable pricing + introductory offer
-- Moves plan pricing out of hardcoded code into a table the admin can edit, so
-- Gladwin can change base prices and toggle an introductory offer without a
-- code change. Prices stay SERVER-AUTHORITATIVE: the app reads this table
-- server-side; the charged amount is never taken from the browser. Writes are
-- admin-only via a SECURITY DEFINER RPC.
--
-- Introductory model: a lower price for the first N month(s), then the standard
-- monthly price. Intro applies to the MONTHLY cycle only. The actual recurring
-- "first month then revert" CHARGE lands with the payment gateway; today this
-- drives the display + the disclosure copy.
--
-- Run in Supabase SQL Editor. Idempotent — safe to re-run (seed uses DO NOTHING
-- so it never overwrites prices you later change in the admin screen).

create table if not exists public.plan_pricing (
  plan               text primary key,          -- 'starter' | 'growth'
  monthly_usd        integer not null,
  annual_usd         integer not null,
  intro_enabled      boolean not null default false,
  intro_monthly_usd  integer not null default 0,
  intro_months       integer not null default 1,
  intro_label        text,
  updated_at         timestamptz not null default now()
);

alter table public.plan_pricing enable row level security;

-- Prices are public (shown on the marketing site), so anyone may READ.
drop policy if exists "plan_pricing read" on public.plan_pricing;
create policy "plan_pricing read" on public.plan_pricing for select using (true);

-- No write policy => authenticated/anon cannot write directly; only the
-- SECURITY DEFINER RPC below (which runs as owner) can.
revoke insert, update, delete on public.plan_pricing from anon, authenticated;

-- Seed current prices. Starter base 39/mo (468/yr = 12x, not a discount) with a
-- launch intro of 29 for the first month; Growth 99/mo (1188/yr), no intro
-- while it is still under development. DO NOTHING so re-running keeps admin edits.
insert into public.plan_pricing (plan, monthly_usd, annual_usd, intro_enabled, intro_monthly_usd, intro_months, intro_label)
values
  ('starter', 39, 468, true,  29, 1, 'Launch offer'),
  ('growth',  99, 1188, false, 0, 1, null)
on conflict (plan) do nothing;

-- Admin-only update. is_admin() gate mirrors the other admin RPCs (0026).
create or replace function public.admin_update_pricing(
  p_plan            text,
  p_monthly         integer,
  p_annual          integer,
  p_intro_enabled   boolean,
  p_intro_monthly   integer,
  p_intro_months    integer,
  p_intro_label     text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not permitted';
  end if;
  if p_plan not in ('starter', 'growth') then
    raise exception 'Unknown plan';
  end if;
  if p_monthly < 0 or p_annual < 0 or p_intro_monthly < 0 or p_intro_months < 0 then
    raise exception 'Prices and durations must be non-negative';
  end if;

  update public.plan_pricing set
    monthly_usd       = p_monthly,
    annual_usd        = p_annual,
    intro_enabled     = p_intro_enabled,
    intro_monthly_usd = p_intro_monthly,
    intro_months      = greatest(p_intro_months, 1),
    intro_label       = nullif(trim(coalesce(p_intro_label, '')), ''),
    updated_at        = now()
  where plan = p_plan;
end;
$$;

revoke all on function public.admin_update_pricing(text, integer, integer, boolean, integer, integer, text) from public;
grant execute on function public.admin_update_pricing(text, integer, integer, boolean, integer, integer, text) to authenticated;

-- Verify:
--   select * from public.plan_pricing order by plan;
