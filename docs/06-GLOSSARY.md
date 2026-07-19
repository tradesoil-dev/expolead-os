# ExpoLead OS — Plain English Glossary

For Gladwin and Gayan. Every term that comes up in build conversations, explained without jargon, with the ExpoLead example alongside it.

---

## The ones that come up most

**RLS — Row Level Security**
A rule living inside the database itself that decides which rows a person is allowed to see or change. Not a rule in the app, a rule in the database.

Why it matters: app rules can be walked around by anyone who talks to the database directly instead of going through your website. Database rules cannot. This is why your users can never see each other's connections, and why the trial limits are enforced here rather than in the screen.

*ExpoLead example:* the rule `auth.uid() = user_id` means "you may only touch rows where the owner is you." Every table has it.

**Caps / Limits**
A ceiling on how many of something an account may create.

*ExpoLead example:* a trial account gets 1 exhibition, 25 connections, 25 opportunities. Paid accounts have none.

**OG — Open Graph**
The little preview card that appears when you paste a link into WhatsApp, LinkedIn or Facebook: the image, the headline, the one-line description. "OG image" and "OG description" are the pieces of that card. You control them; the social network just displays what you set.

*ExpoLead example:* `public/og.png` is the picture people see when you share expolead.tradesoil.com.

**Migration**
A numbered file of database instructions, applied in order, that changes the shape of the database — adding a column, adding a rule, adding a table.

Why they are numbered: the database must be changed in the same sequence everywhere, or two copies drift apart. Yours live in `supabase/migrations/`.

*Important for you:* writing the file does not change anything. It only takes effect when you paste it into the Supabase SQL Editor and run it. This is the step that has caught us before.

**Trial soft lock**
Access continues after the trial ends, but creating new things stops. The opposite of a hard lock, which would shut the account entirely.

*ExpoLead example:* after day 14 the user still logs in, reads and edits everything they captured. They just cannot add anything new.

---

## Database words

**Supabase** — the company hosting your database, your logins and your file storage. Think of it as the engine room behind the website.

**Postgres / PostgreSQL** — the actual database software Supabase runs. When you see an error starting with a code like `42501`, that is Postgres talking.

**Table** — a spreadsheet inside the database. You have `exhibitions`, `suppliers`, `opportunities`, `profiles`, `contacts`.

**Row** — one line in that spreadsheet. One connection, one opportunity.

**Column / Field** — one property on every row. `company_name`, `country`, `quantity_unit`.

**Schema** — the overall design: which tables exist, which columns each has, how they relate.

**Query** — a question asked of the database. "Give me every connection belonging to this user."

**INSERT / SELECT / UPDATE / DELETE** — the four things you can do to data: create, read, change, remove. Your trial rules block INSERT only, which is exactly why reading and editing survive after day 14.

**UUID** — a long unique code like `a3f9c2e1-...` used as an ID instead of 1, 2, 3. Impossible to guess, which matters for security.

**Trigger** — an instruction that fires automatically when something happens. *Example:* when a new user signs up, a trigger creates their profile and sets their trial end date 14 days out.

**Security definer** — a function permitted to look at data the calling user normally could not, in a tightly controlled way. Used for counting a user's rows to check a limit.

**`auth.uid()`** — database shorthand for "the ID of whoever is logged in right now."

---

## Website and app words

**Next.js** — the framework ExpoLead OS is built with. It handles pages, navigation and rendering.

**React** — the library that draws the interface and updates it when data changes.

**TypeScript** — JavaScript with type checking, which catches mistakes before users see them.

**Tailwind** — the styling system. Those `rounded-full px-4 py-2` strings in the code are Tailwind describing shape, spacing and colour.

**Component** — a reusable piece of interface. `PricingPlans` is the pricing table; it appears wherever it is called.

**Server component / client component** — server components are built on the server and arrive as finished HTML. Client components run in the visitor's browser and can react to clicks. Things needing interactivity must be client components, marked `"use client"`.

**Props** — the values handed to a component. `canExport={false}` tells the export button to show its locked state.

**Vercel** — the company hosting the website. Push code to GitHub and Vercel publishes it within a minute or two.

**Deploy** — publishing a new version to the live site.

**Build** — the compile step that turns source code into what actually runs. A failed build means nothing gets published, which is a safety net.

**Cache** — a saved copy kept to make things fast. Why you sometimes see an old version after a change; a hard refresh clears it.

**Viewport** — the visible area of the screen. Browser zoom shrinks it, which is why zooming to 200% can trigger the mobile layout.

**Breakpoint** — the width at which the layout switches between phone, tablet and desktop arrangements.

**Responsive** — a layout that adapts to screen size instead of having a separate mobile site.

**Sticky** — an element that stays put while the rest scrolls, like your top bar.

---

## Data and process words

**CSV** — Comma Separated Values. A plain spreadsheet file any system can open. Your export produces one; on ExpoLead it is a paid feature.

**API** — the doorway one system uses to talk to another, without a human clicking anything.

**Endpoint** — one specific door in that API. `/api/cron/trial-emails` is the door that sends trial reminder emails.

**Cron / Cron job** — a task that runs automatically on a schedule. *Example:* the daily check for trials ending in 7 days, 1 day, or already ended.

**Webhook** — the reverse of an API call. Another system knocks on your door when something happens. Stripe will use one to tell you a payment succeeded.

**Environment variable** — a secret or setting kept outside the code, like your Resend email key. Never committed to GitHub.

**Repo / Repository** — the folder holding all the code and its history, on GitHub.

**Commit** — one saved change with a description. Your history is a list of these.

**Branch** — a parallel copy for working on something without disturbing the live version.

**Push / Pull** — sending your commits up to GitHub, or bringing others' down.

---

## Product and business words

**SaaS** — Software as a Service. Software rented monthly or yearly rather than bought once. ExpoLead OS is one.

**MVP** — Minimum Viable Product. The smallest version worth putting in front of a real user.

**Churn** — the rate at which paying customers leave.

**Retention** — the opposite, customers staying. Your year-over-year exhibition history is a retention feature: leaving means losing accumulated data.

**Conversion** — the share of visitors who take the action you want, such as signing up.

**Anchor** — a reference price that makes another price feel reasonable. Naming a $6,000 competitor makes $348 feel small.

**Gate / Gating** — requiring payment before a feature unlocks. CSV export is gated.

**Onboarding** — a new user's first few minutes, from signup to first real value.

**Pilot** — an early customer using the product for real while you watch and learn, usually with hand-holding.

**Beachhead** — the narrow first market you win before widening. Yours is Sri Lankan tea and food exporters.

**GTM — Go To Market** — the plan for reaching customers.

**ICP — Ideal Customer Profile** — a precise description of who the product is for. Yours: product-based exporters and traders attending international exhibitions.

**Positioning** — what the product is, who it is for, and why it beats the alternative, in a sentence.

**Social proof** — evidence others already trust you: testimonials, logos, case studies. Yours is empty until pilots give real quotes. Never invent it.

**Freemium** — a permanently free tier alongside paid ones. Different from a time-limited trial, which is what you run.

**SEO — Search Engine Optimisation** — making pages findable on Google. Your `/resources` articles exist for this.

**Sitemap** — a file listing your pages so search engines can find them all.

**Canonical URL** — when the same page is reachable by several addresses, this declares the official one, so Google does not treat them as duplicates.

**Schema markup / JSON-LD** — hidden structured notes on a page telling Google "this is an article, published on this date, by this author."

---

## Security words

**Authentication** — proving who you are. Logging in.

**Authorisation** — what you are allowed to do once inside. RLS is authorisation.

**TLS / HTTPS** — the encryption protecting data travelling between browser and server. The padlock in the address bar.

**Encryption at rest** — data stored in scrambled form, so a stolen hard drive yields nothing readable.

**Service role key** — a master key with full database access, bypassing all RLS. Lives only on servers, never in a browser, never in GitHub.

**Anon key** — the public key the browser uses. Safe to expose because RLS still governs what it can reach.

**Least privilege** — give every part of the system the minimum access it needs.

---

## Things people say that sound worse than they are

**"It's not enforced"** — the rule is written on the website but no code checks it. A promise without a lock.

**"Drift"** — two things that should match no longer do. Usually the migration files and the live database, when a file was written but never run.

**"Idempotent"** — safe to run more than once. Running it twice does no harm.

**"Soft lock" vs "hard lock"** — restrict some actions, versus block everything.

**"Friction, not a vault"** — a barrier that stops nearly everyone but is not mathematically unbreakable. Removing the export button stops normal users; a determined developer could still copy data from their own screen.

**"Regression"** — something that used to work and now does not.

**"Technical debt"** — a shortcut taken earlier that will cost time later.

**"Refactor"** — reorganising code without changing what it does.

**"Edge case"** — a rare situation the normal path did not consider.

---

*Ask about anything missing here and it gets added.*
