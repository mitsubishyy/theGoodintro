// Mirror of private.is_generic_email_domain() (migration 0006) for friendly
// client-side validation. The RPC remains the authoritative check.
const GENERIC = new Set([
  "gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "live.com",
  "yahoo.com", "yahoo.com.au", "icloud.com", "me.com", "mac.com", "aol.com",
  "proton.me", "protonmail.com", "gmx.com", "mail.com", "yandex.com", "msn.com",
  "ymail.com", "pm.me", "zoho.com", "fastmail.com",
]);

export function emailDomain(email: string): string {
  return email.toLowerCase().trim().split("@")[1] ?? "";
}

export function isWorkEmail(email: string): boolean {
  const d = emailDomain(email);
  return d.length > 0 && d.includes(".") && !GENERIC.has(d);
}
