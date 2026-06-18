import { describe, it, expect } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import {
  isInvoicePaid,
  verifyXeroSignature,
  processInvoiceEvents,
  type InvoiceStatusRead,
} from "../lib/integrations/xero";

describe("isInvoicePaid", () => {
  it("treats PAID, or AUTHORISED with zero due, as paid", () => {
    expect(isInvoicePaid({ status: "PAID", amountDueCents: 0 })).toBe(true);
    expect(isInvoicePaid({ status: "PAID", amountDueCents: null })).toBe(true);
    expect(isInvoicePaid({ status: "AUTHORISED", amountDueCents: 0 })).toBe(true);
  });
  it("treats unpaid / partly-paid / draft as not paid", () => {
    expect(isInvoicePaid({ status: "AUTHORISED", amountDueCents: 495000 })).toBe(false);
    expect(isInvoicePaid({ status: "DRAFT", amountDueCents: null })).toBe(false);
    expect(isInvoicePaid({ status: "VOIDED", amountDueCents: 0 })).toBe(false);
  });
});

describe("verifyXeroSignature", () => {
  const key = "test-signing-key";
  const body = JSON.stringify({ events: [], lastEventSequence: 1 });
  const good = crypto.createHmac("sha256", key).update(body).digest("base64");

  it("accepts a correct base64 HMAC-SHA256 signature (ITR -> 200)", () => {
    expect(verifyXeroSignature(body, good, key)).toBe(true);
  });
  it("rejects a tampered body, a wrong signature, and a wrong key (ITR -> 401)", () => {
    expect(verifyXeroSignature(body + " ", good, key)).toBe(false);
    expect(verifyXeroSignature(body, "AAAA", key)).toBe(false);
    expect(verifyXeroSignature(body, good, "other-key")).toBe(false);
  });
});

describe("processInvoiceEvents (paid webhook -> credit unlock)", () => {
  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const svc = (): SupabaseClient =>
    createClient(URL, SERVICE_KEY, { auth: { persistSession: false } });
  const paid = (): InvoiceStatusRead => ({ status: "PAID", amountDueCents: 0, invoiceNumber: "INV-T" });

  it("unlocks credits for a paid INVOICE event, skips non-INVOICE/unpaid, and is idempotent", async () => {
    const sb = svc();
    const stamp = Date.now();
    // Self-contained throwaway vendor so the test never touches shared rows.
    const { data: vendor, error: vErr } = await sb
      .from("vendor")
      .insert({ name: "WH Verify Co", email_domain: `wh-verify-${stamp}.test`, status: "approved" })
      .select("id")
      .single();
    expect(vErr).toBeNull();
    const vendorId = vendor!.id as string;
    const xeroId = `WH-TEST-${stamp}`;
    const { data: inv } = await sb
      .from("invoice")
      .insert({
        vendor_id: vendorId,
        xero_invoice_id: xeroId,
        kind: "credit_purchase",
        line_items: [{ name: "Meeting credits x3", quantity: 3, amount_cents: 450000 }],
        amount_cents: 450000,
        status: "sent",
      })
      .select("id")
      .single();
    const invoiceId = inv!.id as string;

    try {
      // A non-INVOICE event is ignored.
      const contactEvt = await processInvoiceEvents(
        sb,
        [{ eventCategory: "CONTACT", resourceId: xeroId, eventType: "UPDATE" }],
        async () => paid(),
      );
      expect(contactEvt).toEqual({ processed: 0, unlocked: 0 });

      // An INVOICE event that is not yet paid does not unlock.
      const notPaid = await processInvoiceEvents(
        sb,
        [{ eventCategory: "INVOICE", resourceId: xeroId, eventType: "UPDATE" }],
        async () => ({ status: "AUTHORISED", amountDueCents: 450000, invoiceNumber: "INV-T" }),
      );
      expect(notPaid).toEqual({ processed: 1, unlocked: 0 });
      const { data: still } = await sb.from("invoice").select("status").eq("id", invoiceId).single();
      expect(still!.status).toBe("sent");

      // A paid INVOICE event unlocks exactly once; a dupe in the same batch is deduped.
      const first = await processInvoiceEvents(
        sb,
        [
          { eventCategory: "INVOICE", resourceId: xeroId, eventType: "UPDATE" },
          { eventCategory: "INVOICE", resourceId: xeroId, eventType: "UPDATE" },
        ],
        async () => paid(),
      );
      expect(first).toEqual({ processed: 1, unlocked: 1 });

      const { data: paidInv } = await sb.from("invoice").select("status").eq("id", invoiceId).single();
      expect(paidInv!.status).toBe("paid");
      const { data: lot } = await sb
        .from("credit_lot")
        .select("quantity, quantity_remaining")
        .eq("invoice_id", invoiceId)
        .single();
      expect(lot).toMatchObject({ quantity: 3, quantity_remaining: 3 });
      const { data: v2 } = await sb.from("vendor").select("status").eq("id", vendorId).single();
      expect(v2!.status).toBe("active");

      // Replay (Xero re-sends): idempotent, no second unlock.
      const replay = await processInvoiceEvents(
        sb,
        [{ eventCategory: "INVOICE", resourceId: xeroId, eventType: "UPDATE" }],
        async () => paid(),
      );
      expect(replay).toEqual({ processed: 1, unlocked: 0 });
    } finally {
      await sb.from("credit_lot").delete().eq("vendor_id", vendorId);
      await sb.from("invoice").delete().eq("vendor_id", vendorId);
      await sb.from("cycle").delete().eq("vendor_id", vendorId);
      await sb.from("vendor").delete().eq("id", vendorId);
    }
  });
});
