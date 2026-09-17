-- Track which gateway fulfilled an upgrade request, and its payment id, so a
-- card payment via payments.lk has a paper trail alongside the manual bank
-- transfers. Additive and nullable; existing bank-transfer rows are unaffected.
--
-- Run in Supabase SQL Editor. Idempotent.

alter table public.upgrade_requests
  add column if not exists provider text,
  add column if not exists provider_payment_id text;

-- Verify:
--   select reference, provider, provider_payment_id, status from public.upgrade_requests order by requested_at desc limit 5;
