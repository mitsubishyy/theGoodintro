/* Admin dashboard widgets — ported component-for-component from the committed
   mockup (app/admin/page.tsx). Presentational; all data arrives via props so
   the dashboard page can feed live staging data. No widget is ever dropped;
   each has an empty state. */
import { Icon } from "./icons";

export type RibbonMetrics = {
  meetingsScheduled: number;
  meetingsAhead: number;
  meetingsDone: number;
  vendors: number;
  execs: number;
  toCharity: string;
  revenueMtd: string;
  revenueYtd: string;
};

export type Task = {
  type: string;
  who: string;
  age: string;
  stale: boolean;
  actions: string[];
};

export type PendingRequest = { vendor: string; exec: string; age: string; stale: boolean };
export type Comm = { from: string; snippet: string; age: string; unread: boolean };

/* ── Metrics ribbon (dark ink) ─────────────────────────────────── */

export function MetricsRibbon({ m }: { m: RibbonMetrics }) {
  return (
    <section className="rounded-2xl px-6 py-4 mb-5 grid grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-2" style={{ background: "var(--portal-ribbon)", color: "var(--primary-foreground)" }}>
      <RibbonGroup label="Meetings">
        <RibbonStat value={String(m.meetingsScheduled)} unit="scheduled" />
        <RibbonStat value={String(m.meetingsAhead)} unit="ahead" />
        <RibbonStat value={String(m.meetingsDone)} unit="done" />
      </RibbonGroup>
      <RibbonGroup label="Network" divider>
        <RibbonStat value={String(m.vendors)} unit="vendors" />
        <RibbonStat value={String(m.execs)} unit="execs" />
      </RibbonGroup>
      <RibbonGroup label="To charity" divider>
        <RibbonStat value={m.toCharity} unit="this year" big />
      </RibbonGroup>
      <RibbonGroup label="Revenue" divider>
        <RibbonStat value={m.revenueMtd} unit="MTD" />
        <RibbonStat value={m.revenueYtd} unit="YTD" />
      </RibbonGroup>
    </section>
  );
}

function RibbonGroup({ label, children, divider }: { label: string; children: React.ReactNode; divider?: boolean }) {
  return (
    <div className={divider ? "lg:pl-5 lg:border-l" : ""} style={divider ? { borderColor: "rgba(255,255,255,0.16)" } : undefined}>
      <div className="text-[10px] uppercase tracking-[0.18em] mb-2 opacity-70">{label}</div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 items-baseline">{children}</div>
    </div>
  );
}

function RibbonStat({ value, unit, big }: { value: string; unit: string; big?: boolean }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={big ? "text-[22px] font-semibold leading-none" : "text-[20px] font-semibold leading-none"}>{value}</span>
      <span className="text-[11px] opacity-70">{unit}</span>
    </div>
  );
}

/* ── Widget shell ──────────────────────────────────────────────── */

export function Widget({ title, count, link, href, right, children }: { title: string; count?: string; link?: string; href?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border" style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)", boxShadow: "0 1px 2px rgba(20,40,30,0.04)" }}>
      <header className="px-5 py-3.5 flex items-center justify-between border-b" style={{ borderColor: "var(--portal-line)" }}>
        <div className="flex items-center gap-2">
          <h2 className="text-[14.5px] font-semibold tracking-tight">{title}</h2>
          {count && <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}>{count}</span>}
        </div>
        <div className="flex items-center gap-3">
          {right}
          {link && (
            href
              ? <a href={href} className="text-[12px] font-medium" style={{ color: "var(--portal-amber-ink)" }}>{link} →</a>
              : <span className="text-[12px] font-medium" style={{ color: "var(--portal-amber-ink)" }}>{link} →</span>
          )}
        </div>
      </header>
      {children}
    </section>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return <div className="px-5 py-6 text-[13px]" style={{ color: "var(--cream-9)" }}>{children}</div>;
}

/* ── Booked-meetings calendar ──────────────────────────────────── */

export function CalendarWidget({ bookedDays, today, monthDate }: { bookedDays: number[]; today: number | null; monthDate: Date }) {
  const booked = new Set(bookedDays);
  const year = monthDate.getUTCFullYear();
  const month = monthDate.getUTCMonth();
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  return (
    <Widget title="Booked meetings" link="View meetings" href="/admin/meetings" right={<Toggle left="Calendar" right="List" />}>
      <div className="px-5 py-4">
        <div className="grid grid-cols-7 gap-1 text-center">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="text-[10px] uppercase tracking-[0.12em] pb-1" style={{ color: "var(--cream-9)" }}>{d}</div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={i} />;
            const isBooked = booked.has(day);
            const isToday = day === today;
            return (
              <div
                key={i}
                className="h-12 rounded-lg flex flex-col items-center justify-center text-[12.5px]"
                style={isToday ? { background: "var(--portal-ink)", color: "#fff", fontWeight: 600 } : { color: "var(--foreground)" }}
              >
                {day}
                {isBooked && <span className="mt-0.5 size-1.5 rounded-full" style={{ background: "var(--portal-amber)" }} />}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px]" style={{ color: "var(--cream-9)" }}>
          <span className="size-1.5 rounded-full" style={{ background: "var(--portal-amber)" }} /> days with booked meetings
        </div>
      </div>
    </Widget>
  );
}

/* ── Needs action ──────────────────────────────────────────────── */

export function TasksWidget({ tasks }: { tasks: Task[] }) {
  return (
    <Widget title="Needs action" count={String(tasks.length)} link="View all" href="/admin/meetings">
      {tasks.length === 0 ? (
        <EmptyRow>Nothing needs action right now.</EmptyRow>
      ) : (
        <table className="w-full text-left">
          <tbody>
            {tasks.map((t, i) => (
              <tr key={`${t.who}-${i}`} className="text-[13.5px]" style={{ borderTop: i === 0 ? "none" : "1px solid var(--portal-line)" }}>
                <td className="pl-5 pr-3 py-3.5"><TypeTag type={t.type} /></td>
                <td className="px-3 py-3.5">{t.who}</td>
                <td className="px-3 py-3.5">
                  <span className="inline-flex items-center gap-1.5 text-[12.5px]" style={{ color: t.stale ? "var(--portal-amber-ink)" : "var(--cream-9)", fontWeight: t.stale ? 600 : 400 }}>
                    {t.age}{t.stale && <span title="overdue">⚠</span>}
                  </span>
                </td>
                <td className="pr-5 pl-3 py-3.5">
                  <div className="flex justify-end gap-2">
                    {t.actions.map((a, j) => <ActionButton key={a} label={a} primary={j === 0} />)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Widget>
  );
}

/* ── Pending requests quick view ───────────────────────────────── */

export function RequestsWidget({ requests }: { requests: PendingRequest[] }) {
  return (
    <Widget title="Pending requests" count={String(requests.length)} link="View all" href="/admin/meetings">
      {requests.length === 0 ? (
        <EmptyRow>No pending requests.</EmptyRow>
      ) : (
        <div>
          {requests.map((r, i) => (
            <div key={`${r.vendor}-${i}`} className="px-5 py-3.5 flex items-center justify-between gap-3" style={{ borderTop: i === 0 ? "none" : "1px solid var(--portal-line)" }}>
              <div className="min-w-0">
                <div className="text-[13.5px] font-medium truncate">{r.vendor} <span className="font-normal" style={{ color: "var(--cream-9)" }}>→ {r.exec}</span></div>
                <div className="text-[11px] mt-0.5" style={{ color: "var(--cream-9)" }}>waiting on exec to action</div>
              </div>
              <span className="text-[11.5px] shrink-0" style={{ color: r.stale ? "var(--portal-amber-ink)" : "var(--cream-9)", fontWeight: r.stale ? 600 : 400 }}>{r.age}{r.stale ? " ⚠" : ""}</span>
            </div>
          ))}
        </div>
      )}
    </Widget>
  );
}

/* ── Unresponded comms quick view ──────────────────────────────── */

export function CommsWidget({ comms }: { comms: Comm[] }) {
  return (
    <Widget title="Unresponded comms" count={String(comms.length)} link="Open comms">
      {comms.length === 0 ? (
        <EmptyRow>No unresponded messages. (Vendor messaging is a later pillar.)</EmptyRow>
      ) : (
        <div>
          {comms.map((c, i) => (
            <div key={`${c.from}-${i}`} className="px-5 py-3.5 flex items-start gap-3" style={{ borderTop: i === 0 ? "none" : "1px solid var(--portal-line)" }}>
              <span className="mt-1.5 size-2 rounded-full shrink-0" style={{ background: c.unread ? "var(--portal-amber)" : "var(--cream-6)" }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[13.5px] font-medium">{c.from}</span>
                  <span className="text-[11px] shrink-0" style={{ color: "var(--cream-9)" }}>{c.age}</span>
                </div>
                <div className="text-[12.5px] truncate" style={{ color: "var(--cream-9)" }}>{c.snippet}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Widget>
  );
}

/* ── Small parts ───────────────────────────────────────────────── */

function TypeTag({ type }: { type: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    "Confirm time": { bg: "var(--portal-amber-soft)", fg: "var(--portal-amber-ink)" },
    "Pending exec": { bg: "var(--portal-amber-soft)", fg: "var(--portal-amber-ink)" },
    "Release gift": { bg: "var(--portal-amber-soft)", fg: "var(--portal-amber-ink)" },
    "New onboard": { bg: "var(--portal-amber-soft)", fg: "var(--portal-amber-ink)" },
    Rebook: { bg: "var(--cream-3)", fg: "var(--cream-10)" },
    Cancelled: { bg: "var(--cream-3)", fg: "var(--cream-9)" },
  };
  const c = map[type] ?? { bg: "var(--cream-3)", fg: "var(--cream-9)" };
  return <span className="text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: c.bg, color: c.fg }}>{type}</span>;
}

function ActionButton({ label, primary }: { label: string; primary?: boolean }) {
  return (
    <span className="text-[12px] font-medium px-3 py-1.5 rounded-lg whitespace-nowrap cursor-default" style={primary ? { background: "var(--portal-ink)", color: "#fff" } : { background: "transparent", color: "var(--foreground)", border: "1px solid var(--portal-line)" }}>{label}</span>
  );
}

function Toggle({ left, right }: { left: string; right: string }) {
  return (
    <span className="inline-flex rounded-lg overflow-hidden text-[12px] font-medium" style={{ border: "1px solid var(--portal-line)" }}>
      <span className="px-3 py-1.5" style={{ background: "var(--portal-ink)", color: "#fff" }}>{left}</span>
      <span className="px-3 py-1.5" style={{ color: "var(--cream-9)" }}>{right}</span>
    </span>
  );
}
