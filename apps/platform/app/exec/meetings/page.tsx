import type { Metadata } from "next";
import { ExecComingSoon } from "../_components/exec-coming-soon";

export const metadata: Metadata = {
  title: "Meetings · TheGoodIntro",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ExecComingSoon title="Meetings" body="Every meeting you have taken and the ones coming up, with the gift each one sent, will live here." />;
}
