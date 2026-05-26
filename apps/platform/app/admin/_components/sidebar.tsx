"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";
import { signOutAction } from "@/app/login/actions";

const NAV = [
  { label: "Dashboard", icon: "grid", href: "/admin" },
  { label: "Vendors", icon: "box", href: "/admin/vendors" },
  { label: "Executives", icon: "user", href: "/admin/executives" },
  { label: "Meetings", icon: "calendar", href: "/admin/meetings", badged: true },
  { label: "Giving", icon: "heart", href: "/admin/giving" },
  { label: "Charities", icon: "gift", href: "/admin/charities" },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function Sidebar({ staffName, pendingBadge }: { staffName: string; pendingBadge: number }) {
  const pathname = usePathname();
  const initials = staffName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "TG";

  return (
    <aside className="w-60 shrink-0 flex flex-col justify-between" style={{ background: "var(--emerald-deep)", color: "var(--primary-foreground)" }}>
      <div>
        <div className="px-5 h-16 flex items-center gap-2 border-b" style={{ borderColor: "rgba(255,255,255,0.10)" }}>
          <span className="size-7 rounded-full grid place-items-center text-[11px] font-semibold" style={{ background: "var(--primary-bright)", color: "var(--emerald-deep)" }}>tG</span>
          <span className="text-[15px] font-semibold tracking-tight">the<span style={{ color: "var(--primary-bright)" }}>Good</span>intro</span>
        </div>
        <nav className="px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const badge = item.badged && pendingBadge > 0 ? String(pendingBadge) : undefined;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13.5px]"
                style={active ? { background: "var(--primary-bright)", color: "var(--emerald-deep)", fontWeight: 600 } : { color: "rgba(255,255,255,0.82)" }}
              >
                <Icon name={item.icon} />
                <span className="flex-1">{item.label}</span>
                {badge && (
                  <span
                    className="text-[10px] font-semibold size-4 grid place-items-center rounded-full"
                    style={active ? { background: "var(--emerald-deep)", color: "var(--primary-bright)" } : { background: "var(--portal-amber)", color: "#fff" }}
                  >
                    {badge}
                  </span>
                )}
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
            <div className="text-[13px] font-medium truncate">{staffName}</div>
            <form action={signOutAction}>
              <button type="submit" className="text-[10px] uppercase tracking-[0.16em] opacity-70 hover:opacity-100">Sign out</button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
