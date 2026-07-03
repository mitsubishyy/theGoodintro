"use client";

import { createContext, useContext } from "react";
import type { ActingAsExec } from "../data";

/**
 * Staff acting-for context. Resolved once in the exec layout (resolveActingAsExec)
 * and provided portal-wide so ExecShell can render the slim "Viewing as [name]"
 * banner without every page having to thread the payload through. Non-null ONLY
 * for a staff member operating the portal as a specific executive; an exec/EA
 * session (or plain staff demo browsing) gets a null context and no banner.
 *
 * Distinct from EA Mode (ea-mode.tsx): staff acting-for and an EA session are
 * mutually exclusive (staff are not EAs), and resolveEaMode already returns null
 * for a staff principal, so the two banners never co-render.
 */
const ActingAsContext = createContext<ActingAsExec | null>(null);

export function useActingAs(): ActingAsExec | null {
  return useContext(ActingAsContext);
}

export function ActingAsProvider({ actingAs, children }: { actingAs: ActingAsExec | null; children: React.ReactNode }) {
  return <ActingAsContext.Provider value={actingAs}>{children}</ActingAsContext.Provider>;
}
