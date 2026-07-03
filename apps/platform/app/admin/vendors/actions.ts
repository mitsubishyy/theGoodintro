"use server";

import { revalidatePath } from "next/cache";
import { requireStaff, getStaff } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { logAudit } from "@/lib/audit";
import { applyPaidInvoice } from "@/lib/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isOwnAvatarUrl } from "@/lib/upload/url";
import { isWorkEmailDomain } from "@/lib/email-domain";
import {
  createCreditPurchaseInvoice,
  getValidAccessToken,
  getInvoice,
  authoriseInvoice,
  emailInvoice,
  isRealXeroInvoiceId,
  canEmailInvoiceStatus,
  markLedgerInvoiceSent,
} from "@/lib/integrations/xero";
import { MEETING_FEE_CENTS, gstCentsForCredits } from "@thegoodintro/pricing";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export type FormState = { error?: string; ok?: boolean };

/**
 * Edit a vendor's profile fields (name, email_domain) — the vendor equivalent of
 * updateExecutiveAction. Staff-only, gated on admin_vendors_actions (CHANGE_SAFETY:
 * off by default), following the same shape as the other vendor-admin mutations.
 *
 * email_domain is a GUARDED field: it is UNIQUE and reserves the work-email domain
 * for the org at signup (private.signup_vendor), which rejects generic domains and
 * enforces one-org-per-domain. It does NOT gate an existing user's access: login
 * resolves a vendor_user by auth_user_id (lib/auth getVendor) and vendor_user RLS
 * keys on membership, never the current domain, so existing users keep access
 * across a domain change. We validate format + not-generic + uniqueness here and
 * reject a collision with a clear message before the DB unique constraint would.
 */
export async function updateVendorAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { staff, supabase } = await requireStaff();
  if (!(await getFlag("admin_vendors_actions"))) return { error: "Vendor management is not enabled." };

  const id = str(fd, "id");
  if (!id) return { error: "Missing vendor id." };
  const name = str(fd, "name");
  const emailDomain = str(fd, "email_domain").toLowerCase();
  if (!name || !emailDomain) return { error: "Name and email domain are required." };
  if (!isWorkEmailDomain(emailDomain)) {
    return { error: "Enter a valid work email domain, for example acme.com. Generic domains are not allowed." };
  }

  // Current values: to compute the changed-field set and skip a no-op write.
  const { data: current, error: readErr } = await supabase
    .from("vendor")
    .select("name, email_domain")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (readErr) return { error: readErr.message };
  if (!current) return { error: "Vendor not found." };

  // Uniqueness: another vendor already on this domain. Checked across ALL rows
  // (including archived) to match the column's plain unique constraint, which is
  // the backstop for a race past this pre-check.
  if (emailDomain !== current.email_domain) {
    const { data: clash } = await supabase
      .from("vendor")
      .select("id")
      .eq("email_domain", emailDomain)
      .neq("id", id)
      .limit(1)
      .maybeSingle();
    if (clash) return { error: "Another vendor already uses that email domain. Choose a different one." };
  }

  const changed: string[] = [];
  if (name !== current.name) changed.push("name");
  if (emailDomain !== current.email_domain) changed.push("email_domain");
  if (changed.length === 0) return { ok: true };

  const { error } = await supabase.from("vendor").update({ name, email_domain: emailDomain }).eq("id", id);
  if (error) {
    if (error.code === "23505") return { error: "Another vendor already uses that email domain. Choose a different one." };
    return { error: error.message };
  }

  await logAudit(supabase, staff.id, {
    action: "vendor.profile_updated",
    targetType: "vendor",
    targetId: id,
    metadata: { fields: changed },
  });
  revalidatePath(`/admin/vendors/${id}`);
  return { ok: true };
}

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
  const purchaseDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Real Xero invoice when the integration is on AND connected; otherwise the
  // stub. CHANGE_SAFETY: with integrations_xero off this is unchanged behaviour,
  // so existing tests and environments without a Xero connection are untouched.
  // The pricing engine's figures (feeExGst/gst) are authoritative; the real path
  // asserts Xero's computed totals equal them before recording (fails loud on a
  // tax/account misconfig) — money is never recomputed here.
  let xeroId = `STUB-${id.slice(-4)}-${Date.now()}`;
  let invoiceStatus: "draft" | "sent" = "sent";
  let xeroInvoiceNumber: string | null = null;
  const admin = createAdminClient();
  if (admin && (await getFlag("integrations_xero"))) {
    const { data: v } = await supabase.from("vendor").select("name").eq("id", id).maybeSingle();
    const { data: owner } = await supabase
      .from("vendor_user")
      .select("email")
      .eq("vendor_id", id)
      .eq("role", "owner")
      .is("deleted_at", null)
      .maybeSingle();
    const created = await createCreditPurchaseInvoice(admin, {
      vendorId: id,
      vendorName: (v?.name as string) ?? `Vendor ${id.slice(0, 8)}`,
      vendorEmail: (owner?.email as string) ?? undefined,
      quantity: credits,
      unitAmountCents: MEETING_FEE_CENTS,
      expectedSubTotalCents: feeExGst,
      expectedGstCents: gst,
      status: "DRAFT", // stage-2 test mode; stage 3 raises AUTHORISED to email + collect
      reference: `TGI-${id.slice(0, 8)}`,
    });
    if (created) {
      xeroId = created.invoiceId;
      xeroInvoiceNumber = created.invoiceNumber;
      invoiceStatus = "draft"; // mirror the Xero DRAFT state in our ledger
    }
  }

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
    status: invoiceStatus,
  });
  await logAudit(supabase, staff.id, {
    action: "invoice.issued",
    targetType: "vendor",
    targetId: id,
    metadata: { credits, xero_invoice_id: xeroId, xero_invoice_number: xeroInvoiceNumber },
  });
  revalidatePath(`/admin/vendors/${id}`);
}

/**
 * Authorise an issued DRAFT invoice in Xero (DRAFT -> AUTHORISED) so it becomes
 * payable. Does NOT email the vendor: authorise and email are decoupled (Issy
 * 2026-06-18) so a real invoice can be verified in Xero before any email goes
 * out. The ledger status is unchanged (stays 'draft' until the Email step;
 * invoice_status has no 'authorised' value). Behind integrations_xero +
 * vendor_payments; only acts on a real Xero invoice id (never a STUB).
 */
export async function authoriseInvoiceAction(fd: FormData): Promise<void> {
  const { staff, supabase } = await requireStaff();
  if (!(await getFlag("vendor_payments"))) return;
  if (!(await getFlag("integrations_xero"))) return;
  const vendorId = str(fd, "vendor_id");
  const xeroId = str(fd, "xero_invoice_id");
  if (!isRealXeroInvoiceId(xeroId)) return;

  const admin = createAdminClient();
  if (!admin) return;
  const tok = await getValidAccessToken(admin);
  if (!tok) return; // not connected

  await authoriseInvoice(tok.accessToken, tok.tenantId, xeroId);
  await logAudit(supabase, staff.id, {
    action: "invoice.authorised",
    targetType: "vendor",
    targetId: vendorId,
    metadata: { xero_invoice_id: xeroId },
  });
  revalidatePath(`/admin/vendors/${vendorId}`);
}

/**
 * Email an AUTHORISED invoice to the vendor via Xero, then flip the ledger
 * 'draft' -> 'sent'. emailInvoice sends a REAL email, so we first read the Xero
 * status and refuse to send unless the invoice is SUBMITTED/AUTHORISED/PAID — a
 * still-DRAFT (or VOIDED) invoice is a guarded no-op (authorise it first). The
 * ledger flip is idempotent (markLedgerInvoiceSent), so a double click or a
 * paid webhook that already advanced the row cannot regress or duplicate state.
 */
export async function emailInvoiceAction(fd: FormData): Promise<void> {
  const { staff, supabase } = await requireStaff();
  if (!(await getFlag("vendor_payments"))) return;
  if (!(await getFlag("integrations_xero"))) return;
  const vendorId = str(fd, "vendor_id");
  const xeroId = str(fd, "xero_invoice_id");
  if (!isRealXeroInvoiceId(xeroId)) return;

  const admin = createAdminClient();
  if (!admin) return;
  const tok = await getValidAccessToken(admin);
  if (!tok) return; // not connected

  // Guard: never email a draft (Xero would reject it, and it must be payable
  // first). Fetch-back the real Xero status before sending.
  const current = await getInvoice(tok.accessToken, tok.tenantId, xeroId);
  if (!canEmailInvoiceStatus(current.status)) {
    await logAudit(supabase, staff.id, {
      action: "invoice.email_skipped",
      targetType: "vendor",
      targetId: vendorId,
      metadata: { xero_invoice_id: xeroId, xero_status: current.status },
    });
    revalidatePath(`/admin/vendors/${vendorId}`);
    return;
  }

  await emailInvoice(tok.accessToken, tok.tenantId, xeroId);
  const ledger = await markLedgerInvoiceSent(supabase, xeroId);
  await logAudit(supabase, staff.id, {
    action: "invoice.emailed",
    targetType: "vendor",
    targetId: vendorId,
    metadata: { xero_invoice_id: xeroId, ledger },
  });
  revalidatePath(`/admin/vendors/${vendorId}`);
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

const VU_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Admin override: set or clear a vendor user's photo. The bytes already went
 * through the upload route (validate + sharp re-encode + storage write under the
 * staff session); this writes the returned public URL onto the vendor_user row,
 * origin-checked to our own avatars bucket, and audits it. Gated on
 * `vendor_photo_upload` (the same flag as vendor self-serve).
 */
export async function saveVendorUserPhotoAction(
  vendorUserId: string,
  photoUrl: string | null,
): Promise<{ ok?: boolean; error?: string }> {
  if (!(await getFlag("vendor_photo_upload"))) return { error: "Photo upload is not enabled." };
  if (!VU_UUID_RE.test(vendorUserId)) return { error: "Invalid target." };
  const supabase = await createClient();
  const staff = (await getStaff())?.staff;
  if (!staff) return { error: "Not authorized." };
  const url = (photoUrl ?? "").trim();
  if (url && !isOwnAvatarUrl(url)) return { error: "That photo could not be saved." };

  const { error } = await supabase.from("vendor_user").update({ photo_url: url || null }).eq("id", vendorUserId);
  if (error) return { error: error.message };

  await logAudit(supabase, staff.id, {
    action: url ? "vendor_user.photo_updated" : "vendor_user.photo_removed",
    targetType: "vendor_user",
    targetId: vendorUserId,
    metadata: {},
  });
  revalidatePath("/admin/vendors", "layout");
  return { ok: true };
}
