import Link from "next/link";
import {
  PageHero,
  SectionHead,
  Faq,
  ClosingCta,
  ComparisonRow,
} from "../_components/ui";
import { FaqJsonLd } from "../_components/json-ld";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "How to get a meeting with a senior executive. TheGoodIntro.",
  description:
    "An honest comparison of the five ways vendors reach senior executives in Australia: cold outbound, events, intent data, warm introductions, and charity-funded introductions. Real costs, real trade-offs, and when each one is the right call.",
  path: "/compare",
});

/**
 * Category-level comparison only. House rule (POSITIONING.md): we never name
 * or compare competitors. Channels are compared as categories, our own rows
 * lose where they honestly lose, and every figure is either ours (from the
 * pricing page) or a hedged typical range, never false precision.
 */

const TABLE_ROWS = [
  {
    channel: "Cold outbound",
    cost: "An SDR seat runs six figures a year fully loaded",
    time: "Weeks to months",
    why: "Persistence, timing, and luck",
    breaks:
      "C-level reply rates are the lowest of any seniority, and every unwanted touch spends the brand you are trying to build",
  },
  {
    channel: "Events and sponsorships",
    cost: "$10,000 to $50,000 and beyond per event",
    time: "Tied to the event calendar",
    why: "They were attending anyway",
    breaks:
      "Attribution is murky, the executive you need may not attend, and the meeting still has to be earned afterwards",
  },
  {
    channel: "Intent data and lead lists",
    cost: "$10,000 to $40,000 a year, plus the outbound to act on it",
    time: "Weeks",
    why: "It does not change why they show up, it only sharpens targeting",
    breaks:
      "Senior executives rarely trip intent signals personally; the data points at their teams",
  },
  {
    channel: "Warm introductions",
    cost: "Free in cash, expensive in favours",
    time: "Days, when the connection exists",
    why: "Trust transfers from the person introducing you",
    breaks: "Each favour is spent once. It cannot be scheduled, scaled, or forecast",
  },
  {
    channel: "Charity-funded introductions",
    cost: "$1,500 flat per held meeting",
    time: "Days to weeks",
    why: "A vetted, specific reason plus a real gift to a charity they choose",
    breaks:
      "Invite only and Australia first, so coverage is narrower than a list. Wrong tool for high-volume top-of-funnel",
  },
];

const CHANNELS = [
  {
    name: "Cold outbound",
    what: "Email, LinkedIn, and phone, run by SDRs or by the founders themselves. The default channel for most B2B teams, and the one whose true cost is hardest to see because it arrives as salaries and tooling rather than a per-meeting invoice.",
    rows: [
      { text: "Scales with headcount and works at manager and director seniority" },
      { text: "You control the message, the volume, and the timing" },
      {
        text: "Reply rates collapse at C-level, where unsolicited approaches are filtered by EAs and habit",
        bad: true,
      },
      {
        text: "The real cost per held executive meeting lands far above what the tooling invoices suggest",
        bad: true,
      },
    ],
    when: "Choose it when your buyer is a manager or director and volume genuinely helps.",
  },
  {
    name: "Events and sponsorships",
    what: "Conference booths, sponsored dinners, roundtables, and passes. The oldest channel there is, and still the strongest way to be in the same room as people who chose to show up.",
    rows: [
      { text: "Real conversations with attendees who opted in to being there" },
      { text: "Builds brand and category presence alongside pipeline" },
      {
        text: "Five figures per event before travel, and the named executive you need may not attend",
        bad: true,
      },
      {
        text: "The event opens a door; the actual meeting still has to be won afterwards",
        bad: true,
      },
    ],
    when: "Choose it when market presence matters as much as any single meeting.",
  },
  {
    name: "Intent data and lead lists",
    what: "Subscriptions that score accounts, surface contacts, and flag buying signals. Genuinely useful, but it is fuel for outbound rather than a channel of its own, so the costs stack on top of the SDR motion it feeds.",
    rows: [
      { text: "Sharpens targeting so outbound spends fewer touches on the wrong accounts" },
      { text: "Useful early signal at the account level" },
      {
        text: "It cannot make an executive want the meeting; it only tells you who to ask",
        bad: true,
      },
      {
        text: "Senior executives rarely generate intent signals themselves; their teams do the researching",
        bad: true,
      },
    ],
    when: "Choose it when you already run outbound well and want it more accurate.",
  },
  {
    name: "Warm introductions",
    what: "A mutual connection, investor, or advisor vouches for you. The highest hit rate of any channel, because trust transfers, and the least repeatable, because every favour is a withdrawal from a finite account.",
    rows: [
      { text: "The best conversion of any channel when the connection is real" },
      { text: "Costs nothing in cash" },
      {
        text: "Each ask spends the relationship; asking repeatedly drains it",
        bad: true,
      },
      { text: "Cannot be scheduled, scaled, or forecast", bad: true },
    ],
    when: "Choose it when the connection exists and the ask is worth the favour.",
  },
  {
    name: "Charity-funded introductions",
    what: "A vetted meeting request with a specific, relevant reason, where the vendor's fee funds a real gift to a charity the executive chooses. The executive's time creates value they care about even when the product turns out not to be a fit.",
    rows: [
      { text: "The executive has a real reason to show up that is not your product" },
      {
        text: "You pay only when the meeting holds: $1,500 flat, no subscriptions, no seat fees",
      },
      {
        text: "Between $900 and $1,200 of every fee reaches the chosen charity, published on a public ledger",
      },
      {
        text: "Invite only and Australia first, so coverage is narrower than a list",
        bad: true,
      },
      { text: "The wrong tool for high-volume top-of-funnel", bad: true },
    ],
    when: "Choose it when a handful of named senior executives matter more than a thousand contacts.",
  },
];

// Single source for the visible FAQ and the FAQPage JSON-LD, same pattern as
// /faq: `a` is the plain text used in both places so the schema never drifts.
const FAQS: { q: string; a: string; node?: React.ReactNode }[] = [
  {
    q: "What does it cost to get a meeting with a C-level executive?",
    a: "More than most teams realise, because the cost hides in salaries and subscriptions. Once an SDR's salary, data, and tooling are counted, teams commonly spend several thousand dollars for each meeting that actually holds with a senior decision maker. A sponsored event runs five figures before travel. A charity-funded introduction through TheGoodIntro is $1,500 AUD flat, charged only when the meeting holds, with between $900 and $1,200 of that reaching a charity the executive chooses.",
  },
  {
    q: "What is a charity-funded introduction?",
    a: "A charity-funded introduction is a vetted meeting request where the vendor's fee funds a real gift to a charity the executive chooses. The executive is paid nothing personally. The model works because the executive's time creates value they genuinely care about, so they can take a short meeting on merit rather than out of politeness or persistence.",
  },
  {
    q: "Why would a senior executive accept a meeting with a vendor?",
    a: "Two conditions, and both have to hold. First, the request is specific and relevant: a concrete reason this conversation is worth thirty minutes of their calendar, vetted before it ever reaches them. Second, the time produces something they value regardless of the outcome. On TheGoodIntro that is a real gift to a charity they chose, confirmed in writing after the meeting.",
  },
  {
    q: "Is paying for executive meetings legitimate?",
    a: "Paying the executive personally would not be, and that is not what happens here. The vendor's fee funds a gift to a DGR-endorsed Australian charity that the executive chooses, paid by TheGoodIntro after the meeting and published on a public ledger. Nothing reaches the executive personally, which is exactly why the model passes the corporate gift policies that block bottles of wine and event tickets.",
  },
  {
    q: "How is this different from buying a lead list?",
    a: "A list sells you contact data and leaves the hardest part, getting a yes, entirely to you. A charity-funded introduction is the yes itself: a held conversation that the executive accepted with full context on who is asking and why. One is raw material for outbound. The other is the outcome outbound is trying to buy.",
  },
  {
    q: "Does this replace cold outbound?",
    a: "No, and we would rather say that plainly than oversell it. Outbound, events, and intent data all earn their place at volume and at mid-market seniority. A charity-funded introduction covers the part those channels are weakest at: the short list of named senior executives whose yes actually moves your year.",
  },
];

export default function Compare() {
  return (
    <>
      <FaqJsonLd items={FAQS} />
      <PageHero
        eyebrow="The honest comparison"
        title="Five ways into an executive's"
        italicWord="calendar"
        lede="Every B2B vendor hits the same wall: the person who can say yes does not take cold meetings. Here are the five channels that exist, what each one really costs, and when each is the right call. Including when ours is not."
        primaryCta="Join the waitlist"
        primaryHref="/waitlist"
        secondaryLabel="How it works"
        secondaryHref="/how-it-works"
      />

      {/* ── The short answer ─────────────────────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--paper-oat)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <SectionHead
                label="The short answer"
                title="There is no free channel."
              />
            </div>
            <div className="lg:col-span-7 space-y-6 text-[16px] md:text-[17px] leading-relaxed text-foreground/85">
              <p>
                There are five reliable ways to reach a senior executive: cold
                outbound, events and sponsorships, intent data, warm
                introductions, and charity-funded introductions. They differ
                less in whether they work than in what you pay with. Some cost
                money, some cost months, and some cost social capital. The
                expensive mistake is using a volume channel to chase a
                shortlist, or a scarce channel to fill a funnel.
              </p>
              <p>
                A charity-funded introduction is the newest of the five: a
                vetted meeting request where the vendor&apos;s fee funds a real gift
                to a charity the executive chooses. The executive is paid
                nothing personally. Their time creates value they care about,
                so they can take the meeting on merit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── The comparison table ──────────────────────────────────────── */}
      <section style={{ background: "var(--paper-white)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead
            label="Side by side"
            title="The five channels, honestly."
            lede="Typical figures, not promises. The only precise number in this table is our own."
          />
          <div className="mt-12 overflow-x-auto">
            <table className="w-full text-left text-[14px] min-w-[840px]">
              <thead>
                <tr>
                  {[
                    "Channel",
                    "Typical cost",
                    "Time to first meeting",
                    "Why the executive shows up",
                    "Where it breaks down",
                  ].map((h) => (
                    <th
                      key={h}
                      className="pb-4 pr-6 font-mono text-[10px] uppercase tracking-[0.18em] font-medium text-muted-foreground align-bottom"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((r) => (
                  <tr
                    key={r.channel}
                    className="border-t align-top"
                    style={{ borderColor: "var(--hair)" }}
                  >
                    <th
                      scope="row"
                      className="py-5 pr-6 font-semibold text-foreground whitespace-nowrap"
                    >
                      {r.channel}
                    </th>
                    <td className="py-5 pr-6 text-foreground/85">{r.cost}</td>
                    <td className="py-5 pr-6 text-foreground/85 whitespace-nowrap">
                      {r.time}
                    </td>
                    <td className="py-5 pr-6 text-foreground/85">{r.why}</td>
                    <td className="py-5 text-foreground/85">{r.breaks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Channel by channel ────────────────────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--paper-oat)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead
            label="Channel by channel"
            title="When each one is the right call."
            lede="Every channel on this page earns its place somewhere. The question is whether that somewhere is your shortlist."
          />
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            {CHANNELS.map((c, i) => (
              <div
                key={c.name}
                className={
                  "rounded-3xl border p-8 md:p-10" +
                  (i === CHANNELS.length - 1 ? " md:col-span-2" : "")
                }
                style={{
                  borderColor: "var(--hair)",
                  background: "var(--cream-1)",
                }}
              >
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {c.name}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
                  {c.what}
                </p>
                <ul className="mt-6 space-y-3.5 text-[14px]">
                  {c.rows.map((r) => (
                    <ComparisonRow key={r.text} text={r.text} bad={r.bad} />
                  ))}
                </ul>
                <p
                  className="mt-6 pt-5 border-t text-[14px] font-medium text-foreground"
                  style={{ borderColor: "var(--hair)" }}
                >
                  {c.when}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Where we fit ──────────────────────────────────────────────── */}
      <section style={{ background: "var(--paper-white)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <SectionHead
                label="Where we fit"
                title="Built for the shortlist, not the spreadsheet."
              />
            </div>
            <div className="lg:col-span-7 space-y-6 text-[16px] md:text-[17px] leading-relaxed text-foreground/85">
              <p>
                TheGoodIntro is an invite-only Australian network for exactly
                one job: held conversations with named senior executives.
                Vendors pay $1,500 AUD per held meeting and nothing otherwise.
                Executives choose from a curated shortlist of charities or
                nominate any DGR-endorsed Australian charity, and every gift is
                published on the{" "}
                <Link
                  href="/ledger"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  public ledger
                </Link>
                .
              </p>
              <p>
                And because an honest comparison cuts both ways: we are the
                wrong choice if your buyer is a manager rather than an
                executive, if you need hundreds of meetings a quarter, or if
                your deal size cannot carry $1,500 for a held conversation. The
                channels above will serve you better, and the{" "}
                <Link
                  href="/pricing"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  pricing page
                </Link>{" "}
                lays out our numbers so you can do that math before you talk to
                us.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--paper-oat)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <SectionHead
                label="Questions"
                title="Asked before the call."
                lede="The questions vendors raise when they are weighing this against the channels they already run."
              />
            </div>
            <div className="lg:col-span-8">
              {FAQS.map((f, i) => (
                <Faq key={f.q} q={f.q} open={i === 0}>
                  {f.node ?? f.a}
                </Faq>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ClosingCta
        title="Meet the few who"
        italicWord="matter"
        lede="Join the waitlist and the founder will be in touch. Every held meeting is $1,500 flat, and between $900 and $1,200 of it goes to a charity the executive chooses."
        secondaryLabel="See the pricing"
        secondaryHref="/pricing"
      />
    </>
  );
}
