import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor portal · theGoodintro (draft)",
  robots: { index: false, follow: false },
};

/* ──────────────────────────────────────────────────────────────────
   Vendor portal — rough visual draft. Static, non-interactive.
   Shared portal palette (tokens in globals.css): emerald only on the
   sidebar; warm-cream page, dark-ink ribbon, ink buttons, amber accent.
   Spec: VENDOR_PORTAL_BRIEF.md
   ────────────────────────────────────────────────────────────────── */

const NAV = [
  { label: "Dashboard", icon: "grid", active: true },
  { label: "Find executives", icon: "search" },
  { label: "My requests", icon: "inbox", badge: "3" },
  { label: "Pending", icon: "clock", badge: "2" },
  { label: "Billing & credits", icon: "card" },
];

const EXECS = [
  { company: "Hexagon Bank", title: "CFO", charity: "Beyond Blue", status: "Available" },
  { company: "Latitude", title: "CMO", charity: "OzHarvest", status: "Available" },
  { company: "Brightwater", title: "COO", charity: "RFDS", status: "Requested" },
  { company: "Telstra", title: "CEO", charity: "The Smith Family", status: "Available" },
];

const PENDING = [
  { exec: "COO, Brightwater", state: "Waiting on exec", age: "2d" },
  { exec: "CFO, Hexagon Bank", state: "Securing a time", age: "1d" },
];

const GIFTS = [
  { exec: "CMO, Canva", charity: "OzHarvest", amount: "$1,000" },
  { exec: "CTO, Xero", charity: "Beyond Blue", amount: "$900" },
  { exec: "CFO, REA", charity: "Lifeline", amount: "$900" },
];

export default function VendorDashboardDraft() {
  return (
    <div className="min-h-screen flex font-sans" style={{ background: "var(--portal-page)", color: "var(--foreground)" }}>
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <main className="flex-1 px-8 py-7 w-full max-w-[1280px]">
          <MetricsRibbon />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8 space-y-5">
              <ExecListWidget />
              <CreditsWidget />
            </div>
            <div className="lg:col-span-4 space-y-5">
              <PendingWidget />
              <ImpactWidget />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="w-60 shrink-0 flex flex-col justify-between" style={{ background: "var(--emerald-deep)", color: "var(--primary-foreground)" }}>
      <div>
        <div className="px-5 h-16 flex items-center gap-2 border-b" style={{ borderColor: "rgba(255,255,255,0.10)" }}>
          <span className="size-7 rounded-full grid place-items-center text-[11px] font-semibold" style={{ background: "var(--primary-bright)", color: "var(--emerald-deep)" }}>tG</span>
          <span className="text-[15px] font-semibold tracking-tight">the<span style={{ color: "var(--primary-bright)" }}>Good</span>intro</span>
        </div>
        <nav className="px-3 py-4 space-y-1">
          {NAV.map((item) => <NavItem key={item.label} {...item} />)}
        </nav>
      </div>
      <div className="px-3 pb-4">
        <div className="my-3 border-t" style={{ borderColor: "rgba(255,255,255,0.10)" }} />
        <NavItem label="Settings" icon="cog" />
        <div className="mt-4 px-3 py-3 rounded-xl flex items-center gap-3" style={{ background: "rgba(255,255,255,0.06)" }}>
          <span className="size-8 rounded-full grid place-items-center text-[12px] font-semibold" style={{ background: "var(--primary-bright)", color: "var(--emerald-deep)" }}>AR</span>
          <div className="leading-tight">
            <div className="text-[13px] font-medium">Alex Rivera</div>
            <div className="text-[10px] uppercase tracking-[0.16em] opacity-70">Datadog · Owner</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ label, icon, active, badge }: { label: string; icon: string; active?: boolean; badge?: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13.5px] cursor-default" style={active ? { background: "var(--primary-bright)", color: "var(--emerald-deep)", fontWeight: 600 } : { color: "rgba(255,255,255,0.82)" }}>
      <Icon name={icon} />
      <span className="flex-1">{label}</span>
      {badge && <span className="text-[10px] font-semibold size-4 grid place-items-center rounded-full" style={active ? { background: "var(--emerald-deep)", color: "var(--primary-bright)" } : { background: "var(--portal-amber)", color: "#fff" }}>{badge}</span>}
    </div>
  );
}

function TopBar() {
  return (
    <header className="h-16 shrink-0 px-8 flex items-center justify-between border-b" style={{ background: "var(--portal-header)", color: "var(--foreground)", borderColor: "var(--portal-line)" }}>
      <div className="flex items-baseline gap-3">
        <h1 className="text-[18px] font-semibold tracking-tight">Dashboard</h1>
        <span className="text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--cream-9)" }}>Datadog</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 h-9 px-3 rounded-full text-[12.5px]" style={{ background: "var(--cream-3)", color: "var(--cream-9)" }}>
          <Icon name="search" /><span>Search executives</span>
        </div>
        <div className="relative size-9 rounded-full grid place-items-center" style={{ background: "var(--cream-3)", color: "var(--cream-10)" }}>
          <Icon name="bell" />
          <span className="absolute -top-0.5 -right-0.5 text-[9px] font-semibold size-4 grid place-items-center rounded-full" style={{ background: "var(--portal-amber)", color: "#fff" }}>2</span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-md" style={{ background: "var(--cream-3)", color: "var(--cream-9)" }}>Static draft</span>
      </div>
    </header>
  );
}

function MetricsRibbon() {
  return (
    <section className="rounded-2xl px-6 py-4 mb-5 grid grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-2" style={{ background: "var(--portal-ribbon)", color: "var(--primary-foreground)" }}>
      <RibbonGroup label="Credits">
        <RibbonStat value="6" unit="available" />
        <RibbonStat value="2" unit="reserved" />
      </RibbonGroup>
      <RibbonGroup label="Meetings" divider>
        <RibbonStat value="3" unit="pending" />
        <RibbonStat value="9" unit="held" />
      </RibbonGroup>
      <RibbonGroup label="To charity via you" divider>
        <RibbonStat value="$9,500" unit="this year" big />
      </RibbonGroup>
      <RibbonGroup label="Your band" divider>
        <RibbonStat value="Band 2" unit="$1,000 / mtg" />
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

function Widget({ title, count, link, children }: { title: string; count?: string; link?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border" style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)", boxShadow: "0 1px 2px rgba(20,40,30,0.04)" }}>
      <header className="px-5 py-3.5 flex items-center justify-between border-b" style={{ borderColor: "var(--portal-line)" }}>
        <div className="flex items-center gap-2">
          <h2 className="text-[14.5px] font-semibold tracking-tight">{title}</h2>
          {count && <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}>{count}</span>}
        </div>
        {link && <span className="text-[12px] font-medium cursor-default" style={{ color: "var(--portal-amber-ink)" }}>{link} →</span>}
      </header>
      {children}
    </section>
  );
}

function ExecListWidget() {
  return (
    <Widget title="Executives for you" link="View all">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] uppercase tracking-[0.12em]" style={{ color: "var(--cream-9)" }}>
            <th className="pl-5 pr-3 py-2 font-medium">Company</th>
            <th className="px-3 py-2 font-medium">Role</th>
            <th className="px-3 py-2 font-medium">Their charity</th>
            <th className="pr-5 pl-3 py-2 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {EXECS.map((e) => (
            <tr key={e.company} className="text-[13.5px]" style={{ borderTop: "1px solid var(--portal-line)" }}>
              <td className="pl-5 pr-3 py-3.5 font-medium">{e.company}</td>
              <td className="px-3 py-3.5" style={{ color: "var(--cream-9)" }}>{e.title}</td>
              <td className="px-3 py-3.5">{e.charity}</td>
              <td className="pr-5 pl-3 py-3.5 text-right">
                {e.status === "Requested"
                  ? <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ background: "var(--cream-3)", color: "var(--cream-9)" }}>Requested</span>
                  : <ActionButton label="Request" primary />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Widget>
  );
}

function CreditsWidget() {
  return (
    <Widget title="Your credits" link="Buy credits">
      <div className="px-5 py-5 flex flex-wrap items-center gap-x-10 gap-y-4">
        <div>
          <div className="text-[40px] font-semibold leading-none">6</div>
          <div className="text-[11px] uppercase tracking-[0.16em] mt-1" style={{ color: "var(--cream-9)" }}>credits available</div>
        </div>
        <div className="flex-1 min-w-[220px]">
          <div className="flex items-baseline justify-between text-[12px] mb-1.5" style={{ color: "var(--cream-9)" }}>
            <span>Band 2 · $1,000 to charity / meeting</span>
            <span>4 held to Band 3</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--portal-amber-soft)" }}>
            <div className="h-full rounded-full" style={{ width: "60%", background: "var(--portal-amber)" }} />
          </div>
          <div className="text-[11.5px] mt-2" style={{ color: "var(--cream-9)" }}>1 credit = 1 meeting = $1,500 AUD. The charity share rises as you meet more.</div>
        </div>
        <ActionButton label="Buy credits" primary />
      </div>
    </Widget>
  );
}

function PendingWidget() {
  return (
    <Widget title="Pending" count="2" link="View all">
      <div>
        {PENDING.map((p, i) => (
          <div key={p.exec} className="px-5 py-3.5 flex items-center justify-between gap-3" style={{ borderTop: i === 0 ? "none" : "1px solid var(--portal-line)" }}>
            <div className="min-w-0">
              <div className="text-[13.5px] font-medium truncate">{p.exec}</div>
              <div className="text-[11px] mt-0.5" style={{ color: "var(--cream-9)" }}>{p.state}</div>
            </div>
            <span className="text-[11.5px] shrink-0" style={{ color: "var(--cream-9)" }}>{p.age}</span>
          </div>
        ))}
      </div>
    </Widget>
  );
}

function ImpactWidget() {
  return (
    <Widget title="Your impact" link="View giving">
      <div>
        {GIFTS.map((g, i) => (
          <div key={g.exec} className="px-5 py-3.5 flex items-center gap-3" style={{ borderTop: i === 0 ? "none" : "1px solid var(--portal-line)" }}>
            <span className="size-7 rounded-full grid place-items-center shrink-0" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}><Icon name="heart" /></span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium truncate">{g.charity}</div>
              <div className="text-[11px]" style={{ color: "var(--cream-9)" }}>after {g.exec}</div>
            </div>
            <span className="text-[13.5px] font-semibold shrink-0">{g.amount}</span>
          </div>
        ))}
      </div>
    </Widget>
  );
}

function ActionButton({ label, primary }: { label: string; primary?: boolean }) {
  return (
    <span className="text-[12px] font-medium px-3 py-1.5 rounded-lg whitespace-nowrap cursor-default inline-block" style={primary ? { background: "var(--portal-ink)", color: "#fff" } : { background: "transparent", color: "var(--foreground)", border: "1px solid var(--portal-line)" }}>{label}</span>
  );
}

function Icon({ name }: { name: string }) {
  const common = { width: 17, height: 17, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<string, React.ReactNode> = {
    grid: (<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>),
    search: (<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></>),
    inbox: (<><path d="M4 13h4l1.5 3h5L16 13h4" /><path d="M4 13 6 5h12l2 8v6H4z" /></>),
    clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
    card: (<><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>),
    cog: (<><circle cx="12" cy="12" r="3.2" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></>),
    bell: (<><path d="M6 9a6 6 0 0112 0c0 6 2 7 2 7H4s2-1 2-7z" /><path d="M10 20a2 2 0 004 0" /></>),
    heart: <path d="M12 20s-7-4.3-7-9a4 4 0 017-2.6A4 4 0 0119 11c0 4.7-7 9-7 9z" />,
  };
  return <svg {...common} aria-hidden="true">{paths[name] ?? null}</svg>;
}
