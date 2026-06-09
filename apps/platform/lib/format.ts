/** AUD cents -> "$1,500" (no decimals; whole-dollar amounts in v1). */
export function formatAud(cents: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/** AUD cents -> "$1.28M" / "$186.2K" / "$8,400" — compact form for ribbon
 *  headline numbers (Admin Dashboard metric ribbon 2026-06-09 lock). */
export function formatAudCompact(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2)}M`;
  if (dollars >= 10_000) return `$${(dollars / 1000).toFixed(1)}K`;
  return formatAud(cents);
}

/** Relative age like "4d" / "3h" / "20m", plus the whole-day count. */
export function ageShort(iso: string): { label: string; days: number } {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return { label: `${days}d`, days };
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 1) return { label: `${hours}h`, days };
  const mins = Math.max(1, Math.floor(ms / 60_000));
  return { label: `${mins}m`, days };
}

/** UTC timestamp -> short Sydney-local date. */
export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Australia/Sydney",
  }).format(new Date(iso));
}
