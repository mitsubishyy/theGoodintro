# theGoodintro — v1 / MVP Scope (bare bones)

The "build this first" slice. This is a **product-spec** doc (the *what*, not the
schema or integrations), pulling the minimum viable version out of the three full
briefs: [ADMIN_PORTAL_BRIEF.md](ADMIN_PORTAL_BRIEF.md),
[VENDOR_PORTAL_BRIEF.md](VENDOR_PORTAL_BRIEF.md), and
[EXECUTIVE_PORTAL_BRIEF.md](EXECUTIVE_PORTAL_BRIEF.md). When a flow here points to
a brief, that brief is the detailed source. Last updated 2026-05-25.

## What v1 is

Three pillars, and only the scaffolding needed to make them work:

1. **Accept money** (a vendor pays and gets access).
2. **Book meetings** (a vendor requests, an exec accepts, the meeting is
   scheduled and its outcome recorded).
3. **Onboard executives** (Issy sets an exec up so they can receive and accept
   requests).

Everything else in the briefs is **later**. The point of v1 is the smallest loop
that earns revenue and proves the model: money in, a meeting booked, an exec live.

### The one scoping call to confirm (money vs the gift)

"Accept money" in v1 means **collecting the vendor's payment and unlocking
access**. It does **not** include automated, custodial release of the gift to the
charity, that depends on the unresolved fund-holding question in
[POSITIONING.md](POSITIONING.md). For v1:

- We **take the vendor's payment** (meeting credits at $1,500 each + the admin fee)
  via a **Xero invoice that auto-triggers** the unlock when paid.
- The **gift owed per completed meeting is recorded**, and **released manually**
  by Issy (off-platform or via a giving platform), with the **confirmation logged**
  and shown as a read-only record (Giving view).
- **Automated / custodial disbursement is explicitly deferred** until the charity
  flow is settled. Confirm this interpretation before build.

## Pillar 1: Accept money

**Goal:** a vetted vendor can pay and immediately get access; Issy can see it.

In scope (minimum):

- **Sign-up with a work email only** (generic / free domains blocked). First
  sign-up creates the Vendor org as Owner; the Owner invites the other users (max
  6). See VENDOR_PORTAL_BRIEF.md "Role model".
- **Vetting gate before any payment or exec access:** payment is **hidden** until
  a vendor books a **Calendly call with Issy** and completes a **short application
  form** (answers auto-pasted into the calendar invite). Issy approves on the call,
  which **unlocks payment**. This is the "no nobodies near the execs" gate.
- **Payment via Xero:** an invoice is issued; **paid in Xero auto-triggers** the
  unlock and downstream workflows (credits, list access, notifications). No manual
  "mark as paid". (Stripe self-serve is a later option.)
- **Price:** **1 credit = 1 meeting = $1,500 AUD**; the charity share is tiered by
  annual volume and the remainder is the admin fee (read the live model from
  [`app/pricing/page.tsx`](app/pricing/page.tsx), never hardcode). Admin fee is its
  **own named line**.
- **Access window + expiry:** buying **any** credits unlocks the **whole platform
  for 12 months**. If a vendor **uses all credits and has not bought more before
  the 12-month expiry**, the platform **hides the executive view** until they buy
  again. Credits **roll over**, but the **charity tier resets each calendar year**
  (a leftover credit is charged at the **lowest charity band**).
- **On payment, unlock immediately:** the executive list shows, the **credit
  balance** appears, and the vendor can start requesting.
- **A credit is deducted only after a meeting is sat**; overcommit allowed up to
  **4 beyond balance** (VENDOR_PORTAL_BRIEF.md "Billing & credits").
- **Admin sees it:** vetting + payment status on the vendor record, a new-signup
  alert (Slack + dashboard + email), and a vendor **payment notification (email +
  in-app)**.
- **Giving = read-only record** of gifts released (manually) per completed
  meeting.

**Supply guardrail (inventory):** aim for roughly a **10:1 executive-to-vendor
ratio** (about 10 live, consented execs per paying vendor) so a paid vendor has
real targets and execs are not over-requested. For now this is a **manual guiding
ratio, not an enforced or audited metric**, it would be hard to police early on,
so treat it as a rule of thumb for when to onboard the next paying vendor rather
than a system check to build.

v1 simplifications:

- One flat per-meeting credit ($1,500) is the only product; tiered packages,
  subscriptions, and GST automation can come later (keep the named-fee line and
  the tiered charity share correct from day one).
- No automated charity disbursement (see scoping call above).

## Pillar 2: Book meetings

**Goal:** the core request → accept → schedule → outcome loop works end to end.

In scope (minimum):

- **Executive list** (post-payment), with the clean list and at least basic
  filters, and the **Action → detail pop-up** (bio, charity, year joined). Full
  filter set can grow later. See VENDOR_PORTAL_BRIEF.md "Executive list".
- **Request form** with the three questions (who are we / why you / who will meet),
  the 300-char limits, the **on-behalf-of name + title + email**, and the
  **content guard** (strip emails/phone/links). This is the qualification gate.
- **The exec email** (the real first touch): verified card, the two context blocks
  from Q1/Q2, the charity line (gift pulled from the pricing model, never
  hardcoded), and **Accept / Decline / Send to EA**. See
  EXECUTIVE_PORTAL_BRIEF.md "The email surface". **This email is a must-build; the
  exec's web portal UI is not** (see Pillar 3).
- **Accept / Decline** handling. On accept, **scheduling is admin-confirmed**:
  Issy proposes / confirms a time and the **invite goes to both parties** (exec +
  both vendor-side emails). The AI-agent availability pull is a **nice-to-have for
  v1 and can be done manually** by Issy at first.
- **Outcome capture:** the **Zoom / Teams API reports attendance** to set the
  outcome (completed / no-show); a **no-show is also reported by the vendor
  emailing us**. A completed meeting consumes a credit and triggers the (manual)
  gift release.
- **Reschedule / cancel (v1):** either side asking to move or cancel **raises a
  rebook task for Issy**, who re-confirms; vendor and exec see the new state. No
  credit is affected.
- **Calendar sync** is a **core admin build** (the shared source of truth): a
  change made in a real calendar must reflect across admin, vendor, and exec. v1
  can start with lighter / manual coordination, but it is a priority, not an
  afterthought.
- **One canonical gift record** per completed meeting; vendor Giving, exec impact,
  and public impact numbers are read-only views of it (no drift).
- **Pending view** for the vendor (sidebar + dashboard), and the **Status** column
  on the exec list (Request sent / Meeting complete / Declined), informational.

v1 simplifications:

- **Follow-ups can start simple:** even a single automated nudge is fine for v1;
  the full three-follow-ups-then-red-task sequence can be phased in.
- **Decline reason + AI-drafted reply** can be manual in v1 (Issy emails the
  vendor); keep the decline action itself.
- Calendar auto-read can be manual coordination at first if calendar OAuth slips.

## Pillar 3: Onboard executives

**Goal:** Issy can stand up an executive so they can receive and accept requests.

In scope (minimum):

- **Admin sets up the exec profile** (name, title, company, photo,
  business-context notes), sets their **charity**, and links the **EA** (name +
  email). See ADMIN_PORTAL_BRIEF.md "Executive profile".
- **A way to know the exec's availability** for booking: calendar free/busy
  connection if ready, otherwise captured manually in v1.
- **Onboarding pipeline status** (invited → set up → active) so Issy can see who
  is live.
- The exec can **receive the email and Accept / Decline / Send to EA**, that email
  flow is the real exec surface for v1.

v1 simplifications:

- **The executive web portal (dashboard, impact view, charity picker UI) is
  deferred.** The exec is email-first; v1 needs the **email**, not the portal. The
  charity is set by Issy at onboarding; the exec's self-serve picker comes later.
- LinkedIn post step, EA portal access, and the impact dashboard are all later.

## Minimal scaffolding (needed for the three pillars)

- **Auth / login** for vendor users and admin (magic-link, to confirm); **work
  email only** at vendor sign-up (block generic domains). Exec needs no login in
  v1 (email-first), but the **exec email actions use signed, single-use, expiring
  links with a confirm page** (no login).
- **Calendly + application form** for the vendor vetting gate (answers auto-pasted
  into the calendar invite).
- **Xero** for invoicing (paid invoice auto-triggers unlock and workflows).
- **Admin shell**: dashboard, the vendor and executive records (Clients), the
  vetting + requests + scheduling tasks, and payment visibility.
- **Vendor shell**: dashboard, profile, executive list, request flow, pending,
  billing/credits.
- **Email sending** for the exec request email, accept/decline, the invite, the
  per-follow-up vendor updates, and the vendor payment receipt.

## Notifications and ownership (v1 loop)

Every handoff in the loop, so nothing stalls silently. (Request submission
notifies the vendor **in-app only**; payment notifies the vendor **by email +
in-app**.)

| Event | Vendor / User | Executive | Issy (admin) | Owns next step |
|---|---|---|---|---|
| New sign-up | account created |  | Slack + email + dashboard | Issy (prompt vetting call) |
| Call booked + form | confirmation |  | call + answers on record | Issy (vet on call) |
| Vendor approved | payment unlocked |  |  | Vendor (pay) |
| Invoice paid (Xero) | receipt (email + in-app) |  | notified | Vendor (request) |
| Request submitted | in-app only (pop-up + Pending) | request email | request visible | Executive |
| Each follow-up | email update | follow-up email |  | system |
| 3rd follow-up, no reply | "still chasing" | final follow-up | RED task | Issy (manual) |
| Exec accepts | "securing a time" |  | confirm-time task | Issy (confirm) |
| Time confirmed | invite (both vendor emails) | calendar invite |  | both parties |
| Exec declines (+reason) | AI-drafted decline (Issy sends) |  | decline task | Issy (send) |
| Reschedule / cancel (any side, incl. EA) | sees new state | sees new state | rebook task | Issy (re-confirm) |
| Exec leaves mid-flight | meeting cancelled, no credit |  |  | system / Issy |
| Zoom/Teams reports attendance | outcome shown |  | outcome set | Issy (release gift) |
| Meeting completed | credit consumed, gift recorded |  | confirm outcome | Issy (release gift) |

## Explicitly OUT of v1 (build later)

Onboarding **checklists** (vendor + admin authoring), the **executive web portal**
(dashboard, impact, self-serve charity picker), **LinkedIn** auto-post, **EA portal
access**, the full **three-step follow-up** sequence, **AI-agent** automation of
scheduling/declines (manual first; the new-sign-up Slack alert is the one piece of
Slack that is in), the **document library / custom forms / e-signature**
capabilities, multi-tier **packages / subscriptions / GST automation**, the public
**impact dashboard**, **Snoop-style** org analytics, and **automated / custodial
charity disbursement**. **Stripe self-serve checkout** is also later (Xero invoicing
is the v1 path).

## Decisions locked for v1

- **Vetting gate:** payment hidden until a vendor books a Calendly call + completes
  an application form; Issy approves to unlock payment.
- **Payments:** Xero invoicing, auto-triggers unlock on payment (Stripe later).
- **Price:** $1,500 AUD per meeting / credit; tiered charity share per the pricing
  page; credits roll over, tier resets yearly.
- **Org model:** work email only, first sign-up is Owner, Owner invites users
  (max 6); generic domains blocked.
- **Exec email actions:** signed, single-use, expiring links with a confirm page.
- **Exec consent:** baked into the Terms ("by continuing / logging in you accept"),
  bound at first email action, no separate contract.
- **Inventory:** roughly 10 live execs per paying vendor (10:1).
- **Gift release:** recorded, released manually in v1 (no custodial disbursement).

## Still open for v1

- **Magic-link auth** confirmation (shared platform open item).
- **Calendar OAuth** readiness, or manual availability for v1.
- How to **technically bind exec consent** for an email-first user who never logs
  in.
- **Build order across the three pillars** (suggest: onboard ~10 real execs →
  stand up the vendor sign-up + vetting + pay/unlock → wire the
  request/email/booking loop).
