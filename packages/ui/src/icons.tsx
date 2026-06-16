import type { ReactElement, SVGProps } from "react";

/**
 * The kit's icon set — one canonical copy (PORTAL_LAYOUT_BLUEPRINT type ramp:
 * 24x24 viewBox, 1.6px stroke, currentColor, rounded line caps). Custom set for
 * domain glyphs; generic chevron/arrow/plus/minus/x/check are included so the
 * kit has no Lucide dependency. No emojis (kit-wide rule).
 *
 * Render at the parent's currentColor; size via Tailwind className (default 17px).
 */

export type IconName =
  // domain
  | "grid"
  | "inbox"
  | "calendar"
  | "chat"
  | "box"
  | "user"
  | "heart"
  | "gift"
  | "cog"
  | "search"
  | "bell"
  | "padlock"
  | "tag"
  | "pin"
  // generic
  | "chevron-up"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "arrow-right"
  | "plus"
  | "minus"
  | "x"
  | "check"
  | "dots"
  | "pencil"
  | "camera"
  | "trash";

const PATHS: Record<IconName, ReactElement> = {
  // ── Domain ────────────────────────────────────────────────────────────────
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 13h4l1.5 3h5L16 13h4" />
      <path d="M4 13 6 5h12l2 8v6H4z" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
    </>
  ),
  chat: <path d="M4 5h16v11H9l-4 4V5z" />,
  box: (
    <>
      <path d="M3 7l9-4 9 4-9 4-9-4z" />
      <path d="M3 7v10l9 4 9-4V7M12 11v10" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),
  heart: <path d="M12 20s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z" />,
  gift: (
    <>
      <rect x="3" y="8" width="18" height="13" rx="1.5" />
      <path d="M3 12h18M12 8v13M12 8S10 3 7.5 4.5 9 8 12 8zM12 8s2-5 4.5-3.5S15 8 12 8z" />
    </>
  ),
  cog: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4-4" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 0112 0c0 6 2 7 2 7H4s2-1 2-7z" />
      <path d="M10 20a2 2 0 004 0" />
    </>
  ),
  padlock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </>
  ),
  tag: (
    <>
      <path d="M3 12V4h8l10 10-8 8L3 12z" />
      <circle cx="7.5" cy="7.5" r="1.2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-7-5.4-7-11a7 7 0 0 1 14 0c0 5.6-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  // ── Generic ───────────────────────────────────────────────────────────────
  "chevron-up": <path d="M5 15l7-7 7 7" />,
  "chevron-down": <path d="M5 9l7 7 7-7" />,
  "chevron-left": <path d="M15 5l-7 7 7 7" />,
  "chevron-right": <path d="M9 5l7 7-7 7" />,
  "arrow-right": <path d="M4 12h16M14 6l6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  x: <path d="M6 6l12 12M18 6l-12 12" />,
  check: <path d="M5 12l5 5 9-11" />,
  dots: (
    <>
      <circle cx="5" cy="12" r="1.1" />
      <circle cx="12" cy="12" r="1.1" />
      <circle cx="19" cy="12" r="1.1" />
    </>
  ),
  pencil: (
    <>
      <path d="M4 20h4L18.5 9.5a2 2 0 0 0-2.83-2.83L5 17v3z" />
      <path d="M14 7l3 3" />
    </>
  ),
  camera: (
    <>
      <path d="M3 9.5A1.5 1.5 0 0 1 4.5 8h2L8 6h8l1.5 2h2A1.5 1.5 0 0 1 21 9.5v8A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z" />
      <circle cx="12" cy="13" r="3.2" />
    </>
  ),
  trash: <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />,
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  /** Pixel size; default 17 (matches the legacy admin sidebar). */
  size?: number;
}

export function Icon({ name, size = 17, className, ...rest }: IconProps) {
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
      aria-hidden="true"
      className={className}
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
