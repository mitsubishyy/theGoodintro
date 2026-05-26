"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { logAudit } from "@/lib/audit";
import { applyPaidInvoice } from "@/lib/billing";
import { MEETING_FEE_CENTS } from "@thegoodintro/pricing";

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

/** Issue a Xero invoice (stub) for N credits. Admin fee is its own named line. */
export async function issueInvoiceAction(fd: FormData): Promise<void> {
  const { staff, supabase } = await requireStaff();
  if (!(await getFlag("vendor_payments"))) return;
  const id = str(fd, "vendor_id");
  const credits = Math.max(1, parseInt(str(fd, "credits") || "0", 10));
  if (!id || !credits) return;

  const amount = credits * MEETING_FEE_CENTS;
  const xeroId = `STUB-${id.slice(-4)}-${Date.now()}`;
  await supabase.from("invoice").insert({
    vendor_id: id,
    xero_invoice_id: xeroId,
    kind: "credit_purchase",
    line_items: [
      { name: `Meeting credits x${credits}`, quantity: credits, amount_cents: amount },
      { name: "Admin fee", amount_cents: 0 },
    ],
    amount_cents: amount,
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
