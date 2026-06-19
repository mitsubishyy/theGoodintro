import { describe, it, expect } from "vitest";
import {
  creditFlat,
  creditLabel,
  giftLabel,
  needsAttention,
  statusPill,
  chipKind,
  type MeetingItem,
  type MeetingStatusEnum,
} from "../app/admin/meetings/_status";

/**
 * Money-path unit tests for the Admin Meetings list (CHANGE_SAFETY: tests on the
 * money + state-machine paths). The Credit column must match the state machine
 * exactly and the Gift column must show the frozen per-band amount on Held only,
 * never the $1,500 fee. Pure — no DB.
 */

function meeting(over: Partial<MeetingItem> & { status: MeetingStatusEnum }): MeetingItem {
  return {
    id: "m1",
    scheduledIso: "2026-06-20T03:00:00.000Z",
    creditLotId: null,
    paymentDueIso: null,
    joinUrl: null,
    vendorName: "Vellum Partners",
    execName: "Priya Raghavan",
    execLabel: "CFO, Acme",
    execTitle: "CFO",
    execCompany: "Acme",
    execPhotoUrl: null,
    execLinkedinUrl: null,
    execContextNotes: "Focused on payments modernisation.",
    execInterestedIn: null,
    execCurrentProjects: null,
    execNotInterestedIn: null,
    execTimeline: null,
    execSenioritySignal: null,
    charityName: "RFDS",
    giftAmountCents: null,
    requesterName: "Sam Patel",
    requesterRole: "member",
    requesterEmail: "sam@acme.test",
    requestQ1: "Who do you want to meet?",
    requestQ2: "Why this person?",
    requestSubmittedIso: "2026-06-10T00:00:00.000Z",
    ...over,
  };
}

describe("credit column (one credit = $1,500, state-machine accurate)", () => {
  it("sources the flat value from MEETING_FEE_AUD", () => {
    expect(creditFlat()).toBe("$1,500");
  });

  it("proposed → None", () => {
    expect(creditLabel(meeting({ status: "proposed" }))).toBe("None");
  });

  it("confirmed with a reserved credit → Reserved · $1,500", () => {
    expect(creditLabel(meeting({ status: "confirmed", creditLotId: "lot-1" }))).toBe("Reserved · $1,500");
  });

  it("confirmed overcommit (no credit) → Awaiting payment", () => {
    expect(creditLabel(meeting({ status: "confirmed", creditLotId: null }))).toBe("Awaiting payment");
  });

  it("held → Consumed · $1,500", () => {
    expect(creditLabel(meeting({ status: "held", creditLotId: "lot-1" }))).toBe("Consumed · $1,500");
  });

  it("released states show no figure (credit returned by releaseMeeting)", () => {
    // The mock's "No-show → Consumed · $1,500" is a mock error: releaseMeeting
    // nulls credit_lot_id for both no_show and cancelled, so no amount is shown.
    for (const status of ["no_show", "cancelled", "reversed"] as const) {
      expect(creditLabel(meeting({ status }))).toBe("—");
    }
  });
});

describe("gift column (frozen charity amount, Held only — never the fee)", () => {
  it("held with a frozen amount shows that exact amount, not $1,500", () => {
    const label = giftLabel(meeting({ status: "held", giftAmountCents: 100_000 }));
    expect(label).toBe("$1,000");
    expect(label).not.toBe("$1,500");
  });

  it("held without a gift record shows a dash", () => {
    expect(giftLabel(meeting({ status: "held", giftAmountCents: null }))).toBe("—");
  });

  it("every non-held status shows a dash regardless of any amount", () => {
    for (const status of ["proposed", "confirmed", "no_show", "cancelled", "reversed"] as const) {
      expect(giftLabel(meeting({ status, giftAmountCents: 120_000 }))).toBe("—");
    }
  });
});

describe("needs-attention (derived money flag, not a status)", () => {
  it("is a confirmed overcommit awaiting payment", () => {
    expect(needsAttention(meeting({ status: "confirmed", creditLotId: null }))).toBe(true);
  });
  it("is not a confirmed meeting with a reserved credit", () => {
    expect(needsAttention(meeting({ status: "confirmed", creditLotId: "lot-1" }))).toBe(false);
  });
  it("is not proposed (proposed is its own legend category)", () => {
    expect(needsAttention(meeting({ status: "proposed" }))).toBe(false);
  });
});

describe("status pills + calendar chip kinds", () => {
  it("maps each status to a stable pill label + tone", () => {
    expect(statusPill("confirmed")).toEqual({ label: "Confirmed", tone: "neutral" });
    expect(statusPill("held")).toEqual({ label: "Held", tone: "green" });
    expect(statusPill("proposed")).toEqual({ label: "Proposed", tone: "amber" });
    expect(statusPill("no_show")).toEqual({ label: "No-show", tone: "muted" });
    expect(statusPill("cancelled")).toEqual({ label: "Cancelled", tone: "muted" });
    expect(statusPill("reversed")).toEqual({ label: "Reversed", tone: "muted" });
  });

  it("buckets chips: held / attention / proposed / ended / confirmed", () => {
    expect(chipKind(meeting({ status: "held" }))).toBe("held");
    expect(chipKind(meeting({ status: "confirmed", creditLotId: null }))).toBe("attention");
    expect(chipKind(meeting({ status: "confirmed", creditLotId: "lot-1" }))).toBe("confirmed");
    expect(chipKind(meeting({ status: "proposed" }))).toBe("proposed");
    expect(chipKind(meeting({ status: "cancelled" }))).toBe("ended");
    expect(chipKind(meeting({ status: "no_show" }))).toBe("ended");
  });
});
