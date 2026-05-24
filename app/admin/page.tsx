import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin portal · theGoodintro (draft)",
  robots: { index: false, follow: false },
};

/* ──────────────────────────────────────────────────────────────────
   Admin portal — rough visual draft. Static, non-interactive.

   Colour balance: emerald leads on the sidebar, top bar and metrics
   ribbon; the dashboard canvas is WHITE with white widget cards and
   emerald used only as an accent (links, tags, calendar marks).

   The dashboard is a helicopter view: each widget summarises a few
   items and links into its larger page.
   Spec: ADMIN_PORTAL_BRIEF.md
   ────────────────────────────────────────────────────────────────── */

const NAV = [
  { label: "Dashboard", icon: "grid", active: true },
  { label: "Requests pending", icon: "inbox", badge: "2" },
  { label: "Meetings", icon: "calendar" },
  { label: "Comms", icon: "chat", badge: "5" },
  { label: "Vendors", icon: "box" },
  { label: "Executives", icon: "user" },
];

const TASKS = [
  { type: "Pending exec", who: "Datadog → CFO, Hexagon Bank", age: "4d", stale: true, actions: ["Nudge", "Move"] },
  { type: "Move request", who: "CEO, Latitude × Snowflake", age: "1d", stale: false, actions: ["Reschedule"] },
  { type: "Cancelled", who: "Atlassian × COO, Brightwater", age: "2d", stale: false, actions: ["Rebook"] },
  { type: "New onboard", who: "Exec: Jordan Smith, Telstra", age: "—", stale: false, actions: ["Set up profile"] },
];

const REQUESTS = [
  { vendor: "Datadog", exec: "CFO, Hexagon Bank", age: "4d", stale: true },
  { vendor: "Figma", exec: "CMO, Latitude", age: "2d", stale: false },
];

const COMMS = [
  { from: "Snowflake", snippet: "Can we shift the Brightwater intro to…", age: "20m", unread: true },
  { from: "Atlassian", snippet: "Thanks — who's the right EA contact for…", age: "1h", unread: true },
  { from: "Canva", snippet: "We'd love two more seats this quarter.", age: "3h", unread: false },
];

// May 2026 starts on a Friday (Sun-first week => 5 leading blanks).
const BOOKED_DAYS = new Set([6, 13, 18, 26, 28]);
const TODAY = 24;

export default function AdminDashboardDraft() {
  return (
    <div className="min-h-screen flex font-sans bg-white" style={{ color: "var(--foreground)" }}>
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <main className="flex-1 px-8 py-7 w-full max-w-[1280px]">
          <MetricsRibbon />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8 space-y-5">
              <CalendarWidget />
              <TasksWidget />
            </div>
            <div className="lg:col-span-4 space-y-5">
              <RequestsWidget />
              <CommsWidget />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ── Sidebar (kept: deep emerald) ──────────────────────────────── */

function Sidebar() {
  return (
    <aside
      className="w-60 shrink-0 flex flex-col justify-between"
      style={{ background: "var(--emerald-deep)", color: "var(--primary-foreground)" }}
    >
      <div>
        <div className="px-5 h-16 flex items-center gap-2 border-b" style={{ borderColor: "rgba(255,255,255,0.10)" }}>
          <span
            className="size-7 rounded-full grid place-items-center text-[11px] font-semibold"
            style={{ background: "var(--primary-bright)", color: "var(--emerald-deep)" }}
          >
            tG
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            the<span style={{ color: "var(--primary-bright)" }}>Good</span>intro
          </span>
        </div>
        <nav className="px-3 py-4 space-y-1">
          {NAV.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
        </nav>
      </div>
      <div className="px-3 pb-4">
        <div className="my-3 border-t" style={{ borderColor: "rgba(255,255,255,0.10)" }} />
        <NavItem label="Settings" icon="cog" />
        <div className="mt-4 px-3 py-3 rounded-xl flex items-center gap-3" style={{ background: "rgba(255,255,255,0.06)" }}>
          <span
            className="size-8 rounded-full grid place-items-center text-[12px] font-semibold"
            style={{ background: "var(--primary-bright)", color: "var(--emerald-deep)" }}
          >
            IH
          </span>
          <div className="leading-tight">
            <div className="text-[13px] font-medium">Issy Hardwick</div>
            <div className="text-[10px] uppercase tracking-[0.16em] opacity-70">Super admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ label, icon, active, badge }: { label: string; icon: string; active?: boolean; badge?: string }) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13.5px] cursor-default"
      style={
        active
          ? { background: "var(--primary-bright)", color: "var(--emerald-deep)", fontWeight: 600 }
          : { color: "rgba(255,255,255,0.82)" }
      }
    >
      <Icon name={icon} />
      <span className="flex-1">{label}</span>
      {badge && (
        <span
          className="text-[10px] font-semibold size-4 grid place-items-center rounded-full"
          style={
            active
              ? { background: "var(--emerald-deep)", color: "var(--primary-bright)" }
              : { background: "var(--primary-bright)", color: "var(--emerald-deep)" }
          }
        >
          {badge}
        </span>
      )}
    </div>
  );
}

/* ── Top bar (kept: emerald) ───────────────────────────────────── */

function TopBar() {
  return (
    <header
      className="h-16 shrink-0 px-8 flex items-center justify-between border-b"
      style={{ background: "var(--primary)", color: "var(--primary-foreground)", borderColor: "rgba(0,0,0,0.06)" }}
    >
      <div className="flex items-baseline gap-3">
        <h1 className="text-[18px] font-semibold tracking-tight">Dashboard</h1>
        <span className="text-[11px] uppercase tracking-[0.18em] opacity-75">May 2026</span>
      </div>
      <div className="flex items-center gap-3">
        <div
          className="hidden md:flex items-center gap-2 h-9 px-3 rounded-full text-[12.5px]"
          style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}
        >
          <Icon name="search" />
          <span>Search vendors, execs, meetings</span>
        </div>
        <div className="relative size-9 rounded-full grid place-items-center" style={{ background: "rgba(255,255,255,0.15)" }}>
          <Icon name="bell" />
          <span
            className="absolute -top-0.5 -right-0.5 text-[9px] font-semibold size-4 grid place-items-center rounded-full"
            style={{ background: "var(--primary-bright)", color: "var(--emerald-deep)" }}
          >
            3
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-md" style={{ background: "rgba(255,255,255,0.15)" }}>
          Static draft
        </span>
      </div>
    </header>
  );
}

/* ── Metrics ribbon (kept: emerald bubble) ─────────────────────── */

function MetricsRibbon() {
  return (
    <section
      className="rounded-2xl px-6 py-4 mb-5 grid grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-2"
      style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
    >
      <RibbonGroup label="Meetings">
        <RibbonStat value="12" unit="scheduled" />
        <RibbonStat value="34" unit="ahead" />
        <RibbonStat value="87" unit="done" />
      </RibbonGroup>
      <RibbonGroup label="Network" divider>
        <RibbonStat value="18" unit="vendors" />
        <RibbonStat value="25" unit="execs" />
      </RibbonGroup>
      <RibbonGroup label="To charity" divider>
        <RibbonStat value="$42,300" unit="this year" big />
      </RibbonGroup>
      <RibbonGroup label="Revenue" divider>
        <RibbonStat value="$7,500" unit="MTD" />
        <RibbonStat value="$61,200" unit="YTD" />
      </RibbonGroup>
    </section>
  );
}

function RibbonGroup({ label, children, divider }: { label: string; children: React.ReactNode; divider?: boolean }) {
  return (
    <div className={divider ? "lg:pl-5 lg:border-l" : ""} style={divider ? { borderColor: "rgba(255,255,255,0.18)" } : undefined}>
      <div className="text-[10px] uppercase tracking-[0.18em] mb-2 opacity-75">{label}</div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 items-baseline">{children}</div>
    </div>
  );
}

function RibbonStat({ value, unit, big }: { value: string; unit: string; big?: boolean }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={big ? "text-[22px] font-semibold leading-none" : "text-[20px] font-semibold leading-none"}>{value}</span>
      <span className="text-[11px] opacity-75">{unit}</span>
    </div>
  );
}

/* ── Widget shell ──────────────────────────────────────────────── */

function Widget({
  title,
  count,
  link,
  right,
  children,
}: {
  title: string;
  count?: string;
  link?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-2xl bg-white border"
      style={{ borderColor: "var(--cream-6)", boxShadow: "0 1px 2px rgba(20,40,30,0.04)" }}
    >
      <header className="px-5 py-3.5 flex items-center justify-between border-b" style={{ borderColor: "var(--cream-4)" }}>
        <div className="flex items-center gap-2">
          <h2 className="text-[14.5px] font-semibold tracking-tight" style={{ color: "var(--primary-ink)" }}>
            {title}
          </h2>
          {count && (
            <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "var(--mint-pill)", color: "var(--mint-pill-ink)" }}>
              {count}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {right}
          {link && (
            <span className="text-[12px] font-medium cursor-default" style={{ color: "var(--primary)" }}>
              {link} →
            </span>
          )}
        </div>
      </header>
      {children}
    </section>
  );
}

/* ── Booked-meetings calendar ──────────────────────────────────── */

function CalendarWidget() {
  const cells: (number | null)[] = [...Array(5).fill(null), ...Array.from({ length: 31 }, (_, i) => i + 1)];
  return (
    <Widget title="Booked meetings" link="View meetings" right={<Toggle left="Calendar" right="List" />}>
      <div className="px-5 py-4">
        <div className="grid grid-cols-7 gap-1 text-center">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="text-[10px] uppercase tracking-[0.12em] pb-1" style={{ color: "var(--cream-9)" }}>
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={i} />;
            const booked = BOOKED_DAYS.has(day);
            const today = day === TODAY;
            return (
              <div
                key={i}
                className="h-12 rounded-lg flex flex-col items-center justify-center text-[12.5px]"
                style={
                  today
                    ? { background: "var(--primary)", color: "var(--primary-foreground)", fontWeight: 600 }
                    : { color: "var(--foreground)" }
                }
              >
                {day}
                {booked && !today && (
                  <span className="mt-0.5 size-1.5 rounded-full" style={{ background: "var(--primary)" }} />
                )}
                {booked && today && <span className="mt-0.5 size-1.5 rounded-full" style={{ background: "var(--primary-foreground)" }} />}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px]" style={{ color: "var(--cream-9)" }}>
          <span className="size-1.5 rounded-full" style={{ background: "var(--primary)" }} /> days with booked meetings
        </div>
      </div>
    </Widget>
  );
}

/* ── Tasks ─────────────────────────────────────────────────────── */

function TasksWidget() {
  return (
    <Widget title="Needs action" count="4" link="View all">
      <table className="w-full text-left">
        <tbody>
          {TASKS.map((t, i) => (
            <tr key={t.who} className="text-[13.5px]" style={{ borderTop: i === 0 ? "none" : "1px solid var(--cream-4)" }}>
              <td className="pl-5 pr-3 py-3.5">
                <TypeTag type={t.type} />
              </td>
              <td className="px-3 py-3.5">{t.who}</td>
              <td className="px-3 py-3.5">
                <span
                  className="inline-flex items-center gap-1.5 text-[12.5px]"
                  style={{ color: t.stale ? "var(--primary-ink)" : "var(--cream-9)", fontWeight: t.stale ? 600 : 400 }}
                >
                  {t.age}
                  {t.stale && <span title="overdue">⚠</span>}
                </span>
              </td>
              <td className="pr-5 pl-3 py-3.5">
                <div className="flex justify-end gap-2">
                  {t.actions.map((a, j) => (
                    <ActionButton key={a} label={a} primary={j === 0} />
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Widget>
  );
}

/* ── Pending requests quick view ───────────────────────────────── */

function RequestsWidget() {
  return (
    <Widget title="Pending requests" count="2" link="View all">
      <div className="divide-y" style={{ borderColor: "var(--cream-4)" }}>
        {REQUESTS.map((r) => (
          <div key={r.vendor} className="px-5 py-3.5 flex items-center justify-between gap-3" style={{ borderColor: "var(--cream-4)" }}>
            <div className="min-w-0">
              <div className="text-[13.5px] font-medium truncate">
                {r.vendor} <span className="font-normal" style={{ color: "var(--cream-9)" }}>→ {r.exec}</span>
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: "var(--cream-9)" }}>
                waiting on exec to action
              </div>
            </div>
            <span
              className="text-[11.5px] shrink-0"
              style={{ color: r.stale ? "var(--primary-ink)" : "var(--cream-9)", fontWeight: r.stale ? 600 : 400 }}
            >
              {r.age}
              {r.stale ? " ⚠" : ""}
            </span>
          </div>
        ))}
      </div>
    </Widget>
  );
}

/* ── Unresponded comms quick view ──────────────────────────────── */

function CommsWidget() {
  return (
    <Widget title="Unresponded comms" count="5" link="Open comms">
      <div>
        {COMMS.map((c, i) => (
          <div
            key={c.from}
            className="px-5 py-3.5 flex items-start gap-3"
            style={{ borderTop: i === 0 ? "none" : "1px solid var(--cream-4)" }}
          >
            <span
              className="mt-1.5 size-2 rounded-full shrink-0"
              style={{ background: c.unread ? "var(--primary)" : "var(--cream-6)" }}
            />
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
    </Widget>
  );
}

/* ── Small parts ───────────────────────────────────────────────── */

function TypeTag({ type }: { type: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    "Pending exec": { bg: "var(--signal-soft)", fg: "var(--primary-ink)" },
    "Move request": { bg: "var(--mint-soft)", fg: "var(--primary-ink)" },
    Cancelled: { bg: "var(--cream-3)", fg: "var(--cream-9)" },
    "New onboard": { bg: "var(--mint-pill)", fg: "var(--mint-pill-ink)" },
  };
  const c = map[type] ?? { bg: "var(--cream-3)", fg: "var(--cream-9)" };
  return (
    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: c.bg, color: c.fg }}>
      {type}
    </span>
  );
}

function ActionButton({ label, primary }: { label: string; primary?: boolean }) {
  return (
    <span
      className="text-[12px] font-medium px-3 py-1.5 rounded-lg whitespace-nowrap cursor-default"
      style={
        primary
          ? { background: "var(--primary)", color: "var(--primary-foreground)" }
          : { background: "transparent", color: "var(--primary-ink)", border: "1px solid var(--cream-6)" }
      }
    >
      {label}
    </span>
  );
}

function Toggle({ left, right }: { left: string; right: string }) {
  return (
    <span className="inline-flex rounded-lg overflow-hidden text-[12px] font-medium" style={{ border: "1px solid var(--cream-6)" }}>
      <span className="px-3 py-1.5" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>{left}</span>
      <span className="px-3 py-1.5" style={{ color: "var(--cream-9)" }}>{right}</span>
    </span>
  );
}

/* ── Icons ─────────────────────────────────────────────────────── */

function Icon({ name }: { name: string }) {
  const common = {
    width: 17,
    height: 17,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const paths: Record<string, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    inbox: (
      <>
        <path d="M4 13h4l1.5 3h5L16 13h4" />
        <path d="M4 13 6 5h12l2 8v6H4z" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M3 9h18M8 2v4M16 2v4" />
      </>
    ),
    chat: <path d="M4 5h16v11H9l-4 4V5z" />,
    box: (
      <>
        <path d="M3 7l9-4 9 4-9 4-9-4z" />
        <path d="M3 7v10l9 4 9-4V7M12 11v10" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
      </>
    ),
    cog: (
      <>
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4-4" />
      </>
    ),
    bell: (
      <>
        <path d="M6 9a6 6 0 0112 0c0 6 2 7 2 7H4s2-1 2-7z" />
        <path d="M10 20a2 2 0 004 0" />
      </>
    ),
  };
  return (
    <svg {...common} aria-hidden="true">
      {paths[name] ?? null}
    </svg>
  );
}
