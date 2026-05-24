# theGoodintro — Admin Portal Build Brief

Build-ready brief for the admin portal. The reasoning and the wider platform
workflows live in [PLATFORM_WORKFLOWS.md](PLATFORM_WORKFLOWS.md); this doc is the
tight spec you build from. Last updated 2026-05-24.

## Purpose and audience

One internal portal where Issy (super admin) can **see and manage everything**,
with key workflows running from it. Audience is one today, a small staff later.
It is internal plumbing, not a customer surface, so it should be **functional and
fast** over polished.

## Build approach

- **Custom-built in the repo** (Next.js + Supabase), alongside the platform.
- Schema design is deferred for now; this brief stays at the workflow and layout
  level.
- It can reuse the existing design tokens (emerald accent, warm paper) for
  consistency, but does not need marketing-site craft.
- Security matters even though it is internal: **2FA for the super admin**, since
  it holds calendar tokens, payment data, and personal data.

## Global shell

Every screen shares one frame: a left sidebar, a top bar (global search,
notifications bell, account menu), and a main content area that changes per
section.

```
┌ theGoodintro Admin ──────────────────[search]─[🔔3]─[Issy ▾]─┐
│ ┌────────────┐                                              │
│ │ Dashboard  │   <- main content area changes per section   │
│ │ Requests ⬤2│                                               │
│ │ Meetings   │                                               │
│ │ Comms    ⬤5│                                               │
│ │ Vendors    │                                               │
│ │ Executives │                                               │
│ │ ─────────  │                                               │
│ │ Settings   │                                               │
│ └────────────┘                                               │
└────────────────────────────────────────────────────────────────┘
```

Sidebar order reads top to bottom as "what needs me today", then "my
directory", then "admin": Dashboard, Requests pending, Meetings, Comms, Vendors,
Executives, Settings. Count badges show where work is waiting. The bell carries
"new vendor / exec onboarded" and "meeting move requested" notifications.

## Role model

Same portal for everyone; **role decides what renders**.

- **Super admin (Issy):** everything, including the money ribbon and revenue
  columns.
- **Staff (later):** everything operational (requests, meetings, comms,
  vendors), with the money ribbon and revenue columns simply not rendered.

## Screens

### Dashboard

A **skinny metrics ribbon** across the top, then a **task table** below.

```
┌ DASHBOARD ───────────────────────────────────────────────────┐
│ ┌─ metrics ribbon (skinny) ─────────────────────────────────┐ │
│ │ 12 sched · 34 ahead · 87 done │ 18 vend · 25 ex │ $42k     │ │
│ │                               │              charity·$61k  │ │
│ └───────────────────────────────────────────────────────────┘ │
│  TASKS                                [ All ▾ ]  [ Cal | List ] │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Type         │ Who              │ Age  │ Action            │ │
│  │ Pending exec │ Vendor X → CFO Y │ 4d ⚠ │ Nudge · Move      │ │
│  │ Move request │ CEO Z meeting    │ 1d   │ Reschedule        │ │
│  │ Cancelled    │ Vendor A × COO B │ 2d   │ Rebook            │ │
│  │ New onboard  │ Exec: J. Smith   │  —   │ Set up profile    │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

- Ribbon metrics: meetings scheduled this month / booked ahead / completed;
  active vendors; active execs; total to charity; revenue this month and YTD.
  (Money segment hidden for staff.)
- Task table is the work surface; each row carries its own action button.
- Surfaces the "hidden but accessible" items as tasks rather than big cards:
  pending exec answers, move requests, cancellations, churn flags.
- `Cal | List` toggle swaps the table for a calendar of booked meetings.

### Requests pending

- Queue of vendor-to-exec requests waiting on the exec to action.
- Shows the 5-day follow-up status per row.
- Actions: nudge the exec, or action on their behalf.

### Meetings

The edit-bookings hub.

- Calendar / list toggle; filters by status, vendor, exec, and date range.
- Click a meeting to open a **detail drawer**: exec, vendor, date and time, Zoom
  or Teams link, the invite description, and actions: **Reschedule / move,
  Cancel, Resend invite**.
- A "needs rescheduling" filter catches meetings where a side declined or asked
  to move via the calendar invite (admin has visibility and access to move it).
- **Past meetings view** records the outcome per meeting: completed, no-show, or
  cancelled. This status triggers the donation release, the LinkedIn post, and
  the follow-up.

### Comms

- Shared-inbox style: conversation list on the left, thread on the right, assign
  to a staffer, internal notes, jump in.
- Powered by vendors emailing `support@thegoodintro.com`, which auto-forwards
  into the shared inbox surfaced here. A tool like Front or Help Scout can power
  it under the hood.

### Vendors

- List with status, bulk meetings purchased, credits used vs remaining, and
  payment status (which gates whether the exec list is unlocked).
- Vendor detail: package, remaining credits, access status, comms history.
- Vendors are vetted at onboarding (legitimate SaaS only), so there is no
  per-request approval gate.

### Executives

- List with status, chosen charity, "calendar connected?" flag, meeting count.
- Exec detail: profile (set up here at onboarding), onboarding status, calendar
  connection, charity, business-context notes, meeting history, EA linkage.
- **Capacity / cadence:** a per-exec meeting limit with remaining capacity
  visible, so vendors cannot over-book and burn out execs.

### Settings (internal use)

- Staff and roles, follow-up timing (5 days, editable), email templates,
  notification preferences.

## Operational must-haves (build into the data model early)

- **Activity / audit log:** who did what (moved a booking, edited a profile,
  marked a donation sent).
- **Reporting / export:** CSV and date-range reports for accounting, GST on the
  admin fee, and charity / investor reporting.
- **Onboarding pipeline status:** each exec and vendor moves through stages
  (invited, profile created, calendar connected, active).
- **Data deletion:** clean deletion of a vendor or exec record (Australian
  Privacy Act).

## Deferred and flagged

- **Finance and donations:** blocked on the charity flow (not yet confirmed).
  The fund-holding direction tensions with the "never touch the donations"
  positioning principle and is flagged pending in POSITIONING.md. Needs legal and
  accounting advice. A **Charities directory** (records, ACNC verification,
  payout details, per-charity totals) is deferred with it.
- **Staff portal:** build later; super admin only first.

## Visual draft (saved, build when ready)

A **static, non-interactive visual draft** of the dashboard exists in the repo,
to be built out properly when Issy is ready.

- **Route:** `/admin` — file [app/admin/page.tsx](app/admin/page.tsx). Run
  `npm run dev` and open `http://localhost:3000/admin`.
- **State:** static only. Buttons, toggles, and "View all" links are visual, not
  wired. No data layer, no auth yet.
- **Look (approved direction):** white dashboard canvas; emerald leads on the
  **sidebar** (deep emerald, loved), the **top bar**, and the **metrics bubble**
  ribbon; emerald used as accent elsewhere (links, calendar dots, tags).
- **Layout:** helicopter view. Metrics ribbon on top, then a 8/4 widget grid:
  Booked-meetings **calendar** (with Calendar/List toggle) and a **Needs action**
  table on the left; **Pending requests** and **Unresponded comms** quick-views
  on the right. Every widget links into its larger page.
- **Routing note:** `/admin` is a bare full-screen route. Made it opt out of the
  marketing chrome by adding `pathname.startsWith("/admin")` checks to
  `app/_components/page-shell.tsx`, `site-header.tsx`, and `site-footer.tsx`
  (mirrors how `/apply` opts out).
- **Open visual decision:** green share currently reads ~35-40% (white-led).
  Issy wanted closer to ~60%; can push green back up via accents (mint widget
  headers, emerald widget icons, faint mint wash behind cards) if desired.
- Not committed yet (offer: commit to a draft branch when wanted).

## Open pre-build items

- **Meeting source of truth:** decide whether the database is master (calendar
  mirrors it) or the calendar is master (DB listens for changes). Affects all of
  Meetings.
- **Admin 2FA.**
- **Volume check:** confirm current meeting volume actually justifies a custom
  build versus a lighter stopgap.
