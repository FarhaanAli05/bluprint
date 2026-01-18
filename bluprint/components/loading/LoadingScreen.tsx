"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "./ProgressBar";
import Image from "next/image";

interface LoadingStep {
  text: string;
  duration: number;
  progress: number;
}

const loadingSteps: LoadingStep[] = [
  { text: "Analyzing your space...", duration: 2000, progress: 15 },
  { text: "Turning on the lights...", duration: 2200, progress: 30 },
  { text: "Putting up the walls...", duration: 2000, progress: 45 },
  { text: "Placing furniture...", duration: 2200, progress: 60 },
  { text: "Adding finishing touches...", duration: 2000, progress: 75 },
  { text: "Perfecting dimensions...", duration: 2200, progress: 90 },
  { text: "Building your blueprint...", duration: 1500, progress: 100 },
];

interface LoadingScreenProps {
  onComplete?: () => void;
}

// Pre-generated particle positions to avoid hydration mismatch
const particlePositions = [
  { left: 12, top: 25, delay: 0.5, duration: 7 },
  { left: 85, top: 15, delay: 1.2, duration: 8 },
  { left: 45, top: 70, delay: 2.1, duration: 6 },
  { left: 28, top: 40, delay: 0.8, duration: 9 },
  { left: 72, top: 85, delay: 1.5, duration: 7 },
  { left: 5, top: 60, delay: 2.8, duration: 8 },
  { left: 90, top: 35, delay: 0.3, duration: 6 },
  { left: 55, top: 10, delay: 1.9, duration: 9 },
  { left: 35, top: 90, delay: 3.2, duration: 7 },
  { left: 65, top: 50, delay: 0.7, duration: 8 },
  { left: 20, top: 75, delay: 2.4, duration: 6 },
  { left: 78, top: 20, delay: 1.1, duration: 9 },
  { left: 42, top: 55, delay: 3.5, duration: 7 },
  { left: 8, top: 30, delay: 0.9, duration: 8 },
  { left: 95, top: 65, delay: 2.0, duration: 6 },
  { left: 50, top: 80, delay: 1.6, duration: 9 },
  { left: 15, top: 45, delay: 2.7, duration: 7 },
  { left: 82, top: 5, delay: 0.4, duration: 8 },
  { left: 38, top: 95, delay: 3.0, duration: 6 },
  { left: 68, top: 38, delay: 1.3, duration: 9 },
];

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [textOpacity, setTextOpacity] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigateToDemoPage = useCallback(() => {
    if (onComplete) {
      onComplete();
    } else {
      router.push("/demo/dorm-room");
    }
  }, [onComplete, router]);

  useEffect(() => {
    if (isComplete) return;

    let stepTimeout: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    const animateStep = () => {
      if (currentStep >= loadingSteps.length) {
        setIsComplete(true);
        setTimeout(() => {
          navigateToDemoPage();
        }, 500);
        return;
      }

      const step = loadingSteps[currentStep];
      const startProgress = currentStep === 0 ? 0 : loadingSteps[currentStep - 1].progress;
      const endProgress = step.progress;
      const progressDuration = step.duration;
      const progressIncrement = (endProgress - startProgress) / (progressDuration / 50);

      let currentProgress = startProgress;
      progressInterval = setInterval(() => {
        currentProgress += progressIncrement;
        if (currentProgress >= endProgress) {
          currentProgress = endProgress;
          clearInterval(progressInterval);
        }
        setProgress(Math.round(currentProgress));
      }, 50);

      // Fade out text before changing
      stepTimeout = setTimeout(() => {
        setTextOpacity(0);
        setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
          setTextOpacity(1);
        }, 300);
      }, step.duration - 300);
    };

    animateStep();

    return () => {
      clearTimeout(stepTimeout);
      clearInterval(progressInterval);
    };
  }, [currentStep, isComplete, navigateToDemoPage]);

  return (
    <div className="
      fixed inset-0 z-50
      flex items-center justify-center
      bg-gradient-to-br from-[#0A1128] via-[#1E0A28] to-[#0A1128]
    ">
      {/* Animated background particles */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particlePositions.map((particle, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Loading content */}
      <div className="relative z-10 flex flex-col items-center px-6">
        {/* Animated Logo */}
        <div className="mb-10 animate-pulse-scale">
          <div className="relative w-24 h-24">
            <Image
              src="/bluprintlog.png"
              alt="BluPrint Logo"
              fill
              className="object-contain"
              onError={(e) => {
                // Fallback to text if image doesn't load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            {/* Fallback logo */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-2xl text-white text-3xl font-bold">
              B
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8 w-full flex justify-center">
          <ProgressBar progress={progress} />
        </div>

        {/* Loading text with fade animation */}
        <p
          className="
            text-2xl sm:text-3xl font-medium text-white
            text-center mb-4
            transition-opacity duration-300
            text-shadow-glow
          "
          style={{ opacity: textOpacity }}
        >
          {loadingSteps[currentStep]?.text || "Almost there..."}
        </p>

        {/* Progress percentage */}
        <p className="text-xl text-white/60 font-mono">
          {progress}%
        </p>
      </div>

      {/* Subtle gradient animation overlay */}
      <div className="
        absolute inset-0 pointer-events-none
        bg-gradient-to-t from-[#667eea]/5 via-transparent to-[#764ba2]/5
        animate-gradient-shift
      " />
    </div>
  );
}
