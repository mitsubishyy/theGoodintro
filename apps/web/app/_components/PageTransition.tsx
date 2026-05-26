"use client";

import { usePathname } from "next/navigation";

/* Re-runs a gentle fade-and-rise on every route change by keying the
   wrapper on the pathname. The animation itself lives in globals.css
   (.page-enter) and is disabled under prefers-reduced-motion. */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
