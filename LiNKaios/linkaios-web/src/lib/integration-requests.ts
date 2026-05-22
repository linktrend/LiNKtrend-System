export type IntegrationRequestStatus = "submitted" | "under_review" | "planned" | "declined";

export type IntegrationRequestRow = {
  id: string;
  softwareName: string;
  useCase: string;
  priority: "low" | "normal" | "high";
  status: IntegrationRequestStatus;
  submittedAt: string;
};

export type SupportedIntegrationRow = {
  id: string;
  name: string;
  category: string;
  status: "available" | "beta";
};

export const SUPPORTED_INTEGRATIONS: SupportedIntegrationRow[] = [
  { id: "chatwoot", name: "Chatwoot", category: "CRM", status: "available" },
  { id: "plane", name: "Plane", category: "Projects", status: "available" },
  { id: "n8n", name: "n8n", category: "Automation", status: "available" },
  { id: "postmark", name: "Postmark", category: "Email", status: "available" },
  { id: "zulip", name: "Zulip", category: "Messaging", status: "beta" },
  { id: "digitalocean", name: "DigitalOcean", category: "Infrastructure", status: "available" },
];

const STORAGE_KEY = "linkaios-integration-requests-v1";
export const EVENT_INTEGRATION_REQUESTS_CHANGED = "linkaios-integration-requests-changed";

export function readIntegrationRequests(): IntegrationRequestRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as IntegrationRequestRow[];
  } catch {
    return [];
  }
}

export function writeIntegrationRequests(rows: IntegrationRequestRow[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event(EVENT_INTEGRATION_REQUESTS_CHANGED));
}

export function submitIntegrationRequest(input: {
  softwareName: string;
  useCase: string;
  priority: IntegrationRequestRow["priority"];
}): IntegrationRequestRow {
  const row: IntegrationRequestRow = {
    id: `int_${Date.now()}`,
    softwareName: input.softwareName.trim(),
    useCase: input.useCase.trim(),
    priority: input.priority,
    status: "submitted",
    submittedAt: new Date().toISOString(),
  };
  writeIntegrationRequests([row, ...readIntegrationRequests()]);
  return row;
}

export function integrationSummaryLines(rows: IntegrationRequestRow[]): { requests: string; supported: string } {
  const open = rows.filter((r) => r.status === "submitted" || r.status === "under_review").length;
  return {
    requests: open > 0 ? `${open} open request${open === 1 ? "" : "s"}` : "No open requests",
    supported: `${SUPPORTED_INTEGRATIONS.length} capabilities available`,
  };
}
