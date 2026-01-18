"use client";

import { Eye, Grid3x3, Maximize2, RotateCcw, Sun } from "lucide-react";

interface ViewerToolbarProps {
  showGrid: boolean;
  showBlueprint: boolean;
  showShadows: boolean;
  autoRotate: boolean;
  onToggleGrid: () => void;
  onToggleBlueprint: () => void;
  onToggleShadows: () => void;
  onToggleAutoRotate: () => void;
  onResetView: () => void;
}

export default function ViewerToolbar({
  showGrid,
  showBlueprint,
  showShadows,
  autoRotate,
  onToggleGrid,
  onToggleBlueprint,
  onToggleShadows,
  onToggleAutoRotate,
  onResetView,
}: ViewerToolbarProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-slate-900/90 backdrop-blur px-2 py-1.5 shadow-lg">
      {/* Orbit toggle */}
      <button
        onClick={onToggleAutoRotate}
        className={`group relative rounded-md px-3 py-1.5 transition-all ${
          autoRotate
            ? 'bg-blue-500/20 text-blue-200'
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
        }`}
        title="Toggle auto-rotate"
      >
        <Eye className="h-4 w-4" />
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
          Orbit
        </span>
      </button>

      <div className="h-5 w-px bg-white/10" />

      {/* Grid toggle */}
      <button
        onClick={onToggleGrid}
        className={`group relative rounded-md px-3 py-1.5 transition-all ${
          showGrid
            ? 'bg-emerald-500/20 text-emerald-200'
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
        }`}
        title="Toggle grid"
      >
        <Grid3x3 className="h-4 w-4" />
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
          Grid
        </span>
      </button>

      {/* Blueprint toggle */}
      <button
        onClick={onToggleBlueprint}
        className={`group relative rounded-md px-3 py-1.5 transition-all ${
          showBlueprint
            ? 'bg-blue-500/20 text-blue-200'
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
        }`}
        title="Toggle blueprint mode"
      >
        <Maximize2 className="h-4 w-4" />
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
          Blueprint
        </span>
      </button>

      {/* Shadows toggle */}
      <button
        onClick={onToggleShadows}
        className={`group relative rounded-md px-3 py-1.5 transition-all ${
          showShadows
            ? 'bg-amber-500/20 text-amber-200'
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
        }`}
        title="Toggle shadows"
      >
        <Sun className="h-4 w-4" />
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
          Shadows
        </span>
      </button>

      <div className="h-5 w-px bg-white/10" />

      {/* Reset view */}
      <button
        onClick={onResetView}
        className="group relative rounded-md px-3 py-1.5 text-slate-400 transition-all hover:bg-white/5 hover:text-slate-200"
        title="Reset view"
      >
        <RotateCcw className="h-4 w-4" />
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
          Reset View
        </span>
      </button>
    </div>
  );
}
