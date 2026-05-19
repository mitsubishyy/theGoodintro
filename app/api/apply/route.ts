import { NextRequest, NextResponse } from "next/server";

/*
  POST /api/apply

  Receives an executive insights submission, validates it server-side,
  then forwards it to a private Google Sheet via a Google Apps Script
  Web App URL (env: SHEETS_WEBHOOK_URL). See SHEETS_SETUP.md for the
  one-time setup. The browser only ever talks to this same-origin route
  (CSP connect-src 'self'); the forward to Google happens server-side,
  so it is not subject to the browser CSP.

  No database. No third-party form service. If SHEETS_WEBHOOK_URL is not
  set, the submission is logged to the server and still returns ok, so
  the form is testable in preview before the Sheet is wired up.
*/

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── Simple in-memory rate limit (per IP, best-effort) ──────────────
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_WINDOW = 6;
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

function str(v: unknown, max = 5000): string {
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

  // Honeypot: real users never fill this hidden field.
  if (str(body.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  const fullName = str(body.fullName, 200);
  const title = str(body.title, 200);
  const company = str(body.company, 200);
  const consent = body.consent === true || body.consent === "true";

  if (!fullName) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "Please enter your title." }, { status: 400 });
  }
  if (!company) {
    return NextResponse.json({ error: "Please enter your company." }, { status: 400 });
  }
  if (!consent) {
    return NextResponse.json(
      { error: "Please confirm you are happy for your answers to be used to shape the platform." },
      { status: 400 },
    );
  }

  // Flat, ordered record. Keep keys stable: they map to Sheet columns.
  const record = {
    type: "submission",
    submittedAt: new Date().toLocaleString("en-AU", {
      timeZone: "Australia/Sydney",
      dateStyle: "medium",
      timeStyle: "short",
    }),
    fullName,
    title,
    company,
    charityAmount: str(body.charityAmount, 60),
    conflictOfInterest: str(body.conflictOfInterest, 60),
    conflictDetail: str(body.conflictDetail, 2000),
    beyondCharity: str(body.beyondCharity, 600),
    beyondCharityOther: str(body.beyondCharityOther, 600),
    needToSee: str(body.needToSee, 3000),
    meetingsPerYear: str(body.meetingsPerYear, 60),
    alignMatters: str(body.alignMatters, 10),
    questionnaireWilling: str(body.questionnaireWilling, 10),
    shareWithVendor: str(body.shareWithVendor, 10),
    mandatoryPutOff: str(body.mandatoryPutOff, 10),
    wouldRefer: str(body.wouldRefer, 30),
    biggestConcern: str(body.biggestConcern, 3000),
    anythingElse: str(body.anythingElse, 3000),
    joinWhenReady: str(body.joinWhenReady, 60),
    utmSource: str(body.utmSource, 100),
    utmMedium: str(body.utmMedium, 100),
    utmCampaign: str(body.utmCampaign, 100),
  };

  const webhook = process.env.SHEETS_WEBHOOK_URL;

  if (!webhook) {
    // Not wired yet: don't lose the lead silently in dev — log it.
    console.log("[apply] SHEETS_WEBHOOK_URL not set. Submission:", record);
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
    // Log enough to recover the lead by hand if the Sheet is down.
    console.error("[apply] Failed to forward to Sheet:", err);
    console.error("[apply] LOST-LEAD-RECOVERY:", JSON.stringify(record));
    return NextResponse.json(
      { error: "Something went wrong saving your answers. Please try again, or email hello@thebigintro.com." },
      { status: 502 },
    );
  }

  console.log(`[apply] LEAD ${record.fullName} (${record.company}) utm=${record.utmSource}`);
  return NextResponse.json({ ok: true });
}
