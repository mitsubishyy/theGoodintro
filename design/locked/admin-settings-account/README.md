# Admin Settings · Account tab — LOCKED 2026-06-05 (pending the wordmark call)

Claude Design file: "Admin Settings Account". The per-user identity, contact, and
display preferences tab inside the locked Admin Settings shell. Sits leftmost in
the tab strip (Account · Security · Integrations (default) · Email signatures · AI
· Notifications · Feature flags · Staff [soon]).

Inherits every pattern from the locked AI tab and Notifications tab (DEFAULT /
CUSTOM chips, sticky save bar, three-section content column at max-width 720px,
STATE annotation row at the bottom of each viewport). No new portal-wide patterns
introduced this pass.

## Sections (three, stacked, on the locked Settings shell)

1. **PROFILE** — "Your identity in the platform."
   - 80px round avatar (IH initials in soft-amber) + "Upload photo" ghost button
     + "PNG or JPG. Max 1MB." helper.
   - 2-col field grid: First name "Isobel" / Last name "Hardwick" / Display name
     (optional) "Issy" / Title "Founder".
   - Full-width Bio (optional textarea, 200 char max, character counter "0 / 200"
     right of label, DEFAULT chip inline with label, helper "Visible to other
     staff in audit logs and assignments. Never shown to vendors or executives.").

2. **CONTACT** — "Where the platform reaches you."
   - Email: `issy@thegoodintro.com`, read-only with muted background + small mono
     VERIFIED pill right of field + helper "Managed by Google Workspace. To
     change, update your workspace account." NOT sage-tinted (sage reserved for
     staff-only / AI / system-rules content).
   - Phone (optional): E.164 placeholder `+61 4xx xxx xxx`, helper "Used for
     urgent platform alerts only. Never shared with vendors or executives."
   - Timezone (select): "Australia / Sydney (AEST)", helper "All dates and times
     in the platform display in this timezone."
   - Locale (select): "English (Australia)" (single option in v1).

3. **DISPLAY** — "How the platform looks to you."
   - Default landing page (select): "Dashboard", helper "Where to go after
     sign-in." Options: Dashboard / Inbox / Meetings / Vendors / Executives.
   - Date format (segmented control): Long "14 May 2026" [selected] · Short
     "14/05/26".
   - Time format (segmented control): 24-hour "14:00" [selected] · 12-hour
     "2:00 PM".

No Section 4. Sign-out / delete-account / 2FA all live in the Security tab.

## DEFAULT / CUSTOM chips (inherited pattern, codified in the AI tab lock)

Each editable row carries a small soft-amber mono chip inline with the field
label, right side: `DEFAULT` when at the saved default value, `CUSTOM` (with
gold dot) when overridden. Reusable for any per-user settings surface.

## Sticky save bar (inherited from AI tab, visible only on VP2)

88px tall, hairline above. Left: "3 UNSAVED CHANGES · View diff" mono uppercase
+ ghost link. Right: ghost "Discard" + primary ink "Save changes". 11px muted
helper: "Changes apply across the platform immediately after save." Hidden on
VP1 (defaults) and VP3 (loading).

## Three viewports designed

- **VP1 LOADED · DEFAULTS** — all fields at default values, every chip DEFAULT,
  no sticky save bar. STATE · LOADED + VIEWING NOW pill at the bottom.
- **VP2 MODIFIED · 3 UNSAVED** — three fields changed from defaults, their
  chips flipped to CUSTOM, sticky save bar visible:
  - Title: "Founder" → "Founder & CEO"
  - Phone: empty → "+61 412 345 678"
  - Default landing page: "Dashboard" → "Inbox"
  STATE · MODIFIED + VIEWING NOW pill at the bottom (single row only — top
  viewport-label drift stripped in fix pass).
- **VP3 LOADING** — shell solid (sidebar, topbar, breadcrumb + H1, tab strip);
  three skeleton section cards each mimicking real-section anatomy (Profile
  with avatar circle shimmer + button + 2-col field grid + textarea; Contact
  with 4 stacked field shimmers including a small pill right; Display with 3
  stacked field shimmers). No sticky save bar. STATE · LOADING + SKELETON
  pill at the bottom.

## Anti-list (do not regress)

- No duplicate STATE row at the top of any viewport (single bottom row is the
  locked pattern; the top-viewport-label drift hit this tab on first pass and
  was stripped — same drift that has bitten Meeting detail, AI tab,
  Notifications tab).
- No "All systems operational" pill in the topbar (search + amber-dotted bell +
  IH avatar only).
- No sage tint anywhere on this tab (Account has no staff-only / AI / system
  rules content). Sage is reserved.
- No em or en dashes; no emojis.
- Email field is read-only with muted background + small mono VERIFIED pill
  right of field (NOT sage, NOT a regular interactive input).
- DEFAULT / CUSTOM chips render INLINE with the field label, right side (NOT
  below helper text, NOT at the top of the section). Bio chip placement was
  fixed in the fix pass to match.
- Sticky save bar visible ONLY on VP2.
- Tab strip Account is the ACTIVE tab with 2px ink underline.

## NOT designed in this pass (deferred)

- "View diff" destination page.
- Avatar upload flow (drawer or inline picker) — VP1 only renders the button.
- Email change flow (workspace-side, not platform-side).
- Date / time custom format strings.
- Save confirmation toast.
- Mobile layout.

## Open decisions (do NOT silently resolve)

- "View full diff" destination.
- Whether Phone should also drive SMS notifications (currently helper says
  urgent platform alerts only).
- Wordmark — sidebar renders "The Good Intro" (three words), still parked
  across every locked admin screen.
