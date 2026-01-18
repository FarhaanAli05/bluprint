"use client";

import { furnitureInventory, bookshelfItem, FurnitureItem, SceneObject } from "@/lib/dormRoomState";
import { Plus } from "lucide-react";
import Image from "next/image";

interface InventoryPanelProps {
  onAddItem: (type: SceneObject['type']) => void;
  showBookshelf?: boolean;
}

export default function InventoryPanel({ onAddItem, showBookshelf = false }: InventoryPanelProps) {
  const inventory = showBookshelf ? [...furnitureInventory, bookshelfItem] : furnitureInventory;
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Furniture Inventory</h3>
        <p className="text-xs text-slate-400 mb-4">
          Click an item to add it to your room
        </p>

        <div className="space-y-3">
          {inventory.map((item) => (
            <button
              key={item.id}
              onClick={() => onAddItem(item.type)}
              className="w-full group relative overflow-hidden rounded-lg border border-white/10 bg-slate-900/50 p-3 text-left transition-all hover:border-blue-500/50 hover:bg-slate-800/70"
            >
              <div className="flex items-start gap-3">
                {/* Show Billy image thumbnail for bookshelf, Plus icon for others */}
                {item.type === 'bookshelf' ? (
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src="/billy-bookcase.jpg"
                      alt="BILLY Bookcase"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-300">
                    <Plus className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm">{item.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.dimensions}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.color}</p>
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-blue-400/20 bg-blue-500/10 p-3">
          <p className="text-xs text-blue-200">
            <strong>Tip:</strong> Use the chatbot to position furniture with natural language commands like "place chair at desk"
          </p>
        </div>
      </div>
    </div>
  );
}
