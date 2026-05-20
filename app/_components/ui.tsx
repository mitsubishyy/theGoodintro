import Link from "next/link";
import { ArrowRight, ArrowUpRight, Plus, Minus } from "lucide-react";
import { IconCheck, IconX } from "./icons";
import { CALENDLY_URL } from "@/lib/config";

/* ────────────────────────────────────────────────────────────────
   Shared UI primitives used across pages.
   ──────────────────────────────────────────────────────────────── */

export function SectionLabel({ children }: { children: React.ReactNode }) {
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

export function PrimaryCta({
  href = CALENDLY_URL,
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3.5 text-sm font-medium hover:bg-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {children}
      <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
    </a>
  );
}

export function SecondaryCta({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-full border border-border bg-card hover:bg-accent px-6 py-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {children}
      <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
  bg = "var(--cream-1)",
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
  bg?: string;
  illustration?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden" style={{ background: bg }}>
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-16 pb-24 md:pt-20 md:pb-32">
        {illustration ? (
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <PageHeroBody
                pill={pill}
                eyebrow={eyebrow}
                title={title}
                italicWord={italicWord}
                lede={lede}
                primaryCta={primaryCta}
                primaryHref={primaryHref}
                secondaryLabel={secondaryLabel}
                secondaryHref={secondaryHref}
              />
            </div>
            <div className="lg:col-span-5">{illustration}</div>
          </div>
        ) : (
          <div className="text-center max-w-4xl mx-auto">
            <PageHeroBody
              centered
              pill={pill}
              eyebrow={eyebrow}
              title={title}
              italicWord={italicWord}
              lede={lede}
              primaryCta={primaryCta}
              primaryHref={primaryHref}
              secondaryLabel={secondaryLabel}
              secondaryHref={secondaryHref}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function PageHeroBody({
  pill,
  eyebrow,
  title,
  italicWord,
  lede,
  primaryCta,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  centered,
}: {
  pill?: string;
  eyebrow: string;
  title: React.ReactNode;
  italicWord?: string;
  lede: string;
  primaryCta: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  centered?: boolean;
}) {
  return (
    <>
      {pill && (
        <div className={"mb-6 " + (centered ? "flex justify-center" : "")}>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur-sm pl-2.5 pr-4 py-1.5 text-xs">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium"
              style={{ background: "var(--signal-soft)", color: "var(--signal)" }}
            >
              <span
                className="size-1.5 rounded-full pulse-dot"
                style={{ background: "var(--signal)" }}
              />
              Live
            </span>
            <span className="text-muted-foreground">{pill}</span>
          </span>
        </div>
      )}
      <div className={centered ? "flex justify-center" : ""}>
        <SectionLabel>{eyebrow}</SectionLabel>
      </div>
      <h1 className="mt-6 text-5xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.03em] leading-[1.02]">
        {title}
        {italicWord && (
          <>
            {" "}
            <span className="serif-italic">{italicWord}</span>.
          </>
        )}
      </h1>
      <p className={"mt-7 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed " + (centered ? "mx-auto" : "")}>
        {lede}
      </p>
      <div className={"mt-9 flex flex-col sm:flex-row gap-3 " + (centered ? "items-center justify-center" : "items-start")}>
        <PrimaryCta href={primaryHref}>{primaryCta}</PrimaryCta>
        {secondaryLabel && secondaryHref && (
          <SecondaryCta href={secondaryHref}>{secondaryLabel}</SecondaryCta>
        )}
      </div>
    </>
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
      className="group relative rounded-2xl border p-6 hover:-translate-y-0.5 transition-all duration-300"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="size-10 rounded-xl bg-foreground/[0.04] grid place-items-center group-hover:bg-foreground/[0.08] transition-colors">
          <Icon size={20} className="text-foreground" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
          {n}
        </span>
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
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
      style={!last ? { borderColor: "var(--border)" } : undefined}
    >
      <span className="text-sm font-medium">{k}</span>
      <span className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
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
      <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
        {lede}
      </p>
      <div className="mt-12 grid lg:grid-cols-5 gap-10 items-center">
        <div className="lg:col-span-2 relative">
          <div className="display-serif text-[clamp(3.5rem,10vw,7.5rem)] leading-[1.05] text-primary">
            {bigNumber}
          </div>
          <div className="mt-4 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
            {bigLabel}
          </div>
        </div>
        <div
          className="lg:col-span-3 rounded-2xl border backdrop-blur-sm"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
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
  children,
}: {
  q: string;
  open?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      open={open}
      className="group border-b py-6 last:border-b-0"
      style={{ borderColor: "var(--border)" }}
    >
      <summary className="cursor-pointer list-none flex items-center justify-between gap-6 [&::-webkit-details-marker]:hidden">
        <span className="text-base md:text-lg font-medium tracking-tight">
          {q}
        </span>
        <span
          className="size-8 rounded-full border grid place-items-center text-muted-foreground group-open:bg-foreground group-open:text-background group-open:border-foreground transition-colors"
          style={{ borderColor: "var(--border)" }}
        >
          <Plus className="size-4 group-open:hidden" />
          <Minus className="size-4 hidden group-open:block" />
        </span>
      </summary>
      <div className="mt-4 text-muted-foreground leading-relaxed max-w-2xl">
        {children}
      </div>
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
}) {
  return (
    <section className="relative overflow-hidden border-t" style={{ borderColor: "var(--border)" }}>
      <div className="mesh" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-32 md:py-40 text-center">
        <SectionLabel>{eyebrow}</SectionLabel>
        <h2 className="mt-6 text-5xl md:text-7xl font-semibold tracking-[-0.03em] leading-[1.02] max-w-3xl mx-auto">
          {title}
          {italicWord && (
            <>
              {" "}
              <span className="serif-italic">{italicWord}</span>
            </>
          )}
        </h2>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
          {lede}
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <PrimaryCta href={primaryHref}>{primaryCta}</PrimaryCta>
          {secondaryLabel && secondaryHref && (
            <SecondaryCta href={secondaryHref}>{secondaryLabel}</SecondaryCta>
          )}
        </div>
        <div className="mt-10 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
          {sub}
        </div>
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
            ? { background: "var(--stone-soft)", color: "var(--muted-foreground)" }
            : { background: "var(--card)", color: "var(--primary)" }
        }
      >
        {bad ? <IconX size={12} /> : <IconCheck size={12} />}
      </span>
      <span className="leading-relaxed">{text}</span>
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
      className="rounded-2xl border p-6 md:p-8"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="display-serif text-5xl md:text-6xl text-foreground leading-none">
        {value}
      </div>
      <div className="mt-4 text-sm font-semibold">{label}</div>
      <div className="mt-2 text-xs text-muted-foreground leading-relaxed">
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
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <SectionLabel>{label}</SectionLabel>
      <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
        {title}
        {italicWord && (
          <>
            {" "}
            <span className="serif-italic">{italicWord}</span>
          </>
        )}
      </h2>
      {lede && (
        <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
          {lede}
        </p>
      )}
    </div>
  );
}
