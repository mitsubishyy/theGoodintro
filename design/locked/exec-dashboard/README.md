# Exec Dashboard — LOCKED 2026-06-08

Designed in Claude Design 2026-06-08. **First locked exec-portal screen.** Locks
the entire exec portal shell (charcoal sidebar + tokens, top-bar only, no bell /
no search), the editorial concierge register that distinguishes exec from
admin/vendor density, and a stack of new portal-wide patterns: photo-primary
avatars, modal-only charity-change pattern, Direction Card with editorial
emerald flourish + scraped charity logo + dual ghost-button actions, scrollable
card-in-card incoming container with "SHOWING N OF M" peek, and the
"More about [vendor]" affordance that navigates to a future detail page rather
than expanding inline.

Single viewport (VP1 LOADED), Priya Raghavan signed in, four incoming requests
(2 visible in scroll + 1 peeking + 1 below cut), three upcoming meetings (one
with a per-meeting charity override demonstrating the pattern), 12 meetings held
this FY, $28,000 lifetime giving.

## Viewports

| VP | Route | State |
|---|---|---|
| 1 | `/exec` | Loaded — 4 incoming (compact list widget, re-locked 2026-06-09) · 3 upcoming · standing nomination set |
| 2 | `/exec` (modal open) | Charity picker modal · standing-nomination context · triggered from Direction Card "Change standing charity →" |
| 3 | `/exec` (modal open) | Charity picker modal · per-meeting override context · triggered from Upcoming Meeting "Change charity →" |
| 4 | `/exec` (modal open) | Charity detail modal · read surface · triggered from Direction Card "Learn about Royal Flying Doctor Service →" |

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Exec Portal Dashboard" → File > Export HTML |
| `screenshot-vp1-greeting-metric-strip.png` | TO DROP | Top of page — greeting + dark ink metric strip |
| `screenshot-vp1-grid.png` | TO DROP | Direction Card (left) + compact Incoming widget (right) — re-captured 2026-06-09 after widget rework |
| `screenshot-vp1-upcoming-recent-impact.png` | TO DROP | Upcoming Meetings + Recent Impact + footer |
| `screenshot-vp2-standing-modal.png` | TO DROP | Dashboard with standing-charity picker modal open |
| `screenshot-vp3-per-meeting-modal.png` | TO DROP | Dashboard with per-meeting charity picker modal open |
| `screenshot-vp4-charity-detail-modal.png` | TO DROP | Dashboard with charity detail modal open (full view) |
| `screenshot-vp4-modal-content-scroll.png` | TO DROP | Charity detail modal — in-modal scroll showing all four content sections |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md) — brand and pricing facts.
2. [`../../../EXECUTIVE_PORTAL_BRIEF.md`](../../../EXECUTIVE_PORTAL_BRIEF.md) — exec portal workflows. NOTE: the brief says "no heavy sidebar, single-column layout"; this lock supersedes that — the exec portal IS sidebar + topbar + main, parallel to admin and vendor, with editorial restraint as the differentiator (not absence of structure).
3. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) — Global decisions for charcoal sidebar tokens, editorial concierge register, Direction Card pattern, photo-primary avatars, modal-only charity-change.
4. [`../../../CALCULATIONS.md`](../../../CALCULATIONS.md) — every $ figure on this screen reads from `@thegoodintro/pricing` + `lib/reporting.ts`. NO money is hardcoded.
5. [`../../../STATE_MACHINES.md`](../../../STATE_MACHINES.md) — request → meeting lifecycle, override semantics on per-meeting charity.
6. [`../vendor-dashboard/README.md`](../vendor-dashboard/README.md) — parallel-portal reference (vendor's metric ribbon + 8/4 grid pattern; exec departs in register but inherits the skeleton).
7. Open `screen.html` + screenshots.

## What is locked

### Exec portal shell (NEW — inherited by every future exec screen)

**Sidebar** — 240px wide, full height. NEW tokens:

- `--exec-sidebar` `oklch(0.22 0.008 70)` — charcoal ink background
- `--exec-sidebar-text` `oklch(0.95 0.005 70)` — primary text, warm cream
- `--exec-sidebar-muted` `oklch(0.68 0.005 70)` — secondary text
- `--exec-sidebar-active` `oklch(0.30 0.008 70)` — active nav item background

Structure top → bottom:
- Wordmark (Fraunces semibold, "TheGoodIntro" with The/Good/Intro colour split — The + Intro in cream `--exec-sidebar-text`, Good in `--portal-emerald`). Wordmark only in the mockup; build chat inserts the circle mark at port.
- 5 nav items (44px rows, 18px outline icon + Inter 14px medium label): Home (active) · Meetings · Impact · My charity · Profile.
- Active state: `--exec-sidebar-active` bg + 3px `--portal-emerald` left border + label semibold.
- Bottom: 32px round Priya Raghavan photo avatar + "Priya Raghavan" Inter 13px semibold + "CFO · Lumen Industries" Inter 11px muted. Below: italic ghost link "Sign out →".

**Topbar** — 56px, `--portal-card` bg, 1px `--portal-line` bottom hairline. Left: "Home" Inter 14px semibold `--portal-ink`. ~~**Right: NOTHING.** No notification bell, no search, no help, no date.~~ **PARTIALLY SUPERSEDED 2026-06-10 (universal topbar search, locked on Exec Meetings List):** every exec page topbar now carries the universal search input center-right (480px, italic placeholder "Search meetings, vendors, charities", ⌘K chip, 2px emerald focus ring) — including this dashboard, applied retroactively AT BUILD TIME (this mockup is not redesigned). The right EDGE still stays content-empty: no bell, no help, no date. See `../exec-meetings-list/README.md` for the full search spec. The concierge-calm intent stands; search is the only chrome that joined.

**Page background** — `--portal-page` warm cream.

### Editorial concierge register (NEW — distinguishes exec from admin/vendor)

The exec portal departs from admin's HR Partner density and vendor's photo-led density in **register, not skeleton**. Same sidebar + topbar + main + metric strip + grid structure; different voice:

- **Section heads:** Fraunces semibold 22px, NOT mono uppercase eyebrows. Mono uppercase appears in EXACTLY two places on this screen — date prefix on Recent Impact rows + "SHOWING 2 OF 4 · SCROLL TO VIEW THE REST" helper. Nowhere else.
- **Inline eyebrows:** Italic Inter 12px `--muted-foreground`, title case (e.g. "What they want to discuss", "Why you, specifically", "Standing nomination", "Proposed time"). NOT mono.
- **Status copy:** Plain italic text (e.g. "Confirmed.", "DGR endorsed"), NOT pills, NOT chips, NOT badges.
- **Whitespace:** 72px between major sections (vs admin's tighter density). 32–40px card padding.
- **No SaaS chrome:** No count chips. No progress bars. No status pills. No amber-soft badges. No bell. No search.
- **Single accent:** `--portal-emerald` only. Used for: brand wordmark "Good", capital "Good" in prose, Q2 emerald-highlight body, primary Accept CTA, Lifetime mini-card $ figures, italic check icon on quiet trust lines, charity heart-icon glyphs.

### Greeting (NEW pattern)

Fraunces semibold 32px H1 with capital "Good" in `--portal-emerald` ("Good morning, Priya."). Italic Inter 14px `--muted-foreground` sub-line ("Monday, 8 June."). Sits at the top of the main content column, 72px above the metric strip.

### Dark ink metric strip (Issy's call — inherits from vendor/admin, NOT a warm-cream departure)

4 groups separated by white@10% vertical hairlines. `--portal-ribbon` bg, white-on-dark numbers. Each group: Inter 12px italic cream-white label (NOT mono — editorial register applies even on the dark band) + Fraunces semibold 32px white number + Inter 12px cream-white@60% sub-line.

Groups for this screen:
1. **Incoming** · 4 · awaiting your answer
2. **Upcoming** · 3 · this month
3. **This financial year** · $12,000 · to Good · 12 meetings held (Good in `--portal-emerald`)
4. **Lifetime** · $28,000 · 28 meetings · 8 charities

### Direction Card (NEW pattern — Charity standing-nomination anchor)

Left column (col-span-5), white `--portal-card-reading` bg, 1px `--portal-line` border, 16px radius, 40px padding. Structure top → bottom:

1. **Charity logo** — 96px circular logo image (object-fit: cover) centred at top, 32px from card top. White inner bg, 1px `--portal-line` 60%-opacity rim. Source: scraped from `charity.logo_url`. Fallback: amber-soft circle with 2-3 letter mark (e.g. "RFDS" for Royal Flying Doctor Service).
2. 32px gap.
3. Italic "Standing nomination" eyebrow (Inter 12px italic `--muted-foreground`), left-aligned.
4. 24px gap.
5. Fraunces semibold 40px charity name `--portal-ink` (line-height 1.05, tracking-tight). For long names this wraps to 2 lines; spacing accommodates gracefully.
6. 8px gap. Inter 14px `--muted-foreground` cause line.
7. 24px gap. Helper paragraph Inter 13px `--muted-foreground` (~70% column width): "Each meeting you accept sends a real gift here. You can direct any individual meeting to a different DGR-endorsed charity at the moment it is confirmed."
8. 24px gap. 1px `--portal-line` full-width hairline.
9. 20px gap. Inline credentials line, Inter 12px italic `--muted-foreground`: "ABN 74 438 059 643 · Item 1 DGR · Live". (Single line, NOT a 2-col grid.)
10. 20px gap. Two stacked ghost buttons (each 48px tall, white bg, 1px `--portal-line` border, 8px radius, Inter 14px semibold `--portal-ink` upright NOT italic, label left-aligned with 20px inner padding + right chevron at 20px inner right padding, justify-between):
    - "Learn about Royal Flying Doctor Service →" (opens charity detail modal — Pass B)
    - 12px gap.
    - "Change standing charity →" (opens charity picker modal — Pass B)

### Lifetime mini-card (sits below the Direction Card, NOT inside the height-matched grid row)

White `--portal-card-reading` bg, 1px `--portal-line` border, 16px radius. Two rows with hairline between, 20px y / 28px x padding each:
- Row 1: Italic "This financial year" / Fraunces semibold 18px `--portal-emerald` "$12,000" + Inter 12px muted "12 meetings"
- Row 2: Italic "Lifetime" / Fraunces semibold 18px `--portal-emerald` "$28,000" + Inter 12px muted "28 meetings"

Sits 16px below the Direction Card. The right column has no counterpart at this vertical position (Request Box already ended at the Direction Card's bottom edge); Upcoming Meetings starts after the natural gap.

### Equal-height grid row (NEW layout rule)

Direction Card on the LEFT and the compact Incoming widget on the RIGHT share **identical heights**, aligned at both top AND bottom. Implementation: grid `items: stretch`. The widget's natural content is shorter than the Direction Card (which carries the 96px charity logo + name + helper + credentials + dual ghost buttons), so the widget stretches to match; its "Review all four requests →" footer is pinned to the bottom of the matched height (`display: flex; flex-direction: column; justify-content: space-between` or equivalent — empty space sits between the 4th row and the footer). Lifetime mini-card sits BELOW the height-matched row in the left column with no right-column counterpart at that vertical position (intentional asymmetry).

### Compact Incoming list widget (LOCKED 2026-06-09 — replaces the earlier scrollable card-in-card pattern)

Right column (col-span-7), white `--portal-card-reading` bg, 1px `--portal-line` border, 16px border radius, 28px internal padding. Equal-height with Direction Card (see above).

**Widget header** (top of card):
- Top row: italic Inter 12px `--muted-foreground` "Incoming requests" eyebrow LEFT + Fraunces semibold 18px `--portal-ink` "4 awaiting" RIGHT
- 4px gap
- italic Inter 12px `--muted-foreground` "Soonest meeting in 24 hours" sub-line
- 20px gap, 1px `--portal-line` hairline, 20px gap

**LIST of 4 compact rows.** Hairline between adjacent rows (no hairline above first or below last). Each row ~80–88px tall:
- LEFT: 40px round photo-primary avatar (initials fallback on `--portal-amber-soft` when no photo on file)
- 14px gap
- MIDDLE (flex-1, vertical stack):
  - Inter 14px semibold `--portal-ink` name + Inter 13px `--muted-foreground` " · Role · Company" inline (truncate with ellipsis if exceeds width — Sam Patel renders "Sam Patel · Head of RevOps · Acme R..." in the locked widget width)
  - 4px gap
  - Italic Inter 12px `--muted-foreground`: "Date · duration · provider" (e.g. "Tuesday, 9 June · 30 min · Zoom")
- 14px gap
- RIGHT cluster (vertical stack, items-end):
  - Inline action row: 3 buttons, 8px gap, 32px tall, compact 14px x padding, 8px radius:
    - Primary `--portal-emerald` "Accept" — Inter 12px semibold white
    - Ghost "Decline" — Inter 12px semibold `--portal-ink`, transparent bg, 1px `--portal-line` border
    - Ghost "Forward" — same pattern as Decline
  - 8px gap
  - Italic Inter 12px `--portal-ink` ghost link with right-chevron, right-aligned: "More about [Vendor Company] →" — navigates to `/exec/requests` anchored to this row's request id

**Widget footer** (pinned to the bottom of the matched height):
- 1px `--portal-line` hairline
- 20px gap
- Italic Inter 13px `--portal-ink` ghost link with right-chevron, right-aligned within the card padding: "Review all four requests →" — navigates to `/exec/requests` (the new locked Incoming Requests batch page, see [`../exec-incoming-requests/README.md`](../exec-incoming-requests/README.md))

### What this widget replaces (history note)

The earlier-locked widget was a scrollable card-in-card container holding 4 expanded request cards (each with Q1/Q2 truncated, charity narrative, verified trust line, full 3-button action row, "More about [vendor]" navigation row). Below it sat a "SHOWING 2 OF 4 · SCROLL TO VIEW THE REST" mono helper. Above it sat a separately-centered "Four requests" Fraunces 22px section header.

ALL OF THAT IS REMOVED. Replaced by the compact list widget specced above. The full review surface (Q1 + Q2 + verification + gift block + full-width 48px action buttons) now lives on `/exec/requests` — see the Exec Incoming Requests lock. The dashboard's role for incoming requests is now at-a-glance queue + fast actions + "Review all" navigation.

Pre-change file preserved by the agent as `Exec Portal Dashboard v3 (pre-compact-incoming).html` for reference.

### Upcoming Meeting card (NEW pattern — proper card, not a row)

Three cards stacked, 16px gap. Each card: white `--portal-card-reading` bg, 1px `--portal-line` border, 12px radius, 28px padding. Two visual sections per card separated by a 1px `--portal-line` hairline:

**TOP section** — identity + primary action.
- Left cluster: stack 1 = Fraunces semibold 20px date + Inter 13px muted time · duration. Stack 2 = 40px round photo avatar + Inter 15px semibold name + Inter 13px muted "Title · Company".
- Right cluster: primary `--portal-emerald` button ("Join Zoom →" or "Join Teams →"), 12px y / 22px x padding.

**BOTTOM section** — charity row + secondary actions.
- Left cluster: 16px emerald heart-outline glyph + stack:
  - Inter 13px `--portal-ink`: "$1,000 to [Charity name]"
  - Inter 12px italic `--muted-foreground`: status line
    - Standing: "Your standing nomination"
    - Override: "For this meeting only · Your standing nomination (Royal Flying Doctor Service) stays"
- Right cluster: 24px gap between, all italic ghost links Inter 13px `--portal-ink` with right chevron:
  - "Change charity →" (opens charity picker modal — Pass B)
  - "Request reschedule →" (routes to admin via task — Pass B)
  - "View detail →" (SUPERSEDED 2026-06-10: navigates to `/exec/meetings?drawer=<meeting_id>` — the Meetings List drawer-as-detail. The standalone meeting detail page was killed by the Exec Meetings List lock.)

Below the three cards, 16px gap, right-aligned italic ghost link "View all meetings →".

### Recent Impact (record-as-feed, not a metrics tile)

Section header: Fraunces semibold 22px "Recent impact" + Inter 13px muted "Three most recent gifts. Twelve held this financial year."

Three single-row entries on `--portal-page` bg (no enclosing card), 1px `--portal-line` hairline between rows, 24px y padding per row. Each row layout:
- 32px round photo avatar (photo-primary, initials fallback) floated left.
- Mono 11px uppercase `--muted-foreground` date prefix (e.g. "02 JUN"). The ONLY mono usage outside the scroll helper.
- Inter 14px `--portal-ink` single-sentence body: "Sam Patel, Acme Robotics, sent $1,000 to Royal Flying Doctor Service."
- Right: Inter 12px italic `--muted-foreground` "Confirmed."

Below: right-aligned italic ghost link "View all impact →".

### Footer

72px gap. Single centered Inter 12px `--muted-foreground`: "Signed in as priya@lumenindustries.com". 6px gap. Centered: "Pause requests · Privacy · Terms".

### Modal-only charity-change pattern (LOCKED — exec-portal interaction model)

All four charity-change triggers on this screen (Direction Card "Change standing charity →", each of three Upcoming Meeting "Change charity →" links) open the SAME charity picker modal. NOT a dropdown, NOT a drawer, NOT an inline expand, NOT a navigation to a separate page. The modal overlays the dashboard; user stays on the dashboard with the modal in focus.

Same modal component, context-aware on header title + sub-line + primary action button label:
- Direction Card trigger → "Change your charity" / "Set as my charity"
- Upcoming Meeting trigger → "Direct this meeting to a different charity" / "Use for this meeting"

### Charity picker modal (LOCKED 2026-06-08 alongside the dashboard)

The modal is now designed and locked. Lives as VP2 + VP3 of the dashboard file — modal-on-dashboard, not as a standalone surface.

**Dim + blur backdrop (locked exec-portal modal pattern):**
- `--portal-ink` at 20% opacity overlay over the dashboard
- 2px backdrop-blur
- The dashboard underneath stays clearly recognisable — sidebar, metric strip, charity name, all readable. Dim is just enough to signal "modal is the focus." Heavier dim (30%+) erases the context; lighter (no dim) loses focus.

**Modal container:**
- 560px max-width, 80vh max-height
- White `--portal-card-reading` bg, 1px `--portal-line` border, 16px border radius
- Subtle drop shadow: `0 8px 32px rgba(20, 20, 30, 0.08)`
- Vertical flex: sticky header → sticky search → sticky "Recently directed" pill row → scrolling charity list → sticky footer
- The charity list is the only section that scrolls

**Sticky header** (40px top / 28px x / 28px bottom padding, hairline below):
- Left: Fraunces semibold 22px title (context-aware — see VPs) + 6px gap + Inter 13px `--muted-foreground` sub-line
- Right: 32px round close button with 16px X-outline glyph (1.6px stroke, `--muted-foreground`), transparent bg

**Sticky search** (20px y / 28px x padding, hairline below):
- Full-width input on `--portal-page` warm cream bg, 1px `--portal-line` border, 10px radius
- 18px outline search glyph left + placeholder "Search by name, cause, or ABN" in italic Inter 14px `--muted-foreground`
- Focus state: 2px `--portal-emerald` ring

**Sticky "Recently directed" pill row** (20px y / 28px x padding, hairline below):
- Italic Inter 12px `--muted-foreground` eyebrow "Recently directed"
- 12px gap, horizontal flex row of 3 pills (Beyond Blue · OzHarvest · The Smith Family)
- Default pill: rounded-full, 1px `--portal-line` border, transparent bg, Inter 13px medium `--portal-ink`, 6px y / 14px x padding
- Pending-selected pill: 1.5px `--portal-emerald` border, bg `color-mix(in oklab, var(--portal-emerald) 8%, white)`, Inter 13px semibold `--portal-emerald`, 12px outline check glyph (1.6px stroke, `--portal-emerald`) on the left

**Scrolling charity list** (max-height ~340px before scrollbar, 20px top / 28px x padding):
- Italic Inter 12px `--muted-foreground` eyebrow "All charities"
- List of charity rows with 1px `--portal-line` hairline dividers between rows (no divider above first or below last)
- Each row: 16px y padding, flex items-start, 16px gap
  - Left: 20px round radio. Unselected: 1.5px `--portal-line` border + transparent fill. Pending-selected: `--portal-emerald` filled + 4px white inner ring + 4px `--portal-emerald` dot center (classic radio look).
  - Middle: stack flex-1 — Inter 14px semibold `--portal-ink` charity name + 4px + Inter 12px `--muted-foreground` "[cause] · ABN [number]" + 4px + Inter 12px `--portal-ink` @ 80% opacity blurb
  - Right (only on CURRENT row): italic Inter 12px `--muted-foreground` "Current", right-aligned, vertically centered
- Hover state (entire row): subtle `--portal-card` tint overlay
- Pending-selected row state: bg `color-mix(in oklab, var(--portal-emerald) 5%, white)` + emerald-filled radio

**Sticky footer** (20px y / 28px x padding, hairline above):
- Flex justify-between items-center
- Left: italic Inter 11px `--muted-foreground` "All charities verified live against the ACNC DGR register."
- Right cluster, 8px gap:
  - Ghost "Cancel" — Inter 13px medium `--muted-foreground`, 10px y / 18px x, no border
  - Primary CTA — `--portal-emerald` bg, white ink, Inter 13px semibold, 10px y / 22px x, 8px radius. Label is context-aware. Disabled state (50% opacity, cursor not-allowed) when pending selection = current selection.

**The 8 charities (locked sample data — every charity-picker surface in the exec portal uses this set):**
1. Beyond Blue · Mental health & wellbeing · ABN 87 093 865 840 · "Australia's most trusted mental health support service."
2. OzHarvest · Food rescue & relief · ABN 46 219 931 433 · "Rescues surplus food and delivers it to people in need."
3. Royal Flying Doctor Service · Remote health services · ABN 74 438 059 643 · "Emergency and primary healthcare for remote Australia."
4. The Smith Family · Education & young people · ABN 28 000 030 179 · "Long-term educational support for disadvantaged children."
5. Black Dog Institute · Mental health research · ABN 12 115 954 197 · "Research and care for mood disorders and suicide prevention."
6. Australian Red Cross · Community & crisis relief · ABN 50 169 561 394 · "Humanitarian aid, blood services, and disaster response."
7. Cancer Council Australia · Cancer research & support · ABN 91 130 793 725 · "Funds research, prevention, and support for people with cancer."
8. Australian Conservation Foundation · Environment & climate · ABN 22 007 498 482 · "Australia's national environment organisation."

**VP2 — Standing nomination context** (triggered from Direction Card)
- Title: "Change your charity"
- Sub-line: "Every meeting you accept will direct your gift to your chosen DGR-endorsed charity."
- Recently directed pill PENDING: Beyond Blue
- List row PENDING: Beyond Blue (row 1)
- Row marked CURRENT: Royal Flying Doctor Service (row 3)
- Primary CTA: "Set as my charity" (enabled — pending ≠ current)

**VP3 — Per-meeting override context** (triggered from Mira Chen's Upcoming card)
- Title: "Direct this meeting to a different charity"
- Sub-line: "Just for this meeting. Your standing nomination (Royal Flying Doctor Service) stays in place for everything else."
- Recently directed pills: all default state, none pending
- List row PENDING: Cancer Council Australia (row 7 — demonstrates selection of a charity not in recent pills)
- Row marked CURRENT: Royal Flying Doctor Service (the per-meeting default falls back to standing nomination until explicitly overridden)
- Primary CTA: "Use for this meeting" (enabled — pending ≠ current)

**ACNC DGR register**, not ABR, is the locked verification authority phrase (ACNC + ATO administer DGR endorsement; ABR is for ABNs only).

### Charity detail modal — VP4 (LOCKED 2026-06-08 alongside the dashboard)

Triggered by the Direction Card's "Learn about Royal Flying Doctor Service →" ghost button. Pure READ surface — no selection, no commitment CTA. The exec is reading about their current standing nomination. Lives as VP4 of the dashboard file, modal-on-dashboard pattern, dashboard visible behind at the locked 20% ink dim + 2px backdrop-blur.

**Modal container** (same architecture as the picker, anatomy diverges):
- 560px max-width, 80vh max-height
- White `--portal-card-reading` bg, 1px `--portal-line` border, 16px border radius
- Drop shadow: `0 8px 32px rgba(20, 20, 30, 0.08)`
- Vertical flex: sticky header → flush hero image → scrolling content → sticky footer
- Only the content area scrolls

**Sticky header** (28px y / 28px x padding, hairline below):
- Left, vertical stack: italic Inter 12px muted "Standing nomination" eyebrow + 4px gap + Fraunces semibold 22px ink title "Royal Flying Doctor Service" + 4px gap + Inter 13px muted sub-line "Remote health services · Australia-wide"
- Right: 32px round close X button, 16px X-outline glyph (1.6px stroke, muted-foreground)

**Hero image strip** (full modal width, 180px tall, flush to modal edges between header hairline and content area, NO border-radius at top):
- Placeholder: golden-hour aircraft on remote tarmac (stand-in; build chat swaps in curated charity photography from `charity.hero_image_url`)
- `object-fit: cover`, no overlay, no caption

**Scrolling content area** (32px top / 28px x / 32px bottom padding, 48px gap between sections):

1. **Our purpose** — italic Inter 12px muted eyebrow + Fraunces 22px ink "Why the Flying Doctor exists" + Inter 14px ink body paragraph (mission statement scraped from `charity.purpose`).
2. **What the gift supports** — italic eyebrow + Fraunces 22px "Three programmes on the ground" + 3 stacked programme items separated by 1px `--portal-line` hairlines. Each item: italic Inter 13px ink semibold programme label + 6px gap + Inter 14px muted body (1.5 line-height). Locked RFDS sample programmes: Emergency aeromedical retrieval / Primary and mental health clinics / Indigenous health programmes.
3. **Where each meeting goes** — italic eyebrow + Fraunces 22px "What $1,000 funds" + Inter 14px ink body paragraph + 16px gap + quiet quote block (Fraunces italic 16px ink quote + 8px gap + Inter 12px muted attribution, indented 20px with 2px `--portal-emerald` left rule, NO card, NO quote glyph). Locked quote: "Without the Flying Doctor, we'd have lost him. Simple as that." / "Station owner, Diamantina Shire QLD".
4. **From the field** — italic eyebrow + Fraunces 22px "Recent stories" + 2 stacked story cards (white `--portal-card-reading` bg, 1px `--portal-line` border, 12px radius, 20px padding, 16px gap between). Each card: mono 11px uppercase tracking-[0.18em] muted date prefix (THE ONE ALLOWED MONO USAGE on this modal) + 8px + Fraunces semibold 16px ink headline + 8px + Inter 13px muted body (2 lines) + 12px + italic Inter 13px ink ghost link "Read full story ↗" with outbound-arrow glyph. Locked story stubs: "12 MAY · A nine-hour night flight from Birdsville" + "28 APR · First mental health clinic lands in Wilcannia".

**Sticky footer** (20px y / 28px x padding, hairline above):
- Flex justify-between items-center
- Left: italic Inter 11px muted "Verified live against the ACNC DGR register."
- Right: single primary `--portal-emerald` "Done" CTA (Inter 13px semibold white, 10px y / 22px x, 8px radius). **NO** ghost Cancel. **NO** "Set as my charity" — this charity already IS the standing nomination; that action belongs in the picker modal, not here.

**Architecture decisions baked in:**
- Single trigger in v1: Direction Card "Learn about [charity] →". The picker modal does NOT chain to this detail modal — stacked modals are forbidden. If exec wants to research before changing, they research first, close, then open the picker.
- ABN / DGR endorsement / charity registration metadata DOES NOT appear inside this modal. Those credentials stay on the Direction Card's inline credentials line, deliberately separated. The modal is content; the credentials are governance.
- Content scope locked: purpose · programmes · "where the gift goes" + quote · recent stories. NOT credentials. NOT donation forms. NOT a CTA back to change.

**Data sources per module (build-chat reference):**

| Module | Source | Notes |
|---|---|---|
| Hero image | `charity.hero_image_url` | Scraped from charity website, admin-curated; weekly re-scrape |
| "Our purpose" body | `charity.purpose` | Scraped from charity website |
| Three programme items | `charity.programmes[]` | Typically top 3 by impact, admin-curated order |
| "What $1,000 funds" body | static template with `$amount` token from `bandForMeetingNumber(vendor.cycle.held + 1).rateCents` | Indicative figure pre-Held |
| Quote + attribution | `charity.featured_quote` + `charity.featured_quote_attribution` | Section hidden if charity has no curated quote |
| Two story cards | `charity.stories[]` ORDER BY `published_at DESC LIMIT 2` joined to `story.canonical_url` | Outbound link opens in new tab |
| Footer ACNC line | static | |
| "Done" CTA | closes modal, returns focus to Direction Card trigger button | |

If a content field is missing the section is hidden rather than rendered empty.

### Photo-primary avatar rule (NEW — portal-wide rule for the exec portal)

Every person avatar on the exec portal is photo-primary with initials-fallback:

- **Default state:** circular avatar at the surface's specced size (32px sidebar + Recent Impact, 40px Upcoming, 44px Incoming). Photo inside the circle, `object-fit: cover`, `border-radius: 50%`. 1px `--portal-line` 60%-opacity rim.
- **Fallback state:** same size circle, `--portal-amber-soft` bg, Inter semibold `--portal-amber-ink` initials centered.

Render trigger: `photo_url IS NOT NULL` → default; else fallback. Charity logos and heart glyphs are separate elements; this rule applies to person avatars only.

This rule **propagates to every future exec-portal screen** — Meetings list, Impact list, Profile, request detail, meeting detail, EA mode banner. Do not re-debate per screen.

## Data sources per module (build-chat reference)

| Module | Source | Notes |
|---|---|---|
| Sidebar Priya avatar + name + title + company | `auth.user` joined to `executive` profile | Photo from `executive.photo_url` |
| Sidebar nav counts (none rendered on this screen) | reserved for future | Exec sidebar has no count badges in v1 |
| Topbar "Home" label | static page title | |
| Greeting H1 | `executive.first_name` | Personalisation reads first name |
| Greeting date sub-line | `formatLongDate(now, timezone=AEST)` → "Monday, 8 June." | Locale: AU |
| Metric strip · Incoming | `count(request WHERE executive_id=? AND status='submitted')` | |
| Metric strip · Upcoming | `count(meeting WHERE executive_id=? AND status='confirmed' AND scheduled_at IN current_month)` | Calendar month default; consider rolling 30 if Issy uses elsewhere |
| Metric strip · This FY | `executiveCharityForPeriod(executive.id, financialYearWindow(now))` from `lib/reporting.ts` | Frozen-at-Held sum |
| Metric strip · This FY meetings count | `count(meeting WHERE executive_id=? AND status='held' AND held_at IN current_fy)` | |
| Metric strip · Lifetime | `executiveCharityForPeriod(executive.id, null /* unbounded */)` | Frozen-at-Held sum |
| Metric strip · Lifetime meetings + charities | counts on `gift_record` joined | |
| Direction Card · Logo | `charity.logo_url` scraped from charity website (job runs periodically) | Fallback: 2-3 letter mark on `--portal-amber-soft` |
| Direction Card · Name + cause | `executive.default_charity_id` → `charity.name`, `charity.cause` | |
| Direction Card · Helper paragraph | static copy | |
| Direction Card · Credentials line | `charity.abn`, `charity.dgr_item`, `charity.dgr_status` | All from ACNC register |
| Direction Card · "Learn about [charity] →" | Opens charity detail modal (Pass B) | Content: scraped from charity website — purpose, programmes, where money helps, recent stories. NOT credentials. |
| Direction Card · "Change standing charity →" | Opens charity picker modal (Pass B) | Sets `executive.default_charity_id` |
| Lifetime mini-card | same as Metric strip · This FY and Lifetime | Repetition is deliberate — reinforces the lifetime narrative |
| Compact Incoming widget · header "4 awaiting" | `count(request WHERE executive_id=? AND status='submitted')` formatted as "N awaiting" (numeral, NOT word form — the in-widget count chip uses the figure for scanability) | Hide widget entirely OR render the empty state if count == 0 (TBD) |
| Compact Incoming widget · sub-line "Soonest meeting in 24 hours" | `min(request.proposed_at) - now()` rounded to nearest sensible unit ("in 24 hours" / "in 3 days" / "next week" / etc.) | Live-relative; client-tick acceptable |
| Compact Incoming row · Identity | `request.requester_user` → `vendor_user.name`, `vendor_user.title`, `vendor.name` | Inline format "Name · Role · Company" with ellipsis truncation |
| Compact Incoming row · Avatar | `vendor_user.photo_url` photo-primary, initials fallback | See NEW data field requirement below |
| Compact Incoming row · Date sub-line | `request.proposed_at` formatted "Weekday, D Month · M min · Provider" | Locale: AU |
| Compact Incoming row · Accept | mutation: `request.status = 'accepted'` + admin task created | Same semantics as the full /exec/requests page |
| Compact Incoming row · Decline | mutation: `request.status = 'declined'` (optional reason captured in a future Pass B modal) | |
| Compact Incoming row · Forward | mutation: `request.forwarded_to_ea_at = now` + email to EA | |
| Compact Incoming row · "More about [Vendor]" | Navigate to `/exec/requests` anchored to this row's request id (e.g. `#req-EXC-1042`) | Build chat picks anchor format |
| Compact Incoming widget · "Review all four requests →" footer | Navigate to `/exec/requests` (the locked Incoming Requests batch page) | Footer pinned to bottom of equal-height match |
| Upcoming card · Identity | `meeting.vendor_user`, `meeting.vendor` | |
| Upcoming card · Avatar | `vendor_user.photo_url` | Same field |
| Upcoming card · Date + time | `meeting.scheduled_at` in exec's timezone (AEST) | Format: Fraunces date / Inter time · duration |
| Upcoming card · Join button | `meeting.conference_url` + `meeting.conference_provider` ("Zoom" / "Teams") | Label adapts |
| Upcoming card · Charity row | `gift_record.charity_id` (if exec set an override) OR `executive.default_charity_id` | Override takes precedence |
| Upcoming card · "$1,000" amount | `bandForMeetingNumber(vendor.cycle.held + 1).rateCents` | Indicative pre-Held; frozen at Held |
| Upcoming card · "For this meeting only" status line | `gift_record.charity_id != executive.default_charity_id` | Standing if equal |
| Upcoming card · "Change charity →" | Opens charity picker modal (Pass B) | Sets `gift_record.charity_id` for this meeting |
| Upcoming card · "Request reschedule →" | Mutation creates an admin task; admin reissues the calendar invite | Per the brief — exec never wrangles a reschedule UI |
| Upcoming card · "View detail →" | Navigate to `/exec/meetings?drawer=<meeting_id>` — opens the locked Meetings List drawer (drawer-as-detail supersession 2026-06-10) | Standalone `/exec/meetings/[id]` page is dead |
| Recent Impact rows | `gift_record WHERE executive_id=? ORDER BY sat_date DESC LIMIT 3` joined to `vendor_user`, `vendor`, `charity` | Frozen-at-Held amounts; never recomputed |
| Recent Impact avatar | `vendor_user.photo_url` | Photo-primary |
| Footer · "Signed in as" | `auth.user.email` | |
| Footer · Pause requests | Future Profile setting — currently no destination | Renders as link, hooks Pass B |

**No money number is computed in the page.** Every $ figure reads from `@thegoodintro/pricing` or `lib/reporting.ts`. Sample data in the mockup ($1,000, $12,000, $28,000) is illustrative; the build hydrates from frozen `gift_record.charity_amount_cents` and the pricing engine.

## NEW data field requirement (build-chat MUST add)

`vendor_user.photo_url text NULL` — vendor users upload a profile photo via the vendor portal's Settings → Profile screen. The locked vendor Settings/Profile screen does NOT currently include a photo upload control; this needs to be added before the exec portal photo-primary rule has real data.

Options:
1. Add the photo upload control to the locked Vendor Settings/Profile screen (Pass B to that screen).
2. Ship the exec portal with all vendor avatars rendering the initials fallback until vendor users self-upload (acceptable interim).

Recommend option 2 for the build chat's initial port — ship now with fallback, plan the vendor photo upload as the next vendor portal addition.

## Sample data (LOCKED — every exec screen must align)

- **Signed-in exec:** Priya Raghavan · CFO · Lumen Industries · `priya@lumenindustries.com` · ID `EXC-1042` · standing charity Royal Flying Doctor Service
- **EA:** Lena Park · `lena@lumenindustries.com`
- **This FY:** 12 meetings held · $12,000 to charity (8 charities supported)
- **Lifetime:** 28 meetings held · $28,000 to charity
- **Today:** Monday, 8 June 2026

**Incoming requests (4 total, all 4 rendered in the compact widget — no scroll cut after 2026-06-09 rework):**
1. Sam Patel · Head of RevOps · Acme Robotics · Tuesday, 9 June · 30 min · Zoom (Band 2 → $1,000)
2. Theo Markham · Founder · Latch Health · Thursday, 11 June · 45 min · Zoom (Band 1 → $900)
3. Naomi Brooks · VP Sales · Beacon Procurement · Monday, 15 June · 30 min · Teams (Band 3 → $1,100)
4. Hana Okonkwo · Co-founder & COO · Vesta Climate · Wednesday, 17 June · 30 min · Zoom (Band 2 → $1,000)

All 4 align with the locked sample data on the Exec Incoming Requests page (`/exec/requests`). The compact widget renders identity + proposed time + 3-button action cluster + "More about [Vendor] →" link per row; full Q1/Q2/verification/gift content lives on the batch page, not the dashboard.

**Upcoming meetings (3 total, all visible):**
1. Tue 17 Jun · 10:00 AEST · 30 min · Mira Chen · Founder · Anvil Software · Join Zoom · $1,000 to Royal Flying Doctor Service (standing)
2. Thu 19 Jun · 14:30 AEST · 45 min · Jamie Holloway · CRO · Coastline Logistics · Join Teams · $1,000 to Royal Flying Doctor Service (standing)
3. Mon 30 Jun · 11:00 AEST · 30 min · Devi Iyer · Head of Sales · Pillar Risk · Join Zoom · $1,000 to Beyond Blue (**override** — demonstrates the pattern)

**Recent Impact (3 most recent gifts):**
1. 02 JUN · Sam Patel · Acme Robotics · $1,000 to Royal Flying Doctor Service · Confirmed
2. 19 MAY · Aisha Khan · Brightside Analytics · $1,000 to Royal Flying Doctor Service · Confirmed
3. 05 MAY · David Wu · Northbeam Insights · $1,000 to Royal Flying Doctor Service · Confirmed (**RECONCILED 2026-06-11 on Exec Impact List lock** — was previously sampled as Beyond Blue override on 03 MAY; date corrected to 05 MAY to align with locked Meetings List "Mon, 5 May" sample, and charity corrected to RFDS standing. The per-meeting override sample now lives on Liam Patel · Mon 14 Apr · $1,000 to OzHarvest, surfaced via the Meetings List Past section + Impact list. All exec surfaces align on David Wu = RFDS standing.)

**Charity logo placeholder:** RFDS letters on `--portal-amber-soft` circle. Build chat replaces with `charity.logo_url` (scraped from royalflyingdoctor.org.au).

## Open decisions parked (do NOT silently resolve)

- **Charity scrape source confirmed:** charity's own website only (mission, programmes, stories, photos). NOT ACNC for the "Learn more" modal — those credentials stay on the Direction Card's inline credentials line. Build chat scrape job needs charity website page-mapping + cache TTL (recommendation: weekly re-scrape).
- ~~**Meeting detail page (Pass B)** — `/exec/meetings/[id]` destination for "View detail →" on Upcoming. Not designed yet.~~ **RESOLVED 2026-06-10** — the standalone page is dead; "View detail →" opens the locked Meetings List drawer (`/exec/meetings?drawer=<id>`).
- **Vendor user photo upload control on Vendor Settings/Profile** — see "NEW data field requirement" above. Recommend Pass B addition to the already-locked Vendor Settings/Profile screen.
- **"Pause requests" footer link** — destination not yet defined. Likely Profile setting; design when Profile is built.
- **EA mode "Acting for Priya" banner** — when Lena signs in, an EA banner persists at the top of every page. Not designed yet; designed alongside Profile / Meetings.
- **Per-meeting charity override timing** — current spec: override settable any time before Held. After Held the gift_record snapshot freezes. Confirm with Issy before build.
- ~~**Compact Incoming widget · empty state (0 pending)** — when count == 0, should the widget hide entirely (collapsing the equal-height grid to single-column), shrink to a quiet "You're all caught up." pill in the right column, or render an empty mini-state? Defer to first build pass; the dedicated /exec/requests page's VP2 (sanctioned 🎉 hero) handles the dedicated empty surface.~~ **RESOLVED 2026-06-12 on Exec First-Run Empty States** — the widget renders ONE universal empty state (header "Incoming requests · None awaiting" + centered italic "Nothing awaiting your answer." + muted sub-line; "Review all" footer link hidden). Never hidden, never a pill; copy is valid for both a new exec and a cleared queue, so the dashboard needs no first-run/cleared conditional. See `../exec-first-run-empty-states/README.md`.

**RESOLVED in earlier lock cycles** (do not re-debate):
- Charity picker modal (VP2 + VP3) — designed and locked 2026-06-08.
- Charity detail modal (VP4) — designed and locked 2026-06-08.
- Request detail page (`/exec/requests`) — designed and locked 2026-06-09 as the Incoming Requests batch surface (not `/exec/requests/[id]` as originally specced). Scope reworked from single-request detail to all-pending batch list. See [`../exec-incoming-requests/README.md`](../exec-incoming-requests/README.md).

## Anti-list (do not regress)

- **Exec sidebar is charcoal ink**, never emerald (admin only) or teal-pine (vendor only).
- **Topbar right EDGE is content-empty.** No bell, no help, no date. Concierge calm. (AMENDED 2026-06-10: the universal topbar search — 480px ⌘K input center-right — applies to every exec page including this one at build time; it is the ONLY chrome allowed in the topbar beyond the page title. See `../exec-meetings-list/README.md`.)
- **Mono uppercase is forbidden** outside ONE place after the 2026-06-09 rework: Recent Impact row date prefix. (The previous second usage — the scrollable Incoming container's "SHOWING 2 OF 4 · SCROLL TO VIEW THE REST" helper — was removed when the scrollable container was replaced by the compact list widget.) Section heads remain Fraunces semibold 22px; inline labels italic Inter.
- **No status pills, count chips, progress bars, amber-soft badges** anywhere on the page. Status reads as plain italic text.
- **No drop shadows.** Hairline borders only. The ONE decorative element is the Direction Card's editorial emerald flourish (which is now BEHIND the charity logo).
- **Capital "Good" in `--portal-emerald`** wherever it appears in prose (greeting, metric strip "to Good", brand wordmark).
- **Per-meeting charity override lives ONLY on Upcoming, never on Incoming.** Incoming shows charity as display-only narrative.
- **Photo-primary avatars with initials-fallback** at the locked sizes (32 / 40 / 44px). Photos live INSIDE the small circle (object-fit: cover); they do NOT replace the avatar with a larger image.
- **"More about [vendor]" is navigation, not inline expand.** Right-chevron icon (NOT plus/minus toggle). Click → `/exec/requests` anchored to the row's request id (NOT `/exec/requests/[id]` as the original spec said — the route was reworked 2026-06-09 to the batch list view, not per-ID).
- **Charity-change triggers open a modal**, never a dropdown, drawer, or inline expand.
- **No emojis.** 1.6px stroke outline icons only.
- **No em dashes, no en dashes.** Use "·" as separator.
- **Forbidden vocab** (brand-wide): marketplace, magic, wizard, coaching, program, MeetMagic, AlphaSights.
- **Three actions per incoming card** (Accept / Decline / Forward to Lena). Never a fourth (no Snooze).
- **Money rule** (HARD): Recent Impact $ figures are frozen at Held; Lifetime + This FY are frozen sums. The $1,000 figures on Incoming are projected via `bandForMeetingNumber(vendor.cycle.held + 1).rateCents`. Never hardcoded.
- **Brand wordmark is one word**: "TheGoodIntro". Never "The Good Intro".

## Issy's fix passes (v1 → v10 + 2026-06-09 widget rework, the design narrative)

The dashboard went through 10 visible iterations before the first lock 2026-06-08, then a structural widget rework 2026-06-09 swapping the scrollable card-in-card Incoming container for a compact list widget. Highlights:
- **v1 → v2:** First pass too sparse — three stacked sections looked like a SaaS task queue. Rebuilt with proper metric strip + grid + multiple modules.
- **v2 → v3:** Per-meeting charity override moved OUT of Incoming cards INTO Upcoming Meetings cards (charity decided at commit time, not at accept). Charity row on Incoming softened to a narrative display-only line.
- **v3 → v4:** Direction Card cleanup — DGR endorsed credential moved into inline credentials line; 2-col ABN/Status grid collapsed to one inline line.
- **v4 → v5/v6:** "Change standing charity" promoted from italic ghost text to ghost button after Issy flagged that italic links read too quiet. Added "Learn about [charity] →" companion ghost button stacked above. Same treatment for both, label upright Inter semibold not italic.
- **v6 → v7/v8:** Avatars upgraded photo-primary with initials fallback. Initial render dropped photos in as large rectangular images; v8 fixed by constraining them to inside the existing small circular avatar containers.
- **v8 → v9:** Direction Card top got an actual charity logo (96px circular, replacing the blurred emerald flourish as the visual identity). "Four requests" header centered. Direction Card and Request Box height-matched to align tops AND bottoms.
- **v9 → v10:** "More about [vendor]" plus/minus toggle replaced with a right-chevron navigation affordance; Theo Markham's inline expanded state removed entirely (detail moves to a future `/exec/requests/[id]` page).
- **Modal addition (VP2 + VP3, locked 2026-06-08):** Charity picker modal designed as additional viewports of the dashboard file. Initial attempts: standalone "Charity Picker Modal" file → abandoned (modal floated on plain backdrop, no context). Briefly considered a full "My charity" page → reverted (modal is the right pattern for a quick edit). Final: modal lives on the dashboard via VP2 (standing change) + VP3 (per-meeting override), dashboard visible behind at 20% ink dim + 2px blur. Same modal component, context-aware on title + sub-line + primary CTA label.
- **Charity detail modal addition (VP4, locked 2026-06-08):** Read-only "Learn about [charity]" modal, triggered from Direction Card's left ghost button. Same modal-on-dashboard backdrop pattern as VP2/VP3. See VP4 section above.
- **Incoming widget rework (2026-06-09):** Replaced the scrollable card-in-card container (with truncated Q1/Q2, charity narrative, verified trust line, full-size action row, "More about" navigation row inside each of 4 cards) and its "SHOWING 2 OF 4 · SCROLL TO VIEW THE REST" mono helper and its separate "Four requests" centered section header with a single compact list widget: header eyebrow + "4 awaiting" + soonest sub-line + 4 hairline-separated rows (avatar + identity + 3 compact buttons + "More about" link) + bottom-pinned "Review all four requests →" footer link. The full review surface (Q1 + Q2 + verification + gift + full-width action row) was moved to the new locked `/exec/requests` Incoming Requests batch page. Pre-rework file preserved as `Exec Portal Dashboard v3 (pre-compact-incoming).html`.

## NOT designed in this pass (deferred)

- Meeting detail page (`/exec/meetings/[id]`).
- Other exec portal screens (Meetings list, Impact list, My charity, Profile). NOTE: The "My charity" sidebar nav item still exists; its destination is a view-only page (current nomination + history of past charities + impact summary). It is NOT the charity-change interaction surface — the modal is.
- EA mode "Acting for Priya" banner.
- Empty states (0 incoming, 0 upcoming, 0 impact, empty modal search results).
- Hover / expanded card states.
- Loading / error / skeleton states.
- Mobile viewport (modal becomes bottom-sheet on mobile).
- Post-click landing pages from the request email (Accept confirm, Decline-with-reason, Forward-to-EA).
