import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth";
import { Button, Widget } from "@thegoodintro/ui";
import { DistributionsErrorDemo } from "./RetryDemo";

/**
 * Kit reference — the Component States band that the Admin Dashboard 2026-06-09
 * lock kept "in the mockup composition, NOT in production /admin". Per the
 * README + the build-chat Open Decision, the band moves here so the kit's
 * empty / loading / error variants stay documented without polluting Issy's
 * daily cockpit. Staff-only and noindex so production can't accidentally
 * serve it to anyone outside the team.
 */

export const metadata: Metadata = {
  title: "Component states — TheGoodIntro kit reference",
  robots: { index: false, follow: false },
};

export default async function ComponentStatesReference() {
  await requireStaff();
  return (
    <main className="min-h-screen px-8 py-10" style={{ background: "var(--portal-page)", color: "var(--foreground)" }}>
      <div className="max-w-5xl">
        <p className="text-[11px] font-mono uppercase tracking-[0.18em]" style={{ color: "var(--portal-amber-ink)" }}>
          Kit reference
        </p>
        <h1 className="mt-2 text-[24px] font-semibold tracking-tight" style={{ color: "var(--portal-ink)" }}>
          Widget component states
        </h1>
        <p className="mt-2 text-[13px] max-w-prose" style={{ color: "var(--muted-foreground)" }}>
          Empty, loading, and error variants of the <code>Widget</code> kit primitive — the same shells the Admin Dashboard composes. Lifted out of <code>/admin</code> per the
          Admin Dashboard 2026-06-09 lock so the production cockpit stays focused.
        </p>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Widget
            title="Needs action"
            state="empty"
            emptyText="All clear."
            emptyAction={
              <Button variant="ghost" size="sm" href="/admin/meetings">
                View completed
              </Button>
            }
            link={{ label: "See all", href: "/admin/meetings" }}
          />

          <Widget
            title="Pending requests"
            state="loading"
            link={{ label: "All", href: "/admin/requests" }}
          />

          <DistributionsErrorDemo />

          <Widget
            title="Booked meetings"
            state="empty"
            emptyText="No meetings yet."
            emptyAction={
              <Button variant="primary" size="sm" href="/admin/meetings/new">
                + New meeting
              </Button>
            }
            link={{ label: "See all", href: "/admin/meetings" }}
          />

          <Widget
            title="Recent onboards"
            state="loading"
            link={{ label: "All", href: "/admin/vendors" }}
          />
        </div>
      </div>
    </main>
  );
}
