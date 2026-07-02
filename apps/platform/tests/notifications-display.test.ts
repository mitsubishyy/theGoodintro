import { describe, it, expect } from "vitest";
import {
  describeStaffNotification,
  type StaffNotificationContext,
} from "@/app/admin/notifications/_display";

/**
 * Pure unit tests for the staff in_app notification display mapping
 * (/admin/notifications). No DB: proves every currently-queued staff event maps
 * to the right title / link / manual flag, that unknown events are skipped, and
 * that missing context degrades gracefully instead of rendering "null".
 */

const base: StaffNotificationContext = { vendorName: "Atelier Ridgeway", execName: "Dana Cole" };

describe("describeStaffNotification", () => {
  it("maps every currently-queued staff in_app event", () => {
    const events = [
      "B1_request_live",
      "C1_confirm_time",
      "B5_decline_to_send",
      "C5_release_gift",
      "A4_invoice_paid_admin",
      "E1_reversal_admin",
      "B4_invoice_voided",
      "B4_reconcile_drift",
    ];
    for (const e of events) {
      const d = describeStaffNotification(e, base);
      expect(d, `${e} should map`).not.toBeNull();
      expect(d!.title.length).toBeGreaterThan(0);
      expect(d!.href.startsWith("/admin/")).toBe(true);
      expect(typeof d!.manual).toBe("boolean");
    }
  });

  it("returns null for events it has no wording for (vendor/other in_app, unknown)", () => {
    expect(describeStaffNotification("C6_meeting_completed", base)).toBeNull();
    expect(describeStaffNotification("C7_gift_confirmed", base)).toBeNull();
    expect(describeStaffNotification("B1_request_sent", base)).toBeNull();
    expect(describeStaffNotification("not_a_real_event", base)).toBeNull();
  });

  it("flags the manual follow-ups with a red dot, routine ones without", () => {
    const manual = ["B5_decline_to_send", "C5_release_gift", "E1_reversal_admin", "B4_invoice_voided"];
    const routine = ["B1_request_live", "C1_confirm_time", "A4_invoice_paid_admin", "B4_reconcile_drift"];
    for (const e of manual) expect(describeStaffNotification(e, base)!.manual, e).toBe(true);
    for (const e of routine) expect(describeStaffNotification(e, base)!.manual, e).toBe(false);
  });

  it("puts vendor and exec in the request-scoped rows", () => {
    expect(describeStaffNotification("B1_request_live", base)!.detail).toBe(
      "Atelier Ridgeway → Dana Cole",
    );
    expect(describeStaffNotification("C1_confirm_time", base)!.detail).toBe(
      "Atelier Ridgeway with Dana Cole",
    );
  });

  it("degrades gracefully when vendor/exec are unresolved", () => {
    const d = describeStaffNotification("B1_request_live", { vendorName: null, execName: null });
    expect(d!.detail).toBe("a vendor → an executive");
    expect(d!.detail).not.toContain("null");
  });

  it("formats the A4 payment row from amount + credits, and falls back cleanly", () => {
    const full = describeStaffNotification("A4_invoice_paid_admin", {
      ...base,
      amountCents: 150000,
      credits: 1,
    });
    expect(full!.detail).toBe("$1,500 · 1 credit added");
    const many = describeStaffNotification("A4_invoice_paid_admin", {
      ...base,
      amountCents: 450000,
      credits: 3,
    });
    expect(many!.detail).toBe("$4,500 · 3 credits added");
    const bare = describeStaffNotification("A4_invoice_paid_admin", base);
    expect(bare!.detail).toBe("Payment");
  });

  it("surfaces the E1 goodwill clause only when a paid gift was kept", () => {
    expect(
      describeStaffNotification("E1_reversal_admin", { ...base, giftPaidKept: true })!.detail,
    ).toContain("goodwill");
    expect(
      describeStaffNotification("E1_reversal_admin", { ...base, giftPaidKept: false })!.detail,
    ).not.toContain("goodwill");
  });

  it("resolves the B4 vendor from payload context and pluralises drift credits", () => {
    expect(describeStaffNotification("B4_invoice_voided", base)!.detail).toBe(
      "Atelier Ridgeway · manual reverse-unlock",
    );
    expect(
      describeStaffNotification("B4_reconcile_drift", { ...base, credits: 2 })!.detail,
    ).toBe("Payment webhook missed · Atelier Ridgeway · 2 credits unlocked");
  });
});
