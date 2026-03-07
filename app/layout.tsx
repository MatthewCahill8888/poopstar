import type { Metadata } from "next";
import Link from "next/link";

import { AuthPanel } from "@/components/AuthPanel";
import "./globals.css";

export const metadata: Metadata = {
  title: "Poopstar — Be the next Poopstar",
  description: "Post brainrot cartoon poops, claim toilets, rate places. Social media for the bathroom.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="top-bar">
            <Link href="/" className="brand">
              Poopstar
            </Link>
            <AuthPanel />
          </header>
          <main className="main-wrap">{children}</main>
          <nav className="bottom-nav">
            <Link href="/" className="nav-pill">
              Feed
            </Link>
            <Link href="/post" className="nav-pill">
              Post
            </Link>
            <Link href="/toilets" className="nav-pill">
              Toilets
            </Link>
          </nav>
        </div>
      </body>
    </html>
  );
}
