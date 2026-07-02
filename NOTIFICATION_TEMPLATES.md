# theGoodintro — Notification Templates (v1)

The wording for every notification in the v1 loop, per the matrix in
[MVP_SCOPE.md](MVP_SCOPE.md) plus the events our specs added (uncredited-payment
reminders, reversal/rebook, bounces). Companion to the state machines in
[STATE_MACHINES.md](STATE_MACHINES.md). Last updated 2026-05-26.

## Conventions

- **Sender (decided):** exec-facing emails come **personally from Issy**
  ("Issy at theGoodintro", signed "Issy"). Routine vendor transactional emails
  come **from the brand** ("theGoodintro"). A few vendor-facing messages (the
  welcome **A1**, a decline) come **from Issy** for warmth; noted per template.
- **Voice:** confident concierge, warm but never gushing. Premium hospitality.
- **"Good"** as the brand concept is capitalised and shown in emerald in HTML.
- **No em or en dashes** in copy (hyphens like "45-minute" are fine).
- `{placeholders}` are filled at send time. `[Buttons]` are links/actions.
- **Channels:** `email`, `in-app`, `Slack` (the one Slack alert is new sign-ups).

---

## A. Vendor onboarding & billing (from the brand)

**A1 · New sign-up** — FINAL copy approved by Issy 2026-06-13. The vendor email
is sent **personally from Issy** (overrides the "from the brand" default for
this one message). The 👋 emoji is intentional and approved; do NOT strip it in
brand-rule validation. Copy uses "TheGoodIntro" (one word) and "requesting"
meetings (matches the vendor portal button). Reuse the locked email chrome from
[`design/locked/exec-request-email/`](design/locked/exec-request-email/) (warm
cream, single emerald CTA, Inter/Fraunces with safe fallbacks).
- To vendor (email, from Issy): _Subject:_ Welcome to TheGoodIntro

  Hi {first_name},

  A warm welcome to TheGoodIntro 👋

  Building pipeline has never been harder, with the noise of AI and thousands of new startups arriving every year. Regardless of how much research you do, cold outreach still goes unanswered, and the senior leaders you most want to reach are the hardest to get in front of. That's the problem we're aiming to solve.

  The next step is a short call with me, so I can get to know you and who you're hoping to meet.
  [Book your call]

  Once we've been introduced and found some executives for you to meet, you'll be able to view the full executive list and start requesting meetings!

  Looking forward to meeting you.

  Issy
  {issy_gmail_signature}
- To Issy (Slack + dashboard): New vendor sign-up: {company} ({name}, {email}).
  Next step: book a vetting call.

**A2 · Vetting call booked + form submitted**
- To vendor (email): You are booked in for {call_datetime}. Looking forward to
  speaking. If anything changes, you can reschedule here. [Manage booking]
- To Issy (dashboard): Vetting call booked with {company} for {call_datetime}.
  Application answers are on the record.

**A3 · Vendor approved (on the call)**
- To vendor (email): _Subject:_ You are approved.
  Good news, you are approved to join theGoodintro. Your account is open and
  payment is now unlocked. Once you are set up, you can start requesting meetings.
  [Go to your account]

**A4 · Invoice paid (Xero webhook)**
- To vendor (email + in-app): _Subject:_ Payment received, thank you.
  Thank you, your payment has cleared. {credits} meeting credits are now on your
  account and the executive list is open. [Start a request]
- To Issy (dashboard): {company} paid {amount}. {credits} credits added; access
  unlocked.

**A5 · Invite to join an existing org** (Owner invites a user)
- To invitee (email): _Subject:_ {owner_name} has invited you to theGoodintro.
  {owner_name} has added you to {company}'s account on theGoodintro. Set up your
  login to get started. [Accept invite]

---

## B. The request loop (exec-facing, from Issy)

**B0 · Executive set up** (sent once, right after Issy creates the exec profile
on the onboarding call; FINAL copy approved by Issy 2026-06-13). **From Issy**,
like every exec-facing email. Honors the email-first rule: nothing for the exec
to do, **NO login, NO "confirm your account" CTA.** Consent still binds at the
first Accept/Decline (per EXECUTIVE_PORTAL_BRIEF consent section), NOT here. No
EA clause (not all execs have an EA). The charity line is deliberately
**cumulative/total impact** ("the more you take, the more they receive"), NOT a
per-meeting-rate claim — the per-meeting charity share is driven by the
**vendor's** band, never the exec's volume; do not reword it into a per-exec
escalator (that would be a pricing-model change, not copy). Reuse the locked
email chrome from [`design/locked/exec-request-email/`](design/locked/exec-request-email/).
- To executive (email, from Issy): _Subject:_ You're all set with TheGoodIntro

  Hi {exec_first_name},

  Thank you for taking the time to speak with me. You are all set up, and there is nothing you need to do.

  Here is how it works from here. When a vetted leader wants 45 minutes with you, I will send the request straight to your inbox, with who they are, why they think you specifically, and the charity your meeting will support. You accept or decline right from the email. No login, no platform to learn.

  Every meeting you take sends a real gift to {charity_name}, the charity you chose. The more you are able to take, the more they receive. You can change your charity any time, just reply and let me know.

  If anything above is not quite right, simply reply and I will fix it.

  Looking forward to introducing you to some people worth your time.

  Issy
  {issy_gmail_signature}
- To Issy (dashboard): Welcome sent to {exec_name}; profile live. Standing charity: {charity_name}.

**B1 · Request submitted, the first touch**
- To executive (email, from Issy): _Subject:_ An introduction worth your time
  Hi {exec_first_name},
  {vendor_name} asked to meet you, and the reason is a strong one.
  What they would like to talk about: {q1_what}
  Why they think it is relevant to you: {q2_why}
  It is one 45-minute conversation, on your terms. If you take it, {vendor_name}
  sends {indicative_amount} to {charity_name}, the charity you chose.
  [Accept] [Decline] [Send to my EA]
  No pressure either way, and no obligation to take the next one.
  Issy
- To vendor (in-app only): Your request to {exec_name} has been sent. We will let
  you know the moment we hear back. (Appears in Pending.)
- To Issy (dashboard): Request live: {vendor_name} → {exec_name}.

**B2 · Follow-up nudge 1** (~4 days, no reply; from Issy)
- To executive (email): Hi {exec_first_name}, just floating this back to the top
  of your inbox. {vendor_name} would value 45 minutes, and a meeting sends
  {indicative_amount} to {charity_name}. [Accept] [Decline] [Send to my EA]
  Whenever suits. Issy
- To vendor (email): A quick update: we are still working on reaching
  {exec_name}. Nothing for you to do, we will be in touch.

**B3 · Follow-up nudge 2, the last automated one** (~4 days later; from Issy)
- To executive (email): Hi {exec_first_name}, last nudge from me on this one. If
  now is not the time, a quick Decline is completely fine and lets {vendor_name}
  know where they stand. [Accept] [Decline] [Send to my EA] Issy

**B4 · No reply after two nudges, hands to Issy**
- To Issy (dashboard, red task): {exec_name} has not responded to {vendor_name}
  after two follow-ups. Chase personally or close the request.
- To vendor (in-app): We are still working on reaching {exec_name} and will
  update you as soon as we can.

**B5 · Exec declines** (reason captured; reply AI-drafted, sent by Issy)
- To vendor (email, from Issy): _Subject:_ An update on your request to {exec_name}
  Hi {vendor_first_name}, {exec_name} has passed on this one for now{reason_clause}.
  It is rarely about you, timing and fit are everything at this level. Your credit
  is untouched, and there are other leaders who may be a strong match. Issy
- To Issy (dashboard): Decline to send: {vendor_name} re {exec_name}. [Review draft]

---

## C. Booking, the meeting, and the gift

**C1 · Exec accepts**
- To vendor (email + in-app, brand): _Subject:_ {exec_name} accepted.
  Good news, {exec_name} has accepted. We are securing a time now and will send
  the invite shortly.
- To Issy (dashboard): Confirm a time: {vendor_name} with {exec_name}.

**C2 · Time confirmed**
- To executive (calendar invite, organiser Issy): 45 minutes with {vendor_name}.
  {one_line_context}. A meeting sends {indicative_amount} to {charity_name}.
  Join: {join_url}
- To vendor, both emails (email + invite, brand): You are confirmed with
  {exec_name} on {meeting_datetime}. The invite and join link are attached.

**C3 · Reschedule or cancel** (any side, incl EA)
- To vendor + executive: updated calendar invite reflecting the new time, or a
  cancellation notice. Exec-facing copy from Issy; vendor-facing from the brand.
- To Issy (dashboard): Rebook task: {meeting} moved/cancelled by {who}.

**C4 · Exec leaves mid-flight**
- To vendor (email, brand): Your upcoming meeting with {exec_name} can no longer
  go ahead. No credit has been used, and we will look for an equally relevant
  leader for you.

**C5 · Attendance reported (Zoom/Teams API)**
- To Issy (dashboard): Outcome set for {meeting}: {held / no-show}. {If held:
  release the gift.}
- To vendor (in-app): outcome shown on the meeting.

**C6 · Meeting completed (held)**
- To executive (email, from Issy): Hi {exec_first_name}, thank you for your time
  with {vendor_name} today. As promised, {charity_amount} is on its way to
  {charity_name}. I will confirm the moment it lands. Issy
- To vendor (email + in-app, brand): Your meeting with {exec_name} is complete. A
  gift of {charity_amount} to {charity_name} has been recorded and will be
  confirmed within 14 days. Thank you for being the kind of introduction worth
  taking.

**C7 · Gift paid to the charity (confirmed)**
- To executive (email, from Issy): Hi {exec_first_name}, confirmed: {charity_amount}
  has reached {charity_name}. Thank you for making it happen. Issy
- To vendor (in-app, brand): Gift confirmed: {charity_amount} to {charity_name}.

---

## D. Uncredited bookings (overcommit; from the brand)

**D1 · Uncredited meeting booked, payment due**
- To vendor (email + in-app): Your meeting with {exec_name} is booked for
  {meeting_date}. To keep it, payment of {amount} needs to clear by
  {payment_due_date}. [Pay now]

**D2 · Payment reminder** (~7 days before the deadline)
- To vendor (email): A reminder: your meeting with {exec_name} on {meeting_date}
  will be cancelled unless payment clears by {payment_due_date}, now {days_left}
  days away. [Pay now]

**D3 · Auto-cancel, unpaid at the deadline**
- To vendor (email + in-app, brand): Your meeting with {exec_name} has been
  cancelled because payment did not clear in time. No credit was used, and you are
  welcome to rebook whenever you are ready.
- To executive + EA (email, from Issy): Hi {exec_first_name}, the meeting with
  {vendor_name} on {meeting_date} will no longer go ahead. Apologies for the
  change, and thank you for your flexibility. Issy

---

## E. Reversal & rebook (vendor reported they could not attend)

**E1 · Credit returned, rebooking**
- To vendor (email + in-app, brand): We have returned your credit and are
  arranging a new time with {exec_name}. Sorry the first attempt did not go ahead.
- To executive (email, from Issy): Hi {exec_first_name}, let's find a new time for
  your meeting with {vendor_name}. I will send a few options shortly. Issy
- To Issy (dashboard): Reversal: credit returned to {vendor_name}; rebook with
  {exec_name}.{gift_paid_flag}

---

## F. Admin alerts (to Issy)

**F1 · Exec email bounced / undeliverable**
- To Issy (dashboard + Slack): {exec_name}'s email bounced. Their request with
  {vendor_name} cannot progress until a working address is on file.

---

## Notes for build

- The decline reply (B5) is AI-drafted from the captured reason, then **Issy
  reviews and sends** in v1.
- All exec-facing sends use the signed-link confirm-page flow in
  [EMAIL_ACTIONS.md](EMAIL_ACTIONS.md); the `[Accept] [Decline] [Send to my EA]`
  buttons are those links.
- Indicative amounts (`{indicative_amount}`) are read live from the pricing model,
  never hardcoded; the final `{charity_amount}` is the locked figure from the
  GiftRecord.
- "v1 could launch with a single follow-up", the cadence here (two nudges) is the
  target; B3 can be dropped for a leaner start.
