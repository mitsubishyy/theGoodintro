import { charityShareCentsForMeetingNumber } from "@thegoodintro/pricing";
import { formatAud } from "./format";

/**
 * The indicative gift for a vendor's NEXT meeting: the band amount at
 * position heldCount + 1 (CALCULATIONS band schedule). The exec request email
 * and the /e/[token] action pages MUST both render this one string so the
 * pages never contradict the email that linked to them, and anywhere an exec
 * reads it the figure is ALWAYS prefixed "approximately" (exec-request-email
 * lock 2026-06-12; the band itself never renders to an exec). The final
 * amount is still the one frozen on the GiftRecord at held.
 */
export function indicativeGiftAud(heldCount: number): string {
  return formatAud(charityShareCentsForMeetingNumber(heldCount + 1));
}
