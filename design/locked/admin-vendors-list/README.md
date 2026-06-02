# Admin Vendors list — LOCKED

Designed in Claude Design 2026-06-02. T3 template (index list). The helicopter
view that opens when Issy clicks "Vendors" in the sidebar. Row click opens the
locked Admin Vendor detail page.

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Admin Vendors" → File > Export HTML, drop here |
| `screenshot-loaded.png` | TO DROP | Drag from clipboard to this folder |
| `screenshot-loading.png` | TO DROP | Same |
| `screenshot-empty.png` | TO DROP | Same |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md), [`../../../CALCULATIONS.md`](../../../CALCULATIONS.md),
   [`../../../DATA_MODEL.md`](../../../DATA_MODEL.md).
2. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) §"Admin Vendors list (T3)".
3. [`../../../PORTAL_LAYOUT_BLUEPRINT.md`](../../../PORTAL_LAYOUT_BLUEPRINT.md) §T3 template rules.
4. [`../../../ADMIN_PORTAL_BRIEF.md`](../../../ADMIN_PORTAL_BRIEF.md) §Vendors.
5. Open `screen.html` plus the screenshots in this folder.
6. Reference the locked Admin Executives list and Admin Meetings list folders for the matching T3 register.

## What is locked

- Page header: breadcrumb Home / Vendors, H1 "Vendors" + mono count "14 active / 17 all",
  Filter button (active-count amber pill suffix), Sort dropdown (default "Date joined · Newest first"),
  primary ink "+ New vendor".
- **Stat ribbon (3 stats, dark band, full-width, no rounded corners):** ACTIVE VENDORS / CREDITS RESERVED / REVENUE MTD. Money rule: revenue values from `reporting.ts`; a credit is locked at $1,500 flat so the credits-reserved stat is a count, not $.
- DataTable columns: VENDOR (logo + company name + primary contact name and email on sub-line) · TIER (mono uppercase pill: TIER 1-4) · CREDITS (count, mono right-aligned, red dot on 0) · RENEWS (date, mono right-aligned) · JOINED (date, mono right-aligned) · STATUS (pill with dot) · (overflow).
- Tier pill mapping: Tier 1 = 1-5 meetings in current rolling 12-month cycle, Tier 2 = 6-10, Tier 3 = 11-15, Tier 4 = 16+. No money figure on the tier pill.
- Credits column: count only, red dot at 0 (locked-out signal), `—` for vendors not yet purchased (Onboarding).
- Status pills: Active (gold dot), Onboarding (amber), Dormant (amber lower-opacity), Paused (slate), Churned (muted, row 60% opacity).
- Row overflow menu: Open profile, Send onboarding email, Mark vetting call done, Pause vendor, Add credit manually, Archive.
- Filter popover sections: STATUS (per-status counts), TIER (per-tier counts), CREDIT BALANCE (All / Zero locked out / 1-2 remaining / 3+), INDUSTRY, COMPANY SIZE chips, REGION chips, HAS OUTSTANDING INVOICE, HAS RECENT MEETING (30/90/none), RENEWS WITHIN (30/60/90 days), JOINED date range.
- Bulk actions when checkbox ticked: Apply tag, Change status to..., Send onboarding email, Pause, Add credit manually, Archive, Export selected (CSV), Cancel.
- Pagination row: "Showing 1-25 of 17", page links, rows-per-page dropdown.
- Empty state: antique-gold outline icon (stacked-card / vendor-logo silhouette), "No vendors yet", muted body about vetting call, primary "+ Add a vendor manually".
- Loading state: stat ribbon shimmer bars, header row + 8 skeleton rows.

## Issy's changes from the issued prompt (2026-06-02)

No deviations recorded. If any were made, append them here when noticed.

## Open decisions (not silently resolved)

- **Wordmark** ("The Good Intro" three words vs locked "TheGoodIntro" one word) parked across all locked screens.
- **Renews column** shows absolute date by default. Confirm vs relative ("in 9 months").

## Click flow

`Sidebar / Vendors` → `/admin/vendors` (this screen) → row click → `/admin/vendors/{id}` (locked Admin Vendor detail).
