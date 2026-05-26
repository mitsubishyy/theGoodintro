import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Append a row to the audit log (append-only; the DB blocks update/delete).
 * Every admin mutation should call this so "who did what, when" is recorded.
 */
export async function logAudit(
  supabase: SupabaseClient,
  actorStaffId: string,
  entry: {
    action: string;
    targetType?: string;
    targetId?: string;
    actingForExecutiveId?: string;
    metadata?: Record<string, unknown>;
  },
) {
  await supabase.from("audit_entry").insert({
    actor_type: "staff",
    actor_id: actorStaffId,
    acting_for_executive_id: entry.actingForExecutiveId ?? null,
    action: entry.action,
    target_type: entry.targetType ?? null,
    target_id: entry.targetId ?? null,
    metadata: entry.metadata ?? {},
  });
}
