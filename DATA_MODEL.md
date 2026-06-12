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

---

## The people and the org

### Vendor (organisation)
**Purpose:** a paying company. The billable account that buys credits and books
meetings.

| Field | Type | Notes |
|---|---|---|
| `name` | text | Company name |
| `email_domain` | text | The work-email domain that owns this org; unique. A second org on the same domain is not allowed |
| `status` | enum | `signed_up` → `call_booked` → `approved` → `paid` → `active` → `dormant` → `churned` |
| `owner_user_id` | vendor_user_id | The single billing Owner (transferable; admin can reassign) |
| `access_expires_at` | timestamp | End of the current 12-month access window (see Money rules) |
| `cycle_started_at` | timestamp | Anchor of the current 12-month clock (set at first purchase) |

### VendorUser (seat)
**Purpose:** a person inside a Vendor org. Max **6** per org.

| Field | Type | Notes |
|---|---|---|
| `vendor_id` | vendor_id | |
| `email` | text | Must be on the org's `email_domain` |
| `name` | text | |
| `role` | enum | `owner` or `member`. Only `owner` sees billing |
| `status` | enum | `invited` → `active` → `removed` |

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
| `photo_url` | text | |
| `context_notes` | text | Business-context notes used to qualify requests |
| `default_charity_id` | charity_id | Their standing charity (set at onboarding; changeable) |
| `ea_id` | ea_id | Nullable; the EA who assists them |
| `status` | enum | `invited` → `set_up` → `active` → `paused` → `left` |
| `suggested_cadence` | text | Informational guide for Issy on how often this exec will meet; **not enforced** in v1 |
| `primary_email` | text | Where request emails go |

### EA (executive assistant)
**Purpose:** a person who can act for one **or more** executives. Their own
record so a single EA has one identity across all the leaders they support.

| Field | Type | Notes |
|---|---|---|
| `name`, `email` | text | |

> Link table **EAAssignment** (`ea_id`, `executive_id`) gives the many-to-many
> link. Every action an EA takes is written to the audit log as "acting for
> [executive]".

### Charity _(shape deferred to [CHARITY_FLOW.md](CHARITY_FLOW.md))_
**Purpose:** the DGR-endorsed Australian charity a gift goes to. Stubbed here so
other entities can reference it.

| Field | Type | Notes |
|---|---|---|
| `name` | text | |
| `abn` | text | |
| `dgr_status` | enum | `endorsed` / `unverified` / `revoked` (verification cadence: charity/compliance docs) |

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
