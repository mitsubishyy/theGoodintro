import type { ReactNode } from "react";
import { requireExecOrEa } from "@/lib/auth";
import { resolveEaMode, resolveActingAsExec } from "./data";
import { EaModeProvider } from "./_components/ea-mode";
import { ActingAsProvider } from "./_components/acting-as";

/**
 * Auth gate for the ENTIRE exec portal. Unlike /admin and /vendor, /exec had no
 * layout, so middleware (which only checks that a user is signed IN, not their
 * role) let a signed-in vendor reach /exec and read executive data.
 *
 * Slice 2d widens the interim staff-only gate to "staff OR the owning exec/EA":
 * staff still operate the surface (the demo / admin-acting path), and a signed-in
 * executive or their assigned EA reach their own scoped portal (enforced by the
 * 0029 RLS). A vendor or any other session is bounced. The exec/EA branch only
 * opens once the exec_ea_login flag is on (off by default), so until then this is
 * effectively staff-only, unchanged.
 *
 * The layout also resolves EA Mode once (null unless this is an EA session) and
 * provides it portal-wide: the locked "Acting for" banner renders here, above the
 * per-page ExecShell, and the same payload feeds the sidebar chip swap.
 */
export default async function ExecLayout({ children }: { children: ReactNode }) {
  await requireExecOrEa();
  const [eaMode, actingAs] = await Promise.all([resolveEaMode(), resolveActingAsExec()]);
  return (
    <ActingAsProvider actingAs={actingAs}>
      <EaModeProvider eaMode={eaMode}>{children}</EaModeProvider>
    </ActingAsProvider>
  );
}
