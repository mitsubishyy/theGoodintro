"use client";

import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

/**
 * The kit's only button. Ink primary / ghost secondary / danger / link, with
 * loading + disabled. All states from BLUEPRINT §0 are reachable via props +
 * standard :hover/:focus-visible. Visible focus ring per the polish rubric.
 *
 * Renders as an `<a>` when `href` is set (server-friendly link styling).
 */

export type ButtonVariant = "primary" | "ghost" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg";

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Render as a link instead of a button. */
  href?: string;
  children?: ReactNode;
}

type ButtonProps = BaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>;

const SIZE: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[12px]",
  md: "h-10 px-4 text-[13px]",
  lg: "h-11 px-5 text-[14px]",
};

const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-lg whitespace-nowrap " +
  "transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-[var(--portal-page)] focus-visible:ring-[var(--portal-amber)] " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--portal-ink)] text-[var(--portal-card)] hover:bg-[color-mix(in_oklch,var(--portal-ink)_92%,white)] " +
    "active:bg-[color-mix(in_oklch,var(--portal-ink)_88%,white)]",
  ghost:
    "bg-transparent text-[var(--portal-ink)] border border-[var(--portal-line)] hover:bg-[var(--portal-card-hover)]",
  danger:
    "bg-[oklch(0.48_0.18_25)] text-white hover:bg-[oklch(0.42_0.18_25)]",
  link:
    "h-auto px-0 bg-transparent text-[var(--portal-amber-ink)] hover:underline underline-offset-4 font-medium",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, leftIcon, rightIcon, href, disabled, children, className = "", ...rest },
  ref,
) {
  const cls = `${BASE} ${VARIANT[variant]} ${variant === "link" ? "" : SIZE[size]} ${className}`;
  const content = (
    <>
      {loading ? <Spinner /> : leftIcon}
      <span>{children}</span>
      {!loading && rightIcon}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls} aria-disabled={disabled || loading || undefined}>
        {content}
      </Link>
    );
  }
  return (
    <button ref={ref} className={cls} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  );
});

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" className="animate-spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.25" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}
