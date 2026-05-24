import Link from "next/link";
import { PageHero, SectionHead, Faq, ClosingCta, FunnelDiagram } from "../_components/ui";
import { VendorsIllustration } from "../_components/illustrations";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "For vendors. theGoodintro.",
  description:
    "A qualified introduction to a vetted, hard-to-reach senior audience. Every meeting you book sends a real gift to the leader's chosen charity. Australia first, invite only.",
  path: "/vendors",
});

const HERO_STATS = [
  { value: "10:1", label: "Executives for every vendor admitted" },
  {
    value: "$900 to $1,200",
    label: "To the leader's chosen charity, per meeting",
  },
  { value: "45 min", label: "One focused conversation, led by the leader" },
];

const FUNNEL = [
  "You state the specific initiative",
  "It is matched to a leader's stated priorities",
  "The leader sees the reason and decides",
  "The meeting happens, one focused conversation",
  "A gift goes to the leader's chosen charity",
];

export default function Vendors() {
  return (
    <>
      <PageHero
        eyebrow="For vendors"
        title="Reach leaders"
        italicWord="honestly"
        lede="A genuinely qualified introduction to a vetted, hard-to-reach senior audience. Earned by being relevant, not by buying a list and sending more cold email."
        primaryCta="Apply as a founding vendor"
        pill="Founding vendor applications open"
        bg="var(--cream-4)"
        illustration={<VendorsIllustration className="w-full h-auto" />}
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

      {/* ── The funnel: request to gift, one diagram ─────────────────── */}
      <section style={{ background: "var(--paper-white)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead
            label="How it works for vendors"
            title="From request to gift."
            lede="Every request states why it is relevant before it reaches a leader. That single rule keeps quality high on both sides, and it is why senior leaders agree to be here at all."
          />

          <FunnelDiagram steps={FUNNEL} />
        </div>
      </section>

      {/* ── The money split: where $1,500 goes ───────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--paper-oat)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead
            label="What it costs, in full"
            title="Where your money goes."
          />

          <div className="mt-12 max-w-4xl">
            <div
              className="flex items-baseline gap-3 font-mono uppercase tracking-[0.14em]"
              style={{ color: "var(--cream-9)" }}
            >
              <span
                className="font-black tracking-[-0.03em] tabular-nums normal-case"
                style={{ color: "var(--cream-11)", fontSize: "clamp(2rem, 4vw, 3rem)", fontFamily: "var(--font-inter), sans-serif" }}
              >
                $1,500
              </span>
              <span className="text-xs">per meeting</span>
            </div>

            {/* split bar */}
            <div
              className="mt-6 flex gap-1.5 h-24 rounded-2xl overflow-hidden"
              role="img"
              aria-label="Of every 1,500 dollar meeting, 900 to 1,200 dollars goes to the leader's chosen charity and 300 to 600 dollars runs the network."
            >
              <div
                className="flex flex-col justify-center px-6 rounded-l-2xl"
                style={{ flexGrow: 75, background: "var(--primary)", color: "var(--cream-1)" }}
              >
                <span className="font-black text-xl md:text-2xl tracking-[-0.02em] tabular-nums">
                  $900 to $1,200
                </span>
                <span className="text-xs md:text-sm opacity-90">
                  to the leader&apos;s chosen charity
                </span>
              </div>
              <div
                className="flex flex-col justify-center px-4 rounded-r-2xl"
                style={{ flexGrow: 25, background: "var(--stone)", color: "var(--cream-11)" }}
              >
                <span className="font-black text-base md:text-lg tracking-[-0.02em] tabular-nums">
                  $300 to $600
                </span>
                <span className="text-[11px] md:text-xs" style={{ color: "var(--cream-10)" }}>
                  runs the network
                </span>
              </div>
            </div>

            <p
              className="mt-6 text-[15px] leading-relaxed max-w-2xl"
              style={{ color: "var(--cream-9)" }}
            >
              The charity share rises with the number of meetings you take
              across the year. Full tier table on the{" "}
              <Link
                href="/pricing"
                className="underline underline-offset-4 hover:text-primary"
              >
                pricing page
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ: the four decision questions ─────────────────────────── */}
      <section style={{ background: "var(--paper-white)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 md:py-20">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <SectionHead
                label="Questions"
                title="Before you apply."
                lede="The four things vendors weigh first. If yours is not here, raise it on the call."
              />
            </div>
            <div className="lg:col-span-8">
              <Faq q="How does a vendor get accepted?" open>
                You apply, you are interviewed, and you are vetted before you
                can request a single meeting. We are looking for a specific
                reason to talk to senior leaders, not a list to blast.
                Acceptance is not automatic and it is not for sale. Vendors
                who repeatedly miss relevance, or who behave badly in
                meetings, lose access.
              </Faq>
              <Faq q="What exactly do I pay?">
                One flat fee of $1,500 per held meeting. No subscriptions, no
                seat fee, no hidden costs. Between $900 and $1,200 of every
                meeting goes to the charity the leader chooses, rising with the
                number of meetings you take across the year, and we publish the
                exact split at every tier. Pricing is on the{" "}
                <Link
                  href="/pricing"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  pricing page
                </Link>
                .
              </Faq>
              <Faq q="Is the charity gift tax-deductible to us?">
                Yes. Every nominated charity holds deductible gift recipient
                (DGR) endorsement, so the charity issues a tax-deductible
                receipt directly to you, the vendor. DGR status is shown and
                is verifiable on the public register before the meeting is
                confirmed.
              </Faq>
              <Faq q="What if the meeting does not lead anywhere?">
                Once the meeting happens, the donation is committed and is
                paid to the charity within 14 days regardless of the
                commercial outcome. That is deliberate. It keeps the gift
                honest and stops anyone gaming it. You are buying a qualified,
                relevant conversation and a real gift, not a guaranteed deal.
              </Faq>
            </div>
          </div>
        </div>
      </section>

      <ClosingCta
        eyebrow="The invitation"
        title="Be the introduction"
        italicWord="worth taking."
        lede="Reach senior leaders by being relevant, and fund a real gift while you do it. Every meeting you book sends a real gift to the leader's chosen charity."
        primaryCta="Apply as a founding vendor"
        sub="One short call to start · You fund the giving"
        tone="oat"
      />
    </>
  );
}
