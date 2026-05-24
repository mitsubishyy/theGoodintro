import { Users, Filter, Heart } from "lucide-react";
import { PageHero, PrimaryCta } from "../_components/ui";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Pricing. theGoodintro.",
  description:
    "$1,500 AUD per meeting. Between $900 and $1,200 of that reaches the charity the executive chooses, rising with the number of meetings you take across the year.",
  path: "/pricing",
});

const TIERS = [
  { range: "1 – 5", charity: 900, pct: 60 },
  { range: "6 – 10", charity: 1000, pct: 67 },
  { range: "11 – 15", charity: 1100, pct: 73 },
  { range: "16+", charity: 1200, pct: 80 },
];

export default function Pricing() {
  return (
    <>
      <PageHero
        eyebrow="For vendors"
        title={
          <>
            One price. More{" "}
            <span className="serif-italic" style={{ color: "var(--primary)" }}>
              Good
            </span>{" "}
            the more you meet.
          </>
        }
        lede="Every meeting costs $1,500 AUD. The more meetings you take, the more goes to a charity the executive chooses."
        primaryCta="Apply as a founding vendor"
        secondaryLabel="See how it works"
        secondaryHref="/how-it-works"
        bg="var(--cream-8)"
      />

      <section style={{ background: "var(--paper-oat)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          {/* Main pricing card */}
          <div
            className="mx-auto max-w-[540px] rounded-3xl border p-8 md:p-10"
            style={{ background: "var(--cream-1)", borderColor: "var(--hair)" }}
          >
            <div className="text-center">
              <div className="flex items-end justify-center gap-3">
                <span className="display-serif text-[clamp(3rem,8vw,4.25rem)] leading-none text-foreground">
                  $1,500
                </span>
                <span className="pb-2 text-sm font-medium text-muted-foreground">
                  AUD / meeting
                </span>
              </div>
              <div className="mt-3 text-[13px] text-muted-foreground">
                One flat fee. No subscriptions. No hidden costs.
              </div>
            </div>

            <div className="mt-10 mb-4 text-center">
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                The more you meet, the more goes to charity
              </span>
            </div>

            <div>
              {TIERS.map((tier, i) => (
                <TierRow
                  key={i}
                  range={tier.range}
                  charity={tier.charity}
                  last={i === TIERS.length - 1}
                />
              ))}
            </div>
          </div>

          {/* GST disclosure */}
          <div className="mt-8 text-center text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            All prices in AUD and exclude GST
          </div>

          {/* Charity callout */}
          <div
            className="mx-auto mt-14 max-w-[540px] border-l-2 px-6 py-5"
            style={{
              borderColor: "var(--primary)",
              background: "var(--cream-1)",
            }}
          >
            <p className="serif-italic text-base md:text-lg text-foreground leading-snug">
              The more you meet, the more goes to charity.
            </p>
            <p className="mt-3 text-[13px] text-muted-foreground leading-relaxed">
              At 16 or more meetings a year, $1,200 of every $1,500 meeting goes directly to the cause the executive chooses. The more you meet, the more reaches the charity, from $900 a meeting up to $1,200.
            </p>
          </div>

          {/* Value prop cards */}
          <div className="mx-auto mt-12 max-w-[540px] grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ValueCard
              icon={Users}
              title="The 10:1 rule"
              body="At least ten executives for every vendor. You're never crowded out."
            />
            <ValueCard
              icon={Filter}
              title="Qualified"
              body="Every meeting pre-qualified for fit before booking."
            />
            <ValueCard
              icon={Heart}
              title="Impact"
              body="$900 to $1,200 of every meeting goes to charity, rising the more you meet."
            />
          </div>

          {/* CTA */}
          <div className="mx-auto mt-14 max-w-[540px] flex flex-col items-center text-center">
            <PrimaryCta>Apply as a founding vendor</PrimaryCta>
            <p className="mt-4 text-xs text-muted-foreground">
              Limited to ~20 vendor seats at any time.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function TierRow({
  range,
  charity,
  last,
}: {
  range: string;
  charity: number;
  last?: boolean;
}) {
  return (
    <div
      className={"flex items-baseline justify-between gap-6 py-5 " + (last ? "" : "border-b")}
      style={!last ? { borderColor: "var(--border)" } : undefined}
    >
      <div>
        <div className="text-sm font-semibold tracking-tight tabular-nums">
          {range} meetings / yr
        </div>
      </div>
      <div className="text-right">
        <span
          className="display-serif text-2xl tabular-nums"
          style={{ color: "var(--primary)" }}
        >
          ${charity.toLocaleString()}
        </span>
        <span className="ml-2 text-xs text-muted-foreground">
          per meeting to charity
        </span>
      </div>
    </div>
  );
}

function ValueCard({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div
      className="rounded-2xl border p-5 text-center"
      style={{ background: "var(--cream-1)", borderColor: "var(--hair)" }}
    >
      <div
        className="flex justify-center mb-3"
        style={{ color: "var(--primary)" }}
      >
        <Icon size={20} />
      </div>
      <div className="text-[13px] font-semibold tracking-tight">{title}</div>
      <div className="mt-2 text-xs text-muted-foreground leading-relaxed">
        {body}
      </div>
    </div>
  );
}
