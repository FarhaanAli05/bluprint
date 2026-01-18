"use client";

import Link from "next/link";

export default function GlassNavigation() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-40 h-20">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-lg shadow-violet-500/25 transition-transform group-hover:scale-105">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6 text-white"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
              />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">BluPrint</span>
        </Link>

        {/* Glass Navigation Links */}
        <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-2 py-2 backdrop-blur-xl md:flex">
          <Link
            href="/dashboard"
            className="rounded-xl px-4 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
          >
            Dashboard
          </Link>
          <Link
            href="/demo/dorm-room"
            className="rounded-xl px-4 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
          >
            Demo
          </Link>
          <Link
            href="#features"
            className="rounded-xl px-4 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
          >
            Features
          </Link>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden text-sm font-medium text-white/70 transition-colors hover:text-white sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/demo/dorm-room"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-violet-500/30"
          >
            <span className="relative z-10">Start Designing</span>
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        </div>
      </div>

      {/* Glass border bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </nav>
  );
}
