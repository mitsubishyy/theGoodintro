import type { Metadata } from "next";
import ApplyForm from "./apply-form";

const APPLY_DESC =
  "A short, honest set of questions for senior leaders to pressure-test theGoodintro: qualified vendor meetings where every meeting funds a charity the executive chooses.";

export const metadata: Metadata = {
  title: "Help shape theGoodintro.",
  description: APPLY_DESC,
  robots: { index: false, follow: false },
  openGraph: { title: "Help shape theGoodintro.", description: APPLY_DESC },
  twitter: { title: "Help shape theGoodintro.", description: APPLY_DESC },
};

// Rendered per request so the bare header/footer (no nav on the survey)
// resolves server-side instead of flashing the full chrome.
export const dynamic = "force-dynamic";

export default function ApplyPage() {
  return (
    <>
      {/* ── Intro ─────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "var(--cream-7)" }}
      >
        <div className="mx-auto max-w-3xl px-6 pt-14 pb-14 md:pt-16 md:pb-16">
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            Takes about 4 minutes
          </div>

          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.03em] leading-[1.05]">
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
              The aim is simple. Make vendor outreach respectful of a
              leader&apos;s time, and turn the few conversations worth having
              into real donations to causes you care about.
            </p>
            <p>
              I&apos;m still in the validation stage. That is exactly why I am
              speaking with leaders like you, to pressure-test whether the
              model holds up before any of it is built. There are no wrong
              answers here, and a sharp no is as useful to me as a yes.
            </p>
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
