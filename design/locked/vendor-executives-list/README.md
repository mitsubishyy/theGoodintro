# Vendor Executives List — LOCKED 2026-06-06 (pending the wordmark call)

Designed in Claude Design 2026-06-06. **Second locked vendor-portal screen.** The
browseable executive directory — the heart of the vendor portal. Discovery surface,
vendor T3 variant (photo-led, taller rows than admin T3).

Three viewports designed: VP1 default loaded (no filters), VP2 filters open with 2
active, VP3 filters collapsed-but-active (the "almost hidden once chosen" state).

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Vendor Executives List" → File > Export HTML |
| `screenshot-loaded.png` | TO DROP | VP1 — Loaded with 240 results, no filters |
| `screenshot-filters-open.png` | TO DROP | VP2 — Filter bar visible, 2 active, 4 results |
| `screenshot-filters-collapsed.png` | TO DROP | VP3 — Filters applied + bar collapsed, count on button |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md).
2. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) §"Vendor Executives List" + Global decisions for vendor T3 variant, single-row inline filter bar, sortable column chevron, soft-green Meeting complete status, white table card on vendor data surfaces.
3. [`../vendor-dashboard/README.md`](../vendor-dashboard/README.md) — locked vendor shell that this screen inherits.
4. [`../../../VENDOR_PORTAL_BRIEF.md`](../../../VENDOR_PORTAL_BRIEF.md) §"Executive list" — workflow brief (note: brief lists Charity as a column; the locked design drops it, keeps Country instead).
5. Open `screen.html` + 3 screenshots.

## What is locked

### Inherits from Vendor Dashboard (do not redesign)
- Sidebar (deep teal-pine `oklch(0.32 0.045 195)`), IA, count badges, identity card, Sam Patel chip.
- Topbar (H1 + ACME ROBOTICS · BAND 2 eyebrow + search/bell/SP).
- Palette tokens; no new tokens beyond the soft-green status tone (below).
- "Executives" sidebar item is the ACTIVE state on this screen.

### Header strip (above the table, 64px, on warm-cream page bg)
- **Left:** count chips inline, separated by "·"
  - "240 active executives" Inter 14.5px semibold ink
  - "12 requested by your team" Inter 13px --muted-foreground
  - "8 met by your team" Inter 13px --muted-foreground
- **Middle:** search input (380px, 36px tall, rounded-lg, --portal-card bg, --portal-line border, 16px search-glass icon left, placeholder "Search company…").
- **Right:** Filters button — varies by state:
  - No filters active: "Filters [▾]" ghost button, --portal-line border, 36px tall, rounded-lg, Inter 13px semibold ink.
  - Filters active (any state): "Filters · N [▾]" with leading 6px amber dot. Chevron direction reflects bar open/closed (▴ open, ▾ closed).

### Single-row inline filter bar (VP2 only — new vendor portal pattern)
64px tall, no card bg, sits directly on --portal-page warm cream between the header strip and the table.

Layout left to right:
- "FILTER BY" Inter mono 11px uppercase tracking-[0.18em] --muted-foreground
- 12px gap, then four inline filter pills, 8px gap between:
  - **INDUSTRY** (multi-select, demo ACTIVE = 3): "Industry · 3 [▾]" 32px tall, --portal-amber-soft bg, --portal-amber-ink text, rounded-full, 14px h-padding, 12.5px semibold + 10px chevron-down.
  - **TITLE / SENIORITY** (multi-select, demo EMPTY): "Title [▾]" ghost pill, --portal-line border, no fill, --muted-foreground text.
  - **LOCATION** (single-select, demo ACTIVE = 1): "Location · 1 [▾]" amber-filled.
  - **STATUS WITH YOUR TEAM** (multi-select, demo EMPTY): "Status [▾]" ghost.
- Flex spacer.
- Right group: "4 of 240 match" Inter 12.5px --muted-foreground + 16px gap + 1px vertical hairline + 16px gap + "Clear all" Inter 12.5px --portal-amber-ink ghost link (only present when ≥1 filter active).

Filter VALUES (e.g. "Financial Services, Banking, Investment Management" inside Industry) are NOT inlined. The pill shows category + active count only; the popover that opens off each pill (multi-select checkbox list) is not designed in this pass.

### Table card
- Bg: **`--portal-card-reading` (white)** — vendor data surfaces use the white token. Page chrome stays warm cream.
- `--portal-line` 1px border, rounded-2xl, no internal padding.

### Column set (6 columns, 0 padding on table itself)
| Column | Width | Notes |
|---|---|---|
| EXECUTIVE | flex | 48px circular photo (left, real Unsplash portraits — initials are PRODUCTION empty-state for `executive.photo_url IS NULL`, not a design choice) + 12px gap + Name (Inter 15px semibold ink) / Title (Inter 13px --muted-foreground) stacked. **Sortable** (chevron appears when active). |
| COMPANY | 180px | Inter 13px ink. **Sortable**. |
| INDUSTRY | 140px | Inter 12.5px --muted-foreground. Not sortable. |
| COUNTRY | flex | 12px map-pin outline icon --muted-foreground + 6px gap + "Australia" Inter 13px ink. Not sortable. |
| STATUS | 160px | Soft-bg pill (see status tones). Empty cell when no history. Not sortable. |
| _(chevron column)_ | 64px | Right-aligned 20px chevron-right outline. Header text blank. |

### Row design (vendor T3 variant)
- **76px row height** (taller than admin T3's 56px — vendor portal register, see feedback memory).
- 20px horizontal padding inside each row.
- 1px --portal-line top border between rows.
- Whole row is the click target (cursor: pointer).
- Hover: --portal-card-hover wash + subtle box-shadow 0 1px 3px rgba(20,40,30,0.06) lift.
- Chevron column: --muted-foreground at rest, --portal-amber-ink on row hover.

### Status pill tones (vendor variant — filled backgrounds)
| Value | Bg | Text | Dot |
|---|---|---|---|
| Request sent | --portal-amber-soft | --portal-amber-ink | --portal-amber |
| Meeting complete | soft green `oklch(0.93 0.04 155)` | dark green `oklch(0.38 0.10 155)` | matching green |
| Declined | --portal-line @50% | --muted-foreground | --muted-foreground grey |
| Empty (no history) | (no pill rendered) | — | — |

Inter 11.5px title case, 4px vertical / 10px horizontal padding, rounded-full.

The soft-green tone is new. Distinct from --primary emerald (admin sidebar only) and from --portal-sage-soft (staff-only / AI signal). Used for positive completion states on vendor surfaces.

### Sorting
- Default: rows pre-sorted by `executive.created_at DESC` ("Recently added"). No visible chevron at rest.
- Name and Company column headers are clickable to sort. When active, a 10px chevron-up or chevron-down outline icon appears immediately after the header text, --portal-amber-ink.
- Other columns not sortable.

### Pagination footer (below table card, 48px, no card)
- Left: "Showing N to M of P executives" Inter 12.5px --muted-foreground.
- Right: 32px page controls — ◀ · "1" (current, ink fill white text) · "2" · "3" · "…" · "24" · ▶.

### STATE annotation rows (one per viewport, bottom only)
- VP1: "STATE · EXECUTIVES LIST · LOADED · 240 RESULTS · VIEWING NOW"
- VP2: "STATE · EXECUTIVES LIST · FILTERS OPEN · 2 ACTIVE · 4 RESULTS · VIEWING NOW"
- VP3: "STATE · EXECUTIVES LIST · FILTERS COLLAPSED · 2 ACTIVE · 4 RESULTS · VIEWING NOW"

## Data sources per module (build-chat reference)

| Module | Source | Notes |
|---|---|---|
| Header count "N active executives" | `count(executive WHERE status='active')` (RLS scope: vendor sees all active execs once `vendor.status='active'`) | |
| Header count "N requested by your team" | `count(distinct executive_id FROM request WHERE vendor_id=?)` | |
| Header count "N met by your team" | `count(distinct executive_id FROM meeting WHERE vendor_id=? AND status='held')` | |
| Search input | ILIKE on `executive.company`, optionally also `executive.name` | Server-side, debounced |
| Filter: Industry | Multi-select on `executive.industry` enum. Active count = number of values picked. | |
| Filter: Title / Seniority | Multi-select on `executive.title` (canonicalised) OR a derived `seniority` enum (C-suite / VP / Director / Manager). Decision deferred. | Open decision |
| Filter: Location | Single-select on `executive.country` (currently AU only; baked in for future global). | |
| Filter: Status with your team | Multi-select. Per-row computed: latest `request.status` for this vendor+exec; "Meeting complete" when any `meeting WHERE vendor_id=? AND executive_id=? AND status='held'`. | Empty value (None) is its own selectable filter option |
| Default sort order | `ORDER BY executive.created_at DESC` | |
| Column sort: Name | `ORDER BY executive.name ASC/DESC` | |
| Column sort: Company | `ORDER BY executive.company ASC/DESC` | |
| Row: photo | `executive.photo_url`, fallback initials in --portal-amber-soft tile (production empty-state, NOT the design default) | |
| Row: name / title | `executive.name` / `executive.title` | |
| Row: company | `executive.company` | |
| Row: industry | `executive.industry` | |
| Row: country | `executive.country` (display name from ISO code) | |
| Row: status | Computed per the Filter: Status logic above | |
| Row click → | Opens detail pop-up modal (screen #3, not yet designed) | |
| Pagination | LIMIT 10 OFFSET (page-1)*10, with total count from header query | |

## Sample data (LOCKED — aligns with Vendor Dashboard set)

- Vendor: **Acme Robotics** · Band 2 · cycle anchor 12 Mar 2026, renews 12 Mar 2027
- Signed-in user: **Sam Patel** · Owner
- 10 sample executives, all `country = AU` (single Location value for now):
  1. Priya Raghavan · CFO · Lumen Industries · Financial Services · Request sent
  2. Daniel Akers · COO · BigFour Bank · Banking · (none)
  3. Helena Cho · CMO · Brightline · Telco · Request sent
  4. Marcus Vance · MD · Helix Capital · Investment Management · Declined
  5. Sarah Liu · CTO · Vector · Logistics SaaS · Meeting complete
  6. James Whitfield · CEO · Ironbark Energy · Energy & Resources · (none)
  7. Mei Tanaka · CHRO · Sentinel Group · Insurance · Meeting complete
  8. Rohan Mehta · CRO · Bluewater Logistics · Logistics · (none)
  9. Olivia Brennan · CPO · Northstar Pharma · Pharmaceuticals · (none)
  10. David Eze · GM Operations · Granite Holdings · Mining · (none)
- VP2 filter demo: Industry = {Financial Services, Banking, Investment Management} + Location = {Australia} → 4 matching rows (Priya, Daniel, Helena, Marcus)

## Open decisions parked (do NOT silently resolve)

- **Wordmark** — parked across all screens.
- **Filter: Title / Seniority** mechanism — raw title strings (CFO, COO, CMO…) vs canonical seniority enum (C-suite / VP / Director). Decide before build.
- **Filter pill popover** — multi-select checkbox list, not designed here. Standard popover anchored under each pill.
- **Empty state** (vendor has no execs available — e.g. vendor.status ≠ 'paid' so the directory is gated): not designed in this pass. The pre-payment "book your call" lockout state is part of Vendor Dashboard Pass B.
- **Loading and error states** — not designed.
- **Multi-row select / bulk actions** — not part of v1 vendor workflow.
- **Detail pop-up modal + Request form** — screen #3, separate pass.

## Anti-list (do not regress)

- Filter bar is **single line**, never the vertical stacked panel. ≤64px tall including padding.
- Filter pill content is **category + count only**, never the inline values list.
- Charity is **not** a column or filter on this screen — lives in the detail pop-up only.
- Table card uses `--portal-card-reading` (white), NOT `--portal-card` (warm cream).
- Photos are real headshots in the mockup. The initials fallback is a production empty-state only.
- Sage forbidden on vendor surfaces; emerald forbidden on vendor surfaces (the soft-green status tone is a separate hue).
- "Tier" forbidden in vendor-facing copy; use "Band".
- No em or en dashes. No emojis.

## Issy's fix passes (2026-06-06)

- Pass A.1: dropped charity column (vendors don't need it on the list — lives in detail pop-up), kept country, swapped table card to white (`--portal-card-reading`), added column-header sortability for Name + Company with default Recently added.
- Pass A.2: redesigned filter panel from tall 4-row stack to single-row inline filter bar (64px, category + count pills, right-aligned "N of P match · Clear all"); added 3rd viewport (filters collapsed + active) to lock the "almost hidden once chosen" state.
