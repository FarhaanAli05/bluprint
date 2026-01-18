"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/lib/dormRoomState";
import Image from "next/image";
import { Send, User } from "lucide-react";

interface ChatbotPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isBusy?: boolean;
}

export const TYPING_INDICATOR_TOKEN = "__typing__";

function TypingIndicator() {
  return (
    <span className="typingDots">
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
    </span>
  );
}

export default function ChatbotPanel({ messages, onSendMessage, isBusy = false }: ChatbotPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // Scroll only the messages container, not the whole page
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy) {
      return;
    }
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const suggestions = [
    "place chair at desk",
    "center bed on back wall",
    "move desk to corner",
    "put shelf opposite bed",
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 bg-slate-900/50 p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
            <Image src="/bluprintlog.png" alt="BluPrint" width={18} height={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Room Assistant</h3>
            <p className="text-xs text-slate-400">Ask me to arrange furniture</p>
          </div>
        </div>
      </div>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="text-center max-w-xs">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 ring-1 ring-white/10">
                <Image src="/bluprintlog.png" alt="BluPrint" width={36} height={36} />
              </div>
              <h4 className="text-sm font-semibold text-white">
                How can I help?
              </h4>
              <p className="mt-2 text-xs text-slate-400">
                I can help you arrange furniture in your room. Try these commands:
              </p>
              
              {/* Suggestion chips */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(suggestion);
                    }}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition-all hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                style={{
                  animation: `fadeSlideIn 0.3s ease-out ${index * 0.05}s both`,
                }}
              >
                {msg.role === 'assistant' && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 ring-1 ring-white/10">
                    <Image src="/bluprintlog.png" alt="BluPrint" width={16} height={16} />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm min-h-[2rem] ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/20'
                      : 'border border-white/10 bg-white/5 text-slate-200 backdrop-blur'
                  }`}
                >
                  {msg.role === 'assistant' && msg.content === TYPING_INDICATOR_TOKEN ? (
                    <TypingIndicator />
                  ) : (
                    msg.content.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-1' : ''}>
                        {line}
                      </p>
                    ))
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
                    <User className="h-4 w-4 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 bg-white/5 p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to arrange furniture..."
            disabled={isBusy}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 backdrop-blur transition-all focus:border-violet-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-violet-400/20 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || isBusy}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/20 transition-all hover:scale-105 hover:shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
