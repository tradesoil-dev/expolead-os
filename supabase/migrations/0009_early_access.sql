-- Add early_access flag to profiles
-- When true, user bypasses trial expiry entirely (used for pilot users before Stripe is live)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS early_access boolean NOT NULL DEFAULT false;
