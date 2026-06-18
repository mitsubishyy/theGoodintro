# Exec My Charity — LOCKED 2026-06-11

> **Money note (2026-06-12 rule):** the "What $N funds" figure in the charity
> detail modal is the projected pre-Held band amount, so it renders "approximately
> $N" (canonical: `exec-request-email`). The bare "$N" sample copy is shorthand;
> do not port a flat figure.

Designed in Claude Design 2026-06-11. **Sixth locked exec-portal screen — completes the exec sidebar set** (Home · Meetings · Impact · My charity · Profile, plus Incoming Requests at `/exec/requests`). Route: `/exec/my-charity`.

The view-only home of the exec's standing charity nomination — the "quiet place for the fuller picture": current nomination hero, the relationship's impact, nomination history, and how the nomination works. It is **NOT the charity-change interaction surface** (the locked picker modal owns changes; this page only hosts the trigger) and it is **NOT the gift feed** (`/exec/impact` owns that; no gift rows render here).

**Register: READING surface — FULL editorial concierge** (per the locked "editorial chrome, SaaS structures inside" split: Dashboard, Incoming Requests, and My charity are full-editorial reading surfaces; Meetings and Impact are operational hybrids). No tables, no filters, no sort, no toggles, no pagination, no status columns.

Locked in a single Claude Design pass (one viewport-addition follow-up to render the two modals).

## Viewports

| VP | Route | State |
|---|---|---|
| 1 | `/exec/my-charity` | Page at rest — header + mini-strip, current-nomination hero card, nomination history feed, how-your-nomination-works steps |
| 2 | `/exec/my-charity` (modal open) | Charity PICKER modal, standing-nomination context — **exact re-render of the locked Exec Dashboard picker (VP2 of `exec-dashboard/`)**, triggered from the hero's "Change standing charity →" |
| 3 | `/exec/my-charity` (modal open) | Charity DETAIL modal — **exact re-render of the locked Exec Dashboard detail modal (VP4 of `exec-dashboard/`)**, triggered from the hero's "Learn about Royal Flying Doctor Service →" |

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Exec My Charity" → File > Export HTML |
| `screenshot-vp1-top.png` | TO DROP | Header + mini-strip + current-nomination hero card |
| `screenshot-vp1-bottom.png` | TO DROP | Nomination history feed + How your nomination works + ACNC line |
| `screenshot-vp2-picker-modal.png` | TO DROP | Picker modal open — Beyond Blue pending, RFDS marked Current |
| `screenshot-vp3-detail-modal.png` | TO DROP | Detail modal open — header + hero image + Our purpose visible |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md) — brand and pricing facts.
2. [`../exec-dashboard/README.md`](../exec-dashboard/README.md) — **canonical spec for both modals on this page** (picker = its VP2; detail = its VP4), plus shell, register, Direction Card (this page's hero is its page-scale sibling), and the 8-charity locked set.
3. [`../exec-meetings-list/README.md`](../exec-meetings-list/README.md) — universal topbar search pattern.
4. [`../exec-impact-list/README.md`](../exec-impact-list/README.md) — the by-charity numbers this page's mini-strip reuses ($21,000 / 21 / 8).
5. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) — Global decisions.
6. [`../../../CALCULATIONS.md`](../../../CALCULATIONS.md) — money rules; every $ from `@thegoodintro/pricing` + `lib/reporting.ts`.
7. Open `screen.html` + screenshots.

## What is locked

### Shell + page header

Charcoal sidebar, active on "My charity". Universal topbar search (title "My charity" left, 480px ⌘K search center-right, right edge empty).

- Italic eyebrow "Your standing nomination" + Fraunces semibold 32px H1 "My charity".
- Three-stat inline mini-strip (locked pattern — no fill, hairline dividers, single accent):
  - "$21,000" EMERALD · "sent to the Flying Doctor"
  - "21" ink · "meetings directed here"
  - "8" ink · "charities supported lifetime"
- Numbers reuse the locked Impact by-charity sample exactly (RFDS card: $21,000 · 21 meetings).

### Section A — Current nomination hero (page-scale sibling of the Dashboard Direction Card)

Full-width white card (`--portal-card-reading`, 1px line, 16px radius, 56px y padding), inner content centered max-width 640px:

96px circular charity logo (RFDS short-mark placeholder on `--portal-amber-soft`; build swaps `charity.logo_url`) → italic "Standing nomination" eyebrow → Fraunces semibold 40px "Royal Flying Doctor Service" → "Remote health services · Australia-wide" → italic "Your standing nomination since 12 May 2024." → helper paragraph ("Each meeting you accept sends a real gift here. You can direct any individual meeting to a different DGR-endorsed charity before it begins.") → hairline → italic credentials line "ABN 74 438 059 643 · Item 1 DGR · Live" → two ghost buttons side by side (white bg, 1px line border, 48px tall, upright Inter semibold + chevron):

- **"Learn about Royal Flying Doctor Service →"** — opens the charity DETAIL modal (VP3)
- **"Change standing charity →"** — opens the charity PICKER modal (VP2)

The single change-affordance on the page. Modal-only pattern; no inline selection anywhere.

### Section B — Nomination history (editorial feed, no card)

Fraunces 22px "Nomination history" + sub-line "Your standing nominations since joining. Per-meeting redirections are not shown here."

Rows on the page bg with hairlines between (same treatment as the Dashboard Recent Impact feed): 32px charity short-mark circle + Inter 14px semibold name + italic date range. Current row carries right-aligned italic `--portal-emerald` "Current".

1. Royal Flying Doctor Service · 12 May 2024 to present · **Current**
2. Beyond Blue · 9 February 2024 to 12 May 2024

Right-aligned ghost link below: "See every gift on Impact →" → `/exec/impact`.

### Section C — How your nomination works

Fraunces 22px head + three numbered steps (18px **hairline + ink** circles — the locked exec re-tone, never amber):

1. "Every meeting you accept sends the gift to your standing nomination automatically. Nothing to do."
2. "You can direct any individual meeting to a different DGR-endorsed charity before the meeting begins. Your standing nomination stays in place for everything else."
3. "Once a meeting is held, the gift is locked in and sent. It never changes after that."

Closing italic line: "All charities are verified live against the ACNC DGR register."

### VP2 — Charity picker modal (re-render of the locked Dashboard picker)

The locked Exec Dashboard README (its VP2) is the canonical spec; this page re-renders it with the standing-nomination context: title "Change your charity", sub-line "Every meeting you accept will direct your gift to your chosen DGR-endorsed charity.", Recently-directed pills (Beyond Blue pending-selected · OzHarvest · The Smith Family), the locked 8-charity list in order with Beyond Blue pending (emerald radio + row wash) and RFDS marked "Current", footer ACNC line + Ghost Cancel + Primary emerald "Set as my charity". Backdrop 20% ink + 2px blur, page recognisable behind.

### VP3 — Charity detail modal (re-render of the locked Dashboard detail modal)

Canonical spec is the Dashboard README's VP4: eyebrow "Standing nomination" header + Fraunces title + sub-line + close X, flush 180px hero image (golden-hour aircraft placeholder; build swaps `charity.hero_image_url`), four scrolling content sections (Our purpose / Three programmes on the ground / What $1,000 funds + Diamantina Shire quote / Recent stories with mono date prefixes — the one allowed mono usage), footer ACNC line + single Primary "Done". No Cancel, no Set-as-my-charity (changing belongs to the picker; stacked modals forbidden).

## Sample data (LOCKED — every exec screen must align)

- Standing nomination: Royal Flying Doctor Service · since 12 May 2024 · ABN 74 438 059 643 · Item 1 DGR · Live
- Mini-strip: $21,000 to RFDS · 21 meetings directed here · 8 charities supported lifetime (mirrors the locked Impact by-charity card)
- **Nomination history: Beyond Blue 9 February 2024 → 12 May 2024, then RFDS 12 May 2024 → present.** The Beyond Blue era is demonstration sample data (Issy-approved at lock) showing the history module with two rows. It is deliberately EARLY and SHORT so it stays consistent with Beyond Blue's 2 lifetime gifts in the locked Impact by-charity numbers, and with the Impact lock's display rule (the CURRENT standing nomination gets the "standing nomination" label; historical standing-at-the-time gifts display as "override" — accepted simplification).
- Priya joined 9 February 2024 (locked on Profile) — history starts at join. No gap days between nominations.
- Picker modal sample state: Beyond Blue pending-selected, RFDS Current, CTA enabled.

## Data sources per module (build-chat reference)

| Module | Source | Notes |
|---|---|---|
| Topbar + search | static title + command palette (Pass B) | Universal pattern |
| Mini-strip · $ to charity | `SUM(gift_record.charity_amount_cents) WHERE charity_id = executive.default_charity_id AND executive_id = ?` via `lib/reporting.ts` | Frozen-at-Held; illustrative in mockup |
| Mini-strip · meetings here | `COUNT(gift_record WHERE charity_id = executive.default_charity_id)` | |
| Mini-strip · charities lifetime | `COUNT(DISTINCT gift_record.charity_id) WHERE executive_id = ?` | |
| Hero · name / cause / logo | `executive.default_charity_id` → `charity.name`, `.cause`, `.logo_url` | |
| Hero · "since [date]" | `nomination_history` — **NEW data requirement, see below** | |
| Hero · credentials line | `charity.abn`, `.dgr_item`, `.dgr_status` | ACNC register |
| Hero · Learn about → | Opens locked charity detail modal (Dashboard VP4 component) with `executive.default_charity_id` | Reuse verbatim |
| Hero · Change standing charity → | Opens locked charity picker modal (Dashboard VP2 component), standing context | Sets `executive.default_charity_id` + appends `nomination_history` row |
| History rows | `nomination_history ORDER BY started_at DESC` | Current row: `ended_at IS NULL` |
| "See every gift on Impact →" | `/exec/impact` | |
| How-it-works steps + ACNC line | static copy | |
| Detail modal content | `charity.purpose`, `.programmes[]`, `.featured_quote`, `.stories[]`, `.hero_image_url` | All declared at the Dashboard VP4 lock |

## NEW data requirement (build-chat MUST resolve)

**Nomination history.** DATA_MODEL.md's Executive table holds only the current `default_charity_id` — no history. This page's "since [date]" line and the history section need one of:

1. **A `nomination_history` table** (`executive_id`, `charity_id`, `started_at`, `ended_at NULL`) — append a row on every standing-charity change, close the previous row. **Recommended**: cheap, queryable, and serves the admin Executive detail's Charity module too.
2. Derivation from the admin audit log (the Activity feed already records charity changes).

Build chat decides; Issy's locked sample assumes option 1's shape. First row is created at onboarding when the admin sets the initial charity.

## Verify-at-port items (spec-correct; not visible in locked screenshots)

1. **Detail modal scrolled content** — sections 3 ("What $1,000 funds" + the Diamantina Shire quote block) and 4 ("Recent stories", two cards with mono date prefixes) sit below the modal's scroll fold in the locked screenshot. The export must match the Dashboard VP4 spec exactly.
2. **Picker list below the fold** — rows 4–8 (The Smith Family / Black Dog Institute / Australian Red Cross / Cancer Council Australia / Australian Conservation Foundation) must complete the locked 8-set in order.
3. **Hero image** is a generic aircraft placeholder — fine; build swaps curated charity photography per the standing rule.

## Open decisions parked (do NOT silently resolve)

- **nomination_history table vs audit-log derivation** — recommendation above; build chat call.
- **Admin mirror of nomination history** — the admin Executive detail's Charity module currently shows the chosen-charity chip + past-gifts table. When next touched, consider surfacing the nomination history there too (same data). Not a blocker.
- **History row click behaviour** — currently inert (no drawer, no navigation). If execs want "what did I give while Beyond Blue was my nomination," Impact's by-charity view answers it. Leave inert for v1.

## Anti-list (do not regress)

- **FULL editorial register.** No tables, filters, sort, segmented toggles, pagination, or status columns on this page. It is a reading surface.
- **This page never changes the charity itself.** The picker modal does. One change-affordance only (the hero ghost button). No inline selection, no dropdown, no second trigger.
- **No gift rows** — Impact owns the feed. The history section lists NOMINATIONS, not gifts.
- **No donation/payment UI of any kind.**
- **The two modals are locked components reused exactly** — canonical specs live in `exec-dashboard/README.md` (VP2 + VP4). Never redesign, retitle, or restyle here. **No stacked modals**: the picker never chains to the detail modal.
- **8 charities: locked set and order** on every picker surface portal-wide.
- **"ACNC DGR register"** is the locked verification phrase (never ABR).
- Mini-strip: no fill, single-accent on stat 1 only.
- Numbered-step circles hairline + ink (never amber on exec).
- Mono appears ONLY inside the detail modal's story date prefixes.
- Money figures illustrative; production reads `@thegoodintro/pricing` + `lib/reporting.ts`.
- No emoji · no em or en dashes ("·" separator; date ranges use "to") · hairlines not shadows · single emerald accent.
- **Forbidden vocab** (brand-wide): marketplace, magic, wizard, coaching, program, MeetMagic, AlphaSights.

## Issy's fix passes (the design narrative)

Locked in one pass plus one viewport addition: VP1 rendered complete and clean on the first paste; VP2/VP3 (the two modals) were added via a short follow-up prompt and re-rendered the locked Dashboard modal anatomy faithfully (picker: pending Beyond Blue pill + radio + row wash, RFDS "Current", ACNC footer; detail: eyebrow header, flush hero, single Done footer). No drift found; no fix passes needed.

## NOT designed in this pass (deferred)

- Empty/edge states — none needed: every exec has a standing charity from onboarding (`default_charity_id` set by admin) and history always has ≥ 1 row.
- Loading / skeleton states.
- Mobile viewport (modals become bottom-sheets per the standing note; hero card stacks naturally).
- EA Mode "Acting for Priya" banner (cross-cutting; the final remaining exec design item).
- History row interactivity (inert in v1 — see Open decisions).
