-- Attending posture per exhibition: are you visiting the floor, or exhibiting
-- with your own stand? This drives how the Booth & Exhibition section is
-- captured on connections linked to a show.
--
--   visiting   (default) = you walk the floor and record other companies'
--                          booths (Hall / Booth / Stand), exactly as before.
--   exhibiting            = you have your own stand. You set your own booth
--                          ONCE here on the exhibition, and connections under
--                          the show are buyers who came to you, so the per
--                          connection booth fields are dropped.
--
-- Additive and safe: existing shows default to 'visiting', so nothing changes
-- until a show is flipped to 'exhibiting'.

alter table public.exhibitions
  add column if not exists attending_as text not null default 'visiting'
    check (attending_as in ('visiting','exhibiting')),
  add column if not exists own_hall text,
  add column if not exists own_booth_number text,
  add column if not exists own_stand_location text;

comment on column public.exhibitions.attending_as is
  'visiting = you capture other companies booths; exhibiting = you have your own stand and capture buyers who come to you.';

-- Verification. Expect four rows.
-- select column_name, data_type, column_default
-- from information_schema.columns
-- where table_name = 'exhibitions'
--   and column_name in ('attending_as','own_hall','own_booth_number','own_stand_location');
