import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms. TheBigIntro.",
  description: "The terms for using this early TheBigIntro site.",
};

// TODO: replace with full platform terms before any paid meetings run.
export default function Terms() {
  return (
    <section>
      <div className="wrap" style={{ maxWidth: 820 }}>
        <span className="eyebrow">Legal</span>
        <h1 style={{ fontSize: "clamp(2.2rem,4vw,3rem)" }}>Terms</h1>
        <p className="lede">Last updated 17 May 2026.</p>

        <h2 style={{ marginTop: 48 }}>About this site</h2>
        <p style={{ marginTop: 14 }}>
          This is an early information site for TheBigIntro. It describes an
          idea that is still being shaped with a small founding group. Nothing
          here is an offer, a contract, or a guarantee of a meeting, a
          donation amount, or availability.
        </p>

        <h2 style={{ marginTop: 40 }}>What you can expect</h2>
        <p style={{ marginTop: 14 }}>
          The figures described, including the per-meeting charity gift and the
          separate admin fee, reflect the intended model and may change as the
          platform is built. Final terms for executives and vendors will be
          provided in writing before any meeting or payment takes place.
        </p>

        <h2 style={{ marginTop: 40 }}>Using the site</h2>
        <p style={{ marginTop: 14 }}>
          Please use the site lawfully and do not attempt to disrupt it. The
          name, wording and design are the property of TheBigIntro. Booking a
          call simply starts a conversation and creates no obligation on either
          side.
        </p>

        <h2 style={{ marginTop: 40 }}>Contact</h2>
        <p style={{ marginTop: 14 }}>
          Questions about these terms can be raised through the booking link.
          Full platform terms will replace this page before any paid meetings
          take place.
        </p>
      </div>
    </section>
  );
}
