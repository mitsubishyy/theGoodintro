# Vendor Dashboard — LOCKED 2026-06-05 (pending the wordmark call)

Designed in Claude Design 2026-06-05. **First locked vendor-portal screen.**
Locks the vendor portal shell (sidebar colour, IA, identity card, topbar) that every
subsequent vendor screen inherits. Owner view, Active state.

Sidebar colour for the vendor portal is locked: **deep teal-pine
`oklch(0.32 0.045 195)`** (the blueprint's leading candidate, now no longer TBD).
Admin = emerald (locked); exec = TBD (candidate clay/bronze).

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Vendor Dashboard" → File > Export HTML |
| `screenshot-loaded.png` | TO DROP | VP1 — Loaded with sample data (Owner, Active) |
| `screenshot-loaded-vp2.png` | TO DROP | VP2 — Scrolled to exec card grid + sidebar identity card |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md) — brand spelling (TheGoodIntro) and pricing facts.
2. [`../../../CALCULATIONS.md`](../../../CALCULATIONS.md) — every $ figure on this screen reads from `@thegoodintro/pricing` + `lib/reporting.ts`.
3. [`../../../STATE_MACHINES.md`](../../../STATE_MACHINES.md) — vendor lifecycle states (signed_up → call_booked → approved → paid → active).
4. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) §"Vendor Dashboard" + Global decisions (per-portal sidebar, vendor identity card, photo-led exec card grid, Band/Tier vocabulary).
5. [`../../../VENDOR_PORTAL_BRIEF.md`](../../../VENDOR_PORTAL_BRIEF.md) — full workflow brief.
6. [`../../../PORTAL_LAYOUT_BLUEPRINT.md`](../../../PORTAL_LAYOUT_BLUEPRINT.md) — token-level layout primitives.
7. Open `screen.html` + screenshots.

## What is locked

### Vendor portal shell (inherited by every vendor screen)

**Sidebar** — 240px wide, `--vendor-sidebar` (deep teal-pine `oklch(0.32 0.045 195)`) bg, `--vendor-sidebar-ink` (cream-tinted `oklch(0.96 0.02 195)`) text. Three IA groups (mono uppercase 10px tracking-[0.18em], 60% opacity):

- **REQUEST** — Dashboard (active) · Executives · Requests ▾ (Pending [4] / Accepted / Declined) · Meetings ▾ (Upcoming [2] / Past)
- **GOOD** — Giving
- **ACCOUNT** (Owner-only group; hidden for Member role) — Get started [2] · Team · Billing & credits · Settings

Bottom of sidebar, in order:
- **Vendor identity card** (new pattern, see Global decisions in design log): 28px rounded-md amber-soft tile with vendor logo or initials (AR fallback) + "Acme Robotics" Inter 13px semibold + "Band 2 · Renews 12 Mar 2027" Inter 11px @65% opacity. Hairline dividers above and below.
- **User chip** — 32px circular avatar (SP in amber-soft) + "Sam Patel" Inter 13px + "Acme Robotics · Owner · sign out" muted action.

**Topbar** — 56px, `--portal-page` bg, 1px bottom hairline. Left: page H1 "Dashboard" + mono eyebrow "ACME ROBOTICS · BAND 2". Right: search · bell with amber dot · SP avatar. No "all systems operational" pill.

**Page background** — `--portal-page` (warm cream).

### Five module rows (top to bottom)

1. **Metrics ribbon** — full-width, `--portal-ribbon` (dark ink), four groups separated by white@10% hairlines, Fraunces 28px numbers, Inter 11px units. Groups:
   - **CREDITS** — `2 available` · `0 reserved`
   - **MEETINGS** — `1 pending` · `1 held this month`
   - **TO CHARITY VIA YOU** — `$4,700` · `this FY`
   - **YOUR BAND** — `Band 2` · `$1,000 / mtg`

2. **Get-started shortcut** — conditional card (renders only if checklist has open items): amber-soft icon tile + "Finish your onboarding" + "2 of 6 items remaining · Sign code of conduct, Upload company one-pager" + right-side "Open checklist →" link.

3. **8/4 grid — left column** (col-span-8), two stacked widgets:
   - **Upcoming meetings** widget — header + amber count chip "2" + "View all →" right link. 56px dual-line rows: 32px exec avatar | "Name, Title · Company" / "Charity: …" | right "DD Mon · HH:MM AEST · 30 min" + "Join Zoom/Teams →" amber link.
   - **Executives for you** widget — header + "Browse all →" right link. **2×2 photo-led card grid** (new vendor portal pattern, see design log). Each card: 56px circular photo (left) + Name / Title / COMPANY (mono) stack (right) + amber-soft charity pill with heart icon + full-width Request button (or amber-soft Requested chip with dot).

4. **8/4 grid — right column** (col-span-4), three stacked widgets:
   - **Your credits** — Fraunces 40px credit count + mono "credits available" + hairline + "BAND 2 · $1,000 TO CHARITY / MEETING" mono + amber progress bar (`--portal-amber-soft` track, `--portal-amber` fill) + "N more held meetings to reach Band 3" muted + "Buy more credits →" amber link.
   - **Pending** — header + amber count chip + 44px rows: "Name, Title Company" + "Waiting on exec / Accepted · securing time" muted + right "Nd" mono age.
   - **Your impact** — header + "View giving →" + sub-eyebrow "$X to Good this FY · N charities · N meetings held" + 44px gift rows: heart-icon amber-soft + Charity name / "after Name, Title" + right "$Amount" semibold.

5. **STATE annotation row** (bottom of viewport) — "STATE · DASHBOARD · OWNER · ACTIVE" mono uppercase + right-aligned "VIEWING NOW" pill in amber-soft.

## Data sources per module (build-chat reference)

| Module | Source | Notes |
|---|---|---|
| Topbar eyebrow `ACME ROBOTICS · BAND 2` | `vendor.name` + `bandForMeetingNumber(vendor.cycle.held_meetings_count + 1).band` via `@thegoodintro/pricing` | Band recomputed on view |
| Sidebar Requests count | `count(request WHERE vendor_id=? AND status='submitted')` | |
| Sidebar Meetings count | `count(meeting WHERE vendor_id=? AND status IN ('proposed','confirmed') AND scheduled_at >= now)` | |
| Sidebar Get-started count | `count(checklist_item WHERE assignment.vendor_id=? AND completed_at IS NULL)` | |
| Sidebar identity card | `vendor.name` · `vendor.logo_url` (fallback initials from `vendor.name`) · `bandForMeetingNumber(...).band` · `vendor.access_window_ends_at` | Logo upload control lives in Settings → Company profile (out of scope here) |
| Ribbon · Credits available | `sum(credit_lot.quantity_remaining) - count(meeting WHERE status IN ('proposed','confirmed') AND credit_lot_id IS NOT NULL)` | |
| Ribbon · Credits reserved | `count(meeting WHERE vendor_id=? AND status IN ('proposed','confirmed') AND credit_lot_id IS NOT NULL)` | |
| Ribbon · Meetings pending | `count(meeting WHERE vendor_id=? AND status IN ('proposed','confirmed'))` | |
| Ribbon · Meetings held this month | `count(meeting WHERE vendor_id=? AND status='held' AND held_at >= start_of_month(now))` | "this month" string is locked; if calendar-month vs cycle-month matters, surface to Issy |
| Ribbon · To charity via you | `vendorCharityForPeriod(vendor.id, financialYearWindow(now))` in `lib/reporting.ts` | Reads frozen `gift_record.charity_amount_cents`, never recomputed |
| Ribbon · Your band + rate | `bandForMeetingNumber(vendor.cycle.held_meetings_count + 1)` | Rate from pricing, formatted via `formatAud` |
| Get-started shortcut | `checklist_assignment WHERE vendor_id=? AND status='in_progress'` → first open assignment | Hidden when no incomplete items |
| Upcoming meetings rows | `meeting WHERE vendor_id=? AND status IN ('proposed','confirmed') AND scheduled_at >= now ORDER BY scheduled_at LIMIT 2` joined to `request.executive` for name/title/company, and `executive.default_charity` for charity name | Join link from `meeting.conference_url`; provider (Zoom/Teams) from `meeting.conference_provider` |
| Executives for you cards | `executive WHERE status='active' ORDER BY (a relevance/recency signal TBD) LIMIT 4` joined to `executive.default_charity` and to `request WHERE vendor_id=? AND executive_id IN (...) AND status IN ('submitted','accepted')` for Requested state | Photos read from `executive.photo_url`; ordering signal is open decision (see below) |
| Your credits widget | `bandForMeetingNumber(...).band` + `bandForMeetingNumber(...).rateCents` + progress = `(cycle.held_meetings_count + 1 - band.lo) / (band.hi - band.lo + 1)` | All formulas in `@thegoodintro/pricing`; do not re-derive in the page |
| Pending widget rows | `request WHERE vendor_id=? AND status IN ('submitted','accepted') ORDER BY created_at DESC LIMIT 4` joined to `executive` | Age computed via `ageShort(request.created_at)` |
| Your impact widget rows | `gift_record WHERE vendor_id=? ORDER BY sat_date DESC LIMIT 3` joined to `charity` and `meeting.request.executive` | Amount = `gift_record.charity_amount_cents` (frozen at Held), never recomputed |
| Your impact sub-eyebrow | `vendorCharityForPeriod(..., financialYearWindow(now))` + `count(distinct charity_id from gift_record WHERE vendor_id=?)` + `count(meeting WHERE vendor_id=? AND status='held')` | |

**No money number is ever computed in the page or in Claude Design.** Every $ figure
reads from `@thegoodintro/pricing` or `lib/reporting.ts`. Sample data in the mockup
($4,700, $1,000, $900) is illustrative; the build hydrates the real values from
frozen `gift_record.charity_amount_cents`.

## Sample data (LOCKED — every vendor screen must align)

- Vendor: **Acme Robotics** · Band 2 · 2 credits available · 0 reserved · cycle anchor 12 Mar 2026, renews 12 Mar 2027
- Signed-in user: **Sam Patel** · Head of RevOps · Owner · initials SP
- This FY: 8 meetings held · $4,700 to charity · 8 charities supported
- Sample execs: Priya Raghavan (CFO Lumen Industries) · Daniel Akers (COO BigFour Bank) · Helena Cho (CMO Brightline, REQUESTED) · Marcus Vance (MD Helix Capital) · Sarah Liu (CTO Vector)
- Sample charities: Royal Flying Doctor Service · Beyond Blue · OzHarvest · Smith Family

## Open decisions parked (do NOT silently resolve)

- **Wordmark** "TheGoodIntro" one word vs spaced — parked, applies to every screen.
- **"Executives for you" ordering signal** — relevance vs recency vs admin-curated. Currently rendered as alphabetical / arbitrary; needs a signal definition before build.
- **Member-view variant** + **5 vetting-gate states** (signed_up · call_booked · approved · paid-loading · dormant) — designed in this Pass A as Owner / Active only. Pass B covers the rest.
- **"Held this month" timeframe** — calendar month vs current cycle month vs rolling 30d. Defaulted to calendar month; revisit if Issy uses cycle months elsewhere.
- **Upcoming-meeting row highlight** — current export tints one row amber-soft on hover; whether to make this a deliberate "next up" highlight or strip to plain hover is parked.

## Anti-list (do not regress)

- Sidebar is **deep teal-pine**, never emerald. Emerald is admin-only.
- Topbar has **no "all systems operational" pill**.
- "Tier" is **forbidden** in vendor-facing copy; use "Band" (see [`feedback memory`](../../../../.claude/projects/-Users-isobelhardwick/memory/feedback_thegoodintro_band_not_tier.md)).
- Money numbers are **never hardcoded**; every $ reads from `@thegoodintro/pricing`.
- Exec photos in the mockup are **placeholders**; production reads `executive.photo_url`. Empty state = initials in amber-soft circle.
- No em or en dashes in prose; use "·" as the separator.
- No emojis. Outline icons (1.6px stroke) only.
- Vendor logo lives in the **sidebar identity card**, NOT replacing the TheGoodIntro wordmark at the sidebar top.

## Issy's fix passes (2026-06-05)

- Pass A.1: deleted "Needs your note" widget (no real use case); redesigned "Executives for you" from table-in-a-box to photo-led 2×2 card grid; added vendor identity card to sidebar bottom above the user chip.
- Pass A.2: swapped "Tier 2" → "Band 2" in topbar eyebrow and sidebar identity card (chose Band as the vendor-facing word).
