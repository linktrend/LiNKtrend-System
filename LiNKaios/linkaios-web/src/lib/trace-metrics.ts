/** Extract token count from common trace payload shapes. */
export function tokensFromPayload(p: Record<string, unknown>): number {
  const pickFrom = (obj: Record<string, unknown>, k: string) => {
    const v = obj[k];
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  };
  const fromObject = (obj: Record<string, unknown>): number | null => {
    const total = pickFrom(obj, "total_tokens") ?? pickFrom(obj, "token_count") ?? pickFrom(obj, "tokens");
    if (total != null) return total;
    const inp = pickFrom(obj, "input_tokens");
    const out = pickFrom(obj, "output_tokens");
    if (inp != null && out != null) return inp + out;
    if (inp != null) return inp;
    if (out != null) return out;
    return null;
  };

  const top = fromObject(p);
  if (top != null) return top;

  const usage = p.usage;
  if (usage && typeof usage === "object" && !Array.isArray(usage)) {
    const nested = fromObject(usage as Record<string, unknown>);
    if (nested != null) return nested;
  }

  return 0;
}

export function costFromPayload(p: Record<string, unknown>): number {
  const c = p.cost_usd;
  return typeof c === "number" && Number.isFinite(c) ? c : 0;
}

export function modelFromPayload(p: Record<string, unknown>): string | null {
  const pick = (k: string) => {
    const v = p[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
    return null;
  };
  return pick("model") ?? pick("model_id") ?? pick("deployment") ?? pick("engine") ?? pick("model_name");
}

/**
 * Coarse observability bucket from event_type for dashboard mix charts.
 */
export function observabilityCategory(eventType: string): string {
  const t = eventType.toLowerCase();
  if (t.includes("error") || t.includes("fail") || t.includes("denied") || t.includes("blocked")) return "error";
  if (
    t.includes("llm") ||
    t.includes("completion") ||
    t.includes("chat.completion") ||
    t.includes("inference") ||
    t.includes("openai") ||
    t.includes("anthropic")
  )
    return "llm";
  if (t.includes("tool") || t.includes("mcp") || t.includes("invoke") || t.includes("function_call")) return "tool";
  if (t.includes("memory")) return "memory";
  if (t.includes("gateway") || t.includes("zulip") || t.includes("slack") || t.includes("message")) return "gateway";
  return "other";
}
