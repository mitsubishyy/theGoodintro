import { NextRequest, NextResponse } from "next/server";

/*
  POST /api/apply/copy

  A respondent finished the survey and asked for a copy of their answers.
  We can't email it yet (no email provider wired), so we record the
  request to the same private Google Sheet (wantsCopy + copyEmail
  columns) so it can be followed up. Same env as /api/apply.
*/

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 10;
const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const e = hits.get(ip);
  if (!e || now > e.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  e.count += 1;
  return e.count > MAX_PER_WINDOW;
}

function str(v: unknown, max = 300): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = str(body.email, 200);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const answers =
    body.answers && typeof body.answers === "object" ? body.answers : {};

  const record = {
    type: "copyRequest",
    submittedAt: new Date().toLocaleString("en-AU", {
      timeZone: "Australia/Sydney",
      dateStyle: "medium",
      timeStyle: "short",
    }),
    fullName: str(body.fullName, 200),
    company: str(body.company, 200),
    wantsCopy: "Yes",
    copyEmail: email,
    answersJson: JSON.stringify(answers).slice(0, 8000),
  };

  const webhook = process.env.SHEETS_WEBHOOK_URL;
  if (!webhook) {
    console.log("[apply/copy] SHEETS_WEBHOOK_URL not set. Request:", record);
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
    console.error("[apply/copy] forward failed:", err);
    console.error("[apply/copy] LOST:", JSON.stringify(record));
    return NextResponse.json(
      { error: "Could not save that. Please try again." },
      { status: 502 },
    );
  }

  console.log(`[apply/copy] copy requested by ${email}`);
  return NextResponse.json({ ok: true });
}
