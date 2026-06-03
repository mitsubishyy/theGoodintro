import type { Metadata } from "next";
import { ArrowRight, Check, Heart, Mail, X } from "lucide-react";

export const metadata: Metadata = {
  title: "Cold RSVP flow · TheGoodIntro mockup",
  robots: { index: false, follow: false },
};

// Static preview of the one-click cold-outreach RSVP. Three pieces:
//   1. the cold email with the two button-links
//   2. the "Yes" landing page
//   3. the "No" landing page
// The live versions are app/r/page.tsx + rsvp-client.tsx; this page needs no
// token, so it's safe to review without any setup.

export default function RsvpMockup() {
  return (
    <main className="mx-auto max-w-5xl px-6 lg:px-10 py-12 md:py-16">
      <header className="max-w-2xl">
        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
          Outreach · separate from the public site
        </div>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-[-0.02em] leading-tight">
          One tap in a cold email,{" "}
          <span className="serif-italic">and you&apos;ve got your answer.</span>
        </h1>
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          You send a normal cold email from Gmail. The two buttons are personal,
          signed links. The executive taps one, lands on a branded page that
          records their response to your private sheet, and you get the signal.
          No login, no form, nothing for them to fill in.
        </p>
      </header>

      <div className="mt-14 space-y-16">
        <section>
          <SectionLabel>1 · The cold email</SectionLabel>
          <p className="mt-3 max-w-2xl text-[14px] text-muted-foreground leading-relaxed">
            Sent through your Gmail mail-merge. The buttons are just styled
            links carrying a signed token, so they work in every inbox.
          </p>
          <div className="mt-6">
            <ColdEmail />
          </div>
        </section>

        <section>
          <SectionLabel>2 · After tapping &ldquo;Yes&rdquo;</SectionLabel>
          <p className="mt-3 max-w-2xl text-[14px] text-muted-foreground leading-relaxed">
            Lands here instantly. The response is already recorded; this is the
            confirmation. They can undo if they misclicked.
          </p>
          <div className="mt-6">
            <LandingFrame>
              <YesCard />
            </LandingFrame>
          </div>
        </section>

        <section>
          <SectionLabel>3 · After tapping &ldquo;Not for me&rdquo;</SectionLabel>
          <p className="mt-3 max-w-2xl text-[14px] text-muted-foreground leading-relaxed">
            A graceful no. Logged the same way, so you know not to follow up.
          </p>
          <div className="mt-6">
            <LandingFrame>
              <NoCard />
            </LandingFrame>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ── 1. The cold email ─────────────────────────────────────────── */

function ColdEmail() {
  return (
    <div
      className="rounded-2xl border overflow-hidden shadow-sm"
      style={{ background: "#fff", borderColor: "var(--border)" }}
    >
      <div
        className="px-5 py-2.5 flex items-center gap-2 border-b text-[11px] text-muted-foreground"
        style={{ background: "var(--cream-3)", borderColor: "var(--border)" }}
      >
        <Mail className="size-3.5" />
        <span className="font-mono uppercase tracking-[0.14em]">Inbox</span>
        <span className="ml-auto">Today, 9:14 am</span>
      </div>

      <div className="px-6 py-5 border-b" style={{ borderColor: "var(--border)" }}>
        <h3 className="text-[18px] md:text-[20px] font-semibold tracking-tight">
          A meeting that funds a charity you choose
        </h3>
        <dl className="mt-4 grid grid-cols-[60px,1fr] sm:grid-cols-[80px,1fr] gap-y-1 text-[12px]">
          <dt className="text-muted-foreground">From</dt>
          <dd>Issy Hardwick &lt;issy@thegoodintros.com&gt;</dd>
          <dt className="text-muted-foreground">To</dt>
          <dd>Jane Allen &lt;jane.allen@hexagon.com.au&gt;</dd>
        </dl>
      </div>

      <div className="px-6 py-6" style={{ color: "var(--foreground)" }}>
        <p className="text-[15px] leading-relaxed">Hi Jane,</p>
        <p className="mt-3 text-[15px] leading-relaxed">
          I&apos;m building TheGoodIntro: an invite-only network where senior
          leaders take a handful of genuinely relevant meetings, and every
          meeting sends <strong>$1,000</strong> to a charity they choose.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed">
          I&apos;d love you to be one of the first executives. No platform to
          learn, no forms. If you&apos;re open to it, I&apos;ll call for five
          minutes to set you up. Are you in?
        </p>

        {/* The two button-links */}
        <div className="mt-6 flex flex-wrap gap-3">
          <span
            className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-[14px] font-semibold"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            <Check className="size-4" />
            Yes, I&apos;m interested
          </span>
          <span
            className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-[14px] font-semibold"
            style={{
              background: "#fff",
              color: "var(--foreground)",
              border: "1px solid var(--border-strong)",
            }}
          >
            Not for me
          </span>
        </div>

        <p className="mt-5 text-[13px] leading-relaxed">
          One tap is all it takes, and that&apos;s the whole idea. Accepting is
          exactly as easy as the giving will be: every meeting you take sends{" "}
          <strong>$1,000</strong> to a charity you choose.
        </p>

        <div
          className="mt-6 pt-5 border-t text-[13px] leading-relaxed"
          style={{ borderColor: "var(--border)" }}
        >
          <p>Warmly,</p>
          <p className="mt-1 font-medium">Issy Hardwick · Founder, TheGoodIntro</p>
        </div>
      </div>
    </div>
  );
}

/* ── Browser chrome around the landing pages ───────────────────── */

function LandingFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border overflow-hidden shadow-sm"
      style={{ borderColor: "var(--border)" }}
    >
      <div
        className="px-4 py-2.5 flex items-center gap-2 border-b"
        style={{ background: "var(--cream-3)", borderColor: "var(--border)" }}
      >
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full" style={{ background: "#e6dfd2" }} />
          <span className="size-2.5 rounded-full" style={{ background: "#e6dfd2" }} />
          <span className="size-2.5 rounded-full" style={{ background: "#e6dfd2" }} />
        </span>
        <span className="ml-3 text-[11px] font-mono text-muted-foreground truncate">
          thegoodintro.vercel.app/r
        </span>
      </div>
      <div
        className="px-6 py-12 flex justify-center"
        style={{ background: "var(--background)" }}
      >
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

/* ── 2 & 3. The confirmation cards (mirror rsvp-client.tsx) ─────── */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border p-8 shadow-sm"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      {children}
    </div>
  );
}

function YesCard() {
  return (
    <Card>
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em]"
        style={{ background: "var(--mint-tint)", color: "var(--primary)" }}
      >
        <Check className="size-3.5" />
        Noted
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] leading-tight">
        Wonderful, Jane.
      </h1>
      <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed">
        That&apos;s all I needed. I&apos;ll be in touch shortly with the next
        step, a quick five-minute call to set you up, nothing to fill in.
      </p>
      <div
        className="mt-6 flex items-start gap-3 rounded-xl border p-4"
        style={{
          background: "color-mix(in oklab, var(--primary) 6%, transparent)",
          borderColor: "var(--primary)",
        }}
      >
        <Heart className="size-5 shrink-0 mt-0.5" style={{ color: "var(--primary)" }} />
        <div>
          <p className="text-[13px] font-semibold leading-relaxed">
            Notice how easy that was? Giving is just as effortless.
          </p>
          <p className="mt-1 text-[13px] leading-relaxed">
            Every meeting you take through TheGoodIntro sends{" "}
            <span className="serif-italic" style={{ color: "var(--primary)" }}>
              $1,000
            </span>{" "}
            to a charity you choose. The same single tap, no forms, nothing to
            set up.
          </p>
        </div>
      </div>
      <SiteCta>Want to learn more while you wait? Take a look around our site</SiteCta>
      <p className="mt-4 text-[13px] text-muted-foreground underline underline-offset-2">
        Actually, not right now
      </p>
    </Card>
  );
}

function NoCard() {
  return (
    <Card>
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em]"
        style={{ background: "var(--cream-3)", color: "var(--muted-foreground)" }}
      >
        <X className="size-3.5" />
        Noted
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] leading-tight">
        No problem, Jane.
      </h1>
      <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed">
        Thanks for letting me know. I won&apos;t follow up. If the timing
        changes down the track, the door stays open.
      </p>
      <SiteCta>Curious to know more? You&apos;re welcome to look around our site</SiteCta>
      <p className="mt-4 text-[13px] text-muted-foreground underline underline-offset-2">
        Wait, I&apos;m interested after all
      </p>
    </Card>
  );
}

function SiteCta({ children }: { children: React.ReactNode }) {
  return (
    <a
      href="/"
      className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium hover:underline underline-offset-2"
      style={{ color: "var(--primary)" }}
    >
      {children}
      <ArrowRight className="size-4" />
    </a>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
      <span className="h-px w-6" style={{ background: "var(--border-strong)" }} />
      {children}
    </div>
  );
}
