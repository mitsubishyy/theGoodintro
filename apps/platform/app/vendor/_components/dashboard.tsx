/* Vendor dashboard — ported component-for-component from the committed mockup
   (app/vendor/page.tsx). Presentational; live data via props. */
import Link from "next/link";
import { Icon } from "./icons";
import { signOutAction } from "@/app/login/actions";

export type VendorRibbon = {
  creditsAvailable: number;
  creditsReserved: number;
  meetingsPending: number;
  meetingsHeld: number;
  toCharity: string;
  bandLabel: string;
  bandRate: string;
};
export type ExecRow = { id: string; company: string; title: string; charity: string; requested: boolean };
export type PendingRow = { exec: string; state: string; age: string };
export type GiftRow = { charity: string; exec: string; amount: string };
export type Credits = {
  available: number;
  bandLabel: string;
  bandRate: string;
  progressPercent: number;
  progressNote: string;
};

const NAV = [
  { label: "Dashboard", icon: "grid", href: "/vendor", active: true },
  { label: "Find executives", icon: "search", href: "/vendor/executives" },
  { label: "My requests", icon: "inbox", href: "/vendor/executives" },
  { label: "Pending", icon: "clock", href: "/vendor" },
  { label: "Billing & credits", icon: "card", href: "/vendor" },
];

export function VendorDashboard(props: {
  company: string;
  userName: string;
  role: string;
  month: string;
  ribbon: VendorRibbon;
  execs: ExecRow[];
  credits: Credits;
  pending: PendingRow[];
  gifts: GiftRow[];
  myRequestsBadge: number;
}) {
  const { company, userName, role, ribbon, execs, credits, pending, gifts } = props;
  const initials = userName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "TG";

  return (
    <div className="min-h-screen flex font-sans" style={{ background: "var(--portal-page)", color: "var(--foreground)" }}>
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col justify-between" style={{ background: "var(--emerald-deep)", color: "var(--primary-foreground)" }}>
        <div>
          <div className="px-5 h-16 flex items-center gap-2 border-b" style={{ borderColor: "rgba(255,255,255,0.10)" }}>
            <span className="size-7 rounded-full grid place-items-center text-[11px] font-semibold" style={{ background: "var(--primary-bright)", color: "var(--emerald-deep)" }}>tG</span>
            <span className="text-[15px] font-semibold tracking-tight">the<span style={{ color: "var(--primary-bright)" }}>Good</span>intro</span>
          </div>
          <nav className="px-3 py-4 space-y-1">
            {NAV.map((item) => {
              const badge = item.label === "My requests" && props.myRequestsBadge > 0 ? String(props.myRequestsBadge)
                : item.label === "Pending" && pending.length > 0 ? String(pending.length) : undefined;
              return (
                <Link key={item.label} href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13.5px]" style={item.active ? { background: "var(--primary-bright)", color: "var(--emerald-deep)", fontWeight: 600 } : { color: "rgba(255,255,255,0.82)" }}>
                  <Icon name={item.icon} />
                  <span className="flex-1">{item.label}</span>
                  {badge && <span className="text-[10px] font-semibold size-4 grid place-items-center rounded-full" style={{ background: "var(--portal-amber)", color: "#fff" }}>{badge}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="px-3 pb-4">
          <div className="my-3 border-t" style={{ borderColor: "rgba(255,255,255,0.10)" }} />
          <Link href="/account/security" className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13.5px]" style={{ color: "rgba(255,255,255,0.82)" }}>
            <Icon name="cog" /><span className="flex-1">Settings</span>
          </Link>
          <div className="mt-4 px-3 py-3 rounded-xl flex items-center gap-3" style={{ background: "rgba(255,255,255,0.06)" }}>
            <span className="size-8 rounded-full grid place-items-center text-[12px] font-semibold" style={{ background: "var(--primary-bright)", color: "var(--emerald-deep)" }}>{initials}</span>
            <div className="leading-tight min-w-0">
              <div className="text-[13px] font-medium truncate">{userName}</div>
              <form action={signOutAction}><button type="submit" className="text-[10px] uppercase tracking-[0.16em] opacity-70 hover:opacity-100">{company} · sign out</button></form>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="h-16 shrink-0 px-8 flex items-center justify-between border-b" style={{ background: "var(--portal-header)", color: "var(--foreground)", borderColor: "var(--portal-line)" }}>
          <div className="flex items-baseline gap-3">
            <h1 className="text-[18px] font-semibold tracking-tight">Dashboard</h1>
            <span className="text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--cream-9)" }}>{company}</span>
          </div>
          <Link href="/vendor/executives" className="hidden md:flex items-center gap-2 h-9 px-3 rounded-full text-[12.5px]" style={{ background: "var(--cream-3)", color: "var(--cream-9)" }}>
            <Icon name="search" /><span>Find executives</span>
          </Link>
        </header>

        <main className="flex-1 px-8 py-7 w-full max-w-[1280px]">
          {/* Metrics ribbon */}
          <section className="rounded-2xl px-6 py-4 mb-5 grid grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-2" style={{ background: "var(--portal-ribbon)", color: "var(--primary-foreground)" }}>
            <RibbonGroup label="Credits">
              <RibbonStat value={String(ribbon.creditsAvailable)} unit="available" />
              <RibbonStat value={String(ribbon.creditsReserved)} unit="reserved" />
            </RibbonGroup>
            <RibbonGroup label="Meetings" divider>
              <RibbonStat value={String(ribbon.meetingsPending)} unit="pending" />
              <RibbonStat value={String(ribbon.meetingsHeld)} unit="held" />
            </RibbonGroup>
            <RibbonGroup label="To charity via you" divider>
              <RibbonStat value={ribbon.toCharity} unit="this year" big />
            </RibbonGroup>
            <RibbonGroup label="Your band" divider>
              <RibbonStat value={ribbon.bandLabel} unit={ribbon.bandRate} />
            </RibbonGroup>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8 space-y-5">
              {/* Executives for you */}
              <Widget title="Executives for you" link="View all" href="/vendor/executives">
                {execs.length === 0 ? (
                  <div className="px-5 py-6 text-[13px]" style={{ color: "var(--cream-9)" }}>No executives available yet.</div>
                ) : (
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
                      {execs.map((e) => (
                        <tr key={e.id} className="text-[13.5px]" style={{ borderTop: "1px solid var(--portal-line)" }}>
                          <td className="pl-5 pr-3 py-3.5 font-medium">{e.company}</td>
                          <td className="px-3 py-3.5" style={{ color: "var(--cream-9)" }}>{e.title}</td>
                          <td className="px-3 py-3.5">{e.charity}</td>
                          <td className="pr-5 pl-3 py-3.5 text-right">
                            {e.requested
                              ? <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ background: "var(--cream-3)", color: "var(--cream-9)" }}>Requested</span>
                              : <Link href={`/vendor/executives/${e.id}`} className="text-[12px] font-medium px-3 py-1.5 rounded-lg inline-block" style={{ background: "var(--portal-ink)", color: "#fff" }}>Request</Link>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Widget>

              {/* Your credits */}
              <Widget title="Your credits" link="Buy credits">
                <div className="px-5 py-5 flex flex-wrap items-center gap-x-10 gap-y-4">
                  <div>
                    <div className="text-[40px] font-semibold leading-none">{credits.available}</div>
                    <div className="text-[11px] uppercase tracking-[0.16em] mt-1" style={{ color: "var(--cream-9)" }}>credits available</div>
                  </div>
                  <div className="flex-1 min-w-[220px]">
                    <div className="flex items-baseline justify-between text-[12px] mb-1.5" style={{ color: "var(--cream-9)" }}>
                      <span>{credits.bandLabel} · {credits.bandRate} to charity / meeting</span>
                      <span>{credits.progressNote}</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--portal-amber-soft)" }}>
                      <div className="h-full rounded-full" style={{ width: `${credits.progressPercent}%`, background: "var(--portal-amber)" }} />
                    </div>
                    <div className="text-[11.5px] mt-2" style={{ color: "var(--cream-9)" }}>1 credit = 1 meeting = $1,500 AUD. The charity share rises as you meet more.</div>
                  </div>
                </div>
              </Widget>
            </div>

            <div className="lg:col-span-4 space-y-5">
              {/* Pending */}
              <Widget title="Pending" count={String(pending.length)} link="View all" href="/vendor/executives">
                {pending.length === 0 ? (
                  <div className="px-5 py-6 text-[13px]" style={{ color: "var(--cream-9)" }}>Nothing pending.</div>
                ) : (
                  <div>
                    {pending.map((p, i) => (
                      <div key={`${p.exec}-${i}`} className="px-5 py-3.5 flex items-center justify-between gap-3" style={{ borderTop: i === 0 ? "none" : "1px solid var(--portal-line)" }}>
                        <div className="min-w-0">
                          <div className="text-[13.5px] font-medium truncate">{p.exec}</div>
                          <div className="text-[11px] mt-0.5" style={{ color: "var(--cream-9)" }}>{p.state}</div>
                        </div>
                        <span className="text-[11.5px] shrink-0" style={{ color: "var(--cream-9)" }}>{p.age}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Widget>

              {/* Your impact */}
              <Widget title="Your impact" link="View giving">
                {gifts.length === 0 ? (
                  <div className="px-5 py-6 text-[13px]" style={{ color: "var(--cream-9)" }}>No gifts yet. Your first held meeting funds one.</div>
                ) : (
                  <div>
                    {gifts.map((g, i) => (
                      <div key={`${g.exec}-${i}`} className="px-5 py-3.5 flex items-center gap-3" style={{ borderTop: i === 0 ? "none" : "1px solid var(--portal-line)" }}>
                        <span className="size-7 rounded-full grid place-items-center shrink-0" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}><Icon name="heart" /></span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-medium truncate">{g.charity}</div>
                          <div className="text-[11px]" style={{ color: "var(--cream-9)" }}>after {g.exec}</div>
                        </div>
                        <span className="text-[13.5px] font-semibold shrink-0">{g.amount}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Widget>
            </div>
          </div>
        </main>
      </div>
    </div>
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
function Widget({ title, count, link, href, children }: { title: string; count?: string; link?: string; href?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border" style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)", boxShadow: "0 1px 2px rgba(20,40,30,0.04)" }}>
      <header className="px-5 py-3.5 flex items-center justify-between border-b" style={{ borderColor: "var(--portal-line)" }}>
        <div className="flex items-center gap-2">
          <h2 className="text-[14.5px] font-semibold tracking-tight">{title}</h2>
          {count && <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}>{count}</span>}
        </div>
        {link && (href
          ? <a href={href} className="text-[12px] font-medium" style={{ color: "var(--portal-amber-ink)" }}>{link} →</a>
          : <span className="text-[12px] font-medium" style={{ color: "var(--portal-amber-ink)" }}>{link} →</span>)}
      </header>
      {children}
    </section>
  );
}
