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
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-violet-500/30 border-t-violet-500" />
          <p className="mt-4 text-slate-400">Loading 3D Viewer...</p>
        </div>
      </div>
    )
  }
);

export default function BedroomDemoPage() {
  const [sceneObjects, setSceneObjects] = useState<SceneObject[]>(initialSceneState);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Welcome to the Bedroom demo! This cozy dorm room features a bed, desk with hutch, wardrobe, and office chair. How can I help you arrange the furniture?',
      timestamp: Date.now(),
    }
  ]);
  const [showGrid, setShowGrid] = useState(false);
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [showShadows, setShowShadows] = useState(true);
  const [inventoryUnlocked, setInventoryUnlocked] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);

  // Poll API for storage status
  useEffect(() => {
    const checkStorageStatus = async () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }

      try {
        const response = await fetch('/api/storage/status');
        const data = await response.json();

        if (data.success && data.state.unlocked) {
          setInventoryUnlocked(true);
        } else {
          setInventoryUnlocked(false);
        }
      } catch (error) {
        console.error('Failed to check storage status:', error);
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

    const result = parseCommand(content, sceneObjects);
    const assistantMessage: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: result.message,
      timestamp: Date.now() + 1,
    };

    if (result.success && result.updatedObjects) {
      setSceneObjects(result.updatedObjects);
    }

    setMessages([...messages, userMessage, assistantMessage]);
  };

  const handleResetView = () => {
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

      {/* Glassmorphism Header */}
      <header className="relative z-20 flex h-16 items-center justify-between border-b border-white/10 bg-white/5 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-400 transition-all hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="h-5 w-px bg-white/10" />
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-lg shadow-violet-500/20">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 text-white"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z"
                />
              </svg>
            </div>
            <div>
              <h1 className="font-semibold text-white">Bedroom Demo</h1>
              <p className="text-xs text-slate-400">{ROOM.width} × {ROOM.depth} feet</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/demo/living-room"
            className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs text-white hover:bg-white/10 transition-colors"
          >
            View Living Room Demo
          </Link>
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
        {/* Left Sidebar - Inventory */}
        {inventoryUnlocked && (
          <div className="w-72 flex-shrink-0 border-r border-white/10 bg-slate-900/30">
            <div className="border-b border-white/10 bg-slate-900/50 px-4 py-3">
              <h2 className="text-sm font-semibold text-white">Inventory</h2>
              <p className="mt-0.5 text-xs text-slate-400">
                {sceneObjects.filter(obj => obj.type === 'bookshelf').length} items in room
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

      {/* Right Sidebar - Chatbot */}
      <div className="fixed left-2 right-2 top-20 bottom-4 rounded-lg border border-white/10 bg-slate-900/95 backdrop-blur flex flex-col overflow-hidden shadow-2xl sm:left-auto sm:right-4 sm:w-80">
        <ChatbotPanel
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
