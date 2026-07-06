/**
 * What executives are saying — dark emerald band with a continuous,
 * non-interactive loop of executive review cards on white cards.
 *
 * Ported from the locked Claude Design "Testimonial Band" (option 1a).
 * The track holds two identical copies of the review list; the CSS
 * animation translates the track from 0 → -50%, which lands set B in
 * set A's starting position for a seamless loop. It simply always
 * rotates — no hover, pause, or centring logic — and stops (single
 * wrapped set) under prefers-reduced-motion.
 */
type ExecReview = {
  name: string;
  role: string;
  accolade?: string;
  photo: string;
  quote: string;
};

const REVIEWS: ExecReview[] = [
  {
    name: "Arul Arogyanathan",
    role: "Chief Information Officer, Village Roadshow",
    accolade: "Top 50 CIO (#1 in 2025 and #13 in 2024)",
    photo: "/testimonials/arul-arogyanathan.jpeg",
    quote:
      "The premise is exactly right. Senior time is scarce, and if a genuine gift to a charity is the price of a good meeting, that is a trade I will always take.",
  },
  {
    name: "David Lean",
    role: "Group Head of IT, James Pascoe Group",
    photo: "/testimonials/david-lean.jpeg",
    quote:
      "If I am going to spend an hour with someone, this is how it should work. Qualified on both sides, and a real contribution to a charity that matters to me.",
  },
  {
    name: "Michael Denari",
    role: "GM of AI, Zip",
    accolade: "Former Global Head of IT, Canva",
    photo: "/testimonials/michael-denari.jpeg",
    quote:
      "My time is my scarcest resource, so how I choose to spend it really needs to make an impact. Knowing the meetings are also giving back to a charity I care about makes it worthwhile.",
  },
  {
    name: "Rick Green",
    role: "GM Data & AI, Super Retail Group",
    photo: "/testimonials/rick-green.jpeg",
    quote:
      "It's simple and respectful to a leader's time. No chasing, no cold pitching, just a genuine introduction that also gives back.",
  },
];

function ReviewCard({
  review,
  decorative = false,
}: {
  review: ExecReview;
  decorative?: boolean;
}) {
  return (
    <div className="hp-testimonial-card" aria-hidden={decorative || undefined}>
      <div className="hp-testimonial-head">
        <div className="hp-testimonial-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={review.photo}
            alt={decorative ? "" : review.name}
            width={52}
            height={52}
            loading="lazy"
          />
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="hp-testimonial-name">{review.name}</div>
          <div className="hp-testimonial-role">{review.role}</div>
          {review.accolade ? (
            <div className="hp-testimonial-accolade">{review.accolade}</div>
          ) : null}
        </div>
      </div>
      <p className="hp-testimonial-quote">{review.quote}</p>
    </div>
  );
}

export default function TestimonialBandSection() {
  return (
    <section
      className="hp-testimonials-section"
      id="testimonials"
      aria-labelledby="testimonials-title"
    >
      <span className="hp-eyebrow is-mono" id="testimonials-title">
        <span className="dot" aria-hidden="true" />
        What executives are saying
      </span>

      <div className="hp-testimonials" aria-label="Executive reviews">
        <div className="hp-testimonials-track">
          {REVIEWS.map((r) => (
            <ReviewCard key={`a-${r.name}`} review={r} />
          ))}
          {REVIEWS.map((r) => (
            <ReviewCard key={`b-${r.name}`} review={r} decorative />
          ))}
        </div>
      </div>
    </section>
  );
}
