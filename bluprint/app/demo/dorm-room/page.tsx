"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500" />
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
          <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200 hover:bg-white/10 transition-colors">
            Save
          </button>
          <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200 hover:bg-white/10 transition-colors">
            Export
          </button>
          <button className="rounded-full border border-blue-400/20 bg-blue-500/20 px-4 py-2 text-xs text-blue-100 hover:bg-blue-500/30 transition-colors">
            Share
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Inventory */}
        <div className="w-72 flex-shrink-0 border-r border-white/10 bg-slate-900/30">
          <div className="border-b border-white/10 bg-slate-900/50 px-4 py-3">
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

          {/* Floating controls */}
          <div className="absolute right-4 top-4">
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

        {/* Right Sidebar - Chatbot */}
        <div className="w-80 flex-shrink-0 border-l border-white/10 bg-slate-900/30">
          <ChatbotPanel
            messages={messages}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
}
