import { describe, it, expect, vi, afterEach } from "vitest";
import {
  describeStaffNotification,
  isFeedTruncated,
  FEED_LIMIT,
  type StaffNotificationContext,
} from "@/app/admin/notifications/_display";

/**
 * Pure unit tests for the staff activity-log display mapping
 * (/admin/notifications). No DB: proves every currently-queued staff event maps
 * to the right title / link / alert flag, that KNOWN vendor events are skipped
 * silently while a genuinely unhandled event warns (so it cannot vanish
 * unnoticed), and that missing context degrades gracefully instead of "null".
 */

const base: StaffNotificationContext = { vendorName: "Atelier Ridgeway", execName: "Dana Cole" };

afterEach(() => {
  vi.restoreAllMocks();
});

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
      expect(typeof d!.alert).toBe("boolean");
    }
  });

  it("skips KNOWN vendor in_app events silently (null, no warn)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    for (const e of ["B1_request_sent", "C6_meeting_completed", "C7_gift_confirmed", "E1_reversal_rebook"]) {
      expect(describeStaffNotification(e, base), e).toBeNull();
    }
    expect(warn).not.toHaveBeenCalled();
  });

  it("warns (with the event string) on a genuinely unhandled event, then returns null", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(describeStaffNotification("Z9_made_up_event", base)).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.join(" ")).toContain("Z9_made_up_event");
  });

  it("flags the alert events with a red dot, routine ones without", () => {
    const alert = ["B5_decline_to_send", "C5_release_gift", "E1_reversal_admin", "B4_invoice_voided"];
    const routine = ["B1_request_live", "C1_confirm_time", "A4_invoice_paid_admin", "B4_reconcile_drift"];
    for (const e of alert) expect(describeStaffNotification(e, base)!.alert, e).toBe(true);
    for (const e of routine) expect(describeStaffNotification(e, base)!.alert, e).toBe(false);
  });

  it("puts vendor and exec in the request-scoped rows", () => {
    expect(describeStaffNotification("B1_request_live", base)!.detail).toBe(
      "Atelier Ridgeway → Dana Cole",
    );
    expect(describeStaffNotification("C1_confirm_time", base)!.detail).toBe(
      "Atelier Ridgeway with Dana Cole · time to be confirmed",
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
      "Atelier Ridgeway · flagged for manual reverse-unlock",
    );
    expect(
      describeStaffNotification("B4_reconcile_drift", { ...base, credits: 2 })!.detail,
    ).toBe("Payment webhook missed · Atelier Ridgeway · 2 credits unlocked");
  });
});

describe("isFeedTruncated", () => {
  // The page fetches FEED_LIMIT + 1 and passes the FETCHED count here. Truncation
  // is true only when that extra row came back, so exactly FEED_LIMIT total events
  // must NOT be flagged as truncated (the honesty fix).
  it("is false when fewer than or exactly FEED_LIMIT events exist", () => {
    expect(isFeedTruncated(0)).toBe(false);
    expect(isFeedTruncated(FEED_LIMIT - 1)).toBe(false);
    expect(isFeedTruncated(FEED_LIMIT)).toBe(false); // exactly full, nothing older
  });

  it("is true only once the extra fetched row proves older events exist", () => {
    expect(isFeedTruncated(FEED_LIMIT + 1)).toBe(true);
  });
});
