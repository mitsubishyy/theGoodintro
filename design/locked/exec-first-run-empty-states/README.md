# Exec First-Run Empty States — LOCKED 2026-06-12

Designed in Claude Design 2026-06-11, locked 2026-06-12. **The first-run
(never-had-data) states for the exec portal** — what a brand-new executive sees
before any requests, meetings, or gifts exist. Closes gap #3 of the 2026-06-11
whole-portal gap audit. Three desktop viewports re-rendering locked chrome with
zero data, plus a BUILD NOTES · OPEN ITEMS annotations board that is part of
the export.

Claude Design file: **"Exec First-Run Empty States"**.

**The framing rule:** a new exec is fully set up BY US on the onboarding call
(profile, charity, calendar), so the first-run portal must read "ready and
waiting", never "empty and unconfigured". Nothing here is a setup wizard, and
the heroes carry NO buttons — the portal asks nothing of a new exec; requests
arrive by email.

**This file's authority is the empty-state CONTENT and RULES.** The chrome
anatomy authority stays with the original locks (Exec Dashboard, Meetings List,
Impact List). Three cosmetic render deviations are documented below; build
follows the original locks on all three.

## Viewports

| VP | Route | State |
|---|---|---|
| 1 | `/exec` | Dashboard as a NEW EXEC — zero everything; Direction Card fully populated (charity set at onboarding); Incoming widget in its universal empty state; Upcoming + Recent impact as quiet on-page lines |
| 2 | `/exec/meetings` | NO MEETINGS EVER — zero mini-strip, disconnected calendar banner, NO controls bar, NO section cards, first-run hero |
| 3 | `/exec/impact` | NO GIFTS EVER — zero mini-strip, NO controls bar, first-run hero personalised to the standing charity |

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Exec First-Run Empty States" → File > Export HTML |
| `screenshot-vp1-dashboard-new-exec.png` | TO DROP | Full dashboard — greeting + zero strip + Direction Card + empty Incoming widget + empty sections + footer |
| `screenshot-vp2-meetings-empty.png` | TO DROP | Meetings — zero strip + calendar banner + calendar-glyph hero |
| `screenshot-vp3-impact-empty.png` | TO DROP | Impact — zero strip + heart-glyph hero |
| `screenshot-annotations-board.png` | TO DROP | BUILD NOTES · OPEN ITEMS board |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md) — brand and pricing facts.
2. [`../exec-dashboard/README.md`](../exec-dashboard/README.md) — the canonical dashboard anatomy this file re-renders (Direction Card, metric strip, Incoming widget, equal-height grid). Its parked "Incoming widget at zero" question is RESOLVED by this lock.
3. [`../exec-meetings-list/README.md`](../exec-meetings-list/README.md) — canonical Meetings chrome (mini-strip, calendar banner, controls bar).
4. [`../exec-impact-list/README.md`](../exec-impact-list/README.md) — canonical Impact chrome.
5. [`../exec-incoming-requests/README.md`](../exec-incoming-requests/README.md) — the SANCTIONED 🎉 cleared-queue state that these first-run states must never be merged with.
6. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) — Global decisions, including the first-run / controls-hide rules recorded from this lock.
7. Open `screen.html` + screenshots.

## What is locked

### Demo sample (this file only — DEMONSTRATION DATA)

- **Andrew Liang · Managing Director · Ferncrest Capital ·
  andrew@ferncrestcapital.com** · onboarded "today" (Monday, 8 June 2026, the
  dashboard file-level date) · "AL" initials fallback avatar (no photo on
  file) · standing charity **OzHarvest** (Food rescue & relief · ABN
  46 219 931 433), chosen on his onboarding call.
- Demo-only, like Margaret Liu on the EA switcher. **Priya Raghavan remains
  the canonical exec sample.** Andrew exists so first-run states never
  contradict Priya's locked 28-meeting history.

### First-run empty hero (NEW exec-portal pattern — used on VP2 + VP3)

Centered stack ~28% down the content area:
- 64px circle, transparent fill, 1px hairline border, 24px 1.6px-stroke
  outline glyph centered (calendar glyph on Meetings, heart on Impact).
- 24px gap · Fraunces semibold 28px ink headline.
- 12px gap · italic Inter 14px muted sub-line, max-width 460px, centered.
- **NO buttons, NO CTA, NO emoji.** Copy-only.

### Controls-hide rule (NEW portal-wide rule)

Controls bars (view toggles, time-range toggles, sort dropdowns) render only
when the exec has **at least one record** on that surface. At zero records the
controls and the section cards are absent and the first-run hero renders. The
**universal topbar search always renders** (portal chrome, not a control).
Same progressive-disclosure principle as the locked portal-wide rule.

### First-run vs cleared-queue (two different states — never merge)

These are NEVER-HAD-DATA states. The "You're all caught up." 🎉 hero is the
CLEARED-QUEUE state and belongs exclusively to `/exec/requests` VP2. No emoji
appears anywhere in this file.

### VP1 — Dashboard as a new exec

- **Greeting**: "Good morning, Andrew." (capital "Good" emerald, locked
  pattern) + italic sub-line "Monday, 8 June. We set everything up on your
  onboarding call." The onboarding sub-line is a first-run variant — see data
  sources for the swap condition.
- **Metric strip** (dark ink, 4 groups, zeros):
  - "Incoming" · 0 · "requests reach your email first" (state-aware sub-line —
    the loaded page says "awaiting your answer")
  - "Upcoming" · 0 · "this month"
  - "This financial year" · $0 · "to Good · 0 meetings held" (Good emerald)
  - "Lifetime" · $0 · "0 meetings" (the "N charities" fragment is dropped at
    zero; returns with the first gift)
- **Direction Card: FULLY POPULATED.** The standing charity exists from day
  one (set at onboarding), so this card is NEVER empty. OzHarvest logo
  placeholder ("OzH" on amber-soft), eyebrow, Fraunces 40px name, cause line,
  locked helper paragraph verbatim, credentials line "ABN 46 219 931 433 ·
  Item 1 DGR · Live", both ghost buttons ("Learn about OzHarvest →" /
  "Change standing charity →").
- **Lifetime mini-card**: rendered with zeros ($0 · 0 meetings, both rows) —
  layout parity with the loaded dashboard.
- **Incoming widget — UNIVERSAL EMPTY STATE** (resolves the Exec Dashboard
  README's parked question): widget card kept (never hidden — hiding collapses
  the grid and the widget teaches what will appear). Header: italic eyebrow
  "Incoming requests" left + Fraunces semibold 18px "None awaiting" right.
  Centered in the body: italic Inter 14px ink "Nothing awaiting your answer."
  + italic Inter 13px muted "New requests reach your email first, then appear
  here with everything you need to decide." **NO footer link** ("Review all"
  hides at zero). The copy is deliberately valid BOTH for a new exec and for a
  veteran with a cleared queue — ONE state, no first-run/cleared conditional
  on the dashboard, ever.
- **Upcoming meetings** section head + on-page italic line (no card): "No
  meetings in the diary yet. When you accept a request, the confirmed time
  lands here." View-all link hidden at zero.
- **Recent impact** section head + on-page italic line: "Your first gift
  appears here once your first meeting is held. Confirmed, every time."
  View-all link hidden at zero.
- Footer: "Signed in as andrew@ferncrestcapital.com" + "Pause requests ·
  Privacy · Terms".

### VP2 — Meetings, no meetings ever

- Page header per the locked Meetings chrome: eyebrow "Your meetings" + H1
  "Meetings" + three-stat mini-strip zeros: "0 held this financial year"
  (emerald, single-accent) · "0 coming up" · "0 lifetime".
- **Connect-your-calendar banner rendered in its locked DISCONNECTED state**
  (component verbatim from the Meetings List lock). Execs whose calendar was
  connected at onboarding get the connected quiet-strip instead — that strip
  is a separate small pass (open item carried from the Meetings lock).
- No controls bar, no section cards (controls-hide rule).
- Hero (calendar glyph): "No meetings yet." / "Accept a request from your
  inbox and the confirmed meeting lands here, calendar invite and all."

### VP3 — Impact, no gifts ever

- Page header: eyebrow "Your giving" + H1 "Impact" + mini-strip zeros: "$0
  this financial year" (emerald) · "0 meetings held" · "$0 lifetime".
- No controls bar (no List/By charity, no time range, no sort).
- Hero (heart glyph): "Your first gift is one meeting away." / "Hold your
  first meeting and a real gift directs to OzHarvest in your name. Every gift
  lands here, confirmed." — **the charity name personalises to the exec's
  standing nomination** (the one dynamic word in the heroes).

## Documented render deviations (build follows the ORIGINAL locks — do not port these)

1. **Direction Card text centered** in this render. The canonical locked
   Direction Card (Exec Dashboard README) is left-aligned under the centered
   logo. Build follows the dashboard lock.
2. **Incoming widget stretched to the full left-column height** (its bottom
   aligns with the lifetime mini-card). The locked grid rule is equal-height
   with the Direction Card only, mini-card below with no right counterpart.
   Build follows the dashboard lock.
3. **Mini-strip labels rendered inline beside the numbers** on VP2/VP3. The
   locked three-stat mini-strip is a vertical stack (Fraunces number on top,
   italic label below). Build follows the Meetings List lock — empty and
   loaded states must share identical chrome.

None of the three changes function; all empty-state content, copy, and rules
locked as rendered.

## Data sources per module (build-chat reference)

| Module | Source | Notes |
|---|---|---|
| First-run detection (per surface) | record count for that surface == 0 | Meetings: `count(meeting WHERE executive_id=?)` · Impact: `count(gift_record WHERE executive_id=?)` · Incoming widget: `count(request WHERE status='submitted')` |
| Greeting onboarding sub-line | render while the exec has zero requests AND zero meetings ever; afterwards the standard date sub-line | First-run variant only; the date stays |
| Metric strip zeros | same queries as the locked Exec Dashboard, returning zero | Sub-line group 1 is state-aware: 0 → "requests reach your email first", else "awaiting your answer". Group 4 drops "N charities" at zero |
| Direction Card | `executive.default_charity_id` → charity fields — NOT NULL by process (set at onboarding) | The card is never empty; no empty variant exists or should be built |
| Direction Card credentials | `charity.abn` + DGR item + status from the ACNC register | Item number read at build, never typed |
| Incoming widget empty state | `count(request WHERE status='submitted') == 0` | ONE universal state for first-run AND cleared queue; footer "Review all" link hidden at zero; widget itself never hidden |
| Upcoming / Recent impact empty lines | respective counts == 0 | Section heads stay; view-all links hidden at zero |
| Controls bars (Meetings + Impact) | hidden while surface record count == 0 | Universal topbar search always renders |
| Calendar banner | `executive.calendar_connection_status` | Disconnected → locked banner; connected → quiet sync-strip (separate small pass) |
| Impact hero charity name | `executive.default_charity_id` → `charity.name` | The one dynamic word in the heroes |
| Loading skeletons | build clones the admin skeleton pattern in the exec register | Deliberately NO mockups (gap-audit decision) |

**No money number is computed in the page.** The $0 figures are genuine zero
sums from `lib/reporting.ts`; nothing is hardcoded.

## NEW data fields required from this lock

**None.** All modules read existing locked sources with zero-value rendering.

## Open decisions parked (do NOT silently resolve)

- ~~**Connected-calendar quiet strip** (last-sync timestamp) — still the
  separate small pass carried from the Meetings List lock.~~ **RESOLVED
  2026-06-12 on Exec Small States Batch** (VP1) — see
  `../exec-small-states-batch/README.md`.
- **Metric strip "N charities" fragment** — dropped at zero, returns with the
  first gift; exact threshold copy at one charity ("1 charity") is build
  wording.
- **When the greeting onboarding sub-line retires** — recommended condition
  above (zero requests AND zero meetings ever); confirm at build if a
  time-based cutoff is preferred.

## Resolutions this lock makes (recorded)

- **Exec Dashboard parked question "Compact Incoming widget · empty state
  (0 pending)" → RESOLVED**: render the universal empty state above. Never
  hide the widget; never shrink it to a pill. The dashboard README is
  annotated accordingly.
- **Controls-hide rule** recorded as a Global decision in the design log.

## Anti-list (do not regress)

- **NO emoji anywhere in this file.** The sanctioned 🎉 lives on
  `/exec/requests` VP2 only. First-run heroes are glyph + type.
- **NO buttons/CTAs in the first-run heroes.** The portal asks nothing of a
  new exec.
- **Never merge first-run with cleared-queue.** Different states, different
  copy, different surfaces.
- **The Direction Card never renders empty.** Charity is set at onboarding by
  process; do not design or build a "no charity yet" variant.
- **The Incoming widget is never hidden at zero** — universal empty state, no
  conditional copy.
- **Controls bars hide at zero records; topbar search never hides.**
- **Andrew Liang is demo-only.** Never reuse him in canonical samples; Priya
  stays canonical.
- **Empty and loaded states share identical chrome** — the three documented
  deviations are render artifacts, not variants; build follows the original
  locks.
- Editorial register holds: no pills, no chips, no mono uppercase, plain
  italic status copy, single emerald accent, hairlines not shadows.
- No em or en dashes ("·" separator). Forbidden vocab (brand-wide):
  marketplace, magic, wizard, coaching, program, MeetMagic, AlphaSights.

## Issy's fix passes (the design narrative)

Locked in a single pass — the parity work happened pre-prompt (exact locked
strip labels, banner anatomy, and widget anatomy were lifted from the Meetings,
Impact, and Dashboard READMEs before the prompt was issued). Three cosmetic
render deviations on re-rendered chrome were documented for build rather than
re-rendered, per the EA-banner precedent. The demo-exec approach (Andrew
Liang) was chosen pre-prompt so first-run states never contradict Priya's
locked history.

## NOT designed in this pass (deferred)

- Connected-calendar quiet strip (separate small pass).
- `/exec/requests` first-run state — the locked VP2 🎉 hero covers zero
  pending; a "never had a request" copy variant was judged unnecessary.
- My charity / Profile first-run variants — both are populated at onboarding
  by definition (nomination + admin-built profile); no empty variants exist.
- Loading / skeleton states (build clones admin pattern — deliberate).
- Error states.
- Mobile renders (portal-wide mobile pass, gap #4).
- EA-mode renders of these states (per-page hide map applies; no mockups).
