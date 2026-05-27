import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getFlag } from "@/lib/flags";
import { UserAvatar } from "./_components/avatar";
import { ExecDashboard } from "./_components/exec-dashboard";
import { resolveDemoExecutiveId, loadExecDashboard } from "./data";

export const metadata: Metadata = {
  title: "Your dashboard · TheGoodIntro",
  robots: { index: false, follow: false },
};

/* Executive dashboard — the rich committed mockup
   (apps/web/app/mockup/exec/ExecDashboard.tsx) reproduced in the platform:
   emerald sidebar + dark metrics ribbon chrome (consistent with admin/vendor),
   the mockup's 2-column body (standing nomination + activity), re-toned to the
   --portal-* palette and wired to live staging data. The exec is EMAIL-FIRST;
   this is the secondary surface (EXECUTIVE_PORTAL_BRIEF). Flag: exec_dashboard. */

const NAV = [
  { label: "Dashboard", icon: "grid", href: "/exec", active: true },
  { label: "Requests", icon: "inbox", href: "/exec" },
  { label: "Upcoming meetings", icon: "calendar", href: "/exec" },
  { label: "Your charity", icon: "heart", href: "/exec" },
  { label: "Impact", icon: "spark", href: "/exec" },
];

export default async function ExecDashboardPage() {
  const enabled = await getFlag("exec_dashboard");
  if (!enabled) return <FlagOff />;

  const supabase = await createClient();
  const execId = await resolveDemoExecutiveId(supabase);
  const data = execId ? await loadExecDashboard(supabase, execId) : null;
  if (!data) return <FlagOff missingExec />;

  const { exec, ribbon } = data;
  const greetingCount = data.incoming.length;

  return (
    <div className="min-h-screen flex font-sans" style={{ background: "var(--portal-page)", color: "var(--foreground)" }}>
      <Sidebar exec={exec} requestsBadge={greetingCount} />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar company={exec.company} requestsBadge={greetingCount} />
        <main className="flex-1 px-8 py-7 w-full max-w-[1280px]">
          {/* Email-first note (the mockup's "secondary surface" banner) */}
          <div className="rounded-2xl px-5 py-3.5 mb-5 flex items-start gap-3" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}>
            <span className="size-7 rounded-full grid place-items-center shrink-0 mt-0.5" style={{ background: "var(--portal-amber)", color: "#fff" }}>
              <SvgIcon name="mail" />
            </span>
            <span className="text-[13px] leading-relaxed">
              <strong className="font-semibold">This dashboard is a secondary surface.</strong>{" "}
              Most executives accept or decline meetings straight from email and never open this view. It is here for transparency, history, and for EAs acting on your behalf.{" "}
              <Link href="/exec/email" className="underline-offset-2 hover:underline font-medium">See the email flow →</Link>
            </span>
          </div>

          {/* Dark metrics ribbon (portal chrome) */}
          <section className="rounded-2xl px-6 py-4 mb-6 grid grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-2" style={{ background: "var(--portal-ribbon)", color: "var(--primary-foreground)" }}>
            <RibbonGroup label="Meetings">
              <RibbonStat value={String(ribbon.upcoming)} unit="upcoming" />
              <RibbonStat value={String(ribbon.taken)} unit="taken" />
            </RibbonGroup>
            <RibbonGroup label="Generated for charity" divider>
              <RibbonStat value={ribbon.generatedAllTime} unit="all time" big />
            </RibbonGroup>
            <RibbonGroup label="Your charity" divider>
              <RibbonStat value={data.defaultCharityName || "—"} unit="" />
            </RibbonGroup>
            <RibbonGroup label="Requests" divider>
              <RibbonStat value={String(ribbon.requestsToAction)} unit="to action" />
            </RibbonGroup>
          </section>

          {/* Greeting */}
          <div className="max-w-2xl flex items-start gap-5 mb-8">
            <UserAvatar name={exec.name} size={56} />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>{today()}</div>
              <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-[-0.02em] leading-tight">
                Welcome back, {exec.firstName}.
              </h1>
              <p className="mt-3 text-base leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                {greetingCount > 0 ? (
                  <>You have <span className="font-semibold" style={{ color: "var(--foreground)" }}>{greetingCount} meeting request{greetingCount === 1 ? "" : "s"}</span> waiting. </>
                ) : (
                  <>No requests waiting right now. </>
                )}
                So far this year you have directed{" "}
                <span className="font-display italic" style={{ color: "var(--portal-amber-ink)" }}>{data.thisYearAmount}</span>{" "}
                across {data.thisYearCount} meeting{data.thisYearCount === 1 ? "" : "s"}.
              </p>
            </div>
          </div>

          {/* The rich 2-column body (client island) */}
          <ExecDashboard
            charities={data.charities}
            defaultCharityId={data.defaultCharityId}
            incoming={data.incoming}
            donations={data.donations}
            indicativeAmount={data.indicativeAmount}
          />
        </main>
      </div>
    </div>
  );
}

function Sidebar({ exec, requestsBadge }: { exec: { name: string; title: string | null; company: string | null }; requestsBadge: number }) {
  const initials = exec.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "EX";
  return (
    <aside className="w-60 shrink-0 flex flex-col justify-between" style={{ background: "var(--emerald-deep)", color: "var(--primary-foreground)" }}>
      <div>
        <div className="px-5 h-16 flex items-center gap-2 border-b" style={{ borderColor: "rgba(255,255,255,0.10)" }}>
          <span className="size-7 rounded-full grid place-items-center text-[11px] font-semibold" style={{ background: "var(--primary-bright)", color: "var(--emerald-deep)" }}>tG</span>
          <span className="text-[15px] font-semibold tracking-tight">the<span style={{ color: "var(--primary-bright)" }}>Good</span>intro</span>
        </div>
        <nav className="px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const badge = item.label === "Requests" && requestsBadge > 0 ? String(requestsBadge) : undefined;
            return (
              <Link key={item.label} href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13.5px]" style={item.active ? { background: "var(--primary-bright)", color: "var(--emerald-deep)", fontWeight: 600 } : { color: "rgba(255,255,255,0.82)" }}>
                <SvgIcon name={item.icon} />
                <span className="flex-1">{item.label}</span>
                {badge && <span className="text-[10px] font-semibold size-4 grid place-items-center rounded-full" style={item.active ? { background: "var(--emerald-deep)", color: "var(--primary-bright)" } : { background: "var(--portal-amber)", color: "#fff" }}>{badge}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="px-3 pb-4">
        <div className="my-3 border-t" style={{ borderColor: "rgba(255,255,255,0.10)" }} />
        <Link href="/exec" className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13.5px]" style={{ color: "rgba(255,255,255,0.82)" }}>
          <SvgIcon name="cog" /><span className="flex-1">Settings</span>
        </Link>
        <div className="mt-4 px-3 py-3 rounded-xl flex items-center gap-3" style={{ background: "rgba(255,255,255,0.06)" }}>
          <span className="size-8 rounded-full grid place-items-center text-[12px] font-semibold" style={{ background: "var(--primary-bright)", color: "var(--emerald-deep)" }}>{initials}</span>
          <div className="leading-tight min-w-0">
            <div className="text-[13px] font-medium truncate">{exec.name}</div>
            <div className="text-[10px] uppercase tracking-[0.16em] opacity-70 truncate">{[exec.title, exec.company].filter(Boolean).join(", ")}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ company, requestsBadge }: { company: string | null; requestsBadge: number }) {
  return (
    <header className="h-16 shrink-0 px-8 flex items-center justify-between border-b" style={{ background: "var(--portal-header)", color: "var(--foreground)", borderColor: "var(--portal-line)" }}>
      <div className="flex items-baseline gap-3">
        <h1 className="text-[18px] font-semibold tracking-tight">Your dashboard</h1>
        {company && <span className="text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>{company}</span>}
      </div>
      <div className="relative size-9 rounded-full grid place-items-center" style={{ background: "var(--accent)", color: "var(--muted-foreground)" }}>
        <SvgIcon name="bell" />
        {requestsBadge > 0 && (
          <span className="absolute -top-0.5 -right-0.5 text-[9px] font-semibold size-4 grid place-items-center rounded-full" style={{ background: "var(--portal-amber)", color: "#fff" }}>{requestsBadge}</span>
        )}
      </div>
    </header>
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

function today(): string {
  return new Intl.DateTimeFormat("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Australia/Sydney" }).format(new Date());
}

function FlagOff({ missingExec }: { missingExec?: boolean }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-center" style={{ background: "var(--portal-page)", color: "var(--foreground)" }}>
      <div className="max-w-md">
        <p className="font-mono text-xs uppercase tracking-[0.18em]" style={{ color: "var(--portal-amber-ink)" }}>
          {missingExec ? "No executive" : "Feature flag off"}
        </p>
        <h1 className="mt-2 text-xl font-semibold">{missingExec ? "No executive to show" : "Executive dashboard is not enabled"}</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
          {missingExec
            ? "Seed an executive on staging to view the dashboard."
            : <>Turn on the <code>exec_dashboard</code> flag in <code>feature_flag</code> to view it.</>}
        </p>
      </div>
    </main>
  );
}

function SvgIcon({ name }: { name: string }) {
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
