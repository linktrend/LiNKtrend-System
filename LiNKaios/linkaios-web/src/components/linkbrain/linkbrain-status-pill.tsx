/** Inbox / lifecycle pills aligned with GLOBAL-001 direction (bold label, darker ring). */
export function LinkbrainStatusPill(props: { label: string; tone?: "pending" | "published" | "draft" }) {
  const tone = props.tone ?? "pending";
  const cls =
    tone === "published"
      ? "bg-emerald-50 text-emerald-900 ring-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-700"
      : tone === "draft"
        ? "bg-zinc-100 text-zinc-800 ring-zinc-400 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-500"
        : "bg-amber-50 text-amber-950 ring-amber-300 dark:bg-amber-950/40 dark:text-amber-100 dark:ring-amber-700";
  return (
    <span className={`inline-flex min-w-[5.5rem] justify-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${cls}`}>
      {props.label}
    </span>
  );
}
