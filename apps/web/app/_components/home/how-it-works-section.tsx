import Link from "next/link";

/**
 * "How it works for you" — left-side sticky intro + right-side stack of three
 * step cards. Ported from the published site, restyled to match the HopeRise
 * card / pill / typography system.
 */
export default function HowItWorksSection() {
  return (
    <section
      className="hp-hiw-section"
      id="how-it-works"
      aria-labelledby="hiw-title"
    >
      <div className="hp-hiw-grid">
        <div className="hp-hiw-left">
          <span className="hp-eyebrow">
            <span className="dot" aria-hidden="true" />
            How it works for you
          </span>
          <h2 className="hp-hiw-title" id="hiw-title">
            Three steps. <span className="hp-serif-italic">Nothing hidden</span>.
          </h2>
          <p className="hp-hiw-lede">
            You set the topics you will take a meeting about. Before anything
            reaches you, a vendor has to state, specifically, why a conversation
            is relevant. You choose which ones happen, decline the rest with no
            follow-up, and every meeting you take sends a real gift to a charity
            you choose.
          </p>
          <Link className="hp-learn-more" href="/how-it-works">
            Read the full model end to end
            <span className="circle" aria-hidden="true">
              <svg viewBox="0 0 12 12" fill="none">
                <path
                  d="M3 9 L9 3 M4.5 3 H9 V7.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        </div>

        <div className="hp-hiw-right">
          {/* Step 01 — compass */}
          <article className="hp-hiw-card">
            <span className="hp-hiw-card-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9.5" />
                <path d="M15.5 8.5 L13 14 L8.5 15.5 L11 10 Z" />
              </svg>
            </span>
            <div className="hp-hiw-card-body">
              <span className="hp-hiw-step">Step 01</span>
              <h3 className="hp-hiw-card-title">
                You set what is relevant
              </h3>
              <p className="hp-hiw-card-text">
                Tell us the priorities, initiatives, or problems you would
                actually take a conversation about. Anything outside that
                scope never reaches you. You can update the list any time.
              </p>
            </div>
          </article>

          {/* Step 02 — shield with check */}
          <article className="hp-hiw-card">
            <span className="hp-hiw-card-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3 L20 6 V11 C20 16, 16.5 19.5, 12 21 C 7.5 19.5, 4 16, 4 11 V6 Z" />
                <path d="M8.5 12 L11 14.5 L15.5 9.5" />
              </svg>
            </span>
            <div className="hp-hiw-card-body">
              <span className="hp-hiw-step">Step 02</span>
              <h3 className="hp-hiw-card-title">
                You see a stated reason, then decide
              </h3>
              <p className="hp-hiw-card-text">
                A vendor must write the specific initiative or problem before
                they can ask. You see it in plain language and decide freely.
                No obligation, no penalty for declining, no follow-up unless
                you invite it.
              </p>
            </div>
          </article>

          {/* Step 03 — hands meeting around a heart */}
          <article className="hp-hiw-card">
            <span className="hp-hiw-card-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11.5 7 C 10 5.5, 7.5 5.5, 6 7 C 4.5 8.5, 4.5 11, 6 12.5 L 12 18.5 L 18 12.5 C 19.5 11, 19.5 8.5, 18 7 C 16.5 5.5, 14 5.5, 12.5 7 L 12 7.5 Z" />
                <path d="M9.5 11.5 L 12 14 L 14.5 11.5" />
              </svg>
            </span>
            <div className="hp-hiw-card-body">
              <span className="hp-hiw-step">Step 03</span>
              <h3 className="hp-hiw-card-title">
                One short meeting funds a real cause
              </h3>
              <p className="hp-hiw-card-text">
                A scheduled conversation, on your terms. A real gift reaches
                your chosen charity within 14 days, confirmed in writing. You
                can step away at any point, and your details are never sold or
                shared.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
