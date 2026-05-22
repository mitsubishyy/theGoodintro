import { SectionLabel } from "../_components/ui";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Privacy. theGoodintro.",
  description: "How theGoodintro handles information during the early phase.",
  path: "/privacy",
});

// TODO: have this reviewed before public launch once data collection
// (forms, Calendly, analytics) is finalised.
export default function Privacy() {
  return (
    <article className="mx-auto max-w-3xl px-6 lg:px-10 py-24 md:py-32">
      <SectionLabel>Legal</SectionLabel>
      <h1 className="mt-7 text-5xl md:text-6xl font-black tracking-[-0.03em] leading-[0.98]">
        Privacy
      </h1>
      <p className="mt-4 text-sm font-mono uppercase tracking-[0.18em] text-muted-foreground">
        Last updated 17 May 2026
      </p>

      <div className="mt-12 space-y-12 text-lg leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            The short version
          </h2>
          <p className="text-muted-foreground">
            theGoodintro is at an early, invite-only stage. This site exists to
            explain the idea and let interested people start a conversation.
            We collect as little as possible and we do not sell anything to
            anyone.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            What we collect
          </h2>
          <p className="text-muted-foreground">
            If you book a call, that booking is handled by our scheduling
            provider and includes only what you choose to share, such as your
            name, email and any notes. We use privacy-friendly, aggregate site
            analytics to understand which pages are useful. We do not use
            advertising trackers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            How we use it
          </h2>
          <p className="text-muted-foreground">
            Only to talk with you about theGoodintro and to improve this site.
            We do not share your details with vendors, executives or third
            parties for marketing.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            Your choices
          </h2>
          <p className="text-muted-foreground">
            You can ask us to delete any information you have shared at any
            time by getting in touch through the booking link. As the
            platform grows this policy will be expanded and dated again.
          </p>
        </section>
      </div>
    </article>
  );
}
