import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Heart, HeartHandshake, Lock } from "lucide-react";
import {
  PageHero,
  SectionHead,
  MoneyBlock,
  ComparisonRow,
  Faq,
  ClosingCta,
} from "../_components/ui";
import {
  IconBriefcase,
  IconNetwork,
  IconGift,
  IconHandshake,
  IconIntro,
  IconHeartCircle,
} from "../_components/icons";
import { VendorsIllustration } from "../_components/illustrations";

export const metadata: Metadata = {
  title: "For vendors. theGoodintro.",
  description:
    "A qualified introduction to a vetted, hard-to-reach senior audience. Every meeting you book sends $1,000 to the leader's chosen charity. Australia first, invite only.",
};

export default function Vendors() {
  return (
    <>
      <PageHero
        eyebrow="For vendors"
        title="Reach leaders"
        italicWord="honestly"
        lede="A genuinely qualified introduction to a vetted, hard-to-reach senior audience. Earned by being relevant, not by buying a list and sending more cold email."
        primaryCta="Book a call"
        pill="Founding vendor applications open"
        bg="var(--cream-4)"
        illustration={<VendorsIllustration className="w-full h-auto" />}
      />

      {/* ── What you get ─────────────────────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--mint-tint)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead
            label="What you get"
            title="A room you cannot cold-email into."
          />
          <div className="mt-16 grid md:grid-cols-3 gap-4">
            <VendorCard
              icon={IconHandshake}
              title="A vetted senior audience"
              body="Leaders who opted in and set their own priorities. Not a scraped list, and not someone screening on their behalf."
            />
            <VendorCard
              icon={IconIntro}
              title="A qualified introduction"
              body="You state the specific initiative. It reaches the leader only when it genuinely fits what they asked to hear about."
            />
            <VendorCard
              icon={IconHeartCircle}
              title="Goodwill that lasts"
              body="Every meeting sends $1,000 to the leader's chosen charity. You are remembered as the introduction that did some good."
            />
          </div>
        </div>
      </section>

      {/* ── Who this is for ──────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead label="Who this is for" title="Built for vendors who mean it." />
          <div className="mt-16 grid md:grid-cols-3 gap-4">
            <VendorCard
              icon={Heart}
              title="Socially minded"
              body="You are glad that the value you create here also sends a substantial gift to a cause the leader chooses."
              lucide
            />
            <VendorCard
              icon={BadgeCheck}
              title="Genuine intent"
              body="You have a specific initiative or problem to discuss and can state it plainly. No vague discovery, no laboured demos."
              lucide
            />
            <VendorCard
              icon={HeartHandshake}
              title="Meet on their terms"
              body="One focused conversation, led by the leader's priorities. No hard selling. The relationship is the point."
              lucide
            />
          </div>
        </div>
      </section>

      {/* ── What is expected ─────────────────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--stone-tint)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead
            label="What is expected"
            title="State your reason up front."
            lede="Before a request reaches a leader you describe the specific initiative or challenge that makes the conversation relevant. That one requirement is what keeps quality high on both sides, and it is why senior leaders agree to be here at all."
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
                title="Real access, not an auction."
                lede="We deliberately keep at least three executives for every vendor. You are not one of a hundred vendors fighting over the same inbox. Access stays genuine, which is exactly why senior leaders agree to be here at all."
              />
              <ul className="mt-8 space-y-3 text-sm md:text-base max-w-xl">
                <ComparisonRow text="At least three executives for every vendor admitted" />
                <ComparisonRow text="No bidding war and no race to the cheapest pitch" />
                <ComparisonRow text="Scarcity is the product: it is why leaders stay" />
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

      {/* ── Pricing ──────────────────────────────────────────────── */}
      <section
        className="border-b overflow-hidden relative"
        style={{ background: "var(--mint-tint)", borderColor: "var(--border)" }}
      >
        <div className="absolute inset-0 dotgrid opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead
            label="What it costs, in full"
            title="Transparent pricing."
          />
          <div className="mt-12">
            <MoneyBlock
              lede="The donation is never reduced to cover our costs. The admin fee is its own named line, so you always know exactly what funds the charity and what funds the platform."
              rows={[
                { k: "To the leader's chosen charity, per meeting", v: "the full gift" },
                { k: "Platform admin fee", v: "billed to you, separately" },
                { k: "What the leader pays", v: "nothing, ever" },
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
                title="Before you apply."
                lede="The things vendors ask first. If yours is not here, raise it on the call."
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
              <Faq q="What has to be in a request?">
                The specific initiative or problem that makes the
                conversation relevant to that leader, in plain language. No
                vague discovery, no generic decks. The leader sees that
                reason and decides. If what happens in the meeting does not
                match the stated reason, that counts against your access.
              </Faq>
              <Faq q="What does the 3:1 rule mean for me?">
                We keep at least three executives for every vendor admitted.
                It means you are not competing with a crowd for the same
                inbox, but it also means seats are deliberately limited.
                Access is genuine because it is scarce. That scarcity is the
                reason leaders take these meetings at all.
              </Faq>
              <Faq q="What exactly do I pay?">
                Per held meeting you pay the $1,000 charity gift, which goes
                in full to the charity the leader chooses, plus a separate
                platform fee on its own clearly named line. The gift is never
                reduced to cover our costs. There is also a platform
                membership for an active vendor seat. Pricing is on the{" "}
                <Link
                  href="/pricing"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  pricing page
                </Link>
                .
              </Faq>
              <Faq q="Is the $1,000 tax-deductible to us?">
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
              <Faq q="Can we choose the charity?">
                No. The executive chooses, every time. The giving belongs to
                the leader. Your name is attached to the introduction that
                funded it, which is the point.
              </Faq>
              <Faq q="Why Australia first?">
                Starting in one market keeps quality high and every gift
                verifiable while the model is proven. International expansion
                comes once the founding cohort has shaped how this works.
              </Faq>
            </div>
          </div>
        </div>
      </section>

      <ClosingCta
        eyebrow="The invitation"
        title="Be the introduction"
        italicWord="worth taking."
        lede="Reach senior leaders by being relevant, and fund a real gift while you do it. Every meeting you book sends $1,000 to the leader's chosen charity."
        primaryCta="Book a call"
        sub="One short call to start · You fund the giving"
      />
    </>
  );
}

function VendorCard({
  icon: Icon,
  title,
  body,
  lucide,
}: {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  body: string;
  lucide?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-0.5"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="size-10 rounded-xl bg-foreground/[0.04] grid place-items-center mb-6">
        {lucide ? (
          <Icon className="size-5 text-foreground" />
        ) : (
          <Icon size={20} className="text-foreground" />
        )}
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
        {body}
      </p>
    </div>
  );
}
