import { NextRequest, NextResponse } from "next/server";

/*
  POST /api/waitlist

  Receives a waitlist signup (name, work email, role, company, audience),
  validates it server-side, then forwards it to a private Google Sheet via a
  Google Apps Script Web App URL (env: WAITLIST_SHEETS_WEBHOOK_URL). Kept
  on its own env var so the founding-cohort survey at /api/apply and the
  waitlist write to different Sheets cleanly.

  No database. No third-party form service. If the env var is not set, the
  submission is logged to the server and still returns ok, so the form is
  testable before the Sheet is wired up.
*/

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 10;
const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    if (hits.size > 2000) {
      for (const [k, v] of hits) if (now > v.reset) hits.delete(k);
    }
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

function str(v: unknown, max = 500): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429, headers: { "Retry-After": "3600" } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot.
  if (str(body.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  const audience = str(body.audience, 20);
  const email = str(body.email, 200);

  if (audience !== "executive" && audience !== "vendor") {
    return NextResponse.json(
      { error: "Please tell us whether you are joining as an executive or a vendor." },
      { status: 400 },
    );
  }

  // Email is optional, but if provided it must be a plausible email.
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "That email does not look valid. Please check it." },
      { status: 400 },
    );
  }

  const record = {
    type: "waitlist",
    submittedAt: new Date().toLocaleString("en-AU", {
      timeZone: "Australia/Sydney",
      dateStyle: "medium",
      timeStyle: "short",
    }),
    audience,
    fullName: str(body.fullName, 200),
    email,
    title: str(body.title, 200),
    company: str(body.company, 200),
    execTopics: audience === "executive" ? str(body.execTopics, 1000) : "",
    execTopicsOther: audience === "executive" ? str(body.execTopicsOther, 600) : "",
    vendorOffer: audience === "vendor" ? str(body.vendorOffer, 1000) : "",
    vendorIcp: audience === "vendor" ? str(body.vendorIcp, 500) : "",
    vendorWebsite: audience === "vendor" ? str(body.vendorWebsite, 300) : "",
    utmSource: str(body.utmSource, 100),
    utmMedium: str(body.utmMedium, 100),
    utmCampaign: str(body.utmCampaign, 100),
    utmContent: str(body.utmContent, 100),
  };

  const webhook = process.env.WAITLIST_SHEETS_WEBHOOK_URL;

  if (!webhook) {
    console.log("[waitlist] WAITLIST_SHEETS_WEBHOOK_URL not set. Submission:", record);
    return NextResponse.json({ ok: true });
  }

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10_000);
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) throw new Error(`Sheet responded ${res.status}`);
  } catch (err) {
    console.error("[waitlist] Failed to forward to Sheet:", err);
    console.error("[waitlist] LOST-LEAD-RECOVERY:", JSON.stringify(record));
    return NextResponse.json(
      { error: "Something went wrong saving your details. Please try again in a moment." },
      { status: 502 },
    );
  }

  console.log(`[waitlist] ${record.audience.toUpperCase()} ${record.fullName || "(no name)"} <${record.email || "no email"}> (${record.company || "no company"}) utm=${record.utmSource}`);
  return NextResponse.json({ ok: true });
}
