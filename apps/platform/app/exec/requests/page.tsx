import type { Metadata } from "next";
import { ExecComingSoon } from "../_components/exec-coming-soon";

export const metadata: Metadata = {
  title: "Requests · TheGoodIntro",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ExecComingSoon title="Requests" body="Every incoming request in one place, with the full context and one-tap accept, decline, or forward, arrives here." />;
}
