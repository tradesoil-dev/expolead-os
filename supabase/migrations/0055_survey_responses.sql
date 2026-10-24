-- Public post-show survey answers (e.g. /survey/sial-paris-2026), from people
-- who are not ExpoLead OS users: exhibitors and visitors reached on LinkedIn
-- and other channels. Pilot answers stay in feedback_checkins.
--
-- Server-only table. RLS is on with NO policies and no client grants, so the
-- browser can never read or write it. Only server routes using the service
-- role touch it: the public submit route (after validation, a hidden bot
-- field and a per-connection rate limit) and the admin Feedback page (after an
-- is_admin check).
--
-- ip_hash is a salted SHA-256 of the connection address, used only to rate
-- limit submissions; the raw address is never stored.

create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  campaign text not null check (char_length(campaign) between 1 and 80),
  source text check (source is null or char_length(source) <= 40),
  role_show text not null check (role_show in ('exhibit', 'visit', 'both')),
  email text not null check (char_length(email) between 3 and 254),
  full_name text not null check (char_length(full_name) between 1 and 120),
  company_name text not null check (char_length(company_name) between 1 and 160),
  whatsapp text check (whatsapp is null or char_length(whatsapp) <= 40),
  linkedin text check (linkedin is null or char_length(linkedin) <= 200),
  next_show text not null check (char_length(next_show) between 1 and 120),
  wants_try boolean not null default false,
  wants_results boolean not null default false,
  consent_contact boolean not null default false,
  survey_version integer not null,
  answers jsonb not null,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists survey_responses_campaign_idx on public.survey_responses (campaign, created_at desc);
create index if not exists survey_responses_ip_idx on public.survey_responses (ip_hash, created_at desc);

alter table public.survey_responses enable row level security;

-- Explicit grants (Supabase no longer auto-grants new tables from 30 Oct 2026).
revoke all on public.survey_responses from anon, authenticated;
grant select, insert, update, delete on public.survey_responses to service_role;
