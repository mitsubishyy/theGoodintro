# Notification dropdown — LOCKED 2026-06-04 (pending the wordmark call)

Designed in Claude Design 2026-06-04. A 380px popover that opens when Issy
clicks the notification bell in the admin portal topbar. Aggregates operational
notifications across multiple types (unread inbox, meeting moves, gift
overdues, new vendor/exec onboardings, sync failures), not just inbox messages.
Lives in the shared `<PortalTopbar>` component — single source for all three
portals.

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Notification Dropdown" → File > Export HTML, drop here |
| `screenshot-loaded.png` | TO DROP | VP1 — 5 notifications, mixed types, Sam Patel row hovered |
| `screenshot-empty.png` | TO DROP | VP2 — "All caught up", no bell dot, Mark all read disabled |
| `screenshot-loading.png` | TO DROP | VP3 — 5 skeleton rows + skeleton count badge |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md).
2. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) §"Notification dropdown".
3. [`../../../PORTAL_LAYOUT_BLUEPRINT.md`](../../../PORTAL_LAYOUT_BLUEPRINT.md) §2 — `<PortalTopbar>` is the parent shell.
4. [`../../../ADMIN_INBOX_SPEC.md`](../../../ADMIN_INBOX_SPEC.md) §2 (bell badge spec) and §11 (notifications spec) — drives the inbox-unread notification type.
5. [`../../../ADMIN_PORTAL_BRIEF.md`](../../../ADMIN_PORTAL_BRIEF.md) — additional notification types the bell carries ("new vendor / exec onboarded", "meeting move requested").
6. Open `screen.html` plus the three screenshots.

## What is locked

### Popover geometry
- **Width:** 380px.
- **Anchor:** top-right under the topbar bell icon. Small 12px caret pointing up at the bell.
- **Backdrop:** subtle 10% black dim — topbar and page below stay visible (this is NOT a full modal).
- **Background:** `--portal-card` (warm cream, matches the rest of the portal cards). NOT white (`--portal-card-reading` is Inbox-specific).
- **Close behaviour:** click outside / Esc / click the bell again.

### Header (40px tall, hairline below)
- **Left:** mono uppercase "NOTIFICATIONS" eyebrow + small amber count pill (e.g. "6") right after the label. The count pill shows `--portal-amber` background with `--portal-amber-ink` text. When count is 0, the pill is muted grey (not amber) to signal nothing actionable.
- **Right:** ghost "Mark all read" small link (Inter 12px muted, with a small check outline icon left). Disabled state (lower opacity) when count is 0.

### Notification rows (64px each, hairline between, scrollable to ~480px max-height)
Each row anatomy:
- **Left (32px round icon circle on `--portal-amber-soft`):** outline icon varies by notification type:
  - `inbox-unread` → envelope outline
  - `meeting-move` → calendar-with-arrow outline
  - `gift-overdue` → gift-with-clock outline
  - `exec-onboarded` → person-with-check outline
  - `vendor-onboarded` → briefcase-with-check outline
  - `sync-failure` → warning-triangle outline
- **Middle (two-line body):**
  - Line 1: mono 10px uppercase TYPE label (UNREAD INBOX / MEETING MOVE REQUESTED / GIFT OVERDUE / NEW EXEC ONBOARDED / etc.) in `--muted-foreground`.
  - Line 2: Inter 13px ink, the notification body (e.g. "Sam Patel · Acme Robotics — Re: Credit count..."), truncated to one line with ellipsis.
- **Right:** mono 11px muted timestamp ("12m ago" / "2h ago" / "Yesterday" / "2 days ago").
- **Hover:** subtle `--portal-card-hover` background + per-row ghost "..." overflow icon appears on the right edge (replaces the timestamp position when hovered). Overflow menu actions: Mark this read · Snooze · Go to source · Dismiss.
- **Click anywhere on the row:** navigates to the relevant page (inbox conversation, meeting detail, gift record, vendor/exec profile, integration settings).

### Footer (40px, hairline above)
- **Left:** small mono link "GO TO INBOX →" — defaults to /admin/inbox since inbox-unread is the most common type.
- **Centre:** small muted mono "Showing 5 of N · M sync warnings hidden" indicating how many notifications aren't surfaced in the top 5.
- **Right:** small ghost cog icon "Notification settings" — links to `/admin/settings/notifications` (a future Settings sub-tab).

### Three states designed
- **VP1 — LOADED (5 notifications, Sam Patel row hovered):** all 5 sample rows render, mixed types (UNREAD INBOX / MEETING MOVE REQUESTED / GIFT OVERDUE / UNREAD INBOX / NEW EXEC ONBOARDED). Sam Patel row shows hover state with "..." overflow visible. Bell amber dot visible. Footer reads "Showing 5 of 6 · 1 sync warning hidden".
- **VP2 — EMPTY ("All caught up"):** centred empty state inside the popover body — 48px check-circle outline icon in `--portal-amber` + "All caught up." (Inter 14px semibold) + "No new notifications since you last checked." (Inter 13px muted, max-width 260px centred). Header count is "0" muted grey; Mark all read is disabled. Footer centre reads "All read · last cleared 14m ago" muted. Bell amber dot is ABSENT.
- **VP3 — LOADING:** 5 skeleton rows matching the loaded anatomy (32px circle skeleton + 2-line text skeletons + timestamp skeleton). Header eyebrow solid; count badge as skeleton circle. Footer centre reads "Loading...". Bell dot still visible.

### Sample data locked (5 notifications + 1 hidden)
1. UNREAD INBOX · "Sam Patel · Acme Robotics — Re: Credit count and next-quarter intros" · 12m ago
2. MEETING MOVE REQUESTED · "Priya R. (Lumen) wants to push M-211 by one week" · 2h ago
3. GIFT OVERDUE · "M-188 · Beyond Blue · awaiting payment 14 days" · 6h ago
4. UNREAD INBOX · "Rosa Lin · Acme Robotics — Updated billing address" · Yesterday
5. NEW EXEC ONBOARDED · "Helena Cho (CMO, Brightline) joined the network" · 2 days ago
+ 1 hidden: SYNC FAILURE on Calendly integration (referenced in footer count, not shown in top 5)

## What's NOT designed in this pass (deferred)

- **Mark-all-read confirmation state** — after clicking Mark all read, brief animation/transition to the empty state. Visual deferred; build chat handles.
- **Per-row overflow menu expanded** — the "..." menu's expanded popover with Mark this read / Snooze / Go to source / Dismiss actions. Inherited pattern from Inbox row overflow; render deferred.
- **Snooze date picker** — when Snooze is clicked, a small calendar picker appears. Deferred.
- **Notification preferences page** — `/admin/settings/notifications` cog link points here, but that page is a future Settings sub-tab.
- **Vendor and Exec portal versions** — the popover lives in the shared topbar, but each portal's bell will surface different notification types. Vendor/exec content variants deferred.
- **Error state** — failed notification fetch with retry. Deferred (rare; the bell stays grey and the dropdown shows a simple "Couldn't load notifications · Retry" line).

## Issy's fixes applied

None — landed cleanly on first iteration.

## Open decisions (not silently resolved)

- **Timestamp visibility on hover** — currently the row's hover state shows the "..." overflow icon and the timestamp disappears under it. Build chat can refine: show BOTH timestamp + overflow on hover by stacking them or repositioning. Visual choice.
- **Sync failures rendering position** — currently hidden from the top 5 (referenced in footer count). Consider surfacing sync failures persistently at the top if they're critical (Gmail / Calendar / MYOB outages). Deferred.
- **Per-portal notification mix** — admin sees all types; vendor sees vendor-relevant (request status updates, billing alerts); exec sees exec-relevant (meeting requests, charity choice prompts). The per-portal mix is deferred until vendor/exec portals are designed.
- **Wordmark** parked across all locked screens.

## Click flow

Topbar `bell icon` click → opens popover anchored top-right under the bell.

Inside the popover:
- Click any notification row → navigates to the source page (inbox conversation, meeting detail, gift record, etc.).
- Click "..." overflow on a row → opens per-row action menu (Mark this read / Snooze / Go to source / Dismiss).
- Click "Mark all read" (header right) → marks all as read, transitions to the empty state, bell amber dot clears.
- Click "GO TO INBOX →" (footer left) → navigates to `/admin/inbox`.
- Click cog icon (footer right) → navigates to `/admin/settings/notifications`.
- Click outside / Esc / click the bell again → closes the popover.

Bell amber dot appears whenever there's at least one unread notification; clears when all are read (or all dismissed/snoozed).
