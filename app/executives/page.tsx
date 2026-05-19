import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Compass, ShieldCheck, HeartHandshake } from "lucide-react";
import { CALENDLY_URL } from "@/lib/config";
import {
  PageHero,
  SectionHead,
  StepCard,
  MoneyBlock,
  ComparisonRow,
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
              body="You have one focused conversation, and $1,000 goes to your chosen DGR-endorsed charity."
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

      {/* ── The 3:1 rule ─────────────────────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <SectionHead
                label="The 3:1 rule"
                title="You are never the whole room."
                lede="For every vendor we admit, there are at least three executives. Your inbox is not a marketplace where everyone chases the same few names. Requests stay scarce, relevant, and easy to decline."
              />
              <ul className="mt-8 space-y-3 text-sm md:text-base max-w-xl">
                <ComparisonRow text="At least three executives for every vendor we admit" />
                <ComparisonRow text="Vendors are not bidding against a crowd for your attention" />
                <ComparisonRow text="Fewer, better requests, never a flooded inbox" />
              </ul>
            </div>
            <div className="lg:col-span-6">
              <div
                className="rounded-3xl border p-10 md:p-16 text-center"
                style={{ background: "var(--mint-tint)", borderColor: "var(--border)" }}
              >
                <div className="display-serif text-[clamp(4rem,12vw,9rem)] leading-none text-primary">
                  3:1
                </div>
                <div className="mt-5 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                  Executives to vendors, deliberately
                </div>
              </div>
            </div>
          </div>
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
          <Link
            href="/impact"
            className="mt-10 inline-flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors"
          >
            Your giving is public and shareable. Preview the impact page
            <ArrowUpRight className="size-4" />
          </Link>
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
                No. A vendor cannot reach you without writing the specific
                initiative or problem they want to discuss, and that reason
                is shown to you in plain language before anything is
                scheduled. The conversation is led by your priorities, not a
                pitch. Vendors who treat it as a cold sell lose access. The
                model only works if executives genuinely want to be here, so
                it is built around your interests, not theirs.
              </Faq>
              <Faq q="What actually counts as relevant?">
                You define it. You tell us the priorities, initiatives, and
                problems you would take a conversation about, and you can be
                as broad or as narrow as you like. Anything outside that
                scope never reaches you. You can update or pause your topics
                at any time, and a vendor still has to state a specific
                reason that fits before a request is shown to you.
              </Faq>
              <Faq q="How many requests will I get? Will I be flooded?">
                No. We hold a deliberate 3:1 balance, at least three
                executives for every vendor we admit, so no leader is ever
                the whole room. For a typical founding executive that is two
                to four requests a quarter that actually fit, not a daily
                inbox to manage.
              </Faq>
              <Faq q="What happens if I decline?">
                Nothing. Declining is the normal case, not the exception.
                There is no penalty, no score, no follow-up, and no
                explanation required. You see the stated reason first
                precisely so that saying no is fast and free. A vendor cannot
                contact you again about a declined request.
              </Faq>
              <Faq q="Which charities can I choose?">
                Any Australian charity that holds deductible gift recipient
                (DGR) endorsement. You name it, you can change it at any
                time, and you can nominate a different one for each meeting.
                That is exactly where the $1,000 goes, and the charity
                confirms receipt to you in writing.
              </Faq>
              <Faq q="What does it cost an executive?">
                Nothing, ever. Joining, setting your topics, declining
                requests, taking meetings, and leaving are all free. Vendors
                fund both the platform and the donation. There is no future
                tier where executives are charged, and the founding cohort is
                grandfathered against any change.
              </Faq>
              <Faq q="How much of my time is this, realistically?">
                One short, focused conversation per request you accept,
                typically 30 to 45 minutes. No preparation, no homework, and
                no obligation to continue after the call. You only take the
                meetings you choose.
              </Faq>
              <Faq q="Is my information sold or shared?">
                No. Your details are not sold, traded, or shared publicly.
                Vendors only see what you choose to make visible, and a
                request is only ever shown to you, never the other way
                around, until you accept it.
              </Faq>
              <Faq q="Why a founding cohort?">
                We are starting with a deliberately small first group of
                executives in Australia so the model can be shaped against
                real feedback before it scales. Founding members influence
                how requests are qualified and which vendors are accepted,
                and are grandfathered against any future change.
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
