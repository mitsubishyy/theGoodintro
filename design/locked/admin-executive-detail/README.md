# Admin Executive Detail — LOCKED

Designed in Claude Design 2026-06-01. Symmetric counterpart to the locked
Admin Vendor detail. T4 template.

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Admin Executive Detail" → File > Export HTML, drop here |
| `screenshot-loaded.png` | TO DROP | Drag from clipboard to this folder, rename |
| `screenshot-loading.png` | TO DROP | Same |
| `screenshot-empty.png` | TO DROP | Same |

## Cold-chat read order

If you are a fresh Claude session porting this screen to code:

1. Read [`../../../FACTS.md`](../../../FACTS.md), [`../../../CALCULATIONS.md`](../../../CALCULATIONS.md),
   [`../../../DATA_MODEL.md`](../../../DATA_MODEL.md), [`../../../STATE_MACHINES.md`](../../../STATE_MACHINES.md).
2. Read [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) §"Admin Executive
   detail (T4)" — the locked spec for this screen.
3. Read [`../../../PORTAL_LAYOUT_BLUEPRINT.md`](../../../PORTAL_LAYOUT_BLUEPRINT.md) §T4
   template rules.
4. Read [`../../../ADMIN_PORTAL_BRIEF.md`](../../../ADMIN_PORTAL_BRIEF.md) §Executives
   (workflow context).
5. Open `screen.html` (or the locked Vendor detail's `screen.html` for register
   reference if the export is missing) plus the screenshots in this folder.

## What is locked

- Header band with avatar, identity line, status pill, four structured chips
  (ID / MEETINGS / RESPONSE RATE / EA), action cluster (View as EA, Send test
  email, Edit profile, overflow).
- Three-column body: 280px module rail · centre module · 320px append-only
  Activity feed.
- Module rail items: Overview (default) / Business context / Charity /
  Calendar & EA / Requests / Meetings / Consent record / Notes.
- Overview module: two-column field grid with IDENTITY, STATUS, KEY METRICS
  sections.
- Business context, Charity, Calendar & EA, Consent record modules: see
  UI_KIT_DESIGN_LOG.md entry for the locked structure.
- Activity feed: gold timeline rail, 56px rows, newest-first toggle, Load
  earlier footer.
- Three states designed: loaded, loading, empty (Onboarding state for a
  freshly-created exec).

## Open decisions (not silently resolved)

- **Wordmark.** Sidebar renders "The Good Intro" (three words); the locked
  call is "TheGoodIntro" (one word, per FACTS.md). Parked across all locked
  screens; do not pick one, ask Issy.
- **Photo upload flow** — accepts file upload only, no LinkedIn auto-pull
  (locked in the New Executive form, inherited here).
- **"View as EA" target** — opens the same screen scoped to the EA's identity
  (toolbar indicator), or a separate read-only view? Default proposed: same
  screen, identity-scoped, with a small banner "Viewing as Jane Patel (EA)".
  Confirm before build.

## Click flow into this screen

`Sidebar / Executives` → `/admin/executives` (the locked Admin Executives list,
T3) → row click → `/admin/executives/{id}` (this screen). Never deep-link
directly from the sidebar.
