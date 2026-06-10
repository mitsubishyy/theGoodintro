# Admin Meeting detail · Exec side rail-module — LOCKED 2026-06-07 (pending the wordmark call)

Claude Design file: "Admin Meeting Detail". Centre-body content for the
**Exec side** rail item on the locked Admin Meeting detail T4 page.
Symmetric counterpart to the Vendor side rail-module. Shell, sticky
header stack, left rail, right Activity feed all LOCKED — this just
specifies the centre column when Exec side is the active selection.

## Sections (four, stacked, 24px gap, all on --portal-card warm cream)

1. **EXEC IDENTITY** (header card, 24px padding, hairline border) —
   "Priya's side of M-204, plus how this meeting matched her context."
   - 56px round avatar "PR" on soft-amber + Inter 18px semibold "Priya
     Raghavan" + Inter 13px muted "Chief Financial Officer · Lumen
     Industries · Sydney AU" sub-line.
   - Right: Inter title case status pill "Active" (gold dot).
   - Below identity row: 4 structured chips mono uppercase 11px:
     ID EXC-1042 / 12 MEETINGS HELD / RESPONSE 78% / EA ON FILE.
   - 11px muted helper: "Response rate is illustrative until the
     calculation is locked. See Exec profile for the live metric."

2. **WHY THIS MEETING** — "How this matched Priya's business context."
   - Matched-areas chip row: 3 small mono uppercase chips with soft-amber
     bg and hairline border: "AP AUTOMATION" / "FINANCE OPS REVIEW" /
     "PEER CFO BENCHMARK".
   - Inter 13px body about Priya flagging AP automation and finance ops
     review as top-of-mind in her 16 Apr 2026 profile update; Acme's
     answers matched all three areas, strongest match that week.
   - 11px muted: "Matching is admin-only. Priya never saw Sam's request
     answers; she saw a clean meeting invite."

3. **EA & CALENDAR** — "Who handled the booking and on which calendar."
   - 2 rows (56px each, hairline between):
     - 40px "LP" avatar + "Lena Park" + "Executive Assistant ·
       lena@lumenindustries.com" + mono pill "EA" (soft-amber).
     - 40px calendar outline icon + "Google Calendar" + "Connected ·
       last synced 1 day ago" + mono pill "SYNCED" (gold dot, no bg).
   - 11px muted: "Lena accepted on Priya's behalf at 09:18 AEST,
     22 Apr 2026."

4. **CHARITY** — "Priya's choice, frozen for this meeting."
   - Single row: 40px charity logo placeholder ("RF" soft-amber circle)
     + Inter 14px semibold "Royal Flying Doctor Service" + Inter 13px
     muted "ABN 74 438 059 643" + soft-amber **$1,000 chip** on the
     right with provenance micro-label below "TIER 2 BAND · FROZEN AT
     HELD".
   - 11px muted helper: "Per CHARITY_FLOW.md Model 2: TheGoodIntro
     receives the full $1,500 and donates this amount from its own
     funds. Lumen does not receive a gift receipt."

(No Section 5 NOTES on Exec side in this pass — exec-side notes deferred
for symmetry. The pattern from Vendor side Section 4 carries forward
when it's added.)

## Section header row

- Mono uppercase "EXEC SIDE" eyebrow + Inter 13px muted "Priya's side of
  M-204, plus how this meeting matched her context." caption.
- Right cluster: ghost "Open full profile →" link.

## Single viewport

- **VP1 LOADED · EXEC SIDE ACTIVE** — left rail EXEC SIDE highlighted
  with locked active-rail treatment. Four sections rendered as above.
  Right Activity feed unchanged.
- STATE annotation row at the BOTTOM: mono "STATE · EXEC SIDE" +
  "VIEWING NOW" pill right.

## Anti-list (do not regress)

- No duplicate STATE row at top of viewport.
- No "All systems operational" pill in topbar.
- Money rule (HARD): the $1,000 charity figure on Section 4 ALWAYS
  carries the soft-amber chip + "TIER 2 BAND · FROZEN AT HELD"
  provenance micro-label. Never a bare $-figure.
- Matched-areas chips are mono uppercase soft-amber with hairline
  border (NOT plain pills).
- Status pills use Inter title case + dot. Role pills use mono uppercase.
- "Open full profile →" link is ghost mono in the section header row.
- No em or en dashes; no emojis.

## NOT designed in this pass (deferred)

- Exec-side notes section (deferred for symmetry pass).
- Loading / Empty states.
- Hover state on EA & Calendar rows.
- Linking the matched-areas chips to the exec's Business context module.

## Open decisions

- Whether the matched-areas chips on Exec side are link-out (to the
  exec's Business context module) or just visual labels. Currently
  visual.
- Whether response rate (78%) renders given the calc is parked.
  Currently shown with a deferred-note. Decide before build.
- Wordmark parked.

## Issy's fix passes (2026-06-07)

- **Pass 1:** sidebar bottom user card drifted to "Issy Mbeki ·
  Operations · Owner" with IS avatar. Reverted to "Isobel Hardwick ·
  Founder · Owner" with IH avatar to match locked sample data.
