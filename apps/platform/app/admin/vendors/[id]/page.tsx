import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFlag } from "@/lib/flags";
import { formatAud, formatDate } from "@/lib/format";
import {
  approveVendorAction,
  issueInvoiceAction,
  simulatePaidAction,
} from "../actions";

export const metadata: Metadata = {
  title: "Vendor — theGoodintro admin",
  robots: { index: false, follow: false },
};

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const payments = await getFlag("vendor_payments");

  const [{ data: vendor }, { data: applications }, { data: invoices }, { data: lots }] =
    await Promise.all([
      supabase.from("vendor").select("*").eq("id", id).maybeSingle(),
      supabase.from("application").select("*").eq("vendor_id", id).order("created_at", { ascending: false }),
      supabase.from("invoice").select("*").eq("vendor_id", id).order("created_at", { ascending: false }),
      supabase.from("credit_lot").select("quantity_remaining").eq("vendor_id", id),
    ]);

  if (!vendor) notFound();

  const remaining = (lots ?? []).reduce(
    (s, l) => s + (l.quantity_remaining as number),
    0,
  );
  const latestApp = (applications ?? [])[0];
  const canApprove = ["signed_up", "call_booked"].includes(vendor.status as string);

  return (
    <div className="max-w-3xl">
      <Link href="/admin/vendors" className="text-sm" style={{ color: "var(--muted-foreground)" }}>
        ← Vendors
      </Link>
      <div className="mt-2 mb-1 flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{vendor.name}</h1>
        <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}>
          {vendor.status}
        </span>
      </div>
      <p className="mb-8 text-sm" style={{ color: "var(--muted-foreground)" }}>
        {vendor.email_domain} · {remaining} credits remaining
      </p>

      {!payments ? (
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Vetting and payment actions are off (turn on <code>vendor_payments</code>).
        </p>
      ) : (
        <>
          <section className="mb-10">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
              Vetting
            </h2>
            {latestApp ? (
              <div className="rounded-xl border p-4 text-sm" style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--portal-amber-ink)" }}>
                  Application · {latestApp.outcome as string}
                </div>
                <pre className="whitespace-pre-wrap break-words font-sans">
                  {JSON.stringify(latestApp.answers, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No application submitted yet.</p>
            )}
            {canApprove ? (
              <form action={approveVendorAction} className="mt-3">
                <input type="hidden" name="vendor_id" value={vendor.id} />
                <button type="submit" className="rounded-lg px-4 py-2 text-sm font-semibold" style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}>
                  Approve (unlock payment)
                </button>
              </form>
            ) : null}
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
              Payment
            </h2>
            <form action={issueInvoiceAction} className="mb-4 flex items-end gap-3">
              <input type="hidden" name="vendor_id" value={vendor.id} />
              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>Credits</span>
                <input name="credits" type="number" min={1} defaultValue={5} className="w-24 rounded-lg border px-3 py-2.5 text-sm" style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }} />
              </label>
              <button type="submit" className="rounded-lg border px-4 py-2.5 text-sm" style={{ borderColor: "var(--portal-line)", background: "var(--portal-card)" }}>
                Issue invoice
              </button>
            </form>

            <div className="flex flex-col gap-2">
              {(invoices ?? []).map((inv) => (
                <div key={inv.id as string} className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm" style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}>
                  <span>
                    {formatAud(inv.amount_cents as number)}{" "}
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>
                      {inv.status as string} · {formatDate(inv.created_at as string)}
                    </span>
                  </span>
                  {inv.status !== "paid" ? (
                    <form action={simulatePaidAction}>
                      <input type="hidden" name="vendor_id" value={vendor.id} />
                      <input type="hidden" name="xero_invoice_id" value={inv.xero_invoice_id as string} />
                      <button type="submit" className="rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}>
                        Simulate paid
                      </button>
                    </form>
                  ) : null}
                </div>
              ))}
              {(invoices ?? []).length === 0 ? (
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No invoices yet.</p>
              ) : null}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
