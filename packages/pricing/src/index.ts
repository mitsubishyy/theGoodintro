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

/* ────────────────────────────────────────────────────────────────────────
   Period / reporting figures (CALCULATIONS.md section 2). All pure, integer
   cents, guarded. The platform's DB-backed reporting layer filters frozen gift
   / purchase / expense rows, then calls these to add them up, so there is one
   place the maths lives. See packages/pricing/src/reporting.ts for the
   record-level aggregators that consume these.
   ──────────────────────────────────────────────────────────────────────── */

function assertNonNegInt(v: number, name: string): void {
  if (!Number.isInteger(v) || v < 0) {
    throw new RangeError(`${name} must be a non-negative integer, got ${v}`);
  }
}

/** GST is 10% of the ex-GST fee: $150 / 15,000 cents per meeting (CALCULATIONS 0.1, 2.12). */
export const GST_AUD = 150;
export const GST_CENTS = 15_000;

/** GST collected (cents) on credits sold (CALCULATIONS 2.12). Never revenue; held for the ATO. */
export function gstCentsForCredits(credits: number): number {
  assertNonNegInt(credits, "credits");
  return credits * GST_CENTS;
}

/** Keep / admin share (cents) for the Nth held meeting in a cycle (= fee - charity). */
export function keepCentsForMeetingNumber(n: number): number {
  return adminFeeCents(charityShareCentsForMeetingNumber(n));
}

/**
 * Cumulative keep (net revenue excl charity, ex-GST) for `meetingsHeld` held in
 * one cycle (CALCULATIONS 2.14: C = sum of keep(n) = gross - charity).
 */
export function cumulativeKeepCents(meetingsHeld: number): number {
  assertNonNegInt(meetingsHeld, "meetingsHeld");
  let total = 0;
  for (let n = 1; n <= meetingsHeld; n++) total += keepCentsForMeetingNumber(n);
  return total;
}

/**
 * Cumulative charity (cents) across multiple cycles, where the band count RESETS
 * at each cycle boundary (CALCULATIONS 2.11, invariant 5). `meetingsPerCycle[i]`
 * is the meetings held in cycle i. Proves the intended difference: 16 meetings in
 * one cycle donate $16,200, but split as [10, 6] donate only $15,000.
 */
export function cumulativeCharityCentsAcrossCycles(meetingsPerCycle: readonly number[]): number {
  return meetingsPerCycle.reduce((sum, m) => sum + cumulativeCharityCents(m), 0);
}

/**
 * Deferred revenue (cents): prepaid-but-unused credits valued at the ex-GST fee
 * (CALCULATIONS 2.15). Throws if more meetings were held than credits purchased,
 * which enforces invariant 6 (CreditsRemaining is never negative) at this layer
 * rather than silently clamping it.
 */
export function deferredRevenueCents(creditsPurchased: number, meetingsHeld: number): number {
  assertNonNegInt(creditsPurchased, "creditsPurchased");
  assertNonNegInt(meetingsHeld, "meetingsHeld");
  const unused = creditsPurchased - meetingsHeld;
  if (unused < 0) {
    throw new RangeError(
      `meetingsHeld (${meetingsHeld}) cannot exceed creditsPurchased (${creditsPurchased})`,
    );
  }
  return unused * MEETING_FEE_CENTS;
}

/**
 * Australian financial year bounds (1 Jul to 30 Jun) for a date, half-open
 * [start, end) (CALCULATIONS 0.4). Use this for revenue / GST / donation period
 * reporting. Do NOT use the calendar year (the current dashboards' bug) or the
 * vendor band cycle for tax periods.
 */
export function financialYearBounds(d: Date): { start: Date; end: Date } {
  const y = d.getUTCFullYear();
  const julyThisYear = Date.UTC(y, 6, 1); // month index 6 = July
  const startYear = d.getTime() >= julyThisYear ? y : y - 1;
  return {
    start: new Date(Date.UTC(startYear, 6, 1)),
    end: new Date(Date.UTC(startYear + 1, 6, 1)),
  };
}

/**
 * The master identity (CALCULATIONS invariant 9): every ex-GST fee dollar splits
 * into exactly donated + owed + retained + deferred, with nothing left over. If
 * `balances` is false, a number upstream is wrong and must not be trusted.
 */
export interface FeeReconciliation {
  feesCollectedCents: number;
  donatedCents: number;
  owedCents: number;
  retainedCents: number;
  deferredCents: number;
  balances: boolean;
}
export function reconcileFees(args: {
  creditsPurchased: number;
  meetingsHeld: number;
  donatedCents: number;
  owedCents: number;
  retainedCents: number;
}): FeeReconciliation {
  const feesCollectedCents = totalFeesCents(args.creditsPurchased);
  const deferredCents = deferredRevenueCents(args.creditsPurchased, args.meetingsHeld);
  const sum = args.donatedCents + args.owedCents + args.retainedCents + deferredCents;
  return {
    feesCollectedCents,
    donatedCents: args.donatedCents,
    owedCents: args.owedCents,
    retainedCents: args.retainedCents,
    deferredCents,
    balances: sum === feesCollectedCents,
  };
}
