"use client";

import { Orbit, Eye, Grid3X3, Ruler, RotateCcw, ArrowUp, Bug } from "lucide-react";

interface ViewerUIProps {
  roomName: string;
  dimensions: string;
  cameraMode: "orbit" | "topDown" | "firstPerson";
  showGrid: boolean;
  blueprintMode: boolean;
  debugMode: "normal" | "wireframe" | "depth";
  showBoundingBoxes: boolean;
  shadowsEnabled: boolean;
  onCameraModeChange: (mode: "orbit" | "topDown" | "firstPerson") => void;
  onToggleGrid: () => void;
  onToggleBlueprint: () => void;
  onResetView: () => void;
  onDebugModeChange: (mode: "normal" | "wireframe" | "depth") => void;
  onToggleBoundingBoxes: () => void;
  onToggleShadows: () => void;
}

export default function ViewerUI({
  roomName,
  dimensions,
  cameraMode,
  showGrid,
  blueprintMode,
  debugMode,
  showBoundingBoxes,
  shadowsEnabled,
  onCameraModeChange,
  onToggleGrid,
  onToggleBlueprint,
  onResetView,
  onDebugModeChange,
  onToggleBoundingBoxes,
  onToggleShadows,
}: ViewerUIProps) {
  return (
    <>
      {/* Top Bar - matches editor style */}
      <header className="absolute top-0 left-0 right-0 z-20 flex h-14 items-center justify-between border-b border-white/10 bg-slate-900/80 px-4 backdrop-blur">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-white">{roomName}</h1>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-400">
            {dimensions}
          </span>
        </div>
      </header>

      {/* Right Panel - matches editor ViewerControls style */}
      <div className="absolute right-4 top-20 z-10">
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
                onClick={onToggleBlueprint}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  blueprintMode
                    ? "bg-blue-500/20 text-blue-200"
                    : "text-slate-300 hover:bg-white/5"
                }`}
                title="Toggle blueprint mode"
              >
                <Ruler className="h-4 w-4" />
                <span>Blueprint</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-xl border border-white/10 bg-slate-900/90 p-2 backdrop-blur">
            <p className="mb-2 px-2 text-xs font-medium text-slate-400">Actions</p>
            <div className="flex flex-col gap-1">
              <button
                onClick={onResetView}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5"
                title="Reset view"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset View</span>
              </button>
            </div>
          </div>

          {/* Debug Render */}
          <div className="rounded-xl border border-white/10 bg-slate-900/90 p-2 backdrop-blur">
            <p className="mb-2 px-2 text-xs font-medium text-slate-400">Debug</p>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => onDebugModeChange("normal")}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  debugMode === "normal"
                    ? "bg-blue-500/20 text-blue-200"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <span>Normal</span>
              </button>
              <button
                onClick={() => onDebugModeChange("wireframe")}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  debugMode === "wireframe"
                    ? "bg-blue-500/20 text-blue-200"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <span>Wireframe</span>
              </button>
              <button
                onClick={() => onDebugModeChange("depth")}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  debugMode === "depth"
                    ? "bg-blue-500/20 text-blue-200"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <span>Depth</span>
              </button>
              <button
                onClick={onToggleBoundingBoxes}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  showBoundingBoxes
                    ? "bg-amber-500/20 text-amber-200"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <Bug className="h-4 w-4" />
                <span>BBoxes</span>
              </button>
              <button
                onClick={onToggleShadows}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  shadowsEnabled
                    ? "bg-emerald-500/20 text-emerald-200"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <span>Shadows</span>
              </button>
            </div>
          </div>

          {/* Shortcuts */}
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
      </div>
    </>
  );
}
