import { NextRequest, NextResponse } from "next/server";
import { verify } from "../../../lib/rsvp";

/*
  POST /api/rsvp

  Records a one-click response from a cold-outreach email ("yes, I'm
  interested" / "no thanks"). Mirrors the /api/apply pattern: the browser only
  ever talks to this same-origin route, which forwards the record server-side
  to a private Google Sheet via a Google Apps Script Web App (env:
  RSVP_WEBHOOK_URL). See RSVP_SETUP.md for the one-time setup.

  No database. The recipient is identified by the signed token in their email
  link (see lib/rsvp.ts) — there is no login. If RSVP_WEBHOOK_URL is unset, the
  response is logged to the server and still returns ok, so links are testable
  in preview before the Sheet is wired up.

  Called from app/r/rsvp-client.tsx on page load. We deliberately do the write
  on a POST (not on the GET of the link itself) so corporate email link
  scanners — which silently pre-open every URL in an inbound email — cannot
  record a false "interested" against someone who never actually clicked.
*/

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function str(v: unknown, max = 2000): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const token = str(body.token, 4000);
  const action = str(body.action, 10); // "yes" | "no" | "undo"
  const payload = verify(token);

  if (!payload) {
    return NextResponse.json({ error: "This link is invalid or expired." }, { status: 400 });
  }
  if (action !== "yes" && action !== "no" && action !== "undo") {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  // Flat record. Keys map to columns in the RSVP sheet (see RSVP_SETUP.md).
  const record = {
    type: "rsvp",
    respondedAt: new Date().toLocaleString("en-AU", {
      timeZone: "Australia/Sydney",
      dateStyle: "medium",
      timeStyle: "short",
    }),
    name: payload.n || "",
    email: payload.e,
    company: payload.c || "",
    response: action === "yes" ? "Yes" : action === "no" ? "No" : "Undo",
    campaign: str(body.campaign, 100),
  };

  const webhook = process.env.RSVP_WEBHOOK_URL;

  if (!webhook) {
    console.log("[rsvp] RSVP_WEBHOOK_URL not set. Response:", record);
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
    console.error("[rsvp] Failed to forward to Sheet:", err);
    console.error("[rsvp] LOST-RESPONSE-RECOVERY:", JSON.stringify(record));
    return NextResponse.json(
      { error: "Something went wrong. Please try again in a moment." },
      { status: 502 },
    );
  }

  console.log(`[rsvp] ${record.response} from ${record.name} (${record.email})`);
  return NextResponse.json({ ok: true });
}
