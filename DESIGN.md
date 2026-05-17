# TheBigIntro — Design System

Locked 2026-05-17. Canonical reference: `mockups/the-design-final.html`.
Crimson is the signature colour, on a calm warm porcelain base, with a
soft sage money section and the `$1,000` figure in forest green so green
quietly means money. Future content (charity logos, bespoke illustrations,
custom emoji) adds more warmth without clashing.

## Hard rules (do not break)

1. Blue is for headline and title text only. No surface, hero, panel, footer
   or section background is ever blue. See memory feedback note.
2. Backgrounds are warm but never yellow.
3. Nothing may resemble QuotaClub (warm terracotta editorial) or reuse any
   MeetMagic language, slogan, acronym, or the word "magic".
4. No em dashes or en dashes in prose. En dashes only in numeric ranges.
5. The signature colour is crimson. No purple, pink, orange or yellow as a
   brand colour. Forest green is reserved strictly for the `$1,000` figure.

## Type

- Headlines: Fraunces (warm contemporary serif), weights 500 to 650, optical
  sizing. Tight letter spacing, large and confident.
- Body and UI: Inter, 400 to 700.
- Production: self host both with next/font. No external font network calls.
- Scale (desktop, rem): h1 clamp to 4.7, h2 to 2.8, h3 1.3, body 1.0625,
  lede 1.2, eyebrow 0.74 uppercase tracked.

## Colour

| Token | Use | Value |
|---|---|---|
| paper | Page background | #F7F1ED |
| paper-alt | Section banding | #EFE7DF |
| card | Cards | #FCF8F5 |
| ink | Headline text only (the deep blue) | #16243B |
| body | Body text | #46434A |
| sage | The money section background | #DCE4DD |
| forest | The `$1,000` figure only | #2F5E49 |
| crimson | Signature: hero mark, accents, top bar | #D7263D |
| crimson-d | Buttons, links, logo accent, hover-from | #B81D30 |
| espresso | Founding panel, vendor card, footer | #221E1C |
| line | Hairlines and dividers | #E7DBD3 |

Crimson is the signature working colour. It carries the brand, actions and
links, and reads charitable and confident without being terracotta. Forest
green appears only on the `$1,000` figure, so green still means "money and
impact" but quietly. Deep blue is headline text only. No orange, pink, purple
or yellow anywhere. Bold where it counts, calm everywhere else.

## Layout

- Max content width 1140px, 32px gutters, generous vertical rhythm.
- Alternating paper and paper-alt bands. The money section is the only
  coloured band (soft sage). The "Why this exists" and "From the founder"
  sections are dark espresso with light text and a light-crimson eyebrow,
  bookending the founding panel.
- Mobile first, single column under 860px, touch targets at least 44px.

## Components

- Nav: serif wordmark "TheBigIntro" with the middle word in crimson, one
  crimson action button.
- Hero: serif headline with a hand-drawn crimson underline on the key phrase.
- Step cards: card surface, crimson top rule, oversized serif numeral.
- Money section: soft sage background, deep-blue heading, large forest-green
  `$1,000`, transparent breakdown with the named admin fee as a separate line.
- Charity strip: greyscale placeholder now, real logos later.
- Founding panel: espresso, crimson button, honest scarcity.
- Path cards: executives on crimson, vendors on espresso.
- FAQ: native details and summary, plus icon rotating to a cross, only one
  concern open at a time.
- Footer: espresso, every page linked.

## Engagement roadmap (later, not v1 launch)

The calm base is intentional. Warmth and personality arrive through content:

1. Real charity logos in the charity strip.
2. Bespoke illustrations and custom emoji style icons (to be designed) for the
   steps, the differentiators and the founding panel.
3. Possible subtle motion on the hero underline and section reveals.

These must sit on the locked palette and rules above. They add warmth, they do
not change the crimson signature or break any hard rule.

## Accessibility

- WCAG AA contrast minimum on text and controls.
- Visible keyboard focus styles in crimson.
- Real semantic elements for accordions and buttons.
- Respect prefers-reduced-motion.

## Quality bar

Done when: a busy executive understands the model in one read, there is one
obvious action per view, nothing invented is presented as fact, it is fully
responsive, it passes AA contrast, it contains zero blue backgrounds, and it
does not resemble QuotaClub or reuse any MeetMagic language.
