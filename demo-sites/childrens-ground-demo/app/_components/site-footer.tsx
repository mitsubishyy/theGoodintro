"use client";

import Image from "next/image";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="hp-footer">
      <div className="hp-footer-grid">
        <div className="hp-footer-brand">
          <Link href="/" className="hp-brand" aria-label="TheGoodIntro home">
            <Image
              src="/brand/wordmark.png"
              alt="TheGoodIntro"
              width={750}
              height={168}
              className="h-8 w-auto"
            />
          </Link>
          <p className="hp-footer-tag">
            Senior introductions that fund Australian charities.
          </p>
        </div>

        <div className="hp-footer-contact">
          <p className="hp-footer-meta">&copy; 2026 TheGoodIntro</p>
        </div>
      </div>
    </footer>
  );
}
