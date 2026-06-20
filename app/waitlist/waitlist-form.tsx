"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Check, ChevronDown, X } from "lucide-react";

const inputCls =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background";
const areaCls =
  "w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background resize-y min-h-[96px]";

// Personal / free-mail domains the waitlist does not accept. Work email only.
// Kept in sync with the same list in app/api/waitlist/route.ts.
const BLOCKED_EMAIL_DOMAINS = [
  // Google
  "gmail.com", "googlemail.com",
  // Microsoft
  "outlook.com", "outlook.com.au", "hotmail.com", "hotmail.co.uk",
  "hotmail.com.au", "live.com", "live.com.au", "msn.com",
  // Apple
  "icloud.com", "me.com", "mac.com",
  // Yahoo
  "yahoo.com", "yahoo.com.au", "yahoo.co.uk", "ymail.com", "rocketmail.com",
  // Other free webmail
  "aol.com", "proton.me", "protonmail.com", "gmx.com", "gmx.net",
  "mail.com", "zoho.com", "yandex.com", "fastmail.com", "tutanota.com",
  "hey.com", "pm.me",
  // Australian ISP personal addresses
  "bigpond.com", "bigpond.net.au", "optusnet.com.au", "iinet.net.au",
  "internode.on.net", "tpg.com.au", "ozemail.com.au", "dodo.com.au",
];

const EXEC_TOPIC_OPTS = [
  "Not sure yet",
  "AI & automation",
  "Cybersecurity",
  "Customer experience",
  "Data & analytics",
  "Finance & accounting",
  "HR & people operations",
  "IT & infrastructure",
  "Marketing & growth",
  "Operations & supply chain",
  "Procurement",
  "Product & engineering",
  "Sales & RevOps",
  "Other",
];

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

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="block text-[15px] md:text-base font-medium text-foreground mb-3 leading-snug">
        {label}
        {required ? <span style={{ color: "var(--primary)" }}> *</span> : null}
      </span>
      {children}
    </div>
  );
}

export default function WaitlistForm() {
  const search = useSearchParams();

  const [audience, setAudience] = useState<"executive" | "vendor" | "">("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");

  // Executive-only
  const [execTopics, setExecTopics] = useState<string[]>([]);
  const [execTopicsOther, setExecTopicsOther] = useState("");

  // Vendor-only
  const [vendorOffer, setVendorOffer] = useState("");
  const [vendorIcp, setVendorIcp] = useState("");
  const [vendorWebsite, setVendorWebsite] = useState("");

  const [website, setWebsite] = useState(""); // honeypot

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [doneName, setDoneName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const [utm, setUtm] = useState({
    source: "",
    medium: "",
    campaign: "",
    content: "",
  });

  useEffect(() => {
    setUtm({
      source: search.get("utm_source") || "",
      medium: search.get("utm_medium") || "",
      campaign: search.get("utm_campaign") || "",
      content: search.get("utm_content") || "",
    });
  }, [search]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEmailError(null);

    if (!audience) {
      setError("Please tell us whether you are joining as an executive or a vendor.");
      return;
    }

    if (!email.trim()) {
      setEmailError("Please enter your work email so we can be in touch.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("That email does not look valid. Please check it.");
      return;
    }

    const emailDomain = email.trim().split("@")[1]?.toLowerCase() ?? "";
    if (BLOCKED_EMAIL_DOMAINS.includes(emailDomain)) {
      setEmailError(
        "Please use your work email. Personal addresses (Gmail, Outlook, iCloud) are not accepted.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        audience,
        fullName: fullName.trim(),
        email: email.trim(),
        title: title.trim(),
        company: company.trim(),
        execTopics: audience === "executive" ? execTopics.join("; ") : "",
        execTopicsOther:
          audience === "executive" && execTopics.includes("Other")
            ? execTopicsOther.trim()
            : "",
        vendorOffer: audience === "vendor" ? vendorOffer.trim() : "",
        vendorIcp: audience === "vendor" ? vendorIcp.trim() : "",
        vendorWebsite: audience === "vendor" ? vendorWebsite.trim() : "",
        website,
        utmSource: utm.source,
        utmMedium: utm.medium,
        utmCampaign: utm.campaign,
        utmContent: utm.content,
      };
      const res = await fetch("/api/waitlist", {
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
      setModalOpen(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitting(false);
      setError("Network error. Please try again.");
    }
  }

  if (done) {
    return (
      <>
        <div className="rounded-3xl border border-border bg-card p-8 md:p-12 text-center">
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            You&apos;re on the list
          </div>
          <h2 className="mt-5 text-2xl md:text-3xl font-semibold tracking-tight">
            Thank you{doneName ? `, ${doneName}` : ""}.{" "}
            <span className="serif-italic">Talk soon.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            We will be in touch when the next cohort opens.
          </p>
        </div>

        {modalOpen && (
          <div
            className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 sm:p-6"
            style={{ background: "rgba(20,18,16,0.45)", backdropFilter: "blur(4px)" }}
            onClick={() => setModalOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Thank you for expressing your interest"
              className="relative mt-[8vh] mb-10 w-full max-w-lg rounded-3xl border border-border bg-card p-8 md:p-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.20)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Close"
                onClick={() => setModalOpen(false)}
                className="absolute right-4 top-4 size-8 rounded-full grid place-items-center text-muted-foreground hover:bg-accent transition-colors"
              >
                <X className="size-4" />
              </button>

              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                You&apos;re on the list
              </div>
              <h2 className="mt-5 text-2xl md:text-3xl font-semibold tracking-tight">
                Thank you for expressing your{" "}
                <span className="serif-italic">interest</span>
                {doneName ? `, ${doneName}` : ""}.
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                We will be in touch when the next cohort opens.
              </p>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="mt-8 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

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

      <div className="space-y-5">
        <Field label="I'm joining as" required>
          <div className="flex flex-col sm:flex-row gap-2">
            {(
              [
                { key: "executive", label: "An executive" },
                { key: "vendor", label: "A vendor" },
              ] as const
            ).map((opt) => {
              const selected = audience === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setAudience(opt.key)}
                  className={
                    "flex-1 rounded-xl border px-4 py-3 text-base font-medium transition-colors " +
                    (selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-[color:var(--border-strong)]")
                  }
                  aria-pressed={selected}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </Field>

        {audience && (
          <>
            <Field label="Full name">
              <input
                className={inputCls}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                autoComplete="name"
              />
            </Field>

            <Field label="Work email" required>
              {emailError ? (
                <p className="mb-3 text-sm" style={{ color: "var(--primary)" }}>
                  {emailError}
                </p>
              ) : null}
              <input
                type="email"
                className={inputCls}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                placeholder="jane@company.com"
                autoComplete="email"
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

            {audience === "executive" && (
              <Field label="What kind of vendor conversations would be worth your time?">
                <div className="space-y-3">
                  <MultiSelectDropdown
                    options={EXEC_TOPIC_OPTS}
                    value={execTopics}
                    onChange={setExecTopics}
                    placeholder="Select all that apply"
                    collapseOn="Other"
                  />
                  {execTopics.includes("Other") && (
                    <input
                      className={inputCls}
                      value={execTopicsOther}
                      onChange={(e) => setExecTopicsOther(e.target.value)}
                      placeholder="Tell us in your own words"
                      autoFocus
                    />
                  )}
                </div>
              </Field>
            )}

            {audience === "vendor" && (
              <>
                <Field label="What does your company sell?">
                  <textarea
                    className={areaCls}
                    value={vendorOffer}
                    onChange={(e) => setVendorOffer(e.target.value)}
                    placeholder="One sentence on the product or service."
                  />
                </Field>

                <Field label="Ideal customer profile (role and industry)">
                  <input
                    className={inputCls}
                    value={vendorIcp}
                    onChange={(e) => setVendorIcp(e.target.value)}
                    placeholder="e.g. CFOs at ASX-listed financial services companies"
                  />
                </Field>

                <Field label="Website">
                  <input
                    className={inputCls}
                    value={vendorWebsite}
                    onChange={(e) => setVendorWebsite(e.target.value)}
                    placeholder="https://"
                    autoComplete="url"
                    inputMode="url"
                  />
                </Field>
              </>
            )}
          </>
        )}
      </div>

      {error ? (
        <p className="mt-6 text-sm" style={{ color: "var(--primary)" }}>
          {error}
        </p>
      ) : null}

      {audience && (
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            By joining the waitlist you agree to be contacted about TheGoodIntro.
            No spam. Unsubscribe anytime.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm transition-opacity disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Join the waitlist"}
            <ArrowRight className="size-4" />
          </button>
        </div>
      )}
    </form>
  );
}
