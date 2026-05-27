/**
 * Encodes the master example from CALCULATIONS.md section 3 (and its checks in
 * section 4) as an end-to-end test of the pure reporting aggregators. Seven held
 * meetings, three vendors, three executives, two charities.
 */
import { describe, it, expect } from "vitest";
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
  reconcileThreeWays,
  type GiftLedgerRow,
  type PurchaseRow,
} from "./reporting";

const aud = (n: number) => n * 100;
const CC = "cancer-council";
const RFDS = "rfds";

// Master example, section 3. satDate all within May 2026; gifts still Released.
const gift = (
  meetingId: string,
  vendorId: string,
  executiveId: string,
  charityId: string,
  band: 1 | 2 | 3 | 4,
  giftAud: number,
  keepAud: number,
  positionN: number,
  cycleNumber: number,
): GiftLedgerRow => ({
  meetingId,
  satDate: "2026-05-10",
  vendorId,
  executiveId,
  charityId,
  charityName: charityId === CC ? "Cancer Council" : "RFDS",
  cycleNumber,
  positionN,
  band,
  giftCents: aud(giftAud),
  keepCents: aud(keepAud),
  giftStatus: "released",
});

const gifts: GiftLedgerRow[] = [
  gift("m1", "A", "X", CC, 2, 1000, 500, 6, 1),
  gift("m2", "A", "X", RFDS, 2, 1000, 500, 7, 1),
  gift("m3", "B", "Y", CC, 1, 900, 600, 1, 1),
  gift("m4", "B", "Y", CC, 1, 900, 600, 2, 1),
  gift("m5", "B", "Z", RFDS, 1, 900, 600, 3, 1),
  gift("m6", "C", "X", RFDS, 1, 900, 600, 1, 2),
  gift("m7", "C", "Y", CC, 1, 900, 600, 2, 2),
];

const findCharity = (perCharity: { charityId: string; cents: number }[], id: string) =>
  perCharity.find((c) => c.charityId === id)?.cents ?? 0;

describe("master example (CALCULATIONS section 3)", () => {
  it("2.6 counts seven held meetings", () => {
    expect(meetingsSat(gifts)).toBe(7);
  });

  it("totals: $6,500 gifts and $4,000 keep; gross $10,500 = net + charity (invariant 3)", () => {
    const r = revenue(gifts);
    expect(r.charityCommittedCents).toBe(aud(6_500));
    expect(r.netCents).toBe(aud(4_000));
    expect(r.grossCents).toBe(aud(10_500));
    expect(r.grossCents).toBe(r.netCents + r.charityCommittedCents);
  });

  it("2.1 charity owed per charity: Cancer Council $3,700, RFDS $2,800; total $6,500", () => {
    const { perCharity, totalCents } = charityOwed(gifts);
    expect(findCharity(perCharity, CC)).toBe(aud(3_700));
    expect(findCharity(perCharity, RFDS)).toBe(aud(2_800));
    expect(totalCents).toBe(aud(6_500));
  });

  it("2.4 per-vendor lump sums: A $2,000, B $2,700, C $1,800", () => {
    expect(vendorCharityTotal(gifts, "A")).toBe(aud(2_000));
    expect(vendorCharityTotal(gifts, "B")).toBe(aud(2_700));
    expect(vendorCharityTotal(gifts, "C")).toBe(aud(1_800));
  });

  it("2.5 per-executive breakdown and lump: X $2,900 (CC 1,000 / RFDS 1,900), Y $2,700, Z $900", () => {
    const x = execCharity(gifts, "X");
    expect(findCharity(x.perCharity, CC)).toBe(aud(1_000));
    expect(findCharity(x.perCharity, RFDS)).toBe(aud(1_900));
    expect(x.totalCents).toBe(aud(2_900)); // invariant 2: parts add to the lump

    expect(execCharity(gifts, "Y").totalCents).toBe(aud(2_700));
    expect(execCharity(gifts, "Z").totalCents).toBe(aud(900));
  });

  it("invariant 1: summed by charity = by vendor = by executive = $6,500", () => {
    const r = reconcileThreeWays(gifts);
    expect(r.total).toBe(aud(6_500));
    expect(r.byCharity).toBe(aud(6_500));
    expect(r.byVendor).toBe(aud(6_500));
    expect(r.byExecutive).toBe(aud(6_500));
    expect(r.balances).toBe(true);
  });

  it("2.12 GST if all seven were invoiced this month = $1,050", () => {
    const purchases: PurchaseRow[] = Array.from({ length: 7 }, (_, i) => ({
      purchaseId: `p${i}`,
      purchaseDate: "2026-05-01",
      vendorId: "A",
      quantity: 1,
      feeExGstCents: aud(1_500),
      gstCents: aud(150),
    }));
    expect(gstCollected(purchases)).toBe(aud(1_050));
    expect(cashCollected(purchases)).toBe(aud(10_500));
  });
});

describe("invariant 4: owed + paid = all gifts ever", () => {
  it("paying two Cancer Council gifts moves them from owed to donated, total preserved", () => {
    const afterPayment = gifts.map((g) =>
      g.meetingId === "m1" || g.meetingId === "m3"
        ? { ...g, giftStatus: "paid" as const, paidDate: "2026-05-20" }
        : g,
    );
    const owed = charityOwed(afterPayment).totalCents;
    const donated = charityDonatedToDate(afterPayment).totalCents;
    expect(donated).toBe(aud(1_000) + aud(900)); // m1 + m3
    expect(owed + donated).toBe(aud(6_500)); // invariant 4
  });

  it("paidDate window filters donations to the period", () => {
    const paid = gifts.map((g) =>
      g.meetingId === "m1" ? { ...g, giftStatus: "paid" as const, paidDate: "2026-05-20" } : g,
    );
    expect(charityDonatedToDate(paid, { from: "2026-05-01", to: "2026-06-01" }).totalCents).toBe(aud(1_000));
    expect(charityDonatedToDate(paid, { from: "2026-06-01", to: "2026-07-01" }).totalCents).toBe(0);
  });
});

describe("voided gifts (reversed meetings) count toward nothing", () => {
  it("a voided gift is excluded from revenue, owed, and the three-way reconciliation", () => {
    const withVoid = gifts.map((g) => (g.meetingId === "m2" ? { ...g, giftStatus: "voided" as const } : g));
    expect(revenue(withVoid).meetingsSat).toBe(6);
    expect(revenue(withVoid).charityCommittedCents).toBe(aud(5_500)); // 6,500 - 1,000
    expect(reconcileThreeWays(withVoid).balances).toBe(true);
  });
});

describe("2.15 deferred revenue", () => {
  it("40 credits purchased across vendors, 7 held => $49,500 deferred", () => {
    const purchases: PurchaseRow[] = [
      { purchaseId: "pa", purchaseDate: "2026-05-01", vendorId: "A", quantity: 16, feeExGstCents: aud(24_000), gstCents: aud(2_400) },
      { purchaseId: "pb", purchaseDate: "2026-05-01", vendorId: "B", quantity: 14, feeExGstCents: aud(21_000), gstCents: aud(2_100) },
      { purchaseId: "pc", purchaseDate: "2026-05-01", vendorId: "C", quantity: 10, feeExGstCents: aud(15_000), gstCents: aud(1_500) },
    ];
    // 40 purchased - 7 held = 33 unused x $1,500 = $49,500
    expect(deferredRevenue(purchases, gifts)).toBe(aud(49_500));
  });
});
