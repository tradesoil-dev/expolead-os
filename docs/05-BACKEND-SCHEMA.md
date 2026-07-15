# ExpoLead OS — Backend Schema

Version 1.0 · Last updated 2026-07-15 · Database: Supabase Postgres

---

## 1. Conventions

- All application tables live in the `public` schema.
- Every user-owned row carries `user_id uuid` referencing `auth.users(id)` and is isolated by Row Level Security on `auth.uid() = user_id`.
- `id` columns are `uuid` primary keys (default `gen_random_uuid()`), except `profiles.id` which equals `auth.users.id`.
- `created_at timestamptz default now()`.
- Migrations are applied manually in the Supabase SQL editor; committed files live in `supabase/migrations/`. The live DB can drift, so verify with `pg_policies` and `information_schema.columns` after applying.

## 2. Entity relationship overview

```
auth.users
   │ 1:1
   ▼
profiles

profiles/user
   │ 1:N
   ├── exhibitions
   ├── suppliers (Connections) ──1:N── contacts
   │        │                    ──1:N── products
   │        │                    ──1:N── meetings
   │        └── exhibition_id ──► exhibitions (nullable)
   └── opportunities ──1:N── opportunity_followups
                     └──1:N── opportunity_status_history

exhibition_library   (platform-curated, not user-owned; public read, admin write)
```

Note: `suppliers` is the connections entity (UI label "Connections"; DB name "suppliers"). `opportunities.exhibition` and `.booth` are free-text strings, not foreign keys.

## 3. Tables

### 3.1 profiles
One row per user; created on sign-up. Holds identity, workspace preferences, trial/subscription state, and admin flag.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | equals `auth.users.id` |
| full_name | text | |
| company_name | text | |
| role | text | |
| country | text | user-entered |
| linkedin_url | text | (0002) |
| about | text | (0002) |
| avatar_url | text | (0005) Supabase Storage public URL |
| avatar_position_y | integer default 50 | (0006) vertical crop offset |
| plan | text not null default 'trial' | (0007) |
| trial_ends_at | timestamptz not null default now()+14d | (0007) |
| subscription_status | text not null default 'trialing' | (0007) `trialing` / `active` / etc. |
| plan_updated_at | timestamptz | (0007) |
| stripe_customer_id | text | (0007) placeholder for payments |
| stripe_subscription_id | text | (0007) placeholder for payments |
| early_access | boolean not null default false | (0009) bypasses trial lock |
| is_admin | boolean not null default false | (0013) |
| signup_country | text | (0018) from Vercel geo header |
| welcome_sent | boolean not null default false | (0019) atomic single-send flag |
| quantity_unit | text not null default 'MT' | (0020) workspace default unit |

### 3.2 exhibitions
The shows a user attends (user-owned).

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | → auth.users |
| name | text | |
| location | text | |
| start_date | date | |
| end_date | date | |
| created_at | timestamptz | |

### 3.3 exhibition_library
Platform-curated catalogue of known shows (not user-owned). Public read to authenticated users; writes admin-only.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| location | text | |
| start_date | date | |
| end_date | date | |
| sector | text | |
| created_at | timestamptz | |

### 3.4 suppliers (Connections)
A company/person met at a show.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | → auth.users |
| exhibition_id | uuid | → exhibitions (nullable) |
| company_name | text | |
| country | text | |
| website | text | |
| interest_type | text (enum-like) | classification: supplier/trader/distributor/agent/buyer/partner/service_provider |
| is_target | boolean | prospect vs met |
| priority | text | high/medium/low |
| follow_up_status | text | new/contacted/sample_requested/quotation_requested/under_discussion/closed |
| follow_up_date | date | drives follow-up + notifications |
| categories | text[] | |
| notes | text | |
| booth_number | text | (0002) |
| hall | text | (0002) |
| stand_location | text | (0002) |
| visited | boolean not null default false | (0002) |
| visit_date | date | (0002) |
| created_at | timestamptz | |

### 3.5 contacts
People at a connection company.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | → auth.users |
| supplier_id | uuid | → suppliers (on delete cascade) |
| full_name | text | |
| position | text | |
| email | text | |
| phone | text | |
| whatsapp | text | |
| wechat | text | |
| is_primary | boolean | |
| created_at | timestamptz | |

### 3.6 products
Products associated with a connection.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| supplier_id | uuid | → suppliers |
| name | text | |
| application | text | |
| certifications | text[] | |
| created_at | timestamptz | |

### 3.7 meetings
Meeting records against a connection.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | → auth.users |
| supplier_id | uuid | → suppliers |
| exhibition_id | uuid | → exhibitions (nullable) |
| met_on | date | |
| notes | text | |
| voice_note_path | text | reserved for voice notes feature |
| created_at | timestamptz | |

### 3.8 opportunities
Business opportunities in a pipeline.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | → auth.users |
| name | text | |
| product | text | |
| quantity | text | free text (numeric part parsed for totals) |
| quantity_unit | text | (0021) nullable; null = workspace default |
| destination_market | text | |
| exhibition | text | (0002) free text, not FK |
| booth | text | (0002) free text |
| priority | text | high/medium/low |
| status | text | researching/contacted/evaluating/negotiating/won/lost |
| notes | text | |
| next_follow_up_date | date | (0002) |
| next_follow_up_note | text | (0002) |
| next_follow_up_completed | boolean not null default false | (0002) |
| created_at | timestamptz | |

Status-to-label mapping (UI): researching=Qualified, contacted=Pricing, evaluating=Evaluation, negotiating=Negotiating, won=Won, lost=Lost.

### 3.9 opportunity_followups
Follow-up log entries for an opportunity.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid not null default auth.uid() | → auth.users (cascade) |
| opportunity_id | uuid | → opportunities (cascade) |
| note | text | |
| created_at | timestamptz | |

### 3.10 opportunity_status_history
Append-only log of stage changes (written on board drag/status change).

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid not null default auth.uid() | → auth.users (cascade) |
| opportunity_id | uuid | → opportunities (cascade) |
| status | text | new stage value |
| created_at | timestamptz | |

## 4. Enumerations (application-level, stored as text)

| Enum | Values |
|---|---|
| Priority | high, medium, low |
| InterestType (classification) | supplier, trader, distributor, agent, buyer, partner, service_provider |
| FollowUpStatus | new, contacted, sample_requested, quotation_requested, under_discussion, closed |
| Opportunity status | researching, contacted, evaluating, negotiating, won, lost |
| quantity_unit (suggested) | MT, kg, units, pieces, cartons, containers |

## 5. Row Level Security

All user tables have RLS enabled. Pattern per table:

```sql
-- SELECT / UPDATE / DELETE
using (auth.uid() = user_id)

-- INSERT
with check (auth.uid() = user_id and public.user_can_create())
```

- `exhibitions`, `suppliers`, `contacts`, `opportunities`, `opportunity_followups`, `opportunity_status_history`: per-user policies as above (0008 split into per-command; 0011 restored UPDATE/DELETE using-clauses).
- `exhibition_library`: `select` allowed to authenticated (0010) and public read (0012); `insert/update/delete` admin-only via `is_admin()` (0013).
- Storage `avatars` bucket: public read; insert/update/delete restricted to the owner's path (0005).

## 6. Functions (security definer)

### is_admin() → boolean
Returns whether the current user has `profiles.is_admin = true`. Used by library write policies and admin RPCs.

### user_can_create() → boolean
The trial gate used in INSERT policies. Returns true if the user is an admin, has `subscription_status = 'active'`, or `trial_ends_at > now()` (0008, extended for admins in 0015):

```sql
create or replace function public.user_can_create()
returns boolean language sql security definer stable as $$
  select public.is_admin() or exists (
    select 1 from public.profiles
    where id = auth.uid()
      and (subscription_status = 'active' or trial_ends_at > now())
  );
$$;
```

### admin_list_signups() → table
Admin-only reporting RPC (0016–0018). Joins `auth.users` with `profiles` and returns signup rows (id, email, created_at, confirmed_at, last_sign_in_at, signup_country, full_name, company_name, trial_ends_at, subscription_status, is_admin). Internally checks `is_admin()`; execute granted to `authenticated`, revoked from `public`.

## 7. Storage

| Bucket | Access |
|---|---|
| avatars | Public read. Authenticated users may upload/update/delete only their own object path `{user_id}/avatar.*`. |

## 8. Auth (Supabase-managed)

- `auth.users` is the identity source of truth. `profiles.id` mirrors it 1:1.
- Email confirmation, magic link, and password reset are Supabase Auth flows; email delivery is via custom SMTP → Resend.
- Country is stamped to `profiles.signup_country` on first authenticated app load from the `x-vercel-ip-country` header.

## 9. Migration history (summary)

| File | Purpose |
|---|---|
| 0002 | schema alignment: opportunity follow-up fields, `opportunity_followups`, opportunities exhibition/booth, profile linkedin/about, supplier booth fields |
| 0003 | `opportunity_status_history` |
| 0005 | avatar upload (column + storage policies) |
| 0006 | avatar position |
| 0007 | trial system columns on profiles |
| 0008 | trial-aware RLS + `user_can_create()` |
| 0009 | `early_access` flag |
| 0010 | `exhibition_library` table + read policy |
| 0011 | restore UPDATE/DELETE RLS using-clauses |
| 0012 | exhibition library public read |
| 0013 | `is_admin` + library admin write policies |
| 0014 | remove exhibition auto-seed |
| 0015 | admins bypass `user_can_create()` |
| 0016–0017 | `admin_list_signups()` (+ last_sign_in_at) |
| 0018 | `signup_country` + admin_list_signups with country |
| 0019 | `welcome_sent` flag |
| 0020 | `profiles.quantity_unit` (workspace default) |
| 0021 | `opportunities.quantity_unit` (per-opportunity) |

Base tables (`profiles`, `exhibitions`, `suppliers`, `contacts`, `products`, `meetings`, `opportunities`) predate migration 0002 (initial Supabase setup / 0001).

## 10. Data integrity notes

- Cascade deletes: contacts, meetings, opportunity_followups, opportunity_status_history cascade from their parent.
- `opportunities.exhibition` is denormalised free text; reporting groups by that string. Connections link to exhibitions by FK (`exhibition_id`).
- `quantity` is free text; volume aggregation parses the leading number and groups by `quantity_unit` (falling back to the workspace default).
