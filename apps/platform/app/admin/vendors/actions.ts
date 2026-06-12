"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { logAudit } from "@/lib/audit";
import { applyPaidInvoice } from "@/lib/billing";
import { MEETING_FEE_CENTS, gstCentsForCredits } from "@thegoodintro/pricing";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

/** Approve a vetted vendor: unlocks payment. */
export async function approveVendorAction(fd: FormData): Promise<void> {
  const { staff, supabase } = await requireStaff();
  if (!(await getFlag("vendor_payments"))) return;
  const id = str(fd, "vendor_id");
  if (!id) return;

  await supabase.from("vendor").update({ status: "approved" }).eq("id", id);
  await supabase
    .from("application")
    .update({ outcome: "approved", decided_by: staff.id })
    .eq("vendor_id", id)
    .eq("outcome", "pending");
  await logAudit(supabase, staff.id, {
    action: "vendor.approved",
    targetType: "vendor",
    targetId: id,
  });
  revalidatePath(`/admin/vendors/${id}`);
}

/**
 * Issue a Xero invoice (stub) for N credits: a flat $1,500 ex-GST per credit
 * plus its GST, and the purchase-ledger columns reporting reads.
 *
 * No "admin fee" line: the vendor always pays the flat fee, and the per-meeting
 * keep ($600/$500/$400/$300 by band) is band-dependent and frozen onto each
 * gift_record only when a meeting is held (CALCULATIONS.md 0.1 / 1), so it is
 * never knowable or charged at purchase time.
 */
export async function issueInvoiceAction(fd: FormData): Promise<void> {
  const { staff, supabase } = await requireStaff();
  if (!(await getFlag("vendor_payments"))) return;
  const id = str(fd, "vendor_id");
  const credits = Math.max(1, parseInt(str(fd, "credits") || "0", 10));
  if (!id || !credits) return;

  const feeExGst = credits * MEETING_FEE_CENTS;
  const gst = gstCentsForCredits(credits);
  const xeroId = `STUB-${id.slice(-4)}-${Date.now()}`;
  const purchaseDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  await supabase.from("invoice").insert({
    vendor_id: id,
    xero_invoice_id: xeroId,
    kind: "credit_purchase",
    line_items: [
      { name: `Meeting credits x${credits}`, quantity: credits, amount_cents: feeExGst },
      { name: "GST (10%)", amount_cents: gst },
    ],
    // amount_cents stays the ex-GST fee total (the platform's ex-GST
    // convention; reporting/credit-granting never depend on it). GST is held in
    // gst_cents for the BAS/GST report and is never revenue.
    amount_cents: feeExGst,
    // Purchase-ledger / GST-BAS columns (SCHEMA invoice v2 §3). Without these,
    // loadPurchaseLedger (which filters quantity is not null) skips the paid
    // invoice entirely, so cash-collected + GST reports would miss the sale.
    fee_ex_gst_cents: feeExGst,
    gst_cents: gst,
    quantity: credits,
    purchase_date: purchaseDate,
    status: "sent",
  });
  await logAudit(supabase, staff.id, {
    action: "invoice.issued",
    targetType: "vendor",
    targetId: id,
    metadata: { credits, xero_invoice_id: xeroId },
  });
  revalidatePath(`/admin/vendors/${id}`);
}

/**
 * Archive vendors from the list (row overflow / bulk bar, T3 chunk B).
 * Soft delete only: sets deleted_at, which every list/report query already
 * filters on, so nothing is destroyed and an unarchive is a column reset.
 * Gated on the admin_vendors_actions flag (off by default, CHANGE_SAFETY.md).
 */
export async function archiveVendorsAction(vendorIds: string[]): Promise<{ archived: number }> {
  const { staff, supabase } = await requireStaff();
  if (!(await getFlag("admin_vendors_actions"))) return { archived: 0 };
  const ids = vendorIds.filter((id) => typeof id === "string" && id.length > 0);
  if (ids.length === 0) return { archived: 0 };

  const { data } = await supabase
    .from("vendor")
    .update({ deleted_at: new Date().toISOString() })
    .in("id", ids)
    .is("deleted_at", null)
    .select("id");
  const archived = data ?? [];
  for (const row of archived) {
    await logAudit(supabase, staff.id, {
      action: "vendor.archived",
      targetType: "vendor",
      targetId: row.id as string,
    });
  }
  revalidatePath("/admin/vendors");
  return { archived: archived.length };
}

/**
 * Simulate the Xero "paid" webhook for staging (the real path is the
 * signature-verified webhook + service role). Runs the same applyPaidInvoice.
 */
export async function simulatePaidAction(fd: FormData): Promise<void> {
  const { staff, supabase } = await requireStaff();
  if (!(await getFlag("vendor_payments"))) return;
  const vendorId = str(fd, "vendor_id");
  const xeroId = str(fd, "xero_invoice_id");
  if (!xeroId) return;

  const result = await applyPaidInvoice(supabase, xeroId);
  await logAudit(supabase, staff.id, {
    action: "invoice.simulated_paid",
    targetType: "vendor",
    targetId: vendorId,
    metadata: { xero_invoice_id: xeroId, result: result.status },
  });
  revalidatePath(`/admin/vendors/${vendorId}`);
}
