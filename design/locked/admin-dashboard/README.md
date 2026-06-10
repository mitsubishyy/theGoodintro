# Admin Dashboard — LOCKED 2026-06-09

Originally locked early in the design cycle (pre-wordmark, pre-per-portal-palette).
Re-locked 2026-06-09 after a five-upgrade pass that applied: per-portal admin
emerald sidebar palette, brand logo lockup (placeholder mark + Fraunces wordmark
with The/Good/Intro colour split, with "Good" lifted to a dark-bg sage-mint
variant), photo-primary avatar rule, locked status pill tone mapping for the
Pending Requests widget, and locked sample data for Recent Onboards + Gifts
Sent rows.

**First locked admin landing surface.** Locks the entire admin portal shell
(emerald sidebar `oklch(0.45 0.10 158)` + cream sidebar text + cream wordmark
with sage-mint "Good" + placeholder circular mark with a build-chat asset swap
note + "ADMIN · PRODUCTION" env label below the lockup) and the dashboard's
widget grammar (8-stat dark ink ribbon in two rows of four + booked meetings
calendar/list toggle + pending requests with locked tone mapping + needs action
+ distributions + unresponded comms + recent onboards + gifts sent +
component states demonstration band).

Single viewport (VP1 LOADED). Maya Okafor signed in. Tuesday, 28 May 2026 is the
sample "today" — the calendar grid centres on that day with the "today" highlight
ring on the 28. 142 meetings scheduled this month, 287 booked ahead, 96 completed
MTD, 24 active vendors, 318 active executives, $1.28M to charity lifetime,
$186.2K revenue MTD, $1.42M revenue YTD (all illustrative; build reads from
`@thegoodintro/pricing` + `lib/reporting.ts`, never hardcoded).

## Viewports

| VP | Route | State |
|---|---|---|
| 1 | `/admin` | Loaded — all widgets populated; Component States band demonstrates empty / loading / error variants |

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Admin Dashboard v2" → File > Export HTML |
| `screenshot-full-page.png` | TO DROP | Full-length page screenshot (top to bottom) |
| `screenshot-sidebar-detail.png` | TO DROP | Close-up of the upgraded sidebar (placeholder mark + Fraunces wordmark + ADMIN · PRODUCTION) |
| `screenshot-pending-requests-tones.png` | TO DROP | Close-up of the Pending Requests widget showing all four status pill tones |
| `screenshot-component-states.png` | TO DROP | The Component States band demonstrating empty / loading / error variants |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md) — brand and pricing facts.
2. [`../../../ADMIN_PORTAL_BRIEF.md`](../../../ADMIN_PORTAL_BRIEF.md) — admin portal workflows. The "HR Partner density on `--portal-*` tokens" rule applies; admin keeps mono uppercase eyebrows, hairline borders, count chips, status pills (distinct from the editorial concierge register that exec uses).
3. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) — Global decisions for the per-portal sidebar palette, the brand logo lockup, the photo-primary avatar rule, and the admin status pill tone mapping.
4. [`../../../CALCULATIONS.md`](../../../CALCULATIONS.md) — every $ figure on this screen reads from `@thegoodintro/pricing` + `lib/reporting.ts`. NO money is hardcoded.
5. [`../../../PORTAL_LAYOUT_BLUEPRINT.md`](../../../PORTAL_LAYOUT_BLUEPRINT.md) — admin shell tokens, T1 dashboard template anatomy.
6. [`../vendor-dashboard/README.md`](../vendor-dashboard/README.md), [`../exec-dashboard/README.md`](../exec-dashboard/README.md) — parallel-portal references (each has its own sidebar palette + register; admin sits in the middle on density).
7. Open `screen.html` + screenshots.

## What is locked

### Admin portal shell (the locked landing reference for every admin screen)

**Sidebar** — 240px wide, full height. Tokens:

- `--portal-emerald-sidebar` `oklch(0.45 0.10 158)` — emerald background
- `--portal-emerald-sidebar-text` — cream primary text for nav items + wordmark
- `--portal-emerald-sidebar-muted` — cream@60% secondary text for section labels (OPERATIONS / COMMUNICATION / CONFIGURE) and the ADMIN · PRODUCTION env label
- `--portal-emerald-sidebar-active` — slightly darker emerald bg for the active nav item

Structure top → bottom:
- **Brand lockup row** — left-aligned at the same x-coordinate as the nav-item icons below. Horizontal pair:
  - 24px round placeholder mark: solid fill `oklch(0.82 0.12 158)` (the same sage-mint as the "Good" accent), with a centered uppercase "G" in Fraunces semibold ~14px, cream colour. No border, no stroke. **Placeholder only — build chat replaces with `apps/web/public/brand-logo.png` at port time.**
  - 14px gap.
  - Wordmark: "TheGoodIntro" one word, Fraunces semibold ~22px. Colour split: "The" in cream `--portal-emerald-sidebar-text`, "Good" in sage-mint `oklch(0.82 0.12 158)`, "Intro" in cream `--portal-emerald-sidebar-text`. The lifted "Good" lightness is the **dark-bg variant of the brand accent** — preserves the emerald hue family while staying readable against the dark sidebar bg.
- "ADMIN · PRODUCTION" environment label below the wordmark, indented horizontally to align with the "T" of "The" (sits below the wordmark text, not below the mark). Inter mono 11px tracking-[0.18em], cream@60%.
- Section labels (OPERATIONS / COMMUNICATION / CONFIGURE) — mono 11px tracking-[0.18em], cream@60%, left-aligned at standard sidebar padding.
- Nav items — 44px rows, 18px outline icon + Inter 14px medium cream label. Active state: `--portal-emerald-sidebar-active` bg + cream label semibold. Some items carry amber-soft count badges to the right of the label (Meetings 14, Vendors 3, Inbox 23) — these are amber-on-emerald sanctioned per the portal palette rule.
- Sub-nav under Meetings (Scheduled · Pending requests 7 · Completed · Cancellations) — indented; "Pending requests 7" carries an amber-soft count badge.
- Bottom: signed-in user — 32px round photo-primary avatar (initials fallback) + Inter 13px semibold name "Maya Okafor" + Inter 11px cream@60% "Operations · Owner" + sign-out chevron ghost on the right.

**Topbar** — 56px, white `--portal-card` bg, 1px `--portal-line` bottom hairline. Left: command-K search input with placeholder "Search meetings, executives, vendors, charities" + ⌘K hint chip. Right cluster: "All systems operational" status with green dot + bell with no count badge in this state + 32px round MO avatar (Maya Okafor initials).

**Page background** — `--portal-page` warm cream.

**Breadcrumb + H1 block** — mono 11px uppercase tracking-[0.18em] "HOME / DASHBOARD" breadcrumb + Fraunces semibold 28px "Dashboard" H1 + Inter 13px muted sub-line "Tuesday, May 28 2026 · last refreshed 2 min ago". Page-action cluster on the right: ghost "Export" with download icon + primary ink-filled "+ New meeting".

### HR Partner density (the admin register)

Admin departs from exec's editorial concierge register and vendor's photo-led register in **density and chrome**, not skeleton:

- Mono uppercase eyebrows on widget cards (BOOKED MEETINGS · PENDING REQUESTS · NEEDS ACTION · DISTRIBUTIONS · UNRESPONDED COMMS · RECENT ONBOARDS · GIFTS SENT · COMPONENT STATES). Inter mono 11px tracking-[0.18em] `--muted-foreground`.
- Count chips next to widget eyebrows (BOOKED MEETINGS 142 · PENDING REQUESTS 7 · NEEDS ACTION 7 · UNRESPONDED COMMS 9 · GIFTS SENT 96). Amber-soft rounded chips with mono ink number.
- Status pills with dot + Inter 11px semibold title case label inside.
- Tighter spacing than exec (16-20px section gaps, NOT 72px).
- Card padding 24-28px.
- Sage-soft accents for low-stakes admin info (none on this screen but established elsewhere — admin Inbox).

### 8-stat dark ink metric ribbon (locked layout)

`--portal-ribbon` bg, white-on-dark numbers. Two rows of four stats, separated by white@10% vertical hairlines within each row and a thin white@5% horizontal hairline between rows. Each stat group:
- Mono 11px tracking-[0.18em] cream label
- Fraunces semibold ~36px white figure
- Inter 12px cream@60% sub-line

Row 1: SCHEDULED THIS MONTH (142, "38 in the next 7 days") · BOOKED AHEAD (287, "over the next 18 months") · COMPLETED MTD (96, "67.6% of scheduled") · ACTIVE VENDORS (24, "3 in onboarding")

Row 2: ACTIVE EXECUTIVES (318, "12 paused, 7 invited") · TO CHARITY ($1.28M, "lifetime, across 47 charities") · REVENUE, MONTH ($186.2K, "+8.4% vs prior month") · REVENUE, YEAR ($1.42M, "tracking 102% of target")

All $ figures are illustrative; build reads from `revenueForPeriod` and `executiveCharityForPeriod` in `lib/reporting.ts`.

### Booked Meetings widget — 8-col, calendar/list toggle

White card, 1px `--portal-line` border, 12px radius. Eyebrow row: "BOOKED MEETINGS 142 · MAY 2026" left + segmented Calendar/List toggle + "See all →" right.

**Calendar view** (default): month grid, 7 columns Mon-Sun, day numbers top-left of each cell, meeting chips as dark bars stacked below (up to ~4 chips per day cell with overflow truncation). "Today" highlight ring on 28. Cancelled meetings shown with thin strikethrough bar variant.

**List view**: T3 datatable rows — WHEN (time + duration) · EXECUTIVE (32px avatar + name) · VENDOR · CHARITY · STATUS (pill with dot, status colour). Status pills used: Confirmed (sage-green), Pending (amber-soft), Awaiting exec (cream-neutral).

### Pending Requests widget — 4-col (locked status pill tone mapping)

White card. Eyebrow row: "PENDING REQUESTS 7" left + "All" link right. Rows: 40px counterparty initials avatar + body stack (vendor wants exec name in Inter 14px semibold, sub-line italic Inter 12px muted with status detail e.g. "Submitted 14h ago · Brief attached") + status pill on the right.

**Locked status pill tone mapping (LOCKED 2026-06-09 — admin-portal-wide):**
- **Review = AMBER.** Bg `--portal-amber-soft`, ink `--portal-amber-ink`, 4px round dot in matching ink on the left of the label, 1.5px border in ink @ 40% opacity.
- **Match = NEUTRAL.** Bg `color-mix(in oklab, var(--portal-ink) 6%, white)`, ink `--portal-ink`, matching ink dot, matching border.
- **Exec = GOLD.** Bg `color-mix(in oklab, var(--portal-gold) 18%, white)`, ink `--portal-gold-ink`, matching ink dot, matching border.
- **Block = RED.** Bg `color-mix(in oklab, var(--portal-red) 12%, white)`, ink `--portal-red-ink`, matching ink dot, matching border.

Each pill: rounded-full, Inter 11px semibold title case, 4px y / 10px x padding, dot 6px left of the label inside the pill.

This mapping propagates to every other admin surface that renders these four request states. Do not re-debate per screen.

### Needs Action widget — 8-col

White card. Eyebrow row: "NEEDS ACTION 7" left + "See all →" right. Rows: small dot indicator (red dot = manual follow-up, amber dot = soft alert) + body (Inter 14px semibold lead clause with the action in `--portal-ink` semibold + remaining clause in regular weight + Inter 12px muted sub-line) + age indicator (Inter 12px muted, with red for >7d, amber for 2-7d, plain ink for <2d). Footer: "Manual follow-ups marked with a red dot" left + "7 OPEN · 3 ASSIGNED TO YOU" mono uppercase right.

### Distributions widget — 4-col horizontal bars

White card. Eyebrow row: "DISTRIBUTIONS" left + "Details →" right. Four stacked groups, hairline separators between:

1. **Meeting status** (142 total) — Completed 96 · Scheduled 38 · Cancelled 8 — each row: dot + label left, count + bar right.
2. **Vendors by tier** (24 total) — Growth 11 · Select 7 · Founder 6.
3. **Exec capacity** (318 total) — Open 184 · Near limit 122 · Paused 12.
4. **Charities supported** (47 total) — Education 18 · Health 16 · Climate 13.

Bars are simple horizontal proportional fills, no gradients, no labels overlaid.

### Unresponded Comms widget — 4-col

White card. Eyebrow row: "UNRESPONDED COMMS 9" left + "Inbox" link right. Rows: 32px counterparty avatar (initials fallback) + body stack (Inter 14px semibold counterparty name + Inter 12px muted subject line) + age indicator on the right.

### Recent Onboards widget — 4-col (LOCKED sample data)

White card. Eyebrow row: "RECENT ONBOARDS" left + "All" link right. Three rows, each:
- 32px photo-primary avatar (initials fallback on `--portal-amber-soft`) left
- Inter 14px semibold name + 2px gap + Inter 12px muted "Role · Company" middle
- Mono 11px uppercase tracking-[0.18em] muted date prefix right

Locked rows:
1. Sam Patel · Head of RevOps · Acme Robotics · 05 JUN
2. Mira Chen · Founder · Anvil Software · 03 JUN
3. Naomi Brooks · VP Sales · Beacon Procurement · 28 MAY

Sample data aligns with the exec dashboard's Incoming Requests + exec request detail page. Cross-screen consistency.

### Gifts Sent widget — 4-col (LOCKED sample data)

White card. Eyebrow row: "GIFTS SENT 96" left + "Catalogue" link right. Four rows, each:
- 32px circular charity logo (white inner bg, 1px `--portal-line` rim, 2-3 letter initials fallback on `--portal-amber-soft`) left
- Inter 14px semibold charity name + 2px gap + Inter 12px muted "N gifts" middle
- Fraunces semibold 16px `--portal-emerald` $ figure right

Locked rows:
1. Royal Flying Doctor Service · 4 gifts · $4,000
2. Beyond Blue · 3 gifts · $3,000
3. OzHarvest · 2 gifts · $2,000
4. The Smith Family · 2 gifts · $2,000

$ figures are illustrative; build reads from `gift_record` frozen-at-Held sums grouped by `charity_id`.

### Component States band

Below the main widget grid, a "COMPONENT STATES" band demonstrates the empty / loading / error variants of the widget card pattern:

- **Needs Action — empty state**: centered cream success-check glyph + "ALL CLEAR" mono uppercase headline + body copy + "View completed" ghost button.
- **Pending Requests — loading state**: skeleton rows with animate-pulse on the body + count + status pill blocks.
- **Distributions — error state**: amber-soft error tone block with "Could not load" + body + "Retry" ghost button + muted "Last successful refresh was 18 minutes ago" timestamp.
- Plus inline examples for **Booked Meetings — empty state** (centered calendar glyph + "NO MEETINGS YET" + body + "+ New meeting" CTA) and **Recent Onboards — loading state** (skeleton row stack).

This band is the **kit reference** — every widget renders these states using these exact treatments. Do not duplicate per widget; the `Widget` kit primitive holds all four state variants and the dashboard composes them.

### Photo-primary avatar rule (portal-wide, applied here)

Every person avatar on this dashboard is photo-primary with initials-fallback:
- Default: photo inside the circle at the surface's existing size (32px Recent Onboards + Pending Requests + Unresponded Comms; 40px Pending Requests rows; 32px sidebar + topbar; 32px List view of Booked Meetings).
- Fallback: same-size circle, `--portal-amber-soft` bg, Inter semibold `--portal-amber-ink` initials centered.

This rule was originally locked on the Exec Dashboard 2026-06-08 and is applied here. Build chat reads `vendor_user.photo_url`, `executive.photo_url`, `admin_user.photo_url`. Without photos uploaded, the initials fallback renders.

## Data sources per module (build-chat reference)

| Module | Source | Notes |
|---|---|---|
| Sidebar wordmark + placeholder mark | static / asset swap | Build chat embeds `apps/web/public/brand-logo.png` for the mark; wordmark stays as text |
| Sidebar nav count badges | counts from respective tables | Meetings (14) = scheduled+pending; Vendors (3) = in onboarding; Inbox (23) = unread |
| Sidebar Pending requests sub-nav badge (7) | `count(request WHERE status='submitted')` | Mirrors the Pending Requests widget count |
| Sidebar Maya Okafor identity | `auth.user` joined to `admin_user` | Photo from `admin_user.photo_url` |
| Topbar search | global search index | Cmd-K shortcut + placeholder text |
| Topbar "All systems operational" | health check endpoint | Pulse green dot + label; degrades to amber / red |
| Topbar bell | unread notifications count | Amber dot when unreadCount > 0 (no dot in this state because zero) |
| H1 sub-line "last refreshed 2 min ago" | client-side refresh timestamp | Relative time |
| Metric ribbon · Row 1 stats | `count` queries on `meeting` / `vendor` | Scheduled = current calendar month; Booked ahead = future windows; Completed MTD = held in MTD; Active vendors = `status='active'` |
| Metric ribbon · Row 2 stats | mixed | Active execs from `executive`; To charity = `executiveCharityForPeriod(null /* unbounded */)` lifetime; Revenue MTD/YTD = `revenueForPeriod` MTD + FYTD |
| Booked Meetings · Calendar | `meeting WHERE scheduled_at IN current_month` | Chip per meeting; cancelled = strikethrough |
| Booked Meetings · List | same query, T3 row layout | Status pill per row |
| Pending Requests · rows | `request WHERE status='submitted' ORDER BY submitted_at DESC LIMIT 5` | Mapped to status pill tone via locked mapping |
| Needs Action · rows | `admin_task WHERE status='open' ORDER BY priority DESC, age DESC LIMIT 7` | Red dot for manual follow-ups; "M assigned to you" = `WHERE assignee_id = current_admin_id` |
| Distributions · Meeting status | `count(meeting) GROUP BY status` | |
| Distributions · Vendors by tier | `count(vendor) GROUP BY tier` | Tier names Growth / Select / Founder (admin-facing) |
| Distributions · Exec capacity | computed: counts of execs at / near / over capacity threshold | Threshold from `executive.monthly_meeting_limit` |
| Distributions · Charities supported | `count(DISTINCT gift_record.charity_id) GROUP BY charity.cause_category` | |
| Unresponded Comms · rows | Gmail thread integration (admin Inbox feed) | Ordered by oldest unresponded first |
| Recent Onboards · rows | `vendor_user WHERE created_at IN last_30_days ORDER BY created_at DESC LIMIT 3` joined to vendor | Photo + Role · Company |
| Gifts Sent · rows | `gift_record GROUP BY charity_id ORDER BY frozen_amount_sum DESC LIMIT 4` joined to charity | $ from frozen `charity_amount_cents` sum; gift count from row count |
| Component States band | kit primitive variants of `Widget` | Demonstrates empty / loading / error rendering — informs the `Widget` consumer how each state composes |

**No money number is computed in the page.** Every $ figure reads from `@thegoodintro/pricing` or `lib/reporting.ts`. Sample data in the mockup is illustrative.

## Sample data (LOCKED — every admin screen must align)

- **Signed-in admin**: Maya Okafor · Operations · Owner · 32px avatar (initials "MO" fallback)
- **Today (sample)**: Tuesday, 28 May 2026
- **Last refreshed**: 2 min ago

**Pending Requests (5 rows visible):**
1. Halberd Capital wants Priya Raghavan · Submitted 14h ago · Brief attached · **Review** (amber)
2. Northwind Logistics wants Daniel Kovacic · Submitted 1d ago · Re-request, prior accept · **Review** (amber)
3. Brightline Analytics wants any health-tech exec · Open brief · 2 candidates suggested · **Match** (neutral)
4. Mercer Holdings wants Sarah Levenson · Submitted 2d ago · Awaiting exec · **Exec** (gold)
5. Atelier Ridgeway wants Kenji Whitaker · Capacity exceeded for this exec · **Block** (red)

**Booked Meetings — List view sample (5 rows visible):**
1. Today · 14:30 · 30 min · Priya Raghavan · Halberd Capital · Riverbend Literacy · Confirmed
2. Today · 16:00 · 45 min · Daniel Kovacic · Northwind Logistics · Open Water Trust · Pending
3. Tomorrow · 09:00 · 30 min · Adaeze Okonkwo · Brightline Analytics · Code Equity Fund · Confirmed
4. Tomorrow · 11:30 · 45 min · Kenji Whitaker · Atelier Ridgeway · Pacific Reefkeepers · Awaiting exec
5. May 30 · 10:00 · 30 min · Sarah Levenson · Mercer Holdings · Riverbend Literacy · Confirmed

**Needs Action (7 rows visible):**
1. Vendor agreement unsigned, Atelier Ridgeway · Manual follow-up · Sent 4 reminders, last opened May 19 · red dot · 9d
2. Executive intro needs approval, Priya Raghavan to Halberd Capital · Awaiting your sign-off before vendor outreach · amber dot · 2d
3. Refund decision, Cantilever Group cancelled within 48h · Manual follow-up · Vendor requested partial credit · red dot · 5d
4. Charity verification expiring, Riverbend Literacy Trust · 501(c)(3) letter on file is dated 2023, renewal required · amber dot · 3d
5. Capacity exceeded, Kenji Whitaker is over his monthly meeting limit · 3 pending requests, executive has signalled pause preference · amber dot · 1d
6. Quarterly review packet ready for sign-off · Q1 vendor health report compiled by Hana · amber dot · 6h
7. Two duplicate executive profiles flagged by dedupe job · Possible match: "S. Levenson" and "Sarah Levenson" · amber dot · 2h

**Unresponded Comms (5 visible):**
1. Atelier Ridgeway · Re: contract revisions · 4 messages · 3d (red)
2. Priya Raghavan · Re: charity preference change · 2d
3. Halberd Capital · Question about gift catalogue · 1d
4. Riverbend Literacy Trust · 501(c)(3) renewal docs · 18h
5. Sarah Levenson · Schedule conflict for May 30 · 4h

**Distributions:**
- Meeting status (142): Completed 96 · Scheduled 38 · Cancelled 8
- Vendors by tier (24): Growth 11 · Select 7 · Founder 6
- Exec capacity (318): Open 184 · Near limit 122 · Paused 12
- Charities supported (47): Education 18 · Health 16 · Climate 13

**Recent Onboards (3 rows):** Sam Patel · Mira Chen · Naomi Brooks (see locked rows above).

**Gifts Sent (4 rows):** RFDS · Beyond Blue · OzHarvest · The Smith Family (see locked rows above).

## Open decisions parked (do NOT silently resolve)

- **Brand mark placeholder vs real asset** — RESOLVED 2026-06-09. The 24px mint-emerald-with-cream-G placeholder is final for design lock; build chat embeds `apps/web/public/brand-logo.png` at port time. Do not iterate further on the mockup placeholder. See feedback memory.
- **Component States band — placement at lock vs strip-out for production** — currently sits in the live dashboard composition; per the brief, this is the kit demonstration band, NOT production content. Build chat should remove it from `/admin` route and use it only as `apps/platform/app/(kit)/component-states/page.tsx` reference. Confirm with Issy before build.
- **"Last refreshed 2 min ago"** — currently a static label. Decide whether to wire as live refresh interval (cron-based) or leave as page-load timestamp.
- **Notification bell** — wired as empty in this state (no count badge). Behaviour for unreadCount > 0 specced on the Notification dropdown screen (separate lock).

## Anti-list (do not regress)

- **Admin sidebar stays emerald** `oklch(0.45 0.10 158)`, never teal-pine (vendor only) or charcoal (exec only).
- **Mark is a placeholder** — do not redraw the real circular brand mark in Claude Design. Build chat handles the asset swap.
- **"Good" in the wordmark stays at sage-mint** `oklch(0.82 0.12 158)` on the dark sidebar. NOT brand emerald (disappears) and NOT amber / gold / cream (off-brand).
- **Status pill tone mapping** is locked: Review = amber, Match = neutral, Exec = gold, Block = red. Use the same mapping on every other admin surface that renders these states.
- **Photo-primary avatars** at locked sizes (32px most places, 40px Pending Requests). Photos live INSIDE the circle (object-fit: cover); they do NOT replace the avatar container with a larger image.
- **Component States band** stays in this lock as the kit demonstration. Build chat moves it to the kit route, not the production `/admin` route.
- **No emojis.** Outline icons (1.6px stroke) only.
- **No em dashes, no en dashes.** Use "·" as separator.
- **Mono uppercase eyebrows** stay on every widget card. That's the admin HR Partner density signal — do not soften to italic Inter (that's the exec register).
- **Count chips** stay amber-soft on emerald (sanctioned admin accent per the portal palette memory).
- **8-stat ribbon is dark ink** — never warm cream.
- **Money rule (HARD):** every $ figure is illustrative; build reads from `@thegoodintro/pricing` + `lib/reporting.ts`. Never hardcoded.
