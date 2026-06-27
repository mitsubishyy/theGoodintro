import { describe, it, expect, beforeAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { nextStep, shapeVendorRequestRow, type RawVendorRequest } from "../app/vendor/requests/_rows";

/**
 * Read-only /vendor/requests list. Pure tests cover the "what happens next"
 * copy and the row shaping; the DB test proves the page's exact select runs
 * under a VENDOR RLS session and is tenant-scoped (Alpha sees its own requests,
 * Beta sees none), with the executive + meeting embeds resolving. Reuses the
 * seed login users from seed_staging.sql (same as rls.test.ts).
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const PASSWORD = "Passw0rd!test";

// The exact select the page issues (kept in lock-step with app/vendor/requests/page.tsx).
const SELECT =
  "id, status, created_at, executive:executive_id ( name, title, company ), meeting ( status, scheduled_at, created_at )";

async function signIn(email: string): Promise<SupabaseClient> {
  const client = createClient(URL, KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await client.auth.signInWithPassword({ email, password: PASSWORD });
  if (error) throw new Error(`sign-in failed for ${email}: ${error.message}`);
  return client;
}

describe("nextStep (what happens next)", () => {
  it("derives copy from the request status when there is no meeting", () => {
    expect(nextStep("submitted", null)).toMatch(/waiting on the executive/i);
    expect(nextStep("declined", null)).toMatch(/declined/i);
    expect(nextStep("closed", null)).toMatch(/closed by thegoodintro/i);
    expect(nextStep("accepted", null)).toMatch(/arranging a time/i);
  });
  it("derives copy from the live meeting state once accepted", () => {
    const at = "2024-05-01T00:00:00Z";
    expect(nextStep("accepted", { status: "proposed", scheduledIso: null })).toMatch(/arranging a time/i);
    expect(nextStep("accepted", { status: "confirmed", scheduledIso: at })).toMatch(/time confirmed/i);
    expect(nextStep("accepted", { status: "held", scheduledIso: at })).toMatch(/meeting complete/i);
    expect(nextStep("accepted", { status: "no_show", scheduledIso: at })).toMatch(/missed/i);
    expect(nextStep("accepted", { status: "cancelled", scheduledIso: at })).toMatch(/cancelled/i);
    expect(nextStep("accepted", { status: "reversed", scheduledIso: at })).toMatch(/rebooked/i);
  });
  it("never mentions a dollar figure (charity-amount copy rule)", () => {
    for (const s of ["submitted", "accepted", "declined", "closed"] as const) {
      expect(nextStep(s, { status: "held", scheduledIso: null })).not.toMatch(/\$\d/);
    }
  });
});

describe("shapeVendorRequestRow", () => {
  it("normalises array embeds, composes the exec detail, and picks the latest meeting", () => {
    const raw: RawVendorRequest = {
      id: "r1",
      status: "accepted",
      created_at: new Date(Date.now() - 2 * 86_400_000).toISOString(),
      executive: [{ name: "Riley Chen", title: "COO", company: "Latitude" }],
      meeting: [
        { status: "proposed", scheduled_at: null, created_at: "2024-01-01T00:00:00Z" },
        { status: "confirmed", scheduled_at: "2024-06-01T00:00:00Z", created_at: "2024-02-01T00:00:00Z" },
      ],
    };
    const row = shapeVendorRequestRow(raw);
    expect(row.execName).toBe("Riley Chen");
    expect(row.execDetail).toBe("COO, Latitude");
    expect(row.meeting).toEqual({ status: "confirmed", scheduledIso: "2024-06-01T00:00:00Z" });
    expect(row.nextStep).toMatch(/time confirmed/i);
    expect(row.ageLabel).toMatch(/^\d+[dhm]$/);
  });
  it("falls back cleanly when the exec relation is missing and there is no meeting", () => {
    const row = shapeVendorRequestRow({
      id: "r2", status: "submitted", created_at: new Date().toISOString(),
      executive: null, meeting: null,
    });
    expect(row.execName).toBeNull();
    expect(row.execDetail).toBeNull();
    expect(row.meeting).toBeNull();
    expect(row.nextStep).toMatch(/waiting on the executive/i);
  });
});

describe("vendor requests query (DB, vendor RLS session)", () => {
  let alex: SupabaseClient;
  let blair: SupabaseClient;

  beforeAll(async () => {
    if (!URL || !KEY) throw new Error("Supabase env vars are not set");
    alex = await signIn("alex@alpha.test");
    blair = await signIn("blair@beta.test");
  });

  it("returns the vendor's own requests with embeds resolved, shaped to rows", async () => {
    const { data, error } = await alex.from("request").select(SELECT).order("created_at", { ascending: false });
    expect(error).toBeNull();
    const rows = ((data ?? []) as unknown as RawVendorRequest[]).map(shapeVendorRequestRow);
    expect(rows.length).toBeGreaterThanOrEqual(1);
    for (const r of rows) {
      expect(r.execName).toBeTruthy(); // seed requests point at a named executive
      expect(r.nextStep.length).toBeGreaterThan(0);
      expect(["submitted", "accepted", "declined", "closed"]).toContain(r.status);
    }
  });

  it("is tenant-scoped: another vendor sees none of these requests", async () => {
    const { data } = await blair.from("request").select(SELECT);
    expect(data ?? []).toEqual([]);
  });
});
