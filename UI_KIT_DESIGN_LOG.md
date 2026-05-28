# UI Kit Design Log (the bridge between Claude Design and the build)

The locked visual decisions coming out of the Claude Design sessions for the
`packages/ui` kit and the reference screens. It exists so the build chat ports the
ACTUAL locked design, not just the original `UI_KIT_BRIEF.md`. The brief is the
component API contract; THIS log is what changed/locked during visual iteration.

**Port rule for the build chat:** when a screen is marked LOCKED here, port it from
(a) this log, (b) `UI_KIT_BRIEF.md` for the component APIs, and (c) the Claude Design
output Issy provides (screenshots + exported code). Do NOT port from the brief alone;
the refinements below override it where they differ. Visuals iterate in Claude Design
first, then port (the established workflow).

## Global decisions (apply to every screen)

- **Per-portal sidebar colour (evolves "emerald sidebar only").** Each portal is
  identified by its sidebar colour; everything else (cream page, dark ribbon, amber
  accent, all components) stays identical across portals.
  - Admin = brand emerald `oklch(0.42 0.13 158)` (LOCKED).
  - Vendor and Exec = their own deep, brand-safe tones, assigned when those dashboards
    are designed (candidates: deep teal-pine, deep clay/bronze). TBD.
  - FORBIDDEN for any portal: purple/violet (reads as the competitor MeetMagic), blue,
    pink, bright yellow. When the vendor/exec tones are locked, update FACTS.md and
    PORTAL_LAYOUT_BLUEPRINT.md (which currently say "emerald sidebar only").
- **Wordmark:** `TheGoodIntro`, one word, with "Good" in the emerald highlight (per
  FACTS.md). NOTE: the first dashboard render showed "The Good Intro" (three words);
  the locked form is one word unless Issy explicitly chooses the spaced logo.
- **Breathing room:** a touch more padding and line-height than strict HR-Partner
  density; operational, not cramped, not marketing-airy. The top metrics ribbon is
  laid out as **two rows of four** stats, never eight across.
- **Distributions** render as a **horizontal-bar variant** (per row: label, value, a
  small proportion bar), not mini donut charts.
- **Every widget ships three states** (blueprint section 0): empty (considered copy +
  an action, e.g. "All clear"), loading (real shimmer skeletons, no spinners), error
  (inline "Could not load… other widgets unaffected" + Retry + last-refresh time).

## Features surfaced during design

- **Tags (admin-only)** — full spec in `TAGS_FEATURE.md`. Free-form labels on
  vendors and (separately) executives; add/remove via a **"Tags" item in the record's
  left module rail** (NOT the profile header, which keeps only structured chips), in
  bulk from a list (record-centric), and via a dedicated **Tags management page** in
  the admin side nav (Configure -> Tags) where you manage the vendor/exec tag sets and
  bulk-apply tags at scale (tag-centric). **Visible ONLY in the admin portal; staff-only at the RLS
  layer** so vendors/execs can never read their own tags via the API. Tags are
  distinct from structured chips (Tier, ID, derived "Renewal due"), which are NOT
  tags. New schema (tag / vendor_tag / executive_tag) + admin UI; the build must
  implement it.

## Screens

### Admin Dashboard — LOCKED (pending the wordmark call)
Claude Design file: `claude.ai/design` "Admin Dashboard v2". Layout:
- Top: dark `--portal-ribbon` band, 8 stats in two rows of four (scheduled this month,
  booked ahead, completed MTD, active vendors / active executives, to charity, revenue
  month, revenue year).
- Row: **Booked Meetings** calendar (8-col, Calendar/List toggle) + **Pending
  Requests** (4-col, status pills: Review/Match/Exec/Block).
- Row: **Needs Action** (8-col, red dot = manual follow-up, "N open · M assigned to
  you" footer) + **Distributions** (4-col, horizontal bars: meeting status, vendors by
  tier, exec capacity, charities supported).
- Row: **Unresponded Comms** / **Recent Onboards** / **Gifts Sent** (4-col each).
- A "Component States" section demonstrates the empty / loading / error variants.
- Note: the Gifts-Sent dollar figures in the mock are placeholder; real values come
  from `@thegoodintro/pricing` + `lib/reporting.ts`, never hardcoded.

### Admin Meetings list (T3) — LOCKED
Dual view (Calendar + List toggle), same kit as the dashboard.
- Stat ribbon (3): upcoming meetings, pending requests, meetings satisfied.
- **Calendar:** month grid with per-day meeting chips, a status colour legend
  (Confirmed / Held / Needs attention / Proposed / Cancelled-No-show, cancelled
  shown strikethrough), "today" highlight, "+N more" overflow, Month/Week/Day.
- **List (T3 DataTable):** columns Vendor · Executive (avatar) · Date · Status
  (pill) · Credit · Gift. Filter popover with per-status counts; pagination.
- **Credit column rule (money-accurate, do not regress):** a credit is a flat
  $1,500. Proposed = "None"; Confirmed = "Reserved · $1,500"; Held = "Consumed ·
  $1,500"; confirmed-but-unpaid overcommit = "Awaiting payment". Never any other
  amount.
- **Gift column:** the frozen charity amount only on Held rows, a dash otherwise.
- Filter/ribbon/pagination numbers reconciled to one consistent set.
### Admin Vendor detail (T4) — to do
### Admin New Executive form (T5) — to do
### Vendor Get-started checklist (T6) — to do
### Vendor dashboard + Exec dashboard — to do (these introduce the per-portal sidebar colours)

Update this log as each screen is locked.
