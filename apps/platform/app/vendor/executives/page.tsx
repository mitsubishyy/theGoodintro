import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getVendor } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import {
  ExecutivesList,
  type ExecListRow,
  type ExecStatusKey,
  type FilterOptions,
} from "./_components/executives-list";
import { ExecutiveDrawer } from "./_components/executive-drawer";

export const metadata: Metadata = {
  title: "Executives — TheGoodIntro",
  robots: { index: false, follow: false },
};

function one<T>(v: unknown): T | undefined {
  return (Array.isArray(v) ? v[0] : v) as T | undefined;
}

const PAGE_SIZE = 10;

function csv(v: string | string[] | undefined): string[] {
  const s = Array.isArray(v) ? v[0] : v;
  return s ? s.split(",").filter(Boolean) : [];
}

export default async function VendorExecutivesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const result = await getVendor();
  if (!result?.user) redirect("/login");
  if (!result.vendorUser) redirect("/vendor");

  const vendor = one<{ id: string; status: string }>(result.vendorUser.vendor);
  if (vendor?.status !== "active") redirect("/vendor");
  if (!(await getFlag("request_loop"))) redirect("/vendor");

  const supabase = await createClient();
  const lockedShell = await getFlag("vendor_shell");

  if (!lockedShell) {
    // Pre-port list, unchanged (vendor_shell off).
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
            const charity = one<{ name: string }>(e.charity);
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

  // ── Locked Vendor Executives List (vendor_shell on) ────────────────────────
  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() ?? "";
  const fIndustry = csv(params.industry);
  const fTitle = csv(params.title);
  const fLocation = csv(params.location);
  const fStatus = csv(params.status);
  const sortKey = (Array.isArray(params.sort) ? params.sort[0] : params.sort) ?? "";
  const sortDir = ((Array.isArray(params.dir) ? params.dir[0] : params.dir) ?? "asc") as "asc" | "desc";
  const page = Math.max(1, Number((Array.isArray(params.page) ? params.page[0] : params.page) ?? 1) || 1);
  const drawerId = (Array.isArray(params.exec) ? params.exec[0] : params.exec) ?? null;

  // RLS already scopes: vendors read active executives, own requests/meetings.
  // TODO(perf): this loads every executive + all requests to compute exact
  // filter counts, the distinct filter options (industry/title/location), and
  // the header strip (active/requested/met), then filters/sorts/paginates in
  // memory. Correct at current scale; move the visible page to DB-level
  // pagination once the executive count grows past a few hundred, keeping a
  // separate count/distinct query so the filter totals stay exact.
  const [execsRes, requestsRes, heldRes] = await Promise.all([
    supabase
      .from("executive")
      .select("id, name, title, company, industry, country, photo_url, bio, linkedin_url, created_at, charity:default_charity_id(name)")
      .order("created_at", { ascending: false }),
    supabase.from("request").select("status, executive_id, created_at"),
    supabase.from("meeting").select("id, request:request_id(executive_id)").eq("status", "held"),
  ]);

  const execs = execsRes.data ?? [];
  const requests = requestsRes.data ?? [];
  const heldExecIds = new Set(
    (heldRes.data ?? [])
      .map((m) => one<{ executive_id: string }>(m.request)?.executive_id)
      .filter(Boolean) as string[],
  );

  // Latest request per exec, overridden by any held meeting (locked rule).
  // request_status maps to the three locked pill values: submitted/accepted →
  // "Request sent" (actioned, in flight); declined → "Declined"; closed (the
  // housekeeping terminal, not yet set by any code path) → no pill.
  const latestByExec = new Map<string, { status: string; created_at: string }>();
  for (const r of requests) {
    const prev = latestByExec.get(r.executive_id as string);
    if (!prev || (r.created_at as string) > prev.created_at) {
      latestByExec.set(r.executive_id as string, {
        status: r.status as string,
        created_at: r.created_at as string,
      });
    }
  }
  const statusOf = (execId: string): ExecStatusKey => {
    if (heldExecIds.has(execId)) return "meeting_complete";
    const latest = latestByExec.get(execId)?.status;
    if (latest === "submitted" || latest === "accepted") return "request_sent";
    if (latest === "declined") return "declined";
    return "none";
  };

  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
  const countryLabel = (code: string | null) => {
    if (!code) return null;
    try {
      return regionNames.of(code.toUpperCase()) ?? code;
    } catch {
      return code;
    }
  };

  const all: ExecListRow[] = execs.map((e) => {
    const charity = one<{ name: string }>(e.charity);
    return {
      id: e.id as string,
      name: (e.name as string) ?? "",
      title: (e.title as string) ?? "",
      company: (e.company as string) ?? "",
      industry: (e.industry as string | null) ?? null,
      country: countryLabel((e.country as string | null) ?? null),
      photoUrl: (e.photo_url as string | null) ?? null,
      status: statusOf(e.id as string),
      // drawer fields, carried so the open drawer needs no second fetch
      bio: (e.bio as string | null) ?? null,
      linkedinUrl: (e.linkedin_url as string | null) ?? null,
      charityName: charity?.name ?? null,
      memberSinceYear: new Date(e.created_at as string).getFullYear(),
    };
  });

  // Header strip counts (locked: active / requested by your team / met).
  const totals = {
    active: all.length,
    requested: new Set(requests.map((r) => r.executive_id as string)).size,
    met: heldExecIds.size,
  };

  const ql = q.toLowerCase();
  const matches = all.filter((r) => {
    if (ql && !r.company.toLowerCase().includes(ql) && !r.name.toLowerCase().includes(ql)) return false;
    if (fIndustry.length && (!r.industry || !fIndustry.includes(r.industry))) return false;
    if (fTitle.length && (!r.title || !fTitle.includes(r.title))) return false;
    if (fLocation.length && (!r.country || !fLocation.includes(r.country))) return false;
    if (fStatus.length && !fStatus.includes(r.status)) return false;
    return true;
  });

  // Default sort is created_at DESC (the fetch order, "Recently added", no
  // chevron at rest); Name + Company are the two sortable columns.
  const sorted =
    sortKey === "name" || sortKey === "company"
      ? [...matches].sort((a, b) => {
          const cmp = a[sortKey].localeCompare(b[sortKey]);
          return sortDir === "desc" ? -cmp : cmp;
        })
      : matches;

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const from = sorted.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, sorted.length);

  const filterOptions: FilterOptions = {
    industry: [...new Set(all.map((r) => r.industry).filter(Boolean) as string[])].sort(),
    // Raw distinct titles (Issy 2026-06-12: titles, not a seniority enum, for now).
    title: [...new Set(all.map((r) => r.title).filter(Boolean))].sort(),
    location: [...new Set(all.map((r) => r.country).filter(Boolean) as string[])].sort(),
    status: [
      { value: "request_sent", label: "Request sent" },
      { value: "meeting_complete", label: "Meeting complete" },
      { value: "declined", label: "Declined" },
      { value: "none", label: "No history" },
    ],
  };

  const drawerRow = drawerId ? all.find((r) => r.id === drawerId) ?? null : null;

  return (
    <>
      <ExecutivesList
        rows={rows}
        totals={totals}
        matchCount={sorted.length}
        filterOptions={filterOptions}
        active={{ q, industry: fIndustry, title: fTitle, location: fLocation, status: fStatus }}
        sort={sortKey === "name" || sortKey === "company" ? { key: sortKey, direction: sortDir } : null}
        page={safePage}
        pageCount={pageCount}
        rangeLabel={`Showing ${from} to ${to} of ${sorted.length} executives`}
      />
      {drawerRow && <ExecutiveDrawer exec={drawerRow} />}
    </>
  );
}
