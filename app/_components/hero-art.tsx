// Composed hero vignette: a single quiet "flow card" that teaches the
// model at a glance (relevant in, qualified, one conversation, $1,000
// out). Replaces the earlier scattered floating icons. Decorative.
export function HeroArt() {
  return (
    <div className="hero-art" aria-hidden="true">
      <span className="ha-glow" />
      <div className="flowcard">
        <div className="fc-step">
          <span className="fc-ic">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M5 8h14M5 16h14" className="ln" strokeWidth="2" />
              <circle cx="9" cy="8" r="2.7" className="ln" strokeWidth="2" fill="var(--surface)" />
              <circle cx="15" cy="16" r="2.7" className="ln-c" strokeWidth="2" fill="var(--surface)" />
            </svg>
          </span>
          <span className="fc-txt">
            <span className="fc-k">You set what is relevant</span>
            <span className="fc-s">Only your priorities get through</span>
          </span>
        </div>
        <div className="fc-step">
          <span className="fc-ic">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 4h7l4 4v11a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5.5A1.5 1.5 0 0 1 7 4z"
                className="ln"
                strokeWidth="2"
              />
              <path d="M14 4v4h4" className="ln" strokeWidth="2" />
              <path d="M9 13l2.2 2.3 4-4.6" className="ln-c" strokeWidth="2" />
            </svg>
          </span>
          <span className="fc-txt">
            <span className="fc-k">A qualified request</span>
            <span className="fc-s">The reason, stated up front</span>
          </span>
        </div>
        <div className="fc-step is-mint">
          <span className="fc-ic">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 6h12a2.6 2.6 0 0 1 2.6 2.6v4A2.6 2.6 0 0 1 17 15.2H9.5L5 18.5l.6-3.3A2.6 2.6 0 0 1 3 12.6v-4A2.6 2.6 0 0 1 5 6z"
                className="ln-m"
                strokeWidth="2"
              />
            </svg>
          </span>
          <span className="fc-txt">
            <span className="fc-k">One real conversation</span>
            <span className="fc-s">A conversation worth your time</span>
          </span>
        </div>
        <div className="fc-give">
          <span className="fc-amt">$1,000</span>
          <span className="fc-cap">to your chosen charity</span>
        </div>
      </div>
    </div>
  );
}
