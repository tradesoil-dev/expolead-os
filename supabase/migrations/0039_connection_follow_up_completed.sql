-- Track whether a connection's follow-up was completed, so Reports can show an
-- accurate follow-up rate across both connections and opportunities. "Mark done"
-- sets this true (and clears the date so it leaves the active Follow-ups list).
alter table suppliers
  add column if not exists follow_up_completed boolean not null default false;
