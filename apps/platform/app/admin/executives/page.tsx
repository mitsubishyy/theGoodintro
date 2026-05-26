import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Executives — theGoodintro admin",
  robots: { index: false, follow: false },
};

export default async function ExecutivesPage() {
  const supabase = await createClient();
  const { data: execs } = await supabase
    .from("executive")
    .select("id, name, title, company, status, charity:default_charity_id(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight">Executives</h1>
      <p className="mt-1 mb-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
        Senior leaders set up to receive and accept requests.
      </p>

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
                  <td className="px-4 py-3 font-medium">{e.name as string}</td>
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
