import { PageHero, PrimaryCta, Faq } from "../_components/ui";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Pricing. theGoodintro.",
  description:
    "$1,500 AUD per meeting. Between $900 and $1,200 of that reaches the charity the executive chooses, rising with the number of meetings you take across the year.",
  path: "/pricing",
});

// The tier rate applies only to meetings within that band, never
// retroactively. "annual" shows the running total across all bands crossed,
// from the band's first meeting to its last.
const TIERS = [
  { range: "1–5", charity: "$900", annual: "$900 to $4,500" },
  { range: "6–10", charity: "$1,000", annual: "$5,500 to $9,500" },
  { range: "11–15", charity: "$1,100", annual: "$10,600 to $15,000" },
  { range: "16+", charity: "$1,200", annual: "$16,200+" },
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
    q: "Is the charity gift tax-deductible to us?",
    a: "Yes. The charity issues a tax-deductible receipt directly to you. Every nominated charity holds DGR endorsement.",
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
        bg="var(--cream-8)"
      />

      <section style={{ background: "var(--paper-oat)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          {/* Main pricing card */}
          <div
            className="mx-auto max-w-[620px] rounded-3xl border p-8 md:p-10 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.35)]"
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

            {/* Tier table — the rate applies only within each band */}
            <table className="mt-10 w-full border-collapse text-left">
              <thead>
                <tr
                  className="border-b"
                  style={{ borderColor: "var(--border)" }}
                >
                  <th className="pb-3 pr-3 align-bottom text-[10px] font-mono font-medium uppercase tracking-[0.14em] leading-tight text-muted-foreground">
                    Meetings per year
                  </th>
                  <th className="pb-3 px-3 align-bottom text-[10px] font-mono font-medium uppercase tracking-[0.14em] leading-tight text-muted-foreground">
                    Charity share, per meeting
                  </th>
                  <th className="pb-3 pl-3 align-bottom text-right text-[10px] font-mono font-medium uppercase tracking-[0.14em] leading-tight text-muted-foreground">
                    Annual to charity
                  </th>
                </tr>
              </thead>
              <tbody>
                {TIERS.map((tier, i) => (
                  <tr
                    key={tier.range}
                    className={i === TIERS.length - 1 ? "" : "border-b"}
                    style={
                      i === TIERS.length - 1
                        ? undefined
                        : { borderColor: "var(--border)" }
                    }
                  >
                    <td className="py-4 pr-3 text-sm font-semibold tabular-nums whitespace-nowrap">
                      {tier.range}
                    </td>
                    <td className="py-4 px-3">
                      <span
                        className="display-serif text-2xl tabular-nums"
                        style={{ color: "var(--primary)" }}
                      >
                        {tier.charity}
                      </span>
                    </td>
                    <td className="py-4 pl-3 text-right">
                      <span className="display-serif text-base md:text-lg tabular-nums text-foreground">
                        {tier.annual}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* GST disclosure */}
          <div className="mt-8 text-center text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            All prices in AUD and exclude GST
          </div>
        </div>
      </section>

      {/* ── Worked example — opens the alternating-band run ──────── */}
      <section style={{ background: "var(--paper-white)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 md:py-24">
          <div
            className="mx-auto max-w-[620px] border-l-2 px-6 py-5"
            style={{
              borderColor: "var(--primary)",
              background: "var(--cream-1)",
            }}
          >
            <p className="serif-italic text-base md:text-lg text-foreground leading-snug">
              How the tiers add up.
            </p>
            <p className="mt-3 text-[13px] text-muted-foreground leading-relaxed">
              Every meeting costs $1,500. The charity share within that fee
              rises as you take more meetings across the year.
            </p>
            <p className="mt-3 text-[13px] text-muted-foreground leading-relaxed">
              A vendor at 16 meetings sends{" "}
              <strong className="font-semibold text-foreground">$16,200</strong>{" "}
              to charity: $4,500 from the first 5 meetings, $5,000 from the next
              5, $5,500 from the next 5, and $1,200 from the 16th.
            </p>
          </div>
        </div>
      </section>

      {/* ── Questions on the spend ───────────────────────────────── */}
      <section style={{ background: "var(--paper-white)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 md:py-24">
          <div className="mx-auto max-w-[620px]">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-[-0.02em] text-center">
              Questions on the spend.
            </h2>
            <div className="mt-6 grid sm:grid-cols-2 gap-x-10">
              {SPEND_FAQS.map((item) => (
                <Faq key={item.q} q={item.q}>
                  {item.a}
                </Faq>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────────── */}
      <section style={{ background: "var(--paper-white)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 md:py-24">
          <div className="mx-auto max-w-[620px] flex flex-col items-center text-center">
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
