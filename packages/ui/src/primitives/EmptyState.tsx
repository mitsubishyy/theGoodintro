import type { ReactNode } from "react";

/**
 * One-line empty explanation + optional action / hint. Considered typography, not
 * a bare line (BLUEPRINT §0 polish rubric). A widget never renders blank — it
 * renders this at full size.
 */
export interface EmptyStateProps {
  title: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, hint, action, className = "" }: EmptyStateProps) {
  return (
    <div
      className={`px-5 py-8 flex flex-col items-start gap-2 text-[13px] ${className}`}
      style={{ color: "var(--muted-foreground)" }}
    >
      <p style={{ color: "var(--portal-ink)" }} className="font-medium">
        {title}
      </p>
      {hint && <p className="text-[12.5px]">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
