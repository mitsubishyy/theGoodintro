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
});
