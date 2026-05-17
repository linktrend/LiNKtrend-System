export interface IntegrationCapturedEnvelope {
  event_id: string;
  ts: string;
  tenant_id: string;
  plane: string;
  actor: Record<string, unknown>;
  action: string;
  subject: Record<string, unknown>;
  refs: Record<string, unknown>;
  payload: Record<string, unknown>;
  schema_version: string;
}

export const capturedBrainAuditEvents: IntegrationCapturedEnvelope[] = [];

export function resetCapturedBrainAuditEvents(): void {
  capturedBrainAuditEvents.length = 0;
}
