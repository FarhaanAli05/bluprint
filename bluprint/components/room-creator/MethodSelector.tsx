"use client";

import Link from "next/link";
import Card from "@/components/Card";
import type { CreationMethod } from "@/types/room.types";
import { Camera, Ruler, Sparkles, Zap, Wand2, ArrowRight } from "lucide-react";

interface MethodSelectorProps {
  onSelect: (method: CreationMethod) => void;
}

export default function MethodSelector({ onSelect }: MethodSelectorProps) {
  return (
    <div className="space-y-6">
      {/* AI Photo-to-3D Feature Banner */}
      <Link href="/photo-to-3d" className="group block">
        <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 p-6 transition-all hover:border-purple-400/50 hover:shadow-[0_24px_60px_rgba(139,92,246,0.25)]">
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 text-purple-300 ring-1 ring-purple-400/30">
                <Wand2 className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold text-white group-hover:text-purple-200">
                    AI Photo-to-3D
                  </h3>
                  <span className="rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-2 py-0.5 text-xs font-semibold text-white">
                    NEW
                  </span>
                </div>
                <p className="mt-1 text-slate-300">
                  Upload room photos and let AI instantly generate an interactive 3D model
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-purple-300 group-hover:text-purple-200">
              <span className="text-sm font-medium">Try it now</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          <div className="relative mt-4 flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-purple-400" />
              Claude AI vision
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-purple-400" />
              10-15 second generation
            </span>
            <span className="flex items-center gap-1.5">
              <Camera className="h-4 w-4 text-purple-400" />
              Works with any room
            </span>
          </div>
        </div>
      </Link>

      <div className="relative flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
        <span className="text-sm text-slate-500">or start from scratch</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Method */}
        <button
          type="button"
          onClick={() => onSelect("upload")}
          className="group text-left"
        >
          <Card className="h-full p-8 transition-all group-hover:border-blue-400/40 group-hover:shadow-[0_24px_60px_rgba(59,130,246,0.2)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-300 ring-1 ring-white/10">
              <Camera className="h-7 w-7" />
            </div>
            
            <h3 className="mt-6 text-xl font-semibold text-white group-hover:text-blue-200">
              Upload Photos or Video
            </h3>
            
            <p className="mt-2 text-slate-300">
              Upload media for basic processing. For AI-powered generation, use Photo-to-3D above.
            </p>
            
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span>Basic room setup</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Zap className="h-4 w-4 text-blue-400" />
                <span>Manual refinement</span>
              </div>
            </div>
            
            <div className="mt-6 flex items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                JPG, PNG, MP4
              </span>
            </div>
          </Card>
        </button>

      {/* Manual Method */}
      <button
        type="button"
        onClick={() => onSelect("manual")}
        className="group text-left"
      >
        <Card className="h-full p-8 transition-all group-hover:border-emerald-400/40 group-hover:shadow-[0_24px_60px_rgba(16,185,129,0.15)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-300 ring-1 ring-white/10">
            <Ruler className="h-7 w-7" />
          </div>
          
          <h3 className="mt-6 text-xl font-semibold text-white group-hover:text-emerald-200">
            Enter Dimensions Manually
          </h3>
          
          <p className="mt-2 text-slate-300">
            Input your room measurements directly. Perfect if you already know your room dimensions or prefer precise control.
          </p>
          
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Precise measurements</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Custom room shapes</span>
            </div>
          </div>
          
          <div className="mt-6 flex items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              Feet or Meters
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              Room presets
            </span>
          </div>
        </Card>
      </button>
      </div>
    </div>
  );
}
