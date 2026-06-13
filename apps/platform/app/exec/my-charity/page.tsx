import type { Metadata } from "next";
import { ExecComingSoon } from "../_components/exec-coming-soon";

export const metadata: Metadata = {
  title: "My charity · TheGoodIntro",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ExecComingSoon title="My charity" body="Your standing nomination, its history, and the difference it has made will have a quiet home here." />;
}
