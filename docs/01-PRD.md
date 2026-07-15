# ExpoLead OS — Product Requirements Document (PRD)

Version 1.0 · Last updated 2026-07-15 · Owner: Gladwin Gerald, Tradesoil International

---

## 1. Overview

ExpoLead OS is a lead management system built specifically for exhibitions and trade shows. Companies that exhibit at or attend trade shows meet dozens of buyers, suppliers, and partners over a few days, then lose most of those relationships in business cards, notebooks, and inboxes. ExpoLead OS captures every booth conversation, tracks it through a pipeline, reminds the user to follow up on time, and remembers the same companies year after year.

It is deliberately not a generic CRM. It is shaped around the exhibition cycle: capture on the floor, follow up after, and meet the same companies again at next year's show.

## 2. Problem statement

- Exhibitions are one of the largest line items in a trade company's marketing budget, yet most leads captured there are never properly followed up.
- Booth conversations decay fast. Within two weeks a buyer has met many suppliers and forgotten most names.
- Follow-up depends on individual memory, so the best leads slip through the cracks.
- Institutional memory walks out the door when a salesperson leaves.
- Generic CRMs (HubSpot, Pipedrive) are built for software sales teams, need setup and training, and have no concept of exhibitions repeating every year.

## 3. Vision

A simple, fast, self-serve tool that any product trader can use one-handed at a busy stand, priced for real SME businesses, that turns exhibition conversations into revenue and compounds value year over year.

## 4. Target users

| Persona | Description | Primary need |
|---|---|---|
| Exhibitor | A company with a stand at a show | Capture every visitor and turn the show into pipeline |
| Sourcing team / buyer | Walks the halls to find suppliers | Track suppliers, samples, and quotations in one place |
| Solo trader / SME exporter | Food, chemicals, apparel, machinery, etc. | Never lose a lead after the show ends |
| Diversified trader / agent | Works multiple sectors and shows | One workspace across FMCG and raw-material shows |

Scope note: the product targets **product-based** exhibition trade (goods sold by quantity). It is not aimed at services trade (tourism, hospitality, consulting).

## 5. Goals and non-goals

### Goals
- Fast capture of connections at the booth.
- A visual opportunity pipeline from qualified interest to won.
- Reliable follow-up reminders across connections and opportunities.
- A rich, glanceable Reports view to judge each exhibition's performance.
- Year-over-year memory of companies met ("met before").
- Self-serve onboarding: trial, then paid plans.

### Non-goals (explicitly excluded to protect positioning)
- Generic CRM breadth (arbitrary custom objects, marketing automation suites).
- Live microsites, digital asset libraries, gamification, kiosk mode.
- Deep CRM integrations (CSV export covers handoff).
- A full packing/loadability calculator (jars → boxes → pallets → container). That is quotation/ERP tooling, not lead management.

## 6. Core features (current state)

### 6.1 Connections (data model name: suppliers)
Every company/person met at a show. Captures company name, country, website, classification (supplier, trader, distributor, agent, buyer, partner, service provider), priority, follow-up status, follow-up date, booth details (hall, booth number, stand location, visited flag, visit date), categories, notes. Supports multiple contacts, products, and meeting records per connection.

- Full-text-ish search and filters (exhibition, classification, priority, status, booth).
- Coloured stat cards (total, target, follow-ups, countries).
- CSV export.
- "Met before" card: when a connection shares a company name with another record, the system surfaces the prior meetings (year-over-year memory).

### 6.2 Opportunities
Business opportunities tracked through a pipeline. Fields: name, product, quantity, quantity unit, destination market, exhibition, booth, priority, status, notes, next follow-up. Statuses map to a pipeline: Qualified → Pricing → Evaluation → Negotiating → Won / Lost.

- Drag-and-drop board to move deals between stages (writes status history).
- Per-opportunity quantity unit (supports multi-sector traders).
- Follow-up log and status history per opportunity.
- CSV export (includes a Unit column).

### 6.3 Exhibitions
The shows a user attends. Users create their own exhibitions or add from a platform-curated Exhibition Library. Each show tracks connections, visited count, and remaining.

### 6.4 Follow-ups
A unified view of everything due, built from both connection follow-up dates and opportunity next-follow-up dates. Marking done clears the item and updates notifications.

### 6.5 Reports
A glanceable performance dashboard: KPIs (connections, active opportunities, pipeline volume, win rate, follow-up rate, exhibitions) plus charts (pipeline by stage, connections by type, leads by exhibition, connections over time, connections by country, opportunities by market), a conversion funnel (connections → opportunities → won), and a per-exhibition performance table. Pipeline volume groups by unit for multi-sector data and counts open pipeline only.

### 6.6 Dashboard
The command centre: greeting, welcome/getting-started card, stat cards (active exhibitions, connections captured, active opportunities, visited booths, due today, overdue, unvisited booths, pipeline volume), and follow-up summaries (overdue, due today, upcoming).

### 6.7 Notifications, global search, help
- Notifications merge connection and opportunity follow-ups, clearing when marked done.
- Global search across connections, opportunities, and exhibitions.
- Help menu (getting started, email support, view plans, documentation placeholder).

### 6.8 Settings / profile
Name, company, role, country, LinkedIn, about, avatar (with reposition), and Workspace Preferences (quantity unit).

### 6.9 Trial and plans
14-day free trial (no card required). Soft lock on expiry: a banner warns at 7 days and blocks record creation after expiry. Plans page shows Solo ($19/mo) and Team ($49/mo, waitlisted). Early-access flag and admin bypass the lock.

### 6.10 Admin
Admin-only pages: Exhibition Library manager (search, pagination, CRUD) and a "People" founder cockpit (signups, confirmed vs not, company vs personal email, country, trial dates).

### 6.11 Public site
Landing page (bilingual EN/ZH), features page, pricing, about, resources hub (SEO articles), trade-shows directory, privacy, terms.

### 6.12 Email
Confirmation email (Supabase, custom SMTP via Resend), single welcome email fired after first authenticated load post-confirmation, and a trial-emails cron endpoint.

## 7. Key product principles

1. Booth-first: fast enough to use one-handed at a busy stand. If it needs a manual, it does not belong.
2. Product and quantity: built for physical trade where the deal is about volume, not a sales script.
3. Your data stays yours: private by default, exportable anytime, no lock-in.
4. Not a generic CRM: designed for the exhibition cycle.
5. Quantity over price at capture: note what and how much a buyer wants, do not haggle price at the booth.

## 8. Success metrics

- Activation: % of signups that add at least one connection and one opportunity.
- Retention: workspaces still active across two or more exhibition cycles (the compounding-data moat).
- Conversion: trial → paid.
- Engagement: follow-up completion rate; reports viewed.
- Traction (founder/investor): signups, % company-domain emails, weekly/monthly new signups.

## 9. Pricing

| Plan | Price | For | Includes |
|---|---|---|---|
| Solo | $19/month (or $190/yr) | Solo buyers, traders, sourcing managers | Unlimited exhibitions, connections, opportunities; follow-up tracking; exhibition library; reports; CSV export; email support |
| Team | $49/month (or $490/yr) | Trading companies, sourcing teams | Everything in Solo, up to 5 users, shared workspace, team reporting (waitlisted) |

Stance: full price, no discounts. Early customers get access and roadmap influence, not a cheaper bill.

## 10. Roadmap (high level)

Near-term: finish sales collateral (deck), founding-customer pilots.
Post-pilot: ROI money layer (optional deal value + exhibition cost → value ÷ cost per show), Stripe payments (card-on-file), email follow-up automation, business-card scanning, exhibition editions (year-over-year linkage). The living roadmap is maintained separately as the single source of truth.

## 11. Open questions / decisions pending

- Whether to gate CSV export behind payment (anti trial-cycling). Current decision: keep open; defend cycling with card-on-file when Stripe lands.
- Currency and cost model for true financial ROI (post-demo).
- Team/multi-tenancy timing (gated on demand).
