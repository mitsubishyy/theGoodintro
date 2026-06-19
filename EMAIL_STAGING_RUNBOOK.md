# Email staging runbook (transactional sending go-live)

One ordered checklist to take the transactional email path live (Resend) on a
**public URL** (Vercel staging, or a tunnel pointing at local `:3001`). It covers
the two pieces that cannot run on localhost: the **DNS-authenticated sender** and
the **pg_cron drain schedule**.

Authoritative detail: [`OPS_AND_COMPLIANCE.md`](OPS_AND_COMPLIANCE.md) (sender +
deliverability), [`EMAIL_ACTIONS.md`](EMAIL_ACTIONS.md) (the signed confirm-page
links the exec email carries), [`NOTIFICATION_TEMPLATES.md`](NOTIFICATION_TEMPLATES.md)
(copy). **Issy runs every DNS / portal / connected-window step** (Claude must not
touch the cloud DB, change cloud flags, or edit DNS). All money figures come from
`@thegoodintro/pricing` + CALCULATIONS.md.

## What is already built (do not rebuild)

- **Send pipeline:** `lib/email/transport.ts` (Resend REST client),
  `lib/email/sender.ts` (`drainEmailQueue`: claim -> compose -> send -> write back,
  idempotent per `notification.id`, retry to 3 attempts, stale-`sending` reclaim),
  `lib/email/templates.ts` (locked B1 exec request, A1 admin alert + vendor
  welcome, A4 receipt). Covered by `tests/email.test.ts`.
- **Automated dispatcher:** `POST /api/jobs/email-drain` (commit 776a411). Guards:
  `CRON_SECRET` bearer (503 until set) -> `email_sending` flag (200 skipped when
  off) -> `RESEND_API_KEY` (200 skipped when absent) -> admin client -> drain.
  Test: `tests/email-drain-route.test.ts`.
- **Manual stopgap:** the admin "Send queued emails" action (`/admin/meetings`
  actions) runs the same drain by hand.
- **Test-mode guard:** unless `EMAIL_MODE=live`, every recipient is redirected to
  `EMAIL_TEST_RECIPIENT` and sent from Resend's onboarding sender. No real
  external address can receive mail until Issy flips `EMAIL_MODE=live`.
- **Flag `email_sending` is OFF by default.**

Routes referenced below:
- Drain job: `POST /api/jobs/email-drain`

---

## Phase 0 - Prerequisites

- [ ] Platform deployed to a public URL `https://<host>` (or a tunnel to `:3001`).
- [ ] **`CRON_SECRET` set in the deploy env** (the same secret the Xero reconcile
      job uses; one secret gates both `/api/jobs/*` routes).
- [ ] **`RESEND_API_KEY` set in the deploy env.**
- [ ] **Vercel Deployment Protection OFF for `/api/jobs/email-drain`** (or use the
      Protection Bypass for Automation header on the `pg_net` call). The route
      self-protects with the `CRON_SECRET` bearer, so it never relied on Vercel's
      wall - same note as the Xero runbook Phase 0.

---

## Phase 1 - DNS / authenticated sender (the pre-launch must)

Goal: a properly authenticated **sending subdomain** so platform mail never risks
the cold-outreach reputation on the `thegoodintros.com` root
(OPS_AND_COMPLIANCE "dedicated subdomain"). Target subdomain: **`notify.thegoodintros.com`**.

- [ ] **1.1** In Resend -> **Domains** -> **Add Domain**, enter
      `notify.thegoodintros.com`. Resend shows the exact records to add (the values
      are generated per domain, so copy them verbatim - they are not knowable ahead
      of time). Expect roughly: one **SPF** TXT, two to three **DKIM** CNAME/TXT,
      and a **DMARC** TXT.
- [ ] **1.2** In **GoDaddy** DNS for `thegoodintros.com`, add each record exactly
      as Resend shows it (host names scoped to the `notify` subdomain).
- [ ] **1.3** Back in Resend, **Verify** the domain. Do not proceed to live until
      it reads Verified (SPF + DKIM + DMARC all green). Without this the exec
      emails land in spam, which sinks the whole model.

---

## Phase 2 - From-addresses

- [ ] **2.1** Set in the deploy env, both on the verified subdomain:
      - `EMAIL_FROM_BRAND` - the brand sender (e.g. `TheGoodIntro <hello@notify.thegoodintros.com>`).
      - `EMAIL_FROM_PERSONAL` - Issy's sender for the exec request email + welcome
        (e.g. `Issy Hardwick <issy@notify.thegoodintros.com>`).
      - `EMAIL_REPLY_TO` (optional) - where replies (incl. "reply CHARITY") land.
- [ ] **2.2** Confirm `NEXT_PUBLIC_APP_URL=https://<host>` so the exec email's
      `/e/[token]` Accept / Decline / Send-to-EA links point at the deploy, not
      localhost.

> Wording + exact sender are a **parked decision** (see end). The build uses the
> README's recommended subject and the personal sender; Issy confirms at go-live.

---

## Phase 3 - Schedule the drain (pg_cron)

Localhost is unreachable by pg_cron, so this is a staging/prod step, run in the
**connected (cloud) window** by Issy. Mirrors the Xero reconcile schedule.

```sql
-- connected window only; <host> = the deployed platform, <CRON_SECRET> = deploy env value
select cron.schedule(
  'email-drain',
  '*/5 * * * *',                          -- every 5 minutes; tune as needed
  $$ select net.http_post(
       url     := 'https://<host>/api/jobs/email-drain',
       headers := jsonb_build_object(
                    'authorization', 'Bearer <CRON_SECRET>',
                    'content-type', 'application/json'),
       body    := '{}'::jsonb
     ) $$
);
```

- [ ] **3.1** Register the schedule. While `email_sending` is OFF the route is a
      no-op (200 `email_sending_off`), so it is safe to schedule before go-live.

---

## Phase 4 - Smoke test (still test mode)

- [ ] **4.1** With `EMAIL_MODE` unset/test, run the live smoke from `apps/platform`:
      `EMAIL_SMOKE=1 RESEND_API_KEY=... npx vitest run tests/email-smoke.test.ts`.
      It queues one exec request and drains it through real Resend; the email
      lands at `EMAIL_TEST_RECIPIENT` (`issy@thegoodintros.com`). It keeps the
      request live and prints the confirm-page URL.
- [ ] **4.2** From that inbox, click **Accept**, **Decline**, and **Send to EA**
      against the running dev server and confirm the confirm page behaves. This is
      the gate that has kept A1 unticked: Issy confirms the buttons work from a
      real inbox.

---

## Phase 5 - Go live

- [ ] **5.1** Set `EMAIL_MODE=live` in the deploy env (redeploy). The test-mode
      recipient redirect is now off; real recipients receive mail.
- [ ] **5.2** Turn ON the **`email_sending`** flag in the staging/prod DB
      (connected window).
- [ ] **5.3** Watch one real send flow end to end: a queued `B1_request_submitted`
      row flips to `status='sent'` with a `provider_message_id`; the cron fired it
      (check `cron.job_run_details` and the row's `sent_at`).
- [ ] **5.4** Tick **A1** in [`PRODUCTION_READINESS.md`](PRODUCTION_READINESS.md).

---

## Parked decisions (Issy's call, do not default)

1. **Sender address + subject line.** Build uses the recommended subject
   ("{Name} ({Company}) has requested {N} minutes") and the personal sender.
2. **Personal founder signature vs system footer.** The lock renders the quiet
   system footer; `lib/email/signature.ts` exists if Issy adopts the personal
   sign-off (it slots between the reply invitation and the hairline).

## Not yet templated (queued but will not send until built)

`drainEmailQueue` sends `SUPPORTED_EMAIL_EVENTS`: **B1_request_submitted**,
**B_forward_to_ea** (Send-to-EA forward, wired 2026-06-19), **A1_vendor_signed_up**
(admin alert), **A4_invoice_paid**. The events below are already QUEUED by the
flows but have no template, so they stay queued untouched until a template is
written and the event is added to `SUPPORTED_EMAIL_EVENTS`:

- **C1_exec_accepted** (vendor: securing a time), **C2_time_confirmed** (vendor:
  invite sent), **C6_meeting_completed** (exec: gift + optional LinkedIn share),
  **D1_uncredited_booked** (vendor: pay-by date).
- **A1 vendor welcome** - `vendorWelcomeEmail` template exists (copy signed off
  2026-06-13) but is not wired into the drain.

Each needs copy/design before sending. None block the exec request email (B1),
which is the front door and is fully built.
