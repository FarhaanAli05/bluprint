"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { initialSceneState, SceneObject, ChatMessage, parseCommand, ROOM } from "@/lib/dormRoomState";
import InventoryPanel from "@/components/3d-viewer/InventoryPanel";
import ChatbotPanel from "@/components/3d-viewer/ChatbotPanel";
import TopToolbar from "@/components/3d-viewer/TopToolbar";

// Dynamic import to avoid SSR issues with Three.js
const EnhancedDormViewer = dynamic(
  () => import("@/components/3d-viewer/EnhancedDormViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-[#0a1128]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500" />
          <p className="mt-4 text-slate-400">Loading 3D Viewer...</p>
        </div>
      </div>
    )
  }
);

const BOOKSHELF_SCALE = 3;
const BOOKSHELF_DIMENSIONS = {
  width: 0.4 * BOOKSHELF_SCALE,
  depth: 0.28 * BOOKSHELF_SCALE,
};
const BOOKSHELF_CLEARANCE = 0.03;
const PAINTING_HALF_WIDTH = 0.7;
const RIGHT_WALL_X =
  ROOM.width / 2 - ROOM.wallThickness - BOOKSHELF_DIMENSIONS.depth / 2 - BOOKSHELF_CLEARANCE;
const BACK_WALL_Z =
  -ROOM.depth / 2 + ROOM.wallThickness + BOOKSHELF_DIMENSIONS.depth / 2 + BOOKSHELF_CLEARANCE;
const BED_CENTER_X = -ROOM.width / 2 + 2;
const BED_HALF_WIDTH = 3.25 / 2;
const RADIATOR_CENTER_X = 1.5;
const RADIATOR_HALF_WIDTH = 3.5 / 2;
const BOOKSHELF_BED_X = (BED_CENTER_X + BED_HALF_WIDTH + RADIATOR_CENTER_X - RADIATOR_HALF_WIDTH) / 2;

const BOOKSHELF_TRANSFORMS = {
  besidePainting: {
    position: [RIGHT_WALL_X, 0, 2 + PAINTING_HALF_WIDTH + BOOKSHELF_DIMENSIONS.width / 2 + BOOKSHELF_CLEARANCE] as [number, number, number],
    rotation: -Math.PI / 2,
  },
  besideBed: {
    position: [BOOKSHELF_BED_X, 0, BACK_WALL_Z] as [number, number, number],
    rotation: 0,
  },
};

export default function DormRoomDemoPage() {
  const [sceneObjects, setSceneObjects] = useState<SceneObject[]>(initialSceneState);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showGrid, setShowGrid] = useState(false);
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [showShadows, setShowShadows] = useState(true);
  const [inventoryUnlocked, setInventoryUnlocked] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [chatTurn, setChatTurn] = useState(0); // Track chat turn for scripted behavior

  // Poll API for storage status (reliable cross-tab sync via server)
  useEffect(() => {
    const checkStorageStatus = async () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }

      try {
        const response = await fetch('/api/storage/status');
        const data = await response.json();

        if (data.success && data.state.unlocked) {
          if (!inventoryUnlocked) {
            console.log('[BluPrint Web] ✅ Storage unlocked via API poll:', data.state);
          }
          setInventoryUnlocked(true);
        } else {
          if (inventoryUnlocked) {
            console.log('[BluPrint Web] 🔒 Storage locked via API poll');
          }
          setInventoryUnlocked(false);
        }
      } catch (error) {
        console.error('[BluPrint Web] ❌ Failed to check storage status:', error);
      }
    };

    let interval: ReturnType<typeof setInterval> | null = null;

    if (!inventoryUnlocked) {
      checkStorageStatus();
      interval = setInterval(checkStorageStatus, 1000);
    }

    const handleVisibility = () => {
      if (!document.hidden && !inventoryUnlocked) {
        checkStorageStatus();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [inventoryUnlocked]);

  const handleClearStorage = async () => {
    try {
      console.log('[BluPrint Web] Resetting storage via API...');
      const response = await fetch('/api/storage/reset', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        console.log('[BluPrint Web] ✅ Storage reset successful');
        setInventoryUnlocked(false);
      }
    } catch (error) {
      console.error('[BluPrint Web] ❌ Failed to reset storage:', error);
      setInventoryUnlocked(false);
    }
  };

  const handleAddItem = (type: SceneObject['type']) => {
    const newId = `${type}-${Date.now()}`;
    const newObject: SceneObject = {
      id: newId,
      type,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      position: [0, 0, 0],
      rotation: 0,
    };
    setSceneObjects([...sceneObjects, newObject]);
    setSelectedId(newId);

    const assistantMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: `I've added a ${newObject.name} to the center of the room. You can select it and move it around.`,
      timestamp: Date.now(),
    };
    setMessages([...messages, assistantMessage]);
  };

  const handleSendMessage = (content: string) => {
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    // Check if bookshelf exists in scene
    const bookshelfIndex = sceneObjects.findIndex(obj => obj.type === 'bookshelf');
    const hasBookshelf = bookshelfIndex !== -1;

    let assistantMessage: ChatMessage;
    let updatedObjects = sceneObjects;

    // Scripted AI behavior (only if bookshelf exists)
    if (hasBookshelf) {
      const currentTurn = chatTurn + 1;
      setChatTurn(currentTurn);

      if (currentTurn === 1) {
        updatedObjects = [...sceneObjects];
        updatedObjects[bookshelfIndex] = {
          ...updatedObjects[bookshelfIndex],
          position: BOOKSHELF_TRANSFORMS.besidePainting.position,
          rotation: BOOKSHELF_TRANSFORMS.besidePainting.rotation,
        };

        console.log('[Turn 1] Bookshelf placed beside painting:', BOOKSHELF_TRANSFORMS.besidePainting);

        assistantMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: 'Placed bookshelf beside the painting.',
          timestamp: Date.now() + 1,
        };
      } else if (currentTurn === 2) {
        updatedObjects = [...sceneObjects];
        updatedObjects[bookshelfIndex] = {
          ...updatedObjects[bookshelfIndex],
          position: BOOKSHELF_TRANSFORMS.besideBed.position,
          rotation: BOOKSHELF_TRANSFORMS.besideBed.rotation,
        };

        assistantMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: 'Moved bookshelf beside the bed between the bed and radiator.',
          timestamp: Date.now() + 1,
        };
      } else {
        // Turn 3+: Default response
        assistantMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: 'The bookshelf is in position. You can manually adjust it by selecting and dragging.',
          timestamp: Date.now() + 1,
        };
      }
    } else {
      // No bookshelf - use default parser
      const result = parseCommand(content, sceneObjects);
      assistantMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: result.message,
        timestamp: Date.now() + 1,
      };
      if (result.success && result.updatedObjects) {
        updatedObjects = result.updatedObjects;
      }
    }

    setMessages([...messages, userMessage, assistantMessage]);
    setSceneObjects(updatedObjects);
  };

  const handleResetView = () => {
    // Dispatch custom event to reset the view
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('resetDormView'));
    }
  };

  return (
    <div className="flex h-screen flex-col bg-[#0b1020] text-slate-100">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-white/10 bg-slate-900/80 px-4 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <h1 className="font-semibold text-white">Interactive Dorm Room</h1>
          <span className="hidden rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-400 sm:inline">
            {ROOM.width} × {ROOM.depth} feet
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearStorage}
            className="rounded-full border border-red-400/20 bg-red-500/20 px-4 py-2 text-xs text-red-100 hover:bg-red-500/30 transition-colors"
          >
            Reset Demo
          </button>
        </div>
      </header>

      <div className="sticky top-14 z-20 border-b border-white/10 bg-slate-900/70 px-4 py-2 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <TopToolbar
            showGrid={showGrid}
            showBlueprint={showBlueprint}
            showShadows={showShadows}
            autoRotate={autoRotate}
            onToggleGrid={() => setShowGrid(!showGrid)}
            onToggleBlueprint={() => setShowBlueprint(!showBlueprint)}
            onToggleShadows={() => setShowShadows(!showShadows)}
            onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
            onResetView={handleResetView}
          />
          <div className="text-[11px] uppercase tracking-wide text-slate-400">View Controls</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Inventory (hidden until unlocked) */}
        {inventoryUnlocked && (
          <div className="w-72 flex-shrink-0 border-r border-white/10 bg-slate-900/30">
            <div className="border-b border-white/10 bg-slate-900/50 px-4 py-3">
              <h2 className="text-sm font-semibold text-white">Inventory</h2>
              <p className="mt-0.5 text-xs text-slate-400">
                {sceneObjects.filter(obj => obj.type === 'bookshelf').length} {sceneObjects.filter(obj => obj.type === 'bookshelf').length === 1 ? 'item' : 'items'} in room
              </p>
            </div>
            <InventoryPanel onAddItem={handleAddItem} showBookshelf={inventoryUnlocked} />
          </div>
        )}

        {/* Center - 3D Viewer */}
        <div className="relative flex-1">
          <EnhancedDormViewer
            sceneObjects={sceneObjects}
            selectedId={selectedId}
            onSelect={setSelectedId}
            showGrid={showGrid}
            showBlueprint={showBlueprint}
            showShadows={showShadows}
            autoRotate={autoRotate}
            onResetView={handleResetView}
          />

          {/* Selected object info */}
          {selectedId && (
            <div className="absolute bottom-4 left-4">
              <div className="rounded-lg border border-white/10 bg-slate-900/80 px-4 py-3 backdrop-blur">
                <p className="text-xs text-slate-400">Selected</p>
                <p className="mt-0.5 text-sm font-medium text-white">
                  {sceneObjects.find(obj => obj.id === selectedId)?.name}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Right Sidebar - Chatbot (Fixed Position Overlay) */}
      <div className="fixed left-2 right-2 top-20 bottom-4 rounded-lg border border-white/10 bg-slate-900/95 backdrop-blur flex flex-col overflow-hidden shadow-2xl sm:left-auto sm:right-4 sm:w-80">
        <ChatbotPanel
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
