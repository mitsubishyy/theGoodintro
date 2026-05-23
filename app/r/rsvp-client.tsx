"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Heart, X } from "lucide-react";

// The token was already verified server-side before this page rendered, so the
// response is effectively confirmed the moment they arrive. We show the
// "you're in" state immediately and record in the background — no spinner, no
// waiting. `keepalive` lets the request finish even if they close the tab and
// get back to work, which is exactly what a busy exec does.

type Action = "yes" | "no";

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
  const [failed, setFailed] = useState(false);
  const sentFor = useRef<string>("");

  function send(a: Action) {
    setFailed(false);
    fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, action: a, campaign }),
      keepalive: true,
    })
      .then((res) => {
        if (!res.ok) setFailed(true);
      })
      .catch(() => setFailed(true));
  }

  // Record the current choice once; re-records if they flip their answer.
  useEffect(() => {
    if (sentFor.current === current) return;
    sentFor.current = current;
    send(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const hi = firstName ? `, ${firstName}` : "";

  if (current === "yes") {
    return (
      <Card>
        <Badge tone="yes">
          <Check className="size-3.5" />
          Noted
        </Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] leading-tight">
          Wonderful{hi}.
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
        <Footer
          failed={failed}
          onRetry={() => send(current)}
          siteLabel="Want to learn more while you wait? Take a look around our site"
        >
          <button
            onClick={() => setCurrent("no")}
            className="text-[13px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Actually, not right now
          </button>
        </Footer>
      </Card>
    );
  }

  return (
    <Card>
      <Badge tone="no">
        <X className="size-3.5" />
        Noted
      </Badge>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] leading-tight">
        No problem{hi}.
      </h1>
      <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed">
        Thanks for letting me know — I won&apos;t follow up. If the timing
        changes down the track, the door stays open.
      </p>
      <Footer
        failed={failed}
        onRetry={() => send(current)}
        siteLabel="Curious to know more? You're welcome to look around our site"
      >
        <button
          onClick={() => setCurrent("yes")}
          className="text-[13px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Wait, I&apos;m interested after all
        </button>
      </Footer>
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

function Footer({
  failed,
  onRetry,
  siteLabel,
  children,
}: {
  failed: boolean;
  onRetry: () => void;
  siteLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6">
      {failed && (
        <p className="mb-3 text-[12px] text-muted-foreground">
          We had a little trouble saving that.{" "}
          <button onClick={onRetry} className="underline underline-offset-2 hover:text-foreground">
            Tap to retry
          </button>
          , or just reply to the email.
        </p>
      )}
      <a
        href="/"
        className="inline-flex items-center gap-1.5 text-[14px] font-medium hover:underline underline-offset-2"
        style={{ color: "var(--primary)" }}
      >
        {siteLabel}
        <ArrowRight className="size-4" />
      </a>
      <div className="mt-4">{children}</div>
    </div>
  );
}
