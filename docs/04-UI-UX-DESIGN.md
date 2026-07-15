# ExpoLead OS — UI/UX Design

Version 1.0 · Last updated 2026-07-15

---

## 1. Design principles

1. **Booth-first speed.** Every capture flow is fast enough to use one-handed at a busy stand. Minimal required fields, sensible defaults, no setup wizards.
2. **Calm, not busy.** Clean white surfaces, generous spacing, one accent colour. The product should feel lighter than a CRM.
3. **Glanceable.** Dashboards and reports communicate status in seconds through stat cards, coloured accents, and charts.
4. **Consistent controls.** One modern dropdown, one date picker, one field-label pattern used everywhere.
5. **Honest empty states.** Empty views invite the next action rather than showing broken or fake data.

## 2. Brand and visual language

| Token | Value |
|---|---|
| Brand gradient | `linear-gradient(115deg, #0f172a 0%, #065f46 48%, #10b981 100%)` |
| Primary accent | Emerald (`#10b981` / emerald-600 `#059669`) |
| Ink / text | Slate (`#0f172a`, `#1e293b`, `#475569`) |
| Surfaces | White cards on `#f8fafc` page background |
| Logo | Four-box mark: three white-outlined squares + one emerald-filled square (bottom-right) |
| Wordmark | "Expo" (dark/white) + "Lead" (emerald) + "OS" (muted) |
| Tagline | "Powered by Tradesoil" |
| Typography | Geist / system sans; bold tracking-tight headings |
| Icons | lucide-react, thin stroke |

Accent semantics: emerald = primary/positive, rose/red = high priority or lost, amber = warning/pricing, sky/violet = pipeline stages, slate = neutral.

## 3. Layout system

- **App shell:** fixed dark sidebar (navigation) + main content area with a top bar (global search, help, notifications, account).
- **Top bar:** search field (left), help + notifications + account (right).
- **Content:** max-width containers, card-based sections, `p-6`/`p-8` padding.
- **Mobile:** sidebar collapses to `MobileNav` with a hamburger; a splash screen shows on mobile visits; product mockups use a phone frame on the landing page.

## 4. Core components

| Component | Purpose |
|---|---|
| `Sidebar` / `MobileNav` | Primary navigation (Dashboard, Exhibitions, Connections, Opportunities, Follow-ups, Reports, Settings) |
| `PageHeader` | Consistent page title + subtitle + actions |
| `StatCard` | KPI tile with coloured left accent bar; shrinks font for long grouped values |
| `Select` | Modern portal-based dropdown (fixed positioning, never clipped) used system-wide |
| `DatePicker` | Modern calendar (portal, YYYY-MM-DD, Today/Clear) |
| `OpportunityBoard` | Drag-and-drop pipeline (HTML5 DnD) |
| `ReportsView` / `ReportChart` | Chart.js visualisations with type toggles |
| `SupplierForm` / `AddOpportunityForm` / `AddExhibitionForm` | Capture forms |
| `ContactManager` / `AddContactForm` | Contact CRUD with labelled fields |
| `NotificationsMenu` | Merged connection + opportunity follow-up alerts |
| `GlobalSearch` | Cross-entity search |
| `TrialBanner` / `LockedButton` | Trial state UI |
| `Badge` | Priority / status / classification pills |
| `useToast` | Toast notifications |
| `SplashScreen` | Mobile intro |

## 5. Interaction patterns

- **Forms:** every field has a visible label above the input (labels do not rely on placeholders, which vanish once filled). Placeholders show realistic example values.
- **Dropdowns:** the custom `Select` renders its options panel in a portal with fixed positioning so it is never clipped inside cards or scroll areas; it flips up when near the viewport bottom.
- **Pipeline:** cards are dragged between stage columns; drop updates status and records history.
- **Inline editing:** opportunity detail fields (status, priority, quantity, unit, destination, notes) save on change/blur without a separate edit mode.
- **Follow-ups:** a single "Mark done" action clears the item and updates the notification bell via a custom DOM event.
- **Segmented toggles:** report charts switch type (Bar/Line/Pie/Donut) via a small segmented control.

## 6. Key screens

- **Dashboard:** greeting, welcome card, two rows of stat cards (exhibitions, connections, opportunities, booths, due today, overdue, unvisited, pipeline volume), and three follow-up summary panels.
- **Connections:** coloured stat cards, search, filter row (exhibition/classification/priority/status/booth), CSV export, and a table with company, exhibition, booth, class, country, priority, status, follow-up.
- **Connection detail:** "Met before" card (conditional), booth/exhibition info, contacts, products, meetings, classification/status/priority editors, delete.
- **Opportunities:** stage stat cards + win rate, grouped pipeline-volume card, board view with follow-up health badges.
- **Reports:** KPI row, chart grid, conversion funnel, per-exhibition table, exhibition + time-range filters, empty state.
- **Settings:** profile card, profile details form, workspace preferences (quantity unit), profile photo with drag-to-reposition, account status.
- **Auth:** split-screen sign-in/up with an animated exhibition-stage illustration on the brand-gradient panel.

## 7. Accessibility and responsiveness

- Semantic headings and labelled inputs across forms.
- Colour is paired with text (status pills carry labels, not colour alone).
- Responsive grids collapse from multi-column to single-column on mobile; the sidebar becomes a hamburger menu.
- Tabular numbers (`tabular-nums`) for aligned figures in stat cards and tables.

## 8. Content and tone

- Sentence case throughout.
- Copy avoids em dashes and hyphen-dashes (house style); uses commas instead.
- Plain, confident, trade-professional voice. No corporate filler.

## 9. Known UI polish backlog

- Landing: founder photo, animated hero word-cycle, social-proof quote.
- Logo: align "POWERED BY TRADESOIL" under the S of OS.
- Back button on `/pricing` for logged-in users (verify).
- Documentation entry in Help is a "Soon" placeholder.
