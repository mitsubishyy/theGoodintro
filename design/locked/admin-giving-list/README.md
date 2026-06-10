# Admin Giving (Gifts) — LOCKED

Designed in Claude Design 2026-06-03. T3 template (index list) with a per-charity
Pay batch drawer. The brand-critical donation surface where Issy weekly reviews
gift records, runs payment batches grouped by charity, and tracks lifecycle
(released → paid → receipted) per CHARITY_FLOW.md Model 2 donation flow.

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Admin Giving" → File > Export HTML, drop here |
| `screenshot-loaded.png` | TO DROP | Drag from clipboard to this folder |
| `screenshot-loading.png` | TO DROP | Same |
| `screenshot-empty.png` | TO DROP | Same |
| `screenshot-pay-batch-drawer.png` | TO DROP | Same |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md), [`../../../CALCULATIONS.md`](../../../CALCULATIONS.md), [`../../../CHARITY_FLOW.md`](../../../CHARITY_FLOW.md).
2. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) §"Admin Giving (Gifts) (T3)".
3. [`../../../PORTAL_LAYOUT_BLUEPRINT.md`](../../../PORTAL_LAYOUT_BLUEPRINT.md) §T3 template rules.
4. [`../../../ADMIN_PORTAL_BRIEF.md`](../../../ADMIN_PORTAL_BRIEF.md) §Giving.
5. Open `screen.html` plus the screenshots in this folder.
6. Reference the locked Admin Requests pending, Admin Executives list, Admin Vendors list, Admin Meetings list for the matching T3 register.

## What is locked

### Loaded viewport
- Page header: breadcrumb Home / Giving, H1 "Giving" + mono count "12 unpaid / 84 paid YTD", Filter button, Sort dropdown (default "Held date · Oldest first"), ghost "Export ledger (CSV)", primary ink "Pay batch →".
- **Stat ribbon (3 stats, dark band, full-width):** UNPAID ($12,400 across 12 gifts), PAID YTD ($84,000 across 84 gifts), AVG DAYS TO PAY (6.4 days from held to paid).
- **DataTable columns:** CHARITY (logo + name) · MEETING (M-ID + vendor → exec) · HELD (date) · AMOUNT (frozen $, right-aligned) · BAND (Tier 1-4 mono pill) · LIFECYCLE (4-chip strip: HELD › REL › PAID › RCPT with ticks on completed) · STATUS (pill with dot) · (overflow).
- Row height 56px (taller for the dual-line MEETING cell). Row click → /admin/meetings/{id}#gift.
- Status pills: Awaiting payment (gold dot), Awaiting receipt (amber dot), Complete (gold lower-opacity), Reversed (slate dot + row 60% opacity), Voided (muted grey + row 60% opacity).
- 10 sample rows including Beyond Blue (M-202) as the Reversed example with dashed-border REL chip and row at 60% opacity.
- Amber edge dot on Save the Children (M-188) row — overdue-receipt 14+ days signal.
- Pagination: "Showing 1-10 of 96", page links (<, 1, 2, 3, ..., 10, >), rows-per-page dropdown (25 default).
- Sidebar: "Giving" as top-level item under OPERATIONS with sub-items "Gifts" (this page, default selected) and "Charities". Amber count badge "12" on Giving = number of unpaid gifts (NOT total YTD).
- `STATE · LOADING` annotation row at the bottom of the loaded viewport with SKELETON pill.

### Loading state viewport
- Stat ribbon stays dark; three big numbers and sub-lines render as horizontal shimmer bars.
- Table header row stays solid.
- 8 skeleton rows; each mimics the real anatomy (shimmer placeholders for logo circle, charity name, M-ID + vendor→exec dual-line, dates, amount, tier pill, 4-chip lifecycle strip with chevron gaps, status pill, overflow).
- Pagination shimmer at bottom.
- STATE annotation row at bottom: "You're viewing the loading state" with "VIEWING NOW" pill (ink, indicating active viewport).

### Empty state viewport ("No gifts yet")
- Stat ribbon: $0 / $0 / 0 days across all three stats; sub-lines "No data yet" in muted mono.
- NO table header row, NO sample rows.
- Centred 48px antique-gold outline gift-box icon, heading "No gifts yet" (Inter semibold 16px ink), body explaining the lifecycle (max 480px width, muted), muted text link "View meetings →" linking to /admin/meetings (NOT a primary ink CTA — gifts are created by meetings being held).
- STATE annotation row: "STATE · EMPTY · First install — no meeting has been held yet" with "FIRST RUN" pill on the right.

### Pay batch drawer viewport
- 600px wide drawer slides in from the right edge over the loaded page; backdrop dimmed.
- STATE annotation row at top of viewport: "STATE · PAY BATCH · Drawer open over the loaded page — gifts grouped by charity for payout" with "DRAWER" pill.
- Drawer header (sticky): mono uppercase "PAY BATCH" + subtitle "Groups gifts by charity. Pay each block once, mark all complete here." + close X.
- Drawer body: per-charity payment blocks, each a card with hairline border:
  - **Royal Flying Doctor Service** · ABN 74 438 059 643 · 3 gifts · $2,900 · breakdown (M-204 $1,000, M-198 $900, M-180 $1,000) · PAYMENT DETAILS (Royal Flying Doctor Service of Australia, BSB/ACCT 012-345 / 1234 5678, REFERENCE GIFT-BATCH-2406-RFDS, both click-to-copy with copy icons) · primary ink "Mark this charity batch paid"
  - **headspace** · ABN 26 137 533 843 · 1 gift · $1,100 · breakdown (M-203 $1,100) · PAYMENT DETAILS · "Mark this charity batch paid"
  - **WWF-Australia** · ABN 57 001 594 074 · 1 gift · $1,200 · breakdown (M-195 $1,200) · PAYMENT DETAILS · "Mark this charity batch paid"
- Drawer footer (sticky, hairline above): GRAND TOTAL "$5,200 across 5 gifts to 3 charities" + ghost "Cancel" + primary ink "Mark all batches paid" with 11px muted warning below ("Records all listed gifts as paid. Receipts will still need to be filed individually as they arrive from each charity.").

### Trigger and behaviour
- "Pay batch →" button in the page header opens the drawer.
- ESC, clicking X, or clicking the dimmed backdrop closes it.
- Drawer overlays the page (z-index above), with a 30%-opacity black backdrop.

## Issy's fixes applied (2026-06-03 fix pass)

- Beyond Blue row now renders at 60% opacity (Reversed visual demotion).
- STATE · LOADING annotation row added to the bottom of the loaded viewport.
- Loading state viewport designed with 8 skeleton rows matching real row anatomy.
- Empty state viewport designed with $0 ribbon, gift-box icon, body explainer, "View meetings →" link.
- Pay batch drawer viewport designed with three per-charity blocks, grand total footer, "Mark all batches paid" action.

## Money rules (hard, inherited from CALCULATIONS.md)

- Every dollar figure on this page is FROZEN at the moment the meeting was marked Held. The AMOUNT column reads `gift_record.keep_amount_cents` (or per-DEC-1 equivalent), NEVER recomputed.
- TIER pill shows the vendor's tier AT BOOKING for that meeting, not their current tier.
- Stat ribbon's UNPAID and PAID YTD totals sum the frozen amounts via `reporting.ts`.
- No flat "$1,000" assumption — each row uses its real frozen amount (varies by vendor tier at booking: $900 / $1,000 / $1,100 / $1,200).
- Pay batch drawer's per-charity sums and grand total are derived from the selected gift_record rows; build chat must NOT recompute from band+meeting at drawer-open time.

## Open decisions (not silently resolved)

- **Lifecycle chip filled vs hollow contrast.** Current rendering uses the same soft-amber background for both filled (with tick) and hollow (no tick) chips; only the tick distinguishes them. Issy chose to keep the uniform look. Build chat: match the design exactly; do not differentiate the backgrounds.
- **Sample-data drift on the Pay batch drawer's dimmed background.** Screenshot shows M-204 as `Globex → Maria Santos` and M-198 as `Soylent → Daniel Brooks`, but the locked loaded view has M-204 = `Acme Robotics → Priya Raghavan` and M-198 = `Northwind Labs → Priya Raghavan`. Minor (background is dimmed). To be corrected on the next iteration so the cold chat sees one truth.
- **Wordmark** ("The Good Intro" three words vs locked "TheGoodIntro" one word) parked across all locked screens.
- **Receipt-overdue threshold.** Save the Children's amber edge dot fires at 14+ days. Confirm 14 is the right threshold or whether it should be 7 / 21 / configurable.

## Click flow

`Sidebar / Giving / Gifts` → `/admin/giving` (this page, default sub-route) → row click → `/admin/meetings/{id}#gift` (Meeting detail's Gift record module). Sub-item "Charities" → `/admin/giving/charities` (Charities directory, in design).
