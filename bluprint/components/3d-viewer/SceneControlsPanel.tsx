"use client";

import { useState } from "react";
import { Eye, Grid3x3, Maximize2, RotateCcw, Sun, ChevronDown, ChevronUp, Settings } from "lucide-react";

interface SceneControlsPanelProps {
  showGrid: boolean;
  showBlueprint: boolean;
  showShadows: boolean;
  cameraMode: 'orbit' | 'topDown' | 'firstPerson';
  autoRotate: boolean;
  onToggleGrid: () => void;
  onToggleBlueprint: () => void;
  onToggleShadows: () => void;
  onToggleAutoRotate: () => void;
  onChangeCameraMode: (mode: 'orbit' | 'topDown' | 'firstPerson') => void;
  onResetView: () => void;
}

export default function SceneControlsPanel({
  showGrid,
  showBlueprint,
  showShadows,
  cameraMode,
  autoRotate,
  onToggleGrid,
  onToggleBlueprint,
  onToggleShadows,
  onToggleAutoRotate,
  onChangeCameraMode,
  onResetView,
}: SceneControlsPanelProps) {
  const [panelExpanded, setPanelExpanded] = useState(true);

  if (!panelExpanded) {
    return (
      <button
        onClick={() => setPanelExpanded(true)}
        className="rounded-xl border border-white/10 bg-slate-900/70 backdrop-blur p-3 hover:bg-slate-900/90 transition-colors"
        title="Show controls"
      >
        <Settings className="h-5 w-5 text-slate-300" />
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/70 backdrop-blur">
      <div className="p-4 space-y-4">
        {/* Panel header with collapse button */}
        <div className="flex items-center justify-between -mt-1 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Controls</span>
          <button
            onClick={() => setPanelExpanded(false)}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            title="Hide controls"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        </div>
        {/* Camera */}
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-wide text-slate-500">Camera</p>
          <button
            onClick={onToggleAutoRotate}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              autoRotate
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

        {/* Display */}
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

        {/* Actions */}
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
