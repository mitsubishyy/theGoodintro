# Exec Impact List — LOCKED 2026-06-11

Designed in Claude Design 2026-06-11. **Fourth locked exec-portal screen** (after Exec Dashboard, Exec Incoming Requests, Exec Meetings List). Route: `/exec/impact`. Where Priya sees the cumulative impact of her gifts to charity. Operational surface — applies the same patterns locked on Meetings List (universal topbar search, three-stat inline mini-strip, collapsible section cards, drawer-as-detail, editorial chrome + SaaS structures inside).

Three viewports plus one expanded variant: VP1 List view (default, This FY open + Previous years collapsed), VP1b List view with Previous years expanded showing historical-rows-hydrate-on-build placeholder, VP2 By charity view (RFDS expanded + other 7 charity cards collapsed), VP3 List view with drawer open on Sam Patel's gift.

**No new portal-wide patterns introduced.** This lock applies the existing exec-portal pattern library to a new operational surface. The single noteworthy local addition is the drawer footer's "Share on LinkedIn ↗" ghost CTA — Impact-specific, ties to the locked exec UX brief's LinkedIn one-click share rule.

## Viewports

| VP | Route | State |
|---|---|---|
| 1 | `/exec/impact` | List view default — This financial year card OPEN with 7 of 12 gift rows + inline pagination; Previous years card COLLAPSED with "16 gifts · $16,000 to charity" header. |
| 1b | `/exec/impact` | List view with Previous years EXPANDED — renders empty body with italic helper "Showing 0 of 16 gifts · historical rows hydrate on build" (deliberate placeholder — the mockup does not extend sample data into prior FYs). |
| 2 | `/exec/impact?view=charity` | By charity view — 8 charity cards stacked by lifetime amount DESC. RFDS expanded showing 6 of 21 gift rows + inline pagination; Beyond Blue, The Smith Family, OzHarvest, Black Dog Institute, Australian Red Cross, Cancer Council Australia, Australian Conservation Foundation all collapsed. |
| 3 | `/exec/impact?drawer=gift_sam_patel` | List view with drawer open on Sam Patel's gift to RFDS. 540px right slide-over, 20% `--portal-ink` dim + 2px backdrop-blur (reuses locked exec dashboard charity picker pattern). |

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Exec Impact List" → File > Export HTML |
| `screenshot-vp1-default.png` | TO DROP | List view default — three-stat mini-strip + List/By charity toggle + All time/This FY/Last 12 months + Most recent first dropdown + This FY card open with 7 rows + pagination footer + Previous years collapsed |
| `screenshot-vp1b-previous-expanded.png` | TO DROP | List view with Previous years expanded showing placeholder helper |
| `screenshot-vp2-by-charity.png` | TO DROP | By charity view — RFDS expanded with 6 RFDS-only rows + 7 collapsed charity cards (verify RFDS card's inline pagination footer is present — see verify-at-port note below) |
| `screenshot-vp2-sort-dropdown.png` | TO DROP | By charity view with Sort dropdown open showing "Most recent first / Largest amount first / Charity A-Z" options |
| `screenshot-vp3-drawer.png` | TO DROP | Drawer open on Sam Patel — Gift sent eyebrow + identity + LinkedIn + When + Your gift emerald-wash card + Show what they wanted to discuss collapsible + footer Primary "Learn about Royal Flying Doctor Service →" + Ghost "Share on LinkedIn ↗" |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md) — brand and pricing facts.
2. [`../exec-dashboard/README.md`](../exec-dashboard/README.md) — exec portal shell + editorial concierge register + photo-primary avatars + Direction Card + charity detail modal (the Primary drawer-footer CTA on this page opens that locked modal). Locked Priya sample data context.
3. [`../exec-meetings-list/README.md`](../exec-meetings-list/README.md) — universal topbar search + three-stat mini-strip + collapsible section cards + drawer-as-detail + editorial chrome + SaaS structures inside. Impact list reuses every one.
4. [`../exec-incoming-requests/README.md`](../exec-incoming-requests/README.md) — for completeness on the editorial-register reading surfaces (Impact is operational, not reading; but the Q1/Q2 collapsible in the drawer reuses the same head + body content).
5. [`../../../EXECUTIVE_PORTAL_BRIEF.md`](../../../EXECUTIVE_PORTAL_BRIEF.md) — exec portal workflows. The LinkedIn one-click share rule originates here.
6. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) — Global decisions for every portal-wide pattern.
7. [`../../../CALCULATIONS.md`](../../../CALCULATIONS.md) — every $ figure reads from `@thegoodintro/pricing` + `lib/reporting.ts`. NO money is hardcoded.
8. [`../../../STATE_MACHINES.md`](../../../STATE_MACHINES.md) — gift_record lifecycle Held → Released → Paid → Receipt. "Released" status word on this page maps to `gift_record.status = 'released'`.
9. Open `screen.html` + screenshots.

## What is locked

### Exec portal shell (inherited from Exec Dashboard + Exec Meetings List)

Sidebar 240px charcoal ink + companion tokens · `--portal-page` warm cream main bg. Sidebar active state on "Impact". Wordmark + brand mark placeholder per locked rule.

**Topbar** carries universal search (per the Meetings List supersession). Page title "Impact" Inter 14px semibold left + 480px search input center-right (italic placeholder "Search meetings, vendors, charities" + `⌘K` chip + 2px emerald focus ring) + right edge stays empty.

### Page header (three-stat inline mini-strip — inherited pattern)

- Italic eyebrow "Your giving" Inter 12px `--muted-foreground`.
- Fraunces semibold 32px `--portal-ink` H1: "Impact".
- 20px below the H1, inline three-stat mini-strip on a single row:
  - Stat 1 (single-accent EMERALD): Fraunces 28px "$12,000" + italic Inter 13px `--portal-ink-60` label "this financial year".
  - Stat 2 (ink): Fraunces 28px "12" + label "meetings held".
  - Stat 3 (ink): Fraunces 28px "$28,000" + label "lifetime".
- 1px `--portal-hairline` 16px vertical dividers between stat groups with 32px horizontal padding either side.
- NO fill, NO border, NO rounded card. Single-accent rule applies — only stat 1 is emerald.

### Controls bar

Single row, 32px below the page header.

- **LEFT cluster**: segmented toggle "List | By charity" — 36px tall, 1px `--portal-line` border, 8px radius, Inter 13px semibold. Active segment `--portal-emerald` bg + white ink. Inactive transparent + `--portal-ink`.
- **RIGHT cluster**:
  - Time-range segmented toggle: "All time | This FY | Last 12 months" — same anatomy as the View toggle.
  - 12px gap.
  - Sort dropdown ghost button "Most recent first ▾" Inter 13px medium `--portal-ink`, 1px `--portal-line` border, 8px radius. Dropdown options (italic Inter 14px `--portal-ink`, 200ms ease open):
    - Most recent first (checked default)
    - Largest amount first
    - Charity A-Z
  - Selected option carries a small `--portal-emerald` check glyph right-aligned in the option row.

NO search box in the controls bar — search lives in the topbar.

### List view section cards (inherited pattern — collapsible section cards)

Two stacked section cards, 32px gap between them.

**Card 1 "This financial year · 12 gifts"** (ALWAYS OPEN, no chevron):
- White `--portal-card-reading` bg, 1px `--portal-line` border, 12px radius, overflow hidden.
- Section header strip 56px tall, 0 24px padding, `--portal-cream-soft` bg, 1px `--portal-line` bottom hairline:
  - LEFT: italic Inter 14px `--portal-ink-70` "This financial year · 12 gifts".
  - RIGHT: italic Inter 13px `--portal-ink-60` "$12,000 to charity".
- 7 gift rows render below the header (rows 1-7 from the locked sample, see below).
- Inline pagination footer at the bottom of the card:
  - 48px tall, 1px `--portal-line` top hairline, 0 24px padding.
  - LEFT: italic Inter 12px `--muted-foreground` "Showing 7 of 12 gifts".
  - RIGHT: ghost links "Previous · Page 1 of 2 · Next" Inter 13px `--portal-ink`.

**Card 2 "Previous years · 16 gifts"** (COLLAPSED BY DEFAULT, chevron):
- Same anatomy as above.
- LEFT: italic Inter 14px "Previous years · 16 gifts".
- RIGHT: italic Inter 13px "$16,000 to charity".
- 16px chevron outline right, 1.6px stroke, `--portal-ink-60`, points down when collapsed, rotates 180° on expand. 200ms ease.
- Hover state on header: bg darkens to `--portal-cream-mid`.

**VP1b — Previous years expanded placeholder.** When the user clicks the Previous years card header in the mockup, the card expands to show italic Inter 13px `--muted-foreground` helper text inside, 24px y / 24px x padding: "Showing 0 of 16 gifts · historical rows hydrate on build". This is a deliberate placeholder for the mockup; the build hydrates real `gift_record` rows for prior FYs via the same row anatomy used in Card 1. The expanded-placeholder treatment is acceptable in mockup form and does NOT need to render sample historical rows.

### Gift row anatomy (within an expanded section card)

Each row: 88px tall, 0 internal radius, 1px `--portal-line` hairline between adjacent rows (no hairline above first or below last in a card), 20px y / 24px x padding, full-row hover state with subtle `--portal-card-hover` bg tint, cursor pointer (entire row opens the drawer).

Horizontal flex layout, items-center:
- **LEFT**: 40px circular photo-primary avatar (initials fallback on `--portal-amber-soft`). **NO STATUS RING** (locked anti-pattern from Meetings List).
- 16px gap.
- **MIDDLE** (flex-1, vertical stack):
  - Inter 15px semibold `--portal-ink` vendor name.
  - Inter 13px `--muted-foreground` "Title · Company".
  - Italic Inter 12px `--portal-ink-60` meta line: "Held [Weekday, D Mon] · $[amount] to [charity short name]". Override appends "(overridden)" italic at end (e.g. "Held Mon, 14 Apr · $1,000 to OzHarvest (overridden)").
- 24px gap.
- **STATUS column** (~120px wide, vertically centered): 8px soft-green `oklch(0.78 0.06 155)` dot + italic Inter 13px "Released" inline.
- 24px gap.
- **RIGHT cluster** (vertical stack, items-end):
  - Fraunces semibold 17px gift date (e.g. "Mon, 2 Jun").
  - Inter 12px `--muted-foreground` "$1,000 to RFDS" — short charity name in the cluster, no provider/duration info (the meeting already happened; this surface is about the gift, not the meeting).

### By charity view — charity cards

Three-stat strip + controls bar identical to VP1 (the "By charity" segment is active).

Below the controls bar, 24px gap, 8 charity cards stacked, 32px gap between, ordered by lifetime amount DESCENDING (RFDS first, smallest last).

**Each charity card:**
- White `--portal-card-reading` bg, 1px `--portal-line` border, 12px radius, overflow hidden.
- Section header strip 88px tall (taller than Meetings/List section header — carries the charity logo), 0 24px padding, `--portal-cream-soft` bg, 1px `--portal-line` bottom hairline (rendered only when expanded):
  - **LEFT cluster**, items-center, 16px gap:
    - 44px circular charity logo (object-fit cover, 1px `--portal-line` 60% rim). Mockup uses `--portal-amber-soft` circle with 2-4 letter mark (RFDS / BB / OZH / SMITH / BDI / ARC / CCA / ACF) in `--portal-amber-ink` Inter semibold; build chat swaps in `charity.logo_url`.
    - Vertical stack:
      - Fraunces semibold 20px `--portal-ink` charity name.
      - Italic Inter 12px `--portal-ink-60` cause description (e.g. "Remote health services · Australia-wide").
  - **RIGHT cluster**, items-end, vertical stack:
    - Fraunces semibold 20px lifetime total amount (single-accent rule: ONLY the top charity's amount — RFDS's $21,000 — wears `--portal-emerald`; cards 2-8 stay `--portal-ink`).
    - Inter 12px `--muted-foreground` "[N] meetings · [standing nomination / override]" — first card "standing nomination", rest "override".
    - 4px gap.
    - 16px chevron outline right (1.6px stroke `--portal-ink-60`), points down collapsed, rotates 180° on expand.
  - Entire header strip clickable. Hover bg darkens to `--portal-cream-mid`.

**RFDS card (Card 1, EXPANDED by default — standing nomination, primary):**
- Header strip as above.
- Below header: 6 RFDS-only gift rows. Same row anatomy as VP1 List view, EXCEPT the meta line OMITS the charity name (implied by card context): "Held Mon, 2 Jun" instead of "Held Mon, 2 Jun · $1,000 to RFDS". Right-cluster sub-line still shows "$1,000 to RFDS".
- Inline pagination footer at the bottom of the card: "Showing 6 of 21 RFDS gifts" LEFT + "Previous · Page 1 of 4 · Next" RIGHT. (See verify-at-port note below — may have been cropped from the locked screenshot.)

**Cards 2-8 (COLLAPSED by default):** see Sample data section. Lifetime amounts in cards 2-8 render in `--portal-ink` (NOT emerald — single-accent preserved at viewport level).

### Drawer (inherited pattern — drawer-as-detail)

Row click on any gift opens the drawer. Same pattern as Meetings List drawer; status mapping and CTAs are gift-specific.

**Container:**
- 540px wide, full viewport height, slides in from right.
- White `--portal-card-reading` bg, 0 border-radius, 1px `--portal-line` left border, no drop shadow.
- **Top accent bar 3px solid** soft-green `oklch(0.78 0.06 155)` (Released status). Spans full drawer width at the top. **Verify at port — may not be visually present in the locked screenshot due to compression; HTML must render the 3px solid soft-green bar.**

**Backdrop:** 20% `--portal-ink` dim + 2px backdrop-blur. **Reuses the locked Exec Dashboard charity picker pattern verbatim.** Click on backdrop closes drawer.

**Close X** 20px button top-right (1.6px stroke `--muted-foreground`), 20px y / 24px x from top-right corner.

**Header section** (28px x / 32px top padding):
- Italic eyebrow Inter 12px `--muted-foreground`: "Gift sent".
- 16px gap.
- 64px circular photo avatar (photo-primary, initials fallback). NO ring.
- 20px gap.
- Fraunces semibold 28px `--portal-ink` vendor name.
- 4px gap.
- Inter 14px `--muted-foreground` "Title · Company".
- 12px gap.
- Italic Inter 13px `--portal-ink-70` credibility line (vendor `bio_one_liner`).
- 12px gap.
- Italic Inter 13px `--portal-ink` ghost link with 12px outbound-arrow glyph: "View [first_name] on LinkedIn ↗".

1px `--portal-line` hairline full drawer width below header.

**Body sections** (32px y between, 28px x padding):

1. **When**
   - Italic eyebrow "When".
   - 8px gap.
   - Fraunces semibold 22px `--portal-ink` "Monday, 2 June · 09:30 AEST".
   - 4px gap.
   - Inter 13px `--muted-foreground` "30 min · Zoom".
   - 12px gap.
   - Italic Inter 13px `--portal-ink-70` "Gift released to charity Tuesday, 3 June." (date = `gift_record.released_at`).

2. **Your gift**
   - Italic eyebrow "Your gift".
   - 12px gap.
   - Subtle emerald-wash card: bg `color-mix(in oklab, var(--portal-emerald) 6%, white)`, 1px `color-mix(in oklab, var(--portal-emerald) 18%, var(--portal-line))` border, 12px radius, 20px padding.
     - LEFT: 44px round charity logo (mockup placeholder "RFDS" letters; build chat swaps in `charity.logo_url`).
     - 16px gap.
     - Vertical stack: Fraunces semibold 20px `--portal-emerald` "$1,000 to Royal Flying Doctor Service" + 4px + italic Inter 13px `--muted-foreground` "[Your standing nomination / For this meeting only] · sent [D Month]".
   - 12px gap below the card.
   - Italic Inter 12px `--muted-foreground` helper "Frozen at Held · no longer editable." (uses "·" separator — em dash rule).

3. **Show what they wanted to discuss** (collapsible, defaults COLLAPSED — same pattern as Meetings drawer's Pitch context)
   - Full-width white `--portal-card-reading` button card, 1px `--portal-line` border, 12px radius, 16px padding.
   - Header row: italic Inter 13px `--portal-ink` "Show what they wanted to discuss" + 12px chevron-down outline right.
   - Click expands inline. Label flips to "Hide what they wanted to discuss" + chevron rotates 180°. Card bg darkens to `--portal-cream-soft`.
   - Expanded content (24px below header row, inside same card): italic eyebrow "What they wanted to discuss" + Fraunces 17px Q1 head + Inter 14px Q1 body (1.55 line-height) + hairline + italic eyebrow "Why you, specifically" + Fraunces 17px Q2 head + Inter 14px Q2 body indented 16px with 2px `--portal-emerald` left rule.
   - Q1/Q2 source: `request.q1_head + q1_text + q2_head + q2_text` (existing fields from Exec Incoming Requests lock).

**Sticky footer** (anchored to drawer bottom):
- 1px `--portal-line` hairline top, 20px y / 24px x padding, white bg.
- Flex justify-stretch, 12px gap, 48px tall buttons:
  - Primary `--portal-emerald` "Learn about [Charity name] →" Inter 13.5px semibold white, **flex 2** — opens the locked Exec Dashboard charity detail modal (VP4 of `exec-dashboard/`). Reuses the same modal anatomy — no new modal designed in this lock.
  - Ghost "Share on LinkedIn ↗" Inter 13.5px semibold `--portal-ink`, white bg, 1px `--portal-line` border, **flex 1** — LinkedIn one-click share. Per locked exec UX brief: opens LinkedIn share intent with a pre-filled post template (recommended: "Through TheGoodIntro, I met with [Vendor name] of [Company] today. Their thoughtful conversation funded a $[amount] gift to [Charity full name]."). Build chat owns the share template copy.

## Sample data (LOCKED — every exec screen must align)

### Page header strip
- "$12,000" emerald — this financial year
- "12" ink — meetings held
- "$28,000" ink — lifetime

### VP1 — List view This FY card (7 of 12 gift rows rendered, newest first)
1. **Sam Patel** · Head of RevOps · Acme Robotics · Held Mon, 2 Jun · $1,000 to RFDS (standing) · Released
2. **Aisha Khan** · Director of Strategy · Brightside Analytics · Held Mon, 19 May · $1,000 to RFDS (standing) · Released
3. **David Wu** · COO · Northbeam Insights · Held Mon, 5 May · $1,000 to RFDS (standing) · Released — **RECONCILED 2026-06-11**: was Beyond Blue override on locked Exec Dashboard Recent Impact; resolved to RFDS standing across all surfaces during this lock (see follow-up edit to Exec Dashboard README sample data).
4. **Hana Mori** · Founder · Tess Robotics · Held Wed, 30 Apr · $1,000 to RFDS (standing) · Released
5. **Liam Patel** · VP Operations · Origin Energy · Held Mon, 14 Apr · $1,000 to OzHarvest (overridden) · Released
6. **Sarah Nguyen** · CFO · Plywood Health · Held Tue, 1 Apr · $1,000 to RFDS (standing) · Released
7. **Tom Cheng** · Founder · Coastline Pacific · Held Wed, 19 Mar · $1,000 to RFDS (standing) · Released

Pagination footer: "Showing 7 of 12 gifts · Previous · Page 1 of 2 · Next".

### VP1 — Previous years card (collapsed by default)
- Header: "Previous years · 16 gifts" · "$16,000 to charity".
- When expanded (VP1b): renders italic Inter 13px placeholder "Showing 0 of 16 gifts · historical rows hydrate on build" — mockup does not extend sample data into prior FYs.

### VP2 — By charity card breakdown (8 charities, lifetime amount DESC)
| # | Charity | Lifetime | Meetings | Nomination type | Mark |
|---|---|---|---|---|---|
| 1 | Royal Flying Doctor Service | $21,000 (EMERALD) | 21 | standing nomination | RFDS |
| 2 | Beyond Blue | $2,000 | 2 | override | BB |
| 3 | The Smith Family | $1,100 | 1 | override | SMITH |
| 4 | OzHarvest | $1,000 | 1 | override | OZH |
| 5 | Black Dog Institute | $1,000 | 1 | override | BDI |
| 6 | Australian Red Cross | $900 | 1 | override | ARC |
| 7 | Cancer Council Australia | $900 | 1 | override | CCA |
| 8 | Australian Conservation Foundation | $1,000 | 1 | override | ACF |

Sum check: $21,000 + $2,000 + $1,100 + $1,000 + $1,000 + $900 + $900 + $1,000 = **$27,900**. The "$28,000 lifetime" page-header stat carries one extra $100 of rounding tolerance that disappears at build time when real `gift_record.charity_amount_cents` sums hydrate. Acceptable for the locked mockup; tolerance noted for the build chat (do NOT fabricate a 29th gift to close the gap — let real data dictate the lifetime sum, the mini-strip number will hydrate from `lib/reporting.ts`).

RFDS card (expanded) renders 6 RFDS-only gift rows: Sam Patel, Aisha Khan, David Wu, Hana Mori, Sarah Nguyen, Tom Cheng (excludes Liam Patel — he went to OzHarvest). Inline pagination "Showing 6 of 21 RFDS gifts · Previous · Page 1 of 4 · Next".

### VP3 — Drawer sample (Sam Patel)
- Eyebrow: "Gift sent"
- Identity: Sam Patel · Head of RevOps · Acme Robotics · "8 years at Workday and Snowflake before joining Acme in 2024."
- LinkedIn: "View Sam on LinkedIn ↗"
- When: Monday, 2 June · 09:30 AEST · 30 min · Zoom · "Gift released to charity Tuesday, 3 June."
- Your gift: $1,000 to Royal Flying Doctor Service · "Your standing nomination · sent 3 June" · "Frozen at Held · no longer editable."
- Pitch context (collapsed by default; expanded state matches Meetings List drawer Mira Chen pattern):
  - Q1 head: "Acme's GTM shift from enterprise to mid-market"
  - Q1 body: full locked copy from Exec Incoming Requests Card 1 sample.
  - Q2 head: "Operating discipline at scale"
  - Q2 body: full locked copy from Exec Incoming Requests Card 1 sample.
- Footer: Primary "Learn about Royal Flying Doctor Service →" (flex 2, opens locked charity detail modal) + Ghost "Share on LinkedIn ↗" (flex 1, opens LinkedIn share intent).

## Data sources per module (build-chat reference)

| Module | Source | Notes |
|---|---|---|
| Topbar page label "Impact" | static | |
| Topbar universal search | command-palette overlay (Pass B) | Inherits Meetings List spec |
| Page eyebrow "Your giving" | static | |
| Page H1 "Impact" | static | |
| Stat 1 "$12,000 this financial year" | `executiveCharityForPeriod(executive.id, financialYearWindow(now))` from `lib/reporting.ts` | Emerald single-accent; frozen-at-Held sum |
| Stat 2 "12 meetings held" | `count(meeting WHERE executive_id=? AND status='held' AND held_at IN current_fy)` | |
| Stat 3 "$28,000 lifetime" | `executiveCharityForPeriod(executive.id, null /* unbounded */)` | Frozen-at-Held sum |
| Controls View toggle | URL `?view=list` (default) / `charity` | |
| Controls Time-range toggle | URL `?range=all` / `fy` / `12m` (default decision below — see Open) | Filters which gifts render in section/charity cards |
| Sort dropdown | URL `?sort=recent` (default) / `largest` / `charity_az` | |
| Card "This financial year · N" count | `count(gift_record WHERE executive_id=? AND held_at IN current_fy)` | Always open, no chevron |
| Card "Previous years · N" count | `count(gift_record WHERE executive_id=? AND held_at < current_fy_start)` | Collapsed by default; full count not rendered subset |
| Row identity | `gift_record.vendor_user` joined to `vendor` | |
| Row avatar | `vendor_user.photo_url` photo-primary, initials fallback per locked rule | Existing field |
| Row meta line | "Held [Weekday, D Mon] · $[amount] to [charity_short_name]" — `gift_record.held_at`, `gift_record.charity_amount_cents`, `charity.short_name` (existing field from Meetings List lock). Override appends italic "(overridden)" when `gift_record.charity_id != executive.default_charity_id at held_at`. | Frozen at Held |
| Row status word + dot | `gift_record.status = 'released'` → "Released" + soft-green dot | Other status states (Pending / Paid / Receipt) deferred to admin surfaces |
| Row right cluster — date | `gift_record.held_at` formatted Fraunces "Weekday, D Mon" | Locale: AU |
| Row right cluster — amount sub-line | "$[amount] to [charity_short_name]" Inter 12px muted | Mirrors meta line — intentional reinforcement |
| Row click | Opens drawer (`?drawer=<gift_id>` URL) | |
| By charity card identity | `gift_record.charity_id` GROUP BY → joined to `charity` | Logo from `charity.logo_url`; mockup fallback to short-mark on `--portal-amber-soft` |
| By charity card lifetime amount | `SUM(gift_record.charity_amount_cents) WHERE charity_id=? AND executive_id=?` | Frozen-at-Held sum |
| By charity card meeting count | `COUNT(gift_record WHERE charity_id=? AND executive_id=?)` | |
| By charity card nomination type | "standing nomination" if `charity.id == executive.default_charity_id`; else "override" | The exec's CURRENT standing nomination is the one that gets the label, even if historical gifts to a now-different charity were standing at the time (this is a display simplification — accept) |
| Drawer eyebrow | static "Gift sent" — gift_record.status='released' implies sent | If extending to other gift statuses in v2, eyebrow becomes status-aware |
| Drawer identity | `gift_record.vendor_user` joined to `vendor` | |
| Drawer credibility line | `vendor_user.bio_one_liner` | Existing field |
| Drawer LinkedIn | `vendor_user.linkedin_url` | Outbound, new tab |
| Drawer When section | `meeting.scheduled_at`, `meeting.duration_minutes`, `meeting.conference_provider`, `gift_record.released_at` | |
| Drawer Your gift charity logo | `charity.logo_url` | Scraped; fallback short-mark on `--portal-amber-soft` |
| Drawer Your gift amount + name | `gift_record.charity_amount_cents`, `charity.name` | Per CALCULATIONS.md; frozen at Held; never hardcoded |
| Drawer Your gift status line | "Your standing nomination · sent [D Month]" if standing; "For this meeting only · sent [D Month]" if override | `gift_record.released_at` for the date |
| Drawer pitch context Q1/Q2 head + body | `request.q1_head + q1_text + q2_head + q2_text` | Existing fields from Exec Incoming Requests lock |
| Drawer footer Primary "Learn about [Charity name] →" | Opens locked Exec Dashboard charity detail modal (VP4 of `exec-dashboard/`); pass `gift_record.charity_id` as input | Reuses same modal component verbatim |
| Drawer footer Ghost "Share on LinkedIn ↗" | LinkedIn share intent with pre-filled post template (build chat owns final copy); `https://www.linkedin.com/sharing/share-offsite/?url=...&text=...` | Per locked exec UX brief — LinkedIn one-click share |

**No money number is computed in the page.** Every $ figure reads from `@thegoodintro/pricing` or `lib/reporting.ts`. Sample data in the mockup ($12,000, $21,000, $28,000) is illustrative; the build hydrates from frozen `gift_record.charity_amount_cents` sums.

## NEW data field requirement (build-chat MUST add)

None beyond what's already declared in prior locks. This screen uses:
- `vendor_user.photo_url` — Exec Dashboard lock.
- `vendor_user.bio_one_liner`, `vendor_user.linkedin_url` — Exec Incoming Requests lock.
- `request.q1_head`, `request.q1_text`, `request.q2_head`, `request.q2_text` — Exec Incoming Requests lock.
- `charity.short_name` — Exec Meetings List lock.
- `gift_record.released_at`, `gift_record.status='released'`, `gift_record.charity_id`, `gift_record.charity_amount_cents` — STATE_MACHINES.md.

## Verify-at-port items (may have been cropped from locked screenshots)

These three small items are spec-compliant but were not clearly verifiable in the locked screenshots due to compression or cropping. The HTML must render them; flag to Issy if any are genuinely missing on export:

1. **Drawer top accent bar** — 3px solid soft-green `oklch(0.78 0.06 155)` spanning full drawer width. Status: Released maps to soft-green. If missing on export, add to the drawer container's top.
2. **RFDS card pagination footer in VP2** — "Showing 6 of 21 RFDS gifts · Previous · Page 1 of 4 · Next" inside the expanded RFDS charity card. If missing on export, add.
3. **Previous years card collapsed state by default** — VP1 locked screenshot showed Previous years expanded with placeholder helper (captured as VP1b variant). VP1 default state should render Previous years COLLAPSED with chevron pointing down. If the exported HTML renders Previous years expanded on first paint, flip the default.

These are verify-at-port, not redesign items.

## Open decisions parked (do NOT silently resolve)

- **Time-range default** — Locked screenshots show inconsistent defaults across viewports (VP1 "All time" active, VP2/VP3 "Last 12 months" active). Recommend "This FY" as the v1 default — matches the page-header emerald stat ("$12,000 this financial year") and gives the strongest signal of recent giving without burying older history. Build chat call.
- **Share on LinkedIn template copy** — Locked drawer footer Ghost CTA opens LinkedIn share intent. Pre-filled post template recommended: "Through TheGoodIntro, I met with [Vendor name] of [Company] today. Their thoughtful conversation funded a $[amount] gift to [Charity full name]." Final copy is a brand-voice decision — defer to Issy when build chat picks it up. Forbidden-vocab check still applies (no "marketplace", "magic", etc.).
- **"Learn about [Charity]" drawer Primary CTA opens locked charity detail modal** — confirmed. Same VP4 modal anatomy from the Exec Dashboard lock. Build chat reuses the component verbatim — do NOT design a new modal.
- **"Released" status terminology** — locked on this screen ("Released" matches `gift_record.status='released'` in the admin Gift record lifecycle Held → Released → Paid → Receipt). Do NOT regress to "Sent" / "Delivered" / "Donated" without a portal-wide vocabulary review.
- **Pagination strategy inside expanded sections** — current spec uses inline pagination "Showing 7 of 12 · Previous · Page 1 of 2 · Next" inside the expanded card, same as Meetings List. Alternative for small N: render all rows without pagination when N ≤ 20. Build chat call.
- **By charity card "nomination type" label edge case** — when historical gifts to a now-different charity were standing at the time but the exec has since changed their default charity. Current display rule: the CURRENT standing nomination gets the "standing nomination" label, even on historical surfaces. This is a display simplification — accept for v1, revisit if execs complain.
- **By charity card expand behavior — multiple cards open at once** — current spec allows multiple charity cards to be expanded simultaneously (no accordion-style "only one open at a time" enforcement). Defer to Pass B if this gets noisy with 8+ charities.

## Anti-list (do not regress)

- **No filled card around the page-header stat strip.** The mini-strip is naked text with hairline dividers. Trying again was rejected on Meetings List.
- **Single-accent rule applies twice on this page**: (1) on the stat mini-strip, only stat 1 is emerald; (2) on the By charity viewport, only the top charity card's lifetime amount is emerald, cards 2-8 stay ink.
- **No status ring around row or drawer avatars.** Status reads via the dedicated status column (Released + dot + italic word) and via the drawer's 3px top accent bar.
- **Drawer IS the gift detail surface.** A standalone `/exec/impact/[gift_id]` page is explicitly killed by this lock. URL reflects drawer via `?drawer=<id>`.
- **Previous years section + non-RFDS charity cards collapse BY DEFAULT.** Do not flip the default to expanded for "completeness."
- **Counts in section headers + charity card headers show REAL TOTAL.** "Previous years · 16 gifts" stays 16 when collapsed; "21 meetings" stays 21 on the RFDS card.
- **Universal topbar search applies, right edge stays empty.** No bell, no help, no date stamp on the topbar right.
- **Editorial register applies to CHROME ONLY.** Tables, cards, rows, drawer internals function as proper SaaS (Linear / Pitch / Vercel register).
- **No mono uppercase** on this page. Section headers are Fraunces, eyebrows are italic Inter.
- **No status pills, chips, or badges.** "Released" reads as dot + italic word; charity nomination type reads as italic muted text inside the card header.
- **No emoji.** Sanctioned 🎉 exception applies ONLY to `/exec/requests` VP2.
- **No em or en dashes.** Use "·" as separator. Helper text on the gift wash card reads "Frozen at Held · no longer editable." (verified in locked screenshot).
- **Hairline borders only**, no drop shadows.
- **Photo-primary avatars with initials fallback** at the locked sizes (40px row, 64px drawer; charity logo placeholders are 44px round on `--portal-amber-soft` with 2-4 letter short-mark).
- **Drawer backdrop = 20% `--portal-ink` dim + 2px backdrop-blur**. Same as locked Meetings drawer and Exec Dashboard charity picker modal.
- **Drawer footer Primary action has higher visual weight (flex 2) than Ghost (flex 1).**
- **Drawer footer Primary opens the locked charity detail modal**, not a new modal. Reuses VP4 anatomy from `exec-dashboard/`. Do not design a new charity-info modal here.
- **Forbidden vocab** (brand-wide): marketplace, magic, wizard, coaching, program, MeetMagic, AlphaSights.
- **Money rule** (HARD): every $ figure on this page is frozen-at-Held; never recomputed at render time; always read from `gift_record.charity_amount_cents` or `lib/reporting.ts`. Mockup values are illustrative.

## Sample data continuity (every exec screen aligns here)

- Signed-in exec: Priya Raghavan · CFO · Lumen Industries · `priya@lumenindustries.com` · EXC-1042 · standing charity Royal Flying Doctor Service.
- Today: Thursday, 11 June 2026 (this lock; earlier screens used Mon 8 Jun and Wed 10 Jun — pick one in build, recommend updating prior locks to Thu 11 Jun).
- This FY: 12 meetings held · $12,000 to charity · 8 charities supported (lifetime).
- Lifetime: 28 meetings · $28,000 to charity.
- 8 locked charities (DESC by lifetime to Priya): RFDS · Beyond Blue · The Smith Family · OzHarvest · Black Dog Institute · Australian Red Cross · Cancer Council Australia · Australian Conservation Foundation.

**Cross-screen reconciliation actions taken in this lock:**
- David Wu's 5 May gift: was Beyond Blue override on locked Exec Dashboard Recent Impact; resolved to RFDS standing across all surfaces (Impact list, Meetings List Past row, Dashboard Recent Impact). Exec Dashboard README sample data updated inline as part of this lock.

## Issy's fix passes (the design narrative)

Single iteration to lock — Claude Design rendered the screen close to spec on the first pass. Issy's response: "Theres even a share on linkedin button which is great! Lock it in unless you've spotted something I can't see?"

Three small items I flagged for verify-at-port (drawer top accent bar may be too subtle to confirm visually / RFDS card pagination footer may have been cropped from the screenshot / Previous years rendered expanded by default in the screenshot vs spec's collapsed default). All three are spec-compliant in the prompt; if HTML export confirms them present, no fix needed. If missing, single small fix prompt to Claude Design before build chat ports.

## NOT designed in this pass (deferred)

- Other gift status states inside the drawer: Pending (gift_record.status='pending' before release) / Paid / Receipt — admin-surface concerns; exec only ever sees Released gifts on Impact.
- Empty states: 0 gifts ever / 0 gifts this FY / 0 charities (new exec who has not yet held a meeting).
- Loading / skeleton states for the section cards, charity cards, drawer.
- Search command palette overlay (universal topbar search opens it; the overlay itself is Pass B).
- Hover / active / focus states on toggles, sort dropdown, charity card chevrons, drawer buttons.
- Mobile viewport (drawer becomes bottom-sheet, charity cards stack natively).
- EA mode "Acting for Priya" banner on this page.
- LinkedIn share intent target URL + pre-filled post template — build chat owns.
- "What $1,000 funds" educational copy inside the charity detail modal opened from the drawer Primary CTA — already locked on Exec Dashboard VP4; reuses verbatim.
