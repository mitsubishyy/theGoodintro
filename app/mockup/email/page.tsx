import type { Metadata } from "next";
import { Check, Sparkles, Phone } from "lucide-react";
import { Avatar } from "../_components/avatar";
import { IconLinkedIn } from "../../_components/icons";
import {
  MeetingRequestEmail,
  EmailFrame,
  DetailLabel,
  EmailButton,
  EmailFooter,
} from "../../_components/meeting-request-email";

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
            <MeetingRequestEmail
              /* Seed stays "Lachlan Kim" to keep the same approved face;
                 the displayed name is the fake "Lachlan Smith". */
              vendorAvatar={<Avatar name="Lachlan Kim" size={56} />}
              showAppLink
            />
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
        Your meeting with <strong>Lachlan Smith (Acme)</strong> today funded{" "}
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
        I spent 45 minutes today with Lachlan Smith from Acme. As a result,
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
          subnote="theGoodintro can hold 45-minute slots; calendar invites sent automatically."
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
