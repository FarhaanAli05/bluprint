"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  Search, 
  Package, 
  Trash2, 
  ExternalLink, 
  Box,
  Sofa,
  Bed,
  Lamp,
  BookOpen,
  Filter,
  Grid3X3,
  List
} from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import GlassButton from "@/components/shared/GlassButton";
import MouseSpotlight from "@/components/landing/MouseSpotlight";
import GlassNavigation from "@/components/landing/GlassNavigation";

interface FurnitureItem {
  id: string;
  name: string;
  category: string;
  source: string;
  sourceUrl?: string;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
    unit: string;
  };
  price?: string;
  thumbnail?: string;
  importedAt: number;
}

// Storage key for furniture items
const FURNITURE_STORAGE_KEY = "bluprint_furniture";

const categoryIcons: Record<string, React.ElementType> = {
  sofa: Sofa,
  bed: Bed,
  lamp: Lamp,
  bookshelf: BookOpen,
  default: Box,
};

const categories = [
  { id: "all", name: "All Items" },
  { id: "sofa", name: "Sofas" },
  { id: "bed", name: "Beds" },
  { id: "desk", name: "Desks" },
  { id: "chair", name: "Chairs" },
  { id: "lamp", name: "Lamps" },
  { id: "bookshelf", name: "Bookshelves" },
  { id: "other", name: "Other" },
];

export default function StoragePage() {
  const [furniture, setFurniture] = useState<FurnitureItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    setMounted(true);
    // Load furniture from localStorage
    const stored = localStorage.getItem(FURNITURE_STORAGE_KEY);
    if (stored) {
      try {
        setFurniture(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse furniture:", e);
      }
    }
  }, []);

  const handleDelete = (id: string) => {
    const updated = furniture.filter((f) => f.id !== id);
    setFurniture(updated);
    localStorage.setItem(FURNITURE_STORAGE_KEY, JSON.stringify(updated));
  };

  const filteredFurniture = furniture.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category] || categoryIcons.default;
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
            className={`mb-8 transition-all duration-700 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              Furniture{" "}
              <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
                Storage
              </span>
            </h1>
            <p className="text-white/60">
              {furniture.length === 0
                ? "Import furniture from your favorite stores"
                : `${furniture.length} item${furniture.length !== 1 ? "s" : ""} in your collection`}
            </p>
          </div>

          {/* Search and Filters */}
          <div
            className={`mb-6 transition-all duration-700 delay-100 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <GlassCard className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search furniture..."
                    className="
                      w-full pl-12 pr-4 py-3
                      bg-white/5 border border-white/10
                      rounded-xl
                      text-white placeholder-white/40
                      focus:outline-none focus:border-[#667eea] focus:bg-white/10
                      transition-all duration-200
                    "
                  />
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
                  {categories.slice(0, 5).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`
                        px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap
                        transition-all duration-200
                        ${selectedCategory === cat.id
                          ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
                          : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                        }
                      `}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* View Toggle */}
                <div className="flex gap-1 bg-white/5 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "grid" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                    }`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "list" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Furniture Items */}
          {filteredFurniture.length === 0 ? (
            <GlassCard
              className={`p-12 text-center transition-all duration-700 delay-200 ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#667eea]/30 to-[#764ba2]/30 flex items-center justify-center">
                  <Package className="w-10 h-10 text-white/60" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {furniture.length === 0 ? "No furniture imported" : "No matching items"}
                </h3>
                <p className="text-white/50 mb-6">
                  {furniture.length === 0
                    ? "Use the BluPrint browser extension to import furniture from IKEA, Wayfair, and other stores."
                    : "Try adjusting your search or filter criteria."}
                </p>
                {furniture.length === 0 && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <GlassButton variant="primary" className="inline-flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Get Browser Extension
                    </GlassButton>
                  </div>
                )}
              </div>
            </GlassCard>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredFurniture.map((item, index) => {
                const CategoryIcon = getCategoryIcon(item.category);
                return (
                  <GlassCard
                    key={item.id}
                    hover
                    className={`overflow-hidden transition-all duration-700 ${
                      mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: `${200 + index * 30}ms` } as React.CSSProperties}
                  >
                    {/* Thumbnail */}
                    <div className="relative h-36 bg-gradient-to-br from-white/5 to-white/10">
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.name}
                          fill
                          className="object-contain p-4"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <CategoryIcon className="w-12 h-12 text-white/20" />
                        </div>
                      )}
                      {/* Source badge */}
                      <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-sm text-xs text-white/80">
                        {item.source}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-white mb-1 truncate">
                        {item.name}
                      </h3>
                      {item.dimensions && (
                        <p className="text-xs text-white/40 mb-2">
                          {item.dimensions.width} × {item.dimensions.height} × {item.dimensions.depth} {item.dimensions.unit}
                        </p>
                      )}
                      {item.price && (
                        <p className="text-sm font-medium text-[#667eea] mb-3">
                          {item.price}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {item.sourceUrl && (
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <GlassButton variant="default" className="w-full text-xs py-2">
                              <ExternalLink className="w-3.5 h-3.5 mr-1" />
                              View
                            </GlassButton>
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {filteredFurniture.map((item, index) => {
                const CategoryIcon = getCategoryIcon(item.category);
                return (
                  <GlassCard
                    key={item.id}
                    hover
                    className={`p-4 transition-all duration-700 ${
                      mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: `${200 + index * 30}ms` } as React.CSSProperties}
                  >
                    <div className="flex items-center gap-4">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 flex-shrink-0 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
                        {item.thumbnail ? (
                          <Image
                            src={item.thumbnail}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="object-contain"
                          />
                        ) : (
                          <CategoryIcon className="w-8 h-8 text-white/20" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                          <span>{item.source}</span>
                          {item.dimensions && (
                            <span>
                              {item.dimensions.width} × {item.dimensions.height} × {item.dimensions.depth} {item.dimensions.unit}
                            </span>
                          )}
                          <span>{formatDate(item.importedAt)}</span>
                        </div>
                      </div>

                      {/* Price */}
                      {item.price && (
                        <p className="text-sm font-medium text-[#667eea] hidden sm:block">
                          {item.price}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {item.sourceUrl && (
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <GlassButton variant="icon" className="p-2">
                              <ExternalLink className="w-4 h-4" />
                            </GlassButton>
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}

          {/* How it works section */}
          {furniture.length === 0 && (
            <div
              className={`mt-12 transition-all duration-700 delay-300 ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                How to Import Furniture
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    step: "1",
                    title: "Install Extension",
                    description: "Add the BluPrint browser extension to Chrome or Firefox",
                  },
                  {
                    step: "2",
                    title: "Browse & Import",
                    description: "Visit IKEA, Wayfair, or other stores and click the import button",
                  },
                  {
                    step: "3",
                    title: "Use in Projects",
                    description: "Your imported furniture will appear in the 3D room editor",
                  },
                ].map((item, index) => (
                  <GlassCard key={index} className="p-6 text-center">
                    <div className="w-10 h-10 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white font-bold">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-white/50">{item.description}</p>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
