# Photo and content production brief

Owner: photographer / content producer
Status: draft
Last updated: 2026-05-20

## Context

The site exists to validate demand from senior executives and SaaS vendors. The current public site has one founder portrait (`/public/issy.jpg`), four pages with text-only heroes that look bare, no real testimonials yet, and placeholder text where charity partner logos belong. The audience is a 50-year-old listed-company CFO or COO. Premium, confident, not cute.

The brand reference is Employment Hero's structure at AlphaSights' craft level. Warm cream backgrounds, deep emerald accent, restrained editorial composition. No mascots, no startup gradients, no stock photo cliches.

## 1. Founder photo shoot

We need a proper shoot of Isobel. The existing `/public/issy.jpg` is decent and currently does the work of two pages, but the site reads as photo-sparse and the same shot is reused. The shoot should produce a small library.

### Shot list

Each entry below is one deliverable, retouched and exported as both a 2:3 portrait and a 16:9 landscape where the framing allows.

1. **Editorial headshot, eyes to camera.** Neutral cream or off-white backdrop. Used on /about-style sections and any future press page.
2. **Working portrait, three-quarter frame.** Laptop open, soft natural light from a window, looking off-camera. Used for the homepage founder teaser and any "from the founder" callout.
3. **Environmental wide, in a real space.** Cafe table, coworking space, home office. Senior professional setting, not bedroom. Used as a hero option for /pricing or /impact.
4. **Standing portrait, full body.** Plain background, confident stance. Used for the apply page and for partner-deck slides.
5. **Detail shot, hands or laptop.** Used as an inline editorial moment beside long copy, never as a hero on its own.
6. **Two candid action shots.** Listening, taking notes, in conversation. Used as illustrative imagery on /how-it-works.

### Technical specs

- Minimum 3000px on the long edge, raw retained
- Export web versions at 1600px and 2400px long edge as `.webp` first, `.jpg` fallback
- Filenames: `founder-headshot.webp`, `founder-working-01.webp`, `founder-environmental-01.webp`, etc.
- Drop into `/public/founder/` once delivered. The site currently expects `/public/founder.jpg` for the how-it-works page. Replace that file with the new editorial headshot when ready.

### What NOT to shoot

- Bali backgrounds, even if Isobel is there for the shoot. Bali imagery is reserved for personal channels, never the site. See [feedback_no_about_images_on_instagram.md](../../) for the related rule.
- Phone selfies. Even a good one will undermine the premium positioning.
- Anything that reads as lifestyle blogger, wellness coach, or startup founder cliche.

## 2. Real testimonial capture

[app/page.tsx:244-306](../../app/page.tsx#L244) currently renders a "Founding member spotlight" placeholder with dashed borders and aria-hidden bars. It is a visible reminder that we have no real social proof yet.

### Process

1. Identify three founding-cohort executives who have taken at least one meeting and would speak to the experience.
2. Run a 20-minute recorded interview. Suggested questions:
   - What made you say yes to the first meeting.
   - What was different from cold outreach in your inbox.
   - What did your charity do with the gift.
   - Would you recommend this to a peer, and why.
3. Get explicit written permission to use their name, title, company, and quote on the public site. A short email exchange is sufficient.
4. Deliver one pulled quote of 40-80 words plus name, title, company, and (optionally) a headshot.

### Where it goes

- Homepage placeholder block at [app/page.tsx:244-306](../../app/page.tsx#L244)
- A second pulled quote on /vendors as social proof from the executive side
- Eventually a /stories page (out of scope for now)

## 3. Hero illustrations for the four bare pages

The pages /giving, /impact, /pricing, /faq currently render text-only heroes with no illustration prop on the shared `PageHero` component. The pages that have illustrations (/, /vendors, /how-it-works, /opportunity) look meaningfully more finished.

The illustration style is defined in [app/_components/illustrations.tsx](../../app/_components/illustrations.tsx). Inline SVG, multi-colour, geometric compositions using the `--ill-*` palette. Cards, coins, envelopes, stamps, badges. Slight isometric depth. No human figures.

### Briefs per page

| Page | Concept | Notes |
|---|---|---|
| `/giving` | A donation moment. Hands releasing a coin into a marked envelope, or a stylised charity tile with the charity-gift mark. Emerald and tan dominant. | The page already has a "kinds of causes" grid further down; the illustration should set up the "real giving" claim, not duplicate the icon grid. |
| `/impact` | A milestone or proof composition. Stacked badges, a ledger entry, or a chart. Reads as evidence, not aspiration. | Sober and quiet. This is the page where a sceptical CFO checks our claims. |
| `/pricing` | **Intentionally left text-only.** The current centred pricing hero is a deliberate design choice and should not be touched. | Skip. |
| `/faq` | A question mark composed from a coin and an envelope, or a stack of small cards with a single highlighted one. | Lowest priority of the three. |

### Acceptance criteria

- Inline SVG, no PNG hero images
- viewBox `0 0 520 420` to match the existing components
- Uses `--ill-*` CSS variables only, no hex
- Composition reads at 480px wide and remains legible at 240px wide
- Added as new exports in [app/_components/illustrations.tsx](../../app/_components/illustrations.tsx) and wired into each page via the `illustration` prop on `PageHero`

## 4. Charity partner imagery and logos

[CLAUDE.md](../../CLAUDE.md) flags the homepage charity strip as text-only placeholders (Beyond Blue, OzHarvest, RFDS, Pet Rescue, Smith Family, Black Dog Institute, etc.). Once the first three or four partnerships are confirmed:

1. Source the official SVG logo from each charity's brand kit (most DGR-endorsed charities publish one).
2. Optimise to under 5kb each, single colour where possible.
3. Drop into `/public/charities/` and update the `LogoMarquee` to render them in place of the text labels.
4. Where a partnership is not yet confirmed, leave text in place rather than render an unauthorised logo.

## 5. ABN and ACNC verification badges

Hero on multiple pages currently shows placeholder text where ABN and ACNC verification badges would sit. Once theGoodintro Pty Ltd is incorporated and registered:

1. Generate or design a small badge for each ("ABN verified", "ACNC registered") in the emerald palette.
2. Link each badge to the public register entry so the claim can be checked in two clicks.

## 6. Order of priority

If the team can ship one item per week, this is the order:

1. Real founder shoot (week 1, highest impact, unblocks 4 site moments at once)
2. First real testimonial captured and approved (week 2)
3. /giving and /impact hero illustrations (week 3, design-shaped work)
4. Charity logos for confirmed partners (rolling, as partnerships close)
5. /faq illustration (week 4, lowest priority)
6. Verification badges (when legal entity is registered)
