# ExpoLead OS — Technical Requirements Document (TRD)

Version 1.0 · Last updated 2026-07-15

---

## 1. Architecture overview

ExpoLead OS is a single Next.js (App Router) application deployed on Vercel, backed by Supabase for the database, authentication, and file storage. The browser talks to Supabase directly (via the anon key and Row Level Security) for most reads and writes, and to Next.js server components and route handlers for server-side work (auth callback, welcome email, cron, admin RPCs).

```
Browser (React 19, Next.js client components)
   │
   ├── Supabase JS client (anon key) ──► Supabase Postgres (RLS-enforced)
   │                                     Supabase Auth
   │                                     Supabase Storage (avatars)
   │
   └── Next.js server (App Router) ────► Supabase server client (SSR cookies)
        route handlers / RSC             Resend (transactional email)
```

## 2. Technology stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS; Geist font; lucide-react icons |
| Charts | Chart.js (via canvas refs) |
| Database | Supabase Postgres |
| Auth | Supabase Auth (email/password, email confirmation via PKCE) |
| Storage | Supabase Storage (avatars bucket) |
| Transactional email | Resend (welcome email); Supabase Auth email via custom SMTP pointed at Resend |
| Hosting | Vercel |
| Analytics | Vercel Web Analytics |
| Doc/asset tooling (dev) | docx, mammoth, puppeteer, sharp |

## 3. Application structure

```
app/
  (app)/                 protected app group (requires auth)
    layout.tsx           sidebar + top bar; stamps country; sends welcome email once
    dashboard/           command centre
    exhibitions/         list + [id] detail
    suppliers/           Connections: list, new, [id] detail, [id]/booth/edit
    opportunities/       list (board) + [id] detail
    follow-ups/          unified follow-up view
    reports/             analytics
    profile/             settings
    getting-started/     onboarding help
    admin/library/       exhibition library manager (admin)
    admin/people/        founder cockpit (admin)
  auth/callback/         PKCE code exchange for email confirmation
  api/send-welcome/      welcome email endpoint
  api/cron/trial-emails/ scheduled trial emails
  login, reset-password, update-password   auth screens
  (marketing)            /, features, pricing, about, resources, trade-shows, privacy, terms
lib/
  supabase/{client,server,middleware,config}.ts
  data.ts                server-side data access helpers
  trial.ts               trial status computation
  types.ts               domain types and enums
  quantity-unit.ts       server getter for workspace unit
  quantity-units.ts      client-safe unit constants + grouped-volume helper
  welcome-email.ts       Resend welcome email
  articles.ts            resources content
components/              ~45 UI components (see UI/UX doc)
supabase/migrations/     SQL migrations (applied manually in Supabase)
```

## 4. Authentication and session

- Supabase Auth with email/password.
- Sign-up sends a confirmation email with `emailRedirectTo` pointing at `/auth/callback?next=/dashboard`.
- `/auth/callback` exchanges the one-time code for a session (`exchangeCodeForSession`), then signs the user out and redirects to `/login?confirmed=1` so they log in explicitly.
- Sessions are cookie-based (Supabase SSR). `lib/supabase/middleware.ts` refreshes the session on each request and enforces route protection.
- Middleware `publicRoutes` allow-list covers marketing, auth, and the resources tree; everything else requires a user.
- Password reset via `/reset-password` and `/update-password`.

## 5. Authorization (Row Level Security)

All user data tables enforce RLS keyed on `auth.uid() = user_id`:

- SELECT / UPDATE / DELETE: `auth.uid() = user_id`.
- INSERT: additionally gated by `public.user_can_create()`, which returns true if the user is an admin, has an active subscription, or is still within trial. This is the trial soft-lock at the database level.
- `exhibition_library` is world-readable to authenticated users; writes are admin-only via `public.is_admin()`.
- Security-definer functions: `is_admin()`, `user_can_create()`, `admin_list_signups()`. The last is granted only to authenticated users and internally checks `is_admin()`.

## 6. Trial and plan enforcement

- `profiles` carries `plan`, `trial_ends_at` (default now + 14 days), `subscription_status` (default `trialing`), `early_access`, and Stripe id placeholders.
- `lib/trial.ts` computes `TrialStatus` (expired, warning ≤ 7 days, days left). Active subscription or early access bypasses the lock.
- UI enforcement: `TrialBanner` warns/blocks; create buttons render as `LockedButton` when expired.
- DB enforcement: `user_can_create()` blocks inserts after expiry (defence in depth).

## 7. Email

- Confirmation, magic-link, and reset emails are Supabase-Auth-managed templates, delivered through custom SMTP configured in Supabase to point at Resend (`smtp.resend.com`, port 465). This avoids Supabase's built-in email rate limits.
- The welcome email is sent from the app once per user: `app/(app)/layout.tsx` performs an atomic conditional update on `profiles.welcome_sent` (false → true) and only the request that claims the flag calls `sendWelcomeEmail` (Resend). This prevents duplicate sends.
- `app/api/cron/trial-emails/route.ts` is a scheduled endpoint for trial lifecycle emails.

## 8. Data access patterns

- Client components use the Supabase browser client for interactive reads/writes (forms, board drag-and-drop, inline editors), relying on RLS for isolation.
- Server components and `lib/data.ts` use the Supabase server client for initial page data (dashboard, reports, detail pages).
- Aggregations (pipeline volume, KPIs, per-exhibition rows) are computed in the app layer from fetched rows, not in SQL.

## 9. File storage

- Supabase Storage `avatars` bucket. Public read; authenticated users may upload/update/delete only their own path (`{user_id}/avatar.*`). Reposition offset stored in `profiles.avatar_position_y`.

## 10. Environment and configuration

- Supabase URL and anon key (public), plus a service-role/secret usage only on the server where required.
- `RESEND_API_KEY` for the welcome email.
- `x-vercel-ip-country` header used to stamp `profiles.signup_country` on first authenticated load.
- Migrations are applied manually in the Supabase SQL editor; committed SQL in `supabase/migrations/` is the source of record but the live DB can drift, so verify `pg_policies` and columns after applying.

## 11. Deployment and CI

- Hosted on Vercel, auto-deploy from the `main` branch of the GitHub repo (`tradesoil-dev/expolead-os`).
- Constraint: the git commit author email must match a Vercel team member for private-repo deploys to run. Commits are authored as `gladwinmd@tradesoil.com`.
- Custom domain `expolead.tradesoil.com` via CNAME to Vercel.
- Build is a standard `next build`; several public/article pages are statically prerendered (SSG), app pages are dynamic (server-rendered on demand).

## 12. Performance and scalability notes

- Reads are per-user and small; RLS-scoped queries keep result sets bounded.
- Charts render client-side from already-fetched data.
- Current scale target: individual and small-team workspaces. Multi-tenant/team features are deferred until demand.

## 13. Security considerations

- RLS is the primary isolation boundary; every user table is per-user.
- Admin capability is a single boolean plus security-definer functions; no elevated keys in the client.
- No secrets in the repo; keys live in Vercel and Supabase.
- Credential handling (sign-in, payment) is never automated by tooling; users authenticate themselves.

## 14. Known technical debt

- Live DB drifts from committed migrations (manual apply); needs periodic reconciliation.
- `quantity` on opportunities is free text; numeric aggregation uses `parseFloat`, so non-numeric entries are ignored in volume totals.
- Landing page is largely a single client component; SSR refactor is a low-priority cleanup.
- Migration numbering starts at 0002 (base schema predates the committed set).
