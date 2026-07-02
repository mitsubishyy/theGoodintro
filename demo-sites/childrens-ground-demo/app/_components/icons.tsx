/* ─────────────────────────────────────────────────────────────────────
   Custom outline icon set for TheGoodIntro.
   24×24 viewBox, currentColor stroke, 1.6px stroke weight, rounded
   line caps and joins. Designed to read consistently in icon badges
   and small ui contexts.
   ───────────────────────────────────────────────────────────────────── */

type IconProps = {
  className?: string;
  size?: number;
};

const baseProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/* Health & medical research — stethoscope */
export function IconStethoscope({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} className={className}>
      <path d="M6 3v6a5 5 0 0 0 10 0V3" />
      <path d="M6 3h2" />
      <path d="M14 3h2" />
      <path d="M11 14v3a5 5 0 0 0 5 5h0a5 5 0 0 0 5-5v-2" />
      <circle cx="21" cy="13" r="1.6" />
    </svg>
  );
}

/* Education & young people — open book */
export function IconBook({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} className={className}>
      <path d="M3 5.5C3 4.7 3.7 4 4.5 4H10c.8 0 1.5.7 1.5 1.5V20" />
      <path d="M21 5.5c0-.8-.7-1.5-1.5-1.5H14c-.8 0-1.5.7-1.5 1.5V20" />
      <path d="M3 5.5V19c0 .8.7 1.5 1.5 1.5H10" />
      <path d="M21 5.5V19c0 .8-.7 1.5-1.5 1.5H14" />
    </svg>
  );
}

/* Environment & climate — sapling */
export function IconSapling({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} className={className}>
      <path d="M12 21v-7" />
      <path d="M12 14c0-3 2-5 5-5h2c0 3-2 5-5 5h-2z" />
      <path d="M12 14c0-3-2-5-5-5H5c0 3 2 5 5 5h2z" />
      <path d="M9 21h6" />
    </svg>
  );
}

/* Community & crisis relief — clasped hands */
export function IconHandshake({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} className={className}>
      <path d="M3 10.5L7 6.5c.6-.6 1.5-.6 2.1 0L11 8.4l1.9-1.9c.6-.6 1.5-.6 2.1 0L17 8.4" />
      <path d="M21 10.5l-4 4-3.5-3.5" />
      <path d="M3 10.5l4 4 3.5-3.5" />
      <path d="M10.5 14.5L13 17l2-2 2 2 1.5-1.5" />
      <path d="M3 14h2" />
      <path d="M19 14h2" />
    </svg>
  );
}

/* Animal welfare — paw print */
export function IconPaw({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} className={className}>
      <circle cx="6" cy="10" r="1.8" />
      <circle cx="10" cy="6" r="1.8" />
      <circle cx="14" cy="6" r="1.8" />
      <circle cx="18" cy="10" r="1.8" />
      <path d="M8 18c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5a2.5 2.5 0 0 1-2.5 2.5h-3A2.5 2.5 0 0 1 8 18z" />
    </svg>
  );
}

/* Vendor — briefcase */
export function IconBriefcase({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} className={className}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
    </svg>
  );
}

/* Platform — network / hub */
export function IconNetwork({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} className={className}>
      <circle cx="12" cy="12" r="3" />
      <circle cx="4" cy="6" r="1.8" />
      <circle cx="20" cy="6" r="1.8" />
      <circle cx="4" cy="18" r="1.8" />
      <circle cx="20" cy="18" r="1.8" />
      <path d="M9.5 10.5L6 7" />
      <path d="M14.5 10.5L18 7" />
      <path d="M9.5 13.5L6 17" />
      <path d="M14.5 13.5L18 17" />
    </svg>
  );
}

/* Charity — gift / heart hybrid */
export function IconGift({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} className={className}>
      <path d="M20 11v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9" />
      <path d="M22 7H2v4h20V7z" />
      <path d="M12 21V7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

/* Cold inbox — envelope with slash */
export function IconColdInbox({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} className={className}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 8l9 6 9-6" />
      <path d="M4 20L20 4" />
    </svg>
  );
}

/* TheGoodIntro — interlocking circles (introduction) */
export function IconIntro({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} className={className}>
      <circle cx="9" cy="12" r="5" />
      <circle cx="15" cy="12" r="5" />
    </svg>
  );
}

/* Free for executives — price tag */
export function IconTag({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} className={className}>
      <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9z" />
      <circle cx="8" cy="8" r="1.4" />
    </svg>
  );
}

/* Invite only — letter / wax seal */
export function IconSeal({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} className={className}>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="M3 7l9 6 9-6" />
      <circle cx="18" cy="17" r="2" />
    </svg>
  );
}

/* 100% to charity — heart in circle */
export function IconHeartCircle({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 17c-2.5-1.8-4.5-3.5-4.5-5.6 0-1.5 1.2-2.7 2.7-2.7 1.0 0 1.6.6 1.8.9.2-.3.8-.9 1.8-.9 1.5 0 2.7 1.2 2.7 2.7C16.5 13.5 14.5 15.2 12 17z" />
    </svg>
  );
}

/* Check (for comparison "good" rows) */
export function IconCheck({ className, size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} strokeWidth={2.2} className={className}>
      <path d="M5 12l4 4 10-10" />
    </svg>
  );
}

/* X (for comparison "bad" rows) */
export function IconX({ className, size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} strokeWidth={2.2} className={className}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

/* LinkedIn */
export function IconLinkedIn({ className, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} className={className}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10v7" />
      <circle cx="8" cy="7" r="0.6" fill="currentColor" />
      <path d="M12 17v-4a2.5 2.5 0 0 1 5 0v4" />
      <path d="M12 10v7" />
    </svg>
  );
}

/* Mail */
export function IconMail({ className, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}
