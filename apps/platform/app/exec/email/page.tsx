import type { Metadata } from "next";
import Link from "next/link";
import { Check, Sparkles, Phone, ChevronLeft } from "lucide-react";
import { getFlag } from "@/lib/flags";
import { Avatar } from "../_components/avatar";
import { IconLinkedIn } from "../_components/linkedin-icon";
import {
  MeetingRequestEmail,
  EmailFrame,
  DetailLabel,
  EmailButton,
  EmailFooter,
} from "../_components/meeting-request-email";

export const metadata: Metadata = {
  title: "Email flow · TheGoodIntro",
  robots: { index: false, follow: false },
};

/* The executive's PRIMARY surface: email. Ported component-for-component from
   the committed mockup (apps/web/app/mockup/email/page.tsx) into the platform,
   re-toned to the --portal-* palette. Design reference (static) — flag-gated
   (exec_dashboard) and reached from the dashboard's "See the email flow" link.
   The sample shows a band-1 meeting ($900 charity share); the share rises by
   band to $1,200, computed per meeting (pricing page is the source of truth). */

export default async function ExecEmailReference() {
  if (!(await getFlag("exec_dashboard"))) return <FlagOff />;
  return (
    <main className="mx-auto max-w-5xl px-6 lg:px-10 py-12 md:py-16" style={{ background: "var(--portal-page)", minHeight: "100vh" }}>
      <Link href="/exec" className="inline-flex items-center gap-1.5 text-[12px] font-medium mb-8" style={{ color: "var(--portal-amber-ink)" }}>
        <ChevronLeft className="size-3.5" />
        Back to dashboard
      </Link>

      <header className="max-w-2xl">
        <div className="text-[10px] font-mono uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>Primary surface</div>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-[-0.02em] leading-tight">
          Most of the executive&apos;s experience <span className="font-display italic">happens in email.</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          Senior executives do not log in to a platform to check for meetings. They get an email when a vendor requests a meeting, accept or decline inside the email, and receive a one-click LinkedIn share after the meeting funds a charity. Onboarding happens on a five-minute phone call. The dashboard is a secondary view, mostly used by their EA.
        </p>
      </header>

      <div className="mt-14 space-y-16">
        <section>
          <SectionLabel>1 · Meeting request email</SectionLabel>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Lands the moment a vetted vendor requests a meeting. Everything the executive needs to decide sits inside the email. Accept, Decline, or Forward to EA without leaving the inbox.
          </p>
          <div className="mt-6">
            <MeetingRequestEmail vendorAvatar={<Avatar name="Lachlan Kim" size={56} />} showAppLink />
          </div>
        </section>

        <section>
          <SectionLabel>2 · LinkedIn share email (after the meeting)</SectionLabel>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Once the meeting completes and the donation has settled, the executive receives this email. One click posts a pre-drafted LinkedIn update; this is the viral mechanic that recruits the next generation of executives and vendors.
          </p>
          <div className="mt-6">
            <LinkedInShareEmail />
          </div>
        </section>

        <section>
          <SectionLabel>3 · Onboarding call (no sign-up form)</SectionLabel>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Issy or an onboarding lead calls each new executive for around five minutes. Everything below is captured on the call so the executive never has to fill in a form.
          </p>
          <div className="mt-6">
            <OnboardingCapture />
          </div>
        </section>
      </div>
    </main>
  );
}

function LinkedInShareEmail() {
  return (
    <EmailFrame
      from="TheGoodIntro <impact@thegoodintro.com>"
      to="Jane Allen <jane.allen@hexagon.com.au>"
      subject="Your meeting funded $900 to Beyond Blue"
      preview="Beyond Blue confirmed receipt. Want to share this on LinkedIn?"
      received="Today, 4:11 pm"
    >
      <p className="text-[15px] leading-relaxed">Hi Jane,</p>
      <p className="mt-3 text-[15px] leading-relaxed">
        Your meeting with <strong>Lachlan Smith (Acme)</strong> today funded <span className="font-display italic" style={{ color: "var(--portal-amber-ink)" }}>$900</span> to <strong>Beyond Blue</strong>. The charity has confirmed receipt.
      </p>

      {/* Confirmation strip */}
      <div className="mt-5 rounded-xl border p-4 flex items-center gap-3" style={{ background: "var(--portal-amber-soft)", borderColor: "var(--portal-amber)" }}>
        <div className="size-8 rounded-full grid place-items-center shrink-0" style={{ background: "var(--portal-amber)", color: "#fff" }}>
          <Check className="size-4" />
        </div>
        <div className="min-w-0 text-[13px]">
          <div className="font-semibold">Beyond Blue receipted $900</div>
          <div className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>Lifetime total: $8,100 across 4 charities</div>
        </div>
      </div>

      <DetailLabel>Share the moment on LinkedIn</DetailLabel>
      <p className="text-[14px] leading-relaxed">We&apos;ve drafted a post you can publish in one click. Edit it first if you&apos;d like.</p>

      <LinkedInPostPreview />

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <EmailButton primary linkedIn>
          <IconLinkedIn size={14} />
          Post to LinkedIn
        </EmailButton>
        <EmailButton>
          <Sparkles className="size-4" />
          Edit before posting
        </EmailButton>
        <EmailButton>Not this time</EmailButton>
      </div>

      <p className="mt-5 text-[12px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
        Posting connects to LinkedIn securely via OAuth. We never post on your behalf without your click. You can revoke access from your settings at any time.
      </p>

      <EmailFooter />
    </EmailFrame>
  );
}

function LinkedInPostPreview() {
  return (
    <div className="mt-4 rounded-2xl border overflow-hidden" style={{ background: "#fff", borderColor: "var(--portal-line)" }}>
      <div className="px-4 py-3 flex items-center gap-3 border-b" style={{ borderColor: "var(--portal-line)" }}>
        <Avatar name="Jane Allen" size={40} />
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold">Jane Allen</div>
          <div className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>CFO at Hexagon Bank · Now · Public</div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em]" style={{ background: "color-mix(in oklab, #0a66c2 12%, #fff)", color: "#0a66c2" }}>
          <IconLinkedIn size={11} />
          Preview
        </span>
      </div>
      <div className="px-4 py-4 text-[13.5px] leading-relaxed" style={{ color: "#1f2937" }}>
        I spent 45 minutes today with Lachlan Smith from Acme. As a result, $900 has been directed to <strong>Beyond Blue</strong> for mental health support across Australia.
        <br />
        <br />
        I&apos;m taking meetings through <span style={{ color: "#0a66c2" }}>@TheGoodIntro</span>, an invite-only network that turns my time into funded outcomes for DGR-endorsed Australian charities. If you&apos;d like to direct your own conversations toward causes that matter, ping me.
      </div>
      <div className="px-4 py-2 flex items-center gap-4 border-t text-[11px]" style={{ borderColor: "var(--portal-line)", color: "var(--muted-foreground)" }}>
        <span>Like</span>
        <span>Comment</span>
        <span>Share</span>
      </div>
    </div>
  );
}

function OnboardingCapture() {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}>
      <div className="px-6 py-5 border-b flex items-center justify-between gap-4" style={{ borderColor: "var(--portal-line)" }}>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full grid place-items-center" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}>
            <Phone className="size-4" />
          </div>
          <div>
            <div className="text-[14px] font-semibold tracking-tight">5-minute onboarding call</div>
            <div className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>Captured live by Issy or an onboarding lead. No form for the executive to fill in.</div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em]" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}>
          <Check className="size-3" />
          One time
        </span>
      </div>

      <ul className="divide-y" style={{ borderColor: "var(--portal-line)" }}>
        <CaptureRow label="Identity" value="Jane Allen · CFO · Hexagon Bank (ASX:HEX)" />
        <CaptureRow label="Charity of choice" value="Beyond Blue · DGR Item 1 · auto-direct every meeting" subnote="Per-meeting override available by email." />
        <CaptureRow label="Calendar" value="Connected: jane.allen@hexagon.com.au (Google)" subnote="TheGoodIntro can hold 45-minute slots; calendar invites sent automatically." />
        <CaptureRow label="EA / delegate" value="Emma Roy · emma.roy@hexagon.com.au" subnote="Receives a CC on every meeting request. Can accept on Jane's behalf." />
        <CaptureRow label="LinkedIn" value="Connected: linkedin.com/in/jane-allen-cfo" subnote="One-click share enabled after each meeting." />
        <CaptureRow label="Preferences" value="Email-first · per-meeting choice prompt on for new charities" subnote="No SMS. No phone calls except for onboarding and incidents." />
      </ul>
    </div>
  );
}

function CaptureRow({ label, value, subnote }: { label: string; value: string; subnote?: string }) {
  return (
    <li className="px-6 py-4 grid grid-cols-1 sm:grid-cols-12 gap-3">
      <div className="sm:col-span-3 text-[10px] font-mono uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>{label}</div>
      <div className="sm:col-span-9">
        <div className="text-[14px] font-medium tracking-tight">{value}</div>
        {subnote && <div className="mt-1 text-[12px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{subnote}</div>}
      </div>
    </li>
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
