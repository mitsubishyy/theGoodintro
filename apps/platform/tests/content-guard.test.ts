import { describe, it, expect } from "vitest";
import { stripContactInfo } from "../lib/content-guard";

describe("content guard", () => {
  it("strips email addresses", () => {
    expect(stripContactInfo("reach me at alex@alpha.test please")).toBe(
      "reach me at [removed] please",
    );
  });
  it("strips URLs and bare domains", () => {
    expect(stripContactInfo("see https://acme.io/demo")).toContain("[removed]");
    expect(stripContactInfo("our site acme.com.au is live")).toContain("[removed]");
  });
  it("strips phone-like numbers", () => {
    expect(stripContactInfo("call +61 400 123 456 today")).toBe("call [removed] today");
  });
  it("leaves clean prose untouched", () => {
    const clean = "We help treasury teams cut reconciliation time in half.";
    expect(stripContactInfo(clean)).toBe(clean);
  });
  it("handles empty input", () => {
    expect(stripContactInfo("")).toBe("");
  });
});
