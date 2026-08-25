-- Type of a logged interaction (phone call, online meeting, met at their/our
-- office, site visit, other) so the connection's history shows how the
-- relationship progressed, each stamped with its date.
alter table meetings
  add column if not exists meeting_type text;
