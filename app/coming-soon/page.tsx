import type { Metadata } from "next";
import Image from "next/image";
import { COMPANY_LINKEDIN } from "@/lib/config";
import WaitlistForm from "../waitlist/waitlist-form";

// The public "coming soon" wall. middleware.ts rewrites every public route to
// this page while the wall flag is on; the real site stays built and intact
// underneath, so lifting the wall changes nothing else. This page hides the
// site nav/footer (the layout chrome) so only the sheet shows. The exact
// site waitlist form is embedded (it posts to /api/waitlist, which the wall
// leaves reachable).

export const metadata: Metadata = {
  title: "TheGoodIntro. Coming soon.",
  description:
    "We're building something good. TheGoodIntro is an invite-only Australian network where senior introductions fund the charities executives choose. Coming soon. Join the waitlist.",
};

// force-dynamic so the embedded waitlist form (useSearchParams) server-renders,
// matching the real /waitlist page and avoiding a client-only flash.
export const dynamic = "force-dynamic";

export default function ComingSoon() {
  return (
    <>
      {/* Hide the layout chrome so only the sheet shows. */}
      <style>{`.hp-topnav,.hp-footer{display:none!important}`}</style>

      <div
        className="flex min-h-screen flex-col items-center px-6 py-16 text-center md:py-20"
        style={{ background: "var(--background)" }}
      >
        <div className="w-full max-w-xl">
          <Image
            src="/brand/wordmark.png"
            alt="TheGoodIntro"
            width={750}
            height={168}
            priority
            className="mx-auto mb-12 h-9 w-auto"
          />

          <p
            className="mb-6 font-mono text-[11px] uppercase tracking-[0.3em]"
            style={{ color: "var(--cream-9)" }}
          >
            Coming soon
          </p>

          <h1
            className="font-extrabold tracking-[-0.02em]"
            style={{
              color: "var(--cream-11)",
              fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
              lineHeight: 1.05,
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            We&apos;re building something{" "}
            <span className="hp-serif-italic">good</span>.
          </h1>

          <p
            className="mx-auto mt-6 max-w-md text-lg leading-relaxed"
            style={{ color: "var(--cream-10)" }}
          >
            An invite-only Australian network where senior introductions fund the
            charities executives choose.
          </p>

          {/* The exact site waitlist form. */}
          <div className="mt-10 text-left">
            <WaitlistForm />
          </div>

          <div
            className="mx-auto mt-14 h-px w-16"
            style={{ background: "var(--primary)" }}
          />

          <div className="mt-8 flex flex-col items-center gap-4">
            <a
              href="mailto:issy@thegoodintros.com"
              className="text-[15px] underline underline-offset-4 transition-colors hover:text-primary"
              style={{ color: "var(--cream-9)" }}
            >
              issy@thegoodintros.com
            </a>
            <a
              href={COMPANY_LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[15px] underline underline-offset-4 transition-colors hover:text-primary"
              style={{ color: "var(--cream-9)" }}
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
