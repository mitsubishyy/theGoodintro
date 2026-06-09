import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="hp-hero" aria-labelledby="hero-headline">
      <h1 className="hp-headline" id="hero-headline">
        Meetings that fund{" "}
        <span className="hp-serif-italic">what matters</span>
        <span style={{ color: "var(--primary)" }}>.</span>
      </h1>

      <p className="hp-lede">
        TheGoodIntro is an invite-only network where vetted vendors can request
        a short meeting with a senior leader, but only when they have a
        specific, relevant reason. Executives take the few worth their time,
        and each one sends a real gift to an Australian charity they choose.
      </p>

      <div className="hp-cta-row">
        <a className="hp-btn-primary" href="/waitlist">
          <span className="pulse" aria-hidden="true" />
          Join the waitlist
        </a>
        <Link className="hp-btn-ghost" href="/how-it-works">
          How it works
          <span className="circle" aria-hidden="true">
            <svg viewBox="0 0 14 14" fill="none">
              <path
                d="M3 11 L11 3 M5 3 H11 V9"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </Link>
      </div>
    </section>
  );
}
