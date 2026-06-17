-- ExpoLead OS — Opportunity Status History
-- Purpose: record each status transition an opportunity goes through,
-- separate from opportunity_followups (which is user-authored notes,
-- not system-recorded deal movement). Additive only.
-- Safe to re-run: every statement is guarded.

create table if not exists opportunity_status_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  status text not null
    check (status in ('researching','contacted','evaluating','negotiating','won','lost')),
  created_at timestamptz not null default now()
);

create index if not exists opportunity_status_history_opportunity_idx
  on opportunity_status_history(opportunity_id);

alter table opportunity_status_history enable row level security;

drop policy if exists "own opportunity_status_history" on opportunity_status_history;
create policy "own opportunity_status_history" on opportunity_status_history for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
