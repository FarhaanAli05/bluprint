import { ChatMessage, SceneObject, initialSceneState } from "@/lib/dormRoomState";

interface UseResetDemoOptions {
  setIsChatBusy: (busy: boolean) => void;
  setChatTurn: (turn: number) => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setSelectedId: (id: string | null) => void;
  setSceneObjects: React.Dispatch<React.SetStateAction<SceneObject[]>>;
  setInventoryUnlocked: (unlocked: boolean) => void;
  clearAllTimeouts: () => void;
  initialState?: SceneObject[]; // Optional initial state, defaults to dorm room state
}

/**
 * Hook for managing demo reset functionality:
 * - Clears all chat timeouts
 * - Resets chat state (messages, turn counter, busy state)
 * - Clears placed objects (returns to initial state)
 * - Clears inventory/unlock state
 * - Calls API to reset server state
 */
export function useResetDemo({
  setIsChatBusy,
  setChatTurn,
  setMessages,
  setSelectedId,
  setSceneObjects,
  setInventoryUnlocked,
  clearAllTimeouts,
  initialState = initialSceneState,
}: UseResetDemoOptions) {
  const resetDemoState = () => {
    clearAllTimeouts();
    setIsChatBusy(false);
    setChatTurn(0);
    setMessages([]);
    setSelectedId(null);
    setSceneObjects(initialState);
    setInventoryUnlocked(false);
  };

  const handleResetDemo = async () => {
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

  return {
    resetDemoState,
    handleResetDemo,
  };
}
