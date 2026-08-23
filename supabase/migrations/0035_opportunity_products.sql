-- Product line items for an opportunity: one order (opportunity) can carry
-- several products, each with its own quantity and unit. The opportunity keeps
-- a single total deal value; volume is the sum of these lines.
create table if not exists opportunity_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  product text not null,
  quantity numeric,
  quantity_unit text,
  created_at timestamptz not null default now()
);

create index if not exists opportunity_products_opportunity_idx
  on opportunity_products(opportunity_id);

alter table opportunity_products enable row level security;

drop policy if exists "own opportunity_products" on opportunity_products;
create policy "own opportunity_products" on opportunity_products for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Backfill: turn each existing opportunity's single product into one line, so
-- current data shows up under the new line-items model. Idempotent.
insert into opportunity_products (user_id, opportunity_id, product, quantity, quantity_unit)
select user_id, id, product,
  nullif(regexp_replace(coalesce(quantity::text, ''), '[^0-9.]', '', 'g'), '')::numeric,
  quantity_unit
from opportunities
where coalesce(product, '') <> ''
  and not exists (select 1 from opportunity_products p where p.opportunity_id = opportunities.id);
