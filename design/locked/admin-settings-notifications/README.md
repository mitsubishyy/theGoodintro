# Admin Settings · Notifications tab — LOCKED 2026-06-05 (pending the wordmark call)

Designed in Claude Design 2026-06-05. Per-user preferences for HOW and WHEN
Issy receives notifications across channels (in-app dropdown, email digest,
Slack). The Notification dropdown's cog footer link points here.

Inserted as a new tab between **AI** and **Feature flags** in the locked
Settings tab strip. Inherits every pattern from the Settings · AI tab lock
(toggle pill, DEFAULT/CUSTOM chips, sticky save bar, sage tint for read-only
system-rules content).

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Admin Settings Notifications" → File > Export HTML |
| `screenshot-default.png` | TO DROP | VP1 — Loaded with defaults |
| `screenshot-modified.png` | TO DROP | VP2 — 3 settings changed, sticky save bar visible |
| `screenshot-loading.png` | TO DROP | VP3 — 6 skeleton section cards |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md).
2. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) §"Admin Settings · Notifications tab" + Global decisions for Toggle pill.
3. [`../admin-settings/README.md`](../admin-settings/README.md) — locked Settings shell (Pass 1).
4. [`../admin-settings-ai/README.md`](../admin-settings-ai/README.md) — sibling AI tab; same patterns inherited.
5. [`../notification-dropdown/README.md`](../notification-dropdown/README.md) — the dropdown this tab configures.
6. [`../../../ADMIN_INBOX_SPEC.md`](../../../ADMIN_INBOX_SPEC.md) §10-§11 — system-rules content surfaced in the sage block.
7. Open `screen.html` + 3 screenshots.

## What is locked

### Tab strip update
Settings tab order is now: **Account · Security · Integrations (default) · Email signatures · AI · Notifications · Feature flags · Staff [soon]**. Notifications inserted between AI and Feature flags.

### Six sections (max-width 720px column)

1. **WHERE TO BE NOTIFIED** ("Channels") — three rows: In-app bell dropdown toggle (default ON) · Email digest select (None / Daily 08:00 AEST / Weekly Monday 08:00 / Custom, default Daily) · Slack toggle DISABLED with "Connect Slack in Integrations to enable" helper + "Configure →" ghost link to /admin/settings/integrations. DEFAULT/CUSTOM chips per row.

2. **WHAT TO BE NOTIFIED ABOUT** ("Per-type preferences") — 6-row table with TYPE column (mono uppercase + leading icon) + IN-APP / EMAIL / SLACK toggle columns. Each cell uses the smaller 24×14 toggle pill variant for table density. SLACK column uniformly DISABLED with "Connect Slack to enable" sub-helper. Rows:
   - UNREAD INBOX — In-app ON · Email ON · Slack disabled
   - MEETING MOVE REQUESTED — In-app ON · Email ON · Slack disabled
   - GIFT OVERDUE — In-app ON · Email ON · Slack disabled
   - NEW VENDOR ONBOARDED — In-app ON · Email OFF · Slack disabled
   - NEW EXEC ONBOARDED — In-app ON · Email OFF · Slack disabled
   - SYNC FAILURE — In-app ON (locked, padlock right of toggle) · Email ON (locked, padlock) · Slack disabled
   
   Aggregate chip top-right: DEFAULT (when no overrides) / "N OVERRIDE" amber chip (when N cells have been changed). Cells changed from default show a small "·" dot beneath them.

3. **QUIET HOURS** ("When to hold non-urgent notifications") — toggle (default ON) + two time inputs ("19:00" to "08:00" + "AEST" label, default). Helper: "Urgent notifications (sync failures, overdue payments) bypass quiet hours and arrive immediately."

4. **AUTO-SNOOZE RULES** ("Reduce noise when not directly involved") — toggle (default OFF) "Snooze notifications if I'm not assigned" + helper "When ON, you only get notified about conversations and meetings explicitly assigned to you. Counts and badges still update in the sidebar."

5. **USAGE THIS WEEK** ("28 May - 4 June 2026", read-only stats) — Notifications received 47 / Notifications opened (clicked through) 38 (81%) / Notifications dismissed 9 / Notifications snoozed 0. "View full breakdown →" ghost link (destination deferred).

6. **SYSTEM RULES** ("What the system handles automatically", SAGE-tinted read-only block) — Mono "LOCKED · NOT USER-CONFIGURABLE" + 5 bullets:
   - Sync failures notify immediately on all enabled channels regardless of quiet hours.
   - Gift overdue notifications fire at 7 days and again at 14 days awaiting payment.
   - Meeting move requests notify immediately because they need a fast reply.
   - Unmatched inbox conversations notify hourly until linked to a vendor or executive.
   - Read receipts and "message sent" confirmations are never surfaced as notifications. Check the inbox thread directly.
   
   11px note: "These rules are enforced in code, not by user setting. See ADMIN_INBOX_SPEC.md §10 and §11."

### Three states designed
- **VP1 LOADED (defaults)** — all default values, all chips DEFAULT, no save bar.
- **VP2 MODIFIED (3 settings changed)** — Email digest changed to "Weekly Monday at 08:00 AEST" (CUSTOM) · UNREAD INBOX Email toggle OFF (table shows "1 OVERRIDE" aggregate chip + small dot under the changed cell) · Quiet hours range changed to 21:00 - 07:00 (CUSTOM). Sticky save bar visible: "3 UNSAVED CHANGES · View diff" left + Discard + Save changes right + helper "Changes apply to your future notifications immediately after save."
- **VP3 LOADING** — 6 skeleton section cards matching loaded anatomy + 6-row skeleton table for Section 2.

## What's NOT designed (deferred)
- "View full breakdown" destination page.
- Save confirmation toast / modal.
- Slack-connected state (currently disabled). Once Slack is connected, all Slack toggles become enabled with their own DEFAULT values.
- Per-channel quiet-hours overrides (e.g. quiet hours apply to email but not in-app).
- Mobile layout.

## Issy's fixes applied
None this pass — landed cleanly on first iteration.

## Known cosmetic drift (build strips during port)
VP2 has a duplicate STATE annotation row at the top with an UNSAVED amber pill (in addition to the canonical bottom STATE row with VIEWING NOW pill). Same drift pattern as Meeting detail + AI tab. Single STATE row at the bottom is the locked pattern; build chat strips the top one during port.

## Open decisions
- "View full breakdown" destination — design deferred.
- Per-channel quiet-hours overrides — could be added if needed.
- Wordmark parked across all locked screens.

## Click flow
`Sidebar / Settings` → `/admin/settings` → click "Notifications" tab → `/admin/settings/notifications` (this screen). Save changes → AI/notification routing updates immediately.
