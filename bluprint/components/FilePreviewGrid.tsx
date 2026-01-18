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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Uploads</h3>
        <p className="text-sm text-slate-400">
          {files.length} file{files.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {files.map((item, index) => (
          <div
            key={`${item.file.name}-${index}`}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_18px_50px_rgba(2,6,23,0.35)]"
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
              <div className="aspect-square flex items-center justify-center bg-slate-900/70">
                <svg
                  className="h-8 w-8 text-slate-400"
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
            <div className="p-3">
              <p className="truncate text-xs font-semibold text-white">
                {item.file.name}
              </p>
              <p className="text-xs text-slate-400">
                {formatBytes(item.file.size)}
              </p>
            </div>
            <button
              onClick={() => onRemove(index)}
              className="absolute right-2 top-2 rounded-full border border-white/20 bg-slate-900/80 p-1.5 text-slate-200 opacity-0 shadow-sm transition-opacity hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 group-hover:opacity-100"
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
