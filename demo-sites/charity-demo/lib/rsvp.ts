// One-click RSVP tokens for cold-email outreach.
//
// A cold-emailed executive has no login and no row in any database. So the
// link in their email *is* the proof of who they are: a tiny payload (their
// name / email / company) signed with a server-only secret (RSVP_SECRET).
// The /api/rsvp route verifies the signature before recording anything, so a
// recipient cannot forge or tamper with another person's response.
//
// Token shape:  base64url(payloadJSON) "." base64url(HMAC-SHA256(payloadB64))
//
// IMPORTANT: the signing logic here is mirrored, byte-for-byte, in
// scripts/make-rsvp-links.mjs (which generates the links for the mail-merge).
// If you change the algorithm, change it in both places or old links break.

import crypto from "node:crypto";

export type RsvpPayload = {
  n: string; // full name
  e: string; // email
  c: string; // company
  iat: number; // issued-at (unix seconds), for the audit trail
};

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlToBuf(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function secret(): string {
  const s = process.env.RSVP_SECRET;
  if (!s) throw new Error("RSVP_SECRET is not set");
  return s;
}

export function sign(payload: RsvpPayload): string {
  const body = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
  const sig = b64url(crypto.createHmac("sha256", secret()).update(body).digest());
  return `${body}.${sig}`;
}

// Returns the payload if the token is authentic, otherwise null.
// Uses a constant-time compare so a tampered token can't be brute-forced.
export function verify(token: string): RsvpPayload | null {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = crypto.createHmac("sha256", secret()).update(body).digest();
  let given: Buffer;
  try {
    given = b64urlToBuf(sig);
  } catch {
    return null;
  }
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
    return null;
  }

  try {
    const obj = JSON.parse(b64urlToBuf(body).toString("utf8"));
    if (typeof obj?.e !== "string") return null;
    return obj as RsvpPayload;
  } catch {
    return null;
  }
}
