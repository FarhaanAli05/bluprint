"use client";

import { useState, useEffect } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import type { RoomConfig, Dimensions, Unit, RoomShape, Materials } from "@/types/room.types";
import { Maximize2, Square, LayoutTemplate, Palette } from "lucide-react";

interface ManualCreatorProps {
  initialConfig?: Partial<RoomConfig>;
  onConfigChange: (config: Partial<RoomConfig>) => void;
  onComplete: (config: Partial<RoomConfig>) => void;
}

const PRESETS = [
  { name: "Small Bedroom", length: 10, width: 10, height: 8 },
  { name: "Medium Bedroom", length: 12, width: 12, height: 9 },
  { name: "Master Bedroom", length: 16, width: 14, height: 9 },
  { name: "Studio", length: 20, width: 15, height: 10 },
];

const WALL_COLORS = [
  { name: "White", value: "#ffffff" },
  { name: "Warm White", value: "#f5f5dc" },
  { name: "Light Gray", value: "#d3d3d3" },
  { name: "Soft Blue", value: "#b0c4de" },
  { name: "Sage Green", value: "#9dc183" },
  { name: "Blush Pink", value: "#f4c2c2" },
  { name: "Warm Beige", value: "#e8e4df" },
  { name: "Light Lavender", value: "#e6e6fa" },
];

const FLOOR_COLORS = [
  { name: "Light Oak", value: "#c4a35a" },
  { name: "Dark Oak", value: "#8b7355" },
  { name: "Walnut", value: "#5d432c" },
  { name: "Gray Wood", value: "#8e8e8e" },
  { name: "White Tile", value: "#f0f0f0" },
  { name: "Beige Carpet", value: "#d4c4a8" },
];

export default function ManualCreator({
  initialConfig,
  onConfigChange,
  onComplete,
}: ManualCreatorProps) {
  const [dimensions, setDimensions] = useState<Dimensions>(
    initialConfig?.dimensions || {
      length: 12,
      width: 10,
      height: 9,
      unit: "feet",
    }
  );
  const [shape, setShape] = useState<RoomShape>(initialConfig?.shape || "rectangular");
  const [description, setDescription] = useState(initialConfig?.description || "");
  const [materials, setMaterials] = useState<Materials>(
    initialConfig?.materials || {
      wallColor: "#e8e4df",
      floorColor: "#8b7355",
      ceilingColor: "#ffffff",
      floorTexture: "wood",
    }
  );

  // Call onConfigChange whenever any value changes
  useEffect(() => {
    const config = {
      dimensions,
      shape,
      description,
      materials,
      windows: [],
      doors: [],
    };
    onConfigChange(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions, shape, description, materials]);

  const handleDimensionChange = (key: keyof Dimensions, value: string | number) => {
    if (key === "unit") {
      setDimensions((prev) => ({ ...prev, unit: value as Unit }));
    } else {
      const numValue = parseFloat(value as string) || 0;
      setDimensions((prev) => ({ ...prev, [key]: numValue }));
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setDimensions((prev) => ({
      ...prev,
      length: preset.length,
      width: preset.width,
      height: preset.height,
    }));
  };

  const handleComplete = () => {
    onComplete({
      dimensions,
      shape,
      description,
      materials,
      windows: [],
      doors: [],
    });
  };

  // Calculate area
  const area = dimensions.length * dimensions.width;
  const volumeUnit = dimensions.unit === "feet" ? "sq ft" : "sq m";

  return (
    <div className="space-y-6">
      {/* Room Presets */}
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <LayoutTemplate className="h-5 w-5 text-blue-300" />
          <h3 className="text-lg font-semibold text-white">Room Presets</h3>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Start with a common room size or customize below
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                dimensions.length === preset.length &&
                dimensions.width === preset.width
                  ? "border-blue-400/50 bg-blue-500/20 text-blue-200"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </Card>

      {/* Dimensions */}
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Maximize2 className="h-5 w-5 text-emerald-300" />
          <h3 className="text-lg font-semibold text-white">Room Dimensions</h3>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Enter the exact measurements of your room
        </p>

        {/* Unit toggle */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-slate-400">Unit:</span>
          <div className="flex rounded-lg border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => handleDimensionChange("unit", "feet")}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                dimensions.unit === "feet"
                  ? "bg-blue-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Feet
            </button>
            <button
              onClick={() => handleDimensionChange("unit", "meters")}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                dimensions.unit === "meters"
                  ? "bg-blue-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Meters
            </button>
          </div>
        </div>

        {/* Dimension inputs */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-300">
              Length
            </label>
            <div className="relative mt-1.5">
              <input
                type="number"
                value={dimensions.length}
                onChange={(e) => handleDimensionChange("length", e.target.value)}
                min="1"
                max="100"
                step="0.5"
                className="block w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 pr-12 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                {dimensions.unit === "feet" ? "ft" : "m"}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">
              Width
            </label>
            <div className="relative mt-1.5">
              <input
                type="number"
                value={dimensions.width}
                onChange={(e) => handleDimensionChange("width", e.target.value)}
                min="1"
                max="100"
                step="0.5"
                className="block w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 pr-12 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                {dimensions.unit === "feet" ? "ft" : "m"}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">
              Height
            </label>
            <div className="relative mt-1.5">
              <input
                type="number"
                value={dimensions.height}
                onChange={(e) => handleDimensionChange("height", e.target.value)}
                min="1"
                max="30"
                step="0.5"
                className="block w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 pr-12 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                {dimensions.unit === "feet" ? "ft" : "m"}
              </span>
            </div>
          </div>
        </div>

        {/* Area display */}
        <div className="mt-4 rounded-lg border border-white/5 bg-white/5 px-4 py-3">
          <span className="text-sm text-slate-400">Floor Area: </span>
          <span className="font-semibold text-white">
            {area.toFixed(1)} {volumeUnit}
          </span>
        </div>
      </Card>

      {/* Room Shape */}
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Square className="h-5 w-5 text-violet-300" />
          <h3 className="text-lg font-semibold text-white">Room Shape</h3>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Select the basic shape of your room
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { value: "rectangular", label: "Rectangular", icon: "□" },
            { value: "l-shaped", label: "L-Shaped", icon: "⌐" },
            { value: "custom", label: "Custom", icon: "◇" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setShape(option.value as RoomShape)}
              disabled={option.value === "custom"}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                shape === option.value
                  ? "border-violet-400/50 bg-violet-500/20 text-violet-200"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              }`}
            >
              <span className="text-2xl">{option.icon}</span>
              <span className="text-sm font-medium">{option.label}</span>
              {option.value === "custom" && (
                <span className="text-xs text-slate-500">Coming soon</span>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Materials */}
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Palette className="h-5 w-5 text-amber-300" />
          <h3 className="text-lg font-semibold text-white">Colors & Materials</h3>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Choose wall and floor colors for your room
        </p>

        {/* Wall color */}
        <div className="mt-5">
          <label className="block text-sm font-medium text-slate-300">
            Wall Color
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {WALL_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setMaterials((prev) => ({ ...prev, wallColor: color.value }))}
                className={`group relative h-10 w-10 rounded-lg border-2 transition-all ${
                  materials.wallColor === color.value
                    ? "border-blue-400 ring-2 ring-blue-400/30"
                    : "border-white/20 hover:border-white/40"
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {materials.wallColor === color.value && (
                  <svg
                    className="absolute inset-0 m-auto h-5 w-5 text-slate-800"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Floor color */}
        <div className="mt-5">
          <label className="block text-sm font-medium text-slate-300">
            Floor Color
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {FLOOR_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setMaterials((prev) => ({ ...prev, floorColor: color.value }))}
                className={`group relative h-10 w-10 rounded-lg border-2 transition-all ${
                  materials.floorColor === color.value
                    ? "border-blue-400 ring-2 ring-blue-400/30"
                    : "border-white/20 hover:border-white/40"
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {materials.floorColor === color.value && (
                  <svg
                    className="absolute inset-0 m-auto h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Description */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white">
          Room Description
          <span className="ml-2 text-sm font-normal text-slate-400">(Optional)</span>
        </h3>
        <p className="mt-1 text-sm text-slate-400">
          Describe any special features, furniture you plan to add, or style preferences
        </p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="E.g., Modern minimalist bedroom with a queen bed, two nightstands, and a desk area by the window..."
          className="mt-4 block w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
        />
      </Card>
    </div>
  );
}
