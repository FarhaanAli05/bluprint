"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Dynamic import to avoid SSR issues with Three.js
const DormRoomViewer = dynamic(
  () => import("@/components/3d-viewer/DormRoomViewer"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-[600px] items-center justify-center rounded-xl bg-slate-900">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500" />
          <p className="mt-4 text-slate-400">Loading 3D Viewer...</p>
        </div>
      </div>
    )
  }
);

export default function DormRoomDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
              <div className="h-6 w-px bg-white/10" />
              <h1 className="text-lg font-semibold text-white">
                3D Dorm Room Demo
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Title Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            Interactive 3D Dorm Room
          </h2>
          <p className="mt-2 text-slate-400">
            Explore a fully interactive 3D model of a college dorm room
          </p>
        </div>

        {/* 3D Viewer */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-2 shadow-2xl">
          <div className="h-[600px] lg:h-[700px]">
            <DormRoomViewer />
          </div>
        </div>

        {/* Room Details */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-5">
            <h3 className="text-sm font-medium text-slate-400">Room Dimensions</h3>
            <p className="mt-1 text-xl font-semibold text-white">12' × 10' × 9'</p>
            <p className="mt-1 text-sm text-slate-500">120 sq ft floor area</p>
          </div>
          
          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-5">
            <h3 className="text-sm font-medium text-slate-400">Furniture Items</h3>
            <p className="mt-1 text-xl font-semibold text-white">7 Items</p>
            <p className="mt-1 text-sm text-slate-500">Bed, Desk, Chair, Wardrobe, etc.</p>
          </div>
          
          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-5">
            <h3 className="text-sm font-medium text-slate-400">Room Type</h3>
            <p className="mt-1 text-xl font-semibold text-white">Dorm Room</p>
            <p className="mt-1 text-sm text-slate-500">Single occupancy</p>
          </div>
          
          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-5">
            <h3 className="text-sm font-medium text-slate-400">Style</h3>
            <p className="mt-1 text-xl font-semibold text-white">Classic Academic</p>
            <p className="mt-1 text-sm text-slate-500">Warm wood tones</p>
          </div>
        </div>

        {/* Furniture List */}
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold text-white">Furniture in Room</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Twin Bed", dimensions: "75\" × 39\" × 24\"", color: "Oak wood frame" },
              { name: "Desk with Hutch", dimensions: "48\" × 24\" × 60\"", color: "Medium oak" },
              { name: "Office Chair", dimensions: "24\" × 24\" × 42\"", color: "Black mesh" },
              { name: "Wardrobe", dimensions: "48\" × 24\" × 72\"", color: "Oak with shelving" },
              { name: "Cork Board", dimensions: "24\" × 18\"", color: "Natural cork" },
              { name: "Window", dimensions: "48\" × 48\"", color: "White frame" },
              { name: "Ceiling Light", dimensions: "12\" diameter", color: "White dome" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-lg border border-white/5 bg-white/5 p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 text-blue-300">
                  {i + 1}
                </div>
                <div>
                  <p className="font-medium text-white">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.dimensions}</p>
                  <p className="text-xs text-slate-500">{item.color}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls Guide */}
        <div className="mt-8 rounded-xl border border-white/10 bg-slate-900/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Navigation Controls</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-500/20 p-2 text-blue-300">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">Rotate View</p>
                <p className="text-sm text-slate-400">Click and drag to orbit around the room</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-300">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">Zoom</p>
                <p className="text-sm text-slate-400">Scroll wheel or pinch to zoom in/out</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-amber-500/20 p-2 text-amber-300">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">Pan</p>
                <p className="text-sm text-slate-400">Right-click drag to pan the view</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 rounded-lg border border-blue-400/20 bg-blue-500/10 p-4">
            <p className="text-sm text-blue-200">
              <strong>Auto-Rotation:</strong> The room automatically rotates when you're not interacting. 
              Touch or click anywhere to pause, and it will resume after 2 seconds of inactivity.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <p className="text-center text-sm text-slate-500">
            Built with React Three Fiber and Three.js • BluPrint 3D Room Designer
          </p>
        </div>
      </footer>
    </div>
  );
}
