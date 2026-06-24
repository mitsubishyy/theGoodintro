import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  confirmMeeting,
  markHeld,
  cancelProposedMeeting,
  closeRequest,
} from "../lib/meetings";
import { applyPaidInvoice } from "../lib/billing";

/**
 * Atomicity / concurrency / idempotency proofs for the 0027 transition layer.
 * These are the guarantees that did NOT exist when each transition was a sequence
 * of separate PostgREST calls: no over-reservation under concurrent confirms, no
 * duplicate band position under concurrent helds, no double-credit on a webhook
 * replay, and no half-applied state when a transition fails partway.
 *
 * Runs against a DEDICATED vendor (off the seed's Alpha/Beta) so it can never
 * collide with the seed-pinned reporting invariants or the other suites that run
 * in parallel.
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PASSWORD = "Passw0rd!test";

const RILEY = "00000000-0000-0000-0000-00000000ec02";
const CHARITY = "00000000-0000-0000-0000-00000000c1a2";
const VENDOR = "00000000-0000-0000-0000-0000000a7011";
const VUSER = "00000000-0000-0000-0000-0000000a7012";

/** Staff session (how the admin actions call the transitions). */
async function admin(): Promise<SupabaseClient> {
  const c = createClient(URL, PUBLISHABLE, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email: "admin@thegoodintro.test", password: PASSWORD });
  if (error) throw new Error(error.message);
  return c;
}

/** Service-role client: setup/teardown + the webhook's apply-paid path. */
function service(): SupabaseClient {
  return createClient(URL, SECRET, { auth: { persistSession: false } });
}

async function freshVendor(svc: SupabaseClient) {
  await svc.from("request").delete().eq("vendor_id", VENDOR); // cascades meetings + gifts
  await svc.from("credit_lot").delete().eq("vendor_id", VENDOR);
  await svc.from("cycle").delete().eq("vendor_id", VENDOR);
  await svc.from("invoice").delete().eq("vendor_id", VENDOR);
  await svc.from("vendor_user").delete().eq("id", VUSER);
  await svc.from("vendor").delete().eq("id", VENDOR);
  await svc.from("vendor").insert({ id: VENDOR, name: "Atomic Test Co", email_domain: "atomic.test", status: "active" });
  await svc.from("vendor_user").insert({ id: VUSER, vendor_id: VENDOR, email: "a@atomic.test", name: "Atom", role: "owner", status: "active" });
  await svc.from("vendor").update({ owner_user_id: VUSER }).eq("id", VENDOR);
}

async function newProposed(svc: SupabaseClient, status: "accepted" | "submitted" = "accepted") {
  const { data: req } = await svc
    .from("request")
    .insert({ vendor_id: VENDOR, requested_by_user_id: VUSER, executive_id: RILEY, q1_what: "x", q2_why: "y", status })
    .select("id")
    .single();
  const { data: m } = await svc
    .from("meeting")
    .insert({ request_id: req!.id, charity_id: CHARITY, status: "proposed" })
    .select("id")
    .single();
  return { reqId: req!.id as string, meetingId: m!.id as string };
}

beforeEach(async () => {
  await freshVendor(service());
});

afterAll(async () => {
  const svc = service();
  await svc.from("request").delete().eq("vendor_id", VENDOR);
  await svc.from("credit_lot").delete().eq("vendor_id", VENDOR);
  await svc.from("cycle").delete().eq("vendor_id", VENDOR);
  await svc.from("invoice").delete().eq("vendor_id", VENDOR);
  await svc.from("vendor_user").delete().eq("id", VUSER);
  await svc.from("vendor").delete().eq("id", VENDOR);
});

describe("atomic transition layer (0027)", () => {
  it("concurrent confirms cannot both claim the last credit (no over-reservation)", async () => {
    const sb = await admin();
    const svc = service();
    await svc.from("credit_lot").insert({ vendor_id: VENDOR, quantity: 1, quantity_remaining: 1 });
    const { meetingId: m1 } = await newProposed(svc);
    const { meetingId: m2 } = await newProposed(svc);
    const future = new Date(Date.now() + 7 * 864e5).toISOString();

    const [c1, c2] = await Promise.all([
      confirmMeeting(sb, m1, future, null),
      confirmMeeting(sb, m2, future, null),
    ]);
    expect(c1.ok && c2.ok).toBe(true);

    const reserved = [c1, c2].filter((r) => r.ok && r.detail === "reserved").length;
    const overcommit = [c1, c2].filter((r) => r.ok && r.detail === "overcommit").length;
    expect(reserved).toBe(1); // exactly one — the per-vendor lock prevents both reserving
    expect(overcommit).toBe(1);

    const { data: ms } = await svc.from("meeting").select("credit_lot_id").in("id", [m1, m2]);
    expect((ms ?? []).filter((m) => m.credit_lot_id).length).toBe(1);
  });

  it("concurrent helds get distinct band positions and a correct cycle count (no lost update)", async () => {
    const sb = await admin();
    const svc = service();
    await svc.from("credit_lot").insert({ vendor_id: VENDOR, quantity: 2, quantity_remaining: 2 });
    const { meetingId: m1 } = await newProposed(svc);
    const { meetingId: m2 } = await newProposed(svc);
    const future = new Date(Date.now() + 7 * 864e5).toISOString();
    await confirmMeeting(sb, m1, future, null);
    await confirmMeeting(sb, m2, future, null);

    const [h1, h2] = await Promise.all([markHeld(sb, m1, "admin"), markHeld(sb, m2, "admin")]);
    expect(h1.ok && h2.ok).toBe(true);

    const { data: gifts } = await svc
      .from("gift_record")
      .select("position_n")
      .in("meeting_id", [m1, m2])
      .order("position_n", { ascending: true });
    expect((gifts ?? []).map((g) => g.position_n)).toEqual([1, 2]); // distinct, not [1,1]

    const { data: cyc } = await svc.from("cycle").select("held_meetings_count").eq("vendor_id", VENDOR).single();
    expect(cyc?.held_meetings_count).toBe(2); // not 1 (lost update)

    const { data: lot } = await svc.from("credit_lot").select("quantity_remaining").eq("vendor_id", VENDOR).single();
    expect(lot?.quantity_remaining).toBe(0); // both credits consumed

    // each held wrote its audit row
    const { data: au } = await svc.from("audit_entry").select("id").eq("action", "meeting.held").in("target_id", [m1, m2]);
    expect((au ?? []).length).toBe(2);
  });

  it("apply_paid_invoice is idempotent on replay (one credit lot, second call is already_paid)", async () => {
    const svc = service();
    const { data: inv } = await svc
      .from("invoice")
      .insert({
        vendor_id: VENDOR, xero_invoice_id: "XERO-ATOMIC-REPLAY", kind: "credit_purchase",
        line_items: [{ name: "Credits x5", quantity: 5, amount_cents: 750000 }], amount_cents: 750000, status: "sent",
      })
      .select("id")
      .single();

    const r1 = await applyPaidInvoice(svc, "XERO-ATOMIC-REPLAY");
    expect(r1).toMatchObject({ status: "applied", credits: 5 });
    const r2 = await applyPaidInvoice(svc, "XERO-ATOMIC-REPLAY");
    expect(r2.status).toBe("already_paid");

    const { data: lots } = await svc.from("credit_lot").select("id").eq("invoice_id", inv!.id);
    expect((lots ?? []).length).toBe(1); // never double-credited
  });

  it("concurrent apply_paid_invoice still credits exactly once", async () => {
    const svc = service();
    const { data: inv } = await svc
      .from("invoice")
      .insert({
        vendor_id: VENDOR, xero_invoice_id: "XERO-ATOMIC-CONCURRENT", kind: "credit_purchase",
        line_items: [{ name: "Credits x5", quantity: 5, amount_cents: 750000 }], amount_cents: 750000, status: "sent",
      })
      .select("id")
      .single();

    const [a, b] = await Promise.all([
      applyPaidInvoice(service(), "XERO-ATOMIC-CONCURRENT"),
      applyPaidInvoice(service(), "XERO-ATOMIC-CONCURRENT"),
    ]);
    expect([a.status, b.status].sort()).toEqual(["already_paid", "applied"]);

    const { data: lots } = await svc.from("credit_lot").select("id").eq("invoice_id", inv!.id);
    expect((lots ?? []).length).toBe(1);
  });

  it("a mid-transition failure rolls the whole transition back (no paid invoice without credits)", async () => {
    const svc = service();
    // A zero-credit invoice makes the credit_lot insert violate quantity > 0,
    // which must roll back the invoice 'paid' claim made earlier in the same
    // function. The OLD multi-call code left the invoice paid with no credits.
    await svc
      .from("invoice")
      .insert({
        vendor_id: VENDOR, xero_invoice_id: "XERO-ATOMIC-ZERO", kind: "credit_purchase",
        line_items: [], amount_cents: 0, status: "sent",
      });

    await expect(applyPaidInvoice(service(), "XERO-ATOMIC-ZERO")).rejects.toThrow();

    const { data: inv } = await svc.from("invoice").select("status").eq("xero_invoice_id", "XERO-ATOMIC-ZERO").single();
    expect(inv?.status).not.toBe("paid"); // claim rolled back
    const { data: lots } = await svc.from("credit_lot").select("id").eq("vendor_id", VENDOR);
    expect((lots ?? []).length).toBe(0);
  });

  it("close_request closes a submitted request once, then rejects (and audits)", async () => {
    const sb = await admin();
    const svc = service();
    const { reqId } = await newProposed(svc, "submitted");

    const res = await closeRequest(sb, reqId);
    expect(res).toMatchObject({ ok: true, detail: "closed" });
    const { data: r } = await svc.from("request").select("status").eq("id", reqId).single();
    expect(r?.status).toBe("closed");
    const { data: au } = await svc.from("audit_entry").select("id").eq("action", "request.closed").eq("target_id", reqId);
    expect((au ?? []).length).toBe(1);

    const again = await closeRequest(sb, reqId);
    expect(again.ok).toBe(false); // already closed -> bad_state
  });

  it("cancel_proposed_meeting cancels a proposed meeting (and audits)", async () => {
    const sb = await admin();
    const svc = service();
    const { meetingId } = await newProposed(svc);

    const res = await cancelProposedMeeting(sb, meetingId);
    expect(res).toMatchObject({ ok: true, detail: "cancelled" });
    const { data: m } = await svc.from("meeting").select("status").eq("id", meetingId).single();
    expect(m?.status).toBe("cancelled");
    const { data: au } = await svc.from("audit_entry").select("id").eq("action", "meeting.cancelled").eq("target_id", meetingId);
    expect((au ?? []).length).toBe(1);
  });

  it("re-confirming a reserved meeting is a no-op that keeps the credit (never flips to overcommit)", async () => {
    const sb = await admin();
    const svc = service();
    await svc.from("credit_lot").insert({ vendor_id: VENDOR, quantity: 1, quantity_remaining: 1 });
    const { meetingId } = await newProposed(svc);
    const future = new Date(Date.now() + 7 * 864e5).toISOString();

    const c1 = await confirmMeeting(sb, meetingId, future, null);
    expect(c1).toMatchObject({ ok: true, detail: "reserved" });
    const { data: m1 } = await svc.from("meeting").select("credit_lot_id").eq("id", meetingId).single();
    expect(m1?.credit_lot_id).not.toBeNull();

    // double-click / form replay must not strip the reservation
    const c2 = await confirmMeeting(sb, meetingId, future, null);
    expect(c2).toMatchObject({ ok: true, detail: "reserved" });
    const { data: m2 } = await svc.from("meeting").select("credit_lot_id, status").eq("id", meetingId).single();
    expect(m2?.credit_lot_id).toBe(m1?.credit_lot_id);
    expect(m2?.status).toBe("confirmed");
  });

  it("paying a late invoice reserves the oldest waiting overcommit meeting, so held consumes a credit (DEC-8)", async () => {
    const sb = await admin();
    const svc = service();
    // overcommit: confirm with no credit available
    const { meetingId } = await newProposed(svc);
    const oc = await confirmMeeting(sb, meetingId, null, null);
    expect(oc).toMatchObject({ ok: true, detail: "overcommit" });
    const { data: pre } = await svc.from("meeting").select("credit_lot_id, payment_due_at").eq("id", meetingId).single();
    expect(pre?.credit_lot_id).toBeNull();
    expect(pre?.payment_due_at).not.toBeNull();

    await svc.from("invoice").insert({
      vendor_id: VENDOR, xero_invoice_id: "XERO-OC-1", kind: "credit_purchase",
      line_items: [{ name: "Credits x1", quantity: 1, amount_cents: 150000 }], amount_cents: 150000, status: "sent",
    });
    const paid = await applyPaidInvoice(service(), "XERO-OC-1");
    expect(paid.status).toBe("applied");

    // the waiting meeting is now reserved and its deadline cleared
    const { data: post } = await svc.from("meeting").select("credit_lot_id, payment_due_at").eq("id", meetingId).single();
    expect(post?.credit_lot_id).not.toBeNull();
    expect(post?.payment_due_at).toBeNull();

    // holding it consumes the paid credit instead of minting a free gift
    const held = await markHeld(sb, meetingId, "admin");
    expect(held.ok).toBe(true);
    const { data: lot } = await svc.from("credit_lot").select("quantity_remaining").eq("vendor_id", VENDOR).single();
    expect(lot?.quantity_remaining).toBe(0);
  });

  it("close_request revokes the request's active exec link", async () => {
    const sb = await admin();
    const svc = service();
    const { reqId } = await newProposed(svc, "submitted");
    await svc.from("email_action_token").insert({ request_id: reqId, token: `tok-${reqId}`, status: "active" });

    const res = await closeRequest(sb, reqId);
    expect(res).toMatchObject({ ok: true, detail: "closed" });
    const { data: tok } = await svc.from("email_action_token").select("status").eq("request_id", reqId).single();
    expect(tok?.status).toBe("revoked");
  });
});
