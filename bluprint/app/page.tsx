import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import Card from "@/components/Card";
import { buttonClasses } from "@/components/Button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col text-slate-100">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-white/10 bg-slate-950 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.32),transparent_45%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.28),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(30,41,59,0.9),transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.7),rgba(15,23,42,0.95))]" />
          <Container className="relative py-16 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                  UofTHacks MVP
                </span>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  BluPrint
                </h1>
                <p className="mt-3 text-2xl font-medium text-white">
                  Your goals, blueprinted.
                </p>
                <p className="mt-3 text-lg text-slate-200">
                  Upload your room. Bring furniture in from the web. Preview a
                  layout in minutes.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link href="/create" className={buttonClasses("primary", "md")}>
                    Start a Room
                  </Link>
                  <Link href="/signin" className={buttonClasses("secondary", "md")}>
                    Sign in
                  </Link>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    Fast
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    No GPU server required
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    Works in browser
                  </span>
                </div>
              </div>

              <Card className="p-6 shadow-2xl bg-slate-900/80 border-white/10 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Project
                    </p>
                    <h3 className="text-lg font-semibold text-white">
                      Bedroom Project
                    </h3>
                    <p className="text-xs text-slate-400">Updated just now</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/80">
                      AI
                    </span>
                    <span className="rounded-full border border-blue-400/40 bg-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-100">
                      Synced
                    </span>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <p className="font-medium text-slate-100">Uploads</p>
                      <p className="text-xs text-slate-400">4 files</p>
                    </div>
                    <div className="mt-3 space-y-3 text-xs text-slate-300">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Room-panorama.jpg</span>
                          <span>42%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-800">
                          <div className="h-1.5 w-[42%] rounded-full bg-blue-600" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Corner-angle.png</span>
                          <span>Done</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-800">
                          <div className="h-1.5 w-full rounded-full bg-blue-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-dashed border-slate-600 bg-slate-950/40 p-5">
                    <p className="text-sm font-semibold text-white">
                      3D Viewer
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Coming soon — room model renders here.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">
                        Auto-fit
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">
                        Snap grid
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">
                        Furniture import
                      </span>
                    </div>
                    <div className="mt-4 h-28 rounded-lg bg-slate-900/80" />
                  </div>
                </div>
              </Card>
            </div>
          </Container>
        </section>

        <section id="how" className="py-16 lg:py-24">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold text-white">
                How it works
              </h2>
              <p className="mt-3 text-slate-300">
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-blue-200">
                    {step.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-300">
                    {step.description}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        <section id="features" className="border-t border-white/10 py-16">
          <Container>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-white">
                  Features built for focus
                </h2>
                <p className="mt-2 text-slate-300">
                  Professional tools, kept intentionally lightweight.
                </p>
              </div>
              <Link href="/create" className={buttonClasses("secondary", "md")}>
                Start a Room
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                {
                  title: "Room history",
                  description: "Track revisions and roll back to previous plans.",
                },
                {
                  title: "Collaboration",
                  description: "Invite your team to review and comment.",
                },
              ].map((feature) => (
                <Card key={feature.title} className="p-6">
                  <h3 className="text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-300">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        <section id="demo" className="py-16">
          <Container>
            <Card className="relative overflow-hidden p-10 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_60%)]" />
              <div className="relative">
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-200">
                  Ready to test BluPrint?
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-white">
                  Build your room in minutes
                </h2>
                <p className="mt-3 text-sm text-slate-300">
                  Start with a few photos and see layout possibilities instantly.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                  <Link href="/create" className={buttonClasses("primary", "md")}>
                    Start a Room
                  </Link>
                  <Link href="/signin" className={buttonClasses("secondary", "md")}>
                    Sign in
                  </Link>
                </div>
              </div>
            </Card>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
