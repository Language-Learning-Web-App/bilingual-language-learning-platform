"use client";

import Link from "next/link";
import { Languages } from "lucide-react";

const footerLinks = [
  { label: "Features", href: "#features" },
  { label: "Languages", href: "#languages" },
  { label: "Terms & Privacy Policy", href: "/terms-privacy" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/50">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        {/* Top row: logo + links */}
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Languages className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              BLLP<span className="text-primary">-AI</span>
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex flex-wrap items-center justify-center gap-8">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Divider + copyright */}
        <div className="mt-10 border-t border-border/60 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} All rights reserved by BLLP-AI.
          </p>
        </div>
      </div>
    </footer>
  );
}
