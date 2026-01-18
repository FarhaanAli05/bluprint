"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import GlassNavigation from "./GlassNavigation";
import MouseSpotlight from "./MouseSpotlight";

// Dynamically import Extension Demo to avoid SSR issues
const ExtensionDemo = dynamic(() => import("./ExtensionDemo"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-16 w-16 animate-pulse rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20" />
    </div>
  ),
});

export default function LandingHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0b0f1a]">
      {/* Blurred blueprint background */}
      <div
        className="absolute inset-0 scale-110 bg-[url('/blueback.png')] bg-cover bg-center blur-[1px]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#0b0f1a]/80 via-[#0b0f1a]/60 to-[#0f172a]/80"
        aria-hidden="true"
      />

      {/* Mouse spotlight */}
      {mounted && <MouseSpotlight />}

      {/* Navigation */}
      <GlassNavigation />

      {/* Main content - Split layout */}
      <main className="relative z-10 flex h-full items-center px-6 pt-20 lg:px-16">
        <div className="mx-auto flex h-full w-full max-w-7xl flex-col items-center gap-8 lg:flex-row lg:gap-16">
          {/* Left side - Hero content */}
          <div className="flex flex-1 flex-col justify-center lg:max-w-xl">
            {/* Headline */}
            <h1
              className={`text-4xl font-bold leading-tight tracking-tight text-white transition-all delay-100 duration-700 sm:text-5xl lg:text-6xl ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                Cursor for
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Interior Design
              </span>
            </h1>

            {/* Subheading */}
            <p
              className={`mt-6 max-w-lg text-lg leading-relaxed text-white/60 transition-all delay-200 duration-700 ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              Upload photos of your room. Drag furniture from the web. 
              Preview stunning 3D layouts in minutes with AI-powered visualization.
            </p>

            {/* CTA Buttons */}
            <div
              className={`mt-8 flex flex-col gap-4 sm:flex-row transition-all delay-300 duration-700 ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              {/* Primary CTA */}
              <Link
                href="/upload"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-violet-500/30 transition-all hover:scale-105 hover:shadow-violet-500/40"
              >
                <span className="relative z-10">Start Designing</span>
                <svg
                  className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>

              {/* Secondary CTA */}
              <Link
                href="/demo-room"
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10"
              >
                <svg
                  className="h-5 w-5 text-white/70"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                See Demo
              </Link>
            </div>

          </div>

          {/* Right side - Extension Demo */}
          <div
            className={`relative h-[400px] w-full flex-1 lg:h-[500px] transition-all delay-200 duration-1000 ${
              mounted ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            {/* Glass container for Demo */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
              <ExtensionDemo />
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
