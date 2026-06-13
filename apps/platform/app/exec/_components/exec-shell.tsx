"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Icon, Wordmark, type IconName } from "@thegoodintro/ui";
import { signOutAction } from "@/app/login/actions";

/**
 * The canonical exec portal shell (exec-dashboard lock 2026-06-08 — "locks the
 * entire exec portal shell"). Every exec portal screen wraps its content in
 * this: 240px charcoal-ink sidebar (NOT emerald/teal) with the 5-item nav,
 * photo-primary account block, and italic "Sign out"; a 56px topbar carrying
 * only the page title (right edge stays content-empty — no bell, no help, no
 * date; the universal search is parked behind a flag, ratified OFF until the
 * command palette exists); warm-cream page.
 *
 * Built from kit primitives (Wordmark, Icon, Avatar) rather than the shared
 * PortalSidebar so the exec-specific anatomy (emerald active rule, photo
 * account + title-company subtitle, italic sign-out) lands without touching
 * the admin/vendor sidebars.
 */

const NAV: { label: string; href: string; icon: IconName }[] = [
  { label: "Home", href: "/exec", icon: "grid" },
  { label: "Meetings", href: "/exec/meetings", icon: "calendar" },
  { label: "Impact", href: "/exec/impact", icon: "gift" },
  { label: "My charity", href: "/exec/my-charity", icon: "heart" },
  { label: "Profile", href: "/exec/profile", icon: "user" },
];

export interface ExecShellProps {
  title: string;
  exec: {
    name: string;
    title: string | null;
    company: string | null;
    email: string;
    photoUrl?: string | null;
  };
  children: React.ReactNode;
}

function navActive(pathname: string, href: string): boolean {
  return href === "/exec" ? pathname === "/exec" : pathname.startsWith(href);
}

export function ExecShell({ title, exec, children }: ExecShellProps) {
  const pathname = usePathname() ?? "/exec";
  const subtitle = [exec.title, exec.company].filter(Boolean).join(" · ");

  return (
    <div className="min-h-screen flex" style={{ background: "var(--portal-page)", color: "var(--portal-ink)" }}>
      <aside
        className="w-60 shrink-0 hidden md:flex flex-col justify-between"
        style={{ background: "var(--exec-sidebar)" }}
      >
        <div>
          <div className="px-5 h-16 flex items-center">
            <Wordmark size={16} surface="dark" />
          </div>
          <nav className="px-3 py-4 space-y-1">
            {NAV.map((item) => {
              const active = navActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 h-11 px-3 rounded-lg text-[14px]"
                  style={
                    active
                      ? {
                          background: "var(--exec-sidebar-active)",
                          color: "var(--exec-sidebar-text)",
                          fontWeight: 600,
                          boxShadow: "inset 3px 0 0 0 var(--portal-emerald)",
                        }
                      : { color: "var(--exec-sidebar-muted)" }
                  }
                >
                  <Icon name={item.icon} size={18} />
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-4 pb-5">
          <div className="flex items-center gap-3">
            <Avatar name={exec.name} src={exec.photoUrl ?? undefined} size={32} />
            <div className="leading-tight min-w-0">
              <div className="text-[13px] font-semibold truncate" style={{ color: "var(--exec-sidebar-text)" }}>
                {exec.name}
              </div>
              {subtitle && (
                <div className="text-[11px] truncate" style={{ color: "var(--exec-sidebar-muted)" }}>
                  {subtitle}
                </div>
              )}
            </div>
          </div>
          <form action={signOutAction} className="mt-2.5 pl-[44px]">
            <button
              type="submit"
              className="text-[12px] italic hover:underline underline-offset-2"
              style={{ color: "var(--exec-sidebar-muted)" }}
            >
              Sign out →
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header
          className="h-14 shrink-0 px-8 flex items-center border-b"
          style={{ background: "var(--portal-header)", borderColor: "var(--portal-line)" }}
        >
          <span className="text-[14px] font-semibold" style={{ color: "var(--portal-ink)" }}>
            {title}
          </span>
          {/* Right edge stays content-empty per the lock. Universal search is
              parked behind a feature flag (ratified OFF) until the command
              palette overlay exists. */}
        </header>
        <main className="flex-1 min-w-0 px-8 py-8">
          <div className="w-full max-w-[1080px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
