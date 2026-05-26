import { requireStaff } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { Sidebar } from "./_components/sidebar";
import { TopBar } from "./_components/topbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { staff, supabase } = await requireStaff();
  const enabled = await getFlag("admin_shell");

  if (!enabled) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center" style={{ background: "var(--portal-page)", color: "var(--foreground)" }}>
        <div className="max-w-md">
          <p className="font-mono text-xs uppercase tracking-[0.18em]" style={{ color: "var(--portal-amber-ink)" }}>Feature flag off</p>
          <h1 className="mt-2 text-xl font-semibold">Admin shell is not enabled</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
            Turn on the <code>admin_shell</code> flag in <code>feature_flag</code> to view the cockpit.
          </p>
        </div>
      </main>
    );
  }

  const [{ count: reqCount }, { count: propCount }] = await Promise.all([
    supabase.from("request").select("id", { count: "exact", head: true }).eq("status", "submitted"),
    supabase.from("meeting").select("id", { count: "exact", head: true }).eq("status", "proposed"),
  ]);
  const pending = (reqCount ?? 0) + (propCount ?? 0);
  const month = new Intl.DateTimeFormat("en-AU", { month: "long", year: "numeric", timeZone: "Australia/Sydney" }).format(new Date());

  return (
    <div className="min-h-screen flex font-sans" style={{ background: "var(--portal-page)", color: "var(--foreground)" }}>
      <Sidebar staffName={staff.name} pendingBadge={pending} />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar month={month} />
        <main className="flex-1 px-8 py-7 w-full max-w-[1280px]">{children}</main>
      </div>
    </div>
  );
}
