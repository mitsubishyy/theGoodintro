# Locked design source (build-chat handoff)

This folder is the durable home for the **locked v2 portal screens** designed in
Claude Design. It exists so a **cold Claude chat with no memory of the design
sessions** can build the platform from here plus the referenced specs. If you are
that build chat: read this first.

## What is here, per screen

Each locked screen has a subfolder `design/locked/<screen>/` containing:

- `screen.html` — the exported Claude Design markup. **This is the visual reference
  you port.** (Exported by Issy from Claude Design; if missing, ask her to export it.)
- `screenshot-*.png` — screenshots of the locked screen and its states.

The **written spec** for every screen (sections, fields, columns, states, copy, money
rules, open items) lives in [`../../UI_KIT_DESIGN_LOG.md`](../../UI_KIT_DESIGN_LOG.md).
Port from all three together: the design log spec, the exported HTML, and the
screenshots. The design log wins on intent; the HTML/screenshots win on exact visuals.

## Read order (do not skip)

1. [`FACTS.md`](../../FACTS.md) — brand (TheGoodIntro) and pricing facts. Wins over any
   conflicting text.
2. [`CALCULATIONS.md`](../../CALCULATIONS.md), [`STATE_MACHINES.md`](../../STATE_MACHINES.md),
   [`DATA_MODEL.md`](../../DATA_MODEL.md) — every money figure, transition, and field.
   **No money number is ever hardcoded; it comes from `@thegoodintro/pricing` and
   `lib/reporting.ts`.**
3. [`V2_BUILD_PLAN.md`](../../V2_BUILD_PLAN.md) — the master build plan and gates.
4. [`PORTAL_LAYOUT_BLUEPRINT.md`](../../PORTAL_LAYOUT_BLUEPRINT.md) — layout per screen.
5. [`UI_KIT_BRIEF.md`](../../UI_KIT_BRIEF.md) — the `packages/ui` component APIs.
6. [`UI_KIT_DESIGN_LOG.md`](../../UI_KIT_DESIGN_LOG.md) — what is LOCKED and every
   refinement made during design (this overrides the brief where they differ).
7. This folder — the exported HTML + screenshots for each locked screen.

## Non-negotiable rules (full detail in the docs above)

- Brand wordmark is **TheGoodIntro** (one word) per FACTS.md. NOTE: the renders show
  "The Good Intro" (three words); the wordmark call is still PARKED (see design log).
- Palette: cream page, dark ribbon, **antique-gold accent** (`--portal-amber`), emerald
  on the sidebar only (admin). Vendor/exec sidebar colours are not yet locked.
- Multi-colour is allowed for internal categorisation (e.g. tag chips); the
  purple/blue/pink bans are marketing-only, not platform-internal.
- Status pills: Inter, title case, single line, with a dot. Column headers and count
  badges stay mono uppercase.
- List filters: a collapsible Filters panel.
- Every screen ships loaded / loading / empty / error states.

## Screen index and status

| Screen | Folder | Status |
|---|---|---|
| Admin dashboard | `admin-dashboard/` | **LOCKED 2026-06-09** (first locked admin landing surface; re-lock after a five-upgrade pass applied per-portal admin emerald sidebar palette `oklch(0.45 0.10 158)` + brand logo lockup with placeholder mark + Fraunces wordmark sage-mint dark-bg variant for "Good" `oklch(0.82 0.12 158)` + photo-primary avatars + locked status pill tone mapping for Pending Requests [Review amber · Match neutral · Exec gold · Block red] + locked sample data for Recent Onboards and Gifts Sent; Maya Okafor signed in, Tuesday 28 May 2026 sample; brand mark is a placeholder — build chat embeds `apps/web/public/brand-logo.png` at port time, do NOT iterate on the placeholder) |
| Admin meetings (calendar + list) | `admin-meetings/` | LOCKED |
| Admin vendor detail | `admin-vendor-detail/` | LOCKED |
| Admin executive detail | `admin-executive-detail/` | LOCKED 2026-06-01 (pending wordmark) |
| Admin new executive form | `admin-new-executive/` | LOCKED (pending wordmark) |
| Admin Tags | `admin-tags/` | LOCKED |
| Admin Checklists (locks template T6) | `admin-checklists/` | LOCKED |
| Admin Reports | `admin-reports/` | LOCKED pending the opened-report money check |
| Admin New Meeting | `admin-new-meeting/` | LOCKED 2026-06-02 (unparked; Zoom/Teams selector added; pending wordmark) |
| Admin Executives list | `admin-executives-list/` | LOCKED 2026-06-02 (response-rate column removed; reinstate when calc is defined) |
| Admin Vendors list | `admin-vendors-list/` | LOCKED 2026-06-02 (pending wordmark) |
| Admin Meeting detail | `admin-meeting-detail/` | LOCKED 2026-06-04 (pending wordmark; first T4 with locked back button row; Gift record module locks Held → Released → Paid → Receipt lifecycle) |
| Admin Requests pending | `admin-requests-pending/` | LOCKED 2026-06-02 (pending wordmark) |
| Admin Giving (Gifts) | `admin-giving-list/` | LOCKED 2026-06-03 (pending wordmark; minor sample-data drift on Pay batch backdrop to fix next pass) |
| Admin Charities | `admin-charities/` | PARKED 2026-06-03 (too visually similar to Gifts; charity management will fold into a Settings tab or drawer) |
| Admin Templates | `admin-templates/` | LOCKED 2026-06-03 (pending wordmark; inline variable chip rendering adopted as locked pattern) |
| Admin Settings (shell + Integrations tab + Gmail OAuth drawer) | `admin-settings/` | LOCKED 2026-06-03 (pending wordmark; other tabs + non-Gmail drawers deferred) |
| Admin Settings · AI tab | `admin-settings-ai/` | LOCKED 2026-06-04 (pending wordmark; first locked use of 36×20 toggle pill pattern + DEFAULT/CUSTOM chip pattern; sage Hard rules block) |
| Admin Settings · Notifications tab | `admin-settings-notifications/` | LOCKED 2026-06-05 (pending wordmark; introduces 24×14 toggle variant for dense table cells; per-type table with locked system rows; sage system-rules block) |
| Admin Settings · Account tab | `admin-settings-account/` | LOCKED 2026-06-05 (pending wordmark; first of the Settings sub-tab build-out; inherits AI/Notifications patterns; no new portal-wide patterns) |
| Admin Settings · Security tab | `admin-settings-security/` | LOCKED 2026-06-05 (pending wordmark; introduces security alert banner pattern — amber-soft callout with acknowledge + lockdown actions; read-only tab, no editable settings) |
| Admin Settings · Email signatures tab | `admin-settings-email-signatures/` | LOCKED 2026-06-06 (pending wordmark; Gmail-sourced read-only mirror; two sections, two viewports; brand-rule validation cut from MVP — revisit in v2) |
| Admin Settings · Feature flags tab | `admin-settings-feature-flags/` | LOCKED 2026-06-06 (pending wordmark; per-user feature-flag surface with 24×14 dense toggle + audit table + sage system-flags block; sample data covers 10 flags across 4 categories) |
| Admin Settings · Staff tab | `admin-settings-staff/` | LOCKED 2026-06-06 (pending wordmark; final Settings sub-tab; multi-user admin with role pills + pending invites + sage roles reference; 600px invite drawer with role radio chips + sage permissions preview) |
| Admin Meeting detail · Vendor side rail-module | `admin-meeting-detail-vendor-side/` | LOCKED 2026-06-07 (pending wordmark; first Meeting detail rail-module body; AR identity + BAND chips + Q1/Q2 + contacts + sage internal note) |
| Admin Meeting detail · Exec side rail-module | `admin-meeting-detail-exec-side/` | LOCKED 2026-06-07 (pending wordmark; symmetric counterpart to Vendor side; PR identity + matched-areas chips + EA & calendar + RFDS charity with frozen $1,000 chip) |
| Admin Meeting detail · Notes rail-module | `admin-meeting-detail-notes/` | LOCKED 2026-06-07 (pending wordmark; append-only sage-card thread with new-note composer + free-form note eyebrows + 400-char limit) |
| **Vendor Dashboard** | `vendor-dashboard/` | **LOCKED 2026-06-05** (pending wordmark; **first vendor portal screen**; locks deep teal-pine sidebar `oklch(0.32 0.045 195)` + companion tokens, vendor identity card pattern, photo-led exec card grid, "Band" vendor vocabulary; Owner/Active state only — Member view + 5 vetting states deferred to Pass B) |
| **Vendor Executives List** | `vendor-executives-list/` | **LOCKED 2026-06-06** (pending wordmark; **second vendor portal screen**; introduces vendor T3 variant — 76px photo-led rows, white table card, whole-row click with hover lift — plus single-row inline filter bar, sortable column header chevron, soft-green "Meeting complete" status tone `oklch(0.93 0.04 155)`; 3 viewports: loaded / filters open / filters collapsed-but-active) |
| **Vendor Executive Detail Drawer** | `vendor-executive-detail-drawer/` | **LOCKED 2026-06-06** (pending wordmark; **third vendor portal screen**; first vendor use of the locked drawer pattern; introduces "WHAT HAPPENS NEXT" numbered-step explainer; single viewport, Priya Raghavan EXC-1042; minor backdrop sample-data drift to fix next pass) |
| **Vendor Request Form** | `vendor-request-form/` | **LOCKED 2026-06-06** (pending wordmark; **fourth vendor portal screen**; first T5 form on vendor portal; introduces vendor T5 variant — 720px column with white form card + warm-cream textareas, question-numbered mono eyebrows, colour-shifting character counters — plus radio-card pattern; deliberate NO money information on the form surface; PARTIALLY FILLED state only — empty / submitting / content-guard error / confirmation modal + Q3 "someone else" expansion deferred to Pass B) |
| **Vendor Settings — Shell + Profile tab** | `vendor-settings-profile/` | **LOCKED 2026-06-06** (pending wordmark; **fifth vendor portal screen**; locks 3-tab Settings shell — Profile · Notifications · Security; sign-out stays in sidebar chip; product decision baked in — vendor About is **always public to execs**, reverses brief's opt-in stance; all 3 Visibility rows are locked / padlocked = pure disclosure block; LOADED · DEFAULTS state only — MODIFIED / LOADING + Notifications + Security + future Company tab deferred to Pass B) |
| **Vendor Signup + Pre-payment States** | `vendor-signup-and-prepayment/` | **LOCKED 2026-06-07** (**sixth vendor portal screen set**; closes the biggest functional gap — what a brand-new vendor sees BEFORE `status='active'`; **first lock under new brand logo** — Fraunces semibold wordmark with The/Good/Intro colour split; introduces two-column signup pattern, pre-payment vendor shell variant with padlocked nav items, and reusable lockout page pattern; 3 viewports: VP1 public signup at /signup, VP2 pre-payment Dashboard, VP3 reusable lockout page) |
| **Exec Meetings List** | `exec-meetings-list/` | **LOCKED 2026-06-10** (**third exec-portal screen**; the working surface at `/exec/meetings`, List + Calendar toggle, row click opens 540px right drawer — kills the standalone `/exec/meetings/[id]` detail page pattern. Four viewports: VP1 list default with Upcoming open + Past + Cancelled collapsed, VP1b list with Past expanded, VP2 calendar month view, VP3 list with drawer open on Mira Chen. **Introduces FIVE portal-wide patterns:** (1) universal topbar search — SUPERSEDES Exec Dashboard's locked "topbar content-empty right" rule; (2) three-stat inline mini-strip page header — no fill, hairline dividers, single-accent on first number only; (3) collapsible section card pattern — primary always open no chevron, historical collapsed by default with chevron, counts reflect real total not rendered subset; (4) drawer-as-detail — 540px right slide-over with 20% ink dim + 2px blur backdrop reusing locked charity picker pattern, kills separate detail pages portal-wide; (5) "editorial chrome, SaaS structures inside" — architectural principle for operational exec surfaces, resolves the over-applied-editorial-register problem from a rejected Meeting Detail experiment. Status ring around row avatars rejected — status reads via dedicated column with dot + italic word. NEW data field `charity.short_name` for dense list contexts. Sample: Priya Raghavan + 12/3/28 stats + 3 upcoming + 13 past + 1 cancelled (Riley Adams · Forge Industries). Drawer sample is Mira Chen / Anvil Software / Tue 17 Jun. Open decisions: David Wu charity reconciliation with Exec Dashboard / connected-calendar banner / Held drawer footer rendering / pagination inside expanded Past / per-meeting override visual treatment in drawer / search command palette overlay) |
| **Exec Incoming Requests** | `exec-incoming-requests/` | **LOCKED 2026-06-09** (**second exec-portal screen**; the all-pending batch review surface at `/exec/requests`; inherits exec portal shell + editorial concierge register + photo-primary avatars from Exec Dashboard; two viewports: VP1 LOADED with four full-detail cards stacked + Up-to-date footer, VP2 EMPTY STATE with sanctioned 🎉 emoji + italic Fraunces "You're all caught up." hero. Cards stacked at 24px gaps, ordered soonest meeting first: Sam Patel/Acme Band 2 $1,000 · Theo Markham/Latch Health Band 1 $900 · Naomi Brooks/Beacon Procurement Band 3 $1,100 · Hana Okonkwo/Vesta Climate Band 2 $1,000 — every card directs to RFDS (Priya's standing nom); only $ varies by band. Hero is Fraunces 48px plain ink "Four requests" — an emerald marker-highlight band was iterated and rejected. SANCTIONED EMOJI EXCEPTION — 🎉 on VP2 only, never propagate. New data fields needed: `vendor_user.bio_one_liner`, `request.q1_head`, `request.q2_head`. Dashboard cross-reference RESOLVED 2026-06-09 — the locked Exec Dashboard's compact Incoming widget footer link "Review all four requests →" navigates here; each row's "More about [Vendor] →" link navigates here anchored to the specific request id) |
| **Exec Dashboard** | `exec-dashboard/` | **LOCKED 2026-06-08 · RE-LOCKED 2026-06-09** (**first exec-portal screen**; locks the entire exec portal shell — charcoal ink sidebar `oklch(0.22 0.008 70)` + companion tokens, topbar content-empty on the right, no bell / no search — plus the editorial concierge register: Fraunces section heads, italic Inter eyebrows, 72px section gaps, single emerald accent, no SaaS chrome. Introduces seven portal-wide patterns: photo-primary avatar rule (photo inside the circle, initials fallback), modal-only charity-change pattern (modal-on-dashboard structure, 20% ink dim + 2px blur), charity picker modal (560px, sticky header/search/recent-pills/footer, scrolling list, ACNC DGR register credential, 8 locked charities), charity detail READ modal (560px sister to the picker — sticky header + flush 180px hero image + 4 scrolling content sections + single "Done" footer + ACNC line; no commitment CTA), Direction Card with scraped charity logo + dual ghost-button actions, greeting block, editorial concierge register for the whole portal, and dark ink metric strip retained (parity with admin/vendor). **Four viewports**: VP1 dashboard at rest, VP2 standing-charity picker modal, VP3 per-meeting charity picker modal, VP4 charity detail modal. Sample data: Priya Raghavan · 4 incoming · 3 upcoming · 12 held FY · $28,000 lifetime. **RE-LOCK 2026-06-09:** the right column's scrollable card-in-card Incoming container (with truncated Q1/Q2, charity narrative, verified line, full action row per card, and "SHOWING N OF M" mono helper, plus the separately centered "Four requests" section header) was replaced with a **compact Incoming list widget** — header "Incoming requests · 4 awaiting" + soonest-meeting sub-line + 4 hairline-separated rows (40px avatar + identity + 3 compact 32px buttons + "More about [Vendor] →" link per row) + bottom-pinned "Review all four requests →" footer linking to `/exec/requests`. All Q1/Q2/verification/gift content moved to the new locked `/exec/requests` Incoming Requests batch page. Architectural decisions baked in: per-meeting charity override lives ONLY on Upcoming Meetings (never on Incoming); "More about [vendor]" navigates to `/exec/requests` anchored (NOT `/exec/requests/[id]` per original spec); charity-change is modal-on-dashboard not navigation; stacked modals forbidden. New data field required: `vendor_user.photo_url`. Pass B: meeting detail page + EA mode banner + other exec nav screens) |
| Admin Inbox | `admin-inbox/` | LOCKED 2026-06-04 (pending wordmark; `--portal-sage-soft` + `--portal-card-reading` introduced; AI Prompt drawer = pass 2) |
| AI Prompt drawer (Pass 2 of Admin Inbox) | `ai-prompt-drawer/` | LOCKED 2026-06-04 (pending wordmark; reuses sage and white-reading tokens from Pass 1; Drafts / Context / Prompt / Unmatched states) |
| Notification dropdown | `notification-dropdown/` | LOCKED 2026-06-04 (pending wordmark; 380px popover anchored under topbar bell; aggregates inbox + meeting + gift + onboarding + sync notification types) |

## Open decisions a cold chat must NOT silently resolve

- The **wordmark** (one word vs the spaced render) is parked. Do not pick one; ask.
- **Checklist item gating** (independent vs sequential) is parked; the editor has no
  "complete in order" toggle yet. See the Checklists entry in the design log.
- ~~**Exec sidebar colour** is not locked (candidate clay/bronze).~~ **RESOLVED 2026-06-08 on Exec Dashboard** — Exec sidebar = charcoal ink `oklch(0.22 0.008 70)`. Vendor sidebar locked 2026-06-05 as deep teal-pine `oklch(0.32 0.045 195)`. Admin = emerald.
- The five Reports added beyond CALCULATIONS §6 (Executive responsiveness, Request
  funnel, Renewal pipeline, Outstanding invoices, Reconciliation) are not yet written
  into the report spec; their money columns must be specced before build.

## What is still needed in this folder

The exported HTML and screenshots are added by Issy from Claude Design. Until a
screen's `screen.html` is present, treat the design log entry plus any screenshots as
the reference, and ask Issy to export the markup.
