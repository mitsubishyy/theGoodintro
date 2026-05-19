import type { Metadata } from "next";
import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { Quote } from "lucide-react";
import {
  CALENDLY_URL,
  FOUNDER_LINKEDIN,
  ACNC_REGISTER_URL,
  ABN_LOOKUP_URL,
} from "@/lib/config";
import {
  SectionHead,
  ComparisonRow,
  ClosingCta,
  PrimaryCta,
  SecondaryCta,
} from "../_components/ui";
import {
  IconBriefcase,
  IconHandshake,
  IconHeartCircle,
  IconIntro,
  IconLinkedIn,
  IconMail,
} from "../_components/icons";
import { AboutIllustration } from "../_components/illustrations";

export const metadata: Metadata = {
  title: "About. TheBigIntro.",
  description:
    "Why Isobel Hardwick is building TheBigIntro: fix irrelevant outreach for senior leaders and turn every conversation into $1,000 for a cause that matters.",
};

export default function About() {
  const hasFounderPhoto = existsSync(
    path.join(process.cwd(), "public", "founder.jpg"),
  );
  return (
    <>
      {/* Split hero with illustration */}
      <section className="relative overflow-hidden" style={{ background: "var(--cream-2)" }}>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-16 pb-24 md:pt-20 md:pb-32">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                <span className="h-px w-6" style={{ background: "var(--border-strong)" }} />
                About
              </div>
              <h1 className="mt-6 text-5xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.03em] leading-[1.02]">
                Built to fix{" "}
                <span className="serif-italic">both sides</span>.
              </h1>
              <p className="mt-7 max-w-xl text-lg md:text-xl text-muted-foreground leading-relaxed">
                Senior people are buried in irrelevant outreach. Vendors with
                genuine value cannot get through honestly. TheBigIntro fixes
                both at once, and turns every conversation into $1,000 for a
                cause the leader chooses.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row items-start gap-3">
                <PrimaryCta>Start a conversation</PrimaryCta>
                <SecondaryCta href="/how-it-works">See how it works</SecondaryCta>
              </div>
            </div>
            <div className="lg:col-span-5">
              <AboutIllustration className="w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Founder credibility ──────────────────────────────────── */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div
            className="relative rounded-3xl border overflow-hidden p-10 md:p-16 grid md:grid-cols-12 gap-10"
            style={{ background: "var(--stone-tint)", borderColor: "var(--stone-soft)" }}
          >
            <div className="md:col-span-4">
              <div
                className="relative aspect-square rounded-2xl overflow-hidden border grid place-items-center"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                {hasFounderPhoto ? (
                  <Image
                    src="/founder.jpg"
                    alt="Isobel Hardwick, founder of TheBigIntro"
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                    priority={false}
                  />
                ) : (
                  <div
                    className="size-32 rounded-full grid place-items-center font-semibold text-4xl text-primary-foreground"
                    style={{ background: "var(--primary)" }}
                    aria-label="Isobel Hardwick"
                  >
                    IH
                  </div>
                )}
              </div>
              <div className="mt-6 flex flex-col gap-2">
                <a
                  href={FOUNDER_LINKEDIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <IconLinkedIn size={16} />
                  LinkedIn
                </a>
                <a
                  href={CALENDLY_URL}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <IconMail size={16} />
                  hello@thebigintro.com
                </a>
              </div>
            </div>
            <div className="md:col-span-8">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                From the founder
              </div>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
                Isobel Hardwick
              </h2>
              <div className="mt-2 text-sm text-muted-foreground">
                Founder · TheBigIntro · Australia
              </div>
              <Quote className="mt-8 size-7 text-muted-foreground/40" />
              <p className="mt-4 text-lg md:text-xl leading-relaxed">
                I spent a long time on the sending side of sales, watching good
                people fail to reach leaders who might actually have wanted to
                talk, and watching leaders drown in noise from people who did
                not. The fix was never another clever subject line. It was a
                rule: earn the conversation by being relevant, and make the
                conversation worth something beyond the deal.
              </p>
              <p className="mt-5 text-lg md:text-xl leading-relaxed">
                TheBigIntro is that rule, built into a place. Every
                conversation here sends{" "}
                <span className="serif-italic">$1,000</span> to a cause the
                leader chooses. That is the whole point.
              </p>
              <p className="mt-5 text-lg md:text-xl leading-relaxed">
                We are starting in Australia, on purpose. One market keeps
                every gift local, verifiable, and easy to stand behind while
                the model is proven with a small founding group. I would
                rather earn a reputation slowly than borrow one.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── What we believe ──────────────────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--mint-tint)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead
            label="What we believe"
            title="Three things we will not compromise."
          />
          <div className="mt-14 grid md:grid-cols-3 gap-4">
            <PrincipleCard
              n="01"
              icon={IconHandshake}
              title="Relevance is earned"
              body="No one reaches a leader without a stated, specific reason. That requirement is the product."
            />
            <PrincipleCard
              n="02"
              icon={IconHeartCircle}
              title="Giving stays whole"
              body="The donation figure is never blended with our costs. The admin fee is its own named line."
            />
            <PrincipleCard
              n="03"
              icon={IconIntro}
              title="Small on purpose"
              body="We are starting with a deliberately small invite-only cohort so the first members shape it."
            />
          </div>
        </div>
      </section>

      {/* ── What we are not ──────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <SectionHead
                label="Honest about the stage"
                title="What we are."
                lede="A small founding cohort, with one clear model, building in public. No funding claimed, no inflated numbers, no fake testimonials."
              />
            </div>
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-3">
              <FactRow icon={IconBriefcase} k="Stage" v="Validation, pre-platform" />
              <FactRow icon={IconHeartCircle} k="Where we start" v="Australia first" />
              <FactRow icon={IconHandshake} k="First cohort" v="Invite only" />
              <FactRow icon={IconIntro} k="Model" v="$1,000 per meeting to a charity the leader chooses" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Australia first ──────────────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <SectionHead
                label="Why Australia first"
                title="One market, done properly."
              />
            </div>
            <div className="lg:col-span-7">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Starting in one country keeps the giving local and every
                charity checkable on a public Australian register. It keeps
                the founding cohort close enough to shape the model in
                person, and it means we never have to wave away a hard
                question with talk of scale. Expansion comes after the model
                has earned it here, not before.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How we keep this honest ──────────────────────────────── */}
      <section
        className="border-y overflow-hidden relative"
        style={{ background: "var(--stone-tint)", borderColor: "var(--border)" }}
      >
        <div className="absolute inset-0 dotgrid opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <SectionHead
                label="How we keep this honest"
                title="Checkable, not just stated."
                lede="Trust on a finance-facing site has to be verifiable. Here is what that means in practice, with the receipts."
              />
            </div>
            <div className="lg:col-span-7">
              <ul className="space-y-3 text-sm md:text-base">
                <ComparisonRow text="The $1,000 gift is never reduced for our costs; the platform fee is its own named line" />
                <ComparisonRow text="Every nominated charity holds deductible gift recipient (DGR) endorsement" />
                <ComparisonRow text="The charity confirms receipt of the full amount directly to the executive in writing" />
                <ComparisonRow text="Your details are never sold, traded, or published" />
                <ComparisonRow text="No invented testimonials, no inflated numbers, no funding we do not have" />
              </ul>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
                <Link
                  href="/charities"
                  className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  How the giving works <span aria-hidden>→</span>
                </Link>
                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  Our privacy stance <span aria-hidden>→</span>
                </Link>
                <Link
                  href="/impact"
                  className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  Public impact <span aria-hidden>→</span>
                </Link>
                <a
                  href={ACNC_REGISTER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  ACNC register <span aria-hidden>↗</span>
                </a>
                <a
                  href={ABN_LOOKUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  ABN Lookup <span aria-hidden>↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ClosingCta
        title="A few better"
        italicWord="conversations."
        lede="Apply as a founding executive. You decide what is relevant, you take only the conversations you want, and the charity you choose receives $1,000 each time."
        secondaryLabel="See how it works"
        secondaryHref="/how-it-works"
      />
    </>
  );
}

function PrincipleCard({
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
      className="rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-0.5"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="size-10 rounded-xl bg-foreground/[0.04] grid place-items-center">
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

function FactRow({
  icon: Icon,
  k,
  v,
}: {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  k: string;
  v: string;
}) {
  return (
    <div
      className="rounded-xl border p-4 flex items-start gap-3"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div
        className="size-9 rounded-lg grid place-items-center shrink-0"
        style={{ background: "var(--accent)", color: "var(--foreground)" }}
      >
        <Icon size={18} />
      </div>
      <div>
        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
          {k}
        </div>
        <div className="text-sm font-medium mt-1">{v}</div>
      </div>
    </div>
  );
}
