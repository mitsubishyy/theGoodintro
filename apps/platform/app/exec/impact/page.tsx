import type { Metadata } from "next";
import { getFlag } from "@/lib/flags";
import { ExecShell } from "../_components/exec-shell";
import { ImpactView } from "./_components/impact-view";
import { resolveExecContext, loadExecImpact } from "../data";

export const metadata: Metadata = {
  title: "Impact · TheGoodIntro",
  robots: { index: false, follow: false },
};

/**
 * Exec Impact List — the locked cumulative-giving surface
 * (design/locked/exec-impact-list, LOCKED 2026-06-11). Flag-gated
 * (exec_dashboard, OFF by default). The staging demo resolves one seeded
 * executive read under the staff session's RLS, same as the other exec screens.
 * View + drawer deep-link via ?view= / ?drawer=.
 */
export default async function ExecImpactPage({ searchParams }: { searchParams: Promise<{ view?: string; drawer?: string }> }) {
  if (!(await getFlag("exec_dashboard"))) return <FlagOff />;

  const { supabase, execId } = await resolveExecContext();
  const data = execId ? await loadExecImpact(supabase, execId) : null;
  if (!data) return <FlagOff missingExec />;

  const sp = await searchParams;
  const initialView = sp.view === "charity" ? "charity" : "list";
  const initialDrawerId = sp.drawer ?? null;

  return (
    <ExecShell
      title="Impact"
      exec={{
        name: data.exec.name,
        title: data.exec.title,
        company: data.exec.company,
        email: data.exec.email,
        photoUrl: data.exec.photoUrl,
      }}
    >
      <ImpactView data={data} nowIso={new Date().toISOString()} initialView={initialView} initialDrawerId={initialDrawerId} />
    </ExecShell>
  );
}

function FlagOff({ missingExec }: { missingExec?: boolean }) {
  return (
    <main className="grid min-h-screen place-items-center px-6" style={{ background: "var(--portal-page)", color: "var(--portal-ink)" }}>
      <div className="max-w-md text-center">
        <h1 className="text-lg font-semibold">
          {missingExec ? "No executive to show yet" : "Executive portal is not enabled"}
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
          {missingExec
            ? "Seed an executive on the local stack, then reload."
            : "Turn on the exec_dashboard flag in feature_flag (staging first, Issy approves go-live)."}
        </p>
      </div>
    </main>
  );
}
