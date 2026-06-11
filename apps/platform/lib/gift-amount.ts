import { charityShareCentsForMeetingNumber } from "@thegoodintro/pricing";
import { formatAud } from "./format";

/**
 * The indicative gift for a vendor's NEXT meeting: the exact band amount at
 * position heldCount + 1 (CALCULATIONS band schedule; the amount at a given
 * position is deterministic, so it renders exact, never "about"). The exec
 * request email and the /e/[token] confirm page MUST both render this one
 * string so the page never contradicts the email that linked to it. The
 * final amount is still the one frozen on the GiftRecord at held.
 */
export function indicativeGiftAud(heldCount: number): string {
  return formatAud(charityShareCentsForMeetingNumber(heldCount + 1));
}
