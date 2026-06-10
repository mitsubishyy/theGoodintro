# Admin Requests pending — LOCKED

Designed in Claude Design 2026-06-02. T3 template (index list) with operational
follow-up tracking layered on. The queue Issy works every day to manage the
vendor-to-exec request loop. Row click opens the Meeting detail page (where the
request lives as a Proposed-state meeting).

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Admin Requests Pending" → File > Export HTML, drop here |
| `screenshot-loaded.png` | TO DROP | Drag from clipboard to this folder |
| `screenshot-loading.png` | TO DROP | Same |
| `screenshot-empty.png` | TO DROP | Same |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md), [`../../../STATE_MACHINES.md`](../../../STATE_MACHINES.md).
2. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) §"Admin Requests pending (T3)".
3. [`../../../PORTAL_LAYOUT_BLUEPRINT.md`](../../../PORTAL_LAYOUT_BLUEPRINT.md) §T3 template rules.
4. [`../../../ADMIN_PORTAL_BRIEF.md`](../../../ADMIN_PORTAL_BRIEF.md) §Requests pending.
5. Open `screen.html` plus the screenshots in this folder.
6. Reference the locked T3 trio (Executives list, Vendors list, Meetings list) for the matching DataTable register.

## What is locked

- Page header: breadcrumb Home / Requests, H1 "Requests pending" + mono count "7 pending / 2 due today", Filter button (active-count amber pill suffix), Sort dropdown (default "Next action · Soonest first"). NO "+ New" button (vendors create requests; admin doesn't).
- **Stat ribbon (3 stats, dark band, full-width):** PENDING REQUESTS (count + "N due today"), AVG RESPONSE TIME (days + "30-day rolling"), DECLINE RATE (% + "Of N explicit responses in 30 days" — denominator visible).
- DataTable columns: REQUEST (vendor logo + arrow + exec photo + Vendor → Exec name beneath) · TOPIC (one-line snippet of the pitch, ellipsis) · AGE (mono) · FOLLOW-UPS (mono uppercase pill 0/3 to 3/3, red dot on 3/3) · NEXT ACTION (today / in Xh-Xd / expired / —) · STATUS (pill with dot) · (overflow).
- Row height 56px (slightly taller than other T3 lists) to accommodate the dual-avatar REQUEST cell.
- Status pills: Awaiting exec (gold dot), 1st follow-up sent (amber), 2nd follow-up sent (amber lower-opacity), Last reminder sent (amber + red border), 1st follow-up due (gold + red urgency dot), Lapsed (muted grey + row 60% opacity), Declined (slate dot).
- NEXT ACTION cell: "today" rendered bold ink with red dot for immediate action; "in Xh"/"in Xd" muted; "expired" muted; "—" when no further action.
- Row click → /admin/meetings/{id} (the Meeting detail page where the request lives as a Proposed-state meeting).
- Row overflow menu: Open meeting record, Send follow-up now, Skip to next exec..., Cancel request, Mark as declined manually, Copy request summary.
- Filter popover: STATUS (multi with per-status counts), VENDOR (typeahead), EXEC (typeahead), AGE chips, FOLLOW-UPS DONE chips, DUE (Today / This week / Next week), LAPSING WITHIN (7 / 14 days). Saved views supported. URL reflects filters.
- Pagination: 48px row, "Showing 1-N of N", rows-per-page dropdown (25 default).
- Sidebar position: under OPERATIONS between Meetings and Vendors, item "Requests pending", **amber count badge = items due today (not total pending)**.
- `STATE · LOADING` annotation row at the bottom of the loaded view describing the loading state inline (with a SKELETON pill). Codify this annotation row as the convention for every list page going forward.
- Loaded, loading, empty states all designed.

## Issy's fixes applied (2026-06-02 fix pass)

- Row 6 (Wayne Enterprises → Tom Whitfield): Status changed from "Awaiting exec" to "1st follow-up sent" to match the FOLLOW-UPS pill 1/3.
- DECLINE RATE sub-line changed from "30-day rolling" to "Of 22 explicit responses in 30 days" so the calculation denominator is visible.

## Open decisions (not silently resolved)

- **Decline rate calc** is now defined (numerator: explicit declines in last 30d; denominator: numerator + confirmed-meeting conversions in same window; lapsed and pending excluded from both). Build chat: encode this in the reporting library; surface a unit test.
- **"Lapsing soon" definition.** When does a request transition from "Last reminder sent" to "Lapsed"? Proposed: 4 days after the 3rd follow-up is sent with no response. Confirm before build.
- **Wordmark** ("The Good Intro" three words vs locked "TheGoodIntro" one word) parked across all locked screens.

## Click flow

`Sidebar / Requests pending` → `/admin/requests` (this screen) → row click → `/admin/meetings/{id}` (Meeting detail, in design). Row overflow actions either trigger inline (Send follow-up now, Cancel request) or navigate.
