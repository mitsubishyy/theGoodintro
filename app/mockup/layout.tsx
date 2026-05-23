import type { Metadata } from "next";
import { UserAvatar } from "./_components/avatar";

export const metadata: Metadata = {
  title: "Mockup preview · theGoodintro",
  description: "Internal mockup preview. Not the live product.",
  robots: { index: false, follow: false },
};

export default function MockupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ background: "var(--cream-3)" }}>
      <MockupBanner />
      <AppTopBar />
      {children}
    </div>
  );
}

function MockupBanner() {
  return (
    <div
      className="w-full border-b"
      style={{
        background:
          "color-mix(in oklab, var(--primary) 8%, var(--cream-3))",
        borderColor: "var(--border)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.18em]">
          <span
            className="size-1.5 rounded-full pulse-dot"
            style={{ background: "var(--primary)" }}
          />
          <span style={{ color: "var(--primary)" }}>Mockup preview</span>
          <span className="text-muted-foreground hidden sm:inline">
            Static UI sketch · not the live product
          </span>
        </div>
        <a
          href="/"
          className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to site
        </a>
      </div>
    </div>
  );
}

function AppTopBar() {
  return (
    <header
      className="border-b sticky top-0 z-10 backdrop-blur-sm"
      style={{
        background:
          "color-mix(in oklab, var(--cream-3) 80%, transparent)",
        borderColor: "var(--border)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-14 flex items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <a href="/mockup/email" className="flex items-center gap-2">
            <span className="size-7 rounded-full grid place-items-center" style={{ background: "var(--primary)" }}>
              <span className="text-[11px] font-semibold" style={{ color: "var(--primary-foreground)" }}>tG</span>
            </span>
            <span className="text-sm font-semibold tracking-tight">
              theGoodintro
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-1 text-[13px]">
            <MockupNavLink href="/mockup/email" label="Email flow" sub="primary" />
            <MockupNavLink href="/mockup/exec" label="Dashboard" sub="secondary" />
            <MockupNavLink href="/mockup/rsvp" label="Cold RSVP" sub="outreach" />
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[13px] font-medium">Jane Allen</span>
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">CFO · Hexagon Bank</span>
          </div>
          <UserAvatar name="Jane Allen" size={36} />
        </div>
      </div>
    </header>
  );
}

function MockupNavLink({
  href,
  label,
  sub,
}: {
  href: string;
  label: string;
  sub: string;
}) {
  return (
    <a
      href={href}
      className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors inline-flex items-baseline gap-2"
    >
      <span className="font-medium">{label}</span>
      <span className="text-[9px] font-mono uppercase tracking-[0.18em] opacity-70">
        {sub}
      </span>
    </a>
  );
}
