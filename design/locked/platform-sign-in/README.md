# Platform Sign-in (shared /login) — LOCKED 2026-06-11

Designed in Claude Design 2026-06-11. **The platform's sign-in surface — one
shared `/login` for every audience.** Sibling of the locked public Vendor Signup
page and the second locked auth-entry surface. Closes gap #2 of the 2026-06-11
whole-portal gap audit (the email surface pass is gap #1 and runs in parallel).

Claude Design file: **"TGI Sign-in Pages"**.

**Product decision LOCKED on this screen (do not reopen):** there is **ONE
login for vendors, executives, and EAs**. The email address entered resolves the
account server-side; the sign-in link routes the person to their portal. No role
picker, no tabs, no separate executive or EA sign-in page. Issy ratified
2026-06-11 after the question was raised explicitly ("is the platform smart
enough to auto-switch?" — yes; asking the user a question the system can answer
is friction, a two-way toggle has no door for EAs, and a "sign in as executive"
path would let outsiders probe which emails belong to executives).

No passwords exist on this surface. The flow is: enter email → we send a
one-tap **sign-in link** → tap → you are in your portal.

## Viewports

| VP | Route | State |
|---|---|---|
| 1 | `/login` desktop 1440 | Default — email field FILLED (priya@lumenindustries.com), CTA enabled |
| 2 | `/login` desktop 1440 | Link-sent state — left column swaps to the confirmation stack; right brand panel unchanged |
| 3 | `/login` mobile 390 | Default filled — single column, no brand panel |
| 4 | `/login` mobile 390 | Link-sent — single column |

The file also carries an **Annotations board** (BUILD NOTES · OPEN ITEMS) with
the routing rules, the never-confirm-membership rule, and the specced-only
states. Treat it as part of the export.

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "TGI Sign-in Pages" → File > Export HTML |
| `screenshot-vp1-login-desktop.png` | TO DROP | VP1 two-column login, filled |
| `screenshot-vp2-link-sent-desktop.png` | TO DROP | VP2 link-sent over the unchanged brand panel |
| `screenshot-vp3-vp4-mobile-pair.png` | TO DROP | Both 390px artboards side by side |
| `screenshot-annotations-board.png` | TO DROP | BUILD NOTES · OPEN ITEMS board |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md) — brand wordmark + vocabulary rules.
2. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) — Global decisions: two-column auth-entry pattern + the one-shared-login decision recorded from this lock.
3. [`../vendor-signup-and-prepayment/README.md`](../vendor-signup-and-prepayment/README.md) — the locked sibling auth page; VP1 here re-renders its right brand panel and form language.
4. [`../../../EXECUTIVE_PORTAL_BRIEF.md`](../../../EXECUTIVE_PORTAL_BRIEF.md) §Build approach + §Consent — magic-link auth model (internal doc term; never customer-facing), consent binding at login.
5. [`../exec-ea-mode-banner/README.md`](../exec-ea-mode-banner/README.md) — where an EA lands after this page (Acting-for banner, multi-principal landing parked there).
6. [`../../../MVP_SCOPE.md`](../../../MVP_SCOPE.md) — auth provider + admin 2FA remain parked build decisions.
7. Open `screen.html` + screenshots.

## What is locked

### Register

These are PUBLIC BRAND pages, not portal pages. They follow the locked
two-column auth-entry pattern from Vendor Signup: mono uppercase eyebrows,
gold-ink accent links, dark-ink primary CTAs, brand emerald right panel. The
exec portal's editorial concierge register does NOT apply here, and that is
correct — do not "fix" the mono eyebrows.

### VP1 — `/login` desktop (two-column 58/42 at 1440px)

LEFT column, warm cream `--portal-page`, 80px h / 64px v padding:
- Top-left: Fraunces semibold 28px wordmark, The ink / **Good** emerald / Intro
  ink. Wordmark only; build inserts the circle mark from
  `apps/web/public/brand-logo.png` at port.
- Centered stack, max-width 400px:
  - Mono eyebrow gold-ink: "WELCOME BACK"
  - H1 Inter 28px semibold: "Sign in to TheGoodIntro" (emerald "Good" split
    inside the H1)
  - Sub-copy Inter 14px muted: "No passwords here. Enter your email and we send
    you a one-tap sign-in link."
  - Two SSO buttons stacked (48px, white, hairline, rounded-lg): "Continue with
    Google" + "Continue with Microsoft", brand marks left of label
  - "OR WITH EMAIL" hairline divider, mono uppercase muted
  - "Email" labelled field, 48px, white, hairline — rendered FILLED:
    priya@lumenindustries.com
  - Primary CTA 48px full-width dark ink: "Email me a sign-in link →"
  - Microcopy Inter 12px muted centered: "By signing in you accept our Terms
    and Privacy Policy." (both underlined links — this is the login-side
    consent binding from the exec brief)
- Bottom of column, gold-ink ghost link: "New to TheGoodIntro? Request access →"

RIGHT column (42%), deep brand emerald `oklch(0.42 0.13 158)`, full height:
- Mono eyebrow soft mint @80%: "WHY THIS EXISTS"
- Tagline Inter 42px semibold cream, two lines: "Real introductions. Real
  giving."
- Sub-text Inter 16px cream @75% max-width 380px: "Senior leaders take the
  meetings worth taking, and every one funds a real gift to the charity they
  choose." (stand-in — see verify-at-port)
- Abstract illustration: three stacked profile cards (cream / warm-tan /
  soft-mint) + gold coins fanning toward a heart outline. No humans, 1.6px
  strokes.
- Two trust check lines: "Australian-first. Built for ASX and mid-market." /
  "Invite-led. Every vendor is vetted on a call."

### VP2 — link-sent state (desktop)

Right panel unchanged. Left stack replaced with:
- 64px gold-soft circle, 28px envelope outline glyph in gold ink
- Mono eyebrow: "CHECK YOUR EMAIL"
- H1 Inter 28px semibold: "Your sign-in link is on its way."
- Body Inter 14px muted (bold address): "We've sent it to
  **priya@lumenindustries.com**. It signs you straight in, works once, and a
  fresh one is a click away if it expires."
- Ghost button 44px white hairline: "Send it again"
- Gold-ink ghost link: "← Use a different address"
- Quiet line Inter 12px muted: "Nothing arriving? Check spam, or write to
  hello@thegoodintro.com."

**This state ALWAYS renders after submit, whether or not the address is on
file.** Membership of an invite-only network is never confirmed or denied by
this page. There is no "account not found" error on the email path.

### VP3 + VP4 — mobile 390

Single column, warm cream, NO brand panel. Wordmark centered ~20px, 32px from
top. Same stacks as VP1/VP2 full-width with 20px side margins. All tap targets
≥ 48px. "New to TheGoodIntro? Request access →" centered at the bottom of VP3.

### Vocabulary rule (locked, brand-wide consequence)

Customer-facing copy says **"sign-in link"**, never "magic link" — "magic" is
banned vocabulary (MeetMagic differentiation). Internal docs may keep
"magic-link" as the auth-model term; it must never render.

## Sample data (aligns with the locked cross-portal set)

- Filled email: priya@lumenindustries.com (locked exec sample). No new sample
  entities introduced.
- Annotation on file: EAs sign in with their own email (lena@lumenindustries.com)
  and land in the principal's portal with the Acting-for banner.

## Data sources per module (build-chat reference)

| Module | Source | Notes |
|---|---|---|
| Email submit | Look up the address across `vendor_user.email` / `executive.primary_email` / `ea.email`; issue a single-use sign-in token; send the email | ALWAYS advance the UI to link-sent regardless of match (privacy rule). Unknown addresses send nothing. |
| Sign-in link click | Verify token → create session → route by role: `vendor_user` → `/vendor` · `executive` → `/exec` · `ea` → `/exec` scoped to the principal with the EA Mode banner | Multi-principal EA landing is parked on the EA Mode banner README |
| Consent capture | If an EXECUTIVE has no consent record, first login records one ("by signing in you accept the Terms", per the brief) | Mirrors the email-side first-action capture; one record, whichever comes first |
| Continue with Google / Microsoft | OAuth → resolve role by the verified email → same routing | Post-OAuth unknown-email state is build-side (enumeration is not a concern there — the person has proven ownership of that address); simplest: route to `/signup` with a notice. See open decisions |
| "Send it again" | Re-issue token | Rate limiting / cooldown build-side |
| "← Use a different address" | Return to VP1, field cleared | |
| "Request access →" | `/signup` (the locked vendor signup) | Executives never self-sign-up; we onboard them. EAs are added via the Profile EA drawer |
| Terms / Privacy links | Marketing site `/terms` + `/privacy` | |
| Support address | hello@thegoodintro.com | Placeholder — open decision |
| Same-email-in-two-roles guard | At exec onboarding, reject an email that already exists as a `vendor_user` (and vice versa) | One-line check; keeps "email resolves the role" unambiguous |

## NEW data fields required from this lock

**None.** Token/session storage is auth infrastructure; the auth provider
itself is still the parked MVP_SCOPE decision.

## Specced, NOT rendered (build implements from this copy)

- **Expired-link page** (same standalone template): H1 "This sign-in link has
  expired." + body "Links work once and go stale quickly, on purpose." +
  primary "Email me a fresh link →" with the address prefilled.
- **Inline email validation error** under the field: "That doesn't look like an
  email address."

## Verify-at-port items

1. **Right-panel sub-text** — the rendered line is a stand-in; confirm
   word-for-word against the locked `/signup` brand panel at port so the two
   auth pages never drift apart.
2. **SSO button brand marks** — rendered as placeholder glyphs; build uses the
   official Google "G" and Microsoft four-square assets per their brand rules.
3. **VP1 58/42 split** — the agent corrected a box-sizing fault mid-render and
   measured 58/42 after the fix; spot-check the export.

## Open decisions parked (do NOT silently resolve)

- **Auth provider** (and admin/staff 2FA layered after the link) — parked in
  MVP_SCOPE; nothing on this surface changes it.
- **Post-OAuth unknown-email state** — recommend routing to `/signup` with a
  quiet notice; confirm at build.
- **Link expiry duration + resend cooldown** — build decisions; the locked copy
  deliberately avoids hard numbers.
- **Support address** (hello@thegoodintro.com is a placeholder).
- **Optional password support** (mentioned once in the exec brief) is NOT on
  this surface in v1; if ever wanted it is a Pass B with its own design.
- **Marketing-site wayfinding** — optional footer links "Vendor sign in" /
  "Executive sign in" both pointing at `/login` (audience-aware signposts,
  shared door). Marketing-site task, not platform.

## Anti-list (do not regress)

- **Never "magic link"** (or "magic" anything) in rendered copy. It is the
  "sign-in link".
- **ONE door.** No role picker, no audience tabs, no separate exec or EA login
  page, ever.
- **Link-sent always renders.** No "account not found" on the email path;
  membership is never confirmed or denied.
- **No password field** on this surface.
- **Public page**: no sidebar, no topbar, no portal chrome, no universal search.
- **Brand/public register**: mono eyebrows + ink primary CTAs are CORRECT here;
  do not apply the exec editorial register.
- Right panel is deep brand emerald — never purple, blue, or pink.
- Wordmark "TheGoodIntro" one word, Fraunces semibold, The/Good/Intro colour
  split; no circle mark in mockups (build inserts the real asset).
- Mobile is single-column with NO brand panel; tap targets ≥ 48px.
- No em dashes, no en dashes ("·" separator), no emoji, hairlines not shadows.
- **Forbidden vocab** (brand-wide): marketplace, magic, wizard, coaching,
  program, MeetMagic, AlphaSights.

## Issy's fix passes (the design narrative)

Locked in a single pass. The agent self-corrected one fault mid-render (left
column missing `box-sizing: border-box`, which inflated the split to 62/38;
fixed and measured back to the locked 58/42). After the render Issy raised the
one real product question — should executives and vendors have separate
sign-ins? — and ratified the recommendation that one shared login is correct
(the system resolves the role from the email; a picker adds a failure mode,
excludes EAs, and leaks membership). The link-sent body copy rendered slightly
warmer than the issued spec and was adopted as locked (lock-what-rendered).

## NOT designed in this pass (deferred)

- Expired-link page render (specced above).
- Inline email error render (specced above).
- Post-OAuth unknown-email state.
- Staff/admin 2FA step after the link.
- Vendor signup's verify-email sibling screen (still Pass C on the Vendor
  Signup lock).
- Resend cooldown / rate-limit UI.
