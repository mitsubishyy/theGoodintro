/**
 * Pure validation / normalisation for the admin "new meeting" form (no DB, no
 * request). Kept side-effect-free so it is unit-testable locally; the action
 * feeds it the raw FormData strings and passes the result to createProposedMeeting.
 */

export interface NewMeetingInput {
  vendorId: string;
  executiveId: string;
  charityId: string; // "" = use the executive's default
  q1What: string;
  q2Why: string;
  scheduledAt: string; // datetime-local or ISO; "" = leave proposed
  joinUrl: string;
}

export interface ParsedNewMeeting {
  vendorId: string;
  executiveId: string;
  charityId: string | null;
  q1What: string;
  q2Why: string;
  scheduledAtISO: string | null;
  joinUrl: string | null;
}

// request.q1_what / q2_why are NOT NULL with a 300-char check, so a manual create
// needs non-empty values within bounds even when the admin leaves them blank.
const DEFAULT_Q1 = "Introductory meeting arranged by TheGoodIntro.";
const DEFAULT_Q2 = "Scheduled directly by the admin team.";
const MAX_LEN = 300;

export function parseNewMeetingForm(
  input: NewMeetingInput,
): { ok: true; value: ParsedNewMeeting } | { ok: false; error: string } {
  const vendorId = input.vendorId.trim();
  const executiveId = input.executiveId.trim();
  if (!vendorId) return { ok: false, error: "Pick a vendor." };
  if (!executiveId) return { ok: false, error: "Pick an executive." };

  const q1What = (input.q1What.trim() || DEFAULT_Q1).slice(0, MAX_LEN);
  const q2Why = (input.q2Why.trim() || DEFAULT_Q2).slice(0, MAX_LEN);

  let scheduledAtISO: string | null = null;
  const when = input.scheduledAt.trim();
  if (when) {
    const d = new Date(when);
    if (Number.isNaN(d.getTime())) return { ok: false, error: "That meeting time is not a valid date." };
    scheduledAtISO = d.toISOString();
  }

  return {
    ok: true,
    value: {
      vendorId,
      executiveId,
      charityId: input.charityId.trim() || null,
      q1What,
      q2Why,
      scheduledAtISO,
      joinUrl: input.joinUrl.trim() || null,
    },
  };
}
