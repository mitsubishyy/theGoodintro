import { SectionLabel } from "../_components/ui";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Terms. TheGoodIntro.",
  description: "The terms for using this early TheGoodIntro site.",
  path: "/terms",
});

// TODO: replace with full platform terms before any paid meetings run.
export default function Terms() {
  return (
    <article className="mx-auto max-w-3xl px-6 lg:px-10 py-24 md:py-32">
      <SectionLabel>Legal</SectionLabel>
      <h1 className="mt-7 text-5xl md:text-6xl font-black tracking-[-0.03em] leading-[0.98]">
        Terms
      </h1>
      <p className="mt-4 text-sm font-mono uppercase tracking-[0.18em] text-muted-foreground">
        Last updated 17 May 2026
      </p>

      <div className="mt-12 space-y-12 text-lg leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            About this site
          </h2>
          <p className="text-muted-foreground">
            This is an early information site for TheGoodIntro. It describes
            an idea that is still being shaped with a small founding group.
            Nothing here is an offer, a contract, or a guarantee of a
            meeting, a donation amount, or availability.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            What you can expect
          </h2>
          <p className="text-muted-foreground">
            The figures described, including the flat per-meeting fee and the
            charity's share of it, reflect the intended model and may change
            as the platform is built. Final terms for executives and vendors
            will be provided in writing before any meeting or payment takes
            place.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            Using the site
          </h2>
          <p className="text-muted-foreground">
            Please use the site lawfully and do not attempt to disrupt it.
            The name, wording and design are the property of TheGoodIntro.
            Booking a call simply starts a conversation and creates no
            obligation on either side.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            Contact
          </h2>
          <p className="text-muted-foreground">
            Questions about these terms can be raised through the booking
            link. Full platform terms will replace this page before any paid
            meetings take place.
          </p>
        </section>
      </div>
    </article>
  );
}
