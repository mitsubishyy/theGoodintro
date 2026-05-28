import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHero, PrimaryCta, ClosingCta, SectionLabel } from "../_components/ui";
import { IconCheck } from "../_components/icons";
import { PricingSlider } from "../_components/pricing-slider";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Pricing. theGoodintro.",
  description:
    "$1,500 AUD per meeting. Between $900 and $1,200 of that reaches the charity the executive chooses, rising with the number of meetings you take across the year.",
  path: "/pricing",
});

// Cumulative position at the end of each band (and 20 = into band 4).
// charity / pay are the running totals to that meeting; pct = charity ÷ pay.
const ANNUAL_ROWS = [
  { vol: "5 meetings", band: "End of band 1", charity: "$4,500", pct: 60, pay: "$7,500" },
  { vol: "10 meetings", band: "End of band 2", charity: "$9,500", pct: 63, pay: "$15,000" },
  { vol: "15 meetings", band: "End of band 3", charity: "$15,000", pct: 67, pay: "$22,500" },
  { vol: "20 meetings", band: "Into band 4", charity: "$21,000", pct: 70, pay: "$30,000" },
];

const TICKS = [
  "The gift to the chosen charity is paid after the meeting and confirmed in writing",
  "Every nominated charity is DGR-endorsed and listed on the public register",
  "The rate applies within each band, never retroactively",
];

const SPEND_FAQS = [
  {
    q: "What counts as a meeting?",
    a: "A held conversation with an executive who has accepted your request. No-shows from either side do not count and do not incur the fee.",
  },
  {
    q: "What if I pre-purchase meeting credits?",
    a: "The tier structure still applies. Buying 16 credits upfront does not unlock the $1,200 rate from meeting one. The charity share builds as you cross each band, the same way it would month by month.",
  },
  {
    q: "How do we know the gift reaches the charity?",
    a: "Every nominated charity is DGR-endorsed and listed on the public register, so it is independently verifiable. The gift is paid to the executive's chosen charity after the meeting and confirmed in writing.",
  },
  {
    q: "Do I lose unused credits at year-end?",
    a: "No. Credits roll over into the new year. Your tier resets each calendar year, so a new year begins back at the $900 band.",
  },
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
      />

      {/* ── Pricing card — same light tone as the hero ───────────────── */}
      <section style={{ background: "var(--paper-white)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 pb-24 md:pb-32 pt-16 md:pt-28">
          <div className="max-w-2xl mb-12">
            <SectionLabel>Pricing · For vendors</SectionLabel>
            <h2 className="mt-5 text-2xl md:text-3xl font-semibold leading-tight tracking-tight text-foreground">
              A flat fee per meeting. The share that reaches the charity the
              executive chooses rises with the number of meetings you take
              across the year.
            </h2>
          </div>

          <div
            className="rounded-3xl border overflow-hidden grid lg:grid-cols-[minmax(0,380px)_1fr]"
            style={{ borderColor: "var(--hair)", background: "var(--cream-1)" }}
          >
            {/* left rail: the fee + the reassurances */}
            <div
              className="p-8 md:p-10 border-b lg:border-b-0 lg:border-r"
              style={{ borderColor: "var(--hair)", background: "var(--cream-1)" }}
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Flat fee, AUD, ex GST
              </div>
              <div className="mt-4 display-serif leading-none tabular-nums" style={{ fontSize: "clamp(3rem, 7vw, 4.5rem)" }}>
                $1,500
              </div>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Per meeting
              </div>

              <p className="mt-6 text-[15px] leading-relaxed text-foreground/80">
                One flat fee per meeting. No subscriptions, no setup, no
                retainer.
              </p>

              <ul className="mt-6 space-y-3.5">
                {TICKS.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[14px] leading-snug">
                    <span
                      className="mt-0.5 size-5 rounded-full grid place-items-center shrink-0"
                      style={{ background: "var(--mint-tint)", color: "var(--primary)" }}
                    >
                      <IconCheck size={12} />
                    </span>
                    <span className="text-foreground/85">{t}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <PrimaryCta>Apply to be a vendor</PrimaryCta>
              </div>
            </div>

            {/* right: annual volume, charity-led — in its own bubble */}
            <div className="p-6 md:p-8" style={{ background: "var(--cream-1)" }}>
              <div
                className="rounded-2xl border p-6 md:p-7"
                style={{ background: "var(--paper-white)", borderColor: "var(--hair)" }}
              >
              <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[140px_1fr_90px] gap-x-6 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Annual volume
                </div>
                <div className="hidden sm:block font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Charity receives
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground text-right">
                  You pay
                </div>
              </div>

              {ANNUAL_ROWS.map((r, i) => (
                <div
                  key={r.vol}
                  className={
                    "grid grid-cols-[1fr_auto] sm:grid-cols-[140px_1fr_90px] gap-x-6 items-center py-6 " +
                    (i < ANNUAL_ROWS.length - 1 ? "border-b" : "")
                  }
                  style={i < ANNUAL_ROWS.length - 1 ? { borderColor: "var(--border)" } : undefined}
                >
                  {/* volume */}
                  <div className="flex items-start gap-2.5">
                    <span
                      className="mt-1.5 size-2 rounded-full shrink-0"
                      style={{ background: "var(--primary)" }}
                      aria-hidden="true"
                    />
                    <div>
                      <div className="text-[15px] font-semibold leading-tight">{r.vol}</div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {r.band}
                      </div>
                    </div>
                  </div>

                  {/* charity receives + bar (full width on mobile) */}
                  <div className="col-span-2 sm:col-span-1 mt-3 sm:mt-0">
                    <div className="display-serif text-3xl md:text-[2rem] leading-none tabular-nums" style={{ color: "var(--primary)" }}>
                      {r.charity}
                    </div>
                    <div
                      className="mt-2.5 h-2 rounded-full overflow-hidden"
                      style={{ background: "var(--mint-tint)" }}
                      role="img"
                      aria-label={`${r.pct} percent of fees reach charity`}
                    >
                      <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: "var(--primary)" }} />
                    </div>
                    <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {r.pct}% of fees reach charity
                    </div>
                  </div>

                  {/* you pay */}
                  <div className="text-right tabular-nums text-sm text-muted-foreground self-start sm:self-center">
                    {r.pay}
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center sm:text-left font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            All prices in AUD and exclude GST
          </div>
        </div>
      </section>

      {/* ── Worked example — darker band, interactive slider ─────────── */}
      <section className="border-y" style={{ background: "var(--paper-oat)", borderColor: "var(--border)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="max-w-2xl mb-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--primary)" }}>
              Worked example · Drag to explore
            </p>
            <h2 className="mt-5 text-3xl md:text-5xl font-extrabold tracking-[-0.02em] leading-[1.05]">
              How the tiers{" "}
              <span className="serif-italic" style={{ color: "var(--primary)" }}>
                add up
              </span>
              .
            </h2>
            <p className="mt-5 text-[15px] md:text-base leading-relaxed text-foreground/75">
              Every meeting costs $1,500. Drag the slider to watch the charity
              share climb, band by band.
            </p>
          </div>

          <PricingSlider />
        </div>
      </section>

      {/* ── Questions on the spend — light band, accordion grid ──────── */}
      <section style={{ background: "var(--paper-white)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20 md:py-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--primary)" }}>
                FAQ · On the spend
              </p>
              <h2 className="mt-5 text-3xl md:text-4xl font-extrabold tracking-[-0.02em]">
                Questions on the{" "}
                <span className="serif-italic" style={{ color: "var(--primary)" }}>
                  spend
                </span>
                .
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-foreground/70 max-w-sm">
                The everyday questions vendors ask about how the fee, the credits
                and the charity gift work in practice.
              </p>
              <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Need more?{" "}
                <Link href="/terms" className="text-primary underline underline-offset-4 hover:opacity-80">
                  Read full terms
                </Link>
              </p>
            </div>

            <div
              className="lg:col-span-8 grid sm:grid-cols-2 border-t border-l"
              style={{ borderColor: "var(--border)" }}
            >
              {SPEND_FAQS.map((item, i) => (
                <details
                  key={item.q}
                  className="group border-b border-r p-6"
                  style={{ borderColor: "var(--border)" }}
                >
                  <summary className="flex items-start gap-4 cursor-pointer list-none">
                    <span className="font-mono text-[10px] text-muted-foreground pt-2 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 font-bold text-[17px] leading-snug">{item.q}</span>
                    <span
                      className="size-9 rounded-full border grid place-items-center shrink-0 transition-transform duration-200 group-open:rotate-45"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <Plus className="size-4" />
                    </span>
                  </summary>
                  <div className="mt-4 pl-9 text-[14px] leading-relaxed text-foreground/70">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ClosingCta
        eyebrow="The invitation"
        title="Be the introduction"
        italicWord="worth taking."
        lede="Reach senior leaders by being relevant, and fund a real gift while you do it. Every meeting you book sends a real gift to the leader's chosen charity."
        primaryCta="Apply to be a vendor"
        sub="Limited to ~20 vendor seats at any time · One short call to start"
        tone="oat"
      />
    </>
  );
}
