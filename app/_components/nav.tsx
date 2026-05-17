import Link from "next/link";
import { CallButton } from "./call-button";

export function Nav() {
  return (
    <>
      <div className="topbar" />
      <div className="wrap">
        <nav>
          <Link href="/" className="logo">
            The<span>Big</span>Intro
          </Link>
          <div className="nlinks">
            <Link href="/how-it-works">How it works</Link>
            <Link href="/executives">For executives</Link>
            <Link href="/vendors">For vendors</Link>
            <CallButton>Apply</CallButton>
          </div>
        </nav>
      </div>
    </>
  );
}
