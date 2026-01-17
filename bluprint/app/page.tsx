import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Bluprint
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Upload your room → visualize furniture placements in 3D.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/upload"
                className="rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background hover:bg-foreground/90 transition-colors"
              >
                Start a Room
              </Link>
              <Link
                href="/signin"
                className="rounded-md border border-zinc-300 dark:border-zinc-700 px-6 py-3 text-sm font-semibold text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight text-foreground text-center mb-12">
              How it works
            </h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background font-semibold">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Upload photos/videos of your room
                  </h3>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    Capture your space from multiple angles to get the best results.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background font-semibold">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Generate a basic room model (coming soon)
                  </h3>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    AI-powered 3D reconstruction of your room layout.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background font-semibold">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Add furniture from your extension (coming soon)
                  </h3>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    Drag and drop furniture from web stores directly into your 3D room.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
