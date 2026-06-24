/**
 * Validate a post-auth / post-action redirect target taken from a request (the
 * `next` query param or form field). Returns the value only if it is a safe
 * SAME-ORIGIN path; otherwise "/".
 *
 * This blocks open redirects. A naive `startsWith("/")` check is NOT enough: it
 * accepts a protocol-relative URL ("//evil.com") and backslash variants
 * ("/\\evil.com") that browsers resolve to a different origin. Apply this BOTH
 * where the value is first read (the page that fills the hidden field) AND again
 * in the action that performs the redirect, since the action is independently
 * POST-able and must not trust the page-supplied value.
 */
export function safeNextPath(next: string | null | undefined): string {
  if (typeof next !== "string" || next.length === 0) return "/";
  // Must be an absolute in-app path…
  if (next[0] !== "/") return "/";
  // …but not protocol-relative ("//host") or backslash-smuggled ("/\\host"),
  // which resolve cross-origin.
  if (next[1] === "/" || next[1] === "\\") return "/";
  // Reject any control char, space (0x20), or DEL (0x7f) that could smuggle a
  // scheme or split a header. Legitimate in-app paths are URL-encoded, so they
  // contain none of these.
  for (let i = 0; i < next.length; i++) {
    const c = next.charCodeAt(i);
    if (c <= 0x20 || c === 0x7f) return "/";
  }
  return next;
}
