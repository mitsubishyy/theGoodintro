"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Avatar, Icon, Wordmark, type IconName } from "@thegoodintro/ui";
import { signOutAction } from "@/app/login/actions";
import { useEaMode } from "./ea-mode";

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
 *
 * Responsive (BLUEPRINT density rules — "the sidebar collapses to a top
 * hamburger; no screen may be desktop-only"): below md the persistent sidebar
 * is hidden and a hamburger in the topbar opens it as a left slide-over drawer.
 * The `data-exec-portal` marker scopes the emerald keyboard focus ring defined
 * in globals.css to this shell.
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

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="px-3 py-4 space-y-1">
      {NAV.map((item) => {
        const active = navActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
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
  );
}

function AccountBlock({ chip }: { chip: { name: string; subtitle: string; photoUrl: string | null } }) {
  return (
    <div className="px-4 pb-5">
      <div className="flex items-center gap-3">
        <Avatar name={chip.name} src={chip.photoUrl ?? undefined} size={32} />
        <div className="leading-tight min-w-0">
          <div className="text-[13px] font-semibold truncate" style={{ color: "var(--exec-sidebar-text)" }}>
            {chip.name}
          </div>
          {chip.subtitle && (
            <div className="text-[11px] truncate" style={{ color: "var(--exec-sidebar-muted)" }}>
              {chip.subtitle}
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
  );
}

export function ExecShell({ title, exec, children }: ExecShellProps) {
  const pathname = usePathname() ?? "/exec";
  const eaMode = useEaMode();
  // In an EA session the chip shows the SIGNED-IN EA (the principal lives in the
  // banner); never the principal in both. Otherwise the exec themself.
  const chip = eaMode
    ? { name: eaMode.ea.name, subtitle: "Executive Assistant", photoUrl: null }
    : { name: exec.name, subtitle: [exec.title, exec.company].filter(Boolean).join(" · "), photoUrl: exec.photoUrl ?? null };
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div data-exec-portal className="min-h-screen flex" style={{ background: "var(--portal-page)", color: "var(--portal-ink)" }}>
      {/* Desktop sidebar (md and up). */}
      <aside className="w-60 shrink-0 hidden md:flex flex-col justify-between" style={{ background: "var(--exec-sidebar)" }}>
        <div>
          <div className="px-5 h-16 flex items-center">
            <Wordmark size={16} surface="dark" />
          </div>
          <NavLinks pathname={pathname} />
        </div>
        <AccountBlock chip={chip} />
      </aside>

      {/* Mobile slide-over drawer (below md). Same charcoal sidebar content. */}
      {navOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40"
            style={{ background: "color-mix(in oklch, var(--portal-ink) 40%, transparent)" }}
            onClick={() => setNavOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col justify-between"
            style={{ background: "var(--exec-sidebar)" }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
          >
            <div>
              <div className="px-5 h-16 flex items-center justify-between">
                <Wordmark size={16} surface="dark" />
                <button
                  type="button"
                  onClick={() => setNavOpen(false)}
                  aria-label="Close navigation"
                  className="p-1 rounded"
                  style={{ color: "var(--exec-sidebar-muted)" }}
                >
                  <Icon name="x" size={20} />
                </button>
              </div>
              <NavLinks pathname={pathname} onNavigate={() => setNavOpen(false)} />
            </div>
            <AccountBlock chip={chip} />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header
          className="h-14 shrink-0 px-4 md:px-8 flex items-center gap-3 border-b"
          style={{ background: "var(--portal-header)", borderColor: "var(--portal-line)" }}
        >
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Open navigation"
            className="md:hidden -ml-1 p-1.5 rounded"
            style={{ color: "var(--portal-ink)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <span className="text-[14px] font-semibold" style={{ color: "var(--portal-ink)" }}>
            {title}
          </span>
          {/* Right edge stays content-empty per the lock. Universal search is
              parked behind a feature flag (ratified OFF) until the command
              palette overlay exists. */}
        </header>
        <main className="flex-1 min-w-0 px-4 md:px-8 py-8">
          <div className="w-full max-w-[1080px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
