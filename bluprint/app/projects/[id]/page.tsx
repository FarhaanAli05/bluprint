"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { projectStorage, formatBytes, type Project } from "@/lib/utils";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const projectId = params.id as string;
    if (projectId) {
      const loadedProject = projectStorage.getById(projectId);
      setProject(loadedProject);
      setLoading(false);
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Project not found</h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              The project you're looking for doesn't exist or has been deleted.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background hover:bg-foreground/90 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const roomTypeLabel =
    project.roomType === "bedroom"
      ? "Bedroom"
      : project.roomType === "kitchen"
      ? "Kitchen"
      : project.roomType === "living-room"
      ? "Living Room"
      : project.roomType;

  const totalSize = project.files.reduce((sum, f) => sum + f.size, 0);
  const isVideo = (type: string) => type.startsWith("video/");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {roomTypeLabel} Project
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Created {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* 3D Viewer Placeholder */}
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-12">
              <div className="text-center">
                <svg
                  className="mx-auto h-16 w-16 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <h2 className="mt-4 text-xl font-semibold text-foreground">
                  3D Room Viewer
                </h2>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Coming soon — 3D visualization will appear here
                </p>
              </div>
            </div>

            {/* File List */}
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Uploaded Files ({project.files.length})
              </h2>
              <div className="space-y-4">
                {project.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 rounded-md border border-zinc-200 dark:border-zinc-800 p-4"
                  >
                    {file.preview && !isVideo(file.type) ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="h-16 w-16 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-900">
                        <svg
                          className="h-8 w-8 text-zinc-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {file.type} • {formatBytes(file.size)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Total size: {formatBytes(totalSize)}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-4">
            <Link
              href="/upload"
              className="block w-full rounded-md bg-foreground px-4 py-3 text-center text-sm font-semibold text-background hover:bg-foreground/90 transition-colors"
            >
              Upload More
            </Link>
            <Link
              href="/"
              className="block w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-center text-sm font-semibold text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
