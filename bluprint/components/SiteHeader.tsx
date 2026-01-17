import Link from "next/link";
import Container from "@/components/Container";
import { buttonClasses } from "@/components/Button";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="rounded-md text-lg font-semibold tracking-tight text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
          >
            BluPrint
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <Link
              href="/dashboard"
              className="rounded-md hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
            >
              My Projects
            </Link>
            <Link
              href="/#how"
              className="rounded-md hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
            >
              How it works
            </Link>
            <Link
              href="/#features"
              className="rounded-md hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
            >
              Features
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/signin" className={buttonClasses("ghost", "sm")}>
            Sign in
          </Link>
          <Link href="/create" className={buttonClasses("primary", "sm")}>
            Start a Room
          </Link>
        </div>
      </Container>
    </header>
  );
}
