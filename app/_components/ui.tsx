import Link from "next/link";
import { Plus } from "lucide-react";
import { IconCheck, IconX } from "./icons";
import { CALENDLY_URL } from "@/lib/config";

/* ────────────────────────────────────────────────────────────────
   Shared UI primitives used across pages.

   Re-skinned to the HopeRise idiom that the homepage uses: bold-black
   Inter headlines, mint-pill eyebrows, the emerald solid-pill primary
   CTA (with pulse) and the ghost circle-arrow secondary, hairline-bordered
   cards, and the emerald Fraunces-italic emphasis word. Classes live in
   globals.css under the `.hp-*` namespace.
   ──────────────────────────────────────────────────────────────── */

/** Mint eyebrow pill with the emerald dot. Matches the homepage eyebrows. */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="hp-eyebrow">
      <span className="dot" aria-hidden="true" />
      {children}
    </span>
  );
}

/** Solid emerald pill with the live pulse dot. */
export function PrimaryCta({
  href = CALENDLY_URL,
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} className="hp-btn-primary">
      <span className="pulse" aria-hidden="true" />
      {children}
    </a>
  );
}

/** Ghost outlined pill with the rotating circle-arrow. */
export function SecondaryCta({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="hp-btn-ghost">
      {children}
      <span className="circle" aria-hidden="true">
        <svg viewBox="0 0 14 14" fill="none">
          <path
            d="M3 11 L11 3 M5 3 H11 V9"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
}

export function PageHero({
  eyebrow,
  title,
  italicWord,
  lede,
  primaryCta = "Apply as a founding executive",
  primaryHref = CALENDLY_URL,
  secondaryLabel,
  secondaryHref,
  pill,
  illustration,
}: {
  eyebrow: string;
  title: React.ReactNode;
  italicWord?: string;
  lede: string;
  primaryCta?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  pill?: string;
  /** Accepted for API compatibility; the page hero is now flat warm white. */
  bg?: string;
  illustration?: React.ReactNode;
}) {
  const copy = (
    <div className="hp-pagehero-copy">
      <SectionLabel>{eyebrow}</SectionLabel>
      <h1 className="hp-page-title">
        {title}
        {italicWord && (
          <>
            {" "}
            <span className="hp-serif-italic">{italicWord}</span>.
          </>
        )}
      </h1>
      <p className="hp-page-lede">{lede}</p>
      <div
        className={
          "flex flex-wrap items-center gap-3.5 " +
          (illustration ? "" : "justify-center")
        }
      >
        <PrimaryCta href={primaryHref}>{primaryCta}</PrimaryCta>
        {secondaryLabel && secondaryHref && (
          <SecondaryCta href={secondaryHref}>{secondaryLabel}</SecondaryCta>
        )}
      </div>
      {pill && (
        <p className="hp-closing-sub" style={{ marginTop: 0 }}>
          {pill}
        </p>
      )}
    </div>
  );

  return (
    <section className="hp-pagehero">
      {illustration ? (
        <div className="hp-pagehero-inner is-split">
          {copy}
          <div>{illustration}</div>
        </div>
      ) : (
        <div className="hp-pagehero-inner">{copy}</div>
      )}
    </section>
  );
}

export function StepCard({
  n,
  icon: Icon,
  title,
  body,
}: {
  n: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  body: string;
}) {
  return (
    <div
      className="group relative rounded-3xl border p-7 transition-all duration-300 hover:-translate-y-0.5"
      style={{ background: "var(--cream-1)", borderColor: "var(--hair)" }}
    >
      <div className="flex items-center justify-between mb-7">
        <div
          className="size-12 rounded-full grid place-items-center transition-colors group-hover:[background:var(--primary)] group-hover:[color:var(--cream-1)]"
          style={{ background: "var(--mint-tint)", color: "var(--primary-ink)" }}
        >
          <Icon size={22} />
        </div>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.18em]"
          style={{ color: "var(--cream-9)" }}
        >
          {n}
        </span>
      </div>
      <h3
        className="text-xl font-extrabold tracking-[-0.02em]"
        style={{ color: "var(--cream-11)" }}
      >
        {title}
      </h3>
      <p
        className="mt-3 text-[15px] leading-relaxed"
        style={{ color: "var(--cream-9)" }}
      >
        {body}
      </p>
    </div>
  );
}

export function MoneyRow({
  k,
  v,
  last,
}: {
  k: string;
  v: string;
  last?: boolean;
}) {
  return (
    <div
      className={
        "flex items-baseline justify-between gap-6 px-6 py-5 " +
        (last ? "" : "border-b")
      }
      style={!last ? { borderColor: "var(--hair)" } : undefined}
    >
      <span className="text-sm font-medium" style={{ color: "var(--cream-11)" }}>
        {k}
      </span>
      <span
        className="text-xs font-mono uppercase tracking-[0.14em]"
        style={{ color: "var(--cream-9)" }}
      >
        {v}
      </span>
    </div>
  );
}

export function MoneyBlock({
  lede,
  rows,
  bigNumber = "The gift",
  bigLabel = "Real, in full, every time",
}: {
  lede: string;
  rows: { k: string; v: string }[];
  bigNumber?: string;
  bigLabel?: string;
}) {
  return (
    <>
      <p
        className="text-lg leading-relaxed max-w-2xl"
        style={{ color: "var(--cream-9)" }}
      >
        {lede}
      </p>
      <div className="mt-12 grid lg:grid-cols-5 gap-10 items-center">
        <div className="lg:col-span-2 relative">
          <div className="hp-serif-italic text-[clamp(3.5rem,10vw,7rem)] leading-[1.05]">
            {bigNumber}
          </div>
          <div
            className="mt-4 text-xs font-mono uppercase tracking-[0.18em]"
            style={{ color: "var(--cream-9)" }}
          >
            {bigLabel}
          </div>
        </div>
        <div
          className="lg:col-span-3 rounded-3xl border"
          style={{ background: "var(--cream-1)", borderColor: "var(--hair)" }}
        >
          {rows.map((r, i) => (
            <MoneyRow key={i} k={r.k} v={r.v} last={i === rows.length - 1} />
          ))}
        </div>
      </div>
    </>
  );
}

export function Faq({
  q,
  open,
  name,
  children,
}: {
  q: string;
  open?: boolean;
  /** Shared name groups several <details> into an exclusive accordion:
   *  opening one natively collapses any other with the same name. */
  name?: string;
  children: React.ReactNode;
}) {
  return (
    <details open={open} name={name} className="hp-faq">
      <summary>
        <span className="hp-faq-q">{q}</span>
        <span className="hp-faq-icon" aria-hidden="true">
          <Plus className="size-4" />
        </span>
      </summary>
      <div className="hp-faq-body">{children}</div>
    </details>
  );
}

export function ClosingCta({
  eyebrow = "The invitation",
  title,
  italicWord,
  lede,
  primaryCta = "Apply as a founding executive",
  primaryHref = CALENDLY_URL,
  secondaryLabel,
  secondaryHref,
  sub = "Free for executives · Invite only · One short call to start",
  tone = "white",
}: {
  eyebrow?: string;
  title: string;
  italicWord?: string;
  lede: string;
  primaryCta?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  sub?: string;
  /** Background tone. Set to "oat" to keep the white/oat alternation unbroken. */
  tone?: "white" | "oat";
}) {
  return (
    <section className={"hp-closing" + (tone === "oat" ? " is-oat" : "")}>
      <div className="hp-closing-inner">
        <SectionLabel>{eyebrow}</SectionLabel>
        <h2 className="hp-closing-title">
          {title}
          {italicWord && (
            <>
              {" "}
              <span className="hp-serif-italic">{italicWord}</span>
            </>
          )}
        </h2>
        <p className="hp-closing-lede">{lede}</p>
        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <PrimaryCta href={primaryHref}>{primaryCta}</PrimaryCta>
          {secondaryLabel && secondaryHref && (
            <SecondaryCta href={secondaryHref}>{secondaryLabel}</SecondaryCta>
          )}
        </div>
        <p className="hp-closing-sub">{sub}</p>
      </div>
    </section>
  );
}

export function ComparisonRow({ text, bad }: { text: string; bad?: boolean }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-0.5 size-5 rounded-full grid place-items-center shrink-0"
        style={
          bad
            ? { background: "var(--stone-soft)", color: "var(--cream-9)" }
            : { background: "var(--mint-tint)", color: "var(--primary)" }
        }
      >
        {bad ? <IconX size={12} /> : <IconCheck size={12} />}
      </span>
      <span className="leading-relaxed" style={{ color: "var(--cream-10)" }}>
        {text}
      </span>
    </li>
  );
}

export function MetricCard({
  value,
  label,
  note,
}: {
  value: string;
  label: string;
  note: string;
}) {
  return (
    <div
      className="rounded-3xl border p-7 md:p-8"
      style={{ background: "var(--cream-1)", borderColor: "var(--hair)" }}
    >
      <div
        className="font-black text-5xl md:text-6xl leading-none tracking-[-0.04em] tabular-nums"
        style={{ color: "var(--signal)" }}
      >
        {value}
      </div>
      <div className="mt-4 text-sm font-bold" style={{ color: "var(--cream-11)" }}>
        {label}
      </div>
      <div
        className="mt-2 text-[13px] leading-relaxed"
        style={{ color: "var(--cream-9)" }}
      >
        {note}
      </div>
    </div>
  );
}

export function SectionHead({
  label,
  title,
  italicWord,
  lede,
  centered,
}: {
  label: string;
  title: React.ReactNode;
  italicWord?: string;
  lede?: string;
  centered?: boolean;
}) {
  return (
    <div className={"hp-sec-head" + (centered ? " is-centered" : "")}>
      <SectionLabel>{label}</SectionLabel>
      <h2 className="hp-sec-title">
        {title}
        {italicWord && (
          <>
            {" "}
            <span className="hp-serif-italic">{italicWord}</span>
          </>
        )}
      </h2>
      {lede && <p className="hp-sec-lede">{lede}</p>}
    </div>
  );
}
