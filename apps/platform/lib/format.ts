/** AUD cents -> "$1,500" (no decimals; whole-dollar amounts in v1). */
export function formatAud(cents: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
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
