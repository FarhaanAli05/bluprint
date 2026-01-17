"use client";

import { useEffect, useState } from "react";
import { Loader2, Check, Camera, Brain, Boxes, Sparkles } from "lucide-react";

interface ProcessingScreenProps {
  currentStep: number;
  error?: string | null;
}

const STEPS = [
  {
    label: "Uploading images",
    description: "Preparing your photos for analysis",
    icon: Camera,
  },
  {
    label: "AI analyzing room layout",
    description: "Detecting walls, floor, and room dimensions",
    icon: Brain,
  },
  {
    label: "Detecting furniture & objects",
    description: "Identifying furniture positions and sizes",
    icon: Boxes,
  },
  {
    label: "Generating 3D model",
    description: "Building your interactive room model",
    icon: Sparkles,
  },
];

export default function ProcessingScreen({ currentStep, error }: ProcessingScreenProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-red-500/30 rounded-3xl p-8 md:p-12 max-w-lg w-full shadow-2xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-red-500/30">
              <svg
                className="w-10 h-10 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white">Analysis Failed</h2>
            <p className="text-red-300 mb-6 text-sm">{error}</p>
            <div className="bg-slate-800/50 rounded-xl p-4 text-left">
              <p className="text-sm font-semibold text-slate-300 mb-3">Tips for better results:</p>
              <ul className="text-sm text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  Use well-lit, clear photos
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  Capture different angles of the room
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  Include at least 2-3 walls in your photos
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  Make sure furniture is clearly visible
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 max-w-lg w-full shadow-2xl">
        {/* Animated Logo */}
        <div className="text-center mb-10">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-white">
          Creating Your 3D Room
        </h2>
        <p className="text-slate-400 text-center mb-10">
          Please wait while we analyze your photos{dots}
        </p>

        {/* Progress Steps */}
        <div className="space-y-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;

            return (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                  isCurrent
                    ? "bg-blue-500/20 border border-blue-500/30"
                    : isComplete
                    ? "bg-green-500/10 border border-green-500/20"
                    : "bg-slate-800/30 border border-transparent"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                    isComplete
                      ? "bg-green-500 text-white"
                      : isCurrent
                      ? "bg-blue-500 text-white animate-pulse"
                      : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {isComplete ? (
                    <Check className="w-6 h-6" />
                  ) : isCurrent ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-semibold transition-colors ${
                      isPending ? "text-slate-500" : "text-white"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p
                    className={`text-sm transition-colors ${
                      isPending ? "text-slate-600" : "text-slate-400"
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-out"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          <p className="text-center text-sm text-slate-500 mt-3">
            This usually takes 10-20 seconds
          </p>
        </div>
      </div>
    </div>
  );
}
