"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";

// Animation timing constants
const CURSOR_HOME_X = 450;
const CURSOR_HOME_Y = 300;

type DemoState = "initial" | "loading" | "preview" | "success";

export default function ExtensionDemo() {
  const [mounted, setMounted] = useState(false);
  const [currentState, setCurrentState] = useState<DemoState>("initial");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: CURSOR_HOME_X, y: CURSOR_HOME_Y });
  const [isAutomated, setIsAutomated] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const extensionIconRef = useRef<HTMLDivElement>(null);
  const applyBtnRef = useRef<HTMLButtonElement>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const keepShoppingBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animate cursor to position
  const animateCursor = useCallback((x: number, y: number, duration: number = 800): Promise<void> => {
    return new Promise((resolve) => {
      setCursorPos({ x, y });
      setCursorVisible(true);
      setTimeout(resolve, duration);
    });
  }, []);

  // Hover and click simulation
  const hoverAndClick = useCallback(async (
    element: HTMLElement | null,
    onClick: () => void,
    hoverDuration: number = 500
  ): Promise<void> => {
    if (!element || !containerRef.current) return;

    const rect = element.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    const x = rect.left + rect.width / 2 - containerRect.left;
    const y = rect.top + rect.height / 2 - containerRect.top;

    await animateCursor(x, y, 800);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Hover duration
    await new Promise(resolve => setTimeout(resolve, hoverDuration));
    
    // Click
    onClick();
    await new Promise(resolve => setTimeout(resolve, 200));
  }, [animateCursor]);

  // Reset demo
  const resetDemo = useCallback(() => {
    setCursorVisible(false);
    setCursorPos({ x: CURSOR_HOME_X, y: CURSOR_HOME_Y });
    setIsPopupVisible(false);
    setCurrentState("initial");
    setIsLoading(false);
  }, []);

  // Main demo sequence
  const runDemo = useCallback(async () => {
    if (!isAutomated || !mounted) return;

    resetDemo();

    // Initial pause
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (!isAutomated) return;

    // Step 1: Click extension icon
    await hoverAndClick(extensionIconRef.current, () => {
      setIsPopupVisible(true);
    });

    // Dwell on Apply page
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (!isAutomated) return;

    // Step 2: Click Apply button
    await hoverAndClick(applyBtnRef.current, () => {
      setCurrentState("loading");
      setIsLoading(true);
    });

    // Loading state
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (!isAutomated) return;

    // Transition to preview
    setIsLoading(false);
    setCurrentState("preview");

    // Dwell on Preview page
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (!isAutomated) return;

    // Step 3: Click Add to storage
    await hoverAndClick(addBtnRef.current, async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentState("success");
    });

    // Dwell on Success page
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (!isAutomated) return;

    // Step 4: Click Keep shopping
    await hoverAndClick(keepShoppingBtnRef.current, () => {
      setIsPopupVisible(false);
    });

    await new Promise(resolve => setTimeout(resolve, 800));
    if (!isAutomated) return;

    // Move cursor away
    await animateCursor(CURSOR_HOME_X, CURSOR_HOME_Y, 600);
    setCursorVisible(false);

    // Brief pause before loop
    await new Promise(resolve => setTimeout(resolve, 500));
  }, [isAutomated, mounted, resetDemo, hoverAndClick, animateCursor]);

  // Auto-run demo loop
  useEffect(() => {
    if (!mounted || !isAutomated) return;

    const runDemoLoop = async () => {
      await runDemo();
      if (isAutomated) {
        setTimeout(runDemoLoop, 2000);
      }
    };

    const timeout = setTimeout(runDemoLoop, 1000);
    return () => clearTimeout(timeout);
  }, [mounted, isAutomated, runDemo]);

  if (!mounted) return null;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center"
      style={{ minHeight: "400px" }}
    >
      {/* Browser Window */}
      <div className="relative w-full max-w-[500px] bg-white rounded-lg shadow-2xl overflow-hidden" style={{ aspectRatio: "3/2" }}>
        {/* Browser Header */}
        <div className="h-8 bg-[#f5f5f5] border-b border-[#e0e0e0] flex items-center px-3 gap-2">
          {/* Window controls */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28ca42]" />
          </div>
          
          {/* URL bar */}
          <div className="flex-1 h-5 bg-white border border-[#d0d0d0] rounded px-2 flex items-center">
            <span className="text-[10px] text-gray-500 truncate">ikea.com/us/en/p/kallax-shelf-unit</span>
          </div>
          
          {/* Extension icon */}
          <div 
            ref={extensionIconRef}
            className="w-5 h-5 rounded cursor-pointer transition-transform hover:scale-105 flex items-center justify-center"
          >
            <Image 
              src="/bluprintlog.png" 
              alt="Bluprint" 
              width={20} 
              height={20}
              className="object-contain"
            />
          </div>
          
          {/* Menu icon */}
          <div className="text-gray-500 text-sm">⋮</div>
        </div>

        {/* Browser Content */}
        <div className="relative h-[calc(100%-32px)] bg-white overflow-hidden">
          {/* IKEA Page Mock */}
          <div className="p-6">
            {/* IKEA Logo */}
            <div className="mb-4">
              <div className="w-16 h-6 bg-[#0058a3] rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">IKEA</span>
              </div>
            </div>
            
            {/* Product placeholder */}
            <div className="flex gap-6">
              <div className="w-32 h-32 bg-gradient-to-br from-[#f0f0f0] to-[#e8e8e8] rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-5xl opacity-25 grayscale-[60%]">🪑</span>
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-[#f0f0f0] rounded w-3/4" />
                <div className="h-4 bg-[#f0f0f0] rounded w-1/2" />
                <div className="h-4 bg-[#f0f0f0] rounded w-2/3" />
                <div className="h-4 bg-[#f0f0f0] rounded w-1/3" />
              </div>
            </div>
          </div>

          {/* Extension Popup */}
          <div 
            className={`absolute top-8 right-2 w-36 bg-[#2563eb] rounded-md shadow-lg transition-all duration-250 z-50 ${
              isPopupVisible 
                ? "opacity-100 translate-y-0 visible" 
                : "opacity-0 -translate-y-2 invisible"
            }`}
          >
            <div className="bg-white rounded-md overflow-hidden relative" style={{ height: "173px" }}>
              {/* Blueprint background */}
              <div 
                className={`absolute inset-0 bg-cover bg-center blur-[0.5px] scale-[1.02] pointer-events-none ${
                  currentState === "success" ? "hidden" : ""
                }`}
                style={{ backgroundImage: "url('/blueback.png')" }}
              />

              {/* Initial State */}
              <div className={`absolute inset-0 flex flex-col items-center justify-center p-2 transition-all duration-300 ${
                currentState === "initial" ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
              }`}>
                <h2 className="absolute top-4 text-white text-xs font-bold z-10">bluprint</h2>
                <div className="bg-white/95 backdrop-blur rounded p-2 mt-6 w-20 z-10 shadow-sm">
                  <p className="text-[5px] text-gray-600 text-center mb-1.5">
                    Preview this item at real scale in your room
                  </p>
                  <button 
                    ref={applyBtnRef}
                    disabled={isLoading}
                    className={`w-full bg-[#2563eb] text-white text-[6px] font-semibold py-1 rounded transition-all ${
                      isLoading ? "opacity-60" : "hover:bg-[#1d4ed8]"
                    }`}
                  >
                    {isLoading ? "Scraping..." : "Apply"}
                  </button>
                </div>
              </div>

              {/* Preview State */}
              <div className={`absolute inset-0 flex flex-col items-center pt-3 px-2 transition-all duration-300 ${
                currentState === "preview" ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
              }`}>
                <div className="bg-white/95 backdrop-blur rounded p-1.5 w-full z-10 shadow-sm">
                  {/* Model preview */}
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#f0f0f0] to-[#e8e8e8] rounded flex items-center justify-center mb-1.5">
                    <span className="text-3xl opacity-25 grayscale-[60%]">🪑</span>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex gap-1">
                    <button className="flex-1 bg-[#f5f5f5] text-gray-600 text-[5px] font-semibold py-1 rounded border border-[#e0e0e0] hover:bg-[#eee]">
                      Cancel
                    </button>
                    <button 
                      ref={addBtnRef}
                      className="flex-1 bg-[#2563eb] text-white text-[5px] font-semibold py-1 rounded hover:bg-[#1d4ed8]"
                    >
                      Add to storage
                    </button>
                  </div>
                </div>
              </div>

              {/* Success State */}
              <div className={`absolute inset-0 flex flex-col items-center justify-center p-2 transition-all duration-300 ${
                currentState === "success" ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
              }`}>
                <h2 className="text-[9px] font-bold text-gray-800 mb-0.5">Success!</h2>
                <div className="w-4 h-4 mb-1">
                  <svg viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="32" fill="#10b981"/>
                    <path d="M20 32l8 8 16-16" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-[5px] text-gray-600 text-center mb-2">
                  This item has been saved to your storage.
                </p>
                <div className="flex flex-col gap-1 w-20">
                  <button 
                    ref={keepShoppingBtnRef}
                    className="w-full bg-[#f5f5f5] text-gray-600 text-[5px] font-semibold py-1 rounded border border-[#e0e0e0] hover:bg-[#eee]"
                  >
                    Keep shopping
                  </button>
                  <button className="w-full bg-[#2563eb] text-white text-[5px] font-semibold py-1 rounded hover:bg-[#1d4ed8]">
                    View storage
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Cursor */}
      <div 
        className={`absolute pointer-events-none z-[2000] transition-all duration-[800ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
          cursorVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ 
          left: cursorPos.x, 
          top: cursorPos.y,
          transform: "translate(-2px, -2px)"
        }}
      >
        <Image 
          src="https://miro.medium.com/v2/0*oa0XcvM99Y5clDsj.png"
          alt="Cursor"
          width={16}
          height={16}
          className="w-4 h-auto"
          unoptimized
        />
      </div>

    </div>
  );
}
