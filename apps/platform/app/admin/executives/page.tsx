import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getFlag } from "@/lib/flags";

export const metadata: Metadata = {
  title: "Executives — theGoodintro admin",
  robots: { index: false, follow: false },
};

export default async function ExecutivesPage() {
  const supabase = await createClient();
  const enabled = await getFlag("exec_onboarding");
  const { data: execs } = await supabase
    .from("executive")
    .select("id, name, title, company, status, charity:default_charity_id(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Executives</h1>
          <p className="mt-1 mb-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
            Senior leaders set up to receive and accept requests.
          </p>
        </div>
        {enabled ? (
          <Link href="/admin/executives/new" className="rounded-lg px-4 py-2 text-sm font-semibold" style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}>
            New executive
          </Link>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--portal-line)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--portal-card)", color: "var(--muted-foreground)" }}>
              <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.16em]">Name</th>
              <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.16em]">Role</th>
              <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.16em]">Charity</th>
              <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.16em]">Status</th>
            </tr>
          </thead>
          <tbody>
            {(execs ?? []).map((e) => {
              const charity = Array.isArray(e.charity) ? e.charity[0] : e.charity;
              return (
                <tr key={e.id as string} style={{ borderTop: "1px solid var(--portal-line)" }}>
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/admin/executives/${e.id}`} className="underline-offset-2 hover:underline">
                      {e.name as string}
                    </Link>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>
                    {e.title as string}, {e.company as string}
                  </td>
                  <td className="px-4 py-3">{charity?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs"
                      style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}
                    >
                      {e.status as string}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
