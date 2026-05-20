import type { AgentRecord } from "@linktrend/shared-types";

import type { AgentOperationalUx } from "@/lib/agent-operational-ux";

export type LinkbotFleetStatusLabel = "Inactive" | "Busy" | "Idle" | "Online";

export function linkbotFleetStatusLabel(
  registryStatus: AgentRecord["status"],
  operational: AgentOperationalUx,
): LinkbotFleetStatusLabel {
  if (registryStatus !== "active") return "Inactive";
  if (operational === "working") return "Busy";
  if (operational === "idle") return "Idle";
  return "Online";
}

export function linkbotFleetStatusTone(label: LinkbotFleetStatusLabel): string {
  switch (label) {
    case "Busy":
      return "bg-sky-50 text-sky-900 ring-sky-300 dark:bg-sky-950/40 dark:text-sky-100 dark:ring-sky-800";
    case "Idle":
      return "bg-emerald-50 text-emerald-800 ring-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-100 dark:ring-emerald-800";
    case "Online":
      return "bg-violet-50 text-violet-800 ring-violet-300 dark:bg-violet-950/40 dark:text-violet-100 dark:ring-violet-800";
    case "Inactive":
      return "bg-zinc-100 text-zinc-700 ring-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-600";
  }
}

export function formatFleetHeartbeat(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "Just now";
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
  return new Date(iso).toLocaleString();
}
