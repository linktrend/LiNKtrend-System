/** Maps raw mission status to operator-facing labels (Prompt 3). */
export function projectStatusDisplay(status: string): "Draft" | "Active" | "Completed" | "Attention" {
  const s = status.toLowerCase();
  if (s === "draft") return "Draft";
  if (s === "assigned" || s === "running") return "Active";
  if (s === "completed") return "Completed";
  return "Attention";
}
