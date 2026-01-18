"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { initialLivingRoomState, SceneObject, ChatMessage } from "@/lib/livingRoomState";
import ChatbotPanel from "@/components/3d-viewer/ChatbotPanel";
import TopHeader from "@/components/shared/TopHeader";
import { TYPING_INDICATOR_TOKEN } from "@/components/3d-viewer/ChatbotPanel";

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

// Staged demo responses
const DEMO_RESPONSES = [
  "I've added more chairs around the dining table to complete the set. Now you have a proper dining area for the whole family!",
  "I've made the room cozier by adding a cat tower, a beautiful potted plant, and a painting of Van Gogh's 'Cafe Terrace at Night' on the wall. The space feels much more lived-in now!",
  "The room is looking great! Feel free to ask me about arranging other furniture or making any changes you'd like.",
];

export default function LivingRoomDemoPage() {
  const [sceneObjects, setSceneObjects] = useState<SceneObject[]>(initialLivingRoomState);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showGrid, setShowGrid] = useState(false);
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [showShadows, setShowShadows] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [chatTurn, setChatTurn] = useState(0);
  const [demoStage, setDemoStage] = useState(0);
  const [isChatBusy, setIsChatBusy] = useState(false);
  const chatTimeoutsRef = useRef<number[]>([]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      chatTimeoutsRef.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      chatTimeoutsRef.current = [];
    };
  }, []);

  const scheduleTimeout = (callback: () => void, delay: number) => {
    const timeoutId = window.setTimeout(callback, delay);
    chatTimeoutsRef.current.push(timeoutId);
    return timeoutId;
  };

  const clearAllTimeouts = () => {
    chatTimeoutsRef.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    chatTimeoutsRef.current = [];
  };

  const handleResetDemo = () => {
    clearAllTimeouts();
    setIsChatBusy(false);
    setChatTurn(0);
    setDemoStage(0);
    setMessages([]);
    setSelectedId(null);
    setSceneObjects(initialLivingRoomState);
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

    // Random delay between 3000-5000ms
    const delayMs = 3000 + Math.floor(Math.random() * 2001);
    const assistantId = `msg-${Date.now() + 1}`;
    const currentTurn = chatTurn;

    // Get the appropriate response based on current turn
    const responseText = DEMO_RESPONSES[Math.min(currentTurn, DEMO_RESPONSES.length - 1)];

    setIsChatBusy(true);
    setChatTurn((prev) => prev + 1);

    // Add user message and typing indicator immediately
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

    // After delay, update scene stage (before starting to type response)
    scheduleTimeout(() => {
      // Update demo stage based on turn
      if (currentTurn === 0) {
        setDemoStage(1); // Add chairs
      } else if (currentTurn === 1) {
        setDemoStage(2); // Add cozy items
      }

      // Start streaming words
      const words = responseText.split(/\s+/).filter(Boolean);
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
          return;
        }

        const jitter = 80 + Math.floor(Math.random() * 61);
        scheduleTimeout(tick, jitter);
      };

      const streamInterval = 80 + Math.floor(Math.random() * 61);
      scheduleTimeout(tick, streamInterval);
    }, delayMs);
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
            demoStage={demoStage}
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
