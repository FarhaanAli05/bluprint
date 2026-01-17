"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import UploadDropzone, { FileWithPreview } from "@/components/UploadDropzone";
import FilePreviewGrid from "@/components/FilePreviewGrid";
import Container from "@/components/Container";
import Card from "@/components/Card";
import Button, { buttonClasses } from "@/components/Button";
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

  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);

  return (
    <div className="flex min-h-screen flex-col bg-background text-slate-100">
      <SiteHeader />
      <main className="flex-1 py-12 lg:py-16">
        <Container>
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-200">
              Create a room
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              Start a new project
            </h1>
            <p className="mt-2 text-slate-300">
              Upload photos or video clips to begin your room blueprint.
            </p>
          </div>

          <div className="space-y-8">
            <Card className="p-6">
              <label
                htmlFor="room-type"
                className="block text-sm font-semibold text-white"
              >
                Room type
              </label>
              <p className="mt-1 text-sm text-slate-300">
                More room presets are coming soon.
              </p>
              <select
                id="room-type"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="mt-4 block w-full max-w-sm rounded-2xl border border-white/15 bg-slate-950/70 px-3 py-2.5 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 disabled:cursor-not-allowed disabled:opacity-50"
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
            </Card>

            <Card className="p-6">
              <UploadDropzone
                files={files}
                onFilesChange={handleFilesChange}
                error={error}
                onError={handleError}
              />
            </Card>

            {files.length > 0 && (
              <Card className="p-6">
                <FilePreviewGrid files={files} onRemove={handleRemove} />
              </Card>
            )}

            <Card className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-300">
                  {files.length} file{files.length !== 1 ? "s" : ""} selected
                  {files.length > 0 && (
                    <span className="ml-2 text-slate-400">
                      • {formatBytes(totalSize)} total
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/" className={buttonClasses("ghost", "sm")}>
                    Back to Home
                  </Link>
                  <Button
                    type="button"
                    onClick={handleCreateProject}
                    disabled={isCreating || files.length === 0}
                    size="sm"
                  >
                    {isCreating ? "Creating..." : "Create Project"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
