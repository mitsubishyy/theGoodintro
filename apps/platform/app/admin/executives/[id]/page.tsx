import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@thegoodintro/ui";
import { createClient } from "@/lib/supabase/server";
import { getFlag } from "@/lib/flags";
import { ExecutiveForm } from "../executive-form";
import { EaSection } from "../ea-section";
import { execStatusPill, type ExecStatusEnum } from "../_status";
import { updateExecutiveAction, setExecutiveStatusAction } from "../actions";

export const metadata: Metadata = {
  title: "Executive — TheGoodIntro admin",
  robots: { index: false, follow: false },
};

// invited -> set_up -> active, with paused / left as side states.
const NEXT_STATUS: Record<string, { status: string; label: string }[]> = {
  invited: [{ status: "set_up", label: "Mark set up" }],
  set_up: [{ status: "active", label: "Activate" }],
  active: [{ status: "paused", label: "Pause" }, { status: "left", label: "Mark left" }],
  paused: [{ status: "active", label: "Reactivate" }, { status: "left", label: "Mark left" }],
  left: [],
};

export default async function ExecutiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const enabled = await getFlag("exec_onboarding");
  const photoUploadEnabled = await getFlag("photo_upload");
  const supabase = await createClient();

  const [{ data: exec }, { data: charities }, { data: eas }] = await Promise.all([
    supabase.from("executive").select("*").eq("id", id).maybeSingle(),
    supabase.from("charity").select("id,name").is("deleted_at", null).order("name"),
    supabase.from("ea").select("id,name,email").is("deleted_at", null).order("name"),
  ]);

  if (!exec) notFound();

  const transitions = NEXT_STATUS[exec.status as string] ?? [];

  return (
    <div className="max-w-2xl px-8 py-6">
      <Link href="/admin/executives" className="text-sm" style={{ color: "var(--muted-foreground)" }}>
        ← Executives
      </Link>
      <div className="mt-2 mb-1 flex items-center gap-3">
        <h1 className="text-[20px] font-semibold tracking-tight">{exec.name}</h1>
        {(() => {
          const { label, tone } = execStatusPill(exec.status as ExecStatusEnum);
          return (
            <Badge tone={tone} dot>
              {label}
            </Badge>
          );
        })()}
      </div>
      <p className="mb-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
        {exec.title}{exec.title && exec.company ? ", " : ""}{exec.company}
      </p>

      {!enabled ? (
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Editing is disabled (turn on the <code>exec_onboarding</code> flag).
        </p>
      ) : (
        <>
          {transitions.length > 0 ? (
            <div className="mb-8 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
                Pipeline
              </span>
              {transitions.map((t) => (
                <form key={t.status} action={setExecutiveStatusAction}>
                  <input type="hidden" name="id" value={exec.id} />
                  <input type="hidden" name="status" value={t.status} />
                  <button type="submit" className="rounded-lg border px-3 py-1.5 text-sm" style={{ borderColor: "var(--portal-line)", background: "var(--portal-card)" }}>
                    {t.label}
                  </button>
                </form>
              ))}
            </div>
          ) : null}

          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
            Profile
          </h2>
          <ExecutiveForm
            action={updateExecutiveAction}
            charities={charities ?? []}
            initial={exec}
            submitLabel="Save changes"
            photoUploadEnabled={photoUploadEnabled}
          />

          <h2 className="mb-3 mt-10 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
            Executive assistant
          </h2>
          <EaSection
            executiveId={exec.id as string}
            currentEaId={(exec.ea_id as string | null) ?? null}
            eas={eas ?? []}
          />
        </>
      )}
    </div>
  );
}
