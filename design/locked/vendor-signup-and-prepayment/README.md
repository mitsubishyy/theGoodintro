# Vendor Signup + Pre-payment States — LOCKED 2026-06-07 (pending the wordmark call)

Designed in Claude Design 2026-06-07. **Sixth locked vendor-portal screen set.**
Three viewports in one file covering everything a vendor sees BEFORE their account
is `status='active'`. The biggest functional gap in the portal pre-this-pass.

This is also the **first lock under the new TheGoodIntro brand logo** (Fraunces
semibold wordmark with The/Good/Intro colour split; circle mark inserted by the
build chat at port time from `apps/web/public/brand-logo.png`).

## Viewports

| VP | Route | State |
|---|---|---|
| 1 | `/signup` (public, no portal shell) | Default empty — ready to submit |
| 2 | `/vendor` while `vendor.status != 'active'` | Welcome / book your call dashboard |
| 3 | `/vendor/executives` (and other gated routes) while `vendor.status != 'active'` | Reusable lockout page |

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Vendor Signup + Pre-payment" → File > Export HTML |
| `screenshot-vp1-signup.png` | TO DROP | VP1 — Two-column signup, default empty |
| `screenshot-vp2-prepayment-dashboard.png` | TO DROP | VP2 — Welcome / book your call dashboard |
| `screenshot-vp3-lockout.png` | TO DROP | VP3 — Reusable lockout page (rendered on Executives route) |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md) — brand logo lockup spec (locked 2026-06-07).
2. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) §"Vendor Signup + Pre-payment States" + Global decisions for brand logo lockup, two-column signup pattern, pre-payment vendor shell variant, reusable lockout page pattern.
3. [`../../../VENDOR_PORTAL_FLOW_MAP.md`](../../../VENDOR_PORTAL_FLOW_MAP.md) §6 decisions log + §11 Pass B backlog — this is Pass B item #1.
4. [`../vendor-dashboard/README.md`](../vendor-dashboard/README.md) — active vendor shell that VP2 inherits with locked-state treatment.
5. [`../vendor-executives-list/README.md`](../vendor-executives-list/README.md) — the screen VP3 replaces while gated.
6. [`../../../VENDOR_PORTAL_BRIEF.md`](../../../VENDOR_PORTAL_BRIEF.md) §"Account lifecycle and access gating" — the workflow.
7. Open `screen.html` + 3 screenshots.

## What is locked

### Brand logo lockup (NEW global pattern, applies to every future screen)

Locked 2026-06-07. Two-part lockup:
- **Mark:** 36px circular emerald `oklch(0.42 0.13 158)` badge with cream-white `oklch(0.97 0.01 80)` stylised "G" inside (curl / interlocking shape). Source asset: [`apps/web/public/brand-logo.png`](../../../apps/web/public/brand-logo.png).
- **Wordmark:** "TheGoodIntro" one word, **Fraunces semibold**, colour split — "The" in `--portal-ink`, "Good" in brand emerald `oklch(0.42 0.13 158)`, "Intro" in `--portal-ink`.

In Claude Design mockups: **wordmark only** (Fraunces semibold + colour split). The circle mark is custom and Claude Design cannot reproduce it from a text description; the build chat inserts the real mark when porting. This applies to every future screen — wordmark in the mockup, mark inserted at port.

In real code (the build chat): mark + 14px gap + wordmark, vertically centred.

**Fraunces wordmark is the brand exception** to CLAUDE.md's "Fraunces for italic emphasis + big numbers only" rule. The wordmark text itself uses Fraunces semibold across every surface.

### VP1 — Signup page (`/signup`, public, no portal shell)

Two-column full-bleed layout at 1440px:
- **Left column (58%)**: warm cream `--portal-page` bg, 80px h-padding / 64px v-padding. Top-left: Fraunces semibold 28px wordmark with colour split (no circle mark — see above). Centered content stack:
  - "JOIN THE NETWORK" mono eyebrow `--portal-amber-ink`.
  - H1 "Request access to TheGoodIntro" Inter 28px semibold ink (with emerald "Good" colour split inside the H1).
  - Sub-copy "We're invite-led. Sign up with your work email and we'll be in touch within 24 hours to schedule a short call."
  - Two SSO buttons stacked: **Continue with Google** (Google G mark) + **Continue with Microsoft** (Microsoft 4-square mark). Each 48px tall, white card-reading bg, --portal-line border, rounded-lg.
  - "OR WITH WORK EMAIL" divider (hairlines + mono uppercase centered text).
  - Email field "Work email" with placeholder "you@yourcompany.com" + helper "Personal addresses (gmail, outlook, etc.) are not accepted."
  - Full name field with placeholder "Sam Patel".
  - Primary CTA "Continue →" 48px ink button.
  - Microcopy footer "By requesting access you agree to our terms and privacy policy. No payment is taken at this step."
  - Bottom of column: "Already have an account? Sign in →" amber-ink ghost link.
- **Right column (42%)**: deep brand emerald `oklch(0.42 0.13 158)` bg, full height, 64px padding.
  - "WHY THIS EXISTS" mono eyebrow in soft mint at 80% opacity.
  - Brand tagline "Real introductions. Real giving." Inter 42px semibold cream-white, two lines.
  - Sub-text Inter 16px cream-white at 75%, max-width 380px.
  - Custom abstract illustration ~280×240px: three stacked rectangular profile cards (cream / warm-tan / soft-mint) with three gold coins fanning toward a heart-outline icon. NO human characters, NO cartoon hands. Multi-color, 1.6px outline strokes.
  - Two trust check lines at the bottom: "Australian-first. Built for ASX and mid-market." / "Invite-led. Every vendor is vetted on a call."
- **STATE row**: "STATE · SIGNUP · DEFAULT · READY TO SUBMIT".

### VP2 — Pre-payment Dashboard (`/vendor` while `status != 'active'`)

Full vendor portal shell with locked-state visual treatment:
- **Sidebar** (240px deep teal-pine):
  - "TheGoodIntro" wordmark top (old treatment — Inter — preserved from previous render; build chat swaps to new logo lockup at port).
  - REQUEST group: Dashboard (active) · Executives 🔒 · Requests ▾ 🔒 · Meetings ▾ 🔒. Padlock icons (12px outline) at the END of locked rows in `--vendor-sidebar-ink` @60%. Items still clickable; route to VP3 lockout.
  - GOOD group: Giving 🔒.
  - ACCOUNT group: Get started (no padlock, amber count badge "1" welcome step) · Team 🔒 · Billing & credits 🔒 · Settings (no padlock — Sam edits profile freely).
  - Bottom: vendor identity card with "Acme Robotics" + "Awaiting approval" (NOT a band — vendor has no band yet) + hairlines + Sam Patel user chip.
- **Topbar** (56px): H1 "Welcome to TheGoodIntro" + mono eyebrow "ACME ROBOTICS · AWAITING APPROVAL". Search · bell · SP avatar right.
- **Main content** (centered 720px column):
  - "STATUS · AWAITING YOUR CALL" mono eyebrow.
  - H1 "One step before the network opens." Inter 28px semibold ink.
  - Sub-copy explaining the invite-led model.
  - Primary CTA card (warm cream, rounded-2xl, 32px padding): "STEP 1 OF 3 · Book your call with Issy" + 20-minute description + primary ink "Book on Calendly →" CTA opening external. Right side: small calendar-mark illustration block ~120px square.
  - 2-col grid of secondary cards: "STEP 2 OF 3 · Complete your profile" (with "Open Settings →" amber link) + "STEP 3 OF 3 · We approve + you pay" (informational, no CTA).
  - WHAT HAPPENS NEXT block (reuses the locked numbered-step explainer pattern): three numbered steps explaining the flow from call to invoice to access.
- **STATE row**: "STATE · PRE-PAYMENT DASHBOARD · AWAITING APPROVAL".

### VP3 — Reusable lockout page (`/vendor/executives` etc. while `status != 'active'`)

Same vendor portal shell as VP2. Sidebar's "Executives" item shows ACTIVE state (vendor clicked it). Other padlocks unchanged. Topbar H1 "Executives" + same eyebrow.

Main content (centered 640px column, 96px top padding):
- 64px circular `--portal-amber-soft` tile with 28px padlock-outline icon centered, `--portal-amber-ink`.
- "LOCKED" mono eyebrow.
- H2 "This opens after your call with Issy."
- Sub-copy explaining the invite-led gate.
- Primary CTA "Book your call on Calendly →" 44px ink button (opens external).
- Ghost secondary "← Back to dashboard" link.
- "WHILE YOU WAIT" block with two amber-dot bullets: "Complete your profile in Settings…" + "Read how the network works at thegoodintro.com / how-it-works".

This component is **reused** for every gated route. The H1 + STATE row reflect which nav item was clicked.

**STATE row** (VP3): "STATE · LOCKOUT · EXECUTIVES · AWAITING APPROVAL".

## Data sources per module (build-chat reference)

| Module | Source | Notes |
|---|---|---|
| VP1 Continue with Google | Google OAuth → server validates work-email domain → creates `vendor` row (status='signed_up') + `vendor_user` row (Owner) → routes to verify-email screen → VP2 | Gmail.com rejected after OAuth |
| VP1 Continue with Microsoft | Microsoft OAuth → same flow | Hotmail.com / outlook.com rejected |
| VP1 Continue (email + name) | POST creates vendor + vendor_user with status='signed_up' → sends magic-link verification email → "Check your email" screen → on click verifies → VP2 | |
| VP1 Sign in link | `/login` | |
| VP1 "Continue with Google" / Microsoft work-email validation | Server-side block-list (gmail.com, outlook.com, hotmail.com, yahoo.com, etc.) | Rejection UX: Pass C |
| VP1 Company name | Auto-detected from email domain server-side after signup; user does NOT type it on this screen | |
| VP2/VP3 render condition | `vendor.status NOT IN ('active', 'dormant')` | Dormant (access window expired) gets a copy variant — Pass C |
| VP2/VP3 topbar eyebrow | "ACME ROBOTICS · AWAITING APPROVAL" — `vendor.name` + a derived status label. Once active, label becomes "BAND N" from `bandForMeetingNumber(...)` | |
| VP2/VP3 sidebar padlock visibility | Routes gated by RLS until `status='active'`. Settings + Dashboard remain accessible. | |
| VP2 "Book on Calendly →" | External Calendly URL (configured in build) | |
| VP2 "Open Settings →" | `/vendor/settings/profile` | |
| VP3 lockout page | Same component rendered for `/vendor/executives`, `/vendor/requests/*`, `/vendor/meetings/*`, `/vendor/giving` when vendor not active. H1 + STATE reflect the clicked route. | |
| Vendor identity card "Awaiting approval" | Derived label, NOT a band. Once active becomes "Band N · Renews DD MMM YYYY". | |

## Sample data (LOCKED — aligns with the rest of the vendor portal)

- VP1: empty default state.
- VP2 + VP3: Vendor = Acme Robotics, status mapped to "Awaiting approval" copy. Signed-in user = Sam Patel (Owner).

## Open decisions parked

- **Wordmark** — now superseded by the locked logo brand spec (2026-06-07); "one word vs spaced" is resolved as one word with Fraunces semibold + colour split. The previous "PARKED wordmark" note on older locked screens still references the unresolved state at their lock time; the build chat applies the new lockup at port.
- **Settings/Profile pre-payment Visibility section** — confirm whether to hide it pre-payment (no execs are reading yet). Recommend keep shown for consistency. Pass C.
- **VP2 illustration block** — final illustration commissioned later; current is placeholder.
- **Dormant variant** (access window expired) of the lockout page — copy differs from "awaiting approval". Pass C.
- **Verify-email screen** (between signup submit and VP2) — not designed. Pass C.

## Anti-list (do not regress)

- VP1 is a PUBLIC page — NO sidebar, NO topbar.
- VP1 logo: Fraunces semibold wordmark only, no circle mark in the mockup (build chat inserts the real mark at port from `apps/web/public/brand-logo.png`).
- VP1 right panel: deep brand emerald `oklch(0.42 0.13 158)`. NEVER purple, NEVER blue.
- VP1 illustration: NO human characters, NO cartoon hands.
- VP1 form is compact (email + name only). NO company name field, NO phone field on signup.
- VP2 + VP3 inherit the old wordmark treatment (Inter) from their previous render — Issy's call: don't redo work. Build chat applies the new lockup at port.
- Padlock icons on sidebar nav items mean "still clickable, routes to lockout". Padlock is at the END of the row, 12px outline, --vendor-sidebar-ink @60%. Settings + Get started + Dashboard do NOT have padlocks.
- Vendor identity card on sidebar shows "Awaiting approval" pre-payment (NOT a band). Once active: "Band N · Renews DD MMM YYYY".
- Topbar eyebrow shows "ACME ROBOTICS · AWAITING APPROVAL" pre-payment (NOT a band).
- Brand spelling "TheGoodIntro" one word with The/Good/Intro colour split.
- Sage forbidden on every viewport.
- Emerald appears on VP1's right panel + the brand wordmark "Good" letter on VP1 — these are the two locked exceptions to "emerald only on admin sidebar" for the vendor side.
- No em or en dashes. Use "·". No emojis. Outline icons (1.6px stroke) only.

## Issy's fix passes (2026-06-07)

- Pass A.1: Redesigned VP1 as two-column layout with brand panel right (matching the professional register of Monday.com / Notion signup but in TheGoodIntro's brand). Added SSO buttons (Google + Microsoft) as primary path. Trimmed form to email + name only. VP2 and VP3 untouched.
- Pass A.2: Dropped the circular logo mark from VP1's top-left (Claude Design couldn't reproduce TheGoodIntro's custom stylised G from a text description). Wordmark stands alone (Fraunces semibold + colour split). Build chat inserts the real mark at port time.
