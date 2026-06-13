import { createClient } from "@/lib/supabase/server";
import { getFlag } from "@/lib/flags";
import { ExecShell } from "./exec-shell";
import { resolveDemoExecutiveId, loadExecHome } from "../data";

/**
 * Placeholder for the locked exec sidebar routes whose screens are not ported
 * yet (Meetings, Impact, My charity, Profile, Requests). Renders inside the
 * canonical ExecShell so the shell is exercised across every nav destination
 * and no link 404s; each is replaced by its real port. Concierge register: a
 * quiet centred line, no SaaS chrome.
 */
export async function ExecComingSoon({ title, body }: { title: string; body: string }) {
  if (!(await getFlag("exec_dashboard"))) {
    return (
      <main className="grid min-h-screen place-items-center px-6" style={{ background: "var(--portal-page)", color: "var(--portal-ink)" }}>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Executive portal is not enabled.
        </p>
      </main>
    );
  }
  const supabase = await createClient();
  const execId = await resolveDemoExecutiveId(supabase);
  const data = execId ? await loadExecHome(supabase, execId) : null;

  const exec = data
    ? { name: data.exec.name, title: data.exec.title, company: data.exec.company, email: data.exec.email, photoUrl: data.exec.photoUrl }
    : { name: "Executive", title: null, company: null, email: "", photoUrl: null };

  return (
    <ExecShell title={title} exec={exec}>
      <div className="grid place-items-center min-h-[55vh] text-center">
        <div className="max-w-md">
          <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
            Arriving soon
          </p>
          <h1 className="mt-2 text-[28px] font-semibold" style={{ fontFamily: "var(--font-display), Georgia, serif", color: "var(--portal-ink)", letterSpacing: "-0.01em" }}>
            {title}
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            {body}
          </p>
        </div>
      </div>
    </ExecShell>
  );
}
