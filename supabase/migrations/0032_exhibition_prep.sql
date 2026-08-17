-- Ready-made exhibition prep checklist. Stores the keys of completed steps
-- from a fixed, opinionated template (defined in the app). Additive and safe.
alter table public.exhibitions
  add column if not exists prep_completed text[] not null default '{}';

comment on column public.exhibitions.prep_completed is
  'Keys of completed items from the ready-made exhibition prep checklist.';
