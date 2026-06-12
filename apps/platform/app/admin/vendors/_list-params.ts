import type { VendorStatusEnum } from "./_status";

/**
 * URL param contract for the Admin Vendors list filter popover + sort dropdown
 * (T3 chunk B; "URL reflects filters" is part of the 2026-06-02 lock). Shared
 * by the server page (parse + apply) and the client controls (write), so the
 * two can never disagree about a param name or value.
 */

export const SORT_OPTIONS = [
  { key: "joined_desc", label: "Date joined · Newest first" },
  { key: "joined_asc", label: "Date joined · Oldest first" },
  { key: "name_asc", label: "Company · A to Z" },
  { key: "name_desc", label: "Company · Z to A" },
  { key: "renews_asc", label: "Renews · Soonest first" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["key"];
export const DEFAULT_SORT: SortKey = "joined_desc";

export const VENDOR_STATUS_VALUES: VendorStatusEnum[] = [
  "signed_up",
  "call_booked",
  "approved",
  "paid",
  "active",
  "dormant",
  "churned",
];

export type CreditsFilter = "zero" | "low" | "3plus";
export type YesNoFilter = "yes" | "no";
export type MeetingRecencyFilter = "30" | "90" | "none";
export type RenewsWithinFilter = "30" | "60" | "90";
export type JoinedWithinFilter = "7" | "30" | "90";

export interface VendorListFilters {
  /** Empty array = all statuses. */
  status: VendorStatusEnum[];
  /** Empty array = all tiers. */
  tier: number[];
  credits: CreditsFilter | null;
  invoice: YesNoFilter | null;
  meeting: MeetingRecencyFilter | null;
  renews: RenewsWithinFilter | null;
  joined: JoinedWithinFilter | null;
}

export const EMPTY_FILTERS: VendorListFilters = {
  status: [],
  tier: [],
  credits: null,
  invoice: null,
  meeting: null,
  renews: null,
  joined: null,
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(sp: SearchParams, key: string): string | undefined {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

function oneOf<T extends string>(value: string | undefined, allowed: readonly T[]): T | null {
  return allowed.includes(value as T) ? (value as T) : null;
}

export function parseFilters(sp: SearchParams): VendorListFilters {
  const status = (first(sp, "status") ?? "")
    .split(",")
    .filter((s): s is VendorStatusEnum =>
      (VENDOR_STATUS_VALUES as string[]).includes(s),
    );
  const tier = (first(sp, "tier") ?? "")
    .split(",")
    .map((t) => parseInt(t, 10))
    .filter((t) => t >= 1 && t <= 4);
  return {
    status,
    tier,
    credits: oneOf(first(sp, "credits"), ["zero", "low", "3plus"] as const),
    invoice: oneOf(first(sp, "invoice"), ["yes", "no"] as const),
    meeting: oneOf(first(sp, "meeting"), ["30", "90", "none"] as const),
    renews: oneOf(first(sp, "renews"), ["30", "60", "90"] as const),
    joined: oneOf(first(sp, "joined"), ["7", "30", "90"] as const),
  };
}

/** How many filter sections are active — drives the amber pill on the Filter button. */
export function activeFilterCount(f: VendorListFilters): number {
  return (
    (f.status.length > 0 ? 1 : 0) +
    (f.tier.length > 0 ? 1 : 0) +
    (f.credits ? 1 : 0) +
    (f.invoice ? 1 : 0) +
    (f.meeting ? 1 : 0) +
    (f.renews ? 1 : 0) +
    (f.joined ? 1 : 0)
  );
}

export function parseSort(sp: SearchParams): SortKey {
  const v = first(sp, "sort");
  return (SORT_OPTIONS.some((o) => o.key === v) ? v : DEFAULT_SORT) as SortKey;
}

export const PER_PAGE_OPTIONS = [10, 25, 50, 100];
export const DEFAULT_PER_PAGE = 25;

export function parsePerPage(sp: SearchParams): number {
  const v = parseInt(first(sp, "per") ?? "", 10);
  return PER_PAGE_OPTIONS.includes(v) ? v : DEFAULT_PER_PAGE;
}
