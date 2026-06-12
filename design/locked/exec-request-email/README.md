# Exec Request Email + Action Pages — LOCKED 2026-06-12

Designed and locked in Claude Design 2026-06-12. **The most important surface
in the product and the FINAL desktop design lock** — with this, gap #1 of the
2026-06-11 whole-portal gap audit closes and the v2 platform is
design-complete on desktop (only the trailing mobile portal pass remains).
Executives are email-first: this email must stand entirely on its own, and
the pages its buttons open are tapped from phone inboxes — **everything here
is mobile-first at 390px; desktop just centers the column.**

Claude Design file: **"TheGoodIntro Request Email"**. Includes a "Notes on
the file" board (build context + open items) that is part of the export.

**Important build context:** the build chat already proved the SENDING
pipeline live (real test email delivered 2026-06-11 via the workspace
domain). That test used placeholder styling that violates locked rules (flat
"$900", mono uppercase headers, VERIFIED pill, "Send to my EA"). This lock is
the paint for that working plumbing — the build restyles the existing
pipeline to this design; nothing here re-litigates delivery.

## Viewports

| VP | Surface | State |
|---|---|---|
| 1 | Request email · MOBILE 390 | The canonical render |
| 1b | Request email · DESKTOP 600 | Same content at standard email width; buttons 3-across |
| 2 | Accept confirmation page · mobile | First-action state (consent footnote rendered) |
| 3 | Decline page · mobile | Reason offered — four chips (Not relevant · No capacity · Bad timing · Other) + Skip |
| 3b | Decline page · mobile | "Other" OPEN — selected chip + textarea + Send |
| 4 | Send-to-EA confirmation · mobile | Sent + optional note block ("Anything Lena should know?") |
| 5 | Portal decline modal · desktop 1440 | Same flow inside `/exec/requests`; four chips, Cancel + Decline request footer |

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "TheGoodIntro Request Email" → File > Export HTML |
| `screenshot-vp1-email-mobile.png` | TO DROP | Full mobile email |
| `screenshot-vp1b-email-desktop600.png` | TO DROP | Desktop 600 email |
| `screenshot-vp2-accept-confirm.png` | TO DROP | Accept confirmation |
| `screenshot-vp3-decline.png` + `screenshot-vp3b-other-open.png` | TO DROP | Decline closed + Other open |
| `screenshot-vp4-send-to-ea.png` | TO DROP | Send-to-EA with note block |
| `screenshot-vp5-portal-decline-modal.png` | TO DROP | Portal modal |
| `screenshot-notes-board.png` | TO DROP | Notes on the file board |

## Cold-chat read order

1. [`../../../EXECUTIVE_PORTAL_BRIEF.md`](../../../EXECUTIVE_PORTAL_BRIEF.md) §"The email surface" + §Consent — the workflow this implements (admin-confirmed booking, follow-up cadence, consent binding).
2. [`../exec-incoming-requests/README.md`](../exec-incoming-requests/README.md) — the locked portal twin of this content (same request, same Q1/Q2 heads + bodies, same sample); its parked decline-with-reason item is RESOLVED here.
3. [`../../../GMAIL_INTEGRATION_CONTRACT.md`](../../../GMAIL_INTEGRATION_CONTRACT.md) + [`../../../ADMIN_INBOX_SPEC.md`](../../../ADMIN_INBOX_SPEC.md) — where replies to this email land (the reply invitation depends on these).
4. [`../../../FACTS.md`](../../../FACTS.md) / [`../../../CALCULATIONS.md`](../../../CALCULATIONS.md) — the indicative-gift rule. NO money hardcoded.
5. [`../../../DATA_MODEL.md`](../../../DATA_MODEL.md) — Request entity (`q1/q2`, `attendee`, `decline_reason`, statuses); email-action-link security is the deferred email-actions doc.
6. Open `screen.html` + screenshots.

## What is locked

### The email (VP1 mobile / VP1b desktop 600)

White card on warm cream. Top to bottom: small wordmark (Fraunces colour
split) · italic eyebrow "A request for your time" · "Hi Priya," + lead
("Sam Patel, Head of RevOps at Acme Robotics, has requested 30 minutes with
you. He has been verified and reviewed.") · VENDOR CARD (warm-cream tint
panel: 48px "SP" avatar, name, "Head of RevOps · Acme Robotics", italic
credibility "8 years at Workday and Snowflake before joining Acme in 2024.",
italic verification "ABN verified · Founder reviewed · View Sam on LinkedIn
↗") · Q1 (italic eyebrow "What they want to discuss" + Fraunces head +
body) · Q2 (italic eyebrow "Why you, specifically" + Fraunces head + body
indented with 2px emerald left rule) · proposed time (Fraunces "Tuesday, 9
June · 10:00 AEST" + "30 min · Zoom") · GIFT BLOCK (light emerald wash,
heart outline: **"If you accept, approximately $1,000 directs to Royal
Flying Doctor Service."** + italic "Your standing nomination. The exact gift
is confirmed after the meeting. Reply CHARITY to direct this meeting's gift
to a different DGR-endorsed charity, just this once.") · THREE ACTIONS
(primary emerald "Accept" · ghost "Decline" · ghost "Send to Lena (EA)" —
the EA's real name renders when one is linked; stacked full-width on mobile,
3-across on desktop) · quiet italic "Accepting holds nothing yet. We check
your calendar, confirm a time with you, and send the invites." · **reply
invitation**: italic "Questions? Just reply to this email. It reaches a real
person." · hairline · "TheGoodIntro · invite-only · Australia · Email
preferences".

Q1/Q2 heads + bodies are the locked `/exec/requests` Card 1 content
(`request.q1_head/q1_text/q2_head/q2_text`) — the email and the portal card
are the SAME request rendered twice; they must never drift.

### Action pages (VP2–VP4) — standalone public template

Warm cream page, NO portal chrome, wordmark centered top, content centered,
tap targets ≥ 48px, opened from tokened email links.

- **Accept (VP2)**: emerald-wash check circle · Fraunces "Done. We're
  finding a time." · italic sub · three hairline-ink numbered steps (read
  free/busy and propose a slot → we confirm and invites go to both → after
  the meeting, approximately $1,000 to RFDS in your name) · consent
  footnote "By continuing you accept TheGoodIntro's Terms."
- **Decline (VP3/3b)**: "Declined." — THE DECLINE IS ALREADY DONE when this
  page renders; reason is an optional follow-up, never a gate. Italic "Sam
  will be told politely. Your name is never attached to a reason." + "Want
  to tell us why? It shapes our reply and is never sent word-for-word." +
  FOUR chips: Not relevant · No capacity · Bad timing · **Other** (selected
  Other = emerald-tint chip + warm-cream textarea "Tell us in a line or
  two" + primary emerald "Send") + quiet "Skip" + consent footnote.
- **Send-to-EA (VP4)**: forward-arrow circle · "Sent to Lena Park." —
  ALREADY FORWARDED when this page renders · italic "She can accept,
  decline, or pick a time on your behalf. We included everything she
  needs." · optional note block: italic "Anything Lena should know?
  (optional)" + textarea ("A line of context goes a long way.") + ghost
  "Send note to Lena".

### Portal decline modal (VP5)

560px modal over the locked 20% ink + 2px blur backdrop on
`/exec/requests`: Fraunces "Decline this request?" + the same sub-line +
the same four chips (Other expands the same textarea + Send pattern above
the footer) + Ghost "Cancel" + primary emerald "Decline request". This
RESOLVES the decline-with-reason Pass B item parked on the Incoming
Requests lock. Note the tense difference is deliberate: the modal asks
BEFORE the act (portal context, Cancel exists); the email page reports
AFTER it (the link already acted).

### The act-instantly pattern (locked for email actions)

Email-link actions (Decline, Send-to-EA) execute IMMEDIATELY on click;
reasons and notes are optional follow-ups on the confirmation page. No
compose screen ever gates a one-tap action.

## Sample data

The locked cross-portal sample, verbatim from `/exec/requests` Card 1: Priya
Raghavan ← Sam Patel · Head of RevOps · Acme Robotics · Tuesday, 9 June ·
10:00 AEST · 30 min · Zoom · approximately $1,000 (Acme is Band 2 — the
band NEVER renders to the exec) → Royal Flying Doctor Service (standing) ·
EA Lena Park.

## Data sources per module (build-chat reference)

| Module | Source | Notes |
|---|---|---|
| Lead + vendor card | `request.requester_user` → `vendor_user` fields + `vendor.name`; credibility `vendor_user.bio_one_liner`; LinkedIn `vendor_user.linkedin_url` | Q3 on-behalf-of: the NAMED attendee's identity renders instead (`request.attendee`) |
| Verification line | `vendor.abn` verified + founder review status | Italic text, never a badge/pill |
| Q1 / Q2 | `request.q1_head/q1_text/q2_head/q2_text` | Identical content to `/exec/requests` card |
| Proposed time | `request.proposed_at` + duration + `conference_provider` | AU locale, AEST |
| Gift amount | `bandForMeetingNumber(vendor.cycle.held + 1).rateCents` — ALWAYS prefixed "approximately" | NEVER hardcoded; exact figure locks at Held |
| Charity name | `executive.default_charity_id` → `charity.name` | Standing nomination |
| Reply CHARITY note | static copy | Reply parsing is build-side (admin inbox handles) |
| Accept link | tokened action URL → `request.status='accepted'` + admin task (AI proposes slots from free/busy; Issy confirms; invites to both sides — and to BOTH vendor emails when Q3 = on-behalf-of) | NEVER auto-book |
| Decline link | tokened URL → `request.status='declined'` immediately; page then offers reason | |
| Reason chips + Other text | → `request.decline_reason` (existing free-text field; chips store the label, Other stores the typed text) | Feeds the admin AI-drafted vendor reply; never quoted verbatim |
| Send-to-EA link | tokened URL → `request.forwarded_to_ea_at = now` + forward email to EA immediately | |
| EA note | sent to the EA with/directly after the forward; **NEW field candidate `request.ea_forward_note text NULL`** (recommend storing for audit) | Build decides storage |
| Reply invitation | replies route to the Admin Inbox per GMAIL_INTEGRATION_CONTRACT | The invitation is honest; Issy answers from one place |
| Consent footnote | renders ONLY when the exec has no consent record; first action writes the record (timestamp + terms version + action description) | Priya's real record: Feb 2024 — build gates on the record, not the mockup |
| Email fonts/buttons | Fraunces → Georgia, Inter → Helvetica fallbacks; bulletproof table buttons | Mockup shows brand fonts |
| Follow-up cadence | days 4 / 8 / 12 reminders + red admin task after the third | SEPARATE pass — not this file |

## NEW data fields from this lock

- `request.ea_forward_note text NULL` (recommended — the optional note to
  the EA; alternatively transport-only in the forward email, build decides).
- `request.decline_reason` already exists (DATA_MODEL) and covers the chips
  + Other text. Consent record storage is the existing brief requirement,
  now with a designed surface.

## Open decisions parked (do NOT silently resolve)

- **Sender address + subject line.** Recommendation: subject "Sam Patel
  (Acme Robotics) has requested 30 minutes"; sender from the workspace
  domain. Issy decides at go-live.
- **Personal founder signature vs system footer.** The live smoke test
  signed off personally ("Isobel Hardwick | Founder" + phone); the locked
  design uses the quiet system footer. There is a real concierge argument
  for the personal sign-off in an invite-only network — Issy's call at
  port; if adopted, it slots between the reply invitation and the hairline.
- **Reply-CHARITY parsing + action-link security** (token scheme, expiry,
  single-use, forwarded-link trust, GET-prefetch safety) — the deferred
  email-actions doc per DATA_MODEL.
- **Follow-up reminder emails** (days 4/8/12) and the **post-meeting
  LinkedIn share email** — separate design passes.

## Verify-at-port items

1. Desktop 600 "Send to Lena (EA)" button wraps to two lines in the render —
   give the 3-across row label-aware widths (Accept widest) so labels sit on
   one line.
2. Email renders in Gmail/Outlook with the fallback stack — visual QA against
   this design, not pixel-parity (Georgia ≠ Fraunces).
3. Decline page consent footnote renders only on first-ever action (same
   gating as Accept).

## Anti-list (do not regress)

- **The gift is ALWAYS "approximately $X."** Never a flat figure anywhere an
  exec reads, in any email or page. (The 2026-06-11 smoke test's flat "$900"
  is exactly the violation this lock kills.)
- **Never "Band" or "Tier" to an executive.** The band drives the number
  invisibly.
- **No mono uppercase, no badges/pills** (no "VERIFIED" pill — verification
  is an italic line). No emoji. No em or en dashes; "·" separator.
- **Three actions, named EA** ("Send to Lena (EA)", never "my EA"). Never a
  fourth action.
- **Accept never auto-books and the email never promises times.**
- **Decline + Send-to-EA act instantly**; reasons/notes are optional
  follow-ups, never gates.
- **Decline reasons and Other text are never sent to the vendor verbatim.**
- **Q1/Q2 content is shared with `/exec/requests`** — one source, two
  renders; never fork the copy.
- **Action pages carry no portal chrome** and no CTAs into the portal — the
  email surface stands alone.
- Single emerald accent; hairlines not shadows; editorial italic register.
- Forbidden vocab (brand-wide): marketplace, magic, wizard, coaching,
  program, MeetMagic, AlphaSights.

## Resolutions this lock makes

- `/exec/requests` parked **"Decline with reason flow"** → RESOLVED: the VP5
  modal (portal) + VP3/3b pages (email), four chips + Other. Annotated on
  the Incoming Requests README.
- The exec brief's **consent-binding UI** for email-first execs now exists
  (first-action footnote on the confirmation pages; recording mechanics stay
  build-side).

## Issy's fix passes (the design narrative)

Two passes. Pass 1 rendered the full set on spec. Pass 2 added three Issy
requests: the "Other" decline chip with free-text (+ "Other open" artboard),
the optional Send-to-EA note block, and the reply invitation under the email
buttons — all adopted with the act-instantly pattern (action first, words
optional). The 2026-06-11 live smoke test (working pipeline, placeholder
styling) prompted the personal-signature open item.

## NOT designed in this pass (deferred)

- Follow-up reminder emails (days 4/8/12) + the post-meeting LinkedIn share
  email + the gift-confirmed email — the remaining email family.
- Expired/used action-link page (sibling of the sign-in expired-link page;
  reuse that template at build).
- Reply-CHARITY confirmation email.
- Desktop renders of the action pages (the 390 column centers on desktop —
  deliberate).
