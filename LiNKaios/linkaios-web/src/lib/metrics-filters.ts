import { observabilityCategory } from "@/lib/trace-metrics";

export type MetricsActivityCategory = "all" | "llm" | "tool" | "memory" | "gateway" | "error" | "other";

export const METRICS_ACTIVITY_CATEGORY_OPTIONS: { id: MetricsActivityCategory; label: string }[] = [
  { id: "all", label: "All activity" },
  { id: "llm", label: "LLM / completion" },
  { id: "tool", label: "Tool / MCP" },
  { id: "memory", label: "Memory" },
  { id: "gateway", label: "Gateway / comms" },
  { id: "error", label: "Errors" },
  { id: "other", label: "Other" },
];

export function matchesActivityCategory(eventType: string, category: MetricsActivityCategory): boolean {
  if (category === "all") return true;
  return observabilityCategory(eventType) === category;
}
