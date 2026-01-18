"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import Card from "@/components/Card";
import Button from "@/components/Button";
import PhotoUpload from "@/components/room-creator/PhotoUpload";
import ProcessingScreen from "@/components/room-creator/ProcessingScreen";
import { useProjectStore, projectStorage } from "@/lib/store";
import {
  analyzeRoomFromPhotos,
  convertToRoomConfig,
  convertToFurnitureItems,
  type AIRoomAnalysis,
} from "@/lib/aiAnalysis";
import { ArrowLeft, ArrowRight, Key, Sparkles, AlertCircle, Eye, EyeOff } from "lucide-react";

type Step = "upload" | "configure" | "processing" | "error";

export default function AIRoomGeneratorPage() {
  const router = useRouter();
  const { createProject, addFurniture } = useProjectStore();

  const [step, setStep] = useState<Step>("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [processingStep, setProcessingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
  }, []);

  const handleGenerate = async () => {
    if (files.length < 2) {
      setError("Please upload at least 2 photos of your room");
      return;
    }

    if (!apiKey.trim()) {
      setError("Please enter your Google AI API key");
      return;
    }

    setStep("processing");
    setProcessingStep(0);
    setError(null);

    try {
      // Step 1: Uploading images
      setProcessingStep(0);
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Step 2: AI analyzing room layout
      setProcessingStep(1);
      let analysis: AIRoomAnalysis;
      try {
        analysis = await analyzeRoomFromPhotos(files, apiKey.trim());
      } catch (err) {
        throw new Error(
          err instanceof Error
            ? err.message
            : "Failed to analyze room photos. Please check your API key and try again."
        );
      }

      // Step 3: Processing data
      setProcessingStep(2);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const roomConfig = convertToRoomConfig(analysis);
      const furnitureItems = convertToFurnitureItems(analysis);

      // Step 4: Generating 3D model
      setProcessingStep(3);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Create project
      const finalName = projectName.trim() || `AI Room ${Date.now()}`;
      const project = createProject({
        name: finalName,
        roomType: "bedroom",
        creationMethod: "upload",
        config: roomConfig,
      });

      // Add furniture items
      furnitureItems.forEach((item) => {
        addFurniture(item);
      });

      // Update project with furniture
      const updatedProject = {
        ...project,
        furniture: furnitureItems,
        status: "ready" as const,
      };

      // Save to storage
      projectStorage.save(updatedProject);

      // Navigate to editor
      router.push(`/editor/${project.id}`);
    } catch (err) {
      console.error("AI Generation Error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setStep("error");
    }
  };

  const handleRetry = () => {
    setStep("upload");
    setError(null);
    setProcessingStep(0);
  };

  if (step === "processing") {
    return <ProcessingScreen currentStep={processingStep} />;
  }

  if (step === "error") {
    return (
      <ProcessingScreen
        currentStep={processingStep}
        error={error || "An unexpected error occurred"}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col text-slate-100">
      <SiteHeader />
      <main className="flex-1 py-12 lg:py-16">
        <Container className="max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Link href="/dashboard" className="hover:text-white">
                Dashboard
              </Link>
              <span>/</span>
              <Link href="/create" className="hover:text-white">
                New Project
              </Link>
              <span>/</span>
              <span className="text-white">AI Room Generator</span>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-purple-300 ring-1 ring-white/10">
                <Sparkles className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-white">
                  AI Room Generator
                </h1>
                <p className="mt-1 text-slate-300">
                  Upload photos and let AI create a 3D model of your room
                </p>
              </div>
            </div>
          </div>

          {/* API Key Section */}
          <Card className="mb-6 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300">
                <Key className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">
                  Google AI API Key
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Required for Gemini 2.5 Pro room analysis. Your key is never stored and only used for this request.
                </p>
                <div className="mt-4 flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIza..."
                      className="w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 pr-12 text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showApiKey ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Get your API key from{" "}
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    aistudio.google.com/apikey
                  </a>
                </p>
              </div>
            </div>
          </Card>

          {/* Project Name */}
          <Card className="mb-6 p-6">
            <label className="block text-sm font-medium text-slate-300">
              Project Name (Optional)
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My AI-Generated Room"
              className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
            />
          </Card>

          {/* Photo Upload */}
          <PhotoUpload
            files={files}
            onFilesChange={handleFilesChange}
            onComplete={() => {}}
          />

          {/* Error Message */}
          {error && (
            <Card className="mt-6 border-red-500/30 bg-red-500/10 p-4">
              <div className="flex items-center gap-3 text-red-200">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            </Card>
          )}

          {/* Instructions */}
          <Card className="mt-6 p-6">
            <h3 className="text-lg font-semibold text-white">
              Tips for Best Results
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="mt-1 text-blue-400">•</span>
                Upload 2-5 photos from different angles of your room
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-blue-400">•</span>
                Include corner shots to help estimate room dimensions
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-blue-400">•</span>
                Ensure good lighting so furniture is clearly visible
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-blue-400">•</span>
                Capture all walls and major furniture pieces
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-blue-400">•</span>
                Standard furniture (beds, desks, doors) helps AI estimate scale
              </li>
            </ul>
          </Card>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <Link href="/create">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4" />
                Back to Methods
              </Button>
            </Link>

            <Button
              onClick={handleGenerate}
              disabled={files.length < 2 || !apiKey.trim()}
            >
              Generate 3D Model
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
