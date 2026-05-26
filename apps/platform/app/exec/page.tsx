import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Executive portal · theGoodintro (draft)",
  robots: { index: false, follow: false },
};

/* ──────────────────────────────────────────────────────────────────
   Executive portal — rough visual draft. Static, non-interactive.
   The exec is EMAIL-FIRST; this dashboard is a secondary, optional
   surface. Shared portal palette (tokens in globals.css): emerald only
   on the sidebar; warm-cream page, dark-ink ribbon, ink buttons, amber.
   Spec: EXECUTIVE_PORTAL_BRIEF.md
   ────────────────────────────────────────────────────────────────── */

const NAV = [
  { label: "Dashboard", icon: "grid", active: true },
  { label: "Requests", icon: "inbox", badge: "2" },
  { label: "Upcoming meetings", icon: "calendar" },
  { label: "Your charity", icon: "heart" },
  { label: "Impact", icon: "spark" },
];

const REQUESTS = [
  { vendor: "Datadog", want: "20 min on observability for your platform team", gift: "$1,000" },
  { vendor: "Figma", want: "How design ops could speed your rollouts", gift: "$1,000" },
];

const UPCOMING = [
  { vendor: "Snowflake", when: "Tue 27 May, 2:00pm" },
  { vendor: "Canva", when: "Thu 5 Jun, 10:30am" },
];

const GIVEN = [
  { charity: "Beyond Blue", amount: "$4,500" },
  { charity: "OzHarvest", amount: "$1,800" },
];

export default function ExecDashboardDraft() {
  return (
    <div className="min-h-screen flex font-sans" style={{ background: "var(--portal-page)", color: "var(--foreground)" }}>
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <main className="flex-1 px-8 py-7 w-full max-w-[1280px]">
          <EmailFirstNote />
          <MetricsRibbon />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8 space-y-5">
              <RequestsWidget />
              <UpcomingWidget />
            </div>
            <div className="lg:col-span-4 space-y-5">
              <CharityWidget />
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
          <span className="size-8 rounded-full grid place-items-center text-[12px] font-semibold" style={{ background: "var(--primary-bright)", color: "var(--emerald-deep)" }}>JS</span>
          <div className="leading-tight">
            <div className="text-[13px] font-medium">Jordan Smith</div>
            <div className="text-[10px] uppercase tracking-[0.16em] opacity-70">CFO, Hexagon Bank</div>
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
        <h1 className="text-[18px] font-semibold tracking-tight">Your dashboard</h1>
        <span className="text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--cream-9)" }}>Hexagon Bank</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative size-9 rounded-full grid place-items-center" style={{ background: "var(--cream-3)", color: "var(--cream-10)" }}>
          <Icon name="bell" />
          <span className="absolute -top-0.5 -right-0.5 text-[9px] font-semibold size-4 grid place-items-center rounded-full" style={{ background: "var(--portal-amber)", color: "#fff" }}>2</span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-md" style={{ background: "var(--cream-3)", color: "var(--cream-9)" }}>Static draft</span>
      </div>
    </header>
  );
}

function EmailFirstNote() {
  return (
    <div className="rounded-2xl px-5 py-3.5 mb-5 flex items-center gap-3" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}>
      <span className="size-7 rounded-full grid place-items-center shrink-0" style={{ background: "var(--portal-amber)", color: "#fff" }}><Icon name="mail" /></span>
      <span className="text-[13px]">You can accept, decline, or forward every request straight from your email. This dashboard is optional, handy for you or your EA to see the bigger picture.</span>
    </div>
  );
}

function MetricsRibbon() {
  return (
    <section className="rounded-2xl px-6 py-4 mb-5 grid grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-2" style={{ background: "var(--portal-ribbon)", color: "var(--primary-foreground)" }}>
      <RibbonGroup label="Meetings">
        <RibbonStat value="2" unit="upcoming" />
        <RibbonStat value="7" unit="taken" />
      </RibbonGroup>
      <RibbonGroup label="Generated for charity" divider>
        <RibbonStat value="$6,300" unit="all time" big />
      </RibbonGroup>
      <RibbonGroup label="Your charity" divider>
        <RibbonStat value="Beyond Blue" unit="" />
      </RibbonGroup>
      <RibbonGroup label="Requests" divider>
        <RibbonStat value="2" unit="to action" />
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
      {unit && <span className="text-[11px] opacity-70">{unit}</span>}
    </div>
  );
}

function Widget({ title, count, link, note, children }: { title: string; count?: string; link?: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border" style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)", boxShadow: "0 1px 2px rgba(20,40,30,0.04)" }}>
      <header className="px-5 py-3.5 flex items-center justify-between border-b" style={{ borderColor: "var(--portal-line)" }}>
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-[14.5px] font-semibold tracking-tight">{title}</h2>
          {count && <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}>{count}</span>}
          {note && <span className="text-[11px] truncate" style={{ color: "var(--cream-9)" }}>· {note}</span>}
        </div>
        {link && <span className="text-[12px] font-medium cursor-default shrink-0" style={{ color: "var(--portal-amber-ink)" }}>{link} →</span>}
      </header>
      {children}
    </section>
  );
}

function RequestsWidget() {
  return (
    <Widget title="Requests" count="2" note="you usually action these from email">
      <div>
        {REQUESTS.map((r, i) => (
          <div key={r.vendor} className="px-5 py-4 flex items-start justify-between gap-4" style={{ borderTop: i === 0 ? "none" : "1px solid var(--portal-line)" }}>
            <div className="min-w-0">
              <div className="text-[14px] font-medium">{r.vendor}</div>
              <div className="text-[12.5px] mt-0.5" style={{ color: "var(--cream-9)" }}>{r.want}</div>
              <div className="text-[12px] mt-1.5" style={{ color: "var(--portal-amber-ink)" }}>A meeting sends {r.gift} to Beyond Blue</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Pill label="Accept" primary />
              <Pill label="Decline" />
            </div>
          </div>
        ))}
      </div>
    </Widget>
  );
}

function UpcomingWidget() {
  return (
    <Widget title="Upcoming meetings" link="View all">
      <div>
        {UPCOMING.map((u, i) => (
          <div key={u.vendor} className="px-5 py-3.5 flex items-center gap-3" style={{ borderTop: i === 0 ? "none" : "1px solid var(--portal-line)" }}>
            <span className="size-8 rounded-lg grid place-items-center shrink-0" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}><Icon name="calendar" /></span>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium">{u.vendor}</div>
              <div className="text-[11.5px]" style={{ color: "var(--cream-9)" }}>{u.when} · 45 min</div>
            </div>
            <Pill label="Join" />
          </div>
        ))}
      </div>
    </Widget>
  );
}

function CharityWidget() {
  return (
    <Widget title="Your charity" link="Change">
      <div className="px-5 py-5 flex items-center gap-4">
        <span className="size-12 rounded-full grid place-items-center shrink-0" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}><Icon name="heart" /></span>
        <div>
          <div className="text-[15px] font-semibold">Beyond Blue</div>
          <div className="text-[12px]" style={{ color: "var(--cream-9)" }}>Every meeting you take sends a gift here. You can change it any time, or per meeting.</div>
        </div>
      </div>
    </Widget>
  );
}

function ImpactWidget() {
  return (
    <Widget title="Your impact">
      <div className="px-5 pt-4 pb-2">
        <div className="text-[28px] font-semibold leading-none">$6,300</div>
        <div className="text-[11px] uppercase tracking-[0.16em] mt-1" style={{ color: "var(--cream-9)" }}>generated across 7 meetings</div>
      </div>
      <div className="pb-2">
        {GIVEN.map((g) => (
          <div key={g.charity} className="px-5 py-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--portal-line)" }}>
            <span className="text-[13px]">{g.charity}</span>
            <span className="text-[13.5px] font-semibold">{g.amount}</span>
          </div>
        ))}
      </div>
    </Widget>
  );
}

function Pill({ label, primary }: { label: string; primary?: boolean }) {
  return (
    <span className="text-[12px] font-medium px-3 py-1.5 rounded-lg whitespace-nowrap cursor-default inline-block" style={primary ? { background: "var(--portal-ink)", color: "#fff" } : { background: "transparent", color: "var(--foreground)", border: "1px solid var(--portal-line)" }}>{label}</span>
  );
}

function Icon({ name }: { name: string }) {
  const common = { width: 17, height: 17, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<string, React.ReactNode> = {
    grid: (<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>),
    inbox: (<><path d="M4 13h4l1.5 3h5L16 13h4" /><path d="M4 13 6 5h12l2 8v6H4z" /></>),
    calendar: (<><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></>),
    heart: <path d="M12 20s-7-4.3-7-9a4 4 0 017-2.6A4 4 0 0119 11c0 4.7-7 9-7 9z" />,
    spark: <path d="M12 3l2.2 6.2L20 11l-5.8 1.8L12 19l-2.2-6.2L4 11l5.8-1.8L12 3z" />,
    cog: (<><circle cx="12" cy="12" r="3.2" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></>),
    bell: (<><path d="M6 9a6 6 0 0112 0c0 6 2 7 2 7H4s2-1 2-7z" /><path d="M10 20a2 2 0 004 0" /></>),
    mail: (<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>),
  };
  return <svg {...common} aria-hidden="true">{paths[name] ?? null}</svg>;
}
