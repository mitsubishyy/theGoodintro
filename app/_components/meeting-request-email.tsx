import {
  Calendar,
  Check,
  ChevronRight,
  Forward,
  Heart,
  Mail,
  ShieldCheck,
  X,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────
   Meeting request email — the concrete example of a qualified vendor
   request as it lands in an executive's inbox. Shared between the
   internal /mockup/email surface (which passes the DiceBear cartoon
   avatar + the in-app footer link) and the public /executives page
   (which uses an initials monogram and hides the internal link, so it
   honours the marketing-site "no human characters" rule).
   ───────────────────────────────────────────────────────────────── */

export function MeetingRequestEmail({
  vendorAvatar,
  showAppLink = false,
  showAddressHeaders = true,
}: {
  /** Render-prop for the vendor avatar. Defaults to an initials monogram
   *  (brand-safe for the marketing site). The mockup passes a DiceBear
   *  cartoon avatar. */
  vendorAvatar?: React.ReactNode;
  /** Show the "View in the app" link in the footer (mockup only). */
  showAppLink?: boolean;
  /** Show the From/To/Cc address rows. Off on the marketing site, where
   *  the mail-client chrome is noise. */
  showAddressHeaders?: boolean;
}) {
  return (
    <EmailFrame
      from="TheGoodIntro <introductions@thegoodintro.com>"
      to="Jane Allen <jane.allen@hexagon.com.au>"
      cc="Emma Roy (EA) <emma.roy@hexagon.com.au>"
      subject="Lachlan Smith (Acme) wants 45 minutes"
      preview="Budget pacing tools for finance leaders at scale-ups. $1,000 will direct to headspace."
      received="Today, 10:42 am"
      showHeaders={showAddressHeaders}
    >
      <p className="text-[15px] leading-relaxed">Hi Jane,</p>
      <p className="mt-3 text-[15px] leading-relaxed">
        <strong>Lachlan Smith</strong>, CRO at <strong>Acme</strong>, has
        requested 45 minutes with you. He has been verified and reviewed.
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
          {vendorAvatar ?? <InitialsAvatar name="Lachlan Smith" size={56} />}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[15px] font-semibold tracking-tight">
                Lachlan Smith
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
              CRO · Acme
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              ABN verified · Founder reviewed ·{" "}
              <a
                href="https://linkedin.com/in/lachlansmith-acme"
                className="underline-offset-2 hover:underline"
                style={{ color: "var(--primary)" }}
              >
                linkedin.com/in/lachlansmith-acme
              </a>
            </div>
          </div>
        </div>
      </div>

      <DetailLabel>What they want to discuss</DetailLabel>
      <p className="text-[14px] leading-relaxed">
        Acme helps finance teams move budget pacing and forecast accuracy from
        quarterly to weekly. Lachlan would like 45 minutes to walk through the
        operating model behind it and the three places it most often breaks in
        the first quarter.
      </p>

      <DetailLabel>Why you, specifically</DetailLabel>
      <p className="text-[14px] leading-relaxed">
        Your move from product to platform over the last 18 months is the exact
        phase where pacing tends to break, and where Acme has helped similar
        finance teams most. Two of your peers suggested the conversation would
        be worth your time.
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
            If you accept,{" "}
            <span className="serif-italic" style={{ color: "var(--primary)" }}>
              $1,000
            </span>{" "}
            directs to <strong>headspace</strong>
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
        Accepting holds a 45-minute slot in your calendar in the next two weeks.
        We&apos;ll find a time that works for both of you and send invites
        automatically. If you decline, Lachlan is told politely and without your
        name attached to the reason.
      </p>

      <EmailFooter showAppLink={showAppLink} />
    </EmailFrame>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Initials monogram — brand-safe avatar (no human character) used on
   the marketing site in place of the platform's DiceBear cartoon.
   ───────────────────────────────────────────────────────────────── */

function InitialsAvatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className="inline-grid place-items-center shrink-0 font-semibold tracking-tight"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--mint-tint)",
        color: "var(--primary)",
        fontSize: size * 0.34,
        boxShadow: "0 0 0 1px var(--border)",
      }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Email chrome — shared by the mockup's three email surfaces and the
   marketing-site embed.
   ───────────────────────────────────────────────────────────────── */

export function EmailFrame({
  from,
  to,
  cc,
  subject,
  preview,
  received,
  showHeaders = true,
  children,
}: {
  from: string;
  to: string;
  cc?: string;
  subject: string;
  preview?: string;
  received: string;
  showHeaders?: boolean;
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
      <div className="px-6 py-5 border-b" style={{ borderColor: "var(--border)" }}>
        <h3 className="text-[18px] md:text-[20px] font-semibold tracking-tight">
          {subject}
        </h3>
        {preview && (
          <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">
            {preview}
          </p>
        )}

        {showHeaders && (
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
        )}
      </div>

      {/* Body */}
      <div className="px-6 py-6" style={{ color: "var(--foreground)" }}>
        {children}
      </div>
    </div>
  );
}

export function DetailLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 mb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </div>
  );
}

export function EmailButton({
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

export function EmailFooter({ showAppLink = true }: { showAppLink?: boolean }) {
  return (
    <div
      className="mt-8 pt-5 border-t flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-[11px] text-muted-foreground"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-2">
        <Calendar className="size-3.5" />
        <span>TheGoodIntro · invite-only · Australia</span>
      </div>
      <div className="flex items-center gap-3">
        {showAppLink && (
          <>
            <a
              href="/mockup/exec"
              className="hover:underline underline-offset-2 inline-flex items-center gap-1"
            >
              View in the app
              <ChevronRight className="size-3" />
            </a>
            <span>·</span>
          </>
        )}
        <a href="#" className="hover:underline underline-offset-2">
          Email preferences
        </a>
      </div>
    </div>
  );
}
