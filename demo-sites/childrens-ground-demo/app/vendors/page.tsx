import Link from "next/link";
import Image from "next/image";
import { UserCheck, Target, HeartHandshake } from "lucide-react";
import {
  PageHero,
  SectionHead,
  StepCard,
  MetricCard,
  MoneyRow,
  Faq,
  ClosingCta,
} from "../_components/ui";
import { VendorsFlow } from "../_components/vendors-flow";
import { MeetingConfirmedCard } from "../_components/meeting-confirmed-card";
import { FaqJsonLd } from "../_components/json-ld";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Book meetings with senior executives. TheGoodIntro.",
  description:
    "Get accepted meetings with vetted senior leaders in Australia. One flat $1,500 per held meeting, with $900 to $1,200 funding a charity the executive chooses. No lists, no sequences, no retainer.",
  path: "/vendors",
});

const HERO_STATS = [
  { value: "10:1", label: "Executives for every vendor admitted" },
  // PLACEHOLDER — unverified, pre-launch. Swap for a real, sourced figure
  // before this ships to production (POSITIONING.md honest-numbers rule).
  { value: "75%", label: "Meetings converted" },
  { value: "45 min", label: "One focused conversation, led by the leader" },
];

// Single source for the visible FAQ and the FAQPage JSON-LD. `a` is the plain
// answer for structured data; `node` is the optional rich render shown on the
// page. Keep `a` in sync with the rendered copy.
const VENDOR_FAQS: { q: string; a: string; node?: React.ReactNode }[] = [
  {
    q: "How does a vendor get accepted?",
    a: "You apply, you are interviewed, and you are vetted before you can request a single meeting. We are looking for a specific reason to talk to senior leaders, not a list to blast. Acceptance is not automatic and it is not for sale. Vendors who repeatedly miss relevance, or who behave badly in meetings, lose access.",
  },
  {
    q: "Will executives actually accept my requests?",
    a: "That is the entire design. Leaders here opted in, stated their topics, and see your specific reason before deciding. Requests that match a stated priority get accepted at a rate cold outreach never will, and requests that don't match never reach them, so you are not burning goodwill either way. We cap vendors at a 10:1 executive ratio so no one is competing in a flooded inbox.",
  },
  {
    q: "What exactly do I pay?",
    a: "One flat fee of $1,500 per held meeting. No subscriptions, no seat fee, no hidden costs. Between $900 and $1,200 of every meeting goes to the charity the leader chooses, rising with the number of meetings you take across the year, and we publish the exact split at every tier. Pricing is on the pricing page.",
    node: (
      <>
        One flat fee of $1,500 per held meeting. No subscriptions, no seat fee,
        no hidden costs. Between $900 and $1,200 of every meeting goes to the
        charity the leader chooses, rising with the number of meetings you take
        across the year, and we publish the exact split at every tier. Pricing
        is on the{" "}
        <Link
          href="/pricing"
          className="underline underline-offset-4 hover:text-primary"
        >
          pricing page
        </Link>
        .
      </>
    ),
  },
  {
    q: "How do we know the gift reaches the charity?",
    a: "Every nominated charity holds deductible gift recipient (DGR) endorsement and is listed on the public register, so it is independently verifiable before the meeting is confirmed. Once the meeting is held, the gift is paid to the chosen charity and confirmed in writing.",
  },
  {
    q: "What if the meeting does not lead anywhere?",
    a: "Once the meeting happens, the donation is committed and is paid to the charity within 14 days regardless of the commercial outcome. That is deliberate. It keeps the gift honest and stops anyone gaming it. You are buying a qualified, relevant conversation and a real gift, not a guaranteed deal.",
  },
];

export default function Vendors() {
  return (
    <>
      <FaqJsonLd items={VENDOR_FAQS} />
      <PageHero
        eyebrow="For vendors"
        title="The meetings cold outreach can't"
        italicWord="get you"
        lede="Senior leaders who chose to be here, told us exactly what they will take a meeting about, and say yes because every conversation funds a charity they care about. One flat $1,500 per held meeting. No list, no sequences, no retainer."
        primaryCta="Join the waitlist"
        primaryHref="/waitlist"
        pill="Founding vendor waitlist open"
        bg="var(--cream-4)"
        illustration={
          <div>
            <MeetingConfirmedCard />
            <p
              className="mt-5 text-[13px] leading-relaxed italic max-w-md"
              style={{ color: "var(--cream-9)" }}
            >
              The moment you&apos;re paying for. A senior leader said yes,
              because your reason matched what they asked for.
            </p>
          </div>
        }
      />

      {/* ── Hero stat band: the whole argument in one line ───────────── */}
      <section
        className="border-y"
        style={{ background: "var(--emerald-deep)", borderColor: "var(--emerald-deep)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-12 md:py-14">
          <dl className="grid sm:grid-cols-3 gap-10 sm:gap-0">
            {HERO_STATS.map((s, i) => (
              <div
                key={s.label}
                className={
                  "text-center sm:px-8 " +
                  (i > 0 ? "sm:border-l" : "")
                }
                style={
                  i > 0
                    ? { borderColor: "color-mix(in oklch, var(--cream-1) 20%, transparent)" }
                    : undefined
                }
              >
                <dt
                  className="font-black leading-none tracking-[-0.03em] tabular-nums"
                  style={{
                    color: "var(--cream-1)",
                    fontSize: "clamp(1.75rem, 3.6vw, 2.75rem)",
                  }}
                >
                  {s.value}
                </dt>
                <dd
                  className="mt-3 text-sm leading-snug mx-auto max-w-[24ch]"
                  style={{ color: "color-mix(in oklch, var(--cream-1) 75%, transparent)" }}
                >
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── The problem you already live with (oat band) ─────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--paper-oat)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4">
              <SectionHead
                label="The problem you already live with"
                title="Senior leaders are the hardest meeting you'll ever"
                italicWord="book."
              />
            </div>
            <div className="lg:col-span-8">
              <dl>
                <div className="pb-8">
                  <dt
                    className="text-xl font-bold tracking-[-0.012em]"
                    style={{ color: "var(--cream-11)" }}
                  >
                    They don&apos;t answer cold
                  </dt>
                  <dd
                    className="mt-3 text-lg leading-relaxed"
                    style={{ color: "var(--cream-9)" }}
                  >
                    Your best SDR can sequence a CFO for six weeks and hear
                    nothing back. The people with budget have built walls around
                    their inbox, and cold outreach is exactly what those walls
                    are for.
                  </dd>
                </div>
                <div
                  className="border-t py-8"
                  style={{ borderColor: "var(--hair)" }}
                >
                  <dt
                    className="text-xl font-bold tracking-[-0.012em]"
                    style={{ color: "var(--cream-11)" }}
                  >
                    You pay for the attempt, not the result
                  </dt>
                  <dd
                    className="mt-3 text-lg leading-relaxed"
                    style={{ color: "var(--cream-9)" }}
                  >
                    The data tools, the sequencer, the SDR salary, the hours.
                    All of it is spent whether or not a single qualified meeting
                    lands. The real cost of a senior conversation is far higher
                    than any invoice shows.
                  </dd>
                </div>
                <div
                  className="border-t py-8"
                  style={{ borderColor: "var(--hair)" }}
                >
                  <dt
                    className="text-xl font-bold tracking-[-0.012em]"
                    style={{ color: "var(--cream-11)" }}
                  >
                    Most meetings are the wrong meeting
                  </dt>
                  <dd
                    className="mt-3 text-lg leading-relaxed"
                    style={{ color: "var(--cream-9)" }}
                  >
                    Wrong person, no budget, no real intent, or a no-show you
                    discover twenty minutes in. The pipeline looks busy, and the
                    forecast quietly disagrees.
                  </dd>
                </div>
              </dl>
              <p
                className="mt-10 rounded-2xl border-x-4 px-6 py-5 text-lg leading-relaxed font-semibold"
                style={{
                  color: "var(--cream-11)",
                  background: "var(--mint-tint)",
                  borderColor: "var(--primary)",
                }}
              >
                None of that is a budget problem. It is an access problem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why leaders say yes (white band) ─────────────────────────── */}
      <section style={{ background: "var(--paper-white)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead
            label="The acceptance problem, solved"
            title="Why leaders say"
            italicWord="yes."
            lede="Every other channel asks a senior leader to give something for nothing. This one doesn't."
          />
          <div className="mt-16 grid md:grid-cols-3 gap-4">
            <StepCard
              hoverHighlight
              n="01"
              icon={UserCheck}
              title="They opted in"
              body="Every executive here applied, was vetted, and told us the priorities they will take a meeting about. You are never interrupting. You are answering a question they already asked."
            />
            <StepCard
              hoverHighlight
              n="02"
              icon={Target}
              title="Your reason does the selling"
              body="Before a request reaches a leader, you state the specific initiative or problem it relates to, in plain language. If it matches what they said they care about, they see it. Relevance is the pitch."
            />
            <StepCard
              hoverHighlight
              n="03"
              icon={HeartHandshake}
              title="Saying yes does good"
              body="Every meeting a leader accepts sends $900 to $1,200 to a charity they choose, paid by you, confirmed in writing. Accepting your request is one of the easier good things they will do that week."
            />
          </div>
          <p
            className="mt-12 text-lg leading-relaxed max-w-3xl"
            style={{ color: "var(--cream-9)" }}
          >
            The result is a meeting where the leader chose to be in the room.
            You will feel the difference in the first five minutes.
          </p>
        </div>
      </section>

      {/* ── How it works: 5-step flow (oat band) ─────────────────────── */}
      <VendorsFlow lede="Five steps from your stated reason to a held meeting. Nothing speculative, no surprises. The leader sees the same words you wrote." />

      {/* ── Do the maths (white band) ────────────────────────────────── */}
      <section style={{ background: "var(--paper-white)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead
            label="The honest comparison"
            title="Do the maths you already"
            italicWord="know."
          />
          <div className="mt-12 grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <div>
              <p
                className="text-xs font-mono uppercase tracking-[0.18em]"
                style={{ color: "var(--cream-9)" }}
              >
                What a senior meeting already costs you
              </p>
              <div
                className="mt-4 rounded-3xl border"
                style={{
                  background: "var(--cream-1)",
                  borderColor: "var(--hair)",
                }}
              >
                <MoneyRow k="SDR salary and commission" v="Monthly, fixed" />
                <MoneyRow k="Data and enrichment tools" v="Per seat, monthly" />
                <MoneyRow k="The sequencing platform" v="Per seat, monthly" />
                <MoneyRow k="Months of touches per reply" v="Unbillable time" />
                <MoneyRow
                  k="The wrong-person meetings"
                  v="Time you don't bill"
                  last
                />
              </div>
            </div>
            <div
              className="space-y-6 text-lg leading-relaxed"
              style={{ color: "var(--cream-9)" }}
            >
              <p>
                If you sell to senior buyers, you already carry this stack. It
                runs whether or not a single qualified meeting lands, and the
                real cost of one senior conversation is far higher than any
                invoice shows.
              </p>
              <p>
                Here, it is one line. $1,500 per held meeting, with an accepted
                reason and the right person, prepaid as a credit that is only
                spent once the meeting actually happens. And $900 to $1,200 of
                it goes somewhere your pipeline spend never has: a charity the
                leader chooses.
              </p>
            </div>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-4">
            <MetricCard
              value="$1,500"
              label="Per meeting, prepaid"
              note="Pay one at a time or buy a block of credits ahead. No retainer, no seat fee."
            />
            <MetricCard
              value="10:1"
              label="Executives per vendor"
              note="We cap admissions, so you are never competing in a flooded inbox."
            />
            <MetricCard
              value="60 to 80%"
              label="Funds the giving"
              note="Of your fee goes to the leader's chosen charity, confirmed in writing."
            />
          </div>
        </div>
      </section>

      {/* ── Founder note, vendor-angled (oat band) ───────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--paper-oat)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead
            label="Who is behind this"
            title="Built by someone who sent the"
            italicWord="cold email."
          />
          <div className="mt-12 grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-4">
              <div
                className="relative aspect-[4/5] rounded-2xl overflow-hidden border"
                style={{ background: "var(--background)", borderColor: "var(--border)" }}
              >
                <Image
                  src="/founder.jpg"
                  alt="Isobel Hardwick, founder of TheGoodIntro"
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover object-top"
                />
              </div>
            </div>
            <div className="lg:col-span-8">
              <blockquote
                className="space-y-6 text-lg leading-relaxed"
                style={{ color: "var(--cream-10)" }}
              >
                <p>
                  I have spent my career in enterprise sales development. I have
                  built the sequences, bought the data, and sent the thousands
                  of emails that this product replaces. I know exactly what it
                  costs to get one real conversation with a senior buyer, and I
                  know how it feels on both sides of that inbox.
                </p>
                <p>
                  TheGoodIntro is the channel I wished existed: leaders who
                  actually want to be reached, a reason that has to be real, and
                  a price where most of the money does good instead of
                  disappearing into tooling. I vet every vendor personally for
                  now. If you sell something genuinely relevant to senior
                  Australian leaders, I would like to talk to you.
                </p>
              </blockquote>
              <figcaption className="mt-8">
                <span
                  className="block font-semibold"
                  style={{ color: "var(--cream-11)" }}
                >
                  Isobel Hardwick
                </span>
                <span className="text-sm" style={{ color: "var(--cream-9)" }}>
                  Founder
                </span>
              </figcaption>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ: objections + decision questions, one accordion (white) ── */}
      <section style={{ background: "var(--paper-white)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 md:py-20">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <SectionHead
                label="What you're probably thinking"
                title="Fair questions, straight"
                italicWord="answers."
                lede="The objections and the logistics, in one place. If yours is not here, raise it on the call."
              />
            </div>
            <div className="lg:col-span-8">
              <Faq
                q={"“Paying for a meeting feels like buying access.”"}
                open
                name="vendor-qa"
              >
                You already pay for access, just indirectly and badly, through
                tools and salaries and months of touches. Here the cost is one
                honest line, and it only lands when a real leader chooses to take
                the meeting. Nothing is bought. The leader still has to say yes.
              </Faq>
              <Faq
                q={"“The charity angle sounds like a gimmick.”"}
                name="vendor-qa"
              >
                It is the opposite, because it is verifiable. Every charity is a
                deductible gift recipient (DGR), the gift is paid within 14 days
                and confirmed in writing, and the leader chooses where it goes.
                It is the reason a busy executive opens your request instead of
                binning it, and every gift is listed on the{" "}
                <Link
                  href="/ledger"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  public ledger
                </Link>
                .
              </Faq>
              <Faq
                q={"“We already have an SDR team.”"}
                name="vendor-qa"
              >
                Keep them. This is not a replacement for your pipeline, it is the
                part your pipeline struggles with most: a relevant, accepted
                conversation with a senior person who chose to be in the room.
                Use it for the meetings cold outreach cannot get.
              </Faq>
              {VENDOR_FAQS.map((f) => (
                <Faq key={f.q} q={f.q} name="vendor-qa">
                  {f.node ?? f.a}
                </Faq>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ClosingCta
        eyebrow="The invitation"
        title="Be the introduction"
        italicWord="worth taking."
        lede="A vetted senior audience, a stated reason, and a real gift funded by every meeting you book. If you sell something relevant, this is the easiest yes you will ask for all year."
        primaryCta="Join the waitlist"
        primaryHref="/waitlist"
        sub="One short call to start · You fund the giving"
        tone="oat"
      />
    </>
  );
}
