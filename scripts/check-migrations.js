#!/usr/bin/env node
/*
 * check-migrations.js — guards against database migrations that ship with no
 * rollback. On a platform that moves real money, GST, and donations, a
 * migration with no clean way to undo it is a production risk: if it goes bad
 * after launch there is no safe path back.
 *
 * Convention: every supabase/migrations/NNNN_name.sql must have a matching
 * supabase/down/NNNN_name_down.sql, paired by the NNNN number prefix.
 *
 * Escape hatch: a migration that is DELIBERATELY irreversible (e.g. a pure data
 * backfill) can carry the marker `no-down:` in a SQL comment near the top with a
 * short reason. It is then reported as acknowledged, never failed. Use sparingly
 * and only with Issy's sign-off — this is a policy call, not a code one.
 *
 * Run:  node scripts/check-migrations.js            (report only, exits 0)
 *       node scripts/check-migrations.js --strict   (exits 1 if rollbacks missing)
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const STRICT = process.argv.includes("--strict");
const MIGRATIONS = path.join(ROOT, "supabase/migrations");
const DOWN = path.join(ROOT, "supabase/down");
const PREFIX = /^(\d{4})_/;
const NO_DOWN = /no-down:/i;

function sqlFiles(dir) {
  try {
    return fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  } catch {
    return [];
  }
}

const migrations = sqlFiles(MIGRATIONS);
const downs = sqlFiles(DOWN);
const downNums = new Set(downs.map((f) => (f.match(PREFIX) || [])[1]).filter(Boolean));
const migNums = new Set(migrations.map((f) => (f.match(PREFIX) || [])[1]).filter(Boolean));

const missing = [];
const acknowledged = [];
for (const f of migrations) {
  const num = (f.match(PREFIX) || [])[1];
  if (!num || downNums.has(num)) continue;
  const body = fs.readFileSync(path.join(MIGRATIONS, f), "utf8");
  (NO_DOWN.test(body) ? acknowledged : missing).push(f);
}

// Orphan downs: a rollback with no matching migration (housekeeping, non-failing).
const orphans = downs.filter((f) => {
  const num = (f.match(PREFIX) || [])[1];
  return num && !migNums.has(num);
});

console.log("check:migrations — every migration needs a rollback (supabase/down/)\n");
console.log(`  ${migrations.length} migrations, ${downs.length} down-migrations\n`);

if (missing.length) {
  console.log(`  🔴 ${missing.length} migration(s) with NO rollback:`);
  missing.forEach((f) =>
    console.log(`      ${f}  ->  expected supabase/down/${f.replace(/\.sql$/, "_down.sql")}`)
  );
} else {
  console.log("  ✓ every migration has a rollback");
}
if (acknowledged.length) {
  console.log(`\n  ${acknowledged.length} intentionally irreversible (marked no-down): ${acknowledged.join(", ")}`);
}
if (orphans.length) {
  console.log(`\n  ⚠ ${orphans.length} orphan down-migration(s) with no matching migration: ${orphans.join(", ")}`);
}

if (missing.length === 0) {
  console.log("\n✓ check:migrations passed.\n");
} else {
  console.log(`\n✖ check:migrations: ${missing.length} migration(s) need a rollback. See CHANGE_SAFETY.md.\n`);
  if (STRICT) process.exit(1);
}
