import type { NextConfig } from "next";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Workspace root (where the lockfile lives) is two levels up from apps/platform.
const monorepoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// The platform is internal: deny framing, no indexing. CSP is deliberately
// minimal at Step 0 and will be tightened to the real Supabase / provider
// origins during the foundation pillar.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
];

const nextConfig: NextConfig = {
  turbopack: { root: monorepoRoot },
  transpilePackages: ["@thegoodintro/types", "@thegoodintro/pricing", "@thegoodintro/ui"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
