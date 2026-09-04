-- Add an optional website for each library show. Shown as a "Visit site" link on
-- the public /trade-shows directory. Admin-managed only (the exhibition_library
-- table's write access is already restricted to admins).

alter table public.exhibition_library add column if not exists website text;
