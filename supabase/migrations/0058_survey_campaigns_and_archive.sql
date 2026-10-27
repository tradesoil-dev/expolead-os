-- Survey links managed from Admin > Feedback, and an anonymised survey archive.
--
-- 1. survey_campaigns: one row per public post-show survey (the slug is the
--    URL, e.g. /survey/gulfood-2027). Admin creates, opens and closes them;
--    the public survey page reads them on the server. Before this table the
--    list lived in code (lib/survey-v2.ts CAMPAIGNS), which stays as a fallback.
-- 2. survey_archive: anonymised survey answers (no name, email, company,
--    WhatsApp, LinkedIn or IP data) that the admin downloads before deleting
--    answers older than 24 months (Privacy Notice section 9) and can upload
--    again later to keep learning from them. archive_key stops the same row
--    being uploaded twice.
--
-- Both are server-only: RLS on, no policies, service_role grants only, so the
-- browser can never read or write them. Safe to re-run.

create table if not exists public.survey_campaigns (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 80),
  exhibition text not null check (char_length(exhibition) between 1 and 80),
  label text not null unique check (char_length(label) between 1 and 80),
  open boolean not null default true,
  has_assets boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.survey_campaigns enable row level security;
revoke all on public.survey_campaigns from anon, authenticated;
grant select, insert, update, delete on public.survey_campaigns to service_role;

-- The survey that already runs from code (its share images exist).
insert into public.survey_campaigns (slug, exhibition, label, open, has_assets)
values ('sial-paris-2026', 'SIAL Paris', 'SIAL Paris 2026', true, true)
on conflict (slug) do nothing;

create table if not exists public.survey_archive (
  id uuid primary key default gen_random_uuid(),
  archive_key text not null unique check (char_length(archive_key) = 64),
  campaign text not null check (char_length(campaign) between 1 and 80),
  source text check (source is null or char_length(source) <= 40),
  role_show text not null check (role_show in ('exhibit', 'visit', 'both')),
  answered_month text not null check (answered_month ~ '^[0-9]{4}-[0-9]{2}$'),
  answers jsonb not null,
  uploaded_at timestamptz not null default now()
);

alter table public.survey_archive enable row level security;
revoke all on public.survey_archive from anon, authenticated;
grant select, insert, update, delete on public.survey_archive to service_role;
