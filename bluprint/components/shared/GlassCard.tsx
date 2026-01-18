"use client";

import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
}

export default function GlassCard({ children, className = "", hover = false, style }: GlassCardProps) {
  return (
    <div
      style={style}
      className={`
        bg-white/10 backdrop-blur-[20px]
        border border-white/20
        rounded-3xl
        shadow-[0_8px_32px_rgba(0,0,0,0.1)]
        ${hover ? "transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)]" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
