-- Renewal tracking for the manual bank-transfer model.
--
-- One date per account, profiles.paid_until, drives everything: the Billing
-- page, the renewal reminder emails, and the overdue flag. Confirming a
-- payment sets it; renewing pushes it forward one cycle. There is no
-- auto-lock: an overdue account is only flagged for Gladwin to decide.

alter table public.profiles
  add column if not exists paid_until timestamptz;

-- Which reminder we last sent, so the daily cron does not repeat one. Cleared
-- to null whenever paid_until moves forward (confirm or renew).
alter table public.profiles
  add column if not exists renewal_reminder_stage text
  check (renewal_reminder_stage in ('pre', 'due', 'overdue'));

-- ---- confirm: now also stamps paid_until ----
create or replace function public.admin_confirm_upgrade(p_reference text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_plan    text;
  v_cycle   text;
  v_from    timestamptz;
begin
  if not public.is_admin() then
    raise exception 'Not permitted';
  end if;

  update public.upgrade_requests
     set status = 'confirmed',
         confirmed_at = now()
   where reference = p_reference
     and status <> 'confirmed'
  returning user_id, plan, billing_cycle into v_user_id, v_plan, v_cycle;

  if v_user_id is null then
    return null;
  end if;

  -- Extend from an existing paid_until if it is still in the future (renewing
  -- early), otherwise from now.
  select greatest(coalesce(paid_until, now()), now()) into v_from
    from public.profiles where id = v_user_id;

  update public.profiles
     set early_access = true,
         plan = v_plan,
         paid_until = v_from + (case when v_cycle = 'annual' then interval '1 year' else interval '1 month' end),
         renewal_reminder_stage = null
   where id = v_user_id;

  return p_reference;
end;
$$;

revoke all on function public.admin_confirm_upgrade(text) from public;
grant execute on function public.admin_confirm_upgrade(text) to authenticated;

-- ---- renew: push paid_until forward one cycle for an already-active account ----
create or replace function public.admin_mark_renewed(p_user_id uuid, p_cycle text)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_from timestamptz;
  v_new  timestamptz;
begin
  if not public.is_admin() then
    raise exception 'Not permitted';
  end if;

  select greatest(coalesce(paid_until, now()), now()) into v_from
    from public.profiles where id = p_user_id;

  v_new := v_from + (case when p_cycle = 'annual' then interval '1 year' else interval '1 month' end);

  update public.profiles
     set paid_until = v_new,
         early_access = true,
         renewal_reminder_stage = null
   where id = p_user_id;

  return v_new;
end;
$$;

revoke all on function public.admin_mark_renewed(uuid, text) from public;
grant execute on function public.admin_mark_renewed(uuid, text) to authenticated;

-- ---- backfill paid_until for anyone already confirmed ----
-- Uses their latest confirmed request plus one cycle, so existing paid
-- accounts get a sensible date instead of null.
update public.profiles p
set paid_until = r.confirmed_at
      + (case when r.billing_cycle = 'annual' then interval '1 year' else interval '1 month' end)
from (
  select distinct on (user_id) user_id, confirmed_at, billing_cycle
  from public.upgrade_requests
  where status = 'confirmed'
  order by user_id, confirmed_at desc
) r
where p.id = r.user_id
  and p.paid_until is null;

-- ---- admin list: add paid_until so the Subscriptions screen can show
--       renewal dates and offer a "Mark renewed" action ----
-- The return type changes (paid_until added), so it must be dropped first.
drop function if exists public.admin_list_upgrade_requests();

create function public.admin_list_upgrade_requests()
returns table (
  id uuid, reference text, user_id uuid, email text, full_name text,
  company_name text, plan text, billing_cycle text, amount_usd numeric,
  status text, requested_at timestamptz, payment_claimed_at timestamptz,
  confirmed_at timestamptz, early_access boolean, subscription_status text,
  paid_until timestamptz
)
language sql security definer stable set search_path = public as $$
  select r.id, r.reference, r.user_id, u.email::text, p.full_name,
         p.company_name, r.plan, r.billing_cycle, r.amount_usd, r.status,
         r.requested_at, r.payment_claimed_at, r.confirmed_at,
         coalesce(p.early_access, false), p.subscription_status, p.paid_until
  from public.upgrade_requests r
  join auth.users u on u.id = r.user_id
  left join public.profiles p on p.id = r.user_id
  where public.is_admin()
  order by case r.status
             when 'payment_claimed' then 0
             when 'pending' then 1
             else 2 end,
           r.requested_at desc;
$$;

revoke all on function public.admin_list_upgrade_requests() from public;
grant execute on function public.admin_list_upgrade_requests() to authenticated;

-- Verification.
-- select id, plan, paid_until, renewal_reminder_stage from public.profiles where paid_until is not null;
