-- ExpoLead OS — Phase 1 schema (new architecture)
-- Run this in Supabase → SQL Editor.
-- Safe to re-run: it drops and recreates the ExpoLead tables.

create extension if not exists "pgcrypto";

-- Clean slate for the old flat model (only affects these tables).
drop table if exists documents cascade;
drop table if exists meetings cascade;
drop table if exists products cascade;
drop table if exists contacts cascade;
drop table if exists suppliers cascade;
drop table if exists exhibitions cascade;

-- Exhibitions the user attends.
create table exhibitions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  location text,
  start_date date,
  end_date date,
  created_at timestamptz not null default now()
);

-- The core company record: supplier / buyer / partner / distributor.
-- is_target = saved before the show; flip to met when you visit the booth.
create table suppliers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  exhibition_id uuid references exhibitions(id) on delete set null,
  company_name text not null,
  country text,
  website text,
  interest_type text not null default 'supplier'
    check (interest_type in ('supplier','trader','distributor','agent','buyer','partner','service_provider')),
  is_target boolean not null default false,
  priority text not null default 'medium'
    check (priority in ('high','medium','low')),
  follow_up_status text not null default 'new'
    check (follow_up_status in
      ('new','contacted','sample_requested','quotation_requested','under_discussion','closed')),
  follow_up_date date,
  categories text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now()
);

-- People at a company (the business-card scanner will write here later).
create table contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  supplier_id uuid not null references suppliers(id) on delete cascade,
  full_name text,
  position text,
  email text,
  phone text,
  whatsapp text,
  wechat text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

-- Forward-compatible tables (no UI yet, here so we don't re-migrate later).
create table products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  supplier_id uuid not null references suppliers(id) on delete cascade,
  name text not null,
  application text,
  certifications text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table meetings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  supplier_id uuid not null references suppliers(id) on delete cascade,
  exhibition_id uuid references exhibitions(id) on delete set null,
  met_on date not null default now(),
  notes text,
  voice_note_path text,
  created_at timestamptz not null default now()
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  supplier_id uuid references suppliers(id) on delete cascade,
  kind text check (kind in ('business_card','catalog','photo','other')),
  file_path text not null,
  title text,
  created_at timestamptz not null default now()
);
create table opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  name text not null,
  product text not null,
  quantity text,
  destination_market text,

  priority text not null default 'medium'
    check (priority in ('high','medium','low')),

  status text not null default 'researching'
    check (status in ('researching','contacted','evaluating','negotiating','won','lost')),

  notes text,

  created_at timestamptz not null default now()
);
-- Indexes
create index suppliers_user_idx on suppliers(user_id);
create index suppliers_priority_idx on suppliers(priority);
create index suppliers_followup_idx on suppliers(follow_up_date);
create index contacts_supplier_idx on contacts(supplier_id);

-- Row Level Security: each user sees only their own rows.
alter table exhibitions enable row level security;
alter table suppliers   enable row level security;
alter table contacts    enable row level security;
alter table products    enable row level security;
alter table meetings    enable row level security;
alter table documents   enable row level security;

create policy "own exhibitions" on exhibitions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own suppliers" on suppliers for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own contacts" on contacts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own products" on products for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own meetings" on meetings for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own documents" on documents for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- User profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company_name text,
  role text,
  country text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table profiles enable row level security;

create policy "Users can view their own profile"
on profiles for select
using (auth.uid() = id);

create policy "Users can insert their own profile"
on profiles for insert
with check (auth.uid() = id);

create policy "Users can update their own profile"
on profiles for update
using (auth.uid() = id);