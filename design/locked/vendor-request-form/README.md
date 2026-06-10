# Vendor Request Form — LOCKED 2026-06-06 (pending the wordmark call)

Designed in Claude Design 2026-06-06. **Fourth locked vendor-portal screen.**
**First T5 form on the vendor portal** (vendor T5 variant — white form card with
warm-cream textareas inside it, no money information on the surface, qualification-
first). Reached from the Vendor Executive Detail Drawer's primary CTA.

Single viewport: form in PARTIALLY FILLED · READY TO SEND state with Q3 = Me. Pass
B will add: Q3 "Someone else" expanded fields, the three form states (empty /
submitting / content-guard error), and the post-submit confirmation modal.

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Vendor Request Form" → File > Export HTML |
| `screenshot-ready-to-send.png` | TO DROP | VP1 — Partially filled, Q3 = Me, ready to send |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md).
2. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) §"Vendor Request Form" + Global decisions for vendor T5 variant + radio-card pattern.
3. [`../vendor-executive-detail-drawer/README.md`](../vendor-executive-detail-drawer/README.md) — the entry point that routes here.
4. [`../../../VENDOR_PORTAL_BRIEF.md`](../../../VENDOR_PORTAL_BRIEF.md) §"The request form" — workflow brief.
5. [`../../../EMAIL_ACTIONS.md`](../../../EMAIL_ACTIONS.md) — what the executive sees after submit.
6. [`../../../NOTIFICATION_TEMPLATES.md`](../../../NOTIFICATION_TEMPLATES.md) — admin notification on submit.
7. Open `screen.html` + screenshot.

## What is locked

### Vendor portal shell (inherits Vendor Dashboard locks)
- Sidebar deep teal-pine, IA, count badges, vendor identity card, Sam Patel chip.
- **Executives sidebar item is ACTIVE** on this screen.
- Topbar: H1 "Request a meeting" + mono eyebrow "ACME ROBOTICS · BAND 2" + search · bell · SP.

### Back row (locked pattern, above content)
32px thin row, top-left of content area. "← Back" ghost (20px chevron-left + "Back" Inter 14px semibold ink). No fill, no border. Hover --portal-card-hover.
Click → `/vendor/executives` (parent route, not browser history).

### Page content (max-width 720px column, centered)

**Block A — Context strip** (no card, 56px row)
- 48px circular photo (real, same Unsplash image as the Executives list row + drawer for the same exec).
- Stacked right: "REQUESTING A MEETING WITH" mono eyebrow / Name Inter 17px semibold ink / "Title · Company" Inter 13px --muted-foreground.

**Block B — Form card** (`--portal-card-reading` white bg, --portal-line 1px border, rounded-2xl, 32px padding)

  Three questions stacked, hairline dividers between (32px gap above/below each divider).

  **QUESTION 1 — "Who are we?"**
  - Header row: mono eyebrow "QUESTION 1 OF 3" left + character counter "N / 300" right (--muted-foreground at <80%, --portal-amber-ink at 80-100%, dark red at >100%).
  - Label Inter 16px semibold ink.
  - Helper Inter 12.5px --muted-foreground.
  - Textarea: 4 rows min, auto-grow. `--portal-page` (warm cream) bg INSIDE the white form card (layered depth without new tokens). --portal-line border, rounded-lg, 14px padding, Inter 13.5px ink, 1.55 line-height. Focus: --portal-amber 1px ring.

  **QUESTION 2 — "Why {Name}, specifically?"**
  - Same anatomy as Q1.
  - Label dynamically includes the exec's first name ("Why Priya, specifically?").

  **QUESTION 3 — "Who will {Name} be meeting with?"**
  - Header row: mono eyebrow left, NO counter right (radio not character-limited).
  - Label Inter 16px semibold ink.
  - Helper Inter 12.5px --muted-foreground.
  - **Two radio cards stacked, 12px gap** (NEW pattern, locked here):
    - **SELECTED** (active): --portal-amber-soft bg, --portal-amber 2px ring outline, rounded-xl, 16px padding. 16px filled amber circle radio (with 4px white inner ring) + 16px gap + stacked: Title Inter 14.5px semibold ink / subtitle Inter 12.5px --muted-foreground.
    - **UNSELECTED** (rest): --portal-card-reading bg, --portal-line 1px border, rounded-xl, 16px padding, cursor pointer. 16px ghost circle (1.5px --portal-line border) + 16px gap + same Title / subtitle stack.

**Block D — Action row** (right-aligned, 24px gap below form card)
- Ghost **Cancel** button: --portal-line border, no fill, 40px tall, rounded-lg, Inter 13px semibold ink, 18px h-padding. Click → /vendor/executives.
- 12px gap.
- Primary ink **Send request to {Name} →** button: --portal-ink bg, white text, 40px tall, rounded-lg, Inter 13px semibold, 20px h-padding, 8px gap to 16px arrow-right outline (white).

**NOTE — Block C deleted.** A cost/charity strip ("No credit charged on submit · 1 credit ($1,500) consumed only after Held · Projected gift: ~$1,000 to RFDS") was specced and rendered, then **deleted at Issy's request 2026-06-06**. Rationale: the request form is the qualification gate; surfacing money on this screen mixes commercial and craft. Money lives on Dashboard ribbon, Billing & Credits screen, and the post-Held gift records. Do NOT re-introduce on this screen.

### STATE annotation row
"STATE · REQUEST FORM · PARTIALLY FILLED · READY TO SEND" + right "VIEWING NOW" amber-soft pill. Single bottom row, no top row.

## Data sources per module (build-chat reference)

| Module | Source | Notes |
|---|---|---|
| Topbar eyebrow `ACME ROBOTICS · BAND 2` | `vendor.name` + `bandForMeetingNumber(...).band` | Same as every vendor screen |
| Back row destination | `/vendor/executives` | Parent route, not browser history |
| Context strip identity (photo, name, title, company) | `executive WHERE id = ?` (id from URL: `/vendor/executives/{public_id}/request`) | Reads the SAME `photo_url` as the drawer and list |
| Q1 textarea — initial value | Form state (empty by default; sample prefill in mockup only) | |
| Q2 textarea — initial value | Form state | |
| Q1 + Q2 counters | `value.length` on each textarea, live-updating | 300 char hard cap server-side |
| Q1 + Q2 server-side validation | Length ≤ 300 chars AND content-guard regex strip of emails / phone numbers / URLs BEFORE the email is composed for the exec | Per VENDOR_PORTAL_BRIEF.md "Content guard on Q1 and Q2" |
| Q3 "Me" option subtitle | Current `vendor_user.name` + `vendor_user.title` + `vendor.name` | |
| Q3 radio state | Form state, persisted on submit to `request.attendee_kind` enum (`self` \| `other`) | If `other`: expanded fields appear (Pass B) |
| Send button | POST creates `request` row with `status = 'submitted'`, `qualifying_questions` JSON, `attendee_kind`, kicks off the exec email workflow (per EMAIL_ACTIONS.md) + admin notification (per NOTIFICATION_TEMPLATES.md) | NO credit consumed at this step |
| Cancel button | No record created; route to /vendor/executives | |

**No money number is rendered on this screen.** Cost strip was deliberately removed
2026-06-06. The build hydrates Q1/Q2 from form state; money figures are not
referenced anywhere on this surface.

## Sample data (LOCKED — aligned with prior vendor screens)

- Vendor: **Acme Robotics** · Band 2
- Signed-in user: **Sam Patel** · Head of RevOps · Owner
- Target exec: **Priya Raghavan** · CFO · Lumen Industries · EXC-1042 · Royal Flying Doctor Service
- Q1 sample text (278 chars): "Acme Robotics builds autonomous warehouse systems for mid-market logistics operators. We help retail and 3PL teams cut pick-pack time by 40% without ripping out their WMS, focusing on multi-SKU operations under 50k pallets."
- Q2 sample text (281 chars): "Lumen is restructuring its logistics and warehousing across three sites this FY. I noticed Priya's comments on operational efficiency at the AICD conference and wanted to share how three other ASX-listed groups have approached the same brief."
- Q3 = Me (Sam Patel · Head of RevOps · Acme Robotics)

## Open decisions parked (Pass B)

- **Wordmark**.
- **Q3 "Someone else" expanded fields** — when unselected card is clicked, three fields appear inline beneath the second card: Name, Title, Email (with domain validation against work-email rules).
- **Form states:**
  - EMPTY default (textareas blank, counters 0/300, Send button DISABLED — `--portal-line` bg + muted text).
  - SUBMITTING (Send button shows spinner, all form fields disabled).
  - CONTENT-GUARD ERROR (inline `--portal-amber-soft` warning banner naming what was stripped, e.g. "We removed a phone number from Q1. You can re-add context without it.").
- **Confirmation modal after submit** ("TheGoodIntro is working on it" + Back to Executives / Make another request).
- **"Preview what Priya sees" affordance** (small ghost link near Send button, opens a preview of the exec email). Defer unless Issy requests.

## Anti-list (do not regress)

- **No money information on this screen** (cost strip explicitly removed 2026-06-06). Do NOT re-introduce a "1 credit = $1,500" or projected-gift line here. Money lives on Dashboard, Billing & Credits, and post-Held gift records.
- Form card uses `--portal-card-reading` (WHITE), with `--portal-page` (warm cream) textareas inside — layered depth without new tokens.
- Photo of the target exec MUST match the same Unsplash portrait used on the Executives list row + Drawer (one image per exec, hydrated from `executive.photo_url`).
- Back button → `/vendor/executives` (parent route, NOT browser history).
- "Band" not "Tier" anywhere on this screen if the eyebrow ever surfaces a band reference.
- Sage forbidden on vendor surfaces; emerald forbidden on vendor surfaces.
- No em or en dashes. Use "·".
- No emojis. Outline icons only.

## Issy's fix passes (2026-06-06)

- Pass A.1: deleted Block C (the cost/charity strip with shield-check / coins / heart icons). Rationale recorded above. 24px gap from Q3 radio cards to action row remains.
