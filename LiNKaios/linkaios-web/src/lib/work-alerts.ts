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
    title: type.replace(/\./g, " · "),
    severity,
    summary: payloadStr.slice(0, 160) + (payloadStr.length > 160 ? "…" : ""),
    detail: `Event type: ${type}\n\nPayload:\n${payloadStr.slice(0, 4000)}${payloadStr.length > 4000 ? "\n…" : ""}`,
    source: projectId ? `project ${projectId}` : "System logs",
    createdAt: row.created_at,
  };
}
