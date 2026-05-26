"use client";

import { usePathname } from "next/navigation";
import { Icon } from "./icons";

const TITLES: { prefix: string; title: string }[] = [
  { prefix: "/admin/vendors", title: "Vendors" },
  { prefix: "/admin/executives", title: "Executives" },
  { prefix: "/admin/meetings", title: "Meetings" },
  { prefix: "/admin/giving", title: "Giving" },
  { prefix: "/admin/charities", title: "Charities" },
  { prefix: "/admin", title: "Dashboard" },
];

export function TopBar({ month }: { month: string }) {
  const pathname = usePathname();
  const title = TITLES.find((t) => pathname.startsWith(t.prefix))?.title ?? "Dashboard";

  return (
    <header className="h-16 shrink-0 px-8 flex items-center justify-between border-b" style={{ background: "var(--portal-header)", color: "var(--foreground)", borderColor: "var(--portal-line)" }}>
      <div className="flex items-baseline gap-3">
        <h1 className="text-[18px] font-semibold tracking-tight">{title}</h1>
        <span className="text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--cream-9)" }}>{month}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 h-9 px-3 rounded-full text-[12.5px]" style={{ background: "var(--cream-3)", color: "var(--cream-9)" }}>
          <Icon name="search" /><span>Search vendors, execs, meetings</span>
        </div>
        <div className="relative size-9 rounded-full grid place-items-center" style={{ background: "var(--cream-3)", color: "var(--cream-10)" }}>
          <Icon name="bell" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-md" style={{ background: "var(--cream-3)", color: "var(--cream-9)" }}>Staging</span>
      </div>
    </header>
  );
}
