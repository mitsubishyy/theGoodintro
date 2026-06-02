# theGoodintro Platform — build rules (READ FIRST, NON-NEGOTIABLE)

Loaded by Claude Code for all work in `apps/platform`. These rules are mandatory.
If a quick interpretation conflicts with a rule here, the rule wins. The whole
point of the spec docs and mockups is that you follow them, do not reinvent.

**The build plan is [`../../V2_BUILD_PLAN.md`](../../V2_BUILD_PLAN.md).** It is the
ordered, audited task list: what is already done and verified (the `@thegoodintro/pricing`
engine + `reporting.ts` + `csv.ts`, FACTS.md, the layout blueprint), the exact gap
list, the schema migrations, and the verification gates. Read it first, then follow
its build sequence. All money figures come from `@thegoodintro/pricing` and its
`reporting` subpath; never recompute money in a page.

## 0. House facts win: FACTS.md (brand spelling + pricing)

Before writing any copy, UI string, or number, obey [`FACTS.md`](../../FACTS.md).
Brand is **TheGoodIntro** in all copy/UI (never the repo's legacy lowercase
"theGoodintro"). Pricing/charity figures come ONLY from the pricing page /
CALCULATIONS.md, never from memory. FACTS.md overrides any conflicting repo text.

## 1. The spec docs are the source of truth, read them before building

In the repo root, read and obey: `MVP_SCOPE.md`, `DATA_MODEL.md`,
`STATE_MACHINES.md`, `EMAIL_ACTIONS.md`, `OPS_AND_COMPLIANCE.md`,
`SECURITY_AND_COMPLIANCE.md`, `CHANGE_SAFETY.md`, `NOTIFICATION_TEMPLATES.md`,
the three portal briefs (`ADMIN_/VENDOR_/EXECUTIVE_PORTAL_BRIEF.md`),
`CALCULATIONS.md`, `CHARITY_FLOW.md`. Do not invent anything that contradicts
them. Implement the Money rules in `DATA_MODEL.md` exactly.

## 2. Layout source of truth: PORTAL_LAYOUT_BLUEPRINT.md

`PORTAL_LAYOUT_BLUEPRINT.md` (repo root) is the **locked layout + visual register**
for every portal screen. It resolves the old three-way contradiction in the briefs
(admin "no craft" vs vendor/exec "marketing craft"): **all three portals use HR
Partner information density wearing the `--portal-*` tokens.** Where a brief's
visual wording conflicts with the blueprint, **the blueprint wins**. Every screen
names its template (T1 to T7) and HR Partner reference there; build from it.

## 2b. Reproduce the mockups, do NOT reinterpret them

The committed portal mockup pages (admin/vendor/exec) and the `--portal-*` tokens
in `globals.css` are the **visual AND content spec**, not loose inspiration. Note:
mockups currently exist for the **exec** surface only; for admin/vendor module
screens, the blueprint (rule 2) is the layout spec until mockups are designed in
Claude Design.

- **Admin** mockup = dark near-black metrics ribbon, **Booked-meetings calendar**,
  **Needs action**, **Pending requests**, **Unresponded comms**.
- **Vendor** mockup = executive list, credits + band progress, pending, impact.
- **Exec** mockup = email-first banner, requests, upcoming meetings, charity,
  impact.

Reproduce every screen **component-for-component**: same widgets, same layout
(8/4 grid), same spacing and typography. **Reuse the mockup's components**
(`MetricsRibbon`, `CalendarWidget`, `Widget` shell, etc.) and only swap
placeholder arrays for real data. **NEVER drop, rename, or simplify a widget.**
If a data source isn't built yet, render the widget with an empty/placeholder
state, never remove it. The result is the mockup, populated with live data.

## 3. Palette: the `--portal-*` tokens, no invented UI

Emerald **only** on the sidebar. Warm-cream page, **dark near-black metrics
ribbon** (`--portal-ribbon`, never plain white stat cards), ink primary buttons,
amber the single accent (badges, links, dots, warnings). Amber is a sanctioned
exception to the marketing site's emerald-only rule, **portals only**.

## 4. Change safety (CHANGE_SAFETY.md), on every change

- Work on a branch; ship behind a **feature flag OFF by default**; test on
  **staging (synthetic data)** first; **Issy approves every go-live**.
- Schema changes via **reversible migrations**; records **snapshot their own
  truth**; logs **append-only**; **verify webhook signatures**; add **tests on the
  money and state-machine paths**.
- **NEVER** touch the live marketing site (`apps/web`) or production data directly.

## 5. When unsure, ASK, don't guess

Ask Issy a **recommendation-first multiple-choice** question rather than reducing
scope, simplifying, or inventing. Issy owns business decisions; you make the
engineering calls. Do not silently ship a smaller version of what was specced.

## 6. Stack & structure

Monorepo: `apps/web` (marketing) + `apps/platform` (this) + `packages/` (shared),
npm workspaces + Turborepo, two independent Vercel projects. **Supabase on AWS
Sydney (ap-southeast-2).** Keep the two apps fully isolated.

## 7. Model + effort routing

For which window and which model to use on which task, see the **Model routing
and effort** section in [`../../CLAUDE.md`](../../CLAUDE.md). The platform's
money, state-machine, reports, and migrations work always warrants **Opus 4.8
at `max` or `xhigh`**. That is the floor here. Do not downshift.
