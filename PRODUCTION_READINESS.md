# TheGoodIntro Production Readiness (build plan + launch checklist)

The things a correct codebase still needs to actually run in production safely.
This turns the intent already written in [`OPS_AND_COMPLIANCE.md`](OPS_AND_COMPLIANCE.md)
and [`SECURITY_AND_COMPLIANCE.md`](SECURITY_AND_COMPLIANCE.md) into a concrete,
ordered build plan that doubles as a tracked checklist. It sits alongside
[`V2_BUILD_PLAN.md`](V2_BUILD_PLAN.md) (the feature build) and shares its
verification gates.

**How to use this:** read it to understand what production needs; tick a box only
when the task is built AND its "Done when" acceptance is met AND the standard gates
pass (`npm test && npm run lint && npm run build && npm run check:copy`). The
platform is launch-ready when every box in sections A to D and the launch gate
(section 7) is ticked and the founder/external gates (section 1) are cleared.

Nothing here is "done" because it was written. It is done when its box is ticked.

---

## 1. Founder / external gates (above the build; not code, but they gate launch)

These can invalidate large parts of the build, so resolve them early. They are not
engineering tasks; they need you and outside professionals.

- [ ] **[LEGAL] Charity-funds / non-custodial structure confirmed** (the donation
      model in [`CHARITY_FLOW.md`](CHARITY_FLOW.md) holds under AU fundraising law).
- [ ] **[LEGAL] Entity registered** (TheGoodIntro Pty Ltd, ABN/ACN), platform Terms
      (vendor + exec), privacy policy + collection notice drafted.
- [ ] **[ACCOUNTANT] Tax treatment confirmed** (GST/BAS, donation deductibility, DGR
      receipting, 7-year records; the open items in CALCULATIONS.md section 5).
- [ ] **Executive supply validated.** Evidence that senior executives will accept
      (the platform is worthless without them; outreach is currently paused).
- [ ] **Ownership / maintenance decided.** Who responds when a money-path incident
      happens, given the founder is non-technical (a technical maintainer or a tight
      ops runbook + on-call).

## 2. Open scope decisions (confirm before building the tagged task)

Each materially changes v1 scope and ongoing cost. My recommendation is the
default; change it before the tagged task is built.

- **D-1 Meeting outcome detection (tasks A5).** *Recommended: manual for v1.* Issy
  marks held / no-show in the admin portal (the control already exists); defer the
  Zoom/Teams attendance webhook to v1.1. Building the dual Zoom + Teams attendance
  integration is weeks of work plus maintenance.
- **D-2 Calendar depth (task A6).** *Recommended: one-way push for v1.* Write and
  update invites to Google/Outlook and push reschedules/cancels; defer the
  "detect a direct edit in the exec's own calendar and raise a flag" reverse-sync
  (the expensive half) to later.
- **D-3 Transactional email provider (task A1).** *Recommended: Resend* (cleanest
  Next integration, low cost). Postmark is the alternative. Easily swapped.
- **D-4 Error monitoring (task B1).** *Recommended: Sentry* (free tier covers v1).

---

## 3. A. Integrations that are assumed but not real

Email deliverability is the highest risk: the exec request email is the product.

- [ ] **A1 Email sender.** Build `apps/platform/lib/email/` that drains the existing
      `notification` queue (today rows are queued and nothing sends) through the
      provider (D-3), idempotent per notification id, writing back sent/bounced
      status. *Done when:* a queued notification is delivered to a real inbox in
      staging and its row flips to `sent`.
- [ ] **A2 Sending-domain authentication.** SPF + DKIM + DMARC on a dedicated
      subdomain (e.g. `send.thegoodintro.com`). *Done when:* a mail-tester / inbox
      placement check scores clean and a test exec email lands in the inbox, not
      spam. **Pre-launch must.**
- [ ] **A3 Bounce / complaint handling.** Provider webhook marks a dead exec address
      and flags it to Issy. *Done when:* a simulated bounce flags the address and
      halts that request.
- [ ] **A4 Xero "invoice paid" webhook hardened** (route exists at
      `apps/platform/app/api/webhooks/xero/route.ts`). Signature verification,
      idempotency keyed on invoice id, links the CreditLot, manual-reconcile
      fallback. *Done when:* a signed test event unlocks credits exactly once on
      replay, and a forged event is rejected.
- [ ] **A5 Meeting outcome** (see D-1). v1: a clean admin held / no-show control with
      an audit entry. *Done when:* marking held creates the GiftRecord via the
      pricing engine and marking no-show releases the reservation.
- [ ] **A6 Calendar invites** (see D-2). v1: push invites with the meeting link to
      both parties; reschedule/cancel updates the invite. *Done when:* confirming a
      meeting creates calendar invites and a reschedule updates them.
- [ ] **A7 Calendly vetting link + the single Slack new-signup alert.** *Done when:*
      a new signup posts one Slack message and the vetting link is wired.

## 4. B. Observability, backups, and a reconciliation job that RUNS

- [ ] **B1 Error monitoring** (see D-4) across both apps, with breadcrumbs on the
      money paths (webhook, credit consume, gift create). *Done when:* a thrown
      error in staging appears in the dashboard with money-path context.
- [ ] **B2 Structured + security logging:** failed logins, permission denials, and
      money-path events are logged. *Done when:* those events are queryable.
- [ ] **B3 Backups / point-in-time recovery** enabled on Supabase, with a written
      restore runbook. *Done when:* a test restore to a scratch DB succeeds and the
      runbook is in the repo.
- [ ] **B4 Reconciliation job (the safety net).** A daily scheduled job (Vercel cron
      or pg_cron) runs the 10 invariants (`reconcileFees`, `reconcileThreeWays` from
      `@thegoodintro/pricing`) against live data and alerts on any drift. *Done
      when:* it runs on schedule, passes on clean data, and fires an alert when a gift
      row is deliberately corrupted in staging.
- [ ] **B5 Uptime / health check + alerting.** *Done when:* an endpoint-down
      condition pages someone.

## 5. C. Privacy, security, and compliance (engineering)

Most of the posture is in `SECURITY_AND_COMPLIANCE.md`; these are the build tasks.

- [ ] **C1 RLS policies written AND covered by tests** (the spec demands tests, not
      assumption). *Done when:* a vendor-user test cannot read another org's rows and
      the test runs in CI.
- [ ] **C2 Webhook signature verification** on Xero and (if built) Zoom/Teams. *Done
      when:* an unsigned/forged event is rejected.
- [ ] **C3 Rate limiting** on auth and the signed-link confirm endpoints.
- [ ] **C4 Admin 2FA enforced from launch** (the `login/mfa` route exists; enforce
      it for staff).
- [ ] **C5 Secrets** in env only, separate dev/prod, rotation on staff change; add a
      secret scan to CI. *Done when:* CI fails on a committed secret.
- [ ] **C6 Server-side input validation** + the request content guard (strip
      emails/phones/links from vendor request fields); output encoded.
- [ ] **C7 Soft-delete + retain + purge** implemented; append-only audit log verified
      (tamper-evident). *Done when:* an erasure request hides PII but retains
      financial/gift history, and audit rows cannot be edited.
- [ ] **C8 Privacy policy + collection notice + platform Terms live [LEGAL].**
- [ ] **C9 Incident-response (NDB) plan written** (detect, contain, assess, notify
      OAIC if required). Owner: Issy.
- [ ] **C10 DIY OWASP / ASVS review** done before launch; external pen-test budgeted
      (~AUD $6k to $10k) for the scaling milestone.

## 6. D. Test and CI infrastructure

- [ ] **D1 GitHub Actions CI** running `npm test && npm run lint && npm run build &&
      npm run check:copy` on every PR (today only `indexnow.yml` exists). *Done
      when:* a PR is blocked on a failing gate.
- [ ] **D2 Test database in CI** (Supabase local via the CLI, or an ephemeral
      project) so the DB-backed state-machine and RLS tests actually run. *Done
      when:* `apps/platform/tests/*.test.ts` pass in CI against a real Postgres.
- [ ] **D3 Playwright E2E** of the full loop: request -> email -> accept -> confirm
      -> held -> gift -> paid, plus reversal and auto-cancel. *Done when:* the loop
      passes headless in CI.
- [ ] **D4 Seeded staging** where the section-4 reconciliation invariants run green
      as a CI gate.
- [ ] **D5 Branch protection:** green CI required to merge to `main`.

---

## 7. Phasing and the launch gate

**Phase 1 (before any real user touches it):** D1, D2, B1, B3, C1, C5. Makes
everything after it verifiable and safe.

**Phase 2 (alongside the v2 feature build in V2_BUILD_PLAN):** A1, A4, B4, C2, C3,
C6, D3. The money and workflow hardening.

**Phase 3 (pre-launch):** A2, A3, C4, C7, plus the founder/external gates (section 1)
and the legal/privacy items C8 to C10.

**The launch gate (do not go live until all true):**
- [ ] Every box in sections A to D ticked, or explicitly deferred with Issy's sign-off.
- [ ] The standard gates pass: `npm test && npm run lint && npm run build && npm run check:copy`.
- [ ] On seeded staging, the 10 CALCULATIONS invariants tie out to the dollar.
- [ ] The `SECURITY_AND_COMPLIANCE.md` pre-launch checklist is complete.
- [ ] The founder/external gates (section 1) are cleared.

This file and `SECURITY_AND_COMPLIANCE.md`'s pre-launch checklist are the two lists
to clear before launch. When both are green and the gates pass, the platform is
production-ready.
