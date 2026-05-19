import type { Metadata } from "next";
import ApplyForm from "./apply-form";

const APPLY_DESC =
  "A short, honest set of questions for senior leaders to pressure-test The Good Intro: qualified vendor meetings where every meeting funds a charity the executive chooses.";

export const metadata: Metadata = {
  title: "Help shape The Good Intro.",
  description: APPLY_DESC,
  robots: { index: false, follow: false },
  openGraph: { title: "Help shape The Good Intro.", description: APPLY_DESC },
  twitter: { title: "Help shape The Good Intro.", description: APPLY_DESC },
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
            Takes about 3 minutes
          </div>

          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.03em] leading-[1.05]">
            Help me get this{" "}
            <span className="serif-italic">right</span>.
          </h1>

          <div className="mt-8">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              <span
                className="h-px w-6"
                style={{ background: "var(--border-strong)" }}
              />
              This is the concept
            </div>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              The Good Intro is an invite-only network where senior leaders take
              a small number of genuinely relevant vendor conversations, and
              every meeting sends a donation to a charity you choose. You are
              never pitched without a specific, stated reason, and you approve
              every request before it reaches you.
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
