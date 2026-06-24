"use client";

import { useState } from "react";
import WaitlistForm from "../waitlist/waitlist-form";

// On the wall, the "Join the waitlist" button reveals the exact site waitlist
// form in place (the real /waitlist page is behind the wall, so we cannot link
// to it). Button markup mirrors the site's SecondaryCta (hp-btn-ghost + the
// circle-arrow), with the circle in emerald.
export default function WaitlistCta() {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <div className="text-left">
        <WaitlistForm />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="hp-btn-ghost cursor-pointer"
      style={{ fontFamily: "inherit" }}
    >
      Join the waitlist
      <span
        className="circle"
        aria-hidden="true"
        style={{ background: "var(--primary)", color: "#ffffff" }}
      >
        <svg viewBox="0 0 14 14" fill="none">
          <path
            d="M3 11 L11 3 M5 3 H11 V9"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}
