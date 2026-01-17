"use client";

// ============================================================
// Refinement Panel Component
// Manual adjustment controls for AI-generated room
// ============================================================

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Ruler,
  Box,
  Palette,
  Trash2,
  Plus,
  RotateCcw,
  Move,
} from "lucide-react";
import type {
  AIRoomData,
  FurnitureItem,
  FurnitureType,
} from "@/types/ai-room.types";

// ============================================================
// Props
// ============================================================

interface RefinementPanelProps {
  roomData: AIRoomData;
  onRoomDataChange: (data: AIRoomData) => void;
  onClose?: () => void;
}

// ============================================================
// Section Component
// ============================================================

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Section({ title, icon, defaultOpen = false, children }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-700/50">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-slate-800/50"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-400" />
        )}
        <span className="text-slate-400">{icon}</span>
        <span className="font-medium text-slate-200">{title}</span>
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

// ============================================================
// Input Components
// ============================================================

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 0.5,
  unit = "ft",
}: NumberInputProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-sm text-slate-400">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className="w-20 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-right text-sm text-white focus:border-blue-500 focus:outline-none"
        />
        <span className="text-xs text-slate-500">{unit}</span>
      </div>
    </div>
  );
}

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-sm text-slate-400">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded border border-slate-600 bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none"
        />
      </div>
    </div>
  );
}

interface SelectInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

function SelectInput({ label, value, onChange, options }: SelectInputProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-sm text-slate-400">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ============================================================
// Furniture Card
// ============================================================

interface FurnitureCardProps {
  item: FurnitureItem;
  index: number;
  onUpdate: (updates: Partial<FurnitureItem>) => void;
  onDelete: () => void;
}

function FurnitureCard({ item, index, onUpdate, onDelete }: FurnitureCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const furnitureTypes: { value: FurnitureType; label: string }[] = [
    { value: "bed", label: "Bed" },
    { value: "desk", label: "Desk" },
    { value: "chair", label: "Chair" },
    { value: "wardrobe", label: "Wardrobe" },
    { value: "nightstand", label: "Nightstand" },
    { value: "dresser", label: "Dresser" },
    { value: "bookshelf", label: "Bookshelf" },
    { value: "sofa", label: "Sofa" },
    { value: "table", label: "Table" },
    { value: "cabinet", label: "Cabinet" },
    { value: "shelf", label: "Shelf" },
    { value: "ottoman", label: "Ottoman" },
    { value: "bench", label: "Bench" },
    { value: "mirror", label: "Mirror" },
    { value: "tv-stand", label: "TV Stand" },
  ];

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Box className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-white capitalize">
            {item.type.replace("-", " ")}
          </span>
          <span className="text-xs text-slate-500">#{index + 1}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded p-1 text-slate-400 hover:bg-red-500/20 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-4 border-t border-slate-700 p-3">
          {/* Type */}
          <SelectInput
            label="Type"
            value={item.type}
            onChange={(v) => onUpdate({ type: v as FurnitureType })}
            options={furnitureTypes}
          />

          {/* Position */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Move className="h-3 w-3" />
              Position
            </div>
            <div className="grid grid-cols-2 gap-2">
              <NumberInput
                label="X"
                value={item.position.x}
                onChange={(v) => onUpdate({ position: { ...item.position, x: v } })}
                min={-20}
                max={20}
              />
              <NumberInput
                label="Z"
                value={item.position.z}
                onChange={(v) => onUpdate({ position: { ...item.position, z: v } })}
                min={-20}
                max={20}
              />
            </div>
          </div>

          {/* Rotation */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <RotateCcw className="h-3 w-3" />
              Rotation
            </div>
            <NumberInput
              label="Angle"
              value={item.rotation}
              onChange={(v) => onUpdate({ rotation: v })}
              min={0}
              max={360}
              step={15}
              unit="°"
            />
          </div>

          {/* Dimensions */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Ruler className="h-3 w-3" />
              Dimensions
            </div>
            <div className="space-y-2">
              <NumberInput
                label="Width"
                value={item.dimensions.width}
                onChange={(v) =>
                  onUpdate({ dimensions: { ...item.dimensions, width: v } })
                }
              />
              <NumberInput
                label="Depth"
                value={item.dimensions.depth}
                onChange={(v) =>
                  onUpdate({ dimensions: { ...item.dimensions, depth: v } })
                }
              />
              <NumberInput
                label="Height"
                value={item.dimensions.height}
                onChange={(v) =>
                  onUpdate({ dimensions: { ...item.dimensions, height: v } })
                }
              />
            </div>
          </div>

          {/* Color */}
          <ColorInput
            label="Color"
            value={item.color}
            onChange={(v) => onUpdate({ color: v })}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function RefinementPanel({
  roomData,
  onRoomDataChange,
}: RefinementPanelProps) {
  // Update room dimensions
  const updateDimensions = (key: "length" | "width" | "height", value: number) => {
    onRoomDataChange({
      ...roomData,
      room: {
        ...roomData.room,
        dimensions: {
          ...roomData.room.dimensions,
          [key]: value,
        },
      },
    });
  };

  // Update wall color
  const updateWallColor = (color: string) => {
    onRoomDataChange({
      ...roomData,
      room: {
        ...roomData.room,
        walls: { ...roomData.room.walls, color },
      },
    });
  };

  // Update floor color
  const updateFloorColor = (color: string) => {
    onRoomDataChange({
      ...roomData,
      room: {
        ...roomData.room,
        floor: { ...roomData.room.floor, color },
      },
    });
  };

  // Update ceiling color
  const updateCeilingColor = (color: string) => {
    onRoomDataChange({
      ...roomData,
      room: {
        ...roomData.room,
        ceiling: { ...roomData.room.ceiling, color },
      },
    });
  };

  // Update furniture item
  const updateFurniture = (index: number, updates: Partial<FurnitureItem>) => {
    const newFurniture = [...roomData.furniture];
    newFurniture[index] = { ...newFurniture[index], ...updates };
    onRoomDataChange({ ...roomData, furniture: newFurniture });
  };

  // Delete furniture item
  const deleteFurniture = (index: number) => {
    const newFurniture = roomData.furniture.filter((_, i) => i !== index);
    onRoomDataChange({ ...roomData, furniture: newFurniture });
  };

  // Add new furniture
  const addFurniture = () => {
    const newItem: FurnitureItem = {
      id: `furniture_${Date.now()}`,
      type: "chair",
      position: { x: 0, z: 0 },
      rotation: 0,
      dimensions: { width: 2, depth: 2, height: 3 },
      color: "#8B6914",
      material: "wood",
    };
    onRoomDataChange({
      ...roomData,
      furniture: [...roomData.furniture, newItem],
    });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-700 px-4 py-3">
        <h2 className="font-semibold text-white">Refine Model</h2>
        <p className="text-xs text-slate-400">
          Adjust dimensions and positioning
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Room Dimensions */}
        <Section
          title="Room Dimensions"
          icon={<Ruler className="h-4 w-4" />}
          defaultOpen
        >
          <div className="space-y-3">
            <NumberInput
              label="Length"
              value={roomData.room.dimensions.length}
              onChange={(v) => updateDimensions("length", v)}
              min={5}
              max={50}
            />
            <NumberInput
              label="Width"
              value={roomData.room.dimensions.width}
              onChange={(v) => updateDimensions("width", v)}
              min={5}
              max={50}
            />
            <NumberInput
              label="Height"
              value={roomData.room.dimensions.height}
              onChange={(v) => updateDimensions("height", v)}
              min={6}
              max={20}
            />
          </div>
        </Section>

        {/* Colors */}
        <Section title="Colors & Materials" icon={<Palette className="h-4 w-4" />}>
          <div className="space-y-3">
            <ColorInput
              label="Walls"
              value={roomData.room.walls.color}
              onChange={updateWallColor}
            />
            <ColorInput
              label="Floor"
              value={roomData.room.floor.color}
              onChange={updateFloorColor}
            />
            <ColorInput
              label="Ceiling"
              value={roomData.room.ceiling.color}
              onChange={updateCeilingColor}
            />
            <SelectInput
              label="Floor Type"
              value={roomData.room.floor.material}
              onChange={(v) =>
                onRoomDataChange({
                  ...roomData,
                  room: {
                    ...roomData.room,
                    floor: {
                      ...roomData.room.floor,
                      material: v as any,
                    },
                  },
                })
              }
              options={[
                { value: "hardwood", label: "Hardwood" },
                { value: "carpet", label: "Carpet" },
                { value: "tile", label: "Tile" },
                { value: "laminate", label: "Laminate" },
                { value: "concrete", label: "Concrete" },
              ]}
            />
          </div>
        </Section>

        {/* Furniture */}
        <Section title={`Furniture (${roomData.furniture.length})`} icon={<Box className="h-4 w-4" />}>
          <div className="space-y-3">
            {roomData.furniture.map((item, i) => (
              <FurnitureCard
                key={item.id || i}
                item={item}
                index={i}
                onUpdate={(updates) => updateFurniture(i, updates)}
                onDelete={() => deleteFurniture(i)}
              />
            ))}

            <button
              type="button"
              onClick={addFurniture}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-600 py-2 text-sm text-slate-400 hover:border-blue-500 hover:text-blue-400"
            >
              <Plus className="h-4 w-4" />
              Add Furniture
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}
