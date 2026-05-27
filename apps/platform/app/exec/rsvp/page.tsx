import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Heart, Mail, X, ChevronLeft } from "lucide-react";
import { getFlag } from "@/lib/flags";

export const metadata: Metadata = {
  title: "Cold RSVP flow · TheGoodIntro",
  robots: { index: false, follow: false },
};

/* Cold-outreach RSVP — ported component-for-component from the committed mockup
   (apps/web/app/mockup/rsvp/page.tsx) into the platform, re-toned to --portal-*.
   Design reference (static), flag-gated. Cold-outreach copy uses "a real gift"
   rather than a figure (RSVP_SETUP.md / marketing voice): the per-meeting charity
   share is tiered $900 to $1,200 by band, so a flat number would misstate it. */

export default async function ExecRsvpReference() {
  if (!(await getFlag("exec_dashboard"))) return <FlagOff />;
  return (
    <main className="mx-auto max-w-5xl px-6 lg:px-10 py-12 md:py-16" style={{ background: "var(--portal-page)", minHeight: "100vh" }}>
      <Link href="/exec" className="inline-flex items-center gap-1.5 text-[12px] font-medium mb-8" style={{ color: "var(--portal-amber-ink)" }}>
        <ChevronLeft className="size-3.5" />
        Back to dashboard
      </Link>

      <header className="max-w-2xl">
        <div className="text-[10px] font-mono uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>Outreach · separate from the public site</div>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-[-0.02em] leading-tight">
          One tap in a cold email, <span className="font-display italic">and you&apos;ve got your answer.</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          You send a normal cold email from Gmail. The two buttons are personal, signed links. The executive taps one, lands on a branded page that records their response to your private sheet, and you get the signal. No login, no form, nothing for them to fill in.
        </p>
      </header>

      <div className="mt-14 space-y-16">
        <section>
          <SectionLabel>1 · The cold email</SectionLabel>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Sent through your Gmail mail-merge. The buttons are just styled links carrying a signed token, so they work in every inbox.
          </p>
          <div className="mt-6"><ColdEmail /></div>
        </section>

        <section>
          <SectionLabel>2 · After tapping &ldquo;Yes&rdquo;</SectionLabel>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Lands here instantly. The response is already recorded; this is the confirmation. They can undo if they misclicked.
          </p>
          <div className="mt-6"><LandingFrame><YesCard /></LandingFrame></div>
        </section>

        <section>
          <SectionLabel>3 · After tapping &ldquo;Not for me&rdquo;</SectionLabel>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            A graceful no. Logged the same way, so you know not to follow up.
          </p>
          <div className="mt-6"><LandingFrame><NoCard /></LandingFrame></div>
        </section>
      </div>
    </main>
  );
}

function ColdEmail() {
  return (
    <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ background: "#fff", borderColor: "var(--portal-line)" }}>
      <div className="px-5 py-2.5 flex items-center gap-2 border-b text-[11px]" style={{ background: "var(--accent)", borderColor: "var(--portal-line)", color: "var(--muted-foreground)" }}>
        <Mail className="size-3.5" />
        <span className="font-mono uppercase tracking-[0.14em]">Inbox</span>
        <span className="ml-auto">Today, 9:14 am</span>
      </div>

      <div className="px-6 py-5 border-b" style={{ borderColor: "var(--portal-line)" }}>
        <h3 className="text-[18px] md:text-[20px] font-semibold tracking-tight">A meeting that funds a charity you choose</h3>
        <dl className="mt-4 grid grid-cols-[60px,1fr] sm:grid-cols-[80px,1fr] gap-y-1 text-[12px]">
          <dt style={{ color: "var(--muted-foreground)" }}>From</dt>
          <dd>Issy Hardwick &lt;issy@thegoodintros.com&gt;</dd>
          <dt style={{ color: "var(--muted-foreground)" }}>To</dt>
          <dd>Jane Allen &lt;jane.allen@hexagon.com.au&gt;</dd>
        </dl>
      </div>

      <div className="px-6 py-6" style={{ color: "var(--foreground)" }}>
        <p className="text-[15px] leading-relaxed">Hi Jane,</p>
        <p className="mt-3 text-[15px] leading-relaxed">
          I&apos;m building TheGoodIntro: an invite-only network where senior leaders take a handful of genuinely relevant meetings, and every meeting sends <strong>a real gift</strong> to a charity they choose.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed">
          I&apos;d love you to be one of the first executives. No platform to learn, no forms. If you&apos;re open to it, I&apos;ll call for five minutes to set you up. Are you in?
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <span className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-[14px] font-semibold" style={{ background: "var(--portal-ink)", color: "#fff" }}>
            <Check className="size-4" />
            Yes, I&apos;m interested
          </span>
          <span className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-[14px] font-semibold" style={{ background: "#fff", color: "var(--foreground)", border: "1px solid var(--border-strong)" }}>
            Not for me
          </span>
        </div>

        <p className="mt-5 text-[13px] leading-relaxed">
          One tap is all it takes, and that&apos;s the whole idea. Accepting is exactly as easy as the giving will be: every meeting you take sends <strong>a real gift</strong> to a charity you choose.
        </p>

        <div className="mt-6 pt-5 border-t text-[13px] leading-relaxed" style={{ borderColor: "var(--portal-line)" }}>
          <p>Warmly,</p>
          <p className="mt-1 font-medium">Issy Hardwick · Founder, TheGoodIntro</p>
        </div>
      </div>
    </div>
  );
}

function LandingFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: "var(--portal-line)" }}>
      <div className="px-4 py-2.5 flex items-center gap-2 border-b" style={{ background: "var(--accent)", borderColor: "var(--portal-line)" }}>
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full" style={{ background: "var(--border-strong)" }} />
          <span className="size-2.5 rounded-full" style={{ background: "var(--border-strong)" }} />
          <span className="size-2.5 rounded-full" style={{ background: "var(--border-strong)" }} />
        </span>
        <span className="ml-3 text-[11px] font-mono truncate" style={{ color: "var(--muted-foreground)" }}>thegoodintro.com/r</span>
      </div>
      <div className="px-6 py-12 flex justify-center" style={{ background: "var(--portal-page)" }}>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border p-8 shadow-sm" style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}>{children}</div>;
}

function YesCard() {
  return (
    <Card>
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em]" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}>
        <Check className="size-3.5" />
        Noted
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] leading-tight">Wonderful, Jane.</h1>
      <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
        That&apos;s all I needed. I&apos;ll be in touch shortly with the next step, a quick five-minute call to set you up, nothing to fill in.
      </p>
      <div className="mt-6 flex items-start gap-3 rounded-xl border p-4" style={{ background: "color-mix(in oklab, var(--portal-amber) 8%, transparent)", borderColor: "var(--portal-amber)" }}>
        <Heart className="size-5 shrink-0 mt-0.5" style={{ color: "var(--portal-amber-ink)" }} />
        <div>
          <p className="text-[13px] font-semibold leading-relaxed">Notice how easy that was? Giving is just as effortless.</p>
          <p className="mt-1 text-[13px] leading-relaxed">
            Every meeting you take through TheGoodIntro sends <span className="font-display italic" style={{ color: "var(--portal-amber-ink)" }}>a real gift</span> to a charity you choose. The same single tap, no forms, nothing to set up.
          </p>
        </div>
      </div>
      <SiteCta>Want to learn more while you wait? Take a look around our site</SiteCta>
      <p className="mt-4 text-[13px] underline underline-offset-2" style={{ color: "var(--muted-foreground)" }}>Actually, not right now</p>
    </Card>
  );
}

function NoCard() {
  return (
    <Card>
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em]" style={{ background: "var(--accent)", color: "var(--muted-foreground)" }}>
        <X className="size-3.5" />
        Noted
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] leading-tight">No problem, Jane.</h1>
      <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
        Thanks for letting me know, I won&apos;t follow up. If the timing changes down the track, the door stays open.
      </p>
      <SiteCta>Curious to know more? You&apos;re welcome to look around our site</SiteCta>
      <p className="mt-4 text-[13px] underline underline-offset-2" style={{ color: "var(--muted-foreground)" }}>Wait, I&apos;m interested after all</p>
    </Card>
  );
}

function SiteCta({ children }: { children: React.ReactNode }) {
  return (
    <span className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium hover:underline underline-offset-2" style={{ color: "var(--portal-amber-ink)" }}>
      {children}
      <ArrowRight className="size-4" />
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
      <span className="h-px w-6" style={{ background: "var(--border-strong)" }} />
      {children}
    </div>
  );
}

function FlagOff() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-center" style={{ background: "var(--portal-page)", color: "var(--foreground)" }}>
      <div className="max-w-md">
        <p className="font-mono text-xs uppercase tracking-[0.18em]" style={{ color: "var(--portal-amber-ink)" }}>Feature flag off</p>
        <h1 className="mt-2 text-xl font-semibold">Executive surfaces are not enabled</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>Turn on the <code>exec_dashboard</code> flag to view this reference.</p>
      </div>
    </main>
  );
}
