import { useRef, useEffect, useState } from "react";
import { ChatMessage } from "@/lib/dormRoomState";
import { TYPING_INDICATOR_TOKEN } from "@/components/3d-viewer/ChatbotPanel";

interface UseChatDemoOptions {
  onMessageComplete?: (message: ChatMessage) => void;
}

/**
 * Hook for managing chat demo behavior with:
 * - Random 3-5s delay before response
 * - Animated typing indicator
 * - Word-by-word streaming response
 */
export function useChatDemo({ onMessageComplete }: UseChatDemoOptions = {}) {
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

  const sendMessageWithDelay = (
    userMessage: ChatMessage,
    assistantReply: string,
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  ) => {
    if (isChatBusy) {
      return;
    }

    // Random delay between 3000-5000ms
    const delayMs = 3000 + Math.floor(Math.random() * 2001);
    const streamInterval = 80 + Math.floor(Math.random() * 61);
    const assistantId = `msg-${Date.now() + 1}`;

    setIsChatBusy(true);

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

    // After delay, start streaming words
    scheduleTimeout(() => {
      const words = assistantReply.split(/\s+/).filter(Boolean);
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
          if (onMessageComplete) {
            onMessageComplete({
              id: assistantId,
              role: 'assistant',
              content: assistantReply,
              timestamp: Date.now(),
            });
          }
          return;
        }

        const jitter = 80 + Math.floor(Math.random() * 61);
        scheduleTimeout(tick, jitter);
      };

      scheduleTimeout(tick, streamInterval);
    }, delayMs);
  };

  return {
    isChatBusy,
    sendMessageWithDelay,
    clearAllTimeouts,
    setIsChatBusy,
  };
}
