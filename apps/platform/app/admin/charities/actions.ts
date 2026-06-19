"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { logAudit } from "@/lib/audit";
import { isOwnAvatarUrl } from "@/lib/upload/url";

export type FormState = { error?: string; ok?: boolean };

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const DGR = ["endorsed", "unverified", "revoked"];

// Sane field caps for curated DETAIL content (one factual sentence / short body /
// a handful of rows), so a stray paste cannot bloat the exec "Learn about" modal.
const CAP = { purpose: 600, quote: 400, attribution: 160, label: 120, body: 600, headline: 160, story: 600, url: 500 } as const;
const cap = (s: string, n: number) => s.slice(0, n);

/** Only accept http(s) story links; anything else (e.g. javascript:) becomes null. */
function safeUrl(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:" ? cap(s, CAP.url) : null;
  } catch {
    return null;
  }
}

/** Parse the programmes hidden field to the exact [{label, body}] jsonb shape that
 *  asProgrammes reads: trim, drop fully-empty rows, cap lengths and row count. */
function parseProgrammes(raw: string): { label: string; body: string }[] {
  let arr: unknown;
  try {
    arr = JSON.parse(raw || "[]");
  } catch {
    return [];
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .map((p) => ({
      label: cap(String((p as { label?: unknown })?.label ?? "").trim(), CAP.label),
      body: cap(String((p as { body?: unknown })?.body ?? "").trim(), CAP.body),
    }))
    .filter((p) => p.label || p.body)
    .slice(0, 12);
}

/** Parse the stories hidden field to the exact [{published_at, headline, body, url}]
 *  jsonb shape asStories reads (snake_case published_at). A row needs a headline to
 *  survive (mirrors asStories); published_at must be YYYY-MM-DD or it drops to null. */
function parseStories(raw: string): { published_at: string | null; headline: string; body: string; url: string | null }[] {
  let arr: unknown;
  try {
    arr = JSON.parse(raw || "[]");
  } catch {
    return [];
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .map((s) => {
      const o = (s ?? {}) as { published_at?: unknown; headline?: unknown; body?: unknown; url?: unknown };
      const pub = String(o.published_at ?? "").trim();
      return {
        published_at: /^\d{4}-\d{2}-\d{2}$/.test(pub) ? pub : null,
        headline: cap(String(o.headline ?? "").trim(), CAP.headline),
        body: cap(String(o.body ?? "").trim(), CAP.story),
        url: safeUrl(String(o.url ?? "")),
      };
    })
    .filter((s) => s.headline)
    .slice(0, 12);
}

export async function createCharityAction(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  const { staff, supabase } = await requireStaff();
  if (!(await getFlag("exec_onboarding")))
    return { error: "Executive onboarding is not enabled." };

  const name = str(fd, "name");
  if (!name) return { error: "Charity name is required." };
  const dgr_status = DGR.includes(str(fd, "dgr_status"))
    ? str(fd, "dgr_status")
    : "unverified";

  const { data, error } = await supabase
    .from("charity")
    .insert({ name, abn: str(fd, "abn") || null, dgr_status })
    .select("id")
    .single();
  if (error) return { error: error.message };

  await logAudit(supabase, staff.id, {
    action: "charity.created",
    targetType: "charity",
    targetId: data.id,
    metadata: { name },
  });
  revalidatePath("/admin/charities");
  return { ok: true };
}

/**
 * Persist a charity's logo + hero image URLs (file-upload only). The bytes
 * already went through the upload route (validate + sharp re-encode + storage
 * write); this writes the returned public URLs, each origin-checked to our own
 * avatars bucket so a crafted call cannot point at an arbitrary external image.
 * An empty value clears the column (falls back to the initials / tint render).
 */
export async function updateCharityImagesAction(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  const { staff, supabase } = await requireStaff();
  if (!(await getFlag("exec_onboarding")))
    return { error: "Executive onboarding is not enabled." };

  const id = str(fd, "id");
  if (!id) return { error: "Missing charity id." };
  const logo = str(fd, "logo_url");
  const hero = str(fd, "hero_image_url");
  if (logo && !isOwnAvatarUrl(logo)) return { error: "That logo image could not be saved." };
  if (hero && !isOwnAvatarUrl(hero)) return { error: "That hero image could not be saved." };

  const { error } = await supabase
    .from("charity")
    .update({ logo_url: logo || null, hero_image_url: hero || null })
    .eq("id", id);
  if (error) return { error: error.message };

  await logAudit(supabase, staff.id, {
    action: "charity.images_updated",
    targetType: "charity",
    targetId: id,
    metadata: { logo: Boolean(logo), hero: Boolean(hero) },
  });
  revalidatePath(`/admin/charities/${id}`);
  revalidatePath("/admin/charities");
  return { ok: true };
}

/**
 * Update a charity's core identity (name / abn / dgr_status). Mirrors
 * createCharityAction's validation. Note dgr_status drives nomination eligibility:
 * set_standing_nomination (0022) and the exec picker only allow `endorsed`
 * charities. Moving an actively nominated charity off `endorsed` does NOT clear
 * any executive's existing default_charity_id (a snapshot already stands); it only
 * blocks future nominations. Warning the admin in that case is deferred (ask Issy).
 */
export async function updateCharityDetailsAction(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  const { staff, supabase } = await requireStaff();
  if (!(await getFlag("exec_onboarding")))
    return { error: "Executive onboarding is not enabled." };

  const id = str(fd, "id");
  if (!id) return { error: "Missing charity id." };
  const name = str(fd, "name");
  if (!name) return { error: "Charity name is required." };
  const dgr_status = DGR.includes(str(fd, "dgr_status")) ? str(fd, "dgr_status") : "unverified";

  const { error } = await supabase
    .from("charity")
    .update({ name, abn: str(fd, "abn") || null, dgr_status })
    .eq("id", id);
  if (error) return { error: error.message };

  await logAudit(supabase, staff.id, {
    action: "charity.updated",
    targetType: "charity",
    targetId: id,
    metadata: { name, dgr_status },
  });
  revalidatePath(`/admin/charities/${id}`);
  revalidatePath("/admin/charities");
  return { ok: true };
}

/**
 * Update a charity's curated DETAIL content (the exec "Learn about" modal):
 * purpose + featured quote + attribution, plus the programmes and stories
 * repeaters. The two arrays arrive as JSON hidden fields and are normalised into
 * the exact jsonb shapes asProgrammes / asStories read (programmes [{label, body}],
 * stories [{published_at, headline, body, url}]). Empty rows are dropped, lengths
 * capped, story urls restricted to http(s). Not an upload, so it gates on
 * exec_onboarding only (not photo_upload). Stamps content_updated_at on save.
 */
export async function updateCharityContentAction(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  const { staff, supabase } = await requireStaff();
  if (!(await getFlag("exec_onboarding")))
    return { error: "Executive onboarding is not enabled." };

  const id = str(fd, "id");
  if (!id) return { error: "Missing charity id." };

  const purpose = cap(str(fd, "purpose"), CAP.purpose) || null;
  const featured_quote = cap(str(fd, "featured_quote"), CAP.quote) || null;
  const featured_quote_attribution = cap(str(fd, "featured_quote_attribution"), CAP.attribution) || null;
  const programmes = parseProgrammes(str(fd, "programmes"));
  const stories = parseStories(str(fd, "stories"));

  const { error } = await supabase
    .from("charity")
    .update({
      purpose,
      featured_quote,
      featured_quote_attribution,
      programmes,
      stories,
      content_updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };

  await logAudit(supabase, staff.id, {
    action: "charity.content_updated",
    targetType: "charity",
    targetId: id,
    metadata: {
      programmes: programmes.length,
      stories: stories.length,
      hasPurpose: Boolean(purpose),
      hasQuote: Boolean(featured_quote),
    },
  });
  revalidatePath(`/admin/charities/${id}`);
  revalidatePath("/admin/charities");
  return { ok: true };
}
