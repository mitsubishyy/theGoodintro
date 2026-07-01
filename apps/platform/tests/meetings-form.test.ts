import { describe, it, expect } from "vitest";
import { parseNewMeetingForm } from "../lib/meetings-form";

/**
 * Pure unit tests for the admin new-meeting form parser (no DB). The DB-create
 * itself (createProposedMeeting) is covered by the DB-backed meetings.test.ts;
 * this guards the required-field, default, clamp, and time-normalisation rules.
 */

const base = { vendorId: "v1", executiveId: "e1", charityId: "", q1What: "", q2Why: "", scheduledAt: "", joinUrl: "" };

describe("parseNewMeetingForm", () => {
  it("requires a vendor and an executive", () => {
    expect(parseNewMeetingForm({ ...base, vendorId: "" })).toEqual({ ok: false, error: "Pick a vendor." });
    expect(parseNewMeetingForm({ ...base, executiveId: "  " })).toEqual({ ok: false, error: "Pick an executive." });
  });

  it("defaults the two required question fields and leaves it proposed when no time is given", () => {
    const r = parseNewMeetingForm(base);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.q1What.length).toBeGreaterThan(0);
    expect(r.value.q2Why.length).toBeGreaterThan(0);
    expect(r.value.scheduledAtISO).toBeNull();
    expect(r.value.charityId).toBeNull();
    expect(r.value.joinUrl).toBeNull();
  });

  it("clamps the question fields to 300 chars (the column's check constraint)", () => {
    const r = parseNewMeetingForm({ ...base, q1What: "x".repeat(500) });
    if (!r.ok) throw new Error("expected ok");
    expect(r.value.q1What).toHaveLength(300);
  });

  it("normalises a valid time to ISO and rejects an invalid one", () => {
    const r = parseNewMeetingForm({ ...base, scheduledAt: "2026-07-01T10:30:00Z" });
    if (!r.ok) throw new Error("expected ok");
    expect(r.value.scheduledAtISO).toBe("2026-07-01T10:30:00.000Z");
    expect(parseNewMeetingForm({ ...base, scheduledAt: "not-a-date" })).toEqual({
      ok: false,
      error: "That meeting time is not a valid date.",
    });
  });

  it("trims a chosen charity and join URL", () => {
    const r = parseNewMeetingForm({ ...base, charityId: " c9 ", joinUrl: " https://x.test " });
    if (!r.ok) throw new Error("expected ok");
    expect(r.value.charityId).toBe("c9");
    expect(r.value.joinUrl).toBe("https://x.test");
  });
});
