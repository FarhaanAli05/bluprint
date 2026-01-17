"use client";

import Card from "@/components/Card";
import type { CreationMethod } from "@/types/room.types";
import { Camera, Ruler, Sparkles, Zap } from "lucide-react";

interface MethodSelectorProps {
  onSelect: (method: CreationMethod) => void;
}

export default function MethodSelector({ onSelect }: MethodSelectorProps) {
  return (
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
            Take photos or record a video of your room from multiple angles. Our AI will analyze the space and generate a 3D model.
          </p>
          
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span>AI-powered room analysis</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Zap className="h-4 w-4 text-blue-400" />
              <span>Automatic dimension detection</span>
            </div>
          </div>
          
          <div className="mt-6 flex items-center gap-2">
            <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
              Recommended
            </span>
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
  );
}
