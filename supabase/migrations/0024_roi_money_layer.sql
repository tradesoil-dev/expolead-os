-- ROI money layer. Two optional fields turn recorded activity into a return
-- on investment figure per exhibition:
--   exhibitions.cost       what the show cost you (the investment)
--   opportunities.deal_value what a deal is worth (the return)
--
-- Both are OPTIONAL BY DESIGN. Capture at the booth stays quantity-first;
-- nobody should be forced to type a money figure while standing in a hall.
-- Reports simply omit the ROI panel until the numbers exist.

alter table public.opportunities
  add column if not exists deal_value numeric(14,2);

alter table public.exhibitions
  add column if not exists cost numeric(14,2);

-- Workspace currency, same pattern as quantity_unit in 0020. One currency per
-- workspace: mixing currencies in a single ROI ratio would be meaningless.
alter table public.profiles
  add column if not exists currency text not null default 'USD';

comment on column public.opportunities.deal_value is
  'Optional value of the deal in the workspace currency. Counts toward ROI only when status = won.';
comment on column public.exhibitions.cost is
  'Optional total cost of attending: stand, travel, staff, samples, shipping.';
comment on column public.profiles.currency is
  'ISO code for the workspace currency used by deal_value and exhibition cost.';

-- Verification. Expect three rows.
-- select table_name, column_name, data_type
-- from information_schema.columns
-- where (table_name = 'opportunities' and column_name = 'deal_value')
--    or (table_name = 'exhibitions'   and column_name = 'cost')
--    or (table_name = 'profiles'      and column_name = 'currency');
