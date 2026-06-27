import type { Tone } from "@thegoodintro/ui";

/**
 * Request loop status (DATA_MODEL.md / STATE_MACHINES.md `request_status`). This
 * surface is READ-ONLY loop visibility: it never sets a status, it only labels
 * one. The transitions themselves live in the request RPCs (act_on_request_token,
 * close_request); nothing here moves state.
 */
export type RequestStatusEnum = "submitted" | "accepted" | "declined" | "closed";

export const REQUEST_STATUSES: RequestStatusEnum[] = [
  "submitted",
  "accepted",
  "declined",
  "closed",
];

/**
 * Status -> pill label + tone. submitted = awaiting Issy's review (amber, the
 * one driveable triage tone the dashboard widget also uses); accepted =
 * progressing to a meeting (green); declined = the exec said no (danger); closed
 * = admin housekeeping for a stale/withdrawn request (muted).
 */
export function requestStatusPill(status: RequestStatusEnum): { label: string; tone: Tone } {
  switch (status) {
    case "submitted":
      return { label: "Submitted", tone: "amber" };
    case "accepted":
      return { label: "Accepted", tone: "green" };
    case "declined":
      return { label: "Declined", tone: "danger" };
    case "closed":
      return { label: "Closed", tone: "muted" };
  }
}
