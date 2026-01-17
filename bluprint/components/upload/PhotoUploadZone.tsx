"use client";

// ============================================================
// Photo Upload Zone Component
// Drag-and-drop interface for room photo uploads
// ============================================================

import { useState, useCallback, useRef } from "react";
import { Upload, X, ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import type { UploadedImage } from "@/types/ai-room.types";

// ============================================================
// Constants
// ============================================================

const ACCEPTED_FORMATS = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_IMAGES = 2;
const MAX_IMAGES = 8;
const RECOMMENDED_IMAGES = "3-5";

// ============================================================
// Props Interface
// ============================================================

interface PhotoUploadZoneProps {
  onImagesChange: (images: UploadedImage[]) => void;
  images: UploadedImage[];
  disabled?: boolean;
}

// ============================================================
// Component
// ============================================================

export default function PhotoUploadZone({
  onImagesChange,
  images,
  disabled = false,
}: PhotoUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate unique ID for each image
  const generateId = () => `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  // Create preview URL for image
  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  // Validate a single file
  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FORMATS.includes(file.type) && !file.name.match(/\.heic$/i)) {
      return `${file.name}: Unsupported format. Use JPG, PNG, WebP, or HEIC.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File too large. Maximum size is 10MB.`;
    }
    return null;
  };

  // Process files and add to state
  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const fileArray = Array.from(files);
      
      // Check total count
      if (images.length + fileArray.length > MAX_IMAGES) {
        setError(`Maximum ${MAX_IMAGES} images allowed. You can upload ${MAX_IMAGES - images.length} more.`);
        return;
      }

      const validFiles: File[] = [];
      const errors: string[] = [];

      // Validate each file
      for (const file of fileArray) {
        const validationError = validateFile(file);
        if (validationError) {
          errors.push(validationError);
        } else {
          validFiles.push(file);
        }
      }

      if (errors.length > 0) {
        setError(errors[0]); // Show first error
      }

      // Create preview and add valid files
      const newImages: UploadedImage[] = await Promise.all(
        validFiles.map(async (file) => ({
          id: generateId(),
          file,
          preview: await createPreview(file),
          name: file.name,
          size: file.size,
        }))
      );

      onImagesChange([...images, ...newImages]);
    },
    [images, onImagesChange]
  );

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (!disabled && e.dataTransfer.files) {
        processFiles(e.dataTransfer.files);
      }
    },
    [disabled, processFiles]
  );

  // Handle file input change
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(e.target.files);
      }
    },
    [processFiles]
  );

  // Remove an image
  const removeImage = useCallback(
    (id: string) => {
      onImagesChange(images.filter((img) => img.id !== id));
      setError(null);
    },
    [images, onImagesChange]
  );

  // Open file dialog
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const hasEnoughImages = images.length >= MIN_IMAGES;
  const canAddMore = images.length < MAX_IMAGES;

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
        <div className="flex gap-3">
          <ImageIcon className="h-5 w-5 shrink-0 text-blue-400" />
          <div className="text-sm">
            <p className="font-medium text-blue-300">
              Upload {RECOMMENDED_IMAGES} photos from different angles for best results
            </p>
            <p className="mt-1 text-blue-300/70">
              Include corners, walls with windows, and areas with furniture visible.
              Min {MIN_IMAGES} photos, max {MAX_IMAGES}.
            </p>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={canAddMore && !disabled ? openFileDialog : undefined}
        className={`
          relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center
          rounded-xl border-2 border-dashed p-6 transition-all
          ${isDragging
            ? "border-blue-400 bg-blue-500/10"
            : "border-slate-600 hover:border-slate-500 hover:bg-slate-800/50"
          }
          ${disabled ? "cursor-not-allowed opacity-50" : ""}
          ${!canAddMore ? "cursor-not-allowed" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_FORMATS.join(",")}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || !canAddMore}
        />

        <Upload
          className={`h-12 w-12 ${isDragging ? "text-blue-400" : "text-slate-500"}`}
        />
        <p className="mt-4 text-lg font-medium text-slate-300">
          {isDragging ? "Drop images here" : "Drag & drop room photos"}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          or click to browse • JPG, PNG, WebP, HEIC • Max 10MB each
        </p>

        {!canAddMore && (
          <p className="mt-2 text-sm text-amber-400">
            Maximum {MAX_IMAGES} images reached
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Image Count Status */}
      {images.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            {hasEnoughImages ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400">
                  {images.length} photos uploaded
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-amber-400" />
                <span className="text-amber-400">
                  {images.length}/{MIN_IMAGES} minimum photos
                </span>
              </>
            )}
          </div>
          <span className="text-xs text-slate-500">
            {MAX_IMAGES - images.length} more allowed
          </span>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-slate-700 bg-slate-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.preview}
                alt={image.name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              
              {/* Overlay with info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              
              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(image.id);
                }}
                disabled={disabled}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-red-500 group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>

              {/* File info */}
              <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="truncate text-xs text-white">{image.name}</p>
                <p className="text-xs text-slate-300">{formatSize(image.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
