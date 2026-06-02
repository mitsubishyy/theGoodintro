# Admin Executives list — LOCKED

Designed in Claude Design 2026-06-02. T3 template (index list). The helicopter
view that opens when Issy clicks "Executives" in the sidebar. Row click opens
the locked Admin Executive detail page.

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Admin Executives" → File > Export HTML, drop here |
| `screenshot-loaded.png` | TO DROP | Drag from clipboard to this folder |
| `screenshot-loading.png` | TO DROP | Same |
| `screenshot-empty.png` | TO DROP | Same |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md), [`../../../CALCULATIONS.md`](../../../CALCULATIONS.md),
   [`../../../DATA_MODEL.md`](../../../DATA_MODEL.md).
2. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) §"Admin Executives list (T3)".
3. [`../../../PORTAL_LAYOUT_BLUEPRINT.md`](../../../PORTAL_LAYOUT_BLUEPRINT.md) §T3 template rules.
4. [`../../../ADMIN_PORTAL_BRIEF.md`](../../../ADMIN_PORTAL_BRIEF.md) §Executives.
5. Open `screen.html` plus the screenshots in this folder.
6. Reference the locked Admin Meetings list (T3) folder for the matching DataTable register.

## What is locked

- Page header: breadcrumb Home / Executives, H1 "Executives" + mono count "47 active / 51 all",
  Filter button (with active-count amber pill), Sort dropdown (default "Date joined · Newest first"),
  primary ink button "+ New executive".
- **Stat ribbon (3 stats, dark band, full-width, no rounded corners)**: ACTIVE EXECS / MEETINGS HELD YTD / CHARITY RAISED YTD. Sub-lines under each.
- DataTable with column headers: EXECUTIVE (avatar + name + title) · COMPANY · CHARITY · LAST MEETING · JOINED · STATUS.
- Row height 44px, hairline divider, hover state.
- Status pills (Inter 11px title case, 6px dot): Active (gold dot), Onboarding (amber dot), Dormant (amber lower-opacity), Paused (slate), Churned (muted, row at 60% opacity).
- Row-action overflow (...) on the rightmost cell, opens contextual menu (Open profile, View as EA, Send test email, Pause exec, Archive, Copy email).
- Filter popover sections: STATUS (with per-status counts), COMPANY, TITLE / SENIORITY, CHARITY, INDUSTRY, REGION, HAS EA, CALENDAR CONNECTED, JOINED date range. Saved views supported. URL reflects filters.
- Bulk actions when checkbox ticked: Apply tag, Change status to..., Send onboarding email, Pause, Archive, Export selected (CSV), Cancel.
- Pagination row: "Showing 1-25 of 51", page links, rows-per-page dropdown (10, 25 default, 50, 100).
- Empty state: centred antique-gold outline icon (two stacked person silhouettes), "No executives yet", muted body, primary "+ Add your first executive".
- Loading state: stat ribbon shimmer bars, table header + 8 skeleton rows.

## Issy's changes from the issued prompt (2026-06-02)

These are intentional changes; the build chat should NOT add them back:

- **RESPONSE RATE column removed.** "Not sure how we can capture that" — the
  response rate metric needs a defined calculation (e.g. accepts ÷ requests
  over rolling 90 days) before the column lands. Tracked as an open decision.
- **Top banner kept** as designed (stat ribbon retained; not collapsed or
  hidden).

## Open decisions (not silently resolved)

- **Response rate definition and reinstating the column.** Decide the
  calculation (accepts ÷ all requests, over what window, including or
  excluding reschedules) and then reinstate the column. Until then, the
  KEY METRICS section on the locked Executive detail page shows response
  rate as "78%" illustratively only; the build pulls a real figure or hides
  the row.
- **"Last meeting" column when no meeting yet** renders as a dash. Confirm
  the dash is the right empty marker rather than "Never" or "—".
- **Wordmark** ("The Good Intro" three words vs locked "TheGoodIntro" one
  word) is parked across all locked screens.

## Click flow

`Sidebar / Executives` → `/admin/executives` (this screen) → row click → `/admin/executives/{id}` (locked Admin Executive detail).
