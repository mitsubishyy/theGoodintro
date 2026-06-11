import type { Tone } from "@thegoodintro/ui";

/** The vendor_status enum (SCHEMA.sql), in lifecycle order. */
export type VendorStatusEnum =
  | "signed_up"
  | "call_booked"
  | "approved"
  | "paid"
  | "active"
  | "dormant"
  | "churned";

/** The four pre-active pipeline states: the vendor exists but is not yet a live,
 *  paying customer. Grouped together for counts and the credits "—" placeholder. */
export const ONBOARDING_STATUSES = ["signed_up", "call_booked", "approved", "paid"] as const;

export function isOnboardingStatus(s: VendorStatusEnum): boolean {
  return (ONBOARDING_STATUSES as readonly string[]).includes(s);
}

/**
 * Single source of truth for how a vendor_status renders as a status pill, used
 * by BOTH the Vendors list and the vendor-detail header so the two never drift
 * (Admin Vendors list T3, locked 2026-06-02; 4-state expansion 2026-06-11).
 *
 * Every enum value gets its own operator-meaningful label, so the four pre-active
 * pipeline stages are no longer collapsed into one "Onboarding" pill. Tone
 * families follow the locked palette (admin = amber accent + muted only):
 *   - active + the four onboarding states -> amber-soft. Active earns its own
 *     gold treatment once a `--portal-gold` token lands; until then it is
 *     differentiated by its label, per the lock.
 *   - dormant / churned                   -> muted.
 */
export function vendorStatusPill(s: VendorStatusEnum): { label: string; tone: Tone } {
  switch (s) {
    case "signed_up":
      return { label: "Signed up", tone: "amber" };
    case "call_booked":
      return { label: "Call booked", tone: "amber" };
    case "approved":
      return { label: "Approved", tone: "amber" };
    case "paid":
      return { label: "Paid", tone: "amber" };
    case "active":
      return { label: "Active", tone: "amber" };
    case "dormant":
      return { label: "Dormant", tone: "muted" };
    case "churned":
      return { label: "Churned", tone: "muted" };
  }
}
