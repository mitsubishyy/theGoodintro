import { describe, it, expect } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  isRealXeroInvoiceId,
  canEmailInvoiceStatus,
  markLedgerInvoiceSent,
} from "../lib/integrations/xero";

// Stage 3b: the decoupled Authorise / Email admin actions. The Xero API calls
// (authoriseInvoice / emailInvoice) are thin wrappers exercised live; what is
// worth testing here is the guard + ledger state path that money/state safety
// depends on — kept network-free (pure guards) or local-DB (ledger flip).

describe("isRealXeroInvoiceId", () => {
  it("treats a real Xero InvoiceID (GUID / INV-…) as actionable", () => {
    expect(isRealXeroInvoiceId("e1d2c3b4-0000-1111-2222-333344445555")).toBe(true);
    expect(isRealXeroInvoiceId("INV-0001")).toBe(true);
  });
  it("rejects the STUB fallback id and empty values", () => {
    expect(isRealXeroInvoiceId("STUB-abcd-1718700000000")).toBe(false);
    expect(isRealXeroInvoiceId("")).toBe(false);
    expect(isRealXeroInvoiceId(null)).toBe(false);
    expect(isRealXeroInvoiceId(undefined)).toBe(false);
  });
});

describe("canEmailInvoiceStatus", () => {
  it("allows emailing only payable Xero states", () => {
    expect(canEmailInvoiceStatus("AUTHORISED")).toBe(true);
    expect(canEmailInvoiceStatus("SUBMITTED")).toBe(true);
    expect(canEmailInvoiceStatus("PAID")).toBe(true);
  });
  it("refuses to email a draft or voided/deleted invoice", () => {
    expect(canEmailInvoiceStatus("DRAFT")).toBe(false);
    expect(canEmailInvoiceStatus("VOIDED")).toBe(false);
    expect(canEmailInvoiceStatus("DELETED")).toBe(false);
  });
});

describe("markLedgerInvoiceSent (draft -> sent ledger flip)", () => {
  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const svc = (): SupabaseClient =>
    createClient(URL, SERVICE_KEY, { auth: { persistSession: false } });

  it("flips a draft invoice to sent once, is idempotent, and guards bad inputs", async () => {
    const sb = svc();
    const stamp = Date.now();
    // Self-contained throwaway vendor so the test never touches shared rows.
    const { data: vendor, error: vErr } = await sb
      .from("vendor")
      .insert({ name: "AS Verify Co", email_domain: `as-verify-${stamp}.test`, status: "approved" })
      .select("id")
      .single();
    expect(vErr).toBeNull();
    const vendorId = vendor!.id as string;
    const xeroId = `AS-TEST-${stamp}`;
    const { data: inv } = await sb
      .from("invoice")
      .insert({
        vendor_id: vendorId,
        xero_invoice_id: xeroId,
        kind: "credit_purchase",
        line_items: [{ name: "Meeting credits x3", quantity: 3, amount_cents: 450000 }],
        amount_cents: 450000,
        status: "draft",
      })
      .select("id")
      .single();
    const invoiceId = inv!.id as string;

    try {
      // Unknown id -> not_found (e.g. a STUB invoice never recorded under this key).
      expect(await markLedgerInvoiceSent(sb, `MISSING-${stamp}`)).toBe("not_found");

      // First call flips draft -> sent.
      expect(await markLedgerInvoiceSent(sb, xeroId)).toBe("sent");
      const { data: afterFirst } = await sb
        .from("invoice")
        .select("status")
        .eq("id", invoiceId)
        .single();
      expect(afterFirst!.status).toBe("sent");

      // Second call is a no-op (already advanced) — never regresses or re-sends.
      expect(await markLedgerInvoiceSent(sb, xeroId)).toBe("not_draft");

      // A paid invoice is left untouched (the webhook already advanced it).
      await sb.from("invoice").update({ status: "paid" }).eq("id", invoiceId);
      expect(await markLedgerInvoiceSent(sb, xeroId)).toBe("not_draft");
      const { data: stillPaid } = await sb
        .from("invoice")
        .select("status")
        .eq("id", invoiceId)
        .single();
      expect(stillPaid!.status).toBe("paid");
    } finally {
      await sb.from("invoice").delete().eq("vendor_id", vendorId);
      await sb.from("vendor").delete().eq("id", vendorId);
    }
  });
});
