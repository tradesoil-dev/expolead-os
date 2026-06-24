-- Admin system for managing the exhibition library.
-- Adds an is_admin flag to profiles and lets admins write to exhibition_library.
-- Regular users remain read-only (public read policy from 0012 stays).

alter table profiles add column if not exists is_admin boolean not null default false;

-- Security-definer helper so RLS can check admin status without recursion.
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- Admin-only write access to the library.
drop policy if exists "library admin insert" on exhibition_library;
create policy "library admin insert" on exhibition_library
  for insert with check (public.is_admin());

drop policy if exists "library admin update" on exhibition_library;
create policy "library admin update" on exhibition_library
  for update using (public.is_admin());

drop policy if exists "library admin delete" on exhibition_library;
create policy "library admin delete" on exhibition_library
  for delete using (public.is_admin());
