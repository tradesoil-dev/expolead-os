-- Per-connection override for where a connection was met, for the mixed case
-- (e.g. you're exhibiting at a show but also walk the floor and meet a supplier
-- at their booth, or a shared booth login where some staff roam).
--
--   NULL         = inherit the linked exhibition's posture (attending_as).
--   my_stand     = they came to your stand (exhibitor layout, own booth shown).
--   their_booth  = you visited their booth (visitor layout, capture their booth).
--
-- Additive and safe: existing connections are NULL, so they follow the show's
-- posture exactly as before until an individual connection is overridden.

alter table public.suppliers
  add column if not exists met_at text
    check (met_at in ('my_stand','their_booth'));

comment on column public.suppliers.met_at is
  'Per-connection override for where this connection was met. NULL = inherit the exhibition posture (attending_as). my_stand = they came to your stand; their_booth = you visited their booth.';
