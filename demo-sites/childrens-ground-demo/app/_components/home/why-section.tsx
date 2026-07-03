import Brand from "../brand";

/**
 * "Why this exists" — the manifesto beat between the hero and the first
 * charity marquee. States the problem (senior attention drowned in cold
 * pitches), what we do (relevance before access), and why we're here
 * (time that leaves something behind). Left-aligned editorial split so it
 * doesn't echo the centred hero above it.
 */

const POINTS = [
  {
    label: "The problem",
    title: "Time lost to noise",
    body: "Senior leaders are the most pitched and least protected people in the building. Generic outreach floods the inbox, and the one conversation worth having is lost in the pile.",
  },
  {
    label: "What we do",
    title: "Relevance before access",
    body: "Access is earned, not bought. A vendor has to name the initiative behind the request, you see why before you say yes, and nothing outside your stated priorities ever lands.",
  },
  {
    label: "Why we're here",
    title: "Time that leaves something behind",
    body: (
      <>
        Your attention is scarce, so the time you give should mean something.
        We turn a single relevant conversation into a real, named gift to a
        cause you choose. Fewer meetings, more{" "}
        <span className="hp-serif-italic">Good</span>.
      </>
    ),
  },
];

export default function WhySection() {
  return (
    <section
      className="px-7 sm:px-12 lg:px-16 py-20 md:py-28"
      style={{ background: "var(--paper-white)" }}
      aria-labelledby="why-title"
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <span className="hp-eyebrow">
              <span className="dot" aria-hidden="true" />
              Why this exists
            </span>
            <h2
              id="why-title"
              className="mt-6 text-[clamp(2.25rem,5vw,3.75rem)] font-black leading-[1.03] tracking-[-0.025em]"
              style={{ color: "var(--cream-11)" }}
            >
              Your calendar is full of pitches that go{" "}
              <span className="hp-serif-italic">nowhere</span>.
            </h2>
          </div>

          <div className="lg:col-span-6 lg:pt-3">
            <p
              className="text-[clamp(1.05rem,1.3vw,1.2rem)] leading-[1.6]"
              style={{ color: "var(--cream-9)" }}
            >
              The handful of conversations actually worth your time are buried
              under cold outreach that was never relevant in the first place.{" "}
              <Brand /> exists to fix that, and to make the meetings that do
              happen count for something. A vendor has to state the specific
              reason a meeting matters before it can reach you. Every meeting
              you accept sends a real gift to an Australian charity you choose.
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-10 md:mt-20 md:grid-cols-3 md:gap-0">
          {POINTS.map((p, i) => (
            <div
              key={p.label}
              className={i > 0 ? "md:border-l md:pl-8" : "md:pr-8"}
              style={{ borderColor: "var(--hair)" }}
            >
              <div className="flex items-baseline gap-3">
                <span
                  className="font-mono text-[11px] tracking-[0.18em]"
                  style={{ color: "var(--primary)" }}
                >
                  0{i + 1}
                </span>
                <span
                  className="font-mono text-[11px] uppercase tracking-[0.18em]"
                  style={{ color: "var(--cream-9)" }}
                >
                  {p.label}
                </span>
              </div>
              <h3
                className="mt-4 text-[1.35rem] font-bold tracking-[-0.01em]"
                style={{ color: "var(--cream-11)" }}
              >
                {p.title}
              </h3>
              <p
                className="mt-3 text-[0.97rem] leading-relaxed"
                style={{ color: "var(--cream-9)" }}
              >
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
