"use client";

import { Plus } from "lucide-react";
import PhotoCard from "./PhotoCard";

interface PhotoFile {
  file: File;
  preview: string;
  id: string;
}

interface PhotoPreviewGridProps {
  photos: PhotoFile[];
  onRemove: (id: string) => void;
  onAddMore: (files: File[]) => void;
  maxPhotos?: number;
  compact?: boolean;
}

export default function PhotoPreviewGrid({
  photos,
  onRemove,
  onAddMore,
  maxPhotos = 5,
  compact = false,
}: PhotoPreviewGridProps) {
  const canAddMore = photos.length < maxPhotos;

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      onAddMore(Array.from(files));
    }
  };

  return (
    <div className={`grid ${compact ? "grid-cols-2 lg:grid-cols-3 gap-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"} h-full`}>
      {/* Photo cards */}
      {photos.map((photo, index) => (
        <PhotoCard
          key={photo.id}
          file={photo.file}
          preview={photo.preview}
          onRemove={() => onRemove(photo.id)}
          index={index}
          compact={compact}
        />
      ))}
      
      {/* Add more card */}
      {canAddMore && (
        <label className={`
          ${compact ? "aspect-square" : "aspect-[4/3]"} flex flex-col items-center justify-center
          border-2 border-dashed border-white/30 rounded-xl
          bg-white/5 hover:bg-white/10
          cursor-pointer
          transition-all duration-200
          hover:border-white/50 hover:-translate-y-1
          animate-fadeIn
        `}
        style={{ animationDelay: `${photos.length * 100}ms` }}
        >
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/heic,.heic"
            onChange={handleFileInput}
            className="hidden"
          />
          <div className={`${compact ? "p-2 mb-1" : "p-4 mb-3"} rounded-full bg-white/10`}>
            <Plus className={`${compact ? "w-5 h-5" : "w-8 h-8"} text-white/70`} />
          </div>
          <p className={`text-white/70 font-medium ${compact ? "text-xs" : "text-base"}`}>Add More</p>
          {!compact && (
            <p className="text-white/40 text-sm mt-1">
              {photos.length} of {maxPhotos} photos
            </p>
          )}
        </label>
      )}
    </div>
  );
}
