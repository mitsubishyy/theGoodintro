# theGoodintro — Email Actions & Consent (v1)

How an executive (who never logs in) safely accepts, declines, or forwards a
meeting request from inside an email, and how their consent is captured. This is
the security spec for the product's primary interaction surface. Companion to
[DATA_MODEL.md](DATA_MODEL.md) and [STATE_MACHINES.md](STATE_MACHINES.md). Last
updated 2026-05-26.

> Plain-English summary: the buttons in the exec's email open a small **confirm
> page**, they pick an action and press a button there, and only then does
> anything happen. Nothing commits just by a link being clicked, which is what
> keeps corporate email scanners from accidentally accepting meetings.

## The core idea

Each request email carries **one signed link** (per request), pointing at a
**confirm page**. The three email buttons (Accept / Decline / Send to EA) are the
same link with an `intent` hint that pre-selects the action on the page. The link
itself only ever **renders a page** (a GET); the real action is a **POST** when a
button on the confirm page is pressed.

This split is deliberate and load-bearing:

- **Corporate email security scanners GET every link** in an inbound email to
  check it. If "Accept" committed on GET, those bots would silently accept
  meetings. Because GET only renders the page and the mutation is a POST, a
  scanner pre-clicking the link does nothing.

## The token

| Field | Type | Notes |
|---|---|---|
| `request_id` | request_id | What the token authorises |
| `token` | text | High-entropy random, opaque |
| `status` | enum | `active` → `consumed` / `revoked` |

- **No expiry.** Valid **until the request is actioned or closed** (matches the
  "requests never auto-expire" rule). Every follow-up email reuses the same link.
- The token authorises **the request**, not a specific action, so any of the
  three buttons resolves to the same safe confirm page.
- **Revoked** when: the request is accepted or declined (consumed), Issy closes
  the request, or the executive leaves mid-flight.

## The confirm page

A GET on the link renders a page showing:

1. The request summary (vendor, the two context blocks, the indicative charity
   amount), so the exec sees what they are deciding on.
2. **"Who is confirming?"** a choice between **the executive** and **their EA
   acting for them**. The page pre-fills based on context but the actor is
   recorded as selected.
3. The action, pre-selected from the email button's `intent` (Accept / Decline /
   Send to EA), changeable on the page.
4. A Terms notice: **"By confirming, you accept the Terms"** with a link.

Pressing the confirm button issues the **POST** that commits the action.

## Actions

- **Accept / Decline** are terminal for the request: they **consume** the token
  and advance the Request state machine. Decline captures a reason.
- **Send to EA** is **not** terminal: it forwards the request email to the
  executive's linked EA (from the Executive record; if none is linked, the page
  asks for an email) and **keeps the token active** so the EA can then act. The
  EA uses the same link and selects "EA acting for them" on the confirm page.

## Actor and consent capture

On the committing POST, the system records a **consent event**:

| Field | Notes |
|---|---|
| `token` / `request_id` | What was acted on |
| `actor` | `executive` or `ea_acting_for_exec` (from the page choice) |
| `action` | accept / decline |
| `terms_version` | The Terms version shown |
| `consented_at`, `ip`, `user_agent` | Evidence |

- **Proceeding is acceptance.** There is no separate tick box; pressing confirm
  with the Terms notice visible is the recorded consent (matches the locked MVP
  decision). The consent event is the durable record for an exec who never logs
  in.
- EA actions are attributed in the audit log as **"EA acting for [executive]"**.

## Trust model and residual risk (acknowledged)

- The link is **forwardable by nature** (the whole point is "forward to your
  EA"). We **trust the self-identified actor** on the confirm page. This is the
  accepted v1 model.
- **Residual risk:** anyone who obtains a forwarded link can act, claiming to be
  the exec or EA. Exposure is limited to the exec's own inbox and whoever they
  choose to forward to, which is acceptable for an invite-only, relationship-based
  v1. Revisit if abuse appears (e.g. step up to per-actor magic-link for EAs).
- The confirm page is **inert on GET**; all state changes are **POST-only**.

## Deferred / owned by other docs

- **Email sending provider, sender domain, and deliverability** (SPF/DKIM/DMARC)
  → ops/compliance doc (next task). Without sender authentication these emails
  land in spam, which would sink the whole model, so it is a v1 must.
- **Notification content/templates** per event → templates doc.
- **Magic-link auth** for vendors/admin (a different surface from these exec
  action links) → ops/compliance doc.
