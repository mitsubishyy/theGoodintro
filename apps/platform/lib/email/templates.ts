/**
 * Email composition per NOTIFICATION_TEMPLATES.md. Wording comes from that doc
 * verbatim (FACTS.md brand spelling: TheGoodIntro). No em or en dashes in copy.
 * Exec-facing mail is personal (from Issy); vendor/admin transactional mail is
 * from the brand. Every dynamic value is HTML-escaped.
 */

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

/**
 * B1 · The exec request email — the locked surface
 * (design/locked/exec-request-email/, LOCKED 2026-06-12). White card on warm
 * cream, editorial italic register, Georgia standing in for Fraunces, no
 * webfonts, no images, no mono uppercase, no badges or pills. Verification is
 * an italic line. The gift is ALWAYS "approximately $X" (the band amount at
 * the vendor's next meeting position); the exact figure locks at Held. Three
 * actions at most: emerald Accept, ghost Decline, ghost "Send to {EA} (EA)"
 * only when an EA is linked (never "my EA", never a fourth action). Modules
 * whose source columns are still queued exec-portal schema work (credibility
 * line, Q1/Q2 heads, proposed time) render only when their data is passed.
 *
 * OPEN ITEMS for Issy at go-live (locked README): final sender address +
 * subject line (this uses the README's recommended subject), and whether her
 * personal founder signature joins the quiet system footer (this renders the
 * locked system footer; lib/email/signature.ts stays available if adopted).
 */
export function execRequestEmail(c: {
  execFirstName: string;
  requesterName: string;
  requesterTitle?: string | null;
  vendorCompany: string;
  /** vendor_user.bio_one_liner once that column lands; module renders only when present. */
  credibilityLine?: string | null;
  linkedinUrl?: string | null;
  abnVerified?: boolean;
  /** request.q1_head / q2_head once those columns land; heads render only when present. */
  q1Head?: string | null;
  q1: string;
  q2Head?: string | null;
  q2: string;
  /** request.proposed_at once that column lands; the time module renders only when present. */
  proposedTimeLabel?: string | null;
  durationMinutes: number;
  /** e.g. "Zoom"; renders after the duration when present. */
  conferenceLabel?: string | null;
  indicativeAmount: string; // formatted band amount, e.g. "$1,000" — ALWAYS rendered "approximately $X"
  charityName: string;
  eaFirstName?: string | null;
  confirmUrl: string; // the signed /e/<token> link
}): ComposedEmail {
  // Subject per the locked README's recommendation; the final sender address +
  // subject line are an OPEN ITEM for Issy at go-live (lock 2026-06-12).
  const subject = `${c.requesterName} (${c.vendorCompany}) has requested ${c.durationMinutes} minutes`;
  const accept = `${c.confirmUrl}?intent=accept`;
  const decline = `${c.confirmUrl}?intent=decline`;
  const toEa = `${c.confirmUrl}?intent=send_to_ea`;

  const requesterFirst = c.requesterName.split(/\s+/)[0] || c.requesterName;
  const lead = c.requesterTitle
    ? `<strong>${esc(c.requesterName)}</strong>, ${esc(c.requesterTitle)} at <strong>${esc(c.vendorCompany)}</strong>, has requested ${c.durationMinutes} minutes with you. They have been verified and reviewed.`
    : `<strong>${esc(c.requesterName)}</strong> from <strong>${esc(c.vendorCompany)}</strong> has requested ${c.durationMinutes} minutes with you. They have been verified and reviewed.`;
  const leadText = c.requesterTitle
    ? `${c.requesterName}, ${c.requesterTitle} at ${c.vendorCompany}, has requested ${c.durationMinutes} minutes with you. They have been verified and reviewed.`
    : `${c.requesterName} from ${c.vendorCompany} has requested ${c.durationMinutes} minutes with you. They have been verified and reviewed.`;

  // Verification is an ITALIC LINE, never a badge or pill (lock anti-list).
  const verifyBits = [];
  if (c.abnVerified) verifyBits.push("ABN verified");
  verifyBits.push("Founder reviewed");
  const verifyHtml = c.linkedinUrl
    ? `${verifyBits.join(" · ")} · <a href="${esc(c.linkedinUrl)}" style="color:${E.emerald};text-decoration:underline">View ${esc(requesterFirst)} on LinkedIn &#8599;</a>`
    : verifyBits.join(" · ");

  const roleLine = c.requesterTitle
    ? `${esc(c.requesterTitle)} · ${esc(c.vendorCompany)}`
    : esc(c.vendorCompany);

  const italic = (s: string, size = 13) =>
    `<span style="font-family:${SERIF};font-style:italic;font-size:${size}px;color:${E.muted}">${s}</span>`;
  const eyebrow = (s: string) =>
    `<div style="margin:22px 0 4px">${italic(esc(s))}</div>`;
  const head = (s: string) =>
    `<div style="margin:0 0 6px;font-family:${SERIF};font-size:17px;font-weight:600;color:${E.ink}">${esc(s)}</div>`;

  // Bulletproof buttons: nowrap labels (verify-at-port #1), inline-block
  // 3-across at 600px, stacked full-width under 480px via the head media query.
  const btn = (href: string, label: string, solid: boolean) =>
    `<a class="tg-btn" href="${esc(href)}" style="display:inline-block;white-space:nowrap;margin:0 8px 10px 0;padding:12px 22px;border-radius:9999px;font-family:${SANS};font-size:14px;font-weight:600;text-decoration:none;text-align:center;${
      solid
        ? `background:${E.emerald};color:#ffffff;border:1px solid ${E.emerald}`
        : `background:transparent;color:${E.ink};border:1px solid #cfc8b8`
    }">${esc(label)}</a>`;

  const giftLineHtml = `If you accept, <strong>approximately ${esc(c.indicativeAmount)}</strong> directs to <strong>${esc(c.charityName)}</strong>.`;
  const giftSub =
    "Your standing nomination. The exact gift is confirmed after the meeting. Reply CHARITY to direct this meeting\u2019s gift to a different DGR-endorsed charity, just this once.";

  const preview = `${c.q1Head ?? c.q1.slice(0, 80)} · approximately ${c.indicativeAmount} to ${c.charityName} if you accept.`;

  const html = `<!doctype html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>@media (max-width:480px){.tg-btn{display:block !important;width:100% !important;box-sizing:border-box !important;margin-right:0 !important}}</style>
</head><body style="margin:0;padding:0;background:#f6f2e8">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${esc(preview)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f6f2e8"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${E.white};border:1px solid ${E.border};border-radius:14px"><tr><td style="padding:28px 24px;font-family:${SANS};font-size:14px;line-height:1.55;color:${E.ink}">

<!-- Wordmark: Fraunces colour split (Georgia fallback), text only -->
<div style="font-family:${SERIF};font-size:16px;font-weight:600;letter-spacing:-0.01em;color:${E.ink}">The<span style="color:${E.emerald}">Good</span>Intro</div>

<div style="margin:18px 0 14px">${italic("A request for your time", 14)}</div>

<p style="margin:0 0 1em">Hi ${esc(c.execFirstName)},</p>
<p style="margin:0 0 1em">${lead}</p>

<!-- Vendor card: warm-cream tint panel -->
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:16px 0;background:${E.cream};border-radius:12px">
<tr>
<td style="padding:16px 0 16px 16px;vertical-align:top;width:48px">
  <div style="width:48px;height:48px;border-radius:50%;background:${E.mint};text-align:center;line-height:48px;font-family:${SANS};font-size:16px;font-weight:600;color:${E.emerald}">${esc(initials(c.requesterName))}</div>
</td>
<td style="padding:16px;vertical-align:top">
  <div style="font-family:${SANS};font-size:14px;font-weight:600;color:${E.ink}">${esc(c.requesterName)}</div>
  <div style="margin-top:2px;font-size:12.5px;color:${E.muted}">${roleLine}</div>
  ${c.credibilityLine ? `<div style="margin-top:8px">${italic(esc(c.credibilityLine))}</div>` : ""}
  <div style="margin-top:6px">${italic(verifyHtml, 12)}</div>
</td>
</tr>
</table>

${eyebrow("What they want to discuss")}
${c.q1Head ? head(c.q1Head) : ""}
<p style="margin:0 0 1em">${esc(c.q1)}</p>

${eyebrow("Why you, specifically")}
<div style="border-left:2px solid ${E.emerald};padding-left:14px;margin:0 0 1em">
${c.q2Head ? head(c.q2Head) : ""}
<p style="margin:0">${esc(c.q2)}</p>
</div>

${
  c.proposedTimeLabel
    ? `<div style="margin:18px 0 0;font-family:${SERIF};font-size:17px;font-weight:600;color:${E.ink}">${esc(c.proposedTimeLabel)}</div>
<div style="margin:2px 0 0;font-size:12.5px;color:${E.muted}">${c.durationMinutes} min${c.conferenceLabel ? ` · ${esc(c.conferenceLabel)}` : ""}</div>`
    : ""
}

<!-- Gift block: light emerald wash, heart in text presentation (no emoji) -->
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:18px 0;background:${E.giftBg};border-radius:10px"><tr>
<td style="padding:14px 16px">
  <div style="font-size:14px;color:${E.ink}"><span style="color:${E.emerald}">&#9829;&#65038;</span>&nbsp; ${giftLineHtml}</div>
  <div style="margin-top:5px">${italic(esc(giftSub), 12)}</div>
</td>
</tr></table>

<div style="margin:20px 0 6px">
  ${btn(accept, "Accept", true)}
  ${btn(decline, "Decline", false)}
  ${c.eaFirstName ? btn(toEa, `Send to ${c.eaFirstName} (EA)`, false) : ""}
</div>

<div style="margin:6px 0 0">${italic("Accepting holds nothing yet. We check your calendar, confirm a time with you, and send the invites.", 12)}</div>
<div style="margin:14px 0 0">${italic("Questions? Just reply to this email. It reaches a real person.", 13)}</div>

<div style="margin:22px 0 0;border-top:1px solid ${E.border};padding-top:12px;font-size:11px;color:${E.muted}">TheGoodIntro · invite-only · Australia · Email preferences</div>

</td></tr></table>
</td></tr></table>
</body></html>`;

  const eaLabel = c.eaFirstName ? `Send to ${c.eaFirstName} (EA)` : null;
  const text = [
    `Hi ${c.execFirstName},`,
    ``,
    leadText,
    ``,
    `${c.requesterName}`,
    roleLine.replaceAll("&amp;", "&"),
    ...(c.credibilityLine ? [c.credibilityLine] : []),
    verifyBits.join(" · ") + (c.linkedinUrl ? ` · ${c.linkedinUrl}` : ""),
    ``,
    `What they want to discuss:`,
    ...(c.q1Head ? [c.q1Head] : []),
    c.q1,
    ``,
    `Why you, specifically:`,
    ...(c.q2Head ? [c.q2Head] : []),
    c.q2,
    ...(c.proposedTimeLabel
      ? [``, `${c.proposedTimeLabel} · ${c.durationMinutes} min${c.conferenceLabel ? ` · ${c.conferenceLabel}` : ""}`]
      : []),
    ``,
    `If you accept, approximately ${c.indicativeAmount} directs to ${c.charityName}. Your standing nomination. The exact gift is confirmed after the meeting. Reply CHARITY to direct this meeting's gift to a different DGR-endorsed charity, just this once.`,
    ``,
    `Accept: ${accept}`,
    `Decline: ${decline}`,
    ...(eaLabel ? [`${eaLabel}: ${toEa}`] : []),
    ``,
    `Accepting holds nothing yet. We check your calendar, confirm a time with you, and send the invites.`,
    `Questions? Just reply to this email. It reaches a real person.`,
    ``,
    `TheGoodIntro · invite-only · Australia`,
  ].join("\n");

  return { subject, html, text, fromKind: "personal" };
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

/**
 * A1 · The vendor welcome (to the vendor, from the brand). Copy is
 * NOTIFICATION_TEMPLATES A1 verbatim (brand-cased per FACTS.md), dressed in the
 * locked email register (design/locked/exec-request-email/, 2026-06-12): white
 * card on warm cream, Fraunces colour-split wordmark (Georgia fallback), italic
 * eyebrow, single emerald accent, italic reply invitation, quiet system footer.
 * No pills, no mono, no images, no em or en dashes. Sent from the brand (not
 * personally), so B1's personal-signature open item does NOT apply here.
 *
 * Issy signed off the copy + look (italic eyebrow adopted) on 2026-06-13. STILL
 * NOT wired into the drain: A1_vendor_signed_up composes only the admin alert
 * until the Book-your-call button is confirmed from a real inbox and the
 * notify.* DNS is live (see resend-setup-state). Wiring is a separate,
 * flag-gated step on Issy's go.
 */
export function vendorWelcomeEmail(c: {
  contactFirstName: string;
  bookCallUrl: string;
}): ComposedEmail {
  const subject = "Welcome to TheGoodIntro";
  const italicSerif = `font-family:${SERIF};font-style:italic;color:${E.muted}`;
  const preview = "Welcome to TheGoodIntro. The next step is a short call.";
  const html = `<!doctype html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f6f2e8">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${esc(preview)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f6f2e8"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${E.white};border:1px solid ${E.border};border-radius:14px"><tr><td style="padding:28px 24px;font-family:${SANS};font-size:14px;line-height:1.55;color:${E.ink}">
<div style="font-family:${SERIF};font-size:16px;font-weight:600;letter-spacing:-0.01em;color:${E.ink}">The<span style="color:${E.emerald}">Good</span>Intro</div>
<div style="margin:18px 0 14px"><span style="${italicSerif};font-size:14px">A warm welcome</span></div>
<p style="margin:0 0 1em">Hi ${esc(c.contactFirstName)},</p>
<p style="margin:0 0 1em">Welcome to TheGoodIntro. The next step is a short call so we can get to know you and what you are hoping to achieve.</p>
<p style="margin:20px 0"><a href="${esc(c.bookCallUrl)}" style="display:inline-block;white-space:nowrap;padding:12px 22px;border-radius:9999px;font-family:${SANS};font-size:14px;font-weight:600;text-decoration:none;background:${E.emerald};color:#ffffff;border:1px solid ${E.emerald}">Book your call</a></p>
<p style="margin:0"><span style="${italicSerif};font-size:13px">Questions? Just reply to this email. It reaches a real person.</span></p>
<div style="margin:22px 0 0;border-top:1px solid ${E.border};padding-top:12px;font-size:11px;color:${E.muted}">TheGoodIntro · invite-only · Australia</div>
</td></tr></table>
</td></tr></table>
</body></html>`;
  const text = [
    `Hi ${c.contactFirstName},`,
    ``,
    `Welcome to TheGoodIntro. The next step is a short call so we can get to know you and what you are hoping to achieve.`,
    ``,
    `Book your call: ${c.bookCallUrl}`,
    ``,
    `Questions? Just reply to this email. It reaches a real person.`,
    ``,
    `TheGoodIntro · invite-only · Australia`,
  ].join("\n");
  return { subject, html, text, fromKind: "brand" };
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
