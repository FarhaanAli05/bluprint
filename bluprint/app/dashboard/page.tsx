"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import Card from "@/components/Card";
import Button, { buttonClasses } from "@/components/Button";
import { projectStorage } from "@/lib/store";
import type { Project } from "@/types/room.types";
import {
  Plus,
  FolderOpen,
  Calendar,
  Trash2,
  ExternalLink,
  LayoutGrid,
  Bed,
  Sofa,
  ChefHat,
  Bath,
  Briefcase,
  Wand2,
  Sparkles,
  Camera,
  ArrowRight,
} from "lucide-react";

const roomTypeIcons: Record<Project["roomType"], React.ReactNode> = {
  bedroom: <Bed className="h-5 w-5" />,
  "living-room": <Sofa className="h-5 w-5" />,
  kitchen: <ChefHat className="h-5 w-5" />,
  bathroom: <Bath className="h-5 w-5" />,
  office: <Briefcase className="h-5 w-5" />,
};

const roomTypeLabels: Record<Project["roomType"], string> = {
  bedroom: "Bedroom",
  "living-room": "Living Room",
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  office: "Office",
};

const statusColors: Record<Project["status"], string> = {
  draft: "border-slate-400/40 bg-slate-500/20 text-slate-200",
  uploading: "border-amber-400/40 bg-amber-500/20 text-amber-100",
  processing: "border-blue-400/40 bg-blue-500/20 text-blue-100",
  ready: "border-emerald-400/40 bg-emerald-500/20 text-emerald-100",
  error: "border-red-400/40 bg-red-500/20 text-red-100",
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadedProjects = projectStorage.getAll();
    setProjects(loadedProjects.sort((a, b) => b.updatedAt - a.updatedAt));
    setLoading(false);
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project?")) {
      projectStorage.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen flex-col text-slate-100">
      <SiteHeader />
      <main className="flex-1 py-12 lg:py-16">
        <Container>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white">
                My Projects
              </h1>
              <p className="mt-2 text-slate-300">
                Manage and view all your room design projects
              </p>
            </div>
            <Link href="/create" className={buttonClasses("primary", "md")}>
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </div>

          {/* AI Photo-to-3D Feature Banner */}
          <Link href="/photo-to-3d" className="group mb-8 block">
            <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 p-6 transition-all hover:border-purple-400/50 hover:shadow-[0_24px_60px_rgba(139,92,246,0.25)]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />
              
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 text-purple-300 ring-1 ring-purple-400/30">
                    <Wand2 className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold text-white group-hover:text-purple-200">
                        AI Photo-to-3D
                      </h3>
                      <span className="rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-2 py-0.5 text-xs font-semibold text-white">
                        NEW
                      </span>
                    </div>
                    <p className="mt-1 text-slate-300">
                      Upload room photos and get an instant interactive 3D model
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-purple-300 group-hover:text-purple-200">
                  <span className="text-sm font-medium">Try it now</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              <div className="relative mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  Claude AI vision
                </span>
                <span className="flex items-center gap-1.5">
                  <Camera className="h-4 w-4 text-purple-400" />
                  Any room photos
                </span>
              </div>
            </div>
          </Link>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse p-6">
                  <div className="h-32 rounded-xl bg-white/5" />
                  <div className="mt-4 h-5 w-3/4 rounded bg-white/5" />
                  <div className="mt-2 h-4 w-1/2 rounded bg-white/5" />
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-blue-200">
                <FolderOpen className="h-8 w-8" />
              </div>
              <h2 className="mt-6 text-xl font-semibold text-white">
                No projects yet
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-slate-300">
                Create your first room design project by uploading photos or
                entering room dimensions manually.
              </p>
              <Link
                href="/create"
                className={`mt-6 inline-flex ${buttonClasses("primary", "md")}`}
              >
                <Plus className="h-4 w-4" />
                Create your first project
              </Link>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/editor/${project.id}`}
                  className="group"
                >
                  <Card className="h-full overflow-hidden transition-all group-hover:border-white/20 group-hover:shadow-[0_32px_80px_rgba(2,6,23,0.6)]">
                    {/* Preview area */}
                    <div className="relative h-36 bg-gradient-to-br from-slate-900/80 to-slate-950">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-blue-200">
                          <LayoutGrid className="h-6 w-6" />
                        </div>
                      </div>
                      {/* Status badge */}
                      <div className="absolute right-3 top-3">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusColors[project.status]}`}
                        >
                          {project.status}
                        </span>
                      </div>
                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDelete(project.id, e)}
                        className="absolute left-3 top-3 rounded-lg border border-white/10 bg-slate-900/80 p-2 opacity-0 transition-opacity hover:bg-red-500/20 hover:text-red-300 group-hover:opacity-100"
                        title="Delete project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Project info */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-lg font-semibold text-white group-hover:text-blue-200">
                            {project.name}
                          </h3>
                          <div className="mt-1.5 flex items-center gap-2 text-sm text-slate-400">
                            <span className="flex items-center gap-1.5">
                              {roomTypeIcons[project.roomType]}
                              {roomTypeLabels[project.roomType]}
                            </span>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 flex-shrink-0 text-slate-500 opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(project.updatedAt)}
                        </span>
                        <span>
                          {project.furniture.length} item
                          {project.furniture.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}

              {/* New project card */}
              <Link href="/create" className="group">
                <Card className="flex h-full min-h-[260px] flex-col items-center justify-center border-dashed p-6 text-center transition-all group-hover:border-blue-400/40 group-hover:bg-blue-500/5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-blue-200 transition-colors group-hover:border-blue-400/30 group-hover:bg-blue-500/10">
                    <Plus className="h-6 w-6" />
                  </div>
                  <p className="mt-4 font-semibold text-white">
                    Create New Project
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Start designing a new room
                  </p>
                </Card>
              </Link>
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
