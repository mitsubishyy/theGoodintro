import { requireStaff } from "@/lib/auth";
import { parseWindow, resolveReport, reportFilename } from "@/lib/reports-download";

/**
 * Staff-only CSV download for the /admin/reports screen. A Route Handler (not a
 * page) so it can stream a file: it resolves the report from the registry, runs
 * its `build()` against the staff session's Supabase client, and returns the CSV
 * as an attachment. The money/aggregation logic lives entirely in the (DB-tested)
 * report engine; this handler is auth + param-parse + response only.
 *
 * requireStaff() redirects signed-out / non-staff requests, so the financial data
 * is never served without a staff session. Route handlers are not wrapped by the
 * admin layout, so this gate is load-bearing here, not redundant.
 */
export async function GET(request: Request): Promise<Response> {
  const { supabase } = await requireStaff();

  const params = new URL(request.url).searchParams;
  const report = resolveReport(params.get("key"));
  if (!report) {
    return new Response("Unknown report.", { status: 404 });
  }

  const window = parseWindow(params.get("from"), params.get("to"));

  let csv: string;
  try {
    csv = await report.build(supabase, window);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Report failed to build.";
    return new Response(`Could not build the report: ${message}`, { status: 500 });
  }

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${reportFilename(report.key, window)}"`,
      "Cache-Control": "no-store",
    },
  });
}
