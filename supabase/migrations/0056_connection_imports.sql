-- Import history for the Connections CSV import.
--
-- One row per import a user runs (file name, exhibition, how many rows were
-- saved). The file itself is never stored, only this small log. Each imported
-- connection carries the import's id, so a user can see "Import 1, 2, 3" and
-- undo a whole import in one step (delete every connection it created).
--
-- User-owned table: RLS restricts every row to its owner, like suppliers.
-- suppliers.import_id is set null if the log row is ever removed, so deleting
-- history never deletes connections.
--
-- Safe to re-run.

create table if not exists public.connection_imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  file_name text not null check (char_length(file_name) between 1 and 200),
  exhibition_id uuid references public.exhibitions(id) on delete set null,
  row_count integer not null default 0 check (row_count >= 0),
  undone_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists connection_imports_user_idx
  on public.connection_imports (user_id, created_at desc);

alter table public.connection_imports enable row level security;

drop policy if exists "connection_imports select own" on public.connection_imports;
create policy "connection_imports select own" on public.connection_imports
  for select using (auth.uid() = user_id);

drop policy if exists "connection_imports insert own" on public.connection_imports;
create policy "connection_imports insert own" on public.connection_imports
  for insert with check (auth.uid() = user_id);

drop policy if exists "connection_imports update own" on public.connection_imports;
create policy "connection_imports update own" on public.connection_imports
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "connection_imports delete own" on public.connection_imports;
create policy "connection_imports delete own" on public.connection_imports
  for delete using (auth.uid() = user_id);

-- Explicit grants (Supabase no longer auto-grants new tables from 30 Oct 2026).
revoke all on public.connection_imports from anon;
grant select, insert, update, delete on public.connection_imports to authenticated;
grant select, insert, update, delete on public.connection_imports to service_role;

-- Link each imported connection to its import.
alter table public.suppliers
  add column if not exists import_id uuid references public.connection_imports(id) on delete set null;

create index if not exists suppliers_import_id_idx
  on public.suppliers (import_id) where import_id is not null;
