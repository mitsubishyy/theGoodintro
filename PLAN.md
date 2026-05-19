# TheBigIntro — Website Build Plan

Status: business plan agreed 2026-05-17. Design reset 2026-05-18: the
previous visual identity, language rules, design system and homepage
section flow have been wiped so the site can be redesigned from scratch.
The copy from the previous build is preserved in `copy/*.md`. The
strategy, site map and per-page intent below are still the source of
truth. It is a validation marketing site, not the platform.

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
| Lead audience | Homepage speaks to executives first, with a clear secondary path for vendors. |
| Conversion | Homepage commits to the executive; the vendor is routed to a first-class /vendors page. Both sides book a call via Calendly. |
| Credibility | Founding-member framing. Invite-only first cohort. No invented stats or fake testimonials. |
| Disclosure | Full transparency: $1,000 per meeting to charity, a separate clearly named admin fee, Australia-first. |

Visual identity, voice and language rules: open. To be redecided as part of the
design reset.

## 3. Site map

Lean, validation appropriate. Every page is wired into the footer.

1. `/` Home (executive only; vendor routed to /vendors via the hero link and the footer)
2. `/executives` For executives (deep value, how it works for them, CTA)
3. `/vendors` For vendors (value, qualification expectations, pricing, CTA)
4. `/how-it-works` The full model end to end, including the money flow
5. `/about` Issy and the why, founding-member positioning
6. `/opportunity` Co-founder pitch (footer-linked)
7. `/privacy` Privacy policy (lightweight)
8. `/terms` Terms (lightweight)

## 4. Per-page intent

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
- `/opportunity`: honest about the stage, the model, the wedge, who I am
  looking for as a co-founder.

## 5. Technical approach

- App Router, TypeScript strict, Tailwind v4, ESLint config mirroring
  QuotaClub.
- SEO: per-page metadata, Open Graph image, sitemap.ts, robots, and the
  IndexNow notify script reused from QuotaClub (activated once the domain is
  set).
- Analytics: Vercel Analytics.
- CallButton: links to a Calendly event. A dedicated TheBigIntro event is
  preferred over reusing the QuotaClub link.
- Deploy: Vercel project connected to github.com/mitsubishyy/thebigintro,
  custom domain once chosen.

## 6. Build sequence (post-reset)

1. Decide the new visual direction and voice from scratch.
2. Build the design primitives (typography, spacing, colour, components).
3. Rebuild the homepage section by section using the copy in `copy/home.md`.
4. Rebuild the four content pages from their respective copy files.
5. Rebuild the two legal pages.
6. SEO, analytics, accessibility and responsive passes.
7. Deploy to Vercel, wire the domain, run IndexNow.

## 7. Decisions (resolved 2026-05-17)

1. Domain: thebigintro.com. Build assumes this for metadata and IndexNow.
   Registration to be confirmed by Issy before deploy.
2. Calendly: stubbed for launch. CallButton renders with a placeholder href
   and a visible TODO marker until Issy supplies the real event link.
3. Tagline: "Meetings that fund what matters." (carries over from previous
   build; revisit if the redesign suggests a different lead.)
4. Charities: copy uses "your chosen registered charity", no named partners
   yet.

Remaining follow-ups, non-blocking:
- Confirm thebigintro.com registration before the Vercel domain step.
- Supply the real Calendly link to replace the stub before public launch.

## 8. Explicitly out of scope for this site

- Accounts, authentication, profiles.
- Meeting requests, booking engine, payments.
- ~~The public per-exec impact dashboard.~~ Superseded 2026-05-19, see
  section 9.

## 9. Credibility overhaul (2026-05-19)

Goal: make the site credible enough that scaled executive outreach (paused
pending a custom-domain sender) lands when it resumes. Decisions made:

1. **DGR, not ACNC.** The charity choice is restricted to deductible gift
   recipient (DGR) endorsed Australian charities, spelled out on first use.
   This supersedes decision 7.4 ("your chosen registered charity"). Reason:
   only DGR endorsement guarantees the vendor a tax-deductible receipt; it is
   a stronger, verifiable claim for a finance audience. ACNC is retained only
   as the name of the public verification register, not the eligibility bar.
2. **The 3:1 rule.** Confirmed meaning: at least three executives per vendor
   seat, deliberately, so executives are not flooded and vendors are not in a
   bidding war. Presented on `/executives` (inbox protection), `/vendors`
   (genuine access), `/how-it-works`, and `/pricing`.
3. **New pages**, each with its own cream variant, wired into footer and
   sitemap: `/pricing` (`--cream-8`), `/charities` (`--cream-9`), `/impact`
   (`--cream-10`). Nav adds Pricing only; Charities and Impact are footer plus
   contextual links to keep the nav lean for a conservative audience.
4. **Pricing disclosure.** Executives free. Vendors pay the $1,000 gift
   (100% to charity) plus a separate, clearly named platform fee. The annual
   membership figure is deliberately not published while in validation; the
   site shows only "+ platform fee" and quotes it on the call.
5. **Impact dashboard, honestly.** Built at `/impact` as an explicitly
   labelled sample preview, with a truthful "live total is $0" status. It is
   not faked: no real figures are presented as real. This is the v1 feature
   brought forward in preview form, replacing the section 8 exclusion.
6. **Honest placeholders.** Fabricated "Sarah Chen" testimonial replaced with
   an unnamed preview card. ABN placeholder replaced with "Registration in
   progress". Homepage Unsplash stock replaced with an on-brand panel; founder
   and giving photos load from `public/founder.jpg` / `public/giving.jpg`
   when supplied, with graceful fallbacks until then.
7. **Graphics.** Homepage hero plus the how-it-works and opportunity
   illustrations redesigned for sharper craft within the locked style. New
   `PricingIllustration`. New reusable `LogoMarquee` (rightward, reduced-motion
   safe) and `MetricCard` primitive.

Remaining real-world inputs (non-blocking, sensible placeholders in place):
real booking link, real ABN, founder photo, confirmation of the DGR example
charity set.
