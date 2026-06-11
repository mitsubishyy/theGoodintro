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

/** B1 · Request submitted, the first touch (to the executive, from Issy). */
export function execRequestEmail(c: {
  execFirstName: string;
  vendorName: string;
  q1: string;
  q2: string;
  indicativeAmount: string; // already formatted, e.g. "$900"
  charityName: string;
  confirmUrl: string; // the signed /e/<token> link
}): ComposedEmail {
  const subject = "An introduction worth your time";
  const accept = `${c.confirmUrl}?intent=accept`;
  const decline = `${c.confirmUrl}?intent=decline`;
  const toEa = `${c.confirmUrl}?intent=send_to_ea`;

  const text = [
    `Hi ${c.execFirstName},`,
    ``,
    `${c.vendorName} asked to meet you, and the reason is a strong one.`,
    ``,
    `What they would like to talk about: ${c.q1}`,
    ``,
    `Why they think it is relevant to you: ${c.q2}`,
    ``,
    `It is one 45-minute conversation, on your terms. If you take it, ${c.vendorName} sends ${c.indicativeAmount} to ${c.charityName}, the charity you chose.`,
    ``,
    `Accept: ${accept}`,
    `Decline: ${decline}`,
    `Send to my EA: ${toEa}`,
    ``,
    `No pressure either way, and no obligation to take the next one.`,
    ``,
    `Issy`,
  ].join("\n");

  const html = shell(`
<p>Hi ${esc(c.execFirstName)},</p>
<p><strong>${esc(c.vendorName)}</strong> asked to meet you, and the reason is a strong one.</p>
<p style="margin-bottom:2px"><strong>What they would like to talk about</strong></p>
<p style="margin-top:0">${esc(c.q1)}</p>
<p style="margin-bottom:2px"><strong>Why they think it is relevant to you</strong></p>
<p style="margin-top:0">${esc(c.q2)}</p>
<p style="background:#f3e8cf;border-radius:8px;padding:12px 16px">It is one 45-minute conversation, on your terms. If you take it, ${esc(c.vendorName)} sends <strong>${esc(c.indicativeAmount)}</strong> to ${esc(c.charityName)}, the charity you chose.</p>
<p style="margin:24px 0">
  <a href="${esc(accept)}" style="${BUTTON_SOLID}">Accept</a>&nbsp;&nbsp;
  <a href="${esc(decline)}" style="${BUTTON_OUTLINE}">Decline</a>&nbsp;&nbsp;
  <a href="${esc(toEa)}" style="${BUTTON_OUTLINE}">Send to my EA</a>
</p>
<p>No pressure either way, and no obligation to take the next one.</p>
<p>Issy</p>`);

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
