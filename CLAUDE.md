# theGoodintro — Claude Code Onboarding

This file is loaded by Claude Code on every session. Keep it tight. Update it
when conventions change.

> **READ FIRST — [`FACTS.md`](FACTS.md) is the canonical house facts.** Brand is
> **TheGoodIntro** (capital T, G, I) in all copy/UI, never lowercase, even though
> the repo's legacy paths use "theGoodintro." Pricing/charity figures come ONLY
> from [`app/pricing/page.tsx`](apps/web/app/pricing/page.tsx) / [`CALCULATIONS.md`](CALCULATIONS.md),
> never from memory or older docs. FACTS.md wins over any conflicting text.

> **Monorepo:** `apps/web` = the marketing site (the design rules in THIS file are
> for it: Employment Hero look, emerald-only, no gold). `apps/platform` = the
> internal platform (admin/vendor/exec). **When building or editing the platform,
> `apps/platform/CLAUDE.md` is mandatory reading and its rules are non-negotiable.**
> Core platform rules in one line: the spec docs in the repo root are the source of
> truth; **reproduce the committed portal mockups component-for-component (never
> reinterpret, simplify, or drop a widget)**; use the `--portal-*` palette (dark
> ink ribbon, amber accent, emerald only on the sidebar); follow CHANGE_SAFETY.md
> (branch, feature flag off by default, staging first, Issy approves every
> go-live); when unsure, ask Issy a recommendation-first question, don't guess.

> **HARD RULE — out-of-bounds paths.** Never modify, stage, or commit anything in
> `apps/web`, `outreach/`, `brand/`, or `exec-pipeline/` during platform sessions.
> Even when those paths show uncommitted changes, leave them exactly as found and
> stage your own work by explicit path (`git add <path>`), never `git add -A` / `git add .`.
>
> **HARD RULE — local DB only.** Never migrate, reseed, or flag-change the cloud
> Supabase project (it is the staging/demo deploy). All schema, seed, and test
> work runs on the local Supabase CLI stack: `npm run test:db` to boot/reset it,
> `npm run test:platform` for the DB-backed suite.

## What this is

A validation marketing site for theGoodintro: an Australian-first, invite-only
network where senior executives take qualified meetings and every meeting sends
a real gift to a charity the executive chooses. Pre-platform — this site exists
to validate demand from both sides via booked calls.

**Charity-amount claims: the pricing page is the source of truth.** Never state
a fixed dollar figure to charity from memory. The live model lives in
[`app/pricing/page.tsx`](app/pricing/page.tsx): $1,500 AUD per meeting, with a
tiered amount to the chosen charity ($900 at 1–5 meetings/yr up to $1,200 at
16+, i.e. up to 80%). In customer copy prefer "a real gift" / "the full gift"
over any number; if you must quote a figure, read it off the pricing page first.

Concept brief: [`README.md`](README.md). Site plan and decisions:
[`PLAN.md`](PLAN.md). Every word of original page copy: [`copy/*.md`](copy/).

**Money is calculated in one place.** [`CALCULATIONS.md`](CALCULATIONS.md) is the
authoritative financial source of truth: every donation, revenue, GST, count, band,
and payout figure, with formulas, worked proofs, and reconciliation checks. Any
money number anywhere on the platform must match it. Charity-flow model and open tax
questions: [`CHARITY_FLOW.md`](CHARITY_FLOW.md).

## Platform build briefs (read these before building any portal)

The future platform has **three portals**, each with a build-ready brief. They are
spec/reference for when Issy is ready to build; **do not start implementing them
unless Issy explicitly asks** (she is currently in a documentation phase). When
that time comes, read the relevant brief first:

- **Admin portal** (Issy's internal cockpit): [`ADMIN_PORTAL_BRIEF.md`](ADMIN_PORTAL_BRIEF.md)
- **Vendor portal** (paying SaaS vendors): [`VENDOR_PORTAL_BRIEF.md`](VENDOR_PORTAL_BRIEF.md)
- **Executive portal** (senior leaders + EAs, email-first): [`EXECUTIVE_PORTAL_BRIEF.md`](EXECUTIVE_PORTAL_BRIEF.md)

**START HERE to build the platform:** [`V2_BUILD_PLAN.md`](V2_BUILD_PLAN.md) is the
master entry point. It consolidates a full audit of the v1 build, the exact gap
list (maths, state machine, reports), the schema migrations, the prioritized build
sequence, and the verification gates. It says what is already done and verified
(do not redo) and what to build next. Read it before touching the platform.

[`MVP_SCOPE.md`](MVP_SCOPE.md) carves the bare-bones v1 (accept money, book
meetings, onboard executives) out of the three briefs and lists what is deferred.
[`PRODUCTION_READINESS.md`](PRODUCTION_READINESS.md) is the run-in-production build
plan and launch checklist (integrations, observability, security, CI), tracked as
tickable tasks; clear it plus the SECURITY pre-launch checklist before go-live.
[`COLD_START_GAPS.md`](COLD_START_GAPS.md) holds the gaps a fresh session would
otherwise guess at: resolved contradictions, engineering decisions (DEC-1 to
DEC-11), and required artifacts (ART-1 to ART-5, including the `packages/ui` kit).
Clear it before/while building; do not fill a gap with a guess.

[`BUILD_HEALTH.md`](BUILD_HEALTH.md) is the current-state audit snapshot: what
is verified-strong (do not rebuild), what is still weak (priority tiers
referencing PRODUCTION_READINESS item codes), and what is deliberately not
being built. Read it after V2_BUILD_PLAN.md so you know what to skip and what
to push on.

**Portal layout/visual source of truth:** [`PORTAL_LAYOUT_BLUEPRINT.md`](PORTAL_LAYOUT_BLUEPRINT.md)
locks how every portal screen is laid out (HR Partner density on `--portal-*`
tokens, one template per screen, every module specified). The briefs own workflows;
the blueprint owns layout and wins on any visual conflict.

They build on [`PLATFORM_WORKFLOWS.md`](PLATFORM_WORKFLOWS.md) (workflows) and
[`POSITIONING.md`](POSITIONING.md) (rules), and fold in two competitor UX
references with a strict "take the structure, not the look" guardrail: **MeetMagic**
(what data/fields to capture) and **HR Partner** (admin dashboard, Clients
list/detail, and the Checklists/onboarding flow). Never adopt their palettes
(MeetMagic purple is forbidden; no HR Partner pink or cartoon icons), only emerald
on warm paper.

Each brief is kept as **both the `.md` (source of truth, loads into context) and a
house-style `theGoodintro-*-portal-brief.docx`** for sharing. If you edit a brief,
**regenerate its `.docx`** with `python3` + `python-docx` (no pandoc in this env;
the converter lives at `/tmp/md2docx_portals.py` during a session, recreate if
gone). House rule for the briefs: **no em or en dashes in prose** (the no-dash site
rule applies), the only exception being the `# theGoodintro — …` H1 title, which
all three share.

## The locked design brief

These four answers anchor every design decision. Do not pivot on these
without explicit user instruction.

| | |
|---|---|
| **Reference site** | Employment Hero (white + warm cream + bold accent + multi-color illustrations + sharp grid) |
| **Target audience** | 50yo listed-company CFO/COO. Conservative. Data-driven. Sceptical of anything "cute". |
| **Position statement** | theGoodintro is the AlphaSights for charity-funded executive introductions. |
| **Voice** | Confident concierge. Warm but selective. Premium hospitality without gushing. |

Resolution of the tension between these: **Employment Hero's composition at
AlphaSights' craft level.** Operator-modern structure, premium polish.

## Forbidden — do not re-introduce

These have all been tried and rejected. Do not waste user time re-proposing
them:

- Purple / violet (reads as MeetMagic, the direct competitor)
- Coral / orange-pink (felt charity-pastel)
- Gold / yellow (felt crafty)
- Pink / rose tints (felt feminine-soft)
- Blue / sky tints (rejected outright)
- Mascots of any kind, including plants (tried, removed)
- Em dashes (—) and en dashes (–) in body copy. En dashes only inside numeric ranges.
- Magic / wizard imagery (MeetMagic uses this — must differentiate)
- The words "magic", "magic circle", "MAGIC", "turn your expertise into impact",
  "zero wasted time", "meet better", "pitch-free" (MeetMagic vocabulary)
- The word "marketplace" anywhere (hard rule). Use "network" or another
  context fit ("invite-only network", "two-sided platform"). Note: still
  present in app/page.tsx, app/apply/page.tsx, app/opportunity/page.tsx,
  copy/opportunity.md and this file's intro; sweep on next copy pass.
- Timer / countdown / urgency language anywhere
- "Cute" copy, friendly-pastel illustrations, Notion-style hand-drawn doodles
- Generic startup gradients
- Plus Jakarta Sans as a font choice (was used in an earlier rejected direction)

## Design system

### Palette

Defined in [`app/globals.css`](app/globals.css) as OKLCH tokens.

- **Background**: warm paper (`--background`, `oklch(0.965 0.012 85)`)
- **Foreground / ink**: `oklch(0.14 0.006 70)`
- **Primary accent (the only colour)**: deep emerald, `--primary`
  (`oklch(0.42 0.13 158)`) for CTAs, the italic emphasis moment, the `$1,500`
  number, the pulse dot, link hovers
- **Signal / pulse**: brighter emerald variant (`--signal`)
- **Mint tint**: lighter emerald wash for section accents (`--mint-tint`)
- **Stone tint**: warm-neutral, replaces previous rose/sky tints
  (`--stone-tint`)

### Per-page warm cream variants

Every page wears a distinct cream warmth. Used in the hero `bg` prop:

| Page | Variant |
|---|---|
| `/` | `--cream-1` (warm paper) |
| `/about` | `--cream-2` (deeper warm) |
| `/executives` | `--cream-3` (cooler cream) |
| `/vendors` | `--cream-4` (lighter peachy cream) |
| `/how-it-works` | `--cream-5` (balanced) |
| `/opportunity` | `--cream-6` (warmest, most ochre) |

If adding a new page, give it its own cream variant so backgrounds keep
alternating.

### Type

- **Display + body**: Inter (next/font/google, self-hosted)
- **Italic emphasis only**: Fraunces — variable serif. Use via the
  `.serif-italic` class for the one italic emphasis moment per page max.
  Also used for the big `$1,500` number via `.display-serif`.
- **Mono labels / micro UI**: JetBrains Mono. Use for eyebrows, stat
  labels, technical UI hints. Uppercase, `tracking-[0.18em]`.

Never use Fraunces for an H1 or H2 — only inline emphasis and big numbers.

### Illustrations

Inline SVG in [`app/_components/illustrations.tsx`](app/_components/illustrations.tsx).
Multi-color compositions using the illustration token palette
(`--ill-emerald`, `--ill-tan`, `--ill-cream`, `--ill-ink`). One illustration
per page hero. The style is Employment Hero adjacent: stacked cards, coins,
geometric shapes, slight isometric depth. No human characters (commission art
later when budget allows).

Spot illustrations (`TrustSpot`, `CoinsSpot`) are available for inline
moments.

### Icons

Custom outline icons in [`app/_components/icons.tsx`](app/_components/icons.tsx).
24×24 viewBox, 1.6px stroke, currentColor, rounded line caps. Use these
instead of Lucide where possible — Lucide is fine for arrows / chevrons / plus
/ minus / quote glyphs and other generic UI.

**No emojis on the site.** Custom icons or Lucide only.

### Shared UI primitives

In [`app/_components/ui.tsx`](app/_components/ui.tsx):

- `PageHero({ eyebrow, title, italicWord, lede, primaryCta, secondaryLabel, secondaryHref, pill, bg, illustration })` — every page uses this
- `PrimaryCta`, `SecondaryCta` — pill-shape CTAs
- `SectionLabel` — small mono uppercase label with hairline rule
- `SectionHead` — consistent section header block
- `StepCard`, `MoneyBlock`, `MoneyRow`, `ComparisonRow`, `Faq`, `ClosingCta`

If you reach for a div with `rounded-2xl border bg-card` you almost certainly
want one of these primitives.

### Layout grammar

Sections rotate between these patterns — never repeat the same one back-to-back:

1. Split-with-illustration hero (page headers)
2. Logo strip (single horizontal row of partner placeholders)
3. Big-metric cards (4 stats in a row)
4. Two-column split (left rail + right full-cards)
5. Tabbed two-audience cards
6. Photo + spec list (with Unsplash image + bullet rows)
7. Testimonial / spotlight card with stats pills
8. Icon-grid bento (cause rows, etc.)
9. Side-by-side comparison cards
10. Founder quote card
11. Deep FAQ (10+ entries, 60–120 words each)
12. Centered final CTA

**HARD RULE — alternating section backgrounds.** Down every page, section
backgrounds must strictly alternate between `--paper-white` and `--paper-oat`
(oat sections carry `className="border-y"` + `borderColor: var(--border)`).
Never place two same-tone backgrounds back-to-back. The hero (`hp-hero`, warm
white) counts as the first band, so the first section after it is oat. After
adding, deleting, or reordering ANY section, re-walk the whole page top to
bottom and re-tone every band so the white/oat rhythm is unbroken — deleting a
section is the usual way this regresses. `ClosingCta` accepts `tone="white"`
(default) or `tone="oat"` to keep it in the rhythm.

## File map

```
app/
  layout.tsx              — root layout, nav, footer, font loading
  globals.css             — design tokens (OKLCH), per-page cream variants
  page.tsx                — homepage
  about/, executives/, vendors/, how-it-works/, opportunity/, privacy/, terms/
  _components/
    ui.tsx                — shared primitives (PageHero, CTAs, Faq, etc.)
    icons.tsx             — custom outline icons
    illustrations.tsx     — page-hero illustrations + spot illustrations
  opengraph-image.tsx     — OG card (plain, kept minimal)
  twitter-image.tsx       — reuses OG
  sitemap.ts, robots.ts   — SEO
copy/                     — original page copy preserved as markdown
lib/
  config.ts               — SITE_URL, CALENDLY_URL, FOUNDER_LINKEDIN
  utils.ts                — `cn` helper (clsx + tailwind-merge)
scripts/
  notify-indexnow.mjs     — IndexNow ping (run after deploy)
next.config.ts            — Unsplash whitelisted; security headers + CSP
```

## Model routing and effort

Routing happens in two layers. **First: which window. Second: which model in
that window.** A task in the wrong window is worse than a task on the wrong model.

| Window | What runs there |
|---|---|
| The Supabase-connected build chat | Schema migrations, RLS, real DB queries, anything that hits production data |
| Claude Design (claude.ai/design) | All visual iteration, with live preview |
| Planning/translation chats (no DB) | Strategy, doc edits, copy review, brief writing, build plans, translating the build chat's output for Issy |

Pick the model and effort level by the **cost of being wrong**, not the size of
the task. The platform handles real money, GST, and donations; under-effort on
correctness work costs more than over-spend on a model call ever will.

| Work type | Model + effort | Why |
|---|---|---|
| Money, state machine, reports, migrations (anywhere under `apps/platform` or `packages/pricing`) | **Opus 4.8 at `max` or `xhigh`** | A bug here costs a real refund, a GST mistake, or a wrong charity amount. Spend the tokens. |
| Long autonomous build chunks against a V2_BUILD_PLAN.md section | Opus 4.8 at `xhigh`, long-running | Designed for exactly this: holds direction across many gates, reports honestly when stuck. |
| Planning chats and multi-doc reading (like this one) | Opus 4.x at the 1M context size | Lets the assistant hold every brief plus the relevant code in one head. |
| Mechanical sweeps across many independent files (legacy lowercase "theGoodintro", stale copy, footer wiring, `.docx` regen) | Sonnet 4.6, single session | `npm run check:copy` verifies. Don't burn Opus on text edits. |
| Routine `apps/web` copy tweaks, IndexNow pings, README touches | Sonnet 4.6, or Opus Fast Mode if already in an Opus session | Low stakes; speed matters more than reasoning. |
| Throwaway one-shots (rename a variable, regenerate a single brief) | Haiku 4.5 | The fastest model that will do it correctly. |
| Design iteration | Done in Claude Design at claude.ai/design with live preview, **not** in Claude Code | Existing rule: design there, port here. |
| Anything DB-connected (migrations, RLS, real Supabase queries) | Whatever model the **Supabase-connected window** is on; the rule is the window, not the model | The MCP scope is what matters. |

**The non-negotiable.** Effort level does not replace verification gates.
"Max effort" never means "ship without `npm test && npm run lint && npm run
build && npm run check:copy`." The Section 8 gates in
[`V2_BUILD_PLAN.md`](V2_BUILD_PLAN.md) remain the definition of done.

**Dynamic Workflows** (Anthropic's research-preview fan-out, up to 16 concurrent
agents, 1,000 per run) is a fit ONLY for embarrassingly parallel work: the
legacy brand/pricing sweep, the 12 reports, regenerating the 6 `.docx` briefs.
Never for anything that touches shared files (`globals.css` tokens, `ui.tsx`
primitives, the footer, the alternating white/oat background rhythm); subagents
will collide. Prove it on a low-risk sweep before trusting it with build work.

**Cost discipline.** If a task looks small and mechanical, downshift the model
before starting; don't run Opus on something Sonnet would finish in one pass.
If a task touches money or state, upshift; never run Sonnet on a state-machine
transition or a CALCULATIONS.md figure.

**Policy is Issy's, not Claude's.** Claude writes code that implements decisions;
it does not make decisions that bind the business. Specifically off-limits:

- Tax and accountant calls (cash vs accrual, GST tax point, when the donation
  deduction is claimed, breakage on unused credits; see CALCULATIONS.md §5)
- The per-meeting charity override binding mechanism
- Anything in V2_BUILD_PLAN.md §7 ("ask Issy, do not guess")
- Privacy, legal, ACNC, ABN, or charity-status questions

If a build chunk is blocked on one of these, stop and surface a
recommendation-first question to Issy. Do not guess.

## Conventions

- Use Tailwind v4 utility classes in JSX. The shadcn-style design tokens
  (`bg-background`, `text-foreground`, `border-border`, etc.) are wired in
  `globals.css` via `@theme inline`.
- For colors not in Tailwind tokens (`--cream-3`, `--ill-tan`, etc.), use
  inline `style={{ background: "var(--cream-3)" }}` — they are CSS custom
  properties.
- Build with `npx next build` to verify before committing. Lint with
  `npm run lint`.
- Never use `--no-verify` or skip hooks. Never amend published commits.
  Always create a new commit for fixes.

## Pending real-world inputs (TODOs)

These are marked `TODO(lachlan)` in code where applicable:

1. **Calendly URL** in [`lib/config.ts`](lib/config.ts) — currently
   `mailto:hello@thegoodintro.com`. Replace with the dedicated Calendly event
   when created.
2. **Founder LinkedIn** in [`lib/config.ts`](lib/config.ts) — currently
   `linkedin.com/in/isobel-hardwick/`. Replace with the real handle.
3. **Founder photo** for [`/about`](app/about/page.tsx) — currently shows "IH"
   initials block. Drop a real photo at `public/founder.jpg` and update the
   avatar block to use a `next/image` component.
4. **Founding-cohort testimonial** in [`app/page.tsx`](app/page.tsx) (Sarah
   Chen block) — placeholder anonymised quote. Replace with a real
   founding-cohort interview once permission granted.
5. **Charity partner imagery** in the giving-promise section of
   [`app/page.tsx`](app/page.tsx) — currently a generic Unsplash photo.
   Replace with real charity partner imagery at launch.
6. **Charity partner logos** in the logo strip — currently text-only
   placeholders (Beyond Blue, OzHarvest, RFDS, etc.). Swap to real SVG logos
   once partnerships are confirmed.
7. **ABN / ACNC verification badges** in hero — currently placeholder text.
   Replace with real verification once theGoodintro Pty Ltd is incorporated and
   registered.

## Deploy

- Repo: [github.com/mitsubishyy/thegoodintro](https://github.com/mitsubishyy/thegoodintro) (private)
- Production branch: `main`
- `git push origin main` triggers Vercel auto-deploy
- After deploy, run `npm run indexnow` to ping IndexNow with the changed URLs.
- Custom domain (when live): `thegoodintro.com`

## Commands

```
npm run dev         # dev server (Turbopack) at localhost:3000
npm run build       # production build (verify before commit)
npm run lint        # ESLint
npm run indexnow    # IndexNow ping after deploy
```

## Working with this repo

When the user asks for design changes:

1. **Check this file's "Forbidden" list first.** Don't propose anything that's
   already been rejected.
2. **Stay within the locked brief.** Employment Hero structure + AlphaSights
   craft + warm cream + emerald + custom illustrations + per-page cream
   variant.
3. **Vary layouts, not just colors.** Background tinting alone is not enough —
   reach for different section grammars (split layouts, photo + spec lists,
   testimonial cards, comparison matrices, big-number callouts).
4. **Commit and push to main** when the user says "push", "ship", or "deploy".
   This triggers the Vercel build.

## Recent direction history (for context)

In iteration order, these were tried and rejected — do not re-propose:

1. Dark Soho-House premium (Direction B) — too premium-aspirational
2. Light editorial Stripe/AlphaSights — too literary
3. Modern shadcn monochrome — too plain
4. Friendly Cal.com / Notion with plant mascot — too cute, mascot removed
5. Pure monochrome with mint-only — too monotone
6. Pinks + sky-blue tints — explicitly rejected

The current direction (Employment Hero structure, warm creams, emerald accent,
custom illustrations, per-page cream variants) is the one that stuck after
the brief was locked. Iterate within it; do not pivot the whole register
without re-locking the brief.
