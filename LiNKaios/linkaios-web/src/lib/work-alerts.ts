export type WorkAlertSeverity = "critical" | "warning" | "info";

export type WorkAlert = {
  id: string;
  title: string;
  severity: WorkAlertSeverity;
  summary: string;
  detail: string;
  source: string;
  createdAt: string;
  /** Set when row originates from `src/lib/ui-mocks/*` fixtures. */
  isFixture?: boolean;
};

/** Action queue surfaces only alerts that need operator attention. */
export function isActionableWorkAlert(alert: WorkAlert): boolean {
  return alert.severity === "critical" || alert.severity === "warning";
}

function humanizeEventType(type: string): string {
  const labels: Record<string, string> = {
    "project.created": "Project launched",
    "project.updated": "Project updated",
    "project.started": "Project started",
    "project.completed": "Project completed",
    "project.failed": "Project failed",
    "openclaw_error": "LiNKbot runtime error",
    "gateway.error": "Gateway error",
    "capability.denied": "Capability denied",
    "approval.required": "Approval required",
  };
  if (labels[type]) return labels[type];

  return type
    .split(/[._]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function payloadRecord(payload: unknown): Record<string, unknown> | null {
  if (payload == null || typeof payload !== "object" || Array.isArray(payload)) return null;
  return payload as Record<string, unknown>;
}

function humanizePayloadSummary(payload: unknown): string {
  const o = payloadRecord(payload);
  if (!o) {
    const s = String(payload ?? "").trim();
    return s.length > 160 ? `${s.slice(0, 159)}…` : s;
  }

  for (const key of ["message", "summary", "error", "reason", "detail", "title", "description"]) {
    const v = o[key];
    if (typeof v === "string" && v.trim()) return v.trim().slice(0, 160);
  }

  const parts: string[] = [];
  if (typeof o.project_title === "string" && o.project_title.trim()) {
    parts.push(o.project_title.trim());
  } else if (typeof o.title === "string" && o.title.trim()) {
    parts.push(o.title.trim());
  }
  if (typeof o.suite_id === "string" && o.suite_id.trim()) {
    parts.push(`Suite ${o.suite_id.trim()}`);
  }
  if (typeof o.agent_name === "string" && o.agent_name.trim()) {
    parts.push(o.agent_name.trim());
  }
  if (parts.length > 0) return parts.join(" · ").slice(0, 160);

  return "System event recorded — open Alerts for full detail.";
}

function humanizeSource(payload: unknown, projectId: string | null): string {
  const o = payloadRecord(payload);
  if (typeof o?.project_title === "string" && o.project_title.trim()) {
    return o.project_title.trim();
  }
  if (projectId) return `Project ${projectId.slice(0, 8)}…`;
  return "System logs";
}

export function traceToWorkAlert(row: {
  id: string;
  event_type: string;
  project_id?: string | null;
  /** @deprecated Use project_id */
  mission_id?: string | null;
  created_at: string;
  payload: unknown;
}): WorkAlert {
  const projectId = row.project_id ?? row.mission_id ?? null;
  const type = row.event_type;
  const isCritical =
    type.includes("openclaw_error") || type.includes("critical") || type.includes("fatal");
  const isError =
    type.includes("error") || type.includes("fail") || type.includes("denied") || type.includes("blocked");
  const severity: WorkAlertSeverity = isCritical ? "critical" : isError ? "warning" : "info";
  const payloadStr =
    typeof row.payload === "object" && row.payload !== null ? JSON.stringify(row.payload, null, 2) : String(row.payload);
  return {
    id: `trace-${row.id}`,
    title: humanizeEventType(type),
    severity,
    summary: humanizePayloadSummary(row.payload),
    detail: `Event type: ${type}\n\nPayload:\n${payloadStr.slice(0, 4000)}${payloadStr.length > 4000 ? "\n…" : ""}`,
    source: humanizeSource(row.payload, projectId),
    createdAt: row.created_at,
  };
}
