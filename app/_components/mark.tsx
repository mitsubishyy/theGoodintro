// Key phrase: text stays the headline ink colour, with a hand-drawn
// crimson underline. From the locked design (treatment C).
export function Mark({ children }: { children: React.ReactNode }) {
  return (
    <span className="key">
      {children}
      <svg
        viewBox="0 0 300 16"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3 11C60 4 150 3 297 9"
          stroke="#E0263F"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
