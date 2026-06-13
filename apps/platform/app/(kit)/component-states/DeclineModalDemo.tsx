"use client";

import { useState } from "react";
import { Button } from "@thegoodintro/ui";
import { DeclineRequestModal } from "../../exec/_components/decline-request-modal";

/**
 * Kit-reference demo of the VP5 portal decline modal (exec-request-email lock
 * 2026-06-12) so it can be QA'd before its host, the exec-incoming-requests
 * port, lands. Demo only: "Decline request" just closes and reports the
 * picked reason inline; the real host wires it to the decline action.
 */
export function DeclineModalDemo() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState<string | null>(null);
  return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Open decline modal
      </Button>
      {last !== null && (
        <p className="mt-2 text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
          Last demo decline reason: {last === "" ? "(none picked)" : last}
        </p>
      )}
      <DeclineRequestModal
        open={open}
        requesterFirst="Sam"
        onCancel={() => setOpen(false)}
        onDecline={(reason) => {
          setLast(reason ?? "");
          setOpen(false);
        }}
      />
    </div>
  );
}
