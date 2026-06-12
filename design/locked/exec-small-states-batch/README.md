# Exec Small States Batch — LOCKED 2026-06-12

Designed and locked in Claude Design 2026-06-12. **Four small follow-up states
on already-locked exec surfaces**, batched into one file. Clears the
small-gaps list from the 2026-06-11 whole-portal gap audit (everything except
the email surface and the trailing mobile pass). Partial artboards by design —
each renders only its region; the full-page anatomy authority stays with the
original locks.

Claude Design file: **"Exec Small States Batch"**. Includes a BUILD NOTES ·
OPEN ITEMS annotations board that is part of the export.

## Viewports

| VP | Surface | State |
|---|---|---|
| 1 | `/exec/meetings` top region | CONNECTED-calendar quiet strip (replaces the locked disconnected banner once a calendar is linked) |
| 2 | `/exec/profile` · Calendar & access card | Calendar DISCONNECTED + EA EMPTY (both never-set-up states on one honest render — the demo new exec genuinely has neither) |
| 3 | `/exec/profile` (drawer) | "Add executive assistant" — the EMPTY sibling of the locked Edit-assistant drawer |
| 4 | `/exec/profile` · You card | EDIT mode with the NEW photo-change affordance (camera chip + "Change photo") |

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Exec Small States Batch" → File > Export HTML |
| `screenshot-vp1-calendar-connected-strip.png` | TO DROP | Meetings header + mini-strip + connected strip + controls hint |
| `screenshot-vp2-profile-disconnected-no-ea.png` | TO DROP | Calendar & access card, both empty states |
| `screenshot-vp3-add-ea-drawer.png` | TO DROP | Add executive assistant drawer, empty variant |
| `screenshot-vp4-you-editing-photo.png` | TO DROP | You card in edit mode with camera chip |
| `screenshot-annotations-board.png` | TO DROP | BUILD NOTES · OPEN ITEMS board |

## Cold-chat read order

1. [`../exec-meetings-list/README.md`](../exec-meetings-list/README.md) — canonical Meetings chrome; its parked "connected calendar banner" item is RESOLVED by this lock (annotated there).
2. [`../exec-profile/README.md`](../exec-profile/README.md) — canonical Profile anatomy + the locked Edit-assistant drawer that VP3 siblings; its parked photo-affordance / calendar-disconnected / EA-empty items are RESOLVED by this lock (annotated there).
3. [`../exec-first-run-empty-states/README.md`](../exec-first-run-empty-states/README.md) — the demo exec Andrew Liang originates there; this lock extends his record.
4. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) — Global decisions.
5. Open `screen.html` + screenshots.

## What is locked

### VP1 — Connected-calendar quiet strip (Meetings)

Replaces the locked disconnected banner when `calendar_connection_status =
'connected'`. Same slot in the page order (header mini-strip → strip →
controls bar).

- Single quiet row: tint `oklch(0.985 0.010 84)` (between page and card), 1px
  `--portal-line`, 12px radius, 14px y / 24px x padding, justify-between.
- LEFT: 18px calendar outline glyph + Inter 13px medium ink "Google Calendar
  connected" + italic Inter 12.5px muted "Last synced 4 minutes ago · free and
  busy only, never event details".
- RIGHT: italic Inter 13px ink ghost link "Manage in Profile →" →
  `/exec/profile` (section-anchor deep link is a build decision).
- Provider name reads from the connection ("Google Calendar" / "Outlook").
- Sample: Priya (her locked record is connected · last synced 4 minutes ago,
  matching the Profile sample).

### VP2 — Profile Calendar & access: disconnected + no EA

The locked Profile section card with both never-set-up states:

- **Calendar subsection**: italic "No calendar connected." + primary emerald
  "Connect Google Calendar" + ghost "Connect Outlook" + italic helper "We read
  free and busy times only, never the detail of your events." The buttons go
  STRAIGHT to the provider sign-in — **there is no in-portal connect drawer**
  (decision baked in). Timezone and Preferred meeting window rows still render
  (admin-captured, independent of connection).
- **Executive assistant subsection**: italic "No executive assistant on file."
  + ghost button "Add an assistant" (opens VP3) + italic helper "An assistant
  can see your incoming requests and act on meetings on your behalf. They
  cannot change your charity or your business context."

### VP3 — "Add executive assistant" drawer (empty sibling of the locked Edit drawer)

Same anatomy as the locked Profile EA drawer (540px right slide-over, 3px
emerald top accent — edit/action variant, equal-priority footer pair), with
the add-variant deltas:

- Title "Add executive assistant" (eyebrow "Calendar & access" unchanged).
- NO currently-on-file block, NO remove link.
- "Their details": Name + Email warm-cream inputs, EMPTY, placeholders "Their
  name" / "name@company.com". Helper: "Saving sends them a confirmation email
  with a one-click access link."
- "What your assistant can do" — three hairline-ink numbered steps: see
  requests + calendar / accept, decline, or forward on your behalf / request
  reschedules.
- Footer: Ghost "Cancel" + primary emerald **"Send access link"** (the
  add-variant label; the edit-variant keeps "Save changes").

### VP4 — Photo-change affordance (You card, edit mode only)

The locked inline-edit pattern ("● Editing" emerald label, warm-cream form
controls, Cancel + Save changes footer) plus the NEW affordance:

- 28px white circle chip overlapping the 96px avatar's bottom-right, 1px
  hairline, 14px camera outline glyph.
- "Change photo" ghost link centered under the avatar (italic per spec — see
  verify-at-port).
- Click → device file picker. Crop/size rules are build decisions.
- **Edit-mode only.** The read state stays untouched — no chip, no link.
- LinkedIn field demonstrates the empty-input state with muted placeholder
  "linkedin.com/in/yourprofile".

## Sample data

- **VP1**: Priya Raghavan (locked canonical sample — calendar connected).
- **VP2–VP4**: Andrew Liang · Managing Director · Ferncrest Capital ·
  andrew@ferncrestcapital.com · "AL" initials · **Executive ID EXC-2201 ·
  Joined TheGoodIntro 8 June 2026** (extends the demo record from the
  First-Run lock). Demo-only; a new exec genuinely has no calendar, assistant,
  or photo — that is why he samples the empty states. Priya stays canonical.

## Data sources per module (build-chat reference)

| Module | Source | Notes |
|---|---|---|
| Strip vs banner (Meetings) | `executive.calendar_connection_status` | 'disconnected' → locked banner; 'connected' → this strip |
| Strip provider + sync line | calendar connection entity: provider + `last_synced_at` relative-formatted | "free and busy only" clause is static copy |
| Strip "Manage in Profile →" | `/exec/profile` | Section-anchor deep link = build decision |
| Profile calendar empty | same status field == 'disconnected' | Connect buttons → provider OAuth directly; NO in-portal drawer |
| Timezone / preferred window | admin-captured fields (per Profile lock) | Render regardless of connection state |
| EA empty state | `executive.ea_id IS NULL` (no EAAssignment) | "Add an assistant" opens the VP3 drawer |
| Add-EA drawer save ("Send access link") | creates EA record + EAAssignment + sends the one-click access-link email | Audit-logged; same machinery as the locked edit-variant save |
| Photo affordance | edit-mode render guard; file picker → upload → `executive.photo_url` | Crop/size/min-resolution build-side; read state unchanged |
| LinkedIn empty input | `executive.linkedin_url` NULL → placeholder | Field from the Profile lock |

**No money on any viewport.** NEW data fields: **none.**

## Documented render artifacts (build follows the original locks)

1. **VP1 controls-bar hint** renders the Calendar | List toggle without the
   active emerald segment. Canonical: Meetings List lock (List active, emerald
   fill).
2. **VP2 Timezone / Preferred-window rows** rendered label-left · value-right.
   Canonical Profile field rows are label-above-value; build follows the
   Profile lock.
3. **VP3 backdrop** is flat grey (partial-artboard artifact). Build renders
   the drawer over the real Profile page with the locked 20% ink + 2px blur
   backdrop.

## Verify-at-port items

1. "Change photo" link is italic per spec (render reads upright).
2. VP3 drawer top accent bar is the full 3px emerald spanning the drawer
   width.

## Open decisions parked (do NOT silently resolve)

- "Send access link" footer label on the add-variant is the recommended copy;
  the edit-variant keeps "Save changes". Flag if Issy wants them unified.
- VP1 "Manage in Profile →" deep-link anchor format — build decision.
- Vendor-side photo upload (vendor Settings → Profile Pass B) remains separate
  and untouched — the vendor portal design pause stands.

## Resolutions this lock makes (recorded on the source READMEs)

- Meetings List parked "connected calendar banner" → RESOLVED (VP1).
- Profile parked "photo change affordance" → RESOLVED, exec side (VP4).
- Profile parked "calendar DISCONNECTED read state" → RESOLVED (VP2; no
  connect drawer exists).
- Profile parked "EA EMPTY state" → RESOLVED (VP2 + VP3).
- First-Run Empty States parked "connected-calendar quiet strip" → RESOLVED
  (VP1).

## Anti-list (do not regress)

- The photo affordance exists ONLY in edit mode. Never on the read state.
- NO in-portal calendar-connect drawer. Buttons go straight to provider
  sign-in.
- The add-EA drawer never shows a currently-on-file block.
- Numbered step circles: hairline + ink. Never amber on exec.
- Andrew Liang stays demo-only; Priya canonical.
- Editorial register holds: italic statuses, no pills/chips/mono uppercase,
  single emerald accent, hairlines (drawer keeps the standard floating
  shadow), no emoji, no em or en dashes ("·"; ranges use "to", e.g. "09:00 to
  17:00").
- Forbidden vocab (brand-wide): marketplace, magic, wizard, coaching, program,
  MeetMagic, AlphaSights.

## Issy's fix passes (the design narrative)

Locked in a single pass. The batch reused the Andrew Liang demo exec so the
empty states never contradict Priya's locked record (she has calendar, EA,
and photo). Three cosmetic render artifacts documented above; all copy landed
verbatim, including the privacy clause ("free and busy only, never event
details") in both VP1 and VP2.

## NOT designed in this pass (deferred)

- Calendar disconnect/revoke flow (connected → disconnected) — admin/build
  concern for v1.
- Photo crop/preview UI after the file picker (build decision; native picker
  only).
- Add-EA confirm/remove dialogs (carried from the Profile lock).
- Mobile renders (portal-wide mobile pass).
- EA-mode variants (per-page hide map applies).
