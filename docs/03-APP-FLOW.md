# ExpoLead OS — Application Flow

Version 1.0 · Last updated 2026-07-15

---

## 1. High-level journey

```
Landing (/) ──► Sign up (/login?mode=signup) ──► Confirmation email
    │                                                   │
    │                                          click "Confirm my email"
    │                                                   ▼
    │                                     /auth/callback (exchange code, sign out)
    │                                                   │
    │                                                   ▼
    │                                     /login?confirmed=1  ──► Sign in
    │                                                             │
    └──────────────────────────────────────────────────────────►│
                                                                  ▼
                                                            /dashboard
                                                    (welcome email fires once)
```

## 2. Authentication flow (detail)

1. **Sign up** at `/login?mode=signup` with email + password.
   - `supabase.auth.signUp` with `emailRedirectTo = /auth/callback?next=/dashboard`.
   - If email confirmation is required (normal case), the UI shows "Account created. Check your email to confirm, then sign in." and switches to sign-in mode. No welcome email yet.
2. **Confirmation email** (Supabase template via Resend SMTP) contains a "Confirm my email" link to `/auth/callback`.
3. **/auth/callback** exchanges the code for a session, then immediately signs the user out and redirects to `/login?confirmed=1`.
4. **Sign in** at `/login` shows "Email confirmed. Please sign in to continue." User signs in with `signInWithPassword`, then is routed to `/dashboard`.
5. **First authenticated load** (`(app)/layout.tsx`): stamps `signup_country` from the geo header, and atomically claims `welcome_sent` to send exactly one welcome email (Resend).
6. **Password reset**: `/reset-password` requests a reset email; `/update-password` sets the new password.

Middleware guards: unauthenticated access to any non-public route redirects to `/login`; an authenticated user hitting `/login` is redirected to `/dashboard`.

## 3. Core capture flow (the booth loop)

```
Add Exhibition ──► Add Connection (supplier) ──► Add Contacts / Products / Meeting
                          │
                          ├──► set classification, priority, follow-up date
                          │
                          └──► Create Opportunity ──► move through pipeline ──► Won / Lost
```

### 3.1 Exhibitions
- `/exhibitions`: list of the user's shows with connections/visited/remaining counts, search, and "New exhibition".
- Add via `AddExhibitionForm` (manual) or by picking from the Exhibition Library.
- `/exhibitions/[id]`: detail for one show.

### 3.2 Connections (suppliers)
- `/suppliers`: table of all connections with stat cards, search, and filters (exhibition, classification, priority, status, booth), plus CSV export.
- `/suppliers/new`: create a connection (`SupplierForm`) with company, country, classification, priority, follow-up, booth details, notes.
- `/suppliers/[id]`: detail page. Shows the "Met before" card when another connection shares the company name. Manages contacts (`ContactManager`, `AddContactForm`), products (`AddProductForm`), meetings (`AddMeetingForm`), booth info, classification, status, priority, follow-up, and delete.
- `/suppliers/[id]/booth/edit`: edit booth & exhibition details.

### 3.3 Opportunities
- `/opportunities`: pipeline stat cards (Qualified, Pricing, Evaluation, Negotiating, Won, Lost, Win rate), pipeline-volume card (grouped by unit, open pipeline only), CSV export, and the drag-and-drop `OpportunityBoard`.
- Add via `AddOpportunityForm` (name, product, quantity + unit, destination market, exhibition, booth).
- Moving a card between stages updates `status` and inserts an `opportunity_status_history` row.
- `/opportunities/[id]`: detail with inline editors for status, priority, quantity, unit, destination, notes; follow-up scheduling and history.

## 4. Follow-up flow

```
Connection.follow_up_date ─┐
                           ├─► /follow-ups (unified) ──► Mark done ──► clears item
Opportunity.next_follow_up ┘                                    │
                                                                 └─► NotificationsMenu refreshes
```

- `/follow-ups` merges connection follow-up dates and opportunity next-follow-up dates into overdue / due-today / upcoming groups.
- `MarkFollowUpDone` clears a connection's follow-up date or sets an opportunity's follow-up complete, then dispatches a `expolead:followups-changed` event.
- `NotificationsMenu` (top bar) listens for that event and on open re-fetches, so the bell clears when items are done.

## 5. Reporting flow

- `/reports` loads all connections and opportunities (server), plus the workspace quantity unit.
- `ReportsView` (client) applies exhibition + time-range filters, then computes KPIs, six charts, a conversion funnel, and a per-exhibition table. Charts have type toggles (bar/line/pie/donut). Pipeline volume groups by unit and counts open pipeline only; an empty state shows when there is no data.

## 6. Trial and lock flow

```
Sign up ──► trial_ends_at = now + 14d ──► use freely
                                   │
                        ≤ 7 days left ──► TrialBanner warning
                                   │
                        expired ──► TrialBanner block + LockedButton on create actions
                                   │
                        (early_access or active subscription) ──► bypass lock
```

Admins bypass the lock entirely (both UI and `user_can_create()`).

## 7. Admin flow

- `/admin/library`: manage the platform Exhibition Library (search, pagination, CRUD). Admin-gated.
- `/admin/people`: founder cockpit listing every signup via `admin_list_signups()` RPC (email, name, company, country, confirmed status, trial dates, plan). Admin-gated.

## 8. Public / marketing flow

- `/` landing (bilingual EN/ZH) → CTAs to sign up, features, pricing, resources.
- `/features`, `/pricing`, `/about`, `/trade-shows`, `/privacy`, `/terms`.
- `/resources` hub and `/resources/[slug]` SEO articles, linked from nav and footer.

## 9. Navigation model

- Sidebar (desktop) and MobileNav: Dashboard, Exhibitions, Connections, Opportunities, Follow-ups, Reports, Settings (plus admin entries for admins).
- Top bar: global search, help menu, notifications, account menu.
