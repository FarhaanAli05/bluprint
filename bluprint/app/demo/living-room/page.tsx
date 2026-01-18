"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { initialLivingRoomState, SceneObject, ChatMessage, parseCommand, LIVING_ROOM } from "@/lib/livingRoomState";
import ChatbotPanel from "@/components/3d-viewer/ChatbotPanel";
import TopToolbar from "@/components/3d-viewer/TopToolbar";

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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Welcome to the Living Room demo! This room features a beautiful stone fireplace with gray accent wall, decorative staircase with wrought iron railings, and plenty of natural light. How can I help you design this space?',
      timestamp: Date.now(),
    }
  ]);
  const [showGrid, setShowGrid] = useState(false);
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [showShadows, setShowShadows] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);

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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
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
                  d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
            </div>
            <div>
              <h1 className="font-semibold text-white">Living Room Demo</h1>
              <p className="text-xs text-slate-400">{LIVING_ROOM.width} × {LIVING_ROOM.depth} feet</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/demo/bedroom"
            className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs text-white hover:bg-white/10 transition-colors"
          >
            View Bedroom Demo
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

          {/* Room info card */}
          <div className="absolute bottom-4 left-4 z-10">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl">
              <p className="text-xs text-slate-400">Room Features</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-200">Stone Fireplace</span>
                <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] text-blue-200">Wrought Iron Stairs</span>
                <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] text-green-200">Natural Light</span>
              </div>
            </div>
          </div>
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
