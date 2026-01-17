"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UploadDropzone, { FileWithPreview } from "@/components/UploadDropzone";
import FilePreviewGrid from "@/components/FilePreviewGrid";
import { projectStorage, formatBytes } from "@/lib/utils";

const ROOM_TYPES = [
  { value: "bedroom", label: "Bedroom", enabled: true },
  { value: "kitchen", label: "Kitchen", enabled: false, comingSoon: true },
  { value: "living-room", label: "Living Room", enabled: false, comingSoon: true },
];

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [roomType, setRoomType] = useState("bedroom");
  const [error, setError] = useState<string | undefined>();
  const [isCreating, setIsCreating] = useState(false);

  const handleFilesChange = useCallback((newFiles: FileWithPreview[]) => {
    setFiles(newFiles);
    setError(undefined);
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  const handleRemove = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setError(undefined);
  }, []);

  const handleCreateProject = useCallback(async () => {
    if (files.length === 0) {
      setError("Please upload at least one file");
      return;
    }

    setIsCreating(true);
    setError(undefined);

    try {
      // Generate project ID
      const projectId = `project_${Date.now()}`;

      // Prepare project data
      const project = {
        id: projectId,
        roomType,
        files: files.map((item) => ({
          name: item.file.name,
          type: item.file.type,
          size: item.file.size,
          preview: item.preview,
        })),
        createdAt: Date.now(),
      };

      // Save to localStorage
      projectStorage.save(project);

      // Navigate to project page
      router.push(`/projects/${projectId}`);
    } catch (err) {
      setError("Failed to create project. Please try again.");
      setIsCreating(false);
    }
  }, [files, roomType, router]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Create a Room Project</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Upload photos or videos of your room to get started
          </p>
        </div>

        <div className="space-y-8">
          {/* Room Type Selector */}
          <div>
            <label
              htmlFor="room-type"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Room Type
            </label>
            <select
              id="room-type"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="block w-full max-w-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black px-3 py-2 text-sm text-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {ROOM_TYPES.map((type) => (
                <option
                  key={type.value}
                  value={type.value}
                  disabled={!type.enabled}
                >
                  {type.label}
                  {type.comingSoon ? " (Coming soon)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Upload Dropzone */}
          <UploadDropzone
            files={files}
            onFilesChange={handleFilesChange}
            error={error}
            onError={handleError}
          />

          {/* File Preview Grid */}
          {files.length > 0 && (
            <FilePreviewGrid files={files} onRemove={handleRemove} />
          )}

          {/* Create Project Button */}
          {files.length > 0 && (
            <div className="flex items-center gap-4 pt-4">
              <button
                type="button"
                onClick={handleCreateProject}
                disabled={isCreating || files.length === 0}
                className="rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background hover:bg-foreground/90 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreating ? "Creating..." : "Create Project"}
              </button>
              <Link
                href="/"
                className="rounded-md border border-zinc-300 dark:border-zinc-700 px-6 py-3 text-sm font-semibold text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                Cancel
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
