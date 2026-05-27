import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getFlag } from "@/lib/flags";
import { CharityForm } from "./charity-form";

export const metadata: Metadata = {
  title: "Charities — TheGoodIntro admin",
  robots: { index: false, follow: false },
};

export default async function CharitiesPage() {
  const supabase = await createClient();
  const enabled = await getFlag("exec_onboarding");
  const { data: charities } = await supabase
    .from("charity")
    .select("id, name, abn, dgr_status")
    .is("deleted_at", null)
    .order("name");

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Charities</h1>
      <p className="mt-1 mb-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
        DGR-endorsed charities an executive can nominate.
      </p>

      {enabled ? (
        <div className="mb-8">
          <CharityForm />
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--portal-line)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--portal-card)", color: "var(--muted-foreground)" }}>
              <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.16em]">Name</th>
              <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.16em]">ABN</th>
              <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.16em]">DGR</th>
            </tr>
          </thead>
          <tbody>
            {(charities ?? []).map((c) => (
              <tr key={c.id as string} style={{ borderTop: "1px solid var(--portal-line)" }}>
                <td className="px-4 py-3 font-medium">{c.name as string}</td>
                <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>{(c.abn as string) ?? "—"}</td>
                <td className="px-4 py-3">{c.dgr_status as string}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
