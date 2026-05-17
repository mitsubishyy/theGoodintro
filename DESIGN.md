# TheBigIntro — Design System

Locked 2026-05-17. Canonical reference: `mockups/the-design-final.html`,
matched 1:1 by the live Next.js site. Crimson is the single bold colour on a
warm porcelain base, bold expressive Bricolage Grotesque headlines, a whisper
cream-yellow soft wash on the money section only, and dark espresso Why and
Founder sections. Future content (charity logos, bespoke illustrations, custom
emoji) adds more warmth without clashing.

## Hard rules (do not break)

1. Blue is for headline and title text only. No surface, hero, panel, footer
   or section background is ever blue. See memory feedback note.
2. Backgrounds are warm but never yellow. The only yellow is the whisper
   cream-yellow soft wash on the money section.
3. Nothing may resemble QuotaClub (warm terracotta editorial) or reuse any
   MeetMagic language, slogan, acronym, or the word "magic".
4. No em dashes or en dashes in prose. En dashes only in numeric ranges.
5. Crimson is the one and only bold colour. There is no second bold. No green,
   purple, orange, or yellow as a brand colour.

## Type

- Headlines: Bricolage Grotesque, weights 700 to 800, set large and
  confident. This is the brand's main expressive device.
- Body and UI: Inter, 400 to 700.
- Production: self hosted with next/font (no external font network calls).
- Scale (desktop, rem): h1 clamp to 5.4, h2 to 3.3, h3 1.45, body 1.0625,
  lede 1.24, eyebrow 0.78 uppercase tracked.

## Colour

| Token | Use | Value |
|---|---|---|
| paper | Page background | #F4F2EE |
| card | Cards | #FCF8F5 |
| ink | Headline text only (the deep blue) | #16243B |
| body | Body text | #46434A |
| wash | Money section soft wash (whisper cream-yellow) | #F1ECDC |
| crimson | The single bold: signature, actions, the `$1,000` | #E0263F |
| crimson-d | Buttons, links, logo accent, hover-to | #BC1733 |
| espresso | Why, Founder, vendor card, footer, founding panel | #211C1A |
| line | Hairlines and dividers | #E7DBD3 |

Crimson is the only bold working colour. It carries the brand, actions, links,
the hero underline and the large `$1,000` figure, and reads charitable and
confident without being terracotta. The money section sits on a whisper
cream-yellow wash, soft enough that crimson stays the only thing that pops.
Deep blue is headline text only. No green, orange, pink, purple or strong
yellow anywhere. Bold where it counts, calm everywhere else.

## Layout

- Max content width 1160px, 32px gutters, generous vertical rhythm.
- Light paper sections with one soft-washed money band. The "Why this exists"
  and "From the founder" sections are dark espresso with light text and a
  light-crimson eyebrow, bookending the espresso founding panel.
- Mobile first, single column under 860px, touch targets at least 44px.

## Components

- Nav: Bricolage wordmark "TheBigIntro" with the middle word in crimson, one
  crimson pill action button.
- Hero: soft crimson blob, pill chips, a big Bricolage headline with the text
  one colour (deep blue) and a hand-drawn crimson underline on the key phrase.
- Step cards: card surface, oversized crimson Bricolage numeral.
- Money section: whisper cream-yellow wash, deep-blue heading, a very large
  crimson `$1,000`, transparent breakdown with the named admin fee as a
  separate line.
- Charity strip: dashed placeholder pills now, real logos later.
- Founding panel: espresso, soft crimson glow, crimson button, honest scarcity.
- Path cards: executives on crimson, vendors on espresso (no second bold).
- FAQ: native details and summary, plus icon rotating to a cross, only one
  concern open at a time.
- Footer: espresso, every page linked.

## Engagement roadmap (later, not v1 launch)

The base is intentionally restrained. Warmth and personality arrive through
content:

1. Real charity logos in the charity strip.
2. Bespoke illustrations and custom emoji style icons (to be designed) for the
   steps, the differentiators and the founding panel.
3. Possible subtle motion on the hero underline and section reveals.

These must sit on the locked palette and rules above. They add warmth, they do
not introduce a second bold colour or break any hard rule.

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
