import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-foreground hover:text-foreground/80 transition-colors"
          >
            Bluprint
          </Link>
        </div>
      </div>
    </nav>
  );
}
