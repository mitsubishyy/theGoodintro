import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// apps/platform/ (trailing slash) so "@/..." resolves the same as tsconfig paths.
const root = fileURLToPath(new URL(".", import.meta.url));

// RLS tests hit the staging Supabase project over the network, so allow time.
export default defineConfig({
  // Resolve the app's "@/..." path alias so route handlers (and their deps) can
  // be imported into tests, not just relative-path lib modules.
  resolve: {
    alias: [{ find: /^@\//, replacement: root }],
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Load apps/platform/.env.local into process.env (Vitest does not by default).
    setupFiles: ["./tests/setup.env.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
    // Integration tests share one staging DB; run files serially to avoid
    // cross-file races on shared rows.
    fileParallelism: false,
  },
});
