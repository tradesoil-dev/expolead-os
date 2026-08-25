-- A short follow-up note (the action to take) on a connection, so the
-- Follow-ups tab can show what is owed, not just the company/country.
alter table suppliers
  add column if not exists follow_up_note text;
