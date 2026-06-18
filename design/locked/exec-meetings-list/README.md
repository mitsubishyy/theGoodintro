# Exec Meetings List — LOCKED 2026-06-10

> **Money note (2026-06-12 rule):** a gift figure an exec reads PRE-Held (Upcoming
> meetings, the drawer "Your gift" before the meeting begins) renders
> "approximately $N" (canonical: `exec-request-email`). The bare "$N" in the
> sample copy below is shorthand; do not port a flat pre-Held figure. Past / Held
> figures are the exact frozen amount.

Designed in Claude Design 2026-06-10. **Third locked exec-portal screen** (after the Exec Dashboard and Exec Incoming Requests). Route: `/exec/meetings`. Priya's working surface for everything past, present, and upcoming. List + Calendar toggle. Row click opens a right-side drawer; there is no standalone meeting detail page.

Three viewports plus one expanded variant: VP1 LIST default (Past + Cancelled collapsed), VP1b LIST with Past expanded, VP2 CALENDAR month view, VP3 LIST with drawer open on Mira Chen.

This lock introduces **five portal-wide patterns** captured in the UI Kit Design Log Global decisions: universal topbar search, three-stat inline mini-strip page header, collapsible section card, drawer-as-detail (replaces separate detail pages), and the architectural principle "editorial register on chrome, SaaS structures inside."

## Viewports

| VP | Route | State |
|---|---|---|
| 1 | `/exec/meetings` | List view default — Upcoming open (3 rows), Past collapsed (`Past · 13`), Cancelled collapsed (`Cancelled · 1`). The default state is intentionally short. |
| 1b | `/exec/meetings` | List view — Past EXPANDED (renders all 7 past rows in the locked sample). For verifying expanded card anatomy. |
| 2 | `/exec/meetings?view=calendar` | Calendar month view — June 2026. Today highlighted Sun 8 Jun. Meeting chips on dates with scheduled meetings. |
| 3 | `/exec/meetings?drawer=mtg_mira_chen` | List view with row-click drawer open on Mira Chen / Tue 17 Jun. 540px right slide-over, 20% ink dim + 2px backdrop blur (reuses locked exec dashboard charity picker backdrop). |

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Exec Meetings List" → File > Export HTML |
| `screenshot-vp1-default.png` | TO DROP | List view default — three-stat mini-strip + Connect-your-calendar banner + controls bar + Upcoming card with 3 rows + Past collapsed + Cancelled collapsed |
| `screenshot-vp1b-past-expanded.png` | TO DROP | List view with Past expanded — all 7 past rows from Sam Patel through Tom Cheng |
| `screenshot-vp2-calendar.png` | TO DROP | Calendar month view June 2026 — Acme Robotics 2 Jun, Anvil Software 17 Jun, Coastline Logistics 19 Jun, Pillar Risk 30 Jun chips |
| `screenshot-vp3-drawer.png` | TO DROP | List view with drawer open on Mira Chen — identity + when + your gift + pitch context expanded + sticky footer |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md) — brand and pricing facts.
2. [`../exec-dashboard/README.md`](../exec-dashboard/README.md) — exec portal shell + editorial concierge register + photo-primary avatars + locked Priya sample data context. This screen inherits all of it except the topbar empty-right rule (see "Universal topbar search" below — this lock supersedes that).
3. [`../exec-incoming-requests/README.md`](../exec-incoming-requests/README.md) — the second exec-portal lock; back-row pattern + card-stack precedent.
4. [`../../../EXECUTIVE_PORTAL_BRIEF.md`](../../../EXECUTIVE_PORTAL_BRIEF.md) — exec portal workflows.
5. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) — Global decisions for the five new patterns introduced here.
6. [`../../../CALCULATIONS.md`](../../../CALCULATIONS.md) — every $ figure reads from `@thegoodintro/pricing` + `lib/reporting.ts`. NO money is hardcoded.
7. [`../../../STATE_MACHINES.md`](../../../STATE_MACHINES.md) — meeting status lifecycle (confirmed → held → cancelled).
8. Open `screen.html` + screenshots.

## What is locked

### Architectural principle — editorial chrome, SaaS structures inside (NEW — applies to every operational exec surface)

The editorial concierge register established on the Exec Dashboard and Incoming Requests was over-applied to an earlier Meeting Detail experiment and read as "newsletter stick-on, not SaaS." This lock resolves the tension:

- **CHROME stays editorial**: sidebar (charcoal), topbar, page typography (Fraunces section heads, italic Inter eyebrows), hairline borders, single emerald accent, warm cream page bg.
- **DATA STRUCTURES inside the chrome function as proper SaaS**: tables, calendar grids, filters, search, list rows with multiple compact data points, collapsibles. Reference register: Linear / Pitch / Vercel.

This is not "less editorial" — it is editorial restraint plus operational density-with-hierarchy. Cleanness without sparseness. Apply forward on every operational exec surface (Impact list, future search results, EA mode lists, etc.).

### Exec portal shell (inherited from Exec Dashboard, applied here, ONE supersession)

Sidebar 240px charcoal ink + companion tokens · `--portal-page` warm cream main bg. Sidebar active state on "Meetings". Wordmark + brand mark placeholder per locked rule.

**Topbar — SUPERSEDES Exec Dashboard's locked "content-empty right" rule.**
- Height 56px, `--portal-card` bg, 1px `--portal-line` bottom hairline.
- Left: "Meetings" Inter 14px semibold `--portal-ink` (page title).
- Center-right: **universal search input** (NEW — see next section).
- Right edge: still nothing. No bell, no help, no date. The universal search is portal-wide; the "no chrome on the right edge" stays.

This supersession is intentional. The Exec Dashboard and Incoming Requests READMEs will be re-locked on next touch to document the new topbar rule. Until then, the rule is: **universal topbar search applies to every exec page going forward; older locked screens inherit retroactively at build time, not via design rework.**

### Universal topbar search (NEW PORTAL-WIDE PATTERN — supersedes "topbar content-empty right")

A single search affordance that exists on every exec-portal page topbar from the Meetings List forward.

- Position: center-right of the topbar, between the page title (left) and the right edge (empty).
- Width: ~480px on standard viewports; flex-1 with max-width on smaller widths.
- Field: white `--portal-card-reading` bg, 1px `--portal-line` border, 8px radius, 36px tall.
- Left of placeholder: 16px outline search glyph (1.6px stroke, `--muted-foreground`).
- Placeholder: italic Inter 13px `--muted-foreground`: "Search meetings, vendors, charities".
- Right of placeholder, inside the field: keyboard hint "⌘K" Inter 11px `--muted-foreground` in a soft `--portal-page` chip.
- Focus state: 2px `--portal-emerald` ring, placeholder italic dropped.
- Behaviour: opens command-palette overlay (Pass B — not designed yet). Live-filters across meetings, vendors, charities, requests.

**Scope and rules:**
- Every exec-portal page topbar carries this search affordance.
- Right edge of the topbar STAYS content-empty. No bell, no help, no date stamp. The search is the only addition.
- The page title on the left stays — search does not replace it.
- Applies retroactively to Exec Dashboard and Exec Incoming Requests at build time. The locked READMEs for those screens will be updated on next touch.

### Page header — three-stat inline mini-strip (NEW PATTERN)

The page header treatment that replaces a filled card or stat block.

- "Your meetings" eyebrow above the H1 — italic Inter 12px `--muted-foreground`.
- Fraunces semibold 32px H1: "Meetings".
- 20px below the H1, an inline three-stat mini-strip on a single row, left-aligned.
- Three stat groups separated by 1px `--portal-hairline` vertical dividers (16px tall, vertically centered).
- 32px horizontal padding either side of each divider.
- Each stat group is a vertical stack:
  - Top: Fraunces 28px number, weight 500, letter-spacing -0.01em, line-height 1.
  - Bottom: italic Inter 13px `--portal-ink-60` label, 6px gap above.
- **ABSOLUTE NOs**: no fill of any kind, no border around the strip, no rounded card container, no icons.
- **Single-accent rule applies**: the first number (the "headline" stat) renders in `--portal-emerald`; the second and third are `--portal-ink`.

Sample on this screen: `12 held this financial year` (emerald) · `3 coming up` (ink) · `28 lifetime` (ink).

This pattern is portal-wide reusable. Use on any exec page that needs a quick three-stat summary in the header (Impact list, My Charity, Profile, EA Mode dashboards). Never fill the container; always single-accent the first number.

### Connect-your-calendar banner

Between the page header mini-strip and the controls bar.

- Single-row banner card, white `--portal-card-reading` bg, 1px `--portal-line` border, 12px radius, 20px y / 24px x padding, justify-between flex.
- LEFT: 20px outline calendar glyph + 16px gap + vertical stack ("Connect your calendar" Inter 14px semibold ink + 4px + italic Inter 13px `--muted-foreground` "See TheGoodIntro meetings alongside your other meetings. We push and pull updates automatically.").
- RIGHT: two buttons inline, 12px gap.
  - Primary `--portal-emerald` "Connect Google Calendar" — Inter 13px semibold white, 10px y / 18px x, 8px radius.
  - Ghost "Connect Outlook" — Inter 13px semibold `--portal-ink`, transparent bg, 1px `--portal-line` border, same dimensions.

This banner is the DISCONNECTED default state. Once connected, the banner is replaced with a quiet `--portal-card-hover` strip showing the last sync timestamp (NOT designed in this pass — deferred to Pass B).

### Controls bar

Single row between the calendar banner and the section cards / calendar grid.

- LEFT cluster: Calendar | List segmented toggle. Inter 13px semibold, 36px tall, 1px `--portal-line` border, 8px radius, segments separated by hairline. Active segment: `--portal-emerald` bg + white ink. Inactive: transparent bg + `--portal-ink` ink.
- RIGHT cluster: All | Upcoming | Past segmented toggle + 12px gap + Sort dropdown.
  - All/Upcoming/Past toggle: same anatomy as Calendar/List on the left.
  - Sort dropdown: ghost button, Inter 13px medium `--portal-ink`, 1px `--portal-line` border, 8px radius, label "Most recent first" + 12px chevron-down outline. Options: Most recent first / Oldest first. (Filters/search live in the topbar; Sort is the only inline control beyond the toggles.)
- NO search box in the controls bar — search lives in the topbar (portal-wide).
- 24px gap below the controls bar before the section cards / calendar grid.

### List view — collapsible section cards (NEW PATTERN, portal-wide)

The list view renders meetings inside three separate section cards, stacked vertically with 32px gaps.

**Each card:**
- White `--portal-card-reading` bg.
- 1px `--portal-line` border.
- 12px border radius.
- `overflow: hidden` so internal row hairlines don't bleed past the rounded corners.

**Section header strip** at the top of each card:
- Height: 56px.
- Padding: 0 24px.
- bg: `--portal-cream-soft`.
- Bottom: 1px `--portal-line` hairline (rendered only when card is expanded; hidden when collapsed).
- Left: italic Inter 14px `--portal-ink-70` label, e.g. "Upcoming · 3".
- Right (collapsible cards only): 16px chevron icon, 1.6px stroke, `--portal-ink-60`. Points DOWN when collapsed, rotates 180° to point UP when expanded. 200ms ease.

**Collapsibility rules** (the portal-wide principle):
- The PRIMARY/active section stays ALWAYS OPEN with no chevron and no header click affordance. Here it's "Upcoming · 3".
- HISTORICAL or LOW-PRIORITY sections collapse BY DEFAULT with chevron. Here it's "Past · 13" and "Cancelled · 1".
- Entire header strip is clickable to expand/collapse on collapsible cards.
- Hover state on a collapsible header: bg darkens to `--portal-cream-mid`.
- Counts in section headers reflect the REAL TOTAL (not the rendered subset). "Past · 13" stays "13" even when only 7 sample rows are rendered.

This pattern propagates portal-wide. Use whenever a list naturally splits into active vs historical or primary vs secondary groupings. Asymmetric expanded/collapsed defaults are correct — do not force symmetric treatment.

### List row anatomy (within an expanded section card)

Each row: 88px tall (allows the meta line to breathe), 0 internal radius, 1px `--portal-line` hairline between adjacent rows (no hairline above first row or below last in a section), 20px y / 24px x padding, full-row hover state with subtle `--portal-card-hover` bg tint, cursor pointer (entire row opens the drawer).

Horizontal flex layout, items-center:
- LEFT: 40px circular photo-primary avatar, initials fallback on `--portal-amber-soft` per the locked photo-primary rule. **NO STATUS RING** — explicit text + dot in the status column carries that signal.
- 16px gap.
- MIDDLE (flex-1, vertical stack):
  - Row 1 (top): Inter 15px semibold `--portal-ink` name.
  - Row 2: Inter 13px `--muted-foreground` "Title · Company".
  - Row 3 (meta line): italic Inter 12px `--portal-ink-60` with the row's specific narrative, e.g.:
    - Upcoming: "Accepted Sat 7 Jun · Gift will go to RFDS"
    - Held: "Gift went to RFDS" (or "Gift went to Beyond Blue (overridden)" for overrides)
    - Cancelled: "Cancelled by exec · Mon, 17 Feb"
- 24px gap.
- STATUS column (~120px wide, vertically centered):
  - 8px colored dot + italic Inter 13px word, inline.
  - Tones: Confirmed `--portal-emerald` dot, Held `oklch(0.78 0.06 155)` soft-green dot, Cancelled `--portal-ink-30` neutral dot. Always italic word.
- 24px gap.
- RIGHT cluster (vertical stack, items-end):
  - Top: Fraunces semibold 17px date "Tue, 17 Jun".
  - Bottom: Inter 12px `--muted-foreground` "10:00 AEST · 30 min · [provider micro-icon] Zoom". Provider icon: 12px outline (Zoom or Teams glyph), 1.6px stroke.
  - On Cancelled rows: no time/duration/provider sub-line — cancelled meetings don't need provider context.

### Calendar view (NEW LAYOUT — month view, editorial header on a functional grid)

Toggling Calendar in the controls bar replaces the section cards with a calendar month grid.

- Calendar container: white `--portal-card-reading` bg, 1px `--portal-line` border, 12px radius, 24px padding.
- Month header row inside the card:
  - LEFT: 16px outline chevron-left + Fraunces semibold 28px month label "June 2026" + 16px outline chevron-right. 12px gap between chevrons and label.
  - RIGHT: Month | Week segmented toggle (same anatomy as the page-level toggle). Month is active in v1; Week designed in this lock too.
- 24px gap below the header row, 1px `--portal-line` hairline.
- Day-of-week header row: 7 columns, italic Inter 12px `--muted-foreground`, title case ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"). Not mono uppercase — editorial register on chrome.
- Date grid: 6 rows × 7 columns, each cell ~140px tall, 1px `--portal-line` borders between cells.
- Date number top-left of each cell: Fraunces semibold 20px `--portal-ink`. Days outside current month: 40% opacity.
- Weekend columns (Sat + Sun): subtle `--portal-cream-soft` bg tint.
- TODAY treatment: solid `--portal-emerald` circle behind the date number, ~32px diameter, white Fraunces date number on top. Applies only to current day's date number, not the whole cell.
- Meeting chips inside a date cell: soft-emerald-fill `oklch(0.94 0.04 155)` pill, rounded-full, `--portal-emerald` text, Inter 11.5px medium, 4px y / 10px x padding, 6px small dot prefix. Label is the company name ("Acme Robotics", "Anvil Software", etc.). 6px gap between stacked chips when multiple meetings share a date.
- Chip click → opens drawer (same drawer as the list view).
- Footer legend below the grid: small `--portal-emerald` dot + "Confirmed" / soft-green dot + "Held" / neutral dot + "Cancelled". Italic Inter 12px `--muted-foreground`. Centered.

### Drawer (NEW PATTERN — slides in from right, replaces separate detail pages)

Row click (in list view) OR chip click (in calendar view) opens the drawer. This drawer is the **detail surface**; a standalone Meeting Detail page (`/exec/meetings/[id]`) is explicitly killed by this lock.

**Container:**
- 540px wide, full viewport height, slides in from the right edge.
- White `--portal-card-reading` bg.
- 0 border-radius (flush to right edge of viewport).
- 1px `--portal-line` left border.
- No drop shadow on the drawer itself.

**Backdrop:**
- `--portal-ink` at 20% opacity overlay over the rest of the dashboard.
- 2px backdrop-blur.
- **Reuses the locked Exec Dashboard charity picker modal backdrop pattern verbatim.** Do not pick a different dim/blur for this drawer; the modal backdrop and the drawer backdrop are the same exec-portal pattern.
- Click on backdrop closes the drawer.

**Top accent bar (3px solid):**
- Spans the full drawer width at the top.
- Colored by meeting status: Confirmed = `--portal-emerald`, Held = soft-green `oklch(0.78 0.06 155)`, Cancelled = `--portal-ink-30`.
- 20px x close-X button (top-right, 1.6px stroke `--muted-foreground`) sits below this accent bar at 20px y / 24px x from top-right corner.

**Header section** (28px x / 32px top padding):
- Italic Inter 12px `--muted-foreground` eyebrow: "Confirmed meeting" / "Past meeting · Held" / "Cancelled meeting" — status-aware text.
- 16px gap.
- 64px circular photo avatar (photo-primary, initials fallback). **NO RING.**
- 20px gap.
- Fraunces semibold 28px name.
- 4px gap.
- Inter 14px `--muted-foreground` "Title · Company".
- 12px gap.
- Italic Inter 13px `--portal-ink-70` credibility line (e.g. "ex-Atlassian, founded Anvil in 2023").
- 12px gap.
- LinkedIn outbound: italic Inter 13px `--portal-ink` ghost link with 12px outbound-arrow glyph: "View Mira on LinkedIn ↗".

**1px `--portal-line` hairline (full drawer width) below header.**

**Body sections** (32px y between sections, 28px x padding):

1. **When**
   - Italic eyebrow "When" Inter 12px `--muted-foreground`.
   - 8px gap.
   - Fraunces semibold 22px `--portal-ink` "Tuesday, 17 June · 10:00 AEST".
   - 4px gap.
   - Inter 13px `--muted-foreground` "30 min · Zoom".
   - 12px gap.
   - Italic Inter 13px `--portal-ink-70` "Accepted Saturday, 7 June." — historical context for the proposed time.

2. **Your gift**
   - Italic eyebrow "Your gift".
   - 12px gap.
   - Subtle emerald-wash card: bg `color-mix(in oklab, var(--portal-emerald) 6%, white)`, 1px `color-mix(in oklab, var(--portal-emerald) 18%, var(--portal-line))` border, 12px radius, 20px padding.
     - LEFT: 44px round RFDS charity logo placeholder ("RFDS" letters in `--portal-amber-soft`, build chat swaps in `charity.logo_url`).
     - 16px gap.
     - Vertical stack:
       - Fraunces semibold 20px `--portal-emerald` "$1,000 to Royal Flying Doctor Service".
       - 4px gap.
       - Italic Inter 13px `--muted-foreground` "Your standing nomination".
   - 12px gap below the card.
   - Italic Inter 12px `--muted-foreground` helper "Redirectable any time before the meeting begins." (on Confirmed) OR "Gift snapshot taken at Held — no longer editable." (on Held).

3. **Pitch context (collapsible, defaults COLLAPSED)**
   - Full-width white `--portal-card-reading` button card, 1px `--portal-line` border, 12px radius, 16px padding.
   - Header row inside the card: italic Inter 13px `--portal-ink` "Show pitch context" + 12px chevron-down outline right-aligned.
   - Click expands inline (NOT a new modal, NOT a nested drawer). When expanded, the label flips to "Hide pitch context" + chevron rotates 180°. Card bg darkens to `--portal-cream-soft`.
   - Expanded content (24px below the header row, inside the same card):
     - Italic eyebrow "What they want to discuss".
     - 6px gap.
     - Fraunces semibold 17px ink Q1 head.
     - 12px gap.
     - Inter 14px `--portal-ink-80` Q1 body (1.55 line-height).
     - 24px gap.
     - 1px `--portal-line` hairline.
     - 24px gap.
     - Italic eyebrow "Why you, specifically".
     - 6px gap.
     - Fraunces semibold 17px ink Q2 head.
     - 12px gap.
     - Inter 14px `--portal-ink-80` Q2 body (1.55 line-height), indented 16px with 2px `--portal-emerald` left rule (matches the Q2 emerald-highlight treatment from `/exec/requests`).

**Sticky footer** (anchored to drawer bottom):
- 1px `--portal-line` hairline top.
- 20px y / 24px x padding.
- White bg.
- Flex justify-stretch, 12px gap, 48px tall buttons.
- Primary `--portal-emerald` "Join meeting in Zoom" (or Teams) — Inter 13.5px semibold white, flex 2 (carries more visual weight).
- Ghost "Request reschedule" — Inter 13.5px semibold `--portal-ink`, white bg, 1px `--portal-line` border, flex 1.
- Footer button labels are status-aware:
  - Confirmed: Primary "Join meeting in [provider]" + Ghost "Request reschedule".
  - Held: ~~Primary "View charity impact" (links to Impact list page anchored to this gift) + Ghost "Send a thank you" (links to Inbox composer — Pass B).~~ **AMENDED 2026-06-12 (v1 scope decision, ratified):** "Send a thank you" is CUT — the exec portal has no composer. The Held footer ships Primary "View charity impact" alone, full width. Revisit only if an exec-side composer is ever scoped.
  - Cancelled: footer hidden entirely.

## Sample data (LOCKED — every exec screen must align)

### Page header strip
- "12" held this financial year (emerald)
- "3" coming up (ink)
- "28" lifetime (ink)

### Calendar banner
- DISCONNECTED state shown by default. (Connected state deferred to Pass B.)

### Upcoming · 3
1. **Mira Chen** · Founder · Anvil Software · Confirmed · Tue, 17 Jun · 10:00 AEST · 30 min · Zoom · "Accepted Sat 7 Jun · Gift will go to RFDS"
2. **Jamie Holloway** · CRO · Coastline Logistics · Confirmed · Thu, 19 Jun · 14:30 AEST · 45 min · Teams · "Accepted Thu 5 Jun · Gift will go to RFDS"
3. **Devi Iyer** · Head of Sales · Pillar Risk · Confirmed · Mon, 30 Jun · 11:00 AEST · 30 min · Zoom · "Accepted Mon 9 Jun · Gift will go to Beyond Blue" (per-meeting override)

### Past · 13 (7 sample rows rendered)
4. Sam Patel · Head of RevOps · Acme Robotics · Held · Mon, 2 Jun · 09:30 AEST · 30 min · Zoom · "Gift went to RFDS"
5. Aisha Khan · Director of Strategy · Brightside Analytics · Held · Mon, 19 May · 11:00 AEST · 30 min · Zoom · "Gift went to RFDS"
6. David Wu · COO · Northbeam Insights · Held · Mon, 5 May · 14:00 AEST · 45 min · Teams · "Gift went to RFDS" (note: dashboard Recent Impact shows this gift as Beyond Blue override; resolve before build — see Open decisions)
7. Hana Mori · Founder · Tess Robotics · Held · Wed, 30 Apr · 10:00 AEST · 30 min · Zoom · "Gift went to RFDS"
8. Liam Patel · VP Operations · Origin Energy · Held · Mon, 14 Apr · 15:30 AEST · 30 min · Zoom · "Gift went to RFDS"
9. Sarah Nguyen · CFO · Plywood Health · Held · Tue, 1 Apr · 11:00 AEST · 30 min · Zoom · "Gift went to RFDS"
10. Tom Cheng · Founder · Coastline Pacific · Held · Wed, 19 Mar · 10:00 AEST · 30 min · Zoom · "Gift went to RFDS"
- Footer below the 7 rows: italic Inter 12px `--muted-foreground` "Showing 7 of 13 meetings" left + pagination ghost links "Previous · Page 1 of 2 · Next" right. Pagination INSIDE the expanded card, not at the page level.

### Cancelled · 1
11. Riley Adams · VP Sales · Forge Industries · Cancelled · Mon, 17 Feb · "Cancelled by exec · Mon, 17 Feb" (no time / duration / provider on this row).

### Drawer sample — Mira Chen
- Eyebrow: "Confirmed meeting"
- Identity: Mira Chen · Founder · Anvil Software · "ex-Atlassian, founded Anvil in 2023"
- LinkedIn: "View Mira on LinkedIn ↗"
- When: Tuesday, 17 June · 10:00 AEST · 30 min · Zoom · Accepted Saturday, 7 June
- Your gift: $1,000 to Royal Flying Doctor Service · Your standing nomination · "Redirectable any time before the meeting begins."
- Pitch context (collapsed by default; expanded in VP3):
  - Q1 head: "Activating operating data without rebuilding the warehouse"
  - Q1 body: "Lumen sits on years of operating data across 14 sites and Anvil's pitch is that you can activate it without rebuilding your warehouse. I'd like to walk you through how three Australian logistics groups have done this in the last 18 months and where they hit ceiling. Not a vendor pitch. The question I really want your read on is whether the AS400-era data ground truth gives you confidence to act, or whether it has been the wall."
  - Q2 head: "The operator who's actually done this"
  - Q2 body: "Most of the conversations I have had this year about activating logistics data have been with analytics consultants who haven't run the operation. You have. Lumen scaled its operating cadence through three M&A events and kept the same data spine. I want to understand what you actually trust in that data and what you ignore, before I waste anyone else's time pitching abstraction."
- Footer: Primary "Join meeting in Zoom" + Ghost "Request reschedule"

### Calendar view — June 2026 chips
- Mon 2 Jun: "Acme Robotics" (held)
- Tue 17 Jun: "Anvil Software" (confirmed)
- Thu 19 Jun: "Coastline Logistics" (confirmed)
- Mon 30 Jun: "Pillar Risk" (confirmed)
- Today: Sun 8 Jun — solid emerald circle behind "8".
- (Past months would show held chips in soft-green-fill; out of June scope for this lock.)

## Data sources per module (build-chat reference)

| Module | Source | Notes |
|---|---|---|
| Topbar page label "Meetings" | static | |
| Topbar universal search | command-palette overlay (Pass B); live-filters meetings + vendors + charities + requests | `⌘K` opens; persists across exec routes |
| Page eyebrow "Your meetings" | static | |
| Page H1 "Meetings" | static | |
| Stat 1 "12 held this financial year" | `count(meeting WHERE executive_id=? AND status='held' AND held_at IN current_fy)` | Emerald-accent (single-accent rule) |
| Stat 2 "3 coming up" | `count(meeting WHERE executive_id=? AND status='confirmed' AND scheduled_at >= now())` | |
| Stat 3 "28 lifetime" | `count(meeting WHERE executive_id=? AND status='held')` lifetime | Frozen-at-Held sum |
| Calendar banner state | `executive.calendar_connection_status` ('disconnected' / 'connected') | Renders banner when disconnected; quiet sync-strip when connected |
| Calendar banner CTAs | OAuth flows for Google + Outlook | Provider routes via `lib/calendar.ts` |
| Controls Calendar/List toggle | URL `?view=calendar` (default `list`) | |
| Controls All/Upcoming/Past toggle | URL `?range=all` (default) / `upcoming` / `past` | Filters the section cards' row contents; section cards themselves still render if they have rows in scope |
| Sort dropdown | URL `?sort=recent` (default) / `oldest` | Applies within each section card |
| Section card "Upcoming · N" count | `count(meeting WHERE executive_id=? AND status='confirmed' AND scheduled_at >= now())` | Always open, no chevron |
| Section card "Past · N" count | `count(meeting WHERE executive_id=? AND status='held')` | Collapsed by default; full count, not rendered subset |
| Section card "Cancelled · N" count | `count(meeting WHERE executive_id=? AND status='cancelled')` | Collapsed by default; rendered only when N > 0 (hide whole card otherwise) |
| Row identity | `meeting.vendor_user.name`, `vendor_user.title`, `vendor.name` | |
| Row avatar | `vendor_user.photo_url` photo-primary, initials fallback per locked rule | Existing field from Exec Dashboard lock |
| Row meta line — Upcoming | "Accepted [Weekday] [D] [Mon] · Gift will go to [charity_short_name]" — `meeting.accepted_at`, `gift_record.charity_id` if override OR `executive.default_charity_id` | Charity short name resolved via `charity.short_name` (NEW field — e.g. "RFDS" for "Royal Flying Doctor Service") |
| Row meta line — Past | "Gift went to [charity_short_name]" — `gift_record.charity_id` snapshot, appends "(overridden)" if `gift_record.charity_id != executive.default_charity_id at held_at` | Frozen at Held |
| Row meta line — Cancelled | "Cancelled by [actor] · [Weekday], [D] [Mon]" — `meeting.cancelled_by`, `meeting.cancelled_at` | actor = 'exec' / 'vendor' / 'admin' |
| Row status word + dot | `meeting.status` mapped to display: Confirmed (emerald) / Held (soft-green) / Cancelled (neutral) | Status copy stays italic per editorial register |
| Row right cluster — date | `meeting.scheduled_at` formatted Fraunces "Weekday, D Mon" | Locale: AU |
| Row right cluster — time/duration/provider | "HH:MM AEST · M min · [Provider]" Inter | Provider micro-icon via `lib/icons.ts` |
| Row click | Opens drawer (`?drawer=<meeting_id>` URL) | |
| Calendar grid month | URL `?month=2026-06` (default current month) | |
| Calendar grid chips | `meeting WHERE executive_id=? AND scheduled_at IN month` GROUP BY date | Each chip is a single meeting; multi-meeting days stack |
| Calendar TODAY treatment | Today's date number rendered with emerald circle bg | Computed at render |
| Drawer eyebrow | status-aware text from `meeting.status` | "Confirmed meeting" / "Past meeting · Held" / "Cancelled meeting" |
| Drawer identity | `meeting.vendor_user` joined to `vendor` | |
| Drawer credibility line | `vendor_user.bio_one_liner` | Existing field from Exec Incoming Requests lock |
| Drawer LinkedIn | `vendor_user.linkedin_url` | Outbound, new tab |
| Drawer When section | `meeting.scheduled_at` + `meeting.duration_minutes` + `meeting.conference_provider` + `meeting.accepted_at` | |
| Drawer Your gift section | `gift_record.charity_amount_cents` (frozen at Held) OR `bandForMeetingNumber(vendor.cycle.held + 1).rateCents` (projected pre-Held); `gift_record.charity_id` OR `executive.default_charity_id` | Per CALCULATIONS.md; never hardcoded |
| Drawer charity logo | `charity.logo_url` | Scraped; fallback short-mark on `--portal-amber-soft` |
| Drawer pitch context Q1 head + body | `request.q1_head` + `request.q1_text` | Existing fields from Exec Incoming Requests lock |
| Drawer pitch context Q2 head + body | `request.q2_head` + `request.q2_text` | Existing fields |
| Drawer footer — Confirmed | Primary "Join meeting in [provider]" links to `meeting.conference_url`; Ghost "Request reschedule" creates admin task | |
| Drawer footer — Held | Primary "View charity impact" → `/exec/impact#gift_<id>` ONLY ("Send a thank you" cut from v1 — ratified 2026-06-12) | |
| Drawer footer — Cancelled | Hidden | |

**No money number is computed in the page.** Every $ figure reads from `@thegoodintro/pricing` or `lib/reporting.ts`. The "$1,000 to RFDS" in the locked drawer sample is illustrative; the build hydrates from `gift_record.charity_amount_cents` (Held) or `bandForMeetingNumber(...)` (Confirmed).

## NEW data field required from this lock

`charity.short_name text NULL` — a 3-5 letter abbreviation used in dense list contexts ("RFDS" for "Royal Flying Doctor Service"; falls back to full `charity.name` when null). Used in row meta lines on this page; pattern reusable on Impact list and Profile.

Existing fields used (no new additions beyond `charity.short_name`):
- `vendor_user.photo_url` — from Exec Dashboard lock.
- `vendor_user.bio_one_liner` — from Exec Incoming Requests lock.
- `request.q1_head`, `request.q1_text`, `request.q2_head`, `request.q2_text` — from Exec Incoming Requests lock.

## Open decisions parked (do NOT silently resolve)

- **David Wu charity reconciliation** — Recent Impact on the locked Exec Dashboard shows David Wu's gift as Beyond Blue (override); this page's locked sample renders him as RFDS standing. Pick one (recommend: keep David Wu as RFDS standing on the Meetings List and update the Exec Dashboard's Recent Impact row to RFDS standing too — overrides are over-represented across the sample set). Resolve before build hydrates sample data.
- ~~**Connected calendar banner** — DISCONNECTED state is locked; CONNECTED state (quiet sync-strip with last-sync timestamp) is NOT designed. Build chat can stub or design ahead of v1 launch.~~ **RESOLVED 2026-06-12 on Exec Small States Batch** — the connected quiet strip is designed and locked (tint row, provider + last-sync line + "free and busy only, never event details" + "Manage in Profile →"). See `../exec-small-states-batch/README.md` VP1.
- **Drawer footer for Held meetings** — Primary CTA "View charity impact" assumes the Impact list page has anchor-deep-linking by gift id. Confirm anchor format with the Impact list lock (not yet designed).
- **Search command palette overlay** — universal topbar search is locked as a chrome affordance; the overlay UI it opens to is Pass B. Defer to the next exec-portal lock that needs search to exist. **AMENDED 2026-06-12 (v1 scope decision, ratified):** the search input ships BEHIND A FEATURE FLAG, default off, until the palette exists — search that opens nothing is worse than no search. The chrome spec is unchanged; the flag only controls render.
- **Pagination inside Past expanded card** — current spec uses inline pagination ("Showing 7 of 13 · Previous / Page 1 of 2 / Next") inside the expanded card. Alternative: render all 13 rows when expanded (no pagination). Recommend pagination for N > 20; for N ≤ 20 render all. Build chat call.
- **Per-meeting overrides — how the drawer surfaces a past override** — the meta line says "(overridden)"; the drawer's Your gift section currently says "Your standing nomination" (Mira sample) but should switch to "For this meeting only · Your standing nomination (Royal Flying Doctor Service) stays" when a meeting carries an override. Confirmed mid-iteration but not visually rendered in any locked viewport.
- **Cancelled meeting drawer footer** — currently hidden. Alternative: show a quiet "View cancellation note" ghost link when `meeting.cancellation_note` exists. Defer; v1 hides the footer.

## Anti-list (do not regress)

- **No filled card or banner around the page-header stats.** The mini-strip is naked text with hairline dividers. Trying again was rejected in iteration ("looks like a marketing CTA").
- **Single-accent rule applies to the stat mini-strip.** Only the first number is emerald. The second and third stay ink.
- **No status ring around list-row avatars.** The 2px colored ring around 40px row avatars was tried and rejected. Status reads via the dedicated status column (dot + italic word).
- **The drawer IS the detail surface.** A standalone `/exec/meetings/[id]` page is explicitly killed by this lock. Row click opens drawer; URL reflects the drawer via `?drawer=<id>`; deep links from email open the list view with the drawer pre-opened.
- **Past + Cancelled sections collapse BY DEFAULT.** Do not flip the default to expanded for "completeness." The reason to make them collapsible is to make the page short and scannable on land.
- **Section counts in headers show the REAL total, not the rendered subset.** "Past · 13" stays 13 even when paginated to show 7.
- **Universal topbar search applies to every exec page going forward.** Right edge of topbar still stays content-empty (no bell, no help, no date). Search is the only thing that joined the topbar.
- **Editorial register applies to CHROME ONLY.** Tables, calendar grids, filters, search, list rows, drawer body internals are allowed to function as proper SaaS. Reference register: Linear / Pitch / Vercel. Do not over-apply editorial restraint to operational data structures.
- **No mono uppercase** on this page, on either viewport. Section heads are Fraunces; eyebrows are italic Inter.
- **No status pills, chips, or badges.** Status reads as dot + italic word. Pills are forbidden across the exec portal.
- **No emoji.** Sanctioned 🎉 emoji exception applies ONLY to `/exec/requests` VP2. Never propagate.
- **No em or en dashes.** Use "·" as separator.
- **Hairline borders only**, no drop shadows.
- **Photo-primary avatars with initials fallback** at the locked sizes (40px row, 64px drawer). Photos live INSIDE the small circle (object-fit: cover); they do NOT replace the avatar container.
- **Drawer backdrop = 20% ink dim + 2px blur.** Same as the locked Exec Dashboard charity picker modal backdrop. Do not invent a separate drawer backdrop.
- **Drawer footer Primary action has higher visual weight (flex 2) than the Ghost reschedule (flex 1).** Equal weighting was tried and rejected.
- **The Connect-your-calendar banner sits between the page header and controls bar, not above the page header.** Order is locked.
- **Sort dropdown lives in the controls bar, not the topbar.** The topbar is reserved for page title + universal search only.
- **Forbidden vocab** (brand-wide): marketplace, magic, wizard, coaching, program, MeetMagic, AlphaSights.

## Sample data continuity check (every exec screen aligns here)

- Signed-in exec: Priya Raghavan · CFO · Lumen Industries · `priya@lumenindustries.com` · EXC-1042 · standing charity Royal Flying Doctor Service.
- Today: Wednesday, 10 June 2026 (Exec Dashboard locked today is Mon 8 Jun; pick one in build — recommend updating Exec Dashboard sample to Wed 10 Jun for consistency).
- This FY: 12 meetings held · $12,000 to charity · 8 charities supported.
- Lifetime: 28 meetings · $28,000 lifetime.
- 8 locked charities: Beyond Blue · OzHarvest · Royal Flying Doctor Service · The Smith Family · Black Dog Institute · Australian Red Cross · Cancer Council Australia · Australian Conservation Foundation.

## Issy's fix passes (the design narrative)

1. **v1 → v2:** First pass page header used a giant filled emerald rounded card around the three stats. Issy: "looks like a marketing CTA". Replaced with the inline three-stat mini-strip, hairline dividers, single-accent on the first number only.
2. **v2 → v3:** List view had Upcoming and Past in a single container with internal eyebrows. Issy: "should be more separated". Split into three separate cards (Upcoming / Past / Cancelled) with 32px gaps.
3. **v3 → v4:** Past was open by default. Issy: "the Past held in list view should be collapsable". Past + Cancelled collapse by default with chevron; Upcoming stays always open with no chevron. Counts in headers reflect real total, not rendered subset.
4. **2px status ring around row avatars (rejected):** Tried at v2. Read as heavy-handed visual chrome. Removed. Status moved to a dedicated column with dot + italic word.
5. **Editorial register on Meeting Detail (rejected in prior pass):** A standalone Meeting Detail page was iterated and called "newsletter stick-on, not SaaS" by Issy. Killed. Detail surface is now the drawer. The architectural principle "editorial on chrome, SaaS inside" emerged from this rejection.
6. **Drawer backdrop:** Reused the locked Exec Dashboard charity picker backdrop (20% ink + 2px blur) verbatim. No new backdrop pattern needed.
7. **Drawer footer weighting:** Equal-flex Primary + Ghost was tried; Primary "Join meeting" should dominate. Settled on flex 2 / flex 1 split.

## NOT designed in this pass (deferred)

- Calendar Week view ~~(toggle exists; Week not visually designed)~~ — **AMENDED 2026-06-12 (v1 scope decision, ratified): the Month | Week toggle is DROPPED from the v1 build entirely** (the mockup's toggle is not ported; calendar header renders Month-only). Reinstate only when a Week view is designed and locked.
- Calendar TODAY treatment beyond current month (out-of-month tinted dates are designed; jumping months Pass B).
- Empty states: 0 upcoming / 0 past / 0 cancelled / 0 total (no meetings ever).
- Loading / skeleton states for the section cards and calendar grid.
- Connected-calendar banner (sync timestamp strip).
- Drawer states for Held meetings ("View charity impact" + "Send a thank you" footer was specced but not yet rendered in any locked viewport).
- Search command palette overlay (the universal topbar search opens it; the overlay itself is Pass B).
- Hover / active / focus states on toggles, sort dropdown, calendar chips, drawer buttons.
- Mobile viewport (drawer likely becomes a bottom-sheet; section cards stack natively; calendar swaps to agenda list).
- EA mode "Acting for Priya" banner on this page.
