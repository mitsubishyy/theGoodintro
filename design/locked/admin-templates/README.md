# Admin Templates — LOCKED

Designed in Claude Design 2026-06-03. T3 list + T5 editor in one file. The
notification template editor where Issy reviews and edits every templated
email the platform sends (decline replies, follow-up reminders, meeting
confirmations, welcome emails, gift-released notifications, etc.). Variables
in `{{double braces}}` resolve at send time. Editor enforces brand rules
(no em/en dashes, forbidden vocabulary) inline.

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Admin Templates" → File > Export HTML, drop here |
| `screenshot-list-loaded.png` | TO DROP | List viewport with sample templates |
| `screenshot-list-loading.png` | TO DROP | Loading state of list |
| `screenshot-list-empty.png` | TO DROP | Empty state ("No templates yet") |
| `screenshot-editor.png` | TO DROP | T5 editor with sample template (Decline reply) |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md), [`../../../POSITIONING.md`](../../../POSITIONING.md) (voice and brand rules).
2. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) §"Admin Templates (T3 + T5)".
3. [`../../../PORTAL_LAYOUT_BLUEPRINT.md`](../../../PORTAL_LAYOUT_BLUEPRINT.md) §T3 and T5 template rules.
4. [`../../../ADMIN_PORTAL_BRIEF.md`](../../../ADMIN_PORTAL_BRIEF.md) §Templates.
5. [`../../../NOTIFICATION_TEMPLATES.md`](../../../NOTIFICATION_TEMPLATES.md) (existing template inventory and copy).
6. [`../../../MESSAGING_AI_DRAFT_SPEC.md`](../../../MESSAGING_AI_DRAFT_SPEC.md) §7 (token resolver — same resolver runs here at send time).
7. Open `screen.html` plus screenshots.
8. Reference the locked Admin New Executive form / Admin New Meeting for the matching T5 register (mono uppercase section headers, two-column field grid, FIELD STATES row, sticky bottom action bar).

## What is locked

### List viewport (T3)
- Page header: breadcrumb Home / Templates, H1 "Templates" + mono count "12 active / 14 all", Filter button, Sort dropdown (default "Used this month · Most used first"), primary ink "+ New template".
- **NO stat ribbon** (templates aren't an operational queue; skipped intentionally — clutter-free header).
- DataTable columns: TEMPLATE NAME · TYPE (mono pill: DECLINE / FOLLOW-UP / CONFIRM / REMINDER / WELCOME / GIFT / IMPACT / OUTREACH) · TRIGGER (Inter muted, the event description) · LAST EDITED (mono right-aligned date) · USED THIS MONTH (count stacked above "vs N last month" sub-line, both mono right-aligned) · STATUS (pill with dot) · (overflow ...).
- Row height 56px for the dual-line USED THIS MONTH cell. Row click opens the editor viewport.
- Status pills: Active (gold dot), Draft (slate dot), Archived (muted grey + row 60% opacity).
- All 14 sample templates rendered (Decline reply, Follow-up reminders 1st/2nd/3rd, Meeting confirmation, Pre-meeting reminders 24h/1h, Vendor welcome, Executive welcome, Gift released notification, Quarterly impact summary, Vendor renewal reminder, No-show follow-up (Draft), Outreach warm intro (Archived)).
- Filter popover: TYPE (chips multi), STATUS (multi with per-status counts), LAST EDITED (date range), USED THIS MONTH (All / Zero — surfaces unused templates as archive candidates). Saved views. URL reflects filters.
- Pagination: "Showing 1-14 of 14", rows-per-page 25 default.
- `STATE · LOADING` annotation row at the bottom of the loaded viewport (SKELETON pill).

### Loading state viewport
- Table header solid; 8 skeleton rows each mimicking the real row anatomy (template name shimmer, type pill shimmer, trigger text shimmer, date shimmer, count + sub-line shimmer, status pill shimmer, overflow shimmer).
- Annotation row: "You're viewing the loading state" with "VIEWING NOW" pill.

### Empty state viewport ("No templates yet")
- Page header chrome identical to loaded list; mono count reads "0 all".
- No table header, no rows.
- Centred 48px antique-gold envelope-with-pencil outline icon; heading "No templates yet"; body explaining that templates power every email the platform sends, with a "Create your first one and wire it to a trigger event." call-to-action. Primary ink "+ Add your first template" button (templates are created by direct action, so primary CTA is appropriate).
- Annotation row: "STATE · EMPTY · First install — no templates have been created yet" with "FIRST RUN" pill.

### Editor viewport (T5)
- Breadcrumb: Home / Templates / Decline reply (template name).
- H1: template name + type pill + status pill on the same line.
- Sub-header: "Last edited 28 May 2026 · Used 12× this month · vs 14 last month".
- "← Back to list" button on the right.
- Two-pane body: form on the left (~60% width), live preview on the right (~40% width, sticky as user scrolls).

**Form sections (mono uppercase headers with right-aligned captions):**
- **DETAILS**: Template name (required), Type (select dropdown), Status (Active / Draft / Archived chip selector).
- **SEND CONFIGURATION** (added by Claude Design unprompted, kept): "When the platform sends this, and to whom — read-only." Shows the trigger event chip (e.g. "Exec declines a request via signed-link decline or EA email" with EVENT · request.declined → RECIPIENT · vendor contact below). Plus Recipient (Vendor contact), From name (TheGoodIntro), Reply-to (concierge@thegoodintro.com) read-only fields. Captures the platform mailbox identity per template.
- **SUBJECT**: helper "Resolves at send time. Click a variable to insert." Subject input with inline variable chips (e.g. `{{exec_name}} has reviewed your request` rendered with the variable as a small soft-amber pill).
- **BODY**: helper "Plain-text email. Variables in `{{double braces}}` resolve per recipient." Rich-text-style mini toolbar (B, I, link, list icons) + "+ Insert variable" button. Body input with **inline variable chips** rendered as small soft-amber pills (LOCKED pattern — Claude Design's variable-pill rendering is better than my originally-specified raw-text approach).
- **SIGNATURE**: read-only "Warm regards," + `{{platform_signature}}` token. Helper: "Appended to every send. Brand-locked sign-off."
- **SAMPLE DATA**: Preview-against-real-record selectors. Vendor (default Acme Robotics · Sam Patel), Executive (default Priya Raghavan · CFO), Company (Lumen Industries — derived from Executive), Charity (default Royal Flying Doctor Service).

**Right pane — Live PREVIEW** (sticky):
- "PREVIEW · sample data" header.
- Resolved email rendering with variables highlighted in soft-amber background where they came from the variable resolver (so reader can see at a glance which strings came from variables vs hardcoded text).
- "To: Sam Patel, Acme Robotics".
- "Subject: Priya Raghavan has reviewed your request".
- Body with all variables resolved (Hi Sam, Thank you for your interest in meeting with Priya Raghavan, Chief Financial Officer at Lumen Industries, etc.).
- Signature block.

**VARIABLES sidebar** (right of the form, above the preview): 8 available variables listed (vendor_name, vendor_contact, exec_name, exec_title, exec_company, decline_reason, request_date, platform_signature) each with a one-line description (Vendor company, Vendor contact first name, Executive full name, etc.). Click to insert into the focused field.

**FIELD STATES row** at the bottom of the form: default / focused (focus ring) / error ("Subject can't be empty" with red border) / disabled.

**Sticky bottom action bar**: "Draft, auto-saved Xs ago" status text on the left; "Send test to me", "Cancel", "Save as draft", "Save changes" buttons on the right.

**STATE · EDITOR annotation row** at the bottom: "Template editor (T5) — subject + body with live variable tokens and a sample-data preview" with "VIEWING NOW" pill.

## Issy's fixes applied (2026-06-03 fix pass)

- Em dash in the body ("behalf — so the door stays open") replaced with a comma. Brand rule compliant.
- Sample data in the preview aligned to the locked sample set across all screens (Acme Robotics / Sam Patel + Priya Raghavan / CFO / Lumen Industries / Royal Flying Doctor Service).
- Empty state viewport added with the envelope-with-pencil icon, heading, body, and primary "+ Add your first template" CTA.

## Bonus pattern adopted from Claude Design (LOCKED)

- **Inline variable chip rendering in the body.** Variables like `{{vendor_contact}}` render as small soft-amber pills inline with the body text, not as raw text. Originally specced as raw text; Claude Design's pill rendering is better and is now the locked pattern.
- **SEND CONFIGURATION section.** Adds Recipient + From name + Reply-to read-only fields. Confirms the platform mailbox identity per template and provides a place to override Reply-to if needed.

## Brand rules enforced inline (HARD)

- **No em or en dashes in prose** (en dashes allowed only inside numeric ranges like "1–5"). Editor must:
  - Highlight any em dash (—) or en dash (–) in the body or subject with a red underline.
  - Show inline warning chip below the field: "Em dashes and en dashes aren't allowed in template copy."
  - **Disable Save changes / Save template button while warning is unresolved.** Save as draft stays enabled (drafts can be invalid).
- **Forbidden vocabulary list** ("marketplace", "magic", "wizard", "coaching", "program"): same enforcement.
- **Brand name** must be "TheGoodIntro" (capital T, G, I). Highlights "the good intro", "theGoodintro", "TGI" variants.
- These rules inherited from FACTS.md and POSITIONING.md; mirrored in MESSAGING_AI_DRAFT_SPEC.md §11.

## Money rules (HARD)

- Variables like `{{charity_amount}}`, `{{meeting_fee}}`, `{{platform_share}}`, `{{credits_remaining}}` resolve from the pricing engine at send time, NEVER from this template's body or from the model's reasoning.
- Template body MUST use variables for any money figure. Editor flags any literal "$" character not preceded by `{{` with a "Money figures must use variables" warning. Template cannot go Active while the warning is present.

## Open decisions (not silently resolved)

- **Template-variable catalogue per type.** Currently 8 variables shown for the Decline reply template. Each template type should expose its own context-relevant variables (e.g. a Meeting confirmation template needs `{{meeting_date}}`, `{{meeting_time}}`, `{{meeting_link}}`, `{{charity_name}}`). Catalogue lives in `apps/platform/lib/ai/tokens.ts` — define per-type before build.
- **"Send test to me" target address.** Defaults to the logged-in user's email. Confirm whether to expose an override field.
- **Wordmark** ("The Good Intro" three words vs locked "TheGoodIntro" one word) parked across all locked screens.

## Click flow

`Sidebar / Templates` → `/admin/templates` (list viewport) → row click OR "+ New template" → `/admin/templates/{id}` (editor T5). Back to list via the "← Back to list" button in the editor header.
