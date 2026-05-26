/**
 * theGoodintro money model — the SINGLE SOURCE OF TRUTH for the fee, the
 * charity bands, and the gift split. Both the marketing pricing slider and the
 * platform ledger import from here so a band can never be hardcoded twice and
 * drift. Authoritative rules: DATA_MODEL.md "Money rules" and CALCULATIONS.md.
 *
 * Money is whole AUD cents (integers), never floats.
 */

/** $1,500 AUD per meeting / credit. */
export const MEETING_FEE_AUD = 1500;
export const MEETING_FEE_CENTS = 150_000;

export type BandNumber = 1 | 2 | 3 | 4;
/** Matches the DB enum `gift_band`. */
export type GiftBandKey = "band_1" | "band_2" | "band_3" | "band_4";

export interface CharityBand {
  band: BandNumber;
  /** Inclusive lower bound: held-meeting count in the cycle where this band starts. */
  lo: number;
  /** Inclusive upper bound, or null for the open-ended top band. */
  hi: number | null;
  /** Charity share per meeting at this band, in AUD and cents. */
  rateAud: number;
  rateCents: number;
}

/**
 * The tiered charity share, by number of meetings held in the current 12-month
 * cycle. The share applies WITHIN each band, never retroactively (pricing page).
 */
export const CHARITY_BANDS: readonly CharityBand[] = [
  { band: 1, lo: 1, hi: 5, rateAud: 900, rateCents: 90_000 },
  { band: 2, lo: 6, hi: 10, rateAud: 1000, rateCents: 100_000 },
  { band: 3, lo: 11, hi: 15, rateAud: 1100, rateCents: 110_000 },
  { band: 4, lo: 16, hi: null, rateAud: 1200, rateCents: 120_000 },
] as const;

const bandKey = (b: BandNumber): GiftBandKey =>
  (`band_${b}` as GiftBandKey);

/**
 * The band that applies to the Nth meeting HELD in a cycle (1-indexed).
 * The 1st..5th meeting are band 1, 6th..10th band 2, and so on.
 */
export function bandForMeetingNumber(n: number): CharityBand {
  if (!Number.isInteger(n) || n < 1) {
    throw new RangeError(`meeting number must be a positive integer, got ${n}`);
  }
  for (const band of CHARITY_BANDS) {
    if (n >= band.lo && (band.hi === null || n <= band.hi)) return band;
  }
  // Unreachable: the top band is open-ended.
  return CHARITY_BANDS[CHARITY_BANDS.length - 1];
}

/** Charity share (cents) for the Nth held meeting in a cycle. */
export function charityShareCentsForMeetingNumber(n: number): number {
  return bandForMeetingNumber(n).rateCents;
}

/** Admin fee (cents) = the fee minus the charity share. Its own named line. */
export function adminFeeCents(charityShareCents: number): number {
  return MEETING_FEE_CENTS - charityShareCents;
}

/**
 * The locked split for a meeting becoming `held`. `heldBeforeThisInCycle` is the
 * cycle's held_meetings_count BEFORE this meeting is counted; this meeting is
 * therefore the (that + 1)th held meeting and takes that band.
 */
export interface GiftSplit {
  band: BandNumber;
  bandKey: GiftBandKey;
  charityCents: number;
  adminCents: number;
}
export function giftSplitForHeldMeeting(heldBeforeThisInCycle: number): GiftSplit {
  const n = heldBeforeThisInCycle + 1;
  const band = bandForMeetingNumber(n);
  const charityCents = band.rateCents;
  return {
    band: band.band,
    bandKey: bandKey(band.band),
    charityCents,
    adminCents: adminFeeCents(charityCents),
  };
}

/**
 * Cumulative charity total (cents) for `meetingsHeld` meetings in one cycle.
 * This is the figure the pricing slider shows; golden-tested against the
 * published pricing-page rows.
 */
export function cumulativeCharityCents(meetingsHeld: number): number {
  if (!Number.isInteger(meetingsHeld) || meetingsHeld < 0) {
    throw new RangeError(`meetingsHeld must be a non-negative integer, got ${meetingsHeld}`);
  }
  let total = 0;
  for (let n = 1; n <= meetingsHeld; n++) {
    total += charityShareCentsForMeetingNumber(n);
  }
  return total;
}

/** Total fees (cents) the vendor pays for `meetings` meetings. */
export function totalFeesCents(meetings: number): number {
  return meetings * MEETING_FEE_CENTS;
}

/** Charity share as a whole-number percent of fees, for display parity with the page. */
export function charitySharePercent(meetingsHeld: number): number {
  if (meetingsHeld <= 0) return 0;
  return Math.round(
    (cumulativeCharityCents(meetingsHeld) / totalFeesCents(meetingsHeld)) * 100,
  );
}
