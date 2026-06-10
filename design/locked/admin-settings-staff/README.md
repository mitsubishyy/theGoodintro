# Admin Settings · Staff tab — LOCKED 2026-06-06 (pending the wordmark call)

Claude Design file: "Admin Settings Staff". Multi-user admin management
surface inside the locked Admin Settings shell. Eighth and final tab in
the strip (Account · Security · Integrations (default) · Email signatures
· AI · Notifications · Feature flags · **Staff**).

For v1 Issy is the only staff user, but the tab is fully designed so the
multi-user flow is ready when she hires. Includes active staff list,
pending invites, a sage roles-and-permissions reference block, and a
600px right-slide invite drawer with role selection + permissions
preview.

Inherits the 600px right-slide drawer pattern from Pay batch + Gmail
OAuth drawers, the sage reference-block pattern from the Roles & rules
blocks across AI / Notifications / Security / Feature flags / Email
signatures. No new portal-wide patterns introduced.

**Tab strip change:** Staff label NO longer carries the `[SOON]` pill in
this build — the tab is now built. The other Settings tabs (Account /
Security / Email signatures / Feature flags screens) still render the
`[SOON]` pill on the Staff label because they were locked earlier; that
will need to be stripped when those screens are next touched. Not a
priority drift to fix retroactively.

## Sections (three, stacked, max-width 720px content column)

1. **ACTIVE STAFF** — "People with access to TheGoodIntro admin."
   - Sub-header row: mono count chip "2 ACTIVE · 1 PENDING INVITE" left
     + primary ink "+ Invite staff" button right.
   - 2 staff rows (56px each, hairline between):
     - **Owner row (THIS ACCOUNT):** 40px IH avatar on soft-amber +
       "Isobel Hardwick" / "issy@thegoodintro.com" + mono uppercase role
       pill "OWNER" (gold dot, no background) + "Active just now" + small
       mono soft-amber pill "THIS ACCOUNT". **No overflow menu** — you
       can't remove yourself.
     - **Admin row:** 40px MT avatar + "Mia Tan" / "mia@thegoodintro.com
       · Operations Manager" + mono uppercase role pill "ADMIN" (amber-
       soft bg, amber-ink text) + "Active 2 hours ago" + overflow menu
       (Change role / Send password reset / View activity / Remove from
       staff).
   - Helper: "Each staff user signs in with their own Google Workspace
     account. The platform reads role from this list, not from Workspace
     permissions."

2. **PENDING INVITES** — "Invitations sent but not yet accepted."
   - 1 pending invite row (56px, hairline border):
     - 40px envelope placeholder avatar (NO initials — the platform
       doesn't know the name until they accept).
     - "alex@thegoodintro.com" / "Invited 2 days ago · Expires in 5
       days".
     - Mono uppercase role pill "MEMBER" (muted grey bg, ink text).
     - Ghost "Resend ↻" + ghost destructive "Cancel invite" red link.
   - Helper: "Invitations expire after 7 days. Resending refreshes the
     link and resets the expiry."

3. **ROLES & PERMISSIONS** (SAGE-tinted, read-only) — "Reference. Roles
   are baked into the platform code." Sage card with sage-ink left bar.
   - Sage-ink mono eyebrow: "ROLES & PERMISSIONS · LOCKED · MANAGED BY
     DEPLOY"
   - Intro line: "These three roles are the only ones available.
     Permissions are baked into the platform code; you can't create a
     custom role here."
   - 3 role definitions (32px gap), each: mono uppercase role pill +
     Inter 13px description + 3-4 bullets. Definitions match the spec:
     Owner (full access, one per platform) / Admin (day-to-day, can't
     touch billing or system flags) / Member (read-only on lists, no
     edits, no messages).
   - 11px sage-ink note: "These role boundaries are enforced at the RLS
     layer in Supabase, not by UI. See DATA_MODEL.md for the policies."

(No sticky save bar — staff changes are immediate. Invite has its own
drawer footer.)

## Invite drawer (locked, inherits the Pay batch + Gmail OAuth pattern)

600px right-slide drawer with 30% dim-scrim backdrop, hairline left
border, opens from the right edge.

- **Sticky header (64px):** mono uppercase "INVITE STAFF MEMBER" + Inter
  13px muted subtitle "They will receive an email with a sign-up link."
  + close X.
- **Body (scrollable, --portal-card warm cream):**
  - **EMAIL section:** text input "Work email address" with sample value
    "alex@thegoodintro.com" pre-filled. Helper: "Must match a Google
    Workspace account on the thegoodintro.com domain."
  - **ROLE section:** 3 stacked radio chips (vertical, 12px gap):
    - OWNER (gold dot) · "Full access including billing and staff." ·
      **DISABLED** with un-selectable radio + helper "There can only be
      one Owner. Transfer ownership from the current Owner's account
      first."
    - ADMIN (amber-soft) · "Day-to-day platform operations. Cannot
      change billing or system flags." · radio un-selected.
    - MEMBER (muted grey) · "View-only on lists. Cannot edit records or
      send messages." · radio **SELECTED**.
  - **PERMISSIONS PREVIEW (sage-tinted mini-block):** sage-ink mono
    eyebrow "MEMBER WILL BE ABLE TO" (updates dynamically with role
    selection) + 4 bullets summarising the selected role's permissions
    + 11px sage-ink note "This preview updates when you change the role
    above."
  - **PERSONAL MESSAGE (OPTIONAL):** 3-row textarea, 200 char max,
    character counter right of label. Placeholder "Add a short note to
    the invitation email…". Helper "Appears below the standard
    invitation copy. We add the role and sign-up link automatically."
- **Sticky footer (88px, hairline above):** left mono uppercase status
  "READY TO SEND" with gold dot. Right ghost "Cancel" + primary ink
  "Send invitation".

ESC / close-X / backdrop click all close the drawer. Main page sections
stay visible behind dimmed backdrop but are non-interactive.

## Three viewports designed

- **VP1 LOADED · DEFAULTS** — three sections rendered, 2 active staff +
  1 pending invite + sage roles block. No drawer. STATE · LOADED +
  VIEWING NOW pill at the bottom.
- **VP2 INVITE DRAWER OPEN** — same three sections behind 30% dim
  backdrop + 600px right-slide drawer with EMAIL pre-filled + Member
  role selected + sage permissions preview. STATE · DRAWER + DRAWER
  pill at the bottom (single row).
- **VP3 LOADING** — shell solid, three skeleton section cards (staff
  rows + pending invite + sage roles-and-permissions shimmer with 3
  role-definition shimmers). STATE · LOADING + SKELETON pill at the
  bottom. Open decisions block rendered below as a bonus footer.

## Anti-list (do not regress)

- No duplicate STATE row at the top of any viewport.
- No "All systems operational" pill in topbar.
- No sticky bottom save bar (Staff changes are immediate; invite has
  its own drawer footer).
- Staff tab strip label has NO `[SOON]` pill on the active tab in this
  build.
- Role pills use mono uppercase with role-specific colour treatment
  (Owner gold dot / Admin amber-soft / Member muted grey). NOT Inter
  title case.
- "THIS ACCOUNT" pill is small mono soft-amber, only on the current
  user's row.
- Owner row has NO overflow menu (can't remove yourself); other roles
  have full overflow.
- Pending invite avatar is an envelope placeholder, NOT initials.
- Sage tint ONLY on Section 3 (Roles & permissions reference) and on
  the Permissions preview mini-block inside the invite drawer.
- "Cancel invite" is a destructive ghost red link, NOT a primary button.
- Invite drawer uses the 600px right-slide pattern with dimmed backdrop
  (matches Pay batch + Gmail OAuth), NOT the AI Prompt push-pane.
- No em or en dashes; no emojis.

## NOT designed in this pass (deferred)

- Change role flow (in-row dropdown or modal).
- Remove staff confirmation modal.
- Transfer ownership flow.
- View activity per staff member.
- Bulk invite (multi-email paste).
- Staff seat count limits / billing implications.
- Promotion path UI ("Admin can promote Member but not Member to Admin").
- Mobile layout.

## Open decisions (do NOT silently resolve)

- Per-role custom invite copy (currently single template with role
  inserted).
- Expired-invite handling (currently still-listed until manually
  cancelled).
- Transfer-ownership flow (Section 3 copy implies "transfer first" —
  needs proper flow design).
- Audit retention for staff changes (assume 7 years matching sign-in
  events).
- Wordmark parked.

## Issy's fix passes (2026-06-06)

None — landed cleanly on first iteration.
