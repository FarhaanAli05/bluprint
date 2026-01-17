"use client";

import { useState } from "react";
import Card from "@/components/Card";
import type { FurnitureItem, FurnitureCategory, PlacedFurniture } from "@/types/room.types";
import {
  Bed,
  Armchair,
  Lamp,
  Table,
  Archive,
  Monitor,
  Sofa,
  Frame,
  Search,
  Plus,
} from "lucide-react";

interface FurnitureLibraryProps {
  onAddFurniture: (item: PlacedFurniture) => void;
}

const categoryIcons: Record<FurnitureCategory, React.ReactNode> = {
  beds: <Bed className="h-4 w-4" />,
  chairs: <Armchair className="h-4 w-4" />,
  lighting: <Lamp className="h-4 w-4" />,
  tables: <Table className="h-4 w-4" />,
  storage: <Archive className="h-4 w-4" />,
  desks: <Monitor className="h-4 w-4" />,
  sofas: <Sofa className="h-4 w-4" />,
  decor: <Frame className="h-4 w-4" />,
  dressers: <Archive className="h-4 w-4" />,
  nightstands: <Table className="h-4 w-4" />,
};

// Sample furniture items
const FURNITURE_ITEMS: FurnitureItem[] = [
  // Beds
  {
    id: "bed-queen",
    name: "Queen Bed",
    category: "beds",
    dimensions: { width: 5, depth: 6.67, height: 2 },
    color: "#8b7355",
  },
  {
    id: "bed-king",
    name: "King Bed",
    category: "beds",
    dimensions: { width: 6.33, depth: 6.67, height: 2 },
    color: "#6b5b4f",
  },
  {
    id: "bed-twin",
    name: "Twin Bed",
    category: "beds",
    dimensions: { width: 3.25, depth: 6.67, height: 1.8 },
    color: "#9ca3af",
  },
  // Nightstands
  {
    id: "nightstand-1",
    name: "Nightstand",
    category: "nightstands",
    dimensions: { width: 1.5, depth: 1.5, height: 2 },
    color: "#8b7355",
  },
  {
    id: "nightstand-modern",
    name: "Modern Nightstand",
    category: "nightstands",
    dimensions: { width: 1.67, depth: 1.33, height: 1.83 },
    color: "#1f2937",
  },
  // Dressers
  {
    id: "dresser-6",
    name: "6-Drawer Dresser",
    category: "dressers",
    dimensions: { width: 5, depth: 1.5, height: 2.5 },
    color: "#8b7355",
  },
  {
    id: "dresser-tall",
    name: "Tall Dresser",
    category: "dressers",
    dimensions: { width: 2.5, depth: 1.5, height: 4 },
    color: "#6b5b4f",
  },
  // Desks
  {
    id: "desk-standard",
    name: "Office Desk",
    category: "desks",
    dimensions: { width: 4, depth: 2, height: 2.5 },
    color: "#374151",
  },
  {
    id: "desk-corner",
    name: "Corner Desk",
    category: "desks",
    dimensions: { width: 4.5, depth: 4.5, height: 2.5 },
    color: "#1f2937",
  },
  // Chairs
  {
    id: "chair-office",
    name: "Office Chair",
    category: "chairs",
    dimensions: { width: 2, depth: 2, height: 3.5 },
    color: "#1f2937",
  },
  {
    id: "chair-accent",
    name: "Accent Chair",
    category: "chairs",
    dimensions: { width: 2.5, depth: 2.5, height: 2.8 },
    color: "#6366f1",
  },
  // Tables
  {
    id: "table-side",
    name: "Side Table",
    category: "tables",
    dimensions: { width: 1.5, depth: 1.5, height: 1.8 },
    color: "#92400e",
  },
  {
    id: "table-coffee",
    name: "Coffee Table",
    category: "tables",
    dimensions: { width: 4, depth: 2, height: 1.5 },
    color: "#78716c",
  },
  // Storage
  {
    id: "bookshelf",
    name: "Bookshelf",
    category: "storage",
    dimensions: { width: 3, depth: 1, height: 6 },
    color: "#8b7355",
  },
  {
    id: "wardrobe",
    name: "Wardrobe",
    category: "storage",
    dimensions: { width: 4, depth: 2, height: 7 },
    color: "#e5e5e5",
  },
  // Lighting
  {
    id: "lamp-floor",
    name: "Floor Lamp",
    category: "lighting",
    dimensions: { width: 1, depth: 1, height: 5 },
    color: "#fbbf24",
  },
  {
    id: "lamp-table",
    name: "Table Lamp",
    category: "lighting",
    dimensions: { width: 0.8, depth: 0.8, height: 1.5 },
    color: "#e5e5e5",
  },
  // Decor
  {
    id: "plant-large",
    name: "Large Plant",
    category: "decor",
    dimensions: { width: 1.5, depth: 1.5, height: 4 },
    color: "#22c55e",
  },
  {
    id: "rug-area",
    name: "Area Rug",
    category: "decor",
    dimensions: { width: 6, depth: 8, height: 0.1 },
    color: "#9ca3af",
  },
];

const CATEGORIES: { value: FurnitureCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "beds", label: "Beds" },
  { value: "nightstands", label: "Nightstands" },
  { value: "dressers", label: "Dressers" },
  { value: "desks", label: "Desks" },
  { value: "chairs", label: "Chairs" },
  { value: "tables", label: "Tables" },
  { value: "storage", label: "Storage" },
  { value: "lighting", label: "Lighting" },
  { value: "decor", label: "Decor" },
];

export default function FurnitureLibrary({ onAddFurniture }: FurnitureLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FurnitureCategory | "all">("all");

  const filteredItems = FURNITURE_ITEMS.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddFurniture = (item: FurnitureItem) => {
    const placedFurniture: PlacedFurniture = {
      ...item,
      id: `${item.id}_${Date.now()}`,
      position: { x: 0, y: 0, z: 0 },
      rotation: 0,
    };
    onAddFurniture(placedFurniture);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search furniture..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-slate-900/70 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
        />
      </div>

      {/* Categories */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              selectedCategory === cat.value
                ? "bg-blue-500/20 text-blue-200"
                : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-300"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="mt-4 flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleAddFurniture(item)}
              className="group flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-white/5 p-3 text-center transition-all hover:border-blue-400/30 hover:bg-blue-500/10"
            >
              {/* Color swatch preview */}
              <div
                className="h-10 w-10 rounded-lg shadow-inner"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1">
                <p className="text-xs font-medium text-white line-clamp-1">
                  {item.name}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  {item.dimensions.width.toFixed(1)}×{item.dimensions.depth.toFixed(1)}×
                  {item.dimensions.height.toFixed(1)} ft
                </p>
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 opacity-0 transition-opacity group-hover:opacity-100">
                <Plus className="h-3.5 w-3.5" />
              </div>
            </button>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="py-8 text-center text-sm text-slate-500">
            No furniture found
          </div>
        )}
      </div>

      {/* Help text */}
      <div className="mt-4 rounded-lg border border-white/5 bg-slate-900/50 p-3 text-xs text-slate-500">
        Click an item to add it to your room. Position it in the 3D view.
      </div>
    </div>
  );
}
