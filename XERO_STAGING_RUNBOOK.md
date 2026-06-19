# Xero staging runbook (combined webhook + reconcile go-live)

One ordered checklist to take the Xero payment path live on a **public URL**
(Vercel staging, or a tunnel like ngrok pointing at local `:3001`). It stitches
together the two pieces that cannot run on localhost:

- **Webhook** (Xero calls us when an invoice is paid) - contract §9.
- **Daily reconcile** (the webhook's safety net, via Supabase `pg_cron`) - contract §10.

Authoritative detail lives in [`XERO_INTEGRATION_CONTRACT.md`](XERO_INTEGRATION_CONTRACT.md);
this file is the step-by-step. **Issy runs every portal / connected-window step**
(Claude must not touch the cloud DB or change cloud flags). All money figures
come from `@thegoodintro/pricing` + CALCULATIONS.md.

> **Real-org + real-email cautions (read first).**
> - The connected org is the real **"TheGoodIntro"** Xero org, not a Demo
>   Company. AUTHORISED and paid invoices touch the books. **Confirm the target
>   org** before any authorise/paid step; use the Demo Company, or void test
>   invoices afterwards.
> - The **Email** action sends a *real* email through Xero to the contact.
>   For tests, point the contact email at the Demo Company or your own address
>   only. Never email a synthetic or real vendor.

Routes referenced below (platform app):
- Webhook: `POST /api/webhooks/xero`
- Reconcile job: `POST /api/jobs/xero-reconcile`
- OAuth callback: `GET /api/integrations/xero/callback`

---

## Phase 0 - Prerequisites

- [ ] Platform deployed to a public URL `https://<host>` (or a tunnel forwarding
      to `:3001`). Note the host; it is used throughout. **Current Vercel
      production alias:** `thegoodintro-platform-mitsubishyys-projects.vercel.app`
      (swap for a custom domain once one is assigned).
- [ ] **Vercel Deployment Protection is OFF for the two routes Xero + pg_cron
      hit.** Verified 2026-06-19: a POST to `/api/webhooks/xero` and
      `/api/jobs/xero-reconcile` on the production alias both return Vercel's
      **401 SSO auth wall** *before reaching our handlers*. External senders
      (Xero's webhook, pg_cron's `pg_net`) cannot pass that wall, so the ITR
      handshake and the cron POST would both fail with a confusing 401. Fix one:
      - **Disable Deployment Protection for Production** (Project → Settings →
        Deployment Protection). Safe here: both routes self-protect (HMAC
        signature / `CRON_SECRET` bearer), so they never relied on Vercel's wall.
      - **OR keep it and use Protection Bypass for Automation:** append
        `?x-vercel-protection-bypass=<token>` to the Xero delivery URL, and add
        an `x-vercel-protection-bypass: <token>` header to the `pg_net` call.
- [ ] **OAuth redirect URI** for this host is registered on the Xero app
      (developer.xero.com to your app to Configuration) **and** set in the deploy
      env as `XERO_REDIRECT_URI=https://<host>/api/integrations/xero/callback`.
      It must match **exactly** (the local value is `:3001`; staging needs its
      own registered URI).
- [ ] Deploy env already has `XERO_CLIENT_ID`, `XERO_CLIENT_SECRET`,
      `XERO_TOKEN_ENC_KEY`. (`XERO_WEBHOOK_KEY` and `CRON_SECRET` are added in
      Phases 1 and 2.)
- [ ] **Feature flags ON** in the staging DB (connected window): `admin_shell`,
      `integrations_xero`, `vendor_payments`. With `integrations_xero` off the
      webhook, reconcile route, and Xero calls are all inert.
- [ ] **Reconnect Xero**: on the deployed `/admin/settings` page click
      Connect / Reconnect Xero and complete the OAuth round-trip. Confirm
      "Connected to TheGoodIntro".

---

## Phase 1 - Webhook (contract §9)

- [ ] **1.1** Delivery URL = `https://<host>/api/webhooks/xero`. In
      developer.xero.com to your app to **Webhooks**, set it and tick the
      **Invoices** event.
- [ ] **1.2** Copy the **Webhooks key** shown there into the deploy env as
      `XERO_WEBHOOK_KEY`, then redeploy / restart so it is live. (Until set, the
      route returns **503** by design.)
- [ ] **1.3** Click **"Send 'Intent to receive'."** Our route answers **200**
      to correctly-signed pings and **401** to bad ones; the portal status flips
      to **OK**. (If it stays failed, see Troubleshooting.)

---

## Phase 2 - Daily reconcile schedule (contract §10)

- [ ] **2.1** Generate a secret and set it in the deploy env:
      `CRON_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))")`,
      then redeploy / restart. (Until set, `/api/jobs/xero-reconcile` returns
      **503**.)
- [ ] **2.2** Smoke-test the route directly:
      ```bash
      curl -sS -X POST https://<host>/api/jobs/xero-reconcile \
        -H "Authorization: Bearer <CRON_SECRET>"
      ```
      Expect `{ "ok": true, "summary": { "checked": N, "driftUnlocked": 0,
      "voidedPaid": 0, "voidedUnpaid": 0, "errors": 0 } }` on clean data. A wrong
      / missing bearer returns **401**; with no `CRON_SECRET` set, **503**.
- [ ] **2.3** Schedule it in the **connected Supabase SQL editor** (UTC; replace
      both placeholders):
      ```sql
      create extension if not exists pg_cron;
      create extension if not exists pg_net;
      select cron.schedule(
        'xero-reconcile-daily',
        '0 16 * * *',                       -- 16:00 UTC is about 02:00 AEST
        $$
          select net.http_post(
            url     := 'https://<host>/api/jobs/xero-reconcile',
            headers := jsonb_build_object(
              'Content-Type',  'application/json',
              'Authorization', 'Bearer <CRON_SECRET>'
            )
          );
        $$
      );
      ```
- [ ] **2.4** Confirm it is scheduled: `select jobname, schedule from cron.job;`

---

## Phase 3 - Combined end-to-end test

Proves the happy path (webhook) and the safety net (reconcile + void).

- [ ] **3.1 Issue + authorise + email.** In `/admin/vendors/<test vendor>`,
      Billing: **Issue invoice** (creates a DRAFT) to **Authorise** (lifts it to
      AUTHORISED in Xero, no email) to **Email** (sends to the *safe* contact;
      ledger row flips `draft` to `sent`). Verify the invoice is AUTHORISED in
      Xero and the email arrives.
- [ ] **3.2 Webhook unlock (happy path).** Record a payment against that invoice
      in Xero. Within seconds the webhook fires and credits unlock: the ledger
      invoice flips to `paid`, a `credit_lot` is created, and the vendor goes
      `active`. (Use the admin vendor page or the queries below.)
- [ ] **3.3 Reconcile drift (safety net).** Prove the backstop catches a missed
      webhook: issue + authorise a **second** test invoice, then **temporarily
      disable the webhook** in the Xero portal (or set its Delivery URL aside),
      record a payment, confirm credits did **not** unlock, then run the
      reconcile (curl from 2.2). It should report `driftUnlocked: 1`, unlock the
      credits, and raise a `B4_reconcile_drift` staff alert. Re-enable the
      webhook afterwards.
- [ ] **3.4 Void to reverse-unlock.** In Xero, **void a paid** test invoice. Run
      the reconcile (curl). It stamps `invoice.voided_in_xero_at`, raises a
      `B4_invoice_voided` alert, and a **"Reverse credit unlock"** item appears
      in the admin **Needs action** queue. Confirm it did **NOT** auto-reverse
      (credits + `credit_lot` untouched; reversal is a manual policy step,
      V2_BUILD_PLAN §7). A second reconcile run does not duplicate the item.
- [ ] **3.5** Clean up: void any remaining test invoices in Xero so the books
      stay clean.

### Verification queries (connected SQL editor, read-only)
```sql
-- the unlock landed
select status from invoice where xero_invoice_id = '<InvoiceID>';
select vendor_id, quantity, quantity_remaining from credit_lot order by purchased_at desc limit 5;

-- reconcile ran + what it did (one row per run)
select created_at, metadata from audit_entry
  where action = 'reconcile.run' order by created_at desc limit 5;

-- drift / void alerts queued for staff
select created_at, event, payload from notification
  where event in ('B4_reconcile_drift','B4_invoice_voided') order by created_at desc;

-- a paid invoice voided in Xero (the reverse-unlock backlog)
select id, vendor_id, voided_in_xero_at from invoice
  where status = 'paid' and voided_in_xero_at is not null;

-- cron run history
select start_time, status, return_message from cron.job_run_details
  order by start_time desc limit 10;
```

---

## Rollback / disable

- **Kill switch:** turn the `integrations_xero` flag **off** in the staging DB.
  The webhook, the reconcile route, and the authorise/email actions all go
  inert (no calls to Xero).
- **Webhook only:** unset `XERO_WEBHOOK_KEY` (route returns 503) and/or clear the
  Delivery URL in the Xero portal.
- **Reconcile only:** `select cron.unschedule('xero-reconcile-daily');`
- **Idempotency safety:** the webhook and the reconcile both run the same
  `applyPaidInvoice`, keyed on `xero_invoice_id` with a claim-on-status update,
  so a double-fire (cron + webhook on the same payment) **cannot** double-credit.

---

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Webhook ITR stays "failed" in the portal | `XERO_WEBHOOK_KEY` wrong or not deployed; the signature is over the **raw** body, so any proxy that rewrites the body breaks it. Confirm the key matches the Webhooks tab and the route is the live deploy. |
| Webhook / reconcile route returns **503** | Its secret is unset: `XERO_WEBHOOK_KEY` (webhook) or `CRON_SECRET` (reconcile). Set + redeploy. |
| Reconcile returns `{ "skipped": "xero_not_connected" }` | Reconnect Xero on `/admin/settings` (a DB reset wipes `xero_connection`). |
| Reconcile returns `{ "skipped": "integrations_xero_off" }` | Turn the `integrations_xero` flag on. |
| Reconcile route returns **401** | Bearer mismatch: `Authorization: Bearer <CRON_SECRET>` must equal the deploy env value exactly. |
| `B4_reconcile_drift` alerts keep appearing daily | The webhook is failing to deliver (the reconcile is doing the webhook's job). Check the Xero portal webhook status (Xero disables a persistently failing webhook) and Phase 1. |
| Email step does nothing | The invoice is not payable yet (still DRAFT): click **Authorise** first. The Email action refuses to send anything not SUBMITTED/AUTHORISED/PAID. |
| Connect fails with a redirect mismatch | `XERO_REDIRECT_URI` env and the URI registered on the Xero app must both be `https://<host>/api/integrations/xero/callback`, exactly. |
