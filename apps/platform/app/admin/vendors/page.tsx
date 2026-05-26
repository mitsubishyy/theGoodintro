import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Vendors — theGoodintro admin",
  robots: { index: false, follow: false },
};

export default async function VendorsPage() {
  const supabase = await createClient();
  const { data: vendors } = await supabase
    .from("vendor")
    .select("id, name, email_domain, status, access_expires_at, credit_lot(quantity_remaining)")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight">Vendors</h1>
      <p className="mt-1 mb-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
        Paying organisations and their access.
      </p>

      <div
        className="overflow-hidden rounded-xl border"
        style={{ borderColor: "var(--portal-line)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--portal-card)", color: "var(--muted-foreground)" }}>
              <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.16em]">Company</th>
              <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.16em]">Domain</th>
              <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.16em]">Status</th>
              <th className="px-4 py-2.5 text-right font-mono text-[10px] uppercase tracking-[0.16em]">Credits left</th>
              <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.16em]">Access ends</th>
            </tr>
          </thead>
          <tbody>
            {(vendors ?? []).map((v) => {
              const lots = (v.credit_lot ?? []) as { quantity_remaining: number }[];
              const remaining = lots.reduce((s, l) => s + l.quantity_remaining, 0);
              return (
                <tr key={v.id as string} style={{ borderTop: "1px solid var(--portal-line)" }}>
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/admin/vendors/${v.id}`} className="underline-offset-2 hover:underline">
                      {v.name as string}
                    </Link>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>{v.email_domain as string}</td>
                  <td className="px-4 py-3">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs"
                      style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}
                    >
                      {v.status as string}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{remaining}</td>
                  <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>
                    {formatDate(v.access_expires_at as string | null)}
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
