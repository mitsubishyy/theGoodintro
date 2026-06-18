# theGoodintro — Xero Integration Contract (ART-3)

**Status:** written 2026-06-12 per DEC-13 (COLD_START_GAPS.md). Drafted from
Xero's public developer documentation, not yet exercised against the live API.
The "Verify at build time" list at the bottom must be cleared in the connected
build window before any item here is treated as load-bearing. No integration
code exists yet; build starts only on Issy's go.

**What this covers:** the v1 payment path. Create a GST tax invoice for N
meeting credits, deliver it to the vendor, detect payment via webhook, unlock
credits through the existing `applyPaidInvoice` (`apps/platform/lib/billing.ts`),
and populate the purchase-ledger columns. Money rules come from CALCULATIONS.md;
this file only maps them onto Xero.

## 1. Accounts and access (free until launch)

- Developer signup at developer.xero.com is **free, instant, and self-serve**
  (any Xero login works; no approval queue, no paid program).
- Testing uses the free **Demo Company (AU edition)**. It resets periodically;
  never rely on record IDs persisting between sessions, and re-run the seed
  steps (contact, branding, payment service) after a reset.
- A paid Xero subscription is needed **only at launch**, when the real
  TheGoodIntro organisation starts invoicing. Plan choice is Issy's accountant's
  call (DEC-13 keeps the bookkeeping-platform decision open).
- Uncertified-app limits: max **25 connected organisations** per app and max
  **2 uncertified apps** per organisation. We need 1 connection (2 during the
  Demo Company overlap), so both limits are irrelevant unless the accountant's
  practice tooling already occupies slots; check before launch connect.

## 2. OAuth 2.0 (authorization code flow)

- **Authorize URL:** `https://login.xero.com/identity/connect/authorize`
  with `response_type=code`, `client_id`, `redirect_uri` (must exactly match a
  URI registered on the app), `scope`, `state`.
- **Token URL:** `https://identity.xero.com/connect/token` (form-encoded;
  client id/secret via HTTP basic auth header).
- **Scopes (request exactly these):** `openid profile email offline_access
  accounting.contacts accounting.invoices accounting.settings.read`.
  `offline_access` grants the refresh token (without it the connection dies in
  30 minutes). **Granular-scopes gotcha (verified 2026-06-16):** Xero retired the
  broad `accounting.transactions` scope for apps created after 2026-03-02; our
  app is post-cutoff, so requesting it returns `invalid_scope`. The granular
  replacements are `accounting.invoices` (create/read invoices, detect paid via
  status) and, if ever reading Payment objects directly, `accounting.payments`.
  `accounting.contacts` and `accounting.settings` are unchanged and available to
  any app. If stage 2/3 needs more, adding a scope requires Issy to reconnect once.
- **Tenant:** after token exchange, `GET https://api.xero.com/connections`
  (bearer token) returns the authorised tenants; store `tenantId` and send it
  as the `xero-tenant-id` header on every Accounting API call.
- **Token lifetimes:** access token **30 minutes**; refresh token is
  **single-use and rotates** (each refresh returns a new refresh token; the
  old one stays valid for a **30-minute grace window**); an **unused** refresh
  token expires after **60 days**.
- **Storage:** one encrypted row (integration-credentials table or equivalent),
  written atomically on every refresh: `{access_token, refresh_token,
  expires_at, tenant_id}`. Single-writer refresh (advisory lock or queue) so two
  concurrent jobs cannot race the rotation; on a failed save, retry within the
  30-minute grace window before declaring the connection lost and alerting Issy.
- **Reconnect path:** an admin-settings "Connect Xero" action per the locked
  admin-settings OAuth drawer pattern. Needed once at setup, again at launch
  (Demo Company to real org), and whenever the refresh chain is lost.

## 3. Invoice creation (N credits at $1,500 ex GST + GST)

- **Endpoint:** `POST https://api.xero.com/api.xro/2.0/Invoices`
  (`xero-tenant-id` + bearer headers).
- **Shape:**
  - `Type: "ACCREC"`, `Status: "AUTHORISED"` (draft invoices cannot be emailed
    or paid), `Reference`: our internal invoice id, `DueDate`: per payment terms.
  - `Contact`: the vendor org as a Xero Contact (find-or-create via
    `POST /Contacts`, keyed on our vendor id in `Contact.ContactNumber`; store
    the returned `ContactID` on the vendor row).
  - `LineAmountTypes: "Exclusive"` (line amounts are ex GST; Xero adds GST).
  - One line: `Description: "Meeting credits x N"`, `Quantity: N`,
    `UnitAmount: 1500.00`, `AccountCode`: the income account (from org settings,
    fetched once), `TaxType: "OUTPUT"` (AU GST on income, 10%).
  - **Never push GST as its own line item** (the current stub in
    `admin/vendors/actions.ts` fakes it that way; Xero computes GST from the
    tax code). The admin-fee named line per DATA_MODEL stays a display concern
    on our side; on the Xero invoice the credits line carries the full price.
- **Ledger mapping (cents, integer):** `xero_invoice_id` = the returned
  `InvoiceID` (GUID; display `InvoiceNumber` to humans), `fee_ex_gst_cents` =
  `SubTotal` × 100, `gst_cents` = `TotalTax` × 100, `quantity` = N,
  `purchase_date` = `Date`. Amounts are exact multiples of $150, so **assert**
  our computed figures equal Xero's returned `SubTotal`/`TotalTax`/`Total` and
  refuse to save on mismatch (a tax-rate misconfiguration must fail loudly,
  not silently book wrong GST).
- Idempotency on create: send our internal id in `Reference` and check for an
  existing invoice with that reference before creating, so a retried action
  cannot double-invoice.

## 4. Delivery to the vendor

- **Email via Xero:** `POST https://api.xero.com/api.xro/2.0/Invoices/{InvoiceID}/Email`
  sends Xero's standard invoice email (with the online-invoice link) to the
  contact's primary email. Invoice must be ACCREC and SUBMITTED/AUTHORISED/PAID.
- **Online invoice URL:** `GET /Invoices/{InvoiceID}/OnlineInvoice` returns the
  shareable link; surface it on the vendor billing page and in our own receipt
  email. "Pay now" appears on it only if a payment service (e.g. Stripe via
  Xero) is connected to the org; optional, EFT is the expected v1 path.
- Branding theme, payment terms, and the org's ABN/GST registration are org
  settings Issy completes in Xero itself (step list below) so the invoice is a
  valid AU tax invoice.

## 5. Payment detection (webhook, plus reconcile fallback)

> **Build status (stage 3, 2026-06-18):** the route at
> `apps/platform/app/api/webhooks/xero/route.ts` is built to this contract
> (real `events[]` shape, raw-body signature verify, fetch-back, idempotent
> unlock) and unit/DB-tested locally (`tests/xero-webhook.test.ts`). What is
> NOT yet done, because it needs a public URL Xero can reach: registering the
> webhook in the dev portal, the **intent-to-receive handshake**, and the
> `XERO_WEBHOOK_KEY` — these are a **staging step** (see §9). The daily
> reconcile job (the safety net below) **is now built** — logic
> (`reconcileXeroInvoices`), route (`/api/jobs/xero-reconcile`), and the
> `invoice.voided_in_xero_at` migration, DB-tested locally; only its `pg_cron`
> **schedule** is a connected-window ops step (see §10).

- **Configure** on the app's Webhooks tab in the developer portal: delivery
  URL = our route, category = **Invoices**. Copy the **webhook signing key**
  shown there into env.
- **Signature:** every delivery carries `x-xero-signature` =
  base64(HMAC-SHA256(raw request body, signing key)). Compute over the **raw
  bytes** (no JSON re-serialisation) and compare constant-time.
- **Intent-to-receive handshake:** after saving the URL, trigger ITR from the
  portal. Xero sends a mix of correctly and incorrectly signed payloads; the
  route must return **200 (empty body, no cookies) for valid signatures and
  401 for invalid ones, within 5 seconds**. Status flips to OK in the portal.
  **Implemented:** `verifyXeroSignature` (constant-time, raw bytes) → valid:
  `200` no body / invalid: `401` no body. An ITR ping has a valid signature and
  no events, so it acks 200 without a fetch-back.
- **Payload (slim; never contains invoice data):**
  `{ "events": [{ "resourceUrl", "resourceId", "tenantId", "eventCategory":
  "INVOICE", "eventType": "UPDATE" | "CREATE", "eventDateUtc" }],
  "firstEventSequence", "lastEventSequence", "entropy" }`. Events are batched;
  a payment applied to an invoice arrives as an **INVOICE UPDATE** event.
- **Handler contract (implemented):** verify signature → parse `events[]` →
  for each `eventCategory == "INVOICE"` (deduped by `resourceId`),
  `getInvoice(resourceId)` and treat as paid via `isInvoicePaid` (`Status ==
  "PAID"`, or `AUTHORISED` with `AmountDue == 0`). Then `applyPaidInvoice`
  keyed on `xero_invoice_id` (= the Xero `InvoiceID` we store); replays and
  duplicate events are safe (DB claim `status != 'paid'`). `processInvoiceEvents`
  takes the status-fetcher as a parameter so the unlock path is testable
  without live Xero. (Currently synchronous; for higher volume, move to
  ack-then-queue.)
- Ignore events for invoices we did not issue (no matching `xero_invoice_id`):
  log and drop. Ignore UPDATE events that are not payments (status unchanged).
- **Retries/outage:** Xero retries failed deliveries with backoff and can
  disable a persistently failing webhook (verify exact policy at build). The
  safety net is the **daily reconcile job** (PRODUCTION_READINESS B4, pg_cron
  per DEC-7): list our open invoices, `GET /Invoices` filtered by
  `Status=="PAID"` since last run, apply anything missed, and alert Issy on
  drift. This also covers a void/refund check (`Status=="VOIDED"` →
  reverse-unlock task for Issy, manual in v1).

## 6. Rate limits (not a constraint at our volume)

60 calls/min and 5,000/day per tenant, 5 concurrent per org. The whole v1 flow
is a handful of calls per purchase plus the daily reconcile. Back off on HTTP
429 honouring the `Retry-After` header anyway.

## 7. Environment variables (names final; values are Issy's manual steps)

```
XERO_CLIENT_ID=        # app Client ID, developer.xero.com My Apps
XERO_CLIENT_SECRET=    # generated on the app Configuration page
XERO_REDIRECT_URI=     # must exactly match the URI registered on the app
XERO_WEBHOOK_KEY=      # Webhooks tab signing key (build-time step, needs public URL)
```

Tenant id and tokens live in the DB (encrypted), not env. Add these to
`apps/platform/.env.example` (ART-2) when the integration branch opens.

## 8. Verify at build time (do not skip; this doc is from public docs)

- [x] OAuth round-trip (stage 1, live 2026-06-16): token stored encrypted +
      decrypts; access token ~30 min; refresh rotates (verified live in stage 2).
- [x] `TaxType "OUTPUT"` produces exactly 10% (stage 2, live): a 3-credit invoice
      returned SubTotal $4,500 / TotalTax $450; income account auto-detected as
      code `200` (Sales).
- [~] Email endpoint: `emailInvoice` built; not sent live yet (avoid emailing
      synthetic vendors). Verify against the connected org / Demo Company.
- [ ] ITR handshake passes against our route — **staging** (needs public URL).
- [~] A payment → fetch-back sees `Status PAID` → unlock: the unlock path is
      DB-tested (`tests/xero-webhook.test.ts`) with the status injected; the
      real Xero **delivery** is a staging step (§9).
- [ ] Webhook retry/disable policy and exact payload field casing — confirm on
      staging once deliveries are live.
- [ ] (Real org in use, not the Demo Company — confirm target org before any
      AUTHORISED/paid live test, since those touch the books.)

## 9. Staging webhook setup (the live-delivery step, for Issy)

The webhook is Xero calling us, so it only works on a public URL. When the
platform is on staging (or via a tunnel like ngrok pointing at it), wire it up:

1. **Get the public URL** of the platform's webhook route, e.g.
   `https://<staging-host>/api/webhooks/xero` (local tunnel:
   `https://<subdomain>.ngrok.io/api/webhooks/xero`).
2. **developer.xero.com → your app → Webhooks**: set the **Delivery URL** to that
   URL and tick the **Invoices** event.
3. **Copy the "Webhooks key"** shown there into the platform env as
   `XERO_WEBHOOK_KEY` (staging secret store, or `.env.local` for a tunnel test).
   The route is inert (503) until this key is set.
4. **Click "Send 'Intent to receive'."** Xero posts signed + deliberately-bad
   payloads; our route answers 200 / 401 and the portal status flips to **OK**.
5. **End-to-end test:** AUTHORISE an invoice (so it is payable), record a payment
   in Xero, and watch the webhook fire → credits unlock. Use the Demo Company or
   accept (and void) a test payment in the real org.

## 10. Daily reconcile job (the webhook safety net, for Issy)

The reconcile is the webhook's backstop (PRODUCTION_READINESS B4): once a day it
sweeps our open invoices, unlocks any payment the webhook missed (**drift**),
and flags any paid invoice that Xero has since **VOIDED** for a manual
reverse-unlock (v1 never auto-reverses — V2_BUILD_PLAN §7). Per DEC-7 the
schedule is Supabase **`pg_cron`**, not Vercel cron.

The logic lives in the platform route `POST /api/jobs/xero-reconcile`
(reuses the same encrypted token + `getInvoice` + idempotent `applyPaidInvoice`
as the webhook, so a double-fire cannot double-credit). It is gated by a shared
secret: **inert (503) until `CRON_SECRET` is set** in the deploy env, then
requires `Authorization: Bearer <CRON_SECRET>`. `pg_cron` can only reach a public
URL, so — like the webhook — this is wired on staging/production, not localhost
(the reconcile logic itself is unit/DB-tested via `tests/xero-reconcile.test.ts`).

Run these in the **connected Supabase project** (SQL editor), once:

```sql
-- 1. Enable the extensions (idempotent).
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2. Schedule the daily reconcile. pg_cron runs in UTC; 16:00 UTC ≈ 02:00 AEST.
--    Replace <platform-host> with the deployed platform origin and <CRON_SECRET>
--    with the value set in the platform's deploy env (NOT committed).
select cron.schedule(
  'xero-reconcile-daily',
  '0 16 * * *',
  $$
    select net.http_post(
      url     := 'https://<platform-host>/api/jobs/xero-reconcile',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer <CRON_SECRET>'
      )
    );
  $$
);
```

To change the time, `select cron.unschedule('xero-reconcile-daily');` then
re-`cron.schedule` with a new cron expression. Inspect runs with
`select * from cron.job_run_details order by start_time desc limit 10;`.

**Verify:** with `CRON_SECRET` set + Xero connected, a manual
`curl -X POST https://<platform-host>/api/jobs/xero-reconcile -H "Authorization: Bearer <CRON_SECRET>"`
returns `{ ok: true, summary: { checked, driftUnlocked, voidedPaid, voidedUnpaid,
errors } }`, and each run appends a `reconcile.run` row to `audit_entry`. A wrong
/ missing bearer returns 401; with no `CRON_SECRET` set the route is 503.
