// Loads apps/platform/.env.local into process.env for the DB-backed tests.
// Vitest does NOT populate process.env from .env files by default, and the suite
// reads NEXT_PUBLIC_SUPABASE_URL / _PUBLISHABLE_KEY from process.env. Run
// `npm run test:db` (or scripts/test-db.sh) first to generate .env.local against
// the local Supabase stack.
//
// Only sets a var if it is not already defined, so CI (which exports the local
// stack's env directly via $GITHUB_ENV) always wins and this is a no-op there.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), ".."); // apps/platform

for (const file of [".env.local", ".env"]) {
  try {
    const text = readFileSync(resolve(root, file), "utf8");
    for (const raw of text.split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if (
        val.length >= 2 &&
        ((val[0] === '"' && val.endsWith('"')) || (val[0] === "'" && val.endsWith("'")))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  } catch {
    // file may not exist (e.g. CI sets env directly) — ignore.
  }
}
