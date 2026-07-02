# Charity partnership deck — BLUEPRINT (replicate per charity)

> ## READ FIRST — how to replicate the deck (do NOT re-prompt from scratch)
>
> The deck is now a **controlled HTML file** (`sales/childrens-ground-deck.html`)
> so the fonts and layout are locked and never drift. Re-generating a fresh deck
> from a written prompt in Claude Design drifted every time (font, sizes,
> hierarchy, which word is emerald) because two tools render fonts differently.
> DO NOT do that. Instead, for a new charity:
>
> 1. **Duplicate `sales/childrens-ground-deck.html`** to
>    `sales/<charity>-deck.html`.
> 2. Swap only: charity **name** (every mention), charity **logo** file (every
>    `<img>`), the **slide-4 photo** (the charity's own programme photo), the
>    **slide-4 category + mission line**, and the **slide-5 URL**. Nothing else
>    moves.
> 3. Open it in a browser; export to PDF via the browser print dialog (the print
>    CSS lays out one slide per landscape page).
>
> The RSPCA PDF that was sent and the live RSPCA mini-site
> (https://thegoodintro-rspca.vercel.app) remain the visual reference. The HTML
> deck encodes the exact fonts (see "Fonts" below).
>
> ### Exact cover hierarchy (the part that keeps regressing)
> Top to bottom, left-aligned: eyebrow `CHARITY PARTNERSHIP` (mono, emerald dot)
> -> the "G" mark -> **the "TheGoodIntro" wordmark as the HERO: the single
> largest element on the slide, Fraunces serif ~120px, on its own line** ("The"
> and "Intro" ink, "Good" emerald) -> **then** the tagline "The introduction that
> *gives* back." at roughly HALF the wordmark size (Inter ~50px), only "gives" in
> Fraunces italic emerald -> "Prepared for [LOGO]" -> hairline -> footer line.
> The first emerald word the eye lands on must be **"Good" in the big wordmark**,
> not "gives". Do not make the tagline the headline; do not shrink the wordmark
> into a lockup beside the logo.

The RSPCA deck is the master. To make a new charity's deck, **only three things
change** (everything else stays word-for-word identical):

1. **Charity name & logo** — swapped everywhere it appears.
2. **Slide 4 image** — the website card mockup, rebuilt with the new charity.
3. **Mini-site** — a new isolated Vercel demo from `demo-sites/charity-demo`,
   and slide 5's URL updated to it.

Companion assets:
- Mini-site blueprint + how-to: `demo-sites/charity-demo/DEMO_README.md`
- Slide design system (fonts/colours/chassis): `sales/charity-deck-prompt.md`
- The "math" slide variant: `sales/charity-deck-math-slide-prompt.md`

---

## Per-charity variables (the ONLY things to change)

| Variable | Where it appears |
|---|---|
| `[CHARITY]` name | Slide 2 ("I have chosen [CHARITY]…"), 4 (title + card), 5 ("showcase [CHARITY]"), 6 ("[CHARITY]'s name and logo"), slide-4 card |
| `[CHARITY LOGO]` | Cover "Prepared for", top-right of slides 2,3,4,5,6,8,9, and the slide-4 card |
| `[CATEGORY]` tag + one-line mission | Slide-4 card only (from the charity's tagline + about line) |
| Slide-4 photo | The card mockup image |
| Mini-site URL | Slide 5 link |

Everything below (Issy bio, all money figures, the model, the ask, transparency,
next step) is **fixed** across every charity.

---

## Final deck copy (9 slides)

Design: warm paper `#F1ECDF/#F6F3EA`, ink `#1E1B17`, emerald `#157852`. No em/en
dashes. Charity logo top-right on every slide except the cover (where it's
"Prepared for") and slide 7 (founder photo).

### Fonts (EXACT — locked, do not approximate)
- **Eyebrows / small meta labels:** Courier New, ~size 7 in Slides (~18px at
  1920x1080), uppercase, letter-spaced, **dark grey ~`#666666`**.
- **Wordmark "TheGoodIntro":** Fraunces, **Normal** weight. "The" and "Intro" in
  ink; the green **"Good" is Fraunces *italic* + emerald**.
- **Every headline, tagline, and body line:** Inter **Bold**.
- **Green emphasis word per title** (gives, home, you, share, bigger, behind,
  and inline "Good"): **Fraunces *italic* emerald**. Rule of thumb: green text is
  italic Fraunces — EXCEPT the big dollar number.
- **Big "$900 to $1,200" number:** Inter **Bold**, emerald (NOT italic).
- Reference build that encodes all of this: `sales/childrens-ground-deck.html`
  (the controlled HTML deck — duplicate it per charity instead of re-prompting).

**Slide 1 — Cover.** Eyebrow `CHARITY PARTNERSHIP`. Green "G" mark + TheGoodIntro
wordmark. Title: "The introduction that *gives* back." Then "Prepared for
[CHARITY LOGO]". Footer: "Issy Hardwick, Founder, TheGoodIntro · JUNE 2026".

**Slide 2 — What do we do?** Eyebrow `WHAT DO WE DO?`. Big: "TheGoodIntro is an
invite-only network where senior executives take a meeting with SaaS vendors.
After every meeting, I'll donate a real *gift* to a charity the executive
chooses." Emerald rule. Sub: "I have chosen [CHARITY] to be one of the charities
available to choose from." ([CHARITY] coloured to stand out.)

**Slide 3 — What this means for you.** Eyebrow `WHAT THIS MEANS FOR YOU`. Title:
"Every booked meeting can earn *you*". Big number "$900 to $1,200" / caption "to
the chosen charity, per meeting". Body: "$900 to $1,200 goes straight to the
executive's chosen charity. Which is up to 80% of my revenue per meeting." Note:
"Once the meeting has been sat, TheGoodIntro will donate the money within 30 days."

**Slide 4 — On our website.** Eyebrow `ON OUR WEBSITE`. Title: "I want to give
[CHARITY] a real *home* on our site." Left bullets: "A dedicated card in our
giving gallery." / "Your mission, in your own words." / "Photos of your work." /
"Donation button". Right: **the card mockup image** (photo + a charity-partner
card: `CHARITY PARTNER` eyebrow, [CHARITY LOGO], [CATEGORY] tag, charity name,
one-line mission, "Every booked meeting sends a real *gift* of $900 to $1,200 to
[CHARITY].", "Choose [CHARITY] →" button, TheGoodIntro mark).

**Slide 5 — Your page.** Eyebrow `YOUR PAGE`. Title: "A page built *for* you."
Sub: "I've built a draft website of what I would like to do and how to showcase
[CHARITY]." Big link: the mini-site profile URL
(`https://thegoodintro-[charity].vercel.app/charities/[slug]`).

**Slide 6 — The ask.** Eyebrow `THE ASK`. Title: "What I'm asking from *you*."
1. "Permission to use [CHARITY]'s name and logo on our website & platform."
2. "A short description of your work & the *Good* you do (or permission to use
   what is already public on your site)."
3. "A few photographs we can feature, or permission to use images from your
   public materials."
Close: "That is all. No cost, no exclusivity, no commitment on your side."

**Slide 7 — Who am I?** Eyebrow `WHO AM I?`. Founder photo (left). Title: "The
person *behind* it all." Body: "My name is Isobel Hardwick, I'm building this
business to create my own freedom, use my current skills in business development
and give back to the community I grew up in. Melbourne raised but currently
living abroad in Bali doing airbnb's with my fiance." Emerald rule. Pull-quote:
"I've spent 4 years getting senior leaders to the table. Now I'm using that same
skill to turn those meetings into donations for charities like yours." Contact:
"LinkedIn | +61 414 442 687 | Issy@thegoodintros.com".

**Slide 8 — Full transparency.** Eyebrow `FULL TRANSPARENCY`. Title: "We are a
for-profit company, and we are proud of how we *share* it." Body 1: "TheGoodIntro
is not a charity and not a fundraiser. We are a commercial business that earns a
fee for each meeting. I choose to give the majority of that fee away. Up to 80%
goes to the charity the executive chose." Body 2: "I am in the early stages of
building this out but I plan to have thousands of users on my platform and
managing 20-30 meetings per month." Body 3: "I am aiming to have 9 charities
total to choose from."

**Slide 9 — Next step.** Eyebrow `NEXT STEP`. Title: "Let's give your cause a
*bigger* table." Sub: "If this sounds right, reply and we'll send a one-page
agreement and publish your page!" Footer: TheGoodIntro wordmark + "Issy Hardwick,
Founder · hello@thegoodintro.com".

> Typos cleaned from the RSPCA send (fix in the master too): "I'm choose" -> "I
> choose"; "senior leaders to table" -> "to the table"; "3 dedicated card" ->
> "A dedicated card"; "fiancee" -> "fiance" (or keep, your call).

---

## Replication checklist (do these 3 things)

### 1. Deck (Claude Design)
**Duplicate the RSPCA deck** (see READ FIRST above) and swap only the charity
name, logo, slide-4 card photo, slide-4 category/mission, and slide-5 URL. Do
not regenerate from a prose prompt — it drifts the sizing and emerald emphasis.

### 2. Slide-4 card image
Rebuild the website card mockup for the new charity. Reference implementation:
`sales/childrens-ground-slide4-card.html` (copy its structure exactly).

Quality rules (these are what "match RSPCA" means):
- The artifact is **ONLY the card unit** (a photo panel + partner card as one
  rounded white card with a soft shadow), NOT a whole slide. No `ON OUR WEBSITE`
  eyebrow, no "G" mark, no top-right logo — those are native Slides text on the
  left half of slide 4. The card drops onto the right half.
- Card content, top to bottom: a `CHARITY PARTNER` mono eyebrow (emerald dot) on
  the left with the **small** charity logo (height ~56px) on the right of the
  same row; a `[CATEGORY]` pill; the charity name (~50px, Inter 600); the
  one-line mission; a divider then "Every booked meeting sends a real *gift* of
  **$900 to $1,200** to [CHARITY]." ("gift" italic emerald, amount bold emerald);
  a footer row with a "Choose [CHARITY] →" emerald pill (left) and the
  TheGoodIntro mark (right).
- Photo panel (left ~45%): a real charity photo when available. If none, use a
  **tasteful brand panel** (a soft gradient + the logo as a faint white
  watermark + a small mono label bottom-left), never a striped/dev "placeholder"
  box. For charities working with vulnerable people (e.g. First Nations
  communities), do not drop in generic stock; use a brand panel until a real
  image is supplied.

### 3. Mini-site (Claude Code, from `demo-sites/charity-demo`)
1. `cp -R demo-sites/charity-demo demo-sites/<charity>-demo`
2. Edit `lib/demo.ts`: `HIGHLIGHT_SLUG` + `HIGHLIGHT_NAME` (must match the entry
   in `lib/charities.ts` and the name in the home marquee list).
3. **If the charity is not already in the home gallery list**
   (`app/_components/home/charity-gallery-section.tsx`), add an entry for it, or
   the bottom band has nothing to highlight. (RSPCA was in it; many are not.)
4. Deploy as its own project:
   `vercel link --yes --project thegoodintro-<charity>` then
   `vercel deploy --prod --yes`.
5. Put the new profile URL on slide 5.
