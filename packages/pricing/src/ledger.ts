/**
 * Pure credit/cycle ledger helpers — the deterministic money rules from
 * DATA_MODEL.md, with no I/O so they can be golden-tested. The DB layer calls
 * these; it never re-implements the math.
 */

/** A vendor may hold at most 4 booked-but-unpaid (overcommit) meetings at once. */
export const OVERCOMMIT_MAX_UNPAID = 4;
/** Uncredited meetings sit at least 30 days out; payment is due 30 days before. */
export const UNCREDITED_LEAD_DAYS = 30;
/** The uncredited-payment reminder (D2) fires ~7 days before `payment_due_at`. */
export const PAYMENT_REMINDER_LEAD_DAYS = 7;
/** Buying any credits opens the platform for 12 months. */
export const ACCESS_WINDOW_MONTHS = 12;

export interface CreditBalance {
  /** Total credits ever purchased (sum of credit lots). */
  purchased: number;
  /** Reserved by confirmed-but-not-held meetings. */
  reserved: number;
  /** Consumed by held meetings (spent permanently). */
  consumed: number;
}

/**
 * Available = purchased - consumed - reserved. This is what the vendor sees and
 * what gates booking; it drops the moment a meeting is booked (reserved), not
 * when it is held, so the same credit cannot be over-booked.
 */
export function availableCredits(b: CreditBalance): number {
  return b.purchased - b.consumed - b.reserved;
}

export function hasAvailableCredit(b: CreditBalance): boolean {
  return availableCredits(b) > 0;
}

/** Whether another overcommit (uncredited) booking is allowed right now. */
export function canOverbook(currentUnpaidMeetings: number): boolean {
  return currentUnpaidMeetings < OVERCOMMIT_MAX_UNPAID;
}

/**
 * Access expiry: once a vendor has used all credits AND the 12-month cycle has
 * ended, the executive view is hidden until they buy again. Credits still roll
 * over (handled at cycle reset, not here).
 */
export function isExecViewHidden(args: {
  balance: CreditBalance;
  cycleEnded: boolean;
}): boolean {
  return args.cycleEnded && availableCredits(args.balance) <= 0;
}

// ── Date math (UTC; display localises elsewhere) ────────────────────────────

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + n);
  return r;
}

function addMonths(d: Date, n: number): Date {
  const r = new Date(d);
  r.setUTCMonth(r.getUTCMonth() + n);
  return r;
}

/** End of the 12-month access + band cycle, anchored at first purchase. */
export function cycleEndsAt(startedAt: Date): Date {
  return addMonths(startedAt, ACCESS_WINDOW_MONTHS);
}

/** Earliest an uncredited (overcommit) meeting may be scheduled after acceptance. */
export function earliestUncreditedSchedule(acceptedAt: Date): Date {
  return addDays(acceptedAt, UNCREDITED_LEAD_DAYS);
}

/** Payment must clear 30 days before the meeting; recomputes on reschedule. */
export function paymentDueAt(scheduledAt: Date): Date {
  return addDays(scheduledAt, -UNCREDITED_LEAD_DAYS);
}

/**
 * The far edge of the D2 payment-reminder window: an uncredited meeting is due a
 * reminder once its `payment_due_at` falls on or before this date (7 days out)
 * while still being in the future. The scan passes this so no date math lives in
 * SQL (mirrors how confirm/auto-cancel pass their dates in).
 */
export function paymentReminderWindowEnd(now: Date): Date {
  return addDays(now, PAYMENT_REMINDER_LEAD_DAYS);
}
