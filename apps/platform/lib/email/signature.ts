/**
 * Issy's email signature (provided 2026-06-11), appended to personal
 * (from-Issy) emails. TEXT ONLY for v1: no images per the deliverability
 * rule, so the brand lockup renders as the styled wordmark text (Georgia for
 * Fraunces, emerald "Good"), not the logo png.
 *
 * The phone number is config, not code: set EMAIL_SIGNATURE_PHONE in the
 * environment (.env.local locally; preserved by scripts/test-db.sh). Delete
 * the variable to drop the number from the signature with no code change.
 */

const INK = "#1c1b15";
const EMERALD = "#06623f";
const SERIF = "Georgia,'Times New Roman',serif";

export function getSignature(): { html: string; text: string } {
  const phone = process.env.EMAIL_SIGNATURE_PHONE?.trim();
  const nameLineHtml = [`<strong>Isobel Hardwick</strong>`, `Founder`, ...(phone ? [phone] : [])].join(
    " | ",
  );
  const nameLineText = [`Isobel Hardwick`, `Founder`, ...(phone ? [phone] : [])].join(" | ");

  const wordmarkHtml =
    `<span style="font-family:${SERIF};font-weight:700;font-size:17px;letter-spacing:-0.01em;color:${INK}">` +
    `The<span style="color:${EMERALD}">Good</span>Intro</span>`;

  return {
    html: `${nameLineHtml}<br><br>\n${wordmarkHtml}`,
    text: `${nameLineText}\nTheGoodIntro`,
  };
}
