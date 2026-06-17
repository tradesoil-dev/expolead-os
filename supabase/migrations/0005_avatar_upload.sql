-- Add avatar_url to profiles
alter table profiles add column if not exists avatar_url text;

-- Create avatars storage bucket (public so images are accessible via URL)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage policies: users can manage only their own folder ({user_id}/avatar.*)
create policy "Avatar public read"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "Avatar upload own"
on storage.objects for insert
with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Avatar update own"
on storage.objects for update
using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Avatar delete own"
on storage.objects for delete
using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
