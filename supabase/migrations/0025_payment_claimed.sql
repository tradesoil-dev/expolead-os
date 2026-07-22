-- "I have made the payment" was a dead button: it only changed the screen.
-- The single most important signal in the flow, a customer telling us money is
-- on its way, went nowhere. This records it and lets the app notify Gladwin.

alter table public.upgrade_requests
  add column if not exists payment_claimed_at timestamptz;

-- Widen the allowed statuses. pending -> payment_claimed -> confirmed.
alter table public.upgrade_requests
  drop constraint if exists upgrade_requests_status_check;

alter table public.upgrade_requests
  add constraint upgrade_requests_status_check
  check (status in ('pending', 'payment_claimed', 'confirmed', 'cancelled'));

-- Users cannot UPDATE their own request (only admins can, by design, so nobody
-- can mark themselves confirmed). Claiming a payment is the one change a user
-- must be able to make, so it goes through a security-definer function that
-- allows exactly that transition and nothing else.
create or replace function public.claim_upgrade_payment(p_reference text)
returns table (reference text, plan text, billing_cycle text, amount_usd numeric)
language plpgsql security definer as $$
begin
  return query
  update public.upgrade_requests r
     set status = 'payment_claimed',
         payment_claimed_at = now()
   where r.reference = p_reference
     and r.user_id = auth.uid()          -- only your own request
     and r.status in ('pending', 'payment_claimed')  -- never un-confirm
  returning r.reference, r.plan, r.billing_cycle, r.amount_usd;
end;
$$;

revoke all on function public.claim_upgrade_payment(text) from public;
grant execute on function public.claim_upgrade_payment(text) to authenticated;

-- Verification. Expect the column, the 4-value constraint, and the function.
-- select column_name from information_schema.columns
--   where table_name = 'upgrade_requests' and column_name = 'payment_claimed_at';
-- select pg_get_constraintdef(oid) from pg_constraint
--   where conname = 'upgrade_requests_status_check';
