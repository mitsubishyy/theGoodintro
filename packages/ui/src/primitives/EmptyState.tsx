import type { ReactNode } from "react";
import { Icon, type IconName } from "../icons";

/**
 * One-line empty explanation + optional action / hint. Considered typography, not
 * a bare line (BLUEPRINT §0 polish rubric). A widget never renders blank — it
 * renders this at full size.
 *
 * T3 index lists use the centred variant (locked 2026-06-02 on the Admin
 * Executives / Vendors lists): a 48px antique-gold outline icon above the
 * heading, muted body, primary action below.
 */
export interface EmptyStateProps {
  title: string;
  hint?: string;
  action?: ReactNode;
  /** 48px antique-gold outline icon above the title (T3 empty state). */
  icon?: IconName;
  /** "start" (widget default) or "center" (T3 index-list lock). */
  align?: "start" | "center";
  className?: string;
}

export function EmptyState({ title, hint, action, icon, align = "start", className = "" }: EmptyStateProps) {
  const centered = align === "center";
  return (
    <div
      className={`px-5 ${centered ? "py-14 items-center text-center" : "py-8 items-start"} flex flex-col gap-2 text-[13px] ${className}`}
      style={{ color: "var(--muted-foreground)" }}
    >
      {icon && (
        <Icon
          name={icon}
          size={48}
          strokeWidth={1.2}
          className="mb-2"
          style={{ color: "var(--portal-amber-ink)" }}
        />
      )}
      <p style={{ color: "var(--portal-ink)" }} className={centered ? "text-[15px] font-semibold" : "font-medium"}>
        {title}
      </p>
      {hint && <p className={`text-[12.5px] ${centered ? "max-w-[400px]" : ""}`}>{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
