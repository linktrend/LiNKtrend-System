export function registryStatusTone(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-100 dark:ring-emerald-900/50";
    case "inactive":
      return "bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-600";
    case "retired":
      return "bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-950/35 dark:text-amber-100 dark:ring-amber-900/40";
    default:
      return "bg-zinc-100 text-zinc-700 ring-zinc-200";
  }
}

export function presenceTone(summary: string) {
  const s = summary.toLowerCase();
  if (s.includes("busy")) return "text-emerald-800 ring-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-100";
  if (s.includes("idle")) return "text-sky-900 ring-sky-200 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-100";
  return "text-zinc-600 ring-zinc-200 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-200";
}
