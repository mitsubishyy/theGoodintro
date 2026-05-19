import type { Metadata } from "next";
import {
  PageHero,
  SectionHead,
  ComparisonRow,
  Faq,
  ClosingCta,
} from "../_components/ui";
import { LogoMarquee } from "../_components/LogoMarquee";
import {
  IconStethoscope,
  IconBook,
  IconSapling,
  IconHandshake,
  IconPaw,
  IconHeartCircle,
} from "../_components/icons";
import {
  DGR_CHARITY_EXAMPLES,
  ACNC_REGISTER_URL,
  ABN_LOOKUP_URL,
} from "@/lib/config";

export const metadata: Metadata = {
  title: "Charities. TheBigIntro.",
  description:
    "Every meeting funds a charity the executive chooses, restricted to deductible gift recipient (DGR) endorsed Australian charities so the gift is tax-receiptable and verifiable on the public register.",
};

const CAUSES = [
  { icon: IconStethoscope, label: "Health & medical research" },
  { icon: IconBook, label: "Education & young people" },
  { icon: IconSapling, label: "Environment & climate" },
  { icon: IconHandshake, label: "Community & crisis relief" },
  { icon: IconPaw, label: "Animal welfare" },
  { icon: IconHeartCircle, label: "Any other DGR-endorsed cause" },
];

export default function Charities() {
  return (
    <>
      <PageHero
        eyebrow="Charities"
        title="Where the gift"
        italicWord="actually lands"
        lede="Every meeting sends $1,000 to a charity the executive chooses. We restrict that choice to deductible gift recipient (DGR) endorsed Australian charities, so every gift is tax-receiptable and verifiable on a public register."
        primaryCta="Apply as a founding executive"
        secondaryLabel="See how it works"
        secondaryHref="/how-it-works"
        bg="var(--cream-9)"
      />

      {/* ── What DGR means ───────────────────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--mint-tint)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <SectionHead
                label="What DGR means"
                title="Why it has to be DGR."
                lede="Deductible gift recipient is the Australian Taxation Office status that lets a charity issue a tax-deductible receipt to whoever gives. It is a higher bar than charity registration alone."
              />
            </div>
            <div className="lg:col-span-7">
              <ul className="space-y-3 text-sm md:text-base">
                <ComparisonRow text="The vendor who funds the gift receives a tax-deductible receipt, every meeting" />
                <ComparisonRow text="DGR status is public and checkable, so nothing rests on our word" />
                <ComparisonRow text="It keeps every gift traceable to a recognised Australian cause" />
                <ComparisonRow text="It removes any grey area about where the money went" />
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── How the choice works ─────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead
            label="The executive chooses"
            title="Their conversation. Their cause."
            lede="The executive directs every dollar. We never assign a charity, and we never blend the gift with anything else."
          />
          <div className="mt-12 grid md:grid-cols-3 gap-4">
            <div
              className="rounded-2xl border p-6 md:p-8"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                Nominate
              </div>
              <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
                Name any DGR-endorsed Australian charity. The cause is yours to
                pick, not ours to suggest.
              </p>
            </div>
            <div
              className="rounded-2xl border p-6 md:p-8"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                Change freely
              </div>
              <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
                Switch your nominated charity at any time, and nominate a
                different one for each individual meeting.
              </p>
            </div>
            <div
              className="rounded-2xl border p-6 md:p-8"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                Confirmed in writing
              </div>
              <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
                The charity confirms receipt of the full $1,000 directly to
                you, within 14 days of the meeting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Causes ───────────────────────────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--stone-tint)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-28">
          <SectionHead
            label="The kinds of causes"
            title="Whatever matters to you."
            lede="Founding executives have pointed the giving at causes like these. The list is illustrative; the choice is always yours."
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CAUSES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border bg-background px-4 py-3.5"
                style={{ borderColor: "var(--border)" }}
              >
                <div
                  className="size-10 rounded-lg grid place-items-center text-foreground"
                  style={{ background: "var(--card)" }}
                >
                  <Icon size={20} />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Example charities marquee ────────────────────────────── */}
      <section style={{ background: "var(--card)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20 md:py-24">
          <p className="text-center text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-10">
            Examples of DGR-endorsed Australian charities
          </p>
          <LogoMarquee
            items={DGR_CHARITY_EXAMPLES}
            ariaLabel="Example DGR-endorsed Australian charities"
          />
          <p className="mt-10 text-center text-xs text-muted-foreground italic max-w-2xl mx-auto">
            Illustrative only. These are not partners and have no affiliation
            with TheBigIntro. Each executive chooses their own charity.
          </p>
        </div>
      </section>

      {/* ── Verify it yourself ───────────────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--mint-tint)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <SectionHead
                label="Verify it yourself"
                title="Do not take our word for it."
                lede="Every charity on this model is public record. You can check any organisation before a single dollar moves."
              />
            </div>
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
              <a
                href={ACNC_REGISTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border p-6 md:p-8 transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <div className="text-sm font-semibold tracking-tight">
                  ACNC Charity Register
                </div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  The national register of registered charities. Confirm a
                  charity is genuine and in good standing.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium group-hover:text-primary transition-colors">
                  Open the register
                  <span aria-hidden>↗</span>
                </span>
              </a>
              <a
                href={ABN_LOOKUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border p-6 md:p-8 transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <div className="text-sm font-semibold tracking-tight">
                  ABN Lookup
                </div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  The government record of an organisation, including whether
                  it holds deductible gift recipient endorsement.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium group-hover:text-primary transition-colors">
                  Check DGR status
                  <span aria-hidden>↗</span>
                </span>
              </a>
            </div>
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
                title="On the giving."
                lede="If yours is not here, raise it on the call."
              />
            </div>
            <div className="lg:col-span-8">
              <Faq q="What is DGR, in plain terms?" open>
                Deductible gift recipient is an endorsement from the
                Australian Taxation Office. A charity that holds it can issue
                a receipt that makes a gift tax-deductible to the giver. Not
                every registered charity has it, which is why we require it.
              </Faq>
              <Faq q="Can an executive pick a charity that is not DGR-endorsed?">
                No. The choice is restricted to DGR-endorsed Australian
                charities. It is a deliberate limit. It guarantees the vendor
                a tax-deductible receipt and keeps every gift verifiable, with
                no grey area about where money went.
              </Faq>
              <Faq q="Who receives the tax receipt?">
                The vendor, because the vendor pays the donation. The
                executive does not claim a deduction and does not pay
                anything. The charity issues the receipt directly to the
                vendor who funded it.
              </Faq>
              <Faq q="Are the charities shown here your partners?">
                No. The names shown are well-known examples to illustrate the
                kind of organisation that qualifies. They have no affiliation
                with TheBigIntro. The executive chooses, and it can be any
                DGR-endorsed Australian charity.
              </Faq>
              <Faq q="How do I know the money arrived?">
                The charity confirms receipt of the full $1,000 directly to
                the executive, in writing, within 14 days of the meeting. The
                donation is never reduced for platform costs.
              </Faq>
              <Faq q="Can the charity change between meetings?">
                Yes. You can nominate a different DGR-endorsed charity for
                every meeting, and change your default at any time.
              </Faq>
            </div>
          </div>
        </div>
      </section>

      <ClosingCta
        eyebrow="The invitation"
        title="Choose the cause,"
        italicWord="we fund it."
        lede="Apply as a founding executive. Every meeting you take sends $1,000 to a DGR-endorsed charity you choose, confirmed to you in writing."
        secondaryLabel="See the pricing"
        secondaryHref="/pricing"
      />
    </>
  );
}
