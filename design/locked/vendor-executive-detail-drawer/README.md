# Vendor Executive Detail Drawer — LOCKED 2026-06-06 (pending the wordmark call)

Designed in Claude Design 2026-06-06. **Third locked vendor-portal screen.**
**First vendor application of the locked drawer pattern** (previously admin-only:
Pay batch, Gmail OAuth, Charity detail). Single viewport: drawer in OPEN state
overlaying the locked Executives List.

A vendor clicks a row on the Executives list → drawer slides in from the right with
that exec's identity, bio, supported charity, year joined, and a "what happens next"
explainer. Primary CTA "Request a meeting →" routes to the standalone Vendor
Request Form (see `vendor-request-form/`).

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Executive Detail" → File > Export HTML |
| `screenshot-drawer-open.png` | TO DROP | VP1 — Drawer open over the Executives List, Priya Raghavan |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md).
2. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) §"Vendor Executive Detail Drawer" + Global decisions for "WHAT HAPPENS NEXT" numbered explainer pattern.
3. [`../vendor-executives-list/README.md`](../vendor-executives-list/README.md) — backdrop list this drawer opens from.
4. [`../vendor-request-form/README.md`](../vendor-request-form/README.md) — the page the drawer's CTA routes to.
5. Existing locked drawers for the shared drawer chrome: [`../admin-giving-list/README.md`](../admin-giving-list/README.md) (Pay batch) and [`../admin-settings/README.md`](../admin-settings/README.md) (Gmail OAuth).
6. Open `screen.html` + screenshot.

## What is locked

### Drawer chrome (inherits locked drawer pattern)
- **Width:** 600px, full viewport height, slides from the right.
- **Bg:** `--portal-card-reading` (white). Left border 1px `--portal-line`. Subtle box-shadow on the left edge `-2px 0 24px rgba(20,40,30,0.08)`.
- **Backdrop:** `rgba(20,40,30,0.32)` dim wash over the entire page behind. ESC / X / backdrop click dismiss the drawer (affordance locked; not designed as a separate state).

### Sticky header (64px, white bg, bottom hairline)
- Left: 32px ghost X-close button.
- Right: mono uppercase tag `EXC-1042` Inter 11px tracking-[0.18em] --muted-foreground.

### Body (scrollable, 32px padding)

**Block 1 — Identity**
- 80px circular real-photo (left) + 24px gap + stacked: Name Inter 22px semibold ink / Title Inter 14px ink / Company Inter 13.5px --muted-foreground.

**Block 2 — About**
- Mono eyebrow "ABOUT" Inter 11px uppercase tracking-[0.18em] --muted-foreground.
- Bio paragraph Inter 13.5px ink, 1.6 line-height. Sample 50-word bio used for Priya.

**Block 3 — Two stacked stat cards (16px gap)**
- **Card A — Supports** (--portal-amber-soft bg, rounded-xl, 20px padding):
  - 14px heart-outline icon --portal-amber-ink + 8px gap + "SUPPORTS" mono eyebrow.
  - Charity name Inter 16px semibold ink.
  - "Priya's chosen charity. Every meeting funds a real gift." Inter 12.5px --muted-foreground.
- **Card B — Member since** (--portal-card warm cream bg, --portal-line border, rounded-xl, 20px padding):
  - "MEMBER SINCE" mono eyebrow.
  - Year Fraunces 28px semibold ink.
  - "Joined the network in early YYYY." Inter 12.5px --muted-foreground.

**Block 4 — What happens next** (NEW pattern, no card)
- Mono "WHAT HAPPENS NEXT" eyebrow.
- Three numbered short lines, each Inter 12.5px --muted-foreground prefixed with an 18px amber-filled circle containing the step number in white mono.
  1. You write a short pitch for Priya.
  2. We send your message to her. She accepts or declines.
  3. If she accepts, we secure a time. A credit is only spent after the meeting is held.

### Sticky footer (88px, white bg, top hairline)
- Full-width primary button: --portal-ink bg, white text, 44px tall, rounded-lg, Inter 14.5px semibold, label "Request a meeting →". Click → /vendor/executives/EXC-1042/request.

### STATE annotation row (bottom of viewport)
- "STATE · EXECUTIVE DETAIL DRAWER · OPEN · EXC-1042" + right "VIEWING NOW" amber-soft pill.

## Data sources per module (build-chat reference)

| Module | Source | Notes |
|---|---|---|
| Header tag (EXC-NNNN) | `executive.public_id` | Mono uppercase, identifies the record for support/debug |
| Block 1 — photo | `executive.photo_url`, fallback initials in --portal-amber-soft (production empty-state, NOT design default) | |
| Block 1 — name / title / company | `executive.name`, `executive.title`, `executive.company` | |
| Block 2 — bio | `executive.bio` (markdown-rendered or plain text, depending on field shape — confirm) | Empty when not yet authored. Empty state TBD (Pass B). |
| Block 3 Card A — charity name | `executive.default_charity_id → charity.name` | |
| Block 3 Card B — year | `EXTRACT(YEAR FROM executive.joined_at)` | "Joined the network in early YYYY" if `joined_at < june` of that year, else "in mid YYYY" / "in late YYYY" — copy logic deferred |
| CTA route | `/vendor/executives/{executive.public_id}/request` | Form route owns its own data; nothing passed through state |

## Sample data (LOCKED — aligned with Vendor Dashboard + Executives List)

- Executive: **Priya Raghavan** · Chief Financial Officer · Lumen Industries · EXC-1042
- Photo: same Unsplash portrait as the locked Executives List row + Vendor Request Form (one image per exec across all surfaces)
- Bio: "Priya Raghavan is the CFO at Lumen Industries, an ASX-listed energy and infrastructure group. She leads finance, treasury, and investor relations across three operating businesses and sits on the audit committee of two Australian boards. Currently focused on capital allocation for the group's transition portfolio."
- Charity: Royal Flying Doctor Service
- Member since: 2024

## Open decisions parked

- **Wordmark**.
- **Bio empty state** — execs who have not authored a bio. Likely a "Bio not yet shared" muted line; not designed in this pass.
- **Drawer back-action** — when the user dismisses the drawer, does the list scroll position restore? Assumption: yes (state preserved). Not designed.
- **Drawer keyboard nav** — Tab order, focus trap. Not designed.
- **Sample-data drift on backdrop list** — the render shows "Anika Sato · CPO · Northvale Group" on the dimmed list, which is not in the locked sample set (same drift as admin Pay batch backdrop). Fix on next pass.

## Anti-list (do not regress)

- Drawer 600px wide, slides from the right, white bg. NEVER displaces the list (overlay only).
- Backdrop list stays recognizable through the dim wash (`rgba(20,40,30,0.32)`); the dim is mood, not a black-out.
- Photo MUST match the same Unsplash portrait used on the Executives list + Request form for the same exec (one record, one image).
- Brand "TheGoodIntro" one word.
- Sage forbidden on vendor surfaces; emerald forbidden on vendor surfaces.
- No em or en dashes.
