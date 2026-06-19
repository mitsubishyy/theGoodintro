import type { Metadata } from "next";
import { Button, PortalPage } from "@thegoodintro/ui";
import { createClient } from "@/lib/supabase/server";
import { getFlag } from "@/lib/flags";
import { formatDate } from "@/lib/format";
import { AdminExecutivesTable, type ExecRow } from "./_table";
import type { ExecStatusEnum } from "./_status";

export const metadata: Metadata = {
  title: "Executives — TheGoodIntro admin",
  robots: { index: false, follow: false },
};

const DEFAULT_PER_PAGE = 25;
const PER_PAGE_OPTIONS = [10, 25, 50, 100];

function one<T>(v: unknown): T | undefined {
  return (Array.isArray(v) ? v[0] : v) as T | undefined;
}

export default async function ExecutivesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, Number(pageParam ?? "1") || 1);
  const perParam = Number(Array.isArray(sp.per) ? sp.per[0] : sp.per);
  const perPage = PER_PAGE_OPTIONS.includes(perParam) ? perParam : DEFAULT_PER_PAGE;

  const supabase = await createClient();
  const enabled = await getFlag("exec_onboarding");
  const { data: execs } = await supabase
    .from("executive")
    .select(
      "id, name, title, company, status, primary_email, photo_url, created_at, charity:default_charity_id(name)",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  // All executives load in one query and slice in memory so the mono count and
  // pagination agree (mirrors the Admin Vendors list; move to DB-level paging
  // once the directory grows past a few hundred).
  const allRows: ExecRow[] = (execs ?? []).map((e) => {
    const charity = one<{ name: string }>(e.charity);
    const role = [e.title as string | null, e.company as string | null]
      .filter(Boolean)
      .join(", ");
    return {
      id: e.id as string,
      name: (e.name as string) ?? "",
      email: (e.primary_email as string | null) ?? null,
      photoUrl: (e.photo_url as string | null) ?? null,
      role,
      charityName: charity?.name ?? null,
      addedLabel: formatDate(e.created_at as string),
      status: e.status as ExecStatusEnum,
    };
  });

  const totalCount = allRows.length;
  const activeCount = allRows.filter((r) => r.status === "active").length;
  const pageCount = Math.max(1, Math.ceil(totalCount / perPage));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * perPage;
  const rows = allRows.slice(start, start + perPage);

  const visibleStart = totalCount === 0 ? 0 : start + 1;
  const visibleEnd = Math.min(start + rows.length, totalCount);
  const rangeLabel =
    totalCount === 0
      ? "No executives"
      : `Showing ${visibleStart} to ${visibleEnd} of ${totalCount}`;

  return (
    <PortalPage
      title="Executives"
      breadcrumb={[{ label: "Home", href: "/admin" }, { label: "Executives" }]}
      count={`${activeCount} active / ${totalCount} all`}
      action={
        enabled ? (
          <Button variant="primary" size="md" href="/admin/executives/new">
            + New executive
          </Button>
        ) : undefined
      }
    >
      <AdminExecutivesTable
        rows={rows}
        page={safePage}
        pageCount={pageCount}
        rangeLabel={rangeLabel}
        perPage={perPage}
        newHref={enabled ? "/admin/executives/new" : null}
      />
    </PortalPage>
  );
}
