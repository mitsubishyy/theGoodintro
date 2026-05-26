# theGoodintro — Security & Compliance (v1)

The security posture and Australian compliance obligations for a platform that
holds money, personal data, and routes charity donations. Deeper than the
compliance section of [OPS_AND_COMPLIANCE.md](OPS_AND_COMPLIANCE.md). Last updated
2026-05-26.

> **Not legal advice.** This captures the intended posture and the engineering
> controls. The items tagged **[LEGAL]** or **[ACCOUNTANT]** must be confirmed by
> an Australian professional before launch, especially anything touching charity
> funds, fundraising law, and privacy obligations.

## Security (engineering controls)

- **Authentication:** email + password and/or Google/Microsoft OAuth; work-email
  only for vendors; **admin 2FA from launch** (OAuth MFA or authenticator app).
  Sessions expire; magic-link/OAuth tokens stored securely.
- **Tenant isolation:** Postgres **row-level security** is the hard boundary, a
  vendor user can only ever read their own org's rows; admin is separate. RLS
  policies are part of the test suite, not just assumed.
- **Webhook signature verification (must-do):** every inbound webhook (Xero
  "invoice paid", Zoom/Teams attendance) is **verified against its signing
  secret** before it is trusted. A forged "paid" event must never unlock access
  or fake a meeting outcome. Handlers are idempotent (keyed off the provider id).
- **Signed email links:** inert on GET, commit on POST (defeats email scanners);
  see [EMAIL_ACTIONS.md](EMAIL_ACTIONS.md). Forwarded-link residual risk is
  acknowledged and accepted for v1.
- **Rate limiting / abuse:** login, the signed-link confirm endpoints, and public
  API routes are rate-limited to blunt brute-force and abuse.
- **Input validation:** all user input validated server-side; the request fields
  keep the content guard (strip emails/phones/links); output encoded to prevent
  injection/XSS.
- **Secrets:** in environment config only, never in code or the repo; separate
  dev and production secrets; rotate on staff change.
- **Data in transit / at rest:** HTTPS/TLS everywhere (default on the host);
  encryption at rest (Supabase). Backups encrypted.
- **Security logging:** failed logins, permission denials, and money-path events
  (webhook, credit consume, gift create) are logged and monitored.
- **Dependencies:** keep dependencies patched; watch for advisories.
- **PCI scope is minimal:** payment runs through **Xero invoicing**, so the
  platform **never stores or processes card numbers**. This keeps PCI burden low,
  state it plainly to enterprise buyers who ask.

## Security review plan (staged, cost-aware)

1. **v1:** a structured **DIY review** against the OWASP Top 10 / ASVS checklist
   before launch (free, time only), plus automated dependency + DAST scanning.
2. **Before scaling** (real paying vendors + real exec PII at volume, or a funding
   milestone): an **independent external penetration test**. Budget
   **~AUD $6,000 to $10,000** (boutique/freelance ~$3k to $6k; reputable firm
   ~$6k to $15k). A strong trust signal for the senior-exec audience.

## Compliance (Australia)

- **Entity:** theGoodintro Pty Ltd, registered with ABN/ACN before launch (the
  marketing site currently says "ABN pending"). **[LEGAL]**
- **Privacy Act 1988 / Australian Privacy Principles (APPs):** the small-business
  turnover exemption may currently apply, but **comply with the APPs as best
  practice anyway**, enterprise vendors and senior execs will expect it, and the
  Privacy Act reforms are tightening. Means: a clear **privacy policy** and
  **collection notice**, only collect what's needed, honour access/correction
  requests, and the retention/deletion rules below. **[LEGAL]**
- **Data residency:** database hosted in the **Australian region (Sydney)** so AU
  personal data stays onshore, the cleanest position under APP 8 (cross-border
  disclosure).
- **Notifiable Data Breaches (NDB):** maintain a written **incident-response
  plan**, detect, contain, assess, and if an eligible breach is likely to cause
  serious harm, notify the **OAIC** and affected individuals. Owner: Issy.
- **Consent:** exec consent captured at the first email action (proceeding = Terms
  acceptance, recorded with token + timestamp + actor, see
  [EMAIL_ACTIONS.md](EMAIL_ACTIONS.md)); vendor/admin consent at account creation.
- **Spam Act 2003:** identify the sender and include an unsubscribe path on any
  non-essential (commercial/marketing) email. Transactional and
  relationship-facilitating messages have more leeway, but sender ID is standard
  on all of them.
- **Retention & deletion:** **soft-delete + retain, then purge** (per
  OPS_AND_COMPLIANCE.md). Financial and gift records kept to AU norms (~7 years),
  then PII purged on schedule or request.

## Charity funds (the central compliance call)

- **Posture (decided, pending legal sign-off): non-custodial.** The vendor pays
  theGoodintro a **fee**; theGoodintro then makes the donation **as its own gift**.
  theGoodintro never holds money "for" the charity, which is intended to keep it
  clear of **charitable-fundraising licensing** (state-based: NSW, VIC, QLD, etc.)
  and **trust-account** obligations. **[LEGAL]** confirm this structure holds.
- **DGR receipts** therefore flow to **theGoodintro as the donor**, not the
  vendor (vendors get no charity receipt; see VENDOR_PORTAL_BRIEF.md).
  **[ACCOUNTANT]** confirm the tax treatment of theGoodintro's donations.
- This is why v1 **defers automated/custodial disbursement** (MVP_SCOPE.md):
  gifts are recorded and released manually until the model is legally settled.

## Needs a professional before launch

- **[LEGAL]** Charity-funds / fundraising-law structure (the non-custodial posture
  above), platform Terms (vendor + exec), privacy policy, entity registration.
- **[ACCOUNTANT]** GST/BAS handling, the donation tax treatment, DGR receipting,
  7-year records.

## Pre-launch checklist

- [ ] Sydney-region database provisioned
- [ ] RLS policies written + tested
- [ ] Webhook signature verification on Xero + Zoom/Teams
- [ ] Rate limiting on auth + signed-link endpoints
- [ ] Admin 2FA enforced
- [ ] DIY OWASP review done; external pen-test budgeted
- [ ] Privacy policy + collection notice + platform Terms live **[LEGAL]**
- [ ] Incident-response (NDB) plan written
- [ ] Entity registered (ABN/ACN) **[LEGAL]**
- [ ] Charity-funds structure confirmed **[LEGAL]**

## Cross-refs

- Infra baseline, auth, calendar, Xero → [OPS_AND_COMPLIANCE.md](OPS_AND_COMPLIANCE.md)
- Signed-link security + consent → [EMAIL_ACTIONS.md](EMAIL_ACTIONS.md)
- Safe changes, backups, rollback → [CHANGE_SAFETY.md](CHANGE_SAFETY.md)
- Records that snapshot their own truth → [DATA_MODEL.md](DATA_MODEL.md)
