# TheGoodIntro Portal Layout Blueprint (LOCKED visual + layout source of truth)

This document is the single source of truth for **how every portal screen is laid
out**. The three portal briefs (ADMIN_/VENDOR_/EXECUTIVE_PORTAL_BRIEF.md) own the
**workflows and content**. DATA_MODEL, STATE_MACHINES and CALCULATIONS own the
**logic and money**. This file owns the **layout and visual register**, and where
it conflicts with a brief on anything visual, **this file wins**.

It exists because the build came out thin in one specific way: dashboards had
wireframes, but the individual modules (lists, detail pages, forms, checklists)
had no layout spec, so they defaulted to "metrics ribbon plus one table." This
blueprint closes that gap by specifying every module screen.

## How to use this document

1. Read sections 1 to 3 once. They lock the register, the shared shell, and the
   template catalogue that every screen is assembled from.
2. For any screen you are about to design or build, find it in section 4. It tells
   you which template to use and the specific widgets, columns, sections, actions,
   and empty state for that screen.
3. **Design in Claude Design first** (claude.ai/design, live preview), one screen
   at a time, matching the template and the HR Partner reference. Lock the visual,
   then port into `apps/platform` at the route named in the screen spec. This
   follows the established design-tool division: visual iteration in Claude Design,
   port to repo once locked.
4. Every screen must satisfy the acceptance checklist in section 6 before it is
   considered done.

## The reference

The visual model is **HR Partner** (HRIS). The recovered screenshots live in
[`inspiration/hr-partner/`](inspiration/hr-partner/). When a screen spec says "HR
Partner model," open the named file and copy the **structure**, never the skin.

| pattern | reference file |
|---|---|
| dashboard widget grid | `03-admin-dashboard-overview.jpg`, `04`, `05` |
| index list table | `06-admin-employees-list.jpg`, `07-admin-employees-list-scrolled.jpg` |
| detail page (module rail + activity feed) | `10-employee-detail-modules-activity.png` |
| self-service profile | `08-employee-self-profile.jpg`, `09-employee-profile-bio-editor.png` |
| checklist screens | `11-employee-onboarding-checklist.jpg`, `12`, `13` |
| sign-up / first-run | `01-signup-page.jpg`, `02-trial-welcome-dashboard.png` |

---

## 0. Build-order gate (do this BEFORE any module screen)

A cold audit found the reason v1 looked thin: the shared component kit this
blueprint assumes DOES NOT EXIST. The shell is hand-rolled three times and has
already diverged (three sidebars, two `Widget` shells, raw Lucide icons in exec),
and the dashboards reference undefined `--cream-*` tokens so muted text renders
broken. Building modules before the kit exists guarantees the thin, inconsistent
result again. So, in order, before any module screen is built:

1. **Build `packages/ui`** (new) as the real, imported component kit: `PortalShell`,
   `PortalSidebar`, `PortalTopbar`, `PortalPage`, `MetricsRibbon`, `Widget`,
   `DataTable`, `RecordDetail`, `RecordForm`, `Checklist`, plus primitives `Button`,
   `Badge`, `StatusDot`, `Avatar`, `EmptyState`, `Skeleton`, `ErrorInline`, `Field`,
   `Tabs`. Documented props. **Every state rendered:** default, hover, focus,
   disabled, selected, loading (skeleton), empty, error.
2. **Delete the three hand-rolled `_components` shells** (admin/vendor/exec) and have
   every screen import from `packages/ui`. A second sidebar implementation is a bug.
3. **Fix the token layer.** Define the `--cream-*` tokens the existing dashboards use
   (or replace every usage with real `--portal-*` / `--muted-foreground`), and publish
   an exact token-to-Tailwind mapping so screens stop inline-styling every colour.
4. **Build one polished reference screen per template** (T1 to T6) on the real
   `--portal-*` tokens (the exec mockup is already the T7 reference). These are what
   newcomers clone for structure AND quality, replacing the foreign-product HR Partner
   screenshots as the working reference.

Iterate the kit and reference screens in Claude Design (live preview), lock them,
then port into `packages/ui`. Only after this gate is met does module-by-module
building (section 4) begin.

### Polish rubric ("comparable to a successful platform")

The section 6 checklist proves the rules were followed; it does not prove quality. A
screen is also done only when: spacing is on a consistent rhythm with optical
alignment; there is one radius and one shadow scale; loading uses real skeletons not
spinners; focus rings are visible; every interactive row/button has a hover state;
empty states have considered typography, not a bare line; and density matches the
rest of the product. If it would look out of place next to Linear, Stripe, or HR
Partner, it is not done.

## 1. The locked register (resolves the brief contradiction)

The three briefs disagreed: admin said "no marketing craft," vendor said "carry
marketing craft," exec said "full marketing craft." That disagreement is the
reason the portals had no consistent look. It is now resolved:

**All three portals use HR Partner information density, wearing the `--portal-*`
tokens.** Operational tool, not a marketing website. One register across admin,
vendor, and exec, so a component built for one looks at home in the others.

**Take from HR Partner:** persistent left side-nav, log straight onto a dense
dashboard, the helicopter widget grid, tight data tables, the detail page with a
left module rail and a right activity feed, the checklist screens.

**Never take from HR Partner:** its pink/purple palette, its cartoon icons, its
fonts. We use `--portal-*` tokens and the type ramp below, full stop.

### Tokens (from `packages/tokens/src/portal.css`, do not invent colours)

| role | token |
|---|---|
| page background (warm cream) | `--portal-page` |
| card / panel surface | `--portal-card` |
| metrics ribbon (dark near-black) | `--portal-ribbon`, light text on it |
| primary ink text | `--portal-ink` / `--foreground` |
| muted / secondary text | `--muted-foreground` |
| hairline borders | `--portal-line` |
| sidebar fill (per portal, see below) | admin `--primary` · vendor `--vendor-sidebar` · exec `--exec-sidebar` |
| accent, antique gold / soft champagne `oklch(0.78 0.07 85)`: badges, links, status dots, warnings | `--portal-amber` (name kept; value is now antique gold), soft `--portal-amber-soft`, ink `--portal-amber-ink` |
| primary buttons | ink (`--portal-ink`), light text |

**Per-portal sidebar colour** (updated 2026-06-08; supersedes the old "emerald
sidebar only" rule):

- **Admin** sidebar = brand emerald `oklch(0.42 0.13 158)` (LOCKED).
- **Vendor** sidebar = deep teal-pine `oklch(0.32 0.045 195)` (LOCKED
  2026-06-05). Companion tokens `--vendor-sidebar-soft oklch(0.42 0.06 195)`
  for hover/active wash, `--vendor-sidebar-ink oklch(0.96 0.02 195)` for text.
- **Exec** sidebar = charcoal ink `oklch(0.22 0.008 70)` (LOCKED 2026-06-08).
  Companion tokens `--exec-sidebar-text oklch(0.95 0.005 70)`,
  `--exec-sidebar-muted oklch(0.68 0.005 70)`,
  `--exec-sidebar-active oklch(0.30 0.008 70)` (active nav bg, with 3px
  `--portal-emerald` left border).
- **Forbidden for any portal:** purple/violet, blue, pink, bright yellow.

Stat cards are **never** plain white boxes; the headline metrics live in the
dark ribbon. Amber is the single accent and is a sanctioned exception to the
marketing site's emerald-only rule, portals only.

The exec portal has additional register rules (Fraunces section heads, italic
Inter eyebrows, mono uppercase in only two places per screen, no status pills,
no count chips, topbar content-empty on the right) — see
[`UI_KIT_DESIGN_LOG.md`](UI_KIT_DESIGN_LOG.md) Global decisions §"Editorial
concierge register for the exec portal".

### Type ramp (operational, not editorial)

| use | spec |
|---|---|
| body / table cells | Inter, 13 to 14px, line-height 1.4 |
| widget + section titles | JetBrains Mono, 11px, uppercase, `tracking-[0.18em]`, muted |
| page H1 (screen title) | Inter, 18 to 20px, semibold |
| big ribbon number | Inter semibold, 22 to 28px (Fraunces allowed for this one number only, never elsewhere) |
| micro labels / badges | JetBrains Mono, 10 to 11px, uppercase |

No Fraunces in module bodies. No marketing illustrations inside the portal. Icons
are the custom outline set (24x24, 1.6px stroke), Lucide allowed for generic
chevrons/arrows/plus/minus only. No emojis.

### Density rules (this is what "HR Partner density" means concretely)

- Table row height 44px; cell padding 12px horizontal, 10px vertical.
- Card padding 20 to 24px; card radius matches existing `Widget` shell.
- Widget header is a single row: mono uppercase title, optional amber count badge,
  optional right-aligned "→ all" link into the full module.
- Desktop dashboard grid is 12 columns, primary column `col-span-8`, rail
  `col-span-4`. Lists and detail pages are full width inside the content area.
- Mobile: everything stacks to a single column; the sidebar collapses to a
  top hamburger. No screen may be desktop-only.

---

## 2. The shared shell (build ONCE, used by all three portals)

The shell was hand-rolled three times in the current build. It must become one
component set in `packages/ui` (new) and be consumed by all three portals. Same
frame everywhere; only the sidebar items and the topbar widgets differ.

```
┌──────────────────────────────────────────────────────────────────────┐
│ SIDEBAR (per portal) │ TOPBAR  search · context widget · bell · avatar │
│ ┌──────────────────┐ ├─────────────────────────────────────────────────┤
│ │ ◐ logo / org     │ │  PAGE TITLE ROW   [breadcrumb]      [page action]│
│ │                  │ │                                                  │
│ │ ▸ nav item       │ │   CONTENT AREA                                   │
│ │ ▸ nav item  ⬤2   │ │   (dashboard grid | list table | detail | form) │
│ │ ▸ nav item ▾     │ │                                                  │
│ │    · child       │ │                                                  │
│ │    · child       │ │                                                  │
│ │ ▸ nav item       │ │                                                  │
│ │                  │ │                                                  │
│ │ … account block  │ │                                                  │
│ │ avatar · sign out│ │                                                  │
│ └──────────────────┘ │                                                  │
└──────────────────────────────────────────────────────────────────────┘
```

**Sidebar (`<PortalSidebar>`):** per-portal colour fill (admin emerald, vendor
teal-pine `--vendor-sidebar`, exec charcoal `--exec-sidebar`), ~240px wide,
fixed full height.
Org/logo block at top. Nav items are icon + label rows; the active item gets a
lighter emerald wash and a left indicator. Items that hold pending work show an
**amber count badge** on the right. Parent items (admin "Clients") expand to
indented children. Account block (avatar, name, role, sign out) pinned to the
bottom. Collapses to a top bar with a hamburger on mobile.

**Topbar (`<PortalTopbar>`):** thin, cream, sits above the content. Left: global
search. Middle/right: one portal-specific context widget (admin: nothing or env
label; vendor: credit balance; exec/EA: which exec they are acting for). Then a
notification bell with an amber dot when unread, then the user avatar menu.

**Page frame (`<PortalPage>`):** owns the title row (H1 + optional breadcrumb on
the left, optional primary page action button on the right) and the content slot.
Every module screen renders inside this frame.

**Back button (top-left, deeper-than-first-level routes only, added 2026-06-04).**
Any route deeper than the first-level sidebar item (vendor detail, executive
detail, meeting detail, template editor, new-meeting / new-executive forms, etc.)
renders a 32px thin row ABOVE the breadcrumb containing a `← Back` ghost button.
20px chevron-left outline icon (1.6px stroke, `--portal-ink`) + 8px gap + `Back`
label (Inter 14px semibold, `--portal-ink`). No fill, no border; hover = subtle
`--portal-card-hover` background; focus ring visible. Click navigates to the
**parent route** (the first-level sidebar item for that section, derived from
the breadcrumb's penultimate item — e.g. `/admin/vendors/VEN-1044` Back →
`/admin/vendors`). **NOT browser history** — deterministic, so the same page
always has the same Back destination regardless of how the user arrived.
In-page tabs (Settings sub-tabs like `/admin/settings/integrations`) do NOT
count as deeper levels; back button is hidden on them. Inbox conversation
deep-links (`/admin/inbox/{conv_id}`) also do NOT count (same route, just
reading-pane swap). The existing in-editor right-side "← Back to list" buttons
on Templates editor / New Meeting / New Executive stay (Issy's call: both
affordances coexist; the global top-left button is canonical going forward but
no retroactive strip). Lives in the shared `<PortalPage>` component — never
re-implement per screen.

**Reuse, do not re-roll:** `<PortalSidebar>`, `<PortalTopbar>`, `<PortalPage>` are
defined once. A second sidebar implementation is a bug.

---

## 3. Template catalogue (every module screen is one of these)

These are the only layout archetypes in the portal. Each module screen in section
4 names which template it uses. Build each template once as a shared component,
then configure per screen.

### T1 — Metrics ribbon (`<MetricsRibbon>`)

Dark `--portal-ribbon` band across the top of a dashboard. A row of stat groups,
each: mono uppercase label + big number + optional sub-line ("12 sched · 34
ahead"). Light text on dark. This is the only place headline numbers live. Never
render headline stats as separate white cards.

### T2 — Dashboard widget grid (`<Widget>` shells on a 12-col grid)

HR Partner model: `03/04/05`. Ribbon (T1) on top, then a grid of `<Widget>`
cards. Primary column `col-span-8`, rail `col-span-4`. Each `<Widget>`:

```
┌─ WIDGET TITLE ⬤n ───────────────────────  →all ─┐
│  compact content: a short list, a mini table,    │
│  a mini calendar, or a donut. 4 to 6 rows max.    │
└───────────────────────────────────────────────────┘
```

Widgets are quick views into modules; clicking a row or "→ all" deep-links into
the full module. Count badge in amber when the widget holds work. A dashboard is
never just a ribbon plus one table; it is the full widget set for that portal as
listed in section 4.

### T3 — Index list (`<DataTable>`)

HR Partner model: `06/07`. A dense table that is the home of a collection.

```
PAGE TITLE                                     [filter ▾] [+ New X]
┌────────────────────────────────────────────────────────────────┐
│ ▢  avatar/code   primary field   secondary   …   status   ⋯     │  header row (mono)
├────────────────────────────────────────────────────────────────┤
│ ▢  ◐ AB          Name            Role         …   ● Active  ⋯     │  44px rows
│ ▢  ◐ CD          Name            Role         …   ◌ Pending ⋯     │
└────────────────────────────────────────────────────────────────┘
                                              ‹ 1 2 3 … ›  pagination
```

Required: column headers in mono uppercase; status as an amber/neutral pill;
optional row checkbox for bulk; a right-side row-action menu; a filter control;
the primary "+ New" action top-right; **pagination** (the current build fetches
unbounded, that is a defect). Clicking a row opens that record's detail (T4).

### T4 — Detail page (`<RecordDetail>`: header band + module rail + activity feed)

HR Partner model: `10`. The richest template, and the one most missing today.
This is how you view and edit one record (a vendor, an executive, a meeting).

```
┌─ HEADER BAND ───────────────────────────────────────────────────────┐
│ ◐ avatar   Name / title            key:val   key:val      [Edit] ⋯   │
│            status pill · tags                key:val   key:val        │
├──────────────┬───────────────────────────────────┬──────────────────┤
│ MODULE RAIL  │  ACTIVE MODULE PANEL               │ ACTIVITY FEED    │
│ ▸ Overview   │  the selected module's content     │ • added X  6m    │
│ ▸ Module B   │  (fields, sub-table, or form)      │ • changed Y 9m   │
│ ▸ Module C ⬤ │                                    │ • note Z   1d    │
│ ▸ Module D   │                                    │                  │
│ …            │                                    │                  │
└──────────────┴───────────────────────────────────┴──────────────────┘
```

Left rail lists this record's modules (sub-sections), badge when one needs
attention. Centre shows the active module. Right is an append-only activity feed
(who changed what, when). The header band carries identity, key facts as
label:value pairs, status, tags, and the primary actions. Modules listed per
record type in section 4.

### T5 — Form (`<RecordForm>`)

Used for create and edit. Two-column field grid on desktop, single column mobile.
Section headers in mono uppercase group related fields. Inline validation under
each field. Sticky action bar at the bottom (Save primary ink button, Cancel
ghost). Used by "+ New executive," vendor application, profile editing.

### T6 — Checklist (`<Checklist>`)

HR Partner model: `11/12/13`. A list of checklist items, each with a checkbox, a
label, and a right-side affordance (upload dropzone, "sign document" button, or a
link). A progress header ("3 / 6 · 50%") on top. Used for vendor "Get started"
onboarding and admin checklist templates/assigned.

### T7 — Email / confirm surface (`<EmailSurface>`, exec only)

The exec product is the email and its confirm page, not a dashboard. Reproduce
the existing exec mockup (`apps/web/app/mockup/exec`, `/rsvp`, `/email`)
component-for-component. Single centred column, concierge tone, the three actions
(Accept / Decline / Send to EA), the charity line pulled live from the tier model.
Details in EXECUTIVE_PORTAL_BRIEF.md and EMAIL_ACTIONS.md.

### Cross-cutting: every screen ships three states

Because data is sparse early and "it does not matter if there is not enough data
to fill it out," the layout must hold up empty. **Every widget, table, and panel
must define and ship:**

- **Empty state:** a one-line explanation + the primary action ("No requests yet.
  When a vendor requests a meeting it appears here."). Never a blank box, never a
  collapsed widget. A widget with no data still renders at full size with its empty
  state, it is never dropped.
- **Loading state:** a skeleton at the widget/row shape (the current build has
  none).
- **Error state:** a small inline "could not load, retry" inside the widget, never
  a whole-page crash (the current server pages throw on a DB error).

---

## 4. Per-portal, per-module layout spec

Each row names the screen, its route in `apps/platform`, the template from section
3, and the specifics. Build every screen listed. None may be dropped or merged.

### 4A. ADMIN portal (Issy's cockpit)

Sidebar order (top to bottom = "what needs me today" then directory then admin):
**Dashboard · Requests · Meetings · Comms · Clients ▾ (Vendors / Executives) ·
Checklists · Giving · Charities · Settings.**

| screen | route | template | specifics |
|---|---|---|---|
| **Dashboard** | `/admin` | T1 + T2 | Ribbon: meetings scheduled this month / booked ahead / completed · active vendors · active execs · total to charity · revenue MTD + YTD. Widgets: **Needs action** (aging items, RED dot on manual follow-ups), **Booked meetings** (Cal\|List toggle), **Pending requests**, **Unresponded comms**, **Recent onboards**, **Gifts sent**, plus a **distributions** widget of 4 small donuts (meeting status, vendors by package, exec capacity, charities supported). This is the existing brief wireframe; keep all widgets. |
| **Requests** | `/admin/requests` | T3 → T4 | List of meeting requests; columns: vendor · exec · status · age · last action. Row opens request detail (T4) with the Q1/Q2 context, the routing, and actions (nudge, close). *(Route missing today, add it.)* |
| **Meetings** | `/admin/meetings` | T3 → T4 | Columns: vendor · exec · date · status (proposed/confirmed/held/...) · credit · gift. Detail (T4) drives the state machine: confirm time, mark held/no_show, reverse. Detail is currently a drawer stub, build it as T4. |
| **Comms** | `/admin/comms` | T3 | Inbox of unresponded threads; columns: who · subject · age · channel. Amber dot on unanswered. *(Route missing today, add it.)* |
| **Vendors (list)** | `/admin/vendors` | T3 | Columns: org · primary contact · status (signed_up→active) · credits · meetings · joined. Filter by status. "+ New" optional. |
| **Vendor (detail)** | `/admin/vendors/[id]` | T4 | **Stub today, this is a top gap.** Header: org, status, contact, tags. Module rail: Overview · Users/Seats · Requests · Meetings · Billing/Credits · Checklist · Notes. Activity feed of account changes. |
| **Executives (list)** | `/admin/executives` | T3 | Columns: name · title · company · charity · status · meetings. |
| **Executive (detail)** | `/admin/executives/[id]` | T4 | **Stub today, top gap.** Header: name, title, company, photo, status, tags. Module rail: Overview · Business context · Charity · Calendar/EA · Requests · Meetings · Consent record · Notes. Activity feed. |
| **Executive (new)** | `/admin/executives/new` | T5 | Onboarding form (we set execs up for them): name, title, company, photo, context notes, standing charity, calendar connect, EA details, consent settings. |
| **Checklists** | `/admin/checklists` | T3 + T6 | Two tabs: **Templates** (T3 list of templates → T6 editor) and **Assigned** (T3 list of who has what, progress per row). |
| **Giving** | `/admin/giving` | T3 → T4 | Gift records; columns: meeting · charity · amount (locked from band) · status (released/paid/voided) · date. Row action: mark paid. Detail shows the snapshot. |
| **Charities** | `/admin/charities` | T3 + T5 | List of DGR-endorsed charities + add/edit form. |
| **Settings** | `/admin/settings` | T5 | Account, security (`/account/security` already exists), feature flags view, staff (later). |

### 4B. VENDOR portal (paying SaaS vendors)

Sidebar order: **Dashboard · Get started · Leaders 🔒 · Requests · Meetings ·
Giving**, then account-level **Team · Billing · Settings**. Say "Leaders," never
"Executives." "Leaders" and "Requests" are visible but gated (lock icon) until the
vetting + payment gate is passed; gated pages show the unlock-path state, not a
404.

| screen | route | template | specifics |
|---|---|---|---|
| **Dashboard** | `/vendor` | T1 + T2 | Skinny ribbon: credits remaining · meetings booked · band progress · total to charity. Widgets: **Your leaders** (status of requested execs), **Pending requests**, **Upcoming meetings**, **Your impact** (gifts funded). Band progress must be a real progress bar, not a text note (current defect). |
| **Get started** | `/vendor/get-started` | T6 | Onboarding checklist, attached at payment. Progress header. Recedes from the sidebar once complete. *(Route missing today.)* |
| **Leaders (list)** | `/vendor/executives` | T3 | Browse executives; columns: name · title · company · charity · request status badge. Gated until active. Row opens leader detail / request. |
| **Leader (detail + request)** | `/vendor/executives/[id]` | T4 + T5 | Header: exec identity + business context (read-only). Request form (T5): Q1 (who we are, 300 char) + Q2 (why you, 300 char), shows the live gift amount for this vendor's current tier. |
| **Requests** | `/vendor/requests` | T3 | This vendor's submitted requests; columns: leader · status · age · last update. *(Route missing today.)* |
| **Meetings** | `/vendor/meetings` | T3 → T4 | This vendor's meetings; columns: leader · date · status · gift. Detail shows outcome + the gift funded. *(Route missing today.)* |
| **Giving** | `/vendor/giving` | T2/T3 | Display and reporting only (no payment UI for vendors here beyond credits). Total funded, per-meeting gift list, charities supported. |
| **Team** | `/vendor/team` | T3 + T5 | Seats: list users, roles (org admin vs seat), invite. *(Route missing today.)* |
| **Billing** | `/vendor/billing` | T3 | Credits, invoices (MYOB), top-up. Org-admin only. *(Route missing today.)* |
| **Settings / Profile** | `/vendor/settings` | T5 | Editable in every account state, including pre-approval. Org and personal profile. |
| **Application** | `/vendor/application` | T5 | The vetting application form (exists). Part of the gate. |

### 4C. EXECUTIVE portal (senior leaders + EAs, email-first)

The exec surface is **email-first**; the dashboard is the quiet secondary place,
the EA is its heavier user. Build the email surface to the same bar as a screen.

| screen | route | template | specifics |
|---|---|---|---|
| **Request email** | (email) `/e/[token]` | T7 | The primary product. The signed-token confirm page: vendor context, the verified requester or named delegate, the live charity line, the three actions (Accept / Decline / Send to EA). Reproduce the exec mockup. Capture consent on first action (one-line "by continuing you accept the Terms," timestamped). |
| **Confirm / RSVP** | `/exec/rsvp` | T7 | **Unfinished today.** The accept/decline confirm landing. Build to the mockup. |
| **Dashboard** | `/exec` | T1 + T2 | Quiet helicopter view: standing charity nomination (with picker), incoming requests, upcoming meetings, impact/donations timeline. Exists as a demo; needs real per-exec auth (today it is a hardcoded demo exec, a defect). |
| **Impact** | `/exec/impact` | T2 | Read-only: the Good their meetings have funded, charities supported. LinkedIn one-click share after a meeting. *(Route missing today.)* |
| **Charity picker** | within Dashboard | T5 | Set/change standing charity (DGR-endorsed list). |
| **Profile** | `/exec/profile` | T4/T5 | Mostly set up for them; light edit of context + charity + EA. Self-service profile uses the HR Partner `08/09` model. *(Route missing today.)* |
| **EA view** | shares `/exec/*` | — | The EA signs in and acts for the exec; same screens, scoped to the exec(s) they manage. Topbar shows which exec they are acting for. |

---

## 5. What this fixes versus the current build (so we do not regress)

- Module screens that were thin "ribbon + one table" now have T3/T4/T5/T6 specs.
- The vendor and executive **detail pages** (stubs today) are specified as T4.
- `/exec/rsvp` (unfinished today) is specified as T7.
- The shell is specified as one shared component set, not three copies.
- Every screen must ship empty/loading/error states (none exist today).
- Tables get pagination (unbounded fetches today).
- Exec dashboard gets real per-user auth (hardcoded demo today).
- The design register is locked, ending the three-way brief contradiction.

These are layout/structure fixes. Data sparsity is fine; the empty states carry it.

## 6. Acceptance checklist (every screen, before it is "done")

- [ ] Uses the shared shell (`<PortalSidebar>`/`<PortalTopbar>`/`<PortalPage>`),
      no re-rolled sidebar.
- [ ] Matches its template from section 3 and the named HR Partner reference.
- [ ] Only `--portal-*` tokens; per-portal sidebar colour (admin emerald,
      vendor `--vendor-sidebar`, exec `--exec-sidebar`); ribbon dark, not
      white cards; amber is the only accent. Exec portal screens follow the
      additional "editorial concierge" register rules (see
      [`UI_KIT_DESIGN_LOG.md`](UI_KIT_DESIGN_LOG.md)).
- [ ] Type ramp respected (Inter body, mono uppercase labels, no Fraunces in
      bodies).
- [ ] HR Partner density (44px rows, tight cards, no marketing whitespace).
- [ ] Ships empty + loading + error states; no widget is dropped when data is
      missing.
- [ ] Responsive: usable single-column on mobile, sidebar collapses.
- [ ] Tables paginate; detail pages have the module rail + activity feed.
- [ ] Built from the `packages/ui` kit (section 0), not a hand-rolled shell.
- [ ] Passes the section 0 **polish rubric** (optical spacing, all states, focus
      rings, real skeletons), not only the rule checks above.
- [ ] Built behind a feature flag OFF by default; staging first; Issy approves
      go-live (CHANGE_SAFETY.md).

---

*Layout and visual register live here. Workflows live in the portal briefs. Logic
and money live in DATA_MODEL / STATE_MACHINES / CALCULATIONS. When visual guidance
conflicts, this file wins.*
