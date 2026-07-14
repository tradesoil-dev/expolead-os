-- Per-opportunity quantity unit. A diversified trader works multiple sectors
-- (FMCG in cartons, raw materials in MT) in one workspace, so each opportunity
-- carries its own unit. Null means "use the workspace default" (profiles.quantity_unit).
alter table public.opportunities
  add column if not exists quantity_unit text;
