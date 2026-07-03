import { Building2, CalendarCheck, Check, Heart } from "lucide-react";
import { DetailLabel } from "./meeting-request-email";

/* ─────────────────────────────────────────────────────────────────
   Meeting confirmed card — the vendor's-POV counterpart to the
   executive's MeetingRequestEmail. It shows the payoff: a senior
   leader accepted, the meeting is booked, and a real gift is locked
   in. Reuses the email mock's frame chrome (toolbar bar, header,
   body padding, the emerald gift strip) so it reads as the same
   product.

   The executive is shown by role only, with no name, following the
   marketing-site illustrative-placeholder rule (no real customers).
   ───────────────────────────────────────────────────────────────── */

export function MeetingConfirmedCard() {
  return (
    <div
      className="rounded-2xl border overflow-hidden shadow-sm"
      style={{ background: "#fff", borderColor: "var(--border)" }}
    >
      {/* Product chrome bar */}
      <div
        className="px-5 py-2.5 flex items-center gap-2 border-b text-[11px] text-muted-foreground"
        style={{ background: "var(--cream-3)", borderColor: "var(--border)" }}
      >
        <CalendarCheck className="size-3.5" />
        <span className="font-mono uppercase tracking-[0.14em]">
          TheGoodIntro · Confirmation
        </span>
        <span className="ml-auto">Just now</span>
      </div>

      {/* Header: title + status chip */}
      <div className="px-6 py-5 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-[18px] md:text-[20px] font-semibold tracking-tight">
            Meeting confirmed
          </h3>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.14em]"
            style={{ background: "var(--mint-tint)", color: "var(--primary)" }}
          >
            <Check className="size-3" />
            Accepted
          </span>
        </div>
        <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">
          A senior leader accepted your request. The slot is booked.
        </p>
      </div>

      {/* Body */}
      <div className="px-6 py-6" style={{ color: "var(--foreground)" }}>
        {/* Who accepted — role only, no name */}
        <div
          className="rounded-2xl border p-5"
          style={{ background: "var(--cream-3)", borderColor: "var(--border)" }}
        >
          <div className="flex items-start gap-4">
            <span
              className="inline-grid place-items-center shrink-0"
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "var(--mint-tint)",
                color: "var(--primary)",
                boxShadow: "0 0 0 1px var(--border)",
              }}
              aria-hidden
            >
              <Building2 className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold tracking-tight">
                CFO · ASX-listed industrials
              </div>
              <div className="mt-0.5 text-[12px] text-muted-foreground">
                Vetted senior leader
              </div>
            </div>
          </div>
        </div>

        {/* When */}
        <DetailLabel>When</DetailLabel>
        <div className="flex items-start gap-2 text-[14px] leading-relaxed">
          <CalendarCheck
            className="size-4 mt-0.5 shrink-0"
            style={{ color: "var(--primary)" }}
          />
          <span>Thursday 18 June · 2:30 pm AEST · 45 minutes</span>
        </div>

        {/* The stated reason, quoted back */}
        <DetailLabel>Your stated reason, accepted</DetailLabel>
        <blockquote
          className="rounded-xl border-l-2 px-4 py-3 text-[14px] leading-relaxed italic"
          style={{ background: "var(--cream-3)", borderColor: "var(--primary)" }}
        >
          &ldquo;We help finance teams move budget pacing and forecast accuracy
          from quarterly to weekly. I would like 45 minutes to walk through the
          operating model and the three places it most often breaks in the first
          quarter.&rdquo;
        </blockquote>

        {/* The gift */}
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
              <span className="serif-italic" style={{ color: "var(--primary)" }}>
                $900
              </span>{" "}
              to their chosen charity
            </div>
            <div className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
              Confirmed in writing once the meeting is held.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
