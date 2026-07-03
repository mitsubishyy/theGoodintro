import { formatAud } from "@/lib/format";

/**
 * Display mapping for the staff ACTIVITY LOG (/admin/notifications). This surface
 * is an append-only log of staff-directed events, NOT a to-do list: the
 * notification table has no read-state, so rows never clear, and framing them as
 * tasks would be dishonest (a "release the gift" entry stays after the gift is
 * paid). Each entry states what happened; `alert` flags the ones worth a human's
 * eye, it does not imply an outstanding action.
 *
 * The notification table stores only the event key + context (request_id /
 * payload), NOT the human wording. The copy lives in NOTIFICATION_TEMPLATES.md
 * and, for email, is built by the drain's composers. in_app rows have no composer,
 * so this is their renderer: one mapping from an event + its resolved context to a
 * display row. Kept dependency-free (no DB, no React) so it is unit-testable and
 * the page stays thin; its only side effect is a console.warn on a genuinely
 * unhandled event (observability, so a new staff event cannot vanish silently).
 *
 * Scope: the eight staff-recipient in_app events currently queued anywhere in the
 * loop (audited 2026-07-02):
 *
 *   B1_request_live       submit_request (0013)
 *   C1_confirm_time       act_on_request_token accept (0028)
 *   B5_decline_to_send    act_on_request_token decline (0028)
 *   C5_release_gift       mark_held (0027)
 *   A4_invoice_paid_admin apply_paid_invoice (0027)
 *   E1_reversal_admin     reverseHeld wrapper (lib/meetings.ts)
 *   B4_invoice_voided     reconcile (lib/integrations/xero.ts)
 *   B4_reconcile_drift    reconcile (lib/integrations/xero.ts)
 *
 * The four vendor-directed in_app events (B1_request_sent, C6_meeting_completed,
 * C7_gift_confirmed, E1_reversal_rebook) are KNOWN but not for this surface, so
 * they return null silently. Anything else returns null AND warns.
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
  /** Where the row links in the admin portal (parent route, read-only) so the
   *  operator can open the related record. A link, not a task action. */
  href: string;
  /** Alert = worth a human's eye (red dot); routine/informational = amber. This
   *  flags noteworthiness in the log, it does NOT mean an outstanding task. */
  alert: boolean;
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
        alert: false,
      };
    case "C1_confirm_time":
      return {
        title: "Exec accepted",
        detail: `${vendor} with ${exec} · time to be confirmed`,
        href: "/admin/meetings",
        alert: false,
      };
    case "B5_decline_to_send":
      return {
        title: "Exec declined",
        detail: `${vendor} re ${exec} · draft reply queued`,
        href: "/admin/requests",
        alert: true,
      };
    case "C5_release_gift":
      return {
        title: "Meeting held",
        detail: `${vendor} with ${exec} · gift released`,
        href: "/admin/giving",
        alert: true,
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
        alert: false,
      };
    }
    case "E1_reversal_admin": {
      const goodwill = ctx.giftPaidKept ? " · paid gift kept as a goodwill cost" : "";
      return {
        title: "Meeting reversed",
        detail: `Credit returned to ${vendor}; rebooking with ${exec}${goodwill}`,
        href: "/admin/meetings",
        alert: true,
      };
    }
    case "B4_invoice_voided":
      return {
        title: "Invoice voided in Xero",
        detail: `${vendor} · flagged for manual reverse-unlock`,
        href: "/admin/vendors",
        alert: true,
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
        alert: false,
      };
    }
    // Known vendor-directed in_app events: valid, but not for the staff surface.
    // Skip silently (no warn) so the page's staff-only filter is belt-and-braces.
    case "B1_request_sent":
    case "C6_meeting_completed":
    case "C7_gift_confirmed":
    case "E1_reversal_rebook":
      return null;
    default:
      // A staff in_app event with no mapping here would otherwise vanish from the
      // log. Warn so a newly added event is noticed, then skip (never invent copy).
      console.warn(`[admin/activity] unhandled staff notification event: ${event}`);
      return null;
  }
}
