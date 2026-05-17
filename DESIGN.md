# TheBigIntro — Design System

Locked 2026-05-17 (fresh & friendly direction). Mirrored by the live app
in `app/globals.css`. This superseded an earlier crimson/Bricolage
exploration; that history is in the other `mockups/*.html` files.

Maturity pass 2026-05-17 (now locked): distinctive arcs-and-heart logo,
a semantically accurate and mutually distinct icon set (the sparkle /
"magic" motif is retired permanently), soft warm elevation tokens, a
motion-safe scroll reveal, a composed hero vignette in place of
scattered floating icons, real cause-area content in place of the
"LOGO" placeholder strip, and a varied section rhythm (numbered steps,
editorial difference list, airier section headers). The live app is now
the canonical reference; the `mockups/*.html` files are history only.

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
8. Depth comes only from the soft warm elevation tokens (`--sh-1`,
   `--sh-2`). No hard, dark, or coloured drop shadows; no flat 1px-only
   cards now that elevation exists.
9. Motion is opt-in and motion-safe: scroll reveal lives behind
   `prefers-reduced-motion: no-preference` and `@supports
   (animation-timeline: view())`, so reduced-motion users and
   unsupported browsers always see fully visible content. No parallax,
   autoplay, or attention-grabbing motion.
10. No sparkle, starburst, or "magic" motif anywhere (icon, logo, or
    illustration). It is generic and reads as the forbidden MeetMagic
    association.

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
| --sh-1 | Resting elevation (cards, pills, FAQ, chips) | soft warm, ~0.05 alpha |
| --sh-2 | Raised elevation (hover, ledger, founding, hero card) | soft warm, ~0.09 alpha |

Coral leads, mint supports. The `$1,000` and the key hero word are coral.
No green or red is used as a bold block. Sections alternate plain bg, soft
coral and soft mint tints. The footer is a soft mint tint, not dark.

## Logo

Mark is two open arcs facing each other embracing a solid coral heart:
"two sides brought together, giving". It is not a speech bubble and must
not duplicate any content icon. Wordmark is "TheBigIntro" with "Big" in
accessible coral. Mark and wordmark are one lockup with a fixed gap.

## Illustrations

Refined line art: thin consistent stroke, no fills, no cartoon faces, one
small coral or mint accent per icon. Components live in
`app/_components/icons.tsx`. They are deliberately editorial, not childish.

Two non-negotiables for the icon set:

1. Semantically accurate. The glyph must read as the thing it labels
   (a conversation is two speech bubbles, not overlapping circles; a
   qualified request is a document with a check, not an abstract blob).
2. Mutually distinct. No two icons, and no icon and the logo, may be
   near-identical silhouettes.

The dollar glyph is a crisp bar-and-S, never a wobbly hand-drawn mark.
The founding mark is a ribbon medal holding a heart (first cohort +
giving), never a sparkle.

## Components

- Nav: arcs-and-heart logo mark, wordmark with "Big" in coral, one coral
  pill action.
- Hero: two-column grid. Left is chips, the key phrase in coral, lede,
  pill CTA, trust line. Right is one composed "flow card" vignette that
  teaches the model (relevant in, qualified, one conversation, $1,000
  out) on a soft glow. Soft coral and mint blur shapes behind. No
  scattered floating icons. The vignette is hidden below 980px.
- Section headers: a `.sect-head` block (eyebrow, h2, optional lede)
  with deliberate air, used consistently and revealed on scroll.
- Step cards: white rounded elevated cards, icon top-left and a coral
  `01/02/03` step number top-right, hover lift.
- Money section: soft coral tint, large coral `$1,000` with the crisp
  heart-dollar mark, raised ledger card, named admin fee as its own
  line stating it is vendor-paid.
- Charity band: real cause-area pills (health, education, environment,
  community, animal welfare) with small distinct icons and resting
  elevation. Never a "LOGO" placeholder. Real charity logos may replace
  these later but the band must never ship looking unfinished.
- Difference section: an editorial icon-and-text list, not three
  identical mini-cards.
- Founding card: white rounded card, mint glow, ribbon-medal-with-heart
  illustration, raised elevation, generous padding.
- Path cards: executives on soft coral, vendors on soft mint, hover lift.
- Founder panel: espresso, coral avatar, the one dark moment.
- FAQ: bordered rounded elevated accordions, plus icon rotating to a
  cross, raised on open or hover.
- Footer: soft mint tint, light, every page linked.

## Elevation & motion

- Every resting surface (cards, path cards, pills, chips, FAQ rows) sits
  on `--sh-1`. Feature surfaces (ledger, founding card, hero vignette)
  and all hover/open states use `--sh-2`. Buttons carry a soft
  coral/mint-tinted shadow that deepens on hover with a 2px lift.
- Interactive cards lift 3px on hover. Transitions are ~0.18s ease.
- Scroll reveal: a `.reveal` utility (opacity + 24px rise) driven by
  `animation-timeline: view()`, gated by `prefers-reduced-motion:
  no-preference` and `@supports`. It must never be the only thing making
  content visible: unsupported or reduced-motion always shows it fully.

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
