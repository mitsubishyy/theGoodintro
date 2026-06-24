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
 * The single money-unlock path, shared by the Xero webhook (service-role client)
 * and the admin "simulate payment" action (staff client). Runs as ONE atomic
 * Postgres function (public.apply_paid_invoice, migration 0027): it locks and
 * claims the invoice, then unlocks credits, anchors/reopens the cycle, activates
 * the vendor, and queues the receipt — all in one transaction.
 *
 * Idempotent: a replay sees the already-claimed invoice and no-ops, so it can
 * never double-credit; and unlike the previous multi-call version, a failure
 * partway can no longer leave a paid invoice with no credits.
 *
 * The credit count and cycle dates are computed here from @thegoodintro/pricing
 * (the single source of money math) and passed into the RPC.
 */
export async function applyPaidInvoice(
  supabase: SupabaseClient,
  xeroInvoiceId: string,
): Promise<ApplyResult> {
  // line_items + amount are immutable (set at invoice creation), so deriving the
  // credit count here and passing it in carries no race with the claim.
  const { data: invoice } = await supabase
    .from("invoice")
    .select("line_items, amount_cents")
    .eq("xero_invoice_id", xeroInvoiceId)
    .maybeSingle();
  if (!invoice) return { status: "not_found" };

  const credits = creditsFromLineItems(invoice.line_items, invoice.amount_cents);
  const now = new Date();

  const { data, error } = await supabase.rpc("apply_paid_invoice", {
    p_xero_invoice_id: xeroInvoiceId,
    p_credits: credits,
    p_cycle_ends_at: cycleEndsAt(now).toISOString(),
    p_now: now.toISOString(),
  });
  if (error) throw new Error(error.message);
  return data as ApplyResult;
}
