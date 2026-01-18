"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";

interface PhotoCardProps {
  file: File;
  preview: string;
  onRemove: () => void;
  index: number;
  compact?: boolean;
}

export default function PhotoCard({ file, preview, onRemove, index, compact = false }: PhotoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={`
        relative ${compact ? "aspect-square" : "aspect-[4/3]"} overflow-hidden
        bg-white/15 backdrop-blur-[10px]
        border border-white/25 ${compact ? "rounded-xl" : "rounded-2xl"}
        transition-all duration-300
        ${isHovered ? "-translate-y-1 shadow-[0_12px_24px_rgba(0,0,0,0.2)]" : "shadow-[0_4px_12px_rgba(0,0,0,0.1)]"}
        animate-fadeIn
      `}
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative w-full h-full">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`${compact ? "w-6 h-6" : "w-8 h-8"} border-2 border-white/30 border-t-white rounded-full animate-spin`} />
          </div>
        )}
        <Image
          src={preview}
          alt={`Photo ${index + 1}`}
          fill
          className={`
            object-cover transition-opacity duration-300
            ${isLoaded ? "opacity-100" : "opacity-0"}
          `}
          onLoad={() => setIsLoaded(true)}
        />
      </div>
      
      {/* Overlay gradient */}
      <div className={`
        absolute inset-0 bg-gradient-to-t from-black/40 to-transparent
        transition-opacity duration-200
        ${isHovered ? "opacity-100" : "opacity-0"}
      `} />
      
      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className={`
          absolute ${compact ? "top-1.5 right-1.5 p-1" : "top-3 right-3 p-2"} rounded-full
          bg-red-500/80 hover:bg-red-500
          backdrop-blur-sm
          transition-all duration-200
          ${isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90"}
        `}
      >
        <X className={`${compact ? "w-3 h-3" : "w-4 h-4"} text-white`} />
      </button>
      
      {/* File name - only show on non-compact */}
      {!compact && (
        <div className={`
          absolute bottom-0 left-0 right-0 p-3
          transition-opacity duration-200
          ${isHovered ? "opacity-100" : "opacity-0"}
        `}>
          <p className="text-white text-sm truncate font-medium">
            {file.name}
          </p>
        </div>
      )}
    </div>
  );
}
