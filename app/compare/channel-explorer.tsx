"use client";

import { useState } from "react";
import {
  IconBriefcase,
  IconColdInbox,
  IconHandshake,
  IconHeartCircle,
  IconTag,
} from "../_components/icons";
import { ComparisonRow } from "../_components/ui";

/**
 * Interactive channel-by-channel section. A goal picker highlights the
 * channel cards that fit the job, in the spirit of the pricing page's
 * worked-example slider: small, self-explanatory, no form. Category-level
 * only per POSITIONING.md; we never name competitors.
 */

type IconType = React.ComponentType<{ className?: string; size?: number }>;

const CHANNELS: {
  key: string;
  name: string;
  icon: IconType;
  what: string;
  rows: { text: string; bad?: boolean }[];
  when: string;
  ours?: boolean;
}[] = [
  {
    key: "outbound",
    name: "Cold outbound",
    icon: IconColdInbox,
    what: "Email, LinkedIn, and phone, run by SDRs or by the founders themselves. The default channel for most B2B teams, and the one whose true cost is hardest to see because it arrives as salaries and tooling rather than a per-meeting invoice.",
    rows: [
      { text: "Scales with headcount and works at manager and director seniority" },
      { text: "You control the message, the volume, and the timing" },
      {
        text: "Reply rates collapse at C-level, where unsolicited approaches are filtered by EAs and habit",
        bad: true,
      },
      {
        text: "The real cost per held executive meeting lands far above what the tooling invoices suggest",
        bad: true,
      },
    ],
    when: "Choose it when your buyer is a manager or director and volume genuinely helps.",
  },
  {
    key: "events",
    name: "Events and sponsorships",
    icon: IconBriefcase,
    what: "Conference booths, sponsored dinners, roundtables, and passes. The oldest channel there is, and still the strongest way to be in the same room as people who chose to show up.",
    rows: [
      { text: "Real conversations with attendees who opted in to being there" },
      { text: "Builds brand and category presence alongside pipeline" },
      {
        text: "Five figures per event before travel, and the named executive you need may not attend",
        bad: true,
      },
      {
        text: "The event opens a door; the actual meeting still has to be won afterwards",
        bad: true,
      },
    ],
    when: "Choose it when market presence matters as much as any single meeting.",
  },
  {
    key: "intent",
    name: "Intent data and lead lists",
    icon: IconTag,
    what: "Subscriptions that score accounts, surface contacts, and flag buying signals. Genuinely useful, but it is fuel for outbound rather than a channel of its own, so the costs stack on top of the SDR motion it feeds.",
    rows: [
      { text: "Sharpens targeting so outbound spends fewer touches on the wrong accounts" },
      { text: "Useful early signal at the account level" },
      {
        text: "It cannot make an executive want the meeting; it only tells you who to ask",
        bad: true,
      },
      {
        text: "Senior executives rarely generate intent signals themselves; their teams do the researching",
        bad: true,
      },
    ],
    when: "Choose it when you already run outbound well and want it more accurate.",
  },
  {
    key: "warm",
    name: "Warm introductions",
    icon: IconHandshake,
    what: "A mutual connection, investor, or advisor vouches for you. The highest hit rate of any channel, because trust transfers, and the least repeatable, because every favour is a withdrawal from a finite account.",
    rows: [
      { text: "The best conversion of any channel when the connection is real" },
      { text: "Costs nothing in cash" },
      {
        text: "Each ask spends the relationship; asking repeatedly drains it",
        bad: true,
      },
      { text: "Cannot be scheduled, scaled, or forecast", bad: true },
    ],
    when: "Choose it when the connection exists and the ask is worth the favour.",
  },
  {
    key: "charity",
    name: "Charity-funded introductions",
    icon: IconHeartCircle,
    ours: true,
    what: "A vetted meeting request with a specific, relevant reason, where the vendor's fee funds a real gift to a charity the executive chooses. The executive's time creates value they care about even when the product turns out not to be a fit.",
    rows: [
      { text: "The executive has a real reason to show up that is not your product" },
      {
        text: "You pay only when the meeting holds: $1,500 flat, no subscriptions, no seat fees",
      },
      {
        text: "Between $900 and $1,200 of every fee reaches the chosen charity, published on a public ledger",
      },
      {
        text: "Invite only and Australia first, so coverage is narrower than a list",
        bad: true,
      },
      { text: "The wrong tool for high-volume top-of-funnel", bad: true },
    ],
    when: "Choose it when a handful of named senior executives matter more than a thousand contacts.",
  },
];

const GOALS: {
  key: string;
  label: string;
  channels: string[];
  verdict: string;
}[] = [
  {
    key: "volume",
    label: "Fill a pipeline at volume",
    channels: ["outbound", "intent"],
    verdict:
      "Run outbound, and add intent data once the motion works. Volume is exactly what those two are built for, and nothing on this page replaces them at that job.",
  },
  {
    key: "presence",
    label: "Be present in the market",
    channels: ["events"],
    verdict:
      "Events and sponsorships earn brand and category presence in a way no per-meeting channel can. Budget five figures per event and measure it patiently.",
  },
  {
    key: "shortlist",
    label: "Reach named senior executives",
    channels: ["warm", "charity"],
    verdict:
      "Spend warm introductions where they exist; nothing converts better. For the rest of the shortlist, a charity-funded introduction is the channel built for exactly this job.",
  },
];

export default function ChannelExplorer() {
  const [goal, setGoal] = useState<string | null>(null);
  const active = GOALS.find((g) => g.key === goal);

  return (
    <div>
      {/* Goal picker */}
      <div
        className="mt-12 rounded-3xl border p-7 md:p-8"
        style={{ background: "var(--cream-1)", borderColor: "var(--hair)" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Try it · What is the job right now?
        </p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {GOALS.map((g) => {
            const selected = g.key === goal;
            return (
              <button
                key={g.key}
                type="button"
                aria-pressed={selected}
                onClick={() => setGoal(selected ? null : g.key)}
                className="rounded-full border px-4 py-2 text-sm font-semibold transition-colors cursor-pointer"
                style={
                  selected
                    ? {
                        background: "var(--primary)",
                        borderColor: "var(--primary)",
                        color: "var(--cream-1)",
                      }
                    : {
                        background: "transparent",
                        borderColor: "var(--hair)",
                        color: "var(--cream-11)",
                      }
                }
              >
                {g.label}
              </button>
            );
          })}
        </div>
        <p
          aria-live="polite"
          className="mt-4 text-[15px] leading-relaxed"
          style={{ color: "var(--cream-10)" }}
        >
          {active
            ? active.verdict
            : "Pick the job and the channels that fit light up below. Every channel here earns its place somewhere; the question is whether that somewhere is yours."}
        </p>
      </div>

      {/* Channel cards */}
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        {CHANNELS.map((c, i) => {
          const Icon = c.icon;
          const fits = active ? active.channels.includes(c.key) : false;
          const dimmed = active ? !fits : false;
          return (
            <div
              key={c.key}
              className={
                "group relative rounded-3xl border p-8 md:p-10 transition-all duration-300 hover:-translate-y-0.5 step-card-hl" +
                (c.ours ? " md:col-span-2" : "")
              }
              style={{
                background: fits ? "var(--mint-tint)" : "var(--cream-1)",
                borderColor: fits ? "var(--primary)" : "var(--hair)",
                opacity: dimmed ? 0.55 : 1,
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div
                  className="size-12 rounded-full grid place-items-center transition-colors group-hover:[background:var(--primary)] group-hover:[color:var(--cream-1)]"
                  style={{
                    background: fits ? "var(--primary)" : "var(--mint-tint)",
                    color: fits ? "var(--cream-1)" : "var(--primary-ink)",
                  }}
                >
                  <Icon size={22} />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--cream-9)" }}>
                  {c.ours ? "05 · Ours" : `0${i + 1}`}
                </span>
              </div>
              <h3 className="text-xl font-extrabold tracking-[-0.02em]" style={{ color: "var(--cream-11)" }}>
                {c.name}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--cream-9)" }}>
                {c.what}
              </p>
              <ul className="mt-6 space-y-3.5 text-[14px]">
                {c.rows.map((r) => (
                  <ComparisonRow key={r.text} text={r.text} bad={r.bad} />
                ))}
              </ul>
              <p
                className="mt-6 pt-5 border-t text-[14px] font-medium"
                style={{ borderColor: "var(--hair)", color: "var(--cream-11)" }}
              >
                {c.when}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
