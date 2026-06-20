#!/usr/bin/env node
/*
 * drift-sentinel.js — periodic hygiene sweep for the slow, silent drift that
 * check-copy.js does NOT catch. Designed to be run on a recurring loop
 * (e.g. a weekly `/schedule` cloud agent) and to REPORT, never edit.
 *
 * It is the complement to check-copy.js:
 *   - check-copy.js  : does shipping copy use the right brand + avoid HARDCODED money?
 *   - drift-sentinel : do the money numbers that DO ship actually RECONCILE to
 *                      CALCULATIONS.md, and has any forbidden vocab / stray dash
 *                      crept back into customer-facing copy or the briefs?
 *
 * Three checks (see CLAUDE.md "Forbidden" + "Money is calculated in one place"):
 *   1. MONEY      — every $ figure in shipping copy must appear in the canonical
 *                   set drawn from CALCULATIONS.md (+ the pricing page). A figure
 *                   that is not in that set is drift: a stale or invented number.
 *   2. VOCAB      — MeetMagic vocabulary, "marketplace", and other rejected terms
 *                   in customer-facing copy (the app + copy dirs).
 *   3. DASHES     — em/en dashes in the brief docs (the no-dash rule), the only
 *                   allowed exception being the shared "# theGoodintro — …" H1.
 *
 * Escape hatch: put `facts-ok` on a line to skip it.
 *
 * Run:   node scripts/drift-sentinel.js          (report only, exits 0)
 *        node scripts/drift-sentinel.js --strict  (exits 1 if anything found)
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const STRICT = process.argv.includes("--strict");

const EXT = new Set([".tsx", ".ts", ".jsx", ".js", ".md", ".mdx"]);
const IGNORE = "facts-ok";

// Customer-facing copy: where a forbidden word actually ships.
const COPY_DIRS = ["apps/web/app", "apps/platform/app", "copy"];
// Money reconciliation is scoped to the PLATFORM (+ customer copy) per CLAUDE.md
// ("any money number anywhere on the platform must match CALCULATIONS.md"). The
// apps/web marketing site uses illustrative sample figures, not platform money.
const MONEY_DIRS = ["apps/platform/app", "copy"];
// Money sources of truth — the canonical figure set is built from these, and
// they are themselves exempt from the money-reconciliation scan.
const MONEY_SOURCES = ["CALCULATIONS.md", "apps/web/app/pricing/page.tsx"];
// Static exec EMAIL samples deliberately show a worked $900 band example.
const MONEY_EXEMPT = new Set([
  "apps/platform/app/exec/email/page.tsx",
  "apps/platform/app/exec/_components/meeting-request-email.tsx",
]);
// The three SHARED portal briefs (each kept as .md + house-style .docx) carry the
// firm no-dash prose rule. Internal specs (PORTAL_LAYOUT_BLUEPRINT, UI_KIT_BRIEF)
// use em-dash headings intentionally and are out of scope.
const BRIEFS = ["ADMIN_PORTAL_BRIEF.md", "VENDOR_PORTAL_BRIEF.md", "EXECUTIVE_PORTAL_BRIEF.md"];

// Lines that are plumbing, not copy.
const PATHY = /(import\s|from\s+['"]|@thegoodintro|https?:\/\/|thegoodintro\.|\/theGoodintro|require\()/;
const MONEY_RE = /\$\s?\d{1,3}(,\d{3})+(\.\d+)?|\$\s?\d{3,}(\.\d+)?/g;

// Rejected vocabulary (CLAUDE.md "Forbidden"). Word-boundary, case-insensitive.
const VOCAB = [
  /\bmarketplace\b/i,
  /\bmagic circle\b/i,
  /\bmagic\b/i,
  /\bturn your expertise into impact\b/i,
  /\bzero wasted time\b/i,
  /\bmeet better\b/i,
  /\bpitch-free\b/i,
];
// "magic link" / "magic-link" is the auth term, not MeetMagic vocabulary.
const VOCAB_EXEMPT = /\bmagic[- ]link/i;

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

function files(dirs) {
  const out = [];
  for (const d of dirs) {
    const abs = path.join(ROOT, d);
    if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) walk(abs, out);
    else if (fs.existsSync(abs)) out.push(abs);
  }
  return out;
}

// Normalize a matched $ token to an integer dollar value (drop cents + commas).
function dollars(token) {
  const n = token.replace(/[^\d.]/g, "");
  return Math.round(parseFloat(n));
}

// --- canonical money set -------------------------------------------------
const CANONICAL = new Set();
for (const f of files(MONEY_SOURCES)) {
  const txt = fs.readFileSync(f, "utf8");
  for (const m of txt.match(MONEY_RE) || []) CANONICAL.add(dollars(m));
}

// --- scans ---------------------------------------------------------------
function trackComment(line, inBlock) {
  const trimmed = line.trim();
  const was = inBlock;
  if (inBlock) {
    if (/\*\/\}?/.test(line)) inBlock = false;
  } else if (/(\/\*|\{\/\*)/.test(line) && !/\*\/\}?/.test(line)) {
    inBlock = true;
  }
  const isComment = was || inBlock || /^(\/\/|\/\*|\*|\{\/\*)/.test(trimmed);
  return { inBlock, isComment };
}

function scanMoney() {
  const hits = [];
  for (const f of files(MONEY_DIRS)) {
    const rel = path.relative(ROOT, f);
    if (MONEY_EXEMPT.has(rel)) continue;
    let inBlock = false;
    fs.readFileSync(f, "utf8").split("\n").forEach((line, i) => {
      const c = trackComment(line, inBlock);
      inBlock = c.inBlock;
      if (line.includes(IGNORE) || c.isComment || PATHY.test(line)) return;
      const m = line.match(MONEY_RE);
      if (!m) return;
      const stale = m.filter((t) => !CANONICAL.has(dollars(t)));
      if (stale.length) {
        hits.push(`${rel}:${i + 1}  ${stale.join(", ")}   ${line.trim().slice(0, 70)}`);
      }
    });
  }
  return hits;
}

function scanVocab() {
  const hits = [];
  for (const f of files(COPY_DIRS)) {
    const rel = path.relative(ROOT, f);
    let inBlock = false;
    fs.readFileSync(f, "utf8").split("\n").forEach((line, i) => {
      const c = trackComment(line, inBlock);
      inBlock = c.inBlock;
      if (line.includes(IGNORE) || c.isComment || PATHY.test(line)) return;
      const cleaned = line.replace(VOCAB_EXEMPT, "");
      for (const re of VOCAB) {
        if (re.test(cleaned)) {
          hits.push(`${rel}:${i + 1}  /${re.source}/   ${line.trim().slice(0, 70)}`);
          break;
        }
      }
    });
  }
  return hits;
}

function scanDashes() {
  const hits = [];
  for (const f of files(BRIEFS)) {
    const rel = path.relative(ROOT, f);
    fs.readFileSync(f, "utf8").split("\n").forEach((line, i) => {
      if (line.includes(IGNORE)) return;
      // Allow the shared H1 title and en dashes inside numeric ranges (1–5).
      if (/^#\s/.test(line.trim())) return;
      const stripped = line.replace(/\d\s?–\s?\d/g, "");
      if (/[—–]/.test(stripped)) {
        hits.push(`${rel}:${i + 1}  ${line.trim().slice(0, 70)}`);
      }
    });
  }
  return hits;
}

// --- report --------------------------------------------------------------
function section(title, note, hits) {
  if (!hits.length) {
    console.log(`  ${title}: clean`);
    return 0;
  }
  console.log(`\n  ${title} — ${hits.length} (${note}):`);
  hits.forEach((h) => console.log("      " + h));
  return hits.length;
}

console.log(`drift-sentinel — money/vocab/dash drift (see CLAUDE.md)`);
console.log(`canonical money set: ${CANONICAL.size} distinct figures from CALCULATIONS.md\n`);

const money = scanMoney();
const vocab = scanVocab();
const dashes = scanDashes();

let total = 0;
total += section("MONEY", "$ figures not in CALCULATIONS.md — verify or fix", money);
total += section("VOCAB", "rejected vocabulary in customer-facing copy", vocab);
total += section("DASHES", "em/en dash in brief prose (no-dash rule)", dashes);

if (total === 0) {
  console.log("\n✓ drift-sentinel: no drift found.\n");
} else {
  console.log(`\n⚠ drift-sentinel: ${total} item(s) to review (report only).\n`);
  if (STRICT) process.exit(1);
}
