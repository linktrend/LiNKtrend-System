export function ProjectsPlaneStrip(props: { workspaceProjectsHref: string | null }) {
  const configured = Boolean(props.workspaceProjectsHref);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50/90 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Plane</p>
        <p className="mt-1 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          {configured ? "Boards and delivery work in Plane." : "Connect Plane to open boards from LiNKaios."}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
        {props.workspaceProjectsHref ? (
          <a
            href={props.workspaceProjectsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Open in Plane ↗
          </a>
        ) : (
          <span className="inline-flex rounded-lg border border-dashed border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-500 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
            Connect Plane to enable
          </span>
        )}
      </div>
    </div>
  );
}
