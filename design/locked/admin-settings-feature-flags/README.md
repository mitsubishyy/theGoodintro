# Admin Settings · Feature flags tab — LOCKED 2026-06-06 (pending the wordmark call)

Claude Design file: "Admin Settings Feature Flags". Per-user feature-flag
surface inside the locked Admin Settings shell. Seventh tab in the strip
(Account · Security · Integrations (default) · Email signatures · AI ·
Notifications · **Feature flags** · Staff [soon]).

Lets Issy toggle in-development features for her own account. Flags are
per-user (toggling does not affect other staff). Some flags are system-
locked (GA tier + the SYSTEM FLAGS block) and cannot be toggled here —
those are deploy-controlled. Includes a per-account audit of recent flag
changes (7-year retention, matching sign-in events).

Inherits patterns from the locked Notifications tab (24×14 dense toggle
variant + sage system-rules block), the locked AI tab (sticky save bar +
DEFAULT/CUSTOM chips), and the locked Security tab (RECENT SIGN-INS audit
table → RECENT CHANGES audit table here). No new portal-wide patterns
introduced.

## Sections (three, stacked)

1. **FLAGS** (960px content column) — "Toggle in-development features for
   this user. Some flags are system-controlled and locked."
   - Sub-header: mono count chip "10 FLAGS · 3 ENABLED" left + ghost
     "Reset all to default ↻" link right.
   - Mono column headers (40px row): FLAG · DESCRIPTION · STAGE · ENABLED
     · LAST CHANGED · (overflow space).
   - 10 flag rows grouped into 4 thin category headers (Inter 11px
     tracking-[0.18em] muted): COMMUNICATION · MONEY & STATE · REPORTS ·
     INTEGRATIONS.
   - Row anatomy (48px each):
     - FLAG: mono 12px (NOT uppercase) flag token as a small soft-amber
       chip (e.g., `inbox.ai_drafts`).
     - DESCRIPTION: Inter 13px, 1 line, ellipsis.
     - STAGE: small mono uppercase pill — Dev (muted grey + grey dot),
       Beta (amber-ink + amber-soft bg), GA (gold dot, no background).
     - ENABLED: 24×14 dense toggle pill. LOCKED state shows muted track
       + 12px padlock outline icon immediately right of toggle.
     - LAST CHANGED: mono 11px right-aligned date.
     - Overflow "..." menu: View details / Copy token / View audit /
       Reset to default.
   - DEFAULT / CUSTOM chip inline at the right edge of the ENABLED column.

   Sample flag data (locked at this pass):
   - COMMUNICATION: `inbox.ai_drafts` (GA, locked ON, CUSTOM, 14 May) /
     `inbox.gmail_sync` (GA, locked ON, DEFAULT, 12 Mar) /
     `inbox.slack_relay` (Beta, OFF, DEFAULT, 1 Jun).
   - MONEY & STATE: `meetings.auto_cancel_unpaid` (Beta, OFF, DEFAULT,
     28 May) / `meetings.per_meeting_charity_override` (Dev, OFF, DEFAULT,
     3 Jun) / `gifts.xero_eft_handoff` (Dev, OFF, DEFAULT, 20 May; renames to
     `gifts.myob_eft_handoff` per DEC-12 when built, mockup shows the old name).
   - REPORTS: `reports.bas_export` (Beta, OFF, DEFAULT, 4 Jun) /
     `reports.outstanding_invoices` (GA, ON, DEFAULT, 18 Apr).
   - INTEGRATIONS: `integrations.calendly_self_booking` (Dev, OFF, DEFAULT,
     27 May) / `integrations.zoom_recordings` (Dev, OFF, DEFAULT, 25 May).
   - 3 flags ON at default (the two GA-locked ones + outstanding_invoices).
   - Helper: "Toggling a flag does not affect other staff users. Each user
     manages their own preview flags. System-locked flags (with padlock)
     are controlled by deploy and cannot be toggled here."

2. **RECENT CHANGES** (720px content column) — "Last 10 flag-state changes
   on your account."
   - Compact 44px-row read-only table (matches Security tab RECENT SIGN-INS
     density).
   - Mono column headers: WHEN · FLAG · CHANGE · ACTOR.
   - 5 sample rows showing recent transitions with mono "OFF → ON" syntax,
     including nuanced two-line entries ("OFF → ON then auto-reverted",
     "OFF → ON then OFF on 29 May") for state churn.
   - "VIEW FULL HISTORY →" ghost mono link right-aligned below table.
   - Helper: "Flag changes are written to the platform audit log and
     retained for 7 years (same retention as sign-in events)."

3. **SYSTEM FLAGS** (720px content column, SAGE-tinted) — "Platform-level.
   Managed by deploy." Sage card with sage-ink left bar.
   - Sage-ink mono eyebrow: "SYSTEM FLAGS · LOCKED · MANAGED BY DEPLOY"
   - Intro line: "These flags are controlled at the platform level.
     Toggling them requires a code deploy, not a settings change. Listed
     here for transparency."
   - 5 rows (24px gap, stacked NOT in a table): token chip + small Inter
     title case status pill (ON gold dot / OFF muted dot) + Inter 13px
     description.
     - `platform.maintenance_mode` · OFF · maintenance windows.
     - `platform.read_only` · OFF · incident response.
     - `audit.log_retention_7y` · ON · regulatory 7-year retention.
     - `security.session_30d_expiry` · ON · inactive expiry.
     - `pricing.engine_v1` · ON · pricing engine version, migration-tied.
   - 11px sage-ink note: "Last system-flag deploy: 2 Jun 2026. See
     deployments log in V2_BUILD_PLAN.md."

## Sticky bottom save bar (VP2 only, inherited)

88px tall, hairline above. Left: "2 UNSAVED CHANGES · View diff" mono +
ghost link. Right: ghost "Discard" + primary ink "Save changes". 11px
muted helper: "Changes apply to your account immediately after save.
Other staff are unaffected."

## Three viewports designed

- **VP1 LOADED · DEFAULTS** — three sections rendered. 3 flags ON at
  default (2 GA-locked + outstanding_invoices). Every togglable row reads
  DEFAULT. No save bar. STATE · LOADED + VIEWING NOW pill at the bottom.
- **VP2 MODIFIED · 2 UNSAVED** — `inbox.slack_relay` and
  `reports.bas_export` flipped from OFF → ON; both chips flip to CUSTOM.
  Count chip updates to "10 FLAGS · 5 ENABLED". Sticky save bar visible.
  STATE · MODIFIED + VIEWING NOW pill at the bottom (single row).
- **VP3 LOADING** — shell solid, three skeleton section cards (flags
  table with 4 category-header shimmers + 10 row shimmers / recent
  changes 4 column + 5 row shimmers / sage system-flags block shimmer).
  STATE · LOADING + SKELETON pill at the bottom.

## Anti-list (do not regress)

- No duplicate STATE row at the top of any viewport.
- No "All systems operational" pill in topbar.
- Flag TOKENS render as soft-amber chips in mono 12px (NOT uppercase,
  NOT raw text). Matches variable chip pattern from Templates editor.
- Stage pills are mono uppercase with stage-specific colour treatment
  (Dev grey / Beta amber-soft / GA gold dot).
- 24×14 dense toggle pill variant in the flags table (the variant locked
  on Notifications tab). 36×20 standard variant is NOT used on this tab.
- System-locked rows use toggle LOCKED state: muted track + 12px padlock
  outline icon immediately RIGHT of toggle (NOT inside the track).
- DEFAULT / CUSTOM chips render inline in the ENABLED column.
- Sticky save bar visible ONLY on VP2.
- Sage tint ONLY on Section 3 (System flags).
- No em or en dashes; no emojis.
- Tab strip: Feature flags ACTIVE with 2px ink underline.
- Section cards use `--portal-card` warm cream, NOT white.
- Audit table uses mono "OFF → ON" transition syntax with the right
  arrow character (NOT en dash, NOT em dash).

## NOT designed in this pass (deferred)

- View details drawer for a single flag (target / rollout history /
  dependencies).
- "Reset all to default" confirmation modal.
- Bulk-toggle (multi-select) flow.
- "View full history" destination page (audit log surface).
- Flag-request flow (asking dev to add a new flag).
- Mobile layout.

## Open decisions (do NOT silently resolve)

- Whether flag changes are immediate (each toggle saves on flip) or
  batched behind Save changes — currently batched (matches AI /
  Notifications / Account tab convention).
- Whether "Reset all to default" requires confirmation modal (currently
  one-click; should probably modal-confirm).
- Audit retention period for flag changes (7 years matching sign-in
  events — confirm).
- Wordmark parked across every locked admin screen.

## Issy's fix passes (2026-06-06)

None — landed cleanly on first iteration. Claude Design correctly
resolved a math error in the prompt (the "ENABLED" count after the two
VP2 flips is 5, not 6 as the prompt mistakenly stated).
