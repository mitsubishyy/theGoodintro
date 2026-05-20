import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { Compass, HeartHandshake, ShieldCheck, Quote } from "lucide-react";
import {
  PageHero,
  SectionHead,
  StepCard,
  MoneyBlock,
  ComparisonRow,
  Faq,
  ClosingCta,
} from "../_components/ui";
import {
  IconColdInbox,
  IconIntro,
  IconHandshake,
  IconHeartCircle,
  IconLinkedIn,
  IconMail,
} from "../_components/icons";
import { HowItWorksIllustration } from "../_components/illustrations";
import {
  CALENDLY_URL,
  FOUNDER_LINKEDIN,
  ACNC_REGISTER_URL,
  ABN_LOOKUP_URL,
} from "@/lib/config";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "How it works. theGoodintro.",
  description:
    "The whole model in the open: how a relevant conversation becomes a real gift, why it works better than cold outreach, and who is building it.",
  path: "/how-it-works",
});

export default function HowItWorks() {
  const hasFounderPhoto = existsSync(
    path.join(process.cwd(), "public", "founder.jpg"),
  );
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="The whole model,"
        italicWord="in the open"
        lede="One requirement keeps it honest: a vendor must say why a conversation is relevant before a leader ever sees it. Everything else, including the giving, follows from that."
        primaryCta="Apply as a founding executive"
        secondaryLabel="See the giving"
        secondaryHref="/giving"
        bg="var(--cream-5)"
        illustration={<HowItWorksIllustration className="w-full h-auto" />}
      />

      {/* anchor nav */}
      <section
        className="border-b"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-4 flex flex-wrap gap-x-8 gap-y-2 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
          <a href="#how" className="hover:text-foreground transition-colors">
            How it works
          </a>
          <a href="#why" className="hover:text-foreground transition-colors">
            Why it works
          </a>
          <a href="#about" className="hover:text-foreground transition-colors">
            About
          </a>
        </div>
      </section>

      {/* ── End to end ───────────────────────────────────────────── */}
      <section
        id="how"
        className="border-b scroll-mt-24"
        style={{ background: "var(--mint-tint)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead label="End to end" title="From request to real giving." />
          <div className="mt-16 grid md:grid-cols-3 gap-4">
            <StepCard
              n="01"
              icon={Compass}
              title="The leader sets relevance"
              body="An executive joins free and tells us the priorities they will take conversations about. Nothing outside that gets near them."
            />
            <StepCard
              n="02"
              icon={ShieldCheck}
              title="The vendor qualifies the ask"
              body="A vendor states the specific initiative or problem. That context is shown to the leader, who decides freely. No obligation."
            />
            <StepCard
              n="03"
              icon={HeartHandshake}
              title="The conversation funds a cause"
              body="One focused conversation happens, and a real gift goes to the leader's chosen DGR-endorsed charity."
            />
          </div>
          <p className="mt-12 text-center text-base text-muted-foreground italic max-w-3xl mx-auto">
            A vendor states a specific need, the leader approves only what
            fits, one short conversation happens, and a real gift goes to their
            chosen charity.
          </p>
        </div>
      </section>

      {/* ── The money, in short ──────────────────────────────────── */}
      <section
        className="border-b overflow-hidden relative"
        style={{ background: "var(--stone-tint)", borderColor: "var(--border)" }}
      >
        <div className="absolute inset-0 dotgrid opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead
            label="The money, in short"
            title="The gift is never the revenue."
            lede="The full gift reaches the charity. Running costs are recovered through a separate, clearly named platform fee, so the gift is never reduced for them."
          />
          <div className="mt-12">
            <MoneyBlock
              lede="Executives pay nothing. The vendor funds the gift and the platform on separate lines."
              rows={[
                { k: "To the chosen DGR-endorsed charity", v: "the full gift" },
                { k: "Taken from the donation for costs", v: "nothing" },
                { k: "What an executive pays", v: "nothing, ever" },
              ]}
            />
          </div>
          <Link
            href="/giving"
            className="mt-10 inline-flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors"
          >
            The full giving terms and how to verify them
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* ── Why it works ─────────────────────────────────────────── */}
      <section id="why" className="scroll-mt-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="max-w-2xl">
            <SectionHead
              label="Why it works"
              title="The cold inbox, or this."
              lede="Same goal, reaching a senior leader. Two completely different experiences. The difference is one requirement: a stated, specific reason before a meeting can be requested."
            />
          </div>
          <div className="mt-14 grid md:grid-cols-2 gap-4">
            <div
              className="rounded-2xl border p-8"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="size-12 rounded-xl bg-foreground/[0.04] grid place-items-center mb-6 text-muted-foreground">
                <IconColdInbox size={22} />
              </div>
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] mb-3 text-muted-foreground">
                The cold inbox
              </div>
              <h3 className="text-xl font-semibold tracking-tight mb-6">
                Generic outreach that goes nowhere.
              </h3>
              <ul className="space-y-3 text-sm">
                <ComparisonRow bad text="Sent without relevance to your priorities" />
                <ComparisonRow bad text="No accountability for wasting your time" />
                <ComparisonRow bad text="The same pitch sent to everyone" />
                <ComparisonRow bad text="Zero gift to anyone, ever" />
                <ComparisonRow bad text="Sales follow-up assumed by default" />
              </ul>
            </div>
            <div
              className="rounded-2xl border p-8"
              style={{ background: "var(--signal-soft)", borderColor: "var(--primary)" }}
            >
              <div
                className="size-12 rounded-xl grid place-items-center mb-6"
                style={{ background: "var(--card)", color: "var(--primary)" }}
              >
                <IconIntro size={22} />
              </div>
              <div
                className="text-[10px] font-mono uppercase tracking-[0.18em] mb-3"
                style={{ color: "var(--primary)" }}
              >
                theGoodintro
              </div>
              <h3 className="text-xl font-semibold tracking-tight mb-6">
                A qualified, paid-for introduction.
              </h3>
              <ul className="space-y-3 text-sm">
                <ComparisonRow text="Qualified by stated, specific relevance" />
                <ComparisonRow text="You approve or decline every request" />
                <ComparisonRow text="One short conversation, on your terms" />
                <ComparisonRow text="A real gift to a charity you choose, every time" />
                <ComparisonRow text="No follow-up unless you invite it" />
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── About: the founder ───────────────────────────────────── */}
      <section
        id="about"
        className="border-y scroll-mt-24"
        style={{ background: "var(--cream-2)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div
            className="relative rounded-3xl border overflow-hidden p-10 md:p-16 grid md:grid-cols-12 gap-10"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="md:col-span-4">
              <div
                className="relative aspect-square rounded-2xl overflow-hidden border grid place-items-center"
                style={{ background: "var(--background)", borderColor: "var(--border)" }}
              >
                {hasFounderPhoto ? (
                  <Image
                    src="/founder.jpg"
                    alt="Isobel Hardwick, founder of theGoodintro"
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
                  hello@thegoodintro.com
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
                Founder · theGoodintro · Australia
              </div>
              <Quote className="mt-8 size-7 text-muted-foreground/40" />
              <p className="mt-4 text-lg md:text-xl leading-relaxed">
                I spent a long time on the sending side of sales, watching{" "}
                good people fail to reach leaders who might actually have
                wanted to talk, and watching leaders drown in noise from
                people who did not. The fix was never another clever subject
                line. It was a rule: earn the conversation by being relevant,
                and make the conversation worth something beyond the deal.
              </p>
              <p className="mt-5 text-lg md:text-xl leading-relaxed">
                theGoodintro is that rule, built into a place. Every
                conversation here sends a{" "}
                <span className="serif-italic">real</span> gift to a cause the
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
      <section>
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
              body="The donation figure is never blended with our costs. The platform fee is its own named line."
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
                <ComparisonRow text="The gift is never reduced for our costs; the platform fee is its own named line" />
                <ComparisonRow text="Every nominated charity holds deductible gift recipient (DGR) endorsement" />
                <ComparisonRow text="The charity confirms receipt of the full amount directly to the executive in writing" />
                <ComparisonRow text="Your details are never sold, traded, or published" />
                <ComparisonRow text="No invented testimonials, no inflated numbers, no funding we do not have" />
              </ul>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
                <Link
                  href="/giving"
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

      {/* ── Questions teaser ─────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <SectionHead
                label="Questions"
                title="The ones leaders ask first."
                lede="A few here. The full set lives on the FAQ."
              />
              <Link
                href="/faq"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors"
              >
                Read every question
                <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="lg:col-span-8">
              <Faq q="Who pays for the meeting?" open>
                The vendor. It is free for executives. The vendor funds both
                the charity gift and the separate, clearly named platform fee.
              </Faq>
              <Faq q="Can a leader decline a request?">
                Always. Seeing the stated reason first means declining is
                easy and normal. There is no penalty, no follow-up, and no
                obligation.
              </Faq>
              <Faq q="Will executives be flooded with requests?">
                No. We hold a deliberate 3:1 balance, at least three
                executives for every vendor admitted, so no leader is ever
                the whole room and no vendor is bidding against a crowd.
              </Faq>
            </div>
          </div>
        </div>
      </section>

      <ClosingCta
        title="See it work"
        italicWord="for you."
        lede="Apply as a founding executive. You decide what is relevant, you take only the conversations you want, and the charity you choose receives a real gift each time."
        secondaryLabel="For vendors"
        secondaryHref="/vendors"
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
