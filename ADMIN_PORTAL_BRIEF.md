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
- **AI agents do the legwork; Issy reviews and sends.** A recurring pattern across
  the portal: an agent drafts the work (proposed meeting times, a decline email's
  body / subject / recipient, follow-up copy) and presents it as a **task**, and
  Issy **reviews and confirms / sends**. The human stays in control of anything
  that leaves the platform; the agent removes the typing. The goal is "the less
  work for me, the better".
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
│ │ Clients  ▾ │   <- expands to:                              │
│ │  · Vendors │                                               │
│ │  · Execs   │                                               │
│ │ Checklists │   <- Templates / Assigned                     │
│ │ ─────────  │                                               │
│ │ Settings   │                                               │
│ └────────────┘                                               │
└────────────────────────────────────────────────────────────────┘
```

Sidebar order reads top to bottom as "what needs me today", then "my
directory", then "admin": Dashboard, Requests pending, Meetings, Comms,
**Clients**, **Checklists**, Settings. **Clients** is a collapsible parent that expands to two
children, **Vendors** and **Executives** (mirroring HR Partner's expandable
"Employees" group). Both sides of the network are clients of theGoodintro, so
they live together under one heading. Count badges show where work is waiting.
The bell carries "new vendor / exec onboarded" and "meeting move requested"
notifications.

This **persistent side-menu plus land-straight-on-the-dashboard** flow follows
the HR Partner reference (attached screenshots): the navigation is always present
on the left, and login drops you onto the helicopter dashboard rather than a menu
or splash. We take that structure, not HR Partner's colours or icons (see the
Dashboard reference guardrails).

## Role model

Same portal for everyone; **role decides what renders**.

- **Super admin (Issy):** everything, including the money ribbon and revenue
  columns.
- **Staff (later):** everything operational (requests, meetings, comms,
  vendors), with the money ribbon and revenue columns simply not rendered.

## Screens

**You land here on login.** No splash, no menu to choose from: sign in and the
dashboard loads. It is the **helicopter view of the whole platform**, a metrics
ribbon across the top and then a grid of **colour-coded data cards**, each one a
**hyperlink into its full module**. Reference for the layout and data density:
**HR Partner** (the attached screenshots, see Dashboard reference below). Take
their structure, never their look.

```
┌ DASHBOARD ─────────────────────────────────────────────────────────┐
│ ┌─ metrics ribbon (skinny) ───────────────────────────────────────┐ │
│ │ 12 sched · 34 ahead · 87 done │ 18 vend · 25 ex │ $42k charity   │ │
│ │                               │              · rev $61k MTD/YTD  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│  ┌─ NEEDS ACTION ⬤7 ───────────┐  ┌─ BOOKED MEETINGS [Cal|List] ──┐ │
│  │ Pending exec  VX→CFO Y  4d⚠ │  │  calendar of upcoming meetings │ │
│  │ Move request  CEO Z     1d  │  │  (click a meeting → drawer)    │ │
│  │ Cancelled     VA×COO B  2d  │  └────────────────────────────────┘ │
│  │ New onboard   J. Smith  ·   │  ┌─ DISTRIBUTIONS ────────────────┐ │
│  └─────────────────────────────┘  │ ◔ meeting status  ◔ vendors    │ │
│  ┌─ PENDING REQUESTS  →all ────┐  │ ◔ exec capacity   ◔ charities  │ │
│  │ Vendor X → CFO Y    4d ⚠     │  └────────────────────────────────┘ │
│  │ Vendor Q → CIO R    2d       │  ┌─ UNRESPONDED COMMS ⬤5  →inbox ─┐ │
│  └─────────────────────────────┘  │ Vendor A  "credits?"   1d      │ │
│  ┌─ RECENT ONBOARDS  →directory┐  │ Vendor C  "reschedule" 3d ⚠    │ │
│  │ + Exec J. Smith (set up)     │  └────────────────────────────────┘ │
│  │ + Vendor Acme (active)       │  ┌─ GIFTS SENT  →giving ──────────┐ │
│  └─────────────────────────────┘  │ $1,200 → Beyond Blue  ✓ 18 May │ │
│                                    └────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

- **Metrics ribbon:** meetings scheduled this month / booked ahead / completed;
  active vendors; active execs; total to charity; revenue this month and YTD.
  (Money segment hidden for staff.)
- **Every card is a doorway.** Each widget is a compact, scannable view of one
  module that **links straight into the full module** (a "→ all" / header link,
  exactly like HR Partner's cards). The dashboard is for taking in the whole
  platform at a glance, not for doing deep work in place.
- **Colour carries meaning, sparingly.** Use emerald for healthy / done, a warm
  amber for "needs attention soon", and a clear red only for overdue / at-risk,
  with a **count badge** on cards that hold work (Needs action ⬤7, Comms ⬤5),
  mirroring HR Partner's "17 Overdue" treatment. Status, never decoration.
- **Needs action** is the work queue: pending exec answers, **confirm-a-time
  tasks** (after an exec accepts), **AI-drafted decline emails to send**, move
  requests, cancellations, new onboards needing setup, and **RED manual-follow-up
  tasks** (raised after a request's third unanswered follow-up). Each carries its
  own action and an age with an overdue flag.
- **Booked meetings** keeps the `Cal | List` toggle; clicking a meeting opens the
  Meetings detail drawer.
- **Distributions** are small donut charts (meeting status, vendors by package,
  exec capacity used, charities supported) for the at-a-glance read HR Partner
  gets from its donuts, in our palette.
- **Pending requests**, **Unresponded comms**, **Recent onboards**, and **Gifts
  sent** are quick-view cards into Requests, Comms, the directories, and Giving.

#### Dashboard reference (HR Partner) and the guardrails

What we are taking from the HR Partner screenshots, and what we are not:

- **Take:** a persistent left side-menu, logging straight into the dashboard, a
  helicopter grid of self-contained data cards, count badges for overdue work,
  donut charts for distributions, and every card linking into its larger module.
- **Do not take:** HR Partner's **pink and purple** palette (purple is forbidden,
  it reads as MeetMagic), their cartoon / clip-art icons, or their density-for-
  density's-sake. We keep **emerald on warm paper**, the custom outline icons,
  and white space. The pattern is theirs; the craft and palette stay ours.

#### Dashboards across all three portals

The hyperlinked-card helicopter pattern is the **shared model for every portal's
dashboard**, tuned to each audience's density:

- **Admin (this doc):** the fullest version, the whole platform at a glance.
- **Vendor** ([VENDOR_PORTAL_BRIEF.md](VENDOR_PORTAL_BRIEF.md)): the same idea,
  scoped to the vendor's own requests, meetings, credits, and giving.
- **Executive** ([EXECUTIVE_PORTAL_BRIEF.md](EXECUTIVE_PORTAL_BRIEF.md)):
  deliberately the **lightest** version, a calm single-column home, since the
  exec surface is email-first. It borrows the "land on it, cards link onward"
  principle but never the data density.

### Requests pending

- Queue of vendor-to-exec requests waiting on the exec to action.
- **On submit, the request appears here**, and Issy can **see the exact email
  that was sent** to the exec (the vendor's three form answers).
- **Automated follow-up sequence to the exec:** up to **three follow-up emails,
  each 4 days apart** (roughly days 4, 8, 12 after the initial). The row shows
  which follow-up is next and when. The **requesting user is auto-emailed an
  update at each follow-up**, so the vendor sees we are chasing it.
- **After the third follow-up with no response, a RED task is raised** on the
  dashboard's Needs action queue as a **manual step for Issy to follow up**.
- Actions: nudge the exec, or action on their behalf.

### Scheduling (AI-assisted, admin-confirmed)

When an exec **accepts**, the booking is not fully automatic; it routes through
Issy as a quick task:

- An **AI agent pulls the exec's availability** from their calendar (free/busy
  plus the per-exec rule) and raises a **"confirm a time" task** with proposed
  slots.
- **Issy reviews and confirms** a slot; that sends the **calendar invite to both
  parties**. The vendor-side invite goes to **both vendor emails**: the requesting
  user and, if the request was on behalf of someone else (Q3 = b), the named
  attendee.
- This is the agreed model (light human confirm), and it supersedes the earlier
  "auto-book with no confirm" note in PLATFORM_WORKFLOWS.

### Decline handling (AI-drafted, admin-sent)

When an exec **declines**, they can add an **optional reason** ("not relevant / no
capacity / bad timing"), shared back to Issy as a task:

- The task is **half-done by an AI agent**: it drafts the **email body, subject
  line, and recipient** (the requesting user) to let the vendor down gracefully.
- **Issy reviews and sends.** The draft-then-review pattern keeps the human in
  control of anything that leaves the platform, with the AI doing the typing.

### Meetings

The edit-bookings hub, and **the calendar is the platform's shared source of
truth**, so this is one of the **biggest things to build on the admin portal**.

- **Calendar source of truth (core build):** the booked meeting lives in both
  parties' real calendars (Google / Outlook) and on the platform. If either side
  **moves or cancels the event in their own calendar**, that change must **sync
  back** and be reflected in admin Meetings, the vendor's Meetings, and the exec's
  view. Designing this two-way sync is a priority, not an afterthought.
- Calendar / list toggle; filters by status, vendor, exec, and date range.
- Click a meeting to open a **detail drawer**: exec, vendor, date and time, Zoom
  or Teams link, the invite description, and actions: **Reschedule / move,
  Cancel, Resend invite**.
- **Reschedule / cancel (v1):** when either side asks to move or cancel (via the
  calendar, a reply, or the EA), it **raises a rebook task for Issy**, who
  re-coordinates and re-confirms a time. The vendor and exec see the resulting
  state. No credit is affected (a credit is only consumed once a meeting is sat).
- **Outcome capture:** the **Zoom / Teams call reports attendance via API**, which
  feeds the meeting outcome (completed / no-show), rather than Issy guessing. A
  **no-show is also reported by the vendor emailing us** (Comms). The outcome is
  what consumes a credit and triggers the (manual) gift release and follow-up.

### Gift record (one source, many views)

When a meeting is marked **sat** and the gift released, a **single canonical gift
record** is created (meeting, exec, charity, amount per the pricing tier at meeting
time, date, confirmation). Every surface is a **read-only view of this one
record**: the **vendor's Giving**, the **executive's impact** view, and the
**public impact numbers**. No surface stores its own copy, so the gift can never
drift across portals. (Gift release itself is manual in v1; the record is the
thing all portals read.)

### Giving (donations & payout runs)

The charity flow is now confirmed (donation model, see
[CHARITY_FLOW.md](CHARITY_FLOW.md)), so this module is **in scope**. Its job is to
tell Issy **how much to donate to each charity** for a given week or month, and to
track each donation through to a filed receipt. theGoodintro is the donor.

- **Builds on the canonical gift record.** Each meeting marked *sat* already creates
  one gift record (exec, charity, amount per tier, date). This module is the
  operational view over those records, it does not store its own copy.
- **Payout run (the core view):** pick a period (this week / this month / custom).
  The module **groups all unpaid gift records by charity** and shows:

| Charity (national entity) | ABN | Gifts in period | Total to donate | Saved payee / EFT | Action |
|---|---|---|---|---|---|

  This single screen answers "how much do I send each charity this period". The
  **Total to donate** column is the exact figure Issy transfers per charity.
- **Mark as paid:** after transferring, Issy marks that charity's line paid, enters
  the **payment date**, and **uploads the receipt** the charity issued to
  theGoodintro Pty Ltd. That flips those gift records from **Released** to **Paid**.
- **Gift record status:** *Released* (meeting sat, gift committed and owed) → *Paid*
  (donated, receipt on file). Public impact numbers count committed gifts; Paid
  confirms the gift and carries the receipt for the tax deduction.
- **Charities directory:** the 15 nominated charities as records, each holding the
  **legal entity name, ABN, DGR-confirmed date**, saved donation/EFT details
  (verified once, reused), and a **per-charity running total** (this period and
  all-time). Enforces the **national-entity-only rule** (one payee per charity,
  never a state arm) and surfaces a reminder to **re-verify DGR** periodically.
- **Cadence setting:** weekly or monthly payout run, chosen in Settings, matching
  whatever donation rhythm Issy runs.
- **Export for the accountant:** per-charity, per-period CSV plus a total-donations
  figure for the company tax deduction and the BAS.
- **Manual in v1:** marking a meeting sat and running the payout are manual; the
  platform aggregates and records, Issy reviews and pays (the draft-then-confirm
  pattern). The per-gift runbook behind each line lives in CHARITY_FLOW.md.

#### How each gift amount is calculated (tier build-up)

> **The authoritative financial source of truth is [CALCULATIONS.md](CALCULATIONS.md)**,
> which defines every money figure and count with formulas, worked proofs, and
> reconciliation checks. This section is the summary; if the two ever disagree,
> CALCULATIONS.md wins.

This is the math behind every gift amount and every payout total.

**The tiers (per vendor, per calendar year):**

| Band | Held meetings in the year | Gift to the chosen charity | theGoodintro keeps |
|---|---|---|---|
| 1 | 1 to 5 | $900 | $600 |
| 2 | 6 to 10 | $1,000 | $500 |
| 3 | 11 to 15 | $1,100 | $400 |
| 4 | 16 or more | $1,200 | $300 |

Every meeting is a flat $1,500 fee. The split above is how much of that fee becomes
the charity gift versus theGoodintro revenue. Under the donation model the whole
$1,500 is our revenue and the gift is a donation we make; the split is for
transparency and for working out the gift amount, not a separate pot of money.

**Copy flag:** the live pricing page FAQ currently says the tier "resets each
calendar year". That wording is wrong under the rolling 12-month-from-first-payment
rule below and needs aligning to "12 months from your first purchase" on the next
copy pass.

**The rules that govern the count:**

- **Marginal, never retroactive.** Each meeting is priced by the band its own
  position falls into. Crossing into a new band does not re-price earlier meetings.
- **Per vendor, per rolling 12-month cycle.** The count is each vendor's running
  tally of held meetings within their current cycle. A vendor's cycle starts on the
  date of their **first payment** and renews every 12 months from that date. At each
  renewal the count resets to 0, so the next held meeting is back at band 1 ($900).
  (Not the calendar year.)
- **Later purchases never re-anchor the cycle.** The 12-month clock always runs from
  the vendor's first-ever purchase. Buying more credits mid-cycle does not extend or
  reset it. Example: a vendor buys 6 credits today and 6 more in six months; all 12
  sit in the same cycle (the one anchored today), and the band keeps building as
  meetings are held, up to the 12-month renewal of that first purchase.
- **Counted on "sat", in order.** Only a held (sat) meeting increments a vendor's
  count, in the order meetings are marked sat (tie-break by the sat timestamp).
  No-shows, cancellations, and reschedules never increment it, and pre-purchased
  credits (tokens) do not advance the tier: buying 16 upfront does not start you at
  band 4.
- **Carried-over credits reset to band 1, and never expire.** Unused credits are not
  lost; they carry forward indefinitely (no expiry, by design, to keep setup simple).
  But because the count resets at each renewal, carried credits are priced from
  **band 1** as they are used. Delaying meetings into a new cycle therefore lowers
  the gift on those meetings rather than continuing up the bands.
- **Locked at meeting time.** The moment a meeting is marked sat, its gift amount is
  locked from the band its position lands in and written onto the gift record.
  Nothing later changes it.
- **One charity per meeting.** Each gift goes to the charity the executive nominated
  for that specific meeting, so one vendor's meetings can fund several charities.

**Per-meeting amount (the algorithm), run once when a meeting is marked sat:**

```
n = the vendor's count of held meetings in their current 12-month cycle, including this one (1-based)

gift = $900     if n <= 5
       $1,000   if 6  <= n <= 10
       $1,100   if 11 <= n <= 15
       $1,200   if n >= 16

charity = the executive's nominated charity for this meeting
```

It writes `gift` and `charity` onto the gift record, which is the single canonical
record every surface reads.

**Projected amount (what the vendor portal and the executive request email/portal
show before a meeting is held):**

The locked amount is only known once a meeting is sat. Before that, both surfaces
show a *projected* gift, computed from the **requesting vendor's** current position:

```
held = the requesting vendor's count of held meetings in their current cycle
projected = band(held + 1)        // the rate their next held meeting will earn
```

- This is the vendor's **current tier rate**: what their next held meeting sends to
  charity ($900 to $1,200).
- It is **indicative, not locked.** Show it as "approximately $X". The exact figure
  is set when the meeting is sat, and can differ if other meetings are sat first
  (a higher band) or the vendor's 12-month cycle renews in between (resets to $900).
- It depends on the **requesting vendor's** tier, not the executive, so the same
  charity can receive different gift sizes from different vendors.
- Read it from the live tier model, never hardcoded (CLAUDE.md rule). The per-surface
  display wording lives in the vendor and executive portal briefs.

**Payout run (what to pay each charity for a period):**

```
1. Select gift records that are Released (meeting sat) and not yet Paid,
   with a sat date inside the chosen period (this week / month / custom).
2. Group them by charity (national entity + ABN).
3. Sum the locked gift amounts within each group.
4. Output one row per charity: number of gifts, total to donate, saved payee.
```

The "total to donate" per row is exactly what Issy transfers to that charity.
Because amounts are locked at sat time, the payout is a plain sum with no tier
recalculation needed.

**Worked example A (one vendor, one charity).** Vendor A holds 7 meetings this year,
all nominating Royal Flying Doctor Service:

- Meetings 1 to 5: 5 x $900 = $4,500
- Meetings 6 to 7: 2 x $1,000 = $2,000
- RFDS receives $6,500 from Vendor A so far this year.

**Worked example B (one payout run, mixed vendors and charities).** These meetings
are sat and unpaid in the period:

| Meeting | Vendor's held-count | Band | Gift | Chosen charity |
|---|---|---|---|---|
| Vendor A, 6th | 6 | 2 | $1,000 | Cancer Council |
| Vendor A, 7th | 7 | 2 | $1,000 | RFDS |
| Vendor B, 1st | 1 | 1 | $900 | Cancer Council |
| Vendor B, 2nd | 2 | 1 | $900 | RFDS |

Grouped by charity, the payout run shows:

| Charity | Gifts | Total to donate |
|---|---|---|
| Cancer Council | 2 | $1,900 |
| Royal Flying Doctor Service | 2 | $1,900 |
| Total to disburse | 4 | $3,800 |

**Worked example C (carry-over across cycles).** A new vendor buys 16 credits and
pays $24,000 upfront ($1,500 x 16). In their first 12-month cycle they hold only 10
meetings:

- Meetings 1 to 5: 5 x $900 = $4,500
- Meetings 6 to 10: 5 x $1,000 = $5,000
- Cycle 1 donated: $9,500. The 6 unused credits carry over.

At the 12-month renewal the count resets to 0. The 6 carried credits are now priced
from band 1, so as they are used in cycle 2: 5 x $900 + 1 x $1,000 = $5,500. Across
both cycles the 16 credits donate $15,000, which is $1,200 less than the $16,200 they
would have donated had all 16 been held inside one cycle. This is intended: the band
build-up rewards using meetings within a cycle.

**Reconciliation checks (so the numbers always tie out):**

- The sum of every gift amount in a period equals the sum of the per-charity totals.
- A vendor's gift amounts across a cycle match their band schedule. A vendor who
  holds 16 meetings within a single cycle has sent $16,200 to charities ($4,500 +
  $5,000 + $5,500 + $1,200), matching the annual figure on the pricing page; meetings
  spread across cycles donate less because the band resets (see example C).
- Each charity's all-time total in the Charities directory equals the sum of all
  Paid gifts to that charity.

### Expenses & P&L

So the portal can show real profit (not just meeting-driven money), it tracks operating
costs alongside revenue. Full math in [CALCULATIONS.md](CALCULATIONS.md) section 2.18.

- **Expense entry:** date, category, payee, amount (ex GST), GST input credit, total,
  financial year. Categories Issy defines (software, ads, contractors, founder pay,
  etc.). Receipt/file attach optional.
- **Net GST (BAS):** GST collected on sales minus GST input credits on expenses, plus
  GST already remitted, gives GST currently owed.
- **Operating profit (per FY):** gross revenue minus charity donated minus operating
  expenses. This is the closest figure to "what the business actually made"; the
  official tax figures still come from the accountant.
- **Deferred revenue and total charity owed** are surfaced here too as liabilities, so
  the dashboard never mistakes prepaid cash or unpaid gifts for profit.
- Everything in this module exports to CSV (see CALCULATIONS.md section 6).

### Comms

- Shared-inbox style: conversation list on the left, thread on the right, assign
  to a staffer, internal notes, jump in.
- Powered by vendors emailing `support@thegoodintro.com`, which auto-forwards
  into the shared inbox surfaced here. A tool like Front or Help Scout can power
  it under the hood.
- **Executive replies land here too.** An exec who wants to ask a question or say
  "not now" simply **replies to the request email the normal way**; that reply
  routes into this shared inbox for Issy to handle (no special UI for the exec).
- This inbox is also where a **vendor-reported no-show** arrives.

### Clients (Vendors & Executives)

Both client types share one pattern: **a filterable list, click a row to open a
full profile**. The list is the directory; the profile is where the work happens
(setting up an exec, unlocking a vendor's access). The profile layout follows the
HR Partner employee record (attached screenshot): a left **modules rail**, a
central column of **info cards**, and a right **activity timeline**. Structure
from HR Partner, palette and icons stay ours.

#### Vendors list

Filter bar (search by company, plus filters for status, package, and date joined),
then a row per vendor:

| Logo | Company name | Active credits | Date joined | Status |
|------|--------------|----------------|-------------|--------|

- **Active credits** is the live balance (purchased minus reserved/consumed); a
  zero balance is the visual cue that their exec list is locked.
- Row click opens the **vendor profile**.

#### Executives list

Filter bar (search by name or company, plus filters for status, region, industry,
and date joined), then a row per executive:

| Photo | Company | Name | Title | Date joined | Status |
|-------|---------|------|-------|-------------|--------|

- Row click opens the **executive profile**.

#### Status (shared vocabulary)

Status answers "are they actively using the platform?" and **holds churn**. Use
one colour-coded set across both lists:

- **Invited**, record created, not yet onboarded.
- **Setup**, onboarding in progress (vendor: awaiting payment; exec: profile or
  calendar not yet connected).
- **Active**, fully onboarded and in use (emerald).
- **Dormant**, onboarded but inactive for a defined window (amber); an early
  churn-risk flag.
- **Churned**, left or lapsed (held here, not deleted, so history and reporting
  survive; muted/grey). Reachable from the list via a status filter, and counted
  on the dashboard's "hidden but accessible" churn metric.

#### Vendor profile (detail)

This is where a vendor's **access to the full executive list is released**.

- **Modules rail:** Account & billing, Credits & purchases, **Vetting & access**,
  **Onboarding / checklist**, Seats / team, Requests, Meetings, Comms history,
  Giving, Files, Notes.
- **Info cards:** company details, vetting status, live credit balance, payment
  status.
- **Vetting & access (the gate):** sign-up is open (work email only), but a vendor
  has **no payment screen until Issy approves them**. The gate is a **Calendly
  vetting call plus a short application form**; the **application answers are
  auto-pasted into the calendar invite** so Issy is briefed. This module shows the
  **application answers, the booked call, and the vetting status**, with an
  **Approve / Decline** action. **Approve unlocks payment** for the vendor;
  **Decline** keeps it hidden. Vetting can be **AI-assisted** (auto-check ABN,
  domain, website, LinkedIn; flag competitors / scrapers) presenting Issy a
  recommendation she confirms. Approval flips the vendor to **Verified** (the
  badge shown in the exec email).
- **Access on payment:** once the **Xero invoice is paid, the executive list
  auto-unlocks immediately** with the credit balance, and the onboarding checklist
  attaches (one event, several effects). No manual "mark as paid" step. There is
  **no per-request approval gate** once a vetted vendor is paid and active.
- **Pipeline status:** Signed up → Call booked → Approved → Paid → Active (or
  Declined), visible at a glance.
- **New sign-up notification:** every new sign-up alerts Issy across **Slack, the
  admin dashboard (Recent onboards), and email**, so a registration never goes
  unseen and the vetting call can be prompted.
- **Onboarding / checklist:** the same payment event **auto-attaches the
  onboarding checklist** to the vendor (see Checklists & onboarding). This module
  shows their checklist progress (X / Y, percent), surfaces any item that is
  **pending admin review or a paired admin task**, and lets Issy review uploads,
  countersign, and mark items or the whole checklist complete.
- **Activity timeline:** admin actions and account events (payment received, list
  unlocked, credits topped up, seat added), each stamped with who and when,
  exactly like the HR Partner timeline. Feeds the audit log.

#### Executive profile (detail)

This is where Issy **sets up and maintains the executive profile**.

- **Modules rail:** Profile, Onboarding status, Calendar connection, Charity,
  Business-context notes, Capacity / cadence, **Visibility (hide)**, Meetings
  history, EA linkage, LinkedIn connection, Files, Notes.
- **Info cards:** name, title, company, photo; chosen charity; "calendar
  connected?" flag; meeting count.
- **Set up here:** the admin **creates and edits the exec profile at onboarding**
  (name, title, company, photo, business-context notes), links the EA, and tracks
  the onboarding pipeline through to Active.
- **Capacity / cadence:** a per-exec meeting limit with remaining capacity
  visible, so vendors cannot over-book and burn out execs.
- **Hide / temporarily unlist:** Issy can **hide an executive from all
  users/vendors for a period** if they are currently busy, so they drop out of the
  executive list and cannot be requested until unhidden. This is **temporary and
  not a churn** (distinct from the Churned status). It is the vendor-facing answer
  to "this exec is unavailable right now", expected to be rare.
- **Activity timeline:** profile edits, charity changes, calendar connect, meeting
  outcomes, each stamped with who and when. Feeds the audit log.

### Checklists & onboarding

Where Issy **builds the onboarding checklist once** and lets it run itself. The
goal is "the less work for me, the better": author a template, and it
auto-attaches to every new paying vendor with no per-vendor effort. The flow is
adapted from **HR Partner Checklists** (attached screenshots); their structure,
our look, and our language throughout (HR Partner's "Employee" is our **vendor /
vendor user**, their "Company Admin" is **Issy / admin**, and we drop all the
HR-specific framing). The **Checklists** sidebar item has two areas, **Templates**
(build) and **Assigned** (send / track), mirroring HR Partner's "Configure >
Template" and "Assigned".

#### Templates (build a checklist)

Checklists > **Templates** > "**Add checklist template**" opens the builder:

- **Template name** and a **brief description for your own records** (internal,
  not shown to vendors).
- **Add items:** an "**Add new checklist item**" action builds items one by one.
  **Previously used items appear in a "Not selected" column** and can be
  **dragged into "Selected in template"** to reuse them, so common items are
  built once and reused across templates (the HR Partner drag-to-reuse pattern).
- **Reorder** items within the template.

#### Checklist item builder

Each item (the HR Partner "Add checklist item" dialog, relabelled for us):

- **Item description** (the text the vendor sees on the item).
- **Item type** (dropdown), the set we support:
  - **Standard check item** (a plain task, e.g. "complete your profile"),
  - **Link to an external site** (visit before completing),
  - **View a library document** (a PDF from our document library, e.g. vendor
    guidelines or the giving promise),
  - **Fill out a custom form** (an internal form),
  - **Electronically sign a document** (e-sign, e.g. code of conduct),
  - **Video clip** (e.g. a short platform tour),
  - **Upload a file** (mandatory or optional; appeared in the vendor completion
    flow, keep it as a type).
- **Who must complete it:** **"Vendor must check off this item"** and / or
  **"Admin must check off this item"** (our rename of HR Partner's Employee /
  Company Admin checkboxes). An admin-side item is the **paired admin task** that
  shows as "pending admin review" to the vendor rather than blocking them.
- **Advanced / reminder timing** per item: an automatic late-reminder window
  (HR Partner's "Remind in 8 days"), defaulting to our standard cadence but
  overridable per item. See Notifications below.

#### Assigning a checklist

Two paths, and ours **defaults to automatic** to keep Issy's effort near zero:

- **Auto-attach (default, the theGoodintro way):** designate one template as the
  **vendor onboarding checklist**; it **attaches automatically when a vendor's
  payment lands** (the same event that unlocks the exec list), and can attach to
  each new seat. Vendors never see it pre-payment. No manual send needed.
- **Manual assign (kept for one-offs):** Checklists > **Assigned** > "**Assign
  checklist**" opens a dialog to: pick a **template**, choose a **recipient list**
  (one or more vendors / seats, with All / None), and write the **subject** and a
  rich-text **message** (with a "use template" option) for the notification email.
  Send, and recipients are emailed a link into their portal. Use this for
  non-onboarding checklists (a new policy, a re-sign) or to target specific
  vendors. Only recipients with an active primary email get the notification.

#### Tracking and review

- Checklists > **Assigned** lists every assigned checklist with status and
  progress; an **Update** action opens a vendor's checklist to view items and
  progress. The same progress also shows in the **vendor profile's Onboarding
  module**.
- **Review and countersign:** open a vendor's uploads, review submitted items, and
  **mark items or the whole checklist complete**. Paired admin items surface as
  "pending admin review" to both sides, never as a silent block on the vendor.

#### Notifications and reminders

- Per-item **automatic late reminders** to vendors with outstanding items
  ("remind in N days"), cadence editable here and in Settings. Honest nudges, no
  urgency theatre (brand rule).
- The assignment email carries the admin's custom subject and message; items
  cannot be completed from the email, the link leads into the portal.

#### Scope and dependencies

- **Scope:** vendor-side feature. Executives are **not** put through self-serve
  checklists; they are onboarded by Issy via the 5-minute call and the exec
  profile (email-first principle). Extending checklists to execs is a later
  option, not the default.
- **Dependencies to build / confirm:** a **document library** (to hold the PDFs
  for "view a library document"), a **custom forms** capability (for "fill out a
  form"), and an **e-signature** capability (for "sign a document"). These are
  their own modules in HR Partner; for us they can start minimal and grow. Flagged
  in Open pre-build items.

### Settings (internal use)

- Staff and roles, follow-up timing (exec meeting-request follow-ups: **up to
  three, 4 days apart**, editable), email templates, notification preferences, and
  **checklist reminder cadence**.

## Operational must-haves (build into the data model early)

- **Admin actions propagate outward.** When Issy **refunds, suspends a vendor,
  manually books or edits a meeting, hides an exec, or marks an outcome**, the
  change must reflect in the affected **vendor and/or exec surface** (and notify
  where appropriate). No admin action should be invisible to the party it affects.
- **Activity / audit log:** who did what (moved a booking, edited a profile,
  marked a donation sent), including **EA actions attributed to the exec**.
- **Reporting / export:** CSV and date-range reports for accounting, GST on the
  full meeting fee (the whole $1,500 is revenue under the donation model), donations
  by charity and period, and charity / investor reporting.
- **Onboarding pipeline status:** each exec and vendor moves through stages
  (invited, profile created, calendar connected, active).
- **Data deletion:** clean deletion of a vendor or exec record (Australian
  Privacy Act).

## Deferred and flagged

- **Finance and donations:** charity flow now **confirmed** (donation model, see
  [CHARITY_FLOW.md](CHARITY_FLOW.md)), so the **Giving (donations & payout runs)**
  module and **Charities directory** are now **in scope** (specified above), no
  longer deferred. The donation model also resolves the old "never touch the
  donations" tension: theGoodintro funds the gift from its own revenue rather than
  holding the charity's money (POSITIONING.md still carries the old pending flag,
  sweep on next pass). Tax and GST specifics remain pending professional sign-off
  (CHARITY_FLOW.md open items).
- **Staff portal:** build later; super admin only first.

## Visual draft (saved, build when ready)

A **static, non-interactive visual draft** of the dashboard exists in the repo,
to be built out properly when Issy is ready.

- **Route:** `/admin`, file [app/admin/page.tsx](app/admin/page.tsx). Run
  `npm run dev` and open `http://localhost:3000/admin`.
- **State:** static only. Buttons, toggles, and "View all" links are visual, not
  wired. No data layer, no auth yet.
- **Look (approved direction):** white dashboard canvas; emerald leads on the
  **sidebar** (deep emerald, loved), the **top bar**, and the **metrics bubble**
  ribbon; emerald used as accent elsewhere (links, calendar dots, tags).
- **Layout:** helicopter view (HR Partner reference). Metrics ribbon on top, then
  a widget grid: **Needs action**, **Pending requests**, and **Recent onboards**
  on one side; **Booked-meetings calendar** (Calendar/List toggle),
  **Distributions** donuts, **Unresponded comms**, and **Gifts sent** on the
  other. Colour-coded with count badges on cards that hold work. Every widget
  links into its larger page.
- **Routing note:** `/admin` is a bare full-screen route. Made it opt out of the
  marketing chrome by adding `pathname.startsWith("/admin")` checks to
  `app/_components/page-shell.tsx`, `site-header.tsx`, and `site-footer.tsx`
  (mirrors how `/apply` opts out).
- **Open visual decision:** green share currently reads ~35-40% (white-led).
  Issy wanted closer to ~60%; can push green back up via accents (mint widget
  headers, emerald widget icons, faint mint wash behind cards) if desired.
- Not committed yet (offer: commit to a draft branch when wanted).

## Open pre-build items

- **Meeting source of truth (now a core build):** the two-way calendar sync is
  confirmed as one of the biggest admin builds (see Meetings). Still to decide is
  the mechanism: whether the database is master (calendar mirrors it) or the
  calendar is master (DB listens for changes). Affects all of Meetings.
- **Outcome capture integration:** the **Zoom / Teams API** provides attendance
  data (confirmed), so it drives the meeting outcome, with the **vendor-emailed
  no-show** as the fallback. Remaining work is the integration itself.
- **Admin 2FA.**
- **Checklist dependencies:** decide how minimal to start the **document
  library**, **custom forms**, and **e-signature** capabilities that the richer
  checklist item types lean on. A v1 onboarding checklist can run on standard
  tasks, external links, video, and file upload alone, with library docs / forms
  / e-sign added as those modules land.
- **Volume check:** confirm current meeting volume actually justifies a custom
  build versus a lighter stopgap.
