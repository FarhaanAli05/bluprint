"use client";

import { Eye, Grid3x3, Maximize2, RotateCcw, Sun } from "lucide-react";

interface SceneControlsPanelProps {
  showGrid: boolean;
  showBlueprint: boolean;
  showShadows: boolean;
  cameraMode: 'orbit' | 'topDown' | 'firstPerson';
  onToggleGrid: () => void;
  onToggleBlueprint: () => void;
  onToggleShadows: () => void;
  onChangeCameraMode: (mode: 'orbit' | 'topDown' | 'firstPerson') => void;
  onResetView: () => void;
}

export default function SceneControlsPanel({
  showGrid,
  showBlueprint,
  showShadows,
  cameraMode,
  onToggleGrid,
  onToggleBlueprint,
  onToggleShadows,
  onChangeCameraMode,
  onResetView,
}: SceneControlsPanelProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/70 backdrop-blur">
      <div className="p-4 space-y-4">
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-wide text-slate-500">Camera</p>
          <button
            onClick={() => onChangeCameraMode('orbit')}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              cameraMode === 'orbit'
                ? 'bg-blue-500/20 text-blue-100'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Orbit
            </div>
          </button>
        </div>

        <div>
          <p className="mb-2 text-[11px] uppercase tracking-wide text-slate-500">Display</p>
          <div className="space-y-2">
            <button
              onClick={onToggleGrid}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                showGrid
                  ? 'bg-emerald-500/20 text-emerald-100'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <Grid3x3 className="h-4 w-4" />
                Grid
              </div>
            </button>

            <button
              onClick={onToggleBlueprint}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                showBlueprint
                  ? 'bg-blue-500/20 text-blue-100'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <Maximize2 className="h-4 w-4" />
                Blueprint Mode
              </div>
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] uppercase tracking-wide text-slate-500">Actions</p>
          <div className="space-y-2">
            <button
              onClick={onToggleShadows}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                showShadows
                  ? 'bg-amber-500/20 text-amber-100'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                Shadows
              </div>
            </button>

            <button
              onClick={onResetView}
              className="w-full rounded-lg bg-white/5 px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-white/10"
            >
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset View
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
