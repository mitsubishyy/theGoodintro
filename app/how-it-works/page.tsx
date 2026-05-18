import type { Metadata } from "next";
import { ArrowRight, Compass, HeartHandshake, ShieldCheck } from "lucide-react";
import {
  PageHero,
  SectionHead,
  StepCard,
  MoneyBlock,
  Faq,
  ClosingCta,
} from "../_components/ui";
import {
  IconBriefcase,
  IconNetwork,
  IconGift,
} from "../_components/icons";
import { HowItWorksIllustration } from "../_components/illustrations";

export const metadata: Metadata = {
  title: "How it works. TheBigIntro.",
  description:
    "The full model end to end: how relevant conversations are matched, how the $1,000 charity gift and separate named admin fee work, and how leaders choose where the giving goes.",
};

export default function HowItWorks() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="The whole model,"
        italicWord="in the open"
        lede="One requirement keeps it honest: a vendor must say why a conversation is relevant before a leader ever sees it. Everything else, including the giving, follows from that."
        primaryCta="Start a conversation"
        bg="var(--cream-5)"
        illustration={<HowItWorksIllustration className="w-full h-auto" />}
      />

      {/* ── End to end ───────────────────────────────────────────── */}
      <section
        className="border-y"
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
              body="One focused conversation happens, and $1,000 goes to the leader's chosen registered charity."
            />
          </div>
          <p className="mt-12 text-center text-base text-muted-foreground italic max-w-3xl mx-auto">
            A vendor states a specific need, the leader approves only what
            fits, one short conversation happens, and $1,000 goes to their
            chosen charity.
          </p>
        </div>
      </section>

      {/* ── Money flow ───────────────────────────────────────────── */}
      <section
        className="border-b overflow-hidden relative"
        style={{ background: "var(--stone-tint)", borderColor: "var(--border)" }}
      >
        <div className="absolute inset-0 dotgrid opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead
            label="Where the money goes"
            title="The money flow, exactly."
          />
          <div className="mt-12">
            <MoneyBlock
              lede="The charity figure stays whole on purpose. Running costs are recovered through the named admin fee, so the two numbers never get blended."
              rows={[
                { k: "To the chosen charity, per meeting", v: "the full gift" },
                { k: "Platform admin fee", v: "vendor pays, named separately" },
                { k: "Taken from the donation", v: "zero" },
              ]}
            />
          </div>

          {/* Flow visual */}
          <div className="mt-16 flex flex-col sm:flex-row items-stretch gap-3 sm:gap-0">
            <FlowStep
              icon={IconBriefcase}
              label="Vendor"
              detail="Pays $1,000 gift + admin fee separately"
            />
            <FlowArrow />
            <FlowStep
              icon={IconNetwork}
              label="TheBigIntro"
              detail="Routes 100% of the gift, billed separately"
            />
            <FlowArrow />
            <FlowStep
              icon={IconGift}
              label="Your charity"
              detail="Receives $1,000 in full, in writing"
              accent
            />
          </div>
        </div>
      </section>

      {/* ── Charity choice ───────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead
            label="Choosing the charity"
            title="The leader decides, every time."
            lede="The executive directs where the donation goes, to their chosen registered charity. It is their conversation and their cause. At launch we are Australia first, so the giving stays local and verifiable while the model is proven."
          />
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section
        className="border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <SectionHead label="Questions" title="Good things to ask." />
            </div>
            <div className="lg:col-span-8">
              <Faq q="Who pays for the meeting?" open>
                The vendor. It is free for executives. The vendor funds both
                the charity gift and the separate admin fee.
              </Faq>
              <Faq q="Can a leader decline a request?">
                Always. Seeing the stated reason first means declining is
                easy and normal. There is no penalty and no obligation.
              </Faq>
              <Faq q="Why Australia first?">
                Starting in one market keeps the charity giving verifiable
                and the quality high while the model is proven.
              </Faq>
            </div>
          </div>
        </div>
      </section>

      <ClosingCta
        title="See it work"
        italicWord="for you."
        lede="Apply as a founding executive. You decide what is relevant, you take only the conversations you want, and the charity you choose receives $1,000 each time."
        secondaryLabel="For vendors"
        secondaryHref="/vendors"
      />
    </>
  );
}

function FlowStep({
  icon: Icon,
  label,
  detail,
  accent,
}: {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  label: string;
  detail: string;
  accent?: boolean;
}) {
  return (
    <div
      className="flex-1 rounded-2xl border p-6 text-center transition-all duration-200 hover:-translate-y-0.5"
      style={
        accent
          ? { background: "var(--signal-soft)", borderColor: "var(--primary)" }
          : { background: "var(--card)", borderColor: "var(--border)" }
      }
    >
      <div
        className="size-12 rounded-xl mx-auto mb-4 grid place-items-center"
        style={{
          background: accent ? "var(--card)" : "var(--accent)",
          color: accent ? "var(--primary)" : "var(--foreground)",
        }}
      >
        <Icon size={22} />
      </div>
      <div className="text-sm font-semibold tracking-tight">{label}</div>
      <div className="mt-2 text-xs text-muted-foreground leading-relaxed">
        {detail}
      </div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex items-center justify-center px-2" aria-hidden>
      <ArrowRight className="size-5 text-muted-foreground hidden sm:block" />
      <ArrowRight className="size-5 text-muted-foreground sm:hidden rotate-90" />
    </div>
  );
}
