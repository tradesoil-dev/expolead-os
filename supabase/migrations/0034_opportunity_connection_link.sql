-- Link an opportunity to the connection (buyer/supplier) it came from, so
-- reports can tie deal value and win rate back to a connection's trade models,
-- country, classification, etc. Optional (set null on connection delete).
alter table opportunities
  add column if not exists supplier_id uuid references suppliers(id) on delete set null;

create index if not exists opportunities_supplier_id_idx on opportunities (supplier_id);
