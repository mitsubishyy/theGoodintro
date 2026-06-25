import type { Metadata } from "next";
import { Wordmark } from "@thegoodintro/ui";
import { createClient } from "@/lib/supabase/server";
import { indicativeGiftAud } from "@/lib/gift-amount";
import { ActionRunner, type ActionPageData } from "./action-views";

/**
 * The email action pages (exec-request-email lock 2026-06-12, VP2-VP4):
 * standalone public template on warm cream, wordmark centered top, NO portal
 * chrome, content centered in a 390px-first column, tap targets 48px+.
 *
 * Act-instantly pattern: the email button's link carries ?intent=...; this
 * page validates the token with the inert read, then the client fires the
 * committing action immediately and reports the done state (VP2 accept /
 * VP3 decline + optional reason / VP4 send-to-EA + optional note). The
 * consent footnote renders only when the inert read says the exec had no
 * consent record before this action.
 */

export const metadata: Metadata = {
  title: "A request for your time — TheGoodIntro",
  robots: { index: false, follow: false },
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="min-h-screen px-6 py-12 flex flex-col items-center"
      style={{ background: "var(--cream-1, #f6f2e8)", color: "var(--portal-ink)" }}
    >
      <Wordmark size={17} />
      <div className="w-full max-w-[390px] mt-12">{children}</div>
    </main>
  );
}

function Quiet({ title, body }: { title: string; body: string }) {
  return (
    <div className="text-center">
      <h1
        className="text-[26px] leading-tight font-semibold"
        style={{ fontFamily: "var(--font-display), Georgia, serif", letterSpacing: "-0.01em" }}
      >
        {title}
      </h1>
      <p
        className="mt-3 text-[14px] leading-relaxed"
        style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", color: "var(--muted-foreground)" }}
      >
        {body}
      </p>
    </div>
  );
}

export default async function ActionPage({
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
        <Quiet
          title="This link is not valid."
          body="The request may have been withdrawn. Just reply to the email if you have questions. It reaches a real person."
        />
      </Shell>
    );
  }

  // An expired link (90-day backstop) returns a row that carries ONLY is_expired
  // — no request details — so we never reveal who/what to a stale link. Route to
  // the human follow-up path; a fresh link is reissued from there.
  if (row.is_expired) {
    return (
      <Shell>
        <Quiet
          title="This link has expired."
          body="For security, action links stop working after a while. Just reply to the email and we will send a fresh one. It reaches a real person."
        />
      </Shell>
    );
  }

  const intentVal: "accept" | "decline" | "send_to_ea" | null =
    intent === "accept" || intent === "decline" || intent === "send_to_ea" ? intent : null;

  // Forward needs an active token; accept/decline also need an open request.
  const tokenActive = row.token_status === "active";
  const requestOpen = row.request_status === "submitted";
  const actionable =
    intentVal === "send_to_ea" ? tokenActive && Boolean(row.ea_name) : tokenActive && requestOpen;

  if (!intentVal) {
    // A bare tokened URL (no button intent). Don't act on ambiguity; point
    // back at the email's three buttons rather than inventing a chooser.
    return (
      <Shell>
        <Quiet
          title="Almost there."
          body="Please use the Accept, Decline, or Send buttons in the email itself. Questions? Just reply to it. It reaches a real person."
        />
      </Shell>
    );
  }

  if (!actionable) {
    return (
      <Shell>
        <Quiet
          title="Already taken care of."
          body="This request has been actioned. Nothing further is needed. Questions? Just reply to the email."
        />
      </Shell>
    );
  }

  const pageData: ActionPageData = {
    requesterFirst: ((row.requester_name as string | null) ?? "The requester").split(/\s+/)[0] || "They",
    eaName: (row.ea_name as string | null) ?? null,
    charityName: (row.charity_name as string | null) ?? "your chosen charity",
    indicativeAmount: indicativeGiftAud((row.held_count as number | null) ?? 0),
    hasConsent: Boolean(row.has_consent),
  };

  return (
    <Shell>
      <ActionRunner token={token} intent={intentVal} data={pageData} />
    </Shell>
  );
}
