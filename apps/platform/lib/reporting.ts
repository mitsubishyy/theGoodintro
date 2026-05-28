import type { SupabaseClient } from "@supabase/supabase-js";
import { financialYearBounds, reconcileFees, type FeeReconciliation } from "@thegoodintro/pricing";
import {
  charityOwed,
  charityDonatedToDate,
  vendorCharityTotal,
  execCharity,
  meetingsSat,
  revenue,
  gstCollected,
  cashCollected,
  deferredRevenue,
  operatingProfit,
  reconcileThreeWays,
  type GiftLedgerRow,
  type PurchaseRow,
  type ExpenseRow,
  type DateWindow,
} from "@thegoodintro/pricing/reporting";

/**
 * The ONLY place the platform fetches money rows. Each loader maps Supabase rows
 * to the pricing-package row contracts (GiftLedgerRow / PurchaseRow / ExpenseRow);
 * each report function then defers the arithmetic to @thegoodintro/pricing, so a
 * screen, a CSV export, and the reconciliation job all read the same numbers and
 * cannot drift. Never recompute a money figure in a page (V2_BUILD_PLAN §6).
 *
 * Windows are half-open [from, to) date-only strings and default to the current
 * Australian financial year (1 Jul to 30 Jun), never the calendar year.
 */

function one<T>(v: unknown): T | undefined {
  return (Array.isArray(v) ? v[0] : v) as T | undefined;
}
const toDateStr = (d: Date) => d.toISOString().slice(0, 10);

/** Current AU financial-year window as date-only strings (CALCULATIONS 0.4). */
export function financialYearWindow(now: Date = new Date()): Required<DateWindow> {
  const { start, end } = financialYearBounds(now);
  return { from: toDateStr(start), to: toDateStr(end) };
}

/** Month-to-date window [1st of month, 1st of next month). */
export function monthWindow(now: Date = new Date()): Required<DateWindow> {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  return { from: toDateStr(new Date(Date.UTC(y, m, 1))), to: toDateStr(new Date(Date.UTC(y, m + 1, 1))) };
}

// ── Ledger loaders (the atomic money rows; everything derives from these) ────

/** Every held meeting's gift, as a GiftLedgerRow (CALCULATIONS 6.1 gift ledger). */
export async function loadGiftLedger(supabase: SupabaseClient): Promise<GiftLedgerRow[]> {
  const { data, error } = await supabase.from("gift_record").select(`
    meeting_id, charity_id, band_at_completion, charity_amount_cents, admin_fee_cents,
    status, sat_date, paid_date, cycle_number, position_n, receipt_ref, schedule_version,
    charity:charity_id ( name, abn ),
    meeting:meeting_id ( request:request_id ( vendor_id, executive_id ) )
  `);
  if (error) throw new Error(`loadGiftLedger: ${error.message}`);
  return (data ?? []).map((g): GiftLedgerRow => {
    const charity = one<{ name: string; abn: string | null }>(g.charity);
    const meeting = one<{ request: unknown }>(g.meeting);
    const request = one<{ vendor_id: string; executive_id: string }>(meeting?.request);
    return {
      meetingId: g.meeting_id as string,
      satDate: g.sat_date as string,
      vendorId: request?.vendor_id ?? "",
      executiveId: request?.executive_id ?? "",
      charityId: g.charity_id as string,
      charityName: charity?.name,
      charityAbn: charity?.abn ?? undefined,
      cycleNumber: (g.cycle_number as number) ?? 0,
      positionN: (g.position_n as number) ?? 0,
      band: Number((g.band_at_completion as string).split("_")[1]) as 1 | 2 | 3 | 4,
      giftCents: g.charity_amount_cents as number,
      keepCents: g.admin_fee_cents as number, // DEC-1: admin_fee_cents IS the keep
      giftStatus: g.status as GiftLedgerRow["giftStatus"],
      paidDate: (g.paid_date as string | null) ?? null,
      receiptRef: (g.receipt_ref as string | null) ?? null,
      scheduleVersion: g.schedule_version as string,
    };
  });
}

/** Paid credit-purchase invoices, as PurchaseRows (CALCULATIONS 6.1 purchase ledger). */
export async function loadPurchaseLedger(supabase: SupabaseClient): Promise<PurchaseRow[]> {
  const { data, error } = await supabase
    .from("invoice")
    .select("id, vendor_id, quantity, fee_ex_gst_cents, gst_cents, purchase_date")
    .eq("kind", "credit_purchase")
    .eq("status", "paid")
    .not("quantity", "is", null);
  if (error) throw new Error(`loadPurchaseLedger: ${error.message}`);
  return (data ?? []).map((p): PurchaseRow => ({
    purchaseId: p.id as string,
    purchaseDate: p.purchase_date as string,
    vendorId: p.vendor_id as string,
    quantity: (p.quantity as number) ?? 0,
    feeExGstCents: (p.fee_ex_gst_cents as number) ?? 0,
    gstCents: (p.gst_cents as number) ?? 0,
  }));
}

/** Operating expenses, as ExpenseRows (CALCULATIONS 6.1 expense ledger). */
export async function loadExpenseLedger(supabase: SupabaseClient): Promise<ExpenseRow[]> {
  const { data, error } = await supabase
    .from("expense")
    .select("id, date, category, payee, amount_ex_gst_cents, gst_input_credit_cents, financial_year");
  if (error) throw new Error(`loadExpenseLedger: ${error.message}`);
  return (data ?? []).map((e): ExpenseRow => ({
    expenseId: e.id as string,
    date: e.date as string,
    category: e.category as string,
    payee: e.payee as string,
    amountExGstCents: e.amount_ex_gst_cents as number,
    gstInputCreditCents: e.gst_input_credit_cents as number,
    financialYear: e.financial_year as string,
  }));
}

// ── Report functions (load rows, defer the maths to @thegoodintro/pricing) ───

/** 2.3/2.13/2.14 Revenue for a period (gross / charity-committed / net keep), on satDate. */
export async function revenueForPeriod(supabase: SupabaseClient, window?: DateWindow) {
  return revenue(await loadGiftLedger(supabase), window ?? financialYearWindow());
}

/** 2.1/2.16 Charity owed now (released, unpaid), per charity + total. */
export async function charityOwedNow(supabase: SupabaseClient) {
  return charityOwed(await loadGiftLedger(supabase));
}

/** 2.2 Charity already donated (paid) in a period, on paidDate. */
export async function charityDonatedForPeriod(supabase: SupabaseClient, window?: DateWindow) {
  return charityDonatedToDate(await loadGiftLedger(supabase), window ?? financialYearWindow());
}

/** 2.6 Count of meetings sat in a period. */
export async function meetingsSatForPeriod(supabase: SupabaseClient, window?: DateWindow) {
  return meetingsSat(await loadGiftLedger(supabase), window ?? financialYearWindow());
}

/** 2.4 Per-vendor charity (lump sum) in a period. */
export async function vendorCharityForPeriod(supabase: SupabaseClient, vendorId: string, window?: DateWindow) {
  return vendorCharityTotal(await loadGiftLedger(supabase), vendorId, window ?? financialYearWindow());
}

/** 2.5 Per-executive charity (per-charity breakdown + lump sum) in a period. */
export async function execCharityForPeriod(supabase: SupabaseClient, executiveId: string, window?: DateWindow) {
  return execCharity(await loadGiftLedger(supabase), executiveId, window ?? financialYearWindow());
}

/** 2.12 GST collected on credits sold in a period, on purchaseDate. */
export async function gstCollectedForPeriod(supabase: SupabaseClient, window?: DateWindow) {
  return gstCollected(await loadPurchaseLedger(supabase), window ?? financialYearWindow());
}

/** 2.3 Cash (ex-GST) collected on credits sold in a period, on purchaseDate. */
export async function cashCollectedForPeriod(supabase: SupabaseClient, window?: DateWindow) {
  return cashCollected(await loadPurchaseLedger(supabase), window ?? financialYearWindow());
}

/** 2.15 Deferred revenue now: prepaid-but-unused credits x the ex-GST fee. */
export async function deferredRevenueNow(supabase: SupabaseClient): Promise<number> {
  const [purchases, gifts] = await Promise.all([loadPurchaseLedger(supabase), loadGiftLedger(supabase)]);
  return deferredRevenue(purchases, gifts);
}

/** 2.18 Operating profit for a financial year (gross - donated - expenses). */
export async function operatingProfitForFy(supabase: SupabaseClient, fy?: DateWindow) {
  const [gifts, expenses] = await Promise.all([loadGiftLedger(supabase), loadExpenseLedger(supabase)]);
  return operatingProfit(gifts, expenses, fy ?? financialYearWindow());
}

// ── Reconciliation safety-net (CALCULATIONS §4 invariants) ───────────────────

export interface ReconcileResult {
  threeWays: ReturnType<typeof reconcileThreeWays>;
  fees: FeeReconciliation;
  balances: boolean;
}

/**
 * Run the lifetime reconciliation invariants over ALL live data: invariant 1
 * (same gifts summed by charity/vendor/exec all equal the total) and invariant 9
 * (the master identity: ex-GST fees = donated + owed + retained + deferred). Used
 * by the PRODUCTION_READINESS B4 daily job and the DB-backed tie-out test.
 */
export async function reconcileAll(supabase: SupabaseClient): Promise<ReconcileResult> {
  const [gifts, purchases] = await Promise.all([loadGiftLedger(supabase), loadPurchaseLedger(supabase)]);
  const live = gifts.filter((g) => g.giftStatus !== "voided");
  const threeWays = reconcileThreeWays(gifts);
  const fees = reconcileFees({
    creditsPurchased: purchases.reduce((s, p) => s + p.quantity, 0),
    meetingsHeld: live.length,
    donatedCents: gifts.filter((g) => g.giftStatus === "paid").reduce((s, g) => s + g.giftCents, 0),
    owedCents: gifts.filter((g) => g.giftStatus === "released").reduce((s, g) => s + g.giftCents, 0),
    retainedCents: live.reduce((s, g) => s + g.keepCents, 0),
  });
  return { threeWays, fees, balances: threeWays.balances && fees.balances };
}
