# Vendor Settings — Shell + Profile tab — LOCKED 2026-06-06 (pending the wordmark call)

Designed in Claude Design 2026-06-06. **Fifth locked vendor-portal screen.**
Locks the vendor Settings shell (3 tabs: Profile · Notifications · Security) plus
the full Profile tab content. Pass A: LOADED · DEFAULTS state (every field DEFAULT
chip, no unsaved changes, no sticky save bar). MODIFIED + LOADING states, Notifications
tab content, Security tab content, and a future Company tab (vendor logo upload) all
deferred to Pass B.

**Important product decision baked into this lock:** the vendor's About block is
**always public to executives** reviewing the vendor's meeting requests — no
opt-in. This reverses `VENDOR_PORTAL_BRIEF.md` § Settings/Profile (which said
opt-in). Row 1 of the Visibility section is now a locked-ON system rule. See
feedback memory `project_thegoodintro_vendor_about_always_public_to_execs`.

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Vendor Settings - Profile" → File > Export HTML |
| `screenshot-loaded-vp1.png` | TO DROP | VP1 — top of page (tabs + Profile + Contact start) |
| `screenshot-loaded-vp2.png` | TO DROP | VP2 — middle (Contact end + About) |
| `screenshot-loaded-vp3.png` | TO DROP | VP3 — bottom (Visibility section, all 3 rows + STATE row) |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md).
2. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) §"Vendor Settings — Shell + Profile tab".
3. [`../vendor-dashboard/README.md`](../vendor-dashboard/README.md) — vendor shell this inherits.
4. [`../admin-settings/README.md`](../admin-settings/README.md) — admin Settings shell pattern the vendor shell mirrors.
5. [`../admin-settings-account/README.md`](../admin-settings-account/README.md) — admin Account tab spec (DEFAULT/CUSTOM chip pattern, sticky save bar, section anatomy all inherited here).
6. [`../../../VENDOR_PORTAL_BRIEF.md`](../../../VENDOR_PORTAL_BRIEF.md) §"Settings / Profile" — workflow brief (NOTE: About-visibility opt-in language is now OUT OF DATE; see memory).
7. Open `screen.html` + 3 screenshots.

## What is locked

### Vendor portal shell (inherits Vendor Dashboard locks)
- Sidebar deep teal-pine, IA, count badges, vendor identity card, Sam Patel chip.
- **"Settings" sidebar item is ACTIVE** on this screen.
- Topbar: H1 "Settings" + mono eyebrow "ACME ROBOTICS · BAND 2" + search · bell · SP.
- NO back row (Settings is a first-level sidebar item).

### Settings shell — tab strip (locked for every future vendor Settings tab)
Full-width below topbar, 48px tall, bottom hairline `--portal-line`, 32px page padding from the left edge.

Three tabs, inline, 24px gap between:
1. **Profile** — Inter 14px semibold, active (`--portal-ink` color + 2px `--portal-ink` underline 8px below text baseline).
2. **Notifications** — Inter 14px semibold `--muted-foreground`, no underline. Cursor pointer.
3. **Security** — same rest treatment.

Tab order is locked. Sign-out stays in the user chip at the bottom of the sidebar (NOT a Settings tab). A future **Company** tab is parked for Pass B (vendor logo upload + company name + about-the-company).

### Profile tab content (max-width 720px column, centered, 32px top padding below tab strip, 40px gap between sections)

Four sections stacked, no outer card, 16px hairline above each section's first content row.

**SECTION 1 — PROFILE**
- Header: mono "PROFILE" eyebrow + helper "Your name and how you appear across TheGoodIntro."
- Avatar row: 80px SP initials tile in `--portal-amber-soft` (production reads `vendor_user.photo_url` first, this is fallback) + 24px gap + ghost "Upload photo" button (with upload-arrow icon) + helper "PNG or JPG. Max 1MB. Square crop recommended."
- 2-col field grid (24px col gap, 20px row gap):
  - Row 1: First name "Sam" / Last name "Patel"
  - Row 2: Display name (optional, empty, placeholder "Sam") / Title "Head of RevOps"
- Each field: label + 8px gap + DEFAULT chip inline (mono 10px uppercase tracking-[0.10em], 2px/8px padding, --portal-line border, no fill, --muted-foreground text). 40px input (white bg, --portal-line border, rounded-lg).

**SECTION 2 — CONTACT**
- Header: "CONTACT" eyebrow + helper "How TheGoodIntro reaches you and how you appear to executives who request a meeting."
- Fields stacked (full-width, 20px row gap):
  - **Email** — label + DEFAULT chip + read-only field (muted bg `oklch(0.95 0.008 80)`, --portal-line border, --muted-foreground text). Value "sam@acmerobotics.com". Mono pill "VERIFIED" inside the field right (soft-green bg `oklch(0.93 0.04 155)` + green ink `oklch(0.38 0.10 155)`). Helper "Managed through your work email. To change, contact hello@thegoodintro.com."
  - **Phone (optional)** — label + DEFAULT chip + standard input (empty, placeholder "+61 4xx xxx xxx"). Helper "Urgent platform alerts only. Never shared with executives."
  - **LinkedIn URL (optional)** — label + DEFAULT chip + standard input. Value "linkedin.com/in/sampatel-revops". Helper "Optional. Shown to executives alongside your request if Visibility is on (below)."
  - **NOTE:** the LinkedIn helper still says "if Visibility is on (below)" which is now slightly out of date because About is always-on for executives, but LinkedIn URL visibility itself is still gated by the About-visibility rule (one rule covers the whole "Vendor profile context" block sent to execs). Confirmed acceptable for lock; revisit copy at next pass if Issy wants the LinkedIn helper rewritten.

**SECTION 3 — ABOUT YOU & YOUR COMPANY**
- Header: "ABOUT YOU & YOUR COMPANY" eyebrow + helper "Plain and short. This is context for the executive, not a marketing page."
- Label row: "About" Inter 13px semibold + DEFAULT chip + right-aligned character counter "527 / 1000" (Inter 11.5px --muted-foreground; shifts to --portal-amber-ink at 80% used, dark red >100%).
- Textarea (6 rows min, auto-grow): `--portal-card-reading` white bg, `--portal-line` border, rounded-lg, 14px padding, Inter 13.5px ink. Prefilled with the locked 527-char sample text (Sam Patel's About).
- NOTE: the locked sample text contains an em dash inside the user-typed content ("My background is enterprise SaaS — 8 years…"). Em dashes are forbidden in TheGoodIntro UI CHROME but are permitted inside sample form values (users may type whatever they like). The content-guard pipeline strips emails / phones / URLs — NOT dashes.

**SECTION 4 — VISIBILITY OF YOUR "ABOUT" (purely informational, all rows locked)**
- Header: 'VISIBILITY OF YOUR "ABOUT"' mono eyebrow + helper "Where this About block can be seen. Some rules are fixed by TheGoodIntro and shown for transparency."
- Three rows stacked, 16px gap between. Each row is a 64px card (`--portal-card-reading` white bg, `--portal-line` border, rounded-xl, 20px padding). All three rows use the locked-toggle pattern (`--portal-line` desaturated track + thumb in the ON or OFF position + 12px padlock-outline icon immediately to the RIGHT of the toggle).
  - **Row 1 — "Visible to executives"** — LOCKED ON. Subtitle "Shown to executives alongside your meeting request, so they have context before deciding. Cannot be turned off." Track desaturated, thumb on the RIGHT, padlock right. **This is the always-public rule from the project memory.**
  - **Row 2 — "Always visible to TheGoodIntro admin"** — LOCKED ON. Subtitle "Our team can see this to help match you with the right executives. Cannot be turned off." Identical visual to Row 1.
  - **Row 3 — "Never visible to other vendors or to your teammates"** — LOCKED OFF. Subtitle "Other vendors using the platform, and other users on the Acme Robotics account, cannot see this. Cannot be turned on." Track desaturated, thumb on the LEFT, padlock right.

All three rows are identical visually except for copy and ON/OFF state. The Visibility section is a pure disclosure block — there are no user-editable controls in it.

### No sticky save bar (Pass A — DEFAULTS state)
Every field shows DEFAULT chip. No unsaved changes → no 88px sticky save bar at the bottom. The MODIFIED state with sticky save bar inherits the locked admin pattern (88px, "N UNSAVED CHANGES · View diff" left + ghost Discard + primary ink Save changes right + 11px helper) and is Pass B.

### STATE annotation row (bottom of viewport)
"STATE · SETTINGS · PROFILE TAB · LOADED · DEFAULTS" mono uppercase + right-aligned "VIEWING NOW" amber-soft pill. Single bottom row, no top row.

## Data sources per module (build-chat reference)

| Module | Source | Notes |
|---|---|---|
| Sidebar Settings item active | route match | First-level sidebar item, no back row |
| Topbar eyebrow `ACME ROBOTICS · BAND 2` | `vendor.name` + `bandForMeetingNumber(...).band` | Same as every vendor screen |
| Avatar tile / Upload photo | `vendor_user.photo_url` (production), fallback initials in `--portal-amber-soft` derived from `vendor_user.name` | Upload flow Pass B |
| First name | `vendor_user.first_name` (or split from `name`) | Editable |
| Last name | `vendor_user.last_name` (or split from `name`) | Editable |
| Display name | `vendor_user.display_name` (nullable) | Editable, optional |
| Title | `vendor_user.title` | Editable |
| Email | `vendor_user.email` | READ-ONLY in UI. VERIFIED pill iff `vendor_user.email_verified_at IS NOT NULL`. Change flow is out-of-band (email hello@thegoodintro.com) |
| Phone | `vendor_user.phone` (E.164, nullable) | Editable |
| LinkedIn URL | `vendor_user.linkedin_url` (nullable) | Editable |
| About | `vendor_user.about` text, max 1000 chars server-side | Editable. Content-guard pipeline strips emails / phones / URLs before exec email composes — dashes are permitted in user content |
| Visibility row 1 toggle | **Hard-coded `true` platform-side** (see project memory). NOT a `vendor_user` column; if a column exists, it's locked to `true` and not exposed for edit | Disclosure only |
| Visibility row 2 toggle | Hard-coded `true` platform-side | Disclosure only |
| Visibility row 3 toggle | Hard-coded `false` platform-side, RLS-enforced | Disclosure only |
| DEFAULT / CUSTOM chip per field | Local form state vs last-saved value. DEFAULT until edited, CUSTOM once changed | |
| Save bar (Pass B) | Visible when `dirty_fields.length > 0`. Save POSTs the field diff |

## Sample data (LOCKED — aligns with the prior vendor screens)

- Vendor: **Acme Robotics** · Band 2
- Signed-in user: **Sam Patel** · Owner
- Profile: First "Sam" / Last "Patel" / Display name empty / Title "Head of RevOps"
- Contact: sam@acmerobotics.com (VERIFIED) / Phone empty / LinkedIn linkedin.com/in/sampatel-revops
- About (527 chars): "I lead the RevOps function at Acme Robotics, focusing on go-to-market for our autonomous warehouse systems. My background is enterprise SaaS — 8 years at Workday and Snowflake before joining Acme in 2024. Acme builds AI-driven pick-pack systems for mid-market logistics operators; we work with retail and 3PL teams who want to scale without ripping out their existing WMS. Always keen to talk operational efficiency, multi-SKU warehousing, and how AI is reshaping logistics."

## Open decisions parked (Pass B)

- **Wordmark**.
- **Company tab** — fourth Settings tab. Vendor logo upload (closes the loop on the sidebar identity card promise), company name, public about-the-company. Not yet designed.
- **Notifications tab content** — vendor-scope signals (request accepted / request declined / meeting moved / gift confirmation / payment receipt). Mirrors admin Notifications tab anatomy.
- **Security tab content** — password change, sessions, 2FA enrolment. Mirrors admin Security tab anatomy.
- **MODIFIED state + sticky save bar** — same 88px pattern as locked admin Settings · Account tab.
- **LOADING / SKELETON state** — 4 skeleton section cards.
- **Avatar upload flow** — file picker, crop, validation.
- **Email change flow** — currently pointed at hello@thegoodintro.com; in-app flow deferred.
- **"View full diff" destination** from the save bar.
- **LinkedIn helper copy** — still says "if Visibility is on (below)" which is mildly misleading now that About is always-on. Revisit if Issy wants it rewritten.

## Anti-list (do not regress)

- **About is always public to executives.** Row 1 of Visibility is a locked-ON system rule, not a user-editable toggle. Do NOT add an opt-in toggle here on subsequent passes. See project memory `thegoodintro-vendor-about-always-public-to-execs`.
- **VENDOR_PORTAL_BRIEF.md § Settings/Profile is out of date** on the opt-in language; FACTS-style fix at next sweep.
- All three Visibility rows are locked / padlocked. The Visibility section has no editable controls — it is purely disclosure.
- Sage forbidden on vendor surfaces (no sage system-rules block here, even though admin AI/Notifications/Staff tabs use sage). Vendor uses the locked-toggle pattern for transparency, not a sage callout.
- Email field is READ-ONLY with muted bg + VERIFIED soft-green pill. Never editable in this UI.
- DEFAULT / CUSTOM chips sit inline with the field LABEL, right of the label (NOT below the helper).
- Brand spelling, "Band" not "Tier", no em/en dashes IN CHROME (sample form values are exempt), no emojis.
- No sticky save bar in the DEFAULTS state (Pass A). Only appears when dirty.

## Issy's fix passes (2026-06-06)

- Pass A.1: row 1 of Visibility section ("Visible to executives") swapped from user-editable OFF toggle to locked-ON system rule with padlock. Reflects the "always public to execs" product decision. Subtitle copy updated from "Show executives a quick line on who they're about to meet…" to "Shown to executives alongside your meeting request, so they have context before deciding. Cannot be turned off."
