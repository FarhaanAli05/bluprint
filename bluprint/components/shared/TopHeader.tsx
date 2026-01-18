"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TopToolbar from "@/components/3d-viewer/TopToolbar";

interface TopHeaderProps {
  title: string;
  showGrid: boolean;
  showBlueprint: boolean;
  showShadows: boolean;
  autoRotate: boolean;
  onToggleGrid: () => void;
  onToggleBlueprint: () => void;
  onToggleShadows: () => void;
  onToggleAutoRotate: () => void;
  onResetView: () => void;
  onResetDemo: () => void;
  backHref?: string;
}

/**
 * Unified header component for demo/project pages:
 * - Back to home link
 * - Title only (no icon, no dimensions)
 * - Top toolbar controls (Orbit/Grid/Shadows/Reset/Blueprint)
 * - Reset Demo button
 */
export default function TopHeader({
  title,
  showGrid,
  showBlueprint,
  showShadows,
  autoRotate,
  onToggleGrid,
  onToggleBlueprint,
  onToggleShadows,
  onToggleAutoRotate,
  onResetView,
  onResetDemo,
  backHref = "/",
}: TopHeaderProps) {
  return (
    <header className="relative z-20 flex h-14 items-center justify-between gap-4 border-b border-white/10 bg-white/5 px-6 backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200 transition-colors hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to home</span>
        </Link>
        <h1 className="truncate font-semibold text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <TopToolbar
          showGrid={showGrid}
          showBlueprint={showBlueprint}
          showShadows={showShadows}
          autoRotate={autoRotate}
          onToggleGrid={onToggleGrid}
          onToggleBlueprint={onToggleBlueprint}
          onToggleShadows={onToggleShadows}
          onToggleAutoRotate={onToggleAutoRotate}
          onResetView={onResetView}
        />
        <button
          onClick={onResetDemo}
          className="cursor-pointer rounded-full border border-red-400/20 bg-red-500/20 px-4 py-2 text-xs text-red-100 transition-colors hover:bg-red-500/30"
        >
          Reset Demo
        </button>
      </div>
    </header>
  );
}
