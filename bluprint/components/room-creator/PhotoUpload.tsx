"use client";

import { useState, useCallback, useRef } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { Upload, X, Image as ImageIcon, Video, AlertCircle } from "lucide-react";

interface PhotoUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onComplete: () => void;
}

const MAX_FILES = 20;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/mov"];

export default function PhotoUpload({ files, onFilesChange, onComplete }: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Map<string, string>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `"${file.name}" exceeds 5MB limit`;
    }
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type.toLowerCase());
    if (!isImage && !isVideo) {
      return `"${file.name}" is not a supported format`;
    }
    return null;
  };

  const generatePreview = async (file: File): Promise<string | null> => {
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    }
    return null;
  };

  const processFiles = useCallback(
    async (newFiles: File[]) => {
      setError(null);

      // Check total count
      if (files.length + newFiles.length > MAX_FILES) {
        setError(`Maximum ${MAX_FILES} files allowed`);
        return;
      }

      // Validate and process files
      const validFiles: File[] = [];
      for (const file of newFiles) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          continue;
        }
        // Check for duplicates
        const isDuplicate = files.some(
          (f) => f.name === file.name && f.size === file.size
        );
        if (!isDuplicate) {
          validFiles.push(file);
        }
      }

      // Generate previews
      const newPreviews = new Map(previews);
      for (const file of validFiles) {
        const preview = await generatePreview(file);
        if (preview) {
          newPreviews.set(file.name + file.size, preview);
        }
      }
      setPreviews(newPreviews);

      onFilesChange([...files, ...validFiles]);
    },
    [files, onFilesChange, previews]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      await processFiles(droppedFiles);
    },
    [processFiles]
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      await processFiles(selectedFiles);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processFiles]
  );

  const removeFile = (index: number) => {
    const file = files[index];
    const newPreviews = new Map(previews);
    newPreviews.delete(file.name + file.size);
    setPreviews(newPreviews);
    onFilesChange(files.filter((_, i) => i !== index));
    setError(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileKey = (file: File) => file.name + file.size;
  const isVideo = (file: File) => ALLOWED_VIDEO_TYPES.includes(file.type.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <Card className="p-6">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
            isDragging
              ? "border-blue-400 bg-blue-500/10 shadow-[0_0_40px_rgba(59,130,246,0.25)]"
              : "border-white/15 bg-white/5 hover:border-white/25 hover:bg-white/10"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,.heic,.mp4,.mov"
            onChange={handleFileInput}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-300 ring-1 ring-white/10">
              <Upload className="h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">
                Drag and drop your files here
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Upload photos or video of your room from multiple angles
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse Files
            </Button>
            <p className="text-xs text-slate-400">
              JPG, PNG, WebP, HEIC, MP4, MOV • Max 5MB per file • Up to {MAX_FILES} files
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        )}
      </Card>

      {/* File previews */}
      {files.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Uploaded Files
            </h3>
            <span className="text-sm text-slate-400">
              {files.length} of {MAX_FILES} files
            </span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {files.map((file, index) => {
              const preview = previews.get(getFileKey(file));
              return (
                <div
                  key={getFileKey(file)}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5"
                >
                  {/* Preview */}
                  <div className="aspect-video bg-slate-900/50">
                    {preview ? (
                      <img
                        src={preview}
                        alt={file.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-500">
                        {isVideo(file) ? (
                          <Video className="h-10 w-10" />
                        ) : (
                          <ImageIcon className="h-10 w-10" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute right-2 top-2 rounded-lg bg-slate-900/80 p-1.5 opacity-0 transition-opacity hover:bg-red-500/80 group-hover:opacity-100"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {/* File info */}
                  <div className="p-3">
                    <p className="truncate text-sm font-medium text-white">
                      {file.name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {formatSize(file.size)} •{" "}
                      {isVideo(file) ? "Video" : "Image"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-lg border border-blue-400/20 bg-blue-500/10 p-4">
            <p className="text-sm text-blue-200">
              <strong>Tip:</strong> For best results, capture your room from
              multiple angles including corners. Good lighting helps AI analysis
              accuracy.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
