/**
 * Encodes CALCULATIONS.md as executable tests: the worked examples (section 2),
 * the master example (section 3), and the reconciliation invariants (section 4).
 * If any of these fail, a money figure is wrong. Amounts are AUD dollars in the
 * comments and cents in the assertions.
 */
import { describe, it, expect } from "vitest";
import {
  MEETING_FEE_CENTS,
  GST_CENTS,
  gstCentsForCredits,
  cumulativeCharityCents,
  cumulativeKeepCents,
  cumulativeCharityCentsAcrossCycles,
  keepCentsForMeetingNumber,
  charityShareCentsForMeetingNumber,
  deferredRevenueCents,
  totalFeesCents,
  financialYearBounds,
  reconcileFees,
} from "./index";

const aud = (n: number) => n * 100; // dollars -> cents

describe("0.1 fixed numbers", () => {
  it("fee $1,500, GST $150 (10%), total invoiced $1,650", () => {
    expect(MEETING_FEE_CENTS).toBe(aud(1500));
    expect(GST_CENTS).toBe(aud(150));
    expect(GST_CENTS).toBe(MEETING_FEE_CENTS / 10);
    expect(MEETING_FEE_CENTS + GST_CENTS).toBe(aud(1650));
  });
});

describe("section 1 + invariant 5: cumulative charity per cycle (band builds, resets at boundary)", () => {
  it("16 meetings in ONE cycle donate $16,200 (matches the pricing page annual figure)", () => {
    // 5x900 + 5x1000 + 5x1100 + 1x1200 = 16,200
    expect(cumulativeCharityCents(16)).toBe(aud(16_200));
  });

  it("the same 16 credits split [10, 6] across two cycles donate only $15,000", () => {
    // cycle1 10 held = 9,500 ; cycle2 6 held resets to band 1 = 5,500 ; total 15,000
    expect(cumulativeCharityCentsAcrossCycles([10, 6])).toBe(aud(15_000));
    // and the $1,200 difference is intended
    expect(cumulativeCharityCents(16) - cumulativeCharityCentsAcrossCycles([10, 6])).toBe(aud(1_200));
  });

  it("2.11 carryover worked example: cycle1 [1..10] then cycle2 [1..6]", () => {
    expect(cumulativeCharityCents(10)).toBe(aud(9_500)); // cycle 1
    expect(cumulativeCharityCents(6)).toBe(aud(5_500)); // cycle 2 (reset)
  });
});

describe("invariant 3: gross = keep + charity, for every meeting count", () => {
  it.each([1, 5, 6, 11, 16, 23, 100])("%i held meetings split exactly into keep + charity", (m) => {
    const gross = totalFeesCents(m);
    const charity = cumulativeCharityCents(m);
    const keep = cumulativeKeepCents(m);
    expect(keep + charity).toBe(gross);
  });

  it("2.14 FY example: a PORTFOLIO of 30 meetings (20 band-1, 7 band-2, 3 band-3)", () => {
    // This is a mix across many vendors, NOT one vendor's 30 consecutive meetings.
    // charity = 20x900 + 7x1000 + 3x1100 = 28,300 ; net = 20x600 + 7x500 + 3x400 = 16,700.
    const charity =
      20 * charityShareCentsForMeetingNumber(1) + // band 1
      7 * charityShareCentsForMeetingNumber(6) + // band 2
      3 * charityShareCentsForMeetingNumber(11); // band 3
    const net =
      20 * keepCentsForMeetingNumber(1) +
      7 * keepCentsForMeetingNumber(6) +
      3 * keepCentsForMeetingNumber(11);
    const gross = totalFeesCents(30);
    expect(gross).toBe(aud(45_000));
    expect(charity).toBe(aud(28_300));
    expect(net).toBe(aud(16_700));
    expect(net).toBe(gross - charity);
  });

  it("distinction: ONE vendor holding 30 in a single cycle donates $33,000, not $28,300", () => {
    // meetings 16..30 are all band 4, so the single-cycle build is much higher.
    expect(cumulativeCharityCents(30)).toBe(aud(33_000));
  });
});

describe("2.12 GST, 2.15 deferred revenue", () => {
  it("16 credits => $2,400 GST", () => {
    expect(gstCentsForCredits(16)).toBe(aud(2_400));
  });

  it("40 credits sold, 30 held => $15,000 deferred", () => {
    expect(deferredRevenueCents(40, 30)).toBe(aud(15_000));
  });

  it("deferred throws if held exceeds purchased (invariant 6: credits never negative)", () => {
    expect(() => deferredRevenueCents(5, 6)).toThrow();
  });
});

describe("invariant 9: the master fee identity balances to the dollar", () => {
  it("40 credits / 30-meeting FY example: 60,000 = 25,000 + 3,300 + 16,700 + 15,000", () => {
    const r = reconcileFees({
      creditsPurchased: 40,
      meetingsHeld: 30,
      donatedCents: aud(25_000), // paid gifts
      owedCents: aud(3_300), // released (unpaid) gifts
      retainedCents: aud(16_700), // keep on delivered meetings
    });
    expect(r.feesCollectedCents).toBe(aud(60_000));
    expect(r.deferredCents).toBe(aud(15_000));
    expect(r.balances).toBe(true);
    // donated + owed = total charity committed = matches 2.14's $28,300
    expect(r.donatedCents + r.owedCents).toBe(aud(28_300));
  });

  it("flags imbalance when a part is wrong", () => {
    const r = reconcileFees({
      creditsPurchased: 40,
      meetingsHeld: 30,
      donatedCents: aud(25_000),
      owedCents: aud(3_300),
      retainedCents: aud(16_000), // wrong (should be 16,700)
    });
    expect(r.balances).toBe(false);
  });
});

describe("per-meeting keep matches the band schedule", () => {
  it("keep is $600/$500/$400/$300 across the four bands", () => {
    expect(keepCentsForMeetingNumber(1)).toBe(aud(600));
    expect(keepCentsForMeetingNumber(6)).toBe(aud(500));
    expect(keepCentsForMeetingNumber(11)).toBe(aud(400));
    expect(keepCentsForMeetingNumber(16)).toBe(aud(300));
  });

  it("charity is $900/$1,000/$1,100/$1,200 across the four bands", () => {
    expect(charityShareCentsForMeetingNumber(1)).toBe(aud(900));
    expect(charityShareCentsForMeetingNumber(6)).toBe(aud(1_000));
    expect(charityShareCentsForMeetingNumber(11)).toBe(aud(1_100));
    expect(charityShareCentsForMeetingNumber(16)).toBe(aud(1_200));
  });
});

describe("0.4 financial year bounds (1 Jul to 30 Jun, half-open)", () => {
  it("a date in May 2026 belongs to FY 1 Jul 2025 to 1 Jul 2026", () => {
    const { start, end } = financialYearBounds(new Date(Date.UTC(2026, 4, 27)));
    expect(start.toISOString()).toBe("2025-07-01T00:00:00.000Z");
    expect(end.toISOString()).toBe("2026-07-01T00:00:00.000Z");
  });

  it("1 July 2026 belongs to the NEW FY (half-open start is inclusive)", () => {
    const { start } = financialYearBounds(new Date(Date.UTC(2026, 6, 1)));
    expect(start.toISOString()).toBe("2026-07-01T00:00:00.000Z");
  });

  it("30 June 2026 belongs to the FY starting 1 Jul 2025", () => {
    const { start } = financialYearBounds(new Date(Date.UTC(2026, 5, 30)));
    expect(start.toISOString()).toBe("2025-07-01T00:00:00.000Z");
  });
});
