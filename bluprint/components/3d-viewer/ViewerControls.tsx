"use client";

import Button from "@/components/Button";
import type { CameraMode } from "@/types/room.types";
import {
  Orbit,
  Eye,
  Grid3X3,
  Ruler,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize,
  ArrowUp,
} from "lucide-react";

interface ViewerControlsProps {
  cameraMode: CameraMode;
  showGrid: boolean;
  showMeasurements: boolean;
  onCameraModeChange: (mode: CameraMode) => void;
  onToggleGrid: () => void;
  onToggleMeasurements: () => void;
  onResetView?: () => void;
}

export default function ViewerControls({
  cameraMode,
  showGrid,
  showMeasurements,
  onCameraModeChange,
  onToggleGrid,
  onToggleMeasurements,
  onResetView,
}: ViewerControlsProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Camera modes */}
      <div className="rounded-xl border border-white/10 bg-slate-900/90 p-2 backdrop-blur">
        <p className="mb-2 px-2 text-xs font-medium text-slate-400">Camera</p>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onCameraModeChange("orbit")}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              cameraMode === "orbit"
                ? "bg-blue-500/20 text-blue-200"
                : "text-slate-300 hover:bg-white/5"
            }`}
            title="Orbit view"
          >
            <Orbit className="h-4 w-4" />
            <span>Orbit</span>
          </button>
          <button
            onClick={() => onCameraModeChange("topDown")}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              cameraMode === "topDown"
                ? "bg-blue-500/20 text-blue-200"
                : "text-slate-300 hover:bg-white/5"
            }`}
            title="Top-down view"
          >
            <ArrowUp className="h-4 w-4" />
            <span>Top Down</span>
          </button>
          <button
            onClick={() => onCameraModeChange("firstPerson")}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              cameraMode === "firstPerson"
                ? "bg-blue-500/20 text-blue-200"
                : "text-slate-300 hover:bg-white/5"
            }`}
            title="First person view"
          >
            <Eye className="h-4 w-4" />
            <span>First Person</span>
          </button>
        </div>
      </div>

      {/* Display options */}
      <div className="rounded-xl border border-white/10 bg-slate-900/90 p-2 backdrop-blur">
        <p className="mb-2 px-2 text-xs font-medium text-slate-400">Display</p>
        <div className="flex flex-col gap-1">
          <button
            onClick={onToggleGrid}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              showGrid
                ? "bg-emerald-500/20 text-emerald-200"
                : "text-slate-300 hover:bg-white/5"
            }`}
            title="Toggle grid"
          >
            <Grid3X3 className="h-4 w-4" />
            <span>Grid</span>
          </button>
          <button
            onClick={onToggleMeasurements}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              showMeasurements
                ? "bg-amber-500/20 text-amber-200"
                : "text-slate-300 hover:bg-white/5"
            }`}
            title="Toggle measurements"
          >
            <Ruler className="h-4 w-4" />
            <span>Measure</span>
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-white/10 bg-slate-900/90 p-2 backdrop-blur">
        <p className="mb-2 px-2 text-xs font-medium text-slate-400">Actions</p>
        <div className="flex flex-col gap-1">
          {onResetView && (
            <button
              onClick={onResetView}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5"
              title="Reset view"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset View</span>
            </button>
          )}
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="rounded-xl border border-white/5 bg-slate-900/50 p-3 text-xs text-slate-500">
        <p className="font-medium text-slate-400">Shortcuts</p>
        <ul className="mt-2 space-y-1">
          <li>
            <kbd className="rounded bg-slate-800 px-1">LMB</kbd> Rotate
          </li>
          <li>
            <kbd className="rounded bg-slate-800 px-1">RMB</kbd> Pan
          </li>
          <li>
            <kbd className="rounded bg-slate-800 px-1">Scroll</kbd> Zoom
          </li>
        </ul>
      </div>
    </div>
  );
}
