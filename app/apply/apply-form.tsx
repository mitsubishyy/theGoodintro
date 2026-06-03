"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, ChevronDown, Check, X } from "lucide-react";
import Brand from "../_components/brand";
import { SITE_URL } from "@/lib/config";

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
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background";
const areaCls =
  "w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background resize-y min-h-[110px]";

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
  collapseOn,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  collapseOn?: string;
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
    // The free-text option collapses the list and hands focus to the box.
    if (collapseOn && o === collapseOn) setOpen(false);
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
          className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-border bg-card p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.10)]"
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
      <span className="h-px w-6" style={{ background: "var(--border-strong)" }} />
      {children}
    </div>
  );
}

/* ── Answer option sets ─────────────────────────────────────────── */

const CHARITY_THEMES = [
  "Cancer",
  "Children & families",
  "Mental health",
  "Medical research & health",
  "Education & young people",
  "Poverty & food relief",
  "Homelessness",
  "Environment & wildlife",
  "First Nations communities",
  "International aid & development",
  "Animal welfare",
  "Type your answer",
];

const BEYOND_OPTS = [
  "1:1 with other senior executives",
  "Curated peer or network events",
  "Genuinely relevant vendor conversations",
  "A personal gift per meeting",
  "Nothing, the charity is the point",
  "Other",
];

const VENDOR_PROVIDE_OPTS = [
  "The specific initiative or problem they are addressing",
  "Why it is relevant to my company right now",
  "Who they are and who they already work with",
  "Other",
];

const NEED_TO_SEE_OPTS = [
  "Proof other senior leaders are already in",
  "Named charities, and that donations are genuinely paid",
  "Who is behind it",
  "The calibre bar applied to vendors",
  "An introduction from someone I trust",
  "Nothing, the idea is enough on its own",
  "Other",
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
  const [charityTheme, setCharityTheme] = useState<string[]>([]);
  const [charityThemeOther, setCharityThemeOther] = useState("");
  const [beyondCharity, setBeyondCharity] = useState<string[]>([]);
  const [beyondCharityOther, setBeyondCharityOther] = useState("");

  // Relevance
  const [vendorMustProvide, setVendorMustProvide] = useState<string[]>([]);
  const [vendorMustProvideOther, setVendorMustProvideOther] = useState("");
  const [needToSee, setNeedToSee] = useState<string[]>([]);
  const [needToSeeOther, setNeedToSeeOther] = useState("");
  const [questionnaireWilling, setQuestionnaireWilling] = useState("");
  const [shareWithVendor, setShareWithVendor] = useState("");

  // Last things
  const [guidance, setGuidance] = useState("");
  const [wouldRefer, setWouldRefer] = useState("");

  // The waitlist question
  const [joinWhenReady, setJoinWhenReady] = useState("");

  // Privacy + meta
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const searchParams = useSearchParams();
  const utm = {
    source: searchParams.get("utm_source")?.slice(0, 100) ?? "",
    medium: searchParams.get("utm_medium")?.slice(0, 100) ?? "",
    campaign: searchParams.get("utm_campaign")?.slice(0, 100) ?? "",
    content: searchParams.get("utm_content")?.slice(0, 100) ?? "",
  };

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [doneName, setDoneName] = useState("");

  // Thank-you popup
  const [modalOpen, setModalOpen] = useState(true);
  const shareUrl = `${SITE_URL}/apply`;
  const [shareCopied, setShareCopied] = useState(false);
  const [wantsCopy, setWantsCopy] = useState("");
  const [copyEmail, setCopyEmail] = useState("");
  const [copyState, setCopyState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(
    null,
  );

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

  // Conditional "other" boxes are cleared inline when their trigger is
  // deselected (see the onChange handlers below), so no effect is needed.

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!consent)
      return setError(
        "Please confirm you're happy for your answers to be used to shape TheGoodIntro.",
      );

    setSubmitting(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        title: title.trim(),
        company: company.trim(),
        charityAmount,
        charityTheme: charityTheme.join("; "),
        charityThemeOther: charityThemeOther.trim(),
        beyondCharity: beyondCharity.join("; "),
        beyondCharityOther: beyondCharityOther.trim(),
        vendorMustProvide: vendorMustProvide.join("; "),
        vendorMustProvideOther: vendorMustProvideOther.trim(),
        needToSee: needToSee.join("; "),
        needToSeeOther: needToSeeOther.trim(),
        questionnaireWilling,
        shareWithVendor,
        guidance: guidance.trim(),
        wouldRefer,
        joinWhenReady,
        consent,
        website,
        utmSource: utm.source,
        utmMedium: utm.medium,
        utmCampaign: utm.campaign,
        utmContent: utm.content,
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
            Thanks for taking the time to help a stranger shape something
            good. If you ticked Yes on the last question, I&apos;ll be in
            touch soon. Looking forward to saying hi properly.
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
                      .share({ title: "TheGoodIntro", url: shareUrl })
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
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          All optional. If you would feel better answering anonymously, leave
          any of these blank.
        </p>
        <div className="mt-6 space-y-5">
          <Field label="Full name">
            <input
              className={inputCls}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
            />
          </Field>
          <Field label="Title or role">
            <input
              className={inputCls}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Chief Financial Officer"
            />
          </Field>
          <Field label="Company">
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
          <Field label="What charity amount would make a meeting worth your time?">
            <Pills
              ariaLabel="Charity amount"
              options={[
                "$200",
                "$400",
                "$600",
                "$800",
                "$1,000",
                "More than $1,000",
              ]}
              value={charityAmount}
              onChange={setCharityAmount}
            />
          </Field>

          <Field label="Is there a cause that sits close to you that you would want supported on TheGoodIntro?">
            <MultiSelectDropdown
              placeholder="Select all that apply"
              options={CHARITY_THEMES}
              value={charityTheme}
              collapseOn="Type your answer"
              onChange={(v) => {
                setCharityTheme(v);
                if (!v.includes("Type your answer")) setCharityThemeOther("");
              }}
            />
            {charityTheme.includes("Type your answer") && (
              <div className="reveal reveal-1 mt-3">
                <input
                  autoFocus
                  className={inputCls}
                  value={charityThemeOther}
                  onChange={(e) => setCharityThemeOther(e.target.value)}
                  placeholder="Type the charity or cause you want to support"
                />
              </div>
            )}
          </Field>

          <Field label="Set the charity aside. What else would make this worth your time, or make you want to join?">
            <MultiSelectDropdown
              placeholder="Select all that apply"
              options={BEYOND_OPTS}
              value={beyondCharity}
              collapseOn="Other"
              onChange={(v) => {
                setBeyondCharity(v);
                if (!v.includes("Other")) setBeyondCharityOther("");
              }}
            />
            {beyondCharity.includes("Other") && (
              <div className="reveal reveal-1 mt-3">
                <input
                  autoFocus
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

      {/* ── Relevance ─────────────────────────────────────────────── */}
      <section className={sectionCls}>
        <SectionLabel>Relevance</SectionLabel>
        <div className="mt-6 space-y-8">
          <Field label="Before you would take a conversation, what would you need each vendor to provide so you can decide whether it is relevant?">
            <MultiSelectDropdown
              placeholder="Select all that apply"
              options={VENDOR_PROVIDE_OPTS}
              value={vendorMustProvide}
              collapseOn="Other"
              onChange={(v) => {
                setVendorMustProvide(v);
                if (!v.includes("Other")) setVendorMustProvideOther("");
              }}
            />
            {vendorMustProvide.includes("Other") && (
              <div className="reveal reveal-1 mt-3">
                <input
                  autoFocus
                  className={inputCls}
                  value={vendorMustProvideOther}
                  onChange={(e) => setVendorMustProvideOther(e.target.value)}
                  placeholder="What else would you need from them"
                />
              </div>
            )}
          </Field>

          <Field label="What would you need to see on the platform before you would join?">
            <MultiSelectDropdown
              placeholder="Select all that apply"
              options={NEED_TO_SEE_OPTS}
              value={needToSee}
              collapseOn="Other"
              onChange={(v) => {
                setNeedToSee(v);
                if (!v.includes("Other")) setNeedToSeeOther("");
              }}
            />
            {needToSee.includes("Other") && (
              <div className="reveal reveal-1 mt-3">
                <input
                  autoFocus
                  className={inputCls}
                  value={needToSeeOther}
                  onChange={(e) => setNeedToSeeOther(e.target.value)}
                  placeholder="What else would you need to see"
                />
              </div>
            )}
          </Field>

          <Field label="To keep every conversation relevant, would you spend five minutes telling us your current priorities?">
            <Pills
              ariaLabel="Would do the priorities step"
              options={["Yes", "No"]}
              value={questionnaireWilling}
              onChange={setQuestionnaireWilling}
            />
          </Field>

          <Field label="And would you let the vendor see those priorities, so they arrive prepared and on point?">
            <Pills
              ariaLabel="Share priorities with the vendor"
              options={["Yes", "No"]}
              value={shareWithVendor}
              onChange={setShareWithVendor}
            />
          </Field>
        </div>
      </section>

      {/* ── A few last things ─────────────────────────────────────── */}
      <section className={sectionCls}>
        <SectionLabel>A few last things</SectionLabel>
        <div className="mt-6 space-y-8">
          <Field label="Any guidance for me as I'm building this?">
            <textarea
              className={areaCls}
              value={guidance}
              onChange={(e) => setGuidance(e.target.value)}
              placeholder="Optional. The sharper the better."
            />
          </Field>
          <Field label="Would you point a peer toward this?">
            <Pills
              ariaLabel="Would refer a peer"
              options={["Yes", "Maybe", "No"]}
              value={wouldRefer}
              onChange={setWouldRefer}
            />
          </Field>
          <Field label="Would you join when the platform is ready?">
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
