# ExpoLead OS

Turn exhibition conversations into business opportunities.

ExpoLead OS helps exhibition attendees, buyers, procurement teams, sourcing professionals, business development managers, sales teams, and exhibitors capture supplier interactions, manage follow-ups, track opportunities, and convert trade-show conversations into measurable business outcomes.

**Designed for any professional attending exhibitions to generate business opportunities.**

Exhibition → Supplier → Opportunity → Follow-up → Revenue

Built with **Next.js 15 (App Router)**, **Tailwind CSS**, and **Supabase**.

**Current Status:** Prototype V1 (Pilot Ready)

## Getting started

```bash
npm install
cp .env.local.example .env.local   # paste your Supabase URL + key
npm run dev                          # http://localhost:3000
```

## Connect Supabase

1. Create a project at supabase.com.
2. Connect dialog (or Settings → API Keys): copy the **Project URL** and the
   **publishable key** (`sb_publishable_…`; the legacy `anon` key also works).
3. Put them in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx
   ```
4. SQL Editor → paste and run `supabase/schema.sql`.
5. Restart `npm run dev`, open `/login`, create an account.

## What's built (Phase 1)

- Email/password auth with route guards
- Dashboard: suppliers met, targets saved, high priority, follow-ups due
- Suppliers table with search + filters (type, priority, status) and CSV export
- Add Supplier form: company, classification, primary contact, notes
- Supplier (exhibitor) profile: overview, **editable classification (7 types)**,
  inline status updates, **meetings log**, contacts, notes
- Exhibitions: create shows, companies and meetings link to them
- Data model: one company entity with `is_target` (pre-show vs. met),
  plus `contacts`; `products` / `meetings` / `documents` tables exist for later

## Architecture

One company record (`suppliers`) carries an `is_target` flag — a saved
pre-show target and a met-at-booth supplier are the same entity, no duplicate
exhibitor table. Everything is scoped by `user_id` with row-level security;
adding `org_id` for v2 teams is additive.

## Roadmap

- [x] Phase 0 — scaffold, auth
- [x] Phase 1 — core capture & organization (this build)
- [ ] Phase 2 — file uploads (cards, catalogs, photos), meeting log, PWA capture
- [ ] Phase 3 — AI: business-card scanner, then catalog parsing
- [ ] Phase 4 — structured search / matching
- [ ] v2 — multi-user / organizations
