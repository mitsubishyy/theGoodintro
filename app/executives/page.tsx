import Link from "next/link";
import { ArrowUpRight, Compass, ShieldCheck, HeartHandshake } from "lucide-react";
import {
  SectionHead,
  StepCard,
  MoneyBlock,
  ComparisonRow,
  Faq,
  ClosingCta,
} from "../_components/ui";
import { MeetingRequestEmail } from "../_components/meeting-request-email";
import { Avatar } from "../mockup/_components/avatar";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "For executives. TheGoodIntro.",
  description:
    "Free for senior leaders. You decide what is relevant, take only the conversations worth your time, and a real gift goes to a charity you choose every meeting.",
  path: "/executives",
});

export default function Executives() {
  return (
    <>
      {/* ── Hero — big bold text, no graphics ────────────────────── */}
      <section className="hp-hero" aria-labelledby="exec-headline">
        <h1 className="hp-headline" id="exec-headline">
          Conversations worth{" "}
          <span className="hp-serif-italic">your time</span>.
        </h1>

        <p className="hp-lede">
          You are senior enough that your calendar is a target. TheGoodIntro
          turns the few conversations worth having into a real gift for a cause
          you choose.
        </p>

        <div className="hp-cta-row">
          <a className="hp-btn-primary">
            <span className="pulse" aria-hidden="true" />
            Apply as a founding executive
          </a>
          <Link className="hp-btn-ghost" href="/how-it-works">
            How it works
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
        </div>
      </section>

      {/* ── How it works for you ─────────────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--paper-oat)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead
            label="How it works for you"
            title="Three steps, nothing hidden."
          />
          <div className="mt-16 grid md:grid-cols-3 gap-4">
            <StepCard
              hoverHighlight
              n="01"
              icon={Compass}
              title="You set what is relevant"
              body="Tell us the priorities and challenges you want to talk about. Anything outside that never reaches you."
            />
            <StepCard
              hoverHighlight
              n="02"
              icon={ShieldCheck}
              title="You get qualified requests"
              body="A vendor must state the specific initiative or problem before they can ask. You see the reason and decide. No obligation."
            />
            <StepCard
              hoverHighlight
              n="03"
              icon={HeartHandshake}
              title="One focused conversation"
              body="You have one focused conversation, and a real gift goes to your chosen DGR-endorsed charity."
            />
          </div>
        </div>
      </section>

      {/* ── What a request looks like ────────────────────────────── */}
      <section style={{ background: "var(--paper-white)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <SectionHead
                label="What a request looks like"
                title="See one before you decide."
                lede="No abstraction. This is exactly what lands in your inbox when a vetted vendor asks for time: who they are, the stated reason, why it is relevant to you, the gift to your chosen charity, and one tap to accept, decline, or send to your EA."
              />
              <ul className="mt-8 space-y-3 text-sm md:text-base max-w-xl">
                <ComparisonRow text="The vendor and their verified role, up front" />
                <ComparisonRow text="The specific initiative, in plain language" />
                <ComparisonRow text="The exact gift to the charity you chose" />
                <ComparisonRow text="Accept, decline, or forward, all inside the email" />
              </ul>
            </div>
            <div className="lg:col-span-7">
              <MeetingRequestEmail
                showAddressHeaders={false}
                /* Seed stays "Lachlan Kim" to keep the exact approved face;
                   the displayed name is the fake "Lachlan Smith". */
                vendorAvatar={<Avatar name="Lachlan Kim" size={56} />}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── The 10:1 rule ────────────────────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--paper-oat)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <SectionHead
                label="The 10:1 rule"
                title="You are never the whole room."
                lede="For every vendor we admit, there are at least ten executives. Your inbox is not an auction where everyone chases the same few names. Requests stay scarce, relevant, and easy to decline."
              />
              <ul className="mt-8 space-y-3 text-sm md:text-base max-w-xl">
                <ComparisonRow text="At least ten executives for every vendor we admit" />
                <ComparisonRow text="Vendors are not bidding against a crowd for your attention" />
                <ComparisonRow text="Fewer, better requests, never a flooded inbox" />
              </ul>
            </div>
            <div className="lg:col-span-6">
              <div
                className="rounded-3xl border p-10 md:p-16 text-center"
                style={{ background: "var(--cream-1)", borderColor: "var(--hair)" }}
              >
                <div className="display-serif text-[clamp(4rem,12vw,9rem)] leading-none text-primary">
                  10:1
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
      <section style={{ background: "var(--paper-white)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead
            label="What your time is worth"
            title="Your time is already so valuable."
            italicWord="Do more with it."
            lede="The only thing a conversation asks of you is your time, and you spend it on your terms. The charity you choose receives a real gift every meeting, from $900 to $1,200. You never pay."
          />
          <div className="mt-12">
            <MoneyBlock
              lede="You direct exactly where the donation goes, and the charity you choose receives its share of every meeting, paid entirely by the vendor."
              rows={[
                { k: "To your chosen charity, per meeting", v: "$900 to $1,200" },
                { k: "What the vendor pays, per meeting", v: "$1,500" },
                { k: "What it costs you", v: "one focused conversation" },
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

      <ClosingCta
        tone="oat"
        title="Conversations worth"
        italicWord="your time."
        lede="Apply as a founding executive. You decide what is relevant, you take only the conversations you want, and the charity you choose receives a real gift each time."
        secondaryLabel="See how it works"
        secondaryHref="/how-it-works"
      />

      {/* ── FAQ — at the bottom, exclusive accordion ─────────────── */}
      <section style={{ background: "var(--paper-white)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 md:py-20">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <SectionHead
                label="Questions"
                title="Good things to ask."
                lede="Not seeing what you need? Start a conversation and ask."
              />
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                Booking link coming soon
              </span>
            </div>
            <div className="lg:col-span-8">
              <Faq name="exec-faq" q="Is this just a sales meeting in disguise?">
                No. A vendor cannot reach you without writing the specific
                initiative or problem they want to discuss, and that reason
                is shown to you in plain language before anything is
                scheduled. The conversation is led by your priorities, not a
                pitch. Vendors who treat it as a cold sell lose access. The
                model only works if executives genuinely want to be here, so
                it is built around your interests, not theirs.
              </Faq>
              <Faq name="exec-faq" q="What actually counts as relevant?">
                You define it. You tell us the priorities, initiatives, and
                problems you would take a conversation about, and you can be
                as broad or as narrow as you like. Anything outside that
                scope never reaches you. You can update or pause your topics
                at any time, and a vendor still has to state a specific
                reason that fits before a request is shown to you.
              </Faq>
              <Faq name="exec-faq" q="How many requests will I get? Will I be flooded?">
                No. We hold a deliberate 10:1 balance, at least ten
                executives for every vendor we admit, so no leader is ever
                the whole room. For a typical founding executive that is two
                to four requests a quarter that actually fit, not a daily
                inbox to manage.
              </Faq>
              <Faq name="exec-faq" q="What happens if I decline?">
                Nothing. Declining is the normal case, not the exception.
                There is no penalty, no score, no follow-up, and no
                explanation required. You see the stated reason first
                precisely so that saying no is fast and free. A vendor cannot
                contact you again about a declined request.
              </Faq>
              <Faq name="exec-faq" q="Which charities can I choose?">
                Any Australian charity that holds deductible gift recipient
                (DGR) endorsement. You name it, you can change it at any
                time, and you can nominate a different one for each meeting.
                That is exactly where your meeting&apos;s gift goes, and you
                receive written confirmation that it was made.
              </Faq>
              <Faq name="exec-faq" q="What does it cost an executive?">
                Nothing, ever. Joining, setting your topics, declining
                requests, taking meetings, and leaving are all free. Vendors
                fund both the platform and the donation. There is no future
                tier where executives are charged, and the founding cohort is
                grandfathered against any change.
              </Faq>
              <Faq name="exec-faq" q="How much of my time is this, realistically?">
                One short, focused conversation per request you accept,
                typically 45 minutes. No preparation, no homework, and
                no obligation to continue after the call. You only take the
                meetings you choose.
              </Faq>
              <Faq name="exec-faq" q="Is my information sold or shared?">
                No. Your details are not sold, traded, or shared publicly.
                Vendors only see what you choose to make visible, and a
                request is only ever shown to you, never the other way
                around, until you accept it.
              </Faq>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
