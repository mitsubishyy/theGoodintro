import type { SupabaseClient } from "@supabase/supabase-js";
import { bandForMeetingNumber } from "@thegoodintro/pricing";
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

// ── §6.2 Operational reports (need meeting / cycle / credit / request data) ──

function one<T>(v: unknown): T | undefined {
  return (Array.isArray(v) ? v[0] : v) as T | undefined;
}
const d10 = (iso: string | null | undefined) => (iso ? String(iso).slice(0, 10) : "");

function meetingCategory(status: string): "Sat" | "Pending" | "Cancelled" {
  if (status === "held") return "Sat";
  if (status === "proposed" || status === "confirmed") return "Pending";
  return "Cancelled"; // no_show, cancelled, reversed
}

/** Meetings: one row per meeting, with its gift/keep (held only) and status category. */
export async function meetingsCsv(supabase: SupabaseClient): Promise<string> {
  const [{ data }, vendors, execs] = await Promise.all([
    supabase.from("meeting").select(`
      id, status, scheduled_at, created_at,
      request:request_id ( vendor_id, executive_id ),
      gift_record ( charity_amount_cents, admin_fee_cents )
    `),
    vendorNames(supabase),
    execNames(supabase),
  ]);
  type Row = {
    meetingId: string; date: string; vendor: string; exec: string;
    status: string; category: string; giftCents: number; keepCents: number;
  };
  const rows: Row[] = (data ?? []).map((m) => {
    const req = one<{ vendor_id: string; executive_id: string }>(m.request);
    const gift = one<{ charity_amount_cents: number; admin_fee_cents: number }>(m.gift_record);
    return {
      meetingId: m.id as string,
      date: d10((m.scheduled_at as string) ?? (m.created_at as string)),
      vendor: vendors.get(req?.vendor_id as string) ?? (req?.vendor_id as string) ?? "",
      exec: execs.get(req?.executive_id as string) ?? (req?.executive_id as string) ?? "",
      status: m.status as string,
      category: meetingCategory(m.status as string),
      giftCents: gift?.charity_amount_cents ?? 0,
      keepCents: gift?.admin_fee_cents ?? 0,
    };
  });
  return toCsv(
    rows,
    [
      { header: "meeting_id", value: (r) => r.meetingId },
      { header: "date", value: (r) => r.date },
      { header: "vendor", value: (r) => r.vendor },
      { header: "executive", value: (r) => r.exec },
      { header: "status", value: (r) => r.status },
      { header: "category", value: (r) => r.category },
      { header: "gift", value: (r) => r.giftCents, money: true },
      { header: "keep", value: (r) => r.keepCents, money: true },
    ],
    { title: "Meetings", filter: "all meetings (category: Sat / Pending / Cancelled)" },
  );
}

interface CycleRow { vendor_id: string; started_at: string; ends_at: string; held_meetings_count: number }

/** Resolve a vendor's current cycle (window containing now, else latest) + its ordinal. */
function currentCycle(cycles: CycleRow[], now: number): { cycle: CycleRow; ordinal: number } | null {
  if (cycles.length === 0) return null;
  const sorted = [...cycles].sort((a, b) => a.started_at.localeCompare(b.started_at));
  let idx = sorted.findIndex((c) => Date.parse(c.started_at) <= now && now < Date.parse(c.ends_at));
  if (idx === -1) idx = sorted.length - 1; // none contains now: the latest
  return { cycle: sorted[idx], ordinal: idx + 1 };
}

/** Vendor cycle and band: per vendor, current cycle/band + credits remaining. */
export async function vendorCycleBandCsv(supabase: SupabaseClient): Promise<string> {
  const now = Date.now();
  const [{ data: vendorRows }, { data: cycleRows }, { data: lotRows }] = await Promise.all([
    supabase.from("vendor").select("id, name"),
    supabase.from("cycle").select("vendor_id, started_at, ends_at, held_meetings_count"),
    supabase.from("credit_lot").select("vendor_id, quantity_remaining"),
  ]);
  const cyclesByVendor = new Map<string, CycleRow[]>();
  for (const c of (cycleRows ?? []) as CycleRow[]) {
    const arr = cyclesByVendor.get(c.vendor_id) ?? [];
    arr.push(c);
    cyclesByVendor.set(c.vendor_id, arr);
  }
  const creditsByVendor = new Map<string, number>();
  for (const l of lotRows ?? []) creditsByVendor.set(l.vendor_id as string, (creditsByVendor.get(l.vendor_id as string) ?? 0) + (l.quantity_remaining as number));

  type Row = { vendor: string; cycleStart: string; cycleNumber: number | string; held: number; band: number; rateCents: number; credits: number };
  const rows: Row[] = (vendorRows ?? []).map((v) => {
    const resolved = currentCycle(cyclesByVendor.get(v.id as string) ?? [], now);
    const held = resolved?.cycle.held_meetings_count ?? 0;
    const band = bandForMeetingNumber(held + 1);
    return {
      vendor: (v.name as string) ?? (v.id as string),
      cycleStart: resolved ? d10(resolved.cycle.started_at) : "",
      cycleNumber: resolved ? resolved.ordinal : "",
      held,
      band: band.band,
      rateCents: band.rateCents,
      credits: creditsByVendor.get(v.id as string) ?? 0,
    };
  });
  return toCsv(
    rows,
    [
      { header: "vendor", value: (r) => r.vendor },
      { header: "cycle_start", value: (r) => r.cycleStart },
      { header: "current_cycle", value: (r) => r.cycleNumber },
      { header: "held_this_cycle", value: (r) => r.held },
      { header: "current_band", value: (r) => `Band ${r.band}` },
      { header: "current_band_rate", value: (r) => r.rateCents, money: true },
      { header: "credits_remaining", value: (r) => r.credits },
    ],
    { title: "Vendor cycle and band", filter: "current cycle (window containing now, else latest)" },
  );
}

/** Vendor financials: per vendor, total paid, GST paid, credits remaining, deferred, charity contributed. */
export async function vendorFinancialsCsv(supabase: SupabaseClient): Promise<string> {
  const [{ data: vendorRows }, purchases, gifts, { data: lotRows }] = await Promise.all([
    supabase.from("vendor").select("id, name"),
    loadPurchaseLedger(supabase),
    loadGiftLedger(supabase),
    supabase.from("credit_lot").select("vendor_id, quantity_remaining"),
  ]);
  const credits = new Map<string, number>();
  for (const l of lotRows ?? []) credits.set(l.vendor_id as string, (credits.get(l.vendor_id as string) ?? 0) + (l.quantity_remaining as number));

  type Row = { vendor: string; paid: number; gst: number; credits: number; deferred: number; charity: number };
  const rows: Row[] = (vendorRows ?? []).map((v) => {
    const id = v.id as string;
    const vp = purchases.filter((p) => p.vendorId === id);
    const vg = gifts.filter((g) => g.vendorId === id && g.giftStatus !== "voided");
    const purchased = vp.reduce((s, p) => s + p.quantity, 0);
    const held = vg.length;
    return {
      vendor: (v.name as string) ?? id,
      paid: vp.reduce((s, p) => s + p.feeExGstCents, 0),
      gst: vp.reduce((s, p) => s + p.gstCents, 0),
      credits: credits.get(id) ?? 0,
      deferred: Math.max(0, purchased - held) * 150_000,
      charity: vg.reduce((s, g) => s + g.giftCents, 0),
    };
  });
  return toCsv(
    rows,
    [
      { header: "vendor", value: (r) => r.vendor },
      { header: "total_paid_ex_gst", value: (r) => r.paid, money: true },
      { header: "gst_paid", value: (r) => r.gst, money: true },
      { header: "credits_remaining", value: (r) => r.credits },
      { header: "deferred_value", value: (r) => r.deferred, money: true },
      { header: "charity_contributed", value: (r) => r.charity, money: true },
    ],
    { title: "Vendor financials", filter: "lifetime per vendor" },
  );
}

/** Pending and cancelled: one row per request that is pending or cancelled (excludes completed). */
export async function pendingCancelledCsv(supabase: SupabaseClient): Promise<string> {
  const [{ data }, vendors, execs] = await Promise.all([
    supabase.from("request").select("id, status, created_at, vendor_id, executive_id, meeting ( status )"),
    vendorNames(supabase),
    execNames(supabase),
  ]);
  const category = (reqStatus: string, meetingStatus?: string): "Pending" | "Cancelled" | "Completed" => {
    if (reqStatus === "declined" || reqStatus === "closed") return "Cancelled";
    if (reqStatus === "submitted") return "Pending";
    if (!meetingStatus) return "Pending"; // accepted, awaiting a time
    if (meetingStatus === "held") return "Completed";
    if (["no_show", "cancelled", "reversed"].includes(meetingStatus)) return "Cancelled";
    return "Pending"; // proposed / confirmed
  };
  type Row = { requestId: string; created: string; vendor: string; exec: string; reqStatus: string; meetingStatus: string; category: string };
  const rows: Row[] = (data ?? [])
    .map((r) => {
      const m = one<{ status: string }>(r.meeting);
      return {
        requestId: r.id as string,
        created: d10(r.created_at as string),
        vendor: vendors.get(r.vendor_id as string) ?? (r.vendor_id as string),
        exec: execs.get(r.executive_id as string) ?? (r.executive_id as string),
        reqStatus: r.status as string,
        meetingStatus: m?.status ?? "",
        category: category(r.status as string, m?.status),
      };
    })
    .filter((r) => r.category !== "Completed");
  return toCsv(
    rows,
    [
      { header: "request_id", value: (r) => r.requestId },
      { header: "created", value: (r) => r.created },
      { header: "vendor", value: (r) => r.vendor },
      { header: "executive", value: (r) => r.exec },
      { header: "request_status", value: (r) => r.reqStatus },
      { header: "meeting_status", value: (r) => r.meetingStatus },
      { header: "category", value: (r) => r.category },
    ],
    { title: "Pending and cancelled", filter: "requests not completed (Pending or Cancelled)" },
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
  { key: "meetings", label: "Meetings", kind: "summary", build: (sb) => meetingsCsv(sb) },
  { key: "vendor-cycle-band", label: "Vendor cycle and band", kind: "summary", build: (sb) => vendorCycleBandCsv(sb) },
  { key: "vendor-financials", label: "Vendor financials", kind: "summary", build: (sb) => vendorFinancialsCsv(sb) },
  { key: "pending-cancelled", label: "Pending and cancelled", kind: "summary", build: (sb) => pendingCancelledCsv(sb) },
];
