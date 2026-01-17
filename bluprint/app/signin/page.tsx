import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import Card from "@/components/Card";
import Button from "@/components/Button";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-slate-900">
      <SiteHeader />
      <main className="flex-1 py-12 lg:py-16">
        <Container className="flex justify-center">
          <Card className="w-full max-w-md p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                Sign in
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Authentication is coming soon. This is a placeholder UI.
              </p>
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-900"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  disabled
                  className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-900"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  disabled
                  className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>
              <Button type="button" disabled className="w-full">
                Continue
              </Button>
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="rounded-md text-sm text-slate-500 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                Back to home
              </Link>
            </div>
          </Card>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
