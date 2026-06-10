# Admin Meeting detail (T4) — LOCKED 2026-06-04 (pending the wordmark call)

Designed in Claude Design 2026-06-04. The detail page for an individual meeting
record (route: `/admin/meetings/{meeting_id}`). Symmetric to the LOCKED Admin
Vendor detail and Admin Executive detail screens — same T4 anatomy (header +
left module rail + centre active module + right Activity feed), different
content. The brand-critical new piece this page introduces is the **Gift record
module** showing the Held → Released → Paid → Receipt donation lifecycle.

First T4 detail page rendered after the portal-wide back button pattern was
added (2026-06-04) — so this is also the reference for how the back button row
sits above the breadcrumb on detail pages.

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Admin Meeting Detail" → File > Export HTML, drop here |
| `screenshot-overview.png` | TO DROP | VP1 — Loaded, Overview module active, all four header rows + 3-column body + Activity feed |
| `screenshot-gift-record.png` | TO DROP | VP2 — Gift record module active, lifecycle bar + donation details + payment details + receipt tracking + reversal |
| `screenshot-loading.png` | TO DROP | VP3 — Loading skeletons across all three columns |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md), [`../../../CALCULATIONS.md`](../../../CALCULATIONS.md), [`../../../CHARITY_FLOW.md`](../../../CHARITY_FLOW.md) — Model 2 donation flow is the source of truth for what the Gift record module describes.
2. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) §"Admin Meeting detail (T4)".
3. [`../../../PORTAL_LAYOUT_BLUEPRINT.md`](../../../PORTAL_LAYOUT_BLUEPRINT.md) — T4 template + the back button pattern in §2 + the locked sidebar IA.
4. [`../admin-vendor-detail/`](../admin-vendor-detail/) and [`../admin-executive-detail/`](../admin-executive-detail/) — the sibling T4 detail pages this inherits anatomy from.
5. [`../admin-giving-list/README.md`](../admin-giving-list/README.md) — the Giving page is where row click lands on this Meeting detail's Gift record module; payment details block here mirrors the Pay batch drawer pattern from Giving.
6. Open `screen.html` plus the three screenshots.

## What is locked

### Page header stack (top of content area, all sticky)

Four rows top to bottom:

1. **BACK BUTTON ROW (32px thin, hairline below):** "← Back" ghost button on the left (20px chevron-left outline icon + 8px gap + "Back" Inter 14px semibold ink, no border, no fill, hover subtle --portal-card-hover). Click → `/admin/meetings` (parent route, NOT browser history). First locked use of the portal-wide back button pattern added 2026-06-04.

2. **BREADCRUMB ROW:** "HOME / MEETINGS / M-204" mono 11px uppercase muted.

3. **H1 + STATUS PILL ROW (~64px):** H1 "M-204 · Acme Robotics → Priya Raghavan" (Inter 18-20px semibold, ink) with inline status pill "Held · Awaiting payment" (Inter title case, gold dot, 12px — per locked status-pill global decision). The "→" between vendor and exec is a character (works fine in Inter); icon variant also acceptable.

4. **STRUCTURED CHIPS + ACTION CLUSTER ROW (~48px):** 4 chips on the left — MEETING M-204 / DATE 14 MAY 2026 · 14:00 AEST / DURATION 30 MIN / VENUE ZOOM — all mono uppercase soft-amber pills, 8px gap. Action cluster on the right: ghost "Reschedule" + ghost "Cancel meeting" + primary ink "Mark paid →" + overflow "..." (with: View transcript, Resend confirmation email, Open in Calendar, Reverse gift (admin only), Print summary, Copy meeting link).

### T4 body (three columns below the header stack)

**Left module rail (~200px wide, sticky on scroll, `--portal-card`):**
- OVERVIEW (selected on VP1)
- GIFT RECORD (selected on VP2) — amber attention badge "•" when status is Released and awaiting payment
- COMMS — muted count chip right ("3")
- VENDOR SIDE
- EXEC SIDE
- CALENDAR & STATUS
- NOTES — muted count chip right ("2")

NO Tags module on Meeting detail (tags are vendor/exec-scoped, not meeting-scoped). 40px row height, hairline between, selected item gets ink left bar (3px) + slightly darker background.

**Centre active module:** depends on which rail item is selected (see VP1 Overview / VP2 Gift record details below).

**Right Activity feed (~320px wide, sticky on scroll, `--portal-card`):**
- Mono uppercase eyebrow "ACTIVITY" + small "Newest first ▾" toggle right
- Gold timeline rail (1.5px line + 6px gold dots at each event)
- 56px event rows, each with mono 11px uppercase eyebrow (event type) + Inter 13px body + muted 11px timestamp
- Append-only (no edit/delete)
- Bottom: "LOAD EARLIER →" ghost link

8 sample events newest-first: GIFT BATCHED (18 May) / RECEIPT REQUESTED (17 May) / GIFT RELEASED (14 May) / GIFT RECORD CREATED (14 May) / MEETING HELD (14 May) / MEETING STARTED (14 May) / MEETING CONFIRMED (28 Apr) / MEETING PROPOSED (22 Apr).

### VP1 — Overview module (default landing)

Centre module body organised into 4 sections, mono uppercase headers with right-aligned captions, label-left value-right rows (32px row height, hairline between):

| # | Section | Caption | Notes |
|---|---|---|---|
| 1 | MEETING FACTS | "What happened" | Meeting ID / Date and time / Venue (with "Open Zoom recording →" ghost link) / Status (with gold dot inline) / Requested by / Accepted by (with "EA: Lena Park" sub-line muted) / Topic |
| 2 | MONEY | "Frozen at Held" | Total fee $1,500 / To charity $1,000 / TheGoodIntro keeps $500 — every $ in a soft-amber chip with provenance micro-label ("from pricing engine" / "Tier 2 band, frozen at Held"). 11px note: "Every $ figure frozen at the moment of Held. Band is display-only — the amount is the authority. See CALCULATIONS.md." |
| 3 | CREDIT | "Acme Robotics cycle" | Credit consumed: 1 of Acme's Tier 2 cycle · meeting 7 of 5-10 in cycle / Cycle anchor 12 March 2026 · renews 12 March 2027 / Remaining credits in cycle 2 |
| 4 | LINKED RECORDS | "Open the related profiles" | Three small horizontal cards: Acme Robotics (AR logo, VEN-1044, Sam Patel, "Open profile →") + Priya Raghavan (PR avatar, EXC-1042, CFO Lumen, "Open profile →") + Royal Flying Doctor Service (RFDS logo, ABN, "Open charity →") |

### VP2 — Gift record module (the brand-critical lifecycle)

Centre module body:

**Lifecycle bar (~80px top strip, full width of centre area):**

Four chips horizontal, connected by chevrons:
```
[ HELD ✓ ]  →  [ RELEASED ✓ ]  →  [ PAID ]  →  [ RECEIPT ]
14 May, 14:32    14 May, 16:30      —             —
```
- Completed chips (HELD, RELEASED): soft-amber background + gold checkmark + mono uppercase label + small timestamp below.
- Future chips (PAID, RECEIPT): hairline-bordered hollow + no checkmark + dashed "—" timestamp placeholder.
- Chevrons between completed steps are filled gold; between hollow steps are muted.

**Status line below lifecycle bar:** mono uppercase "STATUS" eyebrow + Inter 14px "Awaiting payment · expected within 7 days of release" + gold status dot.

**Four sections beneath:**

| # | Section | Caption | Notes |
|---|---|---|---|
| 1 | DONATION DETAILS | "Frozen at Held" | Charity (RFDS logo) / ABN 74 438 059 643 / Amount $1,000 soft-amber chip "Tier 2 · frozen at Held" / Band Tier 2 · meetings 6-10 of cycle / Released at 14 May 2026, 16:30 AEST by Issy. 11px note: "Donation flows per CHARITY_FLOW.md Model 2: TheGoodIntro receives the full $1,500, donates this amount from its own funds, claims the deduction. Vendor (Acme) does not receive a gift receipt." |
| 2 | PAYMENT DETAILS | "Charity bank record" | BSB 062-001 / Account 1234-5678 / Reference RFDS-M204-MAY26 / Bank Commonwealth Bank · charity ACID record — all with click-to-copy icons right (same pattern as Pay batch drawer on Giving). Primary ink "Mark this gift paid →" button left-aligned at the bottom of the section, single-line label, min-width 240px, fit-content (NOT stretched). |
| 3 | RECEIPT TRACKING | (no caption) | Receipt requested Yes · queued 17 May 2026 / Receipt received Not yet / Receipt filed Not yet. 11px muted: "Receipt expected within 14 days of payment. Track at /admin/giving filtered by Awaiting receipt." |
| 4 | REVERSAL | "Admin-only · used if a gift is paid in error" | Collapsed by default (header only). Expanded state (deferred): destructive "Reverse this gift →" button with confirm modal. |

### VP3 — Loading state

Full shell. Back button row solid. All other header rows render as skeletons (skeleton bars at the same heights as the real rows).

T4 body: left module rail shows 7 skeleton rows. Centre area: skeleton mono header bar + 4 skeleton sections, each with 3-4 skeleton label/value rows. Right activity feed: skeleton eyebrow + 6 skeleton event rows.

STATE annotation row at bottom with SKELETON pill.

### Sidebar (locked with 4 sub-items under Meetings ▾)

The "Meetings ▾" item in the OPERATIONS group now has FOUR sub-items locked this pass:

- **Scheduled** — upcoming + active confirmed meetings
- **Pending requests** (with amber count badge, e.g. "7") — same data as the separately-locked Admin Requests pending screen, accessed via either sidebar path
- **Completed** — held meetings (history)
- **Cancellations** — cancelled / no-show log

This codifies the ▾ chevron that the design log's "Admin sidebar IA" entry had previously only hinted at.

## What's NOT designed in this pass (deferred)

- **Other rail modules:** Comms, Vendor side, Exec side, Calendar & status, Notes — their centre-module bodies are deferred. Click flow tested via the rail; module bodies designed on future passes.
- **Reversal expanded state** — destructive "Reverse this gift →" button + confirm modal. Section 4 of Gift record module is collapsed in the locked render.
- **Proposed / Cancelled / No-show status variants** — current viewport is "Held · Awaiting payment". Other status pill variants + their action-cluster swaps deferred (e.g. a Proposed meeting shows "Confirm meeting" instead of "Mark paid", a Cancelled meeting greys out, etc.).
- **Empty state** — meeting that doesn't exist (404) or one that's just been proposed but has no gift record yet. Deferred.
- **Error state** — failed data fetch with retry. Deferred.
- **Notes module body** — the append-only thread pattern from Vendor/Exec detail applies, but a Meeting-detail-specific render is deferred.
- **Comms module body** — likely inherits from Inbox conversation rendering; deferred.

## Issy's fixes applied (2026-06-04 fix passes)

- **Topbar cleanup:** removed the "All systems operational" status pill that re-appeared from a pre-simplification render. Topbar now matches the locked admin shell (search + bell + IH avatar only).
- **Duplicate STATE annotation:** VP2 (Gift record) originally rendered a STATE row at the top AND bottom of the viewport; stripped the top one. Single STATE row at the bottom with VIEWING NOW pill.
- **"Mark this gift paid →" button rendering:** initial render had the label wrapping across 3 lines because the container was too narrow. Fixed: button is now fit-content with min-width 240px, label stays on a single line, left-aligned at the bottom of the PAYMENT DETAILS section.

## Open decisions (not silently resolved)

- **The "→" arrow in the H1** — currently a character (works in Inter). Custom outline icon variant also acceptable. Build chat picks based on consistency with other detail-page headers.
- **Wordmark** parked across all locked screens.
- **Cancellations sub-item under Meetings** — kept for completeness (covers the 4th status state). If Issy finds she never navigates here, can be dropped in a future pass.
- **Reversal section expanded state** — deferred; design when needed.
- **Sample data verification at build time:** Acme cycle renewal "12 March 2027", credit count "meeting 7 of 5-10 in cycle", "Remaining credits in cycle: 2" — all need to read live from the pricing engine, never hardcoded.

## Click flow

`Sidebar / Meetings` → `/admin/meetings` (T3 list) → row click → `/admin/meetings/M-204` (this screen, defaults to Overview module).

Sidebar `Meetings ▾` sub-items navigate to filtered list views (Scheduled / Pending requests / Completed / Cancellations) — NOT directly to a specific meeting.

Sidebar `Gifts & Charities / Gifts` (the Giving list) → row click on a gift → `/admin/meetings/{id}#gift` (this screen with Gift record module selected via the hash fragment).

Inside the page:
- "← Back" → `/admin/meetings` (parent route, NOT browser history)
- "Open Zoom recording →" → external Zoom URL
- "Mark paid →" (header action cluster) — shortcut to mark the current gift paid without navigating into the Gift record module
- "Mark this gift paid →" (inside Gift record module PAYMENT DETAILS section) — same action as the header shortcut
- "Open profile →" links on the Overview module's Linked records cards → vendor / exec profiles
- "Open charity →" → charity directory page
- Overflow "..." menu → various actions including Reverse gift (admin only)
