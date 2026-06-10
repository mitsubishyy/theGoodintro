# Admin Meeting detail · Notes rail-module — LOCKED 2026-06-07 (pending the wordmark call)

Claude Design file: "Admin Meeting Detail". Centre-body content for the
**Notes** rail item on the locked Admin Meeting detail T4 page. Append-
only thread of admin-only notes about this specific meeting. Shell,
sticky header stack, left rail, right Activity feed all LOCKED.

## Section header row

- Mono uppercase "NOTES" eyebrow + Inter 13px muted "Admin-only notes
  about M-204. Not visible to vendor or executive." caption.
- Right cluster: mono count chip "2 NOTES" + ghost "Newest first ▾"
  sort toggle.

## New note composer (top of centre body, --portal-card warm cream, 24px padding)

- 40px IH avatar on the left.
- Mono uppercase "NEW NOTE" eyebrow + character counter "0 / 400" right
  of eyebrow.
- Inter 13px placeholder textarea: "Add a note about this meeting…"
  (3 rows tall).
- Bottom row: 11px muted helper "Notes are visible to all staff. They
  appear in the Activity feed below as 'Added a note'." left + ghost
  "Cancel" + primary ink "Save note" right (both disabled until text is
  entered).

## Notes thread (vertical list, 16px gap, NEWEST FIRST)

2 sample notes, each as a sage-tinted card (matches locked Inbox
internal note + Vendor side internal note pattern):

**NOTE 1 (newest, 1 day ago):**
- `--portal-sage-soft` background + sage-ink left bar, 20px padding,
  hairline border.
- Header row: 40px IH avatar + Inter 14px semibold "Issy Hardwick" +
  Inter 11px muted "Founder · 1 day ago" sub-line + hover-only ghost
  "Edit" + ghost destructive "Delete" right.
- Mono sage-ink eyebrow: "POST-MEETING NOTE"
- Body: "Held well. Priya was engaged and asked Sam thoughtful questions
  about rollout sequencing. Sam followed up the same day with a written
  summary already — copy is saved to the file. Action: surface to Priya
  in 30-day check-in that Sam is open to a follow-up in Q3 when the AP
  automation RFP closes."

**NOTE 2 (older, 5 days ago):**
- Same sage-tinted card anatomy.
- Header: IH avatar + Issy Hardwick + "Founder · 5 days ago".
- Mono sage-ink eyebrow: "PRE-MEETING PREP NOTE"
- Body: "Priya mentioned in last quarterly check-in that Lumen is
  reviewing AP automation vendors with an RFP closing in Q3. Surface
  that to Sam in the brief so he can lead with rollout sequencing rather
  than feature depth."

## Bottom helper row (below the thread)

- 11px muted left: "Notes are stored on this meeting only. To add a note
  that sticks to the vendor or executive's profile, go to their Notes
  module instead."

## Single viewport

- **VP1 LOADED · NOTES ACTIVE** — left rail NOTES highlighted (rail
  badge "2" matches "2 NOTES" count chip). Composer empty/disabled.
  2 sage notes rendered. Right Activity feed shows note-added events.
- STATE annotation row at the BOTTOM: mono "STATE · NOTES" + "VIEWING
  NOW" pill right.

## Anti-list (do not regress)

- Sage tint on every note card (matches locked Inbox internal note +
  Vendor side internal note).
- "Edit" / "Delete" links visible only on hover, only on the current
  user's own notes.
- Mono sage-ink eyebrow above each note body is an optional label that
  callers can set (POST-MEETING NOTE / PRE-MEETING PREP NOTE) — it's a
  free-form text field, not a fixed taxonomy.
- Composer disabled state shown by default (no text entered).
- No money figures.
- No em or en dashes; no emojis.

## NOT designed in this pass (deferred)

- Composer expanded with text + active save state.
- Edit-in-place flow.
- Delete confirmation modal.
- @-mentions of other staff.
- Loading / Empty states (empty would say "No notes yet. Add the first
  one above.").

## Open decisions

- Free-form note eyebrow vs fixed taxonomy (currently free-form).
- Whether notes can be private to author (currently all-staff-visible).
- Audit retention for notes (assume 7 years matching sign-in events).
- Wordmark parked.

## Issy's fix passes (2026-06-07)

- **Pass 1:** sidebar bottom user card drifted to "Issy Mbeki ·
  Operations · Owner" with IS avatar. Reverted to "Isobel Hardwick ·
  Founder · Owner" with IH avatar to match locked sample data.
