# theGoodintro — State Machines (v1)

The allowed states and transitions for the three records that move through the
booking loop: **Request**, **Meeting**, and **GiftRecord**. This is the companion
to [DATA_MODEL.md](DATA_MODEL.md) (which defines the fields) and the source of
truth for "what can legally happen next." Money rules referenced here are
authoritative in DATA_MODEL.md. Last updated 2026-05-26.

> How to read this: each record has a list of states, then a transition table
> (`From → Event → To`, plus side effects). A transition that is not in the table
> is not allowed. Terminal states have no outgoing rows.

## Conventions

- A **side effect** is what the system does on the transition (notify, reserve a
  credit, create a gift, etc.).
- "Via Issy" means the transition is admin-confirmed, not self-serve.
- Credit **reserve / consume / release** semantics are defined in DATA_MODEL.md;
  the trigger points are shown here.

---

## Request

A vendor's qualified ask to meet an executive. It does **not** auto-expire.

**States:** `submitted` → `accepted` · `declined` · `closed`

| From | Event | To | Side effects |
|---|---|---|---|
| (start) | Vendor submits request | `submitted` | Exec request email sent (signed accept/decline/forward links); vendor sees it in Pending (in-app only) |
| `submitted` | Exec accepts (signed link) | `accepted` | Spawn a **Meeting** in `proposed`; notify vendor "securing a time"; raise confirm-time task for Issy |
| `submitted` | Exec declines (with reason) | `declined` | AI-drafted decline reply, sent by Issy in v1 |
| `submitted` | Issy closes it | `closed` | Manual housekeeping for a request that is stale or withdrawn |

Follow-up nudges (the chase sequence) fire while a request sits in `submitted`
but do **not** change its state. `accepted`, `declined`, and `closed` are
terminal for the Request (the Meeting takes over from `accepted`).

---

## Meeting

Created when a Request is accepted. This is where the credit and gift mechanics
live.

**States:** `proposed` → `confirmed` → `held` · `no_show` · `cancelled` · `reversed`

| From | Event | To | Side effects |
|---|---|---|---|
| (start) | Request accepted | `proposed` | Issy arranging a time. **No credit reserved yet** |
| `proposed` | Issy confirms a time | `confirmed` | Calendar invite to exec + both vendor emails. **If a credit is available, reserve it** (vendor's available balance drops now). **If none (overcommit), the meeting is set ≥30 days out and `payment_due_at` = 30 days before the meeting**; reminders queued (at booking and ~7 days before due) |
| `confirmed` | Reschedule (via Issy) | `confirmed` | New `scheduled_at`; invite updated. If uncredited, `payment_due_at` recomputes to the new date. **Unlimited reschedules, no cap or flag** |
| `confirmed` | Exec attended, per Zoom/Teams API | `held` | **Consume the credit**; create **GiftRecord** (`released`), amount locked from the band reached now |
| `confirmed` | Exec absent, per Zoom/Teams API | `no_show` | **Release the reservation**; no gift |
| `confirmed` | Cancelled by either side (via Issy) | `cancelled` | Release the reservation; notify all |
| `confirmed` | Uncredited and unpaid at `payment_due_at` | `cancelled` | **Auto-cancel**; release; notify vendor + exec + EA |
| `held` | Issy manual reversal (vendor reported a problem) | `reversed` | **Return the credit** to available; **void the GiftRecord if unpaid**; trigger a rebook with the same exec |

**Outcome authority.** The Zoom/Teams API sets `held` vs `no_show`
**automatically**. There is no "needs review" state. The correction path is the
manual `reversed` transition below.

**Manual reversal (the override you asked for).** If the API marked a meeting
`held` but the vendor emails to say it did not happen, Issy clicks one action:
the credit goes **back** to the vendor's available balance, the GiftRecord is
**voided** (only valid while it is still `released`/unpaid, see Flags), and a
**rebook** is started with the same executive.

`no_show`, `cancelled`, and `reversed` are terminal.

---

## GiftRecord

Created when a Meeting becomes `held`. The single canonical gift record; all
impact views read it.

**States:** `released` → `paid` · `voided`

| From | Event | To | Side effects |
|---|---|---|---|
| (start) | Meeting held | `released` | Charity/admin split locked from `band_at_completion`; gift owed |
| `released` | Issy pays the charity + confirms | `paid` | Confirmation logged; shown in Giving / impact views |
| `released` | Parent meeting reversed before payment | `voided` | Credit already returned by the reversal; no gift owed |

`paid` and `voided` are terminal. A gift cannot move from `paid` back to
`voided` (see Flags).

---

## Uncredited-meeting payment sub-flow

For a `confirmed` meeting with **no reserved credit** (overcommit):

1. Meeting is scheduled **at least 30 days after the exec accepted**.
2. `payment_due_at` = 30 days before the meeting date.
3. Reminders: at booking, and ~7 days before `payment_due_at`.
4. **Paid in time** → a CreditLot is created and reserved to this meeting; the
   meeting proceeds normally.
5. **Not paid by `payment_due_at`** → `confirmed → cancelled` (auto), notify
   vendor + exec + EA.
6. A vendor may hold at most **4** booked-but-unpaid meetings at once.

---

## Edges (decided)

- **Gift void on reversal.** A manual reversal voids the gift **only while it is
  still `released` (unpaid)**. If Issy has already paid the charity, the gift
  cannot be clawed back; the credit return becomes a goodwill cost and the
  reversal flags this to her.
- **Reschedules are unlimited, with no cap or flag.** Accepted trade-off: an
  uncredited meeting's payment deadline can in theory be pushed by repeated
  rescheduling. No system guard; this is handled by relationship/judgement.
- **Vendor no-show while the exec attended.** Per the held rule (exec attended =
  `held`), this consumes the vendor's credit by default. The manual reversal is
  the relief valve if you choose to give the credit back.

## Deferred / owned by other docs

- **Signed-link mechanics** for accept/decline/forward (token, expiry, single-use,
  forwarded-link trust, GET-prefetch safety) → email-actions doc (next task).
- **Notification content/timing** per transition → the MVP_SCOPE matrix + a
  templates doc.
