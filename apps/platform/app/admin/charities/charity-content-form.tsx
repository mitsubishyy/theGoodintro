"use client";

import { useActionState, useState } from "react";
import { updateCharityContentAction, type FormState } from "./actions";

/**
 * Charity curated DETAIL-content editor (the exec "Learn about" modal): purpose +
 * featured quote + attribution, plus two repeaters (programmes, stories). The two
 * arrays live in React state and serialize to JSON hidden fields on submit; the
 * action JSON.parses, normalises and validates them into the exact jsonb shapes
 * the loader reads (programmes [{label, body}], stories [{published_at, headline,
 * body, url}]). The keys here MUST match those shapes or content will not render.
 */

const inputStyle = { background: "var(--portal-card)", borderColor: "var(--portal-line)" } as const;
const labelStyle = "font-mono text-[10px] uppercase tracking-[0.18em]";
const inputCls = "rounded-lg border px-3 py-2.5 text-sm";

type Programme = { label: string; body: string };
type Story = { published_at: string; headline: string; body: string; url: string };

export function CharityContentForm({
  id,
  purpose,
  featuredQuote,
  featuredQuoteAttribution,
  programmes: initialProgrammes,
  stories: initialStories,
}: {
  id: string;
  purpose: string;
  featuredQuote: string;
  featuredQuoteAttribution: string;
  programmes: Programme[];
  stories: Story[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(updateCharityContentAction, {});
  const [programmes, setProgrammes] = useState<Programme[]>(initialProgrammes);
  const [stories, setStories] = useState<Story[]>(initialStories);

  const setProgramme = (i: number, key: keyof Programme, val: string) =>
    setProgrammes((rows) => rows.map((r, j) => (j === i ? { ...r, [key]: val } : r)));
  const setStory = (i: number, key: keyof Story, val: string) =>
    setStories((rows) => rows.map((r, j) => (j === i ? { ...r, [key]: val } : r)));

  return (
    <form action={formAction} className="grid max-w-2xl gap-7">
      <input type="hidden" name="id" value={id} />
      {/* The repeaters travel as JSON; the action normalises + validates them. */}
      <input type="hidden" name="programmes" value={JSON.stringify(programmes)} />
      <input type="hidden" name="stories" value={JSON.stringify(stories)} />

      <label className="flex flex-col gap-1.5">
        <span className={labelStyle} style={{ color: "var(--muted-foreground)" }}>Purpose</span>
        <textarea name="purpose" defaultValue={purpose} rows={3} className={inputCls} style={inputStyle} />
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>One factual sentence on why the charity exists.</span>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelStyle} style={{ color: "var(--muted-foreground)" }}>Featured quote</span>
        <textarea name="featured_quote" defaultValue={featuredQuote} rows={2} className={inputCls} style={inputStyle} />
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>An illustrative testimonial. Leave the section empty to hide it.</span>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelStyle} style={{ color: "var(--muted-foreground)" }}>Quote attribution</span>
        <input name="featured_quote_attribution" defaultValue={featuredQuoteAttribution} className={inputCls} style={inputStyle} />
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>A generic role and location, never a named real person.</span>
      </label>

      {/* ── Programmes repeater ───────────────────────────────────────────── */}
      <Repeater
        title="Programmes"
        hint="Programme areas the gift supports. Each needs a label or body to be saved."
        rows={programmes}
        onAdd={() => setProgrammes((r) => [...r, { label: "", body: "" }])}
        onRemove={(i) => setProgrammes((r) => r.filter((_, j) => j !== i))}
        addLabel="Add programme"
        emptyLabel="No programmes yet."
        renderRow={(p, i) => (
          <div className="grid gap-2">
            <input
              value={p.label}
              onChange={(e) => setProgramme(i, "label", e.target.value)}
              placeholder="Label"
              className={inputCls}
              style={inputStyle}
            />
            <textarea
              value={p.body}
              onChange={(e) => setProgramme(i, "body", e.target.value)}
              placeholder="Short body"
              rows={2}
              className={inputCls}
              style={inputStyle}
            />
          </div>
        )}
      />

      {/* ── Stories repeater ──────────────────────────────────────────────── */}
      <Repeater
        title="Recent stories"
        hint="Representative recent items. Each needs a headline to be saved. Link to the charity's own news page."
        rows={stories}
        onAdd={() => setStories((r) => [...r, { published_at: "", headline: "", body: "", url: "" }])}
        onRemove={(i) => setStories((r) => r.filter((_, j) => j !== i))}
        addLabel="Add story"
        emptyLabel="No stories yet."
        renderRow={(s, i) => (
          <div className="grid gap-2">
            <div className="flex flex-col gap-1.5">
              <span className={labelStyle} style={{ color: "var(--muted-foreground)" }}>Published</span>
              <input
                type="date"
                value={s.published_at}
                onChange={(e) => setStory(i, "published_at", e.target.value)}
                className={`${inputCls} w-fit`}
                style={inputStyle}
              />
            </div>
            <input
              value={s.headline}
              onChange={(e) => setStory(i, "headline", e.target.value)}
              placeholder="Headline"
              className={inputCls}
              style={inputStyle}
            />
            <textarea
              value={s.body}
              onChange={(e) => setStory(i, "body", e.target.value)}
              placeholder="Short body"
              rows={2}
              className={inputCls}
              style={inputStyle}
            />
            <input
              type="url"
              value={s.url}
              onChange={(e) => setStory(i, "url", e.target.value)}
              placeholder="https://charity.org.au/news/"
              className={inputCls}
              style={inputStyle}
            />
          </div>
        )}
      />

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
          style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}
        >
          {pending ? "Saving…" : "Save content"}
        </button>
        {state.error ? <span className="text-sm" style={{ color: "var(--portal-amber-ink)" }}>{state.error}</span> : null}
        {state.ok ? <span className="text-sm" style={{ color: "var(--primary)" }}>Saved.</span> : null}
      </div>
    </form>
  );
}

function Repeater<T>({
  title,
  hint,
  rows,
  onAdd,
  onRemove,
  renderRow,
  addLabel,
  emptyLabel,
}: {
  title: string;
  hint: string;
  rows: T[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  renderRow: (row: T, i: number) => React.ReactNode;
  addLabel: string;
  emptyLabel: string;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-0.5">
        <span className={labelStyle} style={{ color: "var(--muted-foreground)" }}>{title}</span>
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{hint}</span>
      </div>

      {rows.length === 0 ? (
        <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{emptyLabel}</span>
      ) : (
        rows.map((row, i) => (
          <div key={i} className="rounded-xl border p-4" style={{ borderColor: "var(--portal-line)", background: "var(--portal-card)" }}>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
                {title.replace(/s$/, "")} {i + 1}
              </span>
              <button type="button" onClick={() => onRemove(i)} className="text-sm" style={{ color: "var(--portal-amber-ink)" }}>
                Remove
              </button>
            </div>
            {renderRow(row, i)}
          </div>
        ))
      )}

      <button
        type="button"
        onClick={onAdd}
        className="w-fit rounded-lg border px-3 py-1.5 text-sm"
        style={{ borderColor: "var(--portal-line)", background: "var(--portal-card)" }}
      >
        {addLabel}
      </button>
    </div>
  );
}
