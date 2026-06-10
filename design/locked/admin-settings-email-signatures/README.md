# Admin Settings · Email signatures tab — LOCKED 2026-06-06 (pending the wordmark call)

Claude Design file: "Admin Settings Email Signatures". Read-only Gmail-sourced
signature surface inside the locked Admin Settings shell. Fourth tab in the
strip (Account · Security · Integrations (default) · **Email signatures** ·
AI · Notifications · Feature flags · Staff [soon]).

**Email signatures are MANAGED IN GMAIL, not edited in the platform.** The
platform pulls the signature, renders a live preview, and uses it whenever an
outbound email is sent. There is no platform-side editor, no variable
resolver, no per-template overrides, and (per Issy's MVP call 2026-06-06) NO
brand-rule validation. To change the signature, Issy edits it in Gmail.

Inherits the Gmail mirror pattern from the locked Security tab's Sign-in
method block. No new portal-wide patterns introduced.

## Sections (two, stacked)

1. **SIGNATURE SOURCE** (720px content column) — "Where your email signature
   lives." Read-only muted block (NOT sage; sage is reserved for staff-only
   /AI/system-rules content). Inside:
   - 40px Gmail icon on the left
   - Inter 14px semibold "Gmail" on right
   - Inter 13px muted sub-line `issy@thegoodintro.com`
   - Small mono soft-amber pill far right: "MANAGED BY GMAIL"
   Below the block, a sync-status row (40px, hairline above):
   - Left: mono "LAST SYNCED" eyebrow + Inter 13px "3 minutes ago · 5 Jun
     2026, 12:42 AEST"
   - Right: ghost "Sync now ↻" button
   Helper, Inter 13px muted: "Your signature is pulled from your Gmail account.
   To change it, edit your signature in Gmail and click Sync now (or wait for
   the next hourly auto-sync). The platform also re-syncs on every outbound
   send."
   Ghost link with external-link icon at the bottom: "Open signature settings
   in Gmail →"

2. **CURRENT SIGNATURE** (960px content column, two-pane layout) — "How your
   signature renders in outbound emails."

   LEFT PANE — METADATA (on `--portal-card` warm cream):
   - Mono uppercase eyebrow "SIGNATURE METADATA"
   - 4 read-only rows (hairline between, ~44px each):
     - PULLED FROM · `issy@thegoodintro.com`
     - SIZE · 412 bytes
     - FORMAT · HTML
     - LAST CHANGED IN GMAIL · 2 Jun 2026, 09:18 AEST
   - No VALIDATION row, no validation helper at bottom (stripped per Issy's
     MVP call 2026-06-06).

   RIGHT PANE — LIVE PREVIEW (on `--portal-card-reading` WHITE — the only
   place white is used on this tab; matches how the signature renders in
   actual email):
   - Sticky inside Section 2.
   - Mono uppercase eyebrow "PREVIEW" + tiny "(read-only)" muted right.
   - Rendered signature in Inter 14px on white. Sample content (no variable
     resolution — this is the raw signature as Gmail returns it):
       Issy Hardwick
       Founder · TheGoodIntro
       issy@thegoodintro.com

       Building the executive philanthropy network.
       calendly.com/issy-thegoodintro/intro
   - 11px muted helper below the preview: "This is exactly how your signature
     appears in emails sent via the platform."

(No Section 3. Brand validation rules were specified in the first pass and
explicitly cut by Issy 2026-06-06 for MVP — the platform does not validate
Gmail signatures. Reconsider in v2 if signature drift becomes an issue.)

## Two viewports designed

- **VP1 LOADED** — two sections rendered as specified above. No banner, no
  validation indicators. STATE · LOADED + VIEWING NOW pill at the bottom.
- **VP2 LOADING** — shell solid (sidebar, topbar, breadcrumb + H1, tab
  strip); two skeleton section cards mimicking real-section anatomy (Signature
  source: round Gmail icon shimmer + 2 lines + pill shimmer + sync row shimmer
  + helper shimmer + ghost link shimmer / Current signature: two-pane shimmer
  with left metadata 4-row shimmer + right preview 6-line shimmer on white
  background). STATE · LOADING + SKELETON pill at the bottom.

## Anti-list (do not regress)

- No duplicate STATE row at the top of any viewport (single bottom row).
- No "All systems operational" pill in the topbar.
- No editor, NO insert-variable button, NO variable chips, NO preferences
  toggles, NO available-variables table. Email signatures are entirely
  Gmail-managed.
- No brand validation banner, no validation status row in metadata, no
  validation helper. The platform does not validate Gmail signatures in MVP.
- No sticky save bar — no editable settings.
- Section 1 SIGNATURE SOURCE block uses muted background with a soft-amber
  "MANAGED BY GMAIL" pill — NOT sage.
- Preview pane uses `--portal-card-reading` WHITE. All other surfaces stay
  warm cream.
- Preview does NOT highlight variables in amber — the signature is HTML from
  Gmail with no platform variable resolution.
- Status indicators use Inter title case + dot (when present at all).
- No em or en dashes in any prose. No emojis.
- Tab strip Email signatures ACTIVE with 2px ink underline.

## NOT designed in this pass (deferred)

- "Open Gmail to fix" / "Open signature settings in Gmail" deep-link target
  spec (which Gmail settings URL exactly).
- "Sync now" loading mid-state animation.
- Auto-sync background job surface (the hourly sync is invisible to the
  user; only its result surfaces here as "Last synced").
- Multi-mailbox / signature-per-sender (today the platform has one mailbox;
  multi-sender deferred).
- Mobile layout.

## Open decisions (do NOT silently resolve)

- Auto-sync cadence — currently spec'd as hourly + on every send + manual.
  Confirm.
- Brand validation — explicitly cut from MVP per Issy 2026-06-06. Revisit in
  v2 if signature drift becomes an issue (signatures could be validated
  against FACTS.md + POSITIONING.md hard rules and surfaced inline).
- Wordmark parked across every locked admin screen.

## Issy's fix passes (2026-06-06)

- **Pass 1 (re-do):** original design specified an editor + preferences +
  variables table + brand-enforcement sage block. Issy redirected to a
  Gmail-sourced read-only mirror. Replaced with three-section design (source
  + preview + brand validation rules).
- **Pass 2 (cut validation):** Issy cut the entire Brand validation rules
  section + VP2 VALIDATION FAILED viewport + VALIDATION metadata row +
  validation helper. Final tab is two sections, two viewports, fully
  read-only.
