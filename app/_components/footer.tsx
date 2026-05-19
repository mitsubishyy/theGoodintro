import Link from "next/link";
import { CALENDLY_URL } from "@/lib/config";
import { Wordmark } from "./wordmark";

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="fcols">
          <div className="fbrand">
            <Link href="/" className="logo" aria-label="theBigintro home">
              <Wordmark />
            </Link>
            <p>
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
