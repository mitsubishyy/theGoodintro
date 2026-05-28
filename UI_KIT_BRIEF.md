# packages/ui Kit Brief (ART-5, the design fix)

The build-ready spec for the shared portal component kit. It closes COLD_START_GAPS
ART-5 and PORTAL_LAYOUT_BLUEPRINT.md section 0 (the build-order gate). This is the
single biggest fix for the "looked thin / inconsistent" problem in v1: the shell was
hand-rolled three times and has already diverged, and the dashboards reference
undefined `--cream-*` tokens so muted text renders broken.

This document is the brief. It is NOT the built kit. Per the locked design workflow
(blueprint section 0, COLD_START ART-5), the visuals are iterated in Claude Design
(claude.ai/design, live preview), locked with Issy, then ported into `packages/ui`.
This brief defines the inventory, the prop APIs, the token mapping, and the
acceptance bar that the Claude Design pass and the port must satisfy.

Source-of-truth precedence: FACTS.md (brand, pricing) > PORTAL_LAYOUT_BLUEPRINT.md
(layout, visual register) > this brief (component API detail). Where this brief and
the blueprint disagree on anything visual, the blueprint wins.

---

## 0. Why this exists and what "done" means

v1 came out thin for three structural reasons this kit fixes:

1. **Three hand-rolled shells, already diverged.** Confirmed in the repo:
   - `apps/platform/app/admin/_components/` has a real split: `sidebar.tsx`,
     `topbar.tsx`, `widgets.tsx`, `icons.tsx`.
   - `apps/platform/app/vendor/_components/dashboard.tsx` is one ~14.5KB monolith
     that inlines its own sidebar, topbar, and widgets, plus a second `icons.tsx`.
   - `apps/platform/app/exec/_components/exec-dashboard.tsx` is one ~32KB monolith
     with its own shell and (per the blueprint) raw Lucide icons.
   Three sidebars, two `Widget` shells, two icon sets. A component built for one
   does not look at home in the others.

2. **Broken token references.** The dashboards style with `--cream-3`, `--cream-6`,
   `--cream-9`, `--cream-10`, but `packages/tokens/src/portal.css` defines none of
   them (it defines `--portal-*`, `--muted-foreground`, `--border-strong`, etc.).
   Every `var(--cream-9)` resolves to nothing, so muted text and chip fills fall
   back to inherited colour and render wrong. Section 3 fixes this exactly.

3. **No shared primitives, no states.** There is no `DataTable`, `RecordDetail`,
   `RecordForm`, `Checklist`, `EmptyState`, `Skeleton`, `ErrorInline`, etc., so
   every screen reinvents them and none ship loading/empty/error states.

**The kit is "done" (and only then may module building in blueprint section 4
begin) when:**
- `packages/ui` exists and exports every component in section 4, with documented
  props and every state in section 5 rendered.
- The three hand-rolled `_components` shells are deleted and every screen imports
  the shell from `packages/ui` (a second sidebar implementation is a bug).
- The `--cream-*` token layer is fixed (section 3); no component references an
  undefined token.
- One polished reference screen exists per template T1 to T6 on the real
  `--portal-*` tokens (T7 is the existing exec mockup), each passing the section 6
  polish rubric.
- `npm test && npm run lint && npm run build && npm run check:copy` all pass.

---

## 1. Package setup

```
packages/ui/
  package.json        # name "@thegoodintro/ui", private, type module, workspace dep
  tsconfig.json       # extends ../../tsconfig.base.json
  src/
    index.ts          # barrel: re-exports every public component + type
    shell/            # PortalShell, PortalSidebar, PortalTopbar, PortalPage
    templates/        # MetricsRibbon, Widget, DataTable, RecordDetail, RecordForm, Checklist
    primitives/       # Button, Badge, StatusDot, Avatar, EmptyState, Skeleton,
                      #   ErrorInline, Field, Tabs
    icons/            # the custom outline set, moved here from the app (one copy)
    types.ts          # shared types (NavItem, Column<T>, RibbonStat, etc.)
```

Rules for the package:
- **`package.json` exports** mirror `@thegoodintro/pricing`: `"main"`/`"types"` to
  `./src/index.ts`, plus subpath exports if we split (e.g. `"./icons"`). Source-only
  TS, consumed by `apps/platform` over the workspace; Next transpiles it (add
  `transpilePackages: ["@thegoodintro/ui"]` to `apps/platform/next.config.ts` if not
  already covered).
- **No global CSS in the package.** It consumes the CSS custom properties the app
  already loads from `@thegoodintro/tokens/portal.css`. The kit ships Tailwind
  utility classes plus inline `style={{ ... var(--portal-*) }}` for token colours,
  exactly as the current components do. Tailwind scanning must include the package
  (`apps/platform/app/globals.css` uses Tailwind v4; ensure the package path is in
  the content sources so classes are not purged).
- **Client vs server.** Interactive components (`PortalSidebar` uses
  `usePathname`; `DataTable`, `Tabs`, toggles) are `"use client"`. Purely
  presentational shells (`PortalPage`, `MetricsRibbon`, `Widget`, `EmptyState`,
  `Skeleton`) stay server-compatible so pages can keep fetching on the server. See
  the open question in section 8 on how aggressively to keep components server-side.
- **Icons.** Move the custom outline set into `packages/ui/src/icons` as the single
  copy. Custom set for domain glyphs; Lucide allowed only for generic
  chevron/arrow/plus/minus (blueprint type ramp). Delete the per-app `icons.tsx`
  duplicates. No emojis (the current `widgets.tsx` uses a `⚠` glyph for overdue;
  replace with an icon).

---

## 2. Design register the kit must wear (from the blueprint, restated as the bar)

- **Colour:** only `--portal-*` and the base tokens. Emerald (`--primary`,
  `--emerald-deep`, `--primary-bright`) on the **sidebar only**. Headline metrics
  live in the dark `--portal-ribbon`, never as white stat cards. Amber
  (`--portal-amber`, `--portal-amber-soft`, `--portal-amber-ink`) is the single
  accent: badges, links, status dots, warnings.
- **Type ramp:** Inter 13 to 14px body/cells; JetBrains Mono 11px uppercase
  `tracking-[0.18em]` for widget/section titles and micro labels; Inter 18 to 20px
  semibold page H1; ribbon number Inter semibold 22 to 28px (Fraunces allowed for
  that one number only, never in module bodies).
- **Density (HR Partner):** table row height 44px, cell padding 12px x / 10px y;
  card padding 20 to 24px; one radius scale and one shadow scale across the kit.
- **Brand:** the sidebar org/logo block renders the wordmark as **TheGoodIntro**
  (capital T, G, I; the "Good" carries the emerald highlight), per FACTS.md. The
  current `sidebar.tsx` renders lowercase "theGoodintro"; the kit must not. The
  `check:copy` guard will catch regressions.

---

## 3. Token fix (do this with the kit; it unblocks correct rendering)

The components reference four undefined custom properties. Map each to a token that
already exists in `packages/tokens/src/portal.css`:

| undefined ref | used for (observed) | canonical token | value role |
|---|---|---|---|
| `--cream-9`  | muted / secondary text, sub-labels | `--muted-foreground` | `oklch(0.470 0.018 80)` |
| `--cream-10` | stronger text on neutral chips | `--portal-ink` | `oklch(0.17 0.006 70)` |
| `--cream-3`  | subtle neutral fill (chips, avatar bg, status pills) | `--muted` | `oklch(0.935 0.016 80)` |
| `--cream-6`  | a "read" status dot (neutral, not amber) | `--border-strong` | `oklch(0.760 0.022 80)` |

**Recommended approach (least-risk bridge):** add a small, clearly-marked alias
block to `packages/tokens/src/portal.css` so the existing dashboards render correctly
immediately, AND build `packages/ui` using only the canonical tokens (never
`--cream-*`). Mark the alias block "remove when the hand-rolled shells are deleted."

```css
/* TEMPORARY alias bridge: the legacy hand-rolled dashboards reference these
   undefined names. Aliased to canonical tokens so they render correctly until
   those shells are replaced by packages/ui (which uses only the canonical names).
   Delete this block when admin/vendor/exec _components are removed. */
:root {
  --cream-3: var(--muted);
  --cream-6: var(--border-strong);
  --cream-9: var(--muted-foreground);
  --cream-10: var(--portal-ink);
}
```

The alternative (replace every `--cream-*` usage in the three shells now) is churn
on code that section 0 deletes, so the bridge is preferred. Either way, **no
`packages/ui` component may reference a `--cream-*` token.** See section 8 for the
decision to confirm.

---

## 4. Component inventory and proposed prop APIs

APIs below are grounded in the components that already exist where there is one
(`MetricsRibbon`, `Widget`, `Sidebar`), generalised so all three portals share them.
Treat these as the proposed contract to lock in Claude Design, not as final until
the reference screens prove them.

### 4.1 Shell (`src/shell`)

```ts
// PortalShell: the frame. Composes sidebar + topbar + page slot; owns responsive
// collapse (sidebar -> top hamburger on mobile).
interface PortalShellProps {
  sidebar: ReactNode;   // a configured <PortalSidebar>
  topbar: ReactNode;    // a configured <PortalTopbar>
  children: ReactNode;  // the page (usually <PortalPage>)
}

// PortalSidebar: emerald fill, ~240px, fixed full height; org block top, nav
// middle, account block pinned bottom. Active item: lighter emerald wash + left
// indicator. Items with pending work show an amber count badge. Parents expand to
// indented children (admin "Clients").
interface NavItem {
  label: string;
  href: string;
  icon: IconName;
  badgeCount?: number;            // renders amber count when > 0
  locked?: boolean;               // vendor "Leaders"/"Requests" gate: lock icon, not 404
  children?: NavItem[];           // expandable parent (admin Clients)
}
interface PortalSidebarProps {
  brand?: ReactNode;              // defaults to the TheGoodIntro wordmark block
  items: NavItem[];
  account: { name: string; role?: string; avatarUrl?: string };
  onSignOut?: () => void;         // or a form action; admin uses signOutAction
}

// PortalTopbar: thin cream bar above content. Global search left; one
// portal-specific context widget (admin env label; vendor credit balance;
// exec/EA "acting for"); notification bell with amber dot when unread; avatar menu.
interface PortalTopbarProps {
  search?: { placeholder?: string; onChange?: (q: string) => void };
  context?: ReactNode;            // credit balance | acting-for | env label
  unreadCount?: number;           // amber dot on the bell when > 0
  account: { name: string; avatarUrl?: string };
}

// PortalPage: title row (H1 + optional breadcrumb left; optional primary action
// right) + content slot. Every module screen renders inside this.
interface PortalPageProps {
  title: string;
  breadcrumb?: { label: string; href?: string }[];
  action?: ReactNode;             // primary page action button (e.g. "+ New executive")
  children: ReactNode;
}
```

### 4.2 Templates (`src/templates`)

```ts
// T1 MetricsRibbon: dark --portal-ribbon band, row of stat groups (mono label +
// big number + optional sub-line). Generalised from the admin RibbonMetrics shape
// so vendor/exec ribbons reuse it. Only place headline numbers live.
interface RibbonGroup { label: string; stats: { value: string; unit?: string; big?: boolean }[]; }
interface MetricsRibbonProps { groups: RibbonGroup[]; }

// T2 Widget: the card shell already in widgets.tsx, kept and shared.
interface WidgetProps {
  title: string;                  // mono uppercase header
  count?: number;                 // amber count badge when work pending
  link?: { label: string; href?: string };  // "-> all" deep link
  right?: ReactNode;              // header-right control (e.g. Calendar|List toggle)
  state?: "ready" | "loading" | "error" | "empty";
  emptyText?: string;             // one-line empty explanation (never a blank box)
  onRetry?: () => void;           // error-state retry
  children?: ReactNode;
}

// T3 DataTable: dense index table (44px rows), mono uppercase headers, status
// pill column, optional row checkbox, row-action menu, filter slot, pagination.
interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode; // custom cell (status pill, avatar, etc.)
  width?: string;
  align?: "left" | "right";
}
interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowHref?: (row: T) => string;   // click row -> detail (T4)
  rowActions?: (row: T) => ReactNode;
  selectable?: boolean;           // bulk checkbox column
  filter?: ReactNode;             // filter control slot (top-right)
  newAction?: ReactNode;          // "+ New X" slot (top-right)
  pagination: { page: number; pageCount: number; onPage: (p: number) => void };
  state?: "ready" | "loading" | "error" | "empty";
  emptyText?: string;
  onRetry?: () => void;
}

// T4 RecordDetail: header band + left module rail + centre active module + right
// append-only activity feed. The richest template, most missing today.
interface DetailModule { key: string; label: string; badge?: number; content: ReactNode; }
interface ActivityItem { id: string; text: ReactNode; actor?: string; at: string; }
interface RecordDetailProps {
  header: {
    avatar?: ReactNode;
    title: string;
    subtitle?: string;            // title/role line
    facts?: { label: string; value: ReactNode }[];  // label:value pairs
    status?: { label: string; tone?: "amber" | "neutral" };
    tags?: string[];
    actions?: ReactNode;          // [Edit] + overflow
  };
  modules: DetailModule[];        // left rail; first is active by default
  activeKey?: string;
  onSelectModule?: (key: string) => void;
  activity: ActivityItem[];       // right feed; renders its own empty state
}

// T5 RecordForm: two-column field grid (single column mobile), mono uppercase
// section headers, inline validation, sticky action bar.
interface FormSection { title: string; fields: ReactNode[]; }  // composed from <Field>
interface RecordFormProps {
  sections: FormSection[];
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel?: string;           // default "Save"
  submitting?: boolean;           // sticky-bar button -> loading
}

// T6 Checklist: progress header ("3 / 6 . 50%") + items with checkbox, label, and
// a right affordance (upload dropzone | "sign document" | link).
interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  affordance?: ReactNode;         // dropzone | action button | link
  onToggle?: (id: string) => void;
}
interface ChecklistProps { items: ChecklistItem[]; }
```

T7 (Email/confirm surface) is the exec product and is NOT a generic kit template;
it is reproduced from the existing mockup at `apps/web/app/mockup/{email,rsvp,exec}`
component-for-component (blueprint T7, EXECUTIVE_PORTAL_BRIEF.md, EMAIL_ACTIONS.md).

### 4.3 Primitives (`src/primitives`)

| component | purpose | key props |
|---|---|---|
| `Button` | ink primary / ghost secondary / danger; the only button | `variant`, `size`, `loading`, `disabled`, `onClick`, `as` (link) |
| `Badge` | amber count / status chip | `tone` ("amber" \| "neutral"), `children` |
| `StatusDot` | small dot, amber when active/unread else neutral | `active`, `tone` |
| `Avatar` | initials block or photo | `name`, `src?`, `size` |
| `EmptyState` | one-line explanation + optional primary action | `title`, `hint?`, `action?` |
| `Skeleton` | shimmer at the widget/row shape (no spinners) | `variant` ("text" \| "row" \| "card"), `lines?` |
| `ErrorInline` | small "could not load, retry" inside a widget | `message?`, `onRetry` |
| `Field` | labelled input wrapper with inline validation | `label`, `error?`, `hint?`, `required?`, `children` (the control) |
| `Tabs` | tabbed switch (admin Checklists Templates/Assigned) | `tabs`, `active`, `onChange` |

---

## 5. Required state matrix (every component renders all of these)

Blueprint section 0 demands every state. For each interactive component, the Claude
Design pass and the port must render and the reference screen must demonstrate:

- **default**, **hover**, **focus** (visible focus ring), **disabled**,
  **selected/active**, **loading** (real skeleton, not a spinner), **empty**
  (considered typography, never a bare line or a dropped widget), **error**
  (inline retry inside the widget, never a whole-page crash).

`Widget` and `DataTable` carry an explicit `state` prop so a page can pass through
loading/empty/error from its data fetch. A widget with no data still renders at full
size with its empty state; it is never dropped.

---

## 6. Polish rubric (the quality bar, not just the rule checks)

From blueprint section 0. A screen/component is done only when: spacing is on a
consistent rhythm with optical alignment; one radius scale and one shadow scale;
loading uses real skeletons; focus rings are visible; every interactive row/button
has a hover state; empty states have considered typography; density matches the rest
of the product. If it would look out of place next to Linear, Stripe, or HR Partner,
it is not done.

---

## 7. The six reference screens (T1 to T6), built once and cloned thereafter

Built in Claude Design, locked, ported. These replace the foreign HR Partner
screenshots as the working reference; newcomers clone these for structure AND
quality. Suggested mapping to real first screens so the reference is also useful:

| template | reference screen to build | clones into |
|---|---|---|
| T1 ribbon | the admin dashboard ribbon | every dashboard top |
| T2 widget grid | the admin dashboard (`/admin`) full widget set | vendor/exec dashboards |
| T3 index list | Admin Meetings list (`/admin/meetings`) | every list screen |
| T4 detail | Admin Vendor detail (`/admin/vendors/[id]`), top gap today | exec/vendor details |
| T5 form | Admin Executive new (`/admin/executives/new`) | every create/edit |
| T6 checklist | Vendor Get started (`/vendor/get-started`) | admin checklist templates |

T7 reference already exists: the exec mockup. Build the six above only as far as the
kit needs to prove itself; full module behaviour comes later in blueprint section 4.

---

## 8. Open questions for Issy (recommendation-first; answer before the port)

1. **`--cream-*` fix approach.** Recommend the **temporary alias bridge** in
   `packages/tokens/src/portal.css` (section 3) plus a kit that uses only canonical
   tokens, over rewriting every usage in shells that get deleted anyway. Confirm, or
   prefer the full rewrite now.
2. **Server vs client components.** Recommend keeping presentational templates
   (`PortalPage`, `MetricsRibbon`, `Widget`, `EmptyState`, `Skeleton`) as server
   components and marking only the interactive ones (`PortalSidebar`, `DataTable`,
   `Tabs`, toggles) `"use client"`, so pages keep server-side data fetching.
   Confirm, or prefer an all-client kit for simplicity.
3. **Avatars.** The exec components use DiceBear-generated avatars; the admin
   sidebar uses initials. Recommend the kit `Avatar` defaults to **initials** (no
   external image dependency) with an optional `src`. Confirm.

None of these block writing the kit's API or the Claude Design pass; they shape the
port. I will not guess them.

---

## 9. Consolidation / deletion plan (part of "kit done")

- Delete `apps/platform/app/admin/_components/{sidebar,topbar,widgets,icons}.tsx`,
  `apps/platform/app/vendor/_components/{dashboard,icons}.tsx` shell/icon code, and
  the exec shell in `apps/platform/app/exec/_components/exec-dashboard.tsx`, moving
  any genuinely exec-only pieces (the email/RSVP surface) to compose the kit, not
  re-roll it.
- Move the custom icon set into `packages/ui/src/icons` (one copy).
- Fix the brand wordmark (TheGoodIntro) and remove the `⚠` emoji usages during the
  port (covered by the `check:copy` and no-emoji rules).
- Repoint every portal screen to import shell + templates + primitives from
  `@thegoodintro/ui`.

All of this lands behind the existing portal feature flags (off by default),
staging-first, Issy approves go-live (CHANGE_SAFETY.md).
```
