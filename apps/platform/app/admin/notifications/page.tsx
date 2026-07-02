import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFlag } from "@/lib/flags";
import { ageShort } from "@/lib/format";
import { describeStaffNotification, type StaffNotificationContext } from "./_display";

export const metadata: Metadata = {
  title: "Notifications — TheGoodIntro admin",
  robots: { index: false, follow: false },
};

function one<T>(v: unknown): T | undefined {
  return (Array.isArray(v) ? v[0] : v) as T | undefined;
}

/**
 * Read-only staff notifications feed: the first renderer for the queued
 * channel='in_app', recipient_type='staff' rows the loop has been accumulating
 * with nowhere to show them. No mutations, no mark-read (the notification table
 * has no read-state column, DEC noted 2026-07-02), no new workflow actions — each
 * row just links to the relevant admin parent route. Flag-gated
 * (admin_notifications, OFF by default); the route 404s until Issy enables it.
 */
export default async function AdminNotificationsPage() {
  if (!(await getFlag("admin_notifications"))) notFound();

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("notification")
    .select(
      "id, event, payload, created_at, request:request_id(vendor:vendor_id(name), executive:executive_id(name))",
    )
    .eq("channel", "in_app")
    .eq("recipient_type", "staff")
    .order("created_at", { ascending: false })
    .limit(50);

  // B4 rows (invoice voided / reconcile drift) carry no request_id; the vendor
  // is on payload.vendor_id. Batch-resolve those names in one query.
  const payloadVendorIds = Array.from(
    new Set(
      (rows ?? [])
        .map((r) => (r.payload as { vendor_id?: string } | null)?.vendor_id)
        .filter((v): v is string => typeof v === "string"),
    ),
  );
  const vendorNameById = new Map<string, string>();
  if (payloadVendorIds.length > 0) {
    const { data: vendors } = await supabase
      .from("vendor")
      .select("id, name")
      .in("id", payloadVendorIds);
    for (const v of vendors ?? []) vendorNameById.set(v.id as string, v.name as string);
  }

  const items = (rows ?? [])
    .map((r) => {
      const req = one<{ vendor: unknown; executive: unknown }>(r.request);
      const payload = (r.payload ?? {}) as {
        vendor_id?: string;
        amount_cents?: number;
        credits?: number;
        gift_paid_kept?: boolean;
      };
      const ctx: StaffNotificationContext = {
        vendorName:
          one<{ name: string }>(req?.vendor)?.name ??
          (payload.vendor_id ? vendorNameById.get(payload.vendor_id) ?? null : null),
        execName: one<{ name: string }>(req?.executive)?.name ?? null,
        amountCents: typeof payload.amount_cents === "number" ? payload.amount_cents : null,
        credits: typeof payload.credits === "number" ? payload.credits : null,
        giftPaidKept: payload.gift_paid_kept === true,
      };
      const display = describeStaffNotification(r.event as string, ctx);
      if (!display) return null;
      return { id: r.id as string, createdAt: r.created_at as string, ...display };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <div className="max-w-3xl px-8 py-6">
      <h1 className="text-[20px] font-semibold tracking-tight">Notifications</h1>
      <p className="mt-1 mb-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
        Staff tasks and alerts from the booking loop. Read-only; manual follow-ups
        are marked with a red dot.
      </p>

      {items.length === 0 ? (
        <div
          className="rounded-xl border px-5 py-10 text-center text-sm"
          style={{ borderColor: "var(--portal-line)", color: "var(--muted-foreground)" }}
        >
          Nothing here yet. New staff tasks will appear as the loop runs.
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-xl border"
          style={{ borderColor: "var(--portal-line)" }}
        >
          {items.map((it, i) => {
            const age = ageShort(it.createdAt);
            return (
              <Link
                key={it.id}
                href={it.href}
                className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-[var(--portal-card)]"
                style={{ borderTop: i === 0 ? "none" : "1px solid var(--portal-line)" }}
              >
                <span
                  className="mt-1.5 size-2 shrink-0 rounded-full"
                  style={{
                    background: it.manual ? "oklch(0.55 0.18 25)" : "var(--portal-amber)",
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium" style={{ color: "var(--portal-ink)" }}>
                    {it.title}
                  </div>
                  <div
                    className="mt-0.5 truncate text-[12px]"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {it.detail}
                  </div>
                </div>
                <span
                  className="shrink-0 text-[12px]"
                  style={{ color: "var(--muted-foreground)" }}
                  title={it.createdAt}
                >
                  {age.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
