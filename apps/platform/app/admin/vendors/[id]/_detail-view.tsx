"use client";

import type { ReactNode } from "react";
import { MEETING_FEE_CENTS } from "@thegoodintro/pricing";
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  RecordDetail,
  StatusDot,
  type ActivityItem,
  type DetailFact,
  type DetailModule,
  type Tone,
} from "@thegoodintro/ui";
import { formatAud } from "@/lib/format";
import {
  approveVendorAction,
  issueInvoiceAction,
  simulatePaidAction,
  authoriseInvoiceAction,
  emailInvoiceAction,
} from "../actions";
import { vendorStatusPill, type VendorStatusEnum } from "../_status";

/** STUB-… ids are the no-Xero fallback path; only real Xero invoices can be
 *  authorised/emailed. Mirrors isRealXeroInvoiceId in lib (which pulls in
 *  node:crypto and so cannot be imported into this client component). */
const isRealXeroId = (id: string | null): id is string => !!id && !id.startsWith("STUB-");

/**
 * Admin Vendor detail T4 view (LOCKED 2026-06-04 per UI_KIT_DESIGN_LOG;
 * chunk A 2026-06-10). Renders the locked RecordDetail anatomy:
 *  - Header: identity + status + structured chips (Tier · ID · Renews) +
 *    ~4 key facts. No tags in the header per the lock.
 *  - 8-module rail. Chunk A wires 5 live (Overview / Users & Seats /
 *    Requests / Meetings / Billing & Credits) and leaves Checklist / Tags /
 *    Notes as placeholder modules pending their schema migrations.
 *  - Right append-only Activity feed from `audit_entry`.
 *
 * The page upstream owns data fetching; this client wrapper owns module
 * composition + the RecordDetail invocation. Server actions (approve, issue
 * invoice, simulate paid) are imported and attached to forms; Next wires
 * them transparently across the boundary.
 */

// ── Data shapes (plain serializable; built by the server page) ──────────────

export interface VendorDetailRow {
  id: string;
  shortId: string;            // "VEN-XXXX" derived from UUID tail
  name: string;
  emailDomain: string;
  status: VendorStatusEnum;
  tier: 1 | 2 | 3 | 4 | null;
  ownerName: string | null;
  ownerEmail: string | null;
  joinedLabel: string;
  renewsLabel: string;
  cycleAnchorLabel: string;
  creditsRemaining: number;
  meetingsHeldLifetime: number;
}

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "owner" | "member";
  status: "invited" | "active" | "removed";
}

export interface RequestSubRow {
  id: string;
  execName: string;
  execTitleCompany: string;
  status: "submitted" | "accepted" | "declined" | "closed";
  ageLabel: string;
  stale: boolean;
}

export interface MeetingSubRow {
  id: string;
  execName: string;
  execTitleCompany: string;
  scheduledLabel: string;
  status: "proposed" | "confirmed" | "held" | "no_show" | "cancelled" | "reversed";
  creditLabel: string; // "Reserved · <fee>" / "Consumed · <fee>" / "—" — fee from MEETING_FEE_CENTS
}

export interface InvoiceSubRow {
  id: string;
  xeroInvoiceId: string | null;
  amountLabel: string;
  status: "draft" | "sent" | "paid" | "void";
  createdLabel: string;
}

export interface CreditLotSubRow {
  id: string;
  quantity: number;
  remaining: number;
  purchasedLabel: string;
}

export interface VetState {
  paymentsFlag: boolean;
  canApprove: boolean;
  latestApplication: {
    id: string;
    outcome: "pending" | "approved" | "declined";
    answers: unknown;
  } | null;
}

export interface ActivityRow {
  id: string;
  action: string;
  actorType: "staff" | "vendor_user" | "ea" | "system" | "executive";
  createdAtLabel: string;
}

export interface VendorDetailViewProps {
  vendor: VendorDetailRow;
  users: UserRow[];
  requests: RequestSubRow[];
  meetings: MeetingSubRow[];
  invoices: InvoiceSubRow[];
  creditLots: CreditLotSubRow[];
  vetting: VetState;
  activity: ActivityRow[];
  pendingRequestCount: number;
}

function requestStatusBadge(s: RequestSubRow["status"]): { tone: Tone; label: string } {
  switch (s) {
    case "submitted":
      return { tone: "amber", label: "Submitted" };
    case "accepted":
      return { tone: "amber", label: "Accepted" };
    case "declined":
      return { tone: "muted", label: "Declined" };
    case "closed":
      return { tone: "muted", label: "Closed" };
  }
}

function meetingStatusBadge(s: MeetingSubRow["status"]): { tone: Tone; label: string } {
  switch (s) {
    case "proposed":
      return { tone: "amber", label: "Proposed" };
    case "confirmed":
      return { tone: "amber", label: "Confirmed" };
    case "held":
      return { tone: "amber", label: "Held" };
    case "no_show":
      return { tone: "muted", label: "No show" };
    case "cancelled":
      return { tone: "muted", label: "Cancelled" };
    case "reversed":
      return { tone: "danger", label: "Reversed" };
  }
}

function invoiceStatusBadge(s: InvoiceSubRow["status"]): { tone: Tone; label: string } {
  switch (s) {
    case "draft":
      return { tone: "muted", label: "Draft" };
    case "sent":
      return { tone: "amber", label: "Sent" };
    case "paid":
      return { tone: "amber", label: "Paid" };
    case "void":
      return { tone: "muted", label: "Void" };
  }
}

// ── Module shells ───────────────────────────────────────────────────────────

function ModuleHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="px-5 pt-4 pb-3 border-b" style={{ borderColor: "var(--portal-line)" }}>
      <h3 className="text-[11px] font-mono uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
        {title}
      </h3>
      {hint && (
        <p className="mt-1 text-[12px]" style={{ color: "var(--muted-foreground)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

function Section({ children }: { children: ReactNode }) {
  return <div className="p-5">{children}</div>;
}

function MutedRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2 text-[13px]" style={{ borderBottom: "1px solid var(--portal-line)" }}>
      <span className="font-mono text-[10.5px] uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <span style={{ color: "var(--portal-ink)" }}>{value}</span>
    </div>
  );
}

function PlaceholderModule({ title, schemaHint }: { title: string; schemaHint: string }) {
  return (
    <>
      <ModuleHeader title={title} />
      <EmptyState
        title={`Awaiting ${schemaHint}.`}
        hint="Wired in a follow-up commit once the schema migration lands."
      />
    </>
  );
}

// ── Overview ────────────────────────────────────────────────────────────────

function OverviewModule({ vendor, vetting }: { vendor: VendorDetailRow; vetting: VetState }) {
  const tierLabel = vendor.tier ? `Tier ${vendor.tier}` : "—";
  return (
    <>
      <ModuleHeader title="Overview" />
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-[0.18em] mb-2" style={{ color: "var(--muted-foreground)" }}>
              Identity
            </h4>
            <MutedRow label="Name" value={vendor.name} />
            <MutedRow label="Domain" value={vendor.emailDomain} />
            <MutedRow label="Owner" value={vendor.ownerName ?? "—"} />
            <MutedRow label="Owner email" value={vendor.ownerEmail ?? "—"} />
          </div>
          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-[0.18em] mb-2" style={{ color: "var(--muted-foreground)" }}>
              Key metrics
            </h4>
            <MutedRow label="Current tier" value={tierLabel} />
            <MutedRow label="Meetings held" value={String(vendor.meetingsHeldLifetime)} />
            <MutedRow label="Credits remaining" value={String(vendor.creditsRemaining)} />
            <MutedRow label="Cycle anchor" value={vendor.cycleAnchorLabel} />
          </div>
        </div>

        {vetting.paymentsFlag && (
          <div className="mt-6 pt-5 border-t" style={{ borderColor: "var(--portal-line)" }}>
            <h4 className="text-[11px] font-mono uppercase tracking-[0.18em] mb-2" style={{ color: "var(--muted-foreground)" }}>
              Vetting
            </h4>
            {vetting.latestApplication ? (
              <div className="rounded-xl p-4" style={{ background: "var(--portal-card-hover)" }}>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--portal-amber-ink)" }}>
                    Application · {vetting.latestApplication.outcome}
                  </span>
                </div>
                <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-[12.5px] max-h-48 overflow-auto" style={{ color: "var(--portal-ink)" }}>
                  {JSON.stringify(vetting.latestApplication.answers, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
                No application submitted yet.
              </p>
            )}
            {vetting.canApprove && (
              <form action={approveVendorAction} className="mt-3">
                <input type="hidden" name="vendor_id" value={vendor.id} />
                <Button variant="primary" size="sm" type="submit">
                  Approve (unlock payment)
                </Button>
              </form>
            )}
          </div>
        )}
      </Section>
    </>
  );
}

// ── Users & Seats ───────────────────────────────────────────────────────────

function UsersModule({ users }: { users: UserRow[] }) {
  return (
    <>
      <ModuleHeader title="Users & seats" hint={`${users.length} user${users.length === 1 ? "" : "s"} on this vendor.`} />
      {users.length === 0 ? (
        <EmptyState title="No users yet." />
      ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-5 py-2.5 text-left font-mono text-[10.5px] uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>
                User
              </th>
              <th className="px-3 py-2.5 text-left font-mono text-[10.5px] uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>
                Role
              </th>
              <th className="px-5 py-2.5 text-left font-mono text-[10.5px] uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} style={{ borderTop: i === 0 ? "1px solid var(--portal-line)" : "1px solid var(--portal-line)" }}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={u.name} size={32} />
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-semibold truncate" style={{ color: "var(--portal-ink)" }}>
                        {u.name}
                      </div>
                      <div className="text-[12px] truncate" style={{ color: "var(--muted-foreground)" }}>
                        {u.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <Badge tone={u.role === "owner" ? "amber" : "muted"} className="font-mono uppercase tracking-[0.12em]">
                    {u.role === "owner" ? "Owner" : "Member"}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <Badge tone={u.status === "active" ? "amber" : u.status === "invited" ? "amber" : "muted"} dot>
                    {u.status === "active" ? "Active" : u.status === "invited" ? "Invited" : "Removed"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

// ── Requests ────────────────────────────────────────────────────────────────

function RequestsModule({ requests }: { requests: RequestSubRow[] }) {
  return (
    <>
      <ModuleHeader title="Requests" hint={`${requests.length} request${requests.length === 1 ? "" : "s"} from this vendor.`} />
      {requests.length === 0 ? (
        <EmptyState title="No requests yet." />
      ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-5 py-2.5 text-left font-mono text-[10.5px] uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>
                Executive
              </th>
              <th className="px-3 py-2.5 text-left font-mono text-[10.5px] uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>
                Status
              </th>
              <th className="px-5 py-2.5 text-right font-mono text-[10.5px] uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>
                Age
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => {
              const b = requestStatusBadge(r.status);
              return (
                <tr key={r.id} style={{ borderTop: "1px solid var(--portal-line)" }}>
                  <td className="px-5 py-3">
                    <div className="text-[13.5px] font-semibold" style={{ color: "var(--portal-ink)" }}>
                      {r.execName}
                    </div>
                    <div className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
                      {r.execTitleCompany}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={b.tone} dot>{b.label}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className="text-[12.5px] font-mono"
                      style={{
                        color: r.stale ? "var(--portal-amber-ink)" : "var(--muted-foreground)",
                        fontWeight: r.stale ? 600 : 400,
                      }}
                    >
                      {r.ageLabel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}

// ── Meetings ────────────────────────────────────────────────────────────────

function MeetingsModule({ meetings }: { meetings: MeetingSubRow[] }) {
  return (
    <>
      <ModuleHeader
        title="Meetings"
        hint="Per-meeting charity amount is frozen at Held and shown on the meeting record, never a flat figure."
      />
      {meetings.length === 0 ? (
        <EmptyState title="No meetings yet." />
      ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-5 py-2.5 text-left font-mono text-[10.5px] uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>
                Executive
              </th>
              <th className="px-3 py-2.5 text-left font-mono text-[10.5px] uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>
                When
              </th>
              <th className="px-3 py-2.5 text-left font-mono text-[10.5px] uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>
                Status
              </th>
              <th className="px-5 py-2.5 text-right font-mono text-[10.5px] uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>
                Credit
              </th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((m) => {
              const b = meetingStatusBadge(m.status);
              return (
                <tr key={m.id} style={{ borderTop: "1px solid var(--portal-line)" }}>
                  <td className="px-5 py-3">
                    <div className="text-[13.5px] font-semibold" style={{ color: "var(--portal-ink)" }}>
                      {m.execName}
                    </div>
                    <div className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
                      {m.execTitleCompany}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[12.5px] font-mono" style={{ color: "var(--portal-ink)" }}>
                    {m.scheduledLabel}
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={b.tone} dot>{b.label}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right text-[12.5px] font-mono" style={{ color: "var(--portal-ink)" }}>
                    {m.creditLabel}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}

// ── Billing & Credits ───────────────────────────────────────────────────────

function BillingModule({
  vendor,
  invoices,
  creditLots,
  vetting,
}: {
  vendor: VendorDetailRow;
  invoices: InvoiceSubRow[];
  creditLots: CreditLotSubRow[];
  vetting: VetState;
}) {
  return (
    <>
      <ModuleHeader
        title="Billing & credits"
        hint={`1 credit = ${formatAud(MEETING_FEE_CENTS)} flat (locked credit money rule).`}
      />
      <Section>
        {/* Credit lots summary */}
        <h4 className="text-[11px] font-mono uppercase tracking-[0.18em] mb-2" style={{ color: "var(--muted-foreground)" }}>
          Credit lots
        </h4>
        {creditLots.length === 0 ? (
          <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
            No credit lots yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {creditLots.map((lot) => (
              <li
                key={lot.id}
                className="flex items-baseline justify-between gap-3 rounded-lg px-3 py-2 text-[13px]"
                style={{ background: "var(--portal-card-hover)" }}
              >
                <span className="font-mono text-[12px]" style={{ color: "var(--portal-ink)" }}>
                  {lot.purchasedLabel}
                </span>
                <span style={{ color: "var(--portal-ink)" }}>
                  {lot.remaining} / {lot.quantity} remaining
                </span>
              </li>
            ))}
          </ul>
        )}

        {vetting.paymentsFlag && (
          <>
            <h4 className="text-[11px] font-mono uppercase tracking-[0.18em] mt-6 mb-2" style={{ color: "var(--muted-foreground)" }}>
              Issue invoice
            </h4>
            <form action={issueInvoiceAction} className="flex items-end gap-3">
              <input type="hidden" name="vendor_id" value={vendor.id} />
              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>
                  Credits
                </span>
                <input
                  name="credits"
                  type="number"
                  min={1}
                  defaultValue={5}
                  className="w-24 rounded-lg border px-3 py-2 text-[13px]"
                  style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}
                />
              </label>
              <Button variant="ghost" size="md" type="submit">
                Issue invoice
              </Button>
            </form>

            <h4 className="text-[11px] font-mono uppercase tracking-[0.18em] mt-6 mb-2" style={{ color: "var(--muted-foreground)" }}>
              Invoices
            </h4>
            {invoices.length === 0 ? (
              <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
                No invoices yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {invoices.map((inv) => {
                  const b = invoiceStatusBadge(inv.status);
                  return (
                    <li
                      key={inv.id}
                      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5"
                      style={{ background: "var(--portal-card-hover)" }}
                    >
                      <div className="flex items-baseline gap-3 min-w-0">
                        <span className="font-semibold text-[13px]" style={{ color: "var(--portal-ink)" }}>
                          {inv.amountLabel}
                        </span>
                        <Badge tone={b.tone} dot>{b.label}</Badge>
                        <span className="font-mono text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                          {inv.createdLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Real Xero draft: Authorise (no email) then Email
                            (sends, flips ledger -> sent). Decoupled so a real
                            invoice can be verified in Xero before it is sent. */}
                        {inv.status === "draft" && isRealXeroId(inv.xeroInvoiceId) && (
                          <>
                            <form action={authoriseInvoiceAction}>
                              <input type="hidden" name="vendor_id" value={vendor.id} />
                              <input type="hidden" name="xero_invoice_id" value={inv.xeroInvoiceId} />
                              <Button variant="ghost" size="sm" type="submit">
                                Authorise
                              </Button>
                            </form>
                            <form action={emailInvoiceAction}>
                              <input type="hidden" name="vendor_id" value={vendor.id} />
                              <input type="hidden" name="xero_invoice_id" value={inv.xeroInvoiceId} />
                              <Button variant="ghost" size="sm" type="submit">
                                Email
                              </Button>
                            </form>
                          </>
                        )}
                        {/* Staging shortcut: run the paid-unlock without a real
                            payment (the real path is the signature-verified webhook). */}
                        {inv.status !== "paid" && inv.xeroInvoiceId && (
                          <form action={simulatePaidAction}>
                            <input type="hidden" name="vendor_id" value={vendor.id} />
                            <input type="hidden" name="xero_invoice_id" value={inv.xeroInvoiceId} />
                            <Button variant="primary" size="sm" type="submit">
                              Simulate paid
                            </Button>
                          </form>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}

        {!vetting.paymentsFlag && (
          <p className="mt-6 text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
            Vetting and payment actions are off (turn on <code>vendor_payments</code>).
          </p>
        )}
      </Section>
    </>
  );
}

// ── Activity feed item builder ──────────────────────────────────────────────

function humanizeAction(action: string): string {
  // Map known actor-action codes to short human strings. Falls back to the raw
  // dotted key so unknown actions still render readably.
  // Every key here is an action code some part of the system genuinely emits
  // (lib/audit.ts callers + the SECURITY DEFINER functions in migrations
  // 0006/0007/0008). The previous map carried four codes nothing emits
  // (vendor.created, credit.purchased/reserved/consumed) which implied
  // features that do not exist; they are removed. request.* are emitted with
  // target_type='request', so they surface here only once the activity query
  // is broadened beyond target_type='vendor' (tracked separately) — mapped now
  // so the vocabulary is complete and correct wherever the feed is reused.
  const map: Record<string, string> = {
    "vendor.signed_up": "Vendor signed up",
    "vendor.approved": "Approved vendor",
    "application.submitted": "Application submitted",
    "invoice.issued": "Issued invoice",
    "invoice.authorised": "Authorised invoice",
    "invoice.emailed": "Emailed invoice",
    "invoice.email_skipped": "Email skipped (not authorised)",
    "invoice.simulated_paid": "Marked invoice as paid",
    "request.submitted": "Request submitted",
    "request.forwarded_to_ea": "Request forwarded to EA",
    "request.accepted": "Request accepted",
    "request.declined": "Request declined",
  };
  return map[action] ?? action;
}

function buildActivity(rows: ActivityRow[]): ActivityItem[] {
  return rows.map((r) => ({
    id: r.id,
    text: humanizeAction(r.action),
    actor: r.actorType,
    at: r.createdAtLabel,
  }));
}

// ── The view ────────────────────────────────────────────────────────────────

export function VendorDetailView({
  vendor,
  users,
  requests,
  meetings,
  invoices,
  creditLots,
  vetting,
  activity,
  pendingRequestCount,
}: VendorDetailViewProps) {
  const headerPill = vendorStatusPill(vendor.status);

  const chips: { label: string; tone?: Tone }[] = [];
  if (vendor.tier) chips.push({ label: `Tier ${vendor.tier}`, tone: "amber" });
  chips.push({ label: vendor.shortId, tone: "muted" });
  chips.push({ label: `Renews ${vendor.renewsLabel}`, tone: "muted" });

  const facts: DetailFact[] = [
    { label: "Domain", value: vendor.emailDomain },
    { label: "Owner", value: vendor.ownerName ?? "—" },
    { label: "Joined", value: vendor.joinedLabel },
    {
      label: "Credits",
      value: (
        <span className="inline-flex items-center gap-2">
          {vendor.creditsRemaining === 0 && <StatusDot tone="danger" size={6} />}
          {vendor.creditsRemaining}
        </span>
      ),
    },
  ];

  const modules: DetailModule[] = [
    {
      key: "overview",
      label: "Overview",
      content: <OverviewModule vendor={vendor} vetting={vetting} />,
    },
    {
      key: "users",
      label: "Users & seats",
      content: <UsersModule users={users} />,
    },
    {
      key: "requests",
      label: "Requests",
      badge: pendingRequestCount,
      content: <RequestsModule requests={requests} />,
    },
    {
      key: "meetings",
      label: "Meetings",
      content: <MeetingsModule meetings={meetings} />,
    },
    {
      key: "billing",
      label: "Billing & credits",
      content: (
        <BillingModule vendor={vendor} invoices={invoices} creditLots={creditLots} vetting={vetting} />
      ),
    },
    {
      key: "checklist",
      label: "Checklist",
      content: <PlaceholderModule title="Checklist" schemaHint="checklist_assignment schema" />,
    },
    {
      key: "tags",
      label: "Tags",
      content: <PlaceholderModule title="Tags" schemaHint="tag / vendor_tag schema (TAGS_FEATURE.md)" />,
    },
    {
      key: "notes",
      label: "Notes",
      content: <PlaceholderModule title="Notes" schemaHint="vendor note schema" />,
    },
  ];

  return (
    <RecordDetail
      header={{
        avatar: <Avatar name={vendor.name} size={48} />,
        title: vendor.name,
        subtitle: vendor.emailDomain,
        status: { label: headerPill.label, tone: headerPill.tone, dot: true },
        chips,
        facts,
      }}
      modules={modules}
      activity={buildActivity(activity)}
    />
  );
}
