"use client";

/* Executive dashboard — ported component-for-component from the committed mockup
   (apps/web/app/mockup/exec/ExecDashboard.tsx) into the platform. Same widgets,
   same layout, same interactions; re-toned to the --portal-* palette (emerald is
   reserved for the sidebar, amber is the single accent) and wired to live
   staging data via props. The dark metrics ribbon + emerald sidebar chrome live
   in the page; this file is the rich 2-column body the mockup specifies.

   Reads are live. "Change standing nomination" persists through a server action.
   Accept / Decline / per-meeting charity override stay client-side here: per the
   EXECUTIVE_PORTAL_BRIEF the email flow is the real action path and this surface
   is secondary. */

import { useState, useMemo, useTransition } from "react";
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
import { Avatar } from "./avatar";
import { IconLinkedIn } from "./linkedin-icon";
import { setStandingNominationAction } from "../actions";

/* ── Live-data shapes (populated by the server component) ─────────────── */

export type Charity = {
  id: string;
  name: string;
  abn: string | null;
  cause: string | null;
  blurb: string | null;
};

export type MeetingRequest = {
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

export type CompletedDonation = {
  date: string;
  /** ISO timestamp, for this-year vs lifetime splitting. */
  iso: string;
  vendor: string;
  charity: string;
  charityId: string;
  amount: string;
  amountCents: number;
  status: "confirmed" | "pending";
};

export function ExecDashboard({
  charities,
  defaultCharityId,
  incoming,
  donations,
  indicativeAmount,
}: {
  charities: Charity[];
  defaultCharityId: string;
  incoming: MeetingRequest[];
  donations: CompletedDonation[];
  /** The amount the NEXT meeting would direct, from the pricing engine. */
  indicativeAmount: string;
}) {
  const [currentDefaultId, setCurrentDefaultId] = useState<string>(defaultCharityId);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerContext, setPickerContext] = useState<
    { kind: "default" } | { kind: "meeting"; meetingId: string }
  >({ kind: "default" });
  const [meetingOverrides, setMeetingOverrides] = useState<Record<string, string>>({});
  const [acceptedMeetings, setAcceptedMeetings] = useState<Record<string, true>>({});
  const [isPending, startTransition] = useTransition();

  const defaultCharity = useMemo(
    () => charities.find((c) => c.id === currentDefaultId) ?? charities[0],
    [charities, currentDefaultId],
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
      const prev = currentDefaultId;
      setCurrentDefaultId(charityId); // optimistic
      startTransition(async () => {
        const res = await setStandingNominationAction(charityId);
        if (res?.error) setCurrentDefaultId(prev); // roll back on failure
      });
    } else {
      setMeetingOverrides((p) => ({ ...p, [pickerContext.meetingId]: charityId }));
    }
    setPickerOpen(false);
  }
  function handleAccept(meetingId: string) {
    setAcceptedMeetings((p) => ({ ...p, [meetingId]: true }));
  }

  const currentSelectedForPicker =
    pickerContext.kind === "default"
      ? currentDefaultId
      : meetingOverrides[pickerContext.meetingId] ?? currentDefaultId;

  // "Recently directed" = unique charity IDs from recent donations, most recent
  // first, excluding the current default (already shown on the Direction Card).
  const recentCharityIds = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const d of donations) {
      if (!seen.has(d.charityId) && d.charityId !== currentDefaultId) {
        seen.add(d.charityId);
        ordered.push(d.charityId);
      }
    }
    return ordered.slice(0, 4);
  }, [donations, currentDefaultId]);

  return (
    <>
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Direction card (left, sticky on large screens) */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-6">
            <DirectionCard
              charity={defaultCharity}
              indicativeAmount={indicativeAmount}
              onChange={openDefaultPicker}
              saving={isPending}
            />
            <LifetimeStats donations={donations} />
          </div>
        </div>

        {/* Activity column (right) */}
        <div className="lg:col-span-7 space-y-10">
          <section>
            <SectionLabel>Incoming · {incoming.length}</SectionLabel>
            <div className="mt-4 space-y-3">
              {incoming.length === 0 ? (
                <div
                  className="rounded-2xl border px-5 py-8 text-center text-[13px]"
                  style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)", color: "var(--muted-foreground)" }}
                >
                  No new requests right now. New introductions land in your inbox first.
                </div>
              ) : (
                incoming.map((m) => {
                  const overrideId = meetingOverrides[m.id];
                  const charity = overrideId
                    ? charities.find((c) => c.id === overrideId) ?? defaultCharity
                    : defaultCharity;
                  return (
                    <MeetingRequestCard
                      key={m.id}
                      meeting={m}
                      charity={charity}
                      indicativeAmount={indicativeAmount}
                      overridden={!!overrideId}
                      accepted={!!acceptedMeetings[m.id]}
                      onAccept={() => handleAccept(m.id)}
                      onChangeCharity={() => openMeetingPicker(m.id)}
                    />
                  );
                })
              )}
            </div>
          </section>

          <section>
            <SectionLabel>Recent impact</SectionLabel>
            <div
              className="mt-4 rounded-2xl border overflow-hidden"
              style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}
            >
              {donations.length === 0 ? (
                <div className="px-6 py-8 text-center text-[13px]" style={{ color: "var(--muted-foreground)" }}>
                  Your first held meeting will show here, with the gift it sent.
                </div>
              ) : (
                donations.map((d, i) => (
                  <DonationRow key={i} d={d} last={i === donations.length - 1} />
                ))
              )}
            </div>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
              See full history
              <ChevronRight className="size-3.5" />
            </span>
          </section>
        </div>
      </div>

      {pickerOpen && (
        <CharityPicker
          charities={charities}
          currentId={currentSelectedForPicker}
          context={pickerContext}
          defaultCharityName={defaultCharity?.name ?? ""}
          recentCharityIds={recentCharityIds}
          indicativeAmount={indicativeAmount}
          onClose={() => setPickerOpen(false)}
          onSelect={handleSelect}
        />
      )}
    </>
  );
}

/* ── Direction card ───────────────────────────────────────────────────── */

function DirectionCard({
  charity,
  indicativeAmount,
  onChange,
  saving,
}: {
  charity?: Charity;
  indicativeAmount: string;
  onChange: () => void;
  saving: boolean;
}) {
  return (
    <div
      className="rounded-2xl border p-6 md:p-8 relative overflow-hidden"
      style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}
    >
      {/* subtle amber flourish in the corner */}
      <div
        className="absolute -top-16 -right-16 size-48 rounded-full"
        style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--portal-amber) 16%, transparent), transparent 70%)" }}
        aria-hidden
      />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
            Standing nomination
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em]"
            style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}
          >
            <ShieldCheck className="size-3" />
            DGR verified
          </span>
        </div>

        <div className="mt-5">
          <div className="font-display text-4xl md:text-5xl leading-[1.05]" style={{ color: "var(--foreground)" }}>
            {charity?.name ?? "No charity set"}
          </div>
          {charity?.cause && (
            <div className="mt-3 text-sm" style={{ color: "var(--muted-foreground)" }}>{charity.cause}</div>
          )}
        </div>

        <p className="mt-5 text-[12px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          Each meeting starts here. You can direct any individual meeting to a
          different DGR-endorsed charity at the moment you accept it.
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-[12px]">
          <div>
            <dt className="text-[10px] font-mono uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>ABN</dt>
            <dd className="mt-1.5 font-mono tabular-nums">{charity?.abn ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-mono uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>Next meeting sends</dt>
            <dd className="mt-1.5 font-mono tabular-nums">{indicativeAmount}</dd>
          </div>
        </dl>

        <button
          onClick={onChange}
          disabled={saving}
          className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-60"
          style={{ borderColor: "var(--border-strong)", background: "transparent" }}
        >
          {saving ? "Saving…" : "Change standing nomination"}
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

function LifetimeStats({ donations }: { donations: CompletedDonation[] }) {
  const yearStr = String(new Date().getFullYear());
  const thisYear = donations.filter((d) => d.iso.startsWith(yearStr));
  return (
    <div className="mt-4 rounded-2xl border" style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}>
      <StatRow k="This year" meetings={thisYear.length} amount={sumAud(thisYear)} />
      <StatRow k="Lifetime" meetings={donations.length} amount={sumAud(donations)} last />
    </div>
  );
}

function sumAud(rows: CompletedDonation[]): string {
  const cents = rows.reduce((s, r) => s + (r.amountCents ?? 0), 0);
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(cents / 100);
}

function StatRow({ k, meetings, amount, last }: { k: string; meetings: number; amount: string; last?: boolean }) {
  return (
    <div
      className={"flex items-baseline justify-between gap-6 px-6 py-4 " + (last ? "" : "border-b")}
      style={!last ? { borderColor: "var(--portal-line)" } : undefined}
    >
      <span className="text-[11px] font-mono uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>{k}</span>
      <div className="flex items-baseline gap-3">
        <span className="text-[12px] tabular-nums" style={{ color: "var(--muted-foreground)" }}>{meetings} meetings</span>
        <span className="font-display text-xl tabular-nums" style={{ color: "var(--portal-amber-ink)" }}>{amount}</span>
      </div>
    </div>
  );
}

/* ── Meeting request card ─────────────────────────────────────────────── */

function MeetingRequestCard({
  meeting,
  charity,
  indicativeAmount,
  overridden,
  accepted,
  onAccept,
  onChangeCharity,
}: {
  meeting: MeetingRequest;
  charity?: Charity;
  indicativeAmount: string;
  overridden: boolean;
  accepted: boolean;
  onAccept: () => void;
  onChangeCharity: () => void;
}) {
  return (
    <div
      className="rounded-2xl border p-5 md:p-6 transition-all"
      style={{
        background: "var(--portal-card)",
        borderColor: accepted ? "var(--portal-amber)" : "var(--portal-line)",
        opacity: accepted ? 0.92 : 1,
      }}
    >
      <div className="flex items-start gap-4">
        <Avatar name={meeting.vendorName} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[15px] font-semibold tracking-tight">{meeting.vendorName}</span>
                {meeting.verified.abn && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-[0.14em]"
                    style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}
                  >
                    <ShieldCheck className="size-2.5" />
                    Verified
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-[12px]" style={{ color: "var(--muted-foreground)" }}>
                {[meeting.vendorRole, meeting.vendorCompany].filter(Boolean).join(" · ")}
              </div>
              <p className="mt-2.5 text-[13px] leading-relaxed" style={{ color: "var(--foreground)" }}>{meeting.topic}</p>
              <div className="mt-2 text-[11px] font-mono uppercase tracking-[0.14em]" style={{ color: "var(--muted-foreground)" }}>{meeting.proposed}</div>
            </div>
            {accepted && (
              <span
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-[0.14em]"
                style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}
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
          background: "color-mix(in oklab, var(--portal-amber) 7%, var(--portal-card))",
          borderColor: overridden ? "var(--portal-amber)" : "var(--border-strong)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 rounded-lg grid place-items-center shrink-0" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}>
            <ShieldCheck className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
              Direct this {indicativeAmount} to
            </div>
            <div className="mt-0.5 text-[15px] font-semibold tracking-tight truncate">{charity?.name ?? "—"}</div>
            <div className="text-[11px] truncate" style={{ color: "var(--muted-foreground)" }}>
              {charity?.cause ?? "DGR-endorsed charity"}
              {overridden && (
                <span
                  className="ml-2 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-[0.14em]"
                  style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}
                >
                  <Repeat2 className="size-2.5" />
                  Per-meeting choice
                </span>
              )}
            </div>
          </div>
        </div>
        {!accepted && (
          <span className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.14em] transition-colors group-hover:text-foreground" style={{ color: "var(--muted-foreground)" }}>
            Change
            <ChevronRight className="size-3.5" />
          </span>
        )}
      </button>

      {!accepted && (
        <div className="mt-5 flex items-center gap-3 flex-wrap">
          <button
            onClick={onAccept}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium transition-opacity hover:opacity-90"
            style={{ background: "var(--portal-ink)", color: "#fff" }}
          >
            Accept meeting
            <ChevronRight className="size-3.5" />
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[13px] font-medium transition-colors hover:bg-accent"
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
  const hasLinkedin = !!meeting.linkedin;
  return (
    <details className="group mt-5 -mx-5 md:-mx-6 px-5 md:px-6 pt-4 border-t" style={{ borderColor: "var(--portal-line)" }}>
      <summary className="cursor-pointer list-none flex items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
        <span className="text-[11px] font-mono uppercase tracking-[0.18em] transition-colors group-open:text-foreground" style={{ color: "var(--muted-foreground)" }}>
          More about {meeting.vendorName}
        </span>
        <span className="size-7 rounded-full border grid place-items-center group-open:bg-foreground group-open:text-background group-open:border-foreground transition-colors" style={{ borderColor: "var(--portal-line)", color: "var(--muted-foreground)" }}>
          <Plus className="size-3.5 group-open:hidden" />
          <Minus className="size-3.5 hidden group-open:block" />
        </span>
      </summary>

      <div className="mt-5 pb-5 space-y-5">
        <DetailBlock icon={MessageSquareQuote} label="What they want to discuss">
          <p className="leading-relaxed">{meeting.pitch}</p>
        </DetailBlock>
        <DetailBlock icon={Sparkles} label="Why you, specifically">
          <p className="leading-relaxed">{meeting.why}</p>
        </DetailBlock>
        {meeting.companyBlurb && (
          <DetailBlock icon={Building2} label="About the company">
            <p className="leading-relaxed">{meeting.companyBlurb}</p>
          </DetailBlock>
        )}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
          {hasLinkedin && (
            <a
              href={`https://${meeting.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors hover:text-primary"
              style={{ color: "var(--foreground)" }}
            >
              <IconLinkedIn size={14} />
              {meeting.linkedin}
            </a>
          )}
          <div className="flex items-center gap-3 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
            {meeting.verified.abn && (
              <span className="inline-flex items-center gap-1">
                <Check className="size-3" style={{ color: "var(--portal-amber-ink)" }} />
                ABN verified
              </span>
            )}
            {meeting.verified.founder && (
              <span className="inline-flex items-center gap-1">
                <Check className="size-3" style={{ color: "var(--portal-amber-ink)" }} />
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
      <div className="mt-0.5 size-7 rounded-lg grid place-items-center shrink-0" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}>
        <Icon size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-mono uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>{label}</div>
        <div className="mt-1.5 text-[13px]" style={{ color: "var(--foreground)" }}>{children}</div>
      </div>
    </div>
  );
}

/* ── Recent donation row ──────────────────────────────────────────────── */

function DonationRow({ d, last }: { d: CompletedDonation; last?: boolean }) {
  return (
    <div
      className={"flex items-center justify-between gap-4 px-5 md:px-6 py-4 " + (last ? "" : "border-b")}
      style={!last ? { borderColor: "var(--portal-line)" } : undefined}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[11px] font-mono uppercase tracking-[0.14em] w-14 shrink-0" style={{ color: "var(--muted-foreground)" }}>{d.date}</span>
        <Avatar name={d.vendor} size={28} />
        <span className="text-[13px] truncate" style={{ color: "var(--foreground)" }}>{d.vendor}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[13px] hidden sm:inline" style={{ color: "var(--muted-foreground)" }}>{d.amount} →</span>
        <span className="text-[13px] font-medium tracking-tight">{d.charity}</span>
        {d.status === "confirmed" ? (
          <span className="inline-flex items-center justify-center size-5 rounded-full" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }} title="Charity confirmed receipt">
            <Check className="size-3" />
          </span>
        ) : (
          <span className="text-[10px] font-mono uppercase tracking-[0.14em]" style={{ color: "var(--muted-foreground)" }}>Pending</span>
        )}
      </div>
    </div>
  );
}

/* ── Charity picker dialog ────────────────────────────────────────────── */

function CharityPicker({
  charities,
  currentId,
  context,
  defaultCharityName,
  recentCharityIds,
  indicativeAmount,
  onClose,
  onSelect,
}: {
  charities: Charity[];
  currentId: string;
  context: { kind: "default" } | { kind: "meeting"; meetingId: string };
  defaultCharityName: string;
  recentCharityIds: string[];
  indicativeAmount: string;
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
        (c.cause ?? "").toLowerCase().includes(q) ||
        (c.abn ?? "").replace(/\s/g, "").includes(q.replace(/\s/g, "")),
    );
  }, [query, charities]);

  const title = context.kind === "default" ? "Change your charity" : "Direct this meeting to a different charity";
  const subtitle =
    context.kind === "default"
      ? `Every meeting you accept will direct ${indicativeAmount} to your chosen DGR-endorsed charity.`
      : `Just for this meeting. Your default (${defaultCharityName}) stays in place for everything else.`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <button onClick={onClose} className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" aria-label="Close" />
      <div className="relative w-full sm:max-w-lg max-h-[90vh] overflow-hidden rounded-t-2xl sm:rounded-2xl border shadow-xl" style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}>
        <div className="px-5 sm:px-6 py-5 border-b flex items-start justify-between gap-4" style={{ borderColor: "var(--portal-line)" }}>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed max-w-[36ch]" style={{ color: "var(--muted-foreground)" }}>{subtitle}</p>
          </div>
          <button onClick={onClose} className="size-8 rounded-full grid place-items-center transition-colors hover:bg-accent shrink-0" style={{ color: "var(--muted-foreground)" }} aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        <div className="px-5 sm:px-6 py-4 border-b" style={{ borderColor: "var(--portal-line)" }}>
          <label className="relative block">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }}>
              <Search className="size-4" />
            </span>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, cause or ABN"
              className="w-full rounded-full border pl-10 pr-4 py-2.5 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ background: "var(--background)", borderColor: "var(--portal-line)" }}
            />
          </label>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: "50vh" }}>
          {query.trim() === "" && recentCharityIds.length > 0 && (
            <>
              <div className="px-5 sm:px-6 pt-4 pb-2 text-[10px] font-mono uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>Recently directed</div>
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
                        background: isPending ? "var(--portal-amber-soft)" : "transparent",
                        borderColor: isPending ? "var(--portal-amber)" : "var(--border-strong)",
                        color: isPending ? "var(--portal-amber-ink)" : "var(--foreground)",
                      }}
                    >
                      {isPending && <Check className="size-3" />}
                      {c.name}
                    </button>
                  );
                })}
              </div>
              <div className="border-t mx-5 sm:mx-6" style={{ borderColor: "var(--portal-line)" }} />
            </>
          )}
          {query.trim() === "" && (
            <div className="px-5 sm:px-6 pt-4 pb-2 text-[10px] font-mono uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
              {recentCharityIds.length > 0 ? "All charities" : "DGR-endorsed charities"}
            </div>
          )}
          {filtered.length === 0 ? (
            <div className="px-5 sm:px-6 py-10 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
              No DGR-endorsed charities match that.
              <div className="mt-1 text-[12px]">Try a shorter query or paste the ABN.</div>
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: "var(--portal-line)" }}>
              {filtered.map((c) => {
                const isCurrent = c.id === currentId;
                const isPending = c.id === pendingId;
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setPendingId(c.id)}
                      className="w-full text-left px-5 sm:px-6 py-4 flex items-start gap-4 transition-colors hover:bg-accent"
                      style={{ background: isPending ? "var(--portal-amber-soft)" : "transparent" }}
                    >
                      <span
                        className="mt-0.5 size-5 rounded-full border grid place-items-center shrink-0"
                        style={{
                          background: isPending ? "var(--portal-amber)" : "transparent",
                          borderColor: isPending ? "var(--portal-amber)" : "var(--border-strong)",
                        }}
                      >
                        {isPending && <Check className="size-3" style={{ color: "#fff" }} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold tracking-tight">{c.name}</span>
                          {isCurrent && <span className="text-[10px] font-mono uppercase tracking-[0.14em]" style={{ color: "var(--muted-foreground)" }}>Current</span>}
                        </div>
                        <div className="mt-0.5 text-[12px]" style={{ color: "var(--muted-foreground)" }}>
                          {[c.cause, c.abn ? `ABN ${c.abn}` : null].filter(Boolean).join(" · ")}
                        </div>
                        {c.blurb && <div className="mt-1 text-[12px] leading-relaxed" style={{ color: "var(--foreground)", opacity: 0.8 }}>{c.blurb}</div>}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="px-5 sm:px-6 py-4 border-t flex items-center justify-between gap-3" style={{ borderColor: "var(--portal-line)" }}>
          <span className="text-[11px] hidden sm:inline" style={{ color: "var(--muted-foreground)" }}>All charities verified live against the ABR DGR register.</span>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={onClose} className="rounded-full px-4 py-2 text-[13px] font-medium transition-colors" style={{ color: "var(--muted-foreground)" }}>Cancel</button>
            <button
              onClick={() => onSelect(pendingId)}
              disabled={pendingId === currentId}
              className="rounded-full px-5 py-2 text-[13px] font-medium transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "var(--portal-ink)", color: "#fff" }}
            >
              {context.kind === "default" ? "Set as my charity" : "Use for this meeting"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Small label ──────────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
      <span className="h-px w-6" style={{ background: "var(--border-strong)" }} />
      {children}
    </div>
  );
}
