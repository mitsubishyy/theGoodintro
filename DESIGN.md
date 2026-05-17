# TheBigIntro — Design System

Locked 2026-05-17 (fresh & friendly direction). Canonical reference:
`mockups/the-design-fresh.html`, mirrored by the live app in
`app/globals.css`. This superseded an earlier crimson/Bricolage
exploration; that history is in the other `mockups/*.html` files.

## The direction

Light, airy and optimistic. It should feel like a good thing, friendly
but credible, with generous white space doing most of the work and colour
used sparingly. Custom refined line illustrations carry meaning.

## Hard rules (do not break)

1. Light and warm. No dark page or section backgrounds. The single
   deliberate exception is the "From the founder" panel, which is espresso
   (`#211C1A`) for a personal moment.
2. Never blue or yellow as a background. Deep ink (`#1F2638`) is text only.
3. Two soft fun colours only: coral and mint, used subtly (small accents,
   gentle section tints, illustration strokes), never loud blocks.
4. No purple. No second loud bold colour.
5. Nothing may resemble QuotaClub or reuse any MeetMagic or Employment Hero
   language, slogan, acronym, or illustration style.
6. No em dashes or en dashes in prose. En dashes only in numeric ranges.
7. No timer, countdown, or time-pressure language anywhere in copy.

## Type

- Display and headings: Plus Jakarta Sans, weights 600 to 800.
- Body and UI: Inter.
- Self-hosted via next/font (no runtime font network calls).

## Colour

| Token | Use | Value |
|---|---|---|
| bg | Page background | #FCFBF8 |
| surface | Cards | #FFFFFF |
| ink | Headline and key text | #1F2638 |
| body | Body text | #5C6170 |
| coral | Primary accent (buttons, links, key word) | #F2897B |
| coral-d | Accessible coral for text and buttons | #DD6450 |
| mint | Secondary accent | #4FB493 |
| mint-d | Accessible mint for text and buttons | #2F9676 |
| tint-coral | Gentle section wash | #FDF0EC |
| tint-mint | Gentle section wash and footer | #ECF6F1 |
| line | Hairlines and card borders | #ECE6DE |
| espresso | The single dark moment: founder panel | #211C1A |

Coral leads, mint supports. The `$1,000` and the key hero word are coral.
No green or red is used as a bold block. Sections alternate plain bg, soft
coral and soft mint tints. The footer is a soft mint tint, not dark.

## Illustrations

Refined line art: thin consistent stroke, no fills, no cartoon faces, one
small coral or mint accent per icon. Components live in
`app/_components/icons.tsx`. They are deliberately editorial, not childish.

## Components

- Nav: refined line logo mark, wordmark with "Big" in coral, one coral
  pill action.
- Hero: soft coral and mint blur shapes, refined floating illustrations,
  pill chips, the key phrase in coral, pill CTA.
- Step and value cards: white rounded cards with a line illustration.
- Money section: soft coral tint, large coral `$1,000` with the heart mark,
  transparent breakdown with the named admin fee as its own line.
- Charity strip: rounded placeholder pills now, real logos later.
- Founding card: white rounded card, mint glow, sparkle illustration.
- Path cards: executives on soft coral, vendors on soft mint.
- Founder panel: espresso, coral avatar, the one dark moment.
- FAQ: bordered rounded accordions, plus icon rotating to a cross.
- Footer: soft mint tint, light, every page linked.

## Voice

Executive-led. Charity and meaningful conversation are the spine. Keep the
word "qualified". Warm, plain, honest. No urgency tactics.

## Engagement roadmap (later)

Real charity logos and more bespoke illustrations replace placeholders.
These sit on this palette and rules and add warmth, not a loud accent.

## Accessibility

WCAG AA contrast on text and controls. Visible coral focus rings. Real
semantic accordions and buttons. Respect prefers-reduced-motion.

## Quality bar

Done when: a busy executive understands the model in one read, there is
one obvious action per view, nothing invented is presented as fact, it is
fully responsive, it passes AA contrast, it is light and warm with no
stray dark or blue or yellow surfaces, and it does not resemble QuotaClub,
MeetMagic or Employment Hero.
