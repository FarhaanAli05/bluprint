import Link from "next/link";
import Container from "@/components/Container";
import { buttonClasses } from "@/components/Button";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="rounded-md text-lg font-semibold tracking-tight text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            BluPrint
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <Link
              href="/#how-it-works"
              className="rounded-md hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              How it works
            </Link>
            <Link
              href="/#features"
              className="rounded-md hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              Features
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/signin" className={buttonClasses("ghost", "sm")}>
            Sign in
          </Link>
          <Link href="/upload" className={buttonClasses("primary", "sm")}>
            Start a Room
          </Link>
        </div>
      </Container>
    </header>
  );
}
