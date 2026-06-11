import { BRAND_LOGO_PNG_BASE64 } from "./brand-logo";
import type { EmailAttachment } from "./transport";

/**
 * Issy's real email signature (provided 2026-06-11), appended to personal
 * (from-Issy) emails: bold name | Founder | mobile, then the TheGoodIntro
 * lockup with a trailing vertical bar. The lockup ships as an INLINE CID
 * attachment (cid:brand-logo), never a remote image, so there is no tracking
 * pixel smell and nothing for image-blocking clients to fetch.
 */

export const SIGNATURE_LOGO_CID = "brand-logo";

export const SIGNATURE_ATTACHMENTS: EmailAttachment[] = [
  {
    filename: "thegoodintro-logo.png",
    contentBase64: BRAND_LOGO_PNG_BASE64,
    contentType: "image/png",
    contentId: SIGNATURE_LOGO_CID,
  },
];

export const SIGNATURE_HTML = [
  `<strong>Isobel Hardwick</strong> | Founder | +61 414 442 687<br><br>`,
  `<table role="presentation" cellpadding="0" cellspacing="0"><tr>`,
  `<td style="vertical-align:middle;padding-right:14px"><img src="cid:${SIGNATURE_LOGO_CID}" width="200" height="45" alt="TheGoodIntro" style="display:block;border:0"></td>`,
  `<td style="vertical-align:middle;border-left:1px solid #1c1b15;font-size:1px;line-height:45px">&nbsp;</td>`,
  `</tr></table>`,
].join("\n");

export const SIGNATURE_TEXT = ["Isobel Hardwick | Founder | +61 414 442 687", "TheGoodIntro"].join(
  "\n",
);
