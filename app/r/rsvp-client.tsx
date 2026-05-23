"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Heart, Loader2, X } from "lucide-react";

// Records the response, then shows a warm confirmation. The recipient already
// chose by clicking Accept/Decline in the email, so we record on mount — one
// click, nothing else to do. They can flip their answer or undo if they
// misclicked, which keeps the whole thing reversible.

type Action = "yes" | "no";
type State = "saving" | "saved" | "error";

export default function RsvpClient({
  token,
  action,
  firstName,
  campaign,
}: {
  token: string;
  action: Action;
  firstName: string;
  campaign: string;
}) {
  const [current, setCurrent] = useState<Action>(action);
  const [state, setState] = useState<State>("saving");
  const lastSent = useRef<string>("");

  async function send(a: Action | "undo") {
    setState("saving");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action: a, campaign }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState("saved");
    } catch {
      setState("error");
    }
  }

  // Record the initial choice exactly once on load.
  useEffect(() => {
    if (lastSent.current === current) return;
    lastSent.current = current;
    void send(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const hi = firstName ? `${firstName}, ` : "";

  if (state === "error") {
    return (
      <Card>
        <h1 className="text-2xl font-semibold tracking-[-0.02em]">
          That didn&apos;t go through
        </h1>
        <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed">
          Something went wrong saving your response. Please try the button
          again — or just reply to the email and I&apos;ll sort it out.
        </p>
        <button
          onClick={() => send(current)}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] font-medium"
          style={{ background: "var(--foreground)", color: "var(--background)" }}
        >
          Try again
        </button>
      </Card>
    );
  }

  const saving = state === "saving";

  if (current === "yes") {
    return (
      <Card>
        <Badge tone="yes">
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
          {saving ? "Saving" : "Noted"}
        </Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] leading-tight">
          Wonderful{hi ? `, ${firstName}` : ""}.
        </h1>
        <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed">
          That&apos;s all I needed. I&apos;ll be in touch shortly with the next
          step — a quick five-minute call to set you up, nothing to fill in.
        </p>
        <div
          className="mt-6 flex items-start gap-3 rounded-xl border p-4"
          style={{
            background: "color-mix(in oklab, var(--primary) 6%, transparent)",
            borderColor: "var(--primary)",
          }}
        >
          <Heart className="size-5 shrink-0 mt-0.5" style={{ color: "var(--primary)" }} />
          <div>
            <p className="text-[13px] font-semibold leading-relaxed">
              Notice how easy that was? Giving is just as effortless.
            </p>
            <p className="mt-1 text-[13px] leading-relaxed">
              Every meeting you take through theGoodintro sends{" "}
              <span className="serif-italic" style={{ color: "var(--primary)" }}>
                $1,000
              </span>{" "}
              to a charity you choose. The same single tap, no forms, nothing
              to set up.
            </p>
          </div>
        </div>
        <Undo label="Actually, not right now" onClick={() => setCurrent("no")} />
      </Card>
    );
  }

  return (
    <Card>
      <Badge tone="no">
        {saving ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />}
        {saving ? "Saving" : "Noted"}
      </Badge>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] leading-tight">
        No problem{hi ? `, ${firstName}` : ""}.
      </h1>
      <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed">
        Thanks for letting me know — I won&apos;t follow up. If the timing
        changes down the track, the door stays open.
      </p>
      <Undo label="Wait, I&apos;m interested after all" onClick={() => setCurrent("yes")} />
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border p-8 md:p-10 shadow-sm"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      {children}
    </div>
  );
}

function Badge({ tone, children }: { tone: "yes" | "no"; children: React.ReactNode }) {
  const yes = tone === "yes";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em]"
      style={{
        background: yes ? "var(--mint-tint)" : "var(--cream-3)",
        color: yes ? "var(--primary)" : "var(--muted-foreground)",
      }}
    >
      {children}
    </span>
  );
}

function Undo({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mt-6 text-[13px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
    >
      {label}
    </button>
  );
}
