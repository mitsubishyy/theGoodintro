/**
 * Email transport boundary (PRODUCTION_READINESS A1, provider per D-3: Resend).
 * The drain in sender.ts only ever talks to this interface, so the DB-backed
 * tests inject a fake transport and the provider is swappable without touching
 * the queue logic.
 */

export type EmailAttachment = {
  filename: string;
  /** Raw file bytes, base64-encoded. */
  contentBase64: string;
  contentType: string;
  /** Set to inline the attachment: the HTML references it as src="cid:<id>". */
  contentId?: string;
};

export type EmailMessage = {
  to: string;
  from: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
  attachments?: EmailAttachment[];
  /**
   * Stable per-notification key. Resend deduplicates on it (24h window), so a
   * drain that crashed after the provider accepted the send but before the
   * status write-back can be retried without double-sending.
   */
  idempotencyKey: string;
};

export type SendResult =
  | { ok: true; providerId: string }
  | { ok: false; error: string };

export type EmailTransport = (msg: EmailMessage) => Promise<SendResult>;

/** Real Resend transport over its REST API (no SDK dependency needed). */
export function resendTransport(apiKey: string): EmailTransport {
  return async (msg) => {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `notification/${msg.idempotencyKey}`,
        },
        body: JSON.stringify({
          from: msg.from,
          to: [msg.to],
          subject: msg.subject,
          html: msg.html,
          text: msg.text,
          ...(msg.replyTo ? { reply_to: [msg.replyTo] } : {}),
          ...(msg.attachments?.length
            ? {
                attachments: msg.attachments.map((a) => ({
                  filename: a.filename,
                  content: a.contentBase64,
                  content_type: a.contentType,
                  ...(a.contentId ? { content_id: a.contentId } : {}),
                })),
              }
            : {}),
        }),
      });
      const body = (await res.json().catch(() => null)) as
        | { id?: string; message?: string }
        | null;
      if (!res.ok || !body?.id) {
        return { ok: false, error: `resend ${res.status}: ${body?.message ?? "unknown error"}` };
      }
      return { ok: true, providerId: body.id };
    } catch (e) {
      return { ok: false, error: `resend fetch failed: ${e instanceof Error ? e.message : String(e)}` };
    }
  };
}
