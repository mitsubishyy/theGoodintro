import type { ReactNode } from "react";
import { requireStaff } from "@/lib/auth";

/**
 * Auth gate for the ENTIRE exec portal. Unlike /admin and /vendor, /exec had no
 * layout, so middleware (which only checks that a user is signed IN, not their
 * role) let a signed-in vendor reach /exec and read executive data.
 *
 * Until real exec/EA login exists (the exec access model, a later slice), the
 * exec dashboard is a staff-operated surface — it resolves a demo executive
 * under the staff session — so it is gated to staff here. requireStaff() sends a
 * non-staff session to /login. When exec/EA auth lands, widen this to "staff OR
 * the exec/EA who owns this data".
 */
export default async function ExecLayout({ children }: { children: ReactNode }) {
  await requireStaff();
  return <>{children}</>;
}
