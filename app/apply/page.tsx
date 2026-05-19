import type { Metadata } from "next";
import ApplyForm from "./apply-form";

export const metadata: Metadata = {
  title: "Help shape TheBigIntro. Founding research.",
  description:
    "A short, honest set of questions for senior leaders to pressure-test TheBigIntro: qualified vendor meetings where every meeting funds a charity the executive chooses.",
  robots: { index: false, follow: false },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
      <span className="h-px w-6" style={{ background: "var(--border-strong)" }} />
      {children}
    </div>
  );
}

export default function ApplyPage() {
  return (
    <>
      {/* ── Intro / why I'm asking ────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "var(--cream-7)" }}
      >
        <div className="mx-auto max-w-3xl px-6 pt-16 pb-14 md:pt-20 md:pb-16">
          <SectionLabel>Founding research · Invite only</SectionLabel>
          <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.03em] leading-[1.05]">
            Help me get this{" "}
            <span className="serif-italic">right</span>.
          </h1>

          <div className="mt-8 space-y-5 text-lg text-muted-foreground leading-relaxed">
            <p>
              I&apos;m building a marketplace that connects technology vendors
              with senior executives for short, qualified, one-to-one meetings.
              Vendors pay to be on the platform, and when a meeting happens,
              the full meeting fee goes to a charity the executive chooses.
            </p>
            <p>
              The aim is simple. Make vendor outreach respectful of a leader&apos;s
              time, and turn the few conversations worth having into real
              donations to causes they care about.
            </p>
            <p>
              I&apos;m still in the validation stage. That is exactly why I am
              speaking with leaders like you, to pressure-test whether the
              model holds up before any of it is built. There are no wrong
              answers here, and a sharp no is as useful to me as a yes.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-5 md:p-6">
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-3">
              What your answers do
            </div>
            <ul className="space-y-2.5 text-sm text-muted-foreground leading-relaxed">
              <li>
                Decide whether this is worth building at all, and in what
                shape.
              </li>
              <li>
                Set the charity amount, the format, and the rules that would
                make it worth a leader&apos;s time.
              </li>
              <li>
                Stay private. They shape the product and nothing else, as set
                out at the end of this form.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── The form ──────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-3xl px-6 pb-24 md:pb-32 -mt-6">
          <ApplyForm />
        </div>
      </section>
    </>
  );
}
