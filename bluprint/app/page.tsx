import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import Card from "@/components/Card";
import { buttonClasses } from "@/components/Button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-slate-900">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-slate-200/60">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_55%),radial-gradient(circle_at_top_right,rgba(14,116,144,0.12),transparent_50%)]" />
          <Container className="relative py-16 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Your goals, blueprinted.
                </span>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  BluPrint
                </h1>
                <p className="mt-3 text-2xl font-medium text-slate-800">
                  Design your room with intent.
                </p>
                <p className="mt-3 text-lg text-slate-600">
                  Upload photos and visualize furniture placement in a clean,
                  guided workspace.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href="/upload"
                    className={buttonClasses("primary", "md")}
                  >
                    Start a Room
                  </Link>
                  <Link
                    href="/signin"
                    className={buttonClasses("secondary", "md")}
                  >
                    Sign in
                  </Link>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    No install needed
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Works on desktop and mobile
                  </div>
                </div>
              </div>
              <Card className="p-6 shadow-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Project
                    </p>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Bedroom Project
                    </h3>
                    <p className="text-xs text-slate-500">Updated just now</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Synced
                  </span>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <p className="font-medium text-slate-700">Uploads</p>
                      <p className="text-xs text-slate-500">4 files</p>
                    </div>
                    <div className="mt-3 space-y-3 text-xs text-slate-600">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Room-panorama.jpg</span>
                          <span>42%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-200">
                          <div className="h-1.5 w-[42%] rounded-full bg-blue-600" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Corner-angle.png</span>
                          <span>Done</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-200">
                          <div className="h-1.5 w-full rounded-full bg-emerald-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5">
                    <p className="text-sm font-semibold text-slate-900">
                      3D Viewer
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Coming soon — room model renders here.
                    </p>
                    <div className="mt-4 h-28 rounded-lg bg-slate-100" />
                  </div>
                </div>
              </Card>
            </div>
          </Container>
        </section>

        <section id="how-it-works" className="py-16 lg:py-24">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold text-slate-900">
                How it works
              </h2>
              <p className="mt-3 text-slate-600">
                A clean, guided flow from upload to visualization.
              </p>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {[
                {
                  title: "Upload",
                  description:
                    "Add photos or video clips of your room from multiple angles.",
                  icon: (
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M8 12l4-4 4 4M12 8v12"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Generate room model",
                  description:
                    "BluPrint assembles a room model (coming soon) to plan layout.",
                  icon: (
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 7l9-4 9 4-9 4-9-4z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 17l9 4 9-4"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 12l9 4 9-4"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Add furniture",
                  description:
                    "Pull pieces in from the extension and test fit in real time.",
                  icon: (
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 9h16v7a2 2 0 01-2 2H6a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 9V6a2 2 0 012-2h4a2 2 0 012 2v3"
                      />
                    </svg>
                  ),
                },
              ].map((step) => (
                <Card key={step.title} className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                    {step.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {step.description}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        <section id="features" className="border-t border-slate-200/70 py-16">
          <Container>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-slate-900">
                  Features built for focus
                </h2>
                <p className="mt-2 text-slate-600">
                  Professional tools, kept intentionally lightweight.
                </p>
              </div>
              <Link href="/upload" className={buttonClasses("secondary", "md")}>
                Start a Room
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Room presets",
                  description: "Save your favorite layouts for quick resets.",
                },
                {
                  title: "Furniture import",
                  description: "Bring pieces in from the browser extension.",
                },
                {
                  title: "Smart placement",
                  description: "Chat-assisted layout suggestions (future).",
                },
                {
                  title: "Share/export",
                  description: "Send boards to collaborators or export renders.",
                },
              ].map((feature) => (
                <Card key={feature.title} className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
