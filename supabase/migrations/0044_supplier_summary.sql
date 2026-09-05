-- A dedicated Summary field on a connection, separate from Notes. AI summaries
-- of recorded conversations are appended here (with a dated header), while
-- typed notes and saved transcripts stay in notes.

alter table public.suppliers add column if not exists summary text;
