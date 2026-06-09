"use client";

import { useEffect, useState } from "react";

/**
 * Renders a relative timestamp ("just now" / "2 min ago" / "14 min ago" /
 * "1 hr ago") for the Admin Dashboard H1 sub-line, ticking forward every 30s
 * on the client. The server stamps the absolute `since` ISO at page load
 * (Admin Dashboard README 2026-06-09 "Last refreshed 2 min ago" decision:
 * page-load timestamp, client-relative).
 *
 * SSR-safe: renders the same initial label on the server and the first client
 * paint to avoid hydration drift; the interval starts only after mount.
 */

export function LastRefreshed({ since }: { since: string }) {
  const [now, setNow] = useState<number>(() => new Date(since).getTime());

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const diffMs = Math.max(0, now - new Date(since).getTime());
  return <>last refreshed {formatRelative(diffMs)}</>;
}

function formatRelative(diffMs: number): string {
  const sec = Math.floor(diffMs / 1000);
  if (sec < 45) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 1) return "just now";
  if (min === 1) return "1 min ago";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr === 1) return "1 hr ago";
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "1 day ago";
  return `${day} days ago`;
}
