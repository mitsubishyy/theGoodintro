/**
 * Pure reporting aggregators (CALCULATIONS.md sections 2 and 6). These operate on
 * plain ledger-row arrays and never touch a database, so they are fully testable
 * and are the SINGLE place every report figure is computed. The platform's
 * DB-backed layer (apps/platform/lib/reporting.ts in v2) fetches rows from
 * Supabase and calls these; the three dashboards then read the same numbers and
 * cannot drift.
 *
 * The row interfaces below are also the schema contract: the v2 migrations must
 * give gift_record / invoice / expense exactly these fields (see V2_BUILD_PLAN.md).
 *
 * Money is integer cents throughout. Dates are ISO strings ("YYYY-MM-DD" or full
 * ISO); windows are half-open [from, to) to match CALCULATIONS 0.6.
 */
import { MEETING_FEE_CENTS, deferredRevenueCents } from "./index";

export type GiftStatus = "released" | "paid" | "voided";

/** One row per held meeting (CALCULATIONS 6.1 "Gift ledger"). */
export interface GiftLedgerRow {
  meetingId: string;
  satDate: string; // when the meeting was held (revenue + 2.4/2.5/2.6 filter on this)
  vendorId: string;
  executiveId: string;
  charityId: string;
  charityName?: string;
  charityAbn?: string;
  cycleNumber: number;
  positionN: number; // n within the vendor's cycle
  band: 1 | 2 | 3 | 4;
  giftCents: number; // frozen charity share
  keepCents: number; // frozen admin/keep share
  giftStatus: GiftStatus;
  paidDate?: string | null; // when the gift was paid (2.2/2.13 filter on this)
  receiptRef?: string | null;
  scheduleVersion?: string;
}

/** One row per credit purchase (CALCULATIONS 6.1 "Purchase ledger"). */
export interface PurchaseRow {
  purchaseId: string;
  purchaseDate: string; // GST + cash filter on this
  vendorId: string;
  quantity: number;
  feeExGstCents: number; // = quantity x 150,000
  gstCents: number; // = quantity x 15,000
}

/** One row per expense (CALCULATIONS 6.1 "Expense ledger"). */
export interface ExpenseRow {
  expenseId: string;
  date: string;
  category: string;
  payee: string;
  amountExGstCents: number;
  gstInputCreditCents: number;
  financialYear: string;
}

/** Half-open date window [from, to). Omit a bound to leave it open. */
export interface DateWindow {
  from?: string;
  to?: string;
}

function inWindow(iso: string | null | undefined, w?: DateWindow): boolean {
  if (!w || (!w.from && !w.to)) return true;
  if (!iso) return false;
  if (w.from && iso < w.from) return false;
  if (w.to && iso >= w.to) return false; // half-open: `to` is exclusive
  return true;
}

/** A voided gift (its meeting was reversed) counts toward no money figure. */
const counts = (g: GiftLedgerRow) => g.giftStatus !== "voided";

interface CharityTotal {
  charityId: string;
  charityName?: string;
  charityAbn?: string;
  cents: number;
}

function groupByCharity(rows: GiftLedgerRow[]): CharityTotal[] {
  const map = new Map<string, CharityTotal>();
  for (const g of rows) {
    const cur = map.get(g.charityId) ?? {
      charityId: g.charityId,
      charityName: g.charityName,
      charityAbn: g.charityAbn,
      cents: 0,
    };
    cur.cents += g.giftCents;
    map.set(g.charityId, cur);
  }
  return [...map.values()].sort((a, b) => b.cents - a.cents);
}

/** 2.1 / 2.16 Charity owed now: released (unpaid) gifts, per charity + grand total. */
export function charityOwed(gifts: GiftLedgerRow[]): { perCharity: CharityTotal[]; totalCents: number } {
  const released = gifts.filter((g) => g.giftStatus === "released");
  const perCharity = groupByCharity(released);
  return { perCharity, totalCents: perCharity.reduce((s, c) => s + c.cents, 0) };
}

/** 2.2 Charity donated to date: paid gifts, per charity, filtered on paidDate. */
export function charityDonatedToDate(
  gifts: GiftLedgerRow[],
  window?: DateWindow,
): { perCharity: CharityTotal[]; totalCents: number } {
  const paid = gifts.filter((g) => g.giftStatus === "paid" && inWindow(g.paidDate, window));
  const perCharity = groupByCharity(paid);
  return { perCharity, totalCents: perCharity.reduce((s, c) => s + c.cents, 0) };
}

/** 2.4 Per-vendor charity (lump sum only), non-voided, filtered on satDate. */
export function vendorCharityTotal(gifts: GiftLedgerRow[], vendorId: string, window?: DateWindow): number {
  return gifts
    .filter((g) => g.vendorId === vendorId && counts(g) && inWindow(g.satDate, window))
    .reduce((s, g) => s + g.giftCents, 0);
}

/** 2.5 Per-executive charity: breakdown per charity AND lump sum, non-voided, on satDate. */
export function execCharity(
  gifts: GiftLedgerRow[],
  executiveId: string,
  window?: DateWindow,
): { perCharity: CharityTotal[]; totalCents: number } {
  const rows = gifts.filter(
    (g) => g.executiveId === executiveId && counts(g) && inWindow(g.satDate, window),
  );
  const perCharity = groupByCharity(rows);
  return { perCharity, totalCents: perCharity.reduce((s, c) => s + c.cents, 0) };
}

/** 2.6 Count of held meetings (non-voided gifts), filtered on satDate. */
export function meetingsSat(gifts: GiftLedgerRow[], window?: DateWindow): number {
  return gifts.filter((g) => counts(g) && inWindow(g.satDate, window)).length;
}

/**
 * 2.3 / 2.13 / 2.14 Revenue for a period (filtered on satDate). Gross is the
 * ex-GST fee x held meetings; charityCommitted is the sum of those gifts; net is
 * the sum of keep. Invariant 3 holds by construction: gross === net + charity.
 */
export function revenue(
  gifts: GiftLedgerRow[],
  window?: DateWindow,
): { meetingsSat: number; grossCents: number; charityCommittedCents: number; netCents: number } {
  const rows = gifts.filter((g) => counts(g) && inWindow(g.satDate, window));
  const charityCommittedCents = rows.reduce((s, g) => s + g.giftCents, 0);
  const netCents = rows.reduce((s, g) => s + g.keepCents, 0);
  return {
    meetingsSat: rows.length,
    grossCents: rows.length * MEETING_FEE_CENTS,
    charityCommittedCents,
    netCents,
  };
}

/** 2.12 GST collected on credits sold in the period (filtered on purchaseDate). */
export function gstCollected(purchases: PurchaseRow[], window?: DateWindow): number {
  return purchases.filter((p) => inWindow(p.purchaseDate, window)).reduce((s, p) => s + p.gstCents, 0);
}

/** 2.3 Cash collected (ex-GST) on credits sold in the period (filtered on purchaseDate). */
export function cashCollected(purchases: PurchaseRow[], window?: DateWindow): number {
  return purchases.filter((p) => inWindow(p.purchaseDate, window)).reduce((s, p) => s + p.feeExGstCents, 0);
}

/** 2.15 Deferred revenue across all vendors: unused credits x fee. */
export function deferredRevenue(purchases: PurchaseRow[], gifts: GiftLedgerRow[]): number {
  const purchased = purchases.reduce((s, p) => s + p.quantity, 0);
  const held = gifts.filter(counts).length;
  return deferredRevenueCents(purchased, held);
}

/**
 * 2.18 Operating profit for a financial year: gross revenue (satDate in FY) minus
 * charity donated (paidDate in FY) minus operating expenses (date in FY).
 */
export function operatingProfit(
  gifts: GiftLedgerRow[],
  expenses: ExpenseRow[],
  fy: DateWindow,
): { grossCents: number; charityDonatedCents: number; expensesCents: number; profitCents: number } {
  const grossCents = revenue(gifts, fy).grossCents;
  const charityDonatedCents = charityDonatedToDate(gifts, fy).totalCents;
  const expensesCents = expenses
    .filter((e) => inWindow(e.date, fy))
    .reduce((s, e) => s + e.amountExGstCents, 0);
  return {
    grossCents,
    charityDonatedCents,
    expensesCents,
    profitCents: grossCents - charityDonatedCents - expensesCents,
  };
}

/**
 * Invariant 1 reconciliation: the same gifts summed three ways (by charity, by
 * vendor, by executive) must all equal the grand total. Returns the four totals
 * and whether they agree, for a runtime self-check / test.
 */
export function reconcileThreeWays(gifts: GiftLedgerRow[]): {
  byCharity: number;
  byVendor: number;
  byExecutive: number;
  total: number;
  balances: boolean;
} {
  const live = gifts.filter(counts);
  const total = live.reduce((s, g) => s + g.giftCents, 0);
  const sumBy = (key: keyof GiftLedgerRow) => {
    const m = new Map<string, number>();
    for (const g of live) m.set(String(g[key]), (m.get(String(g[key])) ?? 0) + g.giftCents);
    return [...m.values()].reduce((s, v) => s + v, 0);
  };
  const byCharity = sumBy("charityId");
  const byVendor = sumBy("vendorId");
  const byExecutive = sumBy("executiveId");
  return {
    byCharity,
    byVendor,
    byExecutive,
    total,
    balances: byCharity === total && byVendor === total && byExecutive === total,
  };
}
