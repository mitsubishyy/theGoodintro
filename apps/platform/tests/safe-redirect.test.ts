import { describe, it, expect } from "vitest";
import { safeNextPath } from "../lib/safe-redirect";

describe("safeNextPath (open-redirect guard)", () => {
  it("keeps safe in-app paths unchanged", () => {
    expect(safeNextPath("/admin")).toBe("/admin");
    expect(safeNextPath("/vendor/executives/123?tab=x")).toBe("/vendor/executives/123?tab=x");
    expect(safeNextPath("/account/security#frag")).toBe("/account/security#frag");
  });

  it("rejects off-site, protocol-relative, backslash, scheme, and malformed targets", () => {
    const bad: (string | null | undefined)[] = [
      "", null, undefined,
      "https://evil.com", "http://evil.com",
      "//evil.com", "/\\evil.com", "\\\\evil.com", "\\/evil.com",
      "javascript:alert(1)", "mailto:x@y.z", "data:text/html,x",
      "/\tadmin", "/ad min", " /admin", "/\nadmin",
      "admin", "vendor", "../admin",
    ];
    for (const v of bad) {
      expect(safeNextPath(v)).toBe("/");
    }
  });
});
