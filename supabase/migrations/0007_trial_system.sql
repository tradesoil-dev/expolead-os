-- V1.2 Trial System
-- Run in Supabase SQL Editor

-- ─── 1. Add trial + subscription columns to profiles ───────────────────────

alter table profiles
  add column if not exists plan               text        not null default 'trial',
  add column if not exists trial_ends_at      timestamptz not null default (now() + interval '14 days'),
  add column if not exists subscription_status text       not null default 'trialing',
  add column if not exists plan_updated_at    timestamptz,
  add column if not exists stripe_customer_id      text,
  add column if not exists stripe_subscription_id  text;

-- ─── 2. Trigger: auto-create profile with trial on new signup ──────────────

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (
    id,
    plan,
    trial_ends_at,
    subscription_status
  )
  values (
    new.id,
    'trial',
    now() + interval '14 days',
    'trialing'
  )
  on conflict (id) do update set
    trial_ends_at      = coalesce(profiles.trial_ends_at, now() + interval '14 days'),
    subscription_status = coalesce(profiles.subscription_status, 'trialing');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── 3. Trigger: seed sample exhibitions + suppliers for new users ──────────

create or replace function seed_sample_data()
returns trigger language plpgsql security definer as $$
declare
  expo1_id uuid := gen_random_uuid();
  expo2_id uuid := gen_random_uuid();
begin
  -- Sample Exhibition 1
  insert into public.exhibitions (id, user_id, name, location, start_date, end_date)
  values (
    expo1_id,
    new.id,
    'CHINACOAT 2026',
    'Guangzhou, China',
    '2026-11-18',
    '2026-11-20'
  );

  -- Sample Exhibition 2
  insert into public.exhibitions (id, user_id, name, location, start_date, end_date)
  values (
    expo2_id,
    new.id,
    'Canton Fair 2026 (Phase 2)',
    'Guangzhou, China',
    '2026-10-23',
    '2026-10-27'
  );

  -- Sample Supplier 1 (linked to CHINACOAT)
  insert into public.suppliers (
    user_id, exhibition_id, company_name, country, website,
    interest_type, priority, follow_up_status, categories,
    notes, visited, visit_date, hall, booth_number
  )
  values (
    new.id, expo1_id,
    'Guangzhou Resin Co. Ltd.',
    'China',
    'www.example-resin.com',
    'supplier', 'high', 'contacted',
    ARRAY['Resins', 'Coatings'],
    'Met at Hall 3. Interested in waterborne resin range. Send samples by Dec.',
    true, '2026-11-18', 'Hall 3', 'B204'
  );

  -- Sample Supplier 2 (linked to CHINACOAT)
  insert into public.suppliers (
    user_id, exhibition_id, company_name, country, website,
    interest_type, priority, follow_up_status, categories,
    notes, visited, visit_date, hall, booth_number
  )
  values (
    new.id, expo1_id,
    'Sino Pigment International',
    'China',
    'www.example-pigment.com',
    'supplier', 'medium', 'new',
    ARRAY['Pigments', 'Additives'],
    'Picked up catalog. Follow up on pricing for titanium dioxide.',
    true, '2026-11-19', 'Hall 5', 'A112'
  );

  -- Sample Supplier 3 (linked to Canton Fair)
  insert into public.suppliers (
    user_id, exhibition_id, company_name, country, website,
    interest_type, priority, follow_up_status, categories,
    notes, visited, visit_date
  )
  values (
    new.id, expo2_id,
    'Delta Chemicals Trading',
    'China',
    'www.example-delta.com',
    'trader', 'low', 'new',
    ARRAY['Solvents', 'Chemicals'],
    'Pre-show target. Not yet visited.',
    false, null
  );

  return new;
end;
$$;

drop trigger if exists on_profile_created_seed on public.profiles;
create trigger on_profile_created_seed
  after insert on public.profiles
  for each row execute procedure seed_sample_data();
