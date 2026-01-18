"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/lib/dormRoomState";
import { Send, Bot, User } from "lucide-react";

interface ChatbotPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

export default function ChatbotPanel({ messages, onSendMessage }: ChatbotPanelProps) {
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
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 bg-slate-900/50 p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
            <Bot className="h-4 w-4 text-blue-300" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Room Assistant</h3>
            <p className="text-xs text-slate-400">Ask me to arrange furniture</p>
          </div>
        </div>
      </div>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center max-w-xs">
              <Bot className="h-12 w-12 mx-auto text-slate-600 mb-3" />
              <p className="text-sm text-slate-400">
                Try commands like:
              </p>
              <ul className="mt-2 space-y-1 text-xs text-slate-500">
                <li>"place chair at desk"</li>
                <li>"put shelf opposite bed"</li>
                <li>"center bed on back wall"</li>
                <li>"move desk to corner"</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20">
                    <Bot className="h-3.5 w-3.5 text-blue-300" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-500/20 text-blue-100'
                      : 'bg-slate-800/50 text-slate-200'
                  }`}
                >
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-1' : ''}>
                      {line}
                    </p>
                  ))}
                </div>

                {msg.role === 'user' && (
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-700/50">
                    <User className="h-3.5 w-3.5 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="border-t border-white/10 bg-slate-900/50 p-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to arrange furniture..."
            className="flex-1 rounded-lg border border-white/10 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex items-center justify-center rounded-lg bg-blue-500/20 px-4 py-2 text-blue-300 transition-colors hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
