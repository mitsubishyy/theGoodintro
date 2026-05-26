import { describe, it, expect } from "vitest";
import {
  MEETING_FEE_CENTS,
  CHARITY_BANDS,
  bandForMeetingNumber,
  charityShareCentsForMeetingNumber,
  adminFeeCents,
  giftSplitForHeldMeeting,
  cumulativeCharityCents,
  totalFeesCents,
  charitySharePercent,
} from "./index";

describe("charity bands", () => {
  it("the fee is $1,500 and bands cover the published rates", () => {
    expect(MEETING_FEE_CENTS).toBe(150_000);
    expect(CHARITY_BANDS.map((b) => b.rateCents)).toEqual([90_000, 100_000, 110_000, 120_000]);
  });

  it("maps a meeting number to the right band", () => {
    expect(bandForMeetingNumber(1).band).toBe(1);
    expect(bandForMeetingNumber(5).band).toBe(1);
    expect(bandForMeetingNumber(6).band).toBe(2);
    expect(bandForMeetingNumber(10).band).toBe(2);
    expect(bandForMeetingNumber(11).band).toBe(3);
    expect(bandForMeetingNumber(15).band).toBe(3);
    expect(bandForMeetingNumber(16).band).toBe(4);
    expect(bandForMeetingNumber(500).band).toBe(4);
  });

  it("rejects non-positive / non-integer meeting numbers", () => {
    expect(() => bandForMeetingNumber(0)).toThrow();
    expect(() => bandForMeetingNumber(-3)).toThrow();
    expect(() => bandForMeetingNumber(2.5)).toThrow();
  });
});

describe("gift split (locks at completion)", () => {
  it("splits fee into charity share + admin fee, summing to $1,500", () => {
    for (const n of [1, 5, 6, 11, 16, 99]) {
      const split = giftSplitForHeldMeeting(n - 1); // (n-1) held before => nth meeting
      expect(split.charityCents + split.adminCents).toBe(MEETING_FEE_CENTS);
    }
  });

  it("first meeting in a cycle is band 1 ($900 charity / $600 admin)", () => {
    const s = giftSplitForHeldMeeting(0);
    expect(s.band).toBe(1);
    expect(s.bandKey).toBe("band_1");
    expect(s.charityCents).toBe(90_000);
    expect(s.adminCents).toBe(60_000);
  });

  it("sixth meeting is band 2 ($1,000 / $500), sixteenth band 4 ($1,200 / $300)", () => {
    expect(giftSplitForHeldMeeting(5)).toMatchObject({ band: 2, charityCents: 100_000, adminCents: 50_000 });
    expect(giftSplitForHeldMeeting(15)).toMatchObject({ band: 4, charityCents: 120_000, adminCents: 30_000 });
  });

  it("admin fee is the remainder of the fee", () => {
    expect(adminFeeCents(90_000)).toBe(60_000);
    expect(adminFeeCents(charityShareCentsForMeetingNumber(16))).toBe(30_000);
  });
});

describe("GOLDEN: parity with the published pricing-page rows", () => {
  // app/pricing ANNUAL_ROWS: cumulative charity / pay / pct at band ends.
  it.each([
    { meetings: 5, charityAud: 4_500, payAud: 7_500, pct: 60 },
    { meetings: 10, charityAud: 9_500, payAud: 15_000, pct: 63 },
    { meetings: 15, charityAud: 15_000, payAud: 22_500, pct: 67 },
    { meetings: 20, charityAud: 21_000, payAud: 30_000, pct: 70 },
  ])("$meetings meetings -> $$charityAud charity, $pct%", (row) => {
    expect(cumulativeCharityCents(row.meetings)).toBe(row.charityAud * 100);
    expect(totalFeesCents(row.meetings)).toBe(row.payAud * 100);
    expect(charitySharePercent(row.meetings)).toBe(row.pct);
  });

  it("zero meetings means zero charity and zero percent", () => {
    expect(cumulativeCharityCents(0)).toBe(0);
    expect(charitySharePercent(0)).toBe(0);
  });
});
