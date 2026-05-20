import type { Metadata } from "next";
import Image from "next/image";
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
            <div className="mt-4 space-y-5 text-lg text-muted-foreground leading-relaxed">
              <p>
                The Good Intro is an invite-only network where senior leaders
                take a small number of genuinely relevant SaaS vendor conversations,
                and 100% of every meeting fee goes to a charity you choose. You
                are never pitched without a specific, stated reason, and you
                decide which ones become meetings.
              </p>
              <p>
                The concept is to make vendor outreach respectful and to turn
                the few conversations worth having into real donations to
                causes you care about. It only costs you and other senior
                leaders your time for the meeting. The charity donations are
                paid by the vendors.
              </p>
            </div>
          </div>

          {/* ── From me ────────────────────────────────────────────── */}
          <div
            className="mt-8 rounded-2xl p-6 md:p-7"
            style={{ background: "var(--stone-tint)" }}
          >
            <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              <span
                className="h-px w-6"
                style={{ background: "var(--border-strong)" }}
              />
              From me
            </div>
            <div className="mt-5 flex flex-col sm:flex-row gap-5 sm:gap-6">
              <div className="shrink-0">
                <Image
                  src="/issy.jpg"
                  alt="Issy Hardwick, founder of The Good Intro"
                  width={128}
                  height={160}
                  className="rounded-xl object-cover object-top"
                  style={{ width: 128, height: 160 }}
                  sizes="128px"
                />
              </div>
              <div className="flex-1">
                <p className="text-lg text-foreground leading-relaxed">
                  I&apos;m Issy. After years on the vendor side, I watched
                  good outreach drown in noise and good leaders miss the few
                  tools that could actually help because the inbox became
                  unusable. The Good Intro is my attempt to fix both.
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                  Issy Hardwick · Founder, The Good Intro
                </p>
              </div>
            </div>
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
