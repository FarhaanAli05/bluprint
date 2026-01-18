"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, MessageCircle, X } from "lucide-react";
import { initialSceneState, SceneObject, ChatMessage, parseCommand, ROOM } from "@/lib/dormRoomState";
import InventoryPanel from "@/components/3d-viewer/InventoryPanel";
import ChatbotPanel from "@/components/3d-viewer/ChatbotPanel";
import SceneControlsPanel from "@/components/3d-viewer/SceneControlsPanel";

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

export default function DormRoomDemoPage() {
  const [sceneObjects, setSceneObjects] = useState<SceneObject[]>(initialSceneState);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showGrid, setShowGrid] = useState(true);
  const [showBlueprint, setShowBlueprint] = useState(true);
  const [showShadows, setShowShadows] = useState(true);
  const [cameraMode, setCameraMode] = useState<'orbit' | 'topDown' | 'firstPerson'>('orbit');
  const [isChatOpen, setIsChatOpen] = useState(false);

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

    setMessages([...messages, userMessage, assistantMessage]);

    if (result.success && result.updatedObjects) {
      setSceneObjects(result.updatedObjects);
    }
  };

  const handleResetView = () => {
    console.log('Reset view');
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
              <h1 className="font-semibold text-white">Interactive Dorm Room</h1>
              <p className="text-xs text-slate-400">{ROOM.width} × {ROOM.depth} feet</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 backdrop-blur transition-all hover:bg-white/10 hover:border-white/20">
            Save
          </button>
          <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 backdrop-blur transition-all hover:bg-white/10 hover:border-white/20">
            Export
          </button>
          <button className="rounded-xl border border-violet-400/30 bg-violet-500/20 px-4 py-2 text-sm font-medium text-violet-100 backdrop-blur transition-all hover:bg-violet-500/30">
            Share
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Left Sidebar - Inventory with Glassmorphism */}
        <div className="relative z-10 w-72 flex-shrink-0 border-r border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="border-b border-white/10 bg-white/5 px-4 py-4">
            <h2 className="text-sm font-semibold text-white">Inventory</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {sceneObjects.length} items in room
            </p>
          </div>
          <InventoryPanel onAddItem={handleAddItem} />
        </div>

        {/* Center - 3D Viewer */}
        <div className="relative flex-1">
          <EnhancedDormViewer
            sceneObjects={sceneObjects}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          {/* Floating controls with Glassmorphism */}
          <div className="absolute right-4 top-4 z-10">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl">
              <SceneControlsPanel
                showGrid={showGrid}
                showBlueprint={showBlueprint}
                showShadows={showShadows}
                cameraMode={cameraMode}
                onToggleGrid={() => setShowGrid(!showGrid)}
                onToggleBlueprint={() => setShowBlueprint(!showBlueprint)}
                onToggleShadows={() => setShowShadows(!showShadows)}
                onChangeCameraMode={setCameraMode}
                onResetView={handleResetView}
              />
            </div>
          </div>

          {/* Selected object info with Glassmorphism */}
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

        {/* Collapsible Chat Panel */}
        <div
          className={`fixed bottom-0 right-0 z-30 transition-all duration-500 ease-out ${
            isChatOpen 
              ? 'h-[calc(100vh-4rem)] w-96 translate-x-0' 
              : 'h-16 w-16 translate-x-0'
          }`}
        >
          {/* Chat Toggle Button (visible when closed) */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`absolute transition-all duration-300 ${
              isChatOpen
                ? 'right-4 top-4 z-50'
                : 'bottom-6 right-6 z-50'
            }`}
          >
            <div
              className={`flex items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-violet-500/90 to-blue-500/90 shadow-2xl shadow-violet-500/30 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-violet-500/40 ${
                isChatOpen
                  ? 'h-10 w-10'
                  : 'h-14 w-14'
              }`}
            >
              {isChatOpen ? (
                <X className="h-5 w-5 text-white" />
              ) : (
                <>
                  <MessageCircle className="h-6 w-6 text-white" />
                  {/* Notification dot */}
                  <span className="absolute -right-1 -top-1 flex h-4 w-4">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                    <span className="relative inline-flex h-4 w-4 rounded-full bg-violet-500" />
                  </span>
                </>
              )}
            </div>
          </button>

          {/* Chat Panel Content */}
          <div
            className={`h-full w-full overflow-hidden transition-all duration-500 ${
              isChatOpen
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
            <div className="flex h-full flex-col rounded-tl-3xl border-l border-t border-white/10 bg-white/5 backdrop-blur-2xl">
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-lg shadow-violet-500/20">
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
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Room Assistant</h3>
                    <p className="text-xs text-slate-400">AI-powered layout help</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-emerald-400">Online</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-hidden">
                <ChatbotPanel
                  messages={messages}
                  onSendMessage={handleSendMessage}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chat button tooltip (visible when chat is closed) */}
        {!isChatOpen && (
          <div className="pointer-events-none fixed bottom-[5.5rem] right-6 z-20 opacity-0 transition-opacity duration-300 hover:opacity-100">
            <div className="rounded-lg border border-white/10 bg-slate-900/90 px-3 py-1.5 text-xs text-white backdrop-blur">
              Room Assistant
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
