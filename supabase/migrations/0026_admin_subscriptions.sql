-- Admin Subscriptions screen: see who wants to pay, who has paid, and grant
-- access with a button instead of hand-written SQL.
--
-- Both functions are security-definer so they can read auth.users and write
-- to another user's profile. The is_admin() gate means a non-admin calling
-- them gets zero rows or a refusal, never someone else's data.

-- ---------- list ----------
create or replace function public.admin_list_upgrade_requests()
returns table (
  id uuid,
  reference text,
  user_id uuid,
  email text,
  full_name text,
  company_name text,
  plan text,
  billing_cycle text,
  amount_usd numeric,
  status text,
  requested_at timestamptz,
  payment_claimed_at timestamptz,
  confirmed_at timestamptz,
  early_access boolean,
  subscription_status text
)
language sql
security definer
stable
set search_path = public
as $$
  select
    r.id,
    r.reference,
    r.user_id,
    u.email::text,
    p.full_name,
    p.company_name,
    r.plan,
    r.billing_cycle,
    r.amount_usd,
    r.status,
    r.requested_at,
    r.payment_claimed_at,
    r.confirmed_at,
    coalesce(p.early_access, false),
    p.subscription_status
  from public.upgrade_requests r
  join auth.users u on u.id = r.user_id
  left join public.profiles p on p.id = r.user_id
  where public.is_admin()
  order by
    case r.status
      when 'payment_claimed' then 0   -- waiting on you, show first
      when 'pending' then 1
      else 2
    end,
    r.requested_at desc;
$$;

revoke all on function public.admin_list_upgrade_requests() from public;
grant execute on function public.admin_list_upgrade_requests() to authenticated;

-- ---------- confirm ----------
-- Marks the request confirmed AND grants the account access, in one step, so
-- the two can never drift apart (a confirmed payment with a still-locked
-- account is the worst possible outcome for a paying customer).
create or replace function public.admin_confirm_upgrade(p_reference text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_plan    text;
begin
  if not public.is_admin() then
    raise exception 'Not permitted';
  end if;

  update public.upgrade_requests
     set status = 'confirmed',
         confirmed_at = now()
   where reference = p_reference
     and status <> 'confirmed'
  returning user_id, plan into v_user_id, v_plan;

  if v_user_id is null then
    return null;   -- unknown reference, or already confirmed
  end if;

  update public.profiles
     set early_access = true,
         plan = v_plan
   where id = v_user_id;

  return p_reference;
end;
$$;

revoke all on function public.admin_confirm_upgrade(text) from public;
grant execute on function public.admin_confirm_upgrade(text) to authenticated;

-- ---------- cancel ----------
create or replace function public.admin_cancel_upgrade(p_reference text)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not permitted';
  end if;

  update public.upgrade_requests
     set status = 'cancelled'
   where reference = p_reference
     and status <> 'confirmed';   -- never undo a confirmed payment here

  return p_reference;
end;
$$;

revoke all on function public.admin_cancel_upgrade(text) from public;
grant execute on function public.admin_cancel_upgrade(text) to authenticated;

-- Verification. Expect 3 rows.
-- select proname from pg_proc where proname in
--   ('admin_list_upgrade_requests','admin_confirm_upgrade','admin_cancel_upgrade');
