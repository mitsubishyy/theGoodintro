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
  - Vendor = deep teal-pine `oklch(0.32 0.045 195)` (LOCKED 2026-06-05 on Vendor
    Dashboard). Companion tokens: `--vendor-sidebar-soft oklch(0.42 0.06 195)` for
    hover/active wash, `--vendor-sidebar-ink oklch(0.96 0.02 195)` for text on
    teal-pine. Apply across every vendor screen.
  - Exec = charcoal ink `oklch(0.22 0.008 70)` (LOCKED 2026-06-08 on Exec
    Dashboard). Companion tokens: `--exec-sidebar-text oklch(0.95 0.005 70)`
    (cream-white text), `--exec-sidebar-muted oklch(0.68 0.005 70)`
    (secondary text), `--exec-sidebar-active oklch(0.30 0.008 70)` (active nav
    item bg with 3px `--portal-emerald` left border). Apply across every exec
    screen. The brief's "no heavy sidebar, single-column layout" guidance is
    SUPERSEDED: exec portal IS sidebar + topbar + main, parallel to admin and
    vendor — register, not skeleton, is the differentiator.
  - FORBIDDEN for any portal: purple/violet (reads as the competitor MeetMagic), blue,
    pink, bright yellow. Update FACTS.md and PORTAL_LAYOUT_BLUEPRINT.md (which
    currently say "emerald sidebar only") on next sweep.

- **Vendor-portal vocabulary: "Band", never "Tier" (LOCKED 2026-06-05).** The $900 /
  $1,000 / $1,100 / $1,200 per-meeting charity-share ladder is rendered as "Band 1"
  through "Band 4" in **all vendor-facing copy**: ribbon group title, ribbon value,
  topbar eyebrow (e.g. "ACME ROBOTICS · BAND 2"), credits widget mono header (e.g.
  "BAND 2 · $1,000 TO CHARITY / MEETING"), sidebar identity card. CALCULATIONS.md
  uses "band" and "tier" interchangeably; admin-only docs may keep "Tier" where
  embedded. Anywhere a vendor reads the value, it says Band.

- **Vendor identity card (new pattern, LOCKED 2026-06-05 on Vendor Dashboard).** A
  thin card sits in the vendor sidebar bottom, between the nav list and the user
  chip, separated by hairline dividers in white@10% above and below. Layout: 28px
  rounded-md tile on the left (amber-soft bg + initials in mono uppercase
  `--portal-amber-ink`, OR the uploaded vendor logo) · 12px gap · stacked right:
  vendor name (Inter 13px semibold `--vendor-sidebar-ink`) + band/renewal line
  (e.g. "Band 2 · Renews 12 Mar 2027", Inter 11px @65% opacity). Upload control
  lives in Settings → Company profile (out of scope until that screen is designed).
  The TheGoodIntro wordmark stays at the sidebar TOP; the vendor identity card does
  NOT replace it (brand stability rule).

- **Photo-led exec card grid (new pattern, LOCKED 2026-06-05 on Vendor Dashboard
  "Executives for you" widget).** Where a vendor encounters executives outside a
  T3 list — dashboard previews, suggested-execs surfaces — render a 2-col × N-row
  card grid (16px gap, 20px padding inside the parent widget). Each card:
  `--portal-page` bg (sits on `--portal-card` parent for a layered feel),
  `--portal-line` 1px border, rounded-xl, 20px padding. Top row: 56px circular
  photo (left) + 16px gap + Name (Inter 14.5px semibold) / Title (Inter 12.5px
  muted) / Company (Mono 11px uppercase muted) stacked right. 16px gap → 14px
  heart-outline icon + 6px + charity name in amber-soft pill (Inter 11.5px
  `--portal-amber-ink`, no dot — category tag, not status). 16px gap → full-width
  32px action button: primary ink "Request" OR amber-soft "Requested" chip with
  leading amber dot. Photos in mockup are placeholders; production reads
  `executive.photo_url`.

- **Vendor T3 variant (LOCKED 2026-06-06 on Vendor Executives List).** Vendor
  list screens use a slightly more breathable variant of admin T3: **76px row
  height** (vs admin's 56px dual-line), **48px circular photo** (vs admin's
  32px), **Inter 15px semibold name + 13px muted title** (vs admin's 13.5/12),
  **white table card** (`--portal-card-reading`, vs admin's warm cream), and
  **whole-row click target** with hover lift (subtle box-shadow 0 1px 3px
  rgba(20,40,30,0.06)). Right-aligned 20px chevron-right outline replaces a
  "View →" text link. Photos are REAL headshots in mockups, never initials
  (initials fallback is production empty-state for `photo_url IS NULL`).
  Justification: vendor list is a discovery surface used occasionally; admin
  list is operational and used dozens of times a day. See feedback memory
  `feedback_thegoodintro_vendor_portal_register`.

- **Single-row inline filter bar (LOCKED 2026-06-06 on Vendor Executives List).**
  Vendor-portal variant of the locked "collapsible Filters panel" pattern. When
  the Filters button is open, a 64px row appears between the header strip and
  the table — `--portal-page` bg, no card, no border. Layout: "FILTER BY" mono
  eyebrow + inline filter pills (8–12px gap) + right-aligned "N of P match" +
  hairline + "Clear all" amber link (only when ≥1 filter active). Each pill is
  category + active count only ("Industry · 3 ▾"); empty pills are ghost
  (--portal-line border, no fill, muted text); active pills are amber-soft
  filled. Filter VALUES live inside per-pill popovers (not designed yet),
  NEVER inlined in the bar. The Filters button itself shows the active count
  + amber dot ("Filters · 2 ▾") in the closed state — this is the
  "almost hidden once chosen" affordance that lets the user know filters are
  on without paying any vertical real estate.

- **Sortable column header chevron (LOCKED 2026-06-06 on Vendor Executives
  List).** Column headers on sortable columns are clickable. Default sort has
  no visible chevron at rest (rows pre-sorted by the default field, e.g.
  `created_at DESC`). When a column becomes the active sort, a 10px
  chevron-up or chevron-down outline appears immediately after the header text
  in `--portal-amber-ink`. Cursor changes to pointer on sortable headers only.
  Pattern is admin-eligible too; apply to admin lists when next touched.

- **Soft-green "Meeting complete" status tone (LOCKED 2026-06-06 on Vendor
  Executives List).** Vendor portal status pills use filled backgrounds (a
  variant of the existing locked text+dot status). Sanctioned tones:
  - "Request sent": `--portal-amber-soft` bg + `--portal-amber-ink` text + amber dot
  - "Meeting complete": soft green `oklch(0.93 0.04 155)` bg + dark green
    `oklch(0.38 0.10 155)` text + matching green dot — **NEW vendor portal
    token, distinct from emerald (admin sidebar) and from sage-soft
    (staff-only/AI signal)**. Used for positive completion states.
  - "Declined": `--portal-line` @50% bg + `--muted-foreground` text + grey dot
  - Empty (no history): no pill rendered
  Pill shape Inter 11.5px title case, 4px/10px padding, rounded-full.

- **"WHAT HAPPENS NEXT" numbered-step explainer (LOCKED 2026-06-06 on Vendor
  Executive Detail Drawer).** Reusable vendor-portal pattern for surfacing a
  short multi-step process at a decision moment (drawer footer, before-submit
  card, etc.). Mono eyebrow "WHAT HAPPENS NEXT" (or task-specific variant)
  Inter 11px uppercase tracking-[0.18em] --muted-foreground. 8px gap. Then a
  stack of numbered lines (no card around them). Each line: 18px amber-filled
  circle on the left containing the step number in white mono semibold + 12px
  gap + step copy Inter 12.5px --muted-foreground. 8px gap between lines.
  Three steps is the locked count for the request flow; the pattern itself
  scales to N. Use when a user is about to take an action with a multi-step
  downstream — sets honest expectations without being heavy.

- **Radio-card pattern (LOCKED 2026-06-06 on Vendor Request Form Q3).** For
  binary or small-N choices that need title + supporting subtitle per option.
  Each option is a clickable card (NOT a native radio input), 12px gap between.
  - SELECTED: `--portal-amber-soft` bg, 2px `--portal-amber` ring outline,
    rounded-xl, 16px padding. Leading 16px filled amber circle (with 4px inner
    white ring for radio appearance). 16px gap. Stacked right: Title Inter
    14.5px semibold ink / Subtitle Inter 12.5px --muted-foreground.
  - UNSELECTED: `--portal-card-reading` white bg, 1px `--portal-line` border,
    rounded-xl, 16px padding. Leading 16px ghost circle (1.5px --portal-line
    border, no fill). Same Title / Subtitle stack.
  Cursor: pointer on unselected cards. Whole card is the click target. Re-use
  across vendor + admin where the choice is meaningful enough to warrant a
  card (not just a radio in a list).

- **Vendor T5 variant (LOCKED 2026-06-06 on Vendor Request Form).** Vendor
  forms (first instance is the qualification gate) use a slightly more
  breathable variant of admin T5: **max-width 720px column centered** (vs
  admin's wider editor canvas), **white form card** (`--portal-card-reading`)
  with **warm-cream textareas inside** (`--portal-page`) for layered depth
  without new tokens, **question-numbered mono eyebrows** ("QUESTION N OF M")
  paired with **right-aligned character counters** that shift colour at 80%
  used (`--muted-foreground` → `--portal-amber-ink` → dark red >100%),
  **hairline dividers between questions** inside the card, and a
  **right-aligned action row** outside the card with Cancel ghost + primary
  ink Send. The back-button row above the form follows the locked back
  pattern → parent route. Money information is NOT rendered on the form
  surface itself (deliberate exclusion locked on Request Form 2026-06-06 —
  qualification stays separate from commercial info, which lives on the
  Dashboard ribbon, Billing & Credits, and post-Held gift records).

- **Editorial concierge register for the exec portal (LOCKED 2026-06-08 on
  Exec Dashboard).** The exec portal departs from admin's HR Partner density
  and vendor's photo-led density in REGISTER, not skeleton. Same shell
  structure (sidebar + topbar + main + metric strip + grid), different voice:
  - Section heads are **Fraunces semibold 22px**, NOT mono uppercase eyebrows.
  - Inline labels are **italic Inter 12px** (e.g. "What they want to discuss",
    "Standing nomination"), NOT mono uppercase.
  - **Mono uppercase appears in EXACTLY two places per screen**: date prefixes
    on transaction-feed rows + scroll/pagination helpers. Nowhere else.
  - Status copy is **plain italic text**, NOT pills/chips/badges (e.g.
    "Confirmed.", "DGR endorsed").
  - **Single accent** — `--portal-emerald` only. No amber-soft pills, no
    sage-soft (sage is admin-only/staff-only anyway), no soft-green completion
    tone.
  - **Section gaps**: 72px between major sections (vs admin/vendor's tighter
    density). Card padding 32–40px.
  - **Topbar is content-empty on the right.** No bell, no search, no help, no
    date stamp. The exec portal is the quietest of the three.
  - **No SaaS chrome**: no count chips, progress bars, status pills,
    amber-soft badges, donut grids, work queues.

- **Photo-primary avatar rule (LOCKED 2026-06-08 on Exec Dashboard).** Every
  person avatar on the exec portal is photo-primary, initials-fallback:
  - **Default**: circular avatar at the surface's specced size (32px sidebar +
    Recent Impact, 40px Upcoming, 44px Incoming). Photo INSIDE the circle —
    `width: 100%; height: 100%; object-fit: cover; border-radius: 50%`. 1px
    `--portal-line` 60%-opacity rim. The photo does NOT replace the avatar
    container; it sits inside it.
  - **Fallback**: same circle, `--portal-amber-soft` bg, Inter semibold
    `--portal-amber-ink` initials centered.
  - Render trigger: `photo_url IS NOT NULL` → default; else fallback.
  - Applies to every exec-portal screen (Meetings, Impact, Profile, etc.).
  - **NEW data field requirement**: `vendor_user.photo_url text NULL` —
    vendor users self-upload a profile photo via vendor Settings → Profile
    (currently no upload control on the locked Vendor Settings/Profile
    screen; either add to Pass B of that screen or ship exec portal with
    fallback initials until vendors self-upload). Supersedes the older
    cartoon-avatars-on-platform memory (DiceBear lorelei is no longer the
    direction — real photos with initials fallback is the locked treatment).

- **Modal-only charity-change pattern (LOCKED 2026-06-08 on Exec Dashboard).**
  Every charity-change trigger on the exec portal opens a MODAL picker, NEVER
  a dropdown, drawer, navigation to a separate page, or inline expand. Modal
  overlays the dashboard the user is on; user stays in context.
  - **Modal-on-dashboard structure**: the modal is NOT a standalone file —
    it lives as additional viewports of the source screen's Claude Design
    file (e.g. the dashboard hosts VP1 at rest + VP2 standing-change modal
    open + VP3 per-meeting modal open). Build chat ports modal as a React
    overlay over the dashboard route.
  - **Backdrop dim + blur values (LOCKED)**: `--portal-ink` at 20% opacity
    overlay + 2px backdrop-blur applied to the dashboard underneath. NOT 30%
    + 4px (too aggressive — hides context). NOT 0% (loses focus). 20% + 2px
    is the locked balance — dashboard stays clearly recognisable, modal is
    the focal point. Same values apply to every future exec-portal modal.
  - **Same modal component, context-aware**:
    - Standing-nomination change: title "Change your charity" / sub-line
      "Every meeting you accept will direct your gift to your chosen
      DGR-endorsed charity." / primary CTA "Set as my charity".
    - Per-meeting override: title "Direct this meeting to a different
      charity" / sub-line "Just for this meeting. Your standing nomination
      ([charity name]) stays in place for everything else." / primary CTA
      "Use for this meeting".
  - **Modal anatomy (560px max-width, 80vh max-height)**: sticky header
    (Fraunces 22px title + italic sub-line + X close) → sticky search
    ("Search by name, cause, or ABN") → sticky "Recently directed" pill row
    (3 quick-pick pills) → scrolling list of charities (radio + name + cause
    · ABN + blurb + right-aligned italic "Current" marker on the current row)
    → sticky footer (italic "All charities verified live against the ACNC
    DGR register." + Cancel ghost + primary emerald CTA).
  - **Selection feedback**: emerald-filled radio + very light emerald row
    tint (`color-mix(in oklab, var(--portal-emerald) 5%, white)`). NOT
    amber-soft — emerald owns interaction state on the exec portal; amber-
    soft stays for avatar placeholders + bottom annotation pills.
  - **ACNC DGR register** is the locked verification authority phrase
    (NOT ABR — ABR is for ABNs only; ACNC + ATO administer DGR endorsement).
  - **Sample charity set (8 entries, locked)**: Beyond Blue · OzHarvest ·
    Royal Flying Doctor Service · The Smith Family · Black Dog Institute ·
    Australian Red Cross · Cancer Council Australia · Australian
    Conservation Foundation. Every charity-picker surface in the exec
    portal uses this set (DiceBear pattern: same set, same order).
  - Pattern derives from the static draft at
    `apps/web/app/mockup/exec/ExecDashboard.tsx` (CharityPicker dialog).

- **Direction Card (LOCKED 2026-06-08 on Exec Dashboard).** The exec portal's
  emotional anchor — the standing-nomination charity rendered as a full-
  presence card on the left of the dashboard grid. Structure top → bottom:
  - 96px circular charity logo centered at top (scraped from
    `charity.logo_url`; fallback: 2-3 letter mark on `--portal-amber-soft`).
  - Italic "Standing nomination" eyebrow left-aligned (Inter 12px italic
    `--muted-foreground`).
  - Fraunces semibold 40px charity name (line-height 1.05, tracking-tight).
    Wraps gracefully for longer names.
  - Inter 14px muted cause line.
  - Helper paragraph (Inter 13px muted): "Each meeting you accept sends a
    real gift here. You can direct any individual meeting to a different
    DGR-endorsed charity at the moment it is confirmed."
  - 1px hairline.
  - Inline credentials line, italic Inter 12px muted: "ABN XX XXX XXX XXX ·
    Item N DGR · Live". Single line, NOT a 2-col grid.
  - Two stacked full-width ghost buttons (each 48px tall, white bg, 1px
    `--portal-line` border, 8px radius, Inter 14px semibold upright NOT
    italic, label left + chevron right with 20px inner padding,
    justify-between):
    - "Learn about [Full Charity Name] →" (opens charity detail modal — Pass B,
      scraped narrative content from charity website: purpose / programmes /
      where money helps / stories / photos. NOT credentials.)
    - "Change standing charity →" (opens charity picker modal — Pass B)
  - Decorative emerald flourish (radial gradient) sits BEHIND the logo at
    low opacity — the ONE flourish on the screen.

- **Greeting block (LOCKED 2026-06-08 on Exec Dashboard).** Every exec
  portal screen that has a "land here" moment opens with an editorial
  greeting:
  - Fraunces semibold 32px H1 with capital "Good" in `--portal-emerald`
    ("Good morning, [first_name]." / "Welcome back, [first_name].").
  - Italic Inter 14px `--muted-foreground` sub-line below — date,
    contextual hello, or one-line state summary.
  - Sits at the top of the main content area, 72px above the metric strip
    or next module.

- **Wordmark — LOCKED 2026-06-07 (supersedes the 2026-05-29 parked state).**
  "TheGoodIntro" one word, **Fraunces semibold**, with explicit colour split:
  "The" in `--portal-ink`, "Good" in brand emerald `oklch(0.42 0.13 158)`,
  "Intro" in `--portal-ink`. Source asset for the full mark + wordmark lockup
  at [`apps/web/public/brand-logo.png`](apps/web/public/brand-logo.png).
  **Fraunces wordmark is the brand exception** to CLAUDE.md's "Fraunces for
  italic emphasis + big numbers only" rule. In Claude Design mockups: render
  the wordmark only (Fraunces semibold + colour split). The circle mark is
  custom and Claude Design cannot reproduce it from a text description; the
  build chat inserts the real mark at port. Applies to every NEW screen
  going forward; previously-locked screens are NOT being retroactively
  redesigned (Issy's call), the build chat applies the new lockup at port.

- **Two-column signup pattern (LOCKED 2026-06-07 on Vendor Signup VP1).**
  Public auth-entry pages (signup, login, verify-email) use a 58/42 two-column
  layout at 1440px viewport. Left column = warm cream `--portal-page`, holds
  the wordmark top-left + centered form. Right column = deep brand emerald
  `oklch(0.42 0.13 158)`, full height, holds the brand statement +
  illustration + trust lines. NO sidebar, NO topbar on these pages. SSO
  buttons (Google + Microsoft) sit ABOVE the email field. Compact form: email
  + name only (or email alone for login); other fields collected later in
  Profile or auto-detected.

- **Pre-payment vendor shell variant (LOCKED 2026-06-07 on Vendor Pre-payment
  Dashboard).** When `vendor.status NOT IN ('active', 'dormant')`, the
  vendor portal shell renders with locked-state treatments:
  - Sidebar nav items that require active status get a **12px padlock-outline
    icon at the END of the row** in `--vendor-sidebar-ink` @60%. Items remain
    clickable and route to the reusable lockout page (see below). Settings,
    Get started, and Dashboard do NOT get padlocks.
  - Vendor identity card subtitle changes from "Band N · Renews DD MMM YYYY"
    to a derived label like "Awaiting approval" (NOT a band — vendor has no
    band yet).
  - Topbar eyebrow shows "ACME ROBOTICS · AWAITING APPROVAL" (NOT a band).
  - Dashboard content area is replaced with a focused "next step" surface
    (no ribbon, no widgets — those would show zeros). Surface contains:
    welcome H1 + primary CTA card with "Book on Calendly →" + secondary step
    cards + WHAT HAPPENS NEXT explainer block.

- **Reusable lockout page pattern (LOCKED 2026-06-07 on Vendor Lockout).**
  One component, rendered whenever a non-active vendor clicks a gated route
  (Executives / Requests / Meetings / Giving). Same shell as the active
  portal but content area shows: 64px `--portal-amber-soft` circle with
  padlock-outline icon centered + "LOCKED" mono eyebrow + H2 explanation +
  sub-copy + primary "Book your call on Calendly →" CTA + ghost "← Back to
  dashboard" link + "WHILE YOU WAIT" block with amber-dot bullets. The H1
  and STATE row reflect which nav item was clicked.


- **Admin sidebar IA (established across the locked admin screens).** Grouped into
  OPERATIONS (Dashboard, Meetings ▾, Vendors, Executives, Checklists, Gifts &
  Charities), COMMUNICATION (Inbox, Templates), CONFIGURE (Reports, Tags, Settings).
  This evolved the blueprint's flat list (it merged Giving + Charities into "Gifts &
  Charities" and Comms into "Inbox", and added Templates). PORTAL_LAYOUT_BLUEPRINT
  section 4A should be updated to match (still TODO).
  - **Meetings ▾ sub-items (locked 2026-06-04 during Meeting detail lock):**
    Scheduled / Pending requests (with amber count badge) / Completed /
    Cancellations. "Pending requests" sub-item is the same data as the
    separately-locked Admin Requests pending screen — two sidebar paths to one
    page is OK. Cancellations kept for completeness; can be dropped if Issy
    never navigates there.
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

- **Toggle pill (added 2026-06-04, first locked use on Settings · AI tab):**
  all on/off toggles use a **36px × 20px horizontal pill / stadium shape** with
  full border-radius (border-radius 10px), NOT a rounded square. 16px round
  thumb centred vertically with 2px padding inside the track. **ON state:**
  `--portal-ink` track + white thumb on the RIGHT. **OFF state:** `--portal-line`
  muted-grey track + hairline border + muted-grey thumb on the LEFT.
  **LOCKED state** (e.g. admin-override toggle): muted/desaturated track + 12px
  padlock outline icon immediately to the RIGHT of the toggle (NOT inside the
  track); the corresponding context chip (e.g. "ADMIN OVERRIDE") stays in the
  row's right-edge chip position. Thumb slides with a 150ms ease transition.
  Lives in `packages/ui`; never re-implement per screen.

- **Back button (added 2026-06-04):** any portal route deeper than the first-level
  sidebar item gets a `← Back` ghost button in a 32px thin row ABOVE the breadcrumb,
  top-left of the content area. 20px chevron-left outline icon (1.6px stroke,
  `--portal-ink`) + 8px gap + "Back" label (Inter 14px semibold, `--portal-ink`).
  No fill, no border; hover = subtle `--portal-card-hover`. Click → **parent route**
  (derived from breadcrumb's penultimate item, e.g. `/admin/vendors/VEN-1044` Back
  → `/admin/vendors`), NOT browser history. Hidden on first-level routes, on
  in-page tabs (Settings sub-tabs), and on Inbox conversation deep-links (same
  route, reading-pane swap). Lives in shared `<PortalPage>`. Existing in-page
  right-side "← Back to list" buttons on Templates editor / New Meeting / New
  Executive coexist with this (Issy's call: keep both affordances). See
  [`PORTAL_LAYOUT_BLUEPRINT.md`](PORTAL_LAYOUT_BLUEPRINT.md) §2.

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

### Admin Dashboard — LOCKED 2026-06-09
Claude Design file: "Admin Dashboard v2". Folder:
[`design/locked/admin-dashboard/`](design/locked/admin-dashboard/).
**First locked admin landing surface.** Originally locked early (pending the
wordmark call) then re-locked 2026-06-09 after a five-upgrade pass applied:
per-portal admin emerald sidebar palette `oklch(0.45 0.10 158)` + companion
tokens, brand logo lockup with placeholder mark + Fraunces wordmark with
The/Good/Intro colour split (sage-mint dark-bg variant for "Good" at
`oklch(0.82 0.12 158)`), photo-primary avatar rule applied across all person
rows, locked status pill tone mapping for the Pending Requests widget, and
locked sample data for Recent Onboards + Gifts Sent. Single viewport, Maya
Okafor signed in, Tuesday 28 May 2026 as the sample "today".

Layout (unchanged from the original lock, anatomies now precise):
- Brand lockup row at top of sidebar: 24px sage-mint placeholder mark with
  cream "G" inside (build chat swaps in `apps/web/public/brand-logo.png` at
  port time) + 14px gap + Fraunces semibold wordmark with The cream / Good
  sage-mint / Intro cream colour split, left-aligned at the sidebar's
  standard nav-item x-coordinate. ADMIN · PRODUCTION env label below,
  indented under the wordmark text.
- Top: dark `--portal-ribbon` band, 8 stats in two rows of four (scheduled
  this month 142, booked ahead 287, completed MTD 96, active vendors 24 /
  active executives 318, to charity $1.28M, revenue month $186.2K, revenue
  year $1.42M).
- Row: **Booked Meetings** calendar (8-col, Calendar/List toggle, today
  highlight on 28) + **Pending Requests** (4-col).
- Row: **Needs Action** (8-col, red dot = manual follow-up, "7 OPEN · 3
  ASSIGNED TO YOU" mono footer) + **Distributions** (4-col, horizontal bars:
  Meeting status / Vendors by tier / Exec capacity / Charities supported).
- Row: **Unresponded Comms** (4-col, 9 unread) / **Recent Onboards** (4-col,
  Sam Patel / Mira Chen / Naomi Brooks) / **Gifts Sent** (4-col, RFDS
  $4,000 / Beyond Blue $3,000 / OzHarvest $2,000 / The Smith Family $2,000).
- A "Component States" band demonstrates the kit's empty / loading / error
  variants. (Build chat moves this OUT of `/admin` production route — it
  belongs in the kit demonstration route.)
- Note: every $ figure in the mock is placeholder; real values come from
  `@thegoodintro/pricing` + `lib/reporting.ts`, never hardcoded.

**Locked status pill tone mapping (admin-portal-wide, propagates to every
admin surface that renders these four request states):**
- Review = AMBER (`--portal-amber-soft` bg + `--portal-amber-ink`)
- Match = NEUTRAL (`color-mix(in oklab, var(--portal-ink) 6%, white)` bg + `--portal-ink`)
- Exec = GOLD (`color-mix(in oklab, var(--portal-gold) 18%, white)` bg + `--portal-gold-ink`)
- Block = RED (`color-mix(in oklab, var(--portal-red) 12%, white)` bg + `--portal-red-ink`)
Each pill: rounded-full, Inter 11px semibold title case + dot in matching ink + 1.5px border in ink @ 40% opacity.

**Brand mark placeholder rule (NEW, applies to every dark-bg sidebar mockup):**
The 24px circular mark renders as a sage-mint solid-fill placeholder with a
cream "G" inside — visual approximation of the real custom asset. Build chat
embeds the real `apps/web/public/brand-logo.png` at port time. Do not iterate
on the placeholder in Claude Design; the real lockup only appears in the
ported app.

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
### Exec Dashboard — LOCKED 2026-06-08, RE-LOCKED 2026-06-09 (compact Incoming widget)
Claude Design file: "Exec Portal Dashboard". Folder:
[`design/locked/exec-dashboard/`](design/locked/exec-dashboard/).
**First locked exec-portal screen.** Locks the entire exec portal shell
(charcoal ink sidebar `oklch(0.22 0.008 70)` + companion tokens, topbar
content-empty on the right, no bell / no search), the editorial concierge
register that distinguishes exec from admin's HR Partner density and
vendor's photo-led density, and a stack of new portal-wide patterns
(photo-primary avatars, modal-only charity-change, Direction Card with
scraped charity logo + dual ghost-button actions, compact Incoming list
widget [re-locked 2026-06-09 — replaced the original scrollable card-in-card
container], "More about [vendor]" affordance navigating to `/exec/requests`
batch page).
**Four viewports** in one Claude Design file: VP1 LOADED at rest, VP2 standing-
charity picker modal open, VP3 per-meeting charity picker modal open, VP4
charity detail modal open (READ surface triggered by Direction Card "Learn about
[charity] →"; no commitment CTA, no credentials in-modal, content scope locked
at purpose / programmes / "what $1,000 funds" + emerald-ruled quote / two
"recent stories" cards with outbound links; single "Done" footer CTA + ACNC
verification line; same modal-on-dashboard pattern at 20% ink dim + 2px blur).
Modal sits over the dashboard at 20% ink dim + 2px backdrop-blur. VP1 sample data:
Priya Raghavan signed in · 4 incoming (2 visible in scroll + 1 peeking + 1
below cut) · 3 upcoming (1 demonstrates per-meeting charity override to
Beyond Blue) · 12 held this FY · $28,000 lifetime.

- **New global decisions introduced** (see Global decisions section above):
  - Exec sidebar = charcoal ink `oklch(0.22 0.008 70)` (was TBD).
  - Editorial concierge register (Fraunces section heads + italic Inter
    eyebrows + 72px section gaps + no SaaS chrome + emerald single accent +
    topbar empty on the right).
  - Photo-primary avatar rule (photo inside the circle, initials fallback).
  - Modal-only charity-change pattern (no dropdowns, no drawers, no inline
    expand, no navigation to a separate page). Modal-on-dashboard structure:
    modal lives as additional viewports of the dashboard file (VP2 + VP3),
    backdrop dim 20% ink + 2px blur, dashboard stays visible behind.
  - Direction Card (96px charity logo + Fraunces 40px charity name + helper +
    inline credentials + two stacked full-width ghost buttons).
  - Greeting block (Fraunces 32px H1 with capital "Good" emerald + italic
    sub-line).

- **Architectural decisions baked in (per-screen, not global):**
  - Per-meeting charity override lives ONLY on Upcoming Meetings cards,
    NEVER on Incoming cards. Decision logic: charity finalised at commit,
    not at accept.
  - "More about [vendor]" navigates to a future
    `/exec/requests/[request_id]` page; the inline expand pattern is gone.
    Right-chevron icon (NOT plus/minus toggle) signals navigation.
  - Direction Card + scrollable Request Box are height-matched (top + bottom
    aligned); Lifetime mini-card sits below the matched row in the left
    column with no right-column counterpart at that vertical position
    (intentional asymmetry).
  - Dark ink metric strip is RETAINED for the exec portal (parity with
    admin/vendor ribbons). The earlier warm-cream metric strip attempt was
    reversed by Issy in v4 — Issy's call, ribbon parity wins over departure.
  - "Four requests" section header is centered (text-align: center) above
    the Request Box.

- **NEW data field required by build chat:** `vendor_user.photo_url text NULL`.
  Vendor users self-upload via vendor Settings → Profile (no upload control
  on the locked Vendor Settings/Profile screen yet — either add to Pass B
  of that screen or ship exec portal with initials fallback until vendors
  self-upload).

- **What's deferred to Pass B (named exec screens, not designed yet):**
  - Charity detail modal (opens from Direction Card "Learn about [charity] →"
    + reused on future surfaces).
  - Request detail page (`/exec/requests/[id]` — destination for "More about
    [vendor] →").
  - Meeting detail page (`/exec/meetings/[id]` — destination for "View detail
    →" on Upcoming).
  - Other exec portal screens: Meetings list, Impact list, My charity tab
    (view-only nomination history surface — NOT the charity-change
    interaction; the modal handles that), Profile.
  - EA mode "Acting for Priya" banner.

- **Sample data (locked across exec portal):** Priya Raghavan · CFO ·
  Lumen Industries · `priya@lumenindustries.com` · EXC-1042 · standing
  charity Royal Flying Doctor Service · EA Lena Park
  (`lena@lumenindustries.com`) · 12 meetings held this FY · $12,000 to
  charity · 28 lifetime meetings · $28,000 lifetime · today 2026-06-08
  Monday.

- **Anti-list** (do not regress; full list in
  `design/locked/exec-dashboard/README.md`): no SaaS chrome / no status
  pills / no count chips / no progress bars / mono uppercase ONLY in Recent
  Impact row date prefix (the second mono usage — scroll helper — was
  removed in the 2026-06-09 widget rework) / topbar content-empty on the
  right / photo-primary avatars at locked sizes (photos sit INSIDE the small
  circle) / "More about" is navigation NOT expand, click → `/exec/requests`
  anchored to row id (NOT `/exec/requests/[id]`) / charity-change is modal
  NEVER dropdown / compact Incoming widget renders all 4 rows (no scroll
  cut, no "SHOWING N OF M" helper, no "Four requests" centered header).

### Exec Incoming Requests — LOCKED 2026-06-09
Claude Design file: "Exec Request Detail" (file name unchanged from the early
single-request iteration; the surface scope expanded to the batch list). Folder:
[`design/locked/exec-incoming-requests/`](design/locked/exec-incoming-requests/).
**Second locked exec-portal screen.** The all-pending batch review surface at
`/exec/requests`. Inherits the exec portal shell + editorial concierge register
+ photo-primary avatars from the Exec Dashboard. Two viewports: VP1 LOADED
(four full-detail cards stacked + Up-to-date footer) + VP2 EMPTY STATE
(sanctioned 🎉 emoji + italic Fraunces "You're all caught up." hero).

Page anatomy:
- Topbar label "Incoming requests" (left, Inter 14px semibold ink). Topbar
  right stays content-empty per the exec register.
- Back row → `/exec` (parent route, not browser history).
- 48px gap, then page hero: Fraunces semibold 48px `--portal-ink` centered
  "Four requests" (or count word — Three / Five / etc). No sub-line. An
  emerald marker-highlight band was iterated and rejected; the plain ink
  hero is the locked treatment.
- 32px gap, then four cards stacked at 24px vertical gaps, ordered by
  proposed meeting date ascending (soonest first).
- 48px gap below Card 4, then the centered Up-to-date footer (Fraunces
  italic 20px ink "You're all caught up." + italic Inter 13px muted
  "Nothing else awaiting your answer. We pace your queue so nothing piles
  up."). Footer sits on warm cream, no card wrapper, no hairline above.

Card anatomy (identical for all four cards, 960px max-width centered):
- ONE white `--portal-card-reading` card, 1px line border, 16px radius, 32px
  internal padding.
- TWO-COLUMN GRID at the top: LEFT rail 280px (identity block — 80px photo
  avatar + Fraunces 22px name + Inter 13px semibold "Role · Company" +
  italic muted credibility line + italic ghost LinkedIn outbound + italic
  muted Submitted date + hairline + Proposed time block + hairline + 4
  verification stamps) · VERTICAL 1px hairline column separator · RIGHT
  column flex-1 (Q1 — italic eyebrow + Fraunces 18px sub-head + Inter 14px
  body 1.55 line-height · hairline · Q2 — same pattern, body indented 16px
  with 2px emerald left rule).
- FULL-WIDTH hairline across the card interior below where both columns end.
- 32px gap, FULL-WIDTH "If you accept" gift block (italic eyebrow + 48px
  RFDS logo + Fraunces 20px emerald "$N to Royal Flying Doctor Service" +
  italic "Your standing nomination" + helper line).
- 32px gap, FULL-WIDTH action row (3 buttons in horizontal row, equal flex,
  16px gap, 48px tall: primary emerald "Accept this meeting" + ghost
  "Decline" + ghost "Forward to Lena (EA)").

Sample data (every $ figure is illustrative; build reads from
`bandForMeetingNumber(vendor.cycle.held + 1).rateCents`):
- Card 1: Sam Patel · Head of RevOps · Acme Robotics · Tue 9 Jun · 30 min ·
  Zoom · $1,000 (Band 2)
- Card 2: Theo Markham · Founder · Latch Health · Thu 11 Jun · 45 min ·
  Zoom · $900 (Band 1)
- Card 3: Naomi Brooks · VP Sales · Beacon Procurement · Mon 15 Jun · 30 min ·
  Teams · $1,100 (Band 3)
- Card 4: Hana Okonkwo · Co-founder & COO · Vesta Climate · Wed 17 Jun · 30
  min · Zoom · $1,000 (Band 2)

Every card directs to **Royal Flying Doctor Service** (Priya's standing
nomination). Only the $ varies by vendor band — band variety in the sample
data is intentional to show the pricing engine working.

VP2 empty state: 🎉 emoji at ~56px + Fraunces semibold italic 40px ink
"You're all caught up." + italic Inter 14px muted "Nothing else awaiting your
answer. We pace your queue so nothing piles up." Centered, vertically
positioned ~28% from top of main content area.

**SANCTIONED EMOJI EXCEPTION** — the 🎉 emoji on VP2 is the ONLY emoji used
anywhere in the portal. Approved by Issy specifically for this empty state on
2026-06-09. Do NOT propagate to other surfaces; do NOT add other emoji here;
do NOT swap the party popper for any other glyph without Issy's approval.

**NEW data fields required** for the build chat to add:
- `vendor_user.bio_one_liner text` — short headline shown below "Role ·
  Company" on each card (e.g. "8 years at Workday and Snowflake before
  joining Acme in 2024.")
- `request.q1_head text NULL` and `request.q2_head text NULL` — admin-curated
  topic titles for Q1/Q2 bodies, OR auto-summarised by an AI step at request
  creation (build-chat decides; Issy's preference is admin curation for tone)

**Anti-list** (do not regress; full list in
`design/locked/exec-incoming-requests/README.md`): 🎉 emoji on VP2 ONLY /
plain ink hero with no emerald highlight / Up-to-date footer (VP1) and VP2
empty hero are DIFFERENT states and both stay / four full cards no
collapse-toggle / three actions per card never a fourth / charity identical
across all cards (RFDS) only $ varies by band / no mono uppercase / no status
pills / hairline borders only / cards white on warm cream / sidebar topbar
back row unchanged from Exec Dashboard inheritance.

### Exec Meetings List — LOCKED 2026-06-10
Claude Design file: "Exec Meetings List". Folder:
[`design/locked/exec-meetings-list/`](design/locked/exec-meetings-list/).
**Third locked exec-portal screen.** Route `/exec/meetings`. List + Calendar
toggle. Row click opens a 540px right-side drawer; a standalone Meeting Detail
page (`/exec/meetings/[id]`) is explicitly killed by this lock — the drawer IS
the detail surface. Four viewports: VP1 list default (Upcoming open · Past
collapsed · Cancelled collapsed), VP1b list with Past expanded, VP2 calendar
month view, VP3 list with drawer open on Mira Chen. Full spec in the screen
README.

**Five portal-wide patterns introduced by this lock** (apply forward across
the exec portal and, where noted, the wider platform):

1. **Universal topbar search (SUPERSEDES Exec Dashboard's "topbar
   content-empty right").** Every exec page topbar from this lock forward
   carries a 480px search input center-right with `⌘K` chip, italic
   placeholder "Search meetings, vendors, charities", and 2px emerald focus
   ring. The right edge of the topbar still stays empty (no bell, no help,
   no date). Page title stays on the left. Opens a Pass-B command-palette
   overlay. Applies retroactively to Exec Dashboard + Exec Incoming
   Requests at build time; their locked READMEs will be updated on next
   touch. Apply to every NEW exec page from this lock forward.

2. **Three-stat inline mini-strip page header pattern.** The locked
   treatment for any "page top with three quick numbers." Inline row, no
   container fill, no border, no rounded card. Three stat groups (Fraunces
   28px number on top, italic Inter 13px `--portal-ink-60` label below)
   separated by 1px `--portal-hairline` 16px vertical dividers. **Single-
   accent rule applies**: only the FIRST number wears `--portal-emerald`;
   the remaining two are `--portal-ink`. Replaces any temptation to fill
   the strip with emerald (tried and called a "marketing CTA"). Reusable
   on Impact list, My Charity, Profile, EA mode dashboards.

3. **Collapsible section card pattern.** Lists with mixed active +
   historical content render as separate cards (32px gaps between),
   each with a 56px `--portal-cream-soft` header strip carrying italic
   Inter 14px `--portal-ink-70` label + (for collapsibles) a 16px chevron
   that rotates 180° on expand. Asymmetric defaults are correct: the
   ACTIVE/primary section stays always open with no chevron; HISTORICAL
   sections collapse by default with chevron. Counts in section headers
   reflect real total, not rendered subset ("Past · 13" stays 13 even when
   paginated to 7). Apply portal-wide whenever a list naturally splits
   active vs historical.

4. **Drawer-as-detail (NEW — kills the standalone-detail-page pattern).**
   When a list row needs a detail surface, click → 540px right slide-over
   drawer. Backdrop reuses the locked Exec Dashboard charity picker pattern
   verbatim (20% `--portal-ink` dim + 2px backdrop-blur). Top accent bar
   (3px solid, colored by status) + clean header (eyebrow + 64px photo
   avatar with NO ring + identity + credibility + LinkedIn) + body
   sections + sticky footer with Primary (flex 2) + Ghost (flex 1)
   weighted action row. URL reflects drawer via `?drawer=<id>`; email deep
   links open list view with drawer pre-opened. Apply portal-wide; any
   list that previously implied "navigate to /resource/[id]" gets the
   drawer instead.

5. **"Editorial chrome, SaaS structures inside" — architectural principle
   for operational exec surfaces.** Resolves the tension exposed when the
   editorial concierge register was over-applied to a Meeting Detail
   experiment and read as "newsletter stick-on, not SaaS." Going forward:
   - **CHROME stays editorial**: sidebar (charcoal), topbar, page typography
     (Fraunces section heads, italic Inter eyebrows), hairline borders,
     single emerald accent, warm cream page bg.
   - **DATA STRUCTURES inside that chrome function as proper SaaS**: tables,
     calendar grids, filters, search, list rows with multiple compact data
     points, collapsibles, drawer internals. Reference register: Linear /
     Pitch / Vercel. Density-with-hierarchy, never sparseness.
   The Exec Dashboard and Incoming Requests remain pure editorial because
   they are READING surfaces. Meetings List, Impact list, EA mode lists,
   any future operational exec surface, follow this hybrid rule.

**Other locks introduced on this screen** (not portal-wide; specific to the
Meetings page):
- List row anatomy: 88px tall, 40px photo-primary avatar with **NO STATUS
  RING** (rejected — heavy-handed; status reads via a dedicated column
  with 8px dot + italic word), 16px gap, identity stack with italic meta
  line carrying the row's specific narrative ("Accepted Sat 7 Jun · Gift
  will go to RFDS" / "Gift went to RFDS" / "Cancelled by exec · Mon, 17
  Feb"), status column, right cluster with Fraunces date + Inter time ·
  duration · provider micro-icon. Cancelled rows omit the time/duration/
  provider sub-line.
- Calendar month grid: Fraunces 20px day numbers (40% opacity for
  out-of-month dates), italic Inter 12px title-case day-of-week header
  (NOT mono uppercase — editorial chrome), `--portal-cream-soft` weekend
  column tint, today's date rendered as a solid `--portal-emerald` circle
  with white Fraunces date number on top. Meeting chips are soft-emerald-
  fill `oklch(0.94 0.04 155)` rounded-full pills with 6px dot + Inter
  11.5px medium company name; click → opens drawer (same drawer as list
  view). Footer legend dot+label key for Confirmed/Held/Cancelled.
- Connect-your-calendar banner (DISCONNECTED state locked, CONNECTED quiet
  sync-strip deferred to Pass B): single-row card between page header and
  controls bar, calendar glyph + copy left, Primary "Connect Google
  Calendar" + Ghost "Connect Outlook" right.
- Controls bar: Calendar/List segmented toggle (left), All/Upcoming/Past
  segmented toggle + Sort dropdown ("Most recent first" / "Oldest first")
  (right). NO search in the controls bar — search lives in the topbar.

**NEW data field required**:
- `charity.short_name text NULL` — 3-5 letter abbreviation for dense list
  contexts ("RFDS" for "Royal Flying Doctor Service"); falls back to full
  `charity.name` when null. Used in row meta lines on this page; reusable
  on Impact list and Profile.

**Sample data continuity** (locked): page header strip shows 12 (emerald) ·
3 · 28; 3 upcoming meetings (Mira Chen, Jamie Holloway, Devi Iyer — Devi
with Beyond Blue override), 13 past total (7 rendered in sample), 1
cancelled (Riley Adams · Forge Industries). Drawer sample is Mira Chen ·
Tue 17 Jun 10:00 AEST · Anvil Software · $1,000 to RFDS · Q1 "Activating
operating data without rebuilding the warehouse" / Q2 "The operator who's
actually done this".

**Anti-list (do not regress; full list in screen README):** no filled card
around the stats / single-accent on stat 1 only / no status ring on row
avatars / drawer IS the detail surface (no `/exec/meetings/[id]` page) /
Past + Cancelled collapse by default with real totals in headers /
universal topbar search applies portal-wide, right edge stays empty /
editorial register on chrome only, SaaS density inside / no mono uppercase /
no status pills / no emoji (🎉 sanctioned only on `/exec/requests` VP2) /
no em or en dashes / hairlines not shadows / drawer backdrop = same 20%
ink + 2px blur as locked charity picker.

**Open decisions parked:** David Wu charity reconciliation across Exec
Dashboard Recent Impact (Beyond Blue override) vs Meetings List row (RFDS
standing) — pick one before build / connected-calendar banner state /
drawer footer for Held meetings (CTAs specced but not visually rendered) /
pagination strategy inside expanded Past card / per-meeting override
treatment in the drawer Your gift section / cancelled meeting drawer footer
(currently hidden) / Connected sync-strip variant / search command-palette
overlay (Pass B).

### Vendor Signup + Pre-payment States — LOCKED 2026-06-07
Claude Design file: "Vendor Signup + Pre-payment". Folder:
[`design/locked/vendor-signup-and-prepayment/`](design/locked/vendor-signup-and-prepayment/).
**Sixth locked vendor-portal screen set.** Closes the biggest functional gap in
the portal — everything a vendor sees BEFORE their account is `status='active'`.
Three viewports in one file: VP1 public signup, VP2 pre-payment Dashboard, VP3
reusable lockout page. **First lock under the new TheGoodIntro brand logo**
(Fraunces semibold wordmark with The/Good/Intro colour split; circle mark
inserted by the build chat at port from `apps/web/public/brand-logo.png`).

- **New global decisions introduced** (see Global decisions section above):
  - Brand logo lockup (Fraunces wordmark + colour split + circle mark via
    build chat). Wordmark "PARKED" state is now resolved.
  - Two-column signup pattern (58/42 layout, warm cream left + emerald right).
  - Pre-payment vendor shell variant (padlocks on gated nav, "Awaiting
    approval" identity card subtitle, dashboard content replaced with welcome
    surface).
  - Reusable lockout page pattern (one component for every gated route).
- **VP1 — Signup** (`/signup`, public, no portal shell): two-column 58/42 at
  1440px. Left column = warm cream + Fraunces wordmark top-left + centered
  form (eyebrow + H1 + sub-copy + Google SSO + Microsoft SSO + email + name +
  Continue → + footer microcopy + Sign in link). Right column = deep brand
  emerald + WHY THIS EXISTS eyebrow + "Real introductions. Real giving."
  tagline + sub-text + abstract card+coins+heart illustration + two trust
  check lines. NO circle mark on the mockup (build chat inserts at port);
  emerald appears on the right panel AND in the wordmark "Good" letter
  (locked vendor-side exceptions to "emerald only on admin sidebar").
- **VP2 — Pre-payment Dashboard** (`/vendor` while `status != 'active'`):
  full vendor portal shell with locked-state treatments — sidebar padlocks
  on Executives / Requests / Meetings / Giving / Team / Billing; identity
  card "Acme Robotics · Awaiting approval"; topbar eyebrow "ACME ROBOTICS ·
  AWAITING APPROVAL". Content area replaces the ribbon + widgets with:
  STATUS eyebrow + H1 "One step before the network opens." + sub-copy +
  primary CTA card (STEP 1 OF 3 · Book your call with Issy + Calendly CTA +
  calendar illustration) + 2-col grid of secondary cards (STEP 2 OF 3 ·
  Complete your profile / STEP 3 OF 3 · We approve + you pay) + WHAT
  HAPPENS NEXT block (3 numbered steps).
- **VP3 — Reusable lockout page** (rendered for any gated route when not
  active): same shell with Executives item ACTIVE. Content = padlock icon
  tile + LOCKED eyebrow + H2 "This opens after your call with Issy." +
  sub-copy + Calendly CTA + Back to dashboard ghost + WHILE YOU WAIT block.
  Component is reused for every gated route; H1 + STATE reflect the clicked
  route.
- **Sample data** — Vendor: Acme Robotics, status mapped to "Awaiting
  approval". Signed-in user (VP2 + VP3): Sam Patel · Owner.
- **Data sources per module** — exhaustive table in the screen README.
  Headline rules: VP1 SSO buttons OAuth → server validates work-email domain
  (rejects gmail/outlook/hotmail/etc.) → creates vendor + vendor_user (Owner)
  with `status='signed_up'`; email-magic-link form does the same with
  verification step. VP2/VP3 render condition: `vendor.status NOT IN
  ('active', 'dormant')`. Lockout page is one component reused across gated
  routes.
- **NOT designed in this pass:** verify-email screen (between signup submit
  and VP2); dormant variant of the lockout page (access window expired);
  Settings/Profile pre-payment Visibility section behaviour (keep shown vs
  hide); SSO work-email-rejection UX after OAuth.
- **Open decisions:** dormant copy variant; Verify-email screen; pre-payment
  Settings/Profile visibility-section behaviour; final illustration block
  for VP2.
- **Anti-list (do not regress):** VP1 NO sidebar/topbar (public page); VP1
  wordmark Fraunces only with colour split (no circle mark in mockup);
  VP1 right panel deep emerald NEVER purple/blue; VP1 illustration NO
  human characters / cartoon hands; VP1 form compact (email + name only);
  VP2/VP3 padlocks at the END of nav rows (not the start), 12px outline @60%;
  Settings + Get started + Dashboard NOT padlocked; identity card "Awaiting
  approval" pre-payment (NOT a band); topbar eyebrow "AWAITING APPROVAL"
  (NOT a band); sage forbidden; no em/en dashes.
- **Issy's fix passes (2026-06-07):** Pass A.1 redesigned VP1 as two-column
  layout (Monday.com / Notion / Linear professional register) with SSO
  buttons and emerald brand panel right. Pass A.2 dropped the circular logo
  mark from VP1 because Claude Design couldn't reproduce TheGoodIntro's
  custom stylised G from a text description — wordmark stands alone, real
  mark inserted by build chat at port.

### Vendor Settings — Shell + Profile tab — LOCKED 2026-06-06 (pending the wordmark call)
Claude Design file: "Vendor Settings - Profile". Folder:
[`design/locked/vendor-settings-profile/`](design/locked/vendor-settings-profile/).
**Fifth locked vendor-portal screen.** Locks the vendor Settings shell (3 tabs:
Profile · Notifications · Security; Sign-out stays in the sidebar user chip) and
the Profile tab content. Pass A: LOADED · DEFAULTS state.

- **Product decision baked into the lock:** the vendor's "About" block is
  **always public to executives** reviewing the vendor's meeting requests —
  no opt-in. This reverses `VENDOR_PORTAL_BRIEF.md` § Settings/Profile (which
  said opt-in). Row 1 of Visibility is now a locked-ON system rule. See
  project memory `thegoodintro-vendor-about-always-public-to-execs`.
- **No new global tokens or patterns introduced** — this screen inherits the
  admin Settings shell pattern (tab strip with 2px ink underline on active),
  the locked-toggle-with-padlock pattern (admin AI tab), the DEFAULT / CUSTOM
  chip pattern (admin Account tab), the sticky save bar pattern (deferred to
  Pass B), and the verified pill in soft-green (vendor Executives list status
  tone, reused for the verified email indicator).
- **Inherits from Vendor Dashboard:** sidebar deep teal-pine with Settings
  ACTIVE; topbar pattern (H1 "Settings" + ACME ROBOTICS · BAND 2 eyebrow);
  palette tokens; vendor identity card + Sam Patel chip. **No back row**
  (Settings is a first-level item).
- **Tab strip** (full-width below topbar, 48px tall, bottom hairline):
  Profile (ACTIVE, 2px ink underline) · Notifications · Security. Tab order
  locked. A future **Company** tab is parked for Pass B (vendor logo
  upload + company info — closes the loop on the sidebar identity card).
- **Profile tab content** (max-width 720px column, centered, 40px gap between
  sections, hairline above each):
  - **SECTION 1 PROFILE:** mono eyebrow + helper + 80px SP avatar tile +
    ghost "Upload photo" + helper, then 2-col field grid First name "Sam" /
    Last name "Patel" / Display name (empty, optional) / Title "Head of
    RevOps". Each field has DEFAULT chip inline with label.
  - **SECTION 2 CONTACT:** Email "sam@acmerobotics.com" READ-ONLY with
    soft-green VERIFIED pill + helper "Managed through your work email. To
    change, contact hello@thegoodintro.com." / Phone (optional, empty,
    placeholder "+61 4xx xxx xxx") + helper "Urgent platform alerts only.
    Never shared with executives." / LinkedIn URL "linkedin.com/in/
    sampatel-revops" + helper.
  - **SECTION 3 ABOUT YOU & YOUR COMPANY:** About label + DEFAULT chip +
    right-aligned "527 / 1000" counter + 6-row textarea prefilled with
    the locked 527-char Sam Patel About text. (NOTE: sample text contains
    one em dash inside user content — em dashes are forbidden in UI chrome
    but permitted in sample form values.)
  - **SECTION 4 VISIBILITY OF YOUR "ABOUT" (purely informational, all
    rows locked):** three rows, each a 64px card with the locked-toggle-
    with-padlock pattern.
    - Row 1: "Visible to executives" LOCKED-ON (the always-public rule).
      Subtitle "Shown to executives alongside your meeting request, so
      they have context before deciding. Cannot be turned off."
    - Row 2: "Always visible to TheGoodIntro admin" LOCKED-ON.
    - Row 3: "Never visible to other vendors or to your teammates"
      LOCKED-OFF.
    All three visually identical except copy + ON/OFF position. No
    editable controls — section is pure disclosure.
- **No sticky save bar** (DEFAULTS state). MODIFIED state with the 88px
  save bar from admin Settings · Account tab inherits unchanged in Pass B.
- **STATE annotation row** at the bottom: "STATE · SETTINGS · PROFILE TAB ·
  LOADED · DEFAULTS" + "VIEWING NOW" amber-soft pill. Single bottom row.
- **Sample data** — aligned with prior vendor screens. Sam Patel · Head of
  RevOps · Owner. sam@acmerobotics.com VERIFIED. LinkedIn populated. About
  prefilled.
- **Data sources per module** — exhaustive table in the screen README.
  Headline rules: every field reads/writes `vendor_user.*` columns; About
  visibility rows 1+2 are **hard-coded `true` platform-side** (always
  visible), row 3 is hard-coded `false` (RLS-enforced); content-guard
  pipeline strips emails / phones / URLs from the About text before exec
  email composes, but does NOT strip dashes; Email is READ-ONLY with
  out-of-band change flow (email hello@thegoodintro.com).
- **NOT designed in this pass:** Company tab (vendor logo upload + company
  info); Notifications tab content; Security tab content; MODIFIED state
  (sticky save bar); LOADING / SKELETON state; avatar upload flow; email
  change flow; "View full diff" destination; LinkedIn helper copy
  refinement (still says "if Visibility is on (below)" which is mildly
  out of date since About is always-on).
- **Open decisions:** wordmark; LinkedIn helper rewrite; whether Visibility
  section copy/title should change now that all 3 rows are locked
  (currently "VISIBILITY OF YOUR 'ABOUT'" reads as if there are controls).
- **Anti-list (do not regress):** About is always public to execs (row 1
  is locked-ON, never reintroduce an opt-in toggle); Visibility section
  is pure disclosure (no editable controls); Email is read-only with
  soft-green VERIFIED pill; sage forbidden on vendor surfaces (no sage
  system-rules block even though admin AI/Notifications/Staff use sage);
  DEFAULT/CUSTOM chips inline with field label; brand spelling, "Band"
  not "Tier", no em/en dashes in chrome (sample form values exempt),
  no emojis.
- **Issy's fix passes (2026-06-06):** Pass A.1 swapped Visibility row 1
  from user-editable OFF toggle to locked-ON system rule with padlock,
  per the always-public-to-execs product decision. Subtitle copy updated
  to reflect that.

### Vendor Request Form — LOCKED 2026-06-06 (pending the wordmark call)
Claude Design file: "Vendor Request Form". Folder:
[`design/locked/vendor-request-form/`](design/locked/vendor-request-form/).
**Fourth locked vendor-portal screen.** First T5 form on the vendor portal — the
qualification gate where a vendor pitches an exec on why they should accept a
meeting. Entered from the Vendor Executive Detail Drawer's primary CTA. Single
viewport in PARTIALLY FILLED · READY TO SEND state; states + confirmation modal
deferred to Pass B.

- **New global decision introduced** (see Global decisions section above):
  vendor T5 variant (720px column, white form card with cream textareas inside,
  question-numbered mono eyebrows with colour-shifting character counters,
  hairline dividers between questions, right-aligned action row, NO money info
  on the form surface).
- **Pattern locks shared with Drawer entry below:** radio-card pattern (Q3),
  WHAT HAPPENS NEXT explainer (lives on the Drawer not here, but designed in
  the same session).
- **Inherits from Vendor Dashboard + Executives List:** sidebar deep teal-pine
  with "Executives" item ACTIVE; topbar pattern (H1 "Request a meeting" +
  ACME ROBOTICS · BAND 2 eyebrow); palette tokens; vendor identity card +
  Sam Patel chip.
- **Back row** (locked pattern): "← Back" ghost → /vendor/executives (parent
  route, not browser history).
- **Block A — Context strip:** 48px circular Priya photo + "REQUESTING A
  MEETING WITH" mono eyebrow + Name Inter 17px semibold + "Title · Company"
  Inter 13px muted. Photo matches the Executives list row + Drawer for the
  same exec (one image per record).
- **Block B — Form card** (`--portal-card-reading` white, --portal-line
  border, rounded-2xl, 32px padding):
  - Q1 "Who are we?" — mono eyebrow + label + helper + 300-char textarea
    (`--portal-page` warm-cream bg inside white card) + right counter
    "278 / 300". Prefilled with locked sample text.
  - hairline divider.
  - Q2 "Why Priya, specifically?" — same anatomy + "281 / 300".
  - hairline divider.
  - Q3 "Who will Priya be meeting with?" — radio-card pattern (new locked
    pattern, see Global decisions). SELECTED = "Me" (Sam Patel · Head of
    RevOps · Acme Robotics); UNSELECTED = "Someone else on the team"
    (subtitle "We'll capture their name, title, and email next.").
- **Block C DELETED** (was a cost/charity strip with shield-check + coins +
  heart icons reading "No credit charged on submit · 1 credit ($1,500)
  consumed only after the meeting is held · Projected gift: ~$1,000 to Royal
  Flying Doctor Service (Band 2)"). Issy deleted 2026-06-06 — qualification
  form stays focused on the pitch, money lives elsewhere. Do NOT re-introduce.
- **Block D — Action row:** right-aligned Cancel ghost (--portal-line border,
  40px, 13px semibold) + 12px gap + primary ink "Send request to Priya →"
  (--portal-ink bg, white text, 40px, 13px semibold, 20px h-padding, arrow
  icon).
- **STATE annotation row** at the bottom: "STATE · REQUEST FORM · PARTIALLY
  FILLED · READY TO SEND" + "VIEWING NOW" amber-soft pill.
- **Sample data** — aligned with the Vendor Dashboard / Executives List /
  Drawer set. Target exec Priya Raghavan (EXC-1042) consistent across all
  four screens; signed-in user Sam Patel / Acme Robotics.
- **Data sources per module** — exhaustive table in the screen README.
  Headline rules: `executive.photo_url` is the ONE source for Priya's image
  across list + drawer + form; Q1/Q2 are free-text into
  `request.qualifying_questions` JSON with **server-side content guard**
  stripping emails / phone numbers / URLs before the email composes; Q3 →
  `request.attendee_kind` enum (`self` | `other`); submit creates a `request`
  row with `status='submitted'` and kicks off the exec email workflow + admin
  notification; cancel creates no record. NO money number rendered on this
  screen.
- **NOT designed in this pass:** Q3 "Someone else" expanded fields (Name,
  Title, Email + email-domain validation); EMPTY default state (Send button
  disabled); SUBMITTING state (spinner, fields disabled); CONTENT-GUARD ERROR
  state (inline amber-soft warning naming what was stripped); confirmation
  modal after submit ("TheGoodIntro is working on it" + Back to Executives /
  Make another request); "Preview what Priya sees" affordance.
- **Open decisions:** wordmark; whether to add the preview affordance; whether
  the back button restores list scroll position when returning to Executives.
- **Anti-list (do not regress):** NO money information on the form surface
  (cost strip deletion is the locked decision); form card is white with
  cream textareas (NOT cream form on white textareas); back row → parent
  route, never browser history; exec photo matches the locked sample image
  across all surfaces.
- **Issy's fix passes (2026-06-06):** Pass A.1 deleted Block C cost/charity
  strip.

### Vendor Executive Detail Drawer — LOCKED 2026-06-06 (pending the wordmark call)
Claude Design file: "Executive Detail". Folder:
[`design/locked/vendor-executive-detail-drawer/`](design/locked/vendor-executive-detail-drawer/).
**Third locked vendor-portal screen.** First vendor application of the locked
drawer pattern (previously admin-only: Pay batch, Gmail OAuth, Charity detail).
Single viewport in OPEN state overlaying the locked Executives List.

- **New global pattern introduced:** "WHAT HAPPENS NEXT" numbered-step
  explainer (see Global decisions above) — reusable for any decision moment
  with a multi-step downstream.
- **Drawer chrome** (inherits the locked drawer pattern): 600px wide, slides
  from the right, `--portal-card-reading` white bg, --portal-line left
  border, subtle left-edge shadow. Backdrop dim `rgba(20,40,30,0.32)` — the
  list behind stays recognizable. ESC / X / backdrop click dismiss.
- **Sticky header (64px):** 32px ghost X-close left + mono EXC-1042 tag right.
- **Body (scrollable, 32px padding):**
  - **Identity block:** 80px circular photo + Name Inter 22px semibold +
    Title Inter 14px + Company Inter 13.5px muted.
  - hairline divider.
  - **About block:** "ABOUT" mono eyebrow + bio paragraph Inter 13.5px ink
    (1.6 line-height). Locked sample 50-word bio for Priya.
  - hairline divider.
  - **Two stat cards stacked (16px gap):**
    - Card A "Supports" — `--portal-amber-soft` bg, heart icon + "SUPPORTS"
      mono eyebrow + charity name Inter 16px semibold + supporting copy.
    - Card B "Member since" — `--portal-card` warm cream bg + --portal-line
      border, "MEMBER SINCE" mono eyebrow + year Fraunces 28px semibold +
      supporting copy.
  - hairline divider.
  - **What happens next block** (new locked pattern): mono eyebrow + 3
    numbered amber-circled steps. Step copy locked: "You write a short pitch
    for Priya." / "We send your message to her. She accepts or declines." /
    "If she accepts, we secure a time. A credit is only spent after the
    meeting is held."
- **Sticky footer (88px):** full-width primary ink "Request a meeting →"
  button → `/vendor/executives/{public_id}/request`.
- **STATE annotation row** at the bottom (over the dimmed list):
  "STATE · EXECUTIVE DETAIL DRAWER · OPEN · EXC-1042" + "VIEWING NOW" pill.
- **Sample data** — Priya Raghavan (EXC-1042), same record/photo as the
  Executives list row + Request Form. Bio + Charity (RFDS) + Member since
  2024 locked.
- **Data sources per module** — exhaustive table in the screen README.
  Headline rule: photo, bio, charity, joined_at all read directly from the
  `executive` record + `executive.default_charity_id → charity.name`. CTA
  route templates the exec's `public_id` into the URL.
- **NOT designed in this pass:** bio empty state (execs with no bio); drawer
  dismiss-state animation; keyboard navigation (Tab order, focus trap); the
  backdrop list scroll restoration behaviour.
- **Open decisions:** wordmark; bio empty-state copy.
- **Anti-list (do not regress):** drawer overlays only (never displaces
  list); backdrop dim is mood not blackout; photo MUST match the locked
  Unsplash image used on List + Request Form for the same exec; one record
  → one image, hydrated from `executive.photo_url`.
- **Sample-data drift noted:** the backdrop list in the render shows
  "Anika Sato · CPO · Northvale Group" (not in locked sample set) — same
  drift as admin Pay batch backdrop. Fix on next pass; harmless because
  dimmed.

### Vendor Executives List — LOCKED 2026-06-06 (pending the wordmark call)
Claude Design file: "Vendor Executives List". Folder:
[`design/locked/vendor-executives-list/`](design/locked/vendor-executives-list/).
**Second locked vendor-portal screen.** The browseable executive directory — heart
of the vendor portal. Discovery surface using the new **vendor T3 variant** (76px
photo-led rows, white table card, whole-row click target with hover lift). Owner
role, Active vendor state.

- **New global decisions introduced** (see Global decisions section above):
  - Vendor T3 variant (76px rows, 48px photos, Inter 15/13 typography, white
    `--portal-card-reading` table card).
  - Single-row inline filter bar (replaces the heavier vertical filter panel
    on vendor surfaces — Issy explicitly rejected the stacked panel as taking
    half the page).
  - Sortable column header chevron pattern (Name + Company on this screen;
    admin-eligible when next touched).
  - Soft-green "Meeting complete" status tone (vendor-portal token, distinct
    from emerald + sage).
- **Inherits from Vendor Dashboard** (do not redesign): sidebar deep teal-pine,
  IA, count badges, vendor identity card, Sam Patel chip, topbar pattern. The
  "Executives" sidebar item is the ACTIVE state on this screen.
- **Header strip** (above the table, on warm-cream page):
  - Left: "240 active executives · 12 requested by your team · 8 met by your
    team" — first stat semibold ink, rest muted.
  - Middle: 380px search input "Search company…".
  - Right: Filters button — "Filters [▾]" empty / "Filters · N [▾]" with amber
    dot when active. Chevron direction reflects bar open/closed.
- **Single-row filter bar** (VP2 only, 64px, no card, on warm-cream page):
  "FILTER BY" mono eyebrow + 4 inline pills (Industry · 3 active amber-soft /
  Title ghost / Location · 1 active amber-soft / Status ghost) + right
  "4 of 240 match · Clear all". Pills show category + count only; values live
  in per-pill popover (not designed yet).
- **Table card** (`--portal-card-reading` white, rounded-2xl, --portal-line
  border):
  6 columns — EXECUTIVE (sortable, photo + name/title stacked) · COMPANY
  (sortable, 180px) · INDUSTRY (140px) · COUNTRY (pin icon + name, AU only
  for now) · STATUS (160px filled pill) · chevron-right column (64px,
  blank header).
- **Row design (vendor T3 variant):** 76px tall · 48px real Unsplash photo ·
  Name Inter 15px semibold · Title Inter 13px muted · whole row click target ·
  hover wash + subtle 1px lift shadow · chevron amber on hover.
- **Status pill tones** (see Global decisions): amber-soft (Request sent) /
  soft-green (Meeting complete) / muted-grey (Declined) / blank (none).
- **Sorting:** default `executive.created_at DESC` (Recently added), no chevron
  at rest. Name + Company columns clickable; active sort shows amber chevron-up
  or chevron-down after the header text.
- **Pagination footer** below the table: "Showing N to M of P executives" +
  page controls ◀ 1 2 3 … 24 ▶.
- **Three viewports designed:**
  - VP1 LOADED · no filters · 240 results.
  - VP2 FILTERS OPEN · 2 active (Industry + Location) · 4 results, bar visible.
  - VP3 FILTERS COLLAPSED · 2 active · 4 results, bar hidden, count + amber
    dot on button. This is the "almost hidden once chosen" state, the most
    common steady-state for an active filter session.
- **Sample data:** locked to the Vendor Dashboard set + 5 more execs (James
  Whitfield, Mei Tanaka, Rohan Mehta, Olivia Brennan, David Eze) for the
  10-row demo. All AU. Industries spread across Financial Services, Banking,
  Telco, Investment Management, Logistics SaaS, Energy & Resources, Insurance,
  Logistics, Pharmaceuticals, Mining.
- **Data sources per module** — exhaustive table in the screen README. Headline
  rules: status column reads from `request.status` per vendor+exec + override
  for any `meeting.status='held'`; default sort `executive.created_at DESC`;
  filter pill counts = number of values selected, not total possible.
- **NOT designed in this pass:** filter pill multi-select popover; loading /
  empty / error variants; pre-payment locked "book your call" state; sort
  active variants (chevron up vs down on Name / Company); detail pop-up
  modal + request form (separate screen #3).
- **Open decisions:** wordmark parked; Title / Seniority filter mechanism (raw
  title strings vs canonical seniority enum); whether the soft-green tone
  becomes an admin pattern too on next pass.
- **Anti-list (do not regress):** filter bar is single line ≤64px, never the
  vertical stacked panel Issy rejected; filter pill content is category + count
  only, never inline values; charity is NOT a column or filter here (lives in
  the detail pop-up only); table card is `--portal-card-reading` white, NOT
  warm cream; photos are real headshots in mockups (initials are production
  empty-state only); sage and emerald are forbidden on vendor surfaces (the
  soft-green status tone is a separate hue).
- **Issy's fix passes (2026-06-06):** Pass A.1 dropped charity column, kept
  country, switched table card to white, added sortable column chevron. Pass
  A.2 replaced the 4-row vertical filter panel with a single-row inline filter
  bar after Issy flagged the panel as "taking up half the page"; added VP3
  for the collapsed-but-active state.

### Vendor Dashboard — LOCKED 2026-06-05 (pending the wordmark call)
Claude Design file: "Vendor Dashboard". Folder:
[`design/locked/vendor-dashboard/`](design/locked/vendor-dashboard/).
**First locked vendor-portal screen.** Locks the vendor shell (sidebar colour, IA,
identity card, topbar) that every subsequent vendor screen inherits. Owner role,
Active vendor state. Member view + 5 vetting-gate states deferred to Pass B.

- **New global decisions introduced** (see Global decisions section above):
  - Vendor sidebar colour = deep teal-pine `oklch(0.32 0.045 195)` + companion
    tokens `--vendor-sidebar-soft` and `--vendor-sidebar-ink`.
  - "Band" not "Tier" in vendor-facing copy.
  - Vendor identity card pattern (sidebar bottom, above user chip).
  - Photo-led exec card grid (2×N cards for exec previews outside T3 lists).
- **Sidebar IA** (three groups, mono uppercase 10px tracking-[0.18em] @60%):
  REQUEST (Dashboard · Executives · Requests ▾ Pending [4] / Accepted / Declined ·
  Meetings ▾ Upcoming [2] / Past) · GOOD (Giving) · ACCOUNT (Get started [2] ·
  Team · Billing & credits · Settings — Account group hidden for Member role).
  Bottom: vendor identity card (Acme Robotics · Band 2 · Renews 12 Mar 2027)
  then user chip (Sam Patel · Acme Robotics · Owner · sign out).
- **Topbar** — H1 "Dashboard" + mono eyebrow "ACME ROBOTICS · BAND 2" left; search
  · bell with amber dot · SP avatar right. No "all systems operational" pill.
- **Metrics ribbon** — dark `--portal-ribbon`, 4 groups separated by white@10%
  hairlines, Fraunces 28px numbers, Inter 11px units:
  CREDITS (2 available · 0 reserved) · MEETINGS (1 pending · 1 held this month) ·
  TO CHARITY VIA YOU ($4,700 · this FY) · YOUR BAND (Band 2 · $1,000 / mtg).
- **Get-started shortcut** — conditional card above the main grid, renders only
  when checklist incomplete. Amber-soft icon tile + "Finish your onboarding" +
  "2 of 6 items remaining · Sign code of conduct, Upload company one-pager" +
  right "Open checklist →" amber link.
- **8/4 grid — LEFT (col-span-8)**:
  - **Upcoming meetings** widget — count chip "2" + "View all →". 56px dual-line
    rows with exec avatar | name/title/charity | DD Mon HH:MM AEST · 30 min +
    Join Zoom/Teams amber link.
  - **Executives for you** widget — 2×2 photo-led card grid (new locked pattern).
    Four cards: Priya Raghavan (CFO Lumen, RFDS, Request) · Daniel Akers (COO
    BigFour Bank, Beyond Blue, Request) · Helena Cho (CMO Brightline, OzHarvest,
    Requested) · Marcus Vance (MD Helix Capital, Smith Family, Request).
- **8/4 grid — RIGHT (col-span-4)**:
  - **Your credits** — Fraunces 40px "2" + mono "credits available" + hairline +
    "BAND 2 · $1,000 TO CHARITY / MEETING" + amber progress bar at 30% + "3 more
    held meetings to reach Band 3" muted + "Buy more credits →" amber link.
  - **Pending** — count chip "4" + "View all →". 4 rows: Priya Raghavan CFO
    Lumen (Waiting on exec, 2d) · Marcus Vance MD Helix (Waiting on exec, 5d) ·
    Helena Cho CMO Brightline (Accepted · securing time, 1d) · Sarah Liu CTO
    Vector (Waiting on exec, 11d).
  - **Your impact** — "View giving →" + sub-eyebrow "$4,700 to Good this FY · 8
    charities · 8 meetings held". 3 gift rows with heart-icon amber-soft:
    RFDS after Priya $1,000 · Beyond Blue after Marcus $900 · OzHarvest after
    Sarah $900.
- **STATE annotation row** at bottom of viewport: "STATE · DASHBOARD · OWNER ·
  ACTIVE" + right-side "VIEWING NOW" amber-soft pill.
- **Sample data** — locked to Acme Robotics / Sam Patel / Priya/Daniel/Helena/
  Marcus/Sarah / RFDS/Beyond Blue/OzHarvest/Smith Family. Every future vendor
  screen aligns to this set.
- **Data sources per module** — exhaustive table in the screen README. Headline
  rule: no money number computed in the page; every $ reads from
  `@thegoodintro/pricing` (`bandForMeetingNumber`, `formatAud`) or
  `lib/reporting.ts` (`vendorCharityForPeriod`, `financialYearWindow`). Photos
  read from `executive.photo_url` (placeholders in mockup).
- **NOT designed in this pass:** Member-view variant (no Get started, Team,
  Billing); 5 vetting-gate states (signed_up / call_booked / approved /
  paid-loading / dormant); empty/loading/error variants of each widget;
  notification dropdown popover (lives in topbar bell); search affordance
  destination; logo upload flow (Settings → Company profile).
- **Open decisions:** wordmark parked; "Executives for you" ordering signal
  undefined (rendered alphabetical/arbitrary); "Held this month" timeframe
  (calendar month assumed); whether the amber-soft tint on upcoming-meeting
  rows is hover-only or a deliberate "next up" highlight.
- **Anti-list (do not regress):** sidebar is deep teal-pine, never emerald
  (emerald = admin only); "Tier" forbidden in vendor copy (use Band); money
  never hardcoded; exec photos never literal in production (read from
  `executive.photo_url`); no "all systems operational" topbar pill; vendor logo
  goes in the sidebar identity card, NOT replacing the TheGoodIntro wordmark.
- **Issy's fix passes (2026-06-05):** Pass A.1 deleted "Needs your note" widget
  (no real use case), redesigned "Executives for you" from table-in-a-box to
  photo-led 2×2 card grid, added vendor identity card to sidebar bottom above
  the user chip. Pass A.2 swapped "Tier 2" → "Band 2" in topbar eyebrow and
  sidebar identity card.

### Admin Meeting detail · Vendor side rail-module — LOCKED 2026-06-07 (pending the wordmark call)
Claude Design file: "Admin Meeting Detail" (same file as parent). Folder:
[`design/locked/admin-meeting-detail-vendor-side/`](design/locked/admin-meeting-detail-vendor-side/).
Centre-body content for the Vendor side rail item on the locked Admin
Meeting detail T4 page. Shell + sticky header stack + left rail + right
Activity feed all LOCKED — this just specifies the centre column. First
of the Meeting detail rail-module build-out; symmetric with Exec side.
- **Four sections (--portal-card warm cream):**
  1. VENDOR IDENTITY header card — 56px AR logo + "Acme Robotics" +
     "VEN-1044 · Joined 12 Mar 2026" + Active status pill (gold dot).
     Structured chips: BAND 2 / 2 CREDITS / RENEWS 12 MAR 2027 / LAST
     MEETING HELD. Helper about band frozen at Held.
  2. WHY THIS MEETING — Q1/Q2 from vendor's request with full bodies
     (Priya Raghavan CFO Lumen, AP automation Q3 RFP angle). "Submitted
     22 Apr 2026. Not visible to Priya." helper.
  3. CONTACTS — Sam Patel PRIMARY (Head of RevOps) + Rosa Lin
     SECONDARY (Marketing Ops), 56px rows with 40px avatars.
  4. VENDOR-SIDE NOTES — 1 sage-tinted internal note from Issy
     Hardwick 5 days ago ("Acme has been excellent with prep…") +
     ghost "+ Add note" button.
- **Section header row:** mono "VENDOR SIDE" eyebrow + caption + ghost
  "Open full profile →" link right.
- **Single viewport** (LOADED · VENDOR SIDE ACTIVE) with left rail
  item highlighted. STATE annotation row at the BOTTOM only.
- **Anti-list (do not regress):** no duplicate STATE row at top; no
  "All systems operational" pill; no white surfaces (warm cream
  throughout); sage tint ONLY on Section 4 internal note; role pills
  (PRIMARY / SECONDARY) mono uppercase; status pills Inter title case
  + dot; NO money figures on this module; no em or en dashes; no
  emojis.
- **NOT designed in this pass:** Loading / Empty states; add-note
  composer (deferred to Notes module); edit/delete on sample note;
  hover state on contact rows.
- **Open decisions:** notes section needs own rail item if it grows
  past 2-3 notes (currently inline); wordmark parked.
- **Issy's fix passes (2026-06-07):** sidebar bottom user card
  drifted to "Issy Mbeki · Operations · Owner" with IS avatar.
  Reverted to "Isobel Hardwick · Founder · Owner" with IH avatar to
  match locked sample data.

### Admin Meeting detail · Exec side rail-module — LOCKED 2026-06-07 (pending the wordmark call)
Claude Design file: "Admin Meeting Detail". Folder:
[`design/locked/admin-meeting-detail-exec-side/`](design/locked/admin-meeting-detail-exec-side/).
Centre-body content for the Exec side rail item on the locked Meeting
detail T4 page. Symmetric counterpart to Vendor side.
- **Four sections (--portal-card warm cream):**
  1. EXEC IDENTITY header card — 56px PR avatar + "Priya Raghavan" +
     "Chief Financial Officer · Lumen Industries · Sydney AU" + Active
     status pill. Structured chips: ID EXC-1042 / 12 MEETINGS HELD /
     RESPONSE 78% / EA ON FILE. Helper about response rate deferred.
  2. WHY THIS MEETING — 3 matched-areas chips (mono uppercase soft-
     amber with hairline border): AP AUTOMATION / FINANCE OPS REVIEW /
     PEER CFO BENCHMARK + body about Priya's 16 Apr profile update
     match. "Matching is admin-only" helper.
  3. EA & CALENDAR — Lena Park EA + Google Calendar SYNCED rows.
     Helper about Lena's acceptance on Priya's behalf.
  4. CHARITY — RFDS row with **soft-amber $1,000 chip** + "TIER 2 BAND
     · FROZEN AT HELD" provenance micro-label + CHARITY_FLOW.md Model 2
     helper.
- (No Section 5 NOTES — exec-side notes deferred to symmetry pass.)
- **Section header row:** mono "EXEC SIDE" eyebrow + caption + ghost
  "Open full profile →" link.
- **Single viewport** with left rail EXEC SIDE highlighted. STATE
  annotation row at the BOTTOM only.
- **Anti-list:** money rule HARD — $1,000 charity figure ALWAYS carries
  soft-amber chip + provenance micro-label, never bare; matched-areas
  chips mono uppercase soft-amber with hairline border (NOT plain
  pills); status pills Inter title case + dot; no em or en dashes; no
  emojis.
- **NOT designed in this pass:** exec-side notes section; Loading /
  Empty states; hover state on EA & Calendar rows; linking matched-
  areas chips to Business context module.
- **Open decisions:** matched-areas chips link-out vs visual labels;
  response rate (78%) given calc is parked; wordmark parked.
- **Issy's fix passes (2026-06-07):** same sidebar user revert as
  Vendor side.

### Admin Meeting detail · Notes rail-module — LOCKED 2026-06-07 (pending the wordmark call)
Claude Design file: "Admin Meeting Detail". Folder:
[`design/locked/admin-meeting-detail-notes/`](design/locked/admin-meeting-detail-notes/).
Centre-body content for the Notes rail item on the locked Meeting detail
T4 page. Append-only thread of admin-only notes about this specific
meeting.
- **Section header:** mono "NOTES" eyebrow + caption "Admin-only notes
  about M-204. Not visible to vendor or executive." + count chip "2
  NOTES" + "Newest first ▾" sort toggle.
- **New note composer (top, warm cream):** IH avatar + mono "NEW NOTE"
  eyebrow + "0 / 400" counter + 3-row textarea placeholder "Add a note
  about this meeting…" + helper + Cancel + Save note (disabled until
  text entered).
- **Notes thread (newest first, 16px gap):** 2 sage-tinted cards with
  IH avatar + Issy Hardwick + relative timestamp + free-form mono sage-
  ink eyebrow ("POST-MEETING NOTE" / "PRE-MEETING PREP NOTE") + body +
  hover-only Edit / destructive Delete on own notes.
- **Bottom helper row:** "Notes are stored on this meeting only. To
  add a note that sticks to the vendor or executive's profile, go to
  their Notes module instead."
- **Single viewport** with NOTES rail item highlighted, badge "2" matches
  count chip. STATE annotation row at the BOTTOM only.
- **Anti-list:** sage tint on every note card (matches locked Inbox
  internal note + Vendor side internal note); Edit/Delete only on hover
  + only on own notes; mono sage-ink eyebrow is FREE-FORM text field
  (not fixed taxonomy); composer disabled by default; NO money
  figures; no em or en dashes; no emojis.
- **NOT designed in this pass:** composer expanded with text + active
  save state; edit-in-place flow; delete confirmation modal; @-mentions;
  Loading / Empty states.
- **Open decisions:** free-form eyebrow vs fixed taxonomy (currently
  free-form); private-to-author vs all-staff-visible (currently all-
  staff); notes audit retention (assume 7 years); wordmark parked.
- **Issy's fix passes (2026-06-07):** same sidebar user revert as
  Vendor side.

### Admin Settings · Staff tab — LOCKED 2026-06-06 (pending the wordmark call)
Claude Design file: "Admin Settings Staff". Folder:
[`design/locked/admin-settings-staff/`](design/locked/admin-settings-staff/).
Multi-user admin management surface. Eighth (and final) tab in the
Settings strip. For v1 Issy is the only staff user, but the tab is
fully designed so the multi-user flow is ready when she hires.
Inherits the 600px right-slide drawer pattern (Pay batch + Gmail OAuth)
and the sage reference-block pattern (AI / Notifications / Security /
Feature flags). No new portal-wide patterns introduced.
- **Tab strip change (locked this pass):** Staff label NO longer
  carries the `[SOON]` pill in this build — the tab is now built.
  Earlier-locked Settings tabs (Account / Security / Email signatures /
  Feature flags screens) still render `[SOON]` on the Staff label; not
  a priority retroactive fix.
- **Three sections (max-width 720px content column):**
  1. ACTIVE STAFF — count chip "2 ACTIVE · 1 PENDING INVITE" + primary
     ink "+ Invite staff" button. 2 staff rows: Owner row (40px IH
     avatar + Isobel Hardwick + issy@thegoodintro.com + mono OWNER pill
     gold dot + "Active just now" + small mono soft-amber "THIS ACCOUNT"
     pill + NO overflow) / Admin row (40px MT avatar + Mia Tan +
     mia@thegoodintro.com · Operations Manager + mono ADMIN pill
     amber-soft + "Active 2 hours ago" + overflow). Helper about
     Workspace SSO.
  2. PENDING INVITES — 1 row (56px hairline border): envelope
     placeholder avatar (no initials), alex@thegoodintro.com, "Invited
     2 days ago · Expires in 5 days", mono MEMBER pill muted grey,
     ghost "Resend ↻" + ghost destructive "Cancel invite" red link.
     Helper about 7-day expiry.
  3. ROLES & PERMISSIONS (SAGE-tinted, read-only) — mono "LOCKED ·
     MANAGED BY DEPLOY" eyebrow + intro line + 3 role definitions
     (Owner gold dot full access + 4 bullets / Admin amber-soft
     day-to-day + 4 bullets / Member muted grey view-only + 4 bullets).
     11px sage-ink note about RLS enforcement.
- **Invite drawer (locked, 600px right-slide, dim backdrop):** sticky
  header "INVITE STAFF MEMBER" mono. Body: EMAIL input ("alex@thegoodintro.com"
  prefilled) + helper. ROLE 3-radio chips (Owner DISABLED with
  transfer-ownership helper, Admin un-selected, Member SELECTED). Sage
  PERMISSIONS PREVIEW "MEMBER WILL BE ABLE TO" mini-block with 4
  bullets + "preview updates when you change the role" note. Optional
  PERSONAL MESSAGE textarea (200 char). Sticky footer: "READY TO SEND"
  gold-dot status left + ghost Cancel + primary ink "Send invitation"
  right. ESC / X / backdrop close.
- **Three states designed:**
  - VP1 LOADED — three sections rendered, no drawer.
  - VP2 INVITE DRAWER OPEN — same sections behind 30% dim backdrop +
    600px right-slide drawer with Member role selected.
  - VP3 LOADING — shell solid, three skeleton section cards including
    sage role-definition shimmer. Open decisions block rendered as
    footer (Claude Design bonus).
- **STATE annotation rows** at the BOTTOM of each viewport only.
- **Anti-list (do not regress):** no duplicate STATE row at top of any
  viewport; no "All systems operational" pill; no sticky save bar (Staff
  changes immediate, invite uses drawer footer); Staff tab label has NO
  `[SOON]` pill on the active tab; role pills mono uppercase with
  role-specific colour (Owner gold / Admin amber-soft / Member muted
  grey); THIS ACCOUNT pill only on current user row; Owner row has NO
  overflow menu (can't remove yourself); pending invite avatar is
  envelope placeholder (NOT initials); sage tint ONLY on Section 3 and
  on the drawer permissions preview; Cancel invite is destructive ghost
  red link, NOT primary button; invite drawer uses 600px right-slide +
  dim backdrop (matches Pay batch + Gmail OAuth), NOT the AI Prompt
  push-pane; no em or en dashes; no emojis.
- **NOT designed in this pass:** change role flow; remove staff
  confirmation modal; transfer ownership flow; view-activity per staff;
  bulk invite; seat count limits; promotion path UI; mobile layout.
- **Open decisions:** per-role custom invite copy (currently single
  template with role inserted); expired-invite handling (currently
  still-listed); transfer-ownership flow design (Section 3 copy implies
  "transfer first"); audit retention for staff changes (assume 7 years);
  wordmark parked.
- **Issy's fix passes:** none — landed cleanly on first iteration.

### Admin Settings · Feature flags tab — LOCKED 2026-06-06 (pending the wordmark call)
Claude Design file: "Admin Settings Feature Flags". Folder:
[`design/locked/admin-settings-feature-flags/`](design/locked/admin-settings-feature-flags/).
Per-user feature-flag surface for previewing in-development features.
Seventh tab in the Settings strip. Flags are per-user (toggling does not
affect other staff). System-locked flags (GA tier + SYSTEM FLAGS block)
cannot be toggled here — deploy-controlled. Includes a per-account
audit of recent flag changes (7-year retention matching sign-in events).
Inherits the 24×14 dense toggle variant from the Notifications tab and
the RECENT SIGN-INS audit table pattern from the Security tab. No new
portal-wide patterns introduced.
- **Three sections:**
  1. FLAGS (960px) — count chip "10 FLAGS · 3 ENABLED" + ghost "Reset
     all to default" link. Mono column headers FLAG · DESCRIPTION ·
     STAGE · ENABLED · LAST CHANGED · (overflow). 10 sample flags
     grouped under 4 thin category headers (COMMUNICATION · MONEY &
     STATE · REPORTS · INTEGRATIONS). Row anatomy: soft-amber mono 12px
     token chip / Inter 13px description / mono uppercase stage pill
     (Dev grey / Beta amber-soft / GA gold dot) / 24×14 dense toggle
     pill with LOCKED state showing padlock immediately right of toggle
     / DEFAULT-or-CUSTOM chip inline / mono date / overflow menu.
     Sample data: 3 GA flags (2 locked ON, 1 ON), 3 Beta flags, 4 Dev
     flags. Helper: "Toggling a flag does not affect other staff users."
  2. RECENT CHANGES (720px) — 44px-row read-only audit table with
     columns WHEN · FLAG · CHANGE · ACTOR. 5 sample rows showing mono
     "OFF → ON" transitions including nuanced two-line entries
     ("then auto-reverted", "then OFF on 29 May"). "VIEW FULL HISTORY →"
     mono link below. Helper about 7-year audit retention.
  3. SYSTEM FLAGS (720px, SAGE-tinted) — mono "LOCKED · MANAGED BY
     DEPLOY" eyebrow + intro line + 5 stacked rows (token chip + Inter
     title case status pill + description) for platform.maintenance_mode
     / platform.read_only / audit.log_retention_7y /
     security.session_30d_expiry / pricing.engine_v1. Bottom note:
     "Last system-flag deploy: 2 Jun 2026."
- **Sticky bottom save bar** (VP2 only, inherited from AI tab): "2
  UNSAVED CHANGES · View diff" + Discard + Save changes + helper
  "Changes apply to your account immediately after save. Other staff
  are unaffected."
- **Three states designed:**
  - VP1 LOADED · DEFAULTS — 3 flags ON at default, every togglable chip
    DEFAULT, no save bar.
  - VP2 MODIFIED · 2 UNSAVED — `inbox.slack_relay` + `reports.bas_export`
    flipped OFF → ON, both chips CUSTOM, count chip updates to "5
    ENABLED", save bar visible.
  - VP3 LOADING — shell solid, three skeleton section cards including
    sage system-flags shimmer.
- **STATE annotation rows** at the BOTTOM of each viewport only.
- **Anti-list (do not regress):** no duplicate STATE row at top of any
  viewport; no "All systems operational" pill; flag tokens render as
  soft-amber chips in mono 12px (NOT uppercase, NOT raw text); stage
  pills mono uppercase with stage-specific colour treatment; 24×14
  dense toggle variant (NOT 36×20) in the flags table; system-locked
  toggles show padlock immediately RIGHT of toggle (not inside track);
  DEFAULT/CUSTOM chips inline in ENABLED column; sticky save bar only
  on VP2; sage tint only on Section 3; "OFF → ON" uses the right-arrow
  character (NOT en or em dash); no emojis.
- **NOT designed in this pass:** flag-details drawer; "Reset all to
  default" confirmation modal; bulk-toggle (multi-select); "View full
  history" destination; flag-request flow; mobile layout.
- **Open decisions:** immediate-apply vs batched-save (currently batched
  matching AI/Notifications/Account convention); "Reset all to default"
  modal-confirm vs one-click; flag-change audit retention (7 years);
  wordmark parked.
- **Issy's fix passes:** none — landed cleanly on first iteration.
  Claude Design correctly resolved a math error in the prompt (the
  "ENABLED" count after the two VP2 flips is 5, not 6 as the prompt
  mistakenly stated).

### Admin Settings · Email signatures tab — LOCKED 2026-06-06 (pending the wordmark call)
Claude Design file: "Admin Settings Email Signatures". Folder:
[`design/locked/admin-settings-email-signatures/`](design/locked/admin-settings-email-signatures/).
Read-only Gmail-sourced signature surface. Fourth tab in the Settings strip.
Email signatures are MANAGED IN GMAIL, not edited in the platform: the
platform pulls the signature, renders a live preview, and uses it whenever
an outbound email sends. **No platform-side editor, no variable resolver,
no per-template overrides, and (per Issy's MVP call) no brand-rule
validation.** Inherits the Gmail mirror pattern from the locked Security
tab's Sign-in method block. No new portal-wide patterns introduced.
- **Two sections (after the cut):**
  1. SIGNATURE SOURCE (720px column) — read-only muted block: 40px Gmail
     icon + "Gmail" + `issy@thegoodintro.com` sub-line + small mono
     soft-amber pill "MANAGED BY GMAIL". Sync-status row below: mono
     "LAST SYNCED" + "3 minutes ago · 5 Jun 2026, 12:42 AEST" + ghost
     "Sync now ↻" button right. Helper about the hourly auto-sync +
     re-sync on every outbound send. Ghost link "Open signature settings
     in Gmail →" with external-link icon.
  2. CURRENT SIGNATURE (960px column, two-pane) — left pane "SIGNATURE
     METADATA" on warm cream with 4 rows (PULLED FROM · SIZE · FORMAT ·
     LAST CHANGED IN GMAIL). NO validation row, NO validation helper.
     Right pane "PREVIEW (read-only)" on `--portal-card-reading` WHITE,
     Inter 14px, sample signature: "Issy Hardwick / Founder · TheGoodIntro
     / issy@thegoodintro.com / (blank) / Building the executive
     philanthropy network. / calendly.com/issy-thegoodintro/intro".
     Helper "This is exactly how your signature appears in emails sent
     via the platform."
- **NO Section 3 (Brand validation rules).** Specified in re-do pass; cut
  entirely by Issy 2026-06-06 for MVP. Reconsider in v2 if signature
  drift becomes an issue.
- **Two states designed:**
  - VP1 LOADED — both sections rendered, no banner, STATE · LOADED +
    VIEWING NOW pill at the bottom.
  - VP2 LOADING — shell solid, two skeleton section cards (Gmail icon +
    sync row + helper shimmer / two-pane metadata + white preview
    shimmer). STATE · LOADING + SKELETON pill at the bottom.
- **STATE annotation rows** at the BOTTOM of each viewport only (single
  row).
- **Anti-list (do not regress):** no duplicate STATE row at top of any
  viewport; no "All systems operational" pill; no editor / variable
  chips / preferences / variables table / sticky save bar; no brand
  validation banner or status row in metadata; preview pane uses white
  (only place white is used on this tab), all other surfaces warm
  cream; preview does NOT highlight variables in amber (Gmail-sourced
  HTML, no platform variable resolution); no em or en dashes, no
  emojis; tab strip Email signatures ACTIVE with 2px ink underline.
- **NOT designed in this pass:** Gmail deep-link target spec; Sync now
  loading mid-state animation; auto-sync background job surface;
  multi-mailbox / signature-per-sender; mobile layout.
- **Open decisions:** auto-sync cadence (currently hourly + every send
  + manual) — confirm; brand validation revisit in v2; wordmark parked.
- **Issy's fix passes (2026-06-06):** Pass 1 redirected the entire tab
  from editor + preferences + variables table + brand-enforcement to a
  Gmail-sourced read-only mirror. Pass 2 cut the Brand validation
  rules section + VP2 VALIDATION FAILED viewport + VALIDATION metadata
  row + validation helper entirely. Final tab is two sections, two
  viewports, fully read-only.

### Admin Settings · Security tab — LOCKED 2026-06-05 (pending the wordmark call)
Claude Design file: "Admin Settings Security". Folder:
[`design/locked/admin-settings-security/`](design/locked/admin-settings-security/).
Sign-in, session, and audit surface inside the locked Settings shell. Second
tab in the strip. Sign-in is delegated to Google Workspace SSO so this tab
is mostly read-only — no editable settings, no sticky save bar. Introduces
the **security alert banner** pattern (amber-soft callout above sections
with acknowledge + lockdown actions) — reusable for any urgent
acknowledge-or-lockdown surface.
- **Four sections (max-width 720px content column):**
  1. SIGN-IN METHOD — read-only muted block, 40px Google G logo +
     "Google Workspace SSO" + issy@thegoodintro.com sub-line + small mono
     soft-amber pill right "MANAGED BY GOOGLE". Helper + "Open Google
     Account settings →" ghost link with external-link icon.
  2. ACTIVE SESSIONS — mono "3 SESSIONS" count chip + ghost "Sign out all
     other devices" button right. 3 session rows: Chrome 124 macOS 14
     Sydney (THIS DEVICE pill, no sign-out) / Safari 17 iOS 18 Sydney /
     Chrome 122 macOS 13 Sydney (Sign out links). Helper about 30-day
     auto-expiry.
  3. RECENT SIGN-INS — compact 44px-row read-only table, 5 columns (WHEN
     · DEVICE · LOCATION · IP · STATUS), 5 sample rows all Success gold
     dot. "VIEW FULL HISTORY →" mono link right-aligned. 7-year retention
     helper.
  4. SYSTEM-ENFORCED SECURITY (SAGE-tinted) — mono "LOCKED · NOT
     USER-CONFIGURABLE" eyebrow + 5 bullets (30-day session expiry / new
     device email alert / 5 failed = 1-hour lockout / Workspace 2FA
     required / 7-year audit retention). 11px note pointing at
     SECURITY_AND_COMPLIANCE.md.
- **Security alert banner (NEW PATTERN, locked this pass):** amber-soft
  callout rendered above Section 1 only when a security event needs
  acknowledgement. Anatomy: `--portal-amber-soft` bg + 24px padding +
  hairline amber-tinted border / mono amber-ink eyebrow with leading
  gold dot / Inter 14px semibold heading / Inter 13px body with event
  details / action row (primary ink "Yes, this was me" + ghost
  destructive "Lock my account, this wasn't me" red link) / 11px muted
  helper. Reusable for any future urgent acknowledge-or-lockdown
  surface across portals.
- **Three states designed:**
  - VP1 LOADED · DEFAULTS — four sections rendered, no alert banner.
  - VP2 ALERT · NEW DEVICE — same shell + alert banner above Section 1
    (Chrome 124 Windows 11, Brisbane AU, 49.182.45.99, 5 Jun 2026
    11:42 AEST). 4th session row added to Active Sessions with **amber
    edge dot on left** (matching M-188 row pattern from Admin Giving).
    Recent Sign-ins gains a top row matching the new device with
    status "Success · new device" (amber dot, NOT gold).
  - VP3 LOADING — shell solid, 4 skeleton section cards including sage-
    tinted system-rules block skeleton.
- **STATE annotation rows** at the BOTTOM of each viewport only (single
  row): VP1 STATE · LOADED + VIEWING NOW / VP2 STATE · ALERT + VIEWING
  NOW / VP3 STATE · LOADING + SKELETON. VP3 also rendered an OPEN
  DECISIONS · PARKED block below the STATE row documenting parked items
  (nice bonus).
- **Anti-list (do not regress):** no duplicate STATE row at the top of
  any viewport; no "All systems operational" pill; no sticky save bar;
  sage tint ONLY on Section 4 (Sign-in method is muted with soft-amber
  MANAGED BY GOOGLE pill, NOT sage); status pills Inter title case + dot,
  NEVER mono uppercase; "Lock my account" is a destructive ghost red
  link, NOT a primary button; new session row in VP2 has an amber edge
  dot on the left.
- **NOT designed in this pass:** "Lock my account" destructive confirm
  modal; "View full history" destination; new device pairing / naming
  flow; platform-managed 2FA layer; recovery codes UI; sign-out
  confirmation toast; mobile layout.
- **Open decisions:** whether platform should manage its own 2FA layer
  separate from Workspace; "VIEW FULL HISTORY" destination (Settings
  sub-page vs admin audit log surface); failed-attempt lockout threshold
  (5/15min — confirm); session inactivity expiry (30 days — confirm);
  wordmark parked.
- **Issy's fix passes:** none — landed cleanly on first iteration.

### Admin Settings · Account tab — LOCKED 2026-06-05 (pending the wordmark call)
Claude Design file: "Admin Settings Account". Folder:
[`design/locked/admin-settings-account/`](design/locked/admin-settings-account/).
Per-user identity, contact, and display preferences. Leftmost tab in the
locked Settings strip (Account · Security · Integrations (default) · Email
signatures · AI · Notifications · Feature flags · Staff [soon]). First of
the Settings sub-tab build-out; inherits every pattern from the AI tab and
Notifications tab. No new portal-wide patterns introduced.
- **Three sections (max-width 720px content column):**
  1. PROFILE — 80px round IH avatar + "Upload photo" ghost + "PNG or JPG.
     Max 1MB." helper. 2-col field grid: First name "Isobel" / Last name
     "Hardwick" / Display name (optional) "Issy" / Title "Founder". Full-
     width Bio (optional, 200 char max, character counter right of label,
     DEFAULT chip inline with label).
  2. CONTACT — Email "issy@thegoodintro.com" read-only with small mono
     VERIFIED pill right of field + "Managed by Google Workspace" helper.
     Phone (optional, E.164 placeholder "+61 4xx xxx xxx") + helper
     "Urgent platform alerts only". Timezone select "Australia / Sydney
     (AEST)" + helper. Locale select "English (Australia)" (single option
     v1).
  3. DISPLAY — Default landing page select "Dashboard" (options Dashboard
     / Inbox / Meetings / Vendors / Executives) + helper "Where to go
     after sign-in." Date format segmented Long "14 May 2026" [selected]
     / Short "14/05/26". Time format segmented 24-hour "14:00" [selected]
     / 12-hour "2:00 PM".
- **DEFAULT / CUSTOM chips inline with field label** (NOT below helper).
  Bio chip placement was corrected in the fix pass to match the rest.
- **Sticky bottom save bar** (VP2 only, hidden on VP1 / VP3): 88px,
  hairline above, "3 UNSAVED CHANGES · View diff" left + ghost Discard
  + primary ink "Save changes" right + 11px helper "Changes apply across
  the platform immediately after save."
- **Three states designed:**
  - VP1 LOADED · DEFAULTS — all chips DEFAULT, no save bar.
  - VP2 MODIFIED · 3 UNSAVED — three CUSTOM changes (Title "Founder"
    → "Founder & CEO" / Phone empty → "+61 412 345 678" / Default
    landing page "Dashboard" → "Inbox"), save bar visible.
  - VP3 LOADING — shell solid, 3 skeleton section cards mimicking real
    anatomy (avatar circle + button + field grid + textarea / 4 field
    shimmers with VERIFIED-pill shimmer / 3 field shimmers).
- **STATE annotation rows** at the BOTTOM of each viewport only (single
  row, NOT two): VP1 STATE · LOADED + VIEWING NOW / VP2 STATE · MODIFIED
  + VIEWING NOW / VP3 STATE · LOADING + SKELETON. Top viewport-label
  drift stripped in the fix pass.
- **Anti-list (do not regress):** no duplicate STATE row at the top of
  any viewport (single bottom row is the locked pattern); no "All systems
  operational" pill in topbar; no sage tint anywhere on this tab (Account
  has no staff-only / AI / system-rules content); Email field is read-only
  with muted background + mono VERIFIED pill (NOT sage); DEFAULT / CUSTOM
  chips inline with field label, right side (NOT below helper, NOT at top
  of section); sticky save bar visible ONLY on VP2; tab strip Account is
  ACTIVE with 2px ink underline.
- **NOT designed in this pass:** "View diff" destination; avatar upload
  flow; email change flow (workspace-side); date / time custom format
  strings; save confirmation toast; mobile layout.
- **Open decisions:** "View full diff" destination; whether Phone should
  also drive SMS notifications (helper currently says urgent platform
  alerts only); wordmark parked.
- **Issy's fix passes (2026-06-05):** stripped duplicate top viewport-
  label tags from all three viewports (same drift as Meeting detail / AI
  tab / Notifications tab); moved Bio DEFAULT chip from below the helper
  paragraph to inline with the field label, matching every other field.

### Admin Settings · Notifications tab — LOCKED 2026-06-05 (pending the wordmark call)
Claude Design file: "Admin Settings Notifications". Folder:
[`design/locked/admin-settings-notifications/`](design/locked/admin-settings-notifications/).
Per-user preferences for how and when Issy receives notifications across
channels (in-app dropdown, email digest, Slack). The Notification dropdown's
cog footer link points here. Inherits every pattern from the locked AI tab
(toggle pill, DEFAULT/CUSTOM chips, sticky save bar, sage tint for read-only
system-rules content).
- **Tab strip update:** Settings tab order is now Account · Security ·
  Integrations (default) · Email signatures · AI · **Notifications** ·
  Feature flags · Staff [soon]. Notifications inserted between AI and
  Feature flags.
- **Six sections (max-width 720px column):**
  1. WHERE TO BE NOTIFIED — In-app bell dropdown toggle (default ON) +
     Email digest select (default Daily 08:00 AEST) + Slack toggle DISABLED
     with "Connect Slack in Integrations to enable" helper + "Configure →"
     link.
  2. WHAT TO BE NOTIFIED ABOUT — 6-row table with TYPE column (mono +
     leading icon) + IN-APP / EMAIL / SLACK toggle columns. **Smaller
     24×14 toggle pill variant for table density** (same shape rules as the
     standard 36×20, just smaller). SLACK column uniformly DISABLED with
     sub-helper. Rows: UNREAD INBOX (IN/EM/-) · MEETING MOVE REQUESTED
     (IN/EM/-) · GIFT OVERDUE (IN/EM/-) · NEW VENDOR ONBOARDED (IN/-/-) ·
     NEW EXEC ONBOARDED (IN/-/-) · SYNC FAILURE (IN locked/EM locked/-).
     Aggregate chip: DEFAULT / "N OVERRIDE" amber when cells changed.
  3. QUIET HOURS — toggle (default ON) + two time inputs (default 19:00 -
     08:00 AEST). Helper: "Urgent notifications (sync failures, overdue
     payments) bypass quiet hours and arrive immediately."
  4. AUTO-SNOOZE RULES — toggle (default OFF) "Snooze notifications if I'm
     not assigned" + helper.
  5. USAGE THIS WEEK (read-only stats) — Notifications received 47 / opened
     38 (81%) / dismissed 9 / snoozed 0. "View full breakdown →" link
     (destination deferred).
  6. SYSTEM RULES (SAGE-tinted) — mono "LOCKED · NOT USER-CONFIGURABLE" +
     5 bullets (sync failures bypass quiet hours / gift overdue at 7+14
     days / meeting moves immediate / unmatched hourly / no read-receipt
     notifications). 11px note: "These rules are enforced in code, not by
     user setting. See ADMIN_INBOX_SPEC.md §10 and §11."
- **Smaller 24×14 toggle variant (LOCKED this pass):** for dense table cells
  only. Same pill shape rules as the standard 36×20: ON ink track + thumb
  right, OFF muted-grey track + thumb left, LOCKED padlock right of toggle.
- **Three states designed:** VP1 LOADED defaults / VP2 MODIFIED (3 settings
  changed: Email digest Weekly + UNREAD INBOX Email OFF + Quiet hours
  21:00-07:00; sticky save bar with "3 UNSAVED CHANGES") / VP3 LOADING
  (6 skeleton section cards + 6-row skeleton table).
- **Anti-list:** Slack column disabled across the board (NOT struck-through,
  NOT hidden — just disabled with affordance to enable); SYNC FAILURE row
  In-app + Email are LOCKED with padlock (system-critical, can't be
  disabled); sage tint ONLY on Section 6.
- **NOT designed:** "View full breakdown" page; Save confirmation toast;
  Slack-connected state; per-channel quiet-hours overrides; mobile.
- **Open decisions:** "View full breakdown" destination; per-channel quiet-
  hours; wordmark.
- **Known cosmetic drift (build strips):** VP2 has duplicate STATE row at
  the top with UNSAVED pill (same drift as Meeting detail + AI tab).
  Single STATE row at the bottom is the locked pattern.

### Admin Settings · AI tab — LOCKED 2026-06-04 (pending the wordmark call)
Claude Design file: "Admin Settings AI". Folder:
[`design/locked/admin-settings-ai/`](design/locked/admin-settings-ai/). The
per-user AI preferences tab inside the locked Admin Settings shell. Controls
how the AI Prompt drawer (Pass 2 of Admin Inbox) behaves on Issy's inbox.
Referenced by MESSAGING_AI_DRAFT_SPEC.md §13 and the Notification dropdown's
cog footer link.
- **Tab strip update:** the locked Settings tab order is now Account ·
  Security · Integrations (default) · Email signatures · **AI** · Feature
  flags · Staff [soon]. AI inserted between Email signatures and Feature
  flags.
- **First locked use of the 36×20 toggle pill pattern** (codified as a
  Global decision this pass — see top of this log).
- **Six sections (max-width 720px content column):**
  1. AUTO-GENERATE DRAFTS — toggle default ON. Drafts auto-generated on each
     inbound; drawer's Drafts tab shows them on open.
  2. DRAFT VARIETY — two-column field grid. Drafts per generation select
     (1 / 3 / 5, default 3) + Default label preference select (Direct /
     Warm / Strategic / Concise, default Direct). Helpers on cost and
     drawer sort.
  3. REGENERATION — Use Opus on regenerate toggle, default OFF (4× cost
     impact vs Sonnet 4.6).
  4. TRANSPARENCY — Show Prompt tab toggle, **LOCKED for admin users** with
     12px padlock immediately right of the toggle + "ADMIN OVERRIDE" chip.
     Helper: "Admins always see the Prompt tab. This setting is for staff
     accounts."
  5. USAGE THIS MONTH (read-only stats) — Drafts generated 84 / Drafts used
     62 (74%) / Median edit distance 23 chars / Cost USD $3.74 in soft-amber
     chip "from Anthropic billing". "View full breakdown →" ghost link
     (destination deferred).
  6. HARD RULES (SAGE-tinted read-only block) — mono "LOCKED · NOT
     USER-CONFIGURABLE" eyebrow + 6 bullets (never auto-sends / never
     invents $ / brand naming / forbidden vocab / no dashes / no third-party
     training). 11px note: "These are enforced in code, not by prompt
     instruction. See MESSAGING_AI_DRAFT_SPEC.md §11."
- **DEFAULT / CUSTOM chip pattern (LOCKED this pass):** small soft-amber
  mono chip inline with each field label / toggle, indicating whether the
  row is at default (DEFAULT) or overridden (CUSTOM). Reusable for any
  per-user settings surface.
- **Sticky bottom save bar (VP2 only):** 88px, hairline above, "N UNSAVED
  CHANGES · View diff" left + ghost Discard + primary ink Save changes
  right + 11px helper "Changes apply to your AI drawer immediately after
  save." Hidden on VP1 (defaults) and VP3 (loading).
- **Three states designed:** VP1 LOADED defaults / VP2 MODIFIED (3 settings
  changed, save bar visible) / VP3 LOADING (5 skeleton section cards).
- **Anti-list (do not regress):** toggle uses PILL shape NOT rounded square;
  sage tint ONLY on the Hard rules block (not on user-configurable
  sections); Show Prompt tab toggle is LOCKED/disabled for admin (NOT a
  regular interactive toggle); Usage stats are read-only (no controls);
  sticky save bar appears ONLY when there are unsaved changes.
- **NOT designed in this pass:** "View full breakdown" destination page;
  other tabs' content (Account / Security / Email signatures / Feature
  flags / Staff); per-section "Reset to default" affordance; Save-
  confirmation toast/modal; cost projection on Drafts per generation
  change; mobile layout.
- **Open decisions:** "Reset to default" affordance; "View full breakdown"
  destination; cost projection; wordmark.
- **Issy's fix passes (2026-06-04):** stripped duplicate STATE row on VP2
  (same drift as Meeting detail had); fixed toggle shape from rounded
  square to proper 36×20 pill, padlock for locked toggle moved to
  immediately right of the toggle.

### Notification dropdown — LOCKED 2026-06-04 (pending the wordmark call)
Claude Design file: "Notification Dropdown". Folder:
[`design/locked/notification-dropdown/`](design/locked/notification-dropdown/).
A 380px popover that opens when Issy clicks the topbar bell. Aggregates
operational notifications across multiple types (unread inbox, meeting moves,
gift overdues, new vendor/exec onboardings, sync failures), NOT just inbox
messages. Lives in the shared `<PortalTopbar>` component — single source for
all three portals.
- **Geometry:** 380px wide, anchored top-right under the bell with a 12px
  caret pointing up. Subtle 10% black backdrop (topbar + page stay visible —
  this is NOT a full modal). Background `--portal-card` warm cream (NOT
  `--portal-card-reading` white — that's Inbox-specific). Close on click
  outside / Esc / click bell again.
- **Header (40px, hairline below):** mono "NOTIFICATIONS" eyebrow + small
  amber count pill ("6") left; ghost "Mark all read" link with check icon
  right. When count is 0: pill renders muted grey; Mark all read is disabled
  lower opacity.
- **Notification row anatomy (64px, hairline between, scrollable to ~480px):**
  32px round icon circle on `--portal-amber-soft` (icon varies by type:
  envelope / calendar-with-arrow / gift-with-clock / person-with-check /
  briefcase-with-check / warning-triangle) + two-line body (mono 10px
  uppercase TYPE label + Inter 13px ink truncated body) + mono 11px muted
  timestamp right. Hover: `--portal-card-hover` background + per-row "..."
  overflow appears (Mark this read / Snooze / Go to source / Dismiss);
  timestamp hidden under hover (open decision: build can refine to show
  both). Click row → navigates to source page.
- **Footer (40px, hairline above):** "GO TO INBOX →" mono link left;
  muted "Showing N of M · K sync warnings hidden" centre; cog icon
  "Notification settings" right (links to future
  `/admin/settings/notifications`).
- **VP1 LOADED:** 5 notifications, mixed types, Sam Patel row hovered, bell
  amber dot visible, footer "Showing 5 of 6 · 1 sync warning hidden".
- **VP2 EMPTY:** centred 48px amber check-circle outline + "All caught up."
  + "No new notifications since you last checked." muted sub-line. Header
  count "0" muted; Mark all read disabled; footer centre "All read · last
  cleared 14m ago"; bell amber dot ABSENT.
- **VP3 LOADING:** 5 skeleton rows matching loaded anatomy + count badge
  skeleton + footer centre "Loading..."; bell dot still visible.
- **Sample data locked:** UNREAD INBOX Sam Patel 12m ago / MEETING MOVE
  Priya R. M-211 2h ago / GIFT OVERDUE M-188 Beyond Blue 14 days 6h ago /
  UNREAD INBOX Rosa Lin Yesterday / NEW EXEC Helena Cho Brightline 2 days
  ago. +1 hidden: SYNC FAILURE Calendly.
- **Anti-list:** popover doesn't cover the bell (anchored UNDER with caret);
  bell amber dot disappears in empty state; icon circles use amber-soft NOT
  sage (sage is staff-only AI-generated, not generic notifications);
  per-row overflow stays HIDDEN until row hover (only Sam Patel row shows
  it in VP1); no em or en dashes; no emojis.
- **NOT designed in this pass:** Mark-all-read transition animation;
  per-row overflow menu expanded state; Snooze date picker; notification
  preferences page at `/admin/settings/notifications`; Vendor and Exec
  portal versions (popover is shared but content varies); error state.
- **Open decisions:** timestamp visibility on hover (build can refine);
  sync failures persistent-at-top vs hidden (currently hidden); per-portal
  notification mix; wordmark parked.

### Admin Meeting detail (T4) — LOCKED 2026-06-04 (pending the wordmark call)
Claude Design file: "Admin Meeting Detail". Folder:
[`design/locked/admin-meeting-detail/`](design/locked/admin-meeting-detail/).
The detail page for an individual meeting record (route:
`/admin/meetings/{meeting_id}`). Symmetric to the LOCKED Admin Vendor detail
and Admin Executive detail screens — same T4 anatomy (header + left module
rail + centre active module + right Activity feed), different content. The
brand-critical new piece this page introduces is the **Gift record module**
showing the Held → Released → Paid → Receipt donation lifecycle. First T4
detail page rendered after the portal-wide back button pattern was added
2026-06-04 — also the reference for how the back button row sits above the
breadcrumb on detail pages.
- **Page header stack (four rows, all sticky):**
  1. Back button row (32px) — `← Back` ghost button left, click → `/admin/meetings`.
  2. Breadcrumb row — "HOME / MEETINGS / M-204" mono 11px uppercase muted.
  3. H1 row (~64px) — "M-204 · Acme Robotics → Priya Raghavan" Inter 18-20px
     semibold + inline status pill "Held · Awaiting payment" (Inter title case,
     gold dot — per locked status-pill global decision).
  4. Structured chips + action cluster row (~48px) — 4 chips left
     (MEETING M-204 / DATE 14 MAY 2026 · 14:00 AEST / DURATION 30 MIN /
     VENUE ZOOM) + action cluster right (ghost Reschedule + ghost Cancel
     meeting + primary ink "Mark paid →" + overflow "..." with View transcript
     / Resend confirmation / Open in Calendar / Reverse gift (admin only) /
     Print summary / Copy meeting link).
- **T4 body (three columns):**
  - Left module rail (~200px, sticky): OVERVIEW / GIFT RECORD (amber dot when
    awaiting payment) / COMMS (count 3) / VENDOR SIDE / EXEC SIDE / CALENDAR &
    STATUS / NOTES (count 2). **No Tags module** — tags are vendor/exec-scoped,
    not meeting-scoped.
  - Centre active module (depends on rail selection).
  - Right Activity feed (~320px, sticky): mono "ACTIVITY" eyebrow + "Newest
    first ▾" toggle. Gold timeline rail, 56px event rows, append-only. 8 sample
    events newest-first: GIFT BATCHED / RECEIPT REQUESTED / GIFT RELEASED /
    GIFT RECORD CREATED / MEETING HELD / MEETING STARTED / MEETING CONFIRMED /
    MEETING PROPOSED. "LOAD EARLIER →" link at bottom.
- **Overview module (default, VP1):** four sections — MEETING FACTS ("What
  happened") / MONEY ("Frozen at Held") / CREDIT ("Acme Robotics cycle") /
  LINKED RECORDS ("Open the related profiles"). Every $ figure in soft-amber
  chip with provenance micro-label ("from pricing engine" / "Tier 2 band,
  frozen at Held"). Linked records render as 3 horizontal cards (Acme
  Robotics / Priya Raghavan / Royal Flying Doctor Service) each with Open
  profile/charity → links.
- **Gift record module (the brand-critical piece, VP2):**
  - **Lifecycle bar** (~80px top strip): four chips horizontal connected by
    chevrons — `[ HELD ✓ ] → [ RELEASED ✓ ] → [ PAID ] → [ RECEIPT ]`.
    Completed chips soft-amber + gold checkmark + timestamp; future chips
    hairline hollow + dashed `—`. Chevrons gold between completed steps,
    muted between hollow.
  - Status line below: mono "STATUS" + Inter "Awaiting payment · expected
    within 7 days of release" + gold dot.
  - Four sections: DONATION DETAILS ("Frozen at Held") with Charity + ABN +
    Amount soft-amber chip + Band + Released at; 11px note "Donation flows per
    CHARITY_FLOW.md Model 2: TheGoodIntro receives the full $1,500, donates
    this amount from its own funds, claims the deduction. Vendor (Acme) does
    not receive a gift receipt." · PAYMENT DETAILS ("Charity bank record") —
    BSB / Account / Reference / Bank, click-to-copy icons, primary ink "Mark
    this gift paid →" button **left-aligned at section bottom, fit-content,
    min-width 240px, label on single line** · RECEIPT TRACKING — Receipt
    requested Yes · queued / Receipt received Not yet / Receipt filed Not yet
    + 11px muted "Receipt expected within 14 days of payment. Track at
    /admin/giving filtered by Awaiting receipt." · REVERSAL — collapsed (admin
    only, "used if a gift is paid in error").
- **Loading state (VP3):** Back button row solid. All other header rows
  skeletons. All three body columns skeletons (7-row rail / mono-header +
  4-section centre / eyebrow + 6 event-row feed). STATE annotation with
  SKELETON pill bottom.
- **Other status variants deferred:** Proposed / Confirmed (not yet held) /
  Cancelled / No-show. Current viewport is Held · Awaiting payment only.
- **Sample data (all aligned with the locked set):** M-204 · Acme Robotics
  (VEN-1044) · Sam Patel ← Priya Raghavan (EXC-1042) · CFO Lumen Industries ·
  EA Lena Park · 14 May 2026 14:00 AEST 30 min Zoom · Tier 2 frozen $1,000 to
  RFDS / $500 kept · cycle anchor 12 Mar 2026 / renews 12 Mar 2027 · meeting 7
  of 5-10 in cycle.
- **STATE annotation rows** on all three viewports (VP1 VIEWING NOW · VP2
  VIEWING NOW · VP3 SKELETON).
- **Anti-list (do not regress):** no "All systems operational" pill in the
  topbar; no SYNCED pill; no duplicate STATE rows per viewport (one at the
  bottom only); no white reading pane (T4 uses warm cream throughout — white
  is Inbox-specific); no sage tint (sage is staff-only/AI-generated, not used
  here); status pills use Inter title case + dot, NEVER mono uppercase; every
  $ figure shown with provenance micro-label.
- **NOT designed in this pass (deferred):** other rail modules' centre bodies
  (Comms, Vendor side, Exec side, Calendar & status, Notes); Reversal expanded
  state; Proposed / Cancelled / No-show status variants; Empty / Error states.
- **Open decisions:** H1 "→" arrow character vs custom icon (currently
  character, both acceptable); Cancellations sub-item kept for completeness;
  Reversal expanded state design; sample-data verification at build time.
- **Issy's fix passes (2026-06-04):** removed re-appeared "All systems
  operational" topbar pill; stripped duplicate STATE annotation at top of VP2;
  fixed "Mark this gift paid →" button width (was wrapping label across 3
  lines, now fit-content min-width 240px single-line label).

### AI Prompt drawer — LOCKED 2026-06-04 (pending the wordmark call)
Claude Design file: "Admin Inbox" (Pass 2 of the same Claude Design file as
Admin Inbox; drawer viewports are stacked below the inbox viewports).
Folder: [`design/locked/ai-prompt-drawer/`](design/locked/ai-prompt-drawer/).
The drawer that opens from the AI Prompt button (visible only in Internal Note
mode) on the Admin Inbox composer. Surfaces every fact the platform knows
about the conversation's contact, and presents 3 AI-drafted reply variants for
Issy to pick from. **NEVER auto-sends** — "Use this draft" copies into the
composer for Issy to edit and click Send.
- **Geometry:** 560px wide, slides from the right edge of the reading pane,
  **pushes thread leftward** (does NOT overlay). Composer at the bottom of the
  reading pane stays fully visible and uncovered. White drawer body
  (`--portal-card-reading`, carried from Pass 1). Hairline left border.
- **Sticky header (64px):** sparkle outline icon + H2 "AI Prompt" + small muted
  timestamp ("Generated 12s ago" / "Awaiting link"). Close X right.
- **Tabs strip (40px):** CONTEXT · DRAFTS (3) · PROMPT [ADVANCED micro-label].
  2px ink underline on active. Drafts count shows "(0)" muted when unmatched.
- **Sticky footer (88px):** Regenerate ghost + prompt input + Go primary ink.
  11px muted helper "Modifies the next generation. The original drafts stay
  above." All three controls DISABLED when unmatched.
- **Drafts tab (LOCKED, default open on linked conversations):** eyebrow
  "DRAFTS · GENERATED FROM CONTEXT" + "Xs ago" right. Three labelled draft
  cards stacked, 16px gap: DIRECT · INFORMATIONAL / WARM · RELATIONAL /
  STRATEGIC · PUSH-BACK (replaced with CONCISE if no strategic angle).
  Each card (24px padding, hairline border, hover state): mono label + small
  Copy icon + body in Inter 14px + soft-amber **tokens chip row** showing
  resolved values (e.g. `{{credits_remaining}} → 2` — proves every money figure
  came from the pricing engine) + primary ink "Use this draft →" button.
- **Context tab (LOCKED):** eyebrow "CONTEXT · WHAT THE PLATFORM KNOWS" +
  refresh ghost icon. Eight collapsible cards, 12px gap:
  1. WHO THEY ARE (expanded default) — identity facts + Open profile link.
  2. WHERE THEY ARE IN THE CYCLE (vendors only, expanded) — band, credits,
     cycle dates, charity-per-meeting + TheGoodIntro fee. Every $ figure with
     soft-amber "from pricing engine" micro-label. 11px note: "Every $ figure
     pulled live from the pricing engine. Not a snapshot."
  3. ONBOARDING (collapsed) — summary "5 of 6 steps · Calendar not connected".
  4. RECENT ACTIVITY (expanded) — timeline of last 5 events + "View full
     activity →" link.
  5. ORIGINAL REQUEST ANSWERS (collapsed) — summary "Most recent: 22 Apr 2026".
  6. CHARITY CHOICE + LIVE DONATION TOTAL (expanded) — chosen charity, ABN,
     total donated through this contact, last donation paid.
  7. OPEN FLAGS (expanded) — list of operational flags with coloured pills.
  8. CONVERSATION SUMMARY (expanded, **SAGE-tinted card**) — AI-generated 2-3
     sentence summary + Refresh icon. 11px note: "Generated by the same model
     as the drafts. Cached for 30 min or until a new message."
- **Prompt tab (LOCKED, transparency surface):** eyebrow "PROMPT ·
  TRANSPARENCY" + soft-amber chip "MODEL · CLAUDE-SONNET-4-6" + Copy all icon.
  Five stacked section cards, bodies in **JetBrains Mono 12px**:
  1. SYSTEM PROMPT (expanded) — Role / Voice & Tone / Brand Naming / Forbidden
     Vocabulary / Money Rule / Token Catalogue / Draft Variety Rule / Hard
     Guardrails. Truncated with "Show more (N more lines)" link.
  2. CONTEXT (collapsed) — header "~3,200 tokens · serialised from drawer
     Context tab".
  3. CONVERSATION (expanded) — last 20 messages formatted as
     `[timestamp] sender to recipient: body` + muted "Last 20 messages
     included; this thread has N."
  4. INTERNAL NOTES (expanded, **sage left bar**) — internal notes from last
     24h treated as "Issy's thinking". Sage signals staff-only content.
  5. TASK (collapsed) — header "Draft three replies to the latest inbound".
  Bottom metadata bar (40px, hairline): `MODEL claude-sonnet-4-6 · TEMPERATURE
  0.4 · MAX TOKENS 800 · INPUT 3,247 t · OUTPUT 1,184 t · COST USD 4.6¢ · GEN
  12.3s`.
- **Unmatched drawer state (LOCKED):** header reads "Awaiting link". Tabs:
  Context active, Drafts (0) muted, Prompt still selectable. Context body:
  NO CONTEXT YET amber-soft callout at top (eyebrow + body + typeahead "Search
  vendors and execs" with 3-row dropdown: Acme Robotics VEN-1044 / Priya
  Raghavan EXC-1042 / Helix Capital VEN-1052 + "Skip, link later" ghost link).
  Below: 8 dimmed placeholder cards (60% opacity, "AWAITING LINK" muted
  micro-label right, no chevron). Footer fully disabled with helper "Drafts
  need a linked vendor or executive to generate accurately. Link the
  conversation above to enable."
- **Sage usage codified this pass:** the sage tint (introduced in Pass 1) now
  has TWO semantically-aligned uses inside the drawer — the Conversation
  Summary card (Context tab, AI-generated staff-only content) + the Internal
  Notes section (Prompt tab, sage left bar, "Issy's thinking"). Both are
  "staff-only / internal / AI-generated." **Amber-soft stays reserved for
  "next action" surfaces** (NOT-LINKED callout, draft token chips). Distinct
  roles, distinct colours; don't conflate.
- **STATE annotation rows** on all four viewports (Drafts / Context / Prompt /
  Unmatched), all with DRAWER pill on the right.
- **Hard rules (from MESSAGING_AI_DRAFT_SPEC.md §11, all enforced):** NEVER
  auto-sends — "Use this draft" only copies to composer; money figures ALWAYS
  resolved via pricing engine tokens, NEVER invented; brand name "TheGoodIntro"
  enforced; forbidden vocabulary blocked (marketplace / magic / wizard /
  coaching / program); no em or en dashes in drafts; no emojis; outbound
  contact restricted to `conversation.linked_record` only.
- **NOT designed in this pass (deferred):** expanded CONTEXT section in the
  Prompt tab; token resolution failure UI (`[?token_name]` markers + Send
  block); grounding-warning UI ("Verify before sending"); API outage /
  cost-runaway degraded states; per-user AI settings (auto-generate on/off,
  drafts count, Opus on regenerate, show Prompt tab) — future
  `/admin/settings/ai` sub-tab; "Prev generation" link for draft history;
  auto-correction pill on drafts where forbidden vocab or dashes were
  post-processed.
- **Open decisions:** "ADVANCED" micro-label on Prompt tab keep or strip;
  model name exposure (currently shown as "MODEL · CLAUDE-SONNET-4-6" pill);
  per-user AI settings deferred; wordmark parked; number of drafts per
  generation (currently 3, spec §17 lists 1 or 5 as alternatives).
- **Issy's fix passes:** none — both Pass 2A and Pass 2B landed cleanly on
  first iteration.

### Admin Inbox — LOCKED 2026-06-04 (pending the wordmark call)
Claude Design file: "Admin Inbox". Folder:
[`design/locked/admin-inbox/`](design/locked/admin-inbox/). The messaging
cockpit where Issy reads and replies to every inbound email; native Gmail sync
under the hood, identity-grounded reading pane, composer that toggles Reply /
Internal Note with the AI Prompt button visible ONLY in Internal Note mode.
The AI Prompt drawer itself (data points + 3 drafts + prompt) is Pass 2.
- **Tokens introduced this pass:** `--portal-card-reading` (white reading-pane
  surface, distinct from warm-cream page); `--portal-sage-soft` (pale sage
  internal-note band, NEW sanctioned portal-palette colour for "staff-only /
  internal" bands, semantically distinct from sidebar emerald); `--portal-sage-ink`
  (darker sage for the "INTERNAL NOTE" mono eyebrow).
- **Two-pane layout:** conversation list left (380px, warm card tone) + reading
  pane right (fills remaining, WHITE `--portal-card-reading`). Page background
  stays `--portal-page` warm cream outside both panes.
- **Page header:** breadcrumb Home / Inbox, H1 "Inbox" + mono count "42 open /
  168 all", Filter button (active-count amber pill suffix), "+ New" outline pill.
  No system-status pill, no segment tabs (filters behind the Filter button).
- **Conversation list:** search input + sticky list header (count left + Sort
  dropdown right) + 76px rows. Row anatomy: 8px amber unread dot (left edge) +
  40px logo chip + name + record-type badge (VENDOR/EXEC/EA/UNMATCHED) + time
  (right) + subject + snippet + status pill (WAITING/RESOLVED/ARCHIVED, only
  when not open). Selected row: 3px amber left bar + selected background.
- **Identity row (LOCKED, collapsed from original spec):** single ~64px row.
  Logo + company name + VENDOR badge + contact sub-line on left. Three chips
  inline middle: TIER 2 / 2 CREDITS / LAST MEETING Held. "Open profile →"
  ghost link right. **Dropped from inline** (moved to AI Prompt drawer Context
  tab in Pass 2): RENEWS, ONBOARDING, OWES.
- **Action bar (LOCKED):** single ~40px row. Assignee avatar + chevron left;
  Resolve + AI Prompt icon + overflow "..." middle; **nothing right** (no
  SYNCED pill — sync only surfaces when broken, deferred to future pass).
  No separate "Conversation status: Open" row anywhere.
- **Thread:** top-to-bottom oldest first.
  - **Inbound message**: avatar + name + email + time + body. **No "to ..."
    sub-line, no "via Email" pill** (per-message chrome stripped this pass).
  - **Outbound message**: avatar + "From hello@thegoodintro.com" + time + "to
    ..." + body. KEEP "sent via platform" / "sent from Gmail" source pill
    bottom right (actionable — tells Issy which surface she replied from).
    KEEP small "AI draft · edited by Issy" pill when applicable.
  - **Internal note**: full-width SAGE band (`--portal-sage-soft`, optional
    sage-ink left bar), mono uppercase "INTERNAL NOTE" eyebrow + author + time
    + body. Small ghost "Delete" icon top right (author only).
  - **System events**: small inline centred row, muted 11px mono ("Issy marked
    as waiting on vendor.").
  - **NEW divider** above first unread: centred mono uppercase "NEW" with
    horizontal rules either side.
- **Composer (collapsed default):** [Reply] [Internal Note] toggle left + "More
  v" chevron right of toggle. NO rich-text toolbar visible. NO "Use template"
  button visible. "More v" reveals: rich-text toolbar + Use template + Discard.
  Body input with placeholder or partial draft. Footer: in Reply mode "Sends as
  an email to {to_address}" + ink "Send →"; in Internal Note "Visible only to
  staff" + ink "Save note →".
- **AI Prompt button visibility (THE HARD RULE):** the AI Prompt button next to
  the composer toggle is **visible ONLY when Internal Note is selected**. Hidden
  in Reply mode. When visible: outline pill + sparkle outline icon + "AI Prompt"
  label + small amber dot indicating fresh draft. Opens the AI Prompt drawer
  (Pass 2, designed separately). The AI Prompt icon in the **action bar**
  (separate from the composer button) stays visible in BOTH modes — both open
  the same drawer.
- **Unmatched state:** identity row replaced with envelope icon + name (parsed
  from email header) + UNMATCHED badge (muted grey, NOT amber). Inline NOT
  LINKED YET card (amber-soft band) below: eyebrow + body explainer + typeahead
  with 3 autocomplete results (Acme Robotics VEN-1044 / Priya Raghavan EXC-1042
  / Helix Capital VEN-1052). AI Prompt icon in action bar DIMMED with inline
  "Link this conversation first" hint. Composer still functional in Reply mode
  (To address pre-populated). Once linked, full identity + AI Prompt enabled.
- **STATE annotation rows** at the bottom of each viewport (VIEWING NOW pill on
  DEFAULT / INTERNAL NOTE / UNMATCHED; SKELETON pill on LOADING; FIRST RUN pill
  on EMPTY).
- **Five states designed:** DEFAULT (Reply mode, AI Prompt hidden) · INTERNAL
  NOTE (AI Prompt visible with fresh-draft dot) · LOADING (skeleton list +
  thread, composer hidden) · EMPTY ("No conversations yet" with envelope icon,
  muted "+ New conversation" text link NOT primary ink — same rule as Gifts
  empty state; reading pane "Select a conversation to read it." + "Or press J
  to open the first one.") · UNMATCHED.
- **Anti-list (do not regress):** no "Conversation status: Open" row; no SYNCED
  pill; no "to ..." sub-line on inbound; no "via Email" pill on inbound; AI
  Prompt button next to Reply forbidden (Internal Note only); internal note
  band uses SAGE not amber (sidebar emerald untouched); reading pane background
  stays WHITE.
- **NOT designed in this pass (Pass 2 + future):** AI Prompt drawer (Pass 2,
  spec in MESSAGING_AI_DRAFT_SPEC.md); new-conversation composer (rare,
  deferred); bulk-select mode; Filter popover contents; sync-broken states +
  connection-lost banner; mobile layout (Issy desktop-only).
- **Open decisions:** EXEC badge colour (currently amber-soft, spec floated
  emerald-soft); wordmark parked; sync-broken states deferred; sample data —
  Acme cycle renewal "12 Mar 2027" verify at build time.
- **Issy's fix passes (2026-06-04):** medium trim (4 header layers → 2);
  per-message chrome stripped (Option A); composer chrome collapsed behind
  "More v" (Option B); white reading pane + sage internal note (Issy picked
  these from a scrolled state in Option B output, sanctioned as new
  portal-palette tokens).

### Admin Settings (shell + Integrations tab + Gmail OAuth drawer) — LOCKED 2026-06-03 (pending the wordmark call)
Claude Design file: "Admin Settings". Folder:
[`design/locked/admin-settings/`](design/locked/admin-settings/). Multi-tab
settings shell + the Integrations tab content + the Gmail OAuth connect drawer
(the first integration's connect flow). Future settings sub-tabs (Account,
Security, Email signatures, Feature flags, Staff) inherit this shell. The
Gmail drawer pattern generalises to all integration connect drawers.
- **Shell:** breadcrumb Home / Settings / {tab-slug}, H1 "Settings" (no count,
  no header action), tab strip (40px tall, hairline below, sticky on scroll)
  with tabs Account / Security / Integrations (default) / Email signatures /
  Feature flags / Staff [soon pill in soft amber]. Active tab gets 2px ink
  underline; inactive tabs muted. Clicking changes URL to
  `/admin/settings/{tab-slug}`. **Sidebar Settings item has NO expanded
  sub-items** — the tab strip IS the sub-navigation.
- **Integrations tab content:** CONNECTED section (4 active: Gmail, Google
  Calendar, Zoom, Xero) + AVAILABLE section (5 to connect: Microsoft Teams,
  Microsoft Outlook / Graph Calendar, Resend, Calendly, Slack).
- **Integration card anatomy (LOCKED):** 32px logo (or mono uppercase
  3-letter abbreviation chip if no logo) + provider name (Inter 13px
  semibold) + status pill on the right (Connected gold dot / Connected ·
  token expiring amber / Connection lost slate + red outline / Limited muted).
  Sub-line beneath the name (Inter 13px muted). SCOPES eyebrow + list of
  granted scopes as small soft-amber mono pills. Manage / Disconnect on
  right (CONNECTED) or "Connect" ink primary (AVAILABLE).
- **Xero special-case:** amber inline warning banner inside the card when
  token < 7 days to expiry: "OAuth token expires in 6 days. Reconnect to
  avoid disruption."
- **Gmail OAuth connect drawer** (the locked reference pattern for all
  future connect drawers):
  - 600px wide, slides in from right edge, dimmed backdrop (30% black),
    hairline left border.
  - Header (sticky, 64px): mono uppercase "CONNECT GMAIL" + subtitle +
    close X.
  - Body (scrollable):
    - **Step 1 of 3 MAILBOX CHOICE** — typeahead pre-filled
      `hello@thegoodintro.com`, helpers about Workspace user requirement.
    - **Step 2 of 3 SCOPES** — four rows (GMAIL.READONLY, GMAIL.SEND,
      GMAIL.MODIFY, GMAIL.LABELS) each with plain-language description.
      Closing paragraph: "These are the standard scopes for a shared-inbox
      connector. They're what Google's review team expects. They do not
      include permanent delete."
    - **Step 3 of 3 GOOGLE VERIFICATION** — bordered card with three
      divider-separated rows: SENSITIVE-SCOPE VERIFICATION / Required (CASA
      Tier 2 assessment); LEAD TIME / 6 to 10 weeks; COST / AUD 6,000 to
      15,000 + "Handled outside the platform." sub-line. Helper paragraph
      explaining Testing mode (100 users) vs Production mode (hard-blocked
      by Google). Ghost link "View verification status →" with
      external-link icon, opens Google Cloud Console.
  - Footer (sticky, 88px, hairline above): status indicator left ("Mailbox
    chosen. Ready to authorise." gold dot in default state); ghost Cancel +
    primary ink "Authorise with Google" with G logo right; 11px muted
    helper below the primary button about opening Google's consent screen
    in a new tab.
- **ESC / close-X / backdrop click** all close the drawer.
- **Other connect drawers** (Calendar, Zoom, Teams, Xero, Resend, Calendly,
  Slack) inherit this 3-step pattern (Mailbox/Account → Scopes → Verification
  / Setup → Authorise footer). Each gets its own drawer when wired.
- **STATE annotation rows:** "STATE · DEFAULT" on the loaded tab viewport
  (VIEWING NOW pill); "STATE · CONNECT DRAWER" on the drawer viewport
  (DRAWER pill).
- **NOT designed in this pass:** Account / Security / Email signatures /
  Feature flags / Staff tab content; non-Gmail OAuth drawers. Deferred.
- **Open decisions:** each future tab's content; assessor selection
  (Leviathan Security / Bishop Fox / Schellman) for CASA Tier 2 — Issy's
  call based on quote and lead time; wordmark parked.

### Admin Templates (T3 list + T5 editor) — LOCKED 2026-06-03 (pending the wordmark call)
Claude Design file: "Admin Templates". Folder:
[`design/locked/admin-templates/`](design/locked/admin-templates/). The
notification template editor where Issy reviews and edits every templated
email the platform sends. Row click on list → editor. Editor enforces brand
rules (no em/en dashes, forbidden vocabulary, brand-name capitalisation)
inline with red-underline highlights and Save-disabled-while-warning state.
- **List header:** breadcrumb Home / Templates, H1 "Templates" + mono count
  ("12 active / 14 all"), Filter button (active-count amber pill), Sort
  dropdown (default "Used this month · Most used first"), primary ink
  "+ New template".
- **No stat ribbon on the list** (templates aren't operational; skipped
  intentionally — clutter-free header).
- **DataTable columns:** TEMPLATE NAME · TYPE (mono uppercase pill on
  soft-amber: DECLINE / FOLLOW-UP / CONFIRM / REMINDER / WELCOME / GIFT /
  IMPACT / OUTREACH) · TRIGGER (Inter 13px muted; the event description) ·
  LAST EDITED (mono right-aligned date) · USED THIS MONTH (count + "vs N
  last month" sub-line, both mono right-aligned) · STATUS (pill with dot) ·
  (overflow ...).
- Row height 56px for the dual-line USED THIS MONTH cell. Row click opens
  editor.
- **Status pills:** Active (gold dot), Draft (slate dot), Archived (muted
  grey + row 60% opacity).
- **All 14 templates sample data:** Decline reply (from exec), Follow-up
  reminder · 1st/2nd/3rd, Meeting confirmation, Pre-meeting reminder ·
  24h/1h, Vendor welcome, Executive welcome, Gift released notification (to
  exec), Quarterly impact summary (to exec), Vendor renewal reminder,
  No-show follow-up (to vendor) — Draft, Outreach (warm intro) — Archived.
- **Filter popover:** TYPE chips multi, STATUS multi with per-status counts,
  LAST EDITED date range, USED THIS MONTH (All / Zero — surfaces unused
  templates as archive candidates). Saved views + URL reflects filters.
- **Pagination:** "Showing 1-14 of 14", rows-per-page 25 default.

- **Editor T5:** breadcrumb / Templates / template name. H1 = template name
  with type pill + status pill inline. Sub-header: "Last edited DATE · Used
  N× this month · vs N last month". "← Back to list" button right.
- **Two-pane body:** form left (~60%) + sticky live PREVIEW right (~40%).
- **Form sections** (mono uppercase headers with right-aligned captions):
  DETAILS (name / type / status) · SEND CONFIGURATION (trigger event chip
  read-only + Recipient / From name / Reply-to fields — Claude Design
  bonus, kept) · SUBJECT (with inline variable chips) · BODY (rich-text
  mini toolbar + "+ Insert variable" + inline variable chips rendered as
  soft-amber pills, NOT raw text — LOCKED pattern from Claude Design,
  better than originally specced) · SIGNATURE (read-only, brand-locked,
  uses `{{platform_signature}}` token) · SAMPLE DATA (Vendor / Executive /
  Company / Charity selectors with locked defaults Acme Robotics · Sam
  Patel / Priya Raghavan · CFO / Lumen Industries / Royal Flying Doctor
  Service).
- **VARIABLES sidebar** (right of form, above preview): 8 variables listed
  with one-line descriptions, click-to-insert.
- **PREVIEW pane (sticky):** resolved email rendering with variables
  highlighted in soft-amber background where they came from the resolver
  (so reader sees at a glance which strings came from variables vs
  hardcoded text). "To: Sam Patel, Acme Robotics" etc.
- **FIELD STATES row** at form bottom: default / focused / error ("Subject
  can't be empty") / disabled (Type · Decline ghosted).
- **Sticky bottom action bar:** "Draft, auto-saved Xs ago" left; Send test
  to me / Cancel / Save as draft / Save changes right.

- **Brand rule enforcement (HARD):**
  - Em dashes (—) and en dashes (–) outside numeric ranges: red underline +
    inline warning chip + Save changes DISABLED while unresolved (Save as
    draft stays enabled).
  - Forbidden vocabulary ("marketplace", "magic", "wizard", "coaching",
    "program"): same enforcement.
  - Brand name "TheGoodIntro" capital T, G, I: highlight variants.
  - These rules inherited from FACTS.md and POSITIONING.md.

- **Money rule (HARD):** template body MUST use variables (e.g.
  `{{charity_amount}}`) for any money figure. Any literal "$" not preceded
  by `{{` flagged with "Money figures must use variables" warning;
  template can't go Active while present.

- **Three states designed:** Loaded list · Loading (8 skeleton rows
  mimicking real anatomy) · Empty ("No templates yet" with envelope-with-
  pencil icon, "+ Add your first template" primary CTA, FIRST RUN pill on
  annotation row).

- **STATE annotation rows** at the bottom of each viewport: LOADING /
  EMPTY / EDITOR with the matching pills (SKELETON, FIRST RUN, EDITOR ·
  T5) on the right.

### Admin Giving (Gifts) (T3) — LOCKED 2026-06-03 (pending the wordmark call)
Claude Design file: "Admin Giving". Folder:
[`design/locked/admin-giving-list/`](design/locked/admin-giving-list/).
The brand-critical donation surface where Issy reviews every gift_record and
runs weekly per-charity payment batches per CHARITY_FLOW.md Model 2 donation
flow. Row click navigates to `/admin/meetings/{id}#gift` (the Meeting detail's
Gift record module). "Pay batch →" button in the header opens the per-charity
Pay batch drawer.

- **Header:** breadcrumb Home / Giving, H1 "Giving" + mono count "12 unpaid / 84
  paid YTD", Filter button, Sort dropdown (default "Held date · Oldest first"),
  ghost "Export ledger (CSV)", primary ink "Pay batch →".
- **Stat ribbon (3 stats, dark band, full-width):** UNPAID ($12,400 across
  12 gifts), PAID YTD ($84,000 across 84 gifts), AVG DAYS TO PAY (6.4 days
  from held to paid).
- **DataTable columns:** CHARITY (logo abbreviation chip + name) · MEETING
  (M-ID stacked above vendor → exec dual-line) · HELD (date) · AMOUNT
  (frozen $, right-aligned, NEVER recomputed) · BAND (Tier 1-4 mono pill,
  display-only — band drove the amount but amount is authority) · LIFECYCLE
  (4-chip strip: HELD › REL › PAID › RCPT with ticks on completed steps,
  uniform amber backgrounds across filled and hollow — Issy chose to keep
  uniform; do NOT differentiate) · STATUS (pill with dot) · (overflow ...).
- Row height 56px for the dual-line MEETING cell.
- **Status pills:** Awaiting payment (gold dot), Awaiting receipt (amber
  dot), Complete (gold lower-opacity), Reversed (slate dot + row 60%
  opacity), Voided (muted grey + row 60% opacity).
- **Beyond Blue (M-202) sample row** is the Reversed example: row at 60%
  opacity, REL chip with dashed border indicating reversal.
- **Save the Children (M-188) sample row** has an amber edge dot on the
  left edge — overdue-receipt 14+ days signal that bubbles up to the
  Dashboard "Tasks needing me" widget.
- **Row overflow menu:** Mark paid, Mark receipt filed, Open meeting record,
  View charity, Resend pre-payment email to ops, Reverse gift (with confirm,
  admin only).
- **Filter popover sections:** STATUS (multi with per-status counts, default
  Awaiting payment + Awaiting receipt), CHARITY (typeahead with per-charity
  totals), BAND (Tier chips), VENDOR (typeahead), EXEC (typeahead), HELD
  DATE (All / 7 / 30 / 90 / Custom), AMOUNT (range slider $900-$1,200),
  AGED (All / >7 days / >14 days / >30 days awaiting payment — surfaces
  stale unpaid gifts).
- **Bulk actions** when checkboxes ticked: count + running total (e.g.
  "3 selected ($2,900)"), Pay batch (opens drawer with selected only),
  Mark receipt filed (batch), Export selected (CSV), Cancel selection.
- **Pagination:** 48px row, "Showing 1-10 of 96", page links, rows-per-page
  dropdown (25 default).
- **Sidebar:** "Giving" is a top-level item under OPERATIONS with sub-items
  "Gifts" (this page, default) and "Charities" (the directory, in design).
  Amber count badge "12" on Giving parent = number of UNPAID gifts (the
  day's call to action), NOT total YTD count.
- **STATE · LOADING annotation row** at the bottom of the loaded viewport
  documents the loading state inline (SKELETON pill on the right).

- **Loading state viewport:** stat ribbon dark with shimmer bars; table
  header solid; 8 skeleton rows each mimicking real row anatomy (logo
  circle, charity name bar, M-ID + vendor→exec dual-line, dates, amount,
  tier pill, 4-chip lifecycle strip with chevron gaps, status pill,
  overflow); pagination shimmer; annotation row reads "You're viewing the
  loading state" with "VIEWING NOW" pill.

- **Empty state viewport ("No gifts yet"):** stat ribbon shows $0/$0/0
  with "No data yet" sub-lines; no table header, no rows; centred 48px
  antique-gold gift-box outline icon; heading "No gifts yet"; body
  explainer about the lifecycle (max 480px width, muted); muted text link
  "View meetings →" (NOT a primary ink CTA — gifts are created by meetings
  being held, not by an action on this page); annotation "STATE · EMPTY ·
  First install — no meeting has been held yet" with "FIRST RUN" pill.

- **Pay batch drawer viewport:** 600px drawer slides in from the right
  edge, dimmed backdrop. Header sticky (mono "PAY BATCH" + subtitle +
  close X). Body: per-charity payment blocks (each a card with logo, name,
  ABN, gift count + total, per-meeting breakdown table, PAYMENT DETAILS
  with click-to-copy BSB/Account/Reference, "Mark this charity batch paid"
  ink primary). Three sample blocks: RFDS $2,900 (3 gifts), headspace
  $1,100 (1 gift), WWF-Australia $1,200 (1 gift). Footer sticky (GRAND
  TOTAL "$5,200 across 5 gifts to 3 charities" + Cancel + "Mark all
  batches paid" with 11px muted warning below). Drawer triggered by the
  "Pay batch →" button in the page header; ESC / X / backdrop click
  closes.

- **Money rules (HARD):** every $ figure is frozen at the moment the
  meeting was marked Held. Read from `gift_record.keep_amount_cents` via
  `reporting.ts`. NEVER recomputed from live band+meeting. The tier pill
  is display-only. Marking paid records action+timestamp+batch_id; it does
  NOT trigger an EFT (Issy does the EFTs from her own admin outside the
  platform; v2 may integrate Xero).

- **Open decisions:** sample-data drift on Pay batch drawer dimmed
  background (M-204 / M-198 vendor names differ from loaded view — minor,
  to fix next pass); receipt-overdue threshold (currently 14 days,
  confirm); wordmark parked.

### Admin Requests pending (T3) — LOCKED 2026-06-02 (pending the wordmark call)
Claude Design file: "Admin Requests Pending". Folder:
[`design/locked/admin-requests-pending/`](design/locked/admin-requests-pending/).
The operational queue Issy works daily for the vendor-to-exec request loop. Row
click navigates to `/admin/meetings/{id}` (the Meeting detail page, where the
request lives as a Proposed-state meeting).
- **Header:** breadcrumb Home / Requests, H1 "Requests pending" + mono count
  ("7 pending / 2 due today"), Filter button (active-count amber pill suffix),
  Sort dropdown (default "Next action · Soonest first"). **No "+ New" button**
  (vendors create requests; admin doesn't).
- **Stat ribbon (3 stats, dark band, full-width):** PENDING REQUESTS (count
  + "N due today"), AVG RESPONSE TIME (days + "30-day rolling"), DECLINE
  RATE (% + "Of N explicit responses in 30 days" — denominator visible).
- **Decline rate calc** (now defined):
  - Numerator: requests explicitly declined by the exec (signed-link
    decline, EA email reply, manual mark-declined by Issy) in the last 30
    days.
  - Denominator: numerator + requests that became Confirmed meetings in
    the same 30 days.
  - Lapsed and currently-pending requests are excluded from BOTH numerator
    and denominator.
  - The N in the sub-line is the denominator value.
- **DataTable columns:** REQUEST (vendor logo + arrow + exec photo, with
  "Vendor → Exec" name underneath) · TOPIC (one-line pitch snippet,
  ellipsis at ~40 chars) · AGE (mono right-aligned, "3d"/"14d"/"28d", date
  past 30 days) · FOLLOW-UPS (mono uppercase pill 0/3 to 3/3 in soft amber
  background, RED dot on 3/3) · NEXT ACTION (mono right-aligned: "today"
  bold ink with red dot / "in Xh"/"in Xd" muted / "expired" muted / "—") ·
  STATUS (pill with dot) · (overflow ...).
- **Row height: 56px** (slightly taller than other T3 lists) to fit the
  dual-avatar REQUEST cell. Row click → /admin/meetings/{id}.
- **Status pills:** Awaiting exec (gold dot), 1st follow-up sent (amber),
  2nd follow-up sent (amber lower-opacity), Last reminder sent (amber + red
  border), 1st follow-up due (gold dot + red urgency dot in NEXT ACTION),
  Lapsed (muted grey + row 60% opacity), Declined (slate dot).
- **Row overflow menu:** Open meeting record (default), Send follow-up
  now, Skip to next exec... (typeahead to reroute), Cancel request, Mark
  as declined manually, Copy request summary.
- **Filter popover sections:** STATUS (multi with per-status counts; default
  excludes Lapsed + Declined), VENDOR (typeahead multi), EXEC (typeahead
  multi), AGE chips (< 3 days / 3-7 / 7-14 / 14+), FOLLOW-UPS DONE chips
  (0 / 1 / 2 / 3), DUE (All / Today / This week / Next week), LAPSING
  WITHIN (All / 7 days / 14 days). Saved views top. URL reflects filters.
- **Bulk actions** when checkbox ticked: Send follow-up now (batch),
  Cancel selected, Archive, Cancel selection.
- **Pagination:** 48px row, "Showing 1-7 of 7", page links, rows-per-page
  dropdown (25 default).
- **Sidebar:** under OPERATIONS between Meetings and Vendors, item name
  "Requests pending". **Amber count badge = items DUE TODAY**, not total
  pending. The badge IS the day's call to action.
- **STATE · LOADING annotation row** at the bottom of the loaded viewport
  documenting the loading state inline (with a SKELETON pill). **CODIFY
  this annotation row as the convention for every list page going
  forward** (echoes the FIELD STATES row on the locked Admin New Executive
  / New Meeting forms).
- **Empty state ("All caught up"):** stat ribbon shows real 30-day rolling
  numbers (the metrics exist even with empty queue); table area centred
  antique-gold outline icon (paper-plane or hourglass, 48px), heading "All
  caught up", muted body about new requests appearing here. No primary CTA
  (this isn't a setup state).
- **No money figures** on this page (a request has no frozen amount yet;
  the gift is set when the meeting is marked Held).
- **No response-rate stat or column** (same definition gap as the locked
  Executives list).

### Admin New Meeting (T5) — LOCKED 2026-06-02 (was PARKED 2026-05-29; unparked after Zoom/Teams selector added)
Claude Design file: "Admin New Meeting". Folder:
[`design/locked/admin-new-meeting/`](design/locked/admin-new-meeting/).
The CREATE flow for a meeting. Reached by clicking "+ New meeting" on the
locked Admin Meetings list. On Send invite, the meeting record is created
and the user is redirected to `/admin/meetings/{id}` (the Admin Meeting
detail page, in design 2026-06-02).
- **Two-pane layout:** form on the left, dark CALENDAR INVITE preview on
  the right (matches the dashboard ribbon visual register). Preview
  updates live as form fields change.
- **DETAILS section:** mono uppercase header with right-aligned caption
  "Everything in the invite".
- **Executive picker:** sample exec Priya Raghavan, CFO at Lumen
  Industries; sub-line "Accepted 14 May · AEST time · gift to Royal Flying
  Doctor Service" (matches locked sample data across all screens).
- **Vendor picker:** Acme Robotics, VEN-1044, 2 credits; helper "2 credits
  available".
- **WHY THIS MEETING:** vendor's request answers shown as Q&A (Q1 "Who do
  you want to meet?", Q2 "Why this person, specifically?"). Same text as
  the Admin Meeting detail Vendor side module so the meeting reads
  consistently across both screens. "Show more" expands additional Qs.
- **Date** rendered as "3 Jun 2026" long format (NOT "03/06/2026").
- **TIME AND LENGTH:** Start + Length side by side, helper "Ends 11:00,
  in the executive's timezone", green "Executive is free at this time"
  inline confirmation (drawn from the exec's free/busy via the calendar
  integration).
- **Meeting link section:** video-platform segmented selector (ZOOM
  default · TEAMS · GOOGLE MEET). Default reflects the exec's preferred
  platform from their profile. Generated link displayed read-only
  (e.g. `us02web.zoom.us/j/87654321023`), Regenerate button on the right.
  Helper "Created automatically when the invite is sent. Uses the
  executive's preferred video platform."
- **Charity:** standing-charity chip showing Royal Flying Doctor Service ·
  Standing charity · DGR endorsed · ABN 74 438 059 643. Action:
  "Override for this meeting" (opens the per-meeting override flow per
  POSITIONING principle 3).
- **RECIPIENTS:** auto-populated rows for Executive, Executive EA, and
  both Vendor contacts (all with @lumenindustries.com and
  @acmerobotics.com domains). Per-row remove (x). "+ Add recipient".
- **Message** field (OPTIONAL): short note included in the invite body.
- **FIELD STATES row** at the bottom: default / focused (focus ring) /
  error ("Pick a valid future date" with red border) / disabled.
  Matches the locked Admin New Executive form pattern.
- **Right pane (CALENDAR INVITE preview):** dark band, title "Intro:
  Acme Robotics and Priya Raghavan", date/time, VIDEO LINK (matches
  selected platform), ATTENDEES (4 avatars), GIFT TO CHARITY (Royal
  Flying Doctor Service), CREDIT toggle "Has credit / No credit",
  reservation pill "1 credit reserved on send, $1,500" with helper line
  "The charity gift amount is set when the meeting is held, based on the
  vendor's band at that time."
- **Sticky bottom action bar:** left "INVITE NOT SENT" mono status text;
  right "Save as proposed (no time yet)" ghost · "Cancel" ghost · "Send
  invite" primary ink with paper-plane icon.
- **Money rule:** the credit pill ($1,500 flat) is the ONLY money figure
  on this form. The charity gift amount is frozen at the moment the
  meeting is marked Held, NOT at invite-send. This is correct and
  matches the Admin Meeting detail Gift record module's "frozen at
  booking" rule.
- **Open decisions** (captured in folder README): video platform list
  (Zoom / Teams / Google Meet — confirm v1 set), credit semantics on
  "Save as proposed (no time yet)" (current design: no reservation until
  a time is set), EA recipient default (always / opt-in per exec).

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

### Vendor Get-started checklist (T6) — to do (clones the LOCKED T6 component above; vendor sidebar = deep teal-pine LOCKED 2026-06-05)
### Exec dashboard — to do (introduces the exec sidebar colour; candidate clay/bronze)

Update this log as each screen is locked.
