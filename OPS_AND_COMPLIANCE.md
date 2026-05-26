# theGoodintro — Ops & Compliance (v1)

The infrastructure, integrations, and legal handling the platform needs that
aren't covered by the product briefs. Companion to [DATA_MODEL.md](DATA_MODEL.md),
[STATE_MACHINES.md](STATE_MACHINES.md), and [EMAIL_ACTIONS.md](EMAIL_ACTIONS.md).
Last updated 2026-05-26.

## Stack (decided)

- **Next.js** app (the same codebase family as the marketing site) + **Supabase**
  (Postgres, Auth, storage). This is already the working setup (`.mcp.json`,
  Supabase project), so it is the platform baseline.
- One database, row-level security for the vendor/admin boundary. Admin (Issy)
  has full access; vendor users see only their own org.

## Auth

- **Sign-in options:** email + password **and/or** "Sign in with Google /
  Microsoft" (OAuth). Supabase Auth supports both natively.
- **Work-email-only** is enforced at vendor sign-up (generic/free domains
  blocked). OAuth via a Google/Microsoft **work** account is the clean way to
  prove this, so it is the preferred path; email + password is the fallback.
- **Vendor membership is invite-only:** the Owner invites each user; the invite
  email leads to account creation. No open self-serve join.
- **Admin (Issy):** the cockpit sees money, so it carries a second factor
  **from launch**. If she signs in with Google/Microsoft, that provider's MFA
  covers it; if she uses password, an authenticator-app 2FA is set up day one.
- **Executives do not log in** in v1; their actions use the signed links in
  [EMAIL_ACTIONS.md](EMAIL_ACTIONS.md).

## Calendar integration

The model you described: **the platform is the control surface and system of
record; the parties' real calendars are their live view; the two stay in sync.**

- Meetings are written to both parties' **Google or Outlook** calendars as proper
  invites (with the Zoom/Teams join link).
- The admin portal **mirrors** the meeting/calendar state so Issy can see it.
- When Issy **reschedules or cancels in the admin portal**, the change
  **auto-pushes** to the parties' calendars (updated invite).
- **Reads** the parties' free/busy to help propose times.

**Direct edits (decided):** if a party edits or cancels the event **directly in
their own calendar** (not via us), the platform detects it on sync and **raises a
flag / rebook task for Issy** rather than silently overriding our state. The
platform stays the system of record.

Technical notes (engineering): Google Calendar API and Microsoft Graph are
separate OAuth scopes and token stores; tokens are stored encrypted and refreshed.
Times stored UTC, displayed local (AU offsets + DST handled at display).

## Email & notifications infrastructure

- **Transactional sender (provider):** a dedicated transactional email service
  (e.g. Resend or Postmark) for the exec request emails, receipts, reminders, and
  follow-ups. _(Provider choice open; pick one before build.)_
- **Sending domain: deferred.** Real email domains/addresses are coming soon.
  When ready, the **requirement** is a properly authenticated sender:
  **SPF + DKIM + DMARC** configured, ideally on a **dedicated subdomain** (e.g.
  `send.<domain>`) so platform sending never risks the human inbox's reputation.
  This is a **pre-launch must**: without it, the exec emails (the entire model)
  land in spam.
- **Bounce / undeliverable handling:** capture bounces; if an exec's primary
  email bounces, flag it to Issy (the request can't progress on a dead address).
- **Channels:** email, in-app, and the single Slack new-signup alert, per the
  MVP_SCOPE notification matrix.

## Payments (Xero) integration

- v1 payment path is **Xero invoicing** (Stripe self-serve later).
- **Trigger:** a Xero **"invoice paid" webhook** is the single signal that
  unlocks access and fires downstream workflows (credits, list access,
  notifications). No manual "mark as paid."
- **Idempotency:** the webhook handler must be idempotent (Xero can resend); key
  off the Xero invoice id so a replay doesn't double-credit.
- **Reconciliation:** each CreditLot links to its `xero_invoice_id`; the admin
  fee is its own named invoice line.
- **Failure modes:** webhook never arrives (manual reconcile fallback for Issy),
  partial/failed payment (no unlock), void/refund (reverse the unlock).

## Compliance (Australian Privacy Act)

- **Data deletion:** **soft-delete + retain, then purge.** On an erasure request
  records are hidden (soft-deleted) but retained where we have a lawful basis;
  financial and gift records are kept to AU norms (~7 years), after which PII is
  purged on schedule or request. Honours the "churned records held, not deleted"
  rule without breaking audit, financial, or charity history.
- **Audit log** ([DATA_MODEL.md](DATA_MODEL.md) AuditEntry) is **append-only**;
  EA actions attributed as "acting for [exec]". Retention aligned with the above.
- **Consent:** exec consent is captured per [EMAIL_ACTIONS.md](EMAIL_ACTIONS.md)
  (proceeding = Terms acceptance, recorded with token + timestamp + actor). Vendor
  and admin consent at account creation.
- **PII handling:** least-privilege access (RLS), encrypted at rest (Supabase),
  secrets in environment config, not in code.
- **DGR / ABN verification** of charities → detail in
  [CHARITY_FLOW.md](CHARITY_FLOW.md); the platform stores DGR status and shows it
  before a gift is committed.

## Integrations checklist (v1)

| Integration | Used for | Status |
|---|---|---|
| Supabase | DB, Auth, storage | Decided |
| Google Calendar / Microsoft Graph | Invites, free/busy, sync | Build |
| Zoom / Teams API | Meeting link + attendance (held vs no-show) | Build |
| Xero | Invoicing + paid webhook | Build |
| Calendly | Vendor vetting call booking | Build |
| Transactional email provider | All platform email | Provider TBD |
| Slack | New-signup alert (the one Slack piece in v1) | Build |

## Environments & observability

- Separate **dev** and **production** Supabase projects / env configs; secrets in
  environment variables (never committed).
- **Error monitoring** (e.g. Sentry) and structured logs from day one, especially
  around the money paths (webhook, credit consume, gift create).

## Open items (deferred, not blocking)

- Transactional email **provider** choice.
- The real **sending domain** (pending, "coming soon") and its SPF/DKIM/DMARC
  setup. Pre-launch must.
