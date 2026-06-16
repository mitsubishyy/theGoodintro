import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getFlag } from "@/lib/flags";
import { ExecShell } from "../_components/exec-shell";
import { MyCharityView } from "./_components/my-charity-view";
import { resolveDemoExecutiveId, loadExecMyCharity } from "../data";

export const metadata: Metadata = {
  title: "My charity · TheGoodIntro",
  robots: { index: false, follow: false },
};

/**
 * Exec My charity — the locked view-only standing-nomination surface
 * (design/locked/exec-my-charity, LOCKED 2026-06-11). Flag-gated
 * (exec_dashboard, OFF by default). The staging demo resolves one seeded
 * executive read under the staff session's RLS, same as the other exec screens.
 */
export default async function ExecMyCharityPage() {
  if (!(await getFlag("exec_dashboard"))) return <FlagOff />;

  const supabase = await createClient();
  const execId = await resolveDemoExecutiveId(supabase);
  const data = execId ? await loadExecMyCharity(supabase, execId) : null;
  if (!data) return <FlagOff missingExec />;

  return (
    <ExecShell
      title="My charity"
      exec={{
        name: data.exec.name,
        title: data.exec.title,
        company: data.exec.company,
        email: data.exec.email,
        photoUrl: data.exec.photoUrl,
      }}
    >
      <MyCharityView data={data} />
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
