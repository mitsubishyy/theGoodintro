import {
  PageHero,
  SectionHead,
  MoneyBlock,
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
  IconBriefcase,
  IconNetwork,
  IconGift,
} from "../_components/icons";
import {
  DGR_CHARITY_EXAMPLES,
  ACNC_REGISTER_URL,
  ABN_LOOKUP_URL,
} from "@/lib/config";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Giving. theGoodintro.",
  description:
    "Exactly how the giving works: every meeting sends a real gift to a deductible gift recipient (DGR) endorsed Australian charity the executive chooses, the terms it runs on, and how to verify all of it.",
  path: "/giving",
});

const CAUSES = [
  { icon: IconStethoscope, label: "Health & medical research" },
  { icon: IconBook, label: "Education & young people" },
  { icon: IconSapling, label: "Environment & climate" },
  { icon: IconHandshake, label: "Community & crisis relief" },
  { icon: IconPaw, label: "Animal welfare" },
  { icon: IconHeartCircle, label: "Any other DGR-endorsed cause" },
];

const TERMS = [
  "A real gift is sent for every meeting that is actually held, paid by the vendor, never by the executive.",
  "Once a meeting takes place the donation is committed and is paid within 14 days, regardless of the commercial outcome of the conversation.",
  "Each meeting is one flat $1,500 fee paid by the vendor. The charity receives $900 to $1,200 of it, rising with the number of meetings the vendor takes across the year, and we publish the split at every tier.",
  "The charity's share is held separately between invoice and payment to the charity.",
  "Only deductible gift recipient (DGR) endorsed Australian charities are eligible, so the vendor receives a tax-deductible receipt and every gift is publicly verifiable.",
  "The charity confirms receipt directly to the executive, in writing.",
  "The executive chooses and can change the charity at any time, including a different charity per meeting. We never assign one.",
  "If a vendor behaves badly in a meeting, the gift is still paid in full; the vendor loses access.",
];

export default function Giving() {
  return (
    <>
      <PageHero
        eyebrow="Giving"
        title="Where the gift"
        italicWord="actually lands"
        lede="Every meeting sends a real gift to a charity the executive chooses. This page is the whole of it: how the money moves, the terms it runs on, and how anyone can verify it independently."
        primaryCta="Apply as a founding executive"
        secondaryLabel="See how it works"
        secondaryHref="/how-it-works"
        bg="var(--cream-9)"
      />

      {/* ── The money path ───────────────────────────────────────── */}
      <section
        className="border-y overflow-hidden relative"
        style={{ background: "var(--paper-oat)", borderColor: "var(--border)" }}
      >
        <div className="absolute inset-0 dotgrid opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead
            label="The giving promise"
            title="The money path, exactly."
            lede="The donation is paid by the vendor, held separately, and delivered to the executive's chosen charity within 14 days of the meeting, and confirmed in writing."
          />
          <div className="mt-12">
            <MoneyBlock
              lede="Each meeting is one flat $1,500 fee, paid by the vendor. The charity's share rises with how many meetings the vendor takes across the year, and we publish the split at every tier."
              rows={[
                { k: "Vendor pays, per meeting", v: "$1,500" },
                { k: "To the chosen DGR-endorsed charity", v: "$900 to $1,200" },
                { k: "Paid to the charity", v: "within 14 days" },
                { k: "Confirmed to the executive", v: "in writing" },
              ]}
            />
          </div>
          <div className="mt-16 flex flex-col sm:flex-row items-stretch gap-3 sm:gap-0">
            <FlowStep
              icon={IconBriefcase}
              label="Vendor"
              detail="Pays one flat $1,500 fee per meeting"
            />
            <FlowArrow />
            <FlowStep
              icon={IconNetwork}
              label="theGoodintro"
              detail="Sends the charity its share, keeps the rest to run the network"
            />
            <FlowArrow />
            <FlowStep
              icon={IconGift}
              label="Chosen charity"
              detail="Receives $900 to $1,200, confirms in writing"
              accent
            />
          </div>
        </div>
      </section>

      {/* ── The terms ────────────────────────────────────────────── */}
      <section style={{ background: "var(--paper-white)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <SectionHead
                label="The terms"
                title="What we commit to, in plain words."
                lede="The conditions the giving runs on. These are deliberate, and they are the same for everyone."
              />
            </div>
            <div className="lg:col-span-7">
              <ol className="space-y-5">
                {TERMS.map((t, i) => (
                  <li key={i} className="flex gap-4">
                    <span
                      className="shrink-0 size-7 rounded-full grid place-items-center text-xs font-mono"
                      style={{ background: "var(--accent)", color: "var(--foreground)" }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {t}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ── What DGR means ───────────────────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--paper-oat)", borderColor: "var(--border)" }}
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
      <section style={{ background: "var(--paper-white)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead
            label="The executive chooses"
            title="Their conversation. Their cause."
            lede="The executive directs where their charity's share goes. We never assign a charity for them."
          />
          <div className="mt-12 grid md:grid-cols-3 gap-4">
            <div
              className="rounded-2xl border p-6 md:p-8"
              style={{ background: "var(--cream-1)", borderColor: "var(--hair)" }}
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
              style={{ background: "var(--cream-1)", borderColor: "var(--hair)" }}
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
              style={{ background: "var(--cream-1)", borderColor: "var(--hair)" }}
            >
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                Confirmed in writing
              </div>
              <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
                The charity confirms receipt directly to you, within 14 days
                of the meeting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Causes ───────────────────────────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--paper-oat)", borderColor: "var(--border)" }}
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
      <section style={{ background: "var(--paper-white)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20 md:py-24">
          <p className="text-center text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-10">
            Examples of DGR-endorsed Australian charities
          </p>
          <LogoMarquee
            items={DGR_CHARITY_EXAMPLES}
            ariaLabel="Example DGR-endorsed Australian charities"
          />
          <p className="mt-10 text-center text-xs text-muted-foreground italic max-w-2xl mx-auto">
            Illustrative examples, not partners. The executive chooses any
            DGR-endorsed Australian charity.
          </p>
        </div>
      </section>

      {/* ── Verify it yourself ───────────────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--paper-oat)", borderColor: "var(--border)" }}
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
                style={{ background: "var(--cream-1)", borderColor: "var(--hair)" }}
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
                style={{ background: "var(--cream-1)", borderColor: "var(--hair)" }}
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
      <section style={{ background: "var(--paper-white)" }}>
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
              <Faq q="What if the meeting does not go well?">
                The donation is still paid in full within 14 days. It is
                committed once the meeting happens, regardless of the
                commercial outcome. A vendor who behaves badly loses access,
                but the gift to the charity is never clawed back.
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
                with theGoodintro. The executive chooses, and it can be any
                DGR-endorsed Australian charity.
              </Faq>
              <Faq q="How do I know the money arrived?">
                The charity confirms receipt directly to the executive, in
                writing, within 14 days of the meeting. The charity's share is
                set by the tier and paid in full.
              </Faq>
            </div>
          </div>
        </div>
      </section>

      <ClosingCta
        eyebrow="The invitation"
        title="A relevant meeting,"
        italicWord="a real gift."
        lede="Apply as a founding executive. You decide what is worth your time, and every conversation you take funds a DGR-endorsed charity you choose, $900 to $1,200, at no cost to you."
        secondaryLabel="See the pricing"
        secondaryHref="/pricing"
        tone="oat"
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
          ? { background: "var(--cream-1)", borderColor: "var(--primary)" }
          : { background: "var(--cream-1)", borderColor: "var(--hair)" }
      }
    >
      <div
        className="size-12 rounded-xl mx-auto mb-4 grid place-items-center"
        style={{
          background: accent ? "var(--mint-tint)" : "var(--accent)",
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
      <span className="text-muted-foreground hidden sm:block">→</span>
      <span className="text-muted-foreground sm:hidden">↓</span>
    </div>
  );
}
