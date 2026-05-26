"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Phase = "idle" | "enrolling" | "verifying" | "done";

export function EnrollTotp() {
  const supabase = createClient();
  const [phase, setPhase] = useState<Phase>("idle");
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function begin() {
    setMessage(null);
    setPhase("enrolling");
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `admin-${Date.now()}`,
    });
    if (error) {
      setMessage(error.message);
      setPhase("idle");
      return;
    }
    setQr(data.totp.qr_code);
    setSecret(data.totp.secret);
    setFactorId(data.id);
    setPhase("verifying");
  }

  async function confirm() {
    if (!factorId) return;
    setMessage(null);
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: code.trim(),
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    setPhase("done");
    setMessage("Authenticator enrolled. Two-factor is active on this account.");
  }

  if (phase === "done") {
    return (
      <p className="text-sm" style={{ color: "var(--primary)" }}>
        {message}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {phase === "idle" || phase === "enrolling" ? (
        <button
          onClick={begin}
          disabled={phase === "enrolling"}
          className="self-start rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
          style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}
        >
          {phase === "enrolling" ? "Preparing…" : "Set up authenticator app"}
        </button>
      ) : null}

      {phase === "verifying" && qr ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Scan this with your authenticator app, then enter the 6-digit code.
          </p>
          <div
            className="w-44 rounded-lg border bg-white p-2"
            style={{ borderColor: "var(--portal-line)" }}
            // Supabase returns the TOTP QR as an SVG string.
            dangerouslySetInnerHTML={{ __html: qr }}
          />
          {secret ? (
            <p className="font-mono text-xs" style={{ color: "var(--muted-foreground)" }}>
              Or enter this key manually: {secret}
            </p>
          ) : null}
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
            placeholder="123456"
            className="w-40 rounded-lg border px-3 py-2.5 text-sm tracking-[0.3em] outline-none"
            style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}
          />
          <button
            onClick={confirm}
            className="self-start rounded-lg px-4 py-2.5 text-sm font-semibold"
            style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}
          >
            Verify and activate
          </button>
        </div>
      ) : null}

      {message ? (
        <p className="text-sm" style={{ color: "var(--portal-amber-ink)" }}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
