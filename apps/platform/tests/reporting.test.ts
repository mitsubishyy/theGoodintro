import { describe, it, expect, beforeAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  reconcileAll,
  charityOwedNow,
  charityDonatedForPeriod,
  revenueForPeriod,
  gstCollectedForPeriod,
  cashCollectedForPeriod,
  deferredRevenueNow,
  meetingsSatForPeriod,
  financialYearWindow,
} from "../lib/reporting";

/**
 * The reporting layer (lib/reporting.ts -> @thegoodintro/pricing) must tie out to
 * the seed and satisfy the CALCULATIONS §4 invariants on real DB rows. The seed
 * (Alpha) has 3 held meetings, all band 1 ($900 charity / $600 keep): one paid
 * (OzHarvest), two released (Beyond Blue), against one paid purchase of 5 credits.
 *
 *   charity total      = 3 x $900            = $2,700
 *   owed (released)    = 2 x $900            = $1,800 (Beyond Blue)
 *   donated (paid)     = 1 x $900            =   $900 (OzHarvest)
 *   net keep           = 3 x $600            = $1,800
 *   gross              = 3 x $1,500          = $4,500   (= keep + charity, inv 3)
 *   GST                = 5 x $150            =   $750
 *   cash ex-GST        = 5 x $1,500          = $7,500
 *   deferred           = (5 - 3) x $1,500    = $3,000
 *   master identity    = 7,500 = 900 + 1,800 + 1,800 + 3,000   (inv 9)
 *
 * Assumes a freshly seeded DB (test-db.sh / CI db-reset first); other suites clean
 * up their rows, and only the seed invoice has a non-null quantity.
 */
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const PASSWORD = "Passw0rd!test";
const BEYOND_BLUE = "00000000-0000-0000-0000-00000000c1a1";
const OZHARVEST = "00000000-0000-0000-0000-00000000c1a2";

async function admin(): Promise<SupabaseClient> {
  const c = createClient(URL, KEY, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email: "admin@thegoodintro.test", password: PASSWORD });
  if (error) throw new Error(error.message);
  return c;
}

describe("reporting layer ties out to the seed (CALCULATIONS §4)", () => {
  let sb: SupabaseClient;

  beforeAll(async () => {
    if (!URL || !KEY) throw new Error("Supabase env vars are not set");
    sb = await admin();
  });

  it("invariants 1 + 9 balance, with the seed's figures", async () => {
    const r = await reconcileAll(sb);
    expect(r.balances).toBe(true);
    // Invariant 1: same gifts summed three ways all equal the total.
    expect(r.threeWays).toMatchObject({ total: 270000, byCharity: 270000, byVendor: 270000, byExecutive: 270000 });
    // Invariant 9: the master identity.
    expect(r.fees).toMatchObject({
      feesCollectedCents: 750000,
      donatedCents: 90000,
      owedCents: 180000,
      retainedCents: 180000,
      deferredCents: 300000,
    });
  });

  it("2.1/2.16 charity owed now = the two released gifts (Beyond Blue, $1,800)", async () => {
    const owed = await charityOwedNow(sb);
    expect(owed.totalCents).toBe(180000);
    expect(owed.perCharity.find((c) => c.charityId === BEYOND_BLUE)?.cents).toBe(180000);
  });

  it("2.2 charity donated this FY = the one paid gift (OzHarvest, $900)", async () => {
    const donated = await charityDonatedForPeriod(sb, financialYearWindow());
    expect(donated.totalCents).toBe(90000);
    expect(donated.perCharity.find((c) => c.charityId === OZHARVEST)?.cents).toBe(90000);
  });

  it("2.3/2.14 revenue this FY splits gross into keep + charity (invariant 3)", async () => {
    const rev = await revenueForPeriod(sb, financialYearWindow());
    expect(rev).toMatchObject({ meetingsSat: 3, grossCents: 450000, charityCommittedCents: 270000, netCents: 180000 });
    expect(rev.grossCents).toBe(rev.netCents + rev.charityCommittedCents);
  });

  it("2.12/2.3/2.15 GST, cash, deferred, and meetings sat", async () => {
    const fy = financialYearWindow();
    expect(await gstCollectedForPeriod(sb, fy)).toBe(75000);
    expect(await cashCollectedForPeriod(sb, fy)).toBe(750000);
    expect(await deferredRevenueNow(sb)).toBe(300000);
    expect(await meetingsSatForPeriod(sb, fy)).toBe(3);
  });
});
