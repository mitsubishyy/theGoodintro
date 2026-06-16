import type { SupabaseClient } from "@supabase/supabase-js";
import { bandForMeetingNumber, charityShareCentsForMeetingNumber } from "@thegoodintro/pricing";
import { formatAud } from "@/lib/format";
import { execCharityForPeriod, financialYearWindow, monthWindow } from "@/lib/reporting";

/* Demo executive resolution + live-data loader for the locked exec dashboard
   (design/locked/exec-dashboard, VP1). Real magic-link exec/EA auth is deferred
   (EXECUTIVE_PORTAL_BRIEF); for the staging demo we resolve one seeded executive
   and the staff/admin session reads it under RLS. */

const SEEDED_DEMO_EXEC = "00000000-0000-0000-0000-00000000ec03"; // Priya Raghavan (locked sample)

function one<T>(v: unknown): T | undefined {
  return (Array.isArray(v) ? v[0] : v) as T | undefined;
}

/** The executive whose dashboard the demo shows: the locked sample, else the first active. */
export async function resolveDemoExecutiveId(supabase: SupabaseClient): Promise<string | null> {
  const { data: known } = await supabase
    .from("executive")
    .select("id")
    .eq("id", SEEDED_DEMO_EXEC)
    .is("deleted_at", null)
    .maybeSingle();
  if (known?.id) return known.id as string;

  const { data: first } = await supabase
    .from("executive")
    .select("id")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (first?.id as string) ?? null;
}

export interface IncomingRow {
  id: string;
  name: string;
  role: string | null;
  company: string;
  photoUrl: string | null;
  /** request.proposed_at is not in schema yet, so the locked "Date · duration ·
   *  provider" line degrades to duration + an honest scheduling note. */
  timeLabel: string;
}

export interface UpcomingRow {
  id: string;
  dateLabel: string;
  timeLabel: string;
  name: string;
  role: string | null;
  company: string;
  photoUrl: string | null;
  joinUrl: string | null;
  provider: "Zoom" | "Teams";
  amount: string;
  charityName: string;
  isOverride: boolean;
  standingCharityName: string;
}

export interface ImpactRow {
  id: string;
  datePrefix: string; // mono "02 JUN"
  body: string;
  status: string; // "Confirmed." / "Pending."
  name: string;
  photoUrl: string | null;
}

export interface ExecHomeData {
  exec: {
    id: string;
    name: string;
    firstName: string;
    title: string | null;
    company: string | null;
    email: string;
    photoUrl: string | null;
    timezone: string;
  };
  greeting: string; // "Good morning, Priya." — capital "Good" rendered emerald in the view
  greetingDate: string;
  metrics: {
    incoming: number;
    upcoming: number;
    fyAmount: string;
    fyMeetings: number;
    lifetimeAmount: string;
    lifetimeMeetings: number;
    lifetimeCharities: number;
  };
  standing: {
    charityId: string;
    name: string;
    cause: string | null;
    abn: string | null;
    dgrItem: string | null;
    dgrStatus: string | null;
    logoUrl: string | null;
    sinceLabel: string | null;
  } | null;
  incoming: IncomingRow[];
  upcoming: UpcomingRow[];
  impact: ImpactRow[];
}

const AEST = "Australia/Sydney";

function longDate(d: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-AU", { weekday: "long", day: "numeric", month: "long", timeZone: tz }).format(d);
}
function partOfDay(d: Date, tz: string): string {
  const hour = Number(new Intl.DateTimeFormat("en-AU", { hour: "numeric", hour12: false, timeZone: tz }).format(d));
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}
function shortDateNum(iso: string, tz: string): string {
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", timeZone: tz }).format(new Date(iso));
}
function monoDatePrefix(iso: string, tz: string): string {
  const parts = new Intl.DateTimeFormat("en-AU", { day: "2-digit", month: "short", timeZone: tz }).formatToParts(new Date(iso));
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  const mon = (parts.find((p) => p.type === "month")?.value ?? "").toUpperCase();
  return `${day} ${mon}`;
}
function clockLabel(iso: string, tz: string): string {
  return new Intl.DateTimeFormat("en-AU", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz }).format(new Date(iso)) + " AEST";
}
function providerFromUrl(url: string | null): "Zoom" | "Teams" {
  return url && /teams\.microsoft|teams\.live/.test(url) ? "Teams" : "Zoom";
}
function attendeeTitle(attendee: unknown): string | null {
  const a = attendee as { title?: string } | null;
  return a?.title?.trim() || null;
}

export async function loadExecHome(supabase: SupabaseClient, execId: string, now = new Date()): Promise<ExecHomeData | null> {
  const { data: execRow } = await supabase
    .from("executive")
    .select("id, name, title, company, primary_email, photo_url, timezone, default_charity_id")
    .eq("id", execId)
    .maybeSingle();
  if (!execRow) return null;

  const tz = (execRow.timezone as string) || AEST;
  const defaultCharityId = (execRow.default_charity_id as string) ?? null;
  const fy = financialYearWindow(now);
  const month = monthWindow(now);

  // ── Standing charity + "since" from the open nomination row ────────────────
  let standing: ExecHomeData["standing"] = null;
  if (defaultCharityId) {
    const [{ data: charity }, { data: nom }] = await Promise.all([
      supabase.from("charity").select("id, name, short_name, abn, dgr_status, cause, dgr_item, logo_url").eq("id", defaultCharityId).maybeSingle(),
      supabase
        .from("nomination_history")
        .select("started_at")
        .eq("executive_id", execId)
        .eq("charity_id", defaultCharityId)
        .is("ended_at", null)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    if (charity) {
      standing = {
        charityId: charity.id as string,
        name: charity.name as string,
        cause: (charity.cause as string) ?? null,
        abn: (charity.abn as string) ?? null,
        dgrItem: (charity.dgr_item as string) ?? null,
        dgrStatus: (charity.dgr_status as string) ?? null,
        logoUrl: (charity.logo_url as string) ?? null,
        sinceLabel: nom?.started_at ? shortDateNum(nom.started_at as string, tz) : null,
      };
    }
  }

  // ── Requests for this exec (incoming + the id set for meetings/gifts) ──────
  const { data: reqRows } = await supabase
    .from("request")
    .select("id, status, vendor_id, attendee, meeting_minutes, created_at, vendor:vendor_id(name), requester:requested_by_user_id(name, photo_url)")
    .eq("executive_id", execId)
    .order("created_at", { ascending: true });
  const allReqs = reqRows ?? [];
  const requestIds = allReqs.map((r) => r.id as string);
  const vendorIds = [...new Set(allReqs.map((r) => r.vendor_id as string))];

  // Per-vendor held count → indicative band amount for each request's vendor.
  const heldByVendor = new Map<string, number>();
  if (vendorIds.length) {
    const { data: cycles } = await supabase
      .from("cycle")
      .select("vendor_id, held_meetings_count, started_at")
      .in("vendor_id", vendorIds)
      .order("started_at", { ascending: false });
    for (const c of cycles ?? []) {
      if (!heldByVendor.has(c.vendor_id as string)) heldByVendor.set(c.vendor_id as string, (c.held_meetings_count as number) ?? 0);
    }
  }
  const indicativeForVendor = (vendorId: string): string =>
    formatAud(bandForMeetingNumber((heldByVendor.get(vendorId) ?? 0) + 1).rateCents);

  const incoming: IncomingRow[] = allReqs
    .filter((r) => r.status === "submitted")
    .map((r) => {
      const v = one<{ name: string }>(r.vendor);
      const u = one<{ name: string; photo_url: string | null }>(r.requester);
      return {
        id: r.id as string,
        name: u?.name ?? v?.name ?? "A vendor",
        role: attendeeTitle(r.attendee),
        company: v?.name ?? "",
        photoUrl: u?.photo_url ?? null,
        timeLabel: `${r.meeting_minutes ?? 45} min · time to be confirmed`,
      };
    });

  // ── Meetings: upcoming (confirmed) + gifts (held) ─────────────────────────
  let upcoming: UpcomingRow[] = [];
  let impact: ImpactRow[] = [];
  let upcomingMonthCount = 0;
  let fyHeldCount = 0;

  if (requestIds.length) {
    const reqMeta = new Map(
      allReqs.map((r) => {
        const v = one<{ name: string }>(r.vendor);
        const u = one<{ name: string; photo_url: string | null }>(r.requester);
        return [
          r.id as string,
          { vendorId: r.vendor_id as string, vendor: v?.name ?? "", person: u?.name ?? "", photo: u?.photo_url ?? null, role: attendeeTitle(r.attendee) },
        ];
      }),
    );

    const { data: mtgRows } = await supabase
      .from("meeting")
      .select("id, request_id, charity_id, scheduled_at, join_url, status, charity:charity_id(name)")
      .in("request_id", requestIds);
    const meetings = mtgRows ?? [];

    upcoming = meetings
      .filter((m) => m.status === "confirmed" && m.scheduled_at)
      .sort((a, b) => (a.scheduled_at as string).localeCompare(b.scheduled_at as string))
      .map((m) => {
        const meta = reqMeta.get(m.request_id as string)!;
        const c = one<{ name: string }>(m.charity);
        const charityName = c?.name ?? standing?.name ?? "your charity";
        return {
          id: m.id as string,
          dateLabel: shortDateNum(m.scheduled_at as string, tz),
          timeLabel: clockLabel(m.scheduled_at as string, tz),
          name: meta.person || meta.vendor,
          role: meta.role,
          company: meta.vendor,
          photoUrl: meta.photo,
          joinUrl: (m.join_url as string) ?? null,
          provider: providerFromUrl(m.join_url as string | null),
          amount: indicativeForVendor(meta.vendorId),
          charityName,
          isOverride: Boolean(m.charity_id && standing && m.charity_id !== standing.charityId),
          standingCharityName: standing?.name ?? "",
        };
      });

    upcomingMonthCount = meetings.filter(
      (m) => m.status === "confirmed" && m.scheduled_at && (m.scheduled_at as string) >= month.from && (m.scheduled_at as string) < month.to,
    ).length;

    // Recent impact: gift_records on this exec's held meetings.
    const meetingIds = meetings.map((m) => m.id as string);
    const mtgToReq = new Map(meetings.map((m) => [m.id as string, m.request_id as string]));
    if (meetingIds.length) {
      const { data: gifts } = await supabase
        .from("gift_record")
        .select("meeting_id, charity_amount_cents, status, sat_date, created_at, charity:charity_id(name)")
        .in("meeting_id", meetingIds)
        .neq("status", "voided")
        .order("sat_date", { ascending: false })
        .limit(3);
      impact = (gifts ?? []).map((g) => {
        const meta = reqMeta.get(mtgToReq.get(g.meeting_id as string) ?? "");
        const c = one<{ name: string }>(g.charity);
        const iso = (g.sat_date as string) ?? (g.created_at as string);
        const who = [meta?.person, meta?.vendor].filter(Boolean).join(", ") || "A meeting";
        return {
          id: g.meeting_id as string,
          datePrefix: monoDatePrefix(iso, tz),
          body: `${who} sent ${formatAud(g.charity_amount_cents as number)} to ${c?.name ?? "charity"}.`,
          status: g.status === "paid" ? "Confirmed." : "Pending.",
          name: meta?.person || meta?.vendor || "Meeting",
          photoUrl: meta?.photo ?? null,
        };
      });

      const { count: fyHeld } = await supabase
        .from("gift_record")
        .select("meeting_id", { count: "exact", head: true })
        .in("meeting_id", meetingIds)
        .neq("status", "voided")
        .gte("sat_date", fy.from)
        .lt("sat_date", fy.to);
      fyHeldCount = fyHeld ?? 0;
    }
  }

  // ── Money + lifetime counts through the reporting layer ────────────────────
  const [fyCharity, lifetimeCharity] = await Promise.all([
    execCharityForPeriod(supabase, execId, fy),
    execCharityForPeriod(supabase, execId, {}),
  ]);

  let lifetimeMeetings = 0;
  let lifetimeCharities = 0;
  if (requestIds.length) {
    const { data: allMtg } = await supabase.from("meeting").select("id").in("request_id", requestIds);
    const ids = (allMtg ?? []).map((m) => m.id as string);
    if (ids.length) {
      const { data: giftAll } = await supabase
        .from("gift_record")
        .select("charity_id")
        .in("meeting_id", ids)
        .neq("status", "voided");
      lifetimeMeetings = (giftAll ?? []).length;
      lifetimeCharities = new Set((giftAll ?? []).map((g) => g.charity_id as string)).size;
    }
  }

  const { count: incomingCount } = await supabase
    .from("request")
    .select("id", { count: "exact", head: true })
    .eq("executive_id", execId)
    .eq("status", "submitted");

  const name = (execRow.name as string) ?? "there";
  return {
    exec: {
      id: execId,
      name,
      firstName: name.split(" ")[0],
      title: (execRow.title as string) ?? null,
      company: (execRow.company as string) ?? null,
      email: (execRow.primary_email as string) ?? "",
      photoUrl: (execRow.photo_url as string) ?? null,
      timezone: tz,
    },
    greeting: `Good ${partOfDay(now, tz)}, ${name.split(" ")[0]}.`,
    greetingDate: longDate(now, tz),
    metrics: {
      incoming: incomingCount ?? incoming.length,
      upcoming: upcomingMonthCount,
      fyAmount: formatAud(fyCharity.totalCents),
      fyMeetings: fyHeldCount,
      lifetimeAmount: formatAud(lifetimeCharity.totalCents),
      lifetimeMeetings,
      lifetimeCharities,
    },
    standing,
    incoming,
    upcoming,
    impact,
  };
}

// Indicative band-1 share, used where a vendor context is not in hand.
export function indicativeFloor(): string {
  return formatAud(charityShareCentsForMeetingNumber(1));
}

/* ─────────────────────────────────────────────────────────────────────────
   Charity DETAIL content (migration 0021) for the locked charity detail modal
   (exec-dashboard VP4; re-rendered on My charity VP3 + opened from Impact's
   "Learn about" footer). Read-only. Sections whose curated content is empty
   render nothing (lock: "section hidden if charity has no curated quote", and
   the same for purpose / programmes / stories). The "what your gift funds"
   figure is the band-1 indicative charity share, rendered "approximately $X"
   per the exec money rule (never a flat figure to an exec pre-Held).
   ───────────────────────────────────────────────────────────────────────── */

export interface CharityProgramme {
  label: string;
  body: string;
}
export interface CharityStory {
  publishedAt: string | null;
  headline: string;
  body: string;
  url: string | null;
}
export interface CharityContent {
  id: string;
  name: string;
  cause: string | null;
  abn: string | null;
  dgrItem: string | null;
  dgrEndorsed: boolean;
  logoUrl: string | null;
  heroImageUrl: string | null;
  purpose: string | null;
  programmes: CharityProgramme[];
  featuredQuote: string | null;
  featuredQuoteAttribution: string | null;
  stories: CharityStory[];
  /** Band-1 indicative charity share, formatted; rendered "approximately $X". */
  indicativeAmount: string;
}

function asProgrammes(v: unknown): CharityProgramme[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((p) => ({ label: String((p as { label?: unknown }).label ?? "").trim(), body: String((p as { body?: unknown }).body ?? "").trim() }))
    .filter((p) => p.label || p.body);
}
function asStories(v: unknown): CharityStory[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((s) => {
      const o = s as { published_at?: unknown; headline?: unknown; body?: unknown; url?: unknown };
      return {
        publishedAt: o.published_at ? String(o.published_at) : null,
        headline: String(o.headline ?? "").trim(),
        body: String(o.body ?? "").trim(),
        url: o.url ? String(o.url) : null,
      };
    })
    .filter((s) => s.headline)
    .sort((a, b) => String(b.publishedAt ?? "").localeCompare(String(a.publishedAt ?? "")))
    .slice(0, 2);
}

export interface CharityListItem {
  id: string;
  name: string;
  shortName: string | null;
  cause: string | null;
  logoUrl: string | null;
}

/* ─────────────────────────────────────────────────────────────────────────
   Exec My charity — the view-only home of the standing nomination
   (design/locked/exec-my-charity, LOCKED 2026-06-11; route /exec/my-charity).
   Full editorial reading surface. The page hosts the picker + detail modals but
   never changes the charity itself (the picker does). Numbers reuse the Impact
   by-charity figures for the standing charity. nomination_history (0019) is the
   "since" + history source.
   ───────────────────────────────────────────────────────────────────────── */

export interface NominationRow {
  charityId: string;
  name: string;
  rangeLabel: string;
  isCurrent: boolean;
}
export interface ExecMyCharityData {
  exec: { name: string; title: string | null; company: string | null; email: string; photoUrl: string | null };
  standing: { charityId: string; name: string; cause: string | null; abn: string | null; dgrItem: string | null; dgrEndorsed: boolean; logoUrl: string | null; sinceLabel: string | null } | null;
  stats: { toStanding: string; meetingsHere: number; charitiesLifetime: number };
  history: NominationRow[];
}

function fullDateLabel(iso: string, tz: string): string {
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "long", year: "numeric", timeZone: tz }).format(new Date(iso));
}

export async function loadExecMyCharity(supabase: SupabaseClient, execId: string): Promise<ExecMyCharityData | null> {
  const { data: execRow } = await supabase
    .from("executive")
    .select("id, name, title, company, primary_email, photo_url, timezone, default_charity_id")
    .eq("id", execId)
    .maybeSingle();
  if (!execRow) return null;

  const tz = (execRow.timezone as string) || AEST;
  const defaultCharityId = (execRow.default_charity_id as string) ?? null;

  // Hero: the standing charity's content + the "since" date (open nomination row).
  let standing: ExecMyCharityData["standing"] = null;
  if (defaultCharityId) {
    const [content, { data: nom }] = await Promise.all([
      loadCharityContent(supabase, defaultCharityId),
      supabase.from("nomination_history").select("started_at").eq("executive_id", execId).eq("charity_id", defaultCharityId).is("ended_at", null).order("started_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    if (content) {
      standing = {
        charityId: content.id,
        name: content.name,
        cause: content.cause,
        abn: content.abn,
        dgrItem: content.dgrItem,
        dgrEndorsed: content.dgrEndorsed,
        logoUrl: content.logoUrl,
        sinceLabel: nom?.started_at ? fullDateLabel(nom.started_at as string, tz) : null,
      };
    }
  }

  // Mini-strip: gifts to the standing charity + lifetime distinct charities.
  let toStandingCents = 0;
  let meetingsHere = 0;
  let charitiesLifetime = 0;
  const { data: reqRows } = await supabase.from("request").select("id").eq("executive_id", execId);
  const requestIds = (reqRows ?? []).map((r) => r.id as string);
  if (requestIds.length) {
    const { data: mtgs } = await supabase.from("meeting").select("id").in("request_id", requestIds);
    const meetingIds = (mtgs ?? []).map((m) => m.id as string);
    if (meetingIds.length) {
      const { data: gifts } = await supabase.from("gift_record").select("charity_id, charity_amount_cents").in("meeting_id", meetingIds).neq("status", "voided");
      const charities = new Set<string>();
      for (const g of gifts ?? []) {
        charities.add(g.charity_id as string);
        if (defaultCharityId && g.charity_id === defaultCharityId) {
          toStandingCents += g.charity_amount_cents as number;
          meetingsHere += 1;
        }
      }
      charitiesLifetime = charities.size;
    }
  }

  // Nomination history (newest first; current row is the open one).
  const { data: histRows } = await supabase
    .from("nomination_history")
    .select("charity_id, started_at, ended_at, charity:charity_id(name)")
    .eq("executive_id", execId)
    .order("started_at", { ascending: false });
  const history: NominationRow[] = (histRows ?? []).map((h) => {
    const c = one<{ name: string }>(h.charity);
    const start = fullDateLabel(h.started_at as string, tz);
    const end = h.ended_at ? fullDateLabel(h.ended_at as string, tz) : "present";
    return { charityId: h.charity_id as string, name: c?.name ?? "A charity", rangeLabel: `${start} to ${end}`, isCurrent: !h.ended_at };
  });

  return {
    exec: execShell(execRow),
    standing,
    stats: { toStanding: formatAud(toStandingCents), meetingsHere, charitiesLifetime },
    history,
  };
}

/** The endorsed charity set for the picker modal (alphabetical, stable). */
export async function loadCharityList(supabase: SupabaseClient): Promise<CharityListItem[]> {
  const { data } = await supabase
    .from("charity")
    .select("id, name, short_name, cause, logo_url")
    .eq("dgr_status", "endorsed")
    .is("deleted_at", null)
    .order("name", { ascending: true });
  return (data ?? []).map((c) => ({
    id: c.id as string,
    name: c.name as string,
    shortName: (c.short_name as string) ?? null,
    cause: (c.cause as string) ?? null,
    logoUrl: (c.logo_url as string) ?? null,
  }));
}

export async function loadCharityContent(supabase: SupabaseClient, charityId: string): Promise<CharityContent | null> {
  const { data: c } = await supabase
    .from("charity")
    .select("id, name, cause, abn, dgr_item, dgr_status, logo_url, hero_image_url, purpose, programmes, featured_quote, featured_quote_attribution, stories")
    .eq("id", charityId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!c) return null;
  return {
    id: c.id as string,
    name: c.name as string,
    cause: (c.cause as string) ?? null,
    abn: (c.abn as string) ?? null,
    dgrItem: (c.dgr_item as string) ?? null,
    dgrEndorsed: c.dgr_status === "endorsed",
    logoUrl: (c.logo_url as string) ?? null,
    heroImageUrl: (c.hero_image_url as string) ?? null,
    purpose: (c.purpose as string) ?? null,
    programmes: asProgrammes(c.programmes),
    featuredQuote: (c.featured_quote as string) ?? null,
    featuredQuoteAttribution: (c.featured_quote_attribution as string) ?? null,
    stories: asStories(c.stories),
    indicativeAmount: indicativeFloor(),
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   Exec Incoming Requests — the all-pending batch review surface
   (design/locked/exec-incoming-requests, LOCKED 2026-06-09; route /exec/requests).
   The locked twin of the request email (design/locked/exec-request-email): the
   same request rendered as a portal card. Read surface only — the in-portal
   accept/decline/forward backend is the consent-gated Phase-2 state-machine work
   (act_on_request_token is token-bound; the executive-actor + logged-in consent
   model is deliberately a later migration, see 0011).

   Honest degrades for columns not in schema yet (never drop a widget):
   - request.proposed_at / conference_provider → "N min · time to be confirmed"
   - vendor_user.title / linkedin_url → role from request.attendee only; no LinkedIn line
   - vendor.abn / founder_review / linkedin_verified / trade_references → a single
     honest "Founder reviewed" stamp derived from vendor.status, detail line pending
   - charity.logo_url → initials fallback (same as the dashboard Direction Card)
   ───────────────────────────────────────────────────────────────────────── */

export interface RequestCardData {
  id: string;
  name: string;
  role: string | null;
  company: string;
  photoUrl: string | null;
  credibility: string | null;
  /** vendor_user.linkedin_url is not in schema yet → null degrades the LinkedIn line away. */
  linkedinUrl: string | null;
  requesterFirst: string;
  /** "Friday, 6 June" from request.created_at (no submitted_at column); rendered "Submitted {x}." */
  submittedLabel: string | null;
  /** request.meeting_minutes, e.g. "30 min". proposed_at/conference_provider not in
   *  schema, so the view renders the time itself as an honest "To be confirmed". */
  durationLabel: string;
  /** Derived from vendor.status (no granular verification columns yet). */
  founderReviewed: boolean;
  q1Head: string | null;
  q1: string;
  q2Head: string | null;
  q2: string;
  /** Indicative band amount, formatted; ALWAYS rendered "approximately $N" to an exec. */
  amount: string;
  charityName: string;
  /** charity.logo_url not in schema yet → null falls back to initials. */
  charityLogoUrl: string | null;
}

export interface ExecRequestsData {
  exec: { name: string; title: string | null; company: string | null; email: string; photoUrl: string | null };
  /** EA first name for the locked "Forward to {EA} (EA)" action; null hides it (named EA or nothing). */
  eaFirstName: string | null;
  cards: RequestCardData[];
  count: number;
  /** Word form for < 10, numeral for >= 10 (locked hero "Four requests"). */
  countWord: string;
}

const NUM_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
function countWord(n: number): string {
  return n >= 0 && n < 10 ? NUM_WORDS[n]! : String(n);
}

// A vendor that can submit a request has passed founder vetting (A2/A3); these
// statuses are the honest basis for the "Founder reviewed" stamp.
const FOUNDER_REVIEWED_STATUSES = new Set(["approved", "paid", "active", "dormant", "churned"]);

/* ─────────────────────────────────────────────────────────────────────────
   Exec Meetings List — list + calendar + drawer working surface
   (design/locked/exec-meetings-list, LOCKED 2026-06-10; route /exec/meetings).
   Read surface; the drawer is the detail (no standalone /exec/meetings/[id]).
   "Request reschedule" / calendar OAuth are deferred actions.

   Money semantics (CALCULATIONS.md, never computed in the page):
   - HELD meetings show the EXACT frozen gift from gift_record.charity_amount_cents.
   - CONFIRMED (pre-Held) meetings show a PROJECTED "approximately $N" from
     bandForMeetingNumber(held + 1).rateCents — the same money-rule resolution as
     the request email / Incoming Requests ("approximately $X anywhere pre-Held").

   Honest degrades (columns not in schema; never drop a widget):
   - meeting.accepted_at → the meta line drops the "Accepted [date]" clause
   - meeting.cancelled_at / cancelled_by → cancelled rows show "Cancelled" only
   - meeting duration → request.meeting_minutes; provider → inferred from join_url
   - vendor_user.linkedin_url → no LinkedIn line in the drawer
   - charity.logo_url → initials fallback
   ───────────────────────────────────────────────────────────────────────── */

export type MeetingStatusDisplay = "confirmed" | "held" | "cancelled";

export interface MeetingDrawerData {
  id: string;
  statusDisplay: MeetingStatusDisplay;
  eyebrow: string;
  name: string;
  role: string | null;
  company: string;
  photoUrl: string | null;
  credibility: string | null;
  linkedinUrl: string | null;
  whenLong: string | null;
  durationProvider: string;
  /** meeting.accepted_at not in schema → null hides the historical accepted line. */
  acceptedLine: string | null;
  giftAmount: string;
  /** true for confirmed (projected) → rendered "approximately $N"; false for held (frozen, exact). */
  giftApprox: boolean;
  charityName: string;
  charityLogoUrl: string | null;
  isOverride: boolean;
  standingCharityName: string;
  giftHelper: string;
  q1Head: string | null;
  q1: string;
  q2Head: string | null;
  q2: string;
  joinUrl: string | null;
  provider: "Zoom" | "Teams";
}

export interface MeetingListRow {
  id: string;
  name: string;
  role: string | null;
  company: string;
  photoUrl: string | null;
  statusDisplay: MeetingStatusDisplay;
  dateLabel: string;
  timeLabel: string | null;
  durationLabel: string;
  provider: "Zoom" | "Teams" | null;
  metaLine: string;
  /** ISO for client-side sort + calendar bucketing; null when unscheduled. */
  scheduledIso: string | null;
  drawer: MeetingDrawerData;
}

export interface ExecMeetingsData {
  exec: { name: string; title: string | null; company: string | null; email: string; photoUrl: string | null };
  /** Exec timezone, for client-side calendar bucketing. */
  tz: string;
  stats: { heldFy: number; comingUp: number; lifetime: number };
  calendar: { connected: boolean; provider: string | null; lastSyncedLabel: string | null };
  upcoming: MeetingListRow[];
  past: MeetingListRow[];
  cancelled: MeetingListRow[];
  pastTotal: number;
  cancelledTotal: number;
}

function shortDow(iso: string, tz: string): string {
  // "Tue, 17 Jun"
  return new Intl.DateTimeFormat("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: tz }).format(new Date(iso));
}
function longDateTime(iso: string, tz: string): string {
  // "Tuesday, 17 June · 10:00 AEST"
  return `${longDate(new Date(iso), tz)} · ${clockLabel(iso, tz)}`;
}

export async function loadExecMeetings(supabase: SupabaseClient, execId: string, now = new Date()): Promise<ExecMeetingsData | null> {
  const { data: execRow } = await supabase
    .from("executive")
    .select("id, name, title, company, primary_email, photo_url, timezone, default_charity_id, calendar_provider, calendar_connected_at, calendar_last_synced_at")
    .eq("id", execId)
    .maybeSingle();
  if (!execRow) return null;

  const tz = (execRow.timezone as string) || AEST;
  const defaultCharityId = (execRow.default_charity_id as string) ?? null;
  const nowIso = now.toISOString();
  const fy = financialYearWindow(now);

  // Standing charity name (for override comparison + drawer "standing" line).
  let standingName = "your charity";
  if (defaultCharityId) {
    const { data: c } = await supabase.from("charity").select("name").eq("id", defaultCharityId).maybeSingle();
    if (c?.name) standingName = c.name as string;
  }

  // Requests for this exec → meeting identity + pitch context + per-vendor band.
  const { data: reqRows } = await supabase
    .from("request")
    .select(
      "id, vendor_id, attendee, meeting_minutes, q1_head, q1_what, q2_head, q2_why, vendor:vendor_id(name), requester:requested_by_user_id(name, photo_url, bio_one_liner)",
    )
    .eq("executive_id", execId);
  const reqs = reqRows ?? [];
  const requestIds = reqs.map((r) => r.id as string);
  if (requestIds.length === 0) {
    return emptyMeetings(execRow, tz, execRow.calendar_connected_at as string | null, execRow.calendar_provider as string | null, execRow.calendar_last_synced_at as string | null);
  }

  // Per-vendor held count → projected band amount for confirmed meetings.
  const vendorIds = [...new Set(reqs.map((r) => r.vendor_id as string))];
  const heldByVendor = new Map<string, number>();
  if (vendorIds.length) {
    const { data: cycles } = await supabase
      .from("cycle")
      .select("vendor_id, held_meetings_count, started_at")
      .in("vendor_id", vendorIds)
      .order("started_at", { ascending: false });
    for (const c of cycles ?? []) {
      if (!heldByVendor.has(c.vendor_id as string)) heldByVendor.set(c.vendor_id as string, (c.held_meetings_count as number) ?? 0);
    }
  }
  const projected = (vendorId: string): string => formatAud(bandForMeetingNumber((heldByVendor.get(vendorId) ?? 0) + 1).rateCents);

  const reqMeta = new Map(
    reqs.map((r) => {
      const v = one<{ name: string }>(r.vendor);
      const u = one<{ name: string; photo_url: string | null; bio_one_liner: string | null }>(r.requester);
      const attendee = r.attendee as { name?: string; title?: string } | null;
      const onBehalf = Boolean(attendee?.name?.trim());
      return [
        r.id as string,
        {
          vendorId: r.vendor_id as string,
          name: onBehalf ? attendee!.name!.trim() : u?.name ?? v?.name ?? "A vendor",
          role: attendeeTitle(r.attendee),
          company: v?.name ?? "",
          photoUrl: onBehalf ? null : u?.photo_url ?? null,
          credibility: onBehalf ? null : u?.bio_one_liner ?? null,
          minutes: (r.meeting_minutes as number) ?? 45,
          q1Head: (r.q1_head as string) ?? null,
          q1: (r.q1_what as string) ?? "",
          q2Head: (r.q2_head as string) ?? null,
          q2: (r.q2_why as string) ?? "",
        },
      ];
    }),
  );

  // All meetings for this exec's requests.
  const { data: mtgRows } = await supabase
    .from("meeting")
    .select("id, request_id, charity_id, scheduled_at, join_url, status, charity:charity_id(name, short_name)")
    .in("request_id", requestIds);
  const meetings = mtgRows ?? [];
  const meetingIds = meetings.map((m) => m.id as string);

  // Frozen gift snapshots for held meetings.
  const giftByMeeting = new Map<string, { amountCents: number; charityId: string | null; charityName: string; charityShort: string; satIso: string | null }>();
  if (meetingIds.length) {
    const { data: gifts } = await supabase
      .from("gift_record")
      .select("meeting_id, charity_amount_cents, charity_id, sat_date, status, charity:charity_id(name, short_name)")
      .in("meeting_id", meetingIds)
      .neq("status", "voided");
    for (const g of gifts ?? []) {
      const c = one<{ name: string; short_name: string | null }>(g.charity);
      giftByMeeting.set(g.meeting_id as string, {
        amountCents: g.charity_amount_cents as number,
        charityId: (g.charity_id as string) ?? null,
        charityName: c?.name ?? standingName,
        charityShort: c?.short_name ?? c?.name ?? standingName,
        satIso: (g.sat_date as string) ?? null,
      });
    }
  }

  const buildRow = (m: (typeof meetings)[number]): MeetingListRow => {
    const meta = reqMeta.get(m.request_id as string)!;
    const status = m.status as string;
    const statusDisplay: MeetingStatusDisplay = status === "held" ? "held" : status === "cancelled" || status === "reversed" || status === "no_show" ? "cancelled" : "confirmed";
    const scheduledIso = (m.scheduled_at as string) ?? null;
    const provider: "Zoom" | "Teams" | null = m.join_url ? providerFromUrl(m.join_url as string) : null;
    const mc = one<{ name: string; short_name: string | null }>(m.charity);
    const gift = giftByMeeting.get(m.id as string);

    // Charity for this meeting: held → gift snapshot; else meeting.charity_id → standing.
    const charityName = gift?.charityName ?? mc?.name ?? standingName;
    const charityShort = gift?.charityShort ?? mc?.short_name ?? mc?.name ?? standingName;
    const overrideCharityId = gift?.charityId ?? (m.charity_id as string) ?? null;
    const isOverride = Boolean(defaultCharityId && overrideCharityId && overrideCharityId !== defaultCharityId);

    // Gift figure: held = exact frozen; confirmed = projected "approximately".
    const giftApprox = statusDisplay !== "held";
    const giftAmount = gift ? formatAud(gift.amountCents) : projected(meta.vendorId);

    let metaLine: string;
    if (statusDisplay === "held") metaLine = `Gift went to ${charityShort}${isOverride ? " (overridden)" : ""}`;
    else if (statusDisplay === "cancelled") metaLine = "Cancelled";
    else metaLine = `Gift will go to ${charityShort}`;

    const eyebrow = statusDisplay === "held" ? "Past meeting · Held" : statusDisplay === "cancelled" ? "Cancelled meeting" : "Confirmed meeting";
    const giftHelper =
      statusDisplay === "held"
        ? "Gift snapshot taken at Held. No longer editable."
        : "Redirectable any time before the meeting begins.";

    return {
      id: m.id as string,
      name: meta.name,
      role: meta.role,
      company: meta.company,
      photoUrl: meta.photoUrl,
      statusDisplay,
      dateLabel: scheduledIso ? shortDow(scheduledIso, tz) : "To be confirmed",
      timeLabel: scheduledIso ? clockLabel(scheduledIso, tz) : null,
      durationLabel: `${meta.minutes} min`,
      provider,
      metaLine,
      scheduledIso,
      drawer: {
        id: m.id as string,
        statusDisplay,
        eyebrow,
        name: meta.name,
        role: meta.role,
        company: meta.company,
        photoUrl: meta.photoUrl,
        credibility: meta.credibility,
        linkedinUrl: null,
        whenLong: scheduledIso ? longDateTime(scheduledIso, tz) : null,
        durationProvider: `${meta.minutes} min${provider ? ` · ${provider}` : ""}`,
        acceptedLine: null,
        giftAmount,
        giftApprox,
        charityName,
        charityLogoUrl: null,
        isOverride,
        standingCharityName: standingName,
        giftHelper,
        q1Head: meta.q1Head,
        q1: meta.q1,
        q2Head: meta.q2Head,
        q2: meta.q2,
        joinUrl: (m.join_url as string) ?? null,
        provider: provider ?? "Zoom",
      },
    };
  };

  const upcoming = meetings
    .filter((m) => m.status === "confirmed" && m.scheduled_at && (m.scheduled_at as string) >= nowIso)
    .sort((a, b) => (a.scheduled_at as string).localeCompare(b.scheduled_at as string))
    .map(buildRow);

  const past = meetings
    .filter((m) => m.status === "held")
    .sort((a, b) => String(b.scheduled_at ?? "").localeCompare(String(a.scheduled_at ?? "")))
    .map(buildRow);

  const cancelled = meetings
    .filter((m) => m.status === "cancelled" || m.status === "reversed" || m.status === "no_show")
    .sort((a, b) => String(b.scheduled_at ?? "").localeCompare(String(a.scheduled_at ?? "")))
    .map(buildRow);

  // Stats: held this FY (gift sat_date in FY), coming up (confirmed future), lifetime held.
  let heldFy = 0;
  for (const g of giftByMeeting.values()) {
    if (g.satIso && g.satIso >= fy.from && g.satIso < fy.to) heldFy += 1;
  }
  const stats = { heldFy, comingUp: upcoming.length, lifetime: past.length };

  return {
    exec: {
      name: (execRow.name as string) ?? "there",
      title: (execRow.title as string) ?? null,
      company: (execRow.company as string) ?? null,
      email: (execRow.primary_email as string) ?? "",
      photoUrl: (execRow.photo_url as string) ?? null,
    },
    tz,
    stats,
    calendar: calendarState(execRow.calendar_connected_at as string | null, execRow.calendar_provider as string | null, execRow.calendar_last_synced_at as string | null, tz),
    upcoming,
    past,
    cancelled,
    pastTotal: past.length,
    cancelledTotal: cancelled.length,
  };
}

function calendarState(connectedAt: string | null, provider: string | null, lastSynced: string | null, tz: string): ExecMeetingsData["calendar"] {
  const connected = Boolean(connectedAt);
  return {
    connected,
    provider: connected ? provider ?? null : null,
    lastSyncedLabel: connected && lastSynced ? shortDateNum(lastSynced, tz) : null,
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   Exec Impact List — the cumulative giving surface
   (design/locked/exec-impact-list, LOCKED 2026-06-11; route /exec/impact).
   Reuses the Meetings patterns (three-stat header, collapsible cards, drawer)
   plus a By-charity view and a gift drawer with a LinkedIn share. Read surface.

   Money (HARD, CALCULATIONS.md): every figure is frozen-at-Held, read from
   gift_record.charity_amount_cents / lib/reporting; never recomputed at render.

   Honest degrades: charity.cause (parked charity-content schema) → cause line
   omitted; gift_record.released_at not in schema → sat_date (the held date);
   charity.logo_url → initials; "Learn about charity" opens the same deferred
   charity-detail placeholder the dashboard uses.
   ───────────────────────────────────────────────────────────────────────── */

export interface GiftDrawerData {
  id: string;
  name: string;
  role: string | null;
  company: string;
  photoUrl: string | null;
  credibility: string | null;
  linkedinUrl: string | null;
  whenLong: string | null;
  durationProvider: string;
  releasedLine: string | null;
  amount: string;
  charityName: string;
  charityId: string | null;
  giftStatusLine: string;
  q1Head: string | null;
  q1: string;
  q2Head: string | null;
  q2: string;
  /** Pre-filled LinkedIn share copy (parked for Issy to finalize). */
  shareText: string;
}

export interface GiftRow {
  id: string;
  name: string;
  role: string | null;
  company: string;
  photoUrl: string | null;
  heldDateLabel: string;
  amount: string;
  /** For the "Largest amount first" sort. */
  amountCents: number;
  charityName: string;
  charityShort: string;
  charityId: string | null;
  isOverride: boolean;
  satIso: string | null;
  drawer: GiftDrawerData;
}

export interface CharityGroup {
  charityId: string;
  name: string;
  short: string;
  amount: string;
  meetings: number;
  isStanding: boolean;
  gifts: GiftRow[];
}

export interface ExecImpactData {
  exec: { name: string; title: string | null; company: string | null; email: string; photoUrl: string | null };
  tz: string;
  stats: { fyAmount: string; fyMeetings: number; lifetimeAmount: string };
  thisFy: GiftRow[];
  previous: GiftRow[];
  thisFyTotalLabel: string;
  previousTotalLabel: string;
  byCharity: CharityGroup[];
  standingCharityName: string;
}

export async function loadExecImpact(supabase: SupabaseClient, execId: string, now = new Date()): Promise<ExecImpactData | null> {
  const { data: execRow } = await supabase
    .from("executive")
    .select("id, name, title, company, primary_email, photo_url, timezone, default_charity_id")
    .eq("id", execId)
    .maybeSingle();
  if (!execRow) return null;

  const tz = (execRow.timezone as string) || AEST;
  const defaultCharityId = (execRow.default_charity_id as string) ?? null;
  const fy = financialYearWindow(now);

  let standingName = "your charity";
  if (defaultCharityId) {
    const { data: c } = await supabase.from("charity").select("name").eq("id", defaultCharityId).maybeSingle();
    if (c?.name) standingName = c.name as string;
  }

  // Requests → meeting/vendor/pitch context.
  const { data: reqRows } = await supabase
    .from("request")
    .select("id, vendor_id, attendee, meeting_minutes, q1_head, q1_what, q2_head, q2_why, vendor:vendor_id(name), requester:requested_by_user_id(name, photo_url, bio_one_liner)")
    .eq("executive_id", execId);
  const reqs = reqRows ?? [];
  const requestIds = reqs.map((r) => r.id as string);

  const [fyCharity, lifetimeCharity] = await Promise.all([execCharityForPeriod(supabase, execId, fy), execCharityForPeriod(supabase, execId, {})]);
  const baseStats = { fyAmount: formatAud(fyCharity.totalCents), lifetimeAmount: formatAud(lifetimeCharity.totalCents) };

  if (requestIds.length === 0) {
    return {
      exec: execShell(execRow),
      tz,
      stats: { ...baseStats, fyMeetings: 0 },
      thisFy: [],
      previous: [],
      thisFyTotalLabel: `${baseStats.fyAmount} to charity`,
      previousTotalLabel: "$0 to charity",
      byCharity: [],
      standingCharityName: standingName,
    };
  }

  const reqMeta = new Map(
    reqs.map((r) => {
      const v = one<{ name: string }>(r.vendor);
      const u = one<{ name: string; photo_url: string | null; bio_one_liner: string | null }>(r.requester);
      const attendee = r.attendee as { name?: string; title?: string } | null;
      const onBehalf = Boolean(attendee?.name?.trim());
      return [
        r.id as string,
        {
          name: onBehalf ? attendee!.name!.trim() : u?.name ?? v?.name ?? "A vendor",
          role: attendeeTitle(r.attendee),
          company: v?.name ?? "",
          photoUrl: onBehalf ? null : u?.photo_url ?? null,
          credibility: onBehalf ? null : u?.bio_one_liner ?? null,
          minutes: (r.meeting_minutes as number) ?? 45,
          q1Head: (r.q1_head as string) ?? null,
          q1: (r.q1_what as string) ?? "",
          q2Head: (r.q2_head as string) ?? null,
          q2: (r.q2_why as string) ?? "",
        },
      ];
    }),
  );

  // Meetings (for when/provider) keyed by id, and their held gift records.
  const { data: mtgRows } = await supabase.from("meeting").select("id, request_id, scheduled_at, join_url").in("request_id", requestIds);
  const meetings = mtgRows ?? [];
  const mtgById = new Map(meetings.map((m) => [m.id as string, m]));
  const meetingIds = meetings.map((m) => m.id as string);
  if (meetingIds.length === 0) {
    return {
      exec: execShell(execRow),
      tz,
      stats: { ...baseStats, fyMeetings: 0 },
      thisFy: [],
      previous: [],
      thisFyTotalLabel: `${baseStats.fyAmount} to charity`,
      previousTotalLabel: "$0 to charity",
      byCharity: [],
      standingCharityName: standingName,
    };
  }

  const { data: gifts } = await supabase
    .from("gift_record")
    .select("meeting_id, charity_amount_cents, charity_id, sat_date, status, charity:charity_id(name, short_name)")
    .in("meeting_id", meetingIds)
    .neq("status", "voided")
    .order("sat_date", { ascending: false });

  const rows: GiftRow[] = (gifts ?? []).map((g) => {
    const m = mtgById.get(g.meeting_id as string);
    const meta = m ? reqMeta.get(m.request_id as string) : undefined;
    const c = one<{ name: string; short_name: string | null }>(g.charity);
    const charityName = c?.name ?? standingName;
    const charityShort = c?.short_name ?? c?.name ?? standingName;
    const charityId = (g.charity_id as string) ?? null;
    const isOverride = Boolean(defaultCharityId && charityId && charityId !== defaultCharityId);
    const amount = formatAud(g.charity_amount_cents as number);
    const satIso = (g.sat_date as string) ?? null;
    const name = meta?.name ?? "A meeting";
    const scheduledIso = (m?.scheduled_at as string) ?? null;
    const provider = m?.join_url ? providerFromUrl(m.join_url as string) : null;
    const sentLabel = satIso ? shortDateNum(satIso, tz) : "";
    return {
      id: g.meeting_id as string,
      name,
      role: meta?.role ?? null,
      company: meta?.company ?? "",
      photoUrl: meta?.photoUrl ?? null,
      heldDateLabel: satIso ? shortDow(satIso, tz) : "Held",
      amount,
      amountCents: g.charity_amount_cents as number,
      charityName,
      charityShort,
      charityId,
      isOverride,
      satIso,
      drawer: {
        id: g.meeting_id as string,
        name,
        role: meta?.role ?? null,
        company: meta?.company ?? "",
        photoUrl: meta?.photoUrl ?? null,
        credibility: meta?.credibility ?? null,
        linkedinUrl: null,
        whenLong: scheduledIso ? longDateTime(scheduledIso, tz) : null,
        durationProvider: `${meta?.minutes ?? 45} min${provider ? ` · ${provider}` : ""}`,
        releasedLine: satIso ? `Gift released to charity ${longDate(new Date(satIso), tz)}.` : null,
        amount,
        charityName,
        charityId,
        giftStatusLine: `${isOverride ? "For this meeting only" : "Your standing nomination"}${sentLabel ? ` · sent ${sentLabel}` : ""}`,
        q1Head: meta?.q1Head ?? null,
        q1: meta?.q1 ?? "",
        q2Head: meta?.q2Head ?? null,
        q2: meta?.q2 ?? "",
        shareText: `My meeting with ${name} of ${meta?.company ?? "their company"} through TheGoodIntro funded a ${amount} gift to ${charityName}.`,
      },
    };
  });

  const inFy = (iso: string | null): boolean => Boolean(iso && iso >= fy.from && iso < fy.to);
  const thisFy = rows.filter((r) => inFy(r.satIso));
  const previous = rows.filter((r) => !inFy(r.satIso));

  // By charity: group, sum, order by lifetime DESC.
  const groups = new Map<string, CharityGroup>();
  for (const r of rows) {
    const key = r.charityId ?? "unknown";
    const g = groups.get(key);
    if (g) {
      g.gifts.push(r);
    } else {
      groups.set(key, { charityId: key, name: r.charityName, short: r.charityShort, amount: "", meetings: 0, isStanding: Boolean(defaultCharityId && key === defaultCharityId), gifts: [r] });
    }
  }
  // Sum cents per charity from the gift query (re-read amounts in cents).
  const centsByCharity = new Map<string, number>();
  for (const gx of gifts ?? []) {
    const key = (gx.charity_id as string) ?? "unknown";
    centsByCharity.set(key, (centsByCharity.get(key) ?? 0) + (gx.charity_amount_cents as number));
  }
  const byCharity = [...groups.values()]
    .map((g) => ({ ...g, amount: formatAud(centsByCharity.get(g.charityId) ?? 0), meetings: g.gifts.length }))
    .sort((a, b) => (centsByCharity.get(b.charityId) ?? 0) - (centsByCharity.get(a.charityId) ?? 0));

  const sumLabel = (subset: GiftRow[]): string => formatAud(subset.reduce((acc, r) => acc + (centsForRow(gifts ?? [], r.id) ?? 0), 0));

  return {
    exec: execShell(execRow),
    tz,
    stats: { ...baseStats, fyMeetings: thisFy.length },
    thisFy,
    previous,
    thisFyTotalLabel: `${sumLabel(thisFy)} to charity`,
    previousTotalLabel: `${sumLabel(previous)} to charity`,
    byCharity,
    standingCharityName: standingName,
  };
}

function centsForRow(gifts: { meeting_id: unknown; charity_amount_cents: unknown }[], meetingId: string): number | null {
  const g = gifts.find((x) => x.meeting_id === meetingId);
  return g ? (g.charity_amount_cents as number) : null;
}

function execShell(execRow: Record<string, unknown>): ExecImpactData["exec"] {
  return {
    name: (execRow.name as string) ?? "there",
    title: (execRow.title as string) ?? null,
    company: (execRow.company as string) ?? null,
    email: (execRow.primary_email as string) ?? "",
    photoUrl: (execRow.photo_url as string) ?? null,
  };
}

function emptyMeetings(
  execRow: Record<string, unknown>,
  tz: string,
  connectedAt: string | null,
  provider: string | null,
  lastSynced: string | null,
): ExecMeetingsData {
  return {
    exec: {
      name: (execRow.name as string) ?? "there",
      title: (execRow.title as string) ?? null,
      company: (execRow.company as string) ?? null,
      email: (execRow.primary_email as string) ?? "",
      photoUrl: (execRow.photo_url as string) ?? null,
    },
    tz,
    stats: { heldFy: 0, comingUp: 0, lifetime: 0 },
    calendar: calendarState(connectedAt, provider, lastSynced, tz),
    upcoming: [],
    past: [],
    cancelled: [],
    pastTotal: 0,
    cancelledTotal: 0,
  };
}

export async function loadExecRequests(supabase: SupabaseClient, execId: string): Promise<ExecRequestsData | null> {
  const { data: execRow } = await supabase
    .from("executive")
    .select("id, name, title, company, primary_email, photo_url, timezone, default_charity_id, ea_id")
    .eq("id", execId)
    .maybeSingle();
  if (!execRow) return null;

  const tz = (execRow.timezone as string) || AEST;

  // Standing charity name (+ logo once charity.logo_url lands; initials until then).
  let charityName = "your charity";
  const charityLogoUrl: string | null = null;
  if (execRow.default_charity_id) {
    const { data: charity } = await supabase.from("charity").select("name").eq("id", execRow.default_charity_id as string).maybeSingle();
    if (charity?.name) charityName = charity.name as string;
  }

  // EA first name for the "Forward to {EA} (EA)" action (named EA or nothing).
  let eaFirstName: string | null = null;
  if (execRow.ea_id) {
    const { data: ea } = await supabase.from("ea").select("name").eq("id", execRow.ea_id as string).maybeSingle();
    const eaName = (ea?.name as string) ?? "";
    eaFirstName = eaName.split(/\s+/)[0] || null;
  }

  // Every pending request for this exec. proposed_at is not in schema, so ordering
  // degrades from "soonest meeting first" to submission order (created_at asc).
  const { data: reqRows } = await supabase
    .from("request")
    .select(
      "id, status, vendor_id, attendee, meeting_minutes, created_at, q1_head, q1_what, q2_head, q2_why, vendor:vendor_id(name, status), requester:requested_by_user_id(name, photo_url, bio_one_liner)",
    )
    .eq("executive_id", execId)
    .eq("status", "submitted")
    .order("created_at", { ascending: true });
  const reqs = reqRows ?? [];

  // Per-vendor held count → indicative band amount for each card's vendor.
  const vendorIds = [...new Set(reqs.map((r) => r.vendor_id as string))];
  const heldByVendor = new Map<string, number>();
  if (vendorIds.length) {
    const { data: cycles } = await supabase
      .from("cycle")
      .select("vendor_id, held_meetings_count, started_at")
      .in("vendor_id", vendorIds)
      .order("started_at", { ascending: false });
    for (const c of cycles ?? []) {
      if (!heldByVendor.has(c.vendor_id as string)) heldByVendor.set(c.vendor_id as string, (c.held_meetings_count as number) ?? 0);
    }
  }
  const indicative = (vendorId: string): string => formatAud(bandForMeetingNumber((heldByVendor.get(vendorId) ?? 0) + 1).rateCents);

  const cards: RequestCardData[] = reqs.map((r) => {
    const v = one<{ name: string; status: string }>(r.vendor);
    const u = one<{ name: string; photo_url: string | null; bio_one_liner: string | null }>(r.requester);
    const attendee = r.attendee as { name?: string; title?: string } | null;
    const onBehalf = Boolean(attendee?.name?.trim());
    // Q3 on-behalf-of: the NAMED attendee's identity renders instead of the requester's.
    const displayName = onBehalf ? attendee!.name!.trim() : u?.name ?? v?.name ?? "A vendor";
    return {
      id: r.id as string,
      name: displayName,
      role: attendeeTitle(r.attendee),
      company: v?.name ?? "",
      photoUrl: onBehalf ? null : u?.photo_url ?? null,
      credibility: onBehalf ? null : u?.bio_one_liner ?? null,
      linkedinUrl: null,
      requesterFirst: displayName.split(/\s+/)[0] || displayName,
      submittedLabel: r.created_at ? longDate(new Date(r.created_at as string), tz) : null,
      durationLabel: `${(r.meeting_minutes as number) ?? 45} min`,
      founderReviewed: v ? FOUNDER_REVIEWED_STATUSES.has(v.status) : false,
      q1Head: (r.q1_head as string) ?? null,
      q1: (r.q1_what as string) ?? "",
      q2Head: (r.q2_head as string) ?? null,
      q2: (r.q2_why as string) ?? "",
      amount: indicative(r.vendor_id as string),
      charityName,
      charityLogoUrl,
    };
  });

  const name = (execRow.name as string) ?? "there";
  return {
    exec: {
      name,
      title: (execRow.title as string) ?? null,
      company: (execRow.company as string) ?? null,
      email: (execRow.primary_email as string) ?? "",
      photoUrl: (execRow.photo_url as string) ?? null,
    },
    eaFirstName,
    cards,
    count: cards.length,
    countWord: countWord(cards.length),
  };
}
