# Exec Incoming Requests — LOCKED 2026-06-09

> **Money note (2026-06-12 rule):** every card here is PRE-Held, so its gift
> figure renders "approximately $N" (the projected band amount; canonical:
> `exec-request-email`). The bare "$N" in the sample copy below is shorthand; do
> not port a flat figure. The amount still varies by the vendor's band.

Designed in Claude Design 2026-06-09. **Second locked exec-portal screen** (after
the Exec Dashboard). The all-pending batch review surface. Route: `/exec/requests`.

The page renders every pending incoming request as a full-detail card stacked
vertically. Priya batch-reviews instead of bouncing in and out of single-request
detail pages. The dashboard's compact Incoming widget links here for the full
review; "More about [vendor] →" on each dashboard row also routes here (with a
hash anchor scrolling to the specific request — build-chat decision on exact
deep-link format).

Two viewports: VP1 LOADED with four requests + Up-to-date footer; VP2 EMPTY
STATE with the sanctioned party-popper emoji + warm Fraunces hero.

## Viewports

| VP | Route | State |
|---|---|---|
| 1 | `/exec/requests` | Loaded — 4 requests stacked, ordered by proposed meeting date ascending (soonest first); Up-to-date footer at the bottom |
| 2 | `/exec/requests` (empty state) | Zero requests pending — centered emoji hero |

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Exec Request Detail" → File > Export HTML |
| `screenshot-vp1-hero-card1.png` | TO DROP | Top of VP1 — back row + Four requests hero + Card 1 (Sam Patel) |
| `screenshot-vp1-cards-234.png` | TO DROP | Cards 2 (Theo Markham), 3 (Naomi Brooks), 4 (Hana Okonkwo) in sequence |
| `screenshot-vp1-footer.png` | TO DROP | "You're all caught up." footer below Card 4 |
| `screenshot-vp2-empty-state.png` | TO DROP | VP2 empty state — emoji + italic Fraunces hero + sub-line |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md) — brand and pricing facts.
2. [`../exec-dashboard/README.md`](../exec-dashboard/README.md) — exec portal shell + editorial concierge register + photo-primary avatars + sample data context. This screen inherits all of it.
3. [`../../../EXECUTIVE_PORTAL_BRIEF.md`](../../../EXECUTIVE_PORTAL_BRIEF.md) — exec portal workflows.
4. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) — Global decisions for the editorial concierge register + photo-primary avatars.
5. [`../../../CALCULATIONS.md`](../../../CALCULATIONS.md) — every $ figure reads from `@thegoodintro/pricing` + `lib/reporting.ts`. NO money is hardcoded.
6. [`../../../STATE_MACHINES.md`](../../../STATE_MACHINES.md) — request → meeting lifecycle.
7. Open `screen.html` + screenshots.

## What is locked

### Exec portal shell (inherited from Exec Dashboard, applied here)

Sidebar 240px charcoal ink + companion tokens · 56px topbar with content-empty right side · `--portal-page` warm cream main bg. Sidebar active state on "Home" — this URL (`/exec/requests`) is a child of `/exec` and inherits the parent route's active nav.

**Topbar label**: "Incoming requests" (Inter 14px semibold `--portal-ink` left). ~~Nothing on the right.~~ **AMENDED 2026-06-10 (universal topbar search, locked on Exec Meetings List):** the universal search input (480px, ⌘K chip, italic placeholder) sits center-right on every exec page including this one, applied retroactively at build time — this mockup is not redesigned. The right EDGE stays content-empty (no bell, no help, no date). Full search spec: `../exec-meetings-list/README.md`.

### Back row (per portal blueprint §2)

24px outline chevron-left + 8px gap + "Back" Inter 14px semibold `--portal-ink`. No fill, no border. Hover: `--portal-card-hover` subtle bg. Click → `/exec` (the dashboard — parent route, NOT browser history).

48px gap below the back row before the hero.

### Editorial concierge register (inherited, applied here)

- Section heads on cards: Fraunces semibold 18px
- Inline eyebrows: italic Inter 12px muted
- ZERO mono uppercase on this page — no transaction feed, no pagination helper
- Status copy as plain italic text (no pills, chips, badges)
- Single emerald accent
- 1.6px stroke outline icons only
- No em dashes, no en dashes; "·" as separator
- 72px section gaps NOT used here — gaps are tighter inside each card (32px) and between cards (24px) to keep the batch review surface scannable
- No drop shadows; hairlines only

### Page hero — VP1

Fraunces semibold 48px `--portal-ink`, centered: "Four requests"

Tried-and-removed: an emerald marker-highlight band behind the text. Both treatments — coloring the text emerald, and a soft-emerald wash band behind it — were tried in iteration; Issy reverted to plain Fraunces ink for cleaner editorial weight. **Do NOT re-introduce a highlight unless Issy asks.**

No sub-line under the hero. The hero stands alone.

32px gap below the hero before Card 1.

### Card anatomy (identical for all four cards)

Each card is the single-request-detail layout that was iterated and locked on
2026-06-09:

- White `--portal-card-reading` bg, 1px `--portal-line` border, 16px border radius, 32px internal padding
- max-width 960px, centered on the page
- 24px vertical gap between adjacent cards
- TWO-COLUMN GRID at the top (within the card padding):
  - LEFT rail (280px): identity block + hairline + proposed time block + hairline + verification block (4 stamps)
  - VERTICAL 1px `--portal-line` hairline between columns (spans only the height of the two-column section, NOT the full card)
  - RIGHT column (flex 1, ~600px): Q1 (italic eyebrow + Fraunces semibold 18px sub-head + Inter 14px body 1.55 line-height) + 32px gap + hairline across right column only + 32px gap + Q2 (same pattern, body indented 16px with 2px `--portal-emerald` left rule)
- Both columns end at the natural taller column's height (no forced equal-height)
- FULL-WIDTH 1px `--portal-line` hairline across the entire card interior, below where both columns end
- 32px gap
- FULL-WIDTH GIFT BLOCK: italic "If you accept" eyebrow + horizontal row with 48px round RFDS logo + 16px gap + vertical stack (Fraunces semibold 20px `--portal-emerald` "$N to Royal Flying Doctor Service" + 4px + italic Inter 13px muted "Your standing nomination") + 12px gap + italic Inter 13px muted helper "You can direct this individual meeting to a different DGR-endorsed charity after it is confirmed."
- 32px gap
- FULL-WIDTH ACTION ROW: three buttons in a horizontal row, equal flex, 16px gap, 48px tall, 10px radius:
  - Primary `--portal-emerald` "Accept this meeting"
  - Ghost "Decline"
  - Ghost "Forward to Lena (EA)"

### Sample data — four locked cards (ordered soonest meeting first)

**Card 1 — Sam Patel · Head of RevOps · Acme Robotics**
- Avatar: SP initials, photo-primary if `sam@acmerobotics.com` has uploaded
- Credibility: "8 years at Workday and Snowflake before joining Acme in 2024."
- LinkedIn outbound: "View Sam on LinkedIn ↗"
- Submitted: Friday, 6 June
- Proposed time: Tuesday, 9 June · 10:00 AEST · 30 min · Zoom
- Verification: ABN 12 345 678 901 · Founder review · no flags · LinkedIn confirmed · Trade references · three of three
- Q1 head: "Acme's GTM shift from enterprise to mid-market"
- Q1 body: full locked copy ("We're rebuilding our GTM motion at Acme Robotics. Moving from a 12 month enterprise sales cycle to a 6 month mid-market motion. I would love to talk through how Lumen Industries handled the shift from custom builds to platformed deployments. Specifically: how you sequenced the operational changes (procurement, IT, training) so the bottom line did not take a hit during the transition. We are staring down the same problem and the operating model is what scares me, not the tech.")
- Q2 head: "Operating discipline at scale"
- Q2 body: full locked copy ("You ran the operating-model overhaul at Workday from 2017 to 2019. I worked under one of your RevOps leads there and saw firsthand how disciplined your platform decisions were. At Lumen you have kept that discipline but applied it to a much messier supply chain. Acme is mid-market logistics-tech, and our customers look like Lumen's suppliers. Your perspective on what 'good' looks like operationally would mean more than ten consultancy decks.")
- Gift: $1,000 to Royal Flying Doctor Service (Band 2 — Acme is mid-cycle)

**Card 2 — Theo Markham · Founder · Latch Health**
- Avatar: TM initials fallback
- Credibility: "ex-McKinsey, scaled Latch from seed to Series A"
- Submitted: Wednesday, 4 June
- Proposed time: Thursday, 11 June · 14:00 AEST · 45 min · Zoom
- Verification: ABN 76 234 891 002 · Founder review · no flags · LinkedIn confirmed · Trade references · three of three
- Q1 head: "Scaling clinical operations across multiple states"
- Q1 body: full locked copy (NSW + VIC simultaneous rollout, make-vs-buy clinical infrastructure, 30 days from board paper)
- Q2 head: "Operating across regulated regimes"
- Q2 body: full locked copy (Lumen logistics regulation analogue, AFR WA expansion interview reference)
- Gift: $900 to Royal Flying Doctor Service (Band 1 — Latch is early-cycle)

**Card 3 — Naomi Brooks · VP Sales · Beacon Procurement**
- Avatar: NB initials fallback
- Credibility: "12 years in enterprise procurement; ex-SAP, ex-Coupa"
- Submitted: Sunday, 8 June
- Proposed time: Monday, 15 June · 10:30 AEST · 30 min · Teams
- Verification: ABN 41 558 770 412 · Founder review · no flags · LinkedIn confirmed · Trade references · three of three
- Q1 head: "Holding pricing discipline through a soft cycle"
- Q1 body: full locked copy (annual uplift pushback, indefensible discount stack)
- Q2 head: "Pricing under finance scrutiny"
- Q2 body: full locked copy (Lumen margin discipline through two macro down-cycles, CFO board prep)
- Gift: $1,100 to Royal Flying Doctor Service (Band 3 — Beacon is established)

**Card 4 — Hana Okonkwo · Co-founder & COO · Vesta Climate**
- Avatar: HO initials fallback
- Credibility: "ex-Atlassian; COO at Vesta since 2025"
- Submitted: Monday, 9 June (today)
- Proposed time: Wednesday, 17 June · 11:00 AEST · 30 min · Zoom
- Verification: ABN 12 008 442 109 · Founder review · no flags · LinkedIn confirmed · Trade references · three of three
- Q1 head: "Sequencing deals when the sponsor isn't the budget holder"
- Q1 body: full locked copy (sustainability function buyers vs procurement/finance decision-maker split, GTM model recut)
- Q2 head: "The procurement-vs-economic-buyer split"
- Q2 body: full locked copy (Workday + Lumen playbook reference)
- Gift: $1,000 to Royal Flying Doctor Service (Band 2 — Vesta is mid-cycle)

**Charity is constant** across all four cards — Priya's standing nomination is Royal Flying Doctor Service, so every card reads "$N to Royal Flying Doctor Service" with N varying by the vendor's band (1/2/3/4 → $900/$1,000/$1,100/$1,200). The redirectable helper line is identical on every card.

### Up-to-date footer — VP1

Below Card 4, 48px gap. Sits directly on warm cream `--portal-page` — no card wrapper, no hairline above.

- Fraunces italic 20px `--portal-ink`, centered: "You're all caught up."
- 8px gap
- Italic Inter 13px `--muted-foreground`, centered: "Nothing else awaiting your answer. We pace your queue so nothing piles up."

72px page bottom padding below the footer.

This is the **loaded-state completion footer** — "you finished reviewing the four pending." Distinct from VP2's hero, which says "there are zero pending in the first place."

### VP2 — empty state (zero pending requests)

Same shell, same back row, same topbar "Incoming requests". No cards. No up-to-date footer. The entire main content area renders the empty-state hero centered, vertically positioned around 28% from the top:

- 🎉 (party popper emoji), centered, ~56px size
- 32px gap
- Fraunces semibold italic 40px `--portal-ink`, centered: "You're all caught up."
- 16px gap
- Italic Inter 14px `--muted-foreground`, centered, max-width 520px: "Nothing else awaiting your answer. We pace your queue so nothing piles up."

**SANCTIONED EMOJI EXCEPTION** — Issy approved 🎉 specifically for VP2 of this surface on 2026-06-09. This is the ONLY surface in the portal that uses an emoji. Do NOT propagate to any other exec, vendor, or admin surface; do NOT add a second emoji here; do NOT swap the party popper for any other emoji without Issy's approval. The exception is narrow.

### Data sources per module (build-chat reference)

| Module | Source | Notes |
|---|---|---|
| Hero count "Four requests" | `count(request WHERE executive_id = current_executive_id AND status='submitted')` formatted as a word ("Four", "Three", etc. — word form for < 10, numeral for ≥ 10) | If count is 0, render VP2 instead of VP1 |
| Card identity (name, role, company) | `request.requester_user` → `vendor_user.name`, `vendor_user.title`, `vendor.name` | Q3 of vendor form determines requester identity |
| Card avatar | `vendor_user.photo_url` photo-primary, initials fallback | NEW data field — see Exec Dashboard README |
| Card credibility line | `vendor_user.bio_one_liner` | NEW data field — a short headline distinct from the full vendor portal bio; admin-curated or vendor-self-edited, max ~120 chars |
| Card LinkedIn outbound | `vendor_user.linkedin_url` | Opens in new tab |
| Card Submitted date | `request.submitted_at` formatted "Submitted [Weekday], [Day] [Month]." | Locale: AU |
| Card proposed time | `request.proposed_at` → "Tuesday, 9 June · 10:00 AEST" Fraunces 16px + "30 min · Zoom" Inter 12px muted | Conference provider from `request.conference_provider` |
| Card verification stamps | `vendor.abn` + `vendor.founder_review_status` + `vendor.linkedin_verified_at` + `vendor.trade_references_returned_count` | Static helper text per stamp |
| Card Q1 head + body | `request.q1_head` (NEW — admin-curated short title for the topic, distinct from the body) + `request.q1_text` from the vendor form | Heads need admin curation OR can be auto-summarised pre-Held; defer the auto-summary decision to build chat |
| Card Q2 head + body | `request.q2_head` + `request.q2_text` | Same pattern as Q1 |
| Card gift amount | `bandForMeetingNumber(vendor.cycle.held + 1).rateCents` → $900 / $1,000 / $1,100 / $1,200 | Indicative pre-Held |
| Card charity name | `executive.default_charity_id` → `charity.name` | Standing nomination |
| Card RFDS logo | `charity.logo_url` | Scraped, weekly re-fetch |
| Card Accept | mutation: `request.status = 'accepted'` + admin task created | |
| Card Decline | mutation: `request.status = 'declined'` (optional reason captured in a future Pass B modal) | |
| Card Forward to Lena (EA) | mutation: `request.forwarded_to_ea_at = now` + email to EA | |
| Up-to-date footer | rendered when VP1 has ≥ 1 card (it's the loaded-state completion footer; distinct from VP2's empty-state hero) | |
| VP2 hero (zero requests) | rendered when count == 0 | 🎉 emoji is rendered as a literal Unicode character |

NEW data fields required from this lock that the build chat must add:
- `vendor_user.bio_one_liner text` — the short headline shown below the role · company line on each card
- `request.q1_head text NULL` and `request.q2_head text NULL` — admin-curated topic titles for the Q1 + Q2 bodies (or auto-summarised by an AI step at request creation; build chat decides)

## Open decisions parked (do NOT silently resolve)

- **Q1 + Q2 head curation source** — admin-curates per request, OR an AI step auto-summarises the body into a head at request creation. Build chat decides; Issy's preference is admin curation for tone control.
- **Dashboard rework cross-reference (RESOLVED 2026-06-09)** — the Exec Dashboard's locked Incoming widget was reworked 2026-06-09 to a compact list view that links HERE. The dashboard's compact widget footer link "Review all four requests →" navigates to `/exec/requests`; each row's "More about [Vendor] →" link navigates to `/exec/requests` anchored to the specific request id. See `design/locked/exec-dashboard/README.md` (re-locked 2026-06-09).
- **`/exec/requests/[id]` deep-link** — should an individual request have its own URL so email Accept/Decline confirmation links can deep-link to that single request? Default: yes, render the per-ID URL as the same page scrolled and anchored to the right card. Build-chat decision.
- ~~**Decline with reason flow** — what happens when an exec taps Decline? Current spec: status flip + admin task. A "with reason" modal (small textarea) would give vendors feedback. Deferred to Pass B.~~ **RESOLVED 2026-06-12 on Exec Request Email + Action Pages** — the portal decline modal is designed and locked (four chips: Not relevant · No capacity · Bad timing · Other with free-text; reasons go to admin to shape the vendor reply, never sent verbatim; the decline itself is never gated on a reason). Email-side twin pages locked in the same file. See `../exec-request-email/README.md` VP5.
- **Forward to EA acknowledgment** — when an exec taps "Forward to Lena (EA)", what does Lena see? EA Mode banner is queued; the forward affordance assumes Lena can see and act on forwarded requests inside her version of this surface. Cross-design with EA Mode banner Pass B.

## Anti-list (do not regress)

- **The party popper emoji 🎉 appears ONLY on VP2.** Not on any other exec / vendor / admin surface. The exception is narrow and sanctioned for this empty state only.
- **No emerald highlight on the "Four requests" hero.** Tried, didn't land, reverted to plain ink. Do NOT re-introduce without Issy asking.
- **The Up-to-date footer (VP1) and the VP2 empty-state hero are DIFFERENT states.** VP1 footer = "you finished reviewing four pending." VP2 hero = "there are zero pending in the first place." Both stay.
- **Four cards stacked at full anatomy** — no collapsed/expanded toggle, no pagination indicator, no "1 of 4" pill on any card. The footer signals completion.
- **Three actions per card** (Accept / Decline / Forward to Lena (EA)). Never a fourth. No "Snooze."
- **Action labels are identical across all four cards.** Do not vary copy per card.
- **Charity is identical** across all four cards (Royal Flying Doctor Service — Priya's standing nomination). Only the $ amount varies by vendor band.
- **No mono uppercase anywhere on this page.** This is an editorial concierge surface.
- **No status pills / chips / badges.** Status reads as plain italic text in verification stamps and dates.
- **No drop shadows.** Hairline borders only.
- **No em dashes, no en dashes.** Use "·".
- **Cards stay WHITE** (`--portal-card-reading`). Page stays WARM CREAM (`--portal-page`).
- **Sidebar, topbar, back row** unchanged across both viewports.
