# TheBigIntro — Design System

Locked 2026-05-18 (Warm Manifesto / Philanthropic Forest). Mirrored by
the live app in `app/globals.css` and `mockups/leap-manifesto-v2.html`
(the live app is scaled up ~12% from that mockup and is the canonical
reference). This superseded the earlier "fresh & friendly" coral + mint
direction, which read too close to the QuotaClub palette; that history,
and an earlier crimson/Bricolage exploration, live in `mockups/*.html`.

The leap (2026-05-18): a deliberate break from QuotaClub. New colour
identity (deep forest as the single brand colour on a bone canvas, with
clay as a rare micro-accent), Fraunces display type, an emotional
letter/manifesto layout with soft organic forest/clay shapes, large
numbered narrative beats, a $1,000 centrepiece, the founder voice on the
one dark moment (now deep forest, not espresso brown), and a plain
wordmark logo. The sparkle / "magic" motif remains retired permanently.

## The direction

Warm, human and credible. It reads like a heartfelt letter from a
founder who means it, not a SaaS feature grid. Generous space, soft
organic shapes as compositional anchors, an editorial serif voice, and
one confident brand colour doing the work. Senior and trustworthy, never
twee or cartoonish.

## Hard rules (do not break)

1. Light and warm. No dark page or section backgrounds. The single
   deliberate exception is the "From the founder" panel, which is deep
   forest (`#15281E`) for a personal moment.
2. Never blue or yellow as a background. Deep forest ink (`#15211B`) is
   text only. Must not resemble the QuotaClub palette (warm cream +
   terracotta + sage): the canvas is a neutral bone, never warm cream.
3. One brand colour only: deep forest (`#1F5D45`). Clay (`#C9603A`) is a
   rare micro-accent, never a button, block, or large surface. Soft
   forest/clay shape tints are low opacity, never loud blocks.
4. No purple. No second bold colour. Forest leads, nothing competes.
5. Nothing may resemble QuotaClub or reuse any MeetMagic or Employment Hero
   language, slogan, acronym, or illustration style.
6. No em dashes or en dashes in prose. En dashes only in numeric ranges.
7. No timer, countdown, or time-pressure language anywhere in copy.
8. Depth comes from the soft warm elevation tokens (`--sh-1`, `--sh-2`),
   plus a permitted subtle bone-paper grain and layered forest/clay
   shapes for figure/ground craft. No hard, dark, or off-palette
   coloured shadows; no flat 1px-only cards.
9. Motion is opt-in and motion-safe. Scroll reveal is JS-driven
   (IntersectionObserver) and lives behind `prefers-reduced-motion:
   no-preference`; content is always in the DOM and fully visible if JS
   is absent or reduced-motion is set. Subtle entrance, stagger, hero
   choreography, a single `$1,000` count-up, gentle nav condense, and
   very low-amplitude ambient shape drift are allowed. No parallax that
   moves content, no autoplay video, no attention-grabbing motion.
10. No sparkle, starburst, or "magic" motif anywhere (icon, logo, or
    illustration). It is generic and reads as the forbidden MeetMagic
    association.

## Type

- Display, headings, wordmark, key serif voice: Fraunces (optical size,
  weights 400 to 700, with italics for the editorial voice).
- Body and UI: Inter.
- Self-hosted via next/font (no runtime font network calls).
- Scale is the live app's (mockup `leap-manifesto-v2.html` + ~12%).
  Headlines must flow across the column, never one word per line.

## Colour

| Token | Use | Value |
|---|---|---|
| bg | Bone page canvas | #F3F2EC |
| bg-deep | Deeper bone wash (alternating sections) | #ECEEE6 |
| surface | Cards and chips | #FFFFFF |
| ink | Headline and key text (deep forest) | #15211B |
| body | Body text | #45504A |
| soft | Muted captions (AA on bone) | #5C6560 |
| forest | The single brand colour: buttons, key word, $1,000, eyebrows, rules | #1F5D45 |
| forest-d | Accessible forest for text and buttons | #184A37 |
| forest-h | Button hover | #16402F |
| clay | Rare micro-accent only (never a button or block) | #C9603A |
| tint | Gentle section wash | #E6EFE8 |
| line | Hairlines and borders | #D6DAD0 |
| espresso | The single dark moment: founder panel (deep forest) | #15281E |
| shape-* | Low-opacity forest/clay organic shapes | rgba forest/clay |

Forest leads and nothing competes. The `$1,000` and the key hero phrase
are forest. Clay appears only as a whisper. Sections alternate bone,
deeper bone, and soft forest tint. The footer is deeper bone, not dark.

## Logo

Plain wordmark, no symbol (a richer mark comes later). Reads
"theBigintro": lowercase, with a capital "B" and "Big" in accessible
forest. Set in Fraunces. No pictorial mark, no arcs-and-heart, no
lowercase-with-period treatment (both rejected). Favicon is a forest
tile with a serif "B".

## Illustrations & visual tier

Relaxed 2026-05-18 (owner sign-off) so the site can reach world-class
visual quality. The old "thin stroke, no fills, no imagery" rule made
that unreachable; it is replaced by a layered crafted system. The
brand-safety constraints (forest + clay only, no sparkle/magic, no
QuotaClub resemblance, senior-credible, light/warm, no dashes) stay
fully intact. What is now allowed:

- Filled and layered forest/clay illustration, two stroke weights, soft
  forest tints behind line work for depth. Still editorial, never
  childish, never cartoon faces.
- A subtle bone-paper grain over the canvas, very low opacity.
- 3 to 4 medium "spot illustrations" as section anchors (a request
  arriving, the one conversation, a gift reaching a cause).
- The hero focal visual: a composed, elevated flow vignette (request in
  → qualified → one conversation → `$1,000` out). This was always in the
  spec and must actually be wired into the build.
- `$1,000` rendered as a designed typographic centrepiece with a crafted
  giving mark, not body-scale text beside a hairline heart.

Photography is permitted only as a later, separately and explicitly
signed-off phase, and only as tightly art-directed, forest-duotoned
imagery of real people/causes to an Acumen / charity:water editorial
bar. Never generic stock, never QuotaClub-style warm lifestyle imagery,
never reuse of the /about or Instagram image pool.

Two non-negotiables for the icon set still hold:

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
- Trust band 1, "Who this is for": soft-mint, a three-up standards row
  (the executive, the bar for vendors with a link to /vendors, where we
  start). Standards, never scarcity pressure.
- Trust band 2, "You stay in control": soft-coral, a 2x2 grid of
  process and risk-reversal reassurances.
- Donation verification: a three-part strip inside the money section
  (sent after the meeting, written confirmation, admin fee billed
  separately).
- Loop line: one centred sentence under the How cards naming the full
  loop start to finish.
- Founder panel: espresso, coral avatar, the one dark moment.
- FAQ: bordered rounded elevated accordions, plus icon rotating to a
  cross, raised on open or hover.
- Closing CTA band: soft-coral on the homepage, soft-mint (`.vend`) on
  /vendors, centred, glow, one button, a reassurance subline. Every
  page must end on a clear ask before the footer.
- Footer: soft mint tint, light, every page linked.
- Social share card: `app/opengraph-image` (reused for Twitter), on the
  locked palette with the mark and tagline. No bare links anywhere.
- Section rhythm: vertical padding is 88px (56px on mobile). The
  homepage commits to one audience; it does not carry a co-equal
  two-audience band.

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

Audience commitment (locked, informed by AlphaSights, Hampton, Toptal,
Intro.co): the homepage speaks only to the executive. The vendor is the
revenue side but the scarce, brand-defining side is the executive, so
the vendor is routed to a first-class `/vendors` page via the hero link,
the "bar for vendors" pointer, and the footer, never via a co-equal
homepage band. `/vendors` is the vendor's homepage and matches this
system one for one (sect-head rhythm, elevation, reveal, closing CTA).

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
