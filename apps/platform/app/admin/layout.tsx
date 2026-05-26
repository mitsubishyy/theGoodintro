import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { signOutAction } from "@/app/login/actions";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/vendors", label: "Vendors" },
  { href: "/admin/executives", label: "Executives" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { staff } = await requireStaff();
  const enabled = await getFlag("admin_shell");

  if (!enabled) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-6 text-center"
        style={{ background: "var(--portal-page)", color: "var(--foreground)" }}
      >
        <div className="max-w-md">
          <p className="font-mono text-xs uppercase tracking-[0.18em]" style={{ color: "var(--portal-amber-ink)" }}>
            Feature flag off
          </p>
          <h1 className="mt-2 text-xl font-semibold">Admin shell is not enabled</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
            Turn on the <code>admin_shell</code> flag in <code>feature_flag</code> to
            view the cockpit. Every new surface ships behind a flag, off by default.
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--portal-page)", color: "var(--foreground)" }}>
      {/* Emerald sidebar — the one place emerald appears in the portal. */}
      <aside
        className="flex w-60 shrink-0 flex-col justify-between px-4 py-6"
        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
      >
        <div>
          <div className="px-2 text-base font-semibold tracking-tight">theGoodintro</div>
          <div className="mt-0.5 px-2 font-mono text-[10px] uppercase tracking-[0.18em] opacity-70">
            Admin cockpit
          </div>
          <nav className="mt-8 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-lg px-2 py-2 text-sm hover:bg-white/10"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="px-2 text-xs opacity-80">
          <div className="truncate">{staff.name}</div>
          <div className="mt-3 flex flex-col gap-2">
            <Link href="/account/security" className="underline-offset-2 hover:underline">
              Security
            </Link>
            <form action={signOutAction}>
              <button type="submit" className="underline-offset-2 hover:underline">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
