-- Feedback check-ins: an admin sends a pilot a short survey after a show, the
-- pilot answers through a private link (no sign-in), and admins read every
-- answer on Admin > Feedback.
--
-- Server-only table. RLS is on with NO policies and no client grants, so the
-- browser can never read or write it. Only server routes using the service
-- role touch it (the admin send/list routes after an is_admin check, and the
-- public submit route after matching the link's token hash).
--
-- The link token itself is never stored, only its SHA-256 hash.
-- Rows are removed with the account (on delete cascade), matching the
-- Privacy Notice promise that deleting an account deletes its data.

create table if not exists public.feedback_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exhibition_name text not null check (char_length(exhibition_name) between 1 and 80),
  campaign text not null check (char_length(campaign) between 1 and 80),
  token_hash text not null unique,
  survey_version integer not null default 1,
  sent_at timestamptz not null default now(),
  sent_by uuid references auth.users(id) on delete set null,
  answered_at timestamptz,
  answers jsonb,
  wants_call boolean
);

create index if not exists feedback_checkins_user_idx on public.feedback_checkins (user_id);
create index if not exists feedback_checkins_campaign_idx on public.feedback_checkins (campaign);

alter table public.feedback_checkins enable row level security;

-- Explicit grants (Supabase no longer auto-grants new tables from 30 Oct 2026).
revoke all on public.feedback_checkins from anon, authenticated;
grant select, insert, update, delete on public.feedback_checkins to service_role;
