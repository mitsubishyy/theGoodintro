import type { Metadata } from "next";
import {
  Calendar,
  Check,
  ChevronRight,
  Forward,
  Heart,
  Mail,
  ShieldCheck,
  Sparkles,
  X,
  Phone,
} from "lucide-react";
import { Avatar } from "../_components/avatar";
import { IconLinkedIn } from "../../_components/icons";

export const metadata: Metadata = {
  title: "Email flow · theGoodintro mockup",
  robots: { index: false, follow: false },
};

export default function EmailMockup() {
  return (
    <main className="mx-auto max-w-5xl px-6 lg:px-10 py-12 md:py-16">
      <header className="max-w-2xl">
        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
          Primary surface
        </div>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-[-0.02em] leading-tight">
          Most of the executive's experience{" "}
          <span className="serif-italic">happens in email.</span>
        </h1>
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          Senior executives do not log in to a platform to check for meetings.
          They get an email when a vendor requests a meeting, accept or decline
          inside the email, and receive a one-click LinkedIn share after the
          meeting funds a charity. Onboarding happens on a five-minute phone
          call. The dashboard is a secondary view, mostly used by their EA.
        </p>
      </header>

      <div className="mt-14 space-y-16">
        <section>
          <SectionLabel>1 · Meeting request email</SectionLabel>
          <p className="mt-3 max-w-2xl text-[14px] text-muted-foreground leading-relaxed">
            Lands the moment a vetted vendor requests a meeting. Everything the
            executive needs to decide sits inside the email. Accept, Decline,
            or Forward to EA without leaving the inbox.
          </p>
          <div className="mt-6">
            <MeetingRequestEmail />
          </div>
        </section>

        <section>
          <SectionLabel>2 · LinkedIn share email (after the meeting)</SectionLabel>
          <p className="mt-3 max-w-2xl text-[14px] text-muted-foreground leading-relaxed">
            Once the meeting completes and the donation has settled, the
            executive receives this email. One click posts a pre-drafted
            LinkedIn update; this is the viral mechanic that recruits the next
            generation of executives and vendors.
          </p>
          <div className="mt-6">
            <LinkedInShareEmail />
          </div>
        </section>

        <section>
          <SectionLabel>3 · Onboarding call (no sign-up form)</SectionLabel>
          <p className="mt-3 max-w-2xl text-[14px] text-muted-foreground leading-relaxed">
            Issy or an onboarding lead calls each new executive for around five
            minutes. Everything below is captured on the call so the executive
            never has to fill in a form.
          </p>
          <div className="mt-6">
            <OnboardingCapture />
          </div>
        </section>
      </div>
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Meeting request email mockup
   ───────────────────────────────────────────────────────────────── */

function MeetingRequestEmail() {
  return (
    <EmailFrame
      from="theGoodintro <introductions@thegoodintro.com>"
      to="Jane Allen <jane.allen@hexagon.com.au>"
      cc="Emma Roy (EA) <emma.roy@hexagon.com.au>"
      subject="Lachlan Kim (CRO, Atlassian) wants 30 minutes"
      preview="Budget pacing tools for finance leaders at scale-ups. $1,000 will direct to Beyond Blue."
      received="Today, 10:42 am"
    >
      <p className="text-[15px] leading-relaxed">
        Hi Jane,
      </p>
      <p className="mt-3 text-[15px] leading-relaxed">
        <strong>Lachlan Kim</strong>, CRO at <strong>Atlassian</strong>, has
        requested 30 minutes with you. He has been verified and reviewed.
        Here&apos;s what you need to know.
      </p>

      {/* Vendor block */}
      <div
        className="mt-6 rounded-2xl border p-5"
        style={{
          background: "var(--cream-3)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-start gap-4">
          <Avatar name="Lachlan Kim" size={56} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[15px] font-semibold tracking-tight">
                Lachlan Kim
              </span>
              <span
                className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-[0.14em]"
                style={{
                  background: "var(--mint-tint)",
                  color: "var(--primary)",
                }}
              >
                <ShieldCheck className="size-2.5" />
                Verified
              </span>
            </div>
            <div className="mt-0.5 text-[12px] text-muted-foreground">
              CRO · Atlassian (ASX:TEAM)
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              ABN verified · Founder reviewed ·{" "}
              <a
                href="https://linkedin.com/in/lachlankim-atl"
                className="underline-offset-2 hover:underline"
                style={{ color: "var(--primary)" }}
              >
                linkedin.com/in/lachlankim-atl
              </a>
            </div>
          </div>
        </div>
      </div>

      <DetailLabel>What they want to discuss</DetailLabel>
      <p className="text-[14px] leading-relaxed">
        Atlassian&apos;s finance team rebuilt budget pacing and forecast
        accuracy from quarterly to weekly inside 9 months. He&apos;d like 30
        minutes to share the operating model and the three places it most
        often breaks in the first quarter.
      </p>

      <DetailLabel>Why you, specifically</DetailLabel>
      <p className="text-[14px] leading-relaxed">
        Hexagon&apos;s transition from product to platform over the last 18
        months has the same shape Atlassian&apos;s did two years ago. The
        pacing rebuild was their unlock during a similar phase. Two of your
        peers have suggested it would be worth a conversation.
      </p>

      {/* The donation strip */}
      <div
        className="mt-6 rounded-xl border p-4 flex items-start gap-3"
        style={{
          background: "color-mix(in oklab, var(--primary) 6%, var(--cream-3))",
          borderColor: "var(--primary)",
        }}
      >
        <Heart
          className="size-5 mt-0.5 shrink-0"
          style={{ color: "var(--primary)" }}
        />
        <div className="min-w-0">
          <div className="text-[13px] font-semibold">
            If you accept, <span className="serif-italic" style={{ color: "var(--primary)" }}>$1,000</span> directs to{" "}
            <strong>Beyond Blue</strong>
          </div>
          <div className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
            Your standing nomination. Reply{" "}
            <span className="font-mono">CHARITY</span> to pick a different
            DGR-endorsed charity for this meeting only.
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <EmailButton primary>
          <Check className="size-4" />
          Accept
        </EmailButton>
        <EmailButton>
          <X className="size-4" />
          Decline
        </EmailButton>
        <EmailButton>
          <Forward className="size-4" />
          Send to Emma (EA)
        </EmailButton>
      </div>

      <p className="mt-6 text-[12px] text-muted-foreground leading-relaxed">
        Accepting holds a 30-minute slot in your calendar in the next two
        weeks. We&apos;ll find a time that works for both of you and send
        invites automatically. If you decline, Lachlan is told politely and
        without your name attached to the reason.
      </p>

      <EmailFooter />
    </EmailFrame>
  );
}

/* ─────────────────────────────────────────────────────────────────
   LinkedIn share email mockup
   ───────────────────────────────────────────────────────────────── */

function LinkedInShareEmail() {
  return (
    <EmailFrame
      from="theGoodintro <impact@thegoodintro.com>"
      to="Jane Allen <jane.allen@hexagon.com.au>"
      subject="Your meeting funded $1,000 to Beyond Blue"
      preview="Beyond Blue confirmed receipt. Want to share this on LinkedIn?"
      received="Today, 4:11 pm"
    >
      <p className="text-[15px] leading-relaxed">
        Hi Jane,
      </p>
      <p className="mt-3 text-[15px] leading-relaxed">
        Your meeting with <strong>Lachlan Kim (Atlassian)</strong> today funded{" "}
        <span className="serif-italic" style={{ color: "var(--primary)" }}>$1,000</span>{" "}
        to <strong>Beyond Blue</strong>. The charity has confirmed receipt.
      </p>

      {/* Confirmation strip */}
      <div
        className="mt-5 rounded-xl border p-4 flex items-center gap-3"
        style={{
          background: "var(--mint-tint)",
          borderColor: "var(--primary)",
        }}
      >
        <div
          className="size-8 rounded-full grid place-items-center shrink-0"
          style={{
            background: "var(--primary)",
            color: "var(--primary-foreground)",
          }}
        >
          <Check className="size-4" />
        </div>
        <div className="min-w-0 text-[13px]">
          <div className="font-semibold">Beyond Blue receipted $1,000</div>
          <div className="text-muted-foreground text-[12px]">
            Lifetime total: $28,000 across 4 charities
          </div>
        </div>
      </div>

      <DetailLabel>Share the moment on LinkedIn</DetailLabel>
      <p className="text-[14px] leading-relaxed">
        We&apos;ve drafted a post you can publish in one click. Edit it first
        if you&apos;d like.
      </p>

      {/* LinkedIn post preview */}
      <LinkedInPostPreview />

      {/* CTAs */}
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

      <p className="mt-5 text-[12px] text-muted-foreground leading-relaxed">
        Posting connects to LinkedIn securely via OAuth. We never post on your
        behalf without your click. You can revoke access from your settings at
        any time.
      </p>

      <EmailFooter />
    </EmailFrame>
  );
}

function LinkedInPostPreview() {
  return (
    <div
      className="mt-4 rounded-2xl border overflow-hidden"
      style={{ background: "#fff", borderColor: "var(--border)" }}
    >
      <div
        className="px-4 py-3 flex items-center gap-3 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <Avatar name="Jane Allen" size={40} />
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold">Jane Allen</div>
          <div className="text-[11px] text-muted-foreground">
            CFO at Hexagon Bank · Now · Public
          </div>
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em]"
          style={{
            background: "color-mix(in oklab, #0a66c2 12%, #fff)",
            color: "#0a66c2",
          }}
        >
          <IconLinkedIn size={11} />
          Preview
        </span>
      </div>
      <div className="px-4 py-4 text-[13.5px] leading-relaxed" style={{ color: "#1f2937" }}>
        I spent 30 minutes today with Lachlan Kim from Atlassian. As a result,
        $1,000 has been directed to <strong>Beyond Blue</strong> for mental
        health support across Australia.
        <br />
        <br />
        I&apos;m taking meetings through{" "}
        <span style={{ color: "#0a66c2" }}>@theGoodintro</span>, an invite-only
        network that turns my time into funded outcomes for DGR-endorsed
        Australian charities. If you&apos;d like to direct your own
        conversations toward causes that matter, ping me.
      </div>
      <div
        className="px-4 py-2 flex items-center gap-4 border-t text-[11px] text-muted-foreground"
        style={{ borderColor: "var(--border)" }}
      >
        <span>👍 Like</span>
        <span>💬 Comment</span>
        <span>↗ Share</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Onboarding capture mockup
   ───────────────────────────────────────────────────────────────── */

function OnboardingCapture() {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div
        className="px-6 py-5 border-b flex items-center justify-between gap-4"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="size-10 rounded-full grid place-items-center"
            style={{
              background: "var(--mint-tint)",
              color: "var(--primary)",
            }}
          >
            <Phone className="size-4" />
          </div>
          <div>
            <div className="text-[14px] font-semibold tracking-tight">
              5-minute onboarding call
            </div>
            <div className="text-[12px] text-muted-foreground">
              Captured live by Issy or an onboarding lead. No form for the
              executive to fill in.
            </div>
          </div>
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em]"
          style={{
            background: "var(--mint-tint)",
            color: "var(--primary)",
          }}
        >
          <Check className="size-3" />
          One time
        </span>
      </div>

      <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
        <CaptureRow
          label="Identity"
          value="Jane Allen · CFO · Hexagon Bank (ASX:HEX)"
        />
        <CaptureRow
          label="Charity of choice"
          value="Beyond Blue · DGR Item 1 · auto-direct every meeting"
          subnote="Per-meeting override available by email."
        />
        <CaptureRow
          label="Calendar"
          value="Connected: jane.allen@hexagon.com.au (Google)"
          subnote="theGoodintro can hold 30-minute slots; calendar invites sent automatically."
        />
        <CaptureRow
          label="EA / delegate"
          value="Emma Roy · emma.roy@hexagon.com.au"
          subnote="Receives a CC on every meeting request. Can accept on Jane's behalf."
        />
        <CaptureRow
          label="LinkedIn"
          value="Connected: linkedin.com/in/jane-allen-cfo"
          subnote="One-click share enabled after each meeting."
        />
        <CaptureRow
          label="Preferences"
          value="Email-first · per-meeting choice prompt on for new charities"
          subnote="No SMS. No phone calls except for onboarding and incidents."
        />
      </ul>
    </div>
  );
}

function CaptureRow({
  label,
  value,
  subnote,
}: {
  label: string;
  value: string;
  subnote?: string;
}) {
  return (
    <li className="px-6 py-4 grid grid-cols-1 sm:grid-cols-12 gap-3">
      <div className="sm:col-span-3 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="sm:col-span-9">
        <div className="text-[14px] font-medium tracking-tight">{value}</div>
        {subnote && (
          <div className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
            {subnote}
          </div>
        )}
      </div>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Email chrome
   ───────────────────────────────────────────────────────────────── */

function EmailFrame({
  from,
  to,
  cc,
  subject,
  preview,
  received,
  children,
}: {
  from: string;
  to: string;
  cc?: string;
  subject: string;
  preview?: string;
  received: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border overflow-hidden shadow-sm"
      style={{ background: "#fff", borderColor: "var(--border)" }}
    >
      {/* Mail client toolbar */}
      <div
        className="px-5 py-2.5 flex items-center gap-2 border-b text-[11px] text-muted-foreground"
        style={{
          background: "var(--cream-3)",
          borderColor: "var(--border)",
        }}
      >
        <Mail className="size-3.5" />
        <span className="font-mono uppercase tracking-[0.14em]">
          Inbox · 1 of 412
        </span>
        <span className="ml-auto">{received}</span>
      </div>

      {/* Subject + headers */}
      <div
        className="px-6 py-5 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <h3 className="text-[18px] md:text-[20px] font-semibold tracking-tight">
          {subject}
        </h3>
        {preview && (
          <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">
            {preview}
          </p>
        )}

        <dl className="mt-4 grid grid-cols-[60px,1fr] sm:grid-cols-[80px,1fr] gap-y-1 text-[12px]">
          <dt className="text-muted-foreground">From</dt>
          <dd>{from}</dd>
          <dt className="text-muted-foreground">To</dt>
          <dd>{to}</dd>
          {cc && (
            <>
              <dt className="text-muted-foreground">Cc</dt>
              <dd>{cc}</dd>
            </>
          )}
        </dl>
      </div>

      {/* Body */}
      <div className="px-6 py-6" style={{ color: "var(--foreground)" }}>
        {children}
      </div>
    </div>
  );
}

function DetailLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 mb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </div>
  );
}

function EmailButton({
  children,
  primary,
  linkedIn,
}: {
  children: React.ReactNode;
  primary?: boolean;
  linkedIn?: boolean;
}) {
  const base =
    "w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[13px] font-medium transition-colors";
  if (linkedIn) {
    return (
      <button
        className={base}
        style={{
          background: "#0a66c2",
          color: "#fff",
        }}
      >
        {children}
      </button>
    );
  }
  if (primary) {
    return (
      <button
        className={base}
        style={{
          background: "var(--foreground)",
          color: "var(--background)",
        }}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      className={base + " hover:bg-accent"}
      style={{
        background: "transparent",
        color: "var(--foreground)",
        border: "1px solid var(--border-strong)",
      }}
    >
      {children}
    </button>
  );
}

function EmailFooter() {
  return (
    <div
      className="mt-8 pt-5 border-t flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-[11px] text-muted-foreground"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-2">
        <Calendar className="size-3.5" />
        <span>theGoodintro · invite-only · Australia</span>
      </div>
      <div className="flex items-center gap-3">
        <a
          href="/mockup/exec"
          className="hover:underline underline-offset-2 inline-flex items-center gap-1"
        >
          View in the app
          <ChevronRight className="size-3" />
        </a>
        <span>·</span>
        <a href="#" className="hover:underline underline-offset-2">
          Email preferences
        </a>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
      <span
        className="h-px w-6"
        style={{ background: "var(--border-strong)" }}
      />
      {children}
    </div>
  );
}
