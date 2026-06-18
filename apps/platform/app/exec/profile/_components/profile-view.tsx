"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, Icon } from "@thegoodintro/ui";
import type { ExecProfileData } from "../../data";
import { saveProfileYouAction, saveProfileBusinessAction, saveProfileCalendarAction, saveProfilePhotoAction, setRequestPauseAction } from "../../actions";
import { uploadPhotoFile } from "@/lib/upload/client";
import { TIMELINE_OPTIONS, CADENCE_OPTIONS, SENIORITY_OPTIONS, WINDOW_DAY_OPTIONS, TIMEZONE_OPTIONS, timezoneLabel, windowDaysLabel } from "../options";
import { ProfileEaDrawer } from "./profile-ea-drawer";

/**
 * Exec Profile (exec-profile lock 2026-06-11). READ by default; four sections
 * inline-edit (You, Business context, Calendar window, Requests). Your charity +
 * Consent record never edit. The EA subsection opens a drawer (changes send
 * email). Editorial concierge register: Fraunces section heads, italic eyebrows,
 * single emerald accent (charity name, "● Editing", Save CTAs), hairlines, no
 * pills/mono except the consent message-id (absent here → degraded).
 *
 * Admin parity: every field mirrors an admin-captured field. Photo upload + the
 * EA access-link email are not wired yet, so those affordances render per the
 * lock but stay inert (honest, per the lock's degrade rule).
 */

const SERIF = "var(--font-display), Georgia, serif";
const EMPTY = "Not on file";

export function ProfileView({ data, photoUploadEnabled }: { data: ExecProfileData; photoUploadEnabled: boolean }) {
  const [eaOpen, setEaOpen] = useState(false);

  return (
    <div className="max-w-[760px]">
      <header>
        <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
          Your account
        </p>
        <h1 className="mt-1 text-[32px] font-semibold tracking-tight" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
          Profile
        </h1>
        <p className="mt-3 max-w-[560px] text-[14px] italic" style={{ color: "var(--muted-foreground)" }}>
          Your profile was set up for you when you joined TheGoodIntro. Edit anything that does not look right.
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-8">
        <YouSection you={data.you} photoUploadEnabled={photoUploadEnabled} />
        <BusinessSection business={data.business} />
        <CharitySection charity={data.charity} />
        <CalendarSection calendar={data.calendar} ea={data.ea} onEditEa={() => setEaOpen(true)} />
        <RequestsSection paused={data.paused} />
        <ConsentSection consent={data.consent} />
      </div>

      {eaOpen && <ProfileEaDrawer ea={data.ea} onClose={() => setEaOpen(false)} />}
    </div>
  );
}

// ── Section 1: You ───────────────────────────────────────────────────────────

function YouSection({ you, photoUploadEnabled }: { you: ExecProfileData["you"]; photoUploadEnabled: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [f, setF] = useState({ name: you.name, title: you.title ?? "", company: you.company ?? "", email: you.email, linkedinUrl: you.linkedinUrl ?? "" });
  const [photoUrl, setPhotoUrl] = useState<string | null>(you.photoUrl ?? null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoErr, setPhotoErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const save = async () => {
    setBusy(true);
    setErr(null);
    const res = await saveProfileYouAction(f);
    setBusy(false);
    if (res.error) return setErr(res.error);
    setEditing(false);
    router.refresh();
  };

  const onPickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the same file be re-picked after an error
    if (!file) return;
    setPhotoBusy(true);
    setPhotoErr(null);
    // The route owns the real validation; ownerId is a fresh id (paths are
    // content-hashed and the column write resolves the real executive).
    const up = await uploadPhotoFile(file, "exec", crypto.randomUUID());
    if ("error" in up) {
      setPhotoBusy(false);
      return setPhotoErr(up.error);
    }
    const res = await saveProfilePhotoAction(up.url);
    setPhotoBusy(false);
    if (res.error) return setPhotoErr(res.error);
    setPhotoUrl(up.url);
    router.refresh();
  };

  return (
    <Card>
      <SectionHeader title="You" editing={editing} onEdit={() => setEditing(true)} />
      <div className="mt-5 flex gap-6">
        <div className="relative shrink-0">
          <Avatar name={you.name} src={photoUrl ?? undefined} size={96} />
          {editing && photoUploadEnabled && (
            <>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={onPickPhoto} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={photoBusy}
                aria-label="Change photo"
                title="Change photo"
                className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full border disabled:opacity-60"
                style={{ background: "#fff", borderColor: "var(--portal-line)" }}
              >
                <Icon name="camera" size={14} style={{ color: "var(--portal-ink)" }} />
              </button>
            </>
          )}
          {editing && !photoUploadEnabled && (
            <span className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full border" style={{ background: "#fff", borderColor: "var(--portal-line)" }} title="Photo upload is coming soon">
              <Icon name="camera" size={14} style={{ color: "var(--portal-ink)" }} />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex flex-col gap-3">
              <TextField label="Name" value={f.name} onChange={(v) => setF({ ...f, name: v })} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextField label="Title" value={f.title} onChange={(v) => setF({ ...f, title: v })} />
                <TextField label="Company" value={f.company} onChange={(v) => setF({ ...f, company: v })} />
              </div>
              <TextField label="Email" value={f.email} onChange={(v) => setF({ ...f, email: v })} />
              <TextField label="LinkedIn" value={f.linkedinUrl} onChange={(v) => setF({ ...f, linkedinUrl: v })} placeholder="linkedin.com/in/yourprofile" />
              {photoUploadEnabled ? (
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={photoBusy} className="text-[12px] italic underline-offset-2 hover:underline disabled:opacity-60" style={{ color: "var(--portal-ink)" }}>
                    {photoBusy ? "Uploading…" : "Change photo"}
                  </button>
                  {photoErr && <span className="text-[12px]" style={{ color: "#b42318" }}>{photoErr}</span>}
                </div>
              ) : (
                <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>Photo change is coming soon.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <ReadRow label="Name" value={you.name} />
              <ReadRow label="Title" value={you.title} />
              <ReadRow label="Company" value={you.company} />
              <ReadRow label="Email" value={you.email} />
              <ReadRow label="LinkedIn" value={you.linkedinUrl} link />
            </div>
          )}
          <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--portal-line)" }}>
            <p className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
              Executive ID: {you.execIdLabel}
              {you.joinedLabel ? ` · Joined TheGoodIntro ${you.joinedLabel}` : ""}
            </p>
          </div>
        </div>
      </div>
      {editing && <EditFooter busy={busy} err={err} onCancel={() => setEditing(false)} onSave={save} />}
    </Card>
  );
}

// ── Section 2: Business context ──────────────────────────────────────────────

function BusinessSection({ business }: { business: ExecProfileData["business"] }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [f, setF] = useState({
    interestedIn: business.interestedIn ?? "",
    currentProjects: business.currentProjects ?? "",
    notInterestedIn: business.notInterestedIn ?? "",
    timeline: business.timeline ?? "",
    cadence: business.cadence ?? "",
    seniority: business.seniority ?? "",
  });

  const save = async () => {
    setBusy(true);
    setErr(null);
    const res = await saveProfileBusinessAction(f);
    setBusy(false);
    if (res.error) return setErr(res.error);
    setEditing(false);
    router.refresh();
  };

  return (
    <Card>
      <SectionHeader title="Business context" editing={editing} onEdit={() => setEditing(true)} />
      <p className="mt-2 text-[13px] italic" style={{ color: "var(--muted-foreground)" }}>
        What you are working on, so we can put the right vendors in front of you.
      </p>
      {editing ? (
        <div className="mt-5 flex flex-col gap-4">
          <TextArea label="Interested in" value={f.interestedIn} onChange={(v) => setF({ ...f, interestedIn: v })} />
          <TextArea label="Current or upcoming projects" value={f.currentProjects} onChange={(v) => setF({ ...f, currentProjects: v })} />
          <TextArea label="Areas you are not interested in" value={f.notInterestedIn} onChange={(v) => setF({ ...f, notInterestedIn: v })} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField label="Timeline" value={f.timeline} options={TIMELINE_OPTIONS} onChange={(v) => setF({ ...f, timeline: v })} />
            <SelectField label="Suggested meeting cadence" value={f.cadence} options={CADENCE_OPTIONS} onChange={(v) => setF({ ...f, cadence: v })} />
            <SelectField label="Seniority signal" value={f.seniority} options={SENIORITY_OPTIONS} onChange={(v) => setF({ ...f, seniority: v })} />
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-4">
          <ReadRow label="Interested in" value={business.interestedIn} />
          <ReadRow label="Current or upcoming projects" value={business.currentProjects} />
          <ReadRow label="Areas you are not interested in" value={business.notInterestedIn} />
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            <ReadRow label="Timeline" value={business.timeline} />
            <ReadRow label="Suggested meeting cadence" value={business.cadence} />
            <ReadRow label="Seniority signal" value={business.seniority} />
          </div>
        </div>
      )}
      <p className="mt-5 text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
        We use these answers to choose which vendor requests reach you. Never shown to vendors.
      </p>
      {editing && <EditFooter busy={busy} err={err} onCancel={() => setEditing(false)} onSave={save} />}
    </Card>
  );
}

// ── Section 3: Your charity (read-only) ──────────────────────────────────────

function CharitySection({ charity }: { charity: ExecProfileData["charity"] }) {
  return (
    <Card>
      <SectionHeader title="Your charity" />
      <p className="mt-2 text-[13px] italic" style={{ color: "var(--muted-foreground)" }}>
        Where the gift goes from every meeting you accept.
      </p>
      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CharityMark name={charity?.name ?? "?"} src={charity?.logoUrl ?? null} />
          {charity ? (
            <div>
              <div className="text-[20px] font-semibold" style={{ fontFamily: SERIF, color: "var(--portal-emerald)" }}>
                {charity.name}
              </div>
              <div className="text-[13px] italic" style={{ color: "var(--muted-foreground)" }}>
                Standing nomination{charity.cause ? ` · ${charity.cause}` : ""}
              </div>
            </div>
          ) : (
            <span className="text-[14px] italic" style={{ color: "var(--muted-foreground)" }}>
              {EMPTY}
            </span>
          )}
        </div>
        <Link href="/exec/my-charity" className="shrink-0 text-[13px] italic hover:underline underline-offset-2" style={{ color: "var(--portal-ink)" }}>
          View on My charity →
        </Link>
      </div>
    </Card>
  );
}

// ── Section 4: Calendar & access ─────────────────────────────────────────────

function CalendarSection({ calendar, ea, onEditEa }: { calendar: ExecProfileData["calendar"]; ea: ExecProfileData["ea"]; onEditEa: () => void }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [f, setF] = useState({ timezone: calendar.timezone ?? "", windowDays: calendar.windowDays ?? "weekdays", windowStart: calendar.windowStart ?? "09:00", windowEnd: calendar.windowEnd ?? "17:00" });

  const save = async () => {
    setBusy(true);
    setErr(null);
    const res = await saveProfileCalendarAction(f);
    setBusy(false);
    if (res.error) return setErr(res.error);
    setEditing(false);
    router.refresh();
  };

  const windowLabel = calendar.windowStart && calendar.windowEnd ? `${windowDaysLabel(calendar.windowDays)} ${calendar.windowStart} to ${calendar.windowEnd}`.trim() : windowDaysLabel(calendar.windowDays) || null;

  return (
    <Card>
      <SectionHeader title="Calendar & access" editing={editing} onEdit={() => setEditing(true)} />
      <p className="mt-2 text-[13px] italic" style={{ color: "var(--muted-foreground)" }}>
        How meeting times get found and who else can act on your behalf.
      </p>

      {/* Calendar subsection */}
      <div className="mt-5">
        {calendar.connected ? (
          <div className="flex items-start gap-2.5">
            <Icon name="calendar" size={16} className="mt-0.5 shrink-0" style={{ color: "var(--portal-ink)" }} />
            <div>
              <div className="text-[14px]" style={{ color: "var(--portal-ink)" }}>
                {calendar.providerLabel} · Connected
              </div>
              {calendar.lastSyncedLabel && (
                <div className="text-[12.5px] italic" style={{ color: "var(--muted-foreground)" }}>
                  Last synced {calendar.lastSyncedLabel} · free and busy only, never event details
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-[14px] italic" style={{ color: "var(--muted-foreground)" }}>
              No calendar connected.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <span className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white" style={{ background: "var(--portal-emerald)" }}>
                Connect Google Calendar
              </span>
              <span className="rounded-lg px-4 py-2 text-[13px] font-semibold" style={{ border: "1px solid var(--portal-line)", color: "var(--portal-ink)" }}>
                Connect Outlook
              </span>
            </div>
            <p className="mt-2 text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
              We read free and busy times only, never the detail of your events.
            </p>
          </div>
        )}

        {editing ? (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectLabeled label="Timezone" value={f.timezone} options={TIMEZONE_OPTIONS} onChange={(v) => setF({ ...f, timezone: v })} />
            <SelectLabeled label="Preferred days" value={f.windowDays} options={WINDOW_DAY_OPTIONS} onChange={(v) => setF({ ...f, windowDays: v })} />
            <TimeField label="Window start" value={f.windowStart} onChange={(v) => setF({ ...f, windowStart: v })} />
            <TimeField label="Window end" value={f.windowEnd} onChange={(v) => setF({ ...f, windowEnd: v })} />
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            <ReadRow label="Timezone" value={timezoneLabel(calendar.timezone)} />
            <ReadRow label="Preferred meeting window" value={windowLabel} />
          </div>
        )}
        {editing && <EditFooter busy={busy} err={err} onCancel={() => setEditing(false)} onSave={save} />}
      </div>

      {/* EA subsection */}
      <div className="mt-6 border-t pt-5" style={{ borderColor: "var(--portal-line)" }}>
        <div className="flex items-center justify-between">
          <span className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
            Executive assistant
          </span>
          {ea && (
            <button type="button" onClick={onEditEa} className="inline-flex items-center gap-1.5 text-[13px] italic hover:underline underline-offset-2" style={{ color: "var(--portal-ink)" }}>
              <Icon name="pencil" size={14} /> Edit
            </button>
          )}
        </div>
        {ea ? (
          <div className="mt-2">
            <div className="text-[14px]" style={{ color: "var(--portal-ink)" }}>
              {ea.name} · {ea.email}
            </div>
            <div className="text-[12.5px] italic" style={{ color: "var(--muted-foreground)" }}>
              {ea.sinceLabel ? `Acting access since ${ea.sinceLabel} · ` : ""}Forwarded requests appear in their inbox automatically
            </div>
          </div>
        ) : (
          <div className="mt-2">
            <p className="text-[14px] italic" style={{ color: "var(--muted-foreground)" }}>
              No executive assistant on file.
            </p>
            <button type="button" onClick={onEditEa} className="mt-3 h-10 rounded-lg border px-4 text-[13px] font-semibold" style={{ borderColor: "var(--portal-line)", color: "var(--portal-ink)", background: "var(--portal-card)" }}>
              Add an assistant
            </button>
            <p className="mt-2 text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
              An assistant can see your incoming requests and act on meetings on your behalf. They cannot change your charity or your business context.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

// ── Section 5: Requests (Pause) ──────────────────────────────────────────────

function RequestsSection({ paused }: { paused: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const toggle = async () => {
    setBusy(true);
    setErr(null);
    const res = await setRequestPauseAction(!paused);
    setBusy(false);
    if (res.error) return setErr(res.error);
    router.refresh();
  };

  return (
    <Card>
      <SectionHeader title="Requests" />
      <p className="mt-2 text-[13px] italic" style={{ color: "var(--muted-foreground)" }}>
        Control whether new vendor requests reach you.
      </p>
      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <div className="text-[14px] font-semibold" style={{ color: "var(--portal-ink)" }}>
            Pause all requests
          </div>
          <p className="mt-1 max-w-[480px] text-[12.5px] italic" style={{ color: "var(--muted-foreground)" }}>
            Pausing stops new requests reaching your inbox until you turn it back on. Meetings already confirmed are unaffected.
          </p>
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={busy}
          aria-pressed={paused}
          className="relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60"
          style={{ background: paused ? "var(--portal-emerald)" : "var(--portal-line)" }}
        >
          <span className="absolute top-0.5 size-6 rounded-full bg-white transition-all" style={{ left: paused ? "22px" : "2px" }} />
        </button>
      </div>
      {err && <p className="mt-2 text-[12px]" style={{ color: "#b42318" }}>{err}</p>}
    </Card>
  );
}

// ── Section 6: Consent record (read-only, tamper-evident) ────────────────────

function ConsentSection({ consent }: { consent: ExecProfileData["consent"] }) {
  return (
    <Card>
      <SectionHeader title="Consent record" />
      <div className="mt-4 rounded-xl border p-5" style={{ background: "var(--portal-page)", borderColor: "var(--portal-line)" }}>
        <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
          Tamper-evident
        </p>
        {consent ? (
          <div className="mt-3 flex flex-col gap-2.5 text-[13px]" style={{ color: "var(--portal-ink)" }}>
            <ConsentRow label="Captured at" value={consent.capturedAtLabel} />
            <ConsentRow label="Terms version" value={consent.termsVersion} />
            <ConsentRow label="Captured by" value={consent.actor} />
            <ConsentRow label="Action taken" value={consent.action} />
            {consent.ip && <ConsentRow label="IP recorded" value={consent.ip} />}
          </div>
        ) : (
          <p className="mt-3 text-[13px] italic" style={{ color: "var(--muted-foreground)" }}>
            No consent recorded yet. It is captured automatically the first time you action a request email.
          </p>
        )}
        <p className="mt-4 text-[12px] italic leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          Consent is captured automatically the first time you action a request email (accept, decline, or reschedule). Nothing was sent before this point. This record is append-only and cannot be edited.
        </p>
      </div>
    </Card>
  );
}

function ConsentRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap gap-x-3">
      <span className="shrink-0 italic" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <span style={{ color: "var(--portal-ink)" }}>{value}</span>
    </div>
  );
}

// ── Shared primitives ────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-xl border px-7 py-6" style={{ background: "var(--portal-card-reading)", borderColor: "var(--portal-line)" }}>
      {children}
    </section>
  );
}

function SectionHeader({ title, editing, onEdit }: { title: string; editing?: boolean; onEdit?: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[22px] font-semibold" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
        {title}
      </h2>
      {onEdit &&
        (editing ? (
          <span className="inline-flex items-center gap-1.5 text-[12px] italic" style={{ color: "var(--portal-emerald)" }}>
            <span className="size-1.5 rounded-full" style={{ background: "var(--portal-emerald)" }} /> Editing
          </span>
        ) : (
          <button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 text-[13px] italic hover:underline underline-offset-2" style={{ color: "var(--portal-ink)" }}>
            <Icon name="pencil" size={14} /> Edit
          </button>
        ))}
    </div>
  );
}

function ReadRow({ label, value, link }: { label: string; value: string | null; link?: boolean }) {
  const empty = !value;
  return (
    <div>
      <div className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </div>
      {empty ? (
        <div className="mt-0.5 text-[14.5px] italic" style={{ color: "var(--muted-foreground)" }}>
          {EMPTY}
        </div>
      ) : link ? (
        <a href={value!.startsWith("http") ? value! : `https://${value}`} target="_blank" rel="noreferrer" className="mt-0.5 inline-block text-[14.5px] italic hover:underline underline-offset-2" style={{ color: "var(--portal-ink)" }}>
          {value} ↗
        </a>
      ) : (
        <div className="mt-0.5 text-[14.5px]" style={{ color: "var(--portal-ink)" }}>
          {value}
        </div>
      )}
    </div>
  );
}

function EditFooter({ busy, err, onCancel, onSave }: { busy: boolean; err: string | null; onCancel: () => void; onSave: () => void }) {
  return (
    <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--portal-line)" }}>
      {err && <p className="mb-2 text-[12px]" style={{ color: "#b42318" }}>{err}</p>}
      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={busy} className="h-10 rounded-full border px-5 text-[13px] font-semibold disabled:opacity-60" style={{ borderColor: "var(--portal-line)", color: "var(--portal-ink)", background: "transparent" }}>
          Cancel
        </button>
        <button type="button" onClick={onSave} disabled={busy} className="h-10 rounded-full px-6 text-[13px] font-semibold text-white disabled:opacity-60" style={{ background: "var(--portal-emerald)" }}>
          {busy ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function fieldLabel(label: string) {
  return (
    <span className="mb-1 block text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
      {label}
    </span>
  );
}

const inputStyle = { background: "var(--portal-page)", border: "1px solid var(--portal-line)", color: "var(--portal-ink)" };

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      {fieldLabel(label)}
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none" style={inputStyle} />
    </label>
  );
}

function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      {fieldLabel(label)}
      <input type="time" value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none" style={inputStyle} />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      {fieldLabel(label)}
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full resize-y rounded-lg px-3.5 py-2.5 text-[14px] leading-relaxed outline-none" style={inputStyle} />
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (v: string) => void }) {
  const opts = value && !options.includes(value) ? [value, ...options] : options;
  return (
    <label className="block">
      {fieldLabel(label)}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none" style={inputStyle}>
        <option value="">Select…</option>
        {opts.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function SelectLabeled({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  const has = options.some((o) => o.value === value);
  return (
    <label className="block">
      {fieldLabel(label)}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none" style={inputStyle}>
        {!has && value && <option value={value}>{value}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CharityMark({ name, src }: { name: string; src: string | null }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} width={44} height={44} className="size-11 shrink-0 rounded-full object-cover" style={{ border: "1px solid var(--portal-line)" }} />;
  }
  const mark = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter((c) => /[A-Za-z]/.test(c ?? ""))
    .slice(0, 3)
    .join("")
    .toUpperCase();
  return (
    <span className="size-11 shrink-0 grid place-items-center rounded-full text-[13px] font-semibold" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}>
      {mark}
    </span>
  );
}
