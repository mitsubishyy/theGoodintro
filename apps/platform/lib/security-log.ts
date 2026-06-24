/**
 * Lightweight security-event log (PRODUCTION_READINESS B2).
 *
 * Emits one structured, append-only line per security-relevant event so "who did
 * what, when" on the auth surface is queryable in the platform logs (Vercel
 * runtime logs today; a dedicated drain / Sentry once B2 wires one). This is the
 * interim sink: no table, no migration — a structured `console.info` the log
 * pipeline can filter on `kind:"security_event"` and `event`.
 *
 * Rule for callers on the reset flow: log the SAME event regardless of whether
 * the account exists, so the log itself is never an account-enumeration oracle.
 */
export type SecurityEvent =
  | "password_reset_requested"
  | "password_reset_completed";

export function logSecurityEvent(
  event: SecurityEvent,
  fields: Record<string, unknown> = {},
): void {
  try {
    console.info(
      JSON.stringify({
        kind: "security_event",
        event,
        at: new Date().toISOString(),
        ...fields,
      }),
    );
  } catch {
    // Never let logging throw into an auth path.
    console.info(`security_event ${event}`);
  }
}
