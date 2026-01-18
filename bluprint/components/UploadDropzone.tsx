"use client";

import { useRef, useState, useCallback } from "react";
import { formatBytes } from "@/lib/utils";
import Button from "@/components/Button";

const MAX_FILES = 20;
const MAX_TOTAL_SIZE = 200 * 1024 * 1024; // 200MB in bytes
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/mov"];

export interface FileWithPreview {
  file: File;
  preview?: string; // base64 for images
}

interface UploadDropzoneProps {
  files: FileWithPreview[];
  onFilesChange: (files: FileWithPreview[]) => void;
  error?: string;
  onError?: (error: string) => void;
}

export default function UploadDropzone({
  files,
  onFilesChange,
  error,
  onError,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type.toLowerCase());

    if (!isImage && !isVideo) {
      return `File "${file.name}" is not supported. Please upload images (jpg/png/webp) or videos (mp4/mov).`;
    }
    return null;
  };

  const processFiles = useCallback(
    async (newFiles: File[]) => {
      // Validate file count
      if (files.length + newFiles.length > MAX_FILES) {
        const errorMsg = `Maximum ${MAX_FILES} files allowed. You're trying to add ${newFiles.length} more files, but you already have ${files.length}.`;
        onError?.(errorMsg);
        return;
      }

      // Validate file types and sizes
      const validFiles: File[] = [];
      for (const file of newFiles) {
        const validationError = validateFile(file);
        if (validationError) {
          onError?.(validationError);
          continue;
        }
        validFiles.push(file);
      }

      // Calculate total size
      const currentTotalSize = files.reduce((sum, f) => sum + f.file.size, 0);
      const newTotalSize = validFiles.reduce((sum, f) => sum + f.size, 0);
      if (currentTotalSize + newTotalSize > MAX_TOTAL_SIZE) {
        onError?.(
          `Total file size exceeds ${formatBytes(MAX_TOTAL_SIZE)}. Current: ${formatBytes(currentTotalSize)}, trying to add: ${formatBytes(newTotalSize)}`
        );
        return;
      }

      // Generate previews for images
      const filesWithPreviews: FileWithPreview[] = await Promise.all(
        validFiles.map(async (file) => {
          if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return new Promise<FileWithPreview>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve({
                  file,
                  preview: reader.result as string,
                });
              };
              reader.readAsDataURL(file);
            });
          }
          return { file };
        })
      );

      onFilesChange([...files, ...filesWithPreviews]);
    },
    [files, onFilesChange, onError]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        await processFiles(droppedFiles);
      }
    },
    [processFiles]
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (selectedFiles.length > 0) {
        await processFiles(selectedFiles);
      }
      // Reset input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processFiles]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
          isDragging
            ? "border-blue-400 bg-blue-500/10 shadow-[0_0_40px_rgba(59,130,246,0.35)]"
            : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/quicktime,video/mov"
          onChange={handleFileInput}
          className="hidden"
        />
          <div className="space-y-4">
            <svg
              className="mx-auto h-12 w-12 text-slate-300"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div>
            <p className="text-lg font-semibold text-white">
              Drag and drop your files here
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Upload JPG, PNG, WebP, or MP4 files to start your room project.
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse
            </Button>
          </div>
          <p className="text-xs text-slate-400">
            Images: JPG, PNG, WebP • Videos: MP4, MOV • Max {MAX_FILES} files,{" "}
            {formatBytes(MAX_TOTAL_SIZE)} total
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-200/40 bg-amber-500/10 p-4">
          <p className="text-sm text-amber-100">{error}</p>
        </div>
      )}
    </div>
  );
}
