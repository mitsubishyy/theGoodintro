"use client";

import { useState, useMemo } from "react";
import {
  Check,
  Search,
  ChevronRight,
  ShieldCheck,
  X,
  Repeat2,
  Plus,
  Minus,
  Building2,
  MessageSquareQuote,
  Sparkles,
} from "lucide-react";
import { Avatar, UserAvatar } from "../_components/avatar";
import { IconLinkedIn } from "../../_components/icons";

/* ─────────────────────────────────────────────────────────────────
   Sample data. All charities are real DGR-endorsed AU orgs. ABNs
   are real (verifiable on abr.business.gov.au).
   ───────────────────────────────────────────────────────────────── */

type Charity = {
  id: string;
  name: string;
  abn: string;
  cause: string;
  blurb: string;
};

const CHARITIES: Charity[] = [
  {
    id: "beyond-blue",
    name: "Beyond Blue",
    abn: "87 093 865 840",
    cause: "Mental health & wellbeing",
    blurb: "Australia's most trusted mental health support service.",
  },
  {
    id: "ozharvest",
    name: "OzHarvest",
    abn: "46 219 931 433",
    cause: "Food rescue & relief",
    blurb: "Rescues surplus food and delivers it to people in need.",
  },
  {
    id: "rfds",
    name: "Royal Flying Doctor Service",
    abn: "74 438 059 643",
    cause: "Remote health services",
    blurb: "Emergency and primary healthcare for remote Australia.",
  },
  {
    id: "smith-family",
    name: "The Smith Family",
    abn: "28 000 030 179",
    cause: "Education & young people",
    blurb: "Long-term educational support for disadvantaged children.",
  },
  {
    id: "black-dog",
    name: "Black Dog Institute",
    abn: "12 115 954 197",
    cause: "Mental health research",
    blurb: "Research and care for mood disorders and suicide prevention.",
  },
  {
    id: "red-cross",
    name: "Australian Red Cross",
    abn: "50 169 561 394",
    cause: "Community & crisis relief",
    blurb: "Humanitarian aid, blood services, and disaster response.",
  },
  {
    id: "cancer-council",
    name: "Cancer Council Australia",
    abn: "91 130 793 725",
    cause: "Cancer research & support",
    blurb: "Funds research, prevention, and support for people with cancer.",
  },
  {
    id: "acf",
    name: "Australian Conservation Foundation",
    abn: "22 007 498 482",
    cause: "Environment & climate",
    blurb: "Australia's national environment organisation.",
  },
];

type MeetingRequest = {
  id: string;
  vendorName: string;
  vendorRole: string;
  vendorCompany: string;
  topic: string;
  proposed: string;
  pitch: string;
  why: string;
  companyBlurb: string;
  linkedin: string;
  verified: { abn: boolean; founder: boolean };
};

const INCOMING: MeetingRequest[] = [
  {
    id: "m-001",
    vendorName: "Lachlan Kim",
    vendorRole: "CRO",
    vendorCompany: "Atlassian",
    topic: "Budget pacing tools for finance leaders at scale-ups",
    proposed: "Tue 28 May · 30 min",
    pitch:
      "Atlassian's finance team rebuilt budget pacing and forecast accuracy from quarterly to weekly inside 9 months. I'd like 30 minutes to share the operating model we landed on and the three places it most often breaks in the first quarter.",
    why:
      "Hexagon's transition from product to platform over the last 18 months has the same shape ours had two years ago. The pacing rebuild was the unlock for us during a similar phase, and I've been told by two of your peers that it'd be worth a conversation.",
    companyBlurb:
      "Atlassian (ASX:TEAM, NASDAQ:TEAM) · collaboration software · A$6.1B revenue FY25 · ~13,000 staff · Sydney HQ.",
    linkedin: "linkedin.com/in/lachlankim-atl",
    verified: { abn: true, founder: true },
  },
  {
    id: "m-002",
    vendorName: "Sarah Liang",
    vendorRole: "Head of Partnerships",
    vendorCompany: "Canva",
    topic: "Design operations for finance and legal teams",
    proposed: "Thu 30 May · 30 min",
    pitch:
      "Canva's design ops team works with the finance and legal functions at most of the ASX 100. I want to share how we structure those engagements end-to-end, and the two patterns that consistently kill momentum in the first 90 days.",
    why:
      "Hexagon's customer-experience overhaul is something we hear about a lot from peers. The brand-and-ops lessons we picked up during IPO prep map closely to what your team is navigating now, in case any of it is useful.",
    companyBlurb:
      "Canva · private · ~190M monthly active users · design platform · Sydney HQ · founded 2013.",
    linkedin: "linkedin.com/in/sarahliang",
    verified: { abn: true, founder: true },
  },
];

type CompletedDonation = {
  date: string;
  vendor: string;
  charity: string;
  charityId: string;
  status: "confirmed" | "pending";
};

const RECENT_DONATIONS: CompletedDonation[] = [
  { date: "18 May", vendor: "Daniel Cho · Notion",    charity: "Beyond Blue",   charityId: "beyond-blue",  status: "confirmed" },
  { date: "11 May", vendor: "Priya Mehta · Linear",   charity: "OzHarvest",     charityId: "ozharvest",    status: "confirmed" },
  { date: "4 May",  vendor: "Tom Reilly · Figma",     charity: "Black Dog Institute", charityId: "black-dog", status: "confirmed" },
  { date: "27 Apr", vendor: "Anika Patel · Vercel",   charity: "Beyond Blue",   charityId: "beyond-blue",  status: "confirmed" },
  { date: "20 Apr", vendor: "Sam West · Ramp",        charity: "The Smith Family", charityId: "smith-family", status: "pending" },
  { date: "13 Apr", vendor: "Maya Chen · Stripe",     charity: "Royal Flying Doctor Service", charityId: "rfds", status: "confirmed" },
];

/* ─────────────────────────────────────────────────────────────────
   The page
   ───────────────────────────────────────────────────────────────── */

export default function ExecDashboard() {
  const [defaultCharityId, setDefaultCharityId] = useState<string>("beyond-blue");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerContext, setPickerContext] = useState<
    { kind: "default" } | { kind: "meeting"; meetingId: string }
  >({ kind: "default" });
  const [meetingOverrides, setMeetingOverrides] = useState<Record<string, string>>({});
  const [acceptedMeetings, setAcceptedMeetings] = useState<Record<string, true>>({});

  const defaultCharity = useMemo(
    () => CHARITIES.find((c) => c.id === defaultCharityId)!,
    [defaultCharityId],
  );

  function openDefaultPicker() {
    setPickerContext({ kind: "default" });
    setPickerOpen(true);
  }

  function openMeetingPicker(meetingId: string) {
    setPickerContext({ kind: "meeting", meetingId });
    setPickerOpen(true);
  }

  function handleSelect(charityId: string) {
    if (pickerContext.kind === "default") {
      setDefaultCharityId(charityId);
    } else {
      setMeetingOverrides((prev) => ({
        ...prev,
        [pickerContext.meetingId]: charityId,
      }));
    }
    setPickerOpen(false);
  }

  function handleAccept(meetingId: string) {
    setAcceptedMeetings((prev) => ({ ...prev, [meetingId]: true }));
  }

  const currentSelectedForPicker =
    pickerContext.kind === "default"
      ? defaultCharityId
      : meetingOverrides[pickerContext.meetingId] ?? defaultCharityId;

  // "Recently directed" = unique charity IDs from recent donations, most recent first,
  // excluding the current default (which is already shown on the Direction Card).
  const recentCharityIds = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const d of RECENT_DONATIONS) {
      if (!seen.has(d.charityId) && d.charityId !== defaultCharityId) {
        seen.add(d.charityId);
        ordered.push(d.charityId);
      }
    }
    return ordered.slice(0, 4);
  }, [defaultCharityId]);

  return (
    <>
      <main className="mx-auto max-w-7xl px-6 lg:px-10 py-12 md:py-16">
        {/* Secondary-surface framing */}
        <div
          className="mb-10 rounded-2xl border px-5 py-4 flex items-start gap-3 max-w-3xl"
          style={{
            background: "var(--mint-tint)",
            borderColor: "var(--primary)",
          }}
        >
          <span
            className="size-1.5 rounded-full pulse-dot mt-2 shrink-0"
            style={{ background: "var(--primary)" }}
          />
          <div className="text-[13px] leading-relaxed">
            <span className="font-semibold">Dashboard is a secondary surface.</span>{" "}
            Most executives accept or decline meetings from email and never
            open this view. The dashboard is here for transparency, history,
            and for EAs acting on the executive&apos;s behalf.{" "}
            <a
              href="/mockup/email"
              className="underline-offset-2 hover:underline"
              style={{ color: "var(--primary)" }}
            >
              See the email flow →
            </a>
          </div>
        </div>

        {/* Greeting */}
        <div className="max-w-2xl flex items-start gap-5">
          <UserAvatar name="Jane Allen" size={56} />
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              Tuesday, 21 May 2026
            </div>
            <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-[-0.02em] leading-tight">
              Welcome back, Jane.
            </h1>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              You have <span className="font-semibold text-foreground">2 meeting requests</span>{" "}
              waiting. So far this year you have directed{" "}
              <span className="serif-italic" style={{ color: "var(--primary)" }}>$12,000</span>{" "}
              across 12 meetings.
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="mt-10 grid lg:grid-cols-12 gap-6">
          {/* Direction card (left, sticky on large screens) */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-20">
              <DirectionCard
                charity={defaultCharity}
                onChange={openDefaultPicker}
              />
              <LifetimeStats />
            </div>
          </div>

          {/* Activity column (right) */}
          <div className="lg:col-span-7 space-y-10">
            {/* Incoming */}
            <section>
              <SectionLabel>Incoming · {INCOMING.length}</SectionLabel>
              <div className="mt-4 space-y-3">
                {INCOMING.map((m) => {
                  const overrideId = meetingOverrides[m.id];
                  const charity = overrideId
                    ? CHARITIES.find((c) => c.id === overrideId)!
                    : defaultCharity;
                  return (
                    <MeetingRequestCard
                      key={m.id}
                      meeting={m}
                      charity={charity}
                      overridden={!!overrideId}
                      accepted={!!acceptedMeetings[m.id]}
                      onAccept={() => handleAccept(m.id)}
                      onChangeCharity={() => openMeetingPicker(m.id)}
                    />
                  );
                })}
              </div>
            </section>

            {/* Recent impact */}
            <section>
              <SectionLabel>Recent impact</SectionLabel>
              <div
                className="mt-4 rounded-2xl border overflow-hidden"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                {RECENT_DONATIONS.map((d, i) => (
                  <DonationRow
                    key={i}
                    d={d}
                    last={i === RECENT_DONATIONS.length - 1}
                  />
                ))}
              </div>
              <a
                href="#"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                See full history
                <ChevronRight className="size-3.5" />
              </a>
            </section>
          </div>
        </div>
      </main>

      {pickerOpen && (
        <CharityPicker
          charities={CHARITIES}
          currentId={currentSelectedForPicker}
          context={pickerContext}
          defaultCharityName={defaultCharity.name}
          recentCharityIds={recentCharityIds}
          onClose={() => setPickerOpen(false)}
          onSelect={handleSelect}
        />
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Direction card
   ───────────────────────────────────────────────────────────────── */

function DirectionCard({
  charity,
  onChange,
}: {
  charity: Charity;
  onChange: () => void;
}) {
  return (
    <div
      className="rounded-2xl border p-6 md:p-8 relative overflow-hidden"
      style={{
        background: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      {/* subtle emerald flourish in the corner */}
      <div
        className="absolute -top-16 -right-16 size-48 rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--primary) 14%, transparent), transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            Standing nomination
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em]"
            style={{
              background: "var(--mint-tint)",
              color: "var(--primary)",
            }}
          >
            <ShieldCheck className="size-3" />
            DGR verified
          </span>
        </div>

        <div className="mt-5">
          <div className="display-serif text-4xl md:text-5xl text-foreground leading-[1.05]">
            {charity.name}
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            {charity.cause}
          </div>
        </div>

        <p className="mt-5 text-[12px] text-muted-foreground leading-relaxed">
          Each meeting starts here. You can direct any individual meeting to a
          different DGR-endorsed charity at the moment you accept it.
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-[12px]">
          <div>
            <dt className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              ABN
            </dt>
            <dd className="mt-1.5 font-mono tabular-nums">{charity.abn}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              Status
            </dt>
            <dd className="mt-1.5 font-mono tabular-nums">Item 1 DGR · live</dd>
          </div>
        </dl>

        <button
          onClick={onChange}
          className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-medium hover:bg-accent transition-colors"
          style={{
            borderColor: "var(--border-strong)",
            background: "transparent",
          }}
        >
          Change standing nomination
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

function LifetimeStats() {
  return (
    <div
      className="mt-4 rounded-2xl border"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <StatRow k="This year"  meetings={12} amount="$12,000" />
      <StatRow k="Lifetime"   meetings={28} amount="$28,000" last />
    </div>
  );
}

function StatRow({
  k,
  meetings,
  amount,
  last,
}: {
  k: string;
  meetings: number;
  amount: string;
  last?: boolean;
}) {
  return (
    <div
      className={
        "flex items-baseline justify-between gap-6 px-6 py-4 " +
        (last ? "" : "border-b")
      }
      style={!last ? { borderColor: "var(--border)" } : undefined}
    >
      <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
        {k}
      </span>
      <div className="flex items-baseline gap-3">
        <span className="text-[12px] text-muted-foreground tabular-nums">
          {meetings} meetings
        </span>
        <span
          className="display-serif text-xl tabular-nums"
          style={{ color: "var(--primary)" }}
        >
          {amount}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Meeting request card
   ───────────────────────────────────────────────────────────────── */

function MeetingRequestCard({
  meeting,
  charity,
  overridden,
  accepted,
  onAccept,
  onChangeCharity,
}: {
  meeting: MeetingRequest;
  charity: Charity;
  overridden: boolean;
  accepted: boolean;
  onAccept: () => void;
  onChangeCharity: () => void;
}) {
  return (
    <div
      className="rounded-2xl border p-5 md:p-6 transition-all"
      style={{
        background: "var(--card)",
        borderColor: accepted ? "var(--primary)" : "var(--border)",
        opacity: accepted ? 0.92 : 1,
      }}
    >
      <div className="flex items-start gap-4">
        <Avatar name={meeting.vendorName} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[15px] font-semibold tracking-tight">
                  {meeting.vendorName}
                </span>
                {meeting.verified.abn && (
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
                )}
              </div>
              <div className="mt-0.5 text-[12px] text-muted-foreground">
                {meeting.vendorRole} · {meeting.vendorCompany}
              </div>
              <p className="mt-2.5 text-[13px] text-foreground leading-relaxed">
                {meeting.topic}
              </p>
              <div className="mt-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
                {meeting.proposed}
              </div>
            </div>
            {accepted && (
              <span
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-[0.14em]"
                style={{
                  background: "var(--mint-tint)",
                  color: "var(--primary)",
                }}
              >
                <Check className="size-3" />
                Accepted
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={accepted ? undefined : onChangeCharity}
        disabled={accepted}
        className="mt-5 w-full text-left rounded-xl border px-4 py-3.5 flex items-center justify-between gap-4 transition-colors disabled:cursor-default group"
        style={{
          background:
            "color-mix(in oklab, var(--primary) 5%, var(--card))",
          borderColor: overridden ? "var(--primary)" : "var(--border-strong)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="size-9 rounded-lg grid place-items-center shrink-0"
            style={{
              background: "var(--mint-tint)",
              color: "var(--primary)",
            }}
          >
            <ShieldCheck className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              Direct this $1,000 to
            </div>
            <div className="mt-0.5 text-[15px] font-semibold tracking-tight truncate">
              {charity.name}
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              {charity.cause}
              {overridden && (
                <span
                  className="ml-2 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-[0.14em]"
                  style={{
                    background: "var(--mint-tint)",
                    color: "var(--primary)",
                  }}
                >
                  <Repeat2 className="size-2.5" />
                  Per-meeting choice
                </span>
              )}
            </div>
          </div>
        </div>
        {!accepted && (
          <span
            className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground group-hover:text-foreground transition-colors"
          >
            Change
            <ChevronRight className="size-3.5" />
          </span>
        )}
      </button>

      {!accepted && (
        <div className="mt-5 flex items-center gap-3 flex-wrap">
          <button
            onClick={onAccept}
            className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-[13px] font-medium hover:bg-primary transition-colors"
          >
            Accept meeting
            <ChevronRight className="size-3.5" />
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[13px] font-medium hover:bg-accent transition-colors"
            style={{ borderColor: "var(--border-strong)" }}
          >
            Decline
          </button>
        </div>
      )}

      <MeetingDetails meeting={meeting} />
    </div>
  );
}

function MeetingDetails({ meeting }: { meeting: MeetingRequest }) {
  return (
    <details
      className="group mt-5 -mx-5 md:-mx-6 px-5 md:px-6 pt-4 border-t"
      style={{ borderColor: "var(--border)" }}
    >
      <summary className="cursor-pointer list-none flex items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
        <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground group-open:text-foreground transition-colors">
          More about {meeting.vendorName}
        </span>
        <span
          className="size-7 rounded-full border grid place-items-center text-muted-foreground group-open:bg-foreground group-open:text-background group-open:border-foreground transition-colors"
          style={{ borderColor: "var(--border)" }}
        >
          <Plus className="size-3.5 group-open:hidden" />
          <Minus className="size-3.5 hidden group-open:block" />
        </span>
      </summary>

      <div className="mt-5 pb-5 space-y-5">
        {/* Pitch */}
        <DetailBlock
          icon={MessageSquareQuote}
          label="What they want to discuss"
        >
          <p className="leading-relaxed">{meeting.pitch}</p>
        </DetailBlock>

        {/* Why this exec */}
        <DetailBlock icon={Sparkles} label="Why you, specifically">
          <p className="leading-relaxed">{meeting.why}</p>
        </DetailBlock>

        {/* Company */}
        <DetailBlock icon={Building2} label="About the company">
          <p className="leading-relaxed">{meeting.companyBlurb}</p>
        </DetailBlock>

        {/* LinkedIn + verification footer */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
          <a
            href={`https://${meeting.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-foreground hover:text-primary transition-colors"
          >
            <IconLinkedIn size={14} />
            {meeting.linkedin}
          </a>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            {meeting.verified.abn && (
              <span className="inline-flex items-center gap-1">
                <Check
                  className="size-3"
                  style={{ color: "var(--primary)" }}
                />
                ABN verified
              </span>
            )}
            {meeting.verified.founder && (
              <span className="inline-flex items-center gap-1">
                <Check
                  className="size-3"
                  style={{ color: "var(--primary)" }}
                />
                Founder reviewed
              </span>
            )}
          </div>
        </div>
      </div>
    </details>
  );
}

function DetailBlock({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="mt-0.5 size-7 rounded-lg grid place-items-center shrink-0"
        style={{
          background: "var(--mint-tint)",
          color: "var(--primary)",
        }}
      >
        <Icon size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </div>
        <div className="mt-1.5 text-[13px] text-foreground">{children}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Recent donation row
   ───────────────────────────────────────────────────────────────── */

function DonationRow({ d, last }: { d: CompletedDonation; last?: boolean }) {
  return (
    <div
      className={
        "flex items-center justify-between gap-4 px-5 md:px-6 py-4 " +
        (last ? "" : "border-b")
      }
      style={!last ? { borderColor: "var(--border)" } : undefined}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground w-14 shrink-0">
          {d.date}
        </span>
        <Avatar name={d.vendor} size={28} />
        <span className="text-[13px] text-foreground truncate">
          {d.vendor}
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[13px] text-muted-foreground hidden sm:inline">
          $1,000 →
        </span>
        <span className="text-[13px] font-medium tracking-tight">
          {d.charity}
        </span>
        {d.status === "confirmed" ? (
          <span
            className="inline-flex items-center justify-center size-5 rounded-full"
            style={{
              background: "var(--mint-tint)",
              color: "var(--primary)",
            }}
            title="Charity confirmed receipt"
          >
            <Check className="size-3" />
          </span>
        ) : (
          <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            Pending
          </span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Charity picker dialog
   ───────────────────────────────────────────────────────────────── */

function CharityPicker({
  charities,
  currentId,
  context,
  defaultCharityName,
  recentCharityIds,
  onClose,
  onSelect,
}: {
  charities: Charity[];
  currentId: string;
  context: { kind: "default" } | { kind: "meeting"; meetingId: string };
  defaultCharityName: string;
  recentCharityIds: string[];
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string>(currentId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return charities;
    return charities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.cause.toLowerCase().includes(q) ||
        c.abn.replace(/\s/g, "").includes(q.replace(/\s/g, "")),
    );
  }, [query, charities]);

  const title =
    context.kind === "default"
      ? "Change your charity"
      : "Direct this meeting to a different charity";
  const subtitle =
    context.kind === "default"
      ? "Every meeting you accept will direct $1,000 to your chosen DGR-endorsed charity."
      : `Just for this meeting. Your default (${defaultCharityName}) stays in place for everything else.`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        onClick={onClose}
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
        aria-label="Close"
      />
      <div
        className="relative w-full sm:max-w-lg max-h-[90vh] overflow-hidden rounded-t-2xl sm:rounded-2xl border shadow-xl"
        style={{
          background: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        {/* Header */}
        <div
          className="px-5 sm:px-6 py-5 border-b flex items-start justify-between gap-4"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed max-w-[36ch]">
              {subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-full grid place-items-center text-muted-foreground hover:bg-accent transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 sm:px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <label className="relative block">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Search className="size-4" />
            </span>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, cause or ABN"
              className="w-full rounded-full border pl-10 pr-4 py-2.5 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style={{
                background: "var(--background)",
                borderColor: "var(--border)",
              }}
            />
          </label>
        </div>

        {/* List */}
        <div className="overflow-y-auto" style={{ maxHeight: "50vh" }}>
          {query.trim() === "" && recentCharityIds.length > 0 && (
            <>
              <div className="px-5 sm:px-6 pt-4 pb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                Recently directed
              </div>
              <div className="px-5 sm:px-6 pb-4 flex flex-wrap gap-2">
                {recentCharityIds.map((id) => {
                  const c = charities.find((x) => x.id === id);
                  if (!c) return null;
                  const isPending = pendingId === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setPendingId(id)}
                      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors"
                      style={{
                        background: isPending ? "var(--mint-tint)" : "transparent",
                        borderColor: isPending
                          ? "var(--primary)"
                          : "var(--border-strong)",
                        color: isPending ? "var(--primary)" : "var(--foreground)",
                      }}
                    >
                      {isPending && <Check className="size-3" />}
                      {c.name}
                    </button>
                  );
                })}
              </div>
              <div
                className="border-t mx-5 sm:mx-6"
                style={{ borderColor: "var(--border)" }}
              />
            </>
          )}
          {query.trim() === "" && (
            <div className="px-5 sm:px-6 pt-4 pb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              {recentCharityIds.length > 0 ? "All charities" : "Popular among executives"}
            </div>
          )}
          {filtered.length === 0 ? (
            <div className="px-5 sm:px-6 py-10 text-center text-sm text-muted-foreground">
              No DGR-endorsed charities match that.
              <div className="mt-1 text-[12px]">
                Try a shorter query or paste the ABN.
              </div>
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
              {filtered.map((c) => {
                const isCurrent = c.id === currentId;
                const isPending = c.id === pendingId;
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setPendingId(c.id)}
                      className="w-full text-left px-5 sm:px-6 py-4 flex items-start gap-4 hover:bg-accent transition-colors"
                      style={{
                        background: isPending ? "var(--mint-tint)" : "transparent",
                      }}
                    >
                      <span
                        className="mt-0.5 size-5 rounded-full border grid place-items-center shrink-0"
                        style={{
                          background: isPending ? "var(--primary)" : "transparent",
                          borderColor: isPending
                            ? "var(--primary)"
                            : "var(--border-strong)",
                        }}
                      >
                        {isPending && (
                          <Check
                            className="size-3"
                            style={{ color: "var(--primary-foreground)" }}
                          />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold tracking-tight">
                            {c.name}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 text-[12px] text-muted-foreground">
                          {c.cause} · ABN {c.abn}
                        </div>
                        <div className="mt-1 text-[12px] text-foreground/80 leading-relaxed">
                          {c.blurb}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-5 sm:px-6 py-4 border-t flex items-center justify-between gap-3"
          style={{ borderColor: "var(--border)" }}
        >
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            All charities verified live against the ABR DGR register.
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="rounded-full px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSelect(pendingId)}
              disabled={pendingId === currentId}
              className="rounded-full bg-foreground text-background px-5 py-2 text-[13px] font-medium hover:bg-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {context.kind === "default" ? "Set as my charity" : "Use for this meeting"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Small label
   ───────────────────────────────────────────────────────────────── */

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
