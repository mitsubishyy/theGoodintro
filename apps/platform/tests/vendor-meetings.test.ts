import { describe, it, expect, beforeAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  meetingGroup,
  providerFromUrl,
  nextStep,
  shapeVendorMeetingRow,
  sortVendorMeetings,
  MEETING_GROUPS,
  type RawVendorMeeting,
  type VendorMeetingRow,
} from "../app/vendor/meetings/_rows";

/**
 * Read-only /vendor/meetings list. Pure tests cover the group bucketing, the
 * provider label, the "what's next" copy, row shaping, and the default sort; the
 * DB test proves the page's exact select runs under a VENDOR RLS session and is
 * tenant-scoped (Alpha sees its own meetings, Beta sees none) with the
 * executive + gift embeds resolving. Reuses the seed login users (rls.test.ts).
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const PASSWORD = "Passw0rd!test";

const SELECT =
  "id, status, scheduled_at, join_url, created_at, charity:charity_id ( name ), request:request_id ( executive:executive_id ( name, title, company ) ), gift:gift_record ( status, charity_amount_cents )";

const NOW = new Date("2024-06-01T00:00:00Z");
const FUTURE = "2024-09-01T10:00:00Z";
const PAST = "2024-02-01T10:00:00Z";

async function signIn(email: string): Promise<SupabaseClient> {
  const client = createClient(URL, KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await client.auth.signInWithPassword({ email, password: PASSWORD });
  if (error) throw new Error(`sign-in failed for ${email}: ${error.message}`);
  return client;
}

describe("meetingGroup", () => {
  it("buckets each status (and confirmed by time) into the four groups", () => {
    expect(meetingGroup("proposed", null, NOW)).toBe("pending");
    expect(meetingGroup("confirmed", FUTURE, NOW)).toBe("upcoming");
    expect(meetingGroup("confirmed", PAST, NOW)).toBe("past"); // time already passed
    expect(meetingGroup("confirmed", null, NOW)).toBe("past"); // no time -> not upcoming
    expect(meetingGroup("held", PAST, NOW)).toBe("past");
    for (const s of ["no_show", "cancelled", "reversed"] as const) {
      expect(meetingGroup(s, PAST, NOW)).toBe("cancelled");
    }
  });
});

describe("providerFromUrl", () => {
  it("names the provider from the host, or falls back", () => {
    expect(providerFromUrl(null)).toBeNull();
    expect(providerFromUrl("https://us02web.zoom.us/j/123")).toBe("Zoom");
    expect(providerFromUrl("https://teams.microsoft.com/l/meetup/x")).toBe("Teams");
    expect(providerFromUrl("https://meet.google.com/abc-defg-hij")).toBe("Google Meet");
    expect(providerFromUrl("https://example.webex.com/meet/x")).toBe("Webex");
    expect(providerFromUrl("https://example.com/room/1")).toBe("Video call");
    expect(providerFromUrl("not a url")).toBe("Video call");
  });
});

describe("nextStep", () => {
  it("derives copy from status, time, join link, and gift state", () => {
    expect(nextStep("proposed", { upcoming: false, hasJoinUrl: false, giftPaid: false })).toMatch(/arranging a time/i);
    expect(nextStep("confirmed", { upcoming: true, hasJoinUrl: true, giftPaid: false })).toMatch(/use the join link/i);
    expect(nextStep("confirmed", { upcoming: true, hasJoinUrl: false, giftPaid: false })).toMatch(/join link will be shared/i);
    expect(nextStep("confirmed", { upcoming: false, hasJoinUrl: true, giftPaid: false })).toMatch(/awaiting the meeting outcome/i);
    expect(nextStep("held", { upcoming: false, hasJoinUrl: false, giftPaid: false })).toMatch(/a gift goes to/i);
    expect(nextStep("held", { upcoming: false, hasJoinUrl: false, giftPaid: true })).toMatch(/gift has been sent/i);
    expect(nextStep("no_show", { upcoming: false, hasJoinUrl: false, giftPaid: false })).toMatch(/no-show/i);
    expect(nextStep("cancelled", { upcoming: false, hasJoinUrl: false, giftPaid: false })).toMatch(/cancelled/i);
    expect(nextStep("reversed", { upcoming: false, hasJoinUrl: false, giftPaid: false })).toMatch(/rebooked/i);
  });
  it("never mentions a dollar figure (charity-amount copy rule)", () => {
    expect(nextStep("held", { upcoming: false, hasJoinUrl: false, giftPaid: true })).not.toMatch(/\$\d/);
  });
});

describe("shapeVendorMeetingRow", () => {
  it("composes exec + charity + provider, surfaces a real gift, and labels the time", () => {
    const raw: RawVendorMeeting = {
      id: "m1",
      status: "held",
      scheduled_at: PAST,
      join_url: "https://us02web.zoom.us/j/1",
      created_at: PAST,
      charity: [{ name: "OzHarvest" }],
      request: [{ executive: [{ name: "Riley Chen", title: "COO", company: "Latitude" }] }],
      gift: [{ status: "paid", charity_amount_cents: 120000 }],
    };
    const row = shapeVendorMeetingRow(raw, NOW);
    expect(row.execName).toBe("Riley Chen");
    expect(row.execDetail).toBe("COO, Latitude");
    expect(row.provider).toBe("Zoom");
    expect(row.charityName).toBe("OzHarvest");
    expect(row.giftStatus).toBe("paid");
    expect(row.group).toBe("past");
    expect(row.nextStep).toMatch(/gift has been sent/i);
    expect(row.whenLabel).not.toBe("Not scheduled yet");
  });
  it("treats a voided gift as no gift, and an unscheduled proposed meeting as pending", () => {
    const row = shapeVendorMeetingRow(
      {
        id: "m2", status: "proposed", scheduled_at: null, join_url: null, created_at: PAST,
        charity: { name: "RFDS" }, request: { executive: null }, gift: null,
      },
      NOW,
    );
    expect(row.group).toBe("pending");
    expect(row.whenLabel).toBe("Not scheduled yet");
    expect(row.provider).toBeNull();
    expect(row.giftStatus).toBeNull();
    expect(row.execName).toBeNull();

    const voided = shapeVendorMeetingRow(
      {
        id: "m3", status: "reversed", scheduled_at: PAST, join_url: null, created_at: PAST,
        charity: null, request: null, gift: [{ status: "voided", charity_amount_cents: 0 }],
      },
      NOW,
    );
    expect(voided.giftStatus).toBeNull();
    expect(voided.group).toBe("cancelled");
  });
});

describe("sortVendorMeetings", () => {
  it("orders upcoming (soonest first), then pending, past (newest first), cancelled", () => {
    const mk = (id: string, status: RawVendorMeeting["status"], at: string | null): VendorMeetingRow =>
      shapeVendorMeetingRow(
        { id, status, scheduled_at: at, join_url: null, created_at: at ?? PAST, charity: null, request: null, gift: null },
        NOW,
      );
    const sorted = sortVendorMeetings([
      mk("cancelled", "cancelled", PAST),
      mk("past-old", "held", "2024-01-01T00:00:00Z"),
      mk("past-new", "held", "2024-03-01T00:00:00Z"),
      mk("pending", "proposed", null),
      mk("up-late", "confirmed", "2024-12-01T00:00:00Z"),
      mk("up-soon", "confirmed", "2024-07-01T00:00:00Z"),
    ]);
    expect(sorted.map((r) => r.id)).toEqual(["up-soon", "up-late", "pending", "past-new", "past-old", "cancelled"]);
  });
});

describe("vendor meetings query (DB, vendor RLS session)", () => {
  let alex: SupabaseClient;
  let blair: SupabaseClient;

  beforeAll(async () => {
    if (!URL || !KEY) throw new Error("Supabase env vars are not set");
    alex = await signIn("alex@alpha.test");
    blair = await signIn("blair@beta.test");
  });

  it("returns the vendor's own meetings with embeds resolved, shaped to rows", async () => {
    const { data, error } = await alex.from("meeting").select(SELECT);
    expect(error).toBeNull();
    const now = new Date();
    const rows = ((data ?? []) as unknown as RawVendorMeeting[]).map((m) => shapeVendorMeetingRow(m, now));
    expect(rows.length).toBeGreaterThanOrEqual(1);
    for (const r of rows) {
      expect(MEETING_GROUPS).toContain(r.group);
      expect(r.nextStep.length).toBeGreaterThan(0);
      expect([null, "released", "paid"]).toContain(r.giftStatus); // never surfaces a voided gift
    }
  });

  it("is tenant-scoped: another vendor sees none of these meetings", async () => {
    const { data } = await blair.from("meeting").select(SELECT);
    expect(data ?? []).toEqual([]);
  });
});
