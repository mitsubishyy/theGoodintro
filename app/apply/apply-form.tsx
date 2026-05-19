"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   Field primitives — match TheBigIntro tokens (mono labels,
   warm card surfaces, emerald focus, pill selectors).
   ──────────────────────────────────────────────────────────────── */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-2">
      {children}
    </span>
  );
}

function Field({
  label,
  hint,
  children,
  required,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <Label>
        {label}
        {required ? <span style={{ color: "var(--primary)" }}> *</span> : null}
      </Label>
      {hint ? (
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
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

function MultiPills({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  ariaLabel: string;
}) {
  function toggle(o: string) {
    onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  }
  return (
    <div aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(o)}
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

/* ────────────────────────────────────────────────────────────────
   The form
   ──────────────────────────────────────────────────────────────── */

export default function ApplyForm() {
  // About you
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [industry, setIndustry] = useState("");

  // The model
  const [charityAmount, setCharityAmount] = useState("");
  const [conflictOfInterest, setConflictOfInterest] = useState("");
  const [conflictDetail, setConflictDetail] = useState("");
  const [beyondCharity, setBeyondCharity] = useState<string[]>([]);

  // Joining
  const [outreachVolume, setOutreachVolume] = useState("");
  const [outreachToday, setOutreachToday] = useState("");
  const [needToSee, setNeedToSee] = useState("");
  const [meetingsPerYear, setMeetingsPerYear] = useState("");
  const [meetingLength, setMeetingLength] = useState("");
  const [joinWhenReady, setJoinWhenReady] = useState("");

  // Better matching
  const [alignMatters, setAlignMatters] = useState("");
  const [questionnaireWilling, setQuestionnaireWilling] = useState("");
  const [priorities, setPriorities] = useState("");
  const [relevantCategories, setRelevantCategories] = useState<string[]>([]);

  // Last things
  const [wouldRefer, setWouldRefer] = useState("");
  const [impactProfile, setImpactProfile] = useState("");
  const [biggestConcern, setBiggestConcern] = useState("");
  const [anythingElse, setAnythingElse] = useState("");

  // Privacy + meta
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [utm, setUtm] = useState({ source: "", medium: "", campaign: "" });

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [doneName, setDoneName] = useState("");

  useEffect(() => {
    setUtm({
      source: readUtm("utm_source"),
      medium: readUtm("utm_medium"),
      campaign: readUtm("utm_campaign"),
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) return setError("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return setError("Please enter a valid email address.");
    if (!title.trim()) return setError("Please enter your title or role.");
    if (!company.trim()) return setError("Please enter your company.");
    if (!charityAmount)
      return setError("Please pick a charity amount that would be worth your time.");
    if (!conflictOfInterest)
      return setError("Please answer whether charity is a conflict of interest.");
    if (needToSee.trim().length < 10)
      return setError("Please say what you'd need to see before joining.");
    if (!joinWhenReady)
      return setError("Please answer whether you'd join when it's ready.");
    if (!alignMatters)
      return setError("Please answer the relevance question.");
    if (!consent)
      return setError(
        "Please confirm you're happy for your answers to be used to shape the platform.",
      );

    setSubmitting(true);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          title: title.trim(),
          company: company.trim(),
          companySize,
          industry: industry.trim(),
          charityAmount,
          conflictOfInterest,
          conflictDetail: conflictDetail.trim(),
          beyondCharity: beyondCharity.join("; "),
          outreachVolume,
          outreachToday,
          needToSee: needToSee.trim(),
          meetingsPerYear,
          meetingLength,
          joinWhenReady,
          alignMatters,
          questionnaireWilling,
          priorities: priorities.trim(),
          relevantCategories: relevantCategories.join("; "),
          wouldRefer,
          impactProfile,
          biggestConcern: biggestConcern.trim(),
          anythingElse: anythingElse.trim(),
          consent,
          website,
          utmSource: utm.source,
          utmMedium: utm.medium,
          utmCampaign: utm.campaign,
        }),
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
    return (
      <div className="rounded-3xl border border-border bg-card p-8 md:p-12 text-center">
        <SectionLabel>Received</SectionLabel>
        <h2 className="mt-5 text-3xl md:text-4xl font-semibold tracking-tight">
          Thank you{doneName ? `, ${doneName}` : ""}.{" "}
          <span className="serif-italic">This genuinely helps.</span>
        </h2>
        <p className="mt-5 text-muted-foreground leading-relaxed max-w-xl mx-auto">
          Your answers go straight into shaping how TheBigIntro works. If
          anything you said is worth a longer conversation, I will reach out
          personally. Nothing you shared is sold or made public.
        </p>
      </div>
    );
  }

  const sectionCls = "border-t border-border pt-10 mt-10 first:border-0 first:pt-0 first:mt-0";

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-3xl border border-border bg-card p-6 md:p-10">
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
        <div className="mt-6 grid sm:grid-cols-2 gap-5">
          <Field label="Full name" required>
            <input className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
          </Field>
          <Field label="Work email" required hint="So I can follow up if you're open to it. Never shared.">
            <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" />
          </Field>
          <Field label="Title or role" required>
            <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Chief Financial Officer" />
          </Field>
          <Field label="Company" required>
            <input className={inputCls} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" />
          </Field>
          <Field label="Company size">
            <Pills ariaLabel="Company size" options={["1–50", "51–200", "201–1,000", "1,000+"]} value={companySize} onChange={setCompanySize} />
          </Field>
          <Field label="Industry or sector">
            <input className={inputCls} value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Financial services, SaaS, Healthcare" />
          </Field>
        </div>
      </section>

      {/* ── The model ─────────────────────────────────────────────── */}
      <section className={sectionCls}>
        <SectionLabel>The model</SectionLabel>
        <div className="mt-6 space-y-6">
          <Field label="What charity amount would make a meeting worth your time?" required>
            <Pills ariaLabel="Charity amount" options={["$200", "$400", "$600", "$800", "$1,000", "More than $1,000"]} value={charityAmount} onChange={setCharityAmount} />
          </Field>
          <Field label="Is charity a conflict of interest in accepting a meeting?" required hint="Could your business view it as a bribe or inducement?">
            <Pills ariaLabel="Conflict of interest" options={["No, not at all", "Possibly, it depends", "Yes, it could be"]} value={conflictOfInterest} onChange={setConflictOfInterest} />
          </Field>
          <Field label="If it depends, what would make it a problem?">
            <textarea className={areaCls} value={conflictDetail} onChange={(e) => setConflictDetail(e.target.value)} placeholder="Optional. A sentence is plenty." />
          </Field>
          <Field label="Set the charity aside. What else would make this worth your time?" hint="Select any that apply.">
            <MultiPills ariaLabel="Beyond charity" options={["1:1 with other senior executives", "Curated peer or network events", "Genuinely relevant vendor conversations", "A personal gift per meeting", "Nothing, the charity is the point", "Other"]} value={beyondCharity} onChange={setBeyondCharity} />
          </Field>
        </div>
      </section>

      {/* ── Joining ───────────────────────────────────────────────── */}
      <section className={sectionCls}>
        <SectionLabel>Joining</SectionLabel>
        <div className="mt-6 space-y-6">
          <Field label="How much unsolicited vendor outreach do you get in a typical week?">
            <Pills ariaLabel="Outreach volume" options={["Barely any", "A handful", "10–30", "30+"]} value={outreachVolume} onChange={setOutreachVolume} />
          </Field>
          <Field label="How do you handle most of it today?">
            <Pills ariaLabel="Outreach today" options={["Ignore or delete", "Delegate to a team", "Occasionally take one", "Depends on relevance"]} value={outreachToday} onChange={setOutreachToday} />
          </Field>
          <Field label="What would you need to see before you'd consider joining?" required hint="Be honest. This is the most useful answer for me.">
            <textarea className={areaCls} value={needToSee} onChange={(e) => setNeedToSee(e.target.value)} placeholder="A few sentences is plenty." />
          </Field>
          <Field label="If you joined, how many meetings would you take per year?">
            <Pills ariaLabel="Meetings per year" options={["1–3", "4–6", "7–12", "12+", "Not sure"]} value={meetingsPerYear} onChange={setMeetingsPerYear} />
          </Field>
          <Field label="Preferred meeting length">
            <Pills ariaLabel="Meeting length" options={["15 min", "30 min", "45 min or more", "No preference"]} value={meetingLength} onChange={setMeetingLength} />
          </Field>
          <Field label="Would you join when the platform is ready?" required>
            <Pills ariaLabel="Join when ready" options={["Yes", "Maybe, with conditions", "No"]} value={joinWhenReady} onChange={setJoinWhenReady} />
          </Field>
        </div>
      </section>

      {/* ── Better matching (Q6 + conditional) ────────────────────── */}
      <section className={sectionCls}>
        <SectionLabel>Better matching</SectionLabel>
        <div className="mt-6 space-y-6">
          <Field label="Would you be more likely to accept a meeting with a vendor that aligns with a current challenge or interest of the business?" required>
            <Pills ariaLabel="Alignment matters" options={["Yes", "No"]} value={alignMatters} onChange={setAlignMatters} />
          </Field>

          {alignMatters === "Yes" && (
            <div
              className="reveal reveal-1 rounded-2xl p-5 md:p-6 space-y-6"
              style={{ background: "var(--mint-tint)" }}
            >
              <Field label="Would you answer a short questionnaire so I can match you with more relevant vendor meetings?">
                <Pills ariaLabel="Questionnaire willing" options={["Yes", "No"]} value={questionnaireWilling} onChange={setQuestionnaireWilling} />
              </Field>
              <Field label="What are 1 to 3 current priorities or challenges you'd actually take a relevant conversation about?">
                <textarea className={areaCls} value={priorities} onChange={(e) => setPriorities(e.target.value)} placeholder="Optional now, but it helps me understand what good matching looks like." />
              </Field>
              <Field label="Which solution areas are relevant to you right now?">
                <MultiPills ariaLabel="Relevant categories" options={["Security", "Data & analytics", "AI / ML", "Finance & ops", "HR & people", "Sales & marketing tech", "Cloud & infrastructure", "Other"]} value={relevantCategories} onChange={setRelevantCategories} />
              </Field>
            </div>
          )}
        </div>
      </section>

      {/* ── A few last things ─────────────────────────────────────── */}
      <section className={sectionCls}>
        <SectionLabel>A few last things</SectionLabel>
        <div className="mt-6 space-y-6">
          <Field label="Would you refer a peer to this?">
            <Pills ariaLabel="Would refer" options={["Yes", "Maybe", "No"]} value={wouldRefer} onChange={setWouldRefer} />
          </Field>
          <Field label="Interest in a shareable profile showing the total you've directed to charity through these meetings?" hint="Think a public, LinkedIn-shareable tally of your giving.">
            <Pills ariaLabel="Impact profile" options={["Yes, I'd share that", "Neutral", "No, keep it private"]} value={impactProfile} onChange={setImpactProfile} />
          </Field>
          <Field label="Biggest concern or objection with this model?">
            <textarea className={areaCls} value={biggestConcern} onChange={(e) => setBiggestConcern(e.target.value)} placeholder="Optional. The sharper the better." />
          </Field>
          <Field label="Anything else you want to tell me?">
            <textarea className={areaCls} value={anythingElse} onChange={(e) => setAnythingElse(e.target.value)} placeholder="Optional." />
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
            Your answers are used only to research and shape TheBigIntro while
            it is being designed. They are not sold, not shared with vendors,
            and never published anywhere public. Responses are kept in a
            private working spreadsheet only I can see. You can ask me to
            delete your response at any time by replying to my email.
          </p>
          <label className="mt-5 flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 size-4 shrink-0 accent-[color:var(--primary)]"
            />
            <span className="text-sm leading-relaxed">
              I&apos;m happy for my answers to be used privately to help shape
              TheBigIntro, and I understand they will not be sold or made
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

      <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
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
        <span className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
          Takes about 4 minutes
        </span>
      </div>
    </form>
  );
}
