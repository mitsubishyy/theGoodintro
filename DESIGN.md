# TheBigIntro — Design System

Identity direction: modern and trusted. Crisp, structured, credible. It should
read like a serious B2B platform that senior leaders trust with their time. It
must feel clearly separate from QuotaClub (which is warm terracotta editorial).

## Principles

1. Confident, not flashy. Restraint signals seriousness.
2. Clarity is the brand. The model is unusual, so the design must explain.
3. One accent only. Colour is used sparingly for emphasis and action.
4. Generous space. Senior readers skim. Let the page breathe.
5. Honest by default. No fake stats, no stock-photo theatre, no dark patterns.

## Colour

| Token | Use | Proposed value |
|---|---|---|
| surface | Page background | #FFFFFF |
| surface-alt | Section banding | #F5F7FA |
| ink | Primary text, headings | #0E1A2B |
| ink-soft | Secondary text | #45526A |
| accent | Links, primary actions | #2F6BFF (cobalt, to confirm) |
| accent-press | Active and hover | #1F4FCC |
| line | Borders, dividers | #E3E8F0 |
| positive | Charity and impact figures | #0E7A5F |

The accent is deliberately a cool blue so the brand never reads like
QuotaClub's terracotta. Final accent is an open decision in PLAN.md.

## Type

- Headings: a geometric grotesk, tight tracking, large and confident.
- Body: a clean neutral sans at comfortable reading size.
- Self-hosted with next/font. No external font network calls.

Scale (desktop, rem): display 3.5, h1 2.5, h2 1.875, h3 1.375, body 1.0625,
small 0.875. Line height 1.15 for headings, 1.6 for body.

## Layout

- Twelve column grid, max content width about 1200px, comfortable gutters.
- Section vertical rhythm generous and consistent.
- Alternating white and surface-alt bands to separate ideas.
- Mobile first, single column under 768px, all touch targets at least 44px.

## Components

- Nav: text logo "TheBigIntro", minimal links, one accent action button.
- Footer: every page linked, quiet, includes legal and contact.
- Hero: short headline, one sentence subhead, one primary action.
- Section: titled block with optional eyebrow label.
- StepList: numbered three-step explanation.
- MoneyFlow: the where-the-money-goes block, the $1,000 figure emphasised in
  the positive colour, admin fee shown as a separate clearly labelled line.
- PathCards: two cards, executives and vendors, each one action.
- FoundingCohort: invite-only framing with scarcity stated honestly.
- FAQAccordion: native details and summary, plus icon rotating to a cross on
  open, only one concern surfaced at a time, never all expanded.
- FounderNote: small portrait optional, short signed note from Issy.
- CallButton: the single conversion control, links to Calendly.

## Accessibility

- WCAG AA contrast minimum on all text and controls.
- Visible keyboard focus styles in the accent colour.
- Accordions and buttons use real semantic elements.
- Respect prefers-reduced-motion. Motion is subtle by default.

## Quality bar

A page is done when: the model is understandable by a busy executive in one
read, there is exactly one obvious action, nothing invented is presented as
fact, it is fully responsive, it passes AA contrast, and it does not resemble
QuotaClub or reuse any MeetMagic language.
