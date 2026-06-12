# Exec Profile — LOCKED 2026-06-11

Designed in Claude Design 2026-06-11. **Fifth locked exec-portal screen** (after Exec Dashboard, Exec Incoming Requests, Exec Meetings List, Exec Impact List). Route: `/exec/profile`. The exec's account surface.

**Core product principle (drives the whole page):** the profile is **auto-populated by the admin** when the TheGoodIntro account is set up. The exec (or their EA) does NOT build it. Default state is READ — concierge-clean, nothing screaming "fill me in." Each editable section carries a quiet "Edit" affordance for the cases where the exec or EA wants to correct something.

**Admin parity rule (locked on this screen, applies to all future exec surfaces):** every field on the exec Profile mirrors a field the admin captures on the locked Admin New Executive form / Admin Executive detail. No orphan fields. This rule was enforced pre-design: an earlier draft carried Phone, request cadence, batching, and quiet-hours fields with no admin counterpart — all cut before the prompt was issued.

Three viewports: VP1 READ state (default), VP2 Business context section in inline EDIT mode, VP3 "Edit executive assistant" drawer open.

## Viewports

| VP | Route | State |
|---|---|---|
| 1 | `/exec/profile` | READ state — six sections stacked: You · Business context · Your charity · Calendar & access · Requests · Consent record. All values rendered as plain text with quiet per-section Edit links. |
| 2 | `/exec/profile` (editing) | Business context card flipped to inline EDIT mode — "● Editing" emerald label replaces the Edit link, 3 textareas + 3 dropdowns, Cancel + Save changes card footer. |
| 3 | `/exec/profile` (drawer) | "Edit executive assistant" 540px right drawer over VP1 — current EA + update form + "What Lena can do" numbered steps + Cancel/Save footer. Backdrop 20% ink + 2px blur. |

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Exec Profile" → File > Export HTML |
| `screenshot-vp1-you-businesscontext.png` | TO DROP | Page header + You section + Business context (read) |
| `screenshot-vp1-charity-calendar.png` | TO DROP | Your charity + Calendar & access sections |
| `screenshot-vp1-requests-consent.png` | TO DROP | Requests + Consent record sections |
| `screenshot-vp2-businesscontext-edit.png` | TO DROP | Business context in edit mode with textareas + dropdowns + Save/Cancel |
| `screenshot-vp3-ea-drawer.png` | TO DROP | Edit executive assistant drawer over dimmed page |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md) — brand and pricing facts.
2. [`../exec-dashboard/README.md`](../exec-dashboard/README.md) — exec portal shell + editorial concierge register + photo-primary avatars + locked Priya sample data.
3. [`../exec-meetings-list/README.md`](../exec-meetings-list/README.md) — universal topbar search + drawer-as-detail + editorial chrome / SaaS inside.
4. **Admin parity sources:** [`../admin-executive-detail/README.md`](../admin-executive-detail/README.md) + the Admin New Executive form entry in [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) — every Profile field mirrors these.
5. [`../../../DATA_MODEL.md`](../../../DATA_MODEL.md) §Executive + §EA — field sources; note the structured business-context gap below.
6. [`../../../EXECUTIVE_PORTAL_BRIEF.md`](../../../EXECUTIVE_PORTAL_BRIEF.md) — consent binding model, pause/opt-out rights, minimum capture checklist.
7. Open `screen.html` + screenshots.

## What is locked

### Page header (deliberate one-off departure from the three-stat mini-strip)

- Italic Inter 12px `--muted-foreground` eyebrow: "Your account"
- Fraunces semibold 32px `--portal-ink` H1: "Profile"
- 12px gap, italic Inter 14px `--portal-ink-70` sub-line, max-width 560px: "Your profile was set up for you when you joined TheGoodIntro. Edit anything that does not look right."
- NO stat mini-strip — Profile is identity/settings, not stats. Do not propagate the sub-line framing to other pages.

### Section card anatomy (read state — NEW exec pattern: read-first sections with quiet Edit)

Six white section cards stacked, 32px gap. Each: `--portal-card-reading` bg, 1px `--portal-line` border, 12px radius, 28px x / 24px y padding.

- Header row: Fraunces semibold 22px section title LEFT + quiet "Edit" ghost link RIGHT (italic Inter 13px `--portal-ink-70` + 14px outline pencil glyph, no border, no bg; hover ink + underline).
- Body: labeled-value field rows, 16px gap. Label italic Inter 12px `--portal-ink-60` above; value Inter 14.5px `--portal-ink` plain text. Empty values render italic muted "Not on file".
- Sections WITHOUT an Edit link: **Your charity** (changes happen via the locked picker modal / My charity surface) and **Consent record** (append-only, tamper-evident).

### Section 1 — You

96px circular photo-primary avatar (initials "PR" fallback on `--portal-amber-soft`) left; field rows right: Name · Title · Company · Email (`executive.primary_email` — where request emails go) · LinkedIn (italic ghost link with outbound-arrow glyph). Below the fields: hairline + quiet footer "Executive ID: EXC-1042 · Joined TheGoodIntro 9 February 2024".

**NO phone field** — nothing on the platform captures phone (admin parity).

### Section 2 — Business context (field-for-field mirror of the locked Admin New Executive form)

Helper: "What you are working on, so we can put the right vendors in front of you."

Six fields exactly matching the admin form's BUSINESS CONTEXT section: Interested in · Current or upcoming projects · Areas you are not interested in · Timeline · Suggested meeting cadence · Seniority signal. Long-text fields full-width; the three select-backed fields sit in a 2-column grid.

Bottom helper: "We use these answers to choose which vendor requests reach you. Never shown to vendors." — **never "matching engine" on exec surfaces** (that framing is admin-only, per the locked rule).

### Section 3 — Your charity (read-only pointer)

NO Edit link. Helper: "Where the gift goes from every meeting you accept." 44px round RFDS logo placeholder + Fraunces semibold 20px `--portal-emerald` charity name + italic "Standing nomination · Remote health services · Australia-wide". Right-aligned ghost link "View on My charity →" → `/exec/my-charity` (view-only surface; charity changes stay modal-only per the locked pattern).

### Section 4 — Calendar & access (mirrors the locked Admin Calendar & EA module)

Helper: "How meeting times get found and who else can act on your behalf." Two subsections separated by a hairline:

- **Calendar**: "Google Calendar · Connected" with 14px outline calendar glyph + italic "Last synced 4 minutes ago" sub-line (free/busy read only — never event details) · Timezone "Sydney (AEST) · UTC+10" · Preferred meeting window "Weekdays 09:00 to 17:00".
- **Executive Assistant**: "Lena Park · lena@lumenindustries.com" + italic "Acting access since 4 May 2026 · Forwarded requests appear in her inbox automatically".

Edit on this section opens the EA drawer (VP3), NOT inline edit — EA changes send emails, so the higher-stakes drawer pattern applies.

### Section 5 — Requests (Pause only)

Helper: "Control whether new vendor requests reach you." ONE field: "Pause all requests" → "Off" + italic helper "Pausing stops new requests reaching your inbox until you turn it back on. Meetings already confirmed are unaffected."

Maps to `executive.status` active ↔ paused. **This is the destination of the locked exec dashboard footer's "Pause requests" link** (that link's destination was parked at dashboard lock as "likely Profile setting; design when Profile is built" — resolved here).

**Deliberately excluded:** request cadence, batching, quiet hours — no admin counterpart, no data fields, out of scope for v1. If pacing controls are wanted later, they ship as a Pass B WITH a matching admin module.

### Section 6 — Consent record (mirror of the locked Admin Consent record module, second person)

NO Edit link. Inside the card, a quiet read-only block: **warm-cream `--portal-page` bg** (NOT sage — sage is admin/staff-only and never appears on the exec portal), 1px `--portal-line` border, 12px radius, 20px padding.

- Italic eyebrow "Tamper-evident"
- Fields (Inter 13px): Captured at "Thu, 15 Feb 2024 · 09:12 AEST" · Terms version "v1.2" · Email message-id in **mono** `<m-9f2c8a1b@thegoodintro.com>` with copy-glyph button (the ONE allowed mono usage on this page — technical identifier) · Captured by "You (executive) · recorded automatically the first time you actioned a request email" · Action taken "Accepted request REQ-0007 from Marcus Webb (Parallel Systems)" · IP recorded "203.0.113.42 (Sydney, AU)"
- Footer explainer: "Consent is captured automatically the first time you action a request email (accept, decline, or reschedule). Nothing was sent before this point. This record is append-only and cannot be edited."

### Inline section-edit pattern (NEW exec pattern — VP2)

Clicking Edit on an inline-editable section flips THAT card to edit mode in place:

- The Edit link becomes "● Editing" — italic Inter 12px `--portal-emerald` with small emerald dot prefix.
- Field values become form controls: long-text fields → textareas on warm-cream `--portal-page` bg (locked vendor T5 textarea treatment: 1px `--portal-line` border, 8px radius, 12px y / 14px x padding, auto-grow, min ~3 lines); enum fields → single-select dropdowns.
- Card footer: hairline + right-aligned Ghost "Cancel" + Primary `--portal-emerald` "Save changes".
- Other sections dim to ~0.6 opacity while edit mode is active (verify-at-port — see below).

Applies to: You, Business context, Calendar (timezone/window), Requests. NOT to Your charity / Consent record (no edit), NOT to EA (drawer).

### EA drawer (VP3 — edit/action drawer variant)

540px right slide-over over the dimmed page. Backdrop 20% `--portal-ink` + 2px blur (locked pattern). **Top accent bar 3px solid `--portal-emerald`** — the edit/action drawer variant, distinct from the soft-green bar on past-tense Meetings/Impact drawers (verify-at-port).

- Header: italic eyebrow "Calendar & access" + Fraunces 22px "Edit executive assistant" + italic sub-line "Your EA can see your incoming requests and act on meetings on your behalf. They cannot change your charity or your business context."
- Body: **Currently on file** (40px LP avatar + Lena Park identity + "Acting access since 4 May 2026" + ghost "Remove Lena's access" with trash glyph) · **Update details** (Name + Email warm-cream inputs, prefilled; helper "Saving sends Lena a confirmation email with a one-click access link. If you change the email to a new person, the previous address loses access immediately.") · **What Lena can do** (three numbered steps — 18px circles with 1px `--portal-line` border + ink numbers, **NOT amber-filled**: the amber variant is vendor-portal; exec register keeps it hairline-quiet. Steps: see requests + calendar / accept, decline, or forward on your behalf / request reschedules).
- Sticky footer: Ghost "Cancel" (1px line border) + Primary emerald "Save changes" — **equal-priority Save/Cancel pair, no flex-2/flex-1 weighting** (that weighting is for narrative Primary/Ghost footers on Meetings/Impact drawers; settings drawers use the equal pair).

Every EA action is recorded in the audit log as "acting for [executive]" (build-chat context; not rendered).

## Sample data (LOCKED — every exec screen must align)

- Priya Raghavan · CFO · Lumen Industries · priya@lumenindustries.com · linkedin.com/in/priyaraghavan-cfo · EXC-1042 · **Joined TheGoodIntro 9 February 2024** (consistent with 28 lifetime meetings: 16 in prior FYs + 12 this FY)
- Business context: Interested in "Operating-model overhauls in mid-market SaaS. Logistics platforms. Data spine architecture at scale." · Projects "Lumen's GTM motion shift toward enterprise data. Q3 board paper on a 14-site operational cadence overhaul." · Not interested "Cold outbound from analytics consultancies. Pre-seed pitches. Crypto / web3." · Timeline "Next 90 days" · Cadence "Once a month maximum" · Seniority "Founder-only or C-suite"
- Charity: Royal Flying Doctor Service standing nomination
- Calendar: Google Calendar · Connected · last synced 4 minutes ago · Sydney (AEST) UTC+10 · Weekdays 09:00 to 17:00
- EA: Lena Park · lena@lumenindustries.com · acting access since 4 May 2026
- Requests: Pause all requests Off
- Consent: captured Thu 15 Feb 2024 09:12 AEST · terms v1.2 · `<m-9f2c8a1b@thegoodintro.com>` · **Accepted request REQ-0007 from Marcus Webb (Parallel Systems)** (a deliberately NEW historical vendor — her first-ever actioned request predates every vendor in the current samples; do NOT swap in a currently-pending vendor like Theo Markham) · IP 203.0.113.42 Sydney

## Data sources per module (build-chat reference)

| Module | Source | Notes |
|---|---|---|
| You · name/title/company | `executive.name`, `.title`, `.company` | Admin-entered at create |
| You · avatar | `executive.photo_url` (existing field) | Photo-primary, initials fallback |
| You · email | `executive.primary_email` | Where request emails go |
| You · LinkedIn | `executive.linkedin_url` — **NEW FIELD** | See NEW data fields below |
| You · footer | `executive.id` (display EXC-format) + `executive.created_at` | |
| Business context · 6 fields | structured business-context fields per the locked Admin New Executive form | **DATA_MODEL.md gap**: the Executive table currently holds a single `context_notes` text + `suggested_cadence`; the locked admin form captures 6 structured fields. Build chat reconciles the schema to the form (the form wins). |
| Business context · dropdown enums (edit mode) | SAME enum source as the Admin New Executive form selects | One shared enum; the mockup's option values are placeholders pending that check |
| Your charity | `executive.default_charity_id` → `charity.name`, `charity.cause`, `charity.logo_url` | Read-only here; changes via locked picker modal / My charity |
| Calendar status + last sync | calendar connection entity (per locked Admin Calendar & EA module; exact schema with build chat) | Free/busy read only |
| Timezone / preferred window | same admin module fields | |
| EA identity | `executive.ea_id` → `ea.name`, `ea.email` + EAAssignment link | |
| EA drawer Save | updates EA record + sends confirmation email with one-click access link; email-change revokes previous address immediately | Audit log entry "acting for [executive]" on every EA action |
| EA drawer Remove | clears EAAssignment + revocation email | Confirm dialog at build (not designed) |
| Requests · Pause | `executive.status` active ↔ paused | Destination of the dashboard footer "Pause requests" link |
| Consent record · all fields | consent capture record per DEC-9/DEC-10 (timestamp, terms version, message-id, actor, action, IP) | Append-only; mirror of the locked Admin Consent record module |
| Section Edit / Save | per-section PATCH; only the section's fields | Save disabled until dirty (build behaviour) |

## NEW data fields required from this lock

- `executive.linkedin_url text NULL` — kept per the exec brief's capture checklist ("LinkedIn, one-time OAuth"); powers the post-meeting LinkedIn share. **Admin side needs a Pass B input** on the New Executive form / Executive detail Overview (currently not captured there).
- **Schema reconciliation (not a new field, a gap):** structured business-context fields vs DATA_MODEL.md's single `context_notes`. The locked admin form's 6 fields win; build chat migrates accordingly.
- Calendar connection / timezone / preferred-window fields exist on the locked admin module but are not yet in DATA_MODEL.md's Executive table — build chat schematises with the calendar integration work.

## Verify-at-port items (spec-correct; not clearly visible in locked screenshots)

1. **EA drawer top accent bar** — 3px solid `--portal-emerald` spanning the drawer width. If missing on export, add.
2. **VP2 dimming** — non-editing sections at ~0.6 opacity while Business context is in edit mode. Cosmetic; if missing, add at port.

## Open decisions parked (do NOT silently resolve)

- ~~**Photo change affordance** in the You section's edit mode (camera-icon overlay on the avatar → file picker). Not designed; pair with the vendor-photo-upload Pass B.~~ **RESOLVED 2026-06-12 on Exec Small States Batch** (VP4) — 28px white camera chip on the avatar + "Change photo" link, EDIT-MODE ONLY. Vendor-side photo upload remains a separate Pass B; vendor design pause stands.
- ~~**Calendar DISCONNECTED read state** — Connect Google Calendar / Connect Outlook buttons replacing the Calendar field rows + a connect drawer. Not designed; the Meetings List connect banner is the interim affordance.~~ **RESOLVED 2026-06-12 on Exec Small States Batch** (VP2) — "No calendar connected." + Connect buttons going STRAIGHT to provider sign-in; there is NO in-portal connect drawer (decision baked in). Timezone + window rows render regardless of connection.
- ~~**EA EMPTY state** — "No executive assistant on file" + Invite CTA opening the VP3 drawer with empty fields and no Currently-on-file block. Not designed.~~ **RESOLVED 2026-06-12 on Exec Small States Batch** (VP2 + VP3) — empty subsection with ghost "Add an assistant" + the "Add executive assistant" drawer (empty sibling; footer primary "Send access link").
- **Dropdown enums** — Timeline / cadence / seniority option lists must be pulled from the admin form's locked enum at build; mockup values are placeholders.
- **"View as EA" admin affordance** (parked on the Admin Executive detail lock) — when designed, its read-only banner treatment should reuse this page's read-state anatomy. Cross-reference only.
- **Pause semantics** — pausing stops NEW requests only; already-confirmed meetings unaffected (locked copy). Whether pause also hides the exec from vendor discovery surfaces is a build/product call tied to the admin Hide state. Confirm with Issy at build.

## Anti-list (do not regress)

- **READ is the default.** Form controls appear only after Edit is clicked. Never render the page as a form.
- **ADMIN PARITY** — no field without an admin-side counterpart. No phone. No request cadence / batching / quiet hours.
- **No stat mini-strip** on this page (one-off departure; identity/settings page).
- **No Edit link** on Your charity or Consent record.
- **NO SAGE on the exec portal** — the consent block is warm-cream `--portal-page`. Sage stays admin/staff-only.
- **Numbered-step circles are hairline + ink on exec**, never amber-filled (amber variant is vendor-portal).
- **The mono message-id is the ONE mono usage** on this page.
- **Never "matching engine" on exec surfaces** — admin-only framing.
- **Drawer accent bar mapping:** emerald = edit/action drawers; soft-green = past-tense record drawers (Meetings/Impact). Do not mix.
- **Settings-drawer footer = equal Cancel/Save pair**; narrative drawers keep flex-2/flex-1 Primary/Ghost.
- **Charity changes never happen on this page** — modal-only pattern owns it.
- Single emerald accent: charity name, "● Editing" label, drawer accent bar, Save CTAs. Nothing else.
- No emoji · no em or en dashes ("·" separator; ranges may use "to") · hairlines not shadows · photo-primary avatars at locked sizes.
- **Forbidden vocab** (brand-wide): marketplace, magic, wizard, coaching, program, MeetMagic, AlphaSights.

## Issy's fix passes (the design narrative)

Locked in a single Claude Design pass. The quality work happened BEFORE the prompt was issued: Issy asked "does the prompt match the areas we have built on the admin side?" and the pre-paste parity check against the locked Admin New Executive form, Admin Executive detail, and DATA_MODEL.md caught: an invented Phone field (cut), an invented Communication section — request cadence / batching / quiet hours (trimmed to Pause only), a sage-tinted consent block that violated the exec register (re-toned warm cream), amber-filled step circles (re-toned hairline), an impossible "Joined 14 March 2026" date (corrected to 9 February 2024), and a consent sample naming a currently-pending vendor as the first-ever actioned request (replaced with historical Marcus Webb / Parallel Systems). The corrected prompt rendered clean first time.

## NOT designed in this pass (deferred)

- You-section edit mode viewport (inline pattern locked via Business context; You follows it).
- Photo upload / change affordance.
- Calendar disconnected state + connect drawer.
- EA empty state (invite-first flow).
- Pause toggle interaction (on state, confirm dialog if any).
- Loading / skeleton / error states.
- Mobile viewport (drawer → bottom sheet; sections stack natively).
- EA Mode "Acting for Priya" banner (cross-cutting; still queued).
