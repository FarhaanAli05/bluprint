"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import Card from "@/components/Card";
import Button, { buttonClasses } from "@/components/Button";
import MethodSelector from "@/components/room-creator/MethodSelector";
import ManualCreator from "@/components/room-creator/ManualCreator";
import PhotoUpload from "@/components/room-creator/PhotoUpload";
import { useProjectStore, projectStorage } from "@/lib/store";
import type { CreationMethod, Project, RoomConfig } from "@/types/room.types";
import { ArrowLeft, ArrowRight } from "lucide-react";

type Step = "method" | "configure" | "confirm";

const ROOM_TYPES: { value: Project["roomType"]; label: string; enabled: boolean }[] = [
  { value: "bedroom", label: "Bedroom", enabled: true },
  { value: "living-room", label: "Living Room", enabled: true },
  { value: "office", label: "Office", enabled: true },
  { value: "kitchen", label: "Kitchen", enabled: false },
  { value: "bathroom", label: "Bathroom", enabled: false },
];

export default function CreateProjectPage() {
  const router = useRouter();
  const { createProject } = useProjectStore();
  
  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<CreationMethod | null>(null);
  const [projectName, setProjectName] = useState("");
  const [roomType, setRoomType] = useState<Project["roomType"]>("bedroom");
  const [roomConfig, setRoomConfig] = useState<Partial<RoomConfig>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMethodSelect = (selectedMethod: CreationMethod) => {
    setMethod(selectedMethod);
    setStep("configure");
  };

  const handleBack = () => {
    if (step === "configure") {
      setStep("method");
      setMethod(null);
    } else if (step === "confirm") {
      setStep("configure");
    }
  };

  const handleConfigComplete = (config: Partial<RoomConfig>) => {
    setRoomConfig(config);
    setStep("confirm");
  };

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  const handleCreate = async () => {
    if (!method) {
      return;
    }
    
    // Use default name if not provided
    const finalName = projectName.trim() || `Room ${Date.now()}`;

    setIsCreating(true);
    setError(null);

    try {
      // Create the project with default config if not set
      const finalConfig = roomConfig.dimensions ? roomConfig : {
        dimensions: { length: 12, width: 10, height: 9, unit: "feet" as const },
        shape: "rectangular" as const,
        materials: {
          wallColor: "#e8e4df",
          floorColor: "#8b7355",
          ceilingColor: "#ffffff",
          floorTexture: "wood" as const,
        },
        windows: [],
        doors: [],
      };

      const project = createProject({
        name: finalName,
        roomType,
        creationMethod: method,
        config: finalConfig,
      });

      // Save to storage
      projectStorage.save(project);

      // Navigate to editor
      router.push(`/editor/${project.id}`);
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Failed to create project. Please try again.");
      setIsCreating(false);
    }
  };

  const canProceed = () => {
    if (step === "configure") {
      if (method === "manual") {
        // Always allow proceeding for manual - we have default dimensions
        return true;
      } else {
        return files.length > 0;
      }
    }
    if (step === "confirm") {
      // Always allow - we use a default name if not provided
      return true;
    }
    return true;
  };

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
              <span className="text-white">New Project</span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-white">
              Create a new room
            </h1>
            <p className="mt-2 text-slate-300">
              {step === "method" && "Choose how you want to start your project"}
              {step === "configure" && method === "manual" && "Enter your room dimensions and details"}
              {step === "configure" && method === "upload" && "Upload photos or videos of your room"}
              {step === "confirm" && "Review and confirm your project details"}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="mb-8 flex items-center gap-2">
            {["method", "configure", "confirm"].map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    step === s
                      ? "bg-blue-500 text-white"
                      : ["method", "configure", "confirm"].indexOf(step) > i
                      ? "bg-blue-500/20 text-blue-200"
                      : "bg-white/5 text-slate-400"
                  }`}
                >
                  {i + 1}
                </div>
                {i < 2 && (
                  <div
                    className={`mx-2 h-0.5 w-12 sm:w-20 ${
                      ["method", "configure", "confirm"].indexOf(step) > i
                        ? "bg-blue-500/50"
                        : "bg-white/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          {step === "method" && (
            <MethodSelector onSelect={handleMethodSelect} />
          )}

          {step === "configure" && method === "manual" && (
            <ManualCreator
              initialConfig={roomConfig}
              onConfigChange={setRoomConfig}
              onComplete={handleConfigComplete}
            />
          )}

          {step === "configure" && method === "upload" && (
            <PhotoUpload
              files={files}
              onFilesChange={handleFilesChange}
              onComplete={() => setStep("confirm")}
            />
          )}

          {step === "confirm" && (
            <Card className="p-8">
              <h2 className="text-xl font-semibold text-white">
                Project Details
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Give your project a name and select the room type
              </p>

              <div className="mt-6 space-y-6">
                <div>
                  <label
                    htmlFor="project-name"
                    className="block text-sm font-medium text-slate-200"
                  >
                    Project Name
                  </label>
                  <input
                    type="text"
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="My Bedroom Design"
                    className="mt-2 block w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                  />
                </div>

                <div>
                  <label
                    htmlFor="room-type"
                    className="block text-sm font-medium text-slate-200"
                  >
                    Room Type
                  </label>
                  <select
                    id="room-type"
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value as Project["roomType"])}
                    className="mt-2 block w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                  >
                    {ROOM_TYPES.map((type) => (
                      <option
                        key={type.value}
                        value={type.value}
                        disabled={!type.enabled}
                      >
                        {type.label}
                        {!type.enabled ? " (Coming soon)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Summary */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <h3 className="text-sm font-semibold text-slate-200">
                    Summary
                  </h3>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-slate-400">Creation method</dt>
                      <dd className="text-white capitalize">{method}</dd>
                    </div>
                    {roomConfig.dimensions && (
                      <div className="flex justify-between">
                        <dt className="text-slate-400">Dimensions</dt>
                        <dd className="text-white">
                          {roomConfig.dimensions.length} ×{" "}
                          {roomConfig.dimensions.width} ×{" "}
                          {roomConfig.dimensions.height}{" "}
                          {roomConfig.dimensions.unit}
                        </dd>
                      </div>
                    )}
                    {files.length > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-slate-400">Files uploaded</dt>
                        <dd className="text-white">{files.length}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
                    {error}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === "method"}
              className={step === "method" ? "invisible" : ""}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {step === "confirm" ? (
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Project"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : step === "configure" ? (
              <Button onClick={() => setStep("confirm")} disabled={!canProceed()}>
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
