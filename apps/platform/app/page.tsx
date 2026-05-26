import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "theGoodintro — Platform",
  robots: { index: false, follow: false },
};

/* Step 0 placeholder index. The three carried mockups (admin / vendor / exec)
   are the visual starting point for the real portals built in later pillars. */
const PORTALS = [
  {
    href: "/admin",
    label: "Admin portal",
    desc: "Issy's internal cockpit — vetting, requests, scheduling, money.",
  },
  {
    href: "/vendor",
    label: "Vendor portal",
    desc: "Paying vendor workspace — executive list, requests, credits.",
  },
  {
    href: "/exec",
    label: "Executive view",
    desc: "Email-first surface for senior leaders and their EAs.",
  },
];

export default function PlatformHome() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center gap-10 px-6 py-16"
      style={{ background: "var(--portal-page)", color: "var(--foreground)" }}
    >
      <header className="text-center">
        <p
          className="font-mono text-xs uppercase tracking-[0.18em]"
          style={{ color: "var(--portal-amber-ink)" }}
        >
          Demo · no login needed
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          theGoodintro platform
        </h1>
        <p className="mt-2 max-w-md text-sm" style={{ color: "var(--muted-foreground)" }}>
          Pick a portal to explore. Each opens straight in with a synthetic demo
          account on staging data — no sign-in required.
        </p>
      </header>

      <nav className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {PORTALS.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="group rounded-xl border p-5 transition-colors"
            style={{
              background: "var(--portal-card)",
              borderColor: "var(--portal-line)",
            }}
          >
            <span className="block text-base font-semibold">{p.label}</span>
            <span
              className="mt-1 block text-sm"
              style={{ color: "var(--muted-foreground)" }}
            >
              {p.desc}
            </span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
