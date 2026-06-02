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
| Admin dashboard | `admin-dashboard/` | LOCKED (pending wordmark) |
| Admin meetings (calendar + list) | `admin-meetings/` | LOCKED |
| Admin vendor detail | `admin-vendor-detail/` | LOCKED |
| Admin executive detail | `admin-executive-detail/` | LOCKED 2026-06-01 (pending wordmark) |
| Admin new executive form | `admin-new-executive/` | LOCKED (pending wordmark) |
| Admin Tags | `admin-tags/` | LOCKED |
| Admin Checklists (locks template T6) | `admin-checklists/` | LOCKED |
| Admin Reports | `admin-reports/` | LOCKED pending the opened-report money check |
| Admin New Meeting | `admin-new-meeting/` | PARKED (revisit via Zoom/Teams scheduling) |
| Admin Executives list | `admin-executives-list/` | LOCKED 2026-06-02 (response-rate column removed; reinstate when calc is defined) |
| Admin Vendors list | `admin-vendors-list/` | LOCKED 2026-06-02 (pending wordmark) |
| Admin Meeting detail | `admin-meeting-detail/` | in design (prompt issued 2026-06-02) |
| Admin Inbox | `admin-inbox/` | in design |
| Notification dropdown | `notification-dropdown/` | in progress |

## Open decisions a cold chat must NOT silently resolve

- The **wordmark** (one word vs the spaced render) is parked. Do not pick one; ask.
- **Checklist item gating** (independent vs sequential) is parked; the editor has no
  "complete in order" toggle yet. See the Checklists entry in the design log.
- **Vendor/exec sidebar colours** are not locked (candidates: vendor deep teal-pine,
  exec deep clay/bronze).
- The five Reports added beyond CALCULATIONS §6 (Executive responsiveness, Request
  funnel, Renewal pipeline, Outstanding invoices, Reconciliation) are not yet written
  into the report spec; their money columns must be specced before build.

## What is still needed in this folder

The exported HTML and screenshots are added by Issy from Claude Design. Until a
screen's `screen.html` is present, treat the design log entry plus any screenshots as
the reference, and ask Issy to export the markup.
