"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { initialSceneState, SceneObject, ChatMessage, parseCommand, ROOM } from "@/lib/dormRoomState";
import InventoryPanel from "@/components/3d-viewer/InventoryPanel";
import ChatbotPanel, { TYPING_INDICATOR_TOKEN } from "@/components/3d-viewer/ChatbotPanel";
import TopToolbar from "@/components/3d-viewer/TopToolbar";

// Dynamic import to avoid SSR issues with Three.js
const EnhancedDormViewer = dynamic(
  () => import("@/components/3d-viewer/EnhancedDormViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-[#0a1128]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-violet-500/30 border-t-violet-500" />
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
  const [isChatBusy, setIsChatBusy] = useState(false);
  const chatTimeoutsRef = useRef<number[]>([]);

  const bookshelfCount = useMemo(
    () => sceneObjects.filter((obj) => obj.type === "bookshelf").length,
    [sceneObjects]
  );

  useEffect(() => {
    return () => {
      chatTimeoutsRef.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      chatTimeoutsRef.current = [];
    };
  }, []);

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

  const resetDemoState = () => {
    chatTimeoutsRef.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    chatTimeoutsRef.current = [];
    setIsChatBusy(false);
    setChatTurn(0);
    setMessages([]);
    setSelectedId(null);
    setSceneObjects(initialSceneState);
    setInventoryUnlocked(false);
  };

  const handleClearStorage = async () => {
    if (!window.confirm('Are you sure you want to reset the demo?')) {
      return;
    }
    resetDemoState();
    try {
      console.log('[BluPrint Web] Resetting storage via API...');
      const response = await fetch('/api/storage/reset', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        console.log('[BluPrint Web] ✅ Storage reset successful');
      }
    } catch (error) {
      console.error('[BluPrint Web] ❌ Failed to reset storage:', error);
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
    if (isChatBusy) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    // Check if bookshelf exists in scene
    const hasBookshelf = sceneObjects.some(obj => obj.type === 'bookshelf');

    const delayMs = 3000 + Math.floor(Math.random() * 2001);
    const streamInterval = 80 + Math.floor(Math.random() * 61);
    const assistantId = `msg-${Date.now() + 1}`;

    const scheduleTimeout = (callback: () => void, delay: number) => {
      const timeoutId = window.setTimeout(callback, delay);
      chatTimeoutsRef.current.push(timeoutId);
      return timeoutId;
    };

    const enqueueMessage = (reply: string, onComplete?: () => void) => {
      setIsChatBusy(true);
      setMessages((prev) => [
        ...prev,
        userMessage,
        {
          id: assistantId,
          role: 'assistant',
          content: TYPING_INDICATOR_TOKEN,
          timestamp: Date.now() + 1,
        },
      ]);

      scheduleTimeout(() => {
        const words = reply.split(/\s+/).filter(Boolean);
        let index = 0;
        const tick = () => {
          index += 1;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? { ...msg, content: words.slice(0, index).join(' ') }
                : msg
            )
          );
          if (index >= words.length) {
            setIsChatBusy(false);
            onComplete?.();
            return;
          }
          const jitter = 80 + Math.floor(Math.random() * 61);
          scheduleTimeout(tick, jitter);
        };
        scheduleTimeout(tick, streamInterval);
      }, delayMs);
    };

    // Scripted AI behavior (only if bookshelf exists)
    if (hasBookshelf) {
      const currentTurn = chatTurn + 1;
      setChatTurn(currentTurn);

      if (currentTurn === 1) {
        enqueueMessage('Placing the bookshelf beside the painting.', () => {
          setSceneObjects((prev) => {
            const bookshelfIndex = prev.findIndex(obj => obj.type === 'bookshelf');
            if (bookshelfIndex === -1) return prev;
            const updated = [...prev];
            updated[bookshelfIndex] = {
              ...updated[bookshelfIndex],
              position: BOOKSHELF_TRANSFORMS.besidePainting.position,
              rotation: BOOKSHELF_TRANSFORMS.besidePainting.rotation,
            };
            return updated;
          });
        });
        return;
      }

      if (currentTurn === 2) {
        enqueueMessage('Moving it to the right of the bed, between the bed and radiator.', () => {
          setSceneObjects((prev) => {
            const bookshelfIndex = prev.findIndex(obj => obj.type === 'bookshelf');
            if (bookshelfIndex === -1) return prev;
            const updated = [...prev];
            updated[bookshelfIndex] = {
              ...updated[bookshelfIndex],
              position: BOOKSHELF_TRANSFORMS.besideBed.position,
              rotation: BOOKSHELF_TRANSFORMS.besideBed.rotation,
            };
            return updated;
          });
        });
        return;
      }

      enqueueMessage('The bookshelf is in position. You can fine-tune it if needed.');
      return;
    }

    // No bookshelf - use default parser
    const result = parseCommand(content, sceneObjects);
    enqueueMessage(result.message, () => {
      if (result.success && result.updatedObjects) {
        setSceneObjects(result.updatedObjects);
      }
    });
  };

  const handleResetView = () => {
    // Dispatch custom event to reset the view
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('resetDormView'));
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden text-slate-100">
      {/* Animated gradient background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.12) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
            linear-gradient(180deg, #0b0f1a 0%, #0f172a 100%)
          `,
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="fixed inset-0 -z-10 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Header */}
      <header className="relative z-20 flex h-14 items-center justify-between gap-4 border-b border-white/10 bg-white/5 px-6 backdrop-blur-xl">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200 transition-colors hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to home</span>
          </Link>
          <h1 className="truncate font-semibold text-white">Interactive Dorm Room</h1>
        </div>

        <div className="flex items-center gap-3">
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
          <button
            onClick={handleClearStorage}
            className="cursor-pointer rounded-full border border-red-400/20 bg-red-500/20 px-4 py-2 text-xs text-red-100 transition-colors hover:bg-red-500/30"
          >
            Reset Demo
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Inventory (hidden until unlocked) */}
        {inventoryUnlocked && (
          <div className="w-72 flex-shrink-0 border-r border-white/10 bg-slate-900/30">
            <div className="border-b border-white/10 bg-slate-900/50 px-4 py-3">
              <h2 className="text-sm font-semibold text-white">Inventory</h2>
              <p className="mt-0.5 text-xs text-slate-400">
                {bookshelfCount} {bookshelfCount === 1 ? 'item' : 'items'} in room
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
            <div className="absolute bottom-4 left-4 z-10">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl">
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
          isBusy={isChatBusy}
        />
      </div>
    </div>
  );
}
