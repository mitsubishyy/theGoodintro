# Admin Inbox — LOCKED 2026-06-04 (pending the wordmark call)

Designed in Claude Design 2026-06-04 across two locked passes (initial render
+ simplification consolidation). The messaging cockpit where Issy reads and
replies to every inbound email, with native Gmail sync, an identity-grounded
reading pane, and a composer that toggles between Reply and Internal Note.
The AI Prompt drawer (the data-points panel and three draft variants) is
**Pass 2** — designed separately, opens from the AI Prompt button that's only
visible in Internal Note mode.

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Admin Inbox" → File > Export HTML, drop here |
| `screenshot-default.png` | TO DROP | Default loaded viewport — Sam Patel thread, Reply mode, AI Prompt button hidden |
| `screenshot-internal-note.png` | TO DROP | Internal Note mode — AI Prompt button visible with fresh-draft amber dot |
| `screenshot-loading.png` | TO DROP | Loading state — skeleton list + skeleton thread, composer hidden |
| `screenshot-empty.png` | TO DROP | Empty state — first install, no inbound yet |
| `screenshot-unmatched.png` | TO DROP | Unmatched conversation — Daniel Akers, Link to typeahead, AI Prompt disabled |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md), [`../../../CALCULATIONS.md`](../../../CALCULATIONS.md).
2. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) §"Admin Inbox".
3. [`../../../PORTAL_LAYOUT_BLUEPRINT.md`](../../../PORTAL_LAYOUT_BLUEPRINT.md) for shell, tokens, density.
4. [`../../../ADMIN_INBOX_SPEC.md`](../../../ADMIN_INBOX_SPEC.md) — the build-ready spec this design implements. Especially §5 (list rows), §7 (reading pane), §9 (composer + AI Prompt visibility rule).
5. [`../../../GMAIL_INTEGRATION_CONTRACT.md`](../../../GMAIL_INTEGRATION_CONTRACT.md) — the data layer that feeds this screen. Inbound messages, threading, source pills, two-way sync.
6. [`../../../MESSAGING_AI_DRAFT_SPEC.md`](../../../MESSAGING_AI_DRAFT_SPEC.md) — the AI Prompt drawer (Pass 2 of the Admin Inbox design, scheduled next).
7. Open `screen.html` plus the five screenshots.

## What is locked

### Two-pane layout
- Conversation list (left, 380px) on the warm card tone.
- Reading pane (right, fills remaining width) on **WHITE** (`--portal-card-reading`), a new token introduced this pass to distinguish the reading surface from the warm-cream rest of the portal.
- Page background outside both panes stays `--portal-page` warm cream.

### Page header
- Breadcrumb `Home / Inbox` (mono 11px uppercase), H1 "Inbox" (Inter 18-20px semibold) + mono count "42 open / 168 all".
- Right side: Filter button (with active-count amber pill suffix when filters active) + "+ New" outline pill button.
- **Anti-list:** no "All systems operational" pill, no All/Unassigned/Mine/Unanswered tabs (filters live behind the Filter button), no bulk-actions toolbar at the top, no view-switcher.

### Conversation list (left pane)
- Search input at top (full pane width).
- Sticky list header (40px): "42 open / 168 all" mono count left + "Sort: Newest first" dropdown right.
- 76px rows. Anatomy per row: 8px amber unread dot (left edge) + 40px avatar/logo abbrev chip on amber-soft + sender name + record-type badge (VENDOR / EXEC / EA / UNMATCHED, mono 10px uppercase pill on amber-soft, UNMATCHED uses muted grey instead) + relative time (right-aligned mono 12px muted) + subject (Inter 13px ink) + snippet (Inter 13px muted) + status pill on right when not open (WAITING / RESOLVED / ARCHIVED).
- Selected row: 3px `--portal-amber` left bar + `--portal-card-selected` background.
- Bottom: "Loaded 9 of 168 · Load more" muted link.

### Identity row (~64px, hairline below) — COLLAPSED FROM ORIGINAL SPEC
- Left: 40px logo chip + company name + small mono VENDOR badge + sub-line with contact name and email.
- Middle (inline): three chips only — TIER 2 / 2 CREDITS / LAST MEETING Held. **No** RENEWS / ONBOARDING / OWES inline (those move to the AI Prompt drawer's Context tab in Pass 2).
- Right: ghost "Open profile →" link.

### Action bar (~40px, hairline below)
- Left: assignee avatar + chevron. **No** separate "Assignee:" label, **no** "Conversation status: Open" row.
- Middle: Resolve (primary ink) · AI Prompt icon · overflow "...".
- Right: nothing. **No SYNCED pill** — sync state only surfaces when broken (SYNC STALE / SYNC FAILED), deferred to a future pass.

### Thread rendering
- Top-to-bottom, oldest first.
- **Inbound messages**: avatar + sender name + email + time. **No "to ..." sub-line, no "via Email" source pill** (per-message chrome stripped).
- **Outbound messages**: avatar + "From hello@thegoodintro.com" + time + "to ..." line + body. Keep "sent via platform" / "sent from Gmail" source pill bottom right (actionable signal). Keep small "AI draft · edited by Issy" pill when applicable.
- **Internal note**: full-width SAGE band (`--portal-sage-soft`, optional `--portal-sage-ink` left bar), mono uppercase "INTERNAL NOTE" eyebrow + author + time + body. NEW palette colour this pass — sanctioned as the "staff-only / internal band" tint.
- **System events**: small inline centred row, muted 11px mono.
- **NEW divider**: above the first unread message, centred mono uppercase "NEW" with horizontal lines either side.

### Composer (collapsed by default)
- Top row: [Reply] [Internal Note] toggle on the left. NO rich-text toolbar visible. NO "Use template" button visible by default.
- Small "More v" ghost chevron on the right of the toggle reveals: rich-text toolbar + Use template + Discard.
- Body input area with placeholder or partial draft.
- Footer: in Reply mode, "Sends as an email to {to_address}" muted left + ink "Send →" right. In Internal Note mode, "Visible only to staff" muted left + ink "Save note →" right.

### AI Prompt button visibility rule (THE HARD RULE)
- **Visible ONLY when the composer toggle is on Internal Note.** Hidden in Reply mode.
- When visible: outline pill with sparkle outline icon + label "AI Prompt" + small amber dot indicating fresh draft ready (since last inbound, not yet seen).
- The AI Prompt icon in the action bar (separate from the composer button) stays visible in both modes — both open the same drawer (Pass 2).

### Tokens introduced this pass
- `--portal-card-reading`: white (#FFFFFF). The reading pane card surface. Distinct from `--portal-card` (warm cream) which other surfaces keep using.
- `--portal-sage-soft`: pale sage/mint (e.g. `oklch(0.94 0.04 155)`). The "staff-only / internal" band tint. Semantically distinct from sidebar emerald (different hue, different role). NEW sanctioned portal-palette colour.
- `--portal-sage-ink`: a darker sage for the "INTERNAL NOTE" mono eyebrow.

### States designed
- **DEFAULT** (Reply mode, AI Prompt hidden) — VIEWING NOW pill.
- **INTERNAL NOTE** (AI Prompt button visible with fresh-draft dot) — VIEWING NOW pill.
- **LOADING** (skeleton list + skeleton thread, composer hidden) — SKELETON pill.
- **EMPTY** (no conversations, muted "+ New conversation" text link, "Select a conversation to read it." in reading pane) — FIRST RUN pill.
- **UNMATCHED** (Daniel Akers, identity replaced with NOT LINKED YET card + typeahead, AI Prompt disabled until linked) — VIEWING NOW pill.

## What's NOT designed in this pass (Pass 2 + future)

- The **AI Prompt drawer** itself (Context tab with 8 cards, Drafts tab with 3 labelled drafts, Prompt tab with system + user prompts, unmatched state). Spec in [`MESSAGING_AI_DRAFT_SPEC.md`](../../../MESSAGING_AI_DRAFT_SPEC.md). Designed separately in the next pass.
- **New-conversation composer** (full-pane composer opened by "+ New"). Deferred — rarely used, inbox is overwhelmingly reactive.
- **Bulk-select mode** in the list (header swap with count + bulk actions when rows checked). Deferred to a future pass.
- **Filter popover contents** (the panel that opens when the Filter button is clicked). Deferred.
- **Sync-broken states** (SYNC STALE / SYNC FAILED / connection-lost banner). Deferred — only the healthy default is rendered, with SYNCED pill removed entirely.
- **Mobile layout** (list and thread as separate routes). Deferred — Issy works on desktop.

## Issy's fixes applied (2026-06-04 fix passes)

- **Simplification pass (medium trim)**: original render had four stacked header layers (identity card + 6 pills + status/assignee row + action bar). Collapsed to two layers (identity row + action bar). Dropped RENEWS / ONBOARDING / OWES chips from inline — those live in the AI Prompt drawer's Context tab. Dropped "Conversation status: Open" row entirely (open is the default). Dropped SYNCED pill (sync only surfaces when broken).
- **Per-message chrome stripped (Option A)**: dropped "to hello@thegoodintro.com" sub-line and "via Email" source pill on all inbound messages. Kept outbound source pills (actionable).
- **Composer chrome collapsed (Option B)**: rich-text toolbar + Use template button hidden by default behind "More v" chevron. Composer reads as just toggle + body + Send unless expanded.
- **White reading pane** (new `--portal-card-reading` token): reading pane distinguished from the warm-cream rest of the portal.
- **Sage internal note** (new `--portal-sage-soft` token): internal note band shifted from amber-tinted to pale sage, semantically distinct from sidebar emerald and from the amber accent. Sanctioned as a new portal-palette colour.

## Open decisions (not silently resolved)

- **EXEC record-type badge colour** in list rows. Currently using `--portal-amber-soft` for VENDOR / EXEC / EA consistently. ADMIN_INBOX_SPEC.md §5.1 floated emerald-soft as a sanctioned one-off. Final pick deferred.
- **Wordmark** ("TheGoodIntro" one word vs "The Good Intro" three words) parked across all locked screens.
- **AI Prompt drawer** (Pass 2) — spec in MESSAGING_AI_DRAFT_SPEC.md; designed next.
- **Sync-broken states + connection-lost banner** — deferred to future pass (per GMAIL_INTEGRATION_CONTRACT.md §9 + ADMIN_INBOX_SPEC.md §10).
- **Filter popover contents, bulk-select mode, "+ New" composer** — deferred to future passes.
- **Sample-data drift** (e.g. cycle renewal date 12 Mar 2027 — verify against Acme Robotics record at build time).

## Click flow into this screen

`Sidebar / Inbox` → `/admin/inbox` → defaults to the conversation list with the first conversation selected (Sam Patel · Re: Credit count and next-quarter intros).

`Sidebar / Inbox` amber count badge "12" = number of open conversations needing a reply. Clicking opens the list filtered by `status=open + assignee=me` (the "Needs reply" saved view).

Row click in the list → URL changes to `/admin/inbox/{conversation_id}` + reading pane opens on that thread.

Inside the reading pane:
- "Open profile →" → vendor or exec profile page.
- "Resolve" → marks conversation resolved.
- AI Prompt icon (action bar) OR AI Prompt button (composer, Internal Note mode only) → opens the AI Prompt drawer (Pass 2).
- Overflow "..." → Mark unread / Apply label / Move to archive / Snooze / Print / Copy conversation link / Open in Gmail / Report as spam.

Unmatched conversation: typeahead in the NOT LINKED YET card → picks vendor or exec → links the conversation → reloads with full identity + enables AI Prompt.
