import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatAud, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Dashboard — theGoodintro admin",
  robots: { index: false, follow: false },
};

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div
      className="rounded-xl border px-5 py-4"
      style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      {hint ? (
        <div className="mt-0.5 text-xs" style={{ color: "var(--muted-foreground)" }}>{hint}</div>
      ) : null}
    </div>
  );
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [vendors, execs, pending, confirm, giftsRes] = await Promise.all([
    supabase.from("vendor").select("*", { count: "exact", head: true }),
    supabase.from("executive").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("request").select("*", { count: "exact", head: true }).eq("status", "submitted"),
    supabase.from("meeting").select("*", { count: "exact", head: true }).eq("status", "proposed"),
    supabase.from("gift_record").select("charity_amount_cents,status"),
  ]);

  const giftRows = (giftsRes.data ?? []) as { charity_amount_cents: number; status: string }[];
  const giftTotal = giftRows.reduce((s, g) => s + g.charity_amount_cents, 0);

  const { data: tasks } = await supabase
    .from("request")
    .select("id, q1_what, created_at, executive:executive_id(name,title,company), vendor:vendor_id(name)")
    .eq("status", "submitted")
    .order("created_at", { ascending: true })
    .limit(10);

  const { data: recentGifts } = await supabase
    .from("gift_record")
    .select("id, charity_amount_cents, status, created_at, charity:charity_id(name)")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
        A read-only view of the network. Synthetic staging data.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Vendors" value={String(vendors.count ?? 0)} />
        <Metric label="Active executives" value={String(execs.count ?? 0)} />
        <Metric label="Requests pending" value={String(pending.count ?? 0)} hint="Awaiting an exec reply" />
        <Metric label="Gifts released" value={formatAud(giftTotal)} hint={`${giftRows.length} gift records`} />
      </div>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
            Task inbox {confirm.count ? `· ${confirm.count} to confirm` : ""}
          </h2>
          <div className="flex flex-col gap-2">
            {(tasks ?? []).length === 0 ? (
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Nothing pending.</p>
            ) : (
              (tasks ?? []).map((t) => {
                const exec = Array.isArray(t.executive) ? t.executive[0] : t.executive;
                const vendor = Array.isArray(t.vendor) ? t.vendor[0] : t.vendor;
                return (
                  <div
                    key={t.id as string}
                    className="rounded-lg border px-4 py-3 text-sm"
                    style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}
                  >
                    <div className="font-medium">
                      {vendor?.name} → {exec?.title}, {exec?.company}
                    </div>
                    <div className="mt-0.5 truncate" style={{ color: "var(--muted-foreground)" }}>
                      {t.q1_what as string}
                    </div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--portal-amber-ink)" }}>
                      Request sent {formatDate(t.created_at as string)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
            Recent gifts
          </h2>
          <div className="flex flex-col gap-2">
            {(recentGifts ?? []).length === 0 ? (
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No gifts yet.</p>
            ) : (
              (recentGifts ?? []).map((g) => {
                const charity = Array.isArray(g.charity) ? g.charity[0] : g.charity;
                return (
                  <div
                    key={g.id as string}
                    className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
                    style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}
                  >
                    <span>{charity?.name ?? "—"}</span>
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>
                        {g.status as string}
                      </span>
                      <span className="font-semibold">{formatAud(g.charity_amount_cents as number)}</span>
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
