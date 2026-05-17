import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy. TheBigIntro.",
  description: "How TheBigIntro handles information during the early phase.",
};

// TODO: have this reviewed before public launch once data collection
// (forms, Calendly, analytics) is finalised.
export default function Privacy() {
  return (
    <section>
      <div className="wrap" style={{ maxWidth: 820 }}>
        <span className="eyebrow">Legal</span>
        <h1 style={{ fontSize: "clamp(2.2rem,4vw,3rem)" }}>Privacy</h1>
        <p className="lede">Last updated 17 May 2026.</p>

        <h2 style={{ marginTop: 48 }}>The short version</h2>
        <p style={{ marginTop: 14 }}>
          TheBigIntro is at an early, invite-only stage. This site exists to
          explain the idea and let interested people start a conversation. We
          collect as little as possible and we do not sell anything to anyone.
        </p>

        <h2 style={{ marginTop: 40 }}>What we collect</h2>
        <p style={{ marginTop: 14 }}>
          If you book a call, that booking is handled by our scheduling
          provider and includes only what you choose to share, such as your
          name, email and any notes. We use privacy-friendly, aggregate site
          analytics to understand which pages are useful. We do not use
          advertising trackers.
        </p>

        <h2 style={{ marginTop: 40 }}>How we use it</h2>
        <p style={{ marginTop: 14 }}>
          Only to talk with you about TheBigIntro and to improve this site. We
          do not share your details with vendors, executives or third parties
          for marketing.
        </p>

        <h2 style={{ marginTop: 40 }}>Your choices</h2>
        <p style={{ marginTop: 14 }}>
          You can ask us to delete any information you have shared at any time
          by getting in touch through the booking link. As the platform grows
          this policy will be expanded and dated again.
        </p>
      </div>
    </section>
  );
}
