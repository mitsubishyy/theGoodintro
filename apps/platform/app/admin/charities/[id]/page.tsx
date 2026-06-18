import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFlag } from "@/lib/flags";
import { CharityEditForm } from "../charity-edit-form";

export const metadata: Metadata = {
  title: "Charity — TheGoodIntro admin",
  robots: { index: false, follow: false },
};

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
    .select("id, name, abn, dgr_status, logo_url, hero_image_url")
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
        <h1 className="text-2xl font-semibold tracking-tight">{charity.name as string}</h1>
        <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}>
          {charity.dgr_status as string}
        </span>
      </div>
      <p className="mb-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
        {charity.abn ? `ABN ${charity.abn as string}` : "No ABN on file"}
      </p>

      {!enabled ? (
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Editing is disabled (turn on the <code>exec_onboarding</code> flag).
        </p>
      ) : (
        <>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
            Images
          </h2>
          <CharityEditForm
            id={charity.id as string}
            name={charity.name as string}
            logoUrl={(charity.logo_url as string) ?? ""}
            heroUrl={(charity.hero_image_url as string) ?? ""}
            photoUploadEnabled={photoUploadEnabled}
          />
        </>
      )}
    </div>
  );
}
