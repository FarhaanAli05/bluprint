"use client";

// ============================================================
// Processing Screen Component
// Shows progress steps during room analysis
// ============================================================

import { CheckCircle2, Loader2, Circle, AlertCircle, Camera, Cpu, Box, Sparkles, type LucideIcon } from "lucide-react";
import type { ProcessingStep } from "@/types/ai-room.types";

// ============================================================
// Types
// ============================================================

interface ProcessingScreenProps {
  currentStep: ProcessingStep;
  error?: string | null;
  onRetry?: () => void;
  onCancel?: () => void;
}

interface StepInfo {
  id: ProcessingStep;
  label: string;
  description: string;
  icon: LucideIcon;
}

// ============================================================
// Step Configuration
// ============================================================

const STEPS: StepInfo[] = [
  {
    id: "uploading",
    label: "Uploading Images",
    description: "Preparing your photos for analysis",
    icon: Camera,
  },
  {
    id: "analyzing",
    label: "Analyzing Room Layout",
    description: "AI is detecting walls, dimensions, and structure",
    icon: Cpu,
  },
  {
    id: "detecting-furniture",
    label: "Detecting Furniture",
    description: "Identifying furniture pieces and their positions",
    icon: Box,
  },
  {
    id: "generating-model",
    label: "Generating 3D Model",
    description: "Building your interactive room visualization",
    icon: Sparkles,
  },
];

// ============================================================
// Helper Functions
// ============================================================

function getStepIndex(step: ProcessingStep): number {
  const index = STEPS.findIndex((s) => s.id === step);
  return index >= 0 ? index : -1;
}

function getStepStatus(
  stepId: ProcessingStep,
  currentStep: ProcessingStep
): "completed" | "active" | "pending" | "error" {
  if (currentStep === "error") {
    // All steps up to current should show completed, current shows error
    const errorIndex = getStepIndex(stepId);
    const currentIndex = STEPS.findIndex((s) => s.id === stepId);
    if (errorIndex < currentIndex) return "completed";
    return "error";
  }

  if (currentStep === "complete") return "completed";

  const currentIndex = getStepIndex(currentStep);
  const stepIndex = getStepIndex(stepId);

  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "active";
  return "pending";
}

// ============================================================
// Component
// ============================================================

export default function ProcessingScreen({
  currentStep,
  error,
  onRetry,
  onCancel,
}: ProcessingScreenProps) {
  const isError = currentStep === "error" || !!error;
  const isComplete = currentStep === "complete";

  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        {isError ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Analysis Failed</h2>
            <p className="mt-2 max-w-md text-slate-400">
              {error || "We couldn't analyze your photos. Please try again."}
            </p>
          </>
        ) : isComplete ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Analysis Complete!</h2>
            <p className="mt-2 text-slate-400">
              Your 3D room model is ready to explore
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white">
              Analyzing Your Room
            </h2>
            <p className="mt-2 text-slate-400">
              This typically takes 10-20 seconds
            </p>
          </>
        )}
      </div>

      {/* Progress Steps */}
      <div className="w-full max-w-md space-y-4">
        {STEPS.map((step, index) => {
          const status = isError && index === STEPS.length - 1
            ? "error"
            : getStepStatus(step.id, currentStep);
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`
                flex items-center gap-4 rounded-lg border p-4 transition-all
                ${status === "active"
                  ? "border-blue-500/50 bg-blue-500/10"
                  : status === "completed"
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : status === "error"
                  ? "border-red-500/50 bg-red-500/10"
                  : "border-slate-700/50 bg-slate-800/30"
                }
              `}
            >
              {/* Status Icon */}
              <div
                className={`
                  flex h-10 w-10 shrink-0 items-center justify-center rounded-full
                  ${status === "active"
                    ? "bg-blue-500/20"
                    : status === "completed"
                    ? "bg-emerald-500/20"
                    : status === "error"
                    ? "bg-red-500/20"
                    : "bg-slate-700/50"
                  }
                `}
              >
                {status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : status === "active" ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                ) : status === "error" ? (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-500" />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Icon
                    className={`h-4 w-4 ${
                      status === "active"
                        ? "text-blue-400"
                        : status === "completed"
                        ? "text-emerald-400"
                        : status === "error"
                        ? "text-red-400"
                        : "text-slate-500"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      status === "active"
                        ? "text-blue-300"
                        : status === "completed"
                        ? "text-emerald-300"
                        : status === "error"
                        ? "text-red-300"
                        : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                <p
                  className={`mt-1 text-sm ${
                    status === "pending" ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      {(isError || onCancel) && (
        <div className="mt-8 flex gap-4">
          {onCancel && !isComplete && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-600 px-6 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800"
            >
              Cancel
            </button>
          )}
          {isError && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              Try Again
            </button>
          )}
        </div>
      )}

      {/* Tips */}
      {isError && (
        <div className="mt-8 max-w-md rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          <p className="font-medium text-amber-300">Tips for better results:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-amber-300/80">
            <li>Upload clearer, well-lit photos</li>
            <li>Take photos from different angles</li>
            <li>Include at least 2-3 walls in your photos</li>
            <li>Make sure furniture is visible</li>
          </ul>
        </div>
      )}
    </div>
  );
}
