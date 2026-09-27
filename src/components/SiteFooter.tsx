// src/components/SiteFooter.tsx
import React from "react";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer
      className={
        "w-full border-t border-white/10 " +
        "px-4 sm:px-6 md:px-8 py-4 " +
        "bg-black/5 backdrop-blur-sm "
      }
    >
      <div className="max-w-[1850px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-y-2">
        {/* Left Links */}
        <nav className="flex items-center gap-x-4 sm:gap-x-6">
          <Link
            href="/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Docs
          </Link>
        </nav>

        {/* Right footer text */}
        <p className="text-sm text-white/60">Made with 🖤 by TP</p>
      </div>
    </footer>
  );
}
