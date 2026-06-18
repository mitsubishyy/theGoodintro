import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { getFlag } from "@/lib/flags";
import { SUPPORTED_EMAIL_EVENTS } from "@/lib/email/sender";
import { confirmMeetingAction, markHeldAction, releaseMeetingAction, reverseHeldAction, sendQueuedEmailsAction } from "./actions";
import { CopyAcceptLink } from "./copy-link";
import { ConfirmSubmit } from "./confirm-submit";

export const metadata: Metadata = {
  title: "Meetings — TheGoodIntro admin",
  robots: { index: false, follow: false },
};

const inputStyle = { background: "var(--portal-card)", borderColor: "var(--portal-line)" } as const;

type Row = {
  id: string;
  status: string;
  scheduled_at: string | null;
  credit_lot_id: string | null;
  payment_due_at: string | null;
  request: { executive: { title: string; company: string } | { title: string; company: string }[]; vendor: { name: string } | { name: string }[] } | null;
};

function names(r: Row) {
  const req = Array.isArray(r.request) ? r.request[0] : r.request;
  const exec = req && (Array.isArray(req.executive) ? req.executive[0] : req.executive);
  const vendor = req && (Array.isArray(req.vendor) ? req.vendor[0] : req.vendor);
  return { execLabel: exec ? `${exec.title}, ${exec.company}` : "—", vendor: vendor?.name ?? "—" };
}

type PendingRequest = {
  id: string;
  created_at: string;
  executive: { title: string; company: string } | { title: string; company: string }[] | null;
  vendor: { name: string } | { name: string }[] | null;
  tokens: { token: string; status: string }[];
};

export default async function MeetingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("meeting")
    .select("id, status, scheduled_at, credit_lot_id, payment_due_at, request:request_id(executive:executive_id(title,company), vendor:vendor_id(name))")
    .in("status", ["proposed", "confirmed", "held"])
    .order("created_at", { ascending: true });
  const rows = (data ?? []) as unknown as Row[];

  // Submitted requests with their signed accept link. The token is staff-only
  // under RLS; surfacing it here lets the admin hand-deliver the /e/<token>
  // link until the email sender exists (MVP_GAP_AUDIT step 4, A1 stopgap).
  const { data: pendingData } = await supabase
    .from("request")
    .select("id, created_at, executive:executive_id(title,company), vendor:vendor_id(name), tokens:email_action_token(token, status)")
    .eq("status", "submitted")
    .order("created_at", { ascending: true });
  const pending = (pendingData ?? []) as unknown as PendingRequest[];

  // A1 outbox state for the drain block below.
  const { data: outboxRows } = await supabase
    .from("notification")
    .select("status")
    .eq("channel", "email")
    .in("event", SUPPORTED_EMAIL_EVENTS as unknown as string[]);
  const outboxCounts = { queued: 0, failed: 0, sent: 0 };
  for (const n of outboxRows ?? []) {
    if (n.status === "queued" || n.status === "sending") outboxCounts.queued += 1;
    else if (n.status === "failed") outboxCounts.failed += 1;
    else if (n.status === "sent") outboxCounts.sent += 1;
  }
  const emailFlagOn = await getFlag("email_sending");
  const hasResendKey = Boolean(process.env.RESEND_API_KEY);
  const emailMode = process.env.EMAIL_MODE === "live" ? "live" : "test";

  return (
    <div className="max-w-3xl px-8 py-6">
      <h1 className="text-2xl font-semibold tracking-tight">Meetings</h1>
      <p className="mt-1 mb-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
        Confirm times and record outcomes. A held meeting consumes a credit and
        records the gift.
      </p>

      {pending.length > 0 ? (
        <div className="mb-8">
          <h2 className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>
            Awaiting exec response
          </h2>
          <div className="flex flex-col gap-3">
            {pending.map((p) => {
              const exec = Array.isArray(p.executive) ? p.executive[0] : p.executive;
              const vendorRel = Array.isArray(p.vendor) ? p.vendor[0] : p.vendor;
              const execLabel = exec ? `${exec.title}, ${exec.company}` : "—";
              const vendor = vendorRel?.name ?? "—";
              const active = p.tokens.find((t) => t.status === "active");
              return (
                <div key={p.id} className="rounded-xl border p-4" style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{vendor} → {execLabel}</div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>
                      Submitted {formatDate(p.created_at)}
                    </span>
                  </div>
                  {active ? (
                    <CopyAcceptLink path={`/e/${active.token}`} />
                  ) : (
                    <p className="mt-2 text-xs" style={{ color: "var(--muted-foreground)" }}>No active link for this request.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        {rows.map((r) => {
          const { execLabel, vendor } = names(r);
          return (
            <div key={r.id} className="rounded-xl border p-4" style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{vendor} → {execLabel}</div>
                <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}>
                  {r.status}
                </span>
              </div>

              {r.status === "proposed" ? (
                <form action={confirmMeetingAction} className="mt-3 flex flex-wrap items-end gap-2">
                  <input type="hidden" name="meeting_id" value={r.id} />
                  <input name="scheduled_at" type="datetime-local" className="rounded-lg border px-2 py-1.5 text-sm" style={inputStyle} />
                  <input name="join_url" placeholder="Join URL" className="rounded-lg border px-2 py-1.5 text-sm" style={inputStyle} />
                  <button type="submit" className="rounded-lg px-3 py-1.5 text-sm font-semibold" style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}>
                    Confirm time
                  </button>
                </form>
              ) : r.status === "held" ? (
                // Correction path (STATE_MACHINES.md): a wrongly-marked held
                // meeting is reversed — credit returned, unpaid gift voided,
                // rebook spawned. Behind a confirm so it can't fire on a stray click.
                <div className="mt-2">
                  <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    {formatDate(r.scheduled_at)} · held{r.credit_lot_id ? " · credit consumed" : ""}
                  </div>
                  <form action={reverseHeldAction} className="mt-2">
                    <input type="hidden" name="meeting_id" value={r.id} />
                    <ConfirmSubmit
                      message="Reverse this held meeting? The credit returns to the vendor, the gift is voided if it has not been paid, and a rebook is created with the same executive."
                      className="rounded-lg border px-3 py-1.5 text-sm"
                      style={{ borderColor: "var(--portal-line)" }}
                    >
                      Reverse held
                    </ConfirmSubmit>
                  </form>
                </div>
              ) : (
                <div className="mt-2">
                  <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    {formatDate(r.scheduled_at)}
                    {r.credit_lot_id ? " · credit reserved" : " · uncredited (payment due " + formatDate(r.payment_due_at) + ")"}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <form action={markHeldAction}>
                      <input type="hidden" name="meeting_id" value={r.id} />
                      <button type="submit" className="rounded-lg px-3 py-1.5 text-sm font-semibold" style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}>Mark held</button>
                    </form>
                    <form action={releaseMeetingAction}>
                      <input type="hidden" name="meeting_id" value={r.id} />
                      <input type="hidden" name="outcome" value="no_show" />
                      <button type="submit" className="rounded-lg border px-3 py-1.5 text-sm" style={{ borderColor: "var(--portal-line)" }}>No-show</button>
                    </form>
                    <form action={releaseMeetingAction}>
                      <input type="hidden" name="meeting_id" value={r.id} />
                      <input type="hidden" name="outcome" value="cancelled" />
                      <button type="submit" className="rounded-lg border px-3 py-1.5 text-sm" style={{ borderColor: "var(--portal-line)" }}>Cancel</button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {rows.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No meetings to schedule.</p>
        ) : null}
      </div>

      {/* A1 email outbox: manual drain trigger, stopgap until the S6 cron. */}
      <div className="mt-8">
        <h2 className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>
          Email outbox
        </h2>
        <div className="rounded-xl border p-4" style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}>
          <div className="text-sm">
            {outboxCounts.queued} queued · {outboxCounts.failed} failed (will retry) · {outboxCounts.sent} sent
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
            Mode: {emailMode} · flag email_sending {emailFlagOn ? "on" : "off"} · Resend key {hasResendKey ? "present" : "missing"}.
            {emailMode === "test" ? " Test mode sends everything to the Resend test inbox, never to real recipients." : ""}
          </p>
          <form action={sendQueuedEmailsAction} className="mt-3">
            <ConfirmSubmit
              message={`Send ${outboxCounts.queued + outboxCounts.failed} queued email(s) now (${emailMode} mode)?`}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold"
              style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}
            >
              Send queued emails
            </ConfirmSubmit>
          </form>
        </div>
      </div>
    </div>
  );
}
