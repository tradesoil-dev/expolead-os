-- Security event audit log (starts with password changes).
--
-- Deliberately NOT a trigger on auth.users: a trigger there fires on every
-- login / token refresh and a fault in it could break authentication. Instead
-- the app's password-change flows call /api/account/password-changed, which
-- writes here (service role) and emails the user. Best-effort, so it can never
-- block a password change or a sign-in.

create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists security_events_user_idx
  on public.security_events(user_id, created_at desc);

alter table public.security_events enable row level security;

-- No direct client writes. Users may read their own events; the endpoint writes
-- via the service role (which bypasses RLS).
revoke all on public.security_events from anon, authenticated;
grant select on public.security_events to authenticated;

drop policy if exists "own security events read" on public.security_events;
create policy "own security events read" on public.security_events for select
  using (auth.uid() = user_id);
