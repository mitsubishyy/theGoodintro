# Admin Meeting detail · Vendor side rail-module — LOCKED 2026-06-07 (pending the wordmark call)

Claude Design file: "Admin Meeting Detail" (same file as the locked
parent Meeting detail). Centre-body content for the **Vendor side** rail
item on the locked Admin Meeting detail T4 page. The page shell,
sticky header stack (back button row + breadcrumb + H1 + structured
chips + action cluster), left module rail, right Activity feed are ALL
ALREADY LOCKED — this just specifies the centre column when the
Vendor side rail item is the active selection.

## Sections (four, stacked, 24px gap, all on --portal-card warm cream)

1. **VENDOR IDENTITY** (header card, 24px padding, hairline border) —
   "Acme's side of M-204, plus the people we talk to here."
   - 56px Acme Robotics logo placeholder ("AR" soft-amber chip) + Inter
     18px semibold "Acme Robotics" + Inter 13px muted "VEN-1044 · Joined
     12 Mar 2026" sub-line.
   - Right: Inter title case status pill "Active" (gold dot).
   - Below identity row: 4 structured chips mono uppercase 11px:
     BAND 2 / 2 CREDITS / RENEWS 12 MAR 2027 / LAST MEETING HELD.
   - 11px muted helper: "Band is frozen at the moment a meeting is
     marked Held. See Vendor profile for current cycle status."

2. **WHY THIS MEETING** — "From the vendor's request."
   - Q1 row: mono "Q1 · WHO DO YOU WANT TO MEET?" eyebrow + Inter 13px
     body about Priya Raghavan, CFO at Lumen Industries.
   - Q2 row: mono "Q2 · WHY THIS PERSON SPECIFICALLY?" eyebrow + Inter
     13px body about Lumen's finance ops review and Q3 AP automation RFP.
   - 11px muted helper: "Submitted 22 Apr 2026. Not visible to Priya."

3. **CONTACTS** — "People at Acme we talk to."
   - 2 contact rows (56px each, hairline between):
     - 40px "SP" avatar + "Sam Patel" + "Head of RevOps ·
       sam@acmerobotics.com" + mono uppercase pill "PRIMARY" (soft-amber).
     - 40px "RL" avatar + "Rosa Lin" + "Marketing Ops ·
       rosa@acmerobotics.com" + mono uppercase pill "SECONDARY"
       (muted grey).

4. **VENDOR-SIDE NOTES** — "Admin-only context about this vendor relating
   to this meeting."
   - 1 sample note as a sage-tinted band (matches locked Inbox internal
     note + locked Notes rail-module note treatment):
     - `--portal-sage-soft` background, sage-ink left bar, 16px padding.
     - Mono sage-ink "INTERNAL NOTE" eyebrow + IH avatar + "Issy
       Hardwick · 5 days ago".
     - Body: "Acme has been excellent with prep. Sam shipped a one-pager
       and discussion-question list ahead of time — copied into the
       brief I'll send Priya."
   - Bottom ghost "+ Add note" button (links to Notes module).

## Section header row (above the centre body)

- Mono uppercase "VENDOR SIDE" eyebrow + Inter 13px muted "Acme's side
  of M-204, plus the people we talk to here." caption.
- Right cluster: ghost "Open full profile →" link.

## Single viewport

- **VP1 LOADED · VENDOR SIDE ACTIVE** — left rail VENDOR SIDE
  highlighted with locked active-rail treatment (amber-tinted bg + amber
  left bar + ink text). Four sections rendered as above. Right Activity
  feed unchanged from the locked parent screen.
- STATE annotation row at the BOTTOM: mono "STATE · VENDOR SIDE" +
  "VIEWING NOW" pill right.

## Anti-list (do not regress)

- No duplicate STATE row at top of viewport.
- No "All systems operational" pill in topbar.
- No white surfaces — warm cream throughout (white is Inbox-specific).
- Sage tint ONLY on the Section 4 internal note. Other cards stay warm
  cream.
- Role pills (PRIMARY / SECONDARY) use mono uppercase. Status pills
  (Active) use Inter title case + dot.
- Money figures: NONE on this module. Vendor side is identity +
  context only.
- No em or en dashes; no emojis.

## NOT designed in this pass (deferred)

- Loading / Empty states.
- Add note inline editor (the "+ Add note" button is rendered but the
  composer is the Notes module's responsibility).
- Edit / Delete on the sample note.
- Hover state on contact rows.

## Open decisions

- Whether the Vendor side notes section deserves its own rail item once
  it grows past 2-3 notes. Currently inline.
- Wordmark parked.

## Issy's fix passes (2026-06-07)

- **Pass 1:** sidebar bottom user card drifted to "Issy Mbeki ·
  Operations · Owner" with IS avatar. Reverted to "Isobel Hardwick ·
  Founder · Owner" with IH avatar to match locked sample data across
  every other admin screen.
