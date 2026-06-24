-- Make the exhibition library publicly readable so the public /trade-shows
-- directory page can list shows to anonymous visitors (SEO + lead gen).
-- This is non-sensitive reference data — no user data is exposed.

drop policy if exists "library readable by authenticated" on exhibition_library;
drop policy if exists "library public read" on exhibition_library;

create policy "library public read" on exhibition_library
  for select using (true);
