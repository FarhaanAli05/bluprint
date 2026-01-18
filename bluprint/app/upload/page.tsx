"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, FileText } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import GlassButton from "@/components/shared/GlassButton";
import DropZone from "@/components/upload/DropZone";
import PhotoPreviewGrid from "@/components/upload/PhotoPreviewGrid";
import LoadingScreen from "@/components/loading/LoadingScreen";
import MouseSpotlight from "@/components/landing/MouseSpotlight";

interface PhotoFile {
  file: File;
  preview: string;
  id: string;
}

const MAX_PHOTOS = 5;
const MIN_PHOTOS = 2;
const BLUEPRINTS_STORAGE_KEY = "bluprint_projects";

// Helper function to create URL-friendly slug
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 50);
}

interface Blueprint {
  id: string;
  name: string;
  slug: string;
  description?: string;
  photoCount: number;
  createdAt: number;
  thumbnail?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [showLoading, setShowLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    };
  }, [photos]);

  const handleFilesSelected = useCallback((files: File[]) => {
    const newPhotos: PhotoFile[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));

    setPhotos((prev) => {
      const combined = [...prev, ...newPhotos];
      if (combined.length > MAX_PHOTOS) {
        combined.slice(MAX_PHOTOS).forEach((p) => URL.revokeObjectURL(p.preview));
        return combined.slice(0, MAX_PHOTOS);
      }
      return combined;
    });
  }, []);

  const handleRemovePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) {
        URL.revokeObjectURL(photo.preview);
      }
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const handleCreateBluprint = useCallback(() => {
    if (photos.length >= MIN_PHOTOS && projectName.trim()) {
      // Save blueprint to localStorage
      const slug = createSlug(projectName);
      const newBlueprint: Blueprint = {
        id: `bp-${Date.now()}`,
        name: projectName.trim(),
        slug: slug || "my-room",
        description: projectDescription.trim() || undefined,
        photoCount: photos.length,
        createdAt: Date.now(),
        thumbnail: photos[0]?.preview, // Use first photo as thumbnail
      };

      // Get existing blueprints
      const stored = localStorage.getItem(BLUEPRINTS_STORAGE_KEY);
      const existing: Blueprint[] = stored ? JSON.parse(stored) : [];

      // Ensure unique slug
      let uniqueSlug = slug || "my-room";
      let counter = 2;
      while (existing.some(bp => bp.slug === uniqueSlug)) {
        uniqueSlug = `${slug || "my-room"}-${counter}`;
        counter++;
      }
      newBlueprint.slug = uniqueSlug;

      // Add new blueprint at the beginning
      const updated = [newBlueprint, ...existing];
      localStorage.setItem(BLUEPRINTS_STORAGE_KEY, JSON.stringify(updated));

      setShowLoading(true);
    }
  }, [photos, projectName, projectDescription]);

  const canCreate = photos.length >= MIN_PHOTOS && projectName.trim().length > 0;
  const [savedSlug, setSavedSlug] = useState<string>("");

  // Update handleCreateBluprint to save the unique slug
  useEffect(() => {
    if (showLoading && savedSlug) {
      // Will trigger redirect after loading screen
    }
  }, [showLoading, savedSlug]);

  if (showLoading) {
    // Get the actual saved slug from localStorage to ensure we navigate to the right place
    const stored = localStorage.getItem(BLUEPRINTS_STORAGE_KEY);
    const existing: Blueprint[] = stored ? JSON.parse(stored) : [];
    const latestProject = existing[0]; // We just added it at the beginning
    const finalSlug = latestProject?.slug || createSlug(projectName) || "my-room";
    return <LoadingScreen onComplete={() => router.push(`/projects/${finalSlug}`)} />;
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-br from-[#0A1128] via-[#1E0A28] to-[#0A1128]">
      {/* Mouse spotlight effect */}
      {mounted && <MouseSpotlight />}

      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Content container */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 lg:px-12">
          <Link href="/">
            <GlassButton variant="icon" className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back</span>
            </GlassButton>
          </Link>
        </header>

        {/* Main content - non-scrollable */}
        <main className="flex flex-1 flex-col items-center justify-center px-6 pb-6">
          {/* Title section */}
          <div
            className={`mb-6 text-center transition-all duration-700 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Upload Your{" "}
              <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
                Space
              </span>
            </h1>
            <p className="text-base text-white/60 lg:text-lg">
              Name your project and upload {MIN_PHOTOS}-{MAX_PHOTOS} photos
            </p>
          </div>

          {/* Split container */}
          <GlassCard
            className={`w-full max-w-5xl transition-all duration-700 delay-100 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <div className="flex flex-col lg:flex-row min-h-[400px]">
              {/* Left side - Project details */}
              <div className="flex-1 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-white/10">
                <div className="h-full flex flex-col">
                  {/* Project Name */}
                  <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                      <Pencil className="w-4 h-4" />
                      Project Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g., My Bedroom, Living Room..."
                      className="
                        w-full px-4 py-3
                        bg-white/5 border border-white/20
                        rounded-xl
                        text-white placeholder-white/40
                        focus:outline-none focus:border-[#667eea] focus:bg-white/10
                        transition-all duration-200
                      "
                      maxLength={50}
                    />
                    {projectName && (
                      <p className="mt-2 text-xs text-white/40">
                        URL: /projects/{createSlug(projectName) || "my-room"}
                      </p>
                    )}
                  </div>

                  {/* Project Description */}
                  <div className="flex-1 flex flex-col">
                    <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                      <FileText className="w-4 h-4" />
                      Description <span className="text-white/40">(optional)</span>
                    </label>
                    <textarea
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="Describe your room, style preferences, or any specific details..."
                      className="
                        flex-1 w-full px-4 py-3
                        bg-white/5 border border-white/20
                        rounded-xl
                        text-white placeholder-white/40
                        focus:outline-none focus:border-[#667eea] focus:bg-white/10
                        transition-all duration-200
                        resize-none
                        min-h-[120px]
                      "
                      maxLength={500}
                    />
                    <p className="mt-2 text-xs text-white/40 text-right">
                      {projectDescription.length}/500
                    </p>
                  </div>
                </div>
              </div>

              {/* Right side - Photo upload */}
              <div className="flex-1 p-6 lg:p-8">
                <div className="h-full flex flex-col">
                  <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-3">
                    Room Photos <span className="text-red-400">*</span>
                    <span className="text-white/40 font-normal">
                      ({photos.length}/{MAX_PHOTOS})
                    </span>
                  </label>
                  
                  <div className="flex-1">
                    {photos.length === 0 ? (
                      <DropZone 
                        onFilesSelected={handleFilesSelected} 
                        maxFiles={MAX_PHOTOS}
                        compact
                      />
                    ) : (
                      <PhotoPreviewGrid
                        photos={photos}
                        onRemove={handleRemovePhoto}
                        onAddMore={handleFilesSelected}
                        maxPhotos={MAX_PHOTOS}
                        compact
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Action section */}
          <div
            className={`mt-6 flex flex-col items-center gap-3 transition-all duration-700 delay-200 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            {/* Requirements indicator */}
            <div className="flex items-center gap-4 text-sm">
              <span className={`flex items-center gap-1.5 ${projectName.trim() ? "text-green-400" : "text-white/50"}`}>
                <span className={`w-2 h-2 rounded-full ${projectName.trim() ? "bg-green-400" : "bg-white/30"}`} />
                Name added
              </span>
              <span className={`flex items-center gap-1.5 ${photos.length >= MIN_PHOTOS ? "text-green-400" : "text-white/50"}`}>
                <span className={`w-2 h-2 rounded-full ${photos.length >= MIN_PHOTOS ? "bg-green-400" : "bg-white/30"}`} />
                {photos.length >= MIN_PHOTOS ? `${photos.length} photos` : `Need ${MIN_PHOTOS}+ photos`}
              </span>
            </div>

            {/* Create button */}
            <GlassButton
              variant="primary"
              onClick={handleCreateBluprint}
              disabled={!canCreate}
              className="min-w-[200px]"
            >
              Create Bluprint
            </GlassButton>
          </div>
        </main>
      </div>
    </div>
  );
}
