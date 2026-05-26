import type { SupabaseClient } from "@supabase/supabase-js";
import { MEETING_FEE_CENTS } from "@thegoodintro/pricing";
import { cycleEndsAt } from "@thegoodintro/pricing/ledger";

type LineItem = { name?: string; amount_cents?: number; quantity?: number };

/** Number of meeting credits an invoice buys (from the credits line's quantity). */
export function creditsFromLineItems(lineItems: unknown, amountCents: number): number {
  const items = Array.isArray(lineItems) ? (lineItems as LineItem[]) : [];
  const withQty = items.find((i) => typeof i.quantity === "number" && i.quantity > 0);
  if (withQty?.quantity) return withQty.quantity;
  return Math.max(0, Math.floor(amountCents / MEETING_FEE_CENTS));
}

export type ApplyResult = {
  status: "applied" | "already_paid" | "not_found";
  credits?: number;
};

/**
 * The single money-unlock path, shared by the Xero webhook (service-role
 * client) and the admin "simulate payment" action (staff client). Idempotent:
 * it atomically claims the invoice, so a webhook replay cannot double-credit.
 *
 *  - marks the invoice paid,
 *  - creates a CreditLot (credits roll over; this lot carries its origin),
 *  - anchors the 12-month cycle on first purchase (else reopens the window),
 *  - unlocks the vendor (status active, access_expires_at),
 *  - queues the receipt + admin notifications.
 */
export async function applyPaidInvoice(
  supabase: SupabaseClient,
  xeroInvoiceId: string,
): Promise<ApplyResult> {
  const { data: invoice } = await supabase
    .from("invoice")
    .select("id, vendor_id, line_items, amount_cents, status")
    .eq("xero_invoice_id", xeroInvoiceId)
    .maybeSingle();
  if (!invoice) return { status: "not_found" };
  if (invoice.status === "paid") return { status: "already_paid" };

  // Atomically claim: only one caller flips draft/sent -> paid.
  const { data: claimed } = await supabase
    .from("invoice")
    .update({ status: "paid" })
    .eq("id", invoice.id)
    .neq("status", "paid")
    .select("id");
  if (!claimed || claimed.length === 0) return { status: "already_paid" };

  const credits = creditsFromLineItems(invoice.line_items, invoice.amount_cents);

  await supabase.from("credit_lot").insert({
    vendor_id: invoice.vendor_id,
    quantity: credits,
    quantity_remaining: credits,
    invoice_id: invoice.id,
  });

  const { data: vendor } = await supabase
    .from("vendor")
    .select("cycle_started_at, owner_user_id")
    .eq("id", invoice.vendor_id)
    .single();

  const now = new Date();
  const ends = cycleEndsAt(now);

  if (!vendor?.cycle_started_at) {
    await supabase.from("cycle").insert({
      vendor_id: invoice.vendor_id,
      started_at: now.toISOString(),
      ends_at: ends.toISOString(),
      held_meetings_count: 0,
    });
    await supabase
      .from("vendor")
      .update({
        status: "active",
        cycle_started_at: now.toISOString(),
        access_expires_at: ends.toISOString(),
      })
      .eq("id", invoice.vendor_id);
  } else {
    // Re-purchase reopens the access window.
    await supabase
      .from("vendor")
      .update({ status: "active", access_expires_at: ends.toISOString() })
      .eq("id", invoice.vendor_id);
  }

  await supabase.from("notification").insert([
    {
      recipient_type: "vendor_user",
      recipient_id: vendor?.owner_user_id ?? null,
      channel: "email",
      event: "A4_invoice_paid",
      status: "queued",
    },
    {
      recipient_type: "staff",
      recipient_id: null,
      channel: "in_app",
      event: "A4_invoice_paid_admin",
      status: "queued",
    },
  ]);

  return { status: "applied", credits };
}
