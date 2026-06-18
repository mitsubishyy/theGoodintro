import { describe, it, expect } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  reconcileXeroInvoices,
  type InvoiceStatusRead,
} from "../lib/integrations/xero";

// Stage 4: the daily reconcile (the paid-webhook safety net, B4). The Xero
// status read is injected, so the full money/state path runs on the local
// stack without live Xero — exactly the unlock + void-detection logic.

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const svc = (): SupabaseClient =>
  createClient(URL, SERVICE_KEY, { auth: { persistSession: false } });

const status = (s: string, amountDueCents: number | null = 0): InvoiceStatusRead => ({
  status: s,
  amountDueCents,
  invoiceNumber: "INV-R",
});

describe("reconcileXeroInvoices (paid-webhook safety net)", () => {
  it("unlocks missed payments (drift), flags voided-paid for manual reverse-unlock, voids never-paid, and is idempotent", async () => {
    const sb = svc();
    const stamp = Date.now();
    // Throwaway vendors so the sweep over ALL invoices never touches shared rows.
    const mk = async (suffix: string, vstatus = "approved") => {
      const { data } = await sb
        .from("vendor")
        .insert({ name: `RC ${suffix}`, email_domain: `rc-${suffix}-${stamp}.test`, status: vstatus })
        .select("id")
        .single();
      return data!.id as string;
    };
    const driftVendor = await mk("drift");
    const voidPaidVendor = await mk("voidpaid", "active");
    const voidOpenVendor = await mk("voidopen");

    const insInvoice = async (
      vendorId: string,
      xeroId: string,
      invStatus: "draft" | "sent" | "paid",
      qty = 3,
    ) => {
      const { data } = await sb
        .from("invoice")
        .insert({
          vendor_id: vendorId,
          xero_invoice_id: xeroId,
          kind: "credit_purchase",
          line_items: [{ name: `Meeting credits x${qty}`, quantity: qty, amount_cents: qty * 150000 }],
          amount_cents: qty * 150000,
          status: invStatus,
        })
        .select("id")
        .single();
      return data!.id as string;
    };

    const driftId = `RC-DRIFT-${stamp}`;
    const voidPaidId = `RC-VOIDPAID-${stamp}`;
    const voidOpenId = `RC-VOIDOPEN-${stamp}`;
    const stubId = `STUB-rc-${stamp}`;

    const driftInv = await insInvoice(driftVendor, driftId, "sent");
    const voidPaidInv = await insInvoice(voidPaidVendor, voidPaidId, "paid");
    const voidOpenInv = await insInvoice(voidOpenVendor, voidOpenId, "sent");
    // A STUB fallback invoice must be skipped entirely (no Xero counterpart).
    const stubInv = await insInvoice(driftVendor, stubId, "sent");

    // Inject Xero's view of each invoice keyed on our stored id. The sweep is
    // global, so any pre-existing/seed/concurrent invoice (e.g. XERO-TEST-0001)
    // also reaches the fetcher — return a benign non-actionable status for those
    // so they are a guaranteed no-op (never unlocked or voided by this test).
    const xeroView: Record<string, InvoiceStatusRead> = {
      [driftId]: status("PAID", 0), // paid in Xero, our ledger still 'sent' => drift
      [voidPaidId]: status("VOIDED", 0), // paid by us, now voided => reverse-unlock
      [voidOpenId]: status("VOIDED", 0), // never paid, voided => housekeeping void
    };
    const fetched = new Set<string>();
    const fetchStatus = async (id: string): Promise<InvoiceStatusRead> => {
      fetched.add(id);
      return xeroView[id] ?? status("AUTHORISED", 999999); // unknown => unpaid, no-op
    };

    try {
      const first = await reconcileXeroInvoices(sb, fetchStatus);
      // Our three real invoices are checked (global sweep may include seed rows,
      // so >= 3); the STUB is skipped before any fetch; our isolated outcomes are
      // exact because unknown rows are forced to a no-op status.
      expect(first.checked).toBeGreaterThanOrEqual(3);
      expect(fetched.has(stubId)).toBe(false);
      expect(first.driftUnlocked).toBe(1);
      expect(first.voidedPaid).toBe(1);
      expect(first.voidedUnpaid).toBe(1);
      expect(first.errors).toBe(0);

      // Drift: ledger now paid, credits unlocked, vendor active.
      const { data: drift } = await sb.from("invoice").select("status").eq("id", driftInv).single();
      expect(drift!.status).toBe("paid");
      const { data: lot } = await sb
        .from("credit_lot")
        .select("quantity")
        .eq("invoice_id", driftInv)
        .single();
      expect(lot!.quantity).toBe(3);
      const { data: dv } = await sb.from("vendor").select("status").eq("id", driftVendor).single();
      expect(dv!.status).toBe("active");

      // Voided-paid: stays 'paid' (NEVER auto-reversed), stamped for manual action.
      const { data: vp } = await sb
        .from("invoice")
        .select("status, voided_in_xero_at")
        .eq("id", voidPaidInv)
        .single();
      expect(vp!.status).toBe("paid");
      expect(vp!.voided_in_xero_at).not.toBeNull();

      // Voided-open: never paid => closed as void.
      const { data: vo } = await sb.from("invoice").select("status").eq("id", voidOpenInv).single();
      expect(vo!.status).toBe("void");

      // STUB untouched.
      const { data: stub } = await sb.from("invoice").select("status").eq("id", stubInv).single();
      expect(stub!.status).toBe("sent");

      // A reverse-unlock alert was queued exactly once for the voided-paid invoice.
      const { data: alerts } = await sb
        .from("notification")
        .select("id")
        .eq("event", "B4_invoice_voided")
        .contains("payload", { invoice_id: voidPaidInv });
      expect(alerts!.length).toBe(1);

      // Second run: nothing new (idempotent). Drift already paid, void already
      // stamped; the void-open invoice now has status 'void' so it drops out of
      // the sweep (our two remaining real rows are still checked => >= 2).
      const second = await reconcileXeroInvoices(sb, fetchStatus);
      expect(second.checked).toBeGreaterThanOrEqual(2);
      expect(second.driftUnlocked).toBe(0);
      expect(second.voidedPaid).toBe(0);
      expect(second.voidedUnpaid).toBe(0);

      // Still exactly one alert (no duplicate task on re-run).
      const { data: alerts2 } = await sb
        .from("notification")
        .select("id")
        .eq("event", "B4_invoice_voided")
        .contains("payload", { invoice_id: voidPaidInv });
      expect(alerts2!.length).toBe(1);
    } finally {
      for (const v of [driftVendor, voidPaidVendor, voidOpenVendor]) {
        await sb.from("credit_lot").delete().eq("vendor_id", v);
        await sb.from("invoice").delete().eq("vendor_id", v);
        await sb.from("cycle").delete().eq("vendor_id", v);
        await sb.from("vendor").delete().eq("id", v);
      }
    }
  });
});
