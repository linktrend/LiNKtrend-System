/** Plain-English labels for operator-facing surfaces (hide config keys and dev jargon). */

export function toOperatorSystemIssueLabel(raw: string): string {
  const text = raw.trim();
  const lower = text.toLowerCase();

  if (lower.includes("openclaw_agent_run_url") || lower.includes("llm api") || lower.includes("llm ingress")) {
    return "AI assistant connection is not set up yet";
  }
  if (lower.includes("tool") && lower.includes("draft")) {
    const match = text.match(/(\d+)\s+tool/i);
    const count = match?.[1] ?? "Some";
    return `${count} tool${count === "1" ? "" : "s"} still need approval before use`;
  }
  if (lower.includes("skill") && lower.includes("draft")) {
    const match = text.match(/(\d+)\s+skill/i);
    const count = match?.[1] ?? "Some";
    return `${count} skill${count === "1" ? "" : "s"} still need approval before use`;
  }
  if (lower.includes("fetch failed") || lower.includes("typeerror")) {
    if (lower.includes("linkbrain") || lower.includes("memory")) {
      return "LiNKbrain memory store is not reachable right now";
    }
    if (lower.includes("connection")) {
      return "Database connection is not working right now";
    }
    if (lower.includes("gateway") || lower.includes("communication")) {
      return "Message gateway is not reachable right now";
    }
    if (lower.includes("runtime") || lower.includes("bot")) {
      return "LiNKbot runtime is not reachable right now";
    }
    return "A background service is not reachable right now";
  }
  if (lower.includes("schema") || lower.includes("pgrst")) {
    return "Database setup is incomplete — required tables or schemas are missing";
  }
  if (lower.includes("timed out")) {
    return "A service health check timed out";
  }

  // Strip "Service — detail" prefix when the detail is already readable.
  const dashParts = text.split(" — ");
  if (dashParts.length >= 2) {
    const tail = dashParts.slice(1).join(" — ");
    if (!tail.includes("_") && tail.length < 120) return tail;
  }

  return text.replace(/OPENCLAW_[A-Z_]+/g, "AI connection setting").replace(/_/g, " ");
}
