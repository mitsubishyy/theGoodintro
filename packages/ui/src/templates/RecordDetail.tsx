"use client";

import { useState, type ReactNode } from "react";
import { Badge } from "../primitives/Badge";
import type { Tone } from "../types";

/**
 * T4 RecordDetail (BLUEPRINT T4 + UI_KIT_DESIGN_LOG "Admin Vendor detail").
 * Header band + LEFT module rail + center active module + RIGHT append-only
 * Activity feed.
 *
 * The detail-page anatomy is the richest of all templates and the one most
 * missing in v1. Identity in the header carries only structured chips (Tier,
 * ID, Renewal due); free-form Tags live in a Tags module on the rail, never the
 * header (locked 2026-06-04 on Admin Vendor detail).
 */

export interface DetailFact {
  label: string;
  value: ReactNode;
}

export interface DetailModule {
  key: string;
  label: string;
  /** Amber attention badge on the rail item. */
  badge?: number;
  content: ReactNode;
}

export interface ActivityItem {
  id: string;
  text: ReactNode;
  actor?: string;
  at: string;
}

export interface RecordDetailProps {
  header: {
    avatar?: ReactNode;
    title: string;
    subtitle?: string;
    facts?: DetailFact[];
    /** Structured chips ONLY (Tier, ID, Renewal due). Free-form tags belong in a Tags module. */
    chips?: { label: string; tone?: Tone }[];
    status?: { label: string; tone?: Tone; dot?: boolean };
    actions?: ReactNode;
  };
  modules: DetailModule[];
  /** Initial active module key; defaults to the first module. */
  initialModuleKey?: string;
  activity: ActivityItem[];
  className?: string;
}

export function RecordDetail({ header, modules, initialModuleKey, activity, className = "" }: RecordDetailProps) {
  const [activeKey, setActiveKey] = useState<string>(initialModuleKey ?? modules[0]?.key ?? "");
  const active = modules.find((m) => m.key === activeKey) ?? modules[0];

  return (
    <div className={className}>
      <header
        className="rounded-2xl border p-5"
        style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}
      >
        <div className="flex items-start gap-5">
          {header.avatar && <div className="shrink-0">{header.avatar}</div>}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-[20px] font-semibold tracking-tight" style={{ color: "var(--portal-ink)" }}>
                  {header.title}
                </h2>
                {header.subtitle && (
                  <p className="mt-0.5 text-[13.5px]" style={{ color: "var(--muted-foreground)" }}>
                    {header.subtitle}
                  </p>
                )}
              </div>
              {header.actions && <div className="shrink-0">{header.actions}</div>}
            </div>
            {(header.status || (header.chips && header.chips.length > 0)) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {header.status && (
                  <Badge tone={header.status.tone ?? "amber"} dot={header.status.dot}>
                    {header.status.label}
                  </Badge>
                )}
                {header.chips?.map((c, i) => (
                  <Badge key={i} tone={c.tone ?? "muted"}>
                    {c.label}
                  </Badge>
                ))}
              </div>
            )}
            {header.facts && header.facts.length > 0 && (
              <dl className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2 text-[12.5px]">
                {header.facts.map((f, i) => (
                  <div key={i} className="min-w-0">
                    <dt className="font-mono uppercase tracking-[0.14em] text-[10.5px]" style={{ color: "var(--muted-foreground)" }}>
                      {f.label}
                    </dt>
                    <dd className="truncate" style={{ color: "var(--portal-ink)" }}>
                      {f.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </header>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Module rail */}
        <nav
          className="lg:col-span-3 rounded-2xl border self-start"
          style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}
        >
          <ul className="p-2">
            {modules.map((m) => {
              const isActive = m.key === active?.key;
              return (
                <li key={m.key}>
                  <button
                    type="button"
                    onClick={() => setActiveKey(m.key)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[13.5px] text-left"
                    style={
                      isActive
                        ? { background: "var(--portal-card-hover)", color: "var(--portal-ink)", fontWeight: 600 }
                        : { color: "var(--muted-foreground)" }
                    }
                  >
                    <span className="truncate">{m.label}</span>
                    {typeof m.badge === "number" && m.badge > 0 && <Badge tone="amber" count={m.badge} />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Active module */}
        <section
          className="lg:col-span-6 rounded-2xl border"
          style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}
        >
          {active?.content}
        </section>

        {/* Activity feed (append-only) */}
        <aside
          className="lg:col-span-3 rounded-2xl border self-start"
          style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}
        >
          <h3 className="px-4 pt-4 text-[11px] font-mono uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
            Activity
          </h3>
          {activity.length === 0 ? (
            <p className="px-4 py-6 text-[13px]" style={{ color: "var(--muted-foreground)" }}>
              No activity yet.
            </p>
          ) : (
            <ul className="p-4 space-y-3">
              {activity.map((a) => (
                <li key={a.id} className="text-[12.5px]" style={{ color: "var(--portal-ink)" }}>
                  <p>{a.text}</p>
                  <p className="mt-0.5 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                    {a.actor ? `${a.actor} · ` : ""}{a.at}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
