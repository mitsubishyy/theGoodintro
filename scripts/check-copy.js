#!/usr/bin/env node
/*
 * check-copy.js — guards customer-facing copy against the two mistakes that keep
 * shipping from stale memory / legacy repo text (see FACTS.md):
 *   1. lowercase brand "theGoodintro"  (copy/UI must say "TheGoodIntro")
 *   2. hardcoded dollar figures outside the pricing source of truth
 *
 * Two tiers:
 *   ENFORCE_DIRS  -> failures here exit 1 (the new platform has no excuse)
 *   REPORT_DIRS   -> printed as info only, never fails (e.g. the live marketing
 *                    site mid-rebrand, a separate cleanup)
 *
 * Escape hatch: put the comment `facts-ok` on a line to skip it (use sparingly).
 *
 * Run:  npm run check:copy
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const ENFORCE_DIRS = ["apps/platform/app"];
const REPORT_DIRS = ["apps/web/app", "copy"];
const EXT = new Set([".tsx", ".ts", ".jsx", ".js", ".md", ".mdx"]);

// Pricing sources of truth — exempt from the hardcoded-money rule.
const PRICE_SOURCE_ALLOW = new Set([
  "apps/web/app/pricing/page.tsx",
  "CALCULATIONS.md",
  // Static exec EMAIL design samples: deliberately show a worked band-1 ($900)
  // example. In-file comments document that live values come from the pricing
  // engine. The live gift computation (data.ts / @thegoodintro/pricing) is NOT
  // exempt and is still guarded.
  "apps/platform/app/exec/email/page.tsx",
  "apps/platform/app/exec/_components/meeting-request-email.tsx",
]);

const IGNORE = "facts-ok";
// Lines that are plumbing, not copy (imports, package scope, urls, file paths).
const PATHY = /(import\s|from\s+['"]|@thegoodintro|https?:\/\/|thegoodintro\.|\/theGoodintro|require\()/;
const MONEY_RE = /\$\s?\d{1,3}(,\d{3})+(\.\d+)?|\$\s?\d{3,}(\.\d+)?/g;

function walk(dir, acc) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".next" || e.name === ".git") continue;
      walk(p, acc);
    } else if (EXT.has(path.extname(e.name))) {
      acc.push(p);
    }
  }
  return acc;
}

function scan(dirs) {
  const files = [];
  for (const d of dirs) walk(path.join(ROOT, d), files);
  const brand = [];
  const money = [];
  for (const f of files) {
    const rel = path.relative(ROOT, f);
    const isPriceSource = PRICE_SOURCE_ALLOW.has(rel);
    const lines = fs.readFileSync(f, "utf8").split("\n");
    let inBlock = false; // inside a /* ... */ or {/* ... */} comment
    lines.forEach((line, i) => {
      const trimmed = line.trim();
      const wasInBlock = inBlock;
      if (inBlock) {
        if (/\*\/\}?/.test(line)) inBlock = false; // block closes on this line
      } else if (/(\/\*|\{\/\*)/.test(line) && !/\*\/\}?/.test(line)) {
        inBlock = true; // block opens and does not close on this line
      }
      const isComment = wasInBlock || inBlock || /^(\/\/|\/\*|\*|\{\/\*)/.test(trimmed);
      if (line.includes(IGNORE)) return;
      if (line.includes("theGoodintro") && !PATHY.test(line)) {
        brand.push(`${rel}:${i + 1}  ${trimmed.slice(0, 90)}`);
      }
      if (!isPriceSource && !isComment && !PATHY.test(line)) {
        const m = line.match(MONEY_RE);
        if (m) money.push(`${rel}:${i + 1}  ${m.join(", ")}   ${trimmed.slice(0, 70)}`);
      }
    });
  }
  return { brand, money };
}

function print(title, { brand, money }) {
  const total = brand.length + money.length;
  if (!total) {
    console.log(`  ${title}: clean`);
    return total;
  }
  console.log(`\n  ${title}:`);
  if (brand.length) {
    console.log(`    ${brand.length} lowercase "theGoodintro" (should be "TheGoodIntro"):`);
    brand.forEach((h) => console.log("      " + h));
  }
  if (money.length) {
    console.log(`    ${money.length} hardcoded $ figure(s) outside the pricing source:`);
    money.forEach((h) => console.log("      " + h));
  }
  return total;
}

console.log("check:copy — brand spelling + pricing (see FACTS.md)\n");

const enforce = scan(ENFORCE_DIRS);
const report = scan(REPORT_DIRS);

console.log("ENFORCED (must be clean):");
const enforceTotal = print(ENFORCE_DIRS.join(", "), enforce);

console.log("\nREPORT ONLY (rebrand/cleanup backlog, non-blocking):");
print(REPORT_DIRS.join(", "), report);

if (enforceTotal > 0) {
  console.error(
    `\n✖ check:copy FAILED: ${enforceTotal} issue(s) in enforced paths. ` +
      `Use "TheGoodIntro" and pull prices from the pricing module, or annotate with "facts-ok".\n`
  );
  process.exit(1);
}
console.log("\n✓ check:copy passed (enforced paths clean).\n");
