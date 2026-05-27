/**
 * Pure CSV export helper that enforces the CALCULATIONS.md section 6.3 envelope
 * for every report: a title line, the applied filter, a generated-at timestamp, a
 * header row, whole-dollar money columns (cents in, dollars out, no thousands
 * separators so columns never break), ex-GST and GST always in separate columns,
 * and a totals row summing the money columns. No I/O; returns a string.
 */

export interface CsvColumn<T> {
  header: string;
  /** Cell value. For money columns return integer CENTS and set `money: true`. */
  value: (row: T) => string | number | null | undefined;
  /** Money column: value is cents, rendered as whole dollars and summed into Totals. */
  money?: boolean;
}

export interface CsvReportOptions {
  title: string;
  /** Human description of the filter applied (e.g. "FY 2025-26 (sat_date)"). Required by 6.3. */
  filter: string;
  /** Defaults to now; injectable for deterministic tests. */
  generatedAt?: Date;
}

const centsToDollars = (cents: number): string => String(Math.round(cents / 100));

function escapeField(v: string | number | null | undefined): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[], opts: CsvReportOptions): string {
  const generatedAt = (opts.generatedAt ?? new Date()).toISOString();
  const lines: string[] = [];

  // 6.3 envelope preamble.
  lines.push(escapeField(opts.title));
  lines.push(`Filter: ${escapeField(opts.filter)}`);
  lines.push(`Generated at: ${generatedAt}`);
  lines.push(""); // blank separator

  // Header row.
  lines.push(columns.map((c) => escapeField(c.header)).join(","));

  // Data rows; track money-column totals.
  const totals = columns.map(() => 0);
  for (const row of rows) {
    const cells = columns.map((c, i) => {
      const raw = c.value(row);
      if (c.money) {
        const cents = typeof raw === "number" ? raw : 0;
        totals[i] += cents;
        return centsToDollars(cents);
      }
      return escapeField(raw);
    });
    lines.push(cells.join(","));
  }

  // Totals row (only if at least one money column exists).
  if (columns.some((c) => c.money)) {
    const totalCells = columns.map((c, i) => {
      if (i === 0) return escapeField("Total");
      return c.money ? centsToDollars(totals[i]) : "";
    });
    lines.push(totalCells.join(","));
  }

  return lines.join("\n") + "\n";
}
