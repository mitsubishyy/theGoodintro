import type { Metadata } from "next";
import { getFlag } from "@/lib/flags";
import { ExecShell } from "./_components/exec-shell";
import { ExecHomeView } from "./_components/home-view";
import { resolveExecContext, loadExecHome } from "./data";

export const metadata: Metadata = {
  title: "Home · TheGoodIntro",
  robots: { index: false, follow: false },
};

/**
 * Exec dashboard — the locked VP1 (design/locked/exec-dashboard). The exec is
 * email-first; this portal is the secondary surface for transparency, history,
 * and EAs acting on their behalf. Flag-gated (exec_dashboard, OFF by default).
 * Real magic-link exec/EA auth is deferred; the staging demo resolves one
 * seeded executive read under the staff session's RLS.
 */
export default async function ExecHomePage() {
  if (!(await getFlag("exec_dashboard"))) return <FlagOff />;

  const { supabase, execId } = await resolveExecContext();
  const data = execId ? await loadExecHome(supabase, execId) : null;
  if (!data) return <FlagOff missingExec />;

  return (
    <ExecShell
      title="Home"
      exec={{
        name: data.exec.name,
        title: data.exec.title,
        company: data.exec.company,
        email: data.exec.email,
        photoUrl: data.exec.photoUrl,
      }}
    >
      <ExecHomeView data={data} />
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
