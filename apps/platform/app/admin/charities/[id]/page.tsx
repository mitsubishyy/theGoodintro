import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFlag } from "@/lib/flags";
import { CharityEditForm } from "../charity-edit-form";
import { CharityDetailsForm } from "../charity-details-form";
import { CharityContentForm } from "../charity-content-form";

export const metadata: Metadata = {
  title: "Charity — TheGoodIntro admin",
  robots: { index: false, follow: false },
};

// Map stored jsonb into editable form rows without dropping or reordering (the
// loader's asProgrammes/asStories slice + sort for DISPLAY; the editor shows
// everything as stored so an admin can manage the full set).
function rowsProgrammes(v: unknown): { label: string; body: string }[] {
  if (!Array.isArray(v)) return [];
  return v.map((p) => {
    const o = (p ?? {}) as { label?: unknown; body?: unknown };
    return { label: typeof o.label === "string" ? o.label : "", body: typeof o.body === "string" ? o.body : "" };
  });
}
function rowsStories(v: unknown): { published_at: string; headline: string; body: string; url: string }[] {
  if (!Array.isArray(v)) return [];
  return v.map((s) => {
    const o = (s ?? {}) as { published_at?: unknown; headline?: unknown; body?: unknown; url?: unknown };
    return {
      published_at: typeof o.published_at === "string" ? o.published_at : "",
      headline: typeof o.headline === "string" ? o.headline : "",
      body: typeof o.body === "string" ? o.body : "",
      url: typeof o.url === "string" ? o.url : "",
    };
  });
}

export default async function CharityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const enabled = await getFlag("exec_onboarding");
  const photoUploadEnabled = await getFlag("photo_upload");

  const { data: charity } = await supabase
    .from("charity")
    .select(
      "id, name, abn, dgr_status, logo_url, hero_image_url, purpose, programmes, featured_quote, featured_quote_attribution, stories",
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!charity) notFound();

  return (
    <div className="max-w-2xl px-8 py-6">
      <Link href="/admin/charities" className="text-sm" style={{ color: "var(--muted-foreground)" }}>
        ← Charities
      </Link>
      <div className="mt-2 mb-1 flex items-center gap-3">
        <h1 className="text-[20px] font-semibold tracking-tight">{charity.name as string}</h1>
        <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}>
          {charity.dgr_status as string}
        </span>
      </div>
      <p className="mb-8 text-sm" style={{ color: "var(--muted-foreground)" }}>
        {charity.abn ? `ABN ${charity.abn as string}` : "No ABN on file"}
      </p>

      {!enabled ? (
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Editing is disabled (turn on the <code>exec_onboarding</code> flag).
        </p>
      ) : (
        <div className="grid gap-12">
          <section>
            <SectionHead title="Details" />
            <CharityDetailsForm
              id={charity.id as string}
              name={charity.name as string}
              abn={(charity.abn as string) ?? ""}
              dgrStatus={charity.dgr_status as string}
            />
          </section>

          <section>
            <SectionHead
              title="Content"
              hint="Shown to executives in the “Learn about” detail modal. Any section left empty is hidden there."
            />
            <CharityContentForm
              id={charity.id as string}
              purpose={(charity.purpose as string) ?? ""}
              featuredQuote={(charity.featured_quote as string) ?? ""}
              featuredQuoteAttribution={(charity.featured_quote_attribution as string) ?? ""}
              programmes={rowsProgrammes(charity.programmes)}
              stories={rowsStories(charity.stories)}
            />
          </section>

          <section>
            <SectionHead title="Images" />
            <CharityEditForm
              id={charity.id as string}
              name={charity.name as string}
              logoUrl={(charity.logo_url as string) ?? ""}
              heroUrl={(charity.hero_image_url as string) ?? ""}
              photoUploadEnabled={photoUploadEnabled}
            />
          </section>
        </div>
      )}
    </div>
  );
}

function SectionHead({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
        {title}
      </h2>
      {hint ? (
        <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
