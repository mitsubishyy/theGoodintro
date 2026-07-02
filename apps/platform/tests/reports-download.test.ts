import { describe, it, expect } from "vitest";
import { REPORTS } from "../lib/reports";
import { parseDateParam, parseWindow, resolveReport, reportFilename } from "../lib/reports-download";

/**
 * Pure unit tests for the /admin/reports download glue (no DB, no network). The
 * report ENGINE itself is covered by the DB-backed reports.test.ts; this guards
 * the param parsing, registry lookup, filename, and the registry shape that the
 * page and route handler depend on.
 */

describe("parseDateParam", () => {
  it("accepts a valid date-only string and trims it", () => {
    expect(parseDateParam("2026-06-26")).toBe("2026-06-26");
    expect(parseDateParam("  2026-06-26  ")).toBe("2026-06-26");
  });
  it("rejects absent, malformed, or impossible dates", () => {
    for (const bad of [null, undefined, "", "2026/06/26", "26-06-2026", "June", "2026-13-01", "2026-02-30"]) {
      expect(parseDateParam(bad)).toBeNull();
    }
  });
});

describe("parseWindow", () => {
  it("returns undefined when neither bound is valid (report falls back to FY)", () => {
    expect(parseWindow(null, null)).toBeUndefined();
    expect(parseWindow("bad", "")).toBeUndefined();
  });
  it("builds a one- or two-sided half-open window", () => {
    expect(parseWindow("2025-07-01", "2026-07-01")).toEqual({ from: "2025-07-01", to: "2026-07-01" });
    expect(parseWindow("2025-07-01", null)).toEqual({ from: "2025-07-01" });
    expect(parseWindow(null, "2026-07-01")).toEqual({ to: "2026-07-01" });
  });
  it("drops an invalid bound rather than discarding the whole window", () => {
    expect(parseWindow("2025-07-01", "nonsense")).toEqual({ from: "2025-07-01" });
  });
});

describe("resolveReport", () => {
  it("resolves a known key and rejects unknown or empty", () => {
    expect(resolveReport("gift-ledger")?.key).toBe("gift-ledger");
    expect(resolveReport("revenue-pl")?.kind).toBe("summary");
    expect(resolveReport("does-not-exist")).toBeUndefined();
    expect(resolveReport(null)).toBeUndefined();
    expect(resolveReport("")).toBeUndefined();
  });
});

describe("reportFilename", () => {
  it("names the file with the key and the optional window", () => {
    expect(reportFilename("gift-ledger")).toBe("gift-ledger.csv");
    expect(reportFilename("revenue-pl", { from: "2025-07-01", to: "2026-07-01" })).toBe(
      "revenue-pl_2025-07-01_2026-07-01.csv",
    );
    expect(reportFilename("gst-bas", { from: "2025-07-01" })).toBe("gst-bas_2025-07-01_now.csv");
    expect(reportFilename("gst-bas", { to: "2026-07-01" })).toBe("gst-bas_start_2026-07-01.csv");
  });
});

describe("REPORTS registry shape (the page and route depend on it)", () => {
  it("has 15 reports (3 ledgers + 12 summaries) with unique keys and valid kinds", () => {
    expect(REPORTS).toHaveLength(15);
    expect(REPORTS.filter((r) => r.kind === "ledger")).toHaveLength(3);
    expect(REPORTS.filter((r) => r.kind === "summary")).toHaveLength(12);
    const keys = REPORTS.map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const r of REPORTS) {
      expect(r.key).toMatch(/^[a-z0-9-]+$/);
      expect(r.label.length).toBeGreaterThan(0);
      expect(typeof r.build).toBe("function");
    }
  });
});
