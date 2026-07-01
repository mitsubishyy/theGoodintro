import type { Metadata } from "next";
import { REPORTS } from "@/lib/reports";
import { financialYearWindow } from "@/lib/reporting";

export const metadata: Metadata = {
  title: "Reports · TheGoodIntro admin",
  robots: { index: false, follow: false },
};

const GROUP_LABEL: Record<"summary" | "ledger", string> = {
  summary: "Summary reports",
  ledger: "Raw ledgers (master backup)",
};

/**
 * Admin reports surface (V2_BUILD_PLAN §6.3, blueprint T3). Lists the report
 * registry grouped by kind and links each to the staff-only CSV download route,
 * carrying a financial-year-default date range. No money is rendered here: every
 * figure is built server-side by the (DB-tested) report engine and streamed as a
 * CSV, so this page stays a thin index over `REPORTS`.
 */
export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const fy = financialYearWindow();
  const from = sp.from || fy.from;
  const to = sp.to || fy.to;
  const range = new URLSearchParams({ from, to }).toString();

  const labelStyle = { color: "var(--muted-foreground)" } as const;
  const inputStyle = { borderColor: "var(--portal-line)", background: "var(--portal-card)" } as const;
  const buttonStyle = { background: "var(--portal-ink)", color: "var(--portal-card)" } as const;

  return (
    <div className="max-w-3xl px-8 py-6">
      <h1 className="text-[20px] font-semibold tracking-tight">Reports</h1>
      <p className="mt-1 mb-6 text-sm" style={labelStyle}>
        Download the finance and operations exports as CSV. The date range applies to the period reports (revenue, GST,
        charity donated, per vendor, per executive); ledgers and balances always export in full.
      </p>

      <form method="get" className="mb-7 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={labelStyle}>From</span>
          <input type="date" name="from" defaultValue={from} className="rounded-lg border px-3 py-2 text-sm" style={inputStyle} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={labelStyle}>To</span>
          <input type="date" name="to" defaultValue={to} className="rounded-lg border px-3 py-2 text-sm" style={inputStyle} />
        </label>
        <button type="submit" className="rounded-lg px-3 py-2 text-sm font-semibold" style={buttonStyle}>
          Apply range
        </button>
        <span className="text-xs" style={labelStyle}>
          Defaults to the current financial year ({fy.from} to {fy.to}).
        </span>
      </form>

      {(["summary", "ledger"] as const).map((kind) => {
        const rows = REPORTS.filter((r) => r.kind === kind);
        return (
          <section key={kind} className="mb-6">
            <h2 className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em]" style={labelStyle}>
              {GROUP_LABEL[kind]}
            </h2>
            <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--portal-line)" }}>
              <table className="w-full text-sm">
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.key} style={{ borderTop: i > 0 ? "1px solid var(--portal-line)" : undefined }}>
                      <td className="px-4 py-3 font-medium">{r.label}</td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={`/admin/reports/download?key=${encodeURIComponent(r.key)}&${range}`}
                          className="inline-block rounded-lg px-3 py-1.5 text-xs font-semibold"
                          style={buttonStyle}
                        >
                          Download CSV
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
