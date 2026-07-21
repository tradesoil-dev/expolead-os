-- Upgrade requests: records a user telling us they want to pay, before any
-- payment gateway exists. Gladwin confirms the bank transfer, then grants
-- access (early_access today, subscription_status once billing is live).
--
-- Solves the early_access gap: that flag records ACCESS but not who paid,
-- for which plan, or when. This table is the paper trail.

create table if not exists public.upgrade_requests (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  plan          text not null check (plan in ('starter', 'growth')),
  billing_cycle text not null check (billing_cycle in ('monthly', 'annual')),
  amount_usd    numeric(10,2) not null,
  reference     text not null unique,
  status        text not null default 'pending'
                check (status in ('pending', 'confirmed', 'cancelled')),
  requested_at  timestamptz not null default now(),
  confirmed_at  timestamptz,
  notes         text
);

create index if not exists upgrade_requests_user_idx   on public.upgrade_requests(user_id);
create index if not exists upgrade_requests_status_idx on public.upgrade_requests(status);

alter table public.upgrade_requests enable row level security;

-- A user may see and create their own requests. They may never change status:
-- only an admin confirms a payment.
drop policy if exists "upgrade_requests select own" on public.upgrade_requests;
create policy "upgrade_requests select own" on public.upgrade_requests
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "upgrade_requests insert own" on public.upgrade_requests;
create policy "upgrade_requests insert own" on public.upgrade_requests
  for insert with check (auth.uid() = user_id);

drop policy if exists "upgrade_requests admin update" on public.upgrade_requests;
create policy "upgrade_requests admin update" on public.upgrade_requests
  for update using (public.is_admin());

drop policy if exists "upgrade_requests admin delete" on public.upgrade_requests;
create policy "upgrade_requests admin delete" on public.upgrade_requests
  for delete using (public.is_admin());

-- Short human-friendly reference the customer quotes on their bank transfer,
-- e.g. EL-4821. Retries on the unlikely collision.
create or replace function public.new_upgrade_reference()
returns text language plpgsql volatile as $$
declare
  candidate text;
  attempts  int := 0;
begin
  loop
    candidate := 'EL-' || lpad((floor(random() * 9000) + 1000)::int::text, 4, '0');
    exit when not exists (
      select 1 from public.upgrade_requests where reference = candidate
    );
    attempts := attempts + 1;
    if attempts > 50 then
      candidate := 'EL-' || to_char(now(), 'YYMMDDHH24MISS');
      exit;
    end if;
  end loop;
  return candidate;
end;
$$;

-- Verification. Expect 4 policy rows, and a reference like EL-1234.
-- select policyname, cmd from pg_policies where tablename = 'upgrade_requests';
-- select public.new_upgrade_reference();
