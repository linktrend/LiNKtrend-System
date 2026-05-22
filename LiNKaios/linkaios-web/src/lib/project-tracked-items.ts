/** Shared row shape for project Workflows and Issues tables. */
export type ProjectTrackedItem = {
  id: string;
  title: string;
  status: string;
  detail?: string | null;
  updatedAt?: string | null;
};

/** Sort: in progress → next up → done (bottom). */
export function sortProjectTrackedItems(items: ProjectTrackedItem[]): ProjectTrackedItem[] {
  return [...items].sort((a, b) => {
    const rankDiff = trackedItemSortRank(a.status) - trackedItemSortRank(b.status);
    if (rankDiff !== 0) return rankDiff;
    const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return bTime - aTime;
  });
}

function trackedItemSortRank(status: string): number {
  const s = status.toLowerCase();
  if (s === "in_progress" || s === "running") return 0;
  if (s === "open" || s === "pending" || s === "watch") return 1;
  return 2;
}

export function countTrackedByRank(items: ProjectTrackedItem[]): {
  inProgress: number;
  next: number;
  done: number;
} {
  let inProgress = 0;
  let next = 0;
  let done = 0;
  for (const item of items) {
    const rank = trackedItemSortRank(item.status);
    if (rank === 0) inProgress += 1;
    else if (rank === 1) next += 1;
    else done += 1;
  }
  return { inProgress, next, done };
}

export function headlineTrackedItem(
  items: ProjectTrackedItem[],
  rank: 0 | 1 | 2,
): ProjectTrackedItem | null {
  const sorted = sortProjectTrackedItems(items);
  return sorted.find((item) => trackedItemSortRank(item.status) === rank) ?? null;
}

export function trackedItemStatusDomain(kind: "workflow" | "issue"): "workflow" | "issue" {
  return kind;
}
