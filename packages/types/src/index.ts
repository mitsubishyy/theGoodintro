/**
 * Shared platform types — single source for entity shapes, enums, and money.
 *
 * Seeded from DATA_MODEL.md. This is intentionally minimal at Step 0; the
 * foundation pillar fills in full entity types alongside the Supabase schema
 * and generated DB types. Keep these in sync with DATA_MODEL.md, which is the
 * source of truth for fields and statuses.
 */

/** Money is always whole AUD cents (integers), never floats. See DATA_MODEL.md. */
export type AudCents = number;

/** 1 credit = 1 meeting = $1,500 AUD. Read band amounts live from pricing, never hardcode. */
export const MEETING_PRICE_CENTS: AudCents = 150_000;

/** Every meeting in v1 is a fixed 45-minute conversation. */
export const MEETING_MINUTES = 45;

// ── Status enums (mirror DATA_MODEL.md / STATE_MACHINES.md) ──────────────

export type VendorStatus =
  | "signed_up"
  | "call_booked"
  | "approved"
  | "paid"
  | "active"
  | "dormant"
  | "churned";

export type VendorUserRole = "owner" | "member";
export type VendorUserStatus = "invited" | "active" | "removed";

export type ExecutiveStatus = "invited" | "set_up" | "active" | "paused" | "left";

export type ApplicationOutcome = "pending" | "approved" | "declined";

export type InvoiceKind = "credit_purchase" | "overcommit_topup";
export type InvoiceStatus = "draft" | "sent" | "paid" | "void";

export type RequestStatus = "submitted" | "accepted" | "declined" | "closed";

export type MeetingStatus =
  | "proposed"
  | "confirmed"
  | "held"
  | "no_show"
  | "cancelled"
  | "reversed";

export type MeetingOutcomeSource = "zoom_teams_api" | "vendor_reported" | "admin";

export type GiftBand = "band_1" | "band_2" | "band_3" | "band_4";
export type GiftStatus = "released" | "paid" | "voided";

export type StaffRole = "super_admin" | "staff";

export type ActorType = "staff" | "vendor_user" | "ea" | "system";
export type NotificationChannel = "email" | "in_app" | "slack";
export type NotificationStatus = "queued" | "sent" | "failed";
