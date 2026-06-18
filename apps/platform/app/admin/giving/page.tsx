import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatAud, formatDate } from "@/lib/format";
import { markGiftPaidAction } from "./actions";

export const metadata: Metadata = {
  title: "Giving — TheGoodIntro admin",
  robots: { index: false, follow: false },
};

export default async function GivingPage() {
  const supabase = await createClient();
  const { data: gifts } = await supabase
    .from("gift_record")
    .select("id, charity_amount_cents, status, created_at, charity:charity_id(name), meeting:meeting_id(request:request_id(vendor:vendor_id(name)))")
    .order("created_at", { ascending: false });

  const released = (gifts ?? []).filter((g) => g.status === "released");
  const owed = released.reduce((s, g) => s + (g.charity_amount_cents as number), 0);

  return (
    <div className="max-w-3xl px-8 py-6">
      <h1 className="text-[20px] font-semibold tracking-tight">Giving</h1>
      <p className="mt-1 mb-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
        The canonical gift record per held meeting. {formatAud(owed)} released and awaiting payment.
      </p>

      <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--portal-line)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--portal-card)", color: "var(--muted-foreground)" }}>
              <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.16em]">Charity</th>
              <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.16em]">From</th>
              <th className="px-4 py-2.5 text-right font-mono text-[10px] uppercase tracking-[0.16em]">Amount</th>
              <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.16em]">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {(gifts ?? []).map((g) => {
              const charity = Array.isArray(g.charity) ? g.charity[0] : g.charity;
              const meeting = Array.isArray(g.meeting) ? g.meeting[0] : g.meeting;
              const req = meeting && (Array.isArray(meeting.request) ? meeting.request[0] : meeting.request);
              const vendor = req && (Array.isArray(req.vendor) ? req.vendor[0] : req.vendor);
              return (
                <tr key={g.id as string} style={{ borderTop: "1px solid var(--portal-line)" }}>
                  <td className="px-4 py-3 font-medium">{charity?.name ?? "—"}</td>
                  <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>{vendor?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatAud(g.charity_amount_cents as number)}</td>
                  <td className="px-4 py-3">{g.status as string}</td>
                  <td className="px-4 py-3 text-right">
                    {g.status === "released" ? (
                      <form action={markGiftPaidAction}>
                        <input type="hidden" name="gift_id" value={g.id as string} />
                        <button type="submit" className="rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}>
                          Mark paid
                        </button>
                      </form>
                    ) : (
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>
                        {formatDate(g.created_at as string)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
