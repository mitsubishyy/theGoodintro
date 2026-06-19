import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { asProgrammes, asStories } from "../app/exec/charity-content";

/**
 * Admin charity editor persistence (the editor for the exec "Learn about" modal).
 * Confirms a staff session can persist the core identity (name / dgr_status) and
 * the curated content (programmes + stories jsonb), and that what lands in the DB
 * reads back through the REAL loader transforms (asProgrammes / asStories) into the
 * shapes the detail modal renders. The keys are the easy bug: programmes use
 * label/body, stories use snake_case published_at. Also checks the dgr_status path
 * that gates nomination eligibility (only endorsed charities are nominable).
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const PASSWORD = "Passw0rd!test";

async function signIn(email: string): Promise<SupabaseClient> {
  const c = createClient(URL, KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await c.auth.signInWithPassword({ email, password: PASSWORD });
  if (error) throw new Error(`sign-in failed for ${email}: ${error.message}`);
  return c;
}

describe("admin charity content persistence (staff)", () => {
  let staff: SupabaseClient;
  let charityId: string;

  // Two programmes and two stories, deliberately stored oldest-first so the
  // loader's newest-first sort is exercised on read-back.
  const programmes = [
    { label: "Emergency retrieval", body: "Round-the-clock crews reach people no road can." },
    { label: "Primary health clinics", body: "Fly-in GPs and nurses for remote communities." },
  ];
  const stories = [
    { published_at: "2026-03-01", headline: "Older story", body: "An earlier item.", url: "https://example.org.au/news/" },
    { published_at: "2026-05-01", headline: "Newer story", body: "A later item.", url: "https://example.org.au/news/" },
  ];

  beforeAll(async () => {
    if (!URL || !KEY) throw new Error("Supabase env vars are not set");
    staff = await signIn("admin@thegoodintro.test");
    const { data, error } = await staff
      .from("charity")
      .insert({ name: "ZZ Test Charity (charity-content.test)", dgr_status: "unverified" })
      .select("id")
      .single();
    if (error) throw new Error(`could not seed test charity: ${error.message}`);
    charityId = data!.id as string;
  });

  afterAll(async () => {
    if (staff && charityId) await staff.from("charity").delete().eq("id", charityId);
  });

  it("persists name + dgr_status and reads them back", async () => {
    const { error } = await staff
      .from("charity")
      .update({ name: "Renamed Test Charity", dgr_status: "endorsed" })
      .eq("id", charityId);
    expect(error).toBeNull();

    const { data } = await staff.from("charity").select("name, dgr_status").eq("id", charityId).single();
    expect(data?.name).toBe("Renamed Test Charity");
    expect(data?.dgr_status).toBe("endorsed");
  });

  it("persists programmes + stories jsonb in the loader's exact shape", async () => {
    const { error } = await staff
      .from("charity")
      .update({
        purpose: "A one sentence mission.",
        featured_quote: "An illustrative testimonial.",
        featured_quote_attribution: "Volunteer, regional NSW",
        programmes,
        stories,
        content_updated_at: new Date().toISOString(),
      })
      .eq("id", charityId);
    expect(error).toBeNull();

    const { data } = await staff
      .from("charity")
      .select("purpose, featured_quote, featured_quote_attribution, programmes, stories, content_updated_at")
      .eq("id", charityId)
      .single();

    // Raw jsonb keys must be exactly what the loader reads.
    expect(data?.purpose).toBe("A one sentence mission.");
    expect((data?.programmes as unknown[])[0]).toEqual({ label: programmes[0].label, body: programmes[0].body });
    expect(Object.keys((data?.stories as Record<string, unknown>[])[0]).sort()).toEqual(["body", "headline", "published_at", "url"]);
    expect(data?.content_updated_at).toBeTruthy();

    // Through the REAL loader transforms → the shapes the detail modal renders.
    const loadedProgrammes = asProgrammes(data?.programmes);
    expect(loadedProgrammes).toEqual(programmes);

    const loadedStories = asStories(data?.stories);
    // asStories sorts newest-first and exposes publishedAt (camelCase) to the view.
    expect(loadedStories.map((s) => s.headline)).toEqual(["Newer story", "Older story"]);
    expect(loadedStories[0]).toEqual({
      publishedAt: "2026-05-01",
      headline: "Newer story",
      body: "A later item.",
      url: "https://example.org.au/news/",
    });
  });

  it("only an endorsed charity appears in the nomination-eligible (endorsed) set", async () => {
    const endorsedOnly = async () => {
      const { data } = await staff
        .from("charity")
        .select("id")
        .eq("id", charityId)
        .eq("dgr_status", "endorsed")
        .is("deleted_at", null);
      return (data ?? []).length;
    };

    await staff.from("charity").update({ dgr_status: "unverified" }).eq("id", charityId);
    expect(await endorsedOnly()).toBe(0);

    await staff.from("charity").update({ dgr_status: "endorsed" }).eq("id", charityId);
    expect(await endorsedOnly()).toBe(1);
  });
});
