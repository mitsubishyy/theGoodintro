import type { Metadata } from "next";
import {
  PageHero,
  SectionHead,
  MoneyBlock,
  ComparisonRow,
  Faq,
  ClosingCta,
} from "../_components/ui";
import { PricingIllustration } from "../_components/illustrations";

export const metadata: Metadata = {
  title: "Pricing. theGoodintro.",
  description:
    "Executives pay nothing, ever. Vendors pay $1,000 per meeting straight to the chosen charity, plus a separate, clearly named platform fee. The gift and the fee never blend.",
};

export default function Pricing() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Priced in the"
        italicWord="open"
        lede="The gift and the fee are two separate numbers and always stay that way. Executives pay nothing. Vendors fund the giving and the platform on clearly named lines."
        primaryCta="Book a vendor call"
        secondaryLabel="See how it works"
        secondaryHref="/how-it-works"
        bg="var(--cream-8)"
        illustration={<PricingIllustration className="w-full h-auto" />}
      />

      {/* ── Two audiences, two prices ─────────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--mint-tint)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead
            label="Who pays what"
            title="One side gives time. The other funds the gift."
          />
          <div className="mt-16 grid lg:grid-cols-2 gap-4">
            {/* Executive */}
            <div
              className="rounded-3xl border p-8 md:p-10"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div
                className="inline-flex items-center text-[10px] font-mono uppercase tracking-[0.18em] px-2.5 py-1 rounded-full"
                style={{ background: "var(--accent)", color: "var(--muted-foreground)" }}
              >
                For executives
              </div>
              <div className="mt-6 display-serif text-[clamp(3.5rem,9vw,6rem)] leading-none text-foreground">
                $0
              </div>
              <div className="mt-3 text-sm font-medium">Free, forever</div>
              <ul className="mt-8 space-y-3 text-sm md:text-base">
                <ComparisonRow text="No fee to join, take meetings, or leave" />
                <ComparisonRow text="No premium tier, now or later" />
                <ComparisonRow text="The founding cohort is grandfathered against any change" />
              </ul>
            </div>

            {/* Vendor */}
            <div
              className="rounded-3xl border p-8 md:p-10"
              style={{ background: "var(--signal-soft)", borderColor: "var(--primary)" }}
            >
              <div
                className="inline-flex items-center text-[10px] font-mono uppercase tracking-[0.18em] px-2.5 py-1 rounded-full"
                style={{ background: "var(--card)", color: "var(--primary)" }}
              >
                For vendors
              </div>
              <div className="mt-6 flex items-end gap-3">
                <span className="display-serif text-[clamp(3.5rem,9vw,6rem)] leading-none text-primary">
                  $1,000
                </span>
                <span className="pb-2 text-sm font-medium text-muted-foreground">
                  per meeting
                </span>
              </div>
              <div className="mt-3 text-sm font-medium">
                Plus a separate, clearly named platform fee
              </div>
              <ul className="mt-8 space-y-3 text-sm md:text-base">
                <ComparisonRow text="The full $1,000 goes to the chosen charity, every meeting" />
                <ComparisonRow text="The platform fee is its own line, never taken from the gift" />
                <ComparisonRow text="An active vendor seat is a membership, quoted on the call" />
              </ul>
            </div>
          </div>
          <p className="mt-10 text-sm text-muted-foreground italic max-w-3xl">
            The $1,000 gift is fixed and public. The platform fee is named on
            every invoice and is being finalised with the founding cohort, so
            it is quoted directly rather than published while the model is in
            validation.
          </p>
        </div>
      </section>

      {/* ── The gift stays whole ──────────────────────────────────── */}
      <section
        className="border-b overflow-hidden relative"
        style={{ background: "var(--stone-tint)", borderColor: "var(--border)" }}
      >
        <div className="absolute inset-0 dotgrid opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead
            label="Where the money goes"
            title="The gift is never the revenue."
          />
          <div className="mt-12">
            <MoneyBlock
              lede="The donation is never reduced to cover running costs. The platform fee is recovered on its own named line, so the charity figure and the business figure never get blended."
              rows={[
                { k: "To the chosen DGR-endorsed charity, per meeting", v: "the full $1,000" },
                { k: "Taken from the donation for costs", v: "nothing" },
                { k: "Platform fee", v: "separate, named line" },
                { k: "What an executive pays", v: "nothing, ever" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── Why a seat is limited ─────────────────────────────────── */}
      <section style={{ background: "var(--card)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <SectionHead
                label="The 3:1 rule"
                title="A seat is a membership, not a list."
                lede="We cap vendor seats at the 3:1 balance, at least three executives for every vendor. That is what keeps access scarce and genuine, and it is the reason senior leaders agree to be here at all. The platform fee funds the business so the gift never has to."
              />
              <ul className="mt-8 space-y-3 text-sm md:text-base max-w-xl">
                <ComparisonRow text="Seats are limited on purpose, not sold to anyone who pays" />
                <ComparisonRow text="More executives is what creates more vendor seats" />
                <ComparisonRow text="Scarcity is the product, for both sides" />
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

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section
        className="border-t"
        style={{ background: "var(--cream-8)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <SectionHead
                label="Questions"
                title="Straight answers on money."
                lede="If yours is not here, ask it on the call."
              />
            </div>
            <div className="lg:col-span-8">
              <Faq q="What does an executive pay?" open>
                Nothing, ever. Joining, setting your topics, declining
                requests, taking meetings, and leaving are all free. There is
                no tier in which an executive is charged, and the founding
                cohort is grandfathered against any future change.
              </Faq>
              <Faq q="What does a vendor pay?">
                Two things, kept separate. A $1,000 charity gift per held
                meeting, which goes in full to the charity the executive
                chooses, and a platform fee on its own clearly named line
                that funds running the business. An active vendor seat is a
                membership, quoted on the call.
              </Faq>
              <Faq q="Why is the platform fee not published?">
                The $1,000 gift is fixed and public. The platform fee is
                still being set with the founding cohort while the model is
                in validation, so it is quoted directly rather than
                advertised. It is always named on its own invoice line, never
                buried, and never taken from the gift.
              </Faq>
              <Faq q="Is the full $1,000 really 100% to charity?">
                Yes. Not a dollar of the gift is kept to cover platform
                costs. Those costs are recovered through the separate fee.
                The charity confirms receipt of the full amount directly to
                the executive in writing.
              </Faq>
              <Faq q="Is the gift tax-deductible?">
                Yes. Every nominated charity holds deductible gift recipient
                (DGR) endorsement, so the charity issues a tax-deductible
                receipt directly to the vendor who paid it. DGR status is
                verifiable on the public register before any meeting is
                confirmed.
              </Faq>
              <Faq q="Why are vendor seats limited?">
                Because access is only valuable if it is scarce. We hold at
                least three executives for every vendor. That 3:1 balance is
                why leaders take these meetings, so we protect it rather than
                sell past it.
              </Faq>
              <Faq q="When is a vendor billed?">
                At the point a meeting is confirmed. The donation is held
                separately from platform revenue and is paid to the chosen
                charity within 14 days of the meeting, regardless of the
                commercial outcome.
              </Faq>
            </div>
          </div>
        </div>
      </section>

      <ClosingCta
        eyebrow="The invitation"
        title="Honest money,"
        italicWord="real giving."
        lede="Executives join free. Vendors fund a $1,000 gift and a clearly named fee, never one hidden inside the other."
        primaryCta="Book a vendor call"
        secondaryLabel="See how it works"
        secondaryHref="/how-it-works"
        sub="Free for executives · The gift never blends with the fee"
      />
    </>
  );
}
