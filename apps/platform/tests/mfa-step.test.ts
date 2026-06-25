import { describe, it, expect } from "vitest";
import { requiredMfaStep } from "@/lib/auth";

/**
 * The admin_2fa_required enforcement decision (slice 2c, Part 1). Pure logic, so
 * it is unit-testable without a session. The property under test is fail-closed:
 * only a confirmed aal2 returns null (allowed); everything else routes the admin
 * to a step that keeps the cockpit out of reach.
 */
describe("requiredMfaStep (admin MFA fail-closed)", () => {
  it("allows only a confirmed aal2 session", () => {
    expect(requiredMfaStep({ currentLevel: "aal2", nextLevel: "aal2" })).toBeNull();
  });

  it("challenges (not enrols) an aal1 session that has a verified factor", () => {
    // nextLevel aal2 ⇒ a verified factor exists; sending them to enrol would be a
    // soft lock-out, so they go to the challenge.
    expect(requiredMfaStep({ currentLevel: "aal1", nextLevel: "aal2" })).toBe("challenge");
  });

  it("enrols an aal1 session with no verified factor", () => {
    expect(requiredMfaStep({ currentLevel: "aal1", nextLevel: "aal1" })).toBe("enroll");
  });

  it("fails closed to enrol when the AAL cannot be determined (null)", () => {
    expect(requiredMfaStep(null)).toBe("enroll");
  });
});
