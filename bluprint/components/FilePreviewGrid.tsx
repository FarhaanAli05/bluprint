"use client";

import { FileWithPreview } from "./UploadDropzone";
import { formatBytes } from "@/lib/utils";

interface FilePreviewGridProps {
  files: FileWithPreview[];
  onRemove: (index: number) => void;
}

export default function FilePreviewGrid({
  files,
  onRemove,
}: FilePreviewGridProps) {
  if (files.length === 0) return null;

  const isVideo = (type: string) => {
    return type.startsWith("video/");
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-foreground">Uploaded Files</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {files.map((item, index) => (
          <div
            key={`${item.file.name}-${index}`}
            className="group relative rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden"
          >
            {item.preview && !isVideo(item.file.type) ? (
              <div className="aspect-square relative">
                <img
                  src={item.preview}
                  alt={item.file.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square flex items-center justify-center bg-zinc-100 dark:bg-zinc-900">
                <svg
                  className="h-8 w-8 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
            <div className="p-2">
              <p className="truncate text-xs font-medium text-foreground">
                {item.file.name}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {formatBytes(item.file.size)}
              </p>
            </div>
            <button
              onClick={() => onRemove(index)}
              className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
              aria-label={`Remove ${item.file.name}`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
