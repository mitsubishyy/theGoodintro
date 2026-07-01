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
 * No pills, no mono, no images, no em or en dashes. Sent PERSONALLY from Issy
 * (fromKind personal; 2026-06-20 decision, matching NOTIFICATION_TEMPLATES A1),
 * with a light first-person touch + "Issy" sign-off. The fuller doc copy (with
 * the approved emoji + gmail signature) was the richer option not taken.
 *
 * Issy signed off the copy + look (italic eyebrow adopted) on 2026-06-13. WIRED
 * into the drain as A1_vendor_welcome (composeVendorWelcome), queued at sign-up
 * by migration 0025. It only SENDS when email_sending is on + EMAIL_MODE=live.
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
<p style="margin:0 0 1em">Welcome to TheGoodIntro. The next step is a short call with me, so I can get to know you and what you are hoping to achieve.</p>
<p style="margin:20px 0"><a href="${esc(c.bookCallUrl)}" style="display:inline-block;white-space:nowrap;padding:12px 22px;border-radius:9999px;font-family:${SANS};font-size:14px;font-weight:600;text-decoration:none;background:${E.emerald};color:#ffffff;border:1px solid ${E.emerald}">Book your call</a></p>
<p style="margin:0 0 1em"><span style="${italicSerif};font-size:13px">Questions? Just reply to this email. It reaches a real person.</span></p>
<p style="margin:0 0 0.25em">Looking forward to meeting you.</p>
<p style="margin:0">Issy</p>
<div style="margin:22px 0 0;border-top:1px solid ${E.border};padding-top:12px;font-size:11px;color:${E.muted}">TheGoodIntro · invite-only · Australia</div>
</td></tr></table>
</td></tr></table>
</body></html>`;
  const text = [
    `Hi ${c.contactFirstName},`,
    ``,
    `Welcome to TheGoodIntro. The next step is a short call with me, so I can get to know you and what you are hoping to achieve.`,
    ``,
    `Book your call: ${c.bookCallUrl}`,
    ``,
    `Questions? Just reply to this email. It reaches a real person.`,
    ``,
    `Looking forward to meeting you.`,
    `Issy`,
    ``,
    `TheGoodIntro · invite-only · Australia`,
  ].join("\n");
  return { subject, html, text, fromKind: "personal" };
}

/**
 * B_forward_to_ea · The "Send to EA" forward email (to the linked EA, acting for
 * the executive). Same locked surface as B1 (design/locked/exec-request-email/,
 * 2026-06-12): white card on warm cream, Georgia for Fraunces, italic register,
 * no badges, pills, mono, or images, no em or en dashes. It differs from B1 only
 * in framing: addressed to the EA, "acting for {Exec}", with TWO actions (the EA
 * is the forward target, so there is no "Send to EA" button). The EA uses the
 * same signed /e/<token> link and selects "EA acting for them" on the confirm
 * page (EMAIL_ACTIONS.md). The gift is the EXEC's standing nomination, always
 * rendered "approximately $X"; the exact figure locks at Held.
 *
 * DRAFT pending Issy: this copy is not design-locked (the locks cover B1/A1/A4).
 * Sender follows B1 (personal); final sender + subject is the parked go-live call.
 */
export function forwardToEaEmail(c: {
  eaFirstName: string;
  execFirstName: string;
  requesterName: string;
  requesterTitle?: string | null;
  vendorCompany: string;
  credibilityLine?: string | null;
  linkedinUrl?: string | null;
  abnVerified?: boolean;
  q1Head?: string | null;
  q1: string;
  q2Head?: string | null;
  q2: string;
  proposedTimeLabel?: string | null;
  durationMinutes: number;
  conferenceLabel?: string | null;
  indicativeAmount: string;
  charityName: string;
  confirmUrl: string; // the signed /e/<token> link
}): ComposedEmail {
  const subject = `${c.requesterName} (${c.vendorCompany}) has requested ${c.durationMinutes} minutes with ${c.execFirstName}`;
  const accept = `${c.confirmUrl}?intent=accept`;
  const decline = `${c.confirmUrl}?intent=decline`;

  const requesterFirst = c.requesterName.split(/\s+/)[0] || c.requesterName;
  const lead = c.requesterTitle
    ? `<strong>${esc(c.execFirstName)}</strong> has asked you to handle a meeting request. <strong>${esc(c.requesterName)}</strong>, ${esc(c.requesterTitle)} at <strong>${esc(c.vendorCompany)}</strong>, has requested ${c.durationMinutes} minutes with ${esc(c.execFirstName)}. They have been verified and reviewed.`
    : `<strong>${esc(c.execFirstName)}</strong> has asked you to handle a meeting request. <strong>${esc(c.requesterName)}</strong> from <strong>${esc(c.vendorCompany)}</strong> has requested ${c.durationMinutes} minutes with ${esc(c.execFirstName)}. They have been verified and reviewed.`;
  const leadText = c.requesterTitle
    ? `${c.execFirstName} has asked you to handle a meeting request. ${c.requesterName}, ${c.requesterTitle} at ${c.vendorCompany}, has requested ${c.durationMinutes} minutes with ${c.execFirstName}. They have been verified and reviewed.`
    : `${c.execFirstName} has asked you to handle a meeting request. ${c.requesterName} from ${c.vendorCompany} has requested ${c.durationMinutes} minutes with ${c.execFirstName}. They have been verified and reviewed.`;

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
  const eyebrow = (s: string) => `<div style="margin:22px 0 4px">${italic(esc(s))}</div>`;
  const head = (s: string) =>
    `<div style="margin:0 0 6px;font-family:${SERIF};font-size:17px;font-weight:600;color:${E.ink}">${esc(s)}</div>`;
  const btn = (href: string, label: string, solid: boolean) =>
    `<a class="tg-btn" href="${esc(href)}" style="display:inline-block;white-space:nowrap;margin:0 8px 10px 0;padding:12px 22px;border-radius:9999px;font-family:${SANS};font-size:14px;font-weight:600;text-decoration:none;text-align:center;${
      solid
        ? `background:${E.emerald};color:#ffffff;border:1px solid ${E.emerald}`
        : `background:transparent;color:${E.ink};border:1px solid #cfc8b8`
    }">${esc(label)}</a>`;

  const giftLineHtml = `If you accept for ${esc(c.execFirstName)}, <strong>approximately ${esc(c.indicativeAmount)}</strong> directs to <strong>${esc(c.charityName)}</strong>.`;
  const giftSub = `${c.execFirstName}’s standing nomination. The exact gift is confirmed after the meeting.`;
  const actingNote = `You are acting for ${c.execFirstName}. Accepting or declining here is recorded as you acting on their behalf.`;
  const preview = `${c.execFirstName} forwarded a request: ${c.requesterName} (${c.vendorCompany}), ${c.durationMinutes} minutes.`;

  const html = `<!doctype html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>@media (max-width:480px){.tg-btn{display:block !important;width:100% !important;box-sizing:border-box !important;margin-right:0 !important}}</style>
</head><body style="margin:0;padding:0;background:#f6f2e8">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${esc(preview)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f6f2e8"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${E.white};border:1px solid ${E.border};border-radius:14px"><tr><td style="padding:28px 24px;font-family:${SANS};font-size:14px;line-height:1.55;color:${E.ink}">

<div style="font-family:${SERIF};font-size:16px;font-weight:600;letter-spacing:-0.01em;color:${E.ink}">The<span style="color:${E.emerald}">Good</span>Intro</div>

<div style="margin:18px 0 14px">${italic(`A request for ${esc(c.execFirstName)}`, 14)}</div>

<p style="margin:0 0 1em">Hi ${esc(c.eaFirstName)},</p>
<p style="margin:0 0 1em">${lead}</p>

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

${eyebrow("Why " + esc(c.execFirstName) + ", specifically")}
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

<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:18px 0;background:${E.giftBg};border-radius:10px"><tr>
<td style="padding:14px 16px">
  <div style="font-size:14px;color:${E.ink}"><span style="color:${E.emerald}">&#9829;&#65038;</span>&nbsp; ${giftLineHtml}</div>
  <div style="margin-top:5px">${italic(esc(giftSub), 12)}</div>
</td>
</tr></table>

<div style="margin:6px 0 12px">${italic(esc(actingNote), 12)}</div>

<div style="margin:8px 0 6px">
  ${btn(accept, "Accept", true)}
  ${btn(decline, "Decline", false)}
</div>

<div style="margin:6px 0 0">${italic("Accepting holds nothing yet. We check the calendar, confirm a time, and send the invites.", 12)}</div>
<div style="margin:14px 0 0">${italic("Questions? Just reply to this email. It reaches a real person.", 13)}</div>

<div style="margin:22px 0 0;border-top:1px solid ${E.border};padding-top:12px;font-size:11px;color:${E.muted}">TheGoodIntro · invite-only · Australia · Email preferences</div>

</td></tr></table>
</td></tr></table>
</body></html>`;

  const text = [
    `Hi ${c.eaFirstName},`,
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
    `Why ${c.execFirstName}, specifically:`,
    ...(c.q2Head ? [c.q2Head] : []),
    c.q2,
    ...(c.proposedTimeLabel
      ? [``, `${c.proposedTimeLabel} · ${c.durationMinutes} min${c.conferenceLabel ? ` · ${c.conferenceLabel}` : ""}`]
      : []),
    ``,
    `If you accept for ${c.execFirstName}, approximately ${c.indicativeAmount} directs to ${c.charityName}. ${c.execFirstName}'s standing nomination. The exact gift is confirmed after the meeting.`,
    ``,
    actingNote,
    ``,
    `Accept: ${accept}`,
    `Decline: ${decline}`,
    ``,
    `Accepting holds nothing yet. We check the calendar, confirm a time, and send the invites.`,
    `Questions? Just reply to this email. It reaches a real person.`,
    ``,
    `TheGoodIntro · invite-only · Australia`,
  ].join("\n");

  return { subject, html, text, fromKind: "personal" };
}

/** The locked email card chrome (design/locked/exec-request-email/, 2026-06-12):
 *  Fraunces colour-split wordmark (Georgia fallback), white card on warm cream,
 *  italic eyebrow, quiet system footer. Shared by the C-series transactional
 *  emails below so each is just its inner copy. */
function lockedCard(eyebrow: string, inner: string, preview: string): string {
  return `<!doctype html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f6f2e8">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${esc(preview)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f6f2e8"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${E.white};border:1px solid ${E.border};border-radius:14px"><tr><td style="padding:28px 24px;font-family:${SANS};font-size:14px;line-height:1.55;color:${E.ink}">
<div style="font-family:${SERIF};font-size:16px;font-weight:600;letter-spacing:-0.01em;color:${E.ink}">The<span style="color:${E.emerald}">Good</span>Intro</div>
<div style="margin:18px 0 14px"><span style="font-family:${SERIF};font-style:italic;font-size:14px;color:${E.muted}">${esc(eyebrow)}</span></div>
${inner}
<div style="margin:22px 0 0;border-top:1px solid ${E.border};padding-top:12px;font-size:11px;color:${E.muted}">TheGoodIntro · invite-only · Australia</div>
</td></tr></table>
</td></tr></table>
</body></html>`;
}

const pEl = (html: string) => `<p style="margin:0 0 1em">${html}</p>`;
const italicEl = (s: string) =>
  `<p style="margin:0 0 1em"><span style="font-family:${SERIF};font-style:italic;color:${E.muted}">${esc(s)}</span></p>`;
const solidBtnEl = (href: string, label: string) =>
  `<p style="margin:20px 0"><a href="${esc(href)}" style="display:inline-block;white-space:nowrap;padding:12px 22px;border-radius:9999px;font-family:${SANS};font-size:14px;font-weight:600;text-decoration:none;background:${E.emerald};color:#ffffff;border:1px solid ${E.emerald}">${esc(label)}</a></p>`;

/**
 * C1 · Exec accepts, the vendor confirmation (NOTIFICATION_TEMPLATES C1, from the
 * brand). Wording verbatim. Dressed in the locked card register. DRAFT (the
 * C-series is not design-locked; B1/A1/A4 are).
 */
export function execAcceptedVendorEmail(c: { execName: string }): ComposedEmail {
  const subject = `${c.execName} accepted.`;
  const lineHtml = `Good news, <strong>${esc(c.execName)}</strong> has accepted. We are securing a time now and will send the invite shortly.`;
  const lineText = `Good news, ${c.execName} has accepted. We are securing a time now and will send the invite shortly.`;
  return {
    subject,
    html: lockedCard("Your request", pEl(lineHtml), `${c.execName} accepted. Securing a time now.`),
    text: `${lineText}\n\nTheGoodIntro · invite-only · Australia`,
    fromKind: "brand",
  };
}

/**
 * C2 · Time confirmed, the vendor confirmation (NOTIFICATION_TEMPLATES C2, from
 * the brand). The exec side is the calendar invite (organiser Issy), out of the
 * drain's scope. v1 has no ICS attach yet, so "the invite is on the way" stands
 * in for "attached"; the join link renders as a button when present. DRAFT.
 */
export function timeConfirmedVendorEmail(c: {
  execName: string;
  meetingDatetimeLabel: string;
  joinUrl?: string | null;
}): ComposedEmail {
  const subject = `You are confirmed with ${c.execName}`;
  const lineHtml = `You are confirmed with <strong>${esc(c.execName)}</strong> on <strong>${esc(c.meetingDatetimeLabel)}</strong>.`;
  const followup = c.joinUrl
    ? "Your calendar invite is on the way, and you can join from the button below when it is time."
    : "Your calendar invite and join link are on the way.";
  const inner = pEl(lineHtml) + italicEl(followup) + (c.joinUrl ? solidBtnEl(c.joinUrl, "Join the meeting") : "");
  const text = [
    `You are confirmed with ${c.execName} on ${c.meetingDatetimeLabel}.`,
    followup,
    ...(c.joinUrl ? [``, `Join: ${c.joinUrl}`] : []),
    ``,
    `TheGoodIntro · invite-only · Australia`,
  ].join("\n");
  return {
    subject,
    html: lockedCard("You are confirmed", inner, `Confirmed with ${c.execName} on ${c.meetingDatetimeLabel}.`),
    text,
    fromKind: "brand",
  };
}

/**
 * C6 · Meeting held, the exec thank-you (NOTIFICATION_TEMPLATES C6, from Issy).
 * Post-Held, so the gift is the EXACT frozen GiftRecord figure (never
 * "approximately" — that prefix is the pre-Held rule only). Wording verbatim.
 * The vendor-side C6 completion email is not queued by the current flow, so only
 * the exec email is composed here. DRAFT (C-series not design-locked).
 */
export function meetingCompletedExecEmail(c: {
  execFirstName: string;
  vendorName: string;
  charityAmount: string; // exact, e.g. "$900"
  charityName: string;
}): ComposedEmail {
  const subject = `Thank you for meeting ${c.vendorName}`;
  const inner =
    pEl(`Hi ${esc(c.execFirstName)},`) +
    pEl(
      `Thank you for your time with <strong>${esc(c.vendorName)}</strong> today. As promised, <strong>${esc(c.charityAmount)}</strong> is on its way to <strong>${esc(c.charityName)}</strong>. I will confirm the moment it lands.`,
    ) +
    pEl("Issy");
  const text = [
    `Hi ${c.execFirstName},`,
    ``,
    `Thank you for your time with ${c.vendorName} today. As promised, ${c.charityAmount} is on its way to ${c.charityName}. I will confirm the moment it lands.`,
    ``,
    `Issy`,
  ].join("\n");
  return {
    subject,
    html: lockedCard("Your meeting is complete", inner, `${c.charityAmount} is on its way to ${c.charityName}.`),
    text,
    fromKind: "personal",
  };
}

/**
 * C7 · Gift paid to the charity, confirmed (NOTIFICATION_TEMPLATES C7, from Issy).
 * Wording verbatim. This is the landed-confirmation that follows C6's "on its
 * way": the amount is the EXACT frozen GiftRecord figure (snapshotted into the
 * notification payload at the gift released -> paid transition), never
 * "approximately". The vendor-side C7 is an in-app note (no email), so only the
 * exec email is composed here. DRAFT (C-series not design-locked; B1/A1/A4 are).
 */
export function giftPaidExecEmail(c: {
  execFirstName: string;
  charityAmount: string; // exact, e.g. "$900"
  charityName: string;
}): ComposedEmail {
  const subject = `Confirmed: your gift has reached ${c.charityName}`;
  const inner =
    pEl(`Hi ${esc(c.execFirstName)},`) +
    pEl(
      `confirmed: <strong>${esc(c.charityAmount)}</strong> has reached <strong>${esc(c.charityName)}</strong>. Thank you for making it happen.`,
    ) +
    pEl("Issy");
  const text = [
    `Hi ${c.execFirstName},`,
    ``,
    `confirmed: ${c.charityAmount} has reached ${c.charityName}. Thank you for making it happen.`,
    ``,
    `Issy`,
  ].join("\n");
  return {
    subject,
    html: lockedCard("Your gift is confirmed", inner, `${c.charityAmount} has reached ${c.charityName}.`),
    text,
    fromKind: "personal",
  };
}

/**
 * D1 · Uncredited (overcommit) meeting booked, payment due (NOTIFICATION_TEMPLATES
 * D1, from the brand). Wording verbatim. The amount is the flat per-meeting fee
 * (MEETING_FEE_CENTS, pulled from the pricing module, never hardcoded). DRAFT.
 */
export function uncreditedBookedVendorEmail(c: {
  execName: string;
  meetingDateLabel: string;
  amount: string; // the flat meeting fee, e.g. "$1,500"
  paymentDueDateLabel: string;
  payUrl: string;
}): ComposedEmail {
  const subject = `Payment due for your meeting with ${c.execName}`;
  const lineHtml = `Your meeting with <strong>${esc(c.execName)}</strong> is booked for <strong>${esc(c.meetingDateLabel)}</strong>. To keep it, payment of <strong>${esc(c.amount)}</strong> needs to clear by <strong>${esc(c.paymentDueDateLabel)}</strong>.`;
  const inner = pEl(lineHtml) + solidBtnEl(c.payUrl, "Pay now");
  const text = [
    `Your meeting with ${c.execName} is booked for ${c.meetingDateLabel}. To keep it, payment of ${c.amount} needs to clear by ${c.paymentDueDateLabel}.`,
    ``,
    `Pay now: ${c.payUrl}`,
    ``,
    `TheGoodIntro · invite-only · Australia`,
  ].join("\n");
  return {
    subject,
    html: lockedCard("Payment due", inner, `Payment of ${c.amount} is due by ${c.paymentDueDateLabel} to keep your meeting.`),
    text,
    fromKind: "brand",
  };
}

/**
 * D2 · Payment reminder, ~7 days before the deadline (NOTIFICATION_TEMPLATES D2,
 * from the brand). Wording verbatim: names the meeting date, the pay-by date, and
 * how many days are left, with a single "Pay now". The `daysLeft` figure is
 * computed at SEND time from the live deadline (so it is accurate even if the
 * drain runs a little after the reminder was queued). DRAFT (D-series not
 * design-locked).
 */
export function paymentReminderVendorEmail(c: {
  execName: string;
  meetingDateLabel: string;
  paymentDueDateLabel: string;
  daysLeft: number;
  payUrl: string;
}): ComposedEmail {
  const subject = `Payment reminder for your meeting with ${c.execName}`;
  const daysPhrase = `${c.daysLeft} day${c.daysLeft === 1 ? "" : "s"} away`;
  const lineHtml = `A reminder: your meeting with <strong>${esc(c.execName)}</strong> on <strong>${esc(c.meetingDateLabel)}</strong> will be cancelled unless payment clears by <strong>${esc(c.paymentDueDateLabel)}</strong>, now ${esc(daysPhrase)}.`;
  const inner = pEl(lineHtml) + solidBtnEl(c.payUrl, "Pay now");
  const text = [
    `A reminder: your meeting with ${c.execName} on ${c.meetingDateLabel} will be cancelled unless payment clears by ${c.paymentDueDateLabel}, now ${daysPhrase}.`,
    ``,
    `Pay now: ${c.payUrl}`,
    ``,
    `TheGoodIntro · invite-only · Australia`,
  ].join("\n");
  return {
    subject,
    html: lockedCard("Payment reminder", inner, `Payment clears by ${c.paymentDueDateLabel} or your meeting is cancelled, ${daysPhrase}.`),
    text,
    fromKind: "brand",
  };
}

/**
 * D3 · Auto-cancel, unpaid at the deadline — the vendor note (NOTIFICATION_TEMPLATES
 * D3, from the brand). Wording verbatim: deliberately reassuring (no credit used,
 * not charged), so no amount or date is shown. DRAFT (D-series not design-locked).
 */
export function unpaidCancelledVendorEmail(c: { execName: string }): ComposedEmail {
  const subject = `Your meeting with ${c.execName} was cancelled`;
  const lineHtml = `Your meeting with <strong>${esc(c.execName)}</strong> has been cancelled because payment did not clear in time. No credit was used, and you are welcome to rebook whenever you are ready.`;
  const text = [
    `Your meeting with ${c.execName} has been cancelled because payment did not clear in time. No credit was used, and you are welcome to rebook whenever you are ready.`,
    ``,
    `TheGoodIntro · invite-only · Australia`,
  ].join("\n");
  return {
    subject,
    html: lockedCard("Meeting cancelled", pEl(lineHtml), `Your meeting with ${c.execName} was cancelled; no credit was used.`),
    text,
    fromKind: "brand",
  };
}

/**
 * D3 · Auto-cancel — the executive (or their EA) note (NOTIFICATION_TEMPLATES D3,
 * from Issy). Body wording verbatim. The doc's shared line opens "Hi
 * {exec_first_name}"; for the EA recipient we greet the EA by name instead (as
 * the forward-to-EA email does) since they are the one reading it, and refer to
 * the executive in the body. DRAFT.
 */
export function unpaidCancelledExecEmail(c: {
  execFirstName: string;
  vendorName: string;
  meetingDateLabel: string;
  eaFirstName?: string | null;
}): ComposedEmail {
  const greetName = c.eaFirstName ?? c.execFirstName;
  const subject = `A meeting has been cancelled`;
  const inner =
    pEl(`Hi ${esc(greetName)},`) +
    pEl(
      `the meeting with <strong>${esc(c.vendorName)}</strong> on <strong>${esc(c.meetingDateLabel)}</strong> will no longer go ahead. Apologies for the change, and thank you for your flexibility.`,
    ) +
    pEl("Issy");
  const text = [
    `Hi ${greetName},`,
    ``,
    `the meeting with ${c.vendorName} on ${c.meetingDateLabel} will no longer go ahead. Apologies for the change, and thank you for your flexibility.`,
    ``,
    `Issy`,
  ].join("\n");
  return {
    subject,
    html: lockedCard("Meeting cancelled", inner, `The meeting with ${c.vendorName} on ${c.meetingDateLabel} will no longer go ahead.`),
    text,
    fromKind: "personal",
  };
}

/**
 * C3 · Meeting cancelled — the vendor note (NOTIFICATION_TEMPLATES C3, from the
 * brand). Fires when Issy cancels a `confirmed` meeting or a `proposed` one (a
 * general cancellation), NOT the unpaid auto-cancel (that is D3, with its own
 * "payment did not clear" reason). C3 is deliberately neutral: no reason, just
 * reassurance that no credit was used. DRAFT (C-series not design-locked).
 */
export function meetingCancelledVendorEmail(c: { execName: string }): ComposedEmail {
  const subject = `Your meeting with ${c.execName} has been cancelled`;
  const lineHtml = `Your meeting with <strong>${esc(c.execName)}</strong> has been cancelled. No credit has been used, and you are welcome to rebook whenever you are ready.`;
  const text = [
    `Your meeting with ${c.execName} has been cancelled. No credit has been used, and you are welcome to rebook whenever you are ready.`,
    ``,
    `TheGoodIntro · invite-only · Australia`,
  ].join("\n");
  return {
    subject,
    html: lockedCard("Meeting cancelled", pEl(lineHtml), `Your meeting with ${c.execName} was cancelled; no credit was used.`),
    text,
    fromKind: "brand",
  };
}

/**
 * C3 · Meeting cancelled — the executive note (NOTIFICATION_TEMPLATES C3, from
 * Issy). General cancellation (distinct from the D3 unpaid auto-cancel). The
 * meeting date renders only when known: a `confirmed` cancel carries a
 * `scheduled_at`; a `proposed` cancel has no time set yet, so the date phrase is
 * omitted. DRAFT.
 */
export function meetingCancelledExecEmail(c: {
  execFirstName: string;
  vendorName: string;
  meetingDateLabel: string | null;
}): ComposedEmail {
  const subject = `A meeting has been cancelled`;
  const whenHtml = c.meetingDateLabel ? ` on <strong>${esc(c.meetingDateLabel)}</strong>` : "";
  const whenText = c.meetingDateLabel ? ` on ${c.meetingDateLabel}` : "";
  const inner =
    pEl(`Hi ${esc(c.execFirstName)},`) +
    pEl(
      `the meeting with <strong>${esc(c.vendorName)}</strong>${whenHtml} has been cancelled. Apologies for the change, and thank you for your flexibility.`,
    ) +
    pEl("Issy");
  const text = [
    `Hi ${c.execFirstName},`,
    ``,
    `the meeting with ${c.vendorName}${whenText} has been cancelled. Apologies for the change, and thank you for your flexibility.`,
    ``,
    `Issy`,
  ].join("\n");
  return {
    subject,
    html: lockedCard("Meeting cancelled", inner, `The meeting with ${c.vendorName}${whenText} has been cancelled.`),
    text,
    fromKind: "personal",
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
