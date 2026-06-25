import type { Metadata } from "next";
import { getFlag } from "@/lib/flags";
import { ExecShell } from "../_components/exec-shell";
import { MeetingsView } from "./_components/meetings-view";
import { resolveExecContext, loadExecMeetings } from "../data";

export const metadata: Metadata = {
  title: "Meetings · TheGoodIntro",
  robots: { index: false, follow: false },
};

/**
 * Exec Meetings List — the locked list + calendar + drawer surface
 * (design/locked/exec-meetings-list, LOCKED 2026-06-10). Flag-gated
 * (exec_dashboard, OFF by default). The staging demo resolves one seeded
 * executive read under the staff session's RLS, same as the dashboard. View and
 * drawer deep-link via ?view= / ?drawer= (email links open the list with a
 * drawer pre-opened); the rest of the UI state is client-side.
 */
export default async function ExecMeetingsPage({ searchParams }: { searchParams: Promise<{ view?: string; drawer?: string }> }) {
  if (!(await getFlag("exec_dashboard"))) return <FlagOff />;

  const { supabase, execId } = await resolveExecContext();
  const data = execId ? await loadExecMeetings(supabase, execId) : null;
  if (!data) return <FlagOff missingExec />;

  const sp = await searchParams;
  const initialView = sp.view === "calendar" ? "calendar" : "list";
  const initialDrawerId = sp.drawer ?? null;

  return (
    <ExecShell
      title="Meetings"
      exec={{
        name: data.exec.name,
        title: data.exec.title,
        company: data.exec.company,
        email: data.exec.email,
        photoUrl: data.exec.photoUrl,
      }}
    >
      <MeetingsView data={data} nowIso={new Date().toISOString()} tz={data.tz} initialView={initialView} initialDrawerId={initialDrawerId} />
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
