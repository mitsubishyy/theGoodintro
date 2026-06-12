"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Icon, Popover } from "@thegoodintro/ui";
import { vendorStatusPill } from "./_status";
import {
  activeFilterCount,
  DEFAULT_SORT,
  SORT_OPTIONS,
  VENDOR_STATUS_VALUES,
  type SortKey,
  type VendorListFilters,
} from "./_list-params";

/**
 * Filter popover + Sort dropdown for the Admin Vendors list (T3 chunk B,
 * locked 2026-06-02). URL reflects filters: every change writes searchParams
 * and resets ?page. Sections whose data sources are not captured yet
 * (INDUSTRY, COMPANY SIZE, REGION, saved views, custom joined range) render
 * in place as parked placeholders per rule 2b — never dropped.
 */

interface VendorListControlsProps {
  filters: VendorListFilters;
  sort: SortKey;
  statusCounts: Record<string, number>;
  tierCounts: Record<number, number>;
}

export function VendorListControls({ filters, sort, statusCounts, tierCounts }: VendorListControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === "") params.delete(k);
        else params.set(k, v);
      }
      params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "/admin/vendors", { scroll: false });
    },
    [router, searchParams],
  );

  const active = activeFilterCount(filters);

  const toggleList = (current: string[], value: string): string | null => {
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    return next.length ? next.join(",") : null;
  };

  return (
    <>
      <Popover
        align="end"
        width={320}
        trigger={({ ref, open, toggle }) => (
          <Button ref={ref} variant="ghost" size="md" onClick={toggle} aria-expanded={open}>
            Filters
            {active > 0 && (
              <span
                className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[11px] font-semibold"
                style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}
              >
                {active}
              </span>
            )}
          </Button>
        )}
      >
        {({ close }) => (
          <div className="p-4 flex flex-col gap-4">
            <Section label="Saved views">
              <p className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
                No saved views yet.
              </p>
            </Section>

            <Section label="Status">
              <div className="flex flex-col gap-1.5">
                {VENDOR_STATUS_VALUES.map((s) => (
                  <label key={s} className="flex items-center gap-2 text-[13px] cursor-pointer" style={{ color: "var(--portal-ink)" }}>
                    <input
                      type="checkbox"
                      checked={filters.status.includes(s)}
                      onChange={() => setParams({ status: toggleList(filters.status, s) })}
                    />
                    <span className="flex-1">{vendorStatusPill(s).label}</span>
                    <span className="font-mono text-[11.5px]" style={{ color: "var(--muted-foreground)" }}>
                      {statusCounts[s] ?? 0}
                    </span>
                  </label>
                ))}
              </div>
            </Section>

            <Section label="Tier">
              <div className="flex flex-wrap gap-1.5">
                {[1, 2, 3, 4].map((t) => (
                  <Chip
                    key={t}
                    selected={filters.tier.includes(t)}
                    onClick={() => setParams({ tier: toggleList(filters.tier.map(String), String(t)) })}
                  >
                    Tier {t} · {tierCounts[t] ?? 0}
                  </Chip>
                ))}
              </div>
            </Section>

            <RadioSection
              label="Credit balance"
              value={filters.credits}
              onChange={(v) => setParams({ credits: v })}
              options={[
                { value: null, label: "All" },
                { value: "zero", label: "Zero (locked out)" },
                { value: "low", label: "1-2 remaining" },
                { value: "3plus", label: "3+" },
              ]}
            />

            <ParkedSection label="Industry" note="Needs vendor industry on file; not captured yet." />
            <ParkedSection label="Company size" note="Needs company size on file; not captured yet." />
            <ParkedSection label="Region" note="Needs vendor region on file; not captured yet." />

            <RadioSection
              label="Has outstanding invoice"
              value={filters.invoice}
              onChange={(v) => setParams({ invoice: v })}
              options={[
                { value: null, label: "All" },
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
            />

            <RadioSection
              label="Has recent meeting"
              value={filters.meeting}
              onChange={(v) => setParams({ meeting: v })}
              options={[
                { value: null, label: "All" },
                { value: "30", label: "Held in the last 30 days" },
                { value: "90", label: "Held in the last 90 days" },
                { value: "none", label: "None in the last 90 days" },
              ]}
            />

            <RadioSection
              label="Renews within"
              value={filters.renews}
              onChange={(v) => setParams({ renews: v })}
              options={[
                { value: null, label: "All" },
                { value: "30", label: "30 days" },
                { value: "60", label: "60 days" },
                { value: "90", label: "90 days" },
              ]}
            />

            <RadioSection
              label="Joined"
              value={filters.joined}
              onChange={(v) => setParams({ joined: v })}
              options={[
                { value: null, label: "All" },
                { value: "7", label: "Last 7 days" },
                { value: "30", label: "Last 30 days" },
                { value: "90", label: "Last 90 days" },
              ]}
              footnote="Custom date range lands with the kit's date field."
            />

            <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: "var(--portal-line)" }}>
              <Button
                variant="link"
                size="sm"
                onClick={() =>
                  setParams({ status: null, tier: null, credits: null, invoice: null, meeting: null, renews: null, joined: null })
                }
              >
                Clear all
              </Button>
              <Button variant="primary" size="sm" onClick={close}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Popover>

      <Popover
        align="end"
        width={240}
        trigger={({ ref, open, toggle }) => (
          <Button ref={ref} variant="ghost" size="md" onClick={toggle} aria-expanded={open} rightIcon={<Icon name="chevron-down" size={14} />}>
            Sort · {SORT_OPTIONS.find((o) => o.key === sort)?.label ?? ""}
          </Button>
        )}
      >
        {({ close }) => (
          <div role="menu" className="py-1.5">
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.key}
                role="menuitemradio"
                aria-checked={o.key === sort}
                type="button"
                className="w-full text-left px-3.5 py-2 flex items-center gap-2 text-[13px] hover:bg-[var(--portal-card-hover)]"
                style={{ color: "var(--portal-ink)" }}
                onClick={() => {
                  close();
                  setParams({ sort: o.key === DEFAULT_SORT ? null : o.key });
                }}
              >
                <span className="flex-1">{o.label}</span>
                {o.key === sort && <Icon name="check" size={14} style={{ color: "var(--portal-amber-ink)" }} />}
              </button>
            ))}
          </div>
        )}
      </Popover>
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10.5px] font-mono uppercase tracking-[0.16em] mb-2" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function ParkedSection({ label, note }: { label: string; note: string }) {
  return (
    <Section label={label}>
      <p className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
        {note}
      </p>
    </Section>
  );
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-7 px-2.5 rounded-full border text-[12px] font-medium transition-colors"
      style={{
        background: selected ? "var(--portal-amber-soft)" : "transparent",
        borderColor: selected ? "var(--portal-amber)" : "var(--portal-line)",
        color: selected ? "var(--portal-amber-ink)" : "var(--portal-ink)",
      }}
    >
      {children}
    </button>
  );
}

function RadioSection<T extends string>({
  label,
  value,
  onChange,
  options,
  footnote,
}: {
  label: string;
  value: T | null;
  onChange: (v: T | null) => void;
  options: { value: T | null; label: string }[];
  footnote?: string;
}) {
  return (
    <Section label={label}>
      <div className="flex flex-col gap-1.5">
        {options.map((o) => (
          <label key={o.label} className="flex items-center gap-2 text-[13px] cursor-pointer" style={{ color: "var(--portal-ink)" }}>
            <input type="radio" name={label} checked={value === o.value} onChange={() => onChange(o.value)} />
            {o.label}
          </label>
        ))}
      </div>
      {footnote && (
        <p className="mt-1.5 text-[11.5px]" style={{ color: "var(--muted-foreground)" }}>
          {footnote}
        </p>
      )}
    </Section>
  );
}
