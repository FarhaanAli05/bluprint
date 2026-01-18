"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { initialLivingRoomState, SceneObject, ChatMessage, parseCommand, LIVING_ROOM } from "@/lib/livingRoomState";
import ChatbotPanel from "@/components/3d-viewer/ChatbotPanel";
import TopHeader from "@/components/shared/TopHeader";
import { useChatDemo } from "@/hooks/useChatDemo";
import { useResetDemo } from "@/hooks/useResetDemo";

// Dynamic import to avoid SSR issues with Three.js
const LivingRoomViewer = dynamic(
  () => import("@/components/3d-viewer/LivingRoomViewer"),
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

export default function LivingRoomDemoPage() {
  const [sceneObjects, setSceneObjects] = useState<SceneObject[]>(initialLivingRoomState);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showGrid, setShowGrid] = useState(false);
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [showShadows, setShowShadows] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [chatTurn, setChatTurn] = useState(0);

  // Use shared chat demo hook
  const { isChatBusy, sendMessageWithDelay, clearAllTimeouts, setIsChatBusy } = useChatDemo();

  // Use shared reset demo hook
  const { handleResetDemo } = useResetDemo({
    setIsChatBusy,
    setChatTurn,
    setMessages,
    setSelectedId,
    setSceneObjects,
    setInventoryUnlocked: () => {}, // No inventory in living room
    clearAllTimeouts,
    initialState: initialLivingRoomState, // Empty array for living room
  });

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

    const result = parseCommand(content, sceneObjects);
    sendMessageWithDelay(userMessage, result.message, setMessages);

    // Apply scene updates if command was successful
    if (result.success && result.updatedObjects) {
      const updatedObjects = result.updatedObjects;
      setTimeout(() => {
        setSceneObjects(updatedObjects);
      }, 3000 + Math.floor(Math.random() * 2001) + 500);
    }
  };

  const handleResetView = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('resetLivingRoomView'));
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
      <TopHeader
        title="Living Room Demo"
        showGrid={showGrid}
        showBlueprint={showBlueprint}
        showShadows={showShadows}
        autoRotate={autoRotate}
        onToggleGrid={() => setShowGrid(!showGrid)}
        onToggleBlueprint={() => setShowBlueprint(!showBlueprint)}
        onToggleShadows={() => setShowShadows(!showShadows)}
        onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
        onResetView={handleResetView}
        onResetDemo={handleResetDemo}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Center - 3D Viewer */}
        <div className="relative flex-1">
          <LivingRoomViewer
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
          isBusy={isChatBusy}
        />
      </div>
    </div>
  );
}
