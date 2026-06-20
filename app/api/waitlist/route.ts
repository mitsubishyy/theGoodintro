import { NextRequest, NextResponse } from "next/server";

/*
  POST /api/waitlist

  Receives a waitlist signup (name, work email, role, company, audience),
  validates it server-side, enriches it with request metadata (IP, geo,
  referer, user-agent and a lightweight VPN/datacenter signal), then forwards
  it to a private Google Sheet via a Google Apps Script Web App URL
  (env: WAITLIST_SHEETS_WEBHOOK_URL). Kept on its own env var so the
  founding-cohort survey at /api/apply and the waitlist write to different
  Sheets cleanly.

  No database. No third-party form service. If the env var is not set, the
  submission is logged to the server and still returns ok, so the form is
  testable before the Sheet is wired up.

  NOTE: the metadata fields (ip, geo*, ipOrg, likelyVpnOrDatacenter, referer,
  userAgent) are SENT in the JSON payload. For them to land in the Sheet (and
  in the notification email), the Google Apps Script on the other end must be
  updated to read and write these keys — adding a payload key here does not
  create a Sheet column on its own.

  Optional: set IPINFO_TOKEN to use an authenticated ipinfo.io lookup. Without
  a token a rate-limited free lookup is used, and VPN/datacenter detection
  falls back to an org-name heuristic.
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Org-name fragments that strongly indicate a hosting / VPN / datacenter
// network rather than a residential or mobile ISP. Used as a no-API-key
// fallback when ipinfo's explicit privacy flags (paid plans) are unavailable.
const DATACENTER_HINTS = [
  "hosting",
  "datacenter",
  "data center",
  "vpn",
  "proxy",
  "ovh",
  "hetzner",
  "digitalocean",
  "linode",
  "vultr",
  "amazon",
  "aws",
  "azure",
  "oracle cloud",
  "m247",
  "datacamp",
  "leaseweb",
  "choopa",
  "contabo",
  "scaleway",
  "gcore",
  "g-core",
  "psychz",
  "nforce",
  "frantech",
  "colocrossing",
  "quadranet",
  "ip volume",
  "private layer",
  "mullvad",
  "nordvpn",
  "expressvpn",
  "surfshark",
  "privacy",
];

type IpIntel = {
  org: string;
  asn: string;
  // true / false when known, "" when we could not determine it
  likelyVpnOrDatacenter: boolean | "";
  source: string;
};

async function ipIntel(ip: string): Promise<IpIntel> {
  if (!ip || ip === "unknown") {
    return { org: "", asn: "", likelyVpnOrDatacenter: "", source: "no-ip" };
  }
  try {
    const token = process.env.IPINFO_TOKEN;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(
      `https://ipinfo.io/${encodeURIComponent(ip)}/json${token ? `?token=${token}` : ""}`,
      { signal: ctrl.signal, headers: { Accept: "application/json" } },
    );
    clearTimeout(t);
    if (!res.ok) {
      return { org: "", asn: "", likelyVpnOrDatacenter: "", source: `http_${res.status}` };
    }
    const data: Record<string, unknown> = await res.json();
    const org = typeof data.org === "string" ? data.org : "";
    const asn = org.startsWith("AS") ? org.split(" ")[0] : "";
    // Paid ipinfo plans return a `privacy` object with authoritative flags.
    const priv = (data.privacy as Record<string, unknown> | undefined) ?? {};
    const explicit =
      Boolean(priv.vpn) ||
      Boolean(priv.proxy) ||
      Boolean(priv.tor) ||
      Boolean(priv.hosting) ||
      Boolean(priv.relay);
    const heuristic = DATACENTER_HINTS.some((k) => org.toLowerCase().includes(k));
    return {
      org,
      asn,
      likelyVpnOrDatacenter: explicit || heuristic,
      source: token ? "ipinfo" : "ipinfo-free",
    };
  } catch {
    return { org: "", asn: "", likelyVpnOrDatacenter: "", source: "lookup_failed" };
  }
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

  // Email is required, and must be a plausible email. This keeps every lead
  // contactable and rejects the blank / drive-by submissions the form used to
  // accept.
  if (!email) {
    return NextResponse.json(
      { error: "Please enter your work email so we can be in touch." },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "That email does not look valid. Please check it." },
      { status: 400 },
    );
  }

  // Request metadata for lead attribution and abuse triage.
  const geoCountry = str(req.headers.get("x-vercel-ip-country"), 8);
  const geoRegion = str(req.headers.get("x-vercel-ip-country-region"), 16);
  const rawCity = req.headers.get("x-vercel-ip-city") || "";
  let geoCity = "";
  try {
    geoCity = rawCity ? decodeURIComponent(rawCity) : "";
  } catch {
    geoCity = rawCity;
  }
  const geoTimezone = str(req.headers.get("x-vercel-ip-timezone"), 64);
  const referer = str(req.headers.get("referer"), 500);
  const userAgent = str(req.headers.get("user-agent"), 500);

  const intel = await ipIntel(ip);

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
    // --- request metadata (added 2026-06) ---
    ip,
    geoCity,
    geoRegion,
    geoCountry,
    geoTimezone,
    ipOrg: intel.org,
    ipAsn: intel.asn,
    likelyVpnOrDatacenter: intel.likelyVpnOrDatacenter,
    ipCheckSource: intel.source,
    referer,
    userAgent,
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

  console.log(
    `[waitlist] ${record.audience.toUpperCase()} ${record.fullName || "(no name)"} <${record.email}> (${record.company || "no company"}) geo=${geoCountry || "?"}/${geoCity || "?"} vpn=${intel.likelyVpnOrDatacenter} utm=${record.utmSource}`,
  );
  return NextResponse.json({ ok: true });
}
