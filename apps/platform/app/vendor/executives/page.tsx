import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getVendor } from "@/lib/auth";
import { getFlag } from "@/lib/flags";

export const metadata: Metadata = {
  title: "Executives — theGoodintro",
  robots: { index: false, follow: false },
};

export default async function VendorExecutivesPage() {
  const result = await getVendor();
  if (!result?.user) redirect("/login");
  if (!result.vendorUser) redirect("/vendor");

  const vendor = Array.isArray(result.vendorUser.vendor)
    ? result.vendorUser.vendor[0]
    : result.vendorUser.vendor;
  if (vendor?.status !== "active") redirect("/vendor");
  if (!(await getFlag("request_loop"))) redirect("/vendor");

  const supabase = await createClient();
  // RLS only returns active executives to an active vendor.
  const { data: execs } = await supabase
    .from("executive")
    .select("id, name, title, company, charity:default_charity_id(name)")
    .order("name");

  return (
    <main className="mx-auto max-w-3xl px-6 py-12" style={{ color: "var(--foreground)" }}>
      <h1 className="text-2xl font-semibold tracking-tight">Executives</h1>
      <p className="mt-1 mb-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
        Request a 45-minute conversation. Each meeting sends a real gift to the
        leader&rsquo;s chosen charity.
      </p>

      <div className="flex flex-col gap-3">
        {(execs ?? []).map((e) => {
          const charity = Array.isArray(e.charity) ? e.charity[0] : e.charity;
          return (
            <Link
              key={e.id as string}
              href={`/vendor/executives/${e.id}`}
              className="flex items-center justify-between rounded-xl border px-5 py-4"
              style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}
            >
              <span>
                <span className="block font-semibold">{e.title}, {e.company}</span>
                <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Charity: {charity?.name ?? "—"}
                </span>
              </span>
              <span className="text-sm font-semibold" style={{ color: "var(--portal-amber-ink)" }}>
                Request →
              </span>
            </Link>
          );
        })}
        {(execs ?? []).length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            No executives are available right now.
          </p>
        ) : null}
      </div>
    </main>
  );
}
