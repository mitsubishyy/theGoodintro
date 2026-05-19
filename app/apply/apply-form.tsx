"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Check, X } from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   Field primitives
   ──────────────────────────────────────────────────────────────── */

function HelpBubble({ items }: { items: string[] }) {
  return (
    <span className="relative inline-flex group align-middle ml-1.5">
      <button
        type="button"
        tabIndex={0}
        aria-label="See suggested answers"
        className="size-[18px] rounded-full border border-border text-muted-foreground text-[11px] font-medium leading-none grid place-items-center hover:border-[color:var(--border-strong)] hover:text-foreground transition-colors"
      >
        ?
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-[19rem] max-w-[80vw] -translate-x-1/2 rounded-xl border border-border bg-card p-4 opacity-0 shadow-[0_12px_40px_rgba(0,0,0,0.10)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <span className="block text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground mb-2">
          For example
        </span>
        <span className="block space-y-1.5 text-sm text-muted-foreground leading-relaxed">
          {items.map((it) => (
            <span key={it} className="block">
              {it}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}

function Field({
  label,
  hint,
  help,
  children,
  required,
}: {
  label: string;
  hint?: string;
  help?: string[];
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <span className="block text-[15px] md:text-base font-medium text-foreground mb-3 leading-snug">
        {label}
        {required ? <span style={{ color: "var(--primary)" }}> *</span> : null}
        {help ? <HelpBubble items={help} /> : null}
      </span>
      {hint ? (
        <p className="text-sm text-muted-foreground -mt-1 mb-3 leading-relaxed">
          {hint}
        </p>
      ) : null}
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-primary";
const areaCls =
  "w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-primary resize-y min-h-[110px]";

function Pills({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = o === value;
        return (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(on ? "" : o)}
            className={
              "rounded-full px-4 py-2.5 text-sm font-medium transition-colors " +
              (on
                ? "bg-foreground text-background"
                : "border border-border text-foreground hover:border-[color:var(--border-strong)]")
            }
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

/* Multi-select dropdown (choose several; closes on outside click) */
function MultiSelectDropdown({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function toggle(o: string) {
    onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  }

  const summary =
    value.length === 0
      ? placeholder
      : value.length <= 2
        ? value.join(", ")
        : `${value.length} selected`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={
          "w-full flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-base outline-none transition-colors focus:border-primary " +
          (value.length === 0 ? "text-muted-foreground/60" : "text-foreground")
        }
      >
        <span className="truncate text-left">{summary}</span>
        <ChevronDown
          className={
            "size-4 shrink-0 text-muted-foreground transition-transform " +
            (open ? "rotate-180" : "")
          }
        />
      </button>
      {open && (
        <div
          role="listbox"
          aria-multiselectable
          className="absolute z-30 mt-2 w-full rounded-xl border border-border bg-card p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.10)]"
        >
          {options.map((o) => {
            const on = value.includes(o);
            return (
              <button
                key={o}
                type="button"
                role="option"
                aria-selected={on}
                onClick={() => toggle(o)}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors"
              >
                <span
                  className={
                    "size-4 shrink-0 rounded-[5px] border grid place-items-center transition-colors " +
                    (on
                      ? "bg-foreground border-foreground text-background"
                      : "border-border")
                  }
                >
                  {on && <Check className="size-3" />}
                </span>
                <span className="text-foreground">{o}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Brand() {
  return (
    <>
      the<span style={{ color: "var(--primary)" }}>Good</span>intro
    </>
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

function readUtm(key: string): string {
  if (typeof window === "undefined") return "";
  return (
    new URLSearchParams(window.location.search).get(key)?.slice(0, 100) ?? ""
  );
}

const NEED_TO_SEE_SUGGESTIONS = [
  "Proof that other senior leaders are already taking part",
  "Which charities are supported, and that donations are actually paid",
];

/* ────────────────────────────────────────────────────────────────
   The form
   ──────────────────────────────────────────────────────────────── */

export default function ApplyForm() {
  // About you
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");

  // The model
  const [charityAmount, setCharityAmount] = useState("");
  const [conflictOfInterest, setConflictOfInterest] = useState("");
  const [conflictDetail, setConflictDetail] = useState("");
  const [beyondCharity, setBeyondCharity] = useState<string[]>([]);
  const [beyondCharityOther, setBeyondCharityOther] = useState("");

  // Joining
  const [needToSee, setNeedToSee] = useState("");
  const [meetingsPerYear, setMeetingsPerYear] = useState("");

  // Better matching
  const [alignMatters, setAlignMatters] = useState("");
  const [questionnaireWilling, setQuestionnaireWilling] = useState("");
  const [shareWithVendor, setShareWithVendor] = useState("");
  const [mandatoryPutOff, setMandatoryPutOff] = useState("");

  // Last things
  const [wouldRefer, setWouldRefer] = useState("");
  const [biggestConcern, setBiggestConcern] = useState("");
  const [anythingElse, setAnythingElse] = useState("");

  // The very last question
  const [joinWhenReady, setJoinWhenReady] = useState("");

  // Privacy + meta
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [utm, setUtm] = useState({ source: "", medium: "", campaign: "" });

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [doneName, setDoneName] = useState("");

  // Thank-you popup
  const [modalOpen, setModalOpen] = useState(true);
  const [shareUrl, setShareUrl] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [wantsCopy, setWantsCopy] = useState("");
  const [copyEmail, setCopyEmail] = useState("");
  const [copyState, setCopyState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(
    null,
  );

  useEffect(() => {
    setUtm({
      source: readUtm("utm_source"),
      medium: readUtm("utm_medium"),
      campaign: readUtm("utm_campaign"),
    });
    setShareUrl(window.location.origin + "/apply");
  }, []);

  async function sendCopyRequest() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(copyEmail.trim())) {
      setCopyState("error");
      return;
    }
    setCopyState("sending");
    try {
      const res = await fetch("/api/apply/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: copyEmail.trim(),
          fullName: fullName.trim(),
          company: company.trim(),
          answers: submitted,
        }),
      });
      setCopyState(res.ok ? "sent" : "error");
    } catch {
      setCopyState("error");
    }
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2200);
    } catch {
      /* clipboard blocked; the URL is shown for manual copy */
    }
  }

  // Hide the conditional detail box if they move away from "It depends"
  useEffect(() => {
    if (conflictOfInterest !== "It depends" && conflictDetail) {
      setConflictDetail("");
    }
  }, [conflictOfInterest, conflictDetail]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) return setError("Please enter your name.");
    if (!title.trim()) return setError("Please enter your title or role.");
    if (!company.trim()) return setError("Please enter your company.");
    if (!charityAmount)
      return setError("Please pick a charity amount that would be worth your time.");
    if (!conflictOfInterest)
      return setError("Please answer whether charity is a conflict of interest.");
    if (needToSee.trim().length < 10)
      return setError("Please say what you'd need to see before joining.");
    if (!alignMatters)
      return setError("Please answer the relevance question.");
    if (!joinWhenReady)
      return setError("Please answer whether you'd join when it's ready.");
    if (!consent)
      return setError(
        "Please confirm you're happy for your answers to be used to shape the platform.",
      );

    setSubmitting(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        title: title.trim(),
        company: company.trim(),
        charityAmount,
        conflictOfInterest,
        conflictDetail: conflictDetail.trim(),
        beyondCharity: beyondCharity.join("; "),
        beyondCharityOther: beyondCharityOther.trim(),
        needToSee: needToSee.trim(),
        meetingsPerYear,
        alignMatters,
        questionnaireWilling,
        shareWithVendor,
        mandatoryPutOff,
        wouldRefer,
        biggestConcern: biggestConcern.trim(),
        anythingElse: anythingElse.trim(),
        joinWhenReady,
        consent,
        website,
        utmSource: utm.source,
        utmMedium: utm.medium,
        utmCampaign: utm.campaign,
      };
      setSubmitted(payload);
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitting(false);
        return setError(data.error || "Something went wrong. Please try again.");
      }
      setDoneName(fullName.trim().split(" ")[0] || "");
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitting(false);
      setError("Network error. Please try again.");
    }
  }

  if (done) {
    if (!modalOpen) {
      return (
        <div className="rounded-3xl border border-border bg-card p-8 md:p-12 text-center">
          <SectionLabel>Received</SectionLabel>
          <h2 className="mt-5 text-2xl md:text-3xl font-semibold tracking-tight">
            Thank you{doneName ? `, ${doneName}` : ""}.{" "}
            <span className="serif-italic">This genuinely helps.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            You can safely close this tab.
          </p>
        </div>
      );
    }

    return (
      <div
        className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 sm:p-6"
        style={{ background: "rgba(20,18,16,0.45)", backdropFilter: "blur(4px)" }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Thank you"
          className="relative mt-[5vh] mb-10 w-full max-w-lg rounded-3xl border border-border bg-card p-7 md:p-9 shadow-[0_24px_80px_rgba(0,0,0,0.20)]"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setModalOpen(false)}
            className="absolute right-4 top-4 size-8 rounded-full grid place-items-center text-muted-foreground hover:bg-accent transition-colors"
          >
            <X className="size-4" />
          </button>

          <SectionLabel>Received</SectionLabel>
          <h2 className="mt-4 text-2xl md:text-3xl font-semibold tracking-tight">
            Thank you{doneName ? `, ${doneName}` : ""}.{" "}
            <span className="serif-italic">This genuinely helps.</span>
          </h2>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Your answers go straight into shaping how <Brand /> works.
            Nothing you shared is sold or made public.
          </p>

          {/* Share */}
          <div className="mt-7 border-t border-border pt-6">
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Pass it on
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you know other senior leaders who would have a view, sharing
              this would mean a great deal.
            </p>
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <input
                readOnly
                value={shareUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-muted-foreground outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.share) {
                    navigator
                      .share({ title: "TheBigIntro", url: shareUrl })
                      .catch(() => {});
                  } else {
                    copyShareLink();
                  }
                }}
                className="shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:bg-primary transition-colors"
              >
                {shareCopied ? (
                  <>
                    <Check className="size-4" /> Copied
                  </>
                ) : (
                  "Share"
                )}
              </button>
            </div>
          </div>

          {/* Copy of answers */}
          <div className="mt-6 border-t border-border pt-6">
            <span className="block text-[15px] font-medium text-foreground mb-3">
              Would you like a copy of your answers?
            </span>
            <Pills
              ariaLabel="Copy of answers"
              options={["Yes", "No"]}
              value={wantsCopy}
              onChange={setWantsCopy}
            />

            {wantsCopy === "Yes" && copyState !== "sent" && (
              <div className="reveal reveal-1 mt-4 flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={copyEmail}
                  onChange={(e) => {
                    setCopyEmail(e.target.value);
                    if (copyState === "error") setCopyState("idle");
                  }}
                  placeholder="you@company.com"
                  className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-primary"
                />
                <button
                  type="button"
                  disabled={copyState === "sending"}
                  onClick={sendCopyRequest}
                  className="shrink-0 inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-3 text-sm font-medium hover:border-[color:var(--border-strong)] transition-colors disabled:opacity-50"
                >
                  {copyState === "sending" ? "Sending…" : "Send me a copy"}
                </button>
              </div>
            )}
            {copyState === "error" && wantsCopy === "Yes" && (
              <p className="mt-2 text-sm" style={{ color: "var(--primary)" }}>
                Please enter a valid email address.
              </p>
            )}
            {copyState === "sent" && (
              <p className="mt-3 text-sm text-muted-foreground">
                Noted. I will send your answers to{" "}
                <span className="text-foreground">{copyEmail.trim()}</span>.
              </p>
            )}
          </div>

          <div className="mt-7 text-center">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sectionCls =
    "border-t border-border pt-10 mt-10 first:border-0 first:pt-0 first:mt-0";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-3xl border border-border bg-card p-6 md:p-10"
    >
      {/* Honeypot */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      {/* ── About you ─────────────────────────────────────────────── */}
      <section className={sectionCls}>
        <SectionLabel>About you</SectionLabel>
        <div className="mt-6 space-y-5">
          <Field label="Full name" required>
            <input
              className={inputCls}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
            />
          </Field>
          <Field label="Title or role" required>
            <input
              className={inputCls}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Chief Financial Officer"
            />
          </Field>
          <Field label="Company" required>
            <input
              className={inputCls}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company name"
            />
          </Field>
        </div>
      </section>

      {/* ── The model ─────────────────────────────────────────────── */}
      <section className={sectionCls}>
        <SectionLabel>The model</SectionLabel>
        <div className="mt-6 space-y-8">
          <Field
            label="What charity amount would make a meeting worth your time?"
            required
          >
            <Pills
              ariaLabel="Charity amount"
              options={["$200", "$400", "$600", "$800", "$1,000", "More than $1,000"]}
              value={charityAmount}
              onChange={setCharityAmount}
            />
          </Field>

          <Field
            label="Would charity donated in exchange for your time be a conflict of interest for you or the business?"
            required
          >
            <Pills
              ariaLabel="Conflict of interest"
              options={["No, not at all", "It depends", "Yes, it could be"]}
              value={conflictOfInterest}
              onChange={setConflictOfInterest}
            />
          </Field>

          {conflictOfInterest === "It depends" && (
            <div className="reveal reveal-1">
              <Field label="If it depends, what would make it a problem?">
                <textarea
                  className={areaCls}
                  value={conflictDetail}
                  onChange={(e) => setConflictDetail(e.target.value)}
                  placeholder="A sentence is plenty."
                />
              </Field>
            </div>
          )}

          <Field label="Set the charity aside. What else would make this worth your time / join the platform?">
            <MultiSelectDropdown
              placeholder="Select all that apply"
              options={[
                "1:1 with other senior executives",
                "Curated peer or network events",
                "Genuinely relevant vendor conversations",
                "A personal gift per meeting",
                "Nothing, the charity is the point",
                "Other",
              ]}
              value={beyondCharity}
              onChange={setBeyondCharity}
            />
            {beyondCharity.includes("Other") && (
              <div className="reveal reveal-1 mt-3">
                <input
                  className={inputCls}
                  value={beyondCharityOther}
                  onChange={(e) => setBeyondCharityOther(e.target.value)}
                  placeholder="Tell me what else"
                />
              </div>
            )}
          </Field>
        </div>
      </section>

      {/* ── Joining ───────────────────────────────────────────────── */}
      <section className={sectionCls}>
        <SectionLabel>Joining</SectionLabel>
        <div className="mt-6 space-y-8">
          <Field
            label="What would you need to see on the platform before you'd consider joining?"
            required
            help={NEED_TO_SEE_SUGGESTIONS}
          >
            <textarea
              className={areaCls}
              value={needToSee}
              onChange={(e) => setNeedToSee(e.target.value)}
              placeholder="A few sentences is plenty."
            />
          </Field>

          <Field label="If you joined, how many meetings would you take per year?">
            <Pills
              ariaLabel="Meetings per year"
              options={["1–3", "4–6", "7–12", "12+", "Not sure"]}
              value={meetingsPerYear}
              onChange={setMeetingsPerYear}
            />
          </Field>
        </div>
      </section>

      {/* ── Better matching ───────────────────────────────────────── */}
      <section className={sectionCls}>
        <SectionLabel>Better matching</SectionLabel>
        <div className="mt-6 space-y-8">
          <Field
            label="Would you appreciate a meeting with a vendor more if what they offer aligns with a current challenge or interest of the business?"
            required
          >
            <Pills
              ariaLabel="Alignment matters"
              options={["Yes", "No"]}
              value={alignMatters}
              onChange={setAlignMatters}
            />
          </Field>

          {alignMatters === "Yes" && (
            <div
              className="reveal reveal-1 rounded-2xl p-5 md:p-6 space-y-8"
              style={{ background: "var(--mint-tint)" }}
            >
              <Field label="If you joined, would you invest 5 minutes answering a questionnaire on the platform so I could match you with more relevant vendor meetings?">
                <Pills
                  ariaLabel="Questionnaire willing"
                  options={["Yes", "No"]}
                  value={questionnaireWilling}
                  onChange={setQuestionnaireWilling}
                />
              </Field>
              <Field label="Could I share those answers with the vendor you're meeting so they could come prepared with an aligned agenda?">
                <Pills
                  ariaLabel="Share answers with vendor"
                  options={["Yes", "No"]}
                  value={shareWithVendor}
                  onChange={setShareWithVendor}
                />
              </Field>
              <Field label="Would making this questionnaire about your current interests and business goals mandatory put you off from joining the business?">
                <Pills
                  ariaLabel="Mandatory questionnaire"
                  options={["Yes", "No"]}
                  value={mandatoryPutOff}
                  onChange={setMandatoryPutOff}
                />
              </Field>
            </div>
          )}
        </div>
      </section>

      {/* ── A few last things ─────────────────────────────────────── */}
      <section className={sectionCls}>
        <SectionLabel>A few last things</SectionLabel>
        <div className="mt-6 space-y-8">
          <Field label="Biggest concern or objection with this model?">
            <textarea
              className={areaCls}
              value={biggestConcern}
              onChange={(e) => setBiggestConcern(e.target.value)}
              placeholder="Optional. The sharper the better."
            />
          </Field>
          <Field label="Anything else you want to tell me?">
            <textarea
              className={areaCls}
              value={anythingElse}
              onChange={(e) => setAnythingElse(e.target.value)}
              placeholder="Optional."
            />
          </Field>
          <Field label="Is this platform something you would refer to a peer to join?">
            <Pills
              ariaLabel="Would refer"
              options={["Yes", "Maybe", "No"]}
              value={wouldRefer}
              onChange={setWouldRefer}
            />
          </Field>
        </div>
      </section>

      {/* ── The very last question ────────────────────────────────── */}
      <section className={sectionCls}>
        <SectionLabel>One last thing</SectionLabel>
        <div className="mt-6">
          <Field label="Would you join when the platform is ready?" required>
            <Pills
              ariaLabel="Join when ready"
              options={["Yes", "Maybe, with conditions", "No"]}
              value={joinWhenReady}
              onChange={setJoinWhenReady}
            />
          </Field>
        </div>
      </section>

      {/* ── Privacy + consent ─────────────────────────────────────── */}
      <section className={sectionCls}>
        <SectionLabel>Your privacy</SectionLabel>
        <div
          className="mt-6 rounded-2xl p-5 md:p-6"
          style={{ background: "var(--stone-tint)" }}
        >
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your answers are used only to research and shape <Brand /> while
            it is being designed. They are not sold, not shared with vendors,
            and never published anywhere public. Responses are kept in a
            private working spreadsheet only I can see. You can ask me to
            delete your response at any time.
          </p>
          <label className="mt-5 flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 size-4 shrink-0 accent-[color:var(--primary)]"
            />
            <span className="text-sm leading-relaxed">
              I&apos;m happy for my answers to be used privately to help shape{" "}
              <Brand />, and I understand they will not be sold or made
              public.
            </span>
          </label>
        </div>
      </section>

      {error && (
        <p
          className="mt-8 rounded-xl px-4 py-3 text-sm"
          style={{ background: "var(--stone-soft)", color: "var(--foreground)" }}
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="mt-8">
        <button
          type="submit"
          disabled={submitting}
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-6 py-3.5 text-sm font-medium hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Sending…" : "Send my answers"}
          {!submitting && (
            <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
          )}
        </button>
      </div>
    </form>
  );
}
