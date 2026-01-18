"use client";

import { ReactNode } from "react";

interface GlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "primary" | "icon";
  className?: string;
  type?: "button" | "submit";
}

export default function GlassButton({
  children,
  onClick,
  disabled = false,
  variant = "default",
  className = "",
  type = "button",
}: GlassButtonProps) {
  const baseStyles = `
    backdrop-blur-[10px]
    rounded-xl
    font-semibold
    text-white
    cursor-pointer
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantStyles = {
    default: `
      bg-white/15
      border border-white/30
      px-8 py-3.5
      text-base
      hover:bg-white/25 hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(0,0,0,0.2)]
      disabled:hover:bg-white/15 disabled:hover:translate-y-0 disabled:hover:shadow-none
    `,
    primary: `
      bg-gradient-to-r from-[#667eea] to-[#764ba2]
      border-none
      px-10 py-4
      text-lg
      shadow-[0_4px_20px_rgba(102,126,234,0.4)]
      hover:shadow-[0_8px_30px_rgba(102,126,234,0.6)] hover:-translate-y-1
      disabled:hover:shadow-[0_4px_20px_rgba(102,126,234,0.4)] disabled:hover:translate-y-0
    `,
    icon: `
      bg-white/10
      border border-white/20
      p-3
      hover:bg-white/20 hover:-translate-y-0.5
      disabled:hover:bg-white/10 disabled:hover:translate-y-0
    `,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
