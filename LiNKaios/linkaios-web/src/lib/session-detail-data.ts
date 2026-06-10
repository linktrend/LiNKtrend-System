export type SessionTranscriptEntry = {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  at?: string;
};

export type SessionToolCallEntry = {
  name: string;
  status?: string;
  at?: string;
  detail?: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function parseTranscriptEntries(meta: Record<string, unknown>): SessionTranscriptEntry[] {
  const direct = meta.transcript ?? meta.messages ?? meta.transcript_lines;
  if (Array.isArray(direct)) {
    const parsed: SessionTranscriptEntry[] = [];
    for (const item of direct) {
      const row = asRecord(item);
      if (!row) continue;
      const roleRaw = typeof row.role === "string" ? row.role : typeof row.type === "string" ? row.type : "assistant";
      const role =
        roleRaw === "user" || roleRaw === "assistant" || roleRaw === "system" || roleRaw === "tool"
          ? roleRaw
          : "assistant";
      const content =
        typeof row.content === "string"
          ? row.content
          : typeof row.text === "string"
            ? row.text
            : typeof row.message === "string"
              ? row.message
              : "";
      if (!content.trim()) continue;
      parsed.push({
        role,
        content: content.trim(),
        at: typeof row.at === "string" ? row.at : typeof row.timestamp === "string" ? row.timestamp : undefined,
      });
    }
    if (parsed.length > 0) return parsed;
  }

  if (typeof meta.detail === "string" && meta.detail.trim()) {
    return [{ role: "system", content: meta.detail.trim() }];
  }

  return [];
}

function parseToolCalls(meta: Record<string, unknown>): SessionToolCallEntry[] {
  const direct = meta.tool_calls ?? meta.tools ?? meta.actions;
  if (!Array.isArray(direct)) return [];

  const parsed: SessionToolCallEntry[] = [];
  for (const item of direct) {
    const row = asRecord(item);
    if (!row) continue;
    const name =
      typeof row.name === "string"
        ? row.name
        : typeof row.tool === "string"
          ? row.tool
          : typeof row.tool_name === "string"
            ? row.tool_name
            : null;
    if (!name) continue;
    parsed.push({
      name,
      status: typeof row.status === "string" ? row.status : undefined,
      at: typeof row.at === "string" ? row.at : typeof row.timestamp === "string" ? row.timestamp : undefined,
      detail:
        typeof row.detail === "string"
          ? row.detail
          : typeof row.result === "string"
            ? row.result
            : undefined,
    });
  }
  return parsed;
}

export function sessionDetailFromMetadata(metadata: Record<string, unknown>): {
  transcript: SessionTranscriptEntry[];
  toolCalls: SessionToolCallEntry[];
} {
  const transcript = parseTranscriptEntries(metadata);
  const toolCalls = parseToolCalls(metadata);

  if (toolCalls.length === 0) {
    const count = typeof metadata.tool_call_count === "number" ? metadata.tool_call_count : null;
    if (count != null && count > 0) {
      for (let i = 0; i < Math.min(count, 8); i++) {
        toolCalls.push({ name: `tool_${i + 1}`, status: "recorded" });
      }
    }
  }

  return { transcript, toolCalls };
}
