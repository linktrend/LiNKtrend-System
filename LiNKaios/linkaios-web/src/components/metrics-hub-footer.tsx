import Link from "next/link";

export function MetricsHubFooter() {
  return (
    <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-zinc-200 pt-6 text-sm dark:border-zinc-800">
      <Link href="/projects" className="font-medium text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-200">
        Projects
      </Link>
      <span className="text-zinc-300 dark:text-zinc-700" aria-hidden>
        ·
      </span>
      <Link href="/work" className="font-medium text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-200">
        Work — runs &amp; alerts
      </Link>
      <span className="text-zinc-300 dark:text-zinc-700" aria-hidden>
        ·
      </span>
      <Link href="/suites/my-suites" className="font-medium text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-200">
        Suites
      </Link>
      <span className="text-zinc-300 dark:text-zinc-700" aria-hidden>
        ·
      </span>
      <Link href="/traces" className="font-medium text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-200">
        System logs
      </Link>
    </footer>
  );
}
