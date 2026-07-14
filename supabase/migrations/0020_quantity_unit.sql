-- Workspace-level quantity unit. Lets each user pick the unit their trade uses
-- (MT for bulk commodities, cartons/units/kg for packaged goods, etc.) instead
-- of the hard-coded "MT". Applied across dashboard, opportunities, and reports.
alter table public.profiles
  add column if not exists quantity_unit text not null default 'MT';
