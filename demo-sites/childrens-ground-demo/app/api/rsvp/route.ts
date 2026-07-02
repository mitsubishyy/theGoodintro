import { after, NextRequest, NextResponse } from "next/server";
import { verify } from "../../../lib/rsvp";

/*
  POST /api/rsvp

  Records a one-click response from a cold-outreach email ("yes, I'm
  interested" / "no thanks"). The recipient is identified by the signed token
  in their email link (see lib/rsvp.ts) — there is no login.

  Speed matters: a vetted exec taps a button and must not be left waiting. So
  we verify the token, reply { ok: true } immediately, and forward the record
  to the Google Sheet in `after()` — after the response is already sent. The
  Apps Script web app round-trip is slow (several seconds), but the visitor
  never feels it. If RSVP_WEBHOOK_URL is unset, the response is just logged.

  We record on a POST (not on the GET of the link itself) so corporate email
  link scanners — which silently pre-open every URL in an inbound email —
  cannot record a false "interested" against someone who never clicked.
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

  // Forward to the Sheet AFTER the response is sent, so the click is instant.
  after(async () => {
    if (!webhook) {
      console.log("[rsvp] RSVP_WEBHOOK_URL not set. Response:", record);
      return;
    }
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15_000);
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (!res.ok) throw new Error(`Sheet responded ${res.status}`);
      console.log(`[rsvp] ${record.response} from ${record.name} (${record.email})`);
    } catch (err) {
      console.error("[rsvp] Failed to forward to Sheet:", err);
      console.error("[rsvp] LOST-RESPONSE-RECOVERY:", JSON.stringify(record));
    }
  });

  return NextResponse.json({ ok: true });
}
