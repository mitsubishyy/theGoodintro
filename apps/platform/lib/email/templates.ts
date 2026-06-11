/**
 * Email composition per NOTIFICATION_TEMPLATES.md. Wording comes from that doc
 * verbatim (FACTS.md brand spelling: TheGoodIntro). No em or en dashes in copy.
 * Exec-facing mail is personal (from Issy); vendor/admin transactional mail is
 * from the brand. Every dynamic value is HTML-escaped.
 */

import { SIGNATURE_ATTACHMENTS, SIGNATURE_HTML, SIGNATURE_TEXT } from "./signature";
import type { EmailAttachment } from "./transport";

export type ComposedEmail = {
  subject: string;
  html: string;
  text: string;
  attachments?: EmailAttachment[];
  /** Which sender identity to use (NOTIFICATION_TEMPLATES "Conventions"). */
  fromKind: "personal" | "brand";
};

function esc(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const BUTTON_SOLID =
  "display:inline-block;padding:10px 18px;border-radius:9999px;background:#1a1a14;color:#fffdf8;text-decoration:none;font-weight:600;font-size:14px";
const BUTTON_OUTLINE =
  "display:inline-block;padding:10px 18px;border-radius:9999px;border:1px solid #d8d2c4;color:#1a1a14;text-decoration:none;font-weight:600;font-size:14px";

function shell(bodyHtml: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f6f2e8">
<div style="max-width:560px;margin:0 auto;padding:32px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a14">
${bodyHtml}
</div></body></html>`;
}

/* ── B1 exec request email palette: email-safe hex stand-ins for the site
   tokens (no CSS variables in email HTML). Emerald approximates the brand
   oklch(0.42 0.13 158); cream/mint/border approximate --cream-3 / --mint-tint
   / --border. Georgia stands in for Fraunces (no webfonts in email). */
const E = {
  ink: "#1c1b15",
  muted: "#6f6a5e",
  emerald: "#06623f",
  mint: "#e7f2ea",
  cream: "#f5f0e6",
  border: "#e2dccd",
  giftBg: "#edf3eb",
  white: "#fffdf8",
};
const SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0]!)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const MONO = "'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace";

function sectionLabel(label: string): string {
  return `<div style="margin:20px 0 4px;font-family:${MONO};font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${E.muted}">${esc(label)}</div>`;
}

/**
 * B1 · Request submitted, the first touch (to the executive, from Issy).
 * Mirrors the public promise on /executives
 * (apps/web/app/_components/meeting-request-email.tsx) in email-safe HTML:
 * inline styles, tables/divs, no images, no icons, no webfonts. Lines the
 * platform cannot yet back with data (LinkedIn, ABN verified) render only
 * when the data exists; lines promising unbuilt mechanics (reply-CHARITY
 * override, automatic calendar invites) are deliberately not made.
 */
export function execRequestEmail(c: {
  execFirstName: string;
  requesterName: string;
  requesterTitle?: string | null;
  vendorCompany: string;
  linkedinUrl?: string | null;
  abnVerified?: boolean;
  q1: string;
  q2: string;
  indicativeAmount: string; // already formatted, e.g. "$900"
  charityName: string;
  eaFirstName?: string | null;
  confirmUrl: string; // the signed /e/<token> link
}): ComposedEmail {
  const subject = `${c.requesterName} (${c.vendorCompany}) wants 45 minutes`;
  const accept = `${c.confirmUrl}?intent=accept`;
  const decline = `${c.confirmUrl}?intent=decline`;
  const toEa = `${c.confirmUrl}?intent=send_to_ea`;
  const eaLabel = c.eaFirstName ? `Send to ${c.eaFirstName} (EA)` : "Send to my EA";

  const q1Preview = c.q1.length > 90 ? `${c.q1.slice(0, 90).replace(/\s+\S*$/, "")}...` : c.q1;
  const preview = `${q1Preview} ${c.indicativeAmount} will direct to ${c.charityName}.`;

  const intro = c.requesterTitle
    ? `<strong>${esc(c.requesterName)}</strong>, ${esc(c.requesterTitle)} at <strong>${esc(c.vendorCompany)}</strong>, has requested 45 minutes with you.`
    : `<strong>${esc(c.requesterName)}</strong> from <strong>${esc(c.vendorCompany)}</strong> has requested 45 minutes with you.`;
  const introText = c.requesterTitle
    ? `${c.requesterName}, ${c.requesterTitle} at ${c.vendorCompany}, has requested 45 minutes with you.`
    : `${c.requesterName} from ${c.vendorCompany} has requested 45 minutes with you.`;

  const metaBits = ["Founder reviewed"];
  if (c.abnVerified) metaBits.unshift("ABN verified");
  const metaHtml = c.linkedinUrl
    ? `${metaBits.join(" · ")} · <a href="${esc(c.linkedinUrl)}" style="color:${E.emerald};text-decoration:underline">${esc(c.linkedinUrl.replace(/^https?:\/\//, ""))}</a>`
    : metaBits.join(" · ");

  const roleLine = c.requesterTitle
    ? `${esc(c.requesterTitle)} · ${esc(c.vendorCompany)}`
    : esc(c.vendorCompany);

  // Accept is the only solid button; the other two read as quiet bordered links.
  const acceptButton = `<a href="${esc(accept)}" style="display:inline-block;margin:0 10px 8px 0;padding:10px 20px;border-radius:9999px;font-family:${SANS};font-size:13px;font-weight:600;text-decoration:none;background:${E.ink};color:${E.white};border:1px solid ${E.ink}">Accept</a>`;
  const quietButton = (href: string, label: string) =>
    `<a href="${esc(href)}" style="display:inline-block;margin:0 10px 8px 0;padding:8px 16px;border-radius:9999px;font-family:${SANS};font-size:13px;text-decoration:none;background:transparent;color:${E.ink};border:1px solid #cfc8b8">${esc(label)}</a>`;

  // Deliberately styled as a plain personal email: pure white edge to edge, no
  // page tint, no card frame, no divider rules. The ONLY two designed elements
  // are the vendor block and the gift callout, matching the site mockup's accents.
  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#ffffff">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${esc(preview)}</div>
<div style="max-width:600px;font-family:${SANS};font-size:14px;line-height:1.5;color:${E.ink}">

<p style="margin:0 0 1em">Hi ${esc(c.execFirstName)},</p>
<p style="margin:0 0 1em">${intro} They have been vetted and reviewed. Here is what you need to know.</p>

<!-- Vendor block: branded touch 1 of 2 -->
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:16px 0;background:${E.cream};border:1px solid ${E.border};border-radius:12px">
<tr>
<td style="padding:14px 0 14px 14px;vertical-align:top;width:48px">
  <div style="width:48px;height:48px;border-radius:50%;background:${E.mint};border:1px solid ${E.border};text-align:center;line-height:48px;font-family:${SANS};font-size:16px;font-weight:600;color:${E.emerald}">${esc(initials(c.requesterName))}</div>
</td>
<td style="padding:14px;vertical-align:top">
  <div style="font-family:${SANS};font-size:14px;font-weight:600;color:${E.ink}">${esc(c.requesterName)}
    <span style="display:inline-block;margin-left:6px;padding:2px 8px;border-radius:9999px;background:${E.mint};color:${E.emerald};font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;vertical-align:middle">Verified</span>
  </div>
  <div style="margin-top:2px;font-size:12px;color:${E.muted}">${roleLine}</div>
  <div style="margin-top:6px;font-size:11px;color:${E.muted}">${metaHtml}</div>
</td>
</tr>
</table>

${sectionLabel("What they want to talk about")}
<p style="margin:0 0 1em">${esc(c.q1)}</p>

${sectionLabel("Why it is relevant to you")}
<p style="margin:0 0 1em">${esc(c.q2)}</p>

<!-- Gift callout: branded touch 2 of 2 -->
<div style="margin:16px 0;background:${E.giftBg};border:1px solid ${E.emerald};border-radius:10px;padding:12px 14px">
  <div style="font-size:13px;font-weight:600;color:${E.ink}">If you accept, <span style="font-family:${SERIF};font-style:italic;font-size:15px;color:${E.emerald}">${esc(c.indicativeAmount)}</span> directs to <strong>${esc(c.charityName)}</strong></div>
  <div style="margin-top:3px;font-size:12px;color:${E.muted}">The charity you chose. The full gift is sent after the meeting takes place.</div>
</div>

<div style="margin:16px 0 0">
  ${acceptButton}
  ${quietButton(decline, "Decline")}
  ${quietButton(toEa, eaLabel)}
</div>
<p style="margin:8px 0 0;font-size:11px;color:${E.muted}">These buttons open a short confirm page. Nothing is accepted or declined until you confirm there.</p>

<p style="margin:1.5em 0 1em">Best,</p>
<div style="margin:0 0 1.5em">
${SIGNATURE_HTML}
</div>

<p style="margin:0;font-size:11px;color:${E.muted}">TheGoodIntro · invite-only · Australia</p>
</div></body></html>`;

  const text = [
    `Hi ${c.execFirstName},`,
    ``,
    `${introText} They have been vetted and reviewed. Here is what you need to know.`,
    ``,
    `${c.requesterName} (Verified)`,
    roleLine.replaceAll("&amp;", "&"),
    metaBits.join(" / ") + (c.linkedinUrl ? ` / ${c.linkedinUrl}` : ""),
    ``,
    `What they want to talk about:`,
    c.q1,
    ``,
    `Why it is relevant to you:`,
    c.q2,
    ``,
    `If you accept, ${c.indicativeAmount} directs to ${c.charityName}, the charity you chose. The full gift is sent after the meeting takes place.`,
    ``,
    `Accept: ${accept}`,
    `Decline: ${decline}`,
    `${eaLabel}: ${toEa}`,
    ``,
    `These links open a short confirm page. Nothing is accepted or declined until you confirm there.`,
    ``,
    `Best,`,
    ``,
    SIGNATURE_TEXT,
    ``,
    `TheGoodIntro · invite-only · Australia`,
  ].join("\n");

  return { subject, html, text, attachments: SIGNATURE_ATTACHMENTS, fromKind: "personal" };
}

/** A1 · New sign-up, the admin alert (to Issy, from the brand). */
export function adminSignupAlertEmail(c: {
  company: string;
  name: string;
  email: string;
  adminVendorsUrl: string;
}): ComposedEmail {
  const subject = `New vendor sign-up: ${c.company}`;
  const line = `New vendor sign-up: ${c.company} (${c.name}, ${c.email}). Next step: book a vetting call.`;
  return {
    subject,
    text: `${line}\n\nReview: ${c.adminVendorsUrl}`,
    html: shell(`
<p>${esc(line)}</p>
<p style="margin:24px 0"><a href="${esc(c.adminVendorsUrl)}" style="${BUTTON_SOLID}">Review in the admin</a></p>`),
    fromKind: "brand",
  };
}

/** A4 · Invoice paid, the vendor receipt (from the brand). */
export function vendorReceiptEmail(c: {
  credits: number;
  startRequestUrl: string;
}): ComposedEmail {
  const subject = "Payment received, thank you";
  const line = `Thank you, your payment has cleared. ${c.credits} meeting credit${c.credits === 1 ? "" : "s"} ${c.credits === 1 ? "is" : "are"} now on your account and the executive list is open.`;
  return {
    subject,
    text: `${line}\n\nStart a request: ${c.startRequestUrl}`,
    html: shell(`
<p>${esc(line)}</p>
<p style="margin:24px 0"><a href="${esc(c.startRequestUrl)}" style="${BUTTON_SOLID}">Start a request</a></p>
<p>TheGoodIntro</p>`),
    fromKind: "brand",
  };
}
