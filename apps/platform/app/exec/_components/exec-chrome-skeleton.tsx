import { Skeleton } from "@thegoodintro/ui";

/**
 * Loading skeleton shaped like the exec portal shell (exec-shell.tsx), so a
 * client-side navigation shows the charcoal sidebar silhouette + a content
 * skeleton instead of blanking the chrome (BLUEPRINT §0 — "loading uses real
 * skeletons, not spinners"). Presentational only (no directive) so both the
 * server `loading.tsx` files and any client surface can render it.
 *
 * Mirrors the shell's structure 1:1 (w-60 charcoal aside, h-14 topbar, the
 * max-w-[1080px] content column) so the silhouette lines up with the real shell
 * it briefly replaces.
 */

/** Light placeholder bar for the dark sidebar (ink-on-cream skeletons read as
 *  invisible on charcoal, so the sidebar uses a white wash instead). */
function SidebarBar({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <span
      className={`block rounded animate-pulse ${className}`}
      style={{ background: "color-mix(in oklch, white 14%, transparent)", ...style }}
      aria-hidden="true"
    />
  );
}

export function ExecChromeSkeleton({ title, children }: { title?: string; children?: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--portal-page)", color: "var(--portal-ink)" }}
      aria-busy="true"
    >
      <aside className="w-60 shrink-0 hidden md:flex flex-col justify-between" style={{ background: "var(--exec-sidebar)" }}>
        <div>
          <div className="px-5 h-16 flex items-center">
            <SidebarBar className="h-4 w-28" />
          </div>
          <nav className="px-3 py-4 space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 h-11 px-3">
                <SidebarBar className="size-[18px] rounded-full" />
                <SidebarBar className="h-3 flex-1" style={{ maxWidth: 96 - i * 6 }} />
              </div>
            ))}
          </nav>
        </div>
        <div className="px-4 pb-5">
          <div className="flex items-center gap-3">
            <SidebarBar className="size-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <SidebarBar className="h-3 w-24" />
              <SidebarBar className="h-2.5 w-16" />
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header
          className="h-14 shrink-0 px-4 md:px-8 flex items-center border-b"
          style={{ background: "var(--portal-header)", borderColor: "var(--portal-line)" }}
        >
          {title ? (
            <span className="text-[14px] font-semibold" style={{ color: "var(--portal-ink)" }}>
              {title}
            </span>
          ) : (
            <span className="block h-3.5 w-32 rounded animate-pulse" style={{ background: "color-mix(in oklch, var(--portal-ink) 10%, transparent)" }} aria-hidden="true" />
          )}
        </header>
        <main className="flex-1 min-w-0 px-4 md:px-8 py-8">
          <div className="w-full max-w-[1080px]">
            {children ?? (
              <>
                {/* Editorial greeting placeholder + a calm card grid. */}
                <div className="h-8 w-1/3 rounded animate-pulse" style={{ background: "color-mix(in oklch, var(--portal-ink) 10%, transparent)" }} aria-hidden="true" />
                <div className="mt-3 h-3.5 w-2/5 rounded animate-pulse" style={{ background: "color-mix(in oklch, var(--portal-ink) 8%, transparent)" }} aria-hidden="true" />
                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  <Skeleton variant="card" lines={4} />
                  <Skeleton variant="card" lines={4} />
                </div>
                <div className="mt-5">
                  <Skeleton variant="card" lines={3} />
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
