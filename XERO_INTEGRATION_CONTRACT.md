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
  The existing stub route returns errors for bad signatures already; confirm
  the exact 401-no-body behaviour and the 5-second budget.
- **Payload (slim; never contains invoice data):**
  `{ "events": [{ "resourceUrl", "resourceId", "tenantId", "eventCategory":
  "INVOICE", "eventType": "UPDATE" | "CREATE", "eventDateUtc" }],
  "firstEventSequence", "lastEventSequence", "entropy" }`. Events are batched;
  a payment applied to an invoice arrives as an **INVOICE UPDATE** event.
- **Handler contract:** verify signature → 200 immediately → process async
  (queue or after-response). For each INVOICE event: `GET /Invoices/{resourceId}`
  and treat as paid **only if** `Status == "PAID"` (equivalently
  `AmountDue == 0` with `FullyPaidOnDate` set). Then call the existing
  idempotent `applyPaidInvoice` keyed on `xero_invoice_id`; replays and
  duplicate events are already safe (DB claim `status != 'paid'`).
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

- [ ] OAuth round-trip against the Demo Company; confirm token lifetimes and
      rotation grace behave as documented.
- [ ] `TaxType "OUTPUT"` produces exactly 10% on the Demo Company (AU); confirm
      the org's income account code.
- [ ] Email endpoint sends from the Demo Company and what the email looks like.
- [ ] ITR handshake passes against our route (response codes + 5s budget).
- [ ] A payment applied in Xero fires INVOICE UPDATE and our fetch-back sees
      `Status PAID`; replay unlocks exactly once (existing test extends).
- [ ] Webhook retry/disable policy and the exact payload field casing.
- [ ] Demo Company reset cadence and what survives it.
