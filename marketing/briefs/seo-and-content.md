# SEO, distribution, and content calendar brief

Owner: marketing / content ops lead
Status: parcel 6 of the multi-team site-quality pass
Last updated: 2026-05-20

## Context

theGoodintro is a validation site, not a content marketing site. Inbound traffic at this stage is modest and intentional. The work in this brief is about (a) making sure every page Google indexes shows the right title, description, and OG card; (b) automating IndexNow so Bing keeps up; (c) starting a content programme that builds the topical authority needed for organic growth from month 3 onward.

## What is already done (no action needed)

1. **OG and Twitter metadata now per-page.** Before this pass, every page inherited the homepage's OG title and description, so social shares of `/pricing`, `/vendors`, etc. all looked identical. Fixed by introducing [lib/metadata.ts](../../lib/metadata.ts) `pageMetadata()` helper and converting all 9 pages to use it. Verified via `curl http://localhost:3000/pricing | grep og:` that `/pricing` now correctly returns `og:title="Pricing. theGoodintro."` and the matching description.

2. **Canonical URLs now set per page** via the same helper. Each page gets `<link rel="canonical" href="https://thegoodintro.com/<path>">`. Prevents duplicate-content penalties if the site ever gets accessed via multiple hostnames or with query strings.

3. **Sitemap was missing `/apply`** — now added. Every public route is now in [app/sitemap.ts](../../app/sitemap.ts): `/`, `/how-it-works`, `/vendors`, `/pricing`, `/giving`, `/faq`, `/impact`, `/opportunity`, `/apply`, `/privacy`, `/terms`.

4. **IndexNow automation** — wired in parcel 5. See the parcel 5 brief at [marketing/briefs/frontend-mobile-a11y.md](frontend-mobile-a11y.md) for the one-time setup steps (key generation, GitHub secret, key file).

5. **Robots.txt** is correct as-is. Allows all crawlers, points to sitemap, declares host. No change needed.

## SEO gaps still open

### Internal linking is thin

A quick grep across page bodies (excluding header/footer nav) found only 13 inline internal links. The header and footer provide the obvious linking but Google partially discounts boilerplate-nav links. Pages with editorial body-copy links to other pages perform better.

Concrete recommendation per page (one or two new contextual body-copy links each):

- **`/`** → already links to `/how-it-works`, `/pricing`, `/how-it-works#about`. Could add a contextual link from the 3:1 rule paragraph to `/vendors` (so executives can see what vendors agree to).
- **`/how-it-works`** → links to `/giving` heavily. Could add a body link to `/pricing` from the "Where the money goes" section.
- **`/vendors`** → currently no inline body links. Could add a "see the full giving terms" link to `/giving` inside the transparent-pricing section.
- **`/pricing`** → no inline body links. Add a contextual link to `/giving` for "how the charity choice works" and to `/how-it-works` for "the meeting flow".
- **`/giving`** → has good links. Add one to `/impact` showing "how this looks once it adds up".
- **`/impact`** → links to `/giving`. Could add one to `/vendors` for "how the gifts get funded".
- **`/faq`** → no inline body links inside answers. Each answer that references another concept (pricing, giving, the 3:1 rule) should link to the relevant page.
- **`/opportunity`** → no inline body links. Could add one to `/how-it-works#about` for the founder section.

This is editorial work — the team can ship one or two new contextual links per page in an afternoon. Low effort, real SEO benefit.

### `/apply` is in the sitemap but probably should not be heavily indexed

The page exists to convert applicants, not to rank for queries. Lighthouse will show its meta as thin (it deliberately has minimal copy above the form). Consider setting `robots: { index: false }` in the apply page's metadata if you want it crawlable for discovery but not ranking. Optional — current setup is acceptable.

### `/privacy` and `/terms` are extremely thin

Their descriptions are one-liners. That is fine for legal pages — Google does not expect rich content on them. No action needed unless a competitive analysis shows other sites doing more here.

## 12-week content calendar

Aim: publish one piece per week, alternating between three buckets. Each piece is 1200-2000 words, written in the existing brand voice (confident concierge, no em dashes, no marketplace, no exclamation marks). Each piece has a primary keyword target, an internal link target, and a clear CTA.

**Three content buckets:**
- **A. Sales/outreach craft** — for CFO/COO readers and the vendors who write to them. Builds topical authority on "executive outreach" and "qualified meetings".
- **B. Giving and impact** — for executives weighing whether this is real. Builds topical authority on "corporate giving Australia", "DGR donations", "ABN-verified charities".
- **C. Founding-stage transparency** — Isobel-voiced posts about the journey, the model, the open questions. Builds trust with both audiences.

### Weekly schedule

| Wk | Bucket | Title (draft) | Primary keyword | Why it ranks | Internal link |
|---|---|---|---|---|---|
| 1 | C | The simplest pricing page we could write, and why it is hard | "transparent SaaS pricing" | Founder-voice, original | /pricing |
| 2 | A | Why a CFO's inbox is full of 247 cold pitches they will never read | "cold outreach senior executives" | Original data + CFO POV | /how-it-works |
| 3 | B | The one Australian regulation every corporate giving programme has to clear (DGR) | "DGR endorsement Australia" | Specific, evergreen, low competition | /giving |
| 4 | C | What I got wrong about how senior leaders agree to meetings | "executive meeting acceptance" | Founder reflection | /how-it-works#about |
| 5 | A | The case against "more meetings". How fewer, better calls outsell the volume game | "qualified meetings vs volume" | Sales leadership audience | /vendors |
| 6 | B | A practical guide to choosing a DGR-endorsed Australian charity for corporate giving | "best Australian charities for corporate giving" | High-intent commercial search | /giving |
| 7 | C | What the first three founding executives told me | "executive-led charity giving" | First real testimonial moment | /impact |
| 8 | A | The 3:1 rule, and what it costs us | "scarcity in B2B sales access" | Original framework | / |
| 9 | B | How tax-deductible giving works for Australian companies in 2026 | "tax-deductible corporate giving Australia 2026" | Time-bound, recurring search | /giving |
| 10 | C | A year of building theGoodintro in the open | "building a startup in public" | High shareability | /opportunity |
| 11 | A | Why "book a 15-min call" is dead, and what replaced it | "calendar invites senior leaders" | Sales tactics audience | /vendors |
| 12 | B | The case for paying for impact instead of advertising for it | "impact-led marketing" | CMO/CFO audience | /impact |

### How to ship a post (operational checklist)

1. Draft in a Notion/Google doc with the brand voice rules pinned at the top (no em dashes, no marketplace, no exclamation marks, no Coaching, capital Good in emerald for any "good" appearing in the post).
2. Final review checks: heading hierarchy h1 → h2 → h3, mobile preview, alt text on any images.
3. Drop the markdown into a new `app/blog/[slug]/page.tsx` (route does not exist yet; will need a one-off scaffold from the developer).
4. Add the new route to [app/sitemap.ts](../../app/sitemap.ts) and to the IndexNow `ROUTES` list in [scripts/notify-indexnow.mjs](../../scripts/notify-indexnow.mjs).
5. Add a footer-level label for the new post per the [feedback rule on footer blog labels](../../../.claude/projects/-Users-isobelhardwick/memory/feedback_footer_blog_labels.md) (≤30 chars).
6. Use the deep-resource layout per the [blog post layout rule](../../../.claude/projects/-Users-isobelhardwick/memory/feedback_blog_post_layout.md): ProgressBar, ScrollSpyNav, AuthorBio, TOC, anchored sections, no banner.
7. Wire one body-copy internal link to the post's primary target page (see "Internal link" column above).
8. Push. Vercel deploys. The IndexNow workflow fires automatically.

## Distribution beyond search

Once a post is up, the cheapest distribution channels are:

- **LinkedIn long-form** — copy 60% of the post into a LinkedIn article under Isobel's profile, link to the full piece. Reuses copy and pulls audience back to the site.
- **The QuotaClub LinkedIn page** (see [reference_linkedin.md](../../../.claude/projects/-Users-isobelhardwick/memory/reference_linkedin.md)) — repost relevant Bucket A pieces here too, since QuotaClub's audience is sales people.
- **Founder email list** — start collecting opt-ins on `/apply` thank-you modal (already has a copy-yourself-the-answers feature; extending that into a newsletter signup is a small addition).
- **No paid distribution until at least week 4** — the content needs to demonstrate it can earn attention organically before money is spent on it.

## Open questions for Isobel

1. **Do you want a `/blog` index page**, or are posts just standalone routes linked from the footer? The deep-resource layout convention from your memory suggests they live as individual pages, which works.
2. **Author attribution**: every post under your name, or is the team eventually contributing? If just you for v1, the AuthorBio block is straightforward.
3. **Which week is the first founding-cohort interview likely to be available?** That determines whether week 7 above ("What the first three founding executives told me") is realistic or needs to slide.
4. **Pricing chats still off the site per your standing rule** — the week 1 post about pricing is meta (about the pricing-page design choices), not about the model's economics. Confirm that distinction holds before drafting.

## Bonus: things I noticed while reading metadata

- **`/pricing` description** still mentions "$1,500 AUD per meeting" and "Up to 80% per meeting at the top tier". This is consistent with the visible page and your "drop the platform cut, not the meeting price" call. Keep.
- **`/faq` description** explicitly targets "executives and CFOs". Good audience-specific signal.
- **`/impact` description** says "No real figures exist yet" — refreshingly honest. The page positioning works.
- **`/opportunity` description** still says "I am looking for one person to build it into a company" — a deeply specific, founder-voiced line that probably outperforms anything more polished. Keep.
