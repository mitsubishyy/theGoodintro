# TheBigIntro — Website Build Plan

Status: planning, agreed 2026-05-17. This document is the source of truth for
the first website. It is a validation marketing site, not the platform.

## 1. Goal of this site

Test real demand on both sides of the marketplace before building any platform:

- Get senior executives to register interest by booking a call.
- Get vendors (sellers) to register interest by booking a call.
- Prove the model resonates: relevant senior meetings that direct a substantial
  donation to a charity the executive chooses.

Success signal: booked calls from credible executives and willing vendors.

## 2. Confirmed decisions

| Area | Decision |
|---|---|
| Site type | Static validation marketing site. No login, no database, no booking engine. |
| Stack | Next.js 16 (App Router), React 19, Tailwind v4, TypeScript, Vercel. Mirrors QuotaClub so it is easy to maintain. |
| Identity | Fresh and distinct from QuotaClub. "Modern and trusted": white, deep navy-ink, one bright accent, geometric grotesk type, strong grid. |
| Lead audience | Homepage speaks to executives first, with a clear secondary path for vendors. |
| Conversion | Two paths, "For executives" and "For vendors", both leading to a call booked via Calendly. |
| Credibility | Founding-member framing. Invite-only first cohort. No invented stats or fake testimonials. |
| Disclosure | Full transparency: $1,000 per meeting to charity, a separate clearly named admin fee, Australia-first. |

## 3. Language rules

- Do not reuse anything from MeetMagic: not the word "magic" in any form, not
  "Magic Circle", not the "MAGIC" acronym, not "Turn Your Expertise Into
  Impact", "Zero Wasted Time", "Meet Better", "Connecting The Business World
  for Good", "turning conversation into contribution", "time well spent",
  "pitch-free".
- No em dashes or en dashes in prose. En dashes only inside numeric ranges.
- Do not invent a forced acronym. The name stays literal: TheBigIntro.

## 4. Site map

Lean, validation appropriate. Every page is wired into the footer.

1. `/` Home (executive-led, with the vendor path clearly offered)
2. `/executives` For executives (deep value, how it works for them, CTA)
3. `/vendors` For vendors (value, qualification expectations, pricing, CTA)
4. `/how-it-works` The full model end to end, including the money flow
5. `/about` Issy and the why, founding-member positioning
6. `/privacy` Privacy policy (lightweight)
7. `/terms` Terms (lightweight)

## 5. Homepage section flow

1. Hero. Headline "Meetings that fund what matters" plus subhead. Primary CTA
   "Apply as a founding executive" to Calendly. Secondary inline link "Are you
   a vendor?".
2. Why this exists. The senior leader's inbox is full of irrelevant pitches.
   What if the few meetings worth taking also did real good.
3. How it works in three steps for executives: you define what is relevant,
   you only receive context-rich qualified requests, you take one focused
   meeting and $1,000 goes to your chosen charity.
4. Where the money goes. Plain transparency block: the full meeting fee to
   charity equals $1,000, the admin fee is charged separately and named,
   Australia-first.
5. What makes this different. Requests must state the specific initiative or
   challenge, the donation is deliberately higher, the model is fully
   transparent. Stated as our position, never by naming a competitor.
6. Founding cohort. Invite-only first group, limited places, you help shape it.
7. Two paths band. "For executives" and "For vendors" cards, each to Calendly.
8. Founder note. Short, from Issy, gives the site a real face.
9. FAQ. Collapsible accordion using native details and summary, a plus icon
   that rotates to a cross on open. Never all expanded at once.
10. Closing CTA and footer with every page linked.

## 6. Per-page intent

- `/executives`: expand the three steps, address the trust question (this is
  not a sales trap), explain charity choice, time commitment, the founding
  cohort offer. One CTA: book a call.
- `/vendors`: who qualifies (socially minded, genuine intent, no hard sell),
  what is expected (state the initiative or challenge up front), full pricing
  transparency including the per-meeting charity figure and the separate admin
  fee, the access they get. One CTA: book a call.
- `/how-it-works`: the end-to-end model for both sides on one page, the money
  flow diagram in words, qualification, charity selection, Australia-first
  scope.
- `/about`: Issy, why she is building this, the founding-member invitation.

## 7. Visual identity (LOCKED 2026-05-17, full spec in DESIGN.md)

Canonical reference: `mockups/the-design-final.html`. Full spec in DESIGN.md.

- Type: Fraunces serif headlines, Inter body, self-hosted via next/font.
- Palette: warm porcelain and espresso neutrals, deep-blue headline text only,
  a soft sage money section with a forest-green figure. Forest green also
  carries buttons, links and accents. No red, orange, pink, purple or yellow.
- The calm base is deliberate. Engagement comes later through content, not a
  loud accent: real charity logos, bespoke illustrations, custom emoji style
  icons. This is a post-launch enhancement pass, not v1 scope.
- Components: Nav, Footer, Hero, Section, StepCards, MoneySection, CharityStrip
  (placeholder for now), PathCards, FoundingPanel, FAQAccordion, FounderNote,
  CallButton.

## 8. Technical approach

- Scaffold the Next.js app at the repo root (README, research/, marketing/
  already exist and stay).
- App Router, TypeScript strict, Tailwind v4, ESLint config mirroring
  QuotaClub.
- SEO: per-page metadata, Open Graph image, sitemap.ts, robots, and the
  IndexNow notify script reused from QuotaClub (activated once the domain is
  set).
- Analytics: Vercel Analytics.
- CallButton: links to a Calendly event. A dedicated TheBigIntro event is
  preferred over reusing the QuotaClub link. See open decisions.
- Deploy: new Vercel project connected to github.com/mitsubishyy/thebigintro,
  custom domain once chosen.
- DESIGN.md committed alongside this plan as the identity source of truth.

## 9. Build sequence

1. Resolve the open decisions in section 10 that block the build.
2. Scaffold Next.js, Tailwind, fonts, base layout, Nav and Footer.
3. Build the design primitives (Section, buttons, typography scale).
4. Build the homepage section by section.
5. Build the four content pages.
6. Add the two legal pages.
7. SEO, analytics, accessibility and responsive passes.
8. Deploy to Vercel, wire the domain, run IndexNow.
9. Review against DESIGN.md quality bar.

## 10. Decisions (resolved 2026-05-17)

1. Domain: thebigintro.com. Build assumes this for metadata and IndexNow.
   Registration to be confirmed by Issy before deploy.
2. Calendly: stubbed for launch. CallButton renders with a placeholder href
   and a visible TODO marker until Issy supplies the real event link.
3. Colour: forest green #2F5E49 as the single working colour, no loud
   accent. Calm sage money section. Locked, full spec in DESIGN.md.
4. Tagline: "Meetings that fund what matters."
5. Charities: copy uses "your chosen registered charity", no named partners
   yet.

Remaining follow-ups, non-blocking:
- Confirm thebigintro.com registration before the Vercel domain step.
- Supply the real Calendly link to replace the stub before public launch.

## 11. Explicitly out of scope for this site

- Accounts, authentication, profiles.
- Meeting requests, booking engine, payments.
- The public per-exec impact dashboard. It remains a v1 platform feature for
  later and is not built or faked here.
