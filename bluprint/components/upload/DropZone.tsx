"use client";

import { useCallback, useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  compact?: boolean;
}

export default function DropZone({ 
  onFilesSelected, 
  maxFiles = 5, 
  maxSizeMB = 10,
  compact = false
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFiles = useCallback((files: FileList | File[]): File[] => {
    const validFiles: File[] = [];
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      // Check file type
      const validTypes = ["image/jpeg", "image/png", "image/heic", "image/heif"];
      if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith(".heic")) {
        console.warn(`Invalid file type: ${file.name}`);
        continue;
      }
      
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        console.warn(`File too large: ${file.name}`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    return validFiles.slice(0, maxFiles);
  }, [maxFiles, maxSizeMB]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    const validFiles = validateFiles(files);
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  }, [onFilesSelected, validateFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const validFiles = validateFiles(files);
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  }, [onFilesSelected, validateFiles]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative flex flex-col items-center justify-center h-full
        ${compact ? "p-4 lg:p-6" : "min-h-[280px] lg:min-h-[320px] p-8 lg:p-12"}
        border-2 border-dashed rounded-2xl
        transition-all duration-300
        ${isDragging 
          ? "border-[#667eea] bg-[#667eea]/10 scale-[1.02]" 
          : "border-white/30 hover:border-white/50 hover:bg-white/5"
        }
      `}
    >
      {/* Animated background gradient on drag */}
      {isDragging && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#667eea]/20 to-[#764ba2]/20 animate-pulse" />
      )}
      
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Icon */}
        <div className={`
          ${compact ? "mb-3 p-4" : "mb-6 p-6"} rounded-full
          bg-gradient-to-br from-[#667eea]/30 to-[#764ba2]/30
          transition-transform duration-300
          ${isDragging ? "scale-110" : ""}
        `}>
          {isDragging ? (
            <ImageIcon className={`${compact ? "w-8 h-8" : "w-12 h-12"} text-white`} />
          ) : (
            <Upload className={`${compact ? "w-8 h-8" : "w-12 h-12"} text-white`} />
          )}
        </div>
        
        {/* Text */}
        <h3 className={`${compact ? "text-lg" : "text-2xl"} font-semibold text-white mb-1`}>
          {isDragging ? "Drop your photos here" : "Drag photos here"}
        </h3>
        <p className={`text-white/60 ${compact ? "text-sm mb-3" : "mb-6"}`}>
          JPG, PNG, HEIC up to {maxSizeMB}MB
        </p>
        
        {/* File input button */}
        <label className="cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/heic,.heic"
            onChange={handleFileInput}
            className="hidden"
          />
          <span className={`
            inline-block
            bg-white/15
            backdrop-blur-[10px]
            border border-white/30
            rounded-xl
            ${compact ? "px-5 py-2.5 text-sm" : "px-8 py-3.5 text-base"}
            font-semibold
            text-white
            transition-all duration-200
            hover:bg-white/25 hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(0,0,0,0.2)]
          `}>
            Choose Files
          </span>
        </label>
      </div>
    </div>
  );
}
