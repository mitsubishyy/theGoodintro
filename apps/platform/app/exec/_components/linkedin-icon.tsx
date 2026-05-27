/* LinkedIn glyph — ported from apps/web/app/_components/icons.tsx (IconLinkedIn)
   so the exec dashboard's "More about {vendor}" footer matches the mockup. */
export function IconLinkedIn({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10v7" />
      <circle cx="8" cy="7" r="0.6" fill="currentColor" />
      <path d="M12 17v-4a2.5 2.5 0 0 1 5 0v4" />
      <path d="M12 10v7" />
    </svg>
  );
}
