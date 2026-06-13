import type { Metadata } from "next";
import { ExecComingSoon } from "../_components/exec-coming-soon";

export const metadata: Metadata = {
  title: "Impact · TheGoodIntro",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ExecComingSoon title="Impact" body="The full record of every gift your meetings have sent, by charity and over time, arrives here." />;
}
