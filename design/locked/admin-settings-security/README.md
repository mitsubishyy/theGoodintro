# Admin Settings · Security tab — LOCKED 2026-06-05 (pending the wordmark call)

Claude Design file: "Admin Settings Security". Per-user sign-in, session, and
audit surface inside the locked Admin Settings shell. Second tab in the strip
(Account · **Security** · Integrations (default) · Email signatures · AI ·
Notifications · Feature flags · Staff [soon]).

Sign-in is delegated to Google Workspace SSO, so this tab is mostly read-only:
it surfaces what Workspace controls plus what the platform enforces in code.
No editable settings; no sticky save bar.

Inherits patterns from the locked AI tab and Notifications tab (sage system-
rules block, STATE annotation row at the bottom of each viewport). Introduces
the **security alert banner** pattern (amber-soft callout above sections with
acknowledge + lockdown actions) — reusable for any future urgent-prompt surface.

## Sections (four, stacked, max-width 720px content column)

1. **SIGN-IN METHOD** — "How you access the platform." Read-only block, muted
   background (NOT sage; sage is reserved for staff-only / AI / system rules).
   40px Google G logo + "Google Workspace SSO" name + `issy@thegoodintro.com`
   sub-line + small mono soft-amber pill right "MANAGED BY GOOGLE". Helper:
   "Sign-in is delegated to your Google Workspace account. To change your
   password, manage two-factor authentication, or revoke device-level access,
   open Google Account settings." Ghost link with external-link icon: "Open
   Google Account settings →"

2. **ACTIVE SESSIONS** — "Devices currently signed in to your account."
   - Sub-header: mono "3 SESSIONS" count chip left + ghost ink "Sign out all
     other devices" button right.
   - 3 session rows (56px, hairline between):
     - Chrome 124 on macOS 14 · Sydney, AU · 203.123.45.67 · small mono
       soft-amber pill "THIS DEVICE" right · no sign-out button.
     - Safari 17 on iOS 18 · Sydney, AU · 203.123.45.68 · Active 2 hours ago
       · ghost "Sign out" link right.
     - Chrome 122 on macOS 13 · Sydney, AU · 14.203.45.67 · Active yesterday
       at 4:23 PM · ghost "Sign out" link right.
   - Helper: "Sessions auto-expire after 30 days of inactivity. See
     SYSTEM-ENFORCED SECURITY below."

3. **RECENT SIGN-INS** — "Read-only audit of recent sign-in attempts."
   Compact 44px-row table (denser than 56px — pure audit data):
   - Mono columns: WHEN · DEVICE · LOCATION · IP · STATUS.
   - 5 rows (5 Jun 2026 09:14 → 2 Jun 2026 14:15), all Success with gold dot
     in STATUS column.
   - "VIEW FULL HISTORY →" ghost mono link right-aligned below table.
   - Helper: "All sign-in events are written to the platform audit log and
     retained for 7 years."

4. **SYSTEM-ENFORCED SECURITY** (SAGE-tinted, read-only) — "What the
   platform handles automatically." Sage card with sage-ink left bar
   (matching AI tab's HARD RULES + Notifications tab's SYSTEM RULES).
   - Sage-ink mono eyebrow: "SYSTEM-ENFORCED SECURITY · LOCKED · NOT
     USER-CONFIGURABLE"
   - 5 bullets: sessions auto-expire 30 days / new device sign-ins email
     account email / 5 failed attempts in 15 min = 1-hour lockout / Workspace
     2FA required at directory level / sign-in events written to audit log
     retained 7 years.
   - 11px sage-ink note: "These rules are enforced in code, not by user
     setting. See SECURITY_AND_COMPLIANCE.md."

## Security alert banner (NEW pattern, locked this pass)

Amber-soft callout rendered above Section 1 only when a security event
needs acknowledgement (VP2 ALERT in this lock). Anatomy:
- `--portal-amber-soft` background, 24px padding, hairline amber-tinted border
- Mono amber-ink eyebrow with leading gold dot ("SECURITY ALERT · NEW DEVICE")
- Inter 14px semibold heading
- Inter 13px body with the event details (device, location, IP, timestamp)
- Action row: primary ink "Yes, this was me" + ghost destructive "Lock my
  account, this wasn't me" link (red — destructive actions don't shout)
- 11px muted helper: "We sent this alert to {account_email} too. Acknowledge
  here to dismiss it."

Reusable for any future urgent acknowledge-or-lockdown surface (e.g., new
device on a different portal, role change, suspicious activity).

## Three viewports designed

- **VP1 LOADED · DEFAULTS** — four sections rendered as specified above. No
  alert banner. All sessions normal, all sign-ins Success gold dot. STATE ·
  LOADED + VIEWING NOW pill at the bottom.
- **VP2 ALERT · NEW DEVICE** — same shell + sections + alert banner above
  Section 1. 4th session row added to Active Sessions (Chrome 124 on
  Windows 11, Brisbane AU, Active just now, **amber edge dot on left**).
  Recent Sign-ins gains a top row matching the new device with status
  "Success · new device" (amber dot, NOT gold). All other content
  unchanged. STATE · ALERT + VIEWING NOW pill at the bottom (single row).
- **VP3 LOADING** — shell solid, four skeleton section cards mimicking
  real-section anatomy (sign-in-method round logo + lines + pill / active-
  sessions count-chip + button + 3 row shimmers / recent-sign-ins 5 columns
  + 5 rows / sage-tinted system-rules block with eyebrow + 5 bullets).
  STATE · LOADING + SKELETON pill at the bottom. OPEN DECISIONS · PARKED
  block below the STATE row (bonus Claude Design rendered).

## Anti-list (do not regress)

- No duplicate STATE row at the top of any viewport. Single bottom row.
- No "All systems operational" pill in the topbar.
- No sticky save bar (no editable settings on this tab).
- Sage tint ONLY on Section 4 (System-enforced security). Sign-in method
  is muted with a soft-amber "MANAGED BY GOOGLE" pill, NOT sage.
- No em or en dashes; no emojis.
- Tab strip: Security ACTIVE with 2px ink underline.
- Status pills use Inter title case + dot ("Success" gold dot, "Success ·
  new device" amber dot). NEVER mono uppercase.
- Section cards use `--portal-card` warm cream, NOT white.
- "Lock my account, this wasn't me" is a destructive ghost link (red),
  NOT a primary button.
- New session row in VP2 has an amber edge dot on the left, matching the
  M-188 row pattern from Admin Giving.

## NOT designed in this pass (deferred)

- "Lock my account" destructive confirmation modal.
- "View full history" destination page (will live at /admin/audit or similar).
- New device pairing / device naming flow.
- Platform-managed 2FA layer (currently delegated to Workspace).
- Recovery codes UI.
- Sign-out confirmation toast.
- Mobile layout.

## Open decisions (do NOT silently resolve)

- Whether the platform should manage its own 2FA layer separate from Workspace
  (currently delegated entirely).
- "VIEW FULL HISTORY" destination — a Settings sub-page or the admin audit
  log surface.
- Failed-attempt lockout threshold (currently 5 in 15 min — confirm against
  SECURITY_AND_COMPLIANCE.md).
- Session inactivity expiry (currently 30 days — confirm).
- Wordmark parked across every locked admin screen.
