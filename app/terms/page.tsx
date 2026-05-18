import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms. TheBigIntro.",
  description: "The terms for using this early TheBigIntro site.",
};

// TODO: replace with full platform terms before any paid meetings run.
export default function Terms() {
  return (
    <article>
      <p>Legal</p>
      <h1>Terms</h1>
      <p>Last updated 17 May 2026.</p>

      <h2>About this site</h2>
      <p>
        This is an early information site for TheBigIntro. It describes an
        idea that is still being shaped with a small founding group. Nothing
        here is an offer, a contract, or a guarantee of a meeting, a donation
        amount, or availability.
      </p>

      <h2>What you can expect</h2>
      <p>
        The figures described, including the per-meeting charity gift and the
        separate admin fee, reflect the intended model and may change as the
        platform is built. Final terms for executives and vendors will be
        provided in writing before any meeting or payment takes place.
      </p>

      <h2>Using the site</h2>
      <p>
        Please use the site lawfully and do not attempt to disrupt it. The
        name, wording and design are the property of TheBigIntro. Booking a
        call simply starts a conversation and creates no obligation on either
        side.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms can be raised through the booking link.
        Full platform terms will replace this page before any paid meetings
        take place.
      </p>
    </article>
  );
}
