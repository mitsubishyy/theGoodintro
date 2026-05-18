import type { Metadata } from "next";
import { Compass, ShieldCheck, HeartHandshake } from "lucide-react";
import { CALENDLY_URL } from "@/lib/config";
import {
  PageHero,
  SectionHead,
  StepCard,
  MoneyBlock,
  Faq,
  ClosingCta,
} from "../_components/ui";
import { ExecutivesIllustration } from "../_components/illustrations";

export const metadata: Metadata = {
  title: "For executives. TheBigIntro.",
  description:
    "Free for senior leaders. You decide what is relevant, take only the conversations worth your time, and $1,000 goes to a charity you choose every meeting.",
};

export default function Executives() {
  return (
    <>
      <PageHero
        eyebrow="For executives · Invite only"
        title="Conversations worth"
        italicWord="your time"
        lede="You are senior enough that your calendar is a target. TheBigIntro turns the few conversations worth having into $1,000 for a cause you choose."
        primaryCta="Apply as a founding executive"
        pill="Free for executives · Founding cohort applications open"
        bg="var(--cream-3)"
        illustration={<ExecutivesIllustration className="w-full h-auto" />}
      />

      {/* ── How it works ─────────────────────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--mint-tint)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead
            label="How it works for you"
            title="Three steps, nothing hidden."
          />
          <div className="mt-16 grid md:grid-cols-3 gap-4">
            <StepCard
              n="01"
              icon={Compass}
              title="You set what is relevant"
              body="Tell us the priorities and challenges you want to talk about. Anything outside that never reaches you."
            />
            <StepCard
              n="02"
              icon={ShieldCheck}
              title="You get qualified requests"
              body="A vendor must state the specific initiative or problem before they can ask. You see the reason and decide. No obligation."
            />
            <StepCard
              n="03"
              icon={HeartHandshake}
              title="One focused conversation"
              body="You have one focused conversation, and $1,000 goes to your chosen registered charity."
            />
          </div>
          <p className="mt-12 text-center text-base text-muted-foreground italic max-w-3xl mx-auto">
            A vendor states a specific need, you approve only what fits, you
            have one short conversation, and $1,000 goes to your chosen
            charity.
          </p>
        </div>
      </section>

      {/* ── Is this a sales trap? ────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead
            label="The honest answer"
            title="Is this a sales trap?"
            lede="No. A vendor cannot reach you without stating a specific, relevant reason, and the conversation is about your priorities, not a hard sell. If a conversation is not useful, you simply do not take the next one. The model only works if executives genuinely want to be here."
          />
        </div>
      </section>

      {/* ── What your time is worth ──────────────────────────────── */}
      <section
        className="border-y overflow-hidden relative"
        style={{ background: "var(--stone-tint)", borderColor: "var(--border)" }}
      >
        <div className="absolute inset-0 dotgrid opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead label="What your time is worth" title="Full transparency." />
          <div className="mt-12">
            <MoneyBlock
              lede="You direct exactly where the donation goes. Every dollar of the gift reaches the charity, never reduced by running costs."
              rows={[
                { k: "To your chosen charity, per meeting", v: "the full gift" },
                { k: "Platform admin fee", v: "paid by the vendor, never you" },
                { k: "What it costs you", v: "nothing, ever" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <SectionHead
                label="Questions"
                title="Good things to ask."
                lede="Not seeing what you need? Start a conversation and ask."
              />
              <a
                href={CALENDLY_URL}
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
              >
                Book a call →
              </a>
            </div>
            <div className="lg:col-span-8">
              <Faq q="Is this just a sales meeting in disguise?" open>
                No. A vendor cannot reach you without stating a specific,
                relevant reason, and the conversation is about your
                priorities, not a hard sell.
              </Faq>
              <Faq q="Which charities can I choose?">
                Any registered Australian charity you choose. You name it, and
                that is exactly where your $1,000 goes.
              </Faq>
              <Faq q="What does it cost an executive?">
                Nothing. It is free for executives. Vendors pay, and that is
                what funds the donation to your charity.
              </Faq>
              <Faq q="How much of my time is this?">
                One short, focused conversation per meeting. You only take
                the ones you choose.
              </Faq>
            </div>
          </div>
        </div>
      </section>

      <ClosingCta
        title="Conversations worth"
        italicWord="your time."
        lede="Apply as a founding executive. You decide what is relevant, you take only the conversations you want, and the charity you choose receives $1,000 each time."
        secondaryLabel="See how it works"
        secondaryHref="/how-it-works"
      />
    </>
  );
}
