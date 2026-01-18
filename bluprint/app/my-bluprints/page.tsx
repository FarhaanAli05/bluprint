"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Plus, Trash2, ExternalLink, Calendar, Image as ImageIcon } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import GlassButton from "@/components/shared/GlassButton";
import MouseSpotlight from "@/components/landing/MouseSpotlight";
import GlassNavigation from "@/components/landing/GlassNavigation";

interface Blueprint {
  id: string;
  name: string;
  slug: string;
  description?: string;
  photoCount: number;
  createdAt: number;
  thumbnail?: string;
  isDemo?: boolean;
}

// Storage key for blueprints
const BLUEPRINTS_STORAGE_KEY = "bluprint_projects";

// Pre-populated demo projects
const DEMO_PROJECTS: Blueprint[] = [
  {
    id: "demo-living-room",
    name: "Living Room",
    slug: "demo/living-room",
    description: "Beautiful stone fireplace with gray accent wall, decorative wrought iron staircase, and natural lighting.",
    photoCount: 5,
    createdAt: Date.now() - 86400000 * 3, // 3 days ago
    thumbnail: "/living-room-thumb.jpg",
    isDemo: true,
  },
];

export default function MyBluprintsPage() {
  const [userBlueprints, setUserBlueprints] = useState<Blueprint[]>([]);
  const [mounted, setMounted] = useState(false);

  // Combine demo projects with user projects
  const blueprints = [...DEMO_PROJECTS, ...userBlueprints];

  useEffect(() => {
    setMounted(true);
    // Load blueprints from localStorage
    const stored = localStorage.getItem(BLUEPRINTS_STORAGE_KEY);
    if (stored) {
      try {
        setUserBlueprints(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse blueprints:", e);
      }
    }
  }, []);

  const handleDelete = (id: string) => {
    // Don't delete demo projects
    if (DEMO_PROJECTS.some(p => p.id === id)) return;
    
    const updated = userBlueprints.filter((b) => b.id !== id);
    setUserBlueprints(updated);
    localStorage.setItem(BLUEPRINTS_STORAGE_KEY, JSON.stringify(updated));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
      <main className="relative z-10 pt-28 pb-12 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div
            className={`mb-10 transition-all duration-700 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  My{" "}
                  <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
                    Bluprints
                  </span>
                </h1>
                <p className="text-white/60">
                  {blueprints.length === 0
                    ? "You haven't created any bluprints yet"
                    : `${blueprints.length} project${blueprints.length !== 1 ? "s" : ""}`}
                </p>
              </div>
              <Link href="/upload">
                <GlassButton variant="primary" className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  New Bluprint
                </GlassButton>
              </Link>
            </div>
          </div>

          {/* Blueprints Grid */}
          {blueprints.length === 0 ? (
            <GlassCard
              className={`p-12 text-center transition-all duration-700 delay-100 ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#667eea]/30 to-[#764ba2]/30 flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-white/60" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No bluprints yet</h3>
                <p className="text-white/50 mb-6">
                  Create your first bluprint by uploading photos of your room and let AI generate a 3D model.
                </p>
                <Link href="/upload">
                  <GlassButton variant="primary" className="inline-flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create Your First Bluprint
                  </GlassButton>
                </Link>
              </div>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blueprints.map((blueprint, index) => (
                <GlassCard
                  key={blueprint.id}
                  hover
                  className={`overflow-hidden transition-all duration-700 ${
                    mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                  style={{ transitionDelay: `${100 + index * 50}ms` } as React.CSSProperties}
                >
                  {/* Thumbnail */}
                  <div className="relative h-40 bg-gradient-to-br from-[#667eea]/20 to-[#764ba2]/20">
                    {blueprint.isDemo ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-orange-600/20">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center">
                          <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                          </svg>
                        </div>
                      </div>
                    ) : blueprint.thumbnail ? (
                      <Image
                        src={blueprint.thumbnail}
                        alt={blueprint.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-white/40" />
                        </div>
                      </div>
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    
                    {/* Demo badge */}
                    {blueprint.isDemo && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500/90 text-white text-xs font-semibold">
                        Demo
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-1 truncate">
                      {blueprint.name}
                    </h3>
                    {blueprint.description && (
                      <p className="text-sm text-white/50 mb-3 line-clamp-2">
                        {blueprint.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-white/40 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(blueprint.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5" />
                        {blueprint.photoCount} photos
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={blueprint.isDemo ? `/${blueprint.slug}` : `/projects/${blueprint.slug}`}
                        className="flex-1"
                      >
                        <GlassButton variant="default" className="w-full flex items-center justify-center gap-2 text-sm py-2.5">
                          <ExternalLink className="w-4 h-4" />
                          Open
                        </GlassButton>
                      </Link>
                      {!blueprint.isDemo && (
                        <button
                          onClick={() => handleDelete(blueprint.id)}
                          className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
