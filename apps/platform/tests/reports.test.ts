import { describe, it, expect, beforeAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  REPORTS,
  giftLedgerCsv,
  purchaseLedgerCsv,
  expenseLedgerCsv,
  charityPayoutCsv,
  charityOwedCsv,
  charityDonatedCsv,
  perVendorCharityCsv,
  perExecCharityCsv,
  revenuePlCsv,
  gstBasCsv,
  deferredRevenueCsv,
  meetingsCsv,
  vendorCycleBandCsv,
  vendorFinancialsCsv,
  pendingCancelledCsv,
} from "../lib/reports";

/**
 * The report/CSV engine (CALCULATIONS §6) must produce the §6.3 envelope and tie
 * out to the seed (3 band-1 sat meetings, one paid; 5 credits purchased). All
 * money is rendered in whole dollars. Assumes a freshly seeded DB.
 */
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const PASSWORD = "Passw0rd!test";

async function admin(): Promise<SupabaseClient> {
  const c = createClient(URL, KEY, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email: "admin@thegoodintro.test", password: PASSWORD });
  if (error) throw new Error(error.message);
  return c;
}

const totalRow = (csv: string) => csv.split("\n").find((l) => l.startsWith("Total")) ?? "";
const lineWith = (csv: string, s: string) => csv.split("\n").find((l) => l.includes(s)) ?? "";

describe("report engine (CALCULATIONS §6) ties out to the seed", () => {
  let sb: SupabaseClient;
  beforeAll(async () => {
    if (!URL || !KEY) throw new Error("Supabase env vars are not set");
    sb = await admin();
  });

  it("every export carries the §6.3 envelope (title, filter, generated-at)", async () => {
    for (const r of REPORTS) {
      const csv = await r.build(sb);
      expect(csv.length).toBeGreaterThan(0);
      expect(csv).toContain("Filter:");
      expect(csv).toContain("Generated at:");
    }
  });

  it("gift ledger: 3 sat meetings; totals $2,700 charity / $1,800 keep", async () => {
    const csv = await giftLedgerCsv(sb);
    expect(csv).toContain("Gift ledger");
    expect(csv).toContain("gift_amount");
    // 3 data rows (band renders as the number; match on gift_status instead).
    expect(csv.split("\n").filter((l) => /,(released|paid|voided),/.test(l))).toHaveLength(3);
    expect(totalRow(csv)).toContain("2700");
    expect(totalRow(csv)).toContain("1800");
    expect(csv).toContain("Beyond Blue");
    expect(csv).toContain("OzHarvest");
  });

  it("purchase ledger: 5 credits, ex-GST $7,500, GST $750, inc-GST $8,250", async () => {
    const t = totalRow(await purchaseLedgerCsv(sb));
    expect(t).toContain("7500");
    expect(t).toContain("750");
    expect(t).toContain("8250");
  });

  it("expense ledger renders (empty on the seed)", async () => {
    const csv = await expenseLedgerCsv(sb);
    expect(csv).toContain("Expense ledger");
    expect(csv).toContain("amount_ex_gst");
  });

  it("charity owed (liability): Beyond Blue $1,800, total $1,800", async () => {
    const csv = await charityOwedCsv(sb);
    expect(lineWith(csv, "Beyond Blue")).toContain("1800");
    expect(totalRow(csv)).toContain("1800");
  });

  it("charity payout lists released gifts per charity (payee + ABN columns)", async () => {
    const csv = await charityPayoutCsv(sb);
    expect(csv).toContain("Charity payout");
    expect(csv).toContain("payee");
    expect(csv).toContain("abn");
    expect(lineWith(csv, "Beyond Blue")).toContain("1800");
  });

  it("charity donated to date: OzHarvest $900", async () => {
    const csv = await charityDonatedCsv(sb); // all-time
    expect(lineWith(csv, "OzHarvest")).toContain("900");
    expect(totalRow(csv)).toContain("900");
  });

  it("per-vendor charity (FY): Alpha $2,700", async () => {
    const csv = await perVendorCharityCsv(sb);
    expect(lineWith(csv, "Alpha")).toContain("2700");
    expect(totalRow(csv)).toContain("2700");
  });

  it("per-executive charity (FY): Jordan Smith, all charities $2,700", async () => {
    const csv = await perExecCharityCsv(sb);
    expect(csv).toContain("Jordan Smith");
    expect(lineWith(csv, "All charities")).toContain("2700");
  });

  it("revenue / P&L (FY): gross $4,500, charity $2,700, net $1,800, profit $3,600", async () => {
    const csv = await revenuePlCsv(sb);
    const row = csv.split("\n").find((l) => l.includes("4500")) ?? "";
    expect(row).toContain("4500"); // gross
    expect(row).toContain("2700"); // charity committed
    expect(row).toContain("1800"); // net (excl charity)
    expect(row).toContain("3600"); // operating profit (gross - donated $900 - expenses $0)
  });

  it("GST / BAS (FY): collected $750, net $750", async () => {
    const csv = await gstBasCsv(sb);
    expect(totalRow(csv)).toContain("750");
  });

  it("deferred revenue: Alpha 2 unused credits = $3,000", async () => {
    const csv = await deferredRevenueCsv(sb);
    expect(lineWith(csv, "Alpha")).toContain("3000");
    expect(totalRow(csv)).toContain("3000");
  });

  it("meetings: held meetings total gift $2,700 / keep $1,800; Sat + Pending categories present", async () => {
    const csv = await meetingsCsv(sb);
    expect(csv).toContain(",Sat,"); // the 3 held seed meetings
    expect(csv).toContain(",Pending,"); // the confirmed seed meeting
    // Robust: only the seed's held meetings carry a gift (other suites clean theirs up).
    expect(totalRow(csv)).toContain("2700");
    expect(totalRow(csv)).toContain("1800");
  });

  it("vendor cycle and band: Alpha cycle 1, 3 held this cycle, Band 1, 1 credit left", async () => {
    const csv = await vendorCycleBandCsv(sb);
    // Parse Alpha's row (no commas in any field, so split is safe). Robust to
    // other suites leaving extra vendors (the report correctly lists them all).
    // cols: vendor, cycle_start, current_cycle, held_this_cycle, current_band, rate, credits
    const alpha = lineWith(csv, "Alpha").split(",");
    expect(alpha[2]).toBe("1"); // current cycle
    expect(alpha[3]).toBe("3"); // held this cycle
    expect(alpha[4]).toBe("Band 1"); // current band (held+1 = 4th = band 1)
    expect(alpha[6]).toBe("1"); // credits remaining
  });

  it("vendor financials: Alpha paid $7,500, GST $750, deferred $3,000, charity $2,700", async () => {
    const csv = await vendorFinancialsCsv(sb);
    const alpha = lineWith(csv, "Alpha");
    expect(alpha).toContain("7500");
    expect(alpha).toContain("750");
    expect(alpha).toContain("3000");
    expect(alpha).toContain("2700");
    expect(totalRow(csv)).toContain("7500");
  });

  it("pending and cancelled: includes pending seed requests, excludes completed (held) ones", async () => {
    const csv = await pendingCancelledCsv(sb);
    // Seed: 5201/5203 submitted and 4a4 (accepted, meeting confirmed) are Pending;
    // 4a1/4a2/4a3 (accepted, meeting held) are Completed and must be excluded.
    expect(csv).toContain("00000000-0000-0000-0000-000000005201"); // submitted -> Pending
    expect(csv).toContain("00000000-0000-0000-0000-0000000004a4"); // confirmed -> Pending
    expect(csv).not.toContain("00000000-0000-0000-0000-0000000004a1"); // held -> Completed, excluded
    expect(csv).not.toContain("Completed");
  });
});
