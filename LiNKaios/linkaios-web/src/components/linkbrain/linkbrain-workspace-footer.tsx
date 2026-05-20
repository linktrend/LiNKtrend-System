import Link from "next/link";

import type { LinkbrainOverviewBrain } from "@/lib/linkbrain-data";

/** Cross-links for audit trail, embedding health, and planned memory partitions. */
export function LinkbrainWorkspaceFooter(props: { overviewBrain: LinkbrainOverviewBrain | null }) {
  const ob = props.overviewBrain;

  return (
    <footer className="space-y-3 border-t border-zinc-200 pt-6 text-sm dark:border-zinc-800">
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-zinc-600 dark:text-zinc-400">
        <Link href="/traces" className="font-medium text-sky-800 hover:underline dark:text-sky-300">
          Audit trail (system logs)
        </Link>
        <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>
          ·
        </span>
        <span className="text-zinc-500 dark:text-zinc-500" title="Planned — PM-006">
          Issue memory (planned)
        </span>
        <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>
          ·
        </span>
        <span className="text-zinc-500 dark:text-zinc-500" title="Planned — PM-006">
          Workflow memory (planned)
        </span>
      </div>
      {ob ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Embedding pipeline (review): {ob.chunksWithEmbedding.toLocaleString()} / {ob.chunksTotal.toLocaleString()} chunks
          indexed
          {ob.embedJobsFailed > 0 ? ` · ${ob.embedJobsFailed} failed jobs` : ""}
          {ob.publishedChunksMissingEmbedding > 0
            ? ` · ${ob.publishedChunksMissingEmbedding} published chunks awaiting embeddings`
            : ""}
        </p>
      ) : null}
    </footer>
  );
}
