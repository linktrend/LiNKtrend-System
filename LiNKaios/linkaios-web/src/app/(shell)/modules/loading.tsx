export default function ModulesLoading() {
  return (
    <div className="space-y-4 py-2" aria-busy="true" aria-label="Loading modules">
      <div className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
      <div className="h-10 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
      <div className="grid gap-4 lg:grid-cols-[20rem,1fr]">
        <div className="h-64 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
        <div className="h-96 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
      </div>
    </div>
  );
}
