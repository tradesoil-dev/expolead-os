-- Cleanup (2026-08-27). Remove unused payment-gateway placeholder columns.
--
-- ExpoLead has no payment-gateway (IPG) integration: billing is manual bank
-- transfer with admin confirmation. `stripe_customer_id` and
-- `stripe_subscription_id` were added in 0007 as placeholders for a
-- card-on-file provider that was never integrated (early Stripe / PayHere trials
-- did not proceed; Stripe is not available to Sri Lankan businesses). No code
-- reads or writes these columns. Dropping them until a real provider is chosen;
-- a future migration can re-add whatever that provider actually needs.
--
-- Idempotent: safe to run once. `if exists` makes a re-run a no-op.

alter table public.profiles drop column if exists stripe_customer_id;
alter table public.profiles drop column if exists stripe_subscription_id;
