# theGoodintro — Data Model (v1)

The canonical list of **what we store and how the pieces relate**, for the v1
platform scoped in [MVP_SCOPE.md](MVP_SCOPE.md). This is the source of truth for
entities, fields, statuses, and the money rules. Workflows live in the portal
briefs; the day-to-day numbers live in [CALCULATIONS.md](CALCULATIONS.md) and the
charity side in [CHARITY_FLOW.md](CHARITY_FLOW.md). Last updated 2026-05-26.

> How to read this: each entity has a one-line **purpose** in plain English, then
> a fields table. Anything marked _(deferred)_ is intentionally left for another
> doc and flagged at the bottom. The **Money rules** section is the authoritative
> spec for credits, bands, and gifts; build the math from there, never from a
> hardcoded number.

## Conventions

- Every entity has an `id` (UUID) and `created_at` / `updated_at` timestamps.
  Those are assumed and not repeated in each table.
- `*_id` means a reference (foreign key) to another entity.
- Money is stored in **whole AUD cents** (integers), never floats. All amounts
  are AUD, GST handling per CALCULATIONS.md.
- Times are stored in **UTC**; display is converted to the viewer's local zone.
- "Soft delete" means a `deleted_at` timestamp, not a real row removal (retention
  rules are a compliance-doc decision, flagged below).
- Enums are written as `lower_snake_case` fixed value lists.
- Columns added after the foundation schema are tagged with their migration
  number, e.g. `(0019)`. This file reflects migrations through **0023**.

---

## The people and the org

### Vendor (organisation)
**Purpose:** a paying company. The billable account that buys credits and books
meetings.

| Field | Type | Notes |
|---|---|---|
| `name` | text | Company name |
| `email_domain` | text | The work-email domain that owns this org; unique. A second org on the same domain is not allowed |
| `status` | enum | `signed_up` → `call_booked` → `approved` → `paid` → `active` → `dormant` → `churned` (see the DB-enforced lifecycle edges note below; `paid` is deferred) |
| `owner_user_id` | vendor_user_id | The single billing Owner (transferable; admin can reassign) |
| `access_expires_at` | timestamp | End of the current 12-month access window (see Money rules) |
| `cycle_started_at` | timestamp | Anchor of the current 12-month clock (set at first purchase) |

**Vendor lifecycle edges (DB-enforced, migration 0036).** The chain above is the
documented progression; the DB allows the union of that chain and what the app
actually performs today:

- `signed_up → call_booked` (vetting call booked, 0007).
- `signed_up → approved` **and** `call_booked → approved` (admin approve; the
  approve action is offered from either state, so both are legal).
- `approved → active` (first payment via `apply_paid_invoice`, which skips `paid`).
- `paid → active` (documented chain step; reachable only once a `paid` setter exists).
- `active → dormant` and `dormant → churned` (documented; setters deferred).
- `dormant → active` (a returning vendor's payment reactivates them).
- A same-status write is a no-op (an idempotent top-up re-pay while already `active`).

`paid` is a **documented status not written by the app today (deferred):**
`apply_paid_invoice` transitions `approved → active` directly. The guard still
permits `approved → paid` and `paid → active`, so adding a `paid` setter later
needs no migration. `active → churned` is intentionally NOT allowed: the chain
churns via `dormant`.

### VendorUser (seat)
**Purpose:** a person inside a Vendor org. Max **6** per org.

| Field | Type | Notes |
|---|---|---|
| `vendor_id` | vendor_id | |
| `email` | text | Must be on the org's `email_domain` |
| `name` | text | |
| `role` | enum | `owner` or `member`. Only `owner` sees billing |
| `status` | enum | `invited` → `active` → `removed` |
| `photo_url`, `bio_one_liner` | text | (0019) Avatar + one-line credibility line on the request email's vendor card |

### Invite
**Purpose:** membership is invite-only. The Owner invites each user; the invite
email asks them to log in and create their account.

| Field | Type | Notes |
|---|---|---|
| `vendor_id` | vendor_id | |
| `invited_email` | text | Must match the org domain |
| `invited_by_user_id` | vendor_user_id | The Owner |
| `token` | text | Single-use signup token |
| `status` | enum | `sent` → `accepted` → `expired` |

### Executive
**Purpose:** a senior leader who receives requests and takes meetings. Email-first
(usually no login in v1). Set up by Issy.

| Field | Type | Notes |
|---|---|---|
| `name`, `title`, `company` | text | |
| `photo_url` | text | Set via the file-upload pipeline (0023); falls back to initials |
| `linkedin_url` | text | (0019) |
| `interested_in`, `current_projects`, `not_interested_in` | text | (0019) Structured business context the exec Profile + admin form edit; drives which vendor requests reach them. Never shown to vendors |
| `timeline`, `seniority_signal` | text | (0019) Select-backed (canonical option lists live in code, no DB enum) |
| `suggested_cadence` | text | Informational guide on how often this exec will meet; **not enforced** in v1 |
| `context_notes` | text | **Deprecated** (0019). Superseded by the structured fields above; retained, no longer written |
| `timezone`, `preferred_window_days`, `preferred_window_start`, `preferred_window_end` | text / time | (0019) Preferred meeting window, kept structured for slot proposal |
| `calendar_provider`, `calendar_connected_at`, `calendar_last_synced_at` | text / timestamp | (0019) Free/busy connection only, never event detail |
| `default_charity_id` | charity_id | Their standing charity. Changed via the atomic `set_standing_nomination` function (0022), which also closes/opens the NominationHistory row |
| `ea_id` | ea_id | Nullable; the EA who assists them |
| `status` | enum | `invited` → `set_up` → `active` → `paused` → `left` (DB-enforced by 0036; see the lifecycle edges note below) |
| `primary_email` | text | Where request emails go |

**Executive lifecycle edges (DB-enforced, migration 0036).** The chain is enforced
exactly as written, matching the admin `NEXT_STATUS` map: `invited → set_up`,
`set_up → active`, `active → paused`, `active → left`, `paused → active`,
`paused → left`. `left` is terminal; a same-status write is a no-op. No status is
deferred here (every state has a setter via `setExecutiveStatusAction`).

### EA (executive assistant)
**Purpose:** a person who can act for one **or more** executives. Their own
record so a single EA has one identity across all the leaders they support.

| Field | Type | Notes |
|---|---|---|
| `name`, `email` | text | |

> Link table **EAAssignment** (`ea_id`, `executive_id`) gives the many-to-many
> link. Every action an EA takes is written to the audit log as "acting for
> [executive]".

### Charity _(DGR + verification cadence still in [CHARITY_FLOW.md](CHARITY_FLOW.md))_
**Purpose:** the DGR-endorsed Australian charity a gift goes to. Identity +
credentials here; the curated DETAIL-modal content fields were added in 0021.

| Field | Type | Notes |
|---|---|---|
| `name` | text | |
| `short_name` | text | (0019) Short reference, e.g. "Flying Doctor" |
| `abn` | text | |
| `dgr_status` | enum | `endorsed` / `unverified` / `revoked` (verification cadence: charity/compliance docs) |
| `cause`, `dgr_item` | text | (0021) One-line cause + DGR item shown on cards / picker rows |
| `logo_url`, `hero_image_url` | text | (0021) Set via the file-upload pipeline (0023); fall back to initials / tint |
| `purpose` | text | (0021) One-sentence mission (detail modal) |
| `programmes` | jsonb | (0021) `[{label, body}]`, top programmes in curated order |
| `featured_quote`, `featured_quote_attribution` | text | (0021) Illustrative testimonial + generic role attribution |
| `stories` | jsonb | (0021) `[{published_at, headline, body, url}]`, newest rendered |
| `content_updated_at` | timestamp | (0021) Freshness stamp |

### NominationHistory
**Purpose:** the standing-charity history behind the My charity "since [date]"
line and feed. At most **one open row per executive** (the current standing
charity); a change closes the open row (`ended_at`) and opens a new one, run
atomically inside `set_standing_nomination` (0022) so an exec is never left with
zero open rows.

| Field | Type | Notes |
|---|---|---|
| `executive_id` | executive_id | (0019) |
| `charity_id` | charity_id | |
| `started_at` | timestamp | |
| `ended_at` | timestamp | Null for the current open row; partial unique index enforces one open per exec |

---

## Vetting and access

### Application
**Purpose:** the short form a vendor completes for the Calendly vetting call.
Issy approves on the call, which unlocks payment.

| Field | Type | Notes |
|---|---|---|
| `vendor_id` | vendor_id | |
| `answers` | json | Form answers (auto-pasted into the calendar invite) |
| `calendly_event_id` | text | The booked vetting call |
| `outcome` | enum | `pending` → `approved` / `declined` |
| `decided_by` | staff_id | |

---

## Money: credits, cycles, and gifts

> The full rules are in **Money rules** below. These entities store the state.

### Cycle
**Purpose:** the single 12-month clock per vendor. It governs **both** platform
access **and** the charity-tier band. Anchored at the vendor's **first purchase**.

| Field | Type | Notes |
|---|---|---|
| `vendor_id` | vendor_id | |
| `started_at` | timestamp | Anchor (first purchase, or the roll into a new cycle) |
| `ends_at` | timestamp | `started_at` + 12 months |
| `held_meetings_count` | int | Held meetings **in this cycle** = the band driver |

### CreditLot
**Purpose:** credits bought in one purchase. Credits **roll over** between cycles,
so a lot carries its own origin. 1 credit = 1 meeting = $1,500.

| Field | Type | Notes |
|---|---|---|
| `vendor_id` | vendor_id | |
| `quantity` | int | Credits purchased in this lot |
| `quantity_remaining` | int | Unconsumed credits from this lot |
| `invoice_id` | invoice_id | The Xero invoice that paid for it |
| `purchased_at` | timestamp | |

> **Balances (what gates bookings and what the vendor sees):**
> - **Reserved** = a meeting is booked (confirmed) but not yet held.
> - **Consumed** = the meeting was held (`sat`); the credit is spent permanently
>   and the GiftRecord is created.
> - **Available = purchased − consumed − reserved.** This is the number shown in
>   the vendor portal, and it drops the moment a meeting is **booked**, not when it
>   is sat, so a vendor cannot over-book the same credits.
> - A reservation is **released back to available** if the meeting is declined,
>   cancelled, or a no-show before it is held.

### Invoice
**Purpose:** a Xero invoice. Paid status (via Xero) auto-triggers the unlock and
downstream workflows.

| Field | Type | Notes |
|---|---|---|
| `vendor_id` | vendor_id | |
| `xero_invoice_id` | text | |
| `kind` | enum | `credit_purchase` / `overcommit_topup` |
| `line_items` | json | Credits line + **admin fee as its own named line** |
| `amount_cents` | int | |
| `status` | enum | `draft` → `sent` → `paid` → `void` |
| `voided_in_xero_at` | timestamptz | Set by the daily reconcile (0024) when Xero VOIDs a **paid** invoice → manual reverse-unlock in admin Needs action; never auto-reversed (V2_BUILD_PLAN §7) |

**Invoice lifecycle edges (NOT DB-guarded, PARKED 2026-07-01).** Unlike Meeting and
GiftRecord (0012), Vendor and Executive (0036), and Request (0037), the Invoice
`status` enum has **no DB-level transition guard**, and one is deliberately **not**
added yet. The legal lifecycle is not settled. What the code does today:

- `draft → sent` (`markInvoiceSent`).
- `draft → paid` **and** `sent → paid` (`apply_paid_invoice` does not constrain the
  source state, so a payment can land against a still-`draft` invoice).
- `draft → void` **and** `sent → void` (daily reconcile, the never-paid branch, 0024).
- A **paid** invoice VOIDed in Xero is **not** auto-flipped: the reconcile stamps
  `voided_in_xero_at` and leaves `status = 'paid'` (surfaces as a manual
  reverse-unlock; never auto-reversed, V2_BUILD_PLAN §7).

**The open question that blocks the guard:** whether `paid → void` is ever a legal
transition (the manual reverse-unlock after a Xero void), and whether it should be
represented as a status flip at all or only via `voided_in_xero_at` plus a credit
reversal. That is a business and accounting decision (V2_BUILD_PLAN §7, Issy's
call), not an engineering one. Freezing an allow-list now would risk either
forbidding a transition Issy will want or encoding one that should stay manual.
**Do not add an invoice guard (a `guard_invoice_transition` trigger) until the
invoice state machine is explicitly decided and documented here.** Invoice is
intentionally absent from STATE_MACHINES.md for the same reason.

### GiftRecord
**Purpose:** the **single canonical record** of a gift owed per held meeting.
Vendor Giving, exec impact, and public impact numbers are all **read-only views**
of this. Amount locks at completion.

| Field | Type | Notes |
|---|---|---|
| `meeting_id` | meeting_id | One per held meeting |
| `charity_id` | charity_id | The charity **actually used** for this meeting (default or override) |
| `band_at_completion` | enum | `band_1` … `band_4`, the band reached when the meeting was held |
| `charity_amount_cents` | int | Locked at completion from the band |
| `admin_fee_cents` | int | `150000 - charity_amount_cents` |
| `status` | enum | `released` → `paid` (manual release in v1) |
| `confirmation` | json | Evidence/notes when marked paid |

---

## The booking loop

### Request
**Purpose:** a vendor's qualified ask to meet an exec. Separate from the Meeting:
a Request can be declined or expire without ever becoming a Meeting.

| Field | Type | Notes |
|---|---|---|
| `vendor_id`, `requested_by_user_id` | refs | |
| `executive_id` | executive_id | |
| `q1_what` , `q2_why` | text(300) | The two context blocks (content-guarded: emails/phones/links stripped) |
| `q1_head`, `q2_head` | text(120) | (0019) Short Fraunces heads rendered above each answer body |
| `attendee` | json | On-behalf-of name + title + email when someone other than the requester attends |
| `meeting_minutes` | int | **Fixed 45** for every meeting in v1 |
| `status` | enum | `submitted` → `accepted` / `declined` / `expired` |
| `decline_reason` | text | Nullable |

### Meeting
**Purpose:** a scheduled (or held) conversation, created when a Request is
accepted.

| Field | Type | Notes |
|---|---|---|
| `request_id` | request_id | |
| `charity_id` | charity_id | The charity for **this** meeting (defaults to exec's `default_charity_id`, can be a per-meeting override) |
| `scheduled_at` | timestamp | |
| `credit_lot_id` | credit_lot_id | Nullable: the reserved credit, or null if uncredited (overcommit) |
| `payment_due_at` | timestamp | For uncredited meetings: 30 days before `scheduled_at` (see Money rules) |
| `join_url` | text | Zoom/Teams link |
| `status` | enum | `proposed` → `confirmed` → `held` / `no_show` / `cancelled` |
| `outcome_source` | enum | `zoom_teams_api` / `vendor_reported` / `admin` _(conflict rule deferred to state-machine doc)_ |

---

## System entities

### AuditEntry
**Purpose:** who did what, when. EA actions attributed to the exec they acted for.

| Field | Type | Notes |
|---|---|---|
| `actor_type` | enum | `staff` / `vendor_user` / `ea` / `system` |
| `actor_id` | ref | |
| `acting_for_executive_id` | executive_id | Set when an EA acted for an exec |
| `action` | text | e.g. `meeting.cancelled` |
| `target_type`, `target_id` | ref | |
| `metadata` | json | |

> Append-only; immutability and retention period are a compliance-doc decision.

### Notification
**Purpose:** one row per notification sent, per the v1 matrix in MVP_SCOPE.

| Field | Type | Notes |
|---|---|---|
| `recipient_type` | enum | `vendor_user` / `executive` / `ea` / `staff` |
| `recipient_id` | ref | |
| `channel` | enum | `email` / `in_app` / `slack` |
| `event` | text | Maps to the MVP notification matrix |
| `status` | enum | `queued` → `sent` → `failed` |

### Staff
**Purpose:** Issy and (later) team. `super_admin` sees money; `staff` does not.

| Field | Type | Notes |
|---|---|---|
| `name`, `email` | text | |
| `role` | enum | `super_admin` / `staff` |

### FeatureFlag and Storage
**Purpose:** infra the build depends on, not domain entities.

- **FeatureFlag** (`key`, `enabled`, `description`): every new behaviour ships
  behind one, **OFF by default** (CHANGE_SAFETY.md), toggled in the admin portal.
  e.g. `photo_upload` (0023), `exec_dashboard`, `request_loop`.
- **Storage**: the `public-avatars` bucket (0023) holds executive + charity
  images. Public read; **staff-only write** under storage RLS. Uploads are
  re-encoded server-side (which strips EXIF/GPS) and stored at content-hashed
  paths; the resulting public URL is written to the owning `*_url` column.

---

## Money rules (authoritative)

These are the locked v1 decisions. Build the credit/band/gift logic from here.

1. **Price.** 1 credit = 1 meeting = **$1,500 AUD**. The charity share is tiered
   by band; the remainder is the **admin fee** (its own named invoice line). Read
   the band amounts live from [`app/pricing/page.tsx`](app/pricing/page.tsx),
   never hardcode. For reference, current bands (charity share per meeting):
   1–5 → $900, 6–10 → $1,000, 11–15 → $1,100, 16+ → $1,200.

2. **One 12-month clock.** A vendor's **Cycle** is anchored at their **first
   purchase** and governs **both** platform access **and** the charity-tier band.
   No separate calendar-year reset.

3. **Band driver = held meetings only.** The band is set by the number of
   meetings **held** in the current cycle. Buying credits does not advance the
   band; requests and bookings do not count until the meeting is held.

4. **Split locks at completion.** When a meeting is held (`sat`), the
   charity/admin split is locked using the band reached **at that moment**, and
   written to the GiftRecord. The exec email shows an indicative amount before
   then. A credit is **reserved at booking** (which immediately lowers the
   vendor's available balance to prevent over-use) and finally **consumed at
   completion**; a cancelled or no-show meeting releases the reservation.

5. **Roll-over and reset.** Unused credits **roll over** into the next cycle. At
   a cycle reset the band returns to **band 1** ($900); rolled-over credits are
   charged at the lowest band until the vendor climbs again.

6. **Access expiry.** Buying any credits opens the platform for 12 months. If the
   vendor uses all credits and has not bought more before the cycle ends, the
   **executive view is hidden** until they buy again. Credits still roll over.

7. **Cash vs gift timing.** Cash is collected **up front** via the Xero invoice
   (paid → auto-unlock). The gift owed is **recorded per held meeting** and
   **released manually** by Issy in v1 (no automated custodial disbursement, per
   MVP_SCOPE).

8. **Uncredited booking (overcommit) rule.**
   - A vendor may book a meeting with **no available credit**.
   - When they have 0 credits, the meeting is auto-scheduled **at least 30 days
     after the exec accepts**.
   - Payment must clear **by 30 days before the meeting date** (for a meeting at
     the 30-day minimum this is effectively due at booking; placed further out,
     the extra days are runway).
   - Reminders: at booking and ~7 days before the deadline.
   - If unpaid at the deadline, the meeting **auto-cancels** and the vendor,
     exec, and EA are all notified.
   - A vendor may hold at most **4** booked-but-unpaid meetings at once.

9. **Charity choice.** Each Meeting carries its own `charity_id`, defaulting to
   the exec's `default_charity_id`. The exec can **override for one meeting only**
   (default unchanged) **or change their standing default going forward**; both
   are supported. The GiftRecord stores the charity actually used.

---

## Deferred / owned by other docs

- **Charity entity detail** and DGR verification cadence → [CHARITY_FLOW.md](CHARITY_FLOW.md).
- **Full state machines** (allowed transitions, guards, terminal states) and the
  **outcome-conflict rule** when Zoom/Teams API and a vendor's report disagree →
  state-machine doc (next task).
- **Email action-link security** (token scheme, expiry, single-use, forwarded-link
  trust, GET-prefetch safety) and **exec consent binding** → email-actions doc.
- **Audit retention, soft vs hard delete, Privacy Act erasure** → compliance doc.
- **Auth provider** (magic-link, admin 2FA) → still open in MVP_SCOPE.

## Decided here

- Meeting length is **fixed at 45 minutes** for every meeting in v1.
- Executive cadence is **informational only** in v1 (a guide for Issy, like the
  10:1 ratio); no hard cap is enforced. Enforcement can come later.
