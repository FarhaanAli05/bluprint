"use client";

import { useEffect, useRef } from "react";

export default function MouseSpotlight() {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    // Smooth animation loop with lag
    let animationId: number;
    const animate = () => {
      // Ease towards mouse position (creates smooth lag effect)
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * 0.2;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * 0.2;

      if (spotlightRef.current) {
        spotlightRef.current.style.left = `${currentPos.current.x}px`;
        spotlightRef.current.style.top = `${currentPos.current.y}px`;
      }

      animationId = requestAnimationFrame(animate);
    };

    // Initialize position
    currentPos.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    mousePos.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    window.addEventListener("mousemove", handleMouseMove);
    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div
      ref={spotlightRef}
      className="pointer-events-none fixed z-50 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 opacity-90"
      style={{
        background:
          "radial-gradient(circle, rgba(139, 92, 246, 0.32) 0%, rgba(96, 165, 250, 0.2) 30%, transparent 70%)",
      }}
    />
  );
}
