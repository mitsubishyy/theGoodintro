import { Quote } from "lucide-react";
import {
  PageHero,
  SectionHead,
  MetricCard,
  ComparisonRow,
  ClosingCta,
} from "../_components/ui";
import { LogoMarquee } from "../_components/LogoMarquee";
import { DGR_CHARITY_EXAMPLES } from "@/lib/config";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Impact. theGoodintro.",
  description:
    "Every executive gets a public, shareable impact page showing how much they have directed to charity. This is a preview of what each page will show. No real figures exist yet.",
  path: "/impact",
});

export default function Impact() {
  return (
    <>
      <PageHero
        eyebrow="Impact"
        title="Giving you can"
        italicWord="point to"
        lede="Every executive gets a public, shareable page showing exactly how much their meetings have sent to charity. This is the shape of that page. No real figures exist yet, so everything below is a clearly marked sample."
        primaryCta="Apply as a founding executive"
        secondaryLabel="How the giving works"
        secondaryHref="/giving"
        bg="var(--cream-10)"
      />

      {/* ── Honest status ────────────────────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--mint-tint)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20 md:py-24">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <SectionHead
                label="Where we are today"
                title="Zero, honestly."
              />
            </div>
            <div className="lg:col-span-7">
              <p className="text-lg text-muted-foreground leading-relaxed">
                The founding cohort is forming now, so the live total
                directed to charity is genuinely $0. We will not publish a
                number until a meeting has actually funded one. When it does,
                this page fills with real, confirmed figures. Until then,
                what follows is a sample so you can see exactly what will be
                shown.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sample preview ───────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="flex items-center gap-3 mb-10">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em]"
              style={{ background: "var(--accent)", color: "var(--muted-foreground)" }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ background: "var(--border-strong)" }}
              />
              Sample preview, not real figures
            </span>
          </div>

          <div
            className="rounded-3xl border border-dashed p-8 md:p-14"
            style={{ background: "var(--card)", borderColor: "var(--border-strong)" }}
          >
            <SectionHead
              label="The whole programme, at a glance"
              title="What the public total will look like."
            />
            <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                value="$128k"
                label="Directed to charity"
                note="Sample. Sum of every gift, in full"
              />
              <MetricCard
                value="128"
                label="Meetings held"
                note="Sample. One gift per meeting that happened"
              />
              <MetricCard
                value="41"
                label="Charities supported"
                note="Sample. All DGR-endorsed, executive chosen"
              />
              <MetricCard
                value="100%"
                label="Of every gift delivered"
                note="Sample. Never reduced for platform costs"
              />
            </div>

            <div className="mt-16 grid lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-5">
                <SectionHead
                  label="A single executive's page"
                  title="Shareable, and theirs."
                  lede="Each executive gets a page like this to share. The numbers are confirmed by the charities, not by us."
                />
              </div>
              <div className="lg:col-span-7">
                <figure
                  className="rounded-3xl border p-8 md:p-10"
                  style={{ background: "var(--background)", borderColor: "var(--border)" }}
                >
                  <Quote className="size-7 text-muted-foreground/30" />
                  <blockquote className="mt-4 text-xl md:text-2xl font-medium leading-snug tracking-tight">
                    A founding executive has directed{" "}
                    <span className="serif-italic">$14,000</span> to causes
                    they chose, across 14 relevant conversations, every dollar
                    confirmed received in writing.
                  </blockquote>
                  <div className="mt-8 flex flex-wrap gap-2">
                    <SamplePill label="Meetings" v="14" />
                    <SamplePill label="Directed" v="$14,000" />
                    <SamplePill label="Causes" v="Their choice" />
                  </div>
                </figure>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Example charities ────────────────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20 md:py-24">
          <p className="text-center text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-10">
            The kind of DGR-endorsed charities the giving reaches
          </p>
          <LogoMarquee
            items={DGR_CHARITY_EXAMPLES}
            ariaLabel="Example DGR-endorsed Australian charities"
          />
          <p className="mt-10 text-center text-xs text-muted-foreground italic max-w-2xl mx-auto">
            Illustrative only. Not partners. Each executive chooses their own
            DGR-endorsed Australian charity.
          </p>
        </div>
      </section>

      {/* ── What your page will show ─────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <SectionHead
                label="What your page will show"
                title="Only what is real."
                lede="When you have taken meetings, your page reflects exactly what happened. Nothing is estimated and nothing is rounded up."
              />
            </div>
            <div className="lg:col-span-7">
              <ul className="space-y-3 text-sm md:text-base">
                <ComparisonRow text="Total directed to charity, confirmed by the charities themselves" />
                <ComparisonRow text="Number of meetings you actually held" />
                <ComparisonRow text="The causes you chose, never assigned by us" />
                <ComparisonRow text="A clean link you can share on LinkedIn or anywhere else" />
                <ComparisonRow text="Nothing shown until a gift has genuinely been made" />
              </ul>
            </div>
          </div>
        </div>
      </section>

      <ClosingCta
        eyebrow="The invitation"
        title="Make the number"
        italicWord="yours."
        lede="Apply as a founding executive. Every meeting you take builds a public record of giving you can stand behind."
        secondaryLabel="See the pricing"
        secondaryHref="/pricing"
      />
    </>
  );
}

function SamplePill({ label, v }: { label: string; v: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-full px-3 py-1.5"
      style={{ background: "var(--accent)" }}
    >
      <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span className="text-xs font-semibold">{v}</span>
    </div>
  );
}
