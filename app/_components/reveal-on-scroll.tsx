"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Drives the .reveal entrance animation with IntersectionObserver so it
// fires in every browser (the old CSS `animation-timeline: view()` did
// not run in Safari / Firefox / iOS). Content is visible by default;
// the hidden state in globals.css only applies under `html.motion-ready`
// (set pre-paint by the inline script in layout, skipped when the user
// prefers reduced motion). If JS fails, nothing is ever hidden.
export function RevealOnScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const els = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal:not(.is-in)"),
    );
    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );

    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
