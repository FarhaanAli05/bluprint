"use client";

interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full max-w-[400px]">
      {/* Progress bar container */}
      <div className="
        w-full h-2
        bg-white/20
        rounded-full
        overflow-hidden
        backdrop-blur-[10px]
        border border-white/30
      ">
        {/* Progress fill */}
        <div
          className="
            h-full
            bg-gradient-to-r from-[#667eea] to-[#764ba2]
            rounded-full
            transition-[width] duration-300 ease-out
            shadow-[0_0_20px_rgba(102,126,234,0.5)]
            animate-shimmer
          "
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
