-- Restore missing UPDATE / DELETE RLS policies.
-- On the live database, migration 0008 only left SELECT + INSERT policies on the
-- core tables — the UPDATE and DELETE policies were absent, so RLS silently denied
-- every update/delete (0 rows, no error). This re-creates them. Idempotent.

drop policy if exists "exhibitions update" on exhibitions;
create policy "exhibitions update" on exhibitions for update using (auth.uid() = user_id);
drop policy if exists "exhibitions delete" on exhibitions;
create policy "exhibitions delete" on exhibitions for delete using (auth.uid() = user_id);

drop policy if exists "suppliers update" on suppliers;
create policy "suppliers update" on suppliers for update using (auth.uid() = user_id);
drop policy if exists "suppliers delete" on suppliers;
create policy "suppliers delete" on suppliers for delete using (auth.uid() = user_id);

drop policy if exists "contacts update" on contacts;
create policy "contacts update" on contacts for update using (auth.uid() = user_id);
drop policy if exists "contacts delete" on contacts;
create policy "contacts delete" on contacts for delete using (auth.uid() = user_id);

drop policy if exists "opportunities update" on opportunities;
create policy "opportunities update" on opportunities for update using (auth.uid() = user_id);
drop policy if exists "opportunities delete" on opportunities;
create policy "opportunities delete" on opportunities for delete using (auth.uid() = user_id);

drop policy if exists "followups update" on opportunity_followups;
create policy "followups update" on opportunity_followups for update using (auth.uid() = user_id);
drop policy if exists "followups delete" on opportunity_followups;
create policy "followups delete" on opportunity_followups for delete using (auth.uid() = user_id);
