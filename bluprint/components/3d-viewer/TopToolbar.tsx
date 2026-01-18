"use client";

import { Grid3x3, Maximize2, RefreshCw, RotateCcw, Sun } from "lucide-react";

interface TopToolbarProps {
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

export default function TopToolbar({
  showGrid,
  showBlueprint,
  showShadows,
  autoRotate,
  onToggleGrid,
  onToggleBlueprint,
  onToggleShadows,
  onToggleAutoRotate,
  onResetView,
}: TopToolbarProps) {
  const baseButton =
    "inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-slate-900/70 text-slate-200 transition-colors hover:bg-slate-800/80";

  const activeButton = "border-blue-400/30 bg-blue-500/20 text-blue-100";
  const activeShadows = "border-amber-400/30 bg-amber-500/20 text-amber-100";

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggleAutoRotate}
        className={`${baseButton} ${autoRotate ? activeButton : ""}`}
        title={autoRotate ? "Disable orbit" : "Enable orbit"}
        aria-pressed={autoRotate}
      >
        <RefreshCw className="h-4 w-4" />
        <span className="sr-only">Orbit</span>
      </button>

      <button
        onClick={onToggleGrid}
        className={`${baseButton} ${showGrid ? activeButton : ""}`}
        title={showGrid ? "Hide grid" : "Show grid"}
        aria-pressed={showGrid}
      >
        <Grid3x3 className="h-4 w-4" />
        <span className="sr-only">Grid</span>
      </button>

      <button
        onClick={onToggleShadows}
        className={`${baseButton} ${showShadows ? activeShadows : ""}`}
        title={showShadows ? "Hide shadows" : "Show shadows"}
        aria-pressed={showShadows}
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Shadows</span>
      </button>

      <button
        onClick={onResetView}
        className={baseButton}
        title="Reset view"
      >
        <RotateCcw className="h-4 w-4" />
        <span className="sr-only">Reset view</span>
      </button>

      <button
        onClick={onToggleBlueprint}
        className={`${baseButton} ${showBlueprint ? activeButton : ""}`}
        title={showBlueprint ? "Disable blueprint" : "Enable blueprint"}
        aria-pressed={showBlueprint}
      >
        <Maximize2 className="h-4 w-4" />
        <span className="sr-only">Blueprint mode</span>
      </button>
    </div>
  );
}
