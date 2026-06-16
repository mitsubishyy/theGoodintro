/**
 * Canonical option lists for the exec Profile's select-backed fields
 * (exec-profile lock, Business context + Calendar). The underlying columns are
 * free-text (no DB enum — 0016/0019 deliberately left the option lists as an
 * open product decision); these are the RESOLVED v1 lists (Issy delegated the
 * call 2026-06-16). Stored value == label for the business-context selects so
 * the data stays human-readable; timezone/window carry a separate display label.
 *
 * These are the single source of truth for the selects AND (when the admin New
 * Executive form is reworked to structured fields) should be shared there too.
 * To change an option list, edit it here.
 *
 * Robustness: the Profile select renders the stored value as the selected option
 * even if it is not in the list (legacy free text is never silently dropped).
 */

/** "When are you actively reviewing vendors?" */
export const TIMELINE_OPTIONS = [
  "Actively reviewing now",
  "Reviewing this quarter",
  "Reviewing this half",
  "Open, no fixed timeline",
  "Not reviewing right now",
] as const;

/** "How often are you open to meetings?" */
export const CADENCE_OPTIONS = [
  "Up to 1 per month",
  "Up to 2 per month",
  "Up to 1 per quarter",
  "On the right request only",
] as const;

/** "Who should be in the room?" — the counterparty seniority the exec expects. */
export const SENIORITY_OPTIONS = [
  "Founder or C-suite only",
  "VP and above",
  "Director and above",
  "Open to all levels",
] as const;

export interface LabeledOption {
  value: string;
  label: string;
}

/** Preferred meeting-window days. */
export const WINDOW_DAY_OPTIONS: LabeledOption[] = [
  { value: "weekdays", label: "Weekdays" },
  { value: "all", label: "Any day" },
];

/** Timezones (Australia-first; the audience is AU executives). */
export const TIMEZONE_OPTIONS: LabeledOption[] = [
  { value: "Australia/Sydney", label: "Sydney (AEST) · UTC+10" },
  { value: "Australia/Melbourne", label: "Melbourne (AEST) · UTC+10" },
  { value: "Australia/Brisbane", label: "Brisbane (AEST) · UTC+10" },
  { value: "Australia/Adelaide", label: "Adelaide (ACST) · UTC+9:30" },
  { value: "Australia/Perth", label: "Perth (AWST) · UTC+8" },
  { value: "Australia/Hobart", label: "Hobart (AEST) · UTC+10" },
  { value: "Australia/Darwin", label: "Darwin (ACST) · UTC+9:30" },
  { value: "Pacific/Auckland", label: "Auckland (NZST) · UTC+12" },
];

export function timezoneLabel(tz: string | null): string {
  if (!tz) return "Not on file";
  return TIMEZONE_OPTIONS.find((o) => o.value === tz)?.label ?? tz;
}

export function windowDaysLabel(days: string | null): string {
  if (!days) return "";
  return WINDOW_DAY_OPTIONS.find((o) => o.value === days)?.label ?? days;
}
