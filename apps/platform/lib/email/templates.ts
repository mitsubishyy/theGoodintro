/**
 * Email composition per NOTIFICATION_TEMPLATES.md. Wording comes from that doc
 * verbatim (FACTS.md brand spelling: TheGoodIntro). No em or en dashes in copy.
 * Exec-facing mail is personal (from Issy); vendor/admin transactional mail is
 * from the brand. Every dynamic value is HTML-escaped.
 */

export type ComposedEmail = {
  subject: string;
  html: string;
  text: string;
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

function sectionLabel(label: string): string {
  return `<div style="margin:24px 0 6px;font-family:${SANS};font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${E.muted}">${esc(label)}</div>`;
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

  const button = (href: string, label: string, solid: boolean) =>
    `<a href="${esc(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:11px 22px;border-radius:9999px;font-family:${SANS};font-size:13px;font-weight:600;text-decoration:none;${
      solid
        ? `background:${E.ink};color:${E.white};border:1px solid ${E.ink}`
        : `background:transparent;color:${E.ink};border:1px solid #cfc8b8`
    }">${esc(label)}</a>`;

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:${E.cream}">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${esc(preview)}</div>
<div style="max-width:560px;margin:0 auto;padding:32px 24px;font-family:${SANS};font-size:15px;line-height:1.6;color:${E.ink}">
<div style="background:#ffffff;border:1px solid ${E.border};border-radius:16px;padding:28px 26px">

<p style="margin:0 0 12px">Hi ${esc(c.execFirstName)},</p>
<p style="margin:0">${intro} They have been vetted and reviewed. Here is what you need to know.</p>

<!-- Vendor block -->
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-top:22px;background:${E.cream};border:1px solid ${E.border};border-radius:14px">
<tr>
<td style="padding:18px 0 18px 18px;vertical-align:top;width:56px">
  <div style="width:56px;height:56px;border-radius:50%;background:${E.mint};border:1px solid ${E.border};text-align:center;line-height:56px;font-family:${SANS};font-size:19px;font-weight:600;color:${E.emerald}">${esc(initials(c.requesterName))}</div>
</td>
<td style="padding:18px;vertical-align:top">
  <div style="font-family:${SANS};font-size:15px;font-weight:600;color:${E.ink}">${esc(c.requesterName)}
    <span style="display:inline-block;margin-left:6px;padding:2px 8px;border-radius:9999px;background:${E.mint};color:${E.emerald};font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;vertical-align:middle">Verified</span>
  </div>
  <div style="margin-top:2px;font-size:12px;color:${E.muted}">${roleLine}</div>
  <div style="margin-top:8px;font-size:11px;color:${E.muted}">${metaHtml}</div>
</td>
</tr>
</table>

${sectionLabel("What they want to talk about")}
<p style="margin:0;font-size:14px">${esc(c.q1)}</p>

${sectionLabel("Why it is relevant to you")}
<p style="margin:0;font-size:14px">${esc(c.q2)}</p>

<!-- Gift callout -->
<div style="margin-top:24px;background:${E.giftBg};border:1px solid ${E.emerald};border-radius:12px;padding:14px 16px">
  <div style="font-size:13px;font-weight:600;color:${E.ink}">If you accept, <span style="font-family:${SERIF};font-style:italic;font-size:16px;color:${E.emerald}">${esc(c.indicativeAmount)}</span> directs to <strong>${esc(c.charityName)}</strong></div>
  <div style="margin-top:4px;font-size:12px;color:${E.muted}">The charity you chose. The full gift is sent after the meeting takes place.</div>
</div>

<!-- CTAs -->
<div style="margin-top:24px">
  ${button(accept, "Accept", true)}
  ${button(decline, "Decline", false)}
  ${button(toEa, eaLabel, false)}
</div>
<p style="margin:10px 0 0;font-size:11px;color:${E.muted}">These buttons open a short confirm page. Nothing is accepted or declined until you confirm there.</p>

<p style="margin:24px 0 0">No pressure either way, and no obligation to take the next one.</p>
<p style="margin:12px 0 0">Issy</p>

<div style="margin-top:28px;padding-top:16px;border-top:1px solid ${E.border};font-size:11px;color:${E.muted}">TheGoodIntro · invite-only · Australia</div>
</div>
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
    `No pressure either way, and no obligation to take the next one.`,
    ``,
    `Issy`,
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
