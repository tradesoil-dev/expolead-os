-- ExpoLead OS — Schema Alignment Migration
-- Purpose: bring the database schema in line with columns/tables the
-- application code already reads and writes, but that schema.sql never
-- created. Additive only — does not drop or rewrite any existing table.
-- Safe to re-run: every statement is guarded (IF NOT EXISTS / DO blocks).
--
-- APPLIED. Two corrections were needed beyond this file during rollout
-- and are recorded at the bottom: opportunity_followups.user_id (the
-- table pre-existed without it) and NOT NULL enforcement on two boolean
-- columns that pre-existed as nullable. See "Post-apply corrections".

-- ============================================================
-- 1. Opportunity follow-up fields (opportunities table)
-- ============================================================
-- Required by: components/NextFollowUpForm.tsx, CompleteFollowUpButton.tsx,
-- app/(app)/dashboard/page.tsx, app/(app)/opportunities/page.tsx

alter table opportunities
  add column if not exists next_follow_up_date date,
  add column if not exists next_follow_up_note text,
  add column if not exists next_follow_up_completed boolean not null default false;

-- ============================================================
-- 2. opportunity_followups table (does not exist at all today)
-- ============================================================
-- Required by: lib/data.ts (getOpportunityFollowUps),
-- components/AddOpportunityFollowUp.tsx

create table if not exists opportunity_followups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

create index if not exists opportunity_followups_opportunity_idx
  on opportunity_followups(opportunity_id);

alter table opportunity_followups enable row level security;

drop policy if exists "own opportunity_followups" on opportunity_followups;
create policy "own opportunity_followups" on opportunity_followups for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 3. Opportunity exhibition/booth fields (opportunities table)
-- ============================================================
-- Required by: components/AddOpportunityForm.tsx,
-- app/(app)/opportunities/[id]/page.tsx

alter table opportunities
  add column if not exists exhibition text,
  add column if not exists booth text;

-- ============================================================
-- 4. Profile fields (profiles table)
-- ============================================================
-- Required by: app/(app)/profile/page.tsx

alter table profiles
  add column if not exists linkedin_url text,
  add column if not exists about text;

-- ============================================================
-- 5. Supplier booth/visit fields (suppliers table)
-- ============================================================
-- Required by: components/BoothManager.tsx,
-- app/(app)/suppliers/[id]/page.tsx, app/(app)/suppliers/[id]/booth/edit/page.tsx,
-- app/(app)/exhibitions/[id]/page.tsx, app/(app)/dashboard/page.tsx

alter table suppliers
  add column if not exists hall text,
  add column if not exists booth_number text,
  add column if not exists stand_location text,
  add column if not exists visited boolean not null default false,
  add column if not exists visit_date date;

-- ============================================================
-- 6. RLS coverage check for new table
-- ============================================================
-- exhibitions, suppliers, contacts, products, meetings, documents,
-- opportunities, and profiles already have RLS + "own ..." policies
-- from schema.sql. opportunity_followups RLS is added in section 2
-- above using the same auth.uid() = user_id pattern as every other
-- table in this project.

-- ============================================================
-- Post-apply corrections (run separately, in this order, after
-- the sections above — both already applied to the live database)
-- ============================================================

-- Correction A: opportunity_followups pre-existed (id, opportunity_id,
-- note, created_at) without user_id, so section 2's CREATE TABLE IF NOT
-- EXISTS was skipped and the RLS policy failed with:
--   ERROR: 42703: column "user_id" does not exist
-- Fix applied:
--   alter table opportunity_followups
--     add column if not exists user_id uuid references auth.users(id) on delete cascade;
--   alter table opportunity_followups alter column user_id set default auth.uid();
--   update opportunity_followups f set user_id = o.user_id
--     from opportunities o where f.opportunity_id = o.id and f.user_id is null;
--   alter table opportunity_followups alter column user_id set not null;
--   (RLS policy from section 2 re-applied successfully afterward)

-- Correction B: opportunities.next_follow_up_completed and
-- suppliers.visited both pre-existed as nullable boolean columns
-- (default false), so sections 1 and 5's ADD COLUMN IF NOT EXISTS
-- silently skipped them, leaving them nullable instead of NOT NULL.
-- Fix applied:
--   update opportunities set next_follow_up_completed = false where next_follow_up_completed is null;
--   alter table opportunities alter column next_follow_up_completed set not null;
--   update suppliers set visited = false where visited is null;
--   alter table suppliers alter column visited set not null;

-- Verified after both corrections: all 12 target columns across
-- opportunities/suppliers/profiles exist with correct type/nullability,
-- and opportunity_followups has user_id NOT NULL with RLS policy active.
