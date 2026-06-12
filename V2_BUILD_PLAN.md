# TheGoodIntro Platform V2 Build Plan (the entry point for the build)

This is the master plan for building the platform properly. It consolidates the
findings from a full audit of the v1 build and tells the next builder exactly what
to do, in what order, with a verification gate after every step. Read this first.

**Why v1 came out poor (root causes, not excuses):**
1. The layout of the individual portal modules was never specified, so they
   defaulted to "metrics ribbon + one table." Fixed by [`PORTAL_LAYOUT_BLUEPRINT.md`](PORTAL_LAYOUT_BLUEPRINT.md).
2. The brand and pricing facts were scattered and stale across ~88 files, so copy
   shipped wrong. Fixed by [`FACTS.md`](FACTS.md) + `npm run check:copy`.
3. The money/state/reports logic had real gaps (no cycle reset, calendar-year not
   FY, no GST/deferred/P&L, missing reversal/auto-cancel/void flows, 0 of 12
   reports, no CSV). This plan closes them.

**The non-negotiable rule for this build:** quality over speed, and nothing is
"done" until its verification gate passes (section 8). Do not ship a smaller
version of what is specced. When a business decision is genuinely open (section 7
lists them), ask Issy a recommendation-first question; do not guess.

## 0. Read order and the source-of-truth map

| Concern | Source of truth (obey it) |
|---|---|
| Brand spelling, pricing facts | [`FACTS.md`](FACTS.md) (wins over any conflicting text) |
| The money maths (every figure + 10 invariants) | [`CALCULATIONS.md`](CALCULATIONS.md) |
| State transitions + side effects | [`STATE_MACHINES.md`](STATE_MACHINES.md) |
| Fields, money rules, snapshots | [`DATA_MODEL.md`](DATA_MODEL.md) |
| Signed exec email links | [`EMAIL_ACTIONS.md`](EMAIL_ACTIONS.md) |
| Notification copy | [`NOTIFICATION_TEMPLATES.md`](NOTIFICATION_TEMPLATES.md) |
| Screen layout (every module) | [`PORTAL_LAYOUT_BLUEPRINT.md`](PORTAL_LAYOUT_BLUEPRINT.md) |
| v1 scope cut | [`MVP_SCOPE.md`](MVP_SCOPE.md) |
| Workflows per portal | the three `*_PORTAL_BRIEF.md` |
| Change safety | [`CHANGE_SAFETY.md`](CHANGE_SAFETY.md) + `apps/platform/CLAUDE.md` |
| Production readiness (run-in-prod build + launch checklist) | [`PRODUCTION_READINESS.md`](PRODUCTION_READINESS.md) |
| Cold-start gaps, decisions, required artifacts (clear these or you will guess) | [`COLD_START_GAPS.md`](COLD_START_GAPS.md) |
| Tags feature (admin-only; schema + staff-only RLS + admin UI) | [`TAGS_FEATURE.md`](TAGS_FEATURE.md) |
| Visual references | [`inspiration/hr-partner/`](inspiration/hr-partner/) |

The HR Partner screenshots are the layout reference; the exec mockup at
`apps/web/app/mockup/` is the exec surface reference.

## 1. Already DONE and verified in the planning chat (do NOT redo)

These are committed and proven. Build on them; do not re-litigate them.

- **`FACTS.md`** + **`scripts/check-copy.js`** (`npm run check:copy`): brand =
  TheGoodIntro, pricing only from the pricing page / CALCULATIONS.md. Enforced on
  `apps/platform`, report-only on `apps/web`. Platform brand already fixed (36
  instances), vendor dashboard fee wired to `MEETING_FEE_AUD`.
- **`PORTAL_LAYOUT_BLUEPRINT.md`**: the locked layout register (HR Partner density
  on `--portal-*` tokens), one shared shell, 7 templates, every module specified.
- **`packages/pricing` hardened and tested (59 tests passing):** the band engine
  was already correct; this chat added the missing pure figures and proved them:
  - `GST_AUD` / `GST_CENTS`, `gstCentsForCredits` (2.12)
  - `keepCentsForMeetingNumber`, `cumulativeKeepCents` (net revenue, 2.14)
  - `cumulativeCharityCentsAcrossCycles` (cycle reset, 2.11 / invariant 5: proves
    16-in-one-cycle = $16,200 vs split [10,6] = $15,000)
  - `deferredRevenueCents` (2.15; throws instead of clamping, enforcing invariant 6)
  - `financialYearBounds` (the FY helper that fixes the calendar-year bug at source)
  - `reconcileFees` (invariant 9, the master identity)
  - **`packages/pricing/src/reporting.ts`**: pure aggregators for every section-2
    figure, with row types (`GiftLedgerRow`, `PurchaseRow`, `ExpenseRow`) that ARE
    the ledger schema contract. Master example (section 3) and invariants 1/3/4
    proven in `reporting.test.ts`.
  - **`packages/pricing/src/csv.ts`**: the section-6.3 CSV envelope (title, filter,
    generated-at, header, whole-dollar money, ex-GST/GST separate, totals row).

The DB-backed layer the connected window builds must consume these; it must not
recompute any money figure itself.

## 2. The verified foundation contract (consume, do not reimplement)

```ts
import {
  MEETING_FEE_CENTS, GST_CENTS, gstCentsForCredits,
  giftSplitForHeldMeeting,                 // freeze the split at "held"
  cumulativeCharityCents, cumulativeKeepCents, cumulativeCharityCentsAcrossCycles,
  deferredRevenueCents, financialYearBounds, reconcileFees,
} from "@thegoodintro/pricing";
import {
  charityOwed, charityDonatedToDate, vendorCharityTotal, execCharity,
  meetingsSat, revenue, gstCollected, cashCollected, deferredRevenue,
  operatingProfit, reconcileThreeWays,
  type GiftLedgerRow, type PurchaseRow, type ExpenseRow,
} from "@thegoodintro/pricing/reporting";   // add this subpath export in package.json
import { toCsv } from "@thegoodintro/pricing/csv"; // add this subpath export too
```

First task in the connected window: add `"./reporting"` and `"./csv"` to the
`exports` map in `packages/pricing/package.json` (today only `.` and `./ledger`
are exported).

## 3. Schema migrations required (reversible; apply in the connected window)

The reporting layer is impossible on the current schema. Add the following as
**numbered reversible migrations** (CHANGE_SAFETY: branch, flag off, staging
first, Issy approves). Verify column names against migrations 0001 to 0009 before
applying; the types below are the intent.

**gift_record** (add the fields the gift ledger and period reporting need):
```sql
alter table gift_record
  add column sat_date date,           -- the held date (revenue/2.4/2.5/2.6 filter)
  add column paid_date date,          -- the payment date (2.2/2.13 filter)
  add column cycle_number int,        -- vendor cycle this gift sits in
  add column position_n int,          -- n within that cycle
  add column keep_amount_cents int,   -- frozen keep (or rename existing admin_fee_cents consistently)
  add column receipt_ref text,
  add column schedule_version text not null default 'v1';
-- backfill sat_date from created_at::date and paid_date from confirmation->>'paid_at'
update gift_record set sat_date = created_at::date where sat_date is null;
```

**invoice** (so a Purchase ledger and GST/BAS exist):
```sql
alter table invoice
  add column fee_ex_gst_cents int,    -- = quantity x 150000
  add column gst_cents int,           -- = quantity x 15000
  add column quantity int,
  add column purchase_date date;      -- the sale date (GST/cash filter)
```

**expense** (new table; required for P&L and BAS, 2.18):
```sql
create table expense (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  category text not null,
  payee text not null,
  amount_ex_gst_cents int not null,
  gst_input_credit_cents int not null default 0,
  total_inc_gst_cents int not null,
  financial_year text not null,
  created_at timestamptz not null default now()
);
```

**State-machine guards at the DB level** (defense in depth; app code alone is not
enough, see audit): add CHECK constraints / a transition-validation trigger so
illegal moves are impossible even by direct SQL, e.g. a gift cannot go
`paid -> voided`, a meeting cannot leave a terminal state. Add a row lock or a
unique partial index to close the concurrent-credit-reserve race in
`confirmMeeting`.

## 4. Fix the maths consumption layer (apps/platform)

From the maths audit. Each is a defect against CALCULATIONS.md.

1. **Cycle renewal (highest priority).** `markHeld` (`lib/meetings.ts`) selects the
   latest cycle and increments it with no boundary check, so bands never reset
   after 12 months and the carry-over case is wrong. Implement: at "held", find the
   cycle whose half-open `[started_at, ends_at)` window contains `now`; if none
   exists (renewal crossed), create the next cycle row with `held_meetings_count =
   0` (use the same-day / last-day-fallback rule, already in `ledger.ts`
   `cycleEndsAt`). Then `position_n = held_in_current_cycle + 1`. Verify against
   `cumulativeCharityCentsAcrossCycles`.
2. **FY not calendar year.** Replace every `Date.UTC(y, 0, 1)` "year start" with
   `financialYearBounds(now)` in `app/admin/page.tsx`, `app/vendor/page.tsx`,
   `app/exec/data.ts`. Revenue/charity/GST periods are 1 Jul to 30 Jun.
3. **Filter on sat_date / paid_date, not created_at** (needs the section-3 columns).
4. **Wire every dashboard number through `reporting.ts`** (section 6 below) so the
   three surfaces stop recomputing and cannot drift.
5. **GST, deferred, P&L** now exist in the engine; surface them (admin finance).
6. **Pricing-page copy bug:** `apps/web/app/pricing/page.tsx` says "tier resets each
   calendar year"; the model is a rolling 12 months from first purchase. Correct it.
7. **Vocabulary:** CALCULATIONS.md still says `Sat`/`Scheduled`; the code and
   DATA_MODEL use `held`/`confirmed`/`proposed`/`reversed`. Reconcile the doc to the
   implemented machine (and complete its status table, which omits proposed/reversed).

## 5. Complete the state machine (apps/platform + migrations)

From the state-machine audit. Implement each transition with its full side effects
from STATE_MACHINES.md, and a test (section 8).

- **`held -> reversed`** (entirely missing): return the credit to available, void
  the GiftRecord only if still `released` (never claw back `paid`), trigger a rebook
  with the same exec. Add the admin control.
- **`released -> voided`** gift transition (missing; coupled to reversal).
- **Auto-cancel** of an unpaid overcommit meeting at `payment_due_at`
  (`confirmed -> cancelled`): needs a scheduled job (Vercel cron or pg_cron). Plus
  the reminder sequence (at booking, ~7 days before due) and linking a late
  payment's CreditLot to the waiting meeting.
- **`submitted -> closed`** request transition (missing) + token revocation.
- **Reschedule** (`confirmed -> confirmed`): recompute `payment_due_at` if uncredited.
- **`schedule_version`** stamped on every gift at "held" (snapshot rule).
- **Email sender** (critical): notifications are queued but nothing sends them. Wire
  a provider (e.g. Resend) with SPF/DKIM/DMARC; without delivery the model fails.
- **Per-meeting charity override** (exec picks a different charity for one meeting).
- **DB-level guards + concurrency lock** (section 3).

## 6. Build the reports module (the 0-of-12 gap)

1. **`apps/platform/lib/reporting.ts`**: the only place the platform fetches money
   rows. Each function loads gift/purchase/expense rows from Supabase, maps them to
   `GiftLedgerRow` / `PurchaseRow` / `ExpenseRow`, and returns the pure aggregator's
   result. Takes an explicit `{ from, to, dateField }`; defaults to the current FY.
2. Repoint the three dashboards' numbers at `lib/reporting.ts` (kills the drift).
3. **`/admin/reports`** route + a "Reports" sidebar item (T3 list templates from the
   blueprint), with an FY-default date-range filter. Build all 12 summary reports
   (CALCULATIONS 6.2) and the 3 raw ledger exports (6.1).
4. Every export goes through `csv.ts` so the 6.3 envelope is automatic. Screen and
   CSV read the same `reporting.ts` function, so they always agree.
5. Add pagination to every table (today they fetch unbounded). Every screen ships
   the empty / loading / error states the blueprint requires.

## 7. Open business decisions (ask Issy, do not guess)

These block correct implementation and are Issy's calls:
- The accountant items in CALCULATIONS.md section 5 (cash vs accrual, GST tax point,
  when the donation deduction is claimed, breakage on unused credits).
- v1 follow-up cadence: DECIDED 2026-05-28, the full three-step sequence (~days
  4/8/12) ships in v1 (build task A8 in PRODUCTION_READINESS.md).
- POSITIONING.md principle 2 ("we never touch donations") contradicts the chosen
  donation model in CHARITY_FLOW.md; reconcile the public copy.
- Exec consent binding mechanism for an email-first user (EMAIL_ACTIONS open item).

## 8. Verification gates (a step is not done until these pass)

Run from the repo root. Every increment must leave ALL of these green:

```
npm test            # vitest across packages (today: 59 pure tests pass)
npm run lint        # eslint
npm run build       # next build, both apps
npm run check:copy  # brand + pricing guard (enforced on apps/platform)
```

Plus, once Supabase is connected:
- The DB-backed state-machine tests (`apps/platform/tests/*.test.ts`) run against
  seeded staging and pass (they need `NEXT_PUBLIC_SUPABASE_URL` + key + the seed).
- On seeded staging data, **the 10 reconciliation invariants in CALCULATIONS.md
  section 4 tie out to the dollar** (use `reconcileFees` and `reconcileThreeWays`).
- Every transition in STATE_MACHINES.md has a passing test, including the illegal
  ones being rejected.

## 9. Build sequence (dependency-first; gate after each)

0. Clear [`COLD_START_GAPS.md`](COLD_START_GAPS.md) first: it holds the resolved
   contradictions, the engineering decisions (DEC-1 to DEC-12, implement as
   written), and the required artifacts (ART-1 consolidated schema, ART-3
   integration contracts, ART-4 test DB, ART-5 the `packages/ui` kit + reference
   screens). ART-5 is also PORTAL_LAYOUT_BLUEPRINT section 0 and gates all module
   work. Do not start a tagged piece while its gap is open.
1. Add `./reporting` + `./csv` exports to `packages/pricing/package.json` (already
   present; confirm).
2. Migrations (section 3) on a branch, applied to staging.
3. Maths consumption fixes (section 4), especially cycle renewal and FY.
4. `lib/reporting.ts` + repoint dashboards (section 6.1, 6.2).
5. State-machine completion (section 5), with tests, transition by transition.
6. `/admin/reports` + the 12 reports + 3 ledgers + CSV (section 6.3 to 6.5).
7. Email/notification sender (section 5).
8. Portal module build to `PORTAL_LAYOUT_BLUEPRINT.md`, module by module, each
   passing the blueprint's acceptance checklist and the gates above.
9. Production readiness: work [`PRODUCTION_READINESS.md`](PRODUCTION_READINESS.md)
   (integrations, observability, security, CI) in its phases alongside and after
   the feature build. Its launch gate plus the SECURITY pre-launch checklist must
   clear before go-live.
10. Final pass: all gates green, invariants tie out, Issy approves go-live behind a
    feature flag off by default.

## 10. Definition of done for v2

The platform is "done" when: every CALCULATIONS figure is computed only via the
pricing package + `reporting.ts` and ties out on real data; every STATE_MACHINES
transition is implemented and guarded with tests; the 12 reports and 3 ledgers
export to spec; every portal module matches the blueprint at HR Partner density
with empty/loading/error states and pagination; emails actually send; and
`npm test && npm run lint && npm run build && npm run check:copy` all pass.
