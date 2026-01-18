"use client";

import { Lightbulb, Camera, Sun, Sofa, User } from "lucide-react";
import GlassCard from "../shared/GlassCard";

const tips = [
  { icon: Camera, text: "Capture all corners of your room" },
  { icon: Sun, text: "Use good lighting" },
  { icon: Sofa, text: "Include views of furniture and walls" },
  { icon: User, text: "Take photos from standing height" },
];

export default function UploadTips() {
  return (
    <GlassCard className="p-4 sm:p-5 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-amber-500/20">
          <Lightbulb className="w-4 h-4 text-amber-400" />
        </div>
        <h4 className="text-base font-semibold text-white">Tips for best results</h4>
      </div>
      
      <ul className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {tips.map((tip, index) => (
          <li 
            key={index}
            className="flex items-center gap-2 text-white/70"
          >
            <tip.icon className="w-3.5 h-3.5 text-white/50 flex-shrink-0" />
            <span className="text-xs sm:text-sm">{tip.text}</span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
