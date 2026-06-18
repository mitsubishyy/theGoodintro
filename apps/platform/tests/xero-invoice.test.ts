import { describe, it, expect } from "vitest";
import { dollarsToCents, assertInvoiceTotals } from "../lib/integrations/xero";

// Pure money-safety logic for Xero invoice creation (no network).
describe("dollarsToCents", () => {
  it("converts Xero decimal dollars to integer cents", () => {
    expect(dollarsToCents(1500)).toBe(150000);
    expect(dollarsToCents(150)).toBe(15000);
    expect(dollarsToCents(1650)).toBe(165000);
    expect(dollarsToCents("4500.00")).toBe(450000); // Xero may serialise as string
    expect(dollarsToCents(4950)).toBe(495000);
  });

  it("rounds float artefacts to the nearest cent", () => {
    expect(dollarsToCents(0.1 * 3)).toBe(30); // 0.30000000000000004 -> 30
    expect(dollarsToCents(1234.555)).toBe(123456);
  });
});

describe("assertInvoiceTotals (money-safety gate)", () => {
  const expected = { subTotalCents: 450000, gstCents: 45000 }; // 3 credits: 3×$1500 + 10%

  it("passes when Xero's totals equal the pricing-engine figures", () => {
    expect(() =>
      assertInvoiceTotals({ subTotalCents: 450000, totalTaxCents: 45000 }, expected),
    ).not.toThrow();
  });

  it("throws on a subtotal mismatch", () => {
    expect(() =>
      assertInvoiceTotals({ subTotalCents: 300000, totalTaxCents: 45000 }, expected),
    ).toThrow(/mismatch/i);
  });

  it("throws on a GST mismatch (e.g. wrong tax type / rate)", () => {
    expect(() =>
      assertInvoiceTotals({ subTotalCents: 450000, totalTaxCents: 0 }, expected),
    ).toThrow(/mismatch/i);
  });
});
