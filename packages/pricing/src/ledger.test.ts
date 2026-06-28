import { describe, it, expect } from "vitest";
import {
  availableCredits,
  hasAvailableCredit,
  canOverbook,
  isExecViewHidden,
  cycleEndsAt,
  earliestUncreditedSchedule,
  paymentDueAt,
  paymentReminderWindowEnd,
  OVERCOMMIT_MAX_UNPAID,
} from "./ledger";

describe("credit balance", () => {
  it("available = purchased - consumed - reserved", () => {
    expect(availableCredits({ purchased: 10, consumed: 3, reserved: 2 })).toBe(5);
  });
  it("reserving at booking lowers available immediately", () => {
    const before = availableCredits({ purchased: 2, consumed: 0, reserved: 0 });
    const after = availableCredits({ purchased: 2, consumed: 0, reserved: 1 });
    expect(before).toBe(2);
    expect(after).toBe(1);
  });
  it("hasAvailableCredit reflects a positive balance", () => {
    expect(hasAvailableCredit({ purchased: 1, consumed: 0, reserved: 0 })).toBe(true);
    expect(hasAvailableCredit({ purchased: 1, consumed: 0, reserved: 1 })).toBe(false);
  });
});

describe("overcommit cap", () => {
  it("allows up to 4 booked-but-unpaid meetings", () => {
    expect(canOverbook(0)).toBe(true);
    expect(canOverbook(OVERCOMMIT_MAX_UNPAID - 1)).toBe(true);
    expect(canOverbook(OVERCOMMIT_MAX_UNPAID)).toBe(false);
    expect(canOverbook(OVERCOMMIT_MAX_UNPAID + 1)).toBe(false);
  });
});

describe("access expiry", () => {
  it("hides the exec view only when out of credits AND the cycle ended", () => {
    const empty = { purchased: 3, consumed: 3, reserved: 0 };
    const some = { purchased: 3, consumed: 1, reserved: 0 };
    expect(isExecViewHidden({ balance: empty, cycleEnded: true })).toBe(true);
    expect(isExecViewHidden({ balance: empty, cycleEnded: false })).toBe(false);
    expect(isExecViewHidden({ balance: some, cycleEnded: true })).toBe(false);
  });
});

describe("cycle + uncredited dates (UTC)", () => {
  it("cycle ends 12 months after first purchase", () => {
    expect(cycleEndsAt(new Date("2026-05-26T00:00:00Z")).toISOString())
      .toBe("2027-05-26T00:00:00.000Z");
  });
  it("uncredited meeting is at least 30 days after acceptance", () => {
    expect(earliestUncreditedSchedule(new Date("2026-06-01T00:00:00Z")).toISOString())
      .toBe("2026-07-01T00:00:00.000Z");
  });
  it("payment is due 30 days before the meeting", () => {
    expect(paymentDueAt(new Date("2026-07-01T00:00:00Z")).toISOString())
      .toBe("2026-06-01T00:00:00.000Z");
  });
  it("the payment-reminder window reaches 7 days past now", () => {
    expect(paymentReminderWindowEnd(new Date("2026-06-01T00:00:00Z")).toISOString())
      .toBe("2026-06-08T00:00:00.000Z");
  });
});
