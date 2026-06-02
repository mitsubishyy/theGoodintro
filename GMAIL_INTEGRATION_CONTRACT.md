# theGoodintro — Gmail Integration Contract

> **READ FIRST.** This is the integration contract for the platform's messaging
> module. It is part of [ART-3](COLD_START_GAPS.md#3-required-artifacts-must-be-builtwritten-gated)
> (per-integration contracts). Until this document is approved, the messaging
> module is **not implementable** in the build chat — do not guess scopes, payload
> shapes, threading rules, or storage. Companions:
> [`ADMIN_INBOX_SPEC.md`](ADMIN_INBOX_SPEC.md) (the screen that consumes this
> integration) and [`MESSAGING_AI_DRAFT_SPEC.md`](MESSAGING_AI_DRAFT_SPEC.md)
> (the AI Prompt drawer that drafts replies grounded in the data this integration
> ingests).

## 0. One-paragraph summary (for the non-technical reader)

We give the platform permission to read and send email from one dedicated business
mailbox on the TheGoodIntros Google Workspace (placeholder address until Issy
picks one: `{platform_mailbox}`). When a vendor or executive emails that mailbox,
the platform sees the message within seconds, attaches it to the correct vendor
or executive record, and shows it in the Admin Inbox. When Issy replies in the
Admin Inbox, the platform sends the email as that mailbox, so the sent message
appears in the mailbox's Sent folder in Gmail too, in the same thread. Issy can
work from either the platform or directly from Gmail and both stay in sync. There
is exactly one source of truth (the mailbox), and the platform is the second
surface on top of it. Nothing about this design depends on third-party shared
inbox tools (Front, Help Scout, etc.). They are explicitly out of scope.

## 1. Scope

### 1.1 In scope (this contract covers)

- One dedicated Google Workspace mailbox on the `thegoodintros.com` Workspace
  (address chosen later; treat as `{platform_mailbox}` throughout).
- OAuth 2.0 authorisation by the mailbox owner (Issy), granting the platform
  read, send, and label management on that mailbox only.
- Inbound sync of messages from the mailbox into the platform's `message` and
  `conversation` tables, via Gmail push notifications (Google Pub/Sub).
- Outbound send from the platform as the mailbox, with correct RFC 5322 threading
  headers so replies stay in the same Gmail thread.
- Two-way reconciliation: messages Issy sends or labels directly in Gmail also
  appear in the platform, and vice versa.
- Record matching: every inbound message is linked to a vendor or executive
  record where possible, or queued in an unmatched bucket otherwise.
- Encrypted token storage and rotation.
- A small set of operational labels in Gmail that mirror conversation state in
  the platform (so Issy can see at a glance, from Gmail, which threads the
  platform considers open or resolved).
- Pre-launch Google verification process for sensitive scopes.

### 1.2 Out of scope (NOT covered here, but related)

- The Admin Inbox UI: see [`ADMIN_INBOX_SPEC.md`](ADMIN_INBOX_SPEC.md).
- AI draft generation logic: see [`MESSAGING_AI_DRAFT_SPEC.md`](MESSAGING_AI_DRAFT_SPEC.md).
- Calendar sync (Google Calendar): a separate ART-3 contract covers it.
- Resend / Postmark transactional email (request-loop emails, notifications):
  unchanged, see [`NOTIFICATION_TEMPLATES.md`](NOTIFICATION_TEMPLATES.md). Gmail
  sync is for human-to-human conversations only.
- Third-party shared inbox tools (Front, Help Scout, Missive, etc.). The
  [`ADMIN_PORTAL_BRIEF.md`](ADMIN_PORTAL_BRIEF.md) Comms section previously
  floated these as the underlying engine; **that is now superseded** by native
  Gmail sync per this contract.
- Multiple mailboxes, distribution lists, or per-user mailboxes for staff. v2 is
  single mailbox only. Staff visibility is by platform login, not by Google.

### 1.3 Why a single mailbox (the architectural decision, captured)

We deliberately treat one Gmail mailbox as the source of truth, not "the
platform" or "Gmail" individually. This means:

1. There is never a question of "is the platform's copy or Gmail's copy correct"
   because the platform is a derived view of the mailbox, and outbound from the
   platform goes through the mailbox.
2. If the platform is unavailable for any reason (a deploy, an incident, a
   migration), Issy can still operate from Gmail directly and the platform will
   catch up when it recovers.
3. Email deliverability concerns (SPF, DKIM, DMARC, reputation) live with Google
   Workspace, not with us.
4. Search, archival, e-discovery, and compliance all use Workspace's built-in
   tools.
5. The mailbox is portable: if we ever change platforms, the data has not been
   trapped in a vendor-specific shared-inbox tool.

The cost we accept: we are bound by Gmail API rate limits and the sensitive-scope
verification process. Both are well understood and tractable.

## 2. Mailbox identity

### 2.1 The mailbox

- Hosted on Google Workspace, domain `thegoodintros.com` (the plural-domain
  Workspace per [`project_thegoodintros_workspace`](../.claude/projects/-Users-isobelhardwick/memory/project_thegoodintros_workspace.md) note).
- Address: `{platform_mailbox}`, picked by Issy. Reasonable candidates:
  - `hello@thegoodintro.com`
  - `support@thegoodintro.com`
  - `team@thegoodintro.com`
  - `concierge@thegoodintro.com`
  The address becomes the system's email identity. It appears on every outbound
  email sent from the platform. **Decide once, change rarely.** The platform
  stores the mailbox address as a configuration value, not hard-coded.
- The mailbox MUST be a real Workspace user (a "mailbox", not an alias or a
  group). Aliases and groups cannot host the Gmail API integration.
- The mailbox owner is Issy. No one else logs in directly to Gmail; staff
  read/reply through the platform.

### 2.2 DNS, deliverability, and sender reputation (pre-launch checklist)

These are the responsibility of whoever runs the Workspace, not the build chat,
but the platform should not go live until they are all green:

- **SPF**: `thegoodintro.com` TXT includes `include:_spf.google.com`.
- **DKIM**: Google DKIM key published as `google._domainkey.thegoodintro.com`
  TXT. Verify via Workspace Admin > Apps > Google Workspace > Gmail >
  Authenticate email. **Rotate the key at least every 12 months.**
- **DMARC**: Start with `p=none` plus a reporting address (`rua=`) for two weeks
  while we collect reports; ratchet to `p=quarantine` then `p=reject` once
  reports are clean.
- **MX records**: standard Google Workspace MX set, no third-party rerouters in
  front of Workspace.
- **Reverse DNS**: not applicable when sending via the Gmail API.
- **Custom From / Reply-To**: the platform always sends as the mailbox itself
  (no `Sender:` header trickery, no display-name spoofing of vendors).

### 2.3 Vacation, holds, and out-of-office

- The mailbox MUST NOT have a vacation auto-reply enabled (it would auto-reply
  to every inbound, including system notifications). If Issy needs an out-of-
  office, the message belongs in the platform-driven email templates, not
  Gmail's vacation responder.
- Workspace retention/litigation hold on the mailbox is fine; it does not
  interfere with the API.

## 3. OAuth 2.0 and scopes

### 3.1 OAuth client

- One Google Cloud project (`thegoodintro-platform-prod`) with one OAuth 2.0
  client of type **Web application**.
- Authorised redirect URIs:
  - `https://platform.thegoodintro.com/api/integrations/gmail/callback`
    (production)
  - `https://platform-staging.thegoodintro.com/api/integrations/gmail/callback`
    (staging)
  - `http://localhost:3000/api/integrations/gmail/callback` (local dev only,
    behind a feature flag)
- A separate `thegoodintro-platform-staging` Google Cloud project for staging,
  with its own OAuth client and its own Workspace mailbox (`{platform_mailbox_staging}`).
  Staging never touches production tokens.

### 3.2 Scopes (exact)

Request the **smallest set** that delivers the required behaviour:

| Scope | Purpose | Sensitive? |
|---|---|---|
| `https://www.googleapis.com/auth/gmail.readonly` | Read messages, threads, labels, history. | Restricted |
| `https://www.googleapis.com/auth/gmail.send` | Send messages as the mailbox. | Sensitive |
| `https://www.googleapis.com/auth/gmail.modify` | Add/remove labels, mark read/unread, archive. NOT delete. | Sensitive |
| `https://www.googleapis.com/auth/gmail.labels` | Create/manage labels. | Sensitive |
| `openid email profile` | Identify the consenting account. | Non-sensitive |

Explicitly **not** requested:

- `gmail.compose` (drafts) — we do not store drafts in Gmail; drafts live in the
  platform. Avoiding this scope keeps the consent screen smaller.
- `gmail.metadata` — `readonly` already covers it.
- Full `mail.google.com` — too broad; would include permanent delete.
- Any Calendar, Drive, Contacts, or People scopes — separate integrations.

**Why these specifically:** `readonly + send + modify + labels` is the standard
"shared-inbox connector" scope set used by Front, Missive, Help Scout, etc. It is
well understood by Google's review team, which speeds verification.

### 3.3 Sensitive / restricted scope verification

`gmail.send`, `gmail.modify`, and `gmail.labels` are classified as Sensitive (and
`gmail.readonly` as Restricted) by Google as of the cutoff date. Both classes
require:

- A verified OAuth consent screen (app name, support email, homepage URL,
  privacy policy URL, terms of service URL, authorised domain `thegoodintro.com`).
- A **CASA Tier 2 security assessment** for restricted scopes (gmail.readonly),
  conducted by a Google-approved third-party assessor. **Budget: AUD 6,000 to
  15,000, lead time 6 to 10 weeks.** Start the engagement as soon as the
  mailbox is picked.
- An **app demo video** showing exactly how each scope is used in the platform.
- A privacy policy that explicitly covers email data collection, processing,
  storage, and deletion.

**Lead time owner:** Issy and whoever the security assessor is. Track in
[`PRODUCTION_READINESS.md`](PRODUCTION_READINESS.md) as a launch blocker.

**Workaround during build:** while verification is in progress, the OAuth client
runs in **Testing** mode with up to 100 test users. The mailbox owner (Issy) is
the only test user we need, so this is not a blocker for the build chat. Going
into Production mode without verification is hard-blocked by Google.

### 3.4 Consent flow

1. Issy logs into the platform's `/admin/settings/integrations/gmail` page.
2. Clicks "Connect Gmail mailbox".
3. Platform redirects to Google's OAuth consent screen with the scopes above and
   `access_type=offline` and `prompt=consent` (forces a refresh token even on
   re-consent).
4. Issy consents. Google redirects back to the callback URL with an
   authorisation code.
5. Platform exchanges the code for an access token (1 hour TTL) and a refresh
   token (effectively long-lived; revocable).
6. Platform stores the refresh token encrypted (see Section 5), records the
   `installed_by_user_id`, the `connected_mailbox_address`, the granted scopes,
   the consent timestamp, and the `terms_version` she accepted.
7. Platform immediately calls `gmail.users.getProfile` to verify the connection,
   then `gmail.users.watch` to set up push notifications (see Section 6).

### 3.5 Re-consent and revocation

- If the refresh token is revoked (by Issy in her Google account, by a Workspace
  admin, by Google for policy reasons, or by 6+ months of inactivity), the next
  API call returns `invalid_grant`. The platform MUST:
  1. Flip the integration status to `revoked`.
  2. Halt all outbound sends (queue them, do not error-out silently).
  3. Show a clear banner in the Admin Inbox: "Gmail connection lost. [Reconnect]"
  4. Page the on-call channel (Slack `#alerts-platform`) within 5 minutes.
- Re-consent runs the same flow as 3.4 and resumes from the last known historyId
  (see Section 6).

## 4. Cloud project, Pub/Sub, and watch setup

### 4.1 Google Cloud setup (one-time)

In `thegoodintro-platform-prod`:

1. Enable APIs: `gmail.googleapis.com`, `pubsub.googleapis.com`.
2. Create a Pub/Sub topic: `projects/thegoodintro-platform-prod/topics/gmail-inbound`.
3. Create a Pub/Sub push subscription: `gmail-inbound-platform`, push endpoint
   `https://platform.thegoodintro.com/api/integrations/gmail/webhook`, with
   `oidc_token.service_account_email` set to a dedicated service account
   (`gmail-webhook-pusher@thegoodintro-platform-prod.iam.gserviceaccount.com`).
4. Grant `roles/pubsub.publisher` on the topic to `gmail-api-push@system.gserviceaccount.com`
   (Google's Gmail push service account).
5. Acknowledge deadline on the subscription: **60 seconds** (so we have time to
   process bursts).
6. Dead-letter topic: `gmail-inbound-dead-letter`, max delivery attempts: 5.

Repeat in `thegoodintro-platform-staging` with `-staging` suffixes throughout.

### 4.2 Watch setup

After OAuth, the platform calls:

```
POST https://gmail.googleapis.com/gmail/v1/users/me/watch
{
  "topicName": "projects/thegoodintro-platform-prod/topics/gmail-inbound",
  "labelIds": ["INBOX", "SENT"],
  "labelFilterAction": "include"
}
```

This returns a `historyId` (the starting point) and `expiration` (~7 days). The
platform MUST:

- Store the `historyId` as the watermark for incremental sync.
- Re-call `watch` **before the expiration** (a daily cron at 02:00 Sydney
  refreshes it; safe to call repeatedly; idempotent).
- Re-call `watch` immediately on re-consent.

`labelIds: ["INBOX", "SENT"]` means we get notified for both received messages
and sent messages (so messages Issy sends from Gmail directly also flow into the
platform).

## 5. Token storage and secrets

### 5.1 Where tokens live

- Refresh tokens stored in Supabase, table `integration_credential`, column
  `encrypted_refresh_token bytea`.
- Encryption: **AES-256-GCM** with a key from a managed KMS (Google Cloud KMS
  key `projects/thegoodintro-platform-prod/locations/australia-southeast1/keyRings/platform/cryptoKeys/gmail-tokens`),
  not from an env var. The platform calls KMS to encrypt/decrypt per request.
- Access tokens are NOT stored. They are obtained from the refresh token on
  demand and held only in process memory for their 1-hour lifetime.
- The `integration_credential` row also stores: `provider='gmail'`,
  `mailbox_address`, `granted_scopes` (jsonb array), `connected_at`,
  `last_used_at`, `status` (`active|revoked|paused`), `installed_by_user_id`,
  `terms_version_at_consent`, `historyId_watermark`, `watch_expires_at`.
- RLS: the table is read/write **only** by the platform's service role; no user
  ever queries it through the public API.

### 5.2 Key rotation

- KMS key auto-rotation: every 90 days.
- Tokens are re-encrypted under the new key version on next read (lazy rotation;
  no big-bang migration).
- Issy can manually trigger "rotate connection" from
  `/admin/settings/integrations/gmail`, which revokes the current refresh token
  on Google's side, deletes the row, and re-runs the OAuth flow.

### 5.3 Secrets the build chat needs (env)

Add to `apps/platform/.env.example` (and the real env per environment):

```
# Gmail integration (ART-3)
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URI=
GMAIL_PUBSUB_TOPIC=projects/.../topics/gmail-inbound
GMAIL_PUBSUB_PUSH_SERVICE_ACCOUNT=gmail-webhook-pusher@...
GMAIL_TOKEN_KMS_KEY=projects/.../cryptoKeys/gmail-tokens
PLATFORM_MAILBOX_ADDRESS=               # picked by Issy, e.g. hello@thegoodintro.com
```

Document each in `apps/platform/.env.example` with a one-line comment. The
build chat MUST NOT commit real values.

## 6. Inbound sync

### 6.1 The notification flow (end-to-end)

1. A vendor sends an email to `{platform_mailbox}`.
2. Gmail receives it, classifies it (Inbox), and within seconds publishes a
   notification to the Pub/Sub topic. The notification body is intentionally
   minimal:
   ```json
   { "emailAddress": "{platform_mailbox}", "historyId": "1234567" }
   ```
3. Pub/Sub pushes that notification to our webhook
   (`/api/integrations/gmail/webhook`) as a signed POST.
4. The webhook verifies the OIDC token in the `Authorization` header against
   the Pub/Sub push service account. **Reject** any request that fails
   verification (return 401). Log and alert if rejection rate exceeds 1% over
   any 5-minute window.
5. The webhook enqueues a `gmail.sync` job with the new `historyId` and ACKs
   the Pub/Sub push within 5 seconds. **Do not do real work in the webhook
   handler**; Pub/Sub retries on 5xx and aggressive retries will compound under
   any outage.
6. The worker dequeues the job, calls
   `gmail.users.history.list?startHistoryId={last_watermark}` to get the
   incremental changes (added, deleted, label-changed) since the last sync.
7. For each `messagesAdded`, the worker calls `gmail.users.messages.get?id={id}&format=full`
   to fetch the full RFC 822 message.
8. The worker:
   - Inserts/updates a `message` row.
   - Inserts/updates the parent `conversation` row (by `Gmail thread id`).
   - Runs the record-matching rules (Section 7) to link the conversation to a
     vendor or executive.
   - Runs side-effects: notification to Issy, auto-tagging, AI draft generation
     trigger (see [`MESSAGING_AI_DRAFT_SPEC.md`](MESSAGING_AI_DRAFT_SPEC.md)).
9. The worker advances `historyId_watermark` to the latest seen `historyId`.

### 6.2 Bootstrap / first-sync

When the integration is first connected, there is no `historyId` watermark yet
and there may be 10,000+ messages in the mailbox already. Do NOT pull them all.

The bootstrap MUST:

1. Call `gmail.users.getProfile` and capture the current `historyId` as the
   watermark. **Set this as `historyId_watermark` BEFORE pulling any backfill.**
2. Optionally backfill the last 30 days of messages via
   `gmail.users.messages.list?q=newer_than:30d` in batches of 100, paginating
   until exhausted. Mark each as `imported_via_backfill=true` so the AI draft
   logic knows these had no prior platform context.
3. Mark the bootstrap complete.

The 30-day backfill is **optional and configurable per environment**. In
production, default to 7 days (just enough to give context). The build chat
should ask Issy before changing the default.

### 6.3 Idempotency

The same Gmail message ID may arrive in our worker more than once (Pub/Sub
at-least-once delivery, history list overlaps on retries). The `message` table
uses Gmail's `message id` as a **unique constraint** and inserts are
`ON CONFLICT DO UPDATE`. The worker MUST NOT fire side-effects (notifications,
AI draft) if the upsert resulted in no actual change. Use `RETURNING xmax = 0`
as the "this was a true insert" signal.

### 6.4 Rate limits and backpressure

Gmail API quota for a single user: 250 quota units per second, 1,000,000,000
per day. A `messages.get` is 5 units, a `history.list` is 2, a `messages.send`
is 100. Practical capacity: hundreds of messages per second sustained, no risk
at expected v2 volume (single-digit hundreds per day).

If 429 (rate limit) is returned:

- Honour the `Retry-After` header.
- Back off exponentially (1s, 2s, 4s, 8s, max 32s) with jitter (+/-30%).
- After 5 failed retries on a single job, send it to the dead-letter queue and
  page on-call.

## 7. Record matching (vendor / executive / unmatched)

When a message arrives, we MUST attempt to link the parent conversation to a
record. Matching rules, in order, **first match wins**:

1. **By thread continuation:** if the message's Gmail `threadId` already maps to
   a conversation in our database, use the existing conversation's linked record.
   No further matching needed. This is the dominant case after the first message.
2. **By signed-token reply:** the platform sends some outbound emails with a
   signed-token `Reply-To` (`reply+{token}@thegoodintro.com` or in the message
   body as a hidden marker). If the inbound message's `In-Reply-To` header
   references a message we sent with such a token, decode the token to find the
   record. Authoritative when present.
3. **By vendor user email:** lookup `vendor_user.email` exact match on the
   `From:` address. Link to that vendor.
4. **By executive email:** lookup `executive.email` exact match on the `From:`
   address. Link to that executive.
5. **By EA email:** lookup `executive_assistant.email` exact match. Link to the
   exec, set `acting_as_ea=true` on the message.
6. **By vendor company domain:** strip the local part of the `From:` address;
   lookup `vendor.primary_domain` exact match. Link to that vendor with
   `confidence=domain_only` and surface in the inbox with a small "not a known
   user" hint, so Issy can confirm or correct.
7. **By executive company domain:** same logic for executives.
8. **Unmatched:** leave `linked_record_id` null, leave `linked_record_type` null,
   set `match_status='unmatched'`. The conversation lands in the "Unmatched"
   filter in the Admin Inbox. Issy can manually link it to a record; the link is
   stored and applied to any future messages in that thread.

Record matching runs on EVERY inbound message, not just the first one. This
catches the case where a thread starts unmatched, Issy links it, and later
messages should inherit the link.

**Confidence:** record on the `conversation` row whether the link is
`thread_continuation | signed_token | exact_email | domain_match | manual | unmatched`.
The AI draft logic in [`MESSAGING_AI_DRAFT_SPEC.md`](MESSAGING_AI_DRAFT_SPEC.md)
uses this to decide whether to surface context or warn that the context might
be wrong.

## 8. Outbound send

### 8.1 The send flow

1. Issy types a reply in the Admin Inbox (or accepts an AI draft).
2. Clicking Send dispatches an `outbound.send` job to the worker.
3. The worker constructs an RFC 822 message:
   - `From: TheGoodIntro <{platform_mailbox}>` (display name configurable in
     settings, defaulting to "TheGoodIntro").
   - `To:`, `Cc:`, `Bcc:` as set by Issy.
   - `Subject:` the existing thread subject prefixed with `Re: ` if not present.
   - `In-Reply-To: <{parent_message_id_header}>` (the `Message-ID` of the email
     being replied to).
   - `References: <{thread_references_chain}>` (existing references plus the
     parent Message-ID).
   - `Message-ID:` a fresh one generated by the platform (do NOT let Gmail
     assign it — we want the ID known synchronously for tracking).
   - Body: `text/plain` (auto-generated from the rich text) AND `text/html`,
     multipart/alternative.
   - Attachments: multipart/mixed wrapper if any.
4. Worker calls `gmail.users.messages.send` with `raw` set to the base64url-
   encoded RFC 822 message and `threadId` set to the Gmail thread id (so Gmail
   places it in the same thread server-side).
5. Gmail returns the sent message's id and historyId. Worker:
   - Marks the platform's `message` row `status='sent'`.
   - Adds the `THEGOODINTRO/PLATFORM_SENT` label (see Section 9) for visibility
     in Gmail.
   - Triggers any post-send side-effects (state machine transitions, etc.).

### 8.2 Idempotency on send

A user may double-click Send, or the network may flap mid-request, or the worker
may retry. To prevent duplicate sends:

- Generate a UUID `client_send_id` when the user composes (in the browser).
- Pass it on the send request. The platform's `message` table has a unique
  constraint on `client_send_id`.
- The worker checks for an existing row with this id before calling
  `gmail.users.messages.send`. If found, return that result; do not re-send.
- The platform UI disables the Send button immediately on click and shows a
  spinner until either success or error returns.

### 8.3 Outbound failure handling

If `messages.send` returns a 4xx (other than rate-limit):

- `400`: invalid request (malformed RFC 822, unsupported attachment). Mark the
  message `status='failed'`, surface the error in the UI ("Could not send: ..."),
  do NOT retry.
- `401`: token issue. Refresh; retry once. If still 401, mark integration
  `revoked` and surface the reconnect banner.
- `403`: scope issue or policy block. Mark the message `status='failed'`, page
  on-call, do NOT retry.
- `413`: message too large (>25MB total). Mark the message `status='failed'`,
  show "Attachment too large, please send via a file-sharing link." Do NOT
  retry.

If `messages.send` returns 5xx: retry with exponential backoff up to 5 times,
then mark `status='failed'` and page on-call.

The Admin Inbox MUST distinguish `queued | sending | sent | failed | retrying`
in the UI per message.

## 9. Two-way sync rules

Issy can act from either the platform or Gmail directly. Both stay consistent
because the platform is a derived view of the mailbox.

### 9.1 Issy replies from Gmail directly

- Gmail publishes the `SENT` label addition to Pub/Sub.
- Our worker sees the new message in `history.list`, fetches it, inserts it as
  a `message` row with `source='gmail_direct'` and `sent_by_user_id=issy`.
- The conversation thread in the Admin Inbox shows the message with a small
  "sent from Gmail" marker.

### 9.2 Issy archives a thread in Gmail

- Gmail publishes the label removal (`INBOX` removed).
- Our worker sets the conversation's `status='resolved'` and removes any
  open-state indicators in the platform.

### 9.3 Issy resolves a conversation in the platform

- Platform adds the `THEGOODINTRO/RESOLVED` label to all messages in the Gmail
  thread (via `gmail.users.threads.modify`).
- Platform removes `INBOX` so the thread leaves Gmail's main inbox too
  (configurable per Issy preference).
- The next sync confirms the change; no further work needed.

### 9.4 Operational labels

The platform manages a small set of nested labels in Gmail, under the parent
`THEGOODINTRO/`:

- `THEGOODINTRO/OPEN` — conversation is open in the platform.
- `THEGOODINTRO/RESOLVED` — conversation is resolved in the platform.
- `THEGOODINTRO/AWAITING-VENDOR` — waiting on vendor reply.
- `THEGOODINTRO/AWAITING-EXEC` — waiting on executive reply.
- `THEGOODINTRO/UNMATCHED` — conversation has no linked record yet.
- `THEGOODINTRO/PLATFORM_SENT` — auto-applied to outbound messages sent via the
  platform (so Issy can distinguish them from her own Gmail-direct replies).

Labels are created on first use, idempotently. They are visible to Issy in
Gmail (in the label sidebar) and let her work entirely from Gmail in an outage.

### 9.5 Conflicts

If Issy resolves a conversation in the platform AND replies to it in Gmail in
the same minute: last write wins, which here means whichever Pub/Sub
notification we process last. Because reply-in-Gmail re-adds `INBOX` and removes
`THEGOODINTRO/RESOLVED`, the conversation will end up back in "open" state,
which is the correct outcome (an open question deserves to be open).

## 10. Data model

The build chat creates this schema as numbered migrations (`0013_messaging.sql`,
`0014_messaging_indexes.sql`, etc.), reversible, with `_down.sql` siblings.

```sql
-- A conversation is a Gmail thread.
create table conversation (
  id                   uuid primary key default gen_random_uuid(),
  gmail_thread_id      text not null unique,
  subject              text not null,
  linked_record_type   text check (linked_record_type in ('vendor','executive')),
  linked_record_id     uuid,
  match_status         text not null default 'unmatched',
  match_confidence     text not null default 'unmatched',
  status               text not null default 'open'
                          check (status in ('open','waiting','resolved','archived')),
  awaiting             text check (awaiting in ('vendor','exec','issy','none')),
  assigned_to_user_id  uuid references app_user(id),
  channel              text not null default 'email',
  first_message_at     timestamptz not null,
  last_message_at      timestamptz not null,
  unread_count         int not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index on conversation (status, last_message_at desc);
create index on conversation (linked_record_type, linked_record_id);
create index on conversation (assigned_to_user_id, status);

-- One row per email in the thread.
create table message (
  id                   uuid primary key default gen_random_uuid(),
  conversation_id      uuid not null references conversation(id) on delete cascade,
  gmail_message_id     text not null unique,
  gmail_history_id     text not null,
  rfc822_message_id    text not null,                -- the actual Message-ID header
  in_reply_to          text,                         -- In-Reply-To header
  reference_chain      text,                         -- References header
  direction            text not null check (direction in ('inbound','outbound')),
  source               text not null check (source in ('gmail','platform','gmail_direct')),
  status               text not null default 'received'
                          check (status in ('received','queued','sending','sent','failed','retrying')),
  from_address         text not null,
  from_name            text,
  to_addresses         jsonb not null default '[]',
  cc_addresses         jsonb not null default '[]',
  bcc_addresses        jsonb not null default '[]',
  subject              text,
  body_text            text,
  body_html            text,
  snippet              text,
  has_attachments      boolean not null default false,
  attachment_manifest  jsonb not null default '[]',  -- [{filename, mime, size, gmail_attachment_id}]
  sent_at              timestamptz,
  received_at          timestamptz not null,
  read_at              timestamptz,
  read_by_user_id      uuid references app_user(id),
  sent_by_user_id      uuid references app_user(id),
  client_send_id       uuid unique,                  -- for idempotent send
  imported_via_backfill boolean not null default false,
  acting_as_ea         boolean not null default false,
  ai_draft_id          uuid references ai_draft(id), -- if this outbound came from an AI draft
  created_at           timestamptz not null default now()
);

create index on message (conversation_id, received_at desc);
create index on message (status) where status in ('queued','sending','retrying','failed');
create index on message (direction, received_at desc);

-- AI drafts (see MESSAGING_AI_DRAFT_SPEC.md for full schema; stub here for the FK).
create table ai_draft (
  id                   uuid primary key default gen_random_uuid(),
  conversation_id      uuid not null references conversation(id) on delete cascade,
  -- ... see MESSAGING_AI_DRAFT_SPEC.md
  created_at           timestamptz not null default now()
);

-- Internal notes (team-only, never sent).
create table internal_note (
  id                   uuid primary key default gen_random_uuid(),
  conversation_id      uuid not null references conversation(id) on delete cascade,
  author_user_id       uuid not null references app_user(id),
  body                 text not null,
  created_at           timestamptz not null default now()
);

create index on internal_note (conversation_id, created_at);

-- Attachments stored in Supabase Storage (bucket: 'message-attachments'),
-- referenced by gmail_attachment_id. The platform fetches lazily on demand
-- (download click) rather than mirroring every attachment to storage on
-- inbound, to keep storage costs predictable. Gmail keeps the original.

-- Integration credentials (one row per provider).
create table integration_credential (
  id                       uuid primary key default gen_random_uuid(),
  provider                 text not null,                       -- 'gmail'
  mailbox_address          text not null,
  granted_scopes           jsonb not null,
  encrypted_refresh_token  bytea not null,                      -- AES-256-GCM via KMS
  status                   text not null default 'active'
                              check (status in ('active','revoked','paused')),
  installed_by_user_id     uuid not null references app_user(id),
  terms_version_at_consent text not null,
  history_id_watermark     text,
  watch_expires_at         timestamptz,
  connected_at             timestamptz not null default now(),
  last_used_at             timestamptz,
  revoked_at               timestamptz,
  unique (provider, mailbox_address)
);
```

RLS policies:

- `conversation`, `message`, `internal_note`: read/write only by users with the
  `staff` or `admin` role on the platform (so vendors and executives never see
  these rows; they interact via email only). Audit-log every read by
  `inspector` role users.
- `integration_credential`: service role only.

## 11. Conversation state machine

Conversation status is small and orthogonal to the meeting/gift state machine
(see [`STATE_MACHINES.md`](STATE_MACHINES.md)).

```
                       ┌─────────────────────────────┐
                       │                             │
   (inbound message)   │                             │
   ──────────────────► OPEN ◄──────── (reply from   │
                       │             vendor/exec)   │
                       │                             │
                       │  ↓ (Issy replies, awaiting │
                       │     their reply)            │
                       │                             │
                       WAITING                       │
                       │                             │
                       │  ↓ (Issy clicks Resolve, or │
                       │     archive in Gmail)       │
                       ▼                             │
                       RESOLVED ───────► ARCHIVED    │
                          ▲                          │
                          └──────────────────────────┘
                          (auto-resolve after 30 days
                           of no activity, configurable)
```

- `open`: requires Issy's attention. Bell badge counts these.
- `waiting`: Issy has replied; waiting on the other side. Auto-reverts to
  `open` if 7 days pass with no reply (configurable; sends Issy a "still
  waiting" notification, does not auto-resend).
- `resolved`: closed by Issy or by Gmail archive. Can be reopened by any new
  inbound message in the thread.
- `archived`: explicitly archived (rare; for compliance hold or known-spam).
  Does NOT auto-reopen on new inbound; the message arrives and creates a new
  conversation.

Every transition writes an `audit_event` row.

## 12. Failure modes and operational concerns

| Failure | Detection | Response |
|---|---|---|
| Pub/Sub stops delivering (broken push) | Heartbeat: every 5 min, if no notification in 60 min during business hours, fall back to polling `history.list` once. | Page on-call after 30 min of fallback polling. |
| Refresh token revoked | `invalid_grant` on token refresh. | Set integration `revoked`, halt outbound, show banner, alert. |
| Gmail API outage | 5xx rate > 25% over 5 min. | Halt outbound, queue messages, show Gmail status banner in admin, alert. |
| Quota exceeded | 429 from Gmail. | Exponential backoff, scale read concurrency down. Alert at 80% daily quota. |
| Pub/Sub push 5xx loop | Pub/Sub dashboard. | Webhook returns 200 even on internal errors (after enqueueing job); the job's retry policy handles real failures. NEVER let Pub/Sub retries pile up. |
| Mailbox inbox-zero pattern broken (50,000+ unread) | Bootstrap edge case. | Bootstrap pulls historyId only; backfill is bounded at 30 days. Manual import for older messages, not in v1. |
| Webhook impostor traffic | OIDC token verification fails. | Reject 401, alert at 1% rejection rate. |
| Gmail thread merge | Same thread id, surprising new participants. | Re-run record matching on the new message; surface in inbox with "added participants" indicator. |
| Out-of-order delivery of history events | historyId out of sequence. | The history API returns events in order; always advance the watermark to the latest seen. If `history.list` returns `notFound` (we are too far behind, e.g. > 7 days), fall back to a fresh `getProfile` to reset the watermark and accept the gap. |

## 13. Security

- All tokens encrypted at rest in KMS (Section 5).
- All API calls over TLS 1.2+; no plaintext SMTP fallback.
- The webhook endpoint is the only public surface; it verifies OIDC tokens.
- No customer can ever read `message` or `conversation` rows; RLS denies by
  default.
- PII handling: email bodies may contain personal data, financial figures,
  meeting details. They live in Supabase under the same protection as the rest
  of the platform's data, per [`SECURITY_AND_COMPLIANCE.md`](SECURITY_AND_COMPLIANCE.md).
- Audit log: every read of `message.body_text` or `body_html` by a user with
  `inspector` role is logged. Issy's own reads as `admin` are not logged
  individually (would generate noise), but the bulk read pattern is monitored.
- Right-to-erasure: when a vendor or executive is deleted from the platform,
  their linked conversations remain (so we keep our own records of the business
  relationship) but are unlinked from the deleted record. Issy can manually
  delete from Gmail if needed; the platform does not call `messages.trash`
  automatically (we explicitly excluded the delete scope).

## 14. Pre-launch checklist (gate to production)

Before flipping the OAuth client to Production and going live:

- [ ] Mailbox address picked and provisioned on Workspace.
- [ ] SPF, DKIM, DMARC verified (DMARC at p=quarantine minimum).
- [ ] CASA Tier 2 assessment passed.
- [ ] OAuth consent screen verified by Google (sensitive + restricted scopes).
- [ ] App demo video recorded and submitted.
- [ ] Privacy policy and terms of service published and linked from the consent
      screen.
- [ ] Production OAuth client live; staging client confirmed separate.
- [ ] Pub/Sub topics and subscriptions live in both projects.
- [ ] KMS key live with auto-rotation enabled.
- [ ] Webhook endpoint deployed, OIDC verification tested.
- [ ] Bootstrap tested on a clean mailbox (no full-mailbox pulls).
- [ ] Outbound send tested: idempotent, threaded, in correct Sent folder.
- [ ] Inbound sync tested: known sender (vendor), known sender (exec), unknown
      sender, signed-token reply.
- [ ] Record matching tested for every rule in Section 7.
- [ ] Token revocation tested: revoke in Google, observe banner, reconnect.
- [ ] Rate-limit behaviour tested: synthetic 429, confirm backoff.
- [ ] On-call alerting wired (Slack `#alerts-platform`).
- [ ] DR runbook written: "what to do if Gmail is down for 4 hours".
- [ ] Sensitive-scope retention review with Issy (where do we delete, when,
      under what conditions).

## 15. Acceptance criteria (what "done" looks like for the build chat)

The messaging module is considered shipped when ALL of the following are true:

1. A new email to `{platform_mailbox}` from a known vendor appears in the
   Admin Inbox within 60 seconds of being received by Gmail.
2. The conversation is correctly linked to the vendor record, and clicking
   the conversation shows the vendor's identity card (band, credits, etc.) per
   [`ADMIN_INBOX_SPEC.md`](ADMIN_INBOX_SPEC.md).
3. A reply sent from the Admin Inbox appears in Gmail's Sent folder within 10
   seconds, in the correct thread, with all RFC 822 threading headers present.
4. A reply sent from Gmail directly appears in the Admin Inbox within 60
   seconds, marked `source='gmail_direct'`.
5. Archiving the thread in Gmail moves the conversation to `resolved` in the
   platform within 60 seconds.
6. Resolving the conversation in the platform adds the
   `THEGOODINTRO/RESOLVED` label in Gmail within 10 seconds.
7. Revoking the OAuth grant in Google immediately surfaces the reconnect
   banner in the Admin Inbox on the next API call.
8. The pre-launch checklist (Section 14) is fully ticked.
9. All five record-matching rules (Section 7) have unit tests with named
   fixtures.
10. Synthetic chaos tests pass: drop the webhook for 10 min, kill the worker
    mid-job, force a 429 on send, force a 401 mid-job, kill Pub/Sub for 30 min.

## 16. Open decisions for Issy (resolve before build)

These are intentionally NOT decided in this contract. The build chat MUST NOT
proceed past these without Issy's answer.

- [ ] **Mailbox address.** Pick from the candidates in 2.1 (or another). Affects
      every outbound email signature and every vendor/exec's mental model of
      "who am I emailing".
- [ ] **Display name on outbound.** "TheGoodIntro" alone, "TheGoodIntro |
      Issy", "Issy at TheGoodIntro", or something else.
- [ ] **Backfill window on bootstrap.** Default proposed: 7 days. Issy may want
      30 days or none.
- [ ] **Auto-archive on resolve.** When Issy clicks Resolve in the platform,
      should the platform also archive in Gmail (remove from Inbox)? Default
      proposed: yes, on the principle that resolved means handled.
- [ ] **"Waiting" auto-revert window.** Default proposed: 7 days. Auto-flips
      back to `open` and notifies Issy. Issy may want 3 or 14.
- [ ] **Auto-resolve idle window.** Default proposed: 30 days of no activity.
      Issy may want 14 or 60.
- [ ] **Sensitive-scope assessor.** Three Google-approved assessors at AU
      pricing: Leviathan Security, Bishop Fox, Schellman. Issy picks based on
      quote and lead time.

## 17. Change history

- 2026-05-31 — Initial contract. Supersedes the
  [`ADMIN_PORTAL_BRIEF.md`](ADMIN_PORTAL_BRIEF.md) §Comms reference to Front /
  Help Scout as the underlying engine. Native Gmail sync is the chosen path.
