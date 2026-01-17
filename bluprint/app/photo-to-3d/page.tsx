"use client";

// ============================================================
// Photo to 3D Page
// Complete flow for uploading photos and generating 3D room
// ============================================================

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Settings2, RotateCcw, Grid3X3, Download, Save, Eye, EyeOff } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import Container from "@/components/Container";
import { buttonClasses } from "@/components/Button";
import PhotoUploadZone from "@/components/upload/PhotoUploadZone";
import ProcessingScreen from "@/components/upload/ProcessingScreen";
import DynamicRoomViewer from "@/components/viewer/DynamicRoomViewer";
import RefinementPanel from "@/components/refinement/RefinementPanel";
import type {
  UploadedImage,
  ProcessingStep,
  AIRoomData,
} from "@/types/ai-room.types";
import { analyzeRoomPhotos, generateMockRoomData } from "@/services/aiAnalysis";

// ============================================================
// Types
// ============================================================

type PageStep = "upload" | "processing" | "viewer";

// ============================================================
// Component
// ============================================================

export default function PhotoTo3DPage() {
  // State
  const [pageStep, setPageStep] = useState<PageStep>("upload");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>("idle");
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<AIRoomData | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [useMockData, setUseMockData] = useState(false);

  // Viewer controls
  const [autoRotate, setAutoRotate] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [showRefinement, setShowRefinement] = useState(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("anthropic_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Save API key to localStorage
  const saveApiKey = (key: string) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem("anthropic_api_key", key);
    }
  };

  // Handle image changes
  const handleImagesChange = useCallback((newImages: UploadedImage[]) => {
    setImages(newImages);
  }, []);

  // Process images with AI
  const processImages = async () => {
    if (images.length < 2 && !useMockData) {
      setProcessingError("Please upload at least 2 photos");
      return;
    }

    setPageStep("processing");
    setProcessingError(null);

    try {
      // Step 1: Uploading
      setProcessingStep("uploading");
      await new Promise((r) => setTimeout(r, 800));

      // Step 2: Analyzing
      setProcessingStep("analyzing");

      let result: AIRoomData;

      if (useMockData) {
        // Use mock data for testing
        await new Promise((r) => setTimeout(r, 1500));
        result = generateMockRoomData();
      } else {
        // Call AI API
        const files = images.map((img) => img.file);
        const response = await analyzeRoomPhotos(files, apiKey);

        if (!response.success || !response.data) {
          throw new Error(response.error || "Analysis failed");
        }

        result = response.data;
      }

      // Step 3: Detecting furniture (simulated delay for UX)
      setProcessingStep("detecting-furniture");
      await new Promise((r) => setTimeout(r, 600));

      // Step 4: Generating model
      setProcessingStep("generating-model");
      await new Promise((r) => setTimeout(r, 500));

      // Complete
      setProcessingStep("complete");
      setRoomData(result);

      // Brief delay before showing viewer
      await new Promise((r) => setTimeout(r, 500));
      setPageStep("viewer");

    } catch (error) {
      console.error("Processing error:", error);
      setProcessingStep("error");
      setProcessingError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  // Retry processing
  const handleRetry = () => {
    setProcessingStep("idle");
    setProcessingError(null);
    setPageStep("upload");
  };

  // Cancel processing
  const handleCancel = () => {
    setProcessingStep("idle");
    setProcessingError(null);
    setPageStep("upload");
  };

  // Start over
  const handleStartOver = () => {
    setImages([]);
    setRoomData(null);
    setProcessingStep("idle");
    setProcessingError(null);
    setPageStep("upload");
  };

  // Handle room data changes from refinement panel
  const handleRoomDataChange = (newData: AIRoomData) => {
    setRoomData(newData);
  };

  // Render based on current step
  const renderContent = () => {
    switch (pageStep) {
      case "upload":
        return (
          <Container className="py-8 lg:py-12">
            <div className="mx-auto max-w-3xl">
              {/* Header */}
              <div className="mb-8">
                <Link
                  href="/dashboard"
                  className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-white">
                  Create 3D Model from Photos
                </h1>
                <p className="mt-2 text-slate-400">
                  Upload photos of your room and our AI will generate an
                  interactive 3D model
                </p>
              </div>

              {/* API Key Section */}
              <div className="mb-6 rounded-lg border border-slate-700 bg-slate-900/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">API Configuration</h3>
                    <p className="text-sm text-slate-400">
                      {apiKey
                        ? "API key configured ✓"
                        : "Enter your Anthropic API key to enable AI analysis"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    {showApiKeyInput ? "Hide" : apiKey ? "Change" : "Add Key"}
                  </button>
                </div>

                {showApiKeyInput && (
                  <div className="mt-4 space-y-3">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => saveApiKey(e.target.value)}
                      placeholder="sk-ant-..."
                      className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                    <p className="text-xs text-slate-500">
                      Your key is stored locally and never sent to our servers.
                      Get one at{" "}
                      <a
                        href="https://console.anthropic.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        console.anthropic.com
                      </a>
                    </p>
                  </div>
                )}

                {/* Demo mode toggle */}
                <div className="mt-4 flex items-center gap-3 border-t border-slate-700 pt-4">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={useMockData}
                      onChange={(e) => setUseMockData(e.target.checked)}
                      className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="text-sm text-slate-300">
                      Demo Mode (use sample data, no API needed)
                    </span>
                  </label>
                </div>
              </div>

              {/* Photo Upload */}
              <PhotoUploadZone
                images={images}
                onImagesChange={handleImagesChange}
              />

              {/* Generate Button */}
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={processImages}
                  disabled={images.length < 2 && !useMockData}
                  className={`${buttonClasses("primary", "lg")} min-w-[200px] ${
                    images.length < 2 && !useMockData
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                >
                  Generate 3D Model
                </button>
              </div>

              {/* Requirements reminder */}
              {images.length < 2 && !useMockData && (
                <p className="mt-4 text-center text-sm text-slate-500">
                  Upload at least 2 photos to continue, or enable Demo Mode
                </p>
              )}
            </div>
          </Container>
        );

      case "processing":
        return (
          <ProcessingScreen
            currentStep={processingStep}
            error={processingError}
            onRetry={handleRetry}
            onCancel={handleCancel}
          />
        );

      case "viewer":
        if (!roomData) return null;

        return (
          <div className="flex h-[calc(100vh-64px)] flex-col lg:flex-row">
            {/* 3D Viewer */}
            <div className="relative flex-1">
              <DynamicRoomViewer
                roomData={roomData}
                autoRotate={autoRotate}
                showGrid={showGrid}
              />

              {/* Viewer Controls Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                {/* Left controls */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleStartOver}
                    className="flex items-center gap-2 rounded-lg bg-slate-900/80 px-4 py-2 text-sm text-white backdrop-blur hover:bg-slate-800"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    New Room
                  </button>
                </div>

                {/* Center controls */}
                <div className="flex gap-2 rounded-lg bg-slate-900/80 p-1 backdrop-blur">
                  <button
                    type="button"
                    onClick={() => setAutoRotate(!autoRotate)}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                      autoRotate
                        ? "bg-blue-500 text-white"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                    title="Toggle auto-rotation"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span className="hidden sm:inline">Auto-Rotate</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowGrid(!showGrid)}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                      showGrid
                        ? "bg-blue-500 text-white"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                    title="Toggle grid"
                  >
                    <Grid3X3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Grid</span>
                  </button>
                </div>

                {/* Right controls */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRefinement(!showRefinement)}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm backdrop-blur transition-colors ${
                      showRefinement
                        ? "bg-blue-500 text-white"
                        : "bg-slate-900/80 text-white hover:bg-slate-800"
                    }`}
                  >
                    <Settings2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Refine</span>
                  </button>
                </div>
              </div>

              {/* Control hints */}
              <div className="absolute left-4 top-4 rounded-lg bg-slate-900/80 px-3 py-2 text-xs text-slate-400 backdrop-blur">
                <p>Drag to rotate • Scroll to zoom • Right-drag to pan</p>
              </div>

              {/* Room info */}
              <div className="absolute right-4 top-4 rounded-lg bg-slate-900/80 px-4 py-3 text-sm backdrop-blur">
                <p className="font-medium text-white">Room Dimensions</p>
                <p className="text-slate-400">
                  {roomData.room.dimensions.length} × {roomData.room.dimensions.width} ×{" "}
                  {roomData.room.dimensions.height} ft
                </p>
                <p className="mt-1 text-slate-400">
                  {roomData.furniture.length} furniture items
                </p>
              </div>
            </div>

            {/* Refinement Panel */}
            {showRefinement && (
              <aside className="w-full border-l border-slate-700 bg-slate-900 lg:w-80">
                <RefinementPanel
                  roomData={roomData}
                  onRoomDataChange={handleRoomDataChange}
                  onClose={() => setShowRefinement(false)}
                />
              </aside>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <SiteHeader />
      <main className="flex-1">{renderContent()}</main>
    </div>
  );
}
