# Admin Settings (shell + Integrations tab + Gmail OAuth drawer) — LOCKED

Designed in Claude Design 2026-06-03. Multi-tab settings shell with the
Integrations tab content + the Gmail OAuth connect drawer (the first
integration's connect flow). This page locks the shell pattern every future
settings sub-tab inherits (Account, Security, Email signatures, Feature flags,
Staff — all deferred to later passes).

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Admin Settings" → File > Export HTML, drop here |
| `screenshot-integrations-loaded.png` | TO DROP | Integrations tab loaded (CONNECTED + AVAILABLE) |
| `screenshot-gmail-drawer.png` | TO DROP | Gmail connect drawer (all 3 steps + footer) |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md), [`../../../CALCULATIONS.md`](../../../CALCULATIONS.md).
2. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) §"Admin Settings (shell + Integrations tab + Gmail OAuth drawer)".
3. [`../../../PORTAL_LAYOUT_BLUEPRINT.md`](../../../PORTAL_LAYOUT_BLUEPRINT.md) for the shell shell, tokens, density.
4. [`../../../GMAIL_INTEGRATION_CONTRACT.md`](../../../GMAIL_INTEGRATION_CONTRACT.md) — the contract this drawer drives. Especially §3 (OAuth + scopes), §3.3 (sensitive-scope verification, CASA Tier 2), §5 (token storage).
5. [`../../../PRODUCTION_READINESS.md`](../../../PRODUCTION_READINESS.md) — Google verification is a pre-launch blocker tracked there.
6. Open `screen.html` plus screenshots.

## What is locked

### Page shell (every future settings tab inherits this)
- Page header: breadcrumb Home / Settings / {tab-slug} (mono 11px), H1 "Settings". NO count beside H1 (settings isn't a queue). NO action button on the page header itself.
- **Tab strip** (40px tall, hairline divider below, sticky as user scrolls): tabs as text labels with 32px gap, ink underline (2px) under the active tab, muted label for inactive. Tabs in order: Account · Security · Integrations (default selected) · Email signatures · Feature flags · Staff (with "soon" mono uppercase pill in soft amber).
- Clicking a tab changes the URL to `/admin/settings/{tab-slug}` and swaps the content area below.
- Sidebar: Settings item already exists at the bottom of CONFIGURE; selected on this page (gold left-bar indicator + slightly darker background). **No sub-items expand under Settings in the sidebar** — the tab strip inside the page IS the sub-navigation.

### Integrations tab content (the only tab designed in this pass)
Two sections stacked vertically:

**CONNECTED** — 4 active:
- **Gmail** (32px logo) · "Connected as hello@thegoodintro.com" · Status pill "Connected" (gold dot). SCOPES: GMAIL.READONLY · GMAIL.SEND · GMAIL.MODIFY · GMAIL.LABELS. Manage / Disconnect. Last sync 2 minutes ago.
- **Google Calendar** (32px logo) · "Read free/busy on 12 calendars" · Status pill "Connected". SCOPES: CALENDAR.EVENTS.READONLY · CALENDAR.FREEBUSY. Last sync 8 minutes ago.
- **Zoom** (32px logo) · "Generates meeting links as TheGoodIntro" · Status pill "Connected". SCOPES: MEETING.WRITE. Last sync 1 hour ago.
- **Xero** (32px logo) · "Posts invoices to TheGoodIntro Pty Ltd" · Status pill "Connected · token expiring" (amber dot). SCOPES: ACCOUNTING.TRANSACTIONS · ACCOUNTING.CONTACTS. Amber inline warning banner: "OAuth token expires in 6 days. Reconnect to avoid disruption." Last sync 23 minutes ago.

**AVAILABLE** — 5 to connect:
- Microsoft Teams · "Generate meeting links for executives who prefer Teams" · "Connect" ink primary button.
- Microsoft Outlook / Graph Calendar · "Read free/busy for executives on Microsoft 365" · "Connect".
- Resend (RES abbreviation chip) · "Transactional email sender for request loop emails and notifications" · "Connect".
- Calendly · "Surface Issy's calendar for vendor vetting calls and exec onboarding" · "Connect".
- Slack · "Post operational alerts to a channel (failed sync, unmatched conversation, gift overdue)" · "Connect".

Integration card anatomy (LOCKED):
- Top row: 32px logo (or mono uppercase 3-letter abbreviation chip if no logo) · provider name (Inter 13px semibold) · status pill on the right.
- Sub-line below the name: Inter 13px muted (e.g. "Connected as hello@thegoodintro.com").
- Bottom row inside the card: SCOPES eyebrow + horizontal list of granted scopes as small soft-amber mono pills; Manage / Disconnect buttons on the right (or "Connect" primary ink button if in AVAILABLE section).
- Card padding 20px all sides. Card vertical gap 16px between cards. Hairline border at --portal-line.

### Gmail OAuth connect drawer (the first integration's connect flow)
- Triggered by clicking "Connect" on the Gmail card in AVAILABLE (or "Reconnect" if Gmail's status is "Connection lost").
- 600px wide, slides in from the right edge of the page, dimmed backdrop (30% black). Hairline left border. Same drawer pattern as Pay batch on Giving.
- ESC, clicking X, clicking the dimmed backdrop all close the drawer.

**Drawer header** (sticky, 64px tall): mono uppercase "CONNECT GMAIL" + subtitle "Authorise the platform to send and receive email from one dedicated business mailbox." + close X top-right.

**Drawer body** (scrollable):

- **STEP 1 OF 3 MAILBOX CHOICE**: helper text, typeahead "Mailbox address" pre-filled with hello@thegoodintro.com, helper below about the mailbox being a real Workspace user (not an alias or group).
- **STEP 2 OF 3 SCOPES**: four scope rows with plain-language descriptions (GMAIL.READONLY — "Read incoming messages so they appear in the Admin Inbox.", GMAIL.SEND — "Send outbound emails on behalf of the mailbox.", GMAIL.MODIFY — "Apply labels and mark messages read/archived; never delete.", GMAIL.LABELS — "Create and manage operational labels (OPEN / RESOLVED / AWAITING-VENDOR / AWAITING-EXEC / UNMATCHED / PLATFORM_SENT)."). Closing paragraph: "These are the standard scopes for a shared-inbox connector. They're what Google's review team expects. They do not include permanent delete."
- **STEP 3 OF 3 GOOGLE VERIFICATION**: bordered summary card with three divider-separated rows:
  - SENSITIVE-SCOPE VERIFICATION / Required (CASA Tier 2 assessment)
  - LEAD TIME / 6 to 10 weeks
  - COST / AUD 6,000 to 15,000 + "Handled outside the platform." sub-line
  
  Helper paragraph below the card: "Until verification completes, the OAuth client runs in Testing mode and is limited to 100 test users. You (the connecting user) are the only test user needed, so the integration works for you immediately. Going to Production mode (so any executive or vendor can interact with the platform mailbox) is hard-blocked by Google until verification passes."
  
  Ghost link below the helper: "View verification status →" with external-link icon. Links to https://console.cloud.google.com/apis/credentials in a new tab.

**Drawer footer** (sticky, 88px tall, hairline above):
- Left: status indicator (gold dot + "Mailbox chosen. Ready to authorise." in the default state).
- Right: ghost "Cancel" + primary ink "Authorise with Google →" with the Google "G" logo as leading icon.
- 11px muted helper below the primary button: "Opens Google's consent screen in a new tab. You'll be redirected back here when complete."

### STATE annotation rows
- "STATE · DEFAULT — Integrations tab loaded with Gmail / Calendar / Zoom / Xero connected. Five providers available to connect." with VIEWING NOW pill (on the Integrations tab default viewport).
- "STATE · CONNECT DRAWER — Gmail OAuth flow, three steps before authorising" with DRAWER pill (on the drawer viewport).

## What's NOT designed in this pass (deferred to future iterations)

- Account tab content
- Security tab content
- Email signatures tab content
- Feature flags tab content
- Staff tab content
- OAuth flows for non-Gmail providers (Calendar, Zoom, Teams, Xero, Resend, Calendly, Slack) — each gets its own drawer designed when wired

Those will be specced in future passes. This viewport locks the SHELL + Integrations tab + Gmail drawer as the reference patterns; the others inherit.

## Issy's fixes applied (2026-06-03 fix pass)

- Step 3 GOOGLE VERIFICATION added to the Gmail OAuth drawer (between Step 2 closing paragraph and the sticky footer). First fix prompt didn't land cleanly; second more aggressive fix prompt did. Below-the-fold positioning meant first set of screenshots didn't visually confirm it.

## Open decisions (not silently resolved)

- **Each future tab's content** (Account, Security, Email signatures, Feature flags, Staff) needs its own design pass. Use this shell as the reference.
- **OAuth drawer pattern** generalises beyond Gmail — non-Gmail providers (Calendar, Zoom, Teams, Xero, Resend, Calendly, Slack) reuse this 3-step pattern (Mailbox/Account → Scopes → Verification/Setup → Authorise footer). Each gets its own drawer designed when wired in.
- **CASA Tier 2 assessor** (Section 16 of GMAIL_INTEGRATION_CONTRACT.md) — three Google-approved assessors at AU pricing: Leviathan Security, Bishop Fox, Schellman. Issy picks based on quote and lead time. Pre-launch blocker.
- **Wordmark** ("The Good Intro" three words vs locked "TheGoodIntro" one word) parked across all locked screens.

## Click flow into this screen

`Sidebar / Settings` → `/admin/settings` → defaults to `/admin/settings/integrations` (Integrations is the default tab). Tab clicks change the URL. Clicking "Connect" on any AVAILABLE integration opens that provider's connect drawer (only Gmail's is designed; others inherit the pattern).
