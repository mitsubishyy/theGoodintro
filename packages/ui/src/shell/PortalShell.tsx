import type { ReactNode } from "react";

/**
 * The frame: composes the sidebar, the topbar above the content, and the page
 * slot. Caller passes pre-configured <PortalSidebar>, <PortalTopbar>, and
 * <PortalPage> (or any node) so server pages keep their data-fetching at the top.
 * Presentational; server-friendly.
 *
 * Layout: full-screen flex row at md+, single column on mobile (the sidebar
 * collapses to a top hamburger in the next pass).
 */

export interface PortalShellProps {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
}

export function PortalShell({ sidebar, topbar, children }: PortalShellProps) {
  return (
    <div className="min-h-screen flex" style={{ background: "var(--portal-page)" }}>
      {sidebar}
      <div className="flex-1 min-w-0 flex flex-col">
        {topbar}
        {children}
      </div>
    </div>
  );
}
