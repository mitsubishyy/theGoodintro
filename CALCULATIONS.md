# theGoodintro — Calculations (financial source of truth)

This is the authoritative spec for every money figure and count on the platform.
Each calculation is given three ways: a plain-language definition, a formula, and a
worked example with the full arithmetic shown, so any number can be checked by hand.
Section 4 lists the cross-checks that must always tie out (if one fails, there is a
bug). Section 5 fences off the few items only an accountant should finalise.

House rule: no em or en dashes in prose. All money is AUD.

Related docs: tier math also summarised in [ADMIN_PORTAL_BRIEF.md](ADMIN_PORTAL_BRIEF.md);
charity-flow model and open tax questions in [CHARITY_FLOW.md](CHARITY_FLOW.md).

---

## 0. Foundations (read this first)

### 0.1 The fixed numbers

| Item | Value | Note |
|---|---|---|
| Meeting fee (excl GST) | $1,500 | The pricing page shows prices "exclude GST" |
| GST per meeting | $150 | 10% of $1,500 |
| Total invoiced per meeting (incl GST) | $1,650 | $1,500 fee + $150 GST |

The GST ($150) is never theGoodintro's money. It is collected on behalf of the ATO
and paid to them. Revenue and profit are always worked out on the **ex-GST** figure
of $1,500.

The fee is **always $1,500 ex GST**, with no discounted, comped, or free meetings, so
$1,500 is a fixed constant everywhere below. Unused credits are **never refunded**
(they carry forever, see 2.11), so there is no refund path in any figure here.

### 0.2 The charity bands (the "tier")

The share of the $1,500 fee that is donated to charity rises as a vendor holds more
meetings within their cycle (defined in 0.4). The rest is what theGoodintro keeps.

| Band | Meeting number in the cycle | Donated to charity | theGoodintro keeps (excl GST) |
|---|---|---|---|
| 1 | 1 to 5 | $900 | $600 |
| 2 | 6 to 10 | $1,000 | $500 |
| 3 | 11 to 15 | $1,100 | $400 |
| 4 | 16 and above | $1,200 | $300 |

Two helper definitions used throughout:

```
band(n)   = $900    if n is 1 to 5
            $1,000  if n is 6 to 10
            $1,100  if n is 11 to 15
            $1,200  if n is 16 or more

keep(n)   = $1,500 - band(n)
          = $600 / $500 / $400 / $300 for bands 1 / 2 / 3 / 4
```

`n` is the meeting's position number within the vendor's current cycle (see 0.4).

### 0.3 The golden rule: amounts lock when a meeting is SAT

A meeting produces a charity gift only when it is actually held ("sat"). At that exact
moment:

1. `n` is set to the vendor's running count of held meetings in the current cycle.
2. `gift = band(n)` is calculated and **frozen** onto the gift record.
3. The gift record is created with status **Released** (owed to the charity).

Nothing that happens afterwards changes a frozen `gift`. Every total in this document
is a sum of frozen gift amounts. Numbers shown **before** a meeting is sat (for
example in the executive's request email) are **projections**, never stored as final.
See 2.10.

### 0.4 Two time axes that must never be confused

There are two completely separate 12-month clocks, plus the calendar:

- **Vendor band cycle.** A rolling 12 months that starts on the vendor's **first
  payment** and renews every 12 months from that same date. This decides the
  **charity band** only. Each vendor has their own. See 2.7 and 2.11.
- **Financial year (FY).** Australia's tax year, **1 July to 30 June**. This decides
  the periods for **revenue, GST, and donation reporting**. See 2.3, 2.12, 2.13, 2.14.
- **Calendar week or month.** Used for the **charity payout runs** (2.1).

A single gift can sit in, say, a vendor's cycle 2 (so it is priced at band 1) while
also falling in FY2026 for tax reporting and in the month of May for the payout run.
These are independent. Do not use the vendor cycle for tax reporting, and do not use
the FY for the band.

### 0.5 The data each calculation reads

Minimal records the platform must store. Everything below is computed from these.

**Credit purchase** (money coming in):
`vendor_id, purchase_date, quantity, fee_ex_gst_per_unit ($1,500), gst_per_unit ($150)`

**Meeting / gift record** (the canonical unit, one per meeting):
`meeting_id, vendor_id, executive_id, charity_id, status, sat_date,
 cycle_number, position_n, gift_locked, gift_status, paid_date, receipt_ref`

**Charity:** `charity_id, legal_entity_name, abn, dgr_confirmed_date, payee_details`

**Meeting status values** (one at a time):

| Status | Meaning | Consumes a credit? | Increments band count? | Creates a gift? |
|---|---|---|---|---|
| Pending | Requested, awaiting the executive | No | No | No |
| Scheduled | Accepted and booked, not yet held | No | No | No |
| Sat | Held | Yes | Yes | Yes (Released) |
| Cancelled | Called off before being held | No | No | No |
| NoShow | Booked but nobody held it | No | No | No |

**Gift status values** (only exist once a meeting is Sat):

| Gift status | Meaning | Counts toward |
|---|---|---|
| Released | Owed to the charity, not yet transferred | "How much I need to donate" (2.1) |
| Paid | Transferred, receipt on file | "How much I have already donated" (2.2) |

### 0.6 Robustness rules (so the numbers cannot silently drift)

- **Whole dollars, no rounding.** Every fee, band, gift, keep, and GST figure is a
  whole dollar (GST is exactly $150). No calculation produces fractions, so there is
  never a rounding difference to chase.
- **Cycle boundaries are half-open.** A cycle runs from its start date up to, but not
  including, the same date 12 months later. A meeting sat exactly on the renewal date
  belongs to the **new** cycle. "12 months later" uses the same day of the month; if
  that day does not exist (29 Feb, or the 31st in a short month), use the last day of
  that month.
- **Pricing is versioned.** If the $1,500 fee or the band amounts ever change, the new
  schedule applies only from its effective date forward. Every gift already locked
  keeps the schedule it was priced under (store a `schedule_version` on the gift record
  next to the frozen amount), so history never moves.

---

## 1. The engine: a vendor's band and the gift on a meeting

**Plain words.** Count how many meetings a vendor has held in their current cycle.
The next meeting they hold is priced at the band that its position falls into. That
amount is donated to whatever charity the executive chose for that meeting.

**Formula.** When a meeting is marked Sat for vendor V:

```
n    = (number of meetings already Sat for V in the current cycle) + 1
gift = band(n)
keep = 1500 - gift
```

**Worked example.** Vendor V holds their 6th meeting of the cycle.

```
n    = 6
gift = band(6) = $1,000        (band 2, because 6 is in the range 6 to 10)
keep = 1500 - 1000 = $500
```

So $1,000 is donated to the executive's chosen charity and theGoodintro keeps $500
(plus it collected $150 GST to remit).

**A vendor's whole cycle, proven.** If a vendor holds all 16 meetings inside one
cycle, the charity totals build up like this:

```
Meetings 1 to 5:    5 x $900   = $4,500
Meetings 6 to 10:   5 x $1,000 = $5,000   (running total $9,500)
Meetings 11 to 15:  5 x $1,100 = $5,500   (running total $15,000)
Meeting 16:         1 x $1,200 = $1,200   (running total $16,200)
```

Total donated across 16 meetings in one cycle = **$16,200**. This matches the annual
figure on the pricing page, which is the check that the band logic is correct.

---

## 2. The fourteen numbers that must be solid from day 1

Every total below is a sum of **frozen** gift amounts (or simple counts), filtered by
who/what/when. Because each gift record carries its vendor, executive, charity,
status, dates, and frozen amount, every figure is just a filter-and-add.

### 2.1 How much I need to donate to each charity (this week or month)

**Plain words.** For each charity, add up the gifts that are owed but not yet paid.

**Formula.** For each charity C:

```
ToDonate(C) = sum of gift_locked
              for all gift records where charity_id = C
              and gift_status = Released   (i.e. not yet Paid)
```

Run the payout, transfer that amount, mark those gifts **Paid**, attach the receipt.
The period (week or month) just decides how often you run it; the figure itself is
always "all Released gifts not yet paid".

**Worked example.** Unpaid (Released) gifts right now:

| Gift | Charity | Amount |
|---|---|---|
| 1 | Cancer Council | $1,000 |
| 2 | Cancer Council | $900 |
| 3 | RFDS | $900 |

```
ToDonate(Cancer Council) = 1000 + 900 = $1,900
ToDonate(RFDS)           = 900         = $900
Total to transfer this run = 1900 + 900 = $2,800
```

### 2.2 How much I have ALREADY donated to each charity

**Plain words.** For each charity, add up every gift that has been paid.

**Formula.** For each charity C:

```
Donated(C) = sum of gift_locked
             for all gift records where charity_id = C
             and gift_status = Paid
```

This equals the sum of the receipts on file for that charity, and is the charity's
all-time received total. Add a date filter (for example `paid_date in this FY`) to get
a period figure.

**Worked example.** Cancer Council has 6 Paid gifts totalling $5,000, then the payout
in 2.1 pays its two Released gifts ($1,900). After the run:

```
Donated(Cancer Council) = 5000 + 1900 = $6,900
```

### 2.3 YTD revenue

**Plain words.** The fee income earned so far this financial year, before GST and
before the charity donation is taken out. "Earned" means a meeting was actually held.

**Formula.** Revenue is recognised when a meeting is **Sat** (the service is
delivered), on the ex-GST fee:

```
GrossRevenue(period) = $1,500 x (number of meetings Sat with sat_date in the period)
```

"YTD" for an Australian business means the current financial year to date, so the
period is **1 July to today**. (A calendar-year-to-date version just changes the start
date to 1 January.)

This is **gross** revenue (it still includes the part that will be donated). The
charity is subtracted in 2.14, which is the "revenue excluding charity" figure.

**Worked example.** 30 meetings have been Sat since 1 July.

```
GrossRevenue(FYTD) = 1500 x 30 = $45,000  (ex GST)
```

**Important distinction (cash vs earned).** Vendors pay upfront for credits, so cash
can arrive before meetings are held. "Revenue" above is **earned** revenue (counted at
the meeting). **Cash collected** is a separate figure (counted at purchase):

```
CashCollected(period) = $1,500 x (credits purchased in the period)   (ex GST)
```

Unused prepaid credits are cash you hold but have not yet earned. Which basis the tax
return uses (cash or accrual) is an accountant decision, see Section 5.

### 2.4 How much each vendor has contributed to charity (lump sum only)

**Plain words.** For one vendor, add up every gift their meetings funded. Do not break
it down by charity (the vendor does not choose the charity, so the breakdown is not
theirs to see).

**Formula.** For each vendor V:

```
VendorCharity(V) = sum of gift_locked
                   for all gift records where vendor_id = V
                   and status = Sat        (Released or Paid)
```

Add a date filter for a period figure; leave it off for all-time.

**Worked example.** Vendor V has held 7 meetings this cycle, all sat:

```
Meetings 1 to 5: 5 x $900   = $4,500
Meetings 6 to 7: 2 x $1,000 = $2,000
VendorCharity(V) = 4500 + 2000 = $6,500
```

### 2.5 How much each executive has chosen to donate to each charity (breakdown AND lump sum)

**Plain words.** The executive picks the charity for each meeting they take. So for one
executive, show both the total per charity and the grand total. The money is funded by
the vendor's band, but the executive directed where it went.

**Formula.** For each executive E:

```
Per charity:  ExecToCharity(E, C) = sum of gift_locked
                                    for gift records where executive_id = E
                                    and charity_id = C and status = Sat

Lump sum:     ExecTotal(E)        = sum of gift_locked
                                    for gift records where executive_id = E
                                    and status = Sat
                                  = sum over all C of ExecToCharity(E, C)
```

**Worked example.** Executive E took 3 meetings: two she pointed at Cancer Council
(gifts $1,000 and $900) and one at RFDS (gift $1,000).

```
ExecToCharity(E, Cancer Council) = 1000 + 900 = $1,900
ExecToCharity(E, RFDS)           = 1000        = $1,000
ExecTotal(E)                     = 1900 + 1000 = $2,900
```

### 2.6 How many meetings have been SAT

**Plain words.** A simple count of held meetings.

**Formula.**

```
MeetingsSat(filter) = count of gift records where status = Sat
```

Filter by period, vendor, executive, or charity, or leave it off for all-time. No-shows
and cancellations are never counted (they are not Sat).

**Worked example.** All-time Sat = 30. This month Sat = 7. Vendor V all-time Sat = 7.

### 2.7 The yearly cycle and charity band per vendor

**Plain words.** Each vendor is on their own 12-month clock that starts at their first
payment. The band they are "on" right now is the band their next held meeting would
fall into.

**Formula.**

```
cycle_start(V, 1) = V's first payment date
cycle k runs from  cycle_start + (k-1) x 12 months  to  cycle_start + k x 12 months
current cycle      = the cycle that today's date falls into
held_in_cycle(V)   = number of meetings Sat for V inside the current cycle
current_band(V)    = band( held_in_cycle(V) + 1 )
```

At each cycle renewal, `held_in_cycle` resets to 0, so `current_band` drops back to
band 1 ($900). Later purchases never move the cycle start (see 2.11).

**Worked example.** Vendor V first paid on 10 March 2026.

```
Cycle 1: 10 Mar 2026 to 10 Mar 2027
Cycle 2: 10 Mar 2027 to 10 Mar 2028
```

If today is 1 Sep 2026 (inside cycle 1) and V has sat 7 meetings this cycle:

```
held_in_cycle(V) = 7
current_band(V)  = band(7 + 1) = band(8) = $1,000   (band 2)
```

So V's next meeting will donate $1,000.

### 2.8 Pending meeting requests

**Plain words.** Requests waiting on the executive to respond.

**Formula.**

```
Pending(filter) = count or list of meetings where status = Pending
```

These create no gift and touch no money. (Accepted-but-not-yet-held meetings have
status Scheduled, which is a separate count.)

### 2.9 Cancelled meeting requests (status synced everywhere)

**Plain words.** When a request is cancelled, it is marked Cancelled and that one
record drives every screen: the vendor's list, the executive's view, and the admin
portal all read the same status. There is no separate copy to fall out of sync.

**Rules.** A cancellation:

```
- sets status = Cancelled on the single meeting record
- does NOT consume a credit (the credit returns to the vendor's balance)
- does NOT increment the band count
- does NOT create a gift
```

So a cancelled meeting has zero effect on every money figure in this document. The
only change is the status, shown identically on all three surfaces.

### 2.10 The amount shown in the executive's email (projected)

**Plain words.** Before a meeting happens there is no frozen amount yet, so the
request email shows an estimate based on the requesting vendor's current band.

**Formula.** For a request from vendor V:

```
projected = current_band(V) = band( held_in_cycle(V) + 1 )
```

Show it as "approximately $X to [chosen charity]". It depends on the **requesting
vendor's** band, not the executive. It can change before the meeting is sat if other
meetings of that vendor are sat first (a higher band) or the vendor's cycle renews (back
to $900). The frozen amount is set when the meeting is actually sat (0.3, Section 1).

**Worked example.** Vendor V has sat 5 meetings this cycle and sends a new request.

```
projected = band(5 + 1) = band(6) = $1,000
Email reads: "If you accept, approximately $1,000 goes to [your chosen charity]."
```

### 2.11 Carry-over credits after the 12-month cycle

**Plain words.** A credit is one prepaid meeting. Unused credits are never lost and
never expire. They carry into the next cycle, where they are priced from band 1 again
because the band count resets.

**Formula.**

```
CreditsRemaining(V) = (total credits ever purchased by V) - (meetings Sat by V)
```

Cancelled and no-show meetings do not subtract from this (they never consumed a
credit). At a cycle renewal, `CreditsRemaining` simply carries forward; the next
meeting Sat is position 1 of the new cycle, so it is band 1 ($900).

**Later purchases never re-anchor the cycle.** The 12-month clock always runs from the
first-ever payment. Example: a vendor buys 6 credits, then 6 more six months later; all
12 sit in the same cycle (the one anchored at the first purchase), and the band keeps
building as meetings are held.

**Worked example (the carry-over case).** A new vendor buys 16 credits and pays
$24,000 ex GST upfront ($1,500 x 16). GST of $2,400 is added, so the cash invoice is
$26,400, of which $2,400 is held for the ATO. In cycle 1 they hold only 10 meetings:

```
Cycle 1 meetings 1 to 5:   5 x $900   = $4,500
Cycle 1 meetings 6 to 10:  5 x $1,000 = $5,000
Cycle 1 donated:                        $9,500
CreditsRemaining = 16 - 10 = 6 credits carry into cycle 2
```

In cycle 2 the count resets, so those 6 carried credits are priced from band 1:

```
Cycle 2 meetings 1 to 5:   5 x $900   = $4,500
Cycle 2 meeting 6:         1 x $1,000 = $1,000
Cycle 2 donated:                        $5,500
```

Across both cycles the 16 credits donate $9,500 + $5,500 = **$15,000**. That is $1,200
less than the $16,200 they would have donated had all 16 been held inside one cycle.
This is intended: holding meetings within a cycle builds the band higher.

### 2.12 GST charged (reportable)

**Plain words.** 10% added on top of every meeting fee, collected for the ATO and paid
to them. It is not income.

**Formula.** GST is triggered when a vendor is invoiced for credits (the sale), so it
is reported on credits sold:

```
GSTCollected(period) = $150 x (credits sold in the period)
                     = 10% x (ex-GST fees invoiced in the period)
```

**Worked example.** A vendor buys 16 credits.

```
GSTCollected = 150 x 16 = $2,400   (added to the $24,000 fee, invoice = $26,400)
```

Whether GST is reported on a cash or accrual basis, and the exact tax point, is an
accountant decision (Section 5). The platform stores the GST per purchase so either
basis can be produced.

### 2.13 Charity donated (reportable)

**Plain words.** The total gifted to charities in a period, for the donation record and
the company's tax deduction.

**Formula.**

```
CharityDonated(period) = sum of gift_locked
                         for gift records that are Paid with paid_date in the period
```

Use `paid_date` for "money actually gone out" (matches the receipts and the deduction).
A committed-but-not-yet-paid version uses `sat_date` and `status in (Released, Paid)`;
keep the two clearly labelled.

**Worked example.** In FY2026, gifts marked Paid total $40,000.

```
CharityDonated(FY2026) = $40,000   (supported by $40,000 of DGR receipts on file)
```

### 2.14 Revenue / profit per FY, excluding the charity donation (for tax)

**Plain words.** The part of the fee income theGoodintro keeps after the charity gift
is taken out. This is the "revenue, not counting charity" figure you asked for.

**Formula.** Over a financial year (1 July to 30 June):

```
A = GrossRevenue(FY)   = $1,500 x meetings Sat in the FY      (ex GST, see 2.3)
B = CharityDonated(FY) = sum of gifts for those meetings       (see 2.13)
C = NetRevenue(FY)     = A - B                                 (revenue excluding charity)
```

Equivalently, C is just the sum of the `keep` amounts:

```
C = NetRevenue(FY) = sum of keep(n) over every meeting Sat in the FY
                   = sum of ($600 / $500 / $400 / $300) per meeting by its band
```

**Worked example.** In a FY there were 30 meetings: 20 at band 1, 7 at band 2, 3 at
band 3.

```
A (gross) = 1500 x 30                              = $45,000
B (charity) = 20 x $900 + 7 x $1,000 + 3 x $1,100
            = 18,000 + 7,000 + 3,300              = $28,300
C (net, excl charity) = 45,000 - 28,300           = $16,700

Check via keep: 20 x $600 + 7 x $500 + 3 x $400
            = 12,000 + 3,500 + 1,200              = $16,700   (matches C)
```

**How this maps to the tax return (important, and the accountant's job).** On the
return, the accountant reports the **gross** fee income (A) as assessable income and
the **donations** (B) as a deduction, plus your other operating costs. The net effect
on the income you are taxed on is A minus B minus other costs. So:

- **C (A minus B)** is your earnings from meetings before other running costs. This is
  the "revenue excluding charity" number.
- **True profit** is C minus your other operating expenses (software, contractors,
  etc.), which the platform does not track. The accountant produces profit.
- GST (2.12) sits entirely outside A, B, and C.

Do not report C alone as "income" without the gross-plus-deduction treatment; the
final tax figures come from the accountant using A, B, GST, and your costs. See
Section 5 and [CHARITY_FLOW.md](CHARITY_FLOW.md).

### 2.15 Deferred revenue (cash held for meetings not yet delivered)

**Plain words.** Vendors pay upfront, so you hold cash for credits that have not been
used. That money is **not revenue and not profit yet**: it is held against meetings
still owed. It is never refunded (credits carry forever), but it is not earned until
the meeting happens. Tracking this stops you mistaking prepaid cash for profit.

**Formula.**

```
DeferredRevenue = (total credits purchased, all vendors - total meetings Sat) x $1,500
                = CreditsRemaining(all vendors) x $1,500      (ex GST)
```

**Worked example.** 40 credits sold across all vendors, 30 meetings Sat:

```
CreditsRemaining = 40 - 30 = 10
DeferredRevenue  = 10 x 1500 = $15,000   held against undelivered meetings
```

That $15,000 is cash in the bank but not yet earned. The GST on those 40 credits was
already collected at purchase and is tracked separately (2.12).

### 2.16 Total charity owed right now (a liability)

**Plain words.** Across every charity, the total you have committed to donate but have
not yet paid. This is real money you owe, so it should always be visible.

**Formula.**

```
CharityOwed = sum of gift_locked for all gift records where gift_status = Released
            = sum over charities of ToDonate(C)        (from 2.1)
```

**Worked example.** If Released (unpaid) gifts total $3,300 across all charities:

```
CharityOwed = $3,300
```

Paying them moves that $3,300 from CharityOwed (2.16) into Donated (2.2).

### 2.17 Per-vendor amount paid (lifetime value) and credit balance

**Plain words.** How much each vendor has actually paid you, and how many meetings they
have left to use. (Section 2.4 is what they donated; this is what they paid.)

**Formula.** For each vendor V:

```
VendorPaid(V)       = (total credits purchased by V) x $1,500     (ex-GST fees)
VendorGSTPaid(V)    = (total credits purchased by V) x $150
CreditsRemaining(V) = (total credits purchased by V) - (meetings Sat by V)
```

**Worked example.** Vendor V bought 16 credits and has Sat 7 meetings:

```
VendorPaid(V)       = 16 x 1500 = $24,000   (plus $2,400 GST)
CreditsRemaining(V) = 16 - 7    = 9 credits left
```

Compare with VendorCharity(V) in 2.4 ($6,500), which is what those 7 meetings donated.

### 2.18 Operating expenses, net GST, and operating profit (the P&L)

**Plain words.** Your running costs (software, ads, contractors, your own pay), so the
portal can show real profit, and so GST nets off correctly.

**Data.** Each expense record holds:
`date, category, payee, amount_ex_gst, gst_input_credit, total_inc_gst, financial_year`.

**Net GST (for the BAS).** The GST you collected on sales, minus the GST you paid on
your own purchases (input credits):

```
GSTInputCredits(period) = sum of gst_input_credit for expenses in the period
NetGST(period)          = GSTCollected(period) - GSTInputCredits(period)
```

Positive net GST is payable to the ATO. The platform also tracks GST already remitted,
so "GST currently owed" = (net GST to date) - (GST already remitted).

**Operating profit (per financial year).**

```
OperatingProfit(FY) = GrossRevenue(FY)        (2.3, ex GST, earned)
                    - CharityDonated(FY)      (2.13)
                    - OperatingExpenses(FY)   (sum of amount_ex_gst for expenses in FY)
```

**Worked example.** A FY with gross revenue $45,000, charity $28,300, and operating
expenses $9,000 (ex GST):

```
OperatingProfit = 45,000 - 28,300 - 9,000 = $7,700   (pre-tax)
```

This is the figure closest to "what the business actually made". The final taxable
income still goes through the accountant (Section 5), but it is built from exactly
these numbers. Whether each expense is deductible and its GST claimable is an
accountant matter; the platform stores the gross and GST parts so either treatment can
be produced.

---

## 3. One master example, every number at once

A single calendar month. Three vendors, three executives, two charities. All seven
meetings below are Sat this month and their gifts are still Released (unpaid) unless
stated.

**Vendor cycle positions going into the month:** Vendor A has already sat 5 this cycle;
Vendor B is brand new (0 sat); Vendor C is in cycle 2 with 0 sat in cycle 2.

| # | Vendor | This is their cycle meeting | n | Band | gift | keep | Executive | Charity |
|---|---|---|---|---|---|---|---|---|
| 1 | A | 6th | 6 | 2 | $1,000 | $500 | X | Cancer Council |
| 2 | A | 7th | 7 | 2 | $1,000 | $500 | X | RFDS |
| 3 | B | 1st | 1 | 1 | $900 | $600 | Y | Cancer Council |
| 4 | B | 2nd | 2 | 1 | $900 | $600 | Y | Cancer Council |
| 5 | B | 3rd | 3 | 1 | $900 | $600 | Z | RFDS |
| 6 | C | 1st of cycle 2 | 1 | 1 | $900 | $600 | X | RFDS |
| 7 | C | 2nd of cycle 2 | 2 | 1 | $900 | $600 | Y | Cancer Council |

Total gifts = 1000 + 1000 + 900 + 900 + 900 + 900 + 900 = **$6,500**.
Total keep = 500 + 500 + 600 + 600 + 600 + 600 + 600 = **$4,000**.

**2.1 To donate, per charity (all Released):**

```
Cancer Council = 1000 (#1) + 900 (#3) + 900 (#4) + 900 (#7) = $3,700
RFDS           = 1000 (#2) + 900 (#5) + 900 (#6)            = $2,800
Total to transfer = 3700 + 2800 = $6,500
```

**2.4 Per vendor (lump sum):**

```
Vendor A = 1000 + 1000        = $2,000
Vendor B = 900 + 900 + 900    = $2,700
Vendor C = 900 + 900          = $1,800
Sum = 2000 + 2700 + 1800      = $6,500
```

**2.5 Per executive (breakdown and lump sum):**

```
Exec X:  Cancer Council 1000 | RFDS 1000 + 900 = 1900 | total = $2,900
Exec Y:  Cancer Council 900 + 900 + 900 = 2700        | total = $2,700
Exec Z:  RFDS 900                                      | total = $900
Sum of exec totals = 2900 + 2700 + 900 = $6,500
```

**2.3 / 2.14 Revenue this month:**

```
A gross  = 1500 x 7            = $10,500  (ex GST)
B charity                      = $6,500
C net (excl charity) = 10,500 - 6,500 = $4,000   (matches Total keep above)
GST collected (if all 7 invoiced this month) = 150 x 7 = $1,050  (held for ATO)
```

**2.6 / 2.7 Counts and bands after the month:**

```
MeetingsSat this month = 7
Vendor A current_band = band(7+1) = band 2 ($1,000)
Vendor B current_band = band(3+1) = band 1 ($900)
Vendor C current_band = band(2+1) = band 1 ($900)
```

---

## 4. Reconciliation invariants (the proofs that it is correct)

These must hold at all times. Each is a one-line check; if any is ever false, a number
is wrong and must not be trusted.

1. **Every gift is counted once, three ways.** Because each Sat meeting has exactly one
   vendor, one executive, and one charity:

   ```
   sum over charities of (all gifts to that charity)
     = sum over vendors of VendorCharity(V)
     = sum over executives of ExecTotal(E)
     = total gifts (all Sat meetings)
   ```

   In the master example all four equal **$6,500**.

2. **An executive's per-charity figures add to their lump sum.**

   ```
   ExecTotal(E) = sum over C of ExecToCharity(E, C)
   ```

   Example: Exec X, 1000 + 1900 = $2,900.

3. **Revenue splits exactly into keep plus charity.**

   ```
   GrossRevenue(period) = NetRevenue(period) + CharityDonated-committed(period)
   1500 x meetings      = sum keep(n)        + sum band(n)
   ```

   Example: 10,500 = 4,000 + 6,500.

4. **To donate plus already donated equals all gifts ever.**

   ```
   sum of Released gifts + sum of Paid gifts = sum of all gift_locked (all Sat meetings)
   ```

5. **A vendor's cycle total matches the band schedule.** A vendor who has sat `m`
   meetings in a cycle has donated exactly the cumulative band total for `m` (the build
   up in Section 1). 16-in-one-cycle must equal $16,200.

6. **Credits balance.** `credits purchased - meetings Sat = CreditsRemaining`, and
   CreditsRemaining is never negative (a vendor cannot sit more meetings than credits).

7. **Cancellations and no-shows move nothing.** Total gifts, revenue, GST, and credit
   consumption are identical before and after a cancellation or no-show.

8. **GST is exactly 10% of ex-GST fees invoiced**, and is never part of A, B, or C.

9. **Every vendor dollar is accounted for (the master identity).** All ex-GST fee cash
   received splits into exactly these four buckets, with nothing left over:

   ```
   ex-GST fees collected      = donated + owed + retained + deferred
   (total credits x $1,500)   = (Paid gifts) + (Released gifts)
                                + (keep on delivered meetings) + (unused credits x $1,500)
   ```

   Worked, using 40 credits sold and the 30-meeting FY example above:

   ```
   40 x $1,500 = $60,000
   $60,000 = $25,000 donated + $3,300 owed + $16,700 retained + $15,000 deferred
   check: 25,000 + 3,300 + 16,700 + 15,000 = $60,000   (balances)
   (donated + owed = 25,000 + 3,300 = $28,300 = total charity, matching 2.14)
   ```

   If this identity does not balance to the dollar, a number is wrong.

10. **GST is fully tracked.** `GST collected = GST remitted to ATO + GST currently
    owed`, and net GST for a period = GST collected minus input credits on expenses
    (2.18). GST never appears inside revenue, charity, or profit.

---

## 5. What only the accountant should finalise (do not guess)

The platform computes all the figures above exactly. The following are tax-treatment
choices that an accountant confirms; the platform stores enough to support whichever
answer they give. These are the open items in [CHARITY_FLOW.md](CHARITY_FLOW.md).

- **Cash vs accrual basis**, which sets whether revenue and GST are recognised at
  credit purchase or at meeting delivery. The platform keeps both (CashCollected and
  earned GrossRevenue; GST per purchase).
- **The GST tax point** on prepaid credits.
- **When a donation deduction is claimed** (when paid vs when committed), which decides
  whether 2.13 should use `paid_date` or `sat_date` for the tax figure.
- **That the donation to a DGR is deductible to theGoodintro** as described in the
  donation model, and that funding the gift from revenue does not make theGoodintro a
  fundraiser.
- **Breakage on credits that are never used.** Credits carry forever and are never
  refunded, so some deferred revenue (2.15) may sit indefinitely. If and when unused
  credits should be recognised as income ("breakage") is an accountant call.
- **GST input credits and expense deductibility.** Which expenses are deductible, and
  which carry claimable GST input credits (2.18), is confirmed by the accountant; the
  platform just records the gross and GST split for each expense.

Until those are confirmed, treat the revenue, GST, and profit figures as
**operational** numbers that the accountant converts into the official return.
Everything in Sections 1 to 4 and 6 is exact and not subject to those questions.

---

## 6. Reports and CSV exports

Every figure in this document exports to CSV with a date-range filter (and, where it
makes sense, a vendor / executive / charity filter). There are two layers: the raw
ledgers that hold every dollar, and the summary reports built from them.

### 6.1 The raw ledgers (the atomic backup; everything else derives from these)

- **Gift ledger**, one row per Sat meeting:
  `meeting_id, sat_date, vendor, executive, charity, charity_abn, cycle_number,
   position_n, band, gift_amount, keep_amount, gift_status, paid_date, receipt_ref,
   schedule_version`.
- **Purchase ledger**, one row per credit purchase:
  `purchase_id, purchase_date, vendor, quantity, fee_ex_gst, gst, total_inc_gst`.
- **Expense ledger**, one row per expense:
  `expense_id, date, category, payee, amount_ex_gst, gst_input_credit, total_inc_gst,
   financial_year`.

These three ledgers contain every dollar that moves. Any report below can be rebuilt
from them, and an accountant can reconstruct the books from these alone. Export them
whole and unfiltered as the master backup.

### 6.2 The summary reports (each a CSV, each with a date-range filter)

| Report | One row per | Key money columns |
|---|---|---|
| Charity payout (to donate now) | charity | gifts owed, total to donate, payee and ABN |
| Charity donated to date | charity | gifts paid, total donated |
| Charity owed (liability) | charity, plus a grand total | amount owed |
| Per-vendor charity | vendor | total donated (lump sum) |
| Per-executive charity | executive x charity, plus a lump-sum row | amount |
| Meetings | meeting | gift, keep, status (filter by Sat / Pending / Cancelled) |
| Vendor cycle and band | vendor | cycle start, current cycle, held this cycle, current band, credits remaining |
| Vendor financials | vendor | total paid, GST paid, credits remaining, deferred value, charity contributed |
| Revenue / P&L | period | gross revenue, charity, net (excl charity), expenses, operating profit |
| GST / BAS | period | GST collected, input credits, net GST, remitted, owed |
| Deferred revenue | grand total, plus per vendor | unused credits, value |
| Pending and cancelled | request | status, vendor, executive, dates |

### 6.3 Rules every export follows

- **Each report states which date it filters on** (sat_date for meetings and revenue,
  paid_date for donations paid, purchase_date for GST and cash, expense date for
  costs), so the same record never double-counts across periods.
- Every CSV carries a **header row, the filter that was applied, and a generated-at
  timestamp**.
- A **totals row** at the bottom wherever money is summed.
- Amounts in **whole dollars**; ex-GST and GST shown in **separate columns** wherever
  both apply, so GST is never mixed into a revenue or profit figure.
