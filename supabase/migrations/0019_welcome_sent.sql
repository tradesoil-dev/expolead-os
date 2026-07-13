-- Track whether the trial welcome email has been sent, so it fires exactly
-- once — after the user confirms their email and first enters the app —
-- instead of at signup (which double-sent alongside the confirmation email).
-- Run in Supabase SQL editor.

alter table public.profiles add column if not exists welcome_sent boolean not null default false;
