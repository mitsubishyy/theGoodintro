import type { Metadata } from "next";
import { ExecComingSoon } from "../_components/exec-coming-soon";

export const metadata: Metadata = {
  title: "Profile · TheGoodIntro",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ExecComingSoon title="Profile" body="Your details, business context, calendar, and executive assistant settings will be editable here." />;
}
