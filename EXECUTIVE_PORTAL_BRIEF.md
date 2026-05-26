# theGoodintro — Executive Portal Build Brief

Build-ready brief for the **executive-facing surface**, what a senior leader (and
their EA) sees from theGoodintro. It completes the set alongside
[VENDOR_PORTAL_BRIEF.md](VENDOR_PORTAL_BRIEF.md) and
[ADMIN_PORTAL_BRIEF.md](ADMIN_PORTAL_BRIEF.md), and draws on the executive-side
notes in [PLATFORM_WORKFLOWS.md](PLATFORM_WORKFLOWS.md), the rules in
[POSITIONING.md](POSITIONING.md), and the existing static mockup at
[`app/mockup/exec`](app/mockup/exec). Last updated 2026-05-25.

## The one principle that shapes everything

**The executive surface is email-first. The portal is secondary.** A 50-year-old
listed-company CFO/COO will not log into a dashboard to manage meetings.
Everything they routinely need, accept, decline, forward to their EA, see the
gift their meeting funded, must work **from the email**, with the portal as a
quiet place they can visit if they want the fuller picture. Build for the leader
who never logs in, and the portal becomes a bonus rather than a dependency.

This inverts the vendor portal (a working surface the vendor lives in). Here the
goal is **minimum effort for the exec** (PLATFORM_WORKFLOWS guiding principle).
Two real audiences use the portal when it is used at all:

- **The executive**, occasionally, to set their charity, review impact, or post
  to LinkedIn. Calm, sparse, premium.
- **The Executive Assistant (EA)**, more often, working *under* the exec to
  triage requests and manage the diary. The EA is the heavier user of the
  dashboard.

## Build approach

- **Custom-built in the repo** (Next.js + Supabase), reusing the design tokens
  and primitives, and building out from the approved static mockup at
  [`app/mockup/exec`](app/mockup/exec) (`ExecDashboard.tsx`).
- This is a **premium customer surface**, full marketing-site craft: warm paper,
  emerald accent, generous spacing. It must read as concierge, not SaaS admin.
- **Auth:** magic-link email sign-in across all providers, optional password.
  No password is ever required (PLATFORM_WORKFLOWS). The EA signs in with their
  own email and lands in the exec's context.
- **Onboarding is done for them.** We create the profile via a ~5-minute phone
  call: name, title, company, photo, business-context notes, charity, calendar
  connection, EA details. The exec arrives to a portal already set up. Nothing
  here is a setup wizard the exec must complete.

### Consent (no separate contract)

The exec agrees to take part **without signing a separate document**. Consent is
**baked into the terms**: "by logging in / by continuing, you accept theGoodintro's
Terms". Because the exec is email-first and may never log in, the acceptance has to
**bind at first interaction, not only at login**:

- The **first time the exec actions an email** (their first Accept / Decline,
  on the confirm page, see The email surface), a one-line **"by continuing you
  accept the Terms"** is shown and the acceptance is **recorded with a timestamp**
  on their record.
- If they ever **log into the portal**, the same "by logging in you accept the
  Terms" applies.
- The Terms cover what we do on their behalf: being **listed and discoverable to
  vetted paying vendors**, receiving **request emails**, **free/busy calendar
  read** (never event details), a **charity nominated in their name** with the
  gift made on their behalf, and their **bio / title / company shown** to vendors.
- They can **pause, opt out, or leave** at any time (ties to the admin Hide and
  Churned states; data deletion on request, Australian Privacy Act).
- Open item: figure out the cleanest technical way to bind and record this for an
  email-first user who never logs in.

## The email surface (primary, specced here because it is the product)

The mock email already shown on the marketing site is the real first touch
(PLATFORM_WORKFLOWS). It is **auto-filled from the vendor's request form** (the
three answers a user submits in the vendor portal) and must stand on its own
without the portal. This is the approved design direction; build to it.

```
┌ EMAIL ─ a request for your time ───────────────────────────────┐
│  Hi {{Exec}},                                                   │
│  {{Requester Name}}, {{Title}} at {{Company}}, has requested    │
│  {{N}} minutes with you. He/she has been verified and reviewed. │
│                                                                 │
│  ┌─ {{Requester Name}}   ◔ VERIFIED ───────────────────────────┐│
│  │ {{Title}} · {{Company}}                                      ││
│  │ ABN verified · Founder reviewed · {{LinkedIn}}               ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│  WHAT THEY WANT TO DISCUSS   ← vendor Q1 "Who are we"           │
│  {{who they are and the problem they solve}}                    │
│                                                                 │
│  WHY YOU, SPECIFICALLY       ← vendor Q2 (emerald highlight)    │
│  {{why this executive, specifically}}                           │
│                                                                 │
│  ♥ If you accept, {{gift, from pricing model}} directs to        │
│    {{Standing charity}}.  Your standing nomination. Reply        │
│    CHARITY to pick a different DGR-endorsed charity for this     │
│    meeting only.                                                │
│                                                                 │
│  [ ✓ Accept ]   [ ✕ Decline ]   [ → Send to {{EA}} ]            │
└──────────────────────────────────────────────────────────────────┘
```

- **Requester identity comes from Q3 of the vendor form.** If the user requested
  on their own behalf, their name and title show; if they requested **on behalf of
  someone else**, the **named person's name and title** show instead. The
  **VERIFIED** badge plus **"ABN verified · Founder reviewed · LinkedIn"** is our
  vetting made visible, the reason a senior leader trusts the request.
- **Two context blocks map straight from the form:** "What they want to discuss"
  is the vendor's **Q1 (who are we / the problem)**; "Why you, specifically" is
  **Q2**, carried as the emerald-highlighted moment.
- **Charity line:** shows the gift **pulled from the pricing-page model, never
  hardcoded** (CLAUDE.md rule), directing to the exec's **standing nomination**
  (their default charity). The exec can **reply CHARITY to choose a different
  DGR-endorsed charity for this meeting only**, leaving their default intact. The
  charity must be **DGR-endorsed** (AU deductible gift recipient).
- **Three actions in the email:** Accept, Decline, **Send to {{EA}}** (the EA's
  name shows when one is linked). The workflows behind these buttons are the build
  (PLATFORM_WORKFLOWS "build the workflow behind the buttons").
- **On Accept (AI-assisted, admin-confirmed booking):** an **AI agent pulls the
  executive's availability** from their calendar and sends it to the **admin
  portal as a task**. Issy **reviews and confirms** a time, which then sends the
  **calendar invite to both parties**. The vendor-side invite goes to **both
  vendor emails**: the requesting user and (if Q3 = b) the named attendee. This
  replaces the earlier "auto-book with no confirm" idea: there is now a light
  human confirm step (decision, supersedes the auto-book note in
  PLATFORM_WORKFLOWS).
- **On Decline:** the executive can add an **optional decline reason** ("not
  relevant / no capacity / bad timing"), which is shared back to admin and drives
  the AI-drafted reply to the vendor (see ADMIN_PORTAL_BRIEF.md).
- **If no response, an automated follow-up sequence runs:** up to **three
  follow-ups to the executive, each 4 days apart** (roughly days 4, 8, 12). After
  the third with no reply, a **red manual task** is raised in the admin portal.
  The requesting user gets an update email at each follow-up. Cadence editable;
  visible to admin (see ADMIN_PORTAL_BRIEF.md).

## Global shell (portal)

When the exec or EA does open the portal, one calm frame: a light top bar
(account menu, the linked exec's name) and a single-column, low-density layout.
No heavy sidebar. There is not enough here to warrant one.

This is deliberately the **lightest** of the three dashboards. It borrows the
shared "land straight on it, every card links onward" principle from the admin
brief (HR Partner reference) but **none of the data density**: no metrics ribbon,
no donut grid, no work queue. An exec sees what is theirs and nothing more.

```
┌ theGoodintro ──────────────────────────────[Jane Allen ▾]─┐
│                                                            │
│  INCOMING · 2          <- requests awaiting your answer    │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Lachlan Smith · Notion        Tue 28 May · 45 min      │ │
│  │ "Design ops for finance teams"   [Accept] [Decline] ▾ │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  RECENT IMPACT                              This yr · $12k │
│  18 May  Daniel Cho · Notion  → Beyond Blue   ✓ confirmed  │
│  11 May  Priya Mehta · Linear → OzHarvest     ✓ confirmed  │
│                                                            │
│  YOUR CHARITY   Beyond Blue          [ Change ]            │
└──────────────────────────────────────────────────────────────┘
```

EA mode is the same screen with a clear "Acting for {{Exec}}" banner and the
diary-management affordances foregrounded.

## Screens

### Home / Incoming

The portal's front page, mirroring the mockup's "Incoming" + "Recent impact"
stack.

- **Incoming requests:** each card shows the vendor, their company, the proposed
  time, and the three context blocks from the request, **what they want to
  discuss**, **why you specifically**, and **about the company**. Same three
  actions as the email: Accept, Decline, Forward to EA.
- The exec sees only what is relevant: a short, honest request and a single
  decision. No vendor pipeline, no funnel language.

### Meetings

- **Upcoming:** vendor, company, date/time in the exec's local zone (store UTC,
  display local, AU offsets vary, PLATFORM_WORKFLOWS), join link.
- A meeting that needs moving routes through the calendar invite / admin; the
  exec is never asked to wrangle a reschedule UI. Decline or "ask to move" from
  the invite is honoured on the admin side.
- **Past:** simple record of meetings held, each linked to its gift confirmation.

### Impact / giving (display and reporting only)

The reason a leader stays. **We never touch the donation money.** This is a
record of gifts already sent (POSITIONING.md).

- **Recent impact** feed: date, vendor, the charity the meeting funded, and
  status (confirmed / pending), exactly as the mockup shows.
- Lifetime and year-to-date totals: meetings held and amount sent to Good.
- "Charity confirmed receipt" state per gift. Use the brand "Good" treatment
  (capital G, emerald). Never invent a dollar figure; amounts come from real held
  meetings and the pricing model.
- **Reads from the one canonical gift record** (created admin-side per completed
  meeting), the same record the vendor's Giving view and the public impact numbers
  read from, so figures never disagree across portals (see ADMIN_PORTAL_BRIEF.md
  "Gift record").

### My charity

The one genuinely interactive thing we ask an exec to do.

- Set a **default charity** that every future meeting funds, and optionally
  **direct a single meeting to a different charity**.
- **The charity must be chosen before the meeting happens.** The gift follows the
  charity set at meeting time, so an exec confirms / picks their charity before the
  meeting is sat. (No credit is ever taken before the meeting is sat anyway.)
- Charity picker: search by name, cause, or ABN; "popular among executives" and
  "recently directed" shortcuts (as in the mockup).
- The exec chooses the charity, not us (positioning principle). Charity records,
  ACNC verification, and payout sit on the admin side and are **deferred with the
  charity flow** (see Deferred).
- **If an executive leaves** (churns, withdraws, or is removed) while a meeting is
  booked, **the meeting is cancelled and no credit is taken** from the vendor
  (nothing was sat). Any pending requests to that exec are closed.

### Post-meeting LinkedIn post

- After a held meeting, the follow-up offers a **pre-drafted LinkedIn post** the
  exec can review, edit, and publish with one tap ("Post to LinkedIn").
- The draft lives **in our platform** (LinkedIn has no draft API) and publishes
  through the API using the one-time LinkedIn connection from onboarding.
- Flagged: posting on a member's behalf needs LinkedIn to approve our app for the
  posting product, apply early (PLATFORM_WORKFLOWS open item).

### Profile (light)

- Read-mostly: name, title, company, photo, business-context notes, linked EA,
  charity. Set during onboarding; the exec can tweak but is never required to.
- "Want to change your organisation / email? Contact us", gated like a premium
  service, not self-serve everything.

## Executive Assistant (EA) access

- Capture the **EA's name and email** at onboarding; grant the EA portal access.
- **No separate EA profile**, the EA works under the exec (PLATFORM_WORKFLOWS).
  One linked email, "Acting for {{Exec}}" context.

**EA ongoing role (workflow).** The EA is a real working actor, not just a
forwarding target:

- **Triage and decide:** when a request is **sent to the EA**, the EA can
  **Accept / Decline on the exec's behalf** through the same signed, single-use
  email action links (no separate login needed in v1). The action is logged as
  **"EA {{name}} acting for {{Exec}}"**.
- **Manage the diary after booking:** the EA can **request a reschedule or cancel**
  a booked meeting on the exec's behalf. That fires the **same admin rebook task**
  as if the exec did it (EA → admin → vendor), so there is one path for moving a
  booking regardless of who triggered it.
- **Authority:** Issy's confirm step remains the booking authority. The EA
  **proposes / requests**; Issy **re-confirms** the time and the invite reissues
  to both parties.
- **Changing the charity:** the EA **can log into the platform and request a
  charity change** on the exec's behalf. Expected to be rare, but supported.

## Calendar and the meeting we create (context the portal reflects)

Specced fully in PLATFORM_WORKFLOWS; the portal only reflects it. Captured here
so the exec surface stays consistent:

- Connect the exec's calendar **free/busy only**, never event details, the
  calendar stays private.
- **Booking is AI-assisted but admin-confirmed:** on acceptance an AI agent reads
  free/busy (plus the per-exec rule: preferred window, lead time, e.g. 2+ months
  ahead) and proposes times as an admin task; **Issy confirms**, then the invite
  is sent. (Decision, supersedes the earlier "auto-book with no confirm" note.)
- The event lands in **both** calendars with a Zoom/Teams link. Title:
  `Good Intro: {{Exec}} & {{Vendor}}`. Description = the vendor's reason text plus
  the exec's onboarding business-context notes.

## Minimum information to capture (checklist)

- **Executive:** name, title, company, photo, LinkedIn (one-time OAuth),
  business-context notes, default charity, calendar connection state, per-exec
  cadence/capacity, onboarding stage.
- **EA link:** name, email, access state, permissions.
- **Incoming request (read to the exec):** vendor, company, the reason text, the
  topic, proposed time, decision state.
- **Meeting:** vendor, date/time (UTC), join link, outcome, linked gift.
- **Gift record (display only):** meeting, chosen charity, amount, date sent,
  confirmation state.

## Brand and positioning guardrails (do not violate)

- **No MeetMagic vocabulary or look:** no purple, no "magic", no "Snoop Mode",
  no "matches" framing. (CLAUDE.md forbidden list.)
- **Never "marketplace"**, use "network".
- **Capital "Good" in emerald** wherever it appears in customer copy.
- **No em or en dashes** in portal prose (en dashes only in numeric ranges).
- **Giving is never collected here.** It is shown as a record only; no "donate"
  button anywhere on the exec surface.
- Concierge calm. No urgency, no countdowns, no funnel language, nothing "cute".

## Deferred and flagged

- **Charity flow** is not yet confirmed (Issy). The charity picker can render and
  store a choice, but disbursement, ACNC verification, and the Charities
  directory are **deferred with it** (POSITIONING.md fund-holding question).
  Build Impact as a read-only reporting surface that fills in once gift records
  exist.
- **LinkedIn posting approval**, apply early; the post-meeting flow depends on
  it.
- **Calendar OAuth acceptance**, confirm a real target exec's company IT allows
  a third-party calendar connection; this could block auto-book, so test before
  relying on it (PLATFORM_WORKFLOWS open item).

## Open pre-build items

- Confirm **magic-link auth** (shared with the platform).
- Define the **EA permission set** precisely (esp. whether an EA can change the
  charity).
- Decide the **meeting source of truth** (DB vs calendar), shared with the admin
  brief; it governs how the exec's Meetings view stays in sync.
- Volume check: confirm current exec volume justifies building the portal now
  versus running email-only first (the email surface is the part that must exist).
