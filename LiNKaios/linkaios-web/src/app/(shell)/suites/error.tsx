"use client";

export default function ModulesError(props: { error: Error; reset: () => void }) {
  return (
    <main>
      <header className="border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Suites</h1>
      </header>
      <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
        <p className="font-semibold">Could not load Suites catalogue.</p>
        <p className="mt-2">{props.error.message}</p>
        <button
          type="button"
          onClick={props.reset}
          className="mt-3 rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-900 hover:bg-red-50"
        >
          Retry
        </button>
      </div>
    </main>
  );
}
