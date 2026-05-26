import { defineConfig } from "vitest/config";

// RLS tests hit the staging Supabase project over the network, so allow time.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
