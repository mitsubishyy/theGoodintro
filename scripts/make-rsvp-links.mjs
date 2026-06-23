#!/usr/bin/env node
// Turn a recipient list into per-person Accept / Decline links for a Gmail
// mail-merge.
//
//   RSVP_SECRET=... node scripts/make-rsvp-links.mjs recipients.csv > links.csv
//
// Input CSV must have a header row with at least an `email` column. `name` and
// `company` are used if present. Output is the same rows plus two new columns,
// `accept_url` and `decline_url`, ready to paste into your mail-merge sheet and
// drop into the email as the Yes / No buttons.
//
// Options:
//   --campaign=may-cfo-2026   tags every link so you can filter the Sheet
//   --base=https://thegoodintro.com   override the link origin (default below)
//
// The HMAC signing here MUST match lib/rsvp.ts byte-for-byte, or the links it
// produces will be rejected by /api/rsvp. If you change one, change both.

import crypto from "node:crypto";
import fs from "node:fs";

const SECRET = process.env.RSVP_SECRET;
if (!SECRET) {
  console.error("Set RSVP_SECRET (the same value as in .env.local / Vercel).");
  process.exit(1);
}

const args = process.argv.slice(2);
let file = null;
let campaign = "";
let base = "https://thegoodintro.com";
for (const a of args) {
  if (a.startsWith("--campaign=")) campaign = a.slice("--campaign=".length);
  else if (a.startsWith("--base=")) base = a.slice("--base=".length).replace(/\/$/, "");
  else if (!a.startsWith("--")) file = a;
}

const input = file ? fs.readFileSync(file, "utf8") : fs.readFileSync(0, "utf8");

function b64url(buf) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function sign(payload) {
  const body = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
  const sig = b64url(crypto.createHmac("sha256", SECRET).update(body).digest());
  return `${body}.${sig}`;
}

// Minimal CSV parse/format that handles quoted fields with commas/quotes.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (ch === "\r") { /* skip */ }
    else field += ch;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function csvCell(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const rows = parseCsv(input);
if (rows.length < 2) {
  console.error("No data rows found. Expected a header row plus at least one recipient.");
  process.exit(1);
}

const header = rows[0].map((h) => h.trim().toLowerCase());
const iEmail = header.indexOf("email");
const iName = header.indexOf("name");
const iCompany = header.indexOf("company");
if (iEmail === -1) {
  console.error('Input CSV needs an "email" column.');
  process.exit(1);
}

const outHeader = [...rows[0], "accept_url", "decline_url"];
const out = [outHeader.map(csvCell).join(",")];

let count = 0;
for (let r = 1; r < rows.length; r++) {
  const cells = rows[r];
  const email = (cells[iEmail] || "").trim();
  if (!email) continue;
  const token = sign({
    n: iName >= 0 ? (cells[iName] || "").trim() : "",
    e: email,
    c: iCompany >= 0 ? (cells[iCompany] || "").trim() : "",
    iat: Math.floor(Date.now() / 1000),
  });
  const q = campaign ? `&c=${encodeURIComponent(campaign)}` : "";
  const accept = `${base}/r?a=yes&t=${token}${q}`;
  const decline = `${base}/r?a=no&t=${token}${q}`;
  out.push([...cells, accept, decline].map(csvCell).join(","));
  count++;
}

process.stdout.write(out.join("\n") + "\n");
console.error(`Generated links for ${count} recipient(s)${campaign ? ` (campaign: ${campaign})` : ""}.`);
