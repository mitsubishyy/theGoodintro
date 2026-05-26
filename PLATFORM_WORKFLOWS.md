# theGoodintro — Platform Workflows (notes)

Status: working brief, last updated 2026-05-24 from Issy's notes plus decisions
made in conversation. These are the workflows for when we build the platform,
not the current validation marketing site (see [PLAN.md](PLAN.md)). Not final
spec.

Scope: the **executive side** and the **admin portal**. The vendor-facing portal
UX, charity selection, and automated reminders are still left for later, though
the admin-side view of vendors and the meeting scenarios is covered below.

These workflow notes have since been turned into three build-ready portal briefs
(read those first when building): [ADMIN_PORTAL_BRIEF.md](ADMIN_PORTAL_BRIEF.md),
[VENDOR_PORTAL_BRIEF.md](VENDOR_PORTAL_BRIEF.md), and
[EXECUTIVE_PORTAL_BRIEF.md](EXECUTIVE_PORTAL_BRIEF.md). The vendor portal,
including the self-edit profile and the onboarding-checklist feature, is now
specced in the vendor and admin briefs. This file remains the underlying workflow
reasoning.

Guiding principle throughout: **make it easy and simple** for the executive.
Senior execs barely touch the system (see exec UX notes). The build splits into
work we do ourselves and tasks we build or offshore.

---

## Executive side

### Onboarding

The bar is **minimum effort for the exec**. Build or offshore the setup tasks so
the exec has almost nothing to do.

- We create their profile for them, via their work email.
  - Fields: name, title, company, photo.
  - Sign-in works across **all email providers** (Gmail, Outlook / Microsoft
    365, and others). Not Gmail-only.
  - Exec logs into their portal via their email. They **can optionally create a
    password** inside the platform if they'd like. Not required.
  - Profile stays simple and easy to use.
- **Capture business context at onboarding.** Notes from the exec on what
  matters to their business right now. This text is reused later in the calendar
  invite description (see Calendar).
- **Photo and LinkedIn in one step.** A one-time "Connect LinkedIn" (an OAuth
  login) lets us auto-pull their profile photo and, later, publish the
  post-meeting LinkedIn post on their behalf. One authorization covers both.

### Calendar access

- Connect to the exec's calendar. Read **free/busy only**, never event details,
  so the calendar stays **private**.
- Use their free/busy to **auto-book the meeting straight into their calendar**.
  Decided: the meeting goes directly in, no propose-then-confirm step. Fewer
  touches is better for this audience.
- We also have **access to the vendor's calendar**, so we can see both sides and
  pick a slot that works.
- Save a **rule per exec** that feeds the auto-book: preferred window, specific
  date and time, a set period ahead of today (e.g. 2+ months ahead).
- **Timezones:** store all times in UTC, display in each person's local zone.
  Within Australia the offsets vary (Perth on AWST, Adelaide and Darwin on a
  half-hour offset, and the eastern states split seasonally on daylight saving),
  so don't assume a single national time.

#### The meeting we create

- A calendar event in **both calendars**: the exec's and the vendor's.
- A **Zoom or Teams link** on the invite.
- Title: `Good Intro: {{Exec Name}} & {{Vendor Name}}`
- Description: a copy of **what the vendor wrote to the exec**, plus the exec's
  onboarding notes on **what's important to their business right now**.

### Executive Assistant (EA) access

- Need the EA's email and name.
- Give the EA access to the platform.
- No separate EA profile on the platform. The EA works under the exec.

---

## Ongoing process

### Trigger

- An exec workflow starts when a **vendor submits a request naming the exec**.

### Email to execs

- The **first email** (the mock email shown on our website) is **sent
  automatically and auto-filled** with the vendor's information from their
  request.
- The email must **show how much money goes to charity**. Pull this figure from
  the pricing page, never a hardcoded number (CLAUDE.md rule).
- Build the workflow behind the buttons in the email.
- Email call placeholder set-up.
- Put the EA's name on the email.
- Post-meeting email including the LinkedIn step.
- Draft the post automatically, ready to go (see LinkedIn below).

#### Post-meeting LinkedIn post

- No native "draft" exists inside LinkedIn via its API, so the **draft lives in
  our platform**. The exec reviews and edits the pre-written post in our app,
  then clicks **"Post to LinkedIn"** to publish it live through the API.
- Uses the same one-time LinkedIn connection set up at onboarding.
- **To validate early:** posting on a member's behalf needs LinkedIn to approve
  our app for their posting product. The scope is commonly granted but approval
  is not automatic.

### Portal

- All the info should be accessible via the exec's portal.
- **Design is open and needs heavy research.** This is Issy's first software
  build, so Claude leads on what to display, how to lay it out, colour, and
  keeping it simple to use. Start from the existing exec dashboard mockup at
  `app/mockup/exec` and the platform UX mockups.

### Donations

- Auto-sends post meeting.
- Auto-uploads on profile.
- Auto-uploads on website.
- Auto-uploads on vendor portal.
- This is **display and reporting only**. We never touch the donation money
  (positioning rule).

---

## Admin portal (super admin = Issy)

One portal where Issy can **see and manage everything**, with certain workflows
running from it. Issy is super admin. Staff get a limited version (see Staff
access).

Build approach (decided 2026-05-24): **custom-built in the repo** (Next.js +
Supabase), alongside the platform, for control and consistency. Data-model /
schema design is **deferred** for now; staying at the workflow and layout level.
Pre-build topics raised and noted: it's internal-only (security still matters,
2FA for super admin), decide the source of truth for a meeting (DB vs calendar),
and be honest about whether current meeting volume yet justifies the build.

### Sidebar menu

Dashboard, Vendors, Executives, Comms from vendors, Meetings, Requests pending,
Settings (internal use).

### Dashboard

Headline metrics (always visible to super admin):

- Meetings scheduled this month
- Meetings booked for the future
- Meetings that have happened
- Current active vendors
- Current active executives
- Total to charity
- Total revenue to Issy: this month and YTD

Hidden but accessible (kept off the main view, reachable on click):

- Churned execs
- Churned vendors
- Cancelled meetings
- Pending answer from execs (vendor sent a request, sitting on the exec to
  action)

UX idea: a **calendar view** of booked meetings, with a **toggle between calendar
and list** view.

Layout (decided): a **skinny metrics ribbon across the top** showing the headline
numbers, then a **table of tasks** below (what needs actioning: pending exec
answers, move requests, cancellations). The booked-meetings calendar/list toggle
sits with the task area.

### Meetings

- Move / reschedule, cancel, and resend invites from here.
- If either side declines or asks to move a meeting via the calendar invite, the
  admin portal must have **visibility and access to move it**.
- Need workflows for every booking scenario (decline, move, cancel, no-show).
- **Meeting outcome** is tracked in the **past meetings** view: completed,
  no-show, or cancelled. This status is what triggers the donation release, the
  LinkedIn post, and the follow-up, so it has to be set per meeting.

### Requests pending

- Queue of vendor-to-exec requests waiting on the exec to action.
- Follow-up emails sent **5 days after** with no response, to the execs. All
  emails accessible via the portal.

### Vendors

- Vendors **purchase meetings in bulk**. Purchase auto-uploads into their vendor
  account and gives them access to view the exec list.
- The **exec list stays hidden until payment**.
- Vendor portal login is accessible anytime.
- **Vendors are vetted at onboarding.** Only legitimate SaaS companies are
  onboarded, so there is **no per-request approval gate**: once a vetted vendor
  requests an exec, it goes straight to that exec to action.

### Executives

- The admin portal **sets up the exec profile**.
- The admin portal gets a **notification as soon as a new vendor or exec
  onboards**.
- **Capacity / cadence per exec:** a limit on how many meetings an exec will take
  (per month or quarter) with remaining capacity visible to admin, so vendors
  can't over-book and burn out the execs (retention risk).

### Comms from vendors

- All comms between vendors and us in **one central location**, so multiple
  people can answer and jump in to help.
- Decided: vendors email from their own inbox to a **support@thegoodintro**
  address that **auto-redirects into a shared inbox surfaced in the admin
  portal**. Multiple people can answer and jump in. A shared-inbox tool (e.g.
  Front, Help Scout) can power this under the hood; the vendor only ever emails
  support@.

### Staff access

- Decided: **build later, noted now.** The first build is super admin (Issy)
  only. Staff roles get added once we need to bring people in.
- Build **staff portals** that Issy manages as super admin.
- Staff can help vendors and see upcoming meetings, but **revenue numbers are
  hidden** from them.
- Implementation note for later: same portal, **role decides what renders** (the
  Money ribbon and revenue columns simply don't show for staff), rather than a
  separate staff app.

### Settings

- Internal use: staff and roles, follow-up timing, email templates, and similar.

### Finance and donations (LATER, depends on the charity flow, not yet confirmed)

Direction in principle (Issy, 2026-05-24): to release the gift only once the
meeting has happened, and to the charity the exec chose, the model needs to
**hold both the revenue and the charity funds** in the interim. There is no
obvious way to both "not hold the funds" and "release them on meeting completion
to the exec's chosen charity".

This is flagged, not settled. To reconcile before it is built or messaged:

- It tensions with the positioning principle that we **never touch the donation
  money** (see POSITIONING.md). Either update the positioning to an honest
  "funds are held and released to your chosen charity once the meeting happens",
  or use a **non-custodial mechanism** so we trigger the release without holding
  the money ourselves (options to explore: a payment processor with delayed
  payout, or a charitable-giving platform / fiscal sponsor that holds and
  disburses).
- AU regulatory weight: holding money destined for charities likely brings in
  state-based **charitable-fundraising registration**, trust / escrow handling,
  and GST on the admin fee. Get accounting and legal advice before committing
  publicly. Charity-amount claims still follow the pricing-page rule.
- The **charity flow itself is not yet confirmed** (Issy still working it out),
  so disbursement design plus a **Charities directory** (records, ACNC
  verification, payout details, per-charity totals that feed the public impact
  numbers) is deferred until then.

### Operational must-haves (agreed, build into the data model early)

- **Activity / audit log:** who did what (moved a booking, edited a profile,
  marked a donation sent). Record from day one; needed once staff exist.
- **Reporting / export:** CSV exports and date-range reports for accounting, GST
  on the admin fee, and charity / investor reporting.
- **Onboarding pipeline status:** each exec and vendor moves through stages
  (invited, profile created, calendar connected, active) so "what's stuck" is
  obvious at a glance.
- **Data deletion:** a clean way to delete a vendor or exec record (Australian
  Privacy Act right to deletion).

---

## Still to design or validate before build

- **Portal design**: Claude to research clean, simple, well-coloured exec/EA
  portal layouts. (Issy needs heavy input here.)
- **Privacy and T&Cs**: the site already has `/privacy` and `/terms` pages.
  Update them to cover calendar data and the platform, and add a consent step at
  onboarding. AU-first, so the Australian Privacy Act applies.
- **LinkedIn app approval**: apply early for the posting product.
- **Calendar OAuth**: confirm a real target exec's company IT will allow a
  third-party app to connect to their calendar. This could block auto-book, so
  test it before relying on it.
- **Auth mechanism**: confirm email login is a magic link.
- **EA delegation**: define exactly what an EA can do on the exec's behalf.
- **Charity flow**: not yet figured out (Issy). Blocks the donation disbursement
  design and the Charities directory.
- **Fund-holding vs positioning**: decide whether to hold funds (and update the
  "never touch donations" principle) or use a non-custodial release mechanism.
  Reconcile with POSITIONING.md.
- **AU fundraising / escrow / GST**: get legal and accounting advice before
  holding charity funds or making any public claim about it.
