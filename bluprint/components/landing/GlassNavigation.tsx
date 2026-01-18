"use client";

import Link from "next/link";

export default function GlassNavigation() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-40 h-20">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center transition-transform group-hover:scale-105">
            <img
              src="/bluprintlog.png"
              alt="bluprint logo"
              className="h-12 w-12 object-contain"
            />
          </div>
          <span className="text-xl font-bold text-white">bluprint</span>
        </Link>

        {/* Glass Navigation Links */}
        <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-2 py-2 backdrop-blur-xl md:flex">
          <Link
            href="/my-bluprints"
            className="rounded-xl px-4 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
          >
            My Bluprints
          </Link>
          <Link
            href="/storage"
            className="rounded-xl px-4 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
          >
            Storage
          </Link>
          <Link
            href="/features"
            className="rounded-xl px-4 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
          >
            Features
          </Link>
        </div>

      </div>

      {/* Glass border bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </nav>
  );
}
