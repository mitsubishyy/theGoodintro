# theGoodintro — Business model and charity flow

**Entity:** theGoodintro Pty Ltd, an Australian company (to be incorporated). Pre-launch.
**Maintained by:** Isobel Hardwick, Founder. issy@thegoodintros.com
**Source of truth.** This is the canonical record of how money flows through the
business. The house-style `theGoodintro-charity-flow-briefing.docx` is generated
from this file for sharing with advisors. House rule: no em or en dashes in prose
(en dashes only inside numeric ranges).

## Decision (26 May 2026): we operate the donation model (Model 2)

We have chosen to run theGoodintro as a **for-profit donation model**, not a
pass-through or conduit. In essence this mirrors how MeetMagic operates: the
business earns the meeting fee as its own revenue and then makes the charitable
donation itself. theGoodintro never holds money on the charity's behalf.

We considered and rejected the pass-through model (Model 1), where the gift would
be the charity's money from the moment the vendor pays and the charity would
receipt the vendor directly. Model 1 gives a better GST position and lets the
vendor claim the gift, but it makes us a fundraiser handling charity money, which
triggers state-based charitable fundraising registration, trust or escrow
obligations, and agreements with each charity. We chose the simpler, lower-risk
path.

## What theGoodintro is

theGoodintro is an invite-only Australian network that connects vetted software
vendors with senior executives for a single, qualified meeting. Every meeting
funds a gift to a registered charity that the executive chooses. The executive
pays nothing. Our purpose is to make commercial introductions that also do
measurable Good, with full transparency over where the money goes.

## How the money flows under the donation model

A vetted vendor requests a meeting with an executive whose stated priorities fit.
The vendor pays only for meetings that are actually held. No-shows are not charged.

The vendor pays a flat $1,500 AUD per held meeting. The whole fee is theGoodintro's
revenue. We then donate a fixed portion to the executive's nominated charity from
our own funds, and that gift rises with the number of meetings the vendor takes
across the year:

| Meetings per year | Gift to chosen charity | Net to theGoodintro | Total per meeting |
|---|---|---|---|
| 1–5 | $900 | $600 | $1,500 |
| 6–10 | $1,000 | $500 | $1,500 |
| 11–15 | $1,100 | $400 | $1,500 |
| 16 or more | $1,200 | $300 | $1,500 |

- The full $1,500 is **theGoodintro's assessable income**. The gift is an expense
  we pay out of that income, not money we hold for the charity.
- We donate the gift to the executive's nominated charity after the meeting is held.
  We intend that every nominated charity holds **DGR endorsement**, so our donation
  is tax-deductible to theGoodintro.
- The "platform admin fee" framing (the $300 to $600) is the net we keep after the
  gift. It is no longer accurate to call it our "only revenue": all $1,500 is
  revenue, and the gift is a deductible donation we choose to make.

## What the donation model means

- **Who is the donor:** theGoodintro is the donor. theGoodintro makes the gift and
  claims the deduction. The **vendor is not the donor** and does not receive a
  charity gift receipt.
- **Vendor's tax position:** the vendor pays for an introduction service. Their
  $1,500 is an ordinary deductible **business expense**, not a tax-deductible
  donation. We must not tell vendors they receive a deductible gift receipt.
- **GST:** the whole $1,500 is consideration for our service, so GST applies to the
  **full $1,500** (not just the net). We register for GST once turnover passes
  $75,000, which we expect to cross, so GST is built into pricing from launch.
- **Income tax:** our donation to a DGR reduces our taxable income. A gift deduction
  cannot create or increase a tax loss, so in a low-profit year part of the
  deduction may need to be spread forward (up to five years by election). Cashflow
  point to watch.
- **Not a fundraiser:** because we never hold the charity's money, we do not trigger
  state-based charitable fundraising registration or trust/escrow obligations on
  that basis.

## What stays true for the brand

- The named gift still reaches the charity **in full**. We fund it from revenue and
  never reduce it to cover our costs.
- The executive chooses the charity, not us.
- The gift is released once the meeting has been held.
- Everything is transparent and auditable.

## Nominated charity shortlist

Executives nominate their charity from this shortlist. All 15 hold DGR endorsement
(confirmed 26 May 2026 via ABN Lookup). Re-check endorsement periodically, as DGR
status can change.

**Rule: we always donate to the national or global entity, never a state-specific
body.** Several of these run separate state organisations (for example RSPCA, St
Vincent de Paul, Guide Dogs), each with its own ABN and receipting. We pay only the
national entity whose ABN is listed below, so every receipt comes from one
consistent payee per charity.

| # | Charity | Entity name | ABN | DGR |
|---|---|---|---|---|
| 1 | Leukaemia Foundation | The Leukaemia Foundation of Australia Limited | 57 057 493 017 | Yes |
| 2 | Royal Flying Doctor Service (national) | Royal Flying Doctor Service of Australia | 74 438 059 643 | Yes |
| 3 | R U OK? | RUOK? Limited | 25 138 676 829 | Yes |
| 4 | headspace | headspace National Youth Mental Health Foundation Ltd | 26 137 533 843 | Yes |
| 5 | Starlight Children's Foundation | Starlight Children's Foundation Australia | 80 931 522 157 | Yes |
| 6 | Ronald McDonald House Charities (national) | Ronald McDonald House Charities Trust | 26 037 589 412 | Yes |
| 7 | St Vincent de Paul Society (national) | National Council of Australia Incorporated | 50 748 098 845 | Yes |
| 8 | Children's Ground | Children's Ground Limited | 74 154 403 086 | Yes |
| 9 | WWF-Australia | World Wide Fund for Nature Australia | 57 001 594 074 | Yes |
| 10 | RSPCA Australia (national) | RSPCA Australia | 99 668 654 249 | Yes |
| 11 | Guide Dogs Australia (national) | Royal Guide Dogs Australia | 99 008 427 423 | Yes |
| 12 | Save the Children Australia | Save the Children Australia | 99 008 610 035 | Yes |
| 13 | World Vision Australia | World Vision Australia | 28 004 778 081 | Yes |
| 14 | Cerebral Palsy Alliance | Cerebral Palsy Alliance | 45 000 062 288 | Yes |
| 15 | Cancer Council Australia | The Cancer Council Australia | 91 130 793 725 | Yes |

## Website copy this decision changes (NOT yet updated)

Do not publish until Issy confirms. These currently describe Model 1 and are now
inaccurate:

1. `app/pricing/page.tsx` FAQ "Is the charity gift tax-deductible to us? Yes. The
   charity issues a tax-deductible receipt directly to you." Under the donation
   model this is wrong. The vendor gets no gift receipt; their fee is a business
   expense. Reword.
2. `copy/vendors.md` pricing section ("the donation is sent to the leader's chosen
   charity", "the admin fee is billed to you, never blended with the gift"). The
   "never blended" pass-through framing implies the gift is the vendor's money to
   the charity. Reword so it reads as theGoodintro funding the gift.
3. The GST disclosure "exclude GST" is fine, but GST now applies to the full fee,
   so any worked examples should reflect GST on $1,500.

## Still to confirm with a tax professional

We can self-serve most of this via the free National Tax Clinic or a small-business
accountant, but get sign-off on:

1. That the donation model is the right call and our donation to DGRs is deductible
   to theGoodintro as described.
2. GST mechanics and registration timing on the full $1,500.
3. The "gift deduction cannot create a loss" rule and how to handle it in early
   low-profit years.
4. Confirmation that funding the gift from revenue does not make us a fundraiser
   needing state charitable-collections registration.
5. Founder tax residency: the founder may be tax resident outside Australia. Confirm
   whether that affects the recommended structure or the place of incorporation.

## Paying a charity (runbook)

The steps for sending one gift, from meeting held to receipt on file. theGoodintro
is the donor.

1. **Meeting is held.** The gift is now owed. The exec already nominated their
   charity from the shortlist.
2. **Confirm the charity is still a DGR** on ABN Lookup, using the listed ABN. This
   is what keeps our donation deductible.
3. **Use the saved payee details.** Pay the national entity whose ABN is listed,
   never a state arm. Verify each charity's donation/EFT details once from an
   official source, save them in the giving register, and reuse them so we are never
   re-routed to a state body at payment time.
4. **Pay by direct bank transfer (EFT).** Cleanest for a business and lowest fees.
   Put "theGoodintro Pty Ltd donation" in the payment reference.
5. **Request the receipt in theGoodintro's name** (theGoodintro Pty Ltd, with our
   ABN). It should show the charity's name and ABN, DGR statement, amount, date,
   and that it is a gift.
6. **File the receipt and record the expense** in MYOB under Donations,
   receipt attached. This is what the accountant uses to claim the deduction.
7. **Send written confirmation** to the exec (and vendor if desired) that $X went to
   their chosen charity.

## Per-meeting checklist

- [ ] Meeting marked sat (outcome captured)
- [ ] Gift amount set per the tier at meeting time
- [ ] Charity DGR status re-checked on ABN Lookup
- [ ] Donation paid to the listed national entity (EFT)
- [ ] Receipt received in theGoodintro Pty Ltd's name and filed
- [ ] Donation recorded in accounting software
- [ ] Confirmation sent to the exec

## Tracking and payout runs

We do not pay per meeting by hand at scale. The admin portal's **Giving (donations
and payout runs)** module aggregates all unpaid gifts **by charity** for a chosen
week or month, so the per-charity total to donate is generated for us. See the
Giving module in [ADMIN_PORTAL_BRIEF.md](ADMIN_PORTAL_BRIEF.md). The runbook above
is the manual fallback and the per-gift detail behind each payout line.
