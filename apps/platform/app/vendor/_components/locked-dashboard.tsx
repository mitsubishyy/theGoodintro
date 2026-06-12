import {
  Avatar,
  ExecCardGrid,
  MetricsRibbon,
  Widget,
  type ExecCard,
  type RibbonGroup,
} from "@thegoodintro/ui";

/**
 * Vendor Dashboard — ported component-for-component from the locked design
 * (UI_KIT_DESIGN_LOG "Vendor Dashboard" LOCKED 2026-06-05 +
 * design/locked/vendor-dashboard/README.md). Presentational; the page owns
 * data. Module rows, top to bottom:
 *
 *   1. Metrics ribbon (CREDITS · MEETINGS · TO CHARITY VIA YOU · YOUR BAND),
 *      Fraunces numerals, stats inline.
 *   2. Get-started shortcut — NOT rendered: the conditional card only shows
 *      when the checklist has open items, and checklists have no schema yet,
 *      so the condition is always false. Add when checklists land.
 *   3. 8/4 grid LEFT: Upcoming meetings · Executives for you (2×2 card grid).
 *   4. 8/4 grid RIGHT: Your credits · Pending · Your impact.
 *
 * Every $ string is formatted upstream from @thegoodintro/pricing /
 * lib/reporting.ts; nothing is computed here.
 */

export type UpcomingRow = {
  id: string;
  exec: string; // "Name, Title · Company"
  charity: string;
  photoUrl: string | null;
  execName: string;
  when: string; // "12 Jun · 09:30 AEST · 45 min"
  joinUrl: string | null;
};
export type PendingRow = { key: string; who: string; state: string; age: string };
export type GiftRow = { key: string; charity: string; after: string; amount: string };

export function LockedVendorDashboard(props: {
  ribbon: RibbonGroup[];
  upcoming: UpcomingRow[];
  upcomingCount: number;
  execCards: ExecCard[];
  credits: {
    available: number;
    bandLine: string; // "BAND N · <rate> TO CHARITY / MEETING" (rate from pricing)
    progressPercent: number;
    progressNote: string; // "3 more held meetings to reach Band 3"
  };
  pending: PendingRow[];
  pendingCount: number;
  impactEyebrow: string; // "<fy total> to Good this FY · 8 charities · 8 meetings held"
  gifts: GiftRow[];
}) {
  const { ribbon, upcoming, execCards, credits, pending, gifts } = props;
  return (
    <main className="flex-1 min-w-0 px-8 py-7 w-full max-w-[1280px]">
      <MetricsRibbon groups={ribbon} numeralFont="fraunces" layout="inline" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 space-y-5">
          <Widget
            title="Upcoming meetings"
            count={props.upcomingCount}
            link={{ label: "View all", href: "/vendor/meetings?when=upcoming" }}
            state={upcoming.length === 0 ? "empty" : "ready"}
            emptyText="No upcoming meetings yet. Accepted requests appear here once a time is locked in."
          >
            <div>
              {upcoming.map((m, i) => (
                <div
                  key={m.id}
                  className="px-5 h-14 flex items-center gap-3"
                  style={{ borderTop: i === 0 ? "none" : "1px solid var(--portal-line)" }}
                >
                  <Avatar name={m.execName} src={m.photoUrl} size={32} />
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="text-[13.5px] font-medium truncate">{m.exec}</div>
                    <div className="text-[11.5px] truncate" style={{ color: "var(--muted-foreground)" }}>
                      Charity: {m.charity}
                    </div>
                  </div>
                  <div className="shrink-0 text-right leading-tight">
                    <div className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>{m.when}</div>
                    {m.joinUrl && (
                      <a
                        href={m.joinUrl}
                        className="text-[12px] font-medium"
                        style={{ color: "var(--portal-amber-ink)" }}
                      >
                        {/* meeting has no conference-provider column yet, so the
                            locked "Join Zoom/Teams →" label degrades to neutral */}
                        Join meeting →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Widget>

          <Widget
            title="Executives for you"
            link={{ label: "Browse all", href: "/vendor/executives" }}
            state={execCards.length === 0 ? "empty" : "ready"}
            emptyText="No executives available yet."
          >
            <div className="p-5">
              <ExecCardGrid cards={execCards} />
            </div>
          </Widget>
        </div>

        <div className="lg:col-span-4 space-y-5">
          <Widget title="Your credits">
            <div className="px-5 py-5">
              <div
                className="text-[40px] font-semibold leading-none"
                style={{ fontFamily: "var(--font-display), serif", letterSpacing: "-0.01em" }}
              >
                {credits.available}
              </div>
              <div
                className="mt-1.5 text-[10.5px] font-mono uppercase tracking-[0.18em]"
                style={{ color: "var(--muted-foreground)" }}
              >
                credits available
              </div>
              <div className="my-4 border-t" style={{ borderColor: "var(--portal-line)" }} />
              <div
                className="text-[10.5px] font-mono uppercase tracking-[0.16em]"
                style={{ color: "var(--muted-foreground)" }}
              >
                {credits.bandLine}
              </div>
              <div className="mt-2 h-2.5 rounded-full overflow-hidden" style={{ background: "var(--portal-amber-soft)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${credits.progressPercent}%`, background: "var(--portal-amber)" }}
                />
              </div>
              <div className="mt-2 text-[11.5px]" style={{ color: "var(--muted-foreground)" }}>
                {credits.progressNote}
              </div>
              <a
                href="/vendor/billing"
                className="mt-3 inline-block text-[12px] font-medium"
                style={{ color: "var(--portal-amber-ink)" }}
              >
                Buy more credits →
              </a>
            </div>
          </Widget>

          <Widget
            title="Pending"
            count={props.pendingCount}
            link={{ label: "View all", href: "/vendor/requests?status=submitted" }}
            state={pending.length === 0 ? "empty" : "ready"}
            emptyText="Nothing pending."
          >
            <div>
              {pending.map((p, i) => (
                <div
                  key={p.key}
                  className="px-5 h-11 flex items-center justify-between gap-3"
                  style={{ borderTop: i === 0 ? "none" : "1px solid var(--portal-line)" }}
                >
                  <div className="min-w-0 leading-tight">
                    <div className="text-[13px] font-medium truncate">{p.who}</div>
                    <div className="text-[11px] truncate" style={{ color: "var(--muted-foreground)" }}>
                      {p.state}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono shrink-0" style={{ color: "var(--muted-foreground)" }}>
                    {p.age}
                  </span>
                </div>
              ))}
            </div>
          </Widget>

          <Widget
            title="Your impact"
            link={{ label: "View giving", href: "/vendor/giving" }}
            state={gifts.length === 0 ? "empty" : "ready"}
            emptyText="No gifts yet. Your first held meeting funds one."
          >
            <div>
              <div
                className="px-5 pt-3 pb-1 text-[10.5px] font-mono uppercase tracking-[0.14em]"
                style={{ color: "var(--muted-foreground)" }}
              >
                {props.impactEyebrow}
              </div>
              {gifts.map((g, i) => (
                <div
                  key={g.key}
                  className="px-5 h-11 flex items-center gap-3"
                  style={{ borderTop: i === 0 ? "none" : "1px solid var(--portal-line)" }}
                >
                  <span
                    className="size-7 rounded-full grid place-items-center shrink-0"
                    style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}
                  >
                    <HeartIcon />
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="text-[13px] font-medium truncate">{g.charity}</div>
                    <div className="text-[11px] truncate" style={{ color: "var(--muted-foreground)" }}>
                      after {g.after}
                    </div>
                  </div>
                  <span className="text-[13.5px] font-semibold shrink-0">{g.amount}</span>
                </div>
              ))}
            </div>
          </Widget>
        </div>
      </div>
    </main>
  );
}

function HeartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z" />
    </svg>
  );
}
