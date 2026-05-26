/**
 * Content guard for the request questions: strip emails, URLs, bare domains,
 * and phone-like digit runs so a vendor cannot smuggle direct contact details
 * past the qualification gate (VENDOR_PORTAL_BRIEF / MVP_SCOPE). Server-side.
 */
export function stripContactInfo(input: string): string {
  if (!input) return "";
  let s = input;
  s = s.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[removed]"); // emails
  s = s.replace(/\b(?:https?:\/\/|www\.)\S+/gi, "[removed]"); // URLs
  s = s.replace(
    /\b[a-z0-9-]+\.(?:com|net|org|io|co|ai|app|dev|gov|edu)(?:\.[a-z]{2})?(?:\/\S*)?\b/gi,
    "[removed]",
  ); // bare domains (incl. .com.au)
  s = s.replace(/\+?\d[\d\s().-]{6,}\d/g, "[removed]"); // phone-like digit runs
  return s.replace(/\s+/g, " ").trim();
}
