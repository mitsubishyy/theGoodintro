import { describe, it, expect } from "vitest";
import { toCsv, type CsvColumn } from "./csv";

interface Row {
  charity: string;
  abn: string;
  feeExGstCents: number;
  gstCents: number;
}

const rows: Row[] = [
  { charity: "Cancer Council", abn: "12 345", feeExGstCents: 90_000, gstCents: 9_000 },
  { charity: "RFDS, Inc", abn: "67 890", feeExGstCents: 90_000, gstCents: 9_000 },
];

const columns: CsvColumn<Row>[] = [
  { header: "Charity", value: (r) => r.charity },
  { header: "ABN", value: (r) => r.abn },
  { header: "Fee (ex GST)", value: (r) => r.feeExGstCents, money: true },
  { header: "GST", value: (r) => r.gstCents, money: true },
];

describe("CSV envelope (CALCULATIONS 6.3)", () => {
  const out = toCsv(rows, columns, {
    title: "Charity payout",
    filter: "FY 2025-26 (sat_date)",
    generatedAt: new Date("2026-05-27T00:00:00.000Z"),
  });
  const lines = out.trimEnd().split("\n");

  it("includes title, filter, and a generated-at timestamp", () => {
    expect(lines[0]).toBe("Charity payout");
    expect(lines[1]).toBe("Filter: FY 2025-26 (sat_date)");
    expect(lines[2]).toBe("Generated at: 2026-05-27T00:00:00.000Z");
  });

  it("renders money columns as whole dollars (cents in, dollars out, no commas)", () => {
    expect(lines[4]).toBe("Charity,ABN,Fee (ex GST),GST");
    expect(lines[5]).toBe('Cancer Council,12 345,900,90');
  });

  it("quotes fields containing commas so columns never break", () => {
    expect(lines[6]).toBe('"RFDS, Inc",67 890,900,90');
  });

  it("appends a totals row summing the money columns only", () => {
    expect(lines[7]).toBe("Total,,1800,180");
  });

  it("keeps ex-GST and GST in separate columns", () => {
    const header = lines[4].split(",");
    expect(header).toContain("Fee (ex GST)");
    expect(header).toContain("GST");
  });
});
