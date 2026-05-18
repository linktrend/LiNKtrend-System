/** Best-effort extraction from Zulip webhook / bot JSON (formats vary by integration). */

export function extractZulipMessageId(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  if (typeof o.id === "number" || typeof o.id === "string") return String(o.id);
  const msg = o.message;
  if (msg && typeof msg === "object") {
    const m = msg as Record<string, unknown>;
    if (typeof m.id === "number" || typeof m.id === "string") return String(m.id);
  }
  return null;
}

export function extractZulipStreamId(body: unknown): number | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  if (typeof o.stream_id === "number") return o.stream_id;
  const msg = o.message;
  if (msg && typeof msg === "object") {
    const m = msg as Record<string, unknown>;
    if (typeof m.stream_id === "number") return m.stream_id;
  }
  return null;
}

export function extractZulipTopic(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  if (typeof o.topic === "string") return o.topic;
  const msg = o.message;
  if (msg && typeof msg === "object") {
    const m = msg as Record<string, unknown>;
    if (typeof m.topic === "string") return m.topic;
    const sub = m.subject;
    if (typeof sub === "string") return sub;
  }
  return null;
}
