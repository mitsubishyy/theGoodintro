# Admin New Meeting form — LOCKED

Designed in Claude Design, originally PARKED 2026-05-29 pending the
Zoom/Teams scheduling decision, unparked and LOCKED 2026-06-02 after the
video-platform selector pattern was added. T5 form template.

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Admin New Meeting" → File > Export HTML, drop here |
| `screenshot-loaded.png` | TO DROP | Drag from clipboard to this folder |
| `screenshot-loading.png` | TO DROP | Same |
| `screenshot-error.png` | TO DROP | The FIELD STATES row demonstrates error/disabled inline, but also drop a full-page error state if designed |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md), [`../../../CALCULATIONS.md`](../../../CALCULATIONS.md),
   [`../../../DATA_MODEL.md`](../../../DATA_MODEL.md), [`../../../STATE_MACHINES.md`](../../../STATE_MACHINES.md).
2. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) §"Admin New Meeting (T5)".
3. [`../../../PORTAL_LAYOUT_BLUEPRINT.md`](../../../PORTAL_LAYOUT_BLUEPRINT.md) §T5 template rules.
4. [`../../../ADMIN_PORTAL_BRIEF.md`](../../../ADMIN_PORTAL_BRIEF.md) §Meetings.
5. [`../../../PLATFORM_WORKFLOWS.md`](../../../PLATFORM_WORKFLOWS.md) for the meeting creation workflow context.
6. Open `screen.html` plus the screenshots in this folder.
7. Reference the locked Admin New Executive form for the matching T5 register (mono uppercase section headers, two-column field grid, FIELD STATES row, sticky bottom action bar).

## What is locked

- Two-pane layout: form on the left, live calendar-invite preview on the right (dark band styling matching the locked dashboard ribbon).
- Page header: breadcrumb Home / Meetings / New meeting, H1 "New meeting", muted helper line ("Fill in the essentials, see the invite take shape, then send...").
- DETAILS section header (mono uppercase) with right-aligned caption "Everything in the invite".
- **Executive picker** with sample exec Priya Raghavan, CFO at Lumen Industries. Sub-line under selected exec: "Accepted 14 May · AEST time · gift to Royal Flying Doctor Service".
- **Vendor picker** with sample vendor Acme Robotics, VEN-1044, 2 credits. Helper "2 credits available".
- **WHY THIS MEETING** section showing the vendor's request answers as Q&A (Q1 "Who do you want to meet?" / Q2 "Why this person, specifically?"). Includes "Show more" to expand additional Qs.
- **Date** field rendering as long format ("3 Jun 2026"), not numeric ("03/06/2026").
- **TIME AND LENGTH** section: Start (10:30 am) + Length (30 minutes) side-by-side. Helper line: "Ends 11:00, in the executive's timezone." Below: green "Executive is free at this time" inline confirmation.
- **Meeting link** section: video-platform segmented selector (ZOOM default selected · TEAMS · GOOGLE MEET), generated link displayed read-only (e.g. `us02web.zoom.us/j/87654321023`), Regenerate button on the right. Helper line: "Created automatically when the invite is sent. Uses the executive's preferred video platform."
- **Charity** section: standing-charity chip showing Royal Flying Doctor Service · Standing charity · DGR endorsed · ABN 74 438 059 643. Action: "Override for this meeting".
- **RECIPIENTS** section: auto-populated rows for Executive (priya@lumenindustries.com), Executive EA (lena@lumenindustries.com), and both Vendor contacts (sam@ and rosa@acmerobotics.com). Each row has a remove (x) action. "+ Add recipient" button below.
- **Message** field (OPTIONAL) for a short note included in the invite.
- **FIELD STATES** row at the bottom demonstrating default / focused (focus ring) / error (red border + helper "Pick a valid future date") / disabled (ghosted) for time and date inputs.
- **Right pane (CALENDAR INVITE preview):** dark band, title "Intro: Acme Robotics and Priya Raghavan", date/time string "Wednesday 3 Jun, 10:30 to 11:00 AEST", VIDEO LINK row matching selected platform, ATTENDEES row (4 avatars, named in the row above), GIFT TO CHARITY row showing Royal Flying Doctor Service, CREDIT segmented toggle "Has credit / No credit" (Has credit selected), and a pill at the bottom: "1 credit reserved on send, $1,500". Helper line below the pill: "The charity gift amount is set when the meeting is held, based on the vendor's band at that time."
- **Sticky bottom action bar:** left side shows "INVITE NOT SENT" status text in mono. Right side: "Save as proposed (no time yet)" ghost button, "Cancel" ghost button, "Send invite" primary ink button with paper-plane icon.

## Money rules in this form (hard)

- The credit pill "1 credit reserved on send, $1,500" is the only money figure on this form. A credit is locked at $1,500 flat per the locked CALCULATIONS rule. Do NOT add a charity-amount figure here; the gift amount is frozen at booking-time-of-Held, not at invite-send time. The helper line on the right pane states this explicitly.
- The "Save as proposed (no time yet)" path does NOT reserve a credit. The credit reservation pill should reflect "1 credit will reserve when a time is set" or similar in the Proposed-state preview.

## Issy's changes from the original prompt (2026-06-02 fix pass)

These changes were applied in the 2026-06-02 fix pass:
- Executive sample updated to match locked sample data (Lumen Industries, RFDS, lumenindustries.com email domain).
- Charity replaced (was "The Smith Family", now Royal Flying Doctor Service with ABN).
- Date format changed (was "03/06/2026" ambiguous, now "3 Jun 2026" long format).
- Meeting link section redesigned: was a custom `meet.thegoodintro.com` URL, now a Zoom/Teams/Google Meet segmented selector with a real-looking platform URL.
- All sample email domains aligned (lumenindustries.com, acmerobotics.com).
- WHY THIS MEETING Q&A answers updated to match the locked Admin Meeting detail Vendor side module's REQUEST text, so the same meeting reads consistently across both screens.

## Open decisions (not silently resolved)

- **Video platform selection.** The selector now offers Zoom / Teams / Google Meet. The default selected reflects the executive's preferred platform (set on their profile, see Admin Executive detail § Calendar & EA). Confirm the v1 platform list and whether the user can change platform per-meeting (current design: yes, by clicking the segment). The deeper question of whether TheGoodIntro runs its own video infrastructure (Daily.co, Whereby, etc.) is OUT of scope for v1; pick from existing providers.
- **"Save as proposed (no time yet)" credit semantics.** When saved without a time, does the credit lock-in? Current design implies it doesn't (the language "reserved on send" reads as bound to a confirmed time). Build chat: confirm that proposed meetings without a time do NOT decrement available credits.
- **Per-recipient role mismatch.** "Lena Park · EXECUTIVE EA" — confirm whether the EA always receives the calendar invite by default, or whether it's opt-in per the executive's profile.
- **Wordmark** ("The Good Intro" three words vs locked "TheGoodIntro" one word) parked across all locked screens.

## Click flow into this screen

`Sidebar / Meetings` → `/admin/meetings` (locked T3 list) → primary "+ New meeting" button → this form. On Send invite → meeting record is created → user is redirected to `/admin/meetings/{id}` (the Admin Meeting detail page).

On Save as proposed → same redirect target, but the meeting lands in the Meeting detail's Proposed state (the variant designed in the Meeting detail prompt).
