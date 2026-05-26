import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { charityShareCentsForMeetingNumber } from "@thegoodintro/pricing";
import { formatAud } from "@/lib/format";
import { ConfirmForm } from "./confirm-form";

export const metadata: Metadata = {
  title: "An introduction worth your time — theGoodintro",
  robots: { index: false, follow: false },
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16" style={{ background: "var(--portal-page)", color: "var(--foreground)" }}>
      <div className="w-full max-w-lg rounded-2xl border p-8" style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}>
        {children}
      </div>
    </main>
  );
}

export default async function ConfirmPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ intent?: string }>;
}) {
  const { token } = await params;
  const { intent } = await searchParams;

  const supabase = await createClient();
  const { data } = await supabase.rpc("get_request_for_token", { p_token: token });
  const row = Array.isArray(data) ? data[0] : null;

  if (!row) {
    return (
      <Shell>
        <h1 className="text-lg font-semibold">This link is not valid</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
          The request may have been withdrawn. Please reply to the email if you have questions.
        </p>
      </Shell>
    );
  }

  if (row.token_status !== "active" || row.request_status !== "submitted") {
    return (
      <Shell>
        <h1 className="text-lg font-semibold">This request has already been actioned</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Nothing further is needed. Thank you.
        </p>
      </Shell>
    );
  }

  const indicative = formatAud(charityShareCentsForMeetingNumber((row.held_count ?? 0) + 1));
  const intentVal: "accept" | "decline" | "send_to_ea" =
    intent === "decline" ? "decline" : intent === "send_to_ea" ? "send_to_ea" : "accept";

  return (
    <Shell>
      <p className="font-mono text-xs uppercase tracking-[0.18em]" style={{ color: "var(--portal-amber-ink)" }}>
        An introduction worth your time
      </p>
      <h1 className="mt-1 text-xl font-semibold tracking-tight">
        {row.vendor_name} would like to meet {row.exec_name}
      </h1>

      <dl className="mt-5 flex flex-col gap-4 text-sm">
        <div>
          <dt className="font-medium">What they would like to talk about</dt>
          <dd className="mt-0.5" style={{ color: "var(--muted-foreground)" }}>{row.q1}</dd>
        </div>
        <div>
          <dt className="font-medium">Why it is relevant to you</dt>
          <dd className="mt-0.5" style={{ color: "var(--muted-foreground)" }}>{row.q2}</dd>
        </div>
      </dl>

      <p className="mt-5 rounded-lg px-4 py-3 text-sm" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}>
        One 45-minute conversation. If you take it, {row.vendor_name} sends about{" "}
        <strong>{indicative}</strong> to {row.charity_name ?? "your chosen charity"}.
      </p>

      <div className="mt-6">
        <ConfirmForm token={token} intent={intentVal} />
      </div>
    </Shell>
  );
}
