# theGoodintro — Vendor Portal Build Brief

Build-ready brief for the **vendor-facing portal**, the surface a paying vendor
logs into to browse leaders, request introductions, manage meetings, and see the
Good their meetings have funded. The vendor portal UX was explicitly left for
later in [PLATFORM_WORKFLOWS.md](PLATFORM_WORKFLOWS.md); this doc fills that gap
and sits alongside [ADMIN_PORTAL_BRIEF.md](ADMIN_PORTAL_BRIEF.md) (the internal
side) and [POSITIONING.md](POSITIONING.md) (the rules that govern what we may
say). Last updated 2026-05-25.

The attached MeetMagic screenshots are a **reference for the information we must
capture, not a layout to copy**. MeetMagic is the direct competitor (see the
CLAUDE.md forbidden list: no purple, no "magic" vocabulary, no "Snoop Mode"). We
take the same fields and build a different, simpler structure in our own voice.

## Purpose and audience

The vendor portal is where a **SaaS vendor** (vetted as part of paid onboarding,
see Account lifecycle) spends their relationship with us: find a relevant leader,
request a qualified introduction, attend the meeting, and see the gift it sent to
the leader's chosen charity. Unlike the
admin portal (internal plumbing, functional over polished), this **is a paying
customer surface**, it should carry marketing-site craft: emerald accent, warm
paper, the shared design tokens. It should feel premium and honest, never
"cute".

Two things make our portal different from a generic meetings tool, and the build
must protect both:

1. **The request carries a written reason.** A vendor cannot one-click "I'm
   interested". Before a request reaches a leader they must state the specific
   initiative or challenge that makes the conversation relevant. That free text
   is the qualification gate, and it flows into the calendar invite description
   (see [PLATFORM_WORKFLOWS.md](PLATFORM_WORKFLOWS.md)). This is non-negotiable.
2. **Giving is display and reporting only.** The portal shows donation
   confirmations, charities supported, and the total to Good, it never holds,
   moves, or touches the donation money (positioning rule). Every "donated"
   number is a record of something that already happened.

## Account lifecycle and access gating

Sign-up is open, but **payment is hidden until a vendor has been vetted by Issy on
a call**. The barrier to *entry* is low (anyone relevant can sign up), the barrier
to *reaching executives* is real (a human vetting step), so executives are never
bombarded by "nobodies".

- **Sign-up requires a work email.** **Generic / free email domains (gmail.com,
  outlook.com, etc.) are blocked at sign-up.** The first person from a company to
  sign up **creates the Vendor (company) account and becomes the Owner**, then
  **invites the other users** (max 6, see Role model).
- **The vetting gate is a call, not a pay button.** Pre-vetting there is **no
  payment option shown at all**. Instead the account prompts the vendor to
  **book a short call with Issy via Calendly** and complete a **short application
  form**. The form questions are **auto-pasted into the calendar invite
  description** so Issy walks into the call with the context. Purpose: confirm
  they are a legitimate, relevant tech vendor before they can ever reach an
  executive.
- **Pre-vetting the account is deliberately limited:**
  - **No access to the executive list**, no requests, no payment screen.
  - The **executive-list / Requests nav items are visible but gated**: the page
    explains the model and shows the **"book your call"** action, not a paywall.
  - They **can edit their profile** (see Settings / Profile) while in this state.
- **After the call, Issy approves (or declines).** Approval **unlocks payment**
  for that vendor. (If declined, payment never appears and Issy follows up.)
- **On payment confirmed, access unlocks immediately:** the **full executive list
  shows**, along with the **credit balance**, and the vendor **can start
  requesting meetings**. Payment is the event that also auto-attaches the
  onboarding checklist (one event, several effects). The vendor is notified of
  payment **both by email (a receipt) and in-app**.

Pipeline (mirrored in the admin vendor record): **Signed up → Call booked →
Approved → Paid → Active** (or **Declined**).

This is the single source of truth for the gating; the Executive list, Billing,
and Getting started sections all reference it.

## Build approach

- **Custom-built in the repo** (Next.js + Supabase), alongside the platform and
  the admin portal, reusing the existing design tokens and UI primitives in
  [`app/_components/ui.tsx`](app/_components/ui.tsx).
- **Automate the workflows, ideally with AI agents.** The vendor side is a set of
  repeatable automated workflows (sign-up notifications, payment-triggered unlock
  and credit top-up, checklist attach, reminders, request routing). The goal is
  for **AI agents to handle the majority of them** so Issy's manual effort stays
  near zero. Design each workflow so it can run unattended.
- Schema design stays deferred for now; this brief is at the workflow and layout
  level, like the admin brief.
- **Auth:** magic-link email sign-in across all providers (Gmail, Outlook /
  Microsoft 365, others), with an optional password. Mirrors the exec onboarding
  decision. Confirm magic link before build (open item in PLATFORM_WORKFLOWS).
- Reuse, don't re-skin: a vendor portal CTA is the same `PrimaryCta`, a vendor
  metric is the same big-number treatment. If you reach for a raw
  `rounded-2xl border` you probably want a primitive.

## Role model (within one vendor account)

Terminology, used consistently throughout: a **Vendor** is the SaaS **company**;
a **User** is an **employee** of that company using the platform. A vendor is an
**organisation account with multiple users**, not a single login. Role decides
what renders, same pattern as the admin portal's super-admin / staff split.

- **Max 6 users per vendor for now.** Cap the number of user seats at six per
  vendor account at this stage (revisit later).
- **Work email only.** A vendor account can only be created with a **company
  email**; **generic / free domains (gmail.com, outlook.com, etc.) are blocked at
  sign-up**. The **first work-email sign-up from a company creates the Vendor org
  and becomes the Owner**; the Owner then **invites the other users** by email.
  (Guard: if someone signs up on a domain that already has a vendor, route them to
  "request to join" the existing account rather than create a duplicate.)
- **Account owner / admin** (the person who bought the package): everything,
  including **Billing & credits**, **Team** (invite and remove users), and a
  rolled-up view of every user's requests and meetings.
- **Member / user** (an SDR or AE on the team): browse the executive list, send
  requests, manage **their own** meetings, see giving. Billing and team
  management do not render.

Both roles see the executive list and the giving view. Keep it one portal; hide
by role rather than building two apps.

## Global shell

Every screen shares one frame: a left sidebar, a top bar (credit balance,
notifications bell, account menu), and a main content area that changes per
section. This deliberately departs from MeetMagic's top-tab + separate
"Organisation" area, one persistent sidebar, org-vs-seat handled by role.

```
┌ theGoodintro ─────────────────────[◈ 7 credits]─[🔔2]─[Vendor ▾]─┐
│ ┌────────────┐                                                   │
│ │ Dashboard  │   <- main content area changes per section        │
│ │ Get started│   <- onboarding checklist (badge until done)       │
│ │ Leaders 🔒 │                                                   │
│ │ Requests ⬤3│                                                    │
│ │ Meetings   │                                                   │
│ │ Giving     │                                                   │
│ │ ─────────  │                                                   │
│ │ Team       │  (owner only)                                     │
│ │ Billing    │  (owner only)                                     │
│ │ Settings   │                                                   │
│ └────────────┘                                                   │
└──────────────────────────────────────────────────────────────────┘
```

Sidebar order reads "what I do here" top to bottom: Dashboard, Get started,
Leaders, Requests, Meetings, Giving, then account-level Team / Billing /
Settings. We say **Leaders**, not "Executives", it matches the vendor copy
("Reach leaders honestly"). **Get started** holds the onboarding checklist
(see Getting started); it carries a count badge while items are outstanding and
can recede once the checklist is complete. Count badges show requests awaiting a
leader's answer and meetings coming up. The bell carries "leader accepted /
declined", "meeting booked", "meeting rescheduled", and "gift confirmed"
notifications.

## Screens

### Dashboard

**The vendor lands here on login.** It follows the shared hyperlinked-card
helicopter pattern set out in the admin brief (HR Partner reference: side-menu,
land straight on the dashboard, colour-coded cards that each link into their
module), scoped to this vendor's own world: their requests, meetings, credits,
and giving. A skinny metrics ribbon across the top, then the work below. One
adaptive page: the owner sees account-wide numbers, a seat sees their own.

```
┌ DASHBOARD ─────────────────────────────────────────────────────┐
│ ┌─ metrics ribbon (skinny) ────────────────────────────────────┐│
│ │ 4 pending · 2 scheduled · 18 done │ 8 charities │ $X to Good  ││
│ └───────────────────────────────────────────────────────────────┘│
│  UPCOMING MEETINGS                              NEEDS YOUR NOTE   │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐ │
│  │ 28 May · Jane Doe, CFO    │  │ Leader accepted, confirm     │ │
│  │ Acme Corp · Join          │  │ time · Leader declined: rebook│ │
│  │ 19 Jun · ...              │  │ ...                           │ │
│  └──────────────────────────┘  └──────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

- Ribbon metrics (the MeetMagic "Your overview" set, re-cut): requests pending,
  meetings scheduled, meetings completed, charities supported, total to Good.
  Credit balance also lives in the top bar.
- Two work panels under the ribbon: **upcoming meetings** (with join link) and an
  **action list** (a leader accepted and a time needs confirming, a leader
  declined and the request can be rebooked, a meeting was moved). This replaces
  MeetMagic's four "matches" status tabs with a single, calmer surface.
- **Outstanding onboarding shows here.** While the onboarding checklist has open
  items, a prominent **"Complete your checklist"** shortcut card sits at the top
  of the dashboard (the HR Partner dashboard shortcut pattern), linking into Get
  started. It quietly recedes once the checklist is done.

### Getting started (onboarding checklists)

The vendor's guided first run, and the answer to "the less work for me (Issy) the
better". A vendor lands here on first login and works a **checklist of onboarding
tasks** with almost no hand-holding from us. The whole feature mirrors HR
Partner's Checklists (attached screenshots): structure and flow from them, our
emerald-on-paper look, never their pink.

**Authored in the admin portal, auto-attached on payment.** Issy builds one
onboarding checklist template once, in the admin portal, and it **auto-attaches
to every new paying vendor** (and can attach to each new seat). Vendors never see
it until they have paid; it is part of unlocking the platform, not a marketing
step. (Admin authoring is specced in the admin brief.)

```
┌ GET STARTED ───────────────────────────────────────────────────┐
│  A short welcome message from Issy explaining what to do below. │
│                                                                 │
│  ☐ Complete your profile            (written task)              │
│  ☐ Read the vendor guidelines       [ Open document ]          │
│  ☐ Watch the 2-min platform tour    [ ▶ video ]                │
│  ☐ Sign the code of conduct         [ Sign document ]          │
│  ☐ Upload your company one-pager    [ Drop file / optional ]   │
│  ☐ Acknowledge the giving promise   (external link)            │
│                                                                 │
│  Progress: 2 / 6 (33%)   saved automatically as you tick        │
└──────────────────────────────────────────────────────────────────┘
```

- **Top:** a custom **welcome message from the admin** (Issy) explaining what the
  checklist is and why it matters, carried over from the assignment.
- **Below:** a **tickable list of task items**. Item types to support (the HR
  Partner set, mapped to us):
  - a **plain checkbox** task (e.g. "fill out your profile"),
  - **read / view an internal document** (PDF such as vendor guidelines or the
    giving promise) before it can be ticked,
  - **watch a video** (e.g. a short platform tour),
  - **sign a document** (e.g. code of conduct), via the e-sign step,
  - **upload a file** against the item (mandatory or optional, labelled clearly),
  - **visit an external link** before completing,
  - **complete an internal form**.
- **Gating:** items that require an action (sign, upload, view, form) keep their
  **checkbox disabled until the action is done**, so a vendor cannot tick past a
  required step.
- **Auto-save:** ticking an item saves immediately. No save button.
- **"Your checklists" list:** a vendor with more than one checklist sees a list
  (Checklist · Status · Created · Progress · action), each row showing
  **New / In progress / Completed**, a **completed X / Y (percent)** progress bar,
  an **"Items pending admin review"** note where relevant, and an **Update** (or
  **View** when done) action. Mirrors the HR Partner "Your Checklists" card.

#### How a vendor completes a checklist (flow)

- **Notified by email.** When a checklist is assigned, the vendor gets an email
  with the admin's custom message and a **summary of the items**, plus a direct
  link to log in. Items **cannot be completed from the email**; the link takes
  them into the portal.
- **Two ways in:** the **Get started / Checklists** sidebar item, or the
  **"Complete your checklist"** shortcut on the dashboard.
- **Inside:** the due date, the admin's message, and the items. Complete any
  required task (sign, upload, view, form) to unlock each checkbox; ticking
  auto-saves.
- **Reminders:** the system sends **periodic reminders** while items remain
  outstanding (cadence editable in admin Settings). Honest nudges, no urgency
  theatre (brand rule).
- **Admin-review / pending state:** some items may need Issy to review or to
  complete a paired admin task before the checklist can close; those show as
  **"pending admin review"** rather than blocking the vendor silently.

### Executive list (name TBD), locked until payment

The browseable list of vetted executives. This is the heart of the portal and
where the **payment gate** lives. (Final customer-facing name is TBD; "Leaders"
and "Executive list" are both in play.)

- **Gated until vetted and paid** (see Account lifecycle). Pre-access the **nav
  item stays visible** but the page shows a **"book your call"** state (the
  Calendly vetting step), not a paywall and not the list. After Issy approves and
  payment is confirmed, the **full list shows immediately** with the credit
  balance, and requesting becomes available. Requesting a meeting is **accessible
  only after payment**. The list unlocking on payment is a hard rule from
  PLATFORM_WORKFLOWS.
- **Filters (clean filter bar):**
  - **Company industry**
  - **Title**
  - **Location** (just Australia for now, but bake the filter in for going global)
  - **Company name** search bar (look up specific companies)
- **List columns:** Profile picture · Full name · Company name · Title ·
  Industry · **Status** · **Action**. Keep it a clean, scannable list.
- **Status column (visibility across the whole vendor):** shows what **any user at
  the vendor** has already actioned with that executive, so the team can see
  before they double-touch a leader. Values: **Request sent · Meeting complete ·
  Declined** (blank if no one has actioned them). It is **informational, not a
  block**: re-requesting the same executive is allowed (a vendor is spending their
  own credits, and we doubt anyone pays for the same exec twice, so it is a rare
  case we simply make visible rather than prevent).

#### Executive detail (pop-up, not a new page)

The **Action** button opens a **pop-up** (modal), not a new page, with more on
that executive:

- their **public bio** if they have written one (**leave blank if they have not
  uploaded one yet**),
- the **charity they are interested in / donate to**,
- the **year they joined** the platform.

Inside the pop-up is a button for the user to **express interest in a meeting**.
Clicking it **leaves the pop-up and opens a new full page** with the request
form below.

#### The request form (full page, the qualification gate)

A short form. **The user's answers here are exactly what appears in the
executive's email**, so they are written for the executive. Use the UX/UI of the
executive email we built earlier as the guide for how these answers render (see
[EXECUTIVE_PORTAL_BRIEF.md](EXECUTIVE_PORTAL_BRIEF.md)).

```
┌ REQUEST A MEETING ─ Jane Doe, CFO, Acme Corp ──────────────────┐
│  1. Who are we?                              (max 300 chars)     │
│     ┌──────────────────────────────────────────────────────────┐│
│     │ The vendor and the problems you solve.                    ││
│     └──────────────────────────────────────────────────────────┘│
│  2. Why you, specifically?                   (max 300 chars)     │
│     ┌──────────────────────────────────────────────────────────┐│
│     │ Why this executive would be interested in your product.   ││
│     └──────────────────────────────────────────────────────────┘│
│  3. Who will the executive be meeting with?                     │
│     ( ) Me            ( ) Someone else on the team              │
│         If "someone else":  Full name [__] Title [__] Email [__]│
│                                                                 │
│  Answers are sent to the executive to accept or decline.        │
│  No credit charged now (only after a meeting is sat).  [ Submit ]│
└──────────────────────────────────────────────────────────────────┘
```

- **Q1, "Who are we?"** the vendor and the problems they solve. **300 characters
  max.**
- **Q2, "Why you, specifically?"** why the user thinks this executive would be
  interested in the product. **300 characters max.** Both are required; this is
  the quality bar that keeps the network worth an executive's time.
- **Q3, "Who will the executive be meeting with?"** either **(a) me** (the current
  user) or **(b) someone else on the team** (a user booking on behalf of a sales
  exec or manager, think an SDR booking for the team). If **(b)**, capture the
  **other person's full name, title, and email**. The email matters: once the
  meeting is confirmed, the **invite is sent to both vendor-side emails**, the
  requesting user and the person the executive will actually meet.
- **Content guard on Q1 and Q2:** **strip out emails, phone numbers, and links**
  from the free text. These reach an executive and are a trust surface, so they
  cannot be used to smuggle a pitch or a contact-around.
- **On submit:** a copy of the answers **triggers the workflow that automatically
  emails the executive** to accept or decline. **If Q3 = (b), the named person's
  details show in the executive's email instead of the requesting user's.**
- One vetted vendor's request goes **straight to the executive**, no admin
  approval gate (PLATFORM_WORKFLOWS).

#### After a successful submit (three things happen)

1. **Admin is updated** (admin portal): Issy can see the email that was shared,
   and the **automated follow-up sequence to the executive is scheduled** (see
   admin Requests pending for the cadence).
2. **User gets a confirmation pop-up:** a message that **theGoodintro is working
   on securing the meeting**, with an option to be **redirected back to the
   executive list to make another request**. Submission notifies the user
   **in-app only, no email** (the pop-up plus the Pending badge are enough).
3. **The request appears under "Pending"** in the user's portal, reachable from
   the **side navigation** and surfaced on the **dashboard**. The user does get
   **email updates later, one per follow-up** we send to the executive, so they
   can see we are actively chasing it (distinct from the silent submission step).

### Requests / Pending

The user's outbound requests and their state. The default and primary view is
**Pending**, reachable from the **side navigation** and surfaced on the
**dashboard** (where a submitted request lands). Rolled up for the owner,
own-only for a user. (Sidebar label is TBD, "Requests" vs "Pending".)

- States: **Pending** (with the executive), **Accepted → scheduling**,
  **Scheduled** (moves to Meetings), **Declined**, **Expired / no response**.
- Each row shows the executive, company, the request answers sent, request date,
  and current state. If the request was made on behalf of someone else (Q3 = b),
  show that named person. Owners also see which user sent it.
- We **do not** expose admin follow-up mechanics to the user, but a pending
  request shows an honest "theGoodintro is working on securing it" state, and the
  user receives an update email each time we follow up (see admin cadence).
- **Withdraw a request:** a user can withdraw a still-pending request **only after
  14 days** (this also frees an overcommit slot). Before 14 days it stays in our
  hands while the follow-up sequence runs.
- **Export** (CSV) for the owner, matching the MeetMagic "Export Meetings"
  affordance, useful for the vendor's own pipeline reporting.

### Meetings

Upcoming and past meetings for the account (owner) or the seat.

- **Upcoming:** leader, company, date and time **in the viewer's local zone**
  (store UTC, display local, AU offsets vary, see PLATFORM_WORKFLOWS), and the
  Zoom / Teams join link.
- **Past:** outcome per meeting (completed, no-show, cancelled) as set by admin,
  and the linked **gift confirmation** once the meeting is marked complete. The
  **outcome is detected from the Zoom / Teams call** (attendance via API); a
  **no-show is reported by the vendor emailing us**.
- **Reschedule / cancel** of a booked meeting (either side) routes to admin, which
  **raises a rebook task for Issy**; the vendor sees the resulting state and a new
  time once rebooked. No credit is affected (a credit is only consumed once a
  meeting is sat).
- **Changing the attendee:** the vendor manages who attends on their side and can
  **swap the named attendee** on a request / meeting; we do not police vendor
  personnel changes.

### Giving

The proof the model works, and a vendor's reason to feel good about the spend.
**Display and reporting only. We never touch the money.**

- Totals: **total to Good** from this vendor's meetings, **charities supported**
  (count and names), meetings completed.
- A list of **gift confirmations**, one per completed meeting, each showing the
  leader's chosen registered charity, the amount, and the date the gift was sent.
  "You get confirmation, in writing, every time" (vendor copy).
- Use the brand treatment for "Good" (capital G, emerald) in headings and
  copy. Never invent a fixed dollar figure, amounts come from real completed
  meetings and the pricing-page model, never a hardcoded number (CLAUDE.md rule).
- **Reads from one canonical gift record.** Each completed meeting creates a
  single gift record (admin side); the vendor Giving view, the executive's impact
  view, and the public impact numbers are all **read-only views of that same
  record**, so they can never drift (see ADMIN_PORTAL_BRIEF.md "Gift record").

### Team (owner only)

Multiple seats per vendor account, the MeetMagic "Team Members" tab, ours.

- List: name, role / title, date added, status (active / invited / removed).
- Invite a teammate by email (magic-link join), remove a seat, see each seat's
  request and meeting counts.

### Billing & credits (owner only)

How a vendor buys and tracks access. Available **only after Issy approves them**
(see Account lifecycle). **Vendors buy meetings in bulk**; a paid invoice
auto-credits the account and unlocks the executive list.

- **1 credit = 1 meeting = $1,500 AUD (flat).** Of that, a **tiered charity share is
  donated to the executive's chosen charity** ($900 rising to $1,200 per meeting as
  volume crosses bands within the vendor's cycle), and the **remainder is what
  theGoodintro keeps** after the gift. Always read the live numbers off the tier
  model, never hardcode them. Charities are **DGR-endorsed and publicly verifiable**;
  under the donation model theGoodintro makes the gift, so the **vendor does not
  receive a gift receipt** (see [`CHARITY_FLOW.md`](CHARITY_FLOW.md)).
- **Credits roll over forever, but the charity tier resets every 12 months from the
  vendor's first purchase** (not the calendar year). A credit carried into a new
  cycle is charged at the **lowest charity band** ($900), and the tier climbs again
  with volume. Full cycle and carry-over rules are the Giving math in
  [`ADMIN_PORTAL_BRIEF.md`](ADMIN_PORTAL_BRIEF.md).
- **At request time the vendor sees the projected gift** for that meeting: their
  **current tier rate** (what their next held meeting sends to charity) and how many
  meetings remain until the next band. Show it as indicative ("approximately $X"),
  since the exact amount locks when the meeting is held. The calculation is the
  projected-amount rule in the Giving math ([`ADMIN_PORTAL_BRIEF.md`](ADMIN_PORTAL_BRIEF.md)).
- **Access is a 12-month window tied to purchase.** Buying **any** amount of
  credits unlocks the **whole platform for 12 months**. If a vendor **uses up all
  their credits and has not purchased more before the 12-month expiry**, the
  platform **hides the executive view** from the vendor and its users (re-locks to
  the pre-access state) until they buy again. Credits themselves still roll over;
  it is the *access window* that lapses.
- **Payment runs through Xero.** A vendor invoice is issued; when it is **paid in
  Xero, that auto-updates the account and triggers the downstream workflows**
  (credits added, list unlocked, notifications). No manual "mark as paid" step.
  (Stripe self-serve checkout is a later option, to investigate.)
- **Credit balance** and history: purchased, open (requested, not yet sat), and
  consumed.
- **A credit is deducted only after the meeting has been sat** (held), never on
  request and never on acceptance. Declines, no-shows, and unanswered requests
  cost nothing.
- **Controlled overcommit:** a user can request **more meetings than they have
  credits for, up to 4 extra beyond the balance**, to absorb declines. Example:
  10 credits allows up to 14 open requests. At the cap, further requests are
  blocked until some resolve or more credits are bought.
- **The admin fee is its own named line.** Never blend the admin fee with the
  gift in any invoice, receipt, or summary (positioning + vendor copy: "billed to
  you, separately and clearly named"). What the executive pays: nothing, ever.
  Say so.

### Settings / Profile

The vendor **edits their own profile** here (the HR Partner "My Profile" pattern,
trimmed and minus the personal-HR fields). Two stacked blocks: details at the
top, a free-text "about" below.

- **Profile picture:** the vendor can upload / drag-drop their own photo
  (sensible size limit, square crop).
- **Editable details:** the person's name, job title, email, mobile, LinkedIn
  URL, and company. **No address fields** (this is not an HR record; we do not
  collect home/postal addresses).
- **About you and your company (scroll down):** a free-text block where the
  vendor writes who they are and a few words about the company they work for.
  Plain and short; this is context, not a marketing page.
- **Visibility toggle** on the "about" block, three states made explicit:
  - **Visible to executives** (optional, vendor opt-in): shown to a leader
    alongside a request, to add a human face to the introduction.
  - **Always visible to admin** (Issy): the admin portal can always see it, on
    by default and not something the vendor can hide from us.
  - **Never visible to other vendors, or to other seats of the same vendor
    account.** A vendor's "about" is for the leader and for us, not for peers or
    teammates. This is a hard rule for the data model, not just a UI default.
- Notification preferences and sign-out.

## Minimum information to capture (checklist)

Distilled from the MeetMagic screens, mapped to our model. Build the data layer
to hold at least:

- **Vendor account:** company, package / subscription, credit balance, payment
  status (gates the Leaders directory), GST invoicing details.
- **Seats:** name, title, email, role (owner / member), status, date added.
- **Leader directory (read-only to vendors):** title, company, region, industry,
  stated priorities, availability state, capacity remaining (so a full leader
  isn't requestable).
- **Request:** leader, sending seat, the **required reason text**, status, request
  date, timestamps for each state change.
- **Meeting:** linked request, date/time (UTC), join link, outcome, gift
  confirmation reference.
- **Gift record (display only):** meeting, charity name, amount, date sent,
  confirmation document.

## Brand and positioning guardrails (do not violate)

- **No MeetMagic vocabulary or look.** No purple / violet, no "magic", no "Snoop
  Mode", no "matches" framed as a dating-style swipe. We use "Leaders",
  "Introductions", "Requests". (CLAUDE.md forbidden list.)
- **Never the word "marketplace."** Use "network" or a context fit.
- **Capital "Good" in emerald** wherever the word appears in customer copy.
- **No em or en dashes** in portal prose (en dashes only inside numeric ranges).
- **Giving is never a payment UI for the vendor's donation.** The vendor pays
  for meetings (credits) and an admin fee; the gift is funded by that, shown as a
  record, never collected through a "donate" button.
- Premium, honest, calm. No urgency, no countdowns, no "cute".

## Deferred and flagged (do not block the rest of the portal on these)

- **Giving / finance specifics** depend on the charity flow, which is **not yet
  confirmed** (Issy), and on the unresolved fund-holding-vs-positioning question
  in [POSITIONING.md](POSITIONING.md). Build the Giving view as a **read-only
  reporting surface** that renders gift records once they exist; do not build any
  fund-handling or "donate" mechanism here.
- **Credit consumption rule (DECIDED):** a credit is **deducted only after a
  meeting is sat**, never on request or acceptance; users may overcommit by **up
  to 4 requests beyond their balance**. See Billing & credits.
- **Subscription vs pure credit packs**, pricing model not finalised; keep
  Billing flexible.
- **Executive availability is controlled by admin "hide", not a vendor-facing
  capacity meter:** a busy executive is **temporarily hidden** from all
  users/vendors by Issy in the admin portal, so they simply do not appear in the
  list (see ADMIN_PORTAL_BRIEF.md). Temporary, and distinct from churn.

## Open pre-build items

- Confirm **magic-link auth** (open item shared with the platform).
- Decide whether the vendor can **see a pending request's age / nudge state** or
  only "awaiting response" (lean: honest state, no internal mechanics).
- Confirm **what a seat can see of other seats** (default: own requests/meetings
  only; owner sees all).
- Volume check: same question as the admin brief, confirm current vendor volume
  justifies the custom build versus a lighter stopgap.
