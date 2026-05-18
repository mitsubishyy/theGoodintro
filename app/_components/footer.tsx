import Link from "next/link";
import { CALENDLY_URL } from "@/lib/config";
import { LogoMark } from "./icons";

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="fcols">
          <div>
            <Link href="/" className="logo">
              <LogoMark />
              The<span>Big</span>Intro
            </Link>
            <p style={{ marginTop: 14, maxWidth: "34ch", fontSize: "0.94rem" }}>
              Relevant senior meetings that fund real giving. Australia first,
              invite only.
            </p>
          </div>
          <div>
            <strong>Explore</strong>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/executives">For executives</Link>
            <Link href="/vendors">For vendors</Link>
            <Link href="/about">About</Link>
            <Link href="/opportunity">Partner with us</Link>
          </div>
          <div>
            <strong>Legal</strong>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <a href={CALENDLY_URL}>Contact</a>
          </div>
        </div>
        <div className="fnote">
          TheBigIntro · relevant senior meetings that fund real giving
        </div>
      </div>
    </footer>
  );
}
