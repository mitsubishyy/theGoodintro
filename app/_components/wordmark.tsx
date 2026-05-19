// Plain wordmark, no symbol. Lowercase except a capital B; "Big" in forest
// green. Reads "theBigintro". A richer mark comes later. Shared by nav/footer.
export function Wordmark() {
  return (
    <span className="logo-wm">
      the<span className="big">Big</span>intro
    </span>
  );
}
