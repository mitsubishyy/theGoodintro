# theGoodintro — Admin Inbox Specification

> **READ FIRST.** This is the build-ready specification for the Admin Inbox
> screen in the platform's admin portal. It is the screen where Issy reads and
> replies to every email that lands in the platform mailbox, with AI-assisted
> drafting grounded in the platform's data about the sender. Companions:
> [`GMAIL_INTEGRATION_CONTRACT.md`](GMAIL_INTEGRATION_CONTRACT.md) (the data
> layer that feeds this screen) and
> [`MESSAGING_AI_DRAFT_SPEC.md`](MESSAGING_AI_DRAFT_SPEC.md) (the AI Prompt
> drawer that this screen opens). Layout rules in
> [`PORTAL_LAYOUT_BLUEPRINT.md`](PORTAL_LAYOUT_BLUEPRINT.md) (HR Partner
> density, `--portal-*` tokens, no marketing illustrations) WIN on any visual
> conflict.

## 0. One-paragraph summary (for the non-technical reader)

The Admin Inbox is a clean, dense, two-pane email screen: a list of
conversations on the left and the open thread on the right. There is no
filter rail (filters are hidden behind a "Filter" button), no settings panel,
no clutter at the top. Every conversation is linked to the vendor or
executive it concerns, so when Issy clicks a thread she also sees their
band, credits, last meeting, charity, and other context in a compact
identity card. The composer at the bottom has two modes (Reply, Internal
Note); when Internal Note is active, an extra "AI Prompt" button appears,
which opens a side drawer with all the data points the AI is using to draft
a reply (band, history, request answers, conversation context, suggested
draft). Issy reviews, edits, and clicks Send. Nothing auto-sends. Nothing
talks to the customer without her finger on the trigger.

## 1. Scope

### 1.1 In scope

- The `/admin/inbox` route in the admin portal.
- The conversation list (left pane).
- The thread reading pane (right pane).
- The identity card at the top of the reading pane.
- The composer (Reply / Internal Note / AI Prompt trigger).
- Filters, search, bulk actions, keyboard navigation.
- All three render states (empty, loading, error).
- Two-way sync visual indicators (from Gmail / sent via platform).
- Unmatched conversation handling.
- Notification badge in the topbar bell.

### 1.2 Out of scope (covered elsewhere)

- The Gmail OAuth flow, sync engine, threading, send mechanics, label
  management: [`GMAIL_INTEGRATION_CONTRACT.md`](GMAIL_INTEGRATION_CONTRACT.md).
- The contents of the AI Prompt drawer (prompt construction, data point list,
  audit log, draft handoff to composer):
  [`MESSAGING_AI_DRAFT_SPEC.md`](MESSAGING_AI_DRAFT_SPEC.md).
- The shared portal shell (sidebar, topbar, account block, page frame):
  [`PORTAL_LAYOUT_BLUEPRINT.md`](PORTAL_LAYOUT_BLUEPRINT.md) §2 and
  [`UI_KIT_BRIEF.md`](UI_KIT_BRIEF.md).
- Notification email templates: [`NOTIFICATION_TEMPLATES.md`](NOTIFICATION_TEMPLATES.md).
- Vendor and executive profile pages (linked from the identity card):
  [`ADMIN_PORTAL_BRIEF.md`](ADMIN_PORTAL_BRIEF.md) §Clients.

### 1.3 Design philosophy (the rule Issy named on 2026-05-31)

**Progressive disclosure: hide updates behind buttons.** The header MUST stay
clean. Filters, system status, bulk actions, advanced search, and per-row
overflow menus all live behind small explicit buttons. The default view shows
only what is needed to do the next thing. This is a portal-wide principle
(see [`PORTAL_LAYOUT_BLUEPRINT.md`](PORTAL_LAYOUT_BLUEPRINT.md) §1.2 once
updated); it applies to every future screen, not just this one. The reference
density is HR Partner.

The composer mirrors this rule: Reply / Internal Note is the default visible
toggle; AI Prompt is a secondary action that appears only when Internal Note
is active, so it never crowds the primary action.

## 2. Route, position, and entry points

- **Route:** `/admin/inbox`.
- **Sidebar position:** under COMMUNICATION, item "Inbox", count badge = open
  conversations needing a reply. See [`ADMIN_PORTAL_BRIEF.md`](ADMIN_PORTAL_BRIEF.md)
  §Sidebar.
- **Topbar bell badge:** amber dot when there is at least one unread or
  unassigned `open` conversation; clicking opens a small panel that lists the
  most recent 5 and links to the inbox.
- **Deep links:**
  - `/admin/inbox/{conversation_id}` opens that conversation in the reading
    pane and scrolls the list to it.
  - `/admin/inbox?filter=unassigned` (and similar) pre-applies a filter.
  - Vendor/exec profile pages link to `/admin/inbox?vendor={id}` (or
    `exec={id}`) to show all conversations for that record.

## 3. Page frame and topbar

### 3.1 What is on the page top (and what is NOT)

The Admin Inbox page top has exactly four elements, left to right:

1. **Breadcrumb / H1.** `Home / Inbox` breadcrumb in 11px mono uppercase, H1
   "Inbox" in 18-20px Inter semibold. To the right of the H1, a small mono
   count: `42 open / 168 all` (live).
2. **Filter button.** Single button with the filter icon and the active filter
   count as a small amber pill if any are active (e.g. "Filter • 2"). Clicking
   opens the Filter popover (Section 6.2).
3. **New conversation button.** Outline pill button labelled "+ New". Opens
   the new conversation composer (Section 8).
4. **Right side:** nothing inbox-specific. The portal-wide topbar (global
   search, bell, avatar) is the shared shell from
   [`PORTAL_LAYOUT_BLUEPRINT.md`](PORTAL_LAYOUT_BLUEPRINT.md) §2.

### 3.2 What is NOT on the page top (explicit anti-list)

The following must NOT appear at the top of the Admin Inbox, even though they
might in other tools:

- A system-status pill ("All systems operational"). System status belongs
  inside the bell menu, not as a constant pill.
- Tabbed segments (All / Unassigned / Mine / Unanswered). These move behind
  the Filter button.
- A toolbar of bulk actions. Bulk actions only appear after a row is checked
  (Section 6.5).
- A view-switcher (list / split / compact). One view only.
- Mark up / Edit / Tweaks / Comments controls (those are Claude Design's
  preview tools; they do not exist in the real product).
- A "Preview State: Loaded / Loading / Empty / Error" switch (same as above).

The composer-state preview controls in the Claude Design mockup are NOT to
be reproduced in the real build. They are tooling for design iteration only.

## 4. Two-pane layout

### 4.1 Geometry

Desktop (≥1024px):

```
┌─ Sidebar (240px) ─┬─ Topbar (56px) ──────────────────────────────────┐
│                   ├──────────────────────────────────────────────────┤
│                   │ H1 + filter + New                       ...      │
│                   ├─────────────────┬────────────────────────────────┤
│                   │                 │                                │
│                   │ Conversation    │ Reading pane                   │
│                   │ list            │                                │
│                   │ (380px)         │ (fills remaining width)        │
│                   │                 │                                │
│                   │                 │                                │
└───────────────────┴─────────────────┴────────────────────────────────┘
```

Tablet (768-1023px): same layout, list narrows to 320px.

Mobile (<768px): list and reading pane are separate routes. `/admin/inbox`
shows the list; tapping a row navigates to `/admin/inbox/{id}` for the
reading pane with a back arrow. Mobile is not the primary surface; Issy
runs the platform on desktop.

### 4.2 Splitter

The vertical divider between list and reading pane is a draggable splitter,
range 320-560px. Position persists per user in localStorage. Default 380px.

### 4.3 Empty reading pane (no conversation selected)

When no conversation is selected (first load, after closing a thread, etc.),
the reading pane shows:

- Centred empty illustration (use the existing `--portal-amber` outline
  illustration from the UI kit; no marketing illustrations).
- Heading: "Select a conversation to read it."
- Sub-line in muted text: "Or press `J` to open the first one."

If the conversation list itself is empty (no inbound yet), show a different
empty state: "No conversations yet. They'll appear here as soon as someone
emails {platform_mailbox}." (Substitute the live mailbox address.)

## 5. Conversation list (left pane)

### 5.1 Row structure

Each row is 76px tall (denser than the current mockup's 96px). Structure:

```
┌─ Row ────────────────────────────────────────────────────────┐
│ [avatar] Vendor / Exec name   [vendor|exec badge]   2h ago  │
│          Subject line, truncated to one line with ellipsis  │
│          Snippet of latest message, truncated, 13px muted   │
│          [unread dot]                       [status pill]   │
└──────────────────────────────────────────────────────────────┘
```

Field details:

- **Avatar (40px round):** vendor company logo if present, else initials on
  the `--portal-amber-soft` background. For execs, the executive photo if
  uploaded, else initials. For unmatched conversations, a generic envelope
  icon on muted grey.
- **Name:** the linked record's name in Inter semibold 14px. For unmatched,
  show the From address.
- **Record type badge:** small mono uppercase pill, 10px, `VENDOR` (amber-soft
  background) or `EXEC` (emerald-soft, but only on this single use; sidebar
  emerald rule otherwise applies; if it conflicts with the blueprint after
  review, fall back to `--portal-amber-soft`). For unmatched: `UNMATCHED`
  (muted grey).
- **Time:** relative, right-aligned, 12px muted. `2h ago`, `Yesterday`,
  `Tue 14:30`, `12 Mar`.
- **Subject:** Inter regular 13px, one line, ellipsis.
- **Snippet:** Inter regular 13px, muted, one line, ellipsis. From the latest
  message's plain-text body.
- **Unread dot:** 8px amber circle on the left edge of the row, only when
  `unread_count > 0`.
- **Status pill (right of row, only when not `open`):** mono 10px uppercase.
  `WAITING` (muted), `RESOLVED` (emerald-soft, faded), `ARCHIVED` (grey).
  Open conversations show no pill (open is the default; clutter-free).

### 5.2 Selection and hover

- Hover: row background `--portal-card-hover`, full row clickable.
- Selected row: left edge has a 3px amber bar, background `--portal-card-selected`.
- Selecting a row updates the URL (`/admin/inbox/{id}`) and the reading pane.

### 5.3 Bulk select

Hovering over a row reveals a checkbox on the left of the avatar. Clicking
the checkbox enters bulk-select mode. The conversation list header swaps from
"42 open / 168 all" to a count of selected rows plus bulk action buttons
(Section 6.5).

### 5.4 List header

A thin (40px) sticky header above the rows:

- Left: when no rows selected, the count text. When rows are selected, the
  bulk actions.
- Right: small sort menu button. Sort options: Newest first (default), Oldest
  first, Unread first, By status, By assignee. Choice persists per user.

### 5.5 Search within list

Above the list header, a search input (full width of the list pane):

- Placeholder: "Search conversations".
- Debounced 200ms.
- Searches: subject, snippet, linked record name, from address.
- Results filter the list inline (no separate results page).
- Pressing Esc clears the search.
- Cmd/Ctrl+F focuses this input from anywhere in the page.

### 5.6 Pagination / infinite scroll

The list lazy-loads 50 conversations at a time. Scrolling to within 200px of
the bottom triggers the next page. A "Load more" button as a fallback when
auto-load fails three times in a row. Never an unbounded fetch.

### 5.7 List states

- **Empty (no conversations match the current filter):** small centred message,
  "No conversations match this filter." Plus a "Clear filter" button if any
  filters are active.
- **Loading (first fetch or filter change):** skeleton rows (5 of them), each
  at the real row height, with shimmering placeholders for avatar, name,
  subject, snippet.
- **Error:** the list area shows "Couldn't load conversations. Retry" with a
  retry button. The reading pane is unaffected; if a conversation is open it
  remains visible.

## 6. Filters, bulk actions, and search (the "behind buttons" surface)

### 6.1 The filter button

A single button at the top of the page, labelled "Filter" with the active
count as an amber pill suffix when any filters are active (e.g. "Filter • 3"):

- Default state: outline button, no fill.
- Active state (any filter applied): subtle amber border.
- Clicking opens the Filter popover (a 360px-wide panel anchored below the
  button).

### 6.2 Filter popover contents

The Filter popover is a single panel with grouped sections; nothing is
exposed by default outside it. Sections, all collapsible:

| Section | Options |
|---|---|
| **Status** | Open (default on), Waiting, Resolved, Archived. Multi-select. |
| **Assignment** | All, Unassigned, Mine, Specific user (typeahead). |
| **Read state** | All, Unread only. |
| **Channel** | Email (default on). Future: Slack, WhatsApp, in-app. |
| **Sender type** | All, Vendor, Executive, EA, Unmatched. |
| **Linked vendor** | Typeahead, multi-select. |
| **Linked executive** | Typeahead, multi-select. |
| **Date range** | All time (default), Last 7 days, Last 30 days, Custom. |
| **Has AI draft** | Off (default), On (only conversations with a pending AI draft). |
| **Has internal note** | Off (default), On. |

Footer of the popover: "Apply", "Save as view" (saves the current filter set
under a name), "Clear all". A "Saved views" list at the top of the popover
shows the user's saved views. The default state is `Status: Open`.

Filters are reflected in the URL as query params (`?status=open,waiting&assignee=me`)
so views are shareable.

### 6.3 What is NOT a filter

- The system bell badge (notifications, not filters).
- The conversation status in the row (a display, not a filter you toggle from
  the row).
- The view-by-vendor entry from the vendor profile page (it pre-applies a
  filter via URL, not a toggle).

### 6.4 Saved views

A user can save a filter combination under a name. Saved views appear at the
top of the Filter popover and (optionally, per user setting) in the sidebar
as a sub-item under Inbox. Default saved views, seeded for Issy:

- **Needs reply**: status=open, awaiting=issy, sort=newest.
- **Waiting on them**: status=waiting, sort=oldest.
- **Unmatched**: match_status=unmatched.
- **Today**: date=today, status=open.

### 6.5 Bulk actions

When at least one row is checked, the list header swaps into bulk mode:

- A count: "3 selected".
- Buttons: Assign to..., Mark read, Mark unread, Mark resolved, Archive,
  Apply label, Cancel.
- Cancel exits bulk mode.

Each action confirms with a small toast: "3 conversations resolved." Toasts
have a 5-second Undo affordance.

### 6.6 Global keyboard search

`Cmd/Ctrl+K` opens the portal-wide command palette (from
[`PORTAL_LAYOUT_BLUEPRINT.md`](PORTAL_LAYOUT_BLUEPRINT.md) §2). Inbox-relevant
commands surface there: "Go to conversation...", "Filter by vendor...",
"Resolve current conversation", etc.

## 7. Reading pane (right pane)

### 7.1 Pane structure

Top to bottom:

```
┌─ Reading pane ──────────────────────────────────────────────────┐
│ Identity card (60-120px)                                        │
├─────────────────────────────────────────────────────────────────┤
│ Action bar (40px): Assign | Resolve | ... overflow             │
├─────────────────────────────────────────────────────────────────┤
│ Thread (scrollable):                                            │
│   - System events (inline mini-rows)                            │
│   - Inbound messages (bubble-style or full)                     │
│   - Outbound messages (right-aligned or full)                   │
│   - Internal notes (visually distinct, amber-tinted band)       │
│   - AI draft markers (small pill: "Drafted by AI on...")        │
├─────────────────────────────────────────────────────────────────┤
│ Composer (sticky bottom, ~140px collapsed, expands as user types)│
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Identity card

A compact card at the top of the reading pane showing the linked record's
key facts. **The fields are the same as the AI Prompt drawer's "Context"
section (Section 7.6), abbreviated.** The card is the inline summary; the
drawer is the full picture.

For a vendor conversation, fields shown:

- **Company logo + name** with a small "VENDOR" badge.
- **Linked vendor link**: small arrow link "Open profile →" to
  `/admin/vendors/{id}`.
- A row of pills: `BAND Tier 2` / `CREDITS 2 left` / `RENEWS 12 Mar 2027` /
  `ONBOARDING 5 of 6` / `LAST MEETING Held` / `OWES $0`.
- **Conversation status**: a status indicator (Open / Waiting / Resolved /
  Archived).
- **Assignee**: avatar + name, or "Unassigned".

For an executive conversation:

- **Photo + name** with an "EXEC" badge.
- **Title and company.**
- **Linked exec link**: "Open profile →" to `/admin/executives/{id}`.
- Pills: `CHARITY {chosen}` / `MEETINGS 12` / `LAST MEETING Held` /
  `RESPONSE RATE 78%` / `EA {EA name or '-'}`.

For an unmatched conversation:

- The From address.
- A "Link to..." button that opens a typeahead picker of vendors and execs.
  Linking writes to `conversation.linked_record_id` and re-runs the AI draft
  if applicable.

The identity card is 60px tall when collapsed (compact pill row), expandable
to 120px (showing more pills + notes). Default collapsed.

### 7.3 Action bar (the per-conversation overflow)

A thin (40px) bar between the identity card and the thread. Visible buttons:

- **Assign** (or current assignee avatar): opens a typeahead to assign.
- **Resolve** (or "Reopen" if resolved): primary action button.
- **AI Prompt** (icon-only, with a small dot if a fresh draft is ready):
  opens the AI Prompt drawer (Section 7.6). This is in addition to the
  composer-level AI Prompt button (Section 9.3); both open the same drawer.
- Overflow `...` menu: Mark unread, Apply label, Move to archive,
  Snooze..., Print, Copy conversation link, Open in Gmail (deep-link),
  Report as spam.

### 7.4 Thread rendering

#### 7.4.1 Order and density

- Top-to-bottom, oldest at the top, newest at the bottom.
- On first open of an unread conversation, auto-scroll to the first unread
  message and add a subtle "New" divider above it.
- On a read conversation, auto-scroll to the latest message.
- Messages are NOT collapsed by default. The blueprint's HR Partner density
  means full message visible, no Gmail-style "show quoted text". Use the
  full-render quoted text inline, indented and slightly muted.

#### 7.4.2 Inbound message block

```
┌─ Inbound ────────────────────────────────────────────────┐
│ [avatar] Sender Name <email>                  10:42 AM   │
│          to {platform_mailbox} (+ Cc if any)            │
│          [Subject if different from thread subject]      │
│                                                          │
│          [Body, rendered HTML if present, fallback text] │
│                                                          │
│          [Attachment chips, if any]                      │
│                                                          │
│          [Source indicator: "via Email"]                 │
└──────────────────────────────────────────────────────────┘
```

#### 7.4.3 Outbound message block

```
┌─ Outbound ───────────────────────────────────────────────┐
│ [avatar=Issy] From {platform_mailbox}        11:05 AM   │
│               to Sender Name <email> (+ Cc if any)      │
│                                                          │
│               [Body, rendered HTML if present, fallback] │
│                                                          │
│               [Attachment chips, if any]                 │
│                                                          │
│               [Source indicator: "sent via platform" OR  │
│                "sent from Gmail" depending on source]    │
│               [If AI-drafted: small pill "AI draft,      │
│                edited by Issy" with link to drawer]      │
└──────────────────────────────────────────────────────────┘
```

The two source indicators ("sent via platform" vs "sent from Gmail") are
small muted 11px mono pills. They are how Issy can tell at a glance whether
she replied via the platform or directly from Gmail; both are equally valid,
both are in the same thread.

#### 7.4.4 Internal note block

Visually distinct: a band running the full width of the thread, amber-tinted
background, mono uppercase eyebrow "INTERNAL NOTE", author + time, body in
Inter regular. Never sent to the customer. Has a small `delete` action for
the author only.

#### 7.4.5 System events

Small inline rows, centred, muted, 11px mono. Examples:

- `Conversation auto-matched to Acme Robotics (domain match).`
- `Issy marked as waiting on vendor.`
- `Vendor archived in Gmail; conversation marked resolved.`
- `AI draft generated.`
- `AI draft superseded by Issy's edit.`

System events are recorded in `audit_event` and rendered inline here.

### 7.5 Long thread handling

If a thread has more than 30 messages, collapse the older messages into a
"Show 14 earlier messages" button at the top. This is a separate concept
from quoted-text collapse (which we do NOT do).

### 7.6 The AI Prompt drawer

The drawer slides in from the right edge of the reading pane and pushes the
thread leftward (rather than overlaying it), so Issy can compare draft to
context without losing her place. Full spec, including data points surfaced,
prompt construction, and the "Use draft" handoff:
[`MESSAGING_AI_DRAFT_SPEC.md`](MESSAGING_AI_DRAFT_SPEC.md). This document
covers only the trigger (Sections 7.3 and 9.3) and the geometry (560px wide,
slides over thread, never blocks composer).

## 8. New conversation (composer-only mode)

Clicking "+ New" in the page header opens a full-pane composer:

- To: typeahead against vendors, executives, EAs. Free-text allowed (to email
  someone not in the system).
- Cc / Bcc: optional rows, hidden by default behind a "Cc/Bcc" link.
- Subject: required.
- Body: rich text.
- Send button + cancel.

A new conversation creates a new Gmail thread. After send, it lands in the
inbox like any other conversation; the reading pane opens on it. If the To
address matches a known vendor or executive, the record matching rules from
[`GMAIL_INTEGRATION_CONTRACT.md`](GMAIL_INTEGRATION_CONTRACT.md) §7 link it
automatically.

New conversations from `+ New` are rare; the inbox is overwhelmingly reactive.
But for proactive outreach (e.g. "hey, follow-up on last month's intro") this
is the entry point.

## 9. Composer (sticky bottom of reading pane)

### 9.1 Default state

Collapsed to ~140px height when not focused. Structure:

```
┌─ Composer ───────────────────────────────────────────────────────┐
│ [Reply] [Internal Note]                          [Use template] │
├─ Composer body ──────────────────────────────────────────────────┤
│ Reply: To: ... | Cc/Bcc                                          │
│ Write a reply, this emails the contact.                          │
├─ Footer ─────────────────────────────────────────────────────────┤
│ Sends as an email to {to_address}                       [Send →]│
└──────────────────────────────────────────────────────────────────┘
```

Focusing the body expands the composer to ~280px. Typing past one line
auto-grows up to ~520px, after which it scrolls within itself.

### 9.2 The Reply / Internal Note toggle

A two-segment pill toggle at the top-left of the composer, default state
"Reply". The behaviour change between segments:

| Segment | What it does |
|---|---|
| **Reply** | Composes an email to the contact via the Gmail integration. Footer shows the To address. Send button sends the email. |
| **Internal Note** | Composes a team-only note. No To address. Footer shows "Visible only to staff". Send button writes an `internal_note` row, nothing emailed. |

The toggle is keyboard-cyclable (`Tab` from the previous focus lands on it,
arrow keys cycle between segments).

### 9.3 The AI Prompt button (Issy's spec)

**Visibility rule:** the AI Prompt button is **only visible when the toggle
is on Internal Note**. It is hidden when the toggle is on Reply.

When Internal Note is active, the AI Prompt button appears immediately to the
right of the toggle, with an amber dot if there is a fresh AI draft ready
(generated since the last inbound message, not yet seen by Issy).

Clicking the AI Prompt button opens the AI Prompt drawer (see
[`MESSAGING_AI_DRAFT_SPEC.md`](MESSAGING_AI_DRAFT_SPEC.md)). The drawer
contains:

- **Context section**: all the data points the AI is using to draft (the same
  fields as the identity card, plus their full request answers, conversation
  history summary, charity choice, recent meeting outcomes, payment status,
  flags).
- **Suggested draft section**: one or more AI-written replies, each with a
  "Use draft" button. Clicking "Use draft" drops the text into the composer
  body and flips the toggle from Internal Note back to Reply, so Issy can
  edit and send.
- **Regenerate** with a short prompt input ("Make it warmer", "Push back on
  the date", etc.).

**Why this rule (Issy's spec, captured for the cold chat):** the AI Prompt
is conceived as the "internal brain" of the conversation. Internal Note is
the space where Issy thinks; AI Prompt is one of the tools she has in that
thinking space. Reply is the formal output. By hiding AI Prompt behind
Internal Note, the Reply mode stays clean and the AI is positioned as a
thinking partner, not an autopilot.

**Alternative considered and rejected:** showing AI Prompt as a third toggle
segment ("Reply / Internal Note / AI Draft") was rejected because it implies
the AI mode is symmetric with Reply, when in fact the AI's role is to feed
Reply (via "Use draft"). The current design preserves that asymmetry.

### 9.4 Templates

A "Use template" button at the top-right of the composer. Clicking opens a
small picker of saved templates (e.g. "Decline meeting request", "Follow-up
on no-response", "Confirm meeting time"). Each template is a markdown body
with token placeholders (`{{vendor_name}}`, `{{charity_amount}}`) that
resolve from the conversation context.

Templates and AI drafts are complementary: templates are deterministic, AI
drafts are tailored. Issy can start from either.

### 9.5 Attachments and rich text

- Drag a file onto the composer to attach. Multi-attach supported. Total
  email size cap (Gmail's 25MB) enforced in the composer with a live size
  indicator once any attachment is added.
- Rich text toolbar (bold, italic, link, bullet list, numbered list,
  quote, code) above the body, only visible when the composer is focused.
- Outbound is sent as multipart/alternative (text/plain + text/html), per
  [`GMAIL_INTEGRATION_CONTRACT.md`](GMAIL_INTEGRATION_CONTRACT.md) §8.

### 9.6 Send mechanics

- Send button is disabled until a `to` address is present (Reply mode) and
  the body is non-empty.
- Clicking Send immediately disables the button and shows a spinner. The
  worker queues the send (idempotent via `client_send_id`); on success the
  composer clears and the new outbound message appears in the thread; on
  failure a toast with the error and a "Retry" button.
- A small "Sending..." indicator appears in the composer footer while the
  send is in flight.
- Keyboard: `Cmd/Ctrl+Enter` from the body sends.
- Discard: a discard icon in the composer header drops the draft (with
  confirm if body is non-trivial).

### 9.7 Draft autosave

Composer body autosaves to `local_draft` (Supabase, scoped to user +
conversation + mode) every 5 seconds while typing. Reopening the
conversation restores the draft. Sending or discarding clears it. AI drafts
are stored separately (see
[`MESSAGING_AI_DRAFT_SPEC.md`](MESSAGING_AI_DRAFT_SPEC.md)).

### 9.8 What the composer must NEVER do

- Auto-send anything. Send requires a click (or `Cmd/Ctrl+Enter`).
- Insert a money figure that did not come from the pricing engine. AI drafts
  may include `{{charity_amount}}` tokens but they resolve from
  [`CALCULATIONS.md`](CALCULATIONS.md), never from the model's reasoning.
- Auto-CC anyone. Cc is explicit.
- Auto-fill the body with anything (templates and AI drafts are explicit
  user actions, not background insertions).

## 10. Two-way sync UX

The Admin Inbox visually reflects the two-way sync rules from
[`GMAIL_INTEGRATION_CONTRACT.md`](GMAIL_INTEGRATION_CONTRACT.md) §9 so Issy
always knows where the source of truth is.

### 10.1 Sync status pill (in the action bar)

A small mono uppercase indicator next to the Resolve button:

- `SYNCED` (default, no special colour): conversation is up to date with
  Gmail.
- `SYNCING...` (muted, with a spinner): a sync is in flight.
- `SYNC STALE` (amber): the last successful sync was more than 5 minutes
  ago. Clicking it triggers a manual `history.list` poll.
- `SYNC FAILED` (red border): the most recent sync errored. Click to see
  the error and retry.

### 10.2 Source indicators on messages

Per Section 7.4.3, every outbound message shows where it was sent from
("sent via platform" or "sent from Gmail"). Inbound shows "via Email" so
that future channels (Slack, WhatsApp) can be distinguished.

### 10.3 The "Open in Gmail" deep-link

In the conversation overflow menu, "Open in Gmail" opens the Gmail thread
in a new tab using Gmail's web URL format. This is the escape hatch for when
something is broken in the platform.

### 10.4 Connection-lost banner

When the Gmail integration's status flips to `revoked`, every page in the
admin portal (not just the inbox) shows a sticky banner at the top of the
content area:

> Gmail connection lost. The inbox is read-only until you reconnect.
> [Reconnect Gmail →]

The composer Send button is disabled. Composing a draft still works (it
saves to `local_draft`); on reconnect, drafts persist and the user can send.

## 11. Notifications

### 11.1 In-app

- The topbar bell badge counts open conversations needing the current user's
  attention. The bell menu lists the 5 most recent with a "See all" link to
  the inbox filtered by `unassigned + open`.
- A small amber dot on the sidebar Inbox item indicates new activity since
  the user last opened the page.

### 11.2 Email notifications

By default, the platform does NOT email Issy about new inbound messages
(she'd already see them in Gmail). She can opt in to a daily digest
("Conversations needing reply") and to push notifications for unmatched
conversations (so a brand-new sender doesn't get lost).

### 11.3 Slack

If `SLACK_WEBHOOK_URL` is configured, the platform posts to
`#inbound-platform` for:

- Every new unmatched conversation (rate-limited to once per minute).
- Every conversation aged > 24h with no reply.
- Every Gmail integration failure.

## 12. States: empty / loading / error

Every screen in the platform ships three states (blueprint requirement).

### 12.1 Inbox empty

- List pane: empty illustration + "No conversations yet. They'll appear here
  as soon as someone emails {platform_mailbox}." plus a "+ New conversation"
  button.
- Reading pane: same empty illustration as Section 4.3.
- Topbar bell: no badge.

### 12.2 Inbox loading

- List pane: 5 skeleton rows.
- Reading pane: skeleton for identity card, action bar, and thread (3-4
  skeleton messages).
- Composer is hidden until the conversation loads.

### 12.3 Inbox error (data fetch failed)

- List pane: "Couldn't load conversations. [Retry]"
- Reading pane: if a conversation was previously loaded, it remains visible
  but the action bar shows a muted "Read-only, sync failed" pill.
- Composer: disabled, with a tooltip "Cannot send while sync is failing."

## 13. Keyboard shortcuts

Issy is fast. Inbox shortcuts (all configurable in user settings):

| Key | Action |
|---|---|
| `J` / `K` | Next / previous conversation in the list. |
| `Enter` | Open the highlighted conversation. |
| `Esc` | Close the open conversation (back to list-only on mobile; no-op desktop). |
| `R` | Focus the composer in Reply mode. |
| `N` | Focus the composer in Internal Note mode. |
| `A` | Open the AI Prompt drawer. |
| `E` | Resolve the open conversation. |
| `Shift+E` | Reopen the resolved conversation. |
| `U` | Mark unread. |
| `S` | Snooze (opens a picker: 1h, tomorrow, next week, pick date). |
| `Cmd/Ctrl+Enter` | Send (from composer body). |
| `Cmd/Ctrl+K` | Command palette. |
| `Cmd/Ctrl+F` | Focus the list search input. |
| `?` | Show the keyboard shortcuts cheat sheet (modal). |

Shortcuts surface in the command palette and in a "?" cheat sheet modal.
They follow standard Gmail-style conventions where overlap exists.

## 14. Mobile behaviour (non-primary surface)

Issy works on desktop. Mobile is a passive-read surface:

- `/admin/inbox` is the list, full width.
- Tapping a row navigates to `/admin/inbox/{id}` (full-screen reading pane).
- The composer is available but defaults to a compact textarea (no rich
  text toolbar). Templates and AI Prompt are accessible from a `...` menu.
- Bulk actions, saved views, and saved view management are desktop-only.
- The mobile experience is not held to the same density as desktop; readable
  matters more.

## 15. Permissions and visibility

- Role required to access the inbox: `staff` or `admin`.
- All staff see all conversations by default (it is a shared inbox).
- Assignment is an attention signal, not an access control.
- Vendors and executives never see this screen and never see `message` rows
  (RLS denies). They interact with TheGoodIntro exclusively over email and
  through their own portal screens.
- A `support_observer` role (read-only, for an outsourced support person, if
  ever needed) is planned but not in v1. Hooks for it should exist in the
  RLS policies even if no users have the role yet.

## 16. Performance budgets

- Initial inbox load: < 1.5s to first paint of skeleton, < 3s to first usable
  state (list + reading pane both populated for the default filter), assumed
  500 open conversations.
- Conversation open: < 200ms from click to skeleton, < 800ms to fully loaded
  thread (assumed 30-message thread).
- AI Prompt drawer open: < 400ms to render context (cached) plus async
  loading state for the draft (which may take several seconds; show a small
  shimmering progress bar).
- Send: optimistic UI within 100ms; actual send completes < 3s in p95.

If any budget is exceeded by > 2x in production, page on-call.

## 17. Telemetry

Track (via the platform's existing analytics, not a new tool):

- Time to first reply per conversation (median, p90).
- Share of replies that started from an AI draft.
- AI draft regeneration rate (sign of drafts not landing).
- Filter usage (which filters Issy applies most; informs which become
  defaults or saved views).
- Conversation status transitions (open -> waiting -> resolved).
- Connection failure rate (count per day; alert if > 0.5%).
- Unmatched conversation rate (sign that record matching needs improving).

No customer PII in telemetry events. Conversation IDs only, not contents.

## 18. Acceptance criteria (what "done" looks like)

The Admin Inbox is shipped when ALL of the following are true:

1. Layout matches Section 3-7 in a production build with no unexpected
   chrome ("All systems operational" pill removed, filter tabs hidden behind
   the Filter button, AI Prompt button only visible in Internal Note mode).
2. A new inbound email lands in the list within 60 seconds and is correctly
   linked to the vendor/exec record per Section 5 and
   [`GMAIL_INTEGRATION_CONTRACT.md`](GMAIL_INTEGRATION_CONTRACT.md) §7.
3. The identity card shows accurate, live data pulled from the linked record.
4. The composer's Reply / Internal Note toggle behaves per Section 9.2.
5. The AI Prompt button appears ONLY when the toggle is on Internal Note,
   and clicking it opens the drawer per
   [`MESSAGING_AI_DRAFT_SPEC.md`](MESSAGING_AI_DRAFT_SPEC.md).
6. "Use draft" from the AI Prompt drawer correctly populates the composer
   and flips the toggle back to Reply.
7. Sending a reply is idempotent (double-click does not double-send) and
   threads correctly in Gmail.
8. A reply sent from Gmail directly appears in the platform within 60
   seconds, marked "sent from Gmail".
9. Filters, saved views, bulk actions, search, and keyboard shortcuts all
   behave per their sections.
10. All three states (empty, loading, error) ship for the inbox, the
    conversation list, and the reading pane.
11. The connection-lost banner appears within 60 seconds of revoking the
    OAuth grant in Google, and disappears on reconnect.
12. Telemetry events fire as listed in Section 17.
13. Performance budgets in Section 16 are met in production.
14. RLS verified: a `vendor` role user cannot SELECT any `conversation` or
    `message` row.

## 19. Open decisions for Issy (resolve before build)

These intentionally NOT decided in this spec; the build chat MUST NOT proceed
past them without Issy's answer.

- [ ] **Identity card pill set per record type.** Confirm the proposed pills
      in Section 7.2 are the right ones. Add / remove based on what Issy
      reaches for when reading a thread.
- [ ] **EXEC badge colour.** Section 5.1 proposed emerald-soft (a sanctioned
      one-off given the sidebar emerald rule); fallback amber-soft. Pick one.
- [ ] **Bell-menu vs sidebar badge.** Both proposed in Section 11.1. Keep
      both? Keep one? Issy preference.
- [ ] **Email digest opt-in default.** Section 11.2 proposed default OFF
      (Issy uses Gmail directly). Confirm.
- [ ] **Slack alerts default channel.** Section 11.3 proposed
      `#inbound-platform`. Confirm or rename.
- [ ] **Auto-snooze defaults.** Section 13's snooze picker offers 1h /
      tomorrow / next week. Confirm or extend.
- [ ] **`support_observer` role timing.** Section 15 says hooks now, role
      later. Confirm.

## 20. Change history

- 2026-05-31 — Initial spec. Captures the 2026-05-31 design feedback:
  hide-behind-buttons header, AI Prompt button only on Internal Note,
  HR Partner density, no preview-state chrome from Claude Design.
