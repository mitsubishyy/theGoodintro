import type { Metadata } from "next";
import { getFlag } from "@/lib/flags";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getConnectionStatus,
  isXeroConfigured,
  type XeroConnectionStatus,
} from "@/lib/integrations/xero";
import { formatDate } from "@/lib/format";
import { startXeroConnectAction } from "./actions";

export const metadata: Metadata = {
  title: "Settings — TheGoodIntro admin",
  robots: { index: false, follow: false },
};

const BANNERS: Record<string, { tone: "ok" | "error" | "warn"; text: string }> = {
  connected: { tone: "ok", text: "Xero connected." },
  error: { tone: "error", text: "Could not connect to Xero. Please try again." },
  state_mismatch: {
    tone: "error",
    text: "Security check failed (state mismatch). Please try again.",
  },
  not_configured: {
    tone: "error",
    text: "Xero API keys are missing from the environment (.env.local).",
  },
  no_tenant: { tone: "error", text: "No Xero organisation was authorised on that account." },
  disabled: { tone: "warn", text: "The Xero integration flag is off." },
};

const TONE: Record<string, { bg: string; fg: string }> = {
  ok: { bg: "var(--mint-tint, #e7f3ec)", fg: "var(--primary, #1f6f43)" },
  error: { bg: "#fbe9e9", fg: "#9a2c2c" },
  warn: { bg: "var(--portal-amber-tint, #fbf2dd)", fg: "var(--portal-amber-ink, #8a5a00)" },
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ xero?: string }>;
}) {
  const { xero } = await searchParams;
  const banner = xero ? BANNERS[xero] : undefined;

  const flagOn = await getFlag("integrations_xero");
  const configured = isXeroConfigured();
  const admin = createAdminClient();
  const status: XeroConnectionStatus = admin
    ? await getConnectionStatus(admin)
    : { connected: false, tenantName: null, connectedAt: null, expiresAt: null };

  const canConnect = flagOn && configured;
  const redirectUri = process.env.XERO_REDIRECT_URI ?? "(not set)";

  return (
    <div className="max-w-3xl px-8 py-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 mb-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
        Integrations and platform configuration.
      </p>

      {banner && (
        <div
          className="mb-6 rounded-lg px-4 py-3 text-sm"
          style={{ background: TONE[banner.tone].bg, color: TONE[banner.tone].fg }}
        >
          {banner.text}
        </div>
      )}

      <h2
        className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em]"
        style={{ color: "var(--muted-foreground)" }}
      >
        Integrations
      </h2>

      <div
        className="rounded-xl border p-5"
        style={{ borderColor: "var(--portal-line)", background: "var(--portal-card)" }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold">Xero</span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px]"
              style={{
                background: status.connected ? "var(--mint-tint, #e7f3ec)" : "var(--portal-page)",
                color: status.connected ? "var(--primary, #1f6f43)" : "var(--muted-foreground)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: status.connected ? "var(--primary, #1f6f43)" : "var(--muted-foreground)" }}
              />
              {status.connected ? "Connected" : "Not connected"}
            </span>
          </div>
        </div>

        <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Issues vendor tax invoices and unlocks meeting credits when a payment clears (DEC-13).
        </p>

        {status.connected && (
          <p className="mt-3 text-sm">
            Connected to <strong>{status.tenantName ?? "your Xero organisation"}</strong>
            {status.connectedAt ? ` · since ${formatDate(status.connectedAt)}` : ""}.
          </p>
        )}

        <div className="mt-4 flex items-center gap-3">
          {canConnect ? (
            <form action={startXeroConnectAction}>
              <button
                type="submit"
                className="rounded-lg px-4 py-2 text-sm font-medium"
                style={{ background: "var(--foreground)", color: "var(--background)" }}
              >
                {status.connected ? "Reconnect Xero" : "Connect Xero"}
              </button>
            </form>
          ) : (
            <p
              className="rounded-lg px-3 py-2 text-xs"
              style={{ background: "var(--portal-page)", color: "var(--muted-foreground)" }}
            >
              {!flagOn
                ? "Turn on the integrations_xero feature flag to enable connecting."
                : "Add XERO_CLIENT_ID, XERO_CLIENT_SECRET and XERO_REDIRECT_URI to .env.local."}
            </p>
          )}
        </div>

        <p className="mt-4 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
          Redirect URI (must match the one registered in the Xero app exactly):{" "}
          <code>{redirectUri}</code>
        </p>
      </div>
    </div>
  );
}
