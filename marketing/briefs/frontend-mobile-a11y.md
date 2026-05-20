# Frontend, mobile, and accessibility brief

Owner: frontend developer
Status: parcel 5 of the multi-team site-quality pass
Last updated: 2026-05-20

## Context

The site shipped today is functional and tidy at the code level (zero lint errors, builds clean, all pages render). What is not yet shipped: mobile QA at narrow breakpoints, full WCAG AA verification, and a handful of medium-complexity accessibility fixes that need a developer to think through component refactors.

This brief covers everything in that bucket.

## What is already done (no action needed)

1. **Zero lint errors / warnings.** The `react-hooks/set-state-in-effect` lint error on `app/apply/apply-form.tsx` was the most substantive; refactored to use `useSearchParams` from `next/navigation` and the `SITE_URL` constant. No eslint-disable workaround.
2. **Four unused imports** removed from [app/vendors/page.tsx](../../app/vendors/page.tsx) (`Lock`, `IconBriefcase`, `IconNetwork`, `IconGift`).
3. **One unescaped apostrophe** fixed at [app/page.tsx:238](../../app/page.tsx#L238).
4. **Focus-visible rings** added to `PrimaryCta`, `SecondaryCta`, and the input/textarea classes used by the apply form. Keyboard users will now see a 2px primary-coloured ring on focus.
5. **Heading hierarchy** fixed: [app/opportunity/page.tsx:169](../../app/opportunity/page.tsx#L169) was an h3 sitting under an h1 with no h2 between them; now h2.
6. **IndexNow script** was stale (referenced `/executives` and `/about` which do not exist as routes; missed `/pricing`, `/giving`, `/impact`, `/faq`, `/apply`, `/opportunity`). [scripts/notify-indexnow.mjs](../../scripts/notify-indexnow.mjs) now lists every real route.
7. **IndexNow GitHub Action** wired at [.github/workflows/indexnow.yml](../../.github/workflows/indexnow.yml). Triggers on successful Vercel production deploys, plus a manual `workflow_dispatch` for ad-hoc runs.

### IndexNow one-time setup steps (for Isobel)

1. Generate an IndexNow key. Any random 8-128 character string works. Example: `openssl rand -hex 16` in a terminal.
2. In the GitHub repo settings, go to **Settings > Secrets and variables > Actions > New repository secret**. Name it `INDEXNOW_KEY`, paste the key.
3. Create a file in `public/` named `<your-key>.txt` containing exactly the key (no whitespace, no newline). Commit and push.
4. After the next deploy lands, the workflow will fire automatically on Vercel's deployment_status event. No more manual `npm run indexnow` runs.

## What still needs developer attention

The static a11y audit surfaced 22 findings; 11 were already correct (alt text, illustration `aria-hidden`, link/button semantics, charity logo alts). The remaining 11 fall into critical / high / medium tiers.

### Critical (ship in this sprint)

1. **Form labels are not associated with their inputs.** The `Field` component in [app/apply/apply-form.tsx](../../app/apply/apply-form.tsx) renders the label text inside a `<span>` with no `htmlFor` and no `id` on the corresponding input. Screen readers cannot announce field purpose when an input receives focus. Refactor `Field` to use `<label htmlFor={id}>` and require a unique `id` prop.

2. **Thank-you modal is not keyboard-trapped.** [app/apply/apply-form.tsx](../../app/apply/apply-form.tsx) lines 435-563. Has `role="dialog"` and `aria-modal="true"` but Tab key escapes to the hidden background. Escape key does not close it. Add a focus trap with `useEffect`, listen for Escape, restore focus on close.

3. **Honeypot field is not fully hidden from assistive tech.** [app/apply/apply-form.tsx](../../app/apply/apply-form.tsx) around line 576. Wrapper has `aria-hidden` but the inner `<label>` and `<input>` are still exposed. Add `aria-hidden="true"` and `tabIndex={-1}` to the input itself.

### High (next sprint)

4. **Missing `aria-required` on required form fields.** Pass `aria-required={required}` through to the input element inside `Field`.

5. **`MultiSelectDropdown` is missing `aria-controls`.** The button has `aria-haspopup="listbox"` and `aria-expanded`, but no `aria-controls` linking to the listbox by id.

6. **Copy-to-clipboard button has no `aria-live` announcement.** The button text changes from "Share" to "Copied" on success but nothing tells screen reader users the state changed.

### Medium (when time permits)

7. **FAQ `<details>` does not respond to arrow keys.** Native browsers accept Enter/Space to toggle; users sometimes expect arrows too. Optional polish.

8. **Heading hierarchy on `/how-it-works`** has h3 elements (lines 163, 190) followed later by an h2 (line 263). Reorder or wrap so the level only goes deeper, not shallower.

## Mobile QA checklist

I have not visually tested at narrow breakpoints. Run through this checklist at 320, 375, 414, and 768 pixels wide using DevTools device emulation (Chrome `Cmd + Option + I`, then device toolbar `Cmd + Shift + M`):

### Per-page checks

- **/** — Hero illustration scaling; charity rotator marquee animation behaviour; the 3:1 rule split layout collapsing to single column; founder spotlight photo behaviour
- **/how-it-works** — The four-step flow diagram (HowItWorksIllustration) at narrow widths; the founder photo + bio block; the 3-up comparison grid
- **/vendors** — The MoneyBlock big number ("The gift") staying legible; the vendor card grid; the FAQ accordion
- **/giving** — Three-column cause grid collapsing; charity examples marquee
- **/pricing (the page rebuilt today)** — The four tier rows; right-side "$X" amounts; ensure they don't truncate or wrap awkwardly; spot-check the heading "More Good the more you meet" on iPhone SE width (320)
- **/impact** — Metric cards; sample data table
- **/opportunity** — Founder card layout; opportunity grid
- **/faq** — Accordion behaviour; sufficient tap target size
- **/apply** — The long form; ensure no input gets too narrow to read; the share modal at the end

### Cross-page checks

- Site header navigation at narrow widths — does the mobile menu work, are all links reachable?
- Site footer at narrow widths — does the three-column grid collapse cleanly?
- Tap target sizes — every interactive element should be at least 44x44 px (Apple HIG) or 48x48 px (Material). Spot-check FAQ accordion toggles, pill option groups in the apply form, and the share button.
- Hover-only affordances — anything that only reveals on hover (tooltips, dropdown menus) needs an equivalent on touch.

## WCAG AA contrast notes

I did not run a colour-contrast tool but computed approximate luminances from the OKLCH tokens in [globals.css](../../app/globals.css). The numbers below are estimates; verify with a real tool (the Stark Figma plugin, Chrome DevTools "Accessibility" lighthouse audit, or [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)).

| Combination | Approx contrast | WCAG AA 4.5:1 | Notes |
|---|---|---|---|
| `foreground` on `background` | ~12:1 | AAA pass | Body text everywhere, comfortable |
| `primary` (emerald) on `background` (cream) | ~5:1 | AA pass | Used for accent text, links on hover |
| `primary-foreground` (cream) on `primary` (emerald) | ~8:1 | AAA pass | White-on-emerald CTAs |
| **`muted-foreground` on `background`** | **~4.0–4.2:1** | **borderline / fail** | This is the colour of secondary text labels site-wide. Likely fails AA for normal-size text (passes for ≥18px / 14px bold) |
| `muted-foreground` on `card` | same | borderline | Same issue inside cards |

The `muted-foreground` token is `oklch(0.50 0.010 70)`. If the contrast tool confirms a fail, the cheapest fix is to nudge it darker by ~0.05 (to ~0.45 L). That keeps the warm-gray feel but pushes the contrast over 4.5:1.

If the team wants to preserve the current visual exactly, an alternative is to make every existing use of `muted-foreground` apply at large text sizes only, which is impractical site-wide. So: dark-shift the token if the contrast tool fails it.

## Bonus observation

The `/pricing` page's `bigNumber` defaults in the refactored [MoneyBlock primitive](../../app/_components/ui.tsx) ("The gift" / "Real, in full, every time") are not actually used on `/pricing` (the new pricing page does not use MoneyBlock at all). They are now the defaults for [vendors](../../app/vendors/page.tsx) and [how-it-works](../../app/how-it-works/page.tsx) which do use MoneyBlock. Worth eyeballing on those pages at desktop and mobile to confirm the new big-text reads as intended.
