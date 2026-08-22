-- Trade / engagement models per connection: private label, own brand,
-- distribution, bulk supply, co-packing, ingredient supply. Multi-select
-- (tick one or many). The same list is used in both directions — the UI label
-- adapts to the connection's classification: a supplier/manufacturer OFFERS
-- these, while a buyer/trader/distributor/etc. is LOOKING FOR them.
alter table suppliers
  add column if not exists trade_models text[] not null default '{}';
