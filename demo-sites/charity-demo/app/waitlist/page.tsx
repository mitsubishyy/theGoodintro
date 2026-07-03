import type { Metadata } from "next";
import WaitlistForm from "./waitlist-form";
import Brand from "../_components/brand";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Waitlist. TheGoodIntro.",
  description:
    "Join the TheGoodIntro waitlist. Senior leaders take a small number of genuinely relevant vendor meetings, and every meeting funds a charity the executive chooses.",
  path: "/waitlist",
});

export const dynamic = "force-dynamic";

export default function WaitlistPage() {
  return (
    <section style={{ background: "var(--paper-white)" }}>
      <div className="mx-auto max-w-2xl px-6 pt-20 pb-24 md:pt-24 md:pb-32">
        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
          Waitlist
        </div>

        <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.03em] leading-[1.05]">
          Be first in{" "}
          <span className="serif-italic">line</span>.
        </h1>

        <div className="mt-8 space-y-5 text-lg text-muted-foreground leading-relaxed">
          <p>
            <Brand /> is an invite-only network where senior leaders take
            a small number of genuinely relevant SaaS vendor conversations,
            and between $900 and $1,200 of every meeting fee goes to a charity
            the executive chooses.
          </p>
          <p>
            Applications are not yet open. Join the waitlist and we
            will be in touch when the next cohort opens.
          </p>
        </div>

        <div className="mt-10">
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
