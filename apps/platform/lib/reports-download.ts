import type { DateWindow } from "@thegoodintro/pricing/reporting";
import { REPORTS, type ReportDescriptor } from "./reports";

/**
 * Pure glue for the /admin/reports download route: validate the date-range query
 * params, resolve a report by key, and name the file. Kept side-effect-free (no
 * Supabase, no request) so it is unit-testable without the DB; the route handler
 * supplies the client and streams `ReportDescriptor.build()` through these.
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Validate a date-only 'YYYY-MM-DD' string; return it, or null if absent/invalid. */
export function parseDateParam(v: string | null | undefined): string | null {
  if (!v) return null;
  const s = v.trim();
  if (!DATE_RE.test(s)) return null;
  // Reject impossible dates (e.g. 2026-13-40 passes the regex but is not real).
  const d = new Date(`${s}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) return null;
  return s;
}

/**
 * Build a half-open [from, to) window from query params. Returns undefined when
 * neither bound is valid, so the report falls back to its own default (the
 * current financial year for period reports).
 */
export function parseWindow(from: string | null | undefined, to: string | null | undefined): DateWindow | undefined {
  const f = parseDateParam(from);
  const t = parseDateParam(to);
  if (!f && !t) return undefined;
  const w: DateWindow = {};
  if (f) w.from = f;
  if (t) w.to = t;
  return w;
}

/** The report descriptor for a key, or undefined for an unknown/missing key. */
export function resolveReport(key: string | null | undefined): ReportDescriptor | undefined {
  if (!key) return undefined;
  return REPORTS.find((r) => r.key === key);
}

/** A safe CSV download filename for a report key + (optional) window. */
export function reportFilename(key: string, window?: DateWindow): string {
  const span = window?.from || window?.to ? `_${window.from ?? "start"}_${window.to ?? "now"}` : "";
  return `${key}${span}.csv`;
}
