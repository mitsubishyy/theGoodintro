import type { Tone } from "@thegoodintro/ui";

/** The executive lifecycle enum (SCHEMA / actions.ts EXEC_STATUSES), in order. */
export type ExecStatusEnum = "invited" | "set_up" | "active" | "paused" | "left";

/**
 * Single source of truth for how an executive status renders as a pill, used by
 * BOTH the Executives list and the executive-detail header so the two never
 * drift (mirrors the Admin Vendors `vendorStatusPill` pattern). Tone families
 * follow the locked admin palette (amber accent + muted only):
 *   - invited / set_up / active -> amber-soft (live + pipeline)
 *   - paused / left             -> muted
 */
export function execStatusPill(s: ExecStatusEnum): { label: string; tone: Tone } {
  switch (s) {
    case "invited":
      return { label: "Invited", tone: "amber" };
    case "set_up":
      return { label: "Set up", tone: "amber" };
    case "active":
      return { label: "Active", tone: "amber" };
    case "paused":
      return { label: "Paused", tone: "muted" };
    case "left":
      return { label: "Left", tone: "muted" };
  }
}
