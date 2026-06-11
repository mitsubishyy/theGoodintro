# TheGoodIntro Platform: MVP Gap Audit (the revenue loop vs the actual code)

A strategic audit of how far the platform is from the smallest loop that earns
revenue. Audited against the **code** on `platform/v2-foundation` (at commit
`3b9feaf`, 2026-06-11), not against what the docs say should exist. Companion
to [`PRODUCTION_READINESS.md`](PRODUCTION_READINESS.md) (task IDs referenced
throughout), [`V2_BUILD_PLAN.md`](V2_BUILD_PLAN.md), and
[`BUILD_HEALTH.md`](BUILD_HEALTH.md). No code was changed for this audit.

**Method:** every step of the loop was traced through the server actions, the
library code, and the SQL migrations that actually run it. Claims were verified
by searching for what is absent as well as reading what is present. The fast
gates were run during the audit: `check:copy` passes and all 59 pricing tests
pass. The DB-backed platform tests were not re-run here, but CI
(`.github/workflows/ci.yml`) runs them against a real local Postgres on every
push to this branch.

## The verdict in three sentences

The internal machinery of the loop (credits, bands, state machine, gift
records, tenant isolation, audit log) is genuinely built, DB-tested, and in
better shape than the tracking docs claim. But the two places where the
platform touches the outside world, **money in** and **email out**, are both
simulated: no invoice ever reaches Xero, no email of any kind has ever been
sent, and there is not even a manual way to get the exec's accept link out of
the database. Today the loop can be driven end to end only by Issy clicking
admin buttons on both sides of a conversation that never actually happens.

---

## 1. The revenue loop, step by step, against the actual code

Classifications: **WORKS END-TO-END** (a real user could do this today on
staging) / **WORKS BUT SIMULATED** (the mechanics run, but a stub or admin
button stands in for the real-world event) / **PARTIALLY BUILT** (some of the
step exists, a load-bearing part does not) / **NOT BUILT**.

### Step 1. Vendor signs up — WORKS END-TO-END (with two fragile edges)

A real vendor can self-serve sign up today: password account via Supabase
auth, work-email-only enforced both client-side
([email-domain.ts](apps/platform/lib/email-domain.ts)) and authoritatively in
the DB (`private.is_generic_email_domain`, migration 0006), org created via
the `signup_vendor` RPC (first user becomes owner, one org per domain), all
behind the `vendor_signup` flag (off by default).

The fragile edges, stated plainly:

- **The flow only works if Supabase email confirmation is switched off.**
  [signup/actions.ts:37](apps/platform/app/signup/actions.ts#L37) defers org
  creation "after login" when confirmation is on, but nothing ever calls
  `signup_vendor` after login, and there is no auth callback route for the
  confirmation link to land on (the only `route.ts` files in the app are the
  demo sign-in and the Xero webhook). If that Supabase setting is ever
  enabled, sign-up silently dead-ends at "Finish setting up."
- **No password reset exists anywhere** (PRODUCTION_READINESS **C11**). A
  vendor who forgets their password is locked out permanently.
- The "Owner invites up to 6 users" model in MVP_SCOPE is **NOT BUILT** (no
  invite action exists; the admin UI merely displays an `invited` seat
  status). Not loop-blocking for one-person vendors.
- MVP_SCOPE still says "magic-link, to confirm"; the code is
  password-based. Decide and update the doc.

### Step 2. Vendor vetted — WORKS BUT SIMULATED (a working manual gate, with no real-world signals)

What works: the application form writes through the `submit_application` RPC
and moves the vendor `signed_up → call_booked` (migration 0007); the admin
vendor detail has a real "Approve (unlock payment)" button
([vendors/actions.ts:13](apps/platform/app/admin/vendors/actions.ts#L13));
the gate is genuinely enforced, the executive list redirects away unless the
vendor is `active`
([vendor/executives/page.tsx:21](apps/platform/app/vendor/executives/page.tsx#L21)).

What is simulated or missing:

- **No Calendly anything** (**A7**). The status is named `call_booked` but no
  call is booked anywhere; the application page just mentions a vetting call
  in copy. Issy has to arrange the call entirely off-platform.
- **The new-signup alert never reaches Issy** (**A7** Slack, **A1** email).
  Notification rows are queued and nothing sends them. Issy finds new sign-ups
  only by looking at the admin dashboard.

As a manual workflow this step is usable today. It just generates no signal
that there is anything to vet.

### Step 3. Vendor pays — WORKS BUT SIMULATED (no real money can move)

This is the most important honest finding. **There is no Xero integration.
There is a webhook waiting for a Xero that was never connected.**

- "Issue invoice" creates a **database row with a made-up invoice ID**
  (`STUB-...`,
  [vendors/actions.ts:51](apps/platform/app/admin/vendors/actions.ts#L51)).
  No document is created in Xero, nothing is emailed to the vendor, and the
  vendor portal has no billing page where they could even see it. A vendor has
  no way to pay because there is nothing to pay.
- The unlock is performed by the admin **"Simulate paid"** button, which calls
  the same `applyPaidInvoice` the webhook would.
- The webhook route ([api/webhooks/xero/route.ts](apps/platform/app/api/webhooks/xero/route.ts))
  is real, HMAC-signature-verified, and idempotent, but its own comment says
  the payload shape is a **stub contract invented until the real Xero mapping
  is wired**. The real Xero webhook sends `resourceId`/`eventType` events,
  requires an intent-to-receive handshake at registration, and requires an
  API call back to Xero to learn the invoice status. None of that exists, and
  there is no Xero OAuth connection, tenant, or API client anywhere in the
  repo. **A4 as written ("harden the webhook") understates this gap.**

What IS solid: everything downstream of "paid." `applyPaidInvoice`
([lib/billing.ts](apps/platform/lib/billing.ts)) atomically claims the
invoice (a replay cannot double-credit), creates the CreditLot, anchors the
12-month cycle on first purchase, reopens the access window on re-purchase,
and unlocks the vendor. This is covered by DB-backed tests that run in CI.

One dead end found: the vendor pipeline status `paid` is **never set by any
code path** (`applyPaidInvoice` goes straight to `active`). The four-state
pipeline UI shipped in commit `3b9feaf` displays a state that cannot occur.

### Step 4. Vendor requests a meeting — PARTIALLY BUILT (the in-app half works; the delivery half, which is the product, does not exist)

The in-app half WORKS END-TO-END: the request form with the 300-char limits
and the contact-stripping content guard
([content-guard.ts](apps/platform/lib/content-guard.ts), tested), the
on-behalf-of attendee, the `submit_request` RPC (migration 0008) creating the
request plus a single-use high-entropy action token, the vendor's Pending
view, and the admin's visibility. All real.

Then it stops dead:

- The exec request email, which MVP_SCOPE calls "the real first touch" and
  PRODUCTION_READINESS calls "the product," is a `queued` notification row
  that **nothing will ever send** (**A1**). There is no email provider, no
  `lib/email/`, no Resend/SendGrid/SMTP dependency anywhere in the repo.
- **There is no manual workaround either.** The signed link `/e/<token>` is
  never composed anywhere in the codebase, and no admin screen shows the token
  for Issy to copy-paste into a personal email. Today the only way an exec
  could ever see a request is someone querying the database by hand.
- A scoping detail that will bite A1: the `notification` table (migration
  0001) has **no payload column**, only recipient/channel/event/status. The
  queued row does not know which request it is about, so the sender cannot
  compose the email from the queue as built. A1 needs a small schema addition
  (e.g. `payload jsonb` or a `request_id` column), not just a provider.

### Step 5. Exec accepts — WORKS END-TO-END once the link is in hand

The `/e/[token]` confirm page is real and behaves to spec: inert on GET,
commits on POST, shows the vendor context and an indicative gift amount pulled
from the pricing engine (never hardcoded), and the `act_on_request_token` RPC
records the consent event (IP, user agent, terms v1), flips the request to
`accepted`, **spawns the Meeting in `proposed`**, and consumes the token
(single-use enforced). Decline with reason and Send-to-EA both exist.

Honest caveats: tokens **never expire** (the `email_action_token` table has no
expiry column; EMAIL_ACTIONS requires signed, single-use, *expiring* links);
the `submitted → closed` housekeeping transition from STATE_MACHINES is not
implemented anywhere; the follow-up nudge sequence (**A8**) is not built (no
cron/scheduled job exists in the repo at all); and the post-decline
"AI-drafted reply" is just another queued-never-sent notification.

### Step 6. Meeting held — WORKS END-TO-END, manually operated

For the loop you described (Issy operates it by hand), this step works today:

- **Confirm a time:** real admin action; `confirmMeeting`
  ([lib/meetings.ts:53](apps/platform/lib/meetings.ts#L53)) reserves a credit
  from the oldest lot, or books an overcommit (cap of 4, at least 30 days out,
  `payment_due_at` computed) when balance is zero. Tested against the DB.
- **Mark held / no-show / cancelled:** real admin buttons
  ([admin/meetings/actions.ts](apps/platform/app/admin/meetings/actions.ts)).

What is NOT BUILT (all fine to defer for a hand-run MVP): Zoom/Teams
attendance (**A5**), calendar invites and bidirectional sync (**A6**, the
join URL is a manually pasted text field and no invite email goes to anyone),
the auto-cancel job for unpaid overcommits at `payment_due_at` and its
reminder emails (needs cron infrastructure that does not exist), and the
"time confirmed" emails to the parties (queued, never sent, **A1** again).

### Step 7. Gift recorded — WORKS END-TO-END

The strongest step. `markHeld` consumes the credit, resolves the band cycle
with correct lazy 12-month renewal (DEC-4, the highest-priority defect in
V2_BUILD_PLAN section 4, now implemented and covered by
`cycle-renewal.test.ts`), and creates the one canonical `gift_record` with
the split frozen from the pricing engine plus the snapshot columns
(`sat_date`, `cycle_number`, `position_n`, `schedule_version`). Illegal
transitions are blocked at the database itself (migration 0012), so even
direct SQL cannot corrupt a gift. This is real, tested, money-grade work.

### Step 8. Issy releases the gift manually — PARTIALLY BUILT (works, but with a money-reporting bug and no undo)

The release itself works: the admin Giving view lists gift records and
`markGiftPaidAction`
([admin/giving/actions.ts](apps/platform/app/admin/giving/actions.ts)) flips
`released → paid` with a guard so only a released gift can be paid, and logs
the confirmation. Two real defects:

- **Bug (new, untracked): `paid_date` is never written.** The action stores
  `confirmation.paid_at` JSON but not the `paid_date` column that the
  reporting layer filters on. `charityDonatedToDate` excludes any gift whose
  `paid_date` is null from a date-windowed query (verified in
  [packages/pricing/src/reporting.ts:106](packages/pricing/src/reporting.ts#L106)
  and `inWindow`), so **every gift Issy marks paid from now on will silently
  vanish from the FY "donated to date" figures and the P&L**. Migration 0010
  backfilled historical rows once; new rows are not covered. Also `receipt_ref`
  is never captured (the column exists for exactly this purpose).
- **The correction paths do not exist in the app.** `held → reversed` (return
  the credit, rebook) and `released → voided` have DB guards permitting them
  (migration 0012) but no function in `lib/meetings.ts` and no admin button.
  If a vendor reports a wrongly-marked meeting, today Issy's only tool is raw
  SQL. (BUILD_HEALTH Tier 2 already tracks this; confirmed still true.)

### Loop summary

| # | Step | Classification |
|---|---|---|
| 1 | Vendor signs up | WORKS END-TO-END (edges: confirmation-flow dead-end, no password reset, no team invites) |
| 2 | Vetted | WORKS BUT SIMULATED (manual gate works; no Calendly, no alert ever delivered) |
| 3 | Pays | WORKS BUT SIMULATED (stub invoice + "Simulate paid"; no Xero connection exists) |
| 4 | Requests a meeting | PARTIALLY BUILT (in-app works; the exec email is queued forever, link surfaced nowhere) |
| 5 | Exec accepts | WORKS END-TO-END given the link (no token expiry, no follow-ups) |
| 6 | Meeting held | WORKS END-TO-END manually (A5/A6/auto-cancel not built, fine for now) |
| 7 | Gift recorded | WORKS END-TO-END (tested, DB-guarded) |
| 8 | Manual release | PARTIALLY BUILT (works; `paid_date` reporting bug; no reversal/void controls) |

**The shortest honest statement of distance:** the loop is one integration
(email out) away from being demoable with a real exec, and two integrations
(email out + Xero in) away from earning real revenue. Everything between
those two edges already works and is tested.

---

## 2. (a) Ranked gaps blocking a real vendor paying real money and a real exec receiving a real email

Ranked by "the loop cannot be real until this exists," mapped to
PRODUCTION_READINESS task IDs. Items marked NEW are not yet tracked there.

1. **A1 Email sender** — the single blocker for any real demo. Scope it
   honestly: provider wiring (Resend, per D-3) **plus** a notification
   `payload` schema migration (the queue rows cannot currently identify their
   request), **plus** composing the exec request email with the `/e/<token>`
   link from NOTIFICATION_TEMPLATES, **plus** a "copy exec link" fallback in
   the admin request view so Issy can hand-deliver while deliverability is
   tuned. Done when a submitted request lands in a real inbox and the row
   flips to `sent`.
2. **A2 Sending-domain authentication** — SPF/DKIM/DMARC on a dedicated
   subdomain. Founder action (DNS) with lead time; start it the same week as
   A1. An exec request email in spam is worse than no email.
3. **A4, rescoped: a real Xero connection** — the current task text ("harden
   the webhook") assumes an integration that does not exist. Recommended v1
   shape, matching MVP_SCOPE's intent without building an invoicing API:
   Issy raises the invoice in Xero itself; the platform's "Issue invoice"
   records the **real** Xero invoice number instead of a `STUB-` id; the
   webhook gets the real registration handshake and event mapping
   (`resourceId`/`eventType`, fetch status via the API). Done when a real
   Xero sandbox payment unlocks credits exactly once on replay.
4. **C11 Password reset** + the auth-callback gap (NEW edge from step 1) —
   no production SaaS ships without reset, and the email-confirmation
   dead-end should be closed in the same session since both are auth-flow
   work and both need A1's email sending anyway.
5. **NEW: the `paid_date` bug** (step 8) — small fix, real money-figure
   corruption from day one if unfixed. Propose tracking as a B4-adjacent
   correctness item. Fix alongside `receipt_ref` capture.
6. **A3 Bounce/complaint handling** — a dead exec address must flag, not
   silently swallow the product's first touch. Trails A1/A2 by design.
7. **A7 Calendly link + Slack new-signup alert** — small, removes the "Issy
   never finds out" holes in vetting. Manual vetting itself already works.
8. **B1 Sentry on the money paths** — a webhook or credit failure must not
   fail silently once real money flows. No Sentry dependency exists today.
9. **C4 Admin 2FA flip + C3 rate limiting** on `/login` and `/e/[token]` —
   the scaffolding for 2FA exists (flag, MFA routes); flip and verify before
   any real exec data is in the system. Rate limiting has no implementation
   today.
10. **State-machine completion** (V2_BUILD_PLAN §5, BUILD_HEALTH Tier 2) —
    `held → reversed` and `released → voided` app controls, `submitted →
    closed`, token expiry. Not strictly blocking the first dollar, but
    blocking the first *mistake* with a real vendor.

Worth knowing, not gaps: **D1/D2 (CI + test DB) are effectively DONE** —
`ci.yml` runs check:copy, lint, build, and the DB-backed tests against a real
local Supabase on every PR and on pushes to this branch. The unticked boxes in
PRODUCTION_READINESS are stale; tick them after verifying D5 (branch
protection on `main`) in repo settings. BUILD_HEALTH's "C1 tests exist but
nothing runs them" is likewise stale.

Explicitly NOT revenue-blocking despite Tier-2 billing in BUILD_HEALTH:
A5 (Zoom/Teams), A6 (calendar sync), A8 (follow-up sequence), the Reports UI,
and the auto-cancel job. All are automation of things Issy can do by hand at
MVP volume.

## 3. (b) The next 10 sessions, and which screen ports to defer

Premise: ~31 screens are specified in PORTAL_LAYOUT_BLUEPRINT; roughly 16
routes exist. The blueprint says none may be dropped, **for the finished
platform**. For a demoable, revenue-capable MVP, screen ports are almost all
the wrong next spend: the missing screens are directory/quality-of-life
surfaces, while the missing integrations are the product. Recommended order
(money/state sessions on Opus at max effort per the house routing rules;
each session ends with the standard gates green):

1. **S1 — A1 email sender core.** Payload migration, Resend wiring, the exec
   request email with the signed link, the vendor receipt, idempotent queue
   drain, sent/bounced status write-back, admin "copy link" fallback.
2. **S2 — Deliverability + signals.** A2 domain auth (give Issy the exact DNS
   records), A3 bounce webhook, A7 Calendly link + Slack alert, inbox
   placement test. After S2 a real exec can receive a real email: the
   demoable milestone.
3. **S3 — Xero for real (A4 rescoped).** Real invoice number entry, webhook
   registration handshake, real event mapping, replay test against the Xero
   sandbox. After S3 a real vendor can pay real money: the revenue-capable
   milestone.
4. **S4 — Auth completeness.** C11 password reset, the confirmation-callback
   fix, C3 rate limits on login + token endpoints, C4 2FA flipped on staging.
5. **S5 — Money correctness + the undo paths.** The `paid_date` bug,
   `receipt_ref`, `held → reversed` and `released → voided` controls,
   `submitted → closed` + token expiry. All small; all protect the first real
   vendor relationship.
6. **S6 — Safety net.** B1 Sentry on both apps with money-path breadcrumbs,
   B4 reconciliation cron running the 10 invariants, the auto-cancel +
   payment-reminder cron (the infrastructure is shared).
7. **S7 — Vendor trust surfaces (the only ports worth doing now).**
   `/vendor/billing` (see the real invoice and credits) and a thin
   `/vendor/requests` + `/vendor/meetings`. A paying vendor must be able to
   see what they paid for.
8. **S8 — Admin operating surfaces.** `/admin/requests` (list, nudge, close,
   the copy-link action lives here) and the admin meeting detail (T4) so the
   state machine is driven from a proper screen instead of list-row buttons.
9. **S9 — Prove the loop.** D3 Playwright E2E of request → email → accept →
   confirm → held → gift → paid plus reversal, D4 seeded-staging invariants
   as a CI gate, then a full dress rehearsal on staging with a real inbox and
   the Xero sandbox.
10. **S10 — Launch hygiene.** Tick the stale PRODUCTION_READINESS boxes
    honestly, B3 backups/PITR + restore runbook, C5 secret scan, sweep the
    loop screens for empty/loading/error states, update BUILD_HEALTH, and
    walk the SECURITY pre-launch checklist to produce the go/no-go list for
    the founder gates (legal/accountant items stay yours, per the house
    rules).

**Defer entirely until after first revenue** (no session time at all): admin
Comms, admin Checklists, admin Settings UI (flags via the Supabase dashboard
are fine for one operator), vendor Get-started checklist, vendor Team/invites
(until a second-seat vendor actually exists), exec Impact, exec Profile, the
EA view, the self-serve charity picker (Issy sets charities at onboarding,
per MVP_SCOPE), and the `/admin/reports` UI (the reporting library and CSV
envelope are already built and tested; build the screen when there is a
month of real data to report on).

## 4. (c) What I would call wasted or premature for MVP

Said plainly, with the caveat that most of these were cheap and none are
disasters:

1. **The executive web dashboard** (`/exec`, flag `exec_dashboard`) plus the
   in-platform `/exec/email` and `/exec/rsvp` mockup-port pages. MVP_SCOPE
   explicitly defers the exec portal ("v1 needs the email, not the portal"),
   and the build's own comment admits the dashboard runs on a hardcoded demo
   executive. This was built while the actual exec surface (the email) has
   never sent once. Keep it as demo collateral; spend nothing more on it.
2. **Polishing the pre-active vendor pipeline display** (the four-state pill
   work in the latest commit) including a `paid` state **that no code path can
   ever set**. Cosmetic effort ahead of the integration that would make those
   states real. Either wire `applyPaidInvoice` to pass through `paid` or
   remove the dead state.
3. **The reports/CSV layer ahead of any revenue.** Not wasted (it is tested,
   CALCULATIONS-mandated, and the dashboards consume it so the three surfaces
   cannot drift), but it was sequenced before email and payments, which is
   exactly backwards relative to the revenue loop. Treat as early, not wrong;
   the lesson is for sequencing what remains.
4. **Dead config:** `EMAIL_TOKEN_SECRET` is exported in CI and used by zero
   source files. Remove it or note what it is reserved for.
5. **Stale tracking docs cost real session time** (this audit spent effort
   discovering that D1/D2 are done, that the blueprint's "vendor detail is a
   stub" note is outdated, and that MVP_SCOPE's auth assumption diverges from
   the code). A 15-minute doc-truth pass at the end of S10 is cheaper than
   every future session re-deriving reality.

What is explicitly NOT waste, to be fair to the build: the pricing package,
the RLS + DB transition guards, the DB-backed test suite, CI with a real
Postgres, the audit log, and the `packages/ui` kit (ART-5 gates the ports).
That foundation is why the ten sessions above are mostly integration work
rather than rebuilding.
