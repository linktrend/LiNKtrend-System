import Link from "next/link";

const MODULE_CHOICES = [
  {
    moduleName: "LinkSites",
    projectTypes: ["WebsiteFactory MVO", "Managed updates"],
  },
  {
    moduleName: "LiNKapps",
    projectTypes: ["App relaunch", "Feature expansion"],
  },
  {
    moduleName: "LEXOS Litigation",
    projectTypes: ["Matter operations", "Hearing prep"],
  },
];

export default function NewProjectPage() {
  return (
    <main className="space-y-8">
      <header className="border-b border-zinc-200 pb-8 dark:border-zinc-800">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/projects" className="text-zinc-700 underline dark:text-zinc-200">
            Projects
          </Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-900 dark:text-zinc-100">New Project</span>
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">New Project</h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
          Use a governed project type, then start intake. This keeps project setup aligned with vendor workflows while
          preserving client-safe visibility.
        </p>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Start flow
        </h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          <li className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            1. Choose module
          </li>
          <li className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            2. Choose project type
          </li>
          <li className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            3. Start intake and approvals
          </li>
        </ol>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {MODULE_CHOICES.map((entry) => (
          <article
            key={entry.moduleName}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {entry.moduleName}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              {entry.projectTypes.map((typeName) => (
                <li key={typeName} className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/40">
                  {typeName}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
              UI-only surface for WP-228. Backend creation wiring remains backlog-scoped.
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-200">
          Visibility boundaries
        </h2>
        <p className="mt-2 text-sm text-amber-900/90 dark:text-amber-100/90">
          Client users see project lifecycle status, approvals, outputs, and traces. Vendor-only internals such as
          template internals and private workflow recipes stay hidden.
        </p>
      </section>
    </main>
  );
}
