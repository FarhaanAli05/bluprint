"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  Camera, 
  Box, 
  Sparkles, 
  Layers, 
  Download, 
  Share2,
  Zap,
  Eye,
  Palette,
  Move3D
} from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import GlassButton from "@/components/shared/GlassButton";
import MouseSpotlight from "@/components/landing/MouseSpotlight";
import GlassNavigation from "@/components/landing/GlassNavigation";

// Dynamically import 3D visualizer to avoid SSR issues
const Room3DVisualizer = dynamic(
  () => import("@/components/landing/Room3DVisualizer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-16 w-16 animate-pulse rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20" />
      </div>
    ),
  }
);

const features = [
  {
    icon: Camera,
    title: "Photo to 3D",
    description: "Upload photos of your room and our AI instantly generates an accurate 3D model with furniture detection.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Box,
    title: "Furniture Import",
    description: "Import real furniture from IKEA, Wayfair, and other stores directly into your 3D room with our browser extension.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Move3D,
    title: "Drag & Drop Design",
    description: "Easily rearrange furniture in your 3D space. Drag, rotate, and position items to visualize different layouts.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Eye,
    title: "Multiple Views",
    description: "Switch between orbit, first-person, and blueprint views. See your room from every angle.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    description: "Ask our AI to suggest furniture placements, color schemes, or layout improvements in natural language.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Palette,
    title: "Customize Materials",
    description: "Change wall colors, flooring materials, and furniture finishes to match your style preferences.",
    gradient: "from-indigo-500 to-violet-500",
  },
];

const stats = [
  { value: "10K+", label: "Rooms Created" },
  { value: "50K+", label: "Furniture Items" },
  { value: "2.3s", label: "Avg. Generation Time" },
  { value: "98%", label: "Accuracy Rate" },
];

export default function FeaturesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1128] via-[#1E0A28] to-[#0A1128]">
      {/* Mouse spotlight effect */}
      {mounted && <MouseSpotlight />}

      {/* Background grid pattern */}
      <div
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Navigation */}
      <GlassNavigation />

      {/* Content */}
      <main className="relative z-10 pt-28 pb-16 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Powerful{" "}
              <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
                Features
              </span>
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Everything you need to design and visualize your perfect room in stunning 3D
            </p>
          </div>

          {/* 3D Preview Section */}
          <div
            className={`mb-16 transition-all duration-700 delay-100 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <GlassCard className="overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                {/* 3D Visualizer */}
                <div className="relative h-[350px] lg:h-[450px] lg:flex-1">
                  <Room3DVisualizer />
                </div>

                {/* Info Panel */}
                <div className="p-8 lg:w-96 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2]">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white/60">Real-time Preview</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Interactive 3D Visualization
                  </h3>
                  <p className="text-white/50 mb-6">
                    See your room come to life in real-time. Our 3D engine renders furniture with realistic lighting and shadows.
                  </p>
                  <Link href="/upload">
                    <GlassButton variant="primary" className="w-full">
                      Try It Now
                    </GlassButton>
                  </Link>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Stats Section */}
          <div
            className={`mb-16 transition-all duration-700 delay-150 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <GlassCard key={index} className="p-6 text-center">
                  <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-sm text-white/50 mt-1">{stat.label}</p>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div
            className={`mb-16 transition-all duration-700 delay-200 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
              Everything You Need
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <GlassCard
                  key={index}
                  hover
                  className="p-6 transition-all duration-500"
                  style={{ transitionDelay: `${200 + index * 50}ms` } as React.CSSProperties}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/50">{feature.description}</p>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div
            className={`transition-all duration-700 delay-300 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <GlassCard className="p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ready to Design Your Space?
              </h2>
              <p className="text-white/50 mb-8 max-w-xl mx-auto">
                Join thousands of users who are already transforming their rooms with BluPrint's AI-powered 3D design tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/upload">
                  <GlassButton variant="primary" className="px-8">
                    Start Designing
                  </GlassButton>
                </Link>
                <Link href="/my-bluprints">
                  <GlassButton variant="default" className="px-8">
                    View My Projects
                  </GlassButton>
                </Link>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}
