// Hand-drawn crimson underline on a key phrase, from the locked design.
export function Mark({ children }: { children: React.ReactNode }) {
  return (
    <span className="mark">
      {children}
      <svg
        viewBox="0 0 300 16"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3 11C60 4 150 3 297 9"
          stroke="#D7263D"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
