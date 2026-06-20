import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { bandForMeetingNumber, MEETING_FEE_CENTS } from "@thegoodintro/pricing";
import { PortalPage } from "@thegoodintro/ui";
import { createClient } from "@/lib/supabase/server";
import { getFlag } from "@/lib/flags";
import { ageShort, formatAud, formatDate } from "@/lib/format";
import {
  VendorDetailView,
  type ActivityRow,
  type CreditLotSubRow,
  type InvoiceSubRow,
  type MeetingSubRow,
  type RequestSubRow,
  type UserRow,
  type VendorDetailRow,
  type VetState,
} from "./_detail-view";
import { type VendorStatusEnum } from "../_status";

/**
 * Admin Vendor detail (T4) — port of the locked T4 (UI_KIT_DESIGN_LOG
 * "Admin Vendor detail" 2026-06-04). Chunk A 2026-06-10.
 *
 * The page owns data fetching and shaping; the client view owns RecordDetail
 * composition + the module rail. Server actions for vetting + payment
 * (approve, issue invoice, simulate paid) are imported by the client view
 * and attached to forms; Next wires them transparently.
 *
 * Modules:
 *  - Live: Overview / Users & Seats / Requests / Meetings / Billing & Credits.
 *  - Placeholder ("Awaiting <schema>"): Checklist / Tags / Notes — wired in
 *    a follow-up commit once each schema migration lands.
 *
 * Per-vendor Tier comes from cycle.held_meetings_count via bandForMeetingNumber,
 * matching the Vendors list (no vendor.tier schema yet per Issy 2026-06-08).
 *
 * Activity feed = audit_entry rows targeting this vendor (top 20).
 */

export const metadata: Metadata = {
  title: "Vendor — TheGoodIntro admin",
  robots: { index: false, follow: false },
};

function one<T>(v: unknown): T | undefined {
  return (Array.isArray(v) ? v[0] : v) as T | undefined;
}

function execTitleCompany(e?: { title?: string | null; company?: string | null }): string {
  if (!e) return "";
  const parts = [e.title, e.company].filter(Boolean) as string[];
  return parts.join(" · ");
}

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const payments = await getFlag("vendor_payments");
  const photoUploadEnabled = await getFlag("vendor_photo_upload");
  const now = new Date();
  const nowIso = now.toISOString();

  const [
    vendorResp,
    creditLotsResp,
    applicationsResp,
    invoicesResp,
    usersResp,
    requestsResp,
    meetingsResp,
    cycleResp,
    activityResp,
  ] = await Promise.all([
    supabase
      .from("vendor")
      .select(
        "id, name, email_domain, status, owner_user_id, access_expires_at, cycle_started_at, created_at, owner:owner_user_id ( name, email )",
      )
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase
      .from("credit_lot")
      .select("id, quantity, quantity_remaining, purchased_at")
      .eq("vendor_id", id)
      .order("purchased_at", { ascending: false }),
    supabase
      .from("application")
      .select("id, outcome, answers")
      .eq("vendor_id", id)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("invoice")
      .select("id, xero_invoice_id, amount_cents, status, created_at")
      .eq("vendor_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("vendor_user")
      .select("id, name, email, role, status, photo_url")
      .eq("vendor_id", id)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("request")
      .select(
        "id, status, created_at, executive:executive_id ( name, title, company )",
      )
      .eq("vendor_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("meeting")
      .select(
        "id, scheduled_at, status, request:request_id!inner ( vendor_id, executive:executive_id ( name, title, company ) )",
      )
      .eq("request.vendor_id", id)
      .order("scheduled_at", { ascending: false, nullsFirst: false }),
    supabase
      .from("cycle")
      .select("held_meetings_count")
      .eq("vendor_id", id)
      .lte("started_at", nowIso)
      .gt("ends_at", nowIso)
      .maybeSingle(),
    supabase
      .from("audit_entry")
      .select("id, action, actor_type, created_at")
      .eq("target_type", "vendor")
      .eq("target_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const vendor = vendorResp.data;
  if (!vendor) notFound();

  // ── Header shape ─────────────────────────────────────────────────────────
  const owner = one<{ name: string | null; email: string | null }>(vendor.owner);
  const statusEnum = vendor.status as VendorStatusEnum;
  const currentCycleHeld = (cycleResp.data?.held_meetings_count as number | undefined) ?? null;
  const tier =
    currentCycleHeld === null ? null : bandForMeetingNumber(currentCycleHeld + 1).band;

  const creditLots: CreditLotSubRow[] = (creditLotsResp.data ?? []).map((lot) => ({
    id: lot.id as string,
    quantity: lot.quantity as number,
    remaining: lot.quantity_remaining as number,
    purchasedLabel: formatDate(lot.purchased_at as string),
  }));
  const creditsRemaining = creditLots.reduce((s, l) => s + l.remaining, 0);

  // Lifetime meetings held (held meetings across all the vendor's requests).
  const meetingsHeldLifetime = (meetingsResp.data ?? []).filter(
    (m) => m.status === "held",
  ).length;

  const detailRow: VendorDetailRow = {
    id: vendor.id as string,
    shortId: `VEN-${(vendor.id as string).slice(-4).toUpperCase()}`,
    name: vendor.name as string,
    emailDomain: vendor.email_domain as string,
    status: statusEnum,
    tier,
    ownerName: owner?.name ?? null,
    ownerEmail: owner?.email ?? null,
    joinedLabel: formatDate(vendor.created_at as string),
    renewsLabel: formatDate(vendor.access_expires_at as string | null),
    cycleAnchorLabel: formatDate(vendor.cycle_started_at as string | null),
    creditsRemaining,
    meetingsHeldLifetime,
  };

  // ── Modules data ─────────────────────────────────────────────────────────

  const users: UserRow[] = (usersResp.data ?? []).map((u) => ({
    id: u.id as string,
    name: u.name as string,
    email: u.email as string,
    role: u.role as "owner" | "member",
    status: u.status as "invited" | "active" | "removed",
    photoUrl: (u.photo_url as string | null) ?? undefined,
  }));

  const requests: RequestSubRow[] = (requestsResp.data ?? []).map((r) => {
    const e = one<{ name: string; title: string; company: string }>(r.executive);
    const a = ageShort(r.created_at as string);
    return {
      id: r.id as string,
      execName: e?.name ?? "—",
      execTitleCompany: execTitleCompany(e),
      status: r.status as RequestSubRow["status"],
      ageLabel: a.label,
      stale: a.days >= 3,
    };
  });
  const pendingRequestCount = requests.filter((r) => r.status === "submitted").length;

  const meetings: MeetingSubRow[] = (meetingsResp.data ?? []).map((m) => {
    const req = one<{ executive: unknown }>(m.request);
    const e = one<{ name: string; title: string; company: string }>(req?.executive);
    const status = m.status as MeetingSubRow["status"];
    const creditLabel =
      status === "confirmed"
        ? `Reserved · ${formatAud(MEETING_FEE_CENTS)}`
        : status === "held"
          ? `Consumed · ${formatAud(MEETING_FEE_CENTS)}`
          : "—";
    return {
      id: m.id as string,
      execName: e?.name ?? "—",
      execTitleCompany: execTitleCompany(e),
      scheduledLabel: formatDate(m.scheduled_at as string | null),
      status,
      creditLabel,
    };
  });

  const invoices: InvoiceSubRow[] = (invoicesResp.data ?? []).map((inv) => ({
    id: inv.id as string,
    xeroInvoiceId: (inv.xero_invoice_id as string | null) ?? null,
    amountLabel: formatAud(inv.amount_cents as number),
    status: inv.status as InvoiceSubRow["status"],
    createdLabel: formatDate(inv.created_at as string),
  }));

  const latestApp = applicationsResp.data?.[0];
  const vetting: VetState = {
    paymentsFlag: payments,
    canApprove: ["signed_up", "call_booked"].includes(statusEnum),
    latestApplication: latestApp
      ? {
          id: latestApp.id as string,
          outcome: latestApp.outcome as "pending" | "approved" | "declined",
          answers: latestApp.answers,
        }
      : null,
  };

  const activity: ActivityRow[] = (activityResp.data ?? []).map((a) => ({
    id: a.id as string,
    action: a.action as string,
    actorType: a.actor_type as ActivityRow["actorType"],
    createdAtLabel: formatDate(a.created_at as string),
  }));

  return (
    <PortalPage
      back={{ href: "/admin/vendors" }}
      breadcrumb={[
        { label: "Home", href: "/admin" },
        { label: "Vendors", href: "/admin/vendors" },
        { label: detailRow.shortId },
      ]}
    >
      <VendorDetailView
        vendor={detailRow}
        users={users}
        requests={requests}
        meetings={meetings}
        invoices={invoices}
        creditLots={creditLots}
        vetting={vetting}
        activity={activity}
        pendingRequestCount={pendingRequestCount}
        photoUploadEnabled={photoUploadEnabled}
      />
    </PortalPage>
  );
}
