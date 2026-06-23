import type { Metadata } from "next";
import Image from "next/image";
import { COMPANY_LINKEDIN } from "@/lib/config";

// The public "coming soon" wall. middleware.ts rewrites every public route to
// this page while the wall flag is on; the real site stays built and intact
// underneath, so lifting the wall changes nothing else. This page hides the
// site nav/footer (the layout chrome) so only the sheet shows.

export const metadata: Metadata = {
  title: "TheGoodIntro. Coming soon.",
  description:
    "We're building something good. TheGoodIntro is an invite-only Australian network where senior introductions fund the charities executives choose. Coming soon.",
};

export default function ComingSoon() {
  return (
    <>
      {/* Hide the layout chrome and lock scroll so only the sheet is visible. */}
      <style>{`html,body{overflow:hidden}.hp-topnav,.hp-footer{display:none!important}`}</style>

      <div
        className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
        style={{ background: "var(--background)" }}
      >
        <Image
          src="/brand/wordmark.png"
          alt="TheGoodIntro"
          width={750}
          height={168}
          priority
          className="mb-14 h-9 w-auto"
        />

        <p
          className="mb-6 font-mono text-[11px] uppercase tracking-[0.3em]"
          style={{ color: "var(--cream-9)" }}
        >
          Coming soon
        </p>

        <h1
          className="max-w-3xl font-extrabold tracking-[-0.02em]"
          style={{
            color: "var(--cream-11)",
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            lineHeight: 1.05,
            fontFamily: "var(--font-inter), sans-serif",
          }}
        >
          We&apos;re building something{" "}
          <span className="hp-serif-italic">good</span>.
        </h1>

        <p
          className="mt-7 max-w-xl text-lg leading-relaxed"
          style={{ color: "var(--cream-10)" }}
        >
          An invite-only Australian network where senior introductions fund the
          charities executives choose.
        </p>

        <div
          className="mt-12 h-px w-16"
          style={{ background: "var(--primary)" }}
        />

        <a
          href="mailto:issy@thegoodintros.com"
          className="mt-8 text-[15px] underline underline-offset-4 transition-colors hover:text-primary"
          style={{ color: "var(--cream-9)" }}
        >
          issy@thegoodintros.com
        </a>

        <a
          href={COMPANY_LINKEDIN}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 text-[15px] underline underline-offset-4 transition-colors hover:text-primary"
          style={{ color: "var(--cream-9)" }}
        >
          LinkedIn
        </a>
      </div>
    </>
  );
}
