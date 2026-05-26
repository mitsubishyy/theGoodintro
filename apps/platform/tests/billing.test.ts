import { describe, it, expect } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { applyPaidInvoice } from "../lib/billing";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const PASSWORD = "Passw0rd!test";
const BETA = "00000000-0000-0000-0000-00000000bd01";

async function admin(): Promise<SupabaseClient> {
  const c = createClient(URL, KEY, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({
    email: "admin@thegoodintro.test",
    password: PASSWORD,
  });
  if (error) throw new Error(error.message);
  return c;
}

describe("applyPaidInvoice (money unlock path)", () => {
  it("creates credits, unlocks the vendor, and is idempotent", async () => {
    const sb = await admin();
    const xeroId = `TEST-${Date.now()}`;

    const { data: inv, error } = await sb
      .from("invoice")
      .insert({
        vendor_id: BETA,
        xero_invoice_id: xeroId,
        kind: "credit_purchase",
        line_items: [{ name: "Meeting credits x3", quantity: 3, amount_cents: 450000 }],
        amount_cents: 450000,
        status: "sent",
      })
      .select("id")
      .single();
    expect(error).toBeNull();

    const first = await applyPaidInvoice(sb, xeroId);
    expect(first.status).toBe("applied");
    expect(first.credits).toBe(3);

    const replay = await applyPaidInvoice(sb, xeroId);
    expect(replay.status).toBe("already_paid");

    const { data: vendor } = await sb.from("vendor").select("status").eq("id", BETA).single();
    expect(vendor?.status).toBe("active");

    const { data: lot } = await sb
      .from("credit_lot")
      .select("quantity, quantity_remaining")
      .eq("invoice_id", inv!.id)
      .single();
    expect(lot?.quantity).toBe(3);
    expect(lot?.quantity_remaining).toBe(3);

    // cleanup (keep staging tidy / re-runnable)
    await sb.from("credit_lot").delete().eq("invoice_id", inv!.id);
    await sb.from("invoice").delete().eq("id", inv!.id);
  });

  it("returns not_found for an unknown invoice", async () => {
    const sb = await admin();
    const r = await applyPaidInvoice(sb, "DOES-NOT-EXIST");
    expect(r.status).toBe("not_found");
  });
});
