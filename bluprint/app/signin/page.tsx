import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Authentication coming soon — placeholder page
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                disabled
                className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black px-3 py-2 text-sm text-foreground placeholder-zinc-400 focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                disabled
                className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black px-3 py-2 text-sm text-foreground placeholder-zinc-400 focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>
            <button
              type="button"
              disabled
              className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/90 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>
          </div>
          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-foreground transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
