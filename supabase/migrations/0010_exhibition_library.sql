-- ─── Exhibition Library ──────────────────────────────────────────────────
-- A system-maintained catalog of known trade shows. Read-only for all
-- authenticated users; maintained by admin via the Supabase SQL editor /
-- service role. Users pick a show from here to pre-fill the "New exhibition"
-- form — the data is then COPIED into their own (per-user) exhibitions table.

create table if not exists exhibition_library (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  start_date date,
  end_date date,
  sector text,
  created_at timestamptz not null default now()
);

alter table exhibition_library enable row level security;

-- Everyone signed in can read the catalog; nobody can write to it via the
-- client (inserts/updates happen through the service role only).
drop policy if exists "library readable by authenticated" on exhibition_library;
create policy "library readable by authenticated" on exhibition_library
  for select to authenticated using (true);

-- ─── Seed verified shows (dates/venues confirmed from official sites) ───────
insert into exhibition_library (name, location, start_date, end_date, sector) values
  ('CHINACOAT 2026',                'Guangzhou, China',                                   '2026-11-11', '2026-11-13', 'Coatings & Chemicals'),
  ('ICIF China 2026',               'Shanghai New International Expo Centre, Shanghai, China', '2026-09-15', '2026-09-17', 'Fertilizer & Agrochemicals'),
  ('SIAL China 2026',               'Poly World Trade Center Expo, Guangzhou, China',     '2026-09-03', '2026-09-05', 'Food & Beverage'),
  ('Private Label Middle East 2026','Dubai World Trade Centre, Dubai, UAE',               '2026-11-03', '2026-11-05', 'Private Label / FMCG'),
  ('Anuga 2027',                    'Cologne, Germany',                                   '2027-10-09', '2027-10-13', 'Food & Beverage');

-- ─── Remove the auto-seed-on-signup trigger ────────────────────────────────
-- New accounts now start clean; users build their list from the library
-- picker instead of inheriting hardcoded sample shows + suppliers.
drop trigger if exists on_profile_created_seed on public.profiles;
drop function if exists seed_sample_data();
