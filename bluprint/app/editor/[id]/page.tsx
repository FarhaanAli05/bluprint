"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useProjectStore, projectStorage } from "@/lib/store";
import type { Project, PlacedFurniture, CameraMode } from "@/types/room.types";
import Card from "@/components/Card";
import Button, { buttonClasses } from "@/components/Button";
import ViewerControls from "@/components/3d-viewer/ViewerControls";
import FurnitureLibrary from "@/components/3d-viewer/FurnitureLibrary";
import {
  Save,
  Download,
  Share2,
  Settings,
  ChevronLeft,
  Trash2,
  Undo,
  Redo,
  Palette,
  Maximize2,
  PanelLeftClose,
  PanelLeft,
  X,
  Check,
} from "lucide-react";

// Dynamically import RoomViewer to avoid SSR issues with Three.js
const RoomViewer = dynamic(
  () => import("@/components/3d-viewer/RoomViewer"),
  { ssr: false, loading: () => <ViewerLoading /> }
);

function ViewerLoading() {
  return (
    <div className="flex h-full items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500" />
        <p className="mt-4 text-sm text-slate-400">Loading 3D viewer...</p>
      </div>
    </div>
  );
}

type SidebarTab = "furniture" | "settings" | "materials";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const {
    currentProject,
    setCurrentProject,
    viewerState,
    setCameraMode,
    toggleGrid,
    toggleMeasurements,
    selectFurniture,
    addFurniture,
    removeFurniture,
    updateMaterials,
  } = useProjectStore();

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("furniture");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load project
  useEffect(() => {
    const projectId = params.id as string;
    if (projectId) {
      const project = projectStorage.getById(projectId);
      if (project) {
        setCurrentProject(project as Project);
      }
      setLoading(false);
    }
  }, [params.id, setCurrentProject]);

  // Auto-save on changes
  useEffect(() => {
    if (currentProject) {
      const timeout = setTimeout(() => {
        projectStorage.save(currentProject);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [currentProject]);

  const handleSave = useCallback(async () => {
    if (!currentProject) return;
    setIsSaving(true);
    try {
      projectStorage.save(currentProject);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } finally {
      setIsSaving(false);
    }
  }, [currentProject]);

  const handleAddFurniture = useCallback(
    (item: PlacedFurniture) => {
      addFurniture(item);
    },
    [addFurniture]
  );

  const handleDeleteSelected = useCallback(() => {
    if (viewerState.selectedFurnitureId) {
      removeFurniture(viewerState.selectedFurnitureId);
    }
  }, [viewerState.selectedFurnitureId, removeFurniture]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500" />
          <p className="mt-4 text-sm text-slate-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-950 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white">Project not found</h1>
          <p className="mt-2 text-slate-400">
            This project doesn't exist or has been deleted.
          </p>
          <Link
            href="/dashboard"
            className={`mt-6 inline-flex ${buttonClasses("primary", "md")}`}
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const selectedFurniture = currentProject.furniture.find(
    (f) => f.id === viewerState.selectedFurnitureId
  );

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-white/10 bg-slate-900/80 px-4 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <h1 className="font-semibold text-white">{currentProject.name}</h1>
          <span className="hidden rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-400 sm:inline">
            {currentProject.config.dimensions.length} ×{" "}
            {currentProject.config.dimensions.width}{" "}
            {currentProject.config.dimensions.unit}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Save status */}
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-400">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isSaving ? "Saving..." : "Save"}
            </span>
          </Button>

          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left controls */}
        <div className="w-14 flex-shrink-0 border-r border-white/10 bg-slate-900/50 p-2">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                sidebarOpen
                  ? "bg-blue-500/20 text-blue-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
              title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeft className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-72 flex-shrink-0 overflow-hidden border-r border-white/10 bg-slate-900/30">
            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {[
                { id: "furniture" as const, label: "Furniture", icon: Maximize2 },
                { id: "materials" as const, label: "Materials", icon: Palette },
                { id: "settings" as const, label: "Settings", icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSidebarTab(tab.id)}
                  className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                    sidebarTab === tab.id
                      ? "border-b-2 border-blue-500 text-blue-300"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="h-[calc(100%-49px)] overflow-y-auto p-4">
              {sidebarTab === "furniture" && (
                <FurnitureLibrary onAddFurniture={handleAddFurniture} />
              )}

              {sidebarTab === "materials" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300">
                      Wall Color
                    </label>
                    <input
                      type="color"
                      value={currentProject.config.materials.wallColor}
                      onChange={(e) =>
                        updateMaterials({ wallColor: e.target.value })
                      }
                      className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300">
                      Floor Color
                    </label>
                    <input
                      type="color"
                      value={currentProject.config.materials.floorColor}
                      onChange={(e) =>
                        updateMaterials({ floorColor: e.target.value })
                      }
                      className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300">
                      Ceiling Color
                    </label>
                    <input
                      type="color"
                      value={currentProject.config.materials.ceilingColor}
                      onChange={(e) =>
                        updateMaterials({ ceilingColor: e.target.value })
                      }
                      className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent"
                    />
                  </div>
                </div>
              )}

              {sidebarTab === "settings" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      Room Dimensions
                    </h3>
                    <dl className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-slate-400">Length</dt>
                        <dd className="text-white">
                          {currentProject.config.dimensions.length}{" "}
                          {currentProject.config.dimensions.unit}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-400">Width</dt>
                        <dd className="text-white">
                          {currentProject.config.dimensions.width}{" "}
                          {currentProject.config.dimensions.unit}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-400">Height</dt>
                        <dd className="text-white">
                          {currentProject.config.dimensions.height}{" "}
                          {currentProject.config.dimensions.unit}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <h3 className="text-sm font-medium text-white">
                      Project Info
                    </h3>
                    <dl className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-slate-400">Created</dt>
                        <dd className="text-white">
                          {new Date(currentProject.createdAt).toLocaleDateString()}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-400">Items</dt>
                        <dd className="text-white">
                          {currentProject.furniture.length}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3D Viewer */}
        <div className="relative flex-1">
          <RoomViewer
            dimensions={currentProject.config.dimensions}
            materials={currentProject.config.materials}
            furniture={currentProject.furniture}
            cameraMode={viewerState.cameraMode}
            showGrid={viewerState.showGrid}
            showMeasurements={viewerState.showMeasurements}
            selectedFurnitureId={viewerState.selectedFurnitureId}
            onFurnitureSelect={selectFurniture}
          />

          {/* Floating controls */}
          <div className="absolute right-4 top-4">
            <ViewerControls
              cameraMode={viewerState.cameraMode}
              showGrid={viewerState.showGrid}
              showMeasurements={viewerState.showMeasurements}
              onCameraModeChange={setCameraMode}
              onToggleGrid={toggleGrid}
              onToggleMeasurements={toggleMeasurements}
            />
          </div>

          {/* Selected furniture info */}
          {selectedFurniture && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-72">
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white">
                      {selectedFurniture.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {selectedFurniture.dimensions.width.toFixed(1)} ×{" "}
                      {selectedFurniture.dimensions.depth.toFixed(1)} ×{" "}
                      {selectedFurniture.dimensions.height.toFixed(1)} ft
                    </p>
                  </div>
                  <button
                    onClick={() => selectFurniture(null)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteSelected}
                    className="flex-1 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Furniture count */}
          <div className="absolute bottom-4 left-4">
            <div className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-xs text-slate-400 backdrop-blur">
              {currentProject.furniture.length} item
              {currentProject.furniture.length !== 1 ? "s" : ""} in room
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
