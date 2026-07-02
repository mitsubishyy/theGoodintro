import { formatAud } from "@/lib/format";

/**
 * Display mapping for the staff-directed in_app notification feed
 * (/admin/notifications). The notification table stores only the event key +
 * context (request_id / payload), NOT the human wording — the copy lives in
 * NOTIFICATION_TEMPLATES.md and, for email, is built by the drain's composers.
 * in_app rows have no composer, so this is their renderer: one pure mapping from
 * an event + its resolved context to a display row. Kept pure (no DB, no React)
 * so it is unit-testable and the page component stays thin.
 *
 * Scope: the eight staff-recipient in_app events currently queued anywhere in the
 * loop (audited 2026-07-02). Any other event returns null so the feed silently
 * skips rows it has no wording for, rather than inventing copy.
 *
 *   B1_request_live       submit_request (0013)
 *   C1_confirm_time       act_on_request_token accept (0028)
 *   B5_decline_to_send    act_on_request_token decline (0028)
 *   C5_release_gift       mark_held (0027)
 *   A4_invoice_paid_admin apply_paid_invoice (0027)
 *   E1_reversal_admin     reverseHeld wrapper (lib/meetings.ts)
 *   B4_invoice_voided     reconcile (lib/integrations/xero.ts)
 *   B4_reconcile_drift    reconcile (lib/integrations/xero.ts)
 */

export interface StaffNotificationContext {
  /** Resolved from request_id (B1/C1/B5/C5/E1) or payload.vendor_id (B4). */
  vendorName: string | null;
  /** Resolved from request_id (B1/C1/B5/C5/E1). Null for A4/B4. */
  execName: string | null;
  /** A4 payload. */
  amountCents?: number | null;
  /** A4 / B4_reconcile_drift payload. */
  credits?: number | null;
  /** E1_reversal_admin payload: a paid gift stood as a goodwill cost. */
  giftPaidKept?: boolean;
}

export interface StaffNotificationDisplay {
  title: string;
  detail: string;
  /** Where the row links in the admin portal (parent route, read-only). */
  href: string;
  /** Manual follow-up = red dot (mirrors the dashboard Needs Action legend);
   *  routine/informational = amber. */
  manual: boolean;
}

const vendorOr = (n: string | null) => n?.trim() || "a vendor";
const execOr = (n: string | null) => n?.trim() || "an executive";

export function describeStaffNotification(
  event: string,
  ctx: StaffNotificationContext,
): StaffNotificationDisplay | null {
  const vendor = vendorOr(ctx.vendorName);
  const exec = execOr(ctx.execName);
  switch (event) {
    case "B1_request_live":
      return {
        title: "Request live",
        detail: `${vendor} → ${exec}`,
        href: "/admin/requests",
        manual: false,
      };
    case "C1_confirm_time":
      return {
        title: "Confirm a time",
        detail: `${vendor} with ${exec}`,
        href: "/admin/meetings",
        manual: false,
      };
    case "B5_decline_to_send":
      return {
        title: "Decline to send",
        detail: `${vendor} re ${exec} · review the draft`,
        href: "/admin/requests",
        manual: true,
      };
    case "C5_release_gift":
      return {
        title: "Release the gift",
        detail: `Meeting held · ${vendor} with ${exec}`,
        href: "/admin/giving",
        manual: true,
      };
    case "A4_invoice_paid_admin": {
      const amount =
        typeof ctx.amountCents === "number" ? formatAud(ctx.amountCents) : "Payment";
      const credits =
        typeof ctx.credits === "number"
          ? ` · ${ctx.credits} credit${ctx.credits === 1 ? "" : "s"} added`
          : "";
      return {
        title: "Payment received",
        detail: `${amount}${credits}`,
        href: "/admin/vendors",
        manual: false,
      };
    }
    case "E1_reversal_admin": {
      const goodwill = ctx.giftPaidKept ? " · paid gift kept as a goodwill cost" : "";
      return {
        title: "Reversal, rebook",
        detail: `Credit returned to ${vendor}; rebook with ${exec}${goodwill}`,
        href: "/admin/meetings",
        manual: true,
      };
    }
    case "B4_invoice_voided":
      return {
        title: "Invoice voided in Xero",
        detail: `${vendor} · manual reverse-unlock`,
        href: "/admin/vendors",
        manual: true,
      };
    case "B4_reconcile_drift": {
      const credits =
        typeof ctx.credits === "number"
          ? ` · ${ctx.credits} credit${ctx.credits === 1 ? "" : "s"} unlocked`
          : "";
      return {
        title: "Reconcile drift",
        detail: `Payment webhook missed · ${vendor}${credits}`,
        href: "/admin/vendors",
        manual: false,
      };
    }
    default:
      return null;
  }
}
