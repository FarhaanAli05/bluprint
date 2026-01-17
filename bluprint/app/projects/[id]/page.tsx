"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import Card from "@/components/Card";
import { buttonClasses } from "@/components/Button";
import { projectStorage, formatBytes, type Project } from "@/lib/utils";

export default function ProjectPage() {
  const params = useParams();
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
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-slate-900">
              Project not found
            </h1>
            <p className="mt-2 text-slate-600">
              The project you're looking for doesn't exist or has been deleted.
            </p>
            <Link
              href="/"
              className={`mt-4 ${buttonClasses("primary", "sm")}`}
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
    <div className="flex min-h-screen flex-col bg-background text-slate-900">
      <SiteHeader />
      <main className="flex-1 py-10 lg:py-14">
        <Container>
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">
                {roomTypeLabel} Project
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Created {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/upload"
                className={buttonClasses("secondary", "sm")}
              >
                Upload more
              </Link>
              <Link href="/" className={buttonClasses("ghost", "sm")}>
                Back to Home
              </Link>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card className="p-8">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <svg
                    className="h-7 w-7"
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
                </div>
                <h2 className="mt-4 text-xl font-semibold text-slate-900">
                  3D Room Viewer
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Coming soon — your interactive model will appear here.
                </p>
                <div className="mt-6 h-64 rounded-2xl border border-dashed border-slate-300 bg-slate-50" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Uploads
                </h2>
                <p className="text-sm text-slate-500">
                  {project.files.length} file
                  {project.files.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="mt-5 space-y-4">
                {project.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3"
                  >
                    {file.preview && !isVideo(file.type) ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="h-14 w-14 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100">
                        <svg
                          className="h-6 w-6 text-slate-400"
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
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {file.type} • {formatBytes(file.size)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 border-t border-slate-200 pt-4 text-sm text-slate-500">
                Total size: {formatBytes(totalSize)}
              </div>
            </Card>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
