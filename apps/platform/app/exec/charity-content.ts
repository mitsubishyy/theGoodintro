/* Pure shape transforms for the curated charity DETAIL content (migration 0021),
   split out of data.ts so they carry no Supabase / pricing / alias imports and can
   be unit-tested directly. These are the canonical readers the exec "Learn about"
   detail modal sees: the admin charity editor must persist JSONB in exactly the
   shapes these functions read (programmes [{label, body}], stories
   [{published_at, headline, body, url}]). Get a key wrong and content silently
   will not render. loadCharityContent (data.ts) is the only caller. */

export interface CharityProgramme {
  label: string;
  body: string;
}
export interface CharityStory {
  publishedAt: string | null;
  headline: string;
  body: string;
  url: string | null;
}

export function asProgrammes(v: unknown): CharityProgramme[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((p) => ({ label: String((p as { label?: unknown }).label ?? "").trim(), body: String((p as { body?: unknown }).body ?? "").trim() }))
    .filter((p) => p.label || p.body);
}

export function asStories(v: unknown): CharityStory[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((s) => {
      const o = s as { published_at?: unknown; headline?: unknown; body?: unknown; url?: unknown };
      return {
        publishedAt: o.published_at ? String(o.published_at) : null,
        headline: String(o.headline ?? "").trim(),
        body: String(o.body ?? "").trim(),
        url: o.url ? String(o.url) : null,
      };
    })
    .filter((s) => s.headline)
    .sort((a, b) => String(b.publishedAt ?? "").localeCompare(String(a.publishedAt ?? "")))
    .slice(0, 2);
}
