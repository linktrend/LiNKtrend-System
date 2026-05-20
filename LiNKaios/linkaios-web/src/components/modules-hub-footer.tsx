import Link from "next/link";

export function ModulesHubFooter() {
  return (
    <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-zinc-200 pt-6 text-sm dark:border-zinc-800">
      <Link href="/projects" className="font-medium text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-200">
        All projects
      </Link>
      <span className="text-zinc-300 dark:text-zinc-700" aria-hidden>
        ·
      </span>
      <Link
        href="/cockpit/modules"
        className="font-medium text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-200"
      >
        Cockpit — module health
      </Link>
      <span className="text-zinc-300 dark:text-zinc-700" aria-hidden>
        ·
      </span>
      <Link href="/projects/new" className="font-medium text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-200">
        Start project
      </Link>
    </footer>
  );
}
