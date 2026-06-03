import Link from "next/link";

/**
 * "Two sides of one room" — three feature cards routing to executives,
 * vendors, and giving. Hover state floods the whole card with mint-tint.
 */
export default function TwoSidesSection() {
  return (
    <section
      className="hp-do-section"
      id="what-we-do"
      aria-labelledby="do-title"
    >
      <div className="hp-do-head">
        <span className="hp-eyebrow">
          <span className="dot" aria-hidden="true" />
          What we do
        </span>
        <h2 className="hp-do-title" id="do-title">
          Two sides of <span className="hp-serif-italic">one</span> room.
        </h2>
        <Link className="hp-learn-more" href="/how-it-works">
          Learn more
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

      <div className="hp-do-grid">
        <Link
          className="hp-do-card"
          href="/executives"
          aria-labelledby="card-exec-title"
        >
          <span className="hp-do-card-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="12" r="5" />
              <circle cx="15" cy="12" r="5" />
            </svg>
          </span>
          <h3 className="hp-do-card-title" id="card-exec-title">
            For executives
          </h3>
          <p className="hp-do-card-body">
            Take a handful of relevant conversations. Each one sends a real
            gift to a charity you choose.
          </p>
          <div className="hp-do-card-footer">
            <div className="hp-do-tags">
              <span className="hp-do-tag">#Founding cohort</span>
              <span className="hp-do-tag">#Invite only</span>
              <span className="hp-do-tag">#AU first</span>
            </div>
            <span className="hp-do-arrow" aria-hidden="true">
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
          </div>
        </Link>

        <Link
          className="hp-do-card"
          href="/vendors"
          aria-labelledby="card-vendor-title"
        >
          <span className="hp-do-card-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19 V5" />
              <path d="M5.5 11.5 L12 5 L18.5 11.5" />
            </svg>
          </span>
          <h3 className="hp-do-card-title" id="card-vendor-title">
            For vendors
          </h3>
          <p className="hp-do-card-body">
            A qualified introduction to a vetted senior audience. Earned by
            being relevant, not by buying a list.
          </p>
          <div className="hp-do-card-footer">
            <div className="hp-do-tags">
              <span className="hp-do-tag">#10:1 ratio</span>
              <span className="hp-do-tag">#Stated relevance</span>
            </div>
            <span className="hp-do-arrow" aria-hidden="true">
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
          </div>
        </Link>

        <Link
          className="hp-do-card"
          href="/giving"
          aria-labelledby="card-give-title"
        >
          <span className="hp-do-card-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" />
            </svg>
          </span>
          <h3 className="hp-do-card-title" id="card-give-title">
            Where the gift goes
          </h3>
          <p className="hp-do-card-body">
            Every meeting sends a real, named gift to a DGR-endorsed Australian
            charity the executive chooses. Confirmed in writing within 14 days.
          </p>
          <div className="hp-do-card-footer">
            <div className="hp-do-mini-wms" aria-label="Example charity wordmarks">
              <span className="hp-do-mini-wm">Beyond Blue</span>
              <span className="hp-do-mini-wm">OzHarvest</span>
              <span className="hp-do-mini-wm">RFDS</span>
            </div>
            <span className="hp-do-arrow" aria-hidden="true">
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
          </div>
        </Link>
      </div>
    </section>
  );
}
