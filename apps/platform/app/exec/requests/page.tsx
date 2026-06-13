import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getFlag } from "@/lib/flags";
import { ExecShell } from "../_components/exec-shell";
import { ExecRequestsView } from "./_components/requests-view";
import { resolveDemoExecutiveId, loadExecRequests } from "../data";

export const metadata: Metadata = {
  title: "Incoming requests · TheGoodIntro",
  robots: { index: false, follow: false },
};

/**
 * Exec Incoming Requests — the locked all-pending batch review surface
 * (design/locked/exec-incoming-requests, LOCKED 2026-06-09). The locked twin of
 * the request email; the dashboard's compact Incoming widget links here.
 * Flag-gated (exec_dashboard, OFF by default). The staging demo resolves one
 * seeded executive read under the staff session's RLS, same as the dashboard;
 * real magic-link exec/EA auth and the in-portal action backend are deferred.
 */
export default async function ExecRequestsPage() {
  if (!(await getFlag("exec_dashboard"))) return <FlagOff />;

  const supabase = await createClient();
  const execId = await resolveDemoExecutiveId(supabase);
  const data = execId ? await loadExecRequests(supabase, execId) : null;
  if (!data) return <FlagOff missingExec />;

  return (
    <ExecShell
      title="Incoming requests"
      exec={{
        name: data.exec.name,
        title: data.exec.title,
        company: data.exec.company,
        email: data.exec.email,
        photoUrl: data.exec.photoUrl,
      }}
    >
      <ExecRequestsView data={data} />
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
