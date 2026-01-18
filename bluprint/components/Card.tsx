import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 shadow-[0_24px_70px_rgba(2,6,23,0.45)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}
