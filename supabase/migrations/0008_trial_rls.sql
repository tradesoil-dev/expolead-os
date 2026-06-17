-- V1.2 Phase C — Trial-aware RLS
-- Splits the existing "for all" policies into separate SELECT/INSERT/UPDATE/DELETE
-- INSERT is blocked when trial has expired and no active subscription.

-- Helper: returns true if user is allowed to create new records
create or replace function public.user_can_create()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and (
      subscription_status = 'active'
      or trial_ends_at > now()
    )
  );
$$;

-- ─── exhibitions ────────────────────────────────────────────────────────────

drop policy if exists "own exhibitions" on exhibitions;

create policy "exhibitions select" on exhibitions for select
  using (auth.uid() = user_id);

create policy "exhibitions insert" on exhibitions for insert
  with check (auth.uid() = user_id and public.user_can_create());

create policy "exhibitions update" on exhibitions for update
  using (auth.uid() = user_id);

create policy "exhibitions delete" on exhibitions for delete
  using (auth.uid() = user_id);

-- ─── suppliers ──────────────────────────────────────────────────────────────

drop policy if exists "own suppliers" on suppliers;

create policy "suppliers select" on suppliers for select
  using (auth.uid() = user_id);

create policy "suppliers insert" on suppliers for insert
  with check (auth.uid() = user_id and public.user_can_create());

create policy "suppliers update" on suppliers for update
  using (auth.uid() = user_id);

create policy "suppliers delete" on suppliers for delete
  using (auth.uid() = user_id);

-- ─── contacts ───────────────────────────────────────────────────────────────

drop policy if exists "own contacts" on contacts;

create policy "contacts select" on contacts for select
  using (auth.uid() = user_id);

create policy "contacts insert" on contacts for insert
  with check (auth.uid() = user_id and public.user_can_create());

create policy "contacts update" on contacts for update
  using (auth.uid() = user_id);

create policy "contacts delete" on contacts for delete
  using (auth.uid() = user_id);

-- ─── opportunities ──────────────────────────────────────────────────────────

drop policy if exists "own opportunities" on opportunities;

create policy "opportunities select" on opportunities for select
  using (auth.uid() = user_id);

create policy "opportunities insert" on opportunities for insert
  with check (auth.uid() = user_id and public.user_can_create());

create policy "opportunities update" on opportunities for update
  using (auth.uid() = user_id);

create policy "opportunities delete" on opportunities for delete
  using (auth.uid() = user_id);

-- ─── opportunity_followups ──────────────────────────────────────────────────

drop policy if exists "own opportunity_followups" on opportunity_followups;

create policy "followups select" on opportunity_followups for select
  using (auth.uid() = user_id);

create policy "followups insert" on opportunity_followups for insert
  with check (auth.uid() = user_id and public.user_can_create());

create policy "followups update" on opportunity_followups for update
  using (auth.uid() = user_id);

create policy "followups delete" on opportunity_followups for delete
  using (auth.uid() = user_id);
