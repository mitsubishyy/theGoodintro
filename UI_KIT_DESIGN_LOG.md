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
  FACTS.md). NOTE: renders keep showing "The Good Intro" (three words). Wordmark call
  PARKED by Issy 2026-05-29 (not yet settled); must be resolved before the kit is
  ported because `check:copy` will reject the spaced form. Applies to every screen.
- **Admin sidebar IA (established across the locked admin screens).** Grouped into
  OPERATIONS (Dashboard, Meetings ▾, Vendors, Executives, Checklists, Gifts &
  Charities), COMMUNICATION (Inbox, Templates), CONFIGURE (Reports, Tags, Settings).
  This evolved the blueprint's flat list (it merged Giving + Charities into "Gifts &
  Charities" and Comms into "Inbox", and added Templates). PORTAL_LAYOUT_BLUEPRINT
  section 4A should be updated to match (still TODO).
- **Status pills use Inter, title case, single line** (e.g. "In progress", "Complete",
  "Overdue", "New") with a leading status dot and tone colours (gold / green / red /
  grey). Column headers, eyebrows and count badges KEEP mono uppercase. Locked
  2026-05-29 on the Checklists Assigned tab; apply to status pills on every list
  screen (the Meetings list still uses the old mono uppercase pills, update when next
  touched).
- **List filters use a collapsible "Filters" panel** (a Filters button with a chevron
  and a gold dot when any filter is active; opens a bordered panel with each filter on
  its own row and Clear at the bottom). Adopt as the standard list-filter pattern; the
  Meetings list currently uses a popover, reconcile to this when next touched.
- **Breathing room:** a touch more padding and line-height than strict HR-Partner
  density; operational, not cramped, not marketing-airy. The top metrics ribbon is
  laid out as **two rows of four** stats, never eight across.
- **Distributions** render as a **horizontal-bar variant** (per row: label, value, a
  small proportion bar), not mini donut charts.
- **Every widget ships three states** (blueprint section 0): empty (considered copy +
  an action, e.g. "All clear"), loading (real shimmer skeletons, no spinners), error
  (inline "Could not load… other widgets unaffected" + Retry + last-refresh time).

- **Accent colour (updated 2026-05-28):** the single portal accent is now **antique
  gold / soft champagne `oklch(0.78 0.07 85)`**, replacing the old amber everywhere
  (notification/count badges, links, status dots, warnings, proportion bars). The
  token NAME stays `--portal-amber`; only the value changed (soft/ink re-derived to
  match). Source of truth: `packages/tokens/src/portal.css`. Apply across every
  screen.

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
### Admin Vendor detail (T4) — LOCKED
Header: identity + status pill + **structured chips only** (Tier, ID, Renewal due),
NO tags in the header; trimmed to ~4 key facts. Body: left module rail (Overview /
Users & Seats / Requests / Meetings / Billing & Credits / Checklist / Tags / Notes,
with amber attention badges) + centre active module + right **append-only Activity
feed**. **Tags module** (in the rail): current tags as removable chips + multi-select
add (typeahead + create-new) + a bulk-apply control + an append-only tag-change
history. Credits block uses the locked credit money rule (1 credit = $1,500 flat).
Money note: the per-meeting charity in the mock is illustrative ($1,100 flat); the
build pulls the real per-band frozen amount, never a flat figure.
### Admin Vendors list (T3) — LOCKED 2026-06-02 (pending the wordmark call)
Claude Design file: "Admin Vendors". Folder:
[`design/locked/admin-vendors-list/`](design/locked/admin-vendors-list/).
The helicopter view that opens from sidebar "Vendors". Row click navigates to
`/admin/vendors/{id}` (the locked Admin Vendor detail).
- **Header:** breadcrumb Home / Vendors, H1 "Vendors" + mono count
  ("14 active / 17 all"), Filter button (active-count amber pill suffix),
  Sort dropdown (default "Date joined · Newest first"), primary ink
  "+ New vendor".
- **Stat ribbon (3 stats, dark band, full-width, no rounded corners):**
  ACTIVE VENDORS (number + "N onboarding"), CREDITS RESERVED (count +
  "across N vendors"), REVENUE MTD ($ + "YTD $..."). Money rule:
  revenue values pulled from `reporting.ts`; a credit is locked at $1,500
  flat so the credits-reserved stat is a COUNT, not a $ figure.
- **DataTable columns:** VENDOR (40px logo + company name in Inter 13px
  semibold + primary contact name/email in Inter 12px muted on sub-line) ·
  TIER (mono uppercase pill, soft-amber background, TIER 1-4) · CREDITS
  (count, mono right-aligned, RED DOT on 0 = locked-out signal) · RENEWS
  (date, mono right-aligned) · JOINED (date, mono right-aligned) · STATUS
  (pill with dot, right-aligned) · (overflow ...).
- **Tier mapping** (per CALCULATIONS §0.4 / FACTS): Tier 1 = meetings 1-5
  in current 12-month rolling cycle, Tier 2 = 6-10, Tier 3 = 11-15,
  Tier 4 = 16+. No money figure on the tier pill itself.
- **Credits column:** count only. Red dot at 0 (locked out — exec
  directory hidden). `—` for vendors not yet purchased (Onboarding).
- **Status pills:** Inter 11px title case + 6px dot. Active (gold dot),
  Onboarding (amber dot), Dormant (amber lower-opacity), Paused (slate),
  Churned (muted, row 60% opacity).
- **Row overflow menu:** Open profile, Send onboarding email, Mark
  vetting call done, Pause vendor, Add credit manually, Archive.
- **Filter popover sections** (all collapsible, per-status counts where
  applicable): STATUS (Active default on), TIER (chip multi, per-tier
  counts), CREDIT BALANCE (All / Zero / 1-2 / 3+), INDUSTRY (typeahead),
  COMPANY SIZE (chips: 1-50, 51-200, 201-1000, 1000+), REGION (chips by
  state), HAS OUTSTANDING INVOICE (All / Yes / No), HAS RECENT MEETING
  (All / 30 days / 90 days / None), RENEWS WITHIN (All / 30 / 60 / 90),
  JOINED (All / 7 / 30 / 90 / Custom). Saved views top of popover. URL
  reflects filters.
- **Bulk actions** (when checkbox ticked): Apply tag, Change status to...,
  Send onboarding email, Pause, Add credit manually, Archive, Export
  selected (CSV), Cancel.
- **Pagination:** 48px row at table bottom; "Showing 1-25 of 17", page
  links, rows-per-page dropdown (10 / 25 default / 50 / 100).
- **Empty state:** antique-gold outline icon (stacked-card / vendor-logo
  silhouette, 48px), heading "No vendors yet", muted body about the
  vetting call sign-up flow, primary "+ Add a vendor manually".
- **Loading state:** stat ribbon shimmer bars, header row + 8 skeleton
  rows.
- **No "charity" column** on vendor rows (vendors don't pick a charity;
  the exec does, per meeting).
- **No response-rate column** (same reason as the locked Executives list;
  calc not yet defined).

### Admin Executives list (T3) — LOCKED 2026-06-02 (pending the wordmark call)
Claude Design file: "Admin Executives". Folder:
[`design/locked/admin-executives-list/`](design/locked/admin-executives-list/).
The helicopter view that opens from sidebar "Executives". Row click navigates
to `/admin/executives/{id}` (the locked Admin Executive detail).
- **Header:** breadcrumb Home / Executives, H1 "Executives" + mono count
  ("47 active / 51 all"), Filter button (active-count amber pill suffix),
  Sort dropdown (default "Date joined · Newest first"), primary ink
  "+ New executive".
- **Stat ribbon (3 stats, dark band, full-width, no rounded corners):**
  ACTIVE EXECS (number + "N new this month"), MEETINGS HELD YTD
  (number + "+N vs same time last year"), CHARITY RAISED YTD ($ + "across N
  meetings"). Money rule: charity total pulled from `reporting.ts`, never a
  flat figure.
- **DataTable columns:** EXECUTIVE (avatar + name + title) · COMPANY ·
  CHARITY · LAST MEETING · JOINED · STATUS · (overflow). **No response-rate
  column** (Issy removed it 2026-06-02; calc undefined; see open decision
  below).
- **Status pills:** Inter 11px title case with a 6px dot. Active (gold dot),
  Onboarding (amber dot), Dormant (amber lower-opacity), Paused (slate),
  Churned (muted, row 60% opacity).
- **Row overflow menu:** Open profile, View as EA, Send test email, Pause
  exec, Archive, Copy email.
- **Filter popover sections** (all collapsible, with per-status counts):
  STATUS (Active default on), COMPANY (typeahead multi), TITLE / SENIORITY
  (chip multi: CFO, COO, CRO, CTO, CEO, CMO, CIO, Other), CHARITY (typeahead
  against DGR list, multi), INDUSTRY (typeahead), REGION (chip multi: NSW,
  VIC, QLD, WA, SA, ACT, TAS, NT, Overseas), HAS EA (All / Yes / No),
  CALENDAR CONNECTED (All / Yes / No), JOINED (All / 7 / 30 / 90 / Custom).
  Saved views top of popover. URL reflects filters.
- **Bulk actions** (when at least one checkbox ticked): Apply tag, Change
  status to..., Send onboarding email, Pause, Archive, Export selected
  (CSV), Cancel.
- **Pagination:** 48px row at table bottom; "Showing 1-25 of 51", page
  links, rows-per-page dropdown (10 / 25 default / 50 / 100).
- **Empty state:** centred antique-gold outline icon (two stacked person
  silhouettes, 48px), heading "No executives yet", muted body explaining
  what happens once they're added, primary "+ Add your first executive".
- **Loading state:** stat ribbon shimmer bars, table header + 8 skeleton
  rows.
- **Open decision (Issy 2026-06-02):** response-rate column was removed from
  the issued prompt because the calculation isn't yet defined (accepts ÷
  requests, over what window). Until response rate has a locked
  definition, do NOT add the column to this list or use it as a field in
  any other screen. The KEY METRICS row "Response rate / 78%" on the locked
  Admin Executive detail is illustrative; the build hides or computes it
  per the eventual locked formula.
### Admin Executive detail (T4) — LOCKED 2026-06-01 (pending the wordmark call)
Claude Design file: "Admin Executive Detail". Folder:
[`design/locked/admin-executive-detail/`](design/locked/admin-executive-detail/).
Symmetric counterpart to the Vendor detail; same register, different content.
Header: 56px avatar + identity line (Title · Company · Location) + status pill +
**structured chips only** (ID, MEETINGS, RESPONSE RATE, EA-on-file), NO tags in
the header; action cluster top-right (View as EA, Send test email, Edit profile,
overflow). Body: left module rail (Overview / Business context / Charity /
Calendar & EA / Requests / Meetings / Consent record / Notes, with amber
attention badges) + centre active module + right **append-only Activity feed**
(gold timeline rail, 56px rows, newest-first toggle).
- **Overview module** (default): two-column field grid, IDENTITY / STATUS /
  KEY METRICS sections. Mono uppercase section headers with right-aligned
  captions. Key metrics include meetings held/declined/rescheduled, response
  rate, charity raised through them, last response time.
- **Business context module:** INTERESTED IN / CURRENT OR UPCOMING PROJECTS /
  AREAS NOT INTERESTED IN / TIMELINE / MEETING CADENCE / SENIORITY SIGNAL.
  Below: locked helper line "Used by the matching engine to surface relevant
  vendor requests. Admin-only context, never shown to vendors." (intentional
  "matching engine" framing per [[thegoodintro-matching-engine-framing]];
  never "AI", admin-only).
- **Charity module:** chosen-charity chip with ABN + Change charity action;
  inline note "Executive can override per meeting at acceptance time."; table
  of past gifts (Date Sat · Meeting · Charity · Amount · Status), total at
  footer. Money rule: per-meeting amount varies by the vendor's tier band at
  the time of the meeting (NOT a flat $1,000); build pulls
  `gift_record.keep_amount_cents` via the reporting library.
- **Calendar & EA module:** Connection status chip (Google/Outlook · Connected
  · Last sync timestamp), Timezone, Preferred window chip, EA name/email/last
  action, Remove EA (with confirm), Connect another calendar.
- **Consent record module:** read-only locked block with "Tamper-evident"
  pill. Fields: Captured at, Terms version, Email message-id (click-to-copy,
  mono truncated), Captured by ("executive" per DEC-9), Action taken, IP
  recorded. Locked explainer copy: "Consent is captured automatically the
  first time this executive actions a request email (accept, decline, or
  reschedule). Nothing was sent before this point. Record is append-only and
  cannot be edited." Aligns with DEC-10. **No e-signature affordance on this
  module.**
- **Requests, Meetings, Notes modules:** inherit the Vendor detail patterns
  (T3 sub-tables inside the centre area, append-only Notes thread). No new
  patterns introduced.
- **Three states designed:** Loaded · Loading (header band, rail, centre,
  feed all as skeletons) · Empty (a freshly-created exec, status pill
  Onboarding, dashes in chips except ID, amber "Setup needed" badges on
  Calendar & EA + Consent record, Overview shows a banner "This executive
  hasn't connected their calendar yet. They'll receive their first request
  email once you connect their calendar. [Send onboarding email →]").
- **Click flow:** Sidebar / Executives → `/admin/executives` (T3 list) →
  row click → `/admin/executives/{id}` (this screen). Never deep-link from
  the sidebar.
### Admin New Executive form (T5) — LOCKED (pending the wordmark call)
Claude Design file: "Admin New Executive". Mono uppercase section headers with
right-aligned captions; two-column field grid; sticky bottom bar ("Draft,
auto-saved" + ghost Cancel + ink "Create executive"); a FIELD STATES row
demonstrating default / focused / error / disabled.
- IDENTITY: First name*, Last name*, Title*, Company*, Photo (optional, upload only,
  no "Take from LinkedIn").
- BUSINESS CONTEXT: Interested in*, Current or upcoming projects, Areas you're not
  interested in, Timeline* (select), Suggested meeting cadence* (select), Seniority
  signal (select). The "matching engine" helper copy is INTENTIONAL and kept (admin
  only, never "AI", never on vendor/exec surfaces) — see
  [[thegoodintro-matching-engine-framing]].
- QUALIFICATION: Qualification notes (optional), admin-only screening.
- CHARITY: Standing charity* (DGR-endorsed; exec can override per meeting). No money
  figures on this form.
- CALENDAR & EA: Connect calendar (Google / Outlook, OPTIONAL AT CREATE, connect now
  or save and connect later), Timezone*, EA name, EA email.
- CONSENT: no e-signature. Dash-free copy naming the terms version: "Consent is
  captured automatically. The first time the executive actions a request email
  (accept, decline, or reschedule) we record that as their consent to participate,
  storing the timestamp, terms version, and email message-id against this profile.
  Nothing is sent to the executive until you connect their calendar and create the
  first meeting." (aligns with DEC-10).
- OPEN: sidebar wordmark renders "The Good Intro" (three words); parked, see global
  decisions above.
### Admin Tags management page — LOCKED
Claude Design file: "Admin Tags". Admin-only tag manager (TAGS_FEATURE.md), in the
sidebar under Configure > Tags.
- Page: breadcrumb HOME / TAGS, title "Tags", subtitle "Internal labels for
  segmenting vendors and executives. Admin only, never visible to vendors or
  executives.", "+ Add tag" primary action top-right.
- Two tabs, separate sets: "Vendor tags" (6) and "Executive tags" (5). Each is a
  dense list with TAG (chip) + MEMBERS (count) columns, mono uppercase headers, a
  per-row kebab (Edit = rename/recolour, Delete = removes the tag from all members),
  and a PREVIEW STATE toggle (Loaded / Loading / Empty / Error).
- Add tag modal: Name (required, unique within the set), optional Colour, a scope
  chip (VENDOR / EXECUTIVE), live preview chip, Create disabled until named.
- Tag chips are MULTI-COLOUR by deliberate choice (gold, green, blue, pink, purple,
  grey). The marketing colour bans (purple/blue/pink) do NOT apply inside the
  platform; see [[competitor-colour-bans-marketing-only]].
- Member drawer (click a tag chip): VENDOR/EXECUTIVE TAG label + tag chip + close,
  "N vendors carry this tag", Rename/recolour + Delete, then APPLY TO VENDORS: a
  searchable multi-select of vendors (or execs, matching the tab) with avatar, name
  and ID, a "TAGGED" marker and checkbox on records already carrying it, Select all
  / Clear all, an "N selected" count, and a pending-change footer ("No changes to
  apply" when none, Cancel / Apply). This is the tag-centric bulk-apply-at-scale flow.
- States demonstrated via the PREVIEW STATE toggle: Loaded, Loading (skeleton),
  Empty ("No vendor tags yet..."), Error.

### Admin Checklists — LOCKED (template T6 locked)
Claude Design file: "Admin Checklists". Two tabs (Templates, Assigned), built over two
passes; the HR Partner checklist model was the reference. Vendors (not "employees")
complete checklists.
- **Templates tab (T3):** TEMPLATE / ITEMS / IN USE / UPDATED columns, PREVIEW STATE
  toggle, row kebab (Edit, Duplicate, Archive, Delete, Assign).
- **Template editor:** Template name + Description (admin only); an ordered CHECKLIST
  ITEMS list (drag to reorder) with a "Reuse existing items" panel and an "Add checklist
  item" modal. Six item types: Standard task, Link to external site, Video,
  Electronically sign a document, Fill out a custom form, Download a library document.
  Per item: Description (shown to vendor), who checks it off (Vendor must complete and/or
  Admin must verify), Visible to vendor, Require a file (+ mandatory), per-type target.
  FIELD STATES row included.
- **Assigned tab (T3):** VENDOR / TEMPLATE / ASSIGNED / DUE / PROGRESS (bar + "4 / 6") /
  STATUS columns, collapsible Filters panel, pagination, PREVIEW STATE toggle.
- **Assign checklist modal:** Template dropdown (item counts), searchable vendor
  multi-select (Select all / Clear all, count), optional due date, optional message.
  Also launchable from a template's Assign action (pre-selects the template).
- **Assigned checklist detail = template T6 (LOCKED):** header (vendor, template,
  assigned/due, status pill, progress header "4 / 6 · 67%" + bar + "N items remaining",
  Send reminder / Unassign, "Admin view" label); the item list with per-item state (done
  with "Completed by X on [date]", not started, locked), per-type affordances (Open link,
  Watch, Sign, Fill, Upload, Download), and an append-only Activity feed.
- **OPEN behavioural decision (parked by Issy 2026-05-29):** item gating model. The mock
  shows SEQUENTIAL locking (a later item is locked until the previous one is done), but
  HR Partner and the spec gate each item only by its OWN task (any order). Decide
  independent-vs-sequential before build; if sequential is wanted the template editor
  needs a "complete in order" toggle (not built). Also not yet shown: the "vendor done,
  awaiting admin verify" state with the admin Verify control. Build may clone the
  established patterns for these.

### Vendor Get-started checklist (T6) — to do (clones the LOCKED T6 component above; vendor sidebar colour TBD)
### Vendor dashboard + Exec dashboard — to do (these introduce the per-portal sidebar colours)

Update this log as each screen is locked.
