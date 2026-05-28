import type { SupabaseClient } from "@supabase/supabase-js";
import { toCsv, type CsvColumn } from "@thegoodintro/pricing/csv";
import {
  charityOwed,
  charityDonatedToDate,
  revenue,
  gstCollected,
  deferredRevenue,
  operatingProfit,
  type GiftLedgerRow,
  type PurchaseRow,
  type ExpenseRow,
  type DateWindow,
} from "@thegoodintro/pricing/reporting";
import {
  loadGiftLedger,
  loadPurchaseLedger,
  loadExpenseLedger,
  financialYearWindow,
} from "./reporting";

/**
 * The report/CSV engine (CALCULATIONS §6). Every export is built ONLY from the
 * three raw ledgers (§6.1) plus the pure aggregators in @thegoodintro/pricing,
 * and rendered through csv.ts so the §6.3 envelope (title, filter, generated-at,
 * header, whole-dollar money, ex-GST/GST split, totals row) is automatic. Each
 * report states the date field it filters on (§6.3) so a record never
 * double-counts across periods.
 *
 * This module is the data/logic layer for the /admin/reports screen (gated by the
 * packages/ui kit, PORTAL_LAYOUT_BLUEPRINT §0). The screen will list REPORTS and
 * stream each build() as a download; the logic is verifiable now without it.
 */

const ALL_TIME: DateWindow = {}; // open window: include every row

function fyLabel(w: DateWindow): string {
  if (!w.from && !w.to) return "all time";
  return `${w.from ?? "start"} to ${w.to ?? "now"}`;
}

// ── Name / payee maps (the ledgers carry IDs; CSVs show names) ───────────────

async function vendorNames(supabase: SupabaseClient): Promise<Map<string, string>> {
  const { data } = await supabase.from("vendor").select("id, name");
  return new Map((data ?? []).map((v) => [v.id as string, (v.name as string) ?? ""]));
}

async function execNames(supabase: SupabaseClient): Promise<Map<string, string>> {
  const { data } = await supabase.from("executive").select("id, name, title, company");
  return new Map(
    (data ?? []).map((e) => {
      const ctx = [e.title, e.company].filter(Boolean).join(", ");
      const label = ctx ? `${e.name} (${ctx})` : (e.name as string);
      return [e.id as string, label as string];
    }),
  );
}

interface CharityPayee {
  name: string;
  abn: string | null;
  payee: string | null;
}
async function charityPayees(supabase: SupabaseClient): Promise<Map<string, CharityPayee>> {
  const { data } = await supabase.from("charity").select("id, name, abn, legal_entity_name, payee_details");
  return new Map(
    (data ?? []).map((c) => [
      c.id as string,
      {
        name: (c.name as string) ?? "",
        abn: (c.abn as string) ?? null,
        payee: (c.legal_entity_name as string) ?? null,
      },
    ]),
  );
}

// ── §6.1 Raw ledgers (the atomic backup; everything derives from these) ──────

/** Gift ledger: one row per Sat meeting. Unfiltered (the master backup). */
export async function giftLedgerCsv(supabase: SupabaseClient): Promise<string> {
  const [rows, vendors, execs] = await Promise.all([
    loadGiftLedger(supabase),
    vendorNames(supabase),
    execNames(supabase),
  ]);
  const cols: CsvColumn<GiftLedgerRow>[] = [
    { header: "meeting_id", value: (g) => g.meetingId },
    { header: "sat_date", value: (g) => g.satDate },
    { header: "vendor", value: (g) => vendors.get(g.vendorId) ?? g.vendorId },
    { header: "executive", value: (g) => execs.get(g.executiveId) ?? g.executiveId },
    { header: "charity", value: (g) => g.charityName ?? g.charityId },
    { header: "charity_abn", value: (g) => g.charityAbn ?? "" },
    { header: "cycle_number", value: (g) => g.cycleNumber },
    { header: "position_n", value: (g) => g.positionN },
    { header: "band", value: (g) => g.band },
    { header: "gift_amount", value: (g) => g.giftCents, money: true },
    { header: "keep_amount", value: (g) => g.keepCents, money: true },
    { header: "gift_status", value: (g) => g.giftStatus },
    { header: "paid_date", value: (g) => g.paidDate ?? "" },
    { header: "receipt_ref", value: (g) => g.receiptRef ?? "" },
    { header: "schedule_version", value: (g) => g.scheduleVersion ?? "" },
  ];
  return toCsv(rows, cols, { title: "Gift ledger", filter: "all rows (master backup)" });
}

/** Purchase ledger: one row per credit purchase. */
export async function purchaseLedgerCsv(supabase: SupabaseClient): Promise<string> {
  const [rows, vendors] = await Promise.all([loadPurchaseLedger(supabase), vendorNames(supabase)]);
  const cols: CsvColumn<PurchaseRow>[] = [
    { header: "purchase_id", value: (p) => p.purchaseId },
    { header: "purchase_date", value: (p) => p.purchaseDate },
    { header: "vendor", value: (p) => vendors.get(p.vendorId) ?? p.vendorId },
    { header: "quantity", value: (p) => p.quantity },
    { header: "fee_ex_gst", value: (p) => p.feeExGstCents, money: true },
    { header: "gst", value: (p) => p.gstCents, money: true },
    { header: "total_inc_gst", value: (p) => p.feeExGstCents + p.gstCents, money: true },
  ];
  return toCsv(rows, cols, { title: "Purchase ledger", filter: "all rows (master backup)" });
}

/** Expense ledger: one row per expense. */
export async function expenseLedgerCsv(supabase: SupabaseClient): Promise<string> {
  const rows = await loadExpenseLedger(supabase);
  const cols: CsvColumn<ExpenseRow>[] = [
    { header: "expense_id", value: (e) => e.expenseId },
    { header: "date", value: (e) => e.date },
    { header: "category", value: (e) => e.category },
    { header: "payee", value: (e) => e.payee },
    { header: "amount_ex_gst", value: (e) => e.amountExGstCents, money: true },
    { header: "gst_input_credit", value: (e) => e.gstInputCreditCents, money: true },
    { header: "total_inc_gst", value: (e) => e.amountExGstCents + e.gstInputCreditCents, money: true },
    { header: "financial_year", value: (e) => e.financialYear },
  ];
  return toCsv(rows, cols, { title: "Expense ledger", filter: "all rows (master backup)" });
}

// ── §6.2 Summary reports ─────────────────────────────────────────────────────

/** Charity payout (to donate now): per charity, released gifts + payee + ABN. */
export async function charityPayoutCsv(supabase: SupabaseClient): Promise<string> {
  const [gifts, payees] = await Promise.all([loadGiftLedger(supabase), charityPayees(supabase)]);
  const { perCharity } = charityOwed(gifts);
  return toCsv(
    perCharity,
    [
      { header: "charity", value: (c) => c.charityName ?? c.charityId },
      { header: "payee", value: (c) => payees.get(c.charityId)?.payee ?? "" },
      { header: "abn", value: (c) => c.charityAbn ?? payees.get(c.charityId)?.abn ?? "" },
      { header: "to_donate", value: (c) => c.cents, money: true },
    ],
    { title: "Charity payout (to donate now)", filter: "released (unpaid) gifts" },
  );
}

/** Charity donated to date: per charity, paid gifts (filters on paid_date). */
export async function charityDonatedCsv(supabase: SupabaseClient, window: DateWindow = ALL_TIME): Promise<string> {
  const gifts = await loadGiftLedger(supabase);
  const { perCharity } = charityDonatedToDate(gifts, window);
  return toCsv(
    perCharity,
    [
      { header: "charity", value: (c) => c.charityName ?? c.charityId },
      { header: "abn", value: (c) => c.charityAbn ?? "" },
      { header: "donated", value: (c) => c.cents, money: true },
    ],
    { title: "Charity donated to date", filter: `paid_date: ${fyLabel(window)}` },
  );
}

/** Charity owed (liability): per charity + grand total (the totals row). */
export async function charityOwedCsv(supabase: SupabaseClient): Promise<string> {
  const gifts = await loadGiftLedger(supabase);
  const { perCharity } = charityOwed(gifts);
  return toCsv(
    perCharity,
    [
      { header: "charity", value: (c) => c.charityName ?? c.charityId },
      { header: "amount_owed", value: (c) => c.cents, money: true },
    ],
    { title: "Charity owed (liability)", filter: "released (unpaid) gifts" },
  );
}

interface Grouped {
  key: string;
  label: string;
  cents: number;
}

/** Per-vendor charity (lump sum): one row per vendor, non-voided gifts on sat_date. */
export async function perVendorCharityCsv(supabase: SupabaseClient, window: DateWindow = financialYearWindow()): Promise<string> {
  const [gifts, vendors] = await Promise.all([loadGiftLedger(supabase), vendorNames(supabase)]);
  const inWin = (d: string) => (!window.from || d >= window.from) && (!window.to || d < window.to);
  const map = new Map<string, number>();
  for (const g of gifts) {
    if (g.giftStatus === "voided" || !inWin(g.satDate)) continue;
    map.set(g.vendorId, (map.get(g.vendorId) ?? 0) + g.giftCents);
  }
  const rows: Grouped[] = [...map.entries()]
    .map(([key, cents]) => ({ key, label: vendors.get(key) ?? key, cents }))
    .sort((a, b) => b.cents - a.cents);
  return toCsv(
    rows,
    [
      { header: "vendor", value: (r) => r.label },
      { header: "total_donated", value: (r) => r.cents, money: true },
    ],
    { title: "Per-vendor charity", filter: `sat_date: ${fyLabel(window)}` },
  );
}

/** Per-executive charity: one row per executive x charity, plus a per-exec lump-sum row. */
export async function perExecCharityCsv(supabase: SupabaseClient, window: DateWindow = financialYearWindow()): Promise<string> {
  const [gifts, execs] = await Promise.all([loadGiftLedger(supabase), execNames(supabase)]);
  const inWin = (d: string) => (!window.from || d >= window.from) && (!window.to || d < window.to);
  // exec -> charityName -> cents
  const byExec = new Map<string, Map<string, number>>();
  for (const g of gifts) {
    if (g.giftStatus === "voided" || !inWin(g.satDate)) continue;
    const charities = byExec.get(g.executiveId) ?? new Map<string, number>();
    const cName = g.charityName ?? g.charityId;
    charities.set(cName, (charities.get(cName) ?? 0) + g.giftCents);
    byExec.set(g.executiveId, charities);
  }
  type Row = { exec: string; charity: string; cents: number };
  const rows: Row[] = [];
  for (const [execId, charities] of byExec) {
    const execLabel = execs.get(execId) ?? execId;
    let lump = 0;
    for (const [charity, cents] of charities) {
      rows.push({ exec: execLabel, charity, cents });
      lump += cents;
    }
    rows.push({ exec: execLabel, charity: "All charities", cents: lump });
  }
  return toCsv(
    rows,
    [
      { header: "executive", value: (r) => r.exec },
      { header: "charity", value: (r) => r.charity },
      { header: "amount", value: (r) => r.cents, money: true },
    ],
    { title: "Per-executive charity", filter: `sat_date: ${fyLabel(window)}` },
  );
}

/** Revenue / P&L for a financial year: gross, charity, net, expenses, operating profit. */
export async function revenuePlCsv(supabase: SupabaseClient, fy: DateWindow = financialYearWindow()): Promise<string> {
  const [gifts, expenses] = await Promise.all([loadGiftLedger(supabase), loadExpenseLedger(supabase)]);
  const rev = revenue(gifts, fy);
  const pl = operatingProfit(gifts, expenses, fy);
  const row = {
    period: fyLabel(fy),
    gross: rev.grossCents,
    charity: rev.charityCommittedCents,
    net: rev.netCents,
    expenses: pl.expensesCents,
    profit: pl.profitCents,
  };
  return toCsv(
    [row],
    [
      { header: "period", value: (r) => r.period },
      { header: "gross_revenue_ex_gst", value: (r) => r.gross, money: true },
      { header: "charity", value: (r) => r.charity, money: true },
      { header: "net_excl_charity", value: (r) => r.net, money: true },
      { header: "operating_expenses", value: (r) => r.expenses, money: true },
      { header: "operating_profit", value: (r) => r.profit, money: true },
    ],
    { title: "Revenue / P&L", filter: `sat_date (revenue) + date (expenses): ${fyLabel(fy)}` },
  );
}

/**
 * GST / BAS for a period: GST collected on credits sold, input credits on
 * expenses, net GST. `remitted` is not yet tracked (no remittance ledger), so it
 * is 0 on staging and `owed` = net - remitted; finalising remittance is an
 * accountant item (CALCULATIONS §5), not guessed here.
 */
export async function gstBasCsv(supabase: SupabaseClient, period: DateWindow = financialYearWindow()): Promise<string> {
  const [purchases, expenses] = await Promise.all([loadPurchaseLedger(supabase), loadExpenseLedger(supabase)]);
  const inWin = (d: string) => (!period.from || d >= period.from) && (!period.to || d < period.to);
  const collected = gstCollected(purchases, period);
  const inputCredits = expenses.filter((e) => inWin(e.date)).reduce((s, e) => s + e.gstInputCreditCents, 0);
  const net = collected - inputCredits;
  const remitted = 0; // not tracked yet (accountant item, §5)
  const row = { period: fyLabel(period), collected, inputCredits, net, remitted, owed: net - remitted };
  return toCsv(
    [row],
    [
      { header: "period", value: (r) => r.period },
      { header: "gst_collected", value: (r) => r.collected, money: true },
      { header: "input_credits", value: (r) => r.inputCredits, money: true },
      { header: "net_gst", value: (r) => r.net, money: true },
      { header: "remitted", value: (r) => r.remitted, money: true },
      { header: "owed", value: (r) => r.owed, money: true },
    ],
    { title: "GST / BAS", filter: `purchase_date (collected) + expense date (credits): ${fyLabel(period)}` },
  );
}

/** Deferred revenue: a grand-total row plus one per vendor (unused credits x fee). */
export async function deferredRevenueCsv(supabase: SupabaseClient): Promise<string> {
  const [purchases, gifts] = await Promise.all([loadPurchaseLedger(supabase), loadGiftLedger(supabase)]);
  const vendors = await vendorNames(supabase);
  const purchasedByVendor = new Map<string, number>();
  for (const p of purchases) purchasedByVendor.set(p.vendorId, (purchasedByVendor.get(p.vendorId) ?? 0) + p.quantity);
  const heldByVendor = new Map<string, number>();
  for (const g of gifts) {
    if (g.giftStatus === "voided") continue;
    heldByVendor.set(g.vendorId, (heldByVendor.get(g.vendorId) ?? 0) + 1);
  }
  type Row = { vendor: string; unused: number; cents: number };
  const rows: Row[] = [...purchasedByVendor.entries()].map(([vid, purchased]) => {
    const held = heldByVendor.get(vid) ?? 0;
    const unused = Math.max(0, purchased - held);
    return { vendor: vendors.get(vid) ?? vid, unused, cents: deferredRevenue(purchases.filter((p) => p.vendorId === vid), gifts.filter((g) => g.vendorId === vid)) };
  });
  return toCsv(
    rows,
    [
      { header: "vendor", value: (r) => r.vendor },
      { header: "unused_credits", value: (r) => r.unused },
      { header: "deferred_value", value: (r) => r.cents, money: true },
    ],
    { title: "Deferred revenue", filter: "unused (purchased - held) credits x $1,500" },
  );
}

// ── Registry (the /admin/reports screen will list these as downloads) ────────

export interface ReportDescriptor {
  key: string;
  label: string;
  kind: "ledger" | "summary";
  build: (supabase: SupabaseClient, window?: DateWindow) => Promise<string>;
}

export const REPORTS: ReportDescriptor[] = [
  { key: "gift-ledger", label: "Gift ledger", kind: "ledger", build: (sb) => giftLedgerCsv(sb) },
  { key: "purchase-ledger", label: "Purchase ledger", kind: "ledger", build: (sb) => purchaseLedgerCsv(sb) },
  { key: "expense-ledger", label: "Expense ledger", kind: "ledger", build: (sb) => expenseLedgerCsv(sb) },
  { key: "charity-payout", label: "Charity payout (to donate now)", kind: "summary", build: (sb) => charityPayoutCsv(sb) },
  { key: "charity-donated", label: "Charity donated to date", kind: "summary", build: (sb, w) => charityDonatedCsv(sb, w) },
  { key: "charity-owed", label: "Charity owed (liability)", kind: "summary", build: (sb) => charityOwedCsv(sb) },
  { key: "per-vendor-charity", label: "Per-vendor charity", kind: "summary", build: (sb, w) => perVendorCharityCsv(sb, w) },
  { key: "per-exec-charity", label: "Per-executive charity", kind: "summary", build: (sb, w) => perExecCharityCsv(sb, w) },
  { key: "revenue-pl", label: "Revenue / P&L", kind: "summary", build: (sb, w) => revenuePlCsv(sb, w) },
  { key: "gst-bas", label: "GST / BAS", kind: "summary", build: (sb, w) => gstBasCsv(sb, w) },
  { key: "deferred-revenue", label: "Deferred revenue", kind: "summary", build: (sb) => deferredRevenueCsv(sb) },
  // TODO (next installment, need meeting/cycle/credit/request queries):
  // meetings, vendor cycle & band, vendor financials, pending & cancelled.
];
