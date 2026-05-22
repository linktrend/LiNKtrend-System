export type ExportFormat = "json" | "csv" | "zip";

export type ExportRequestStatus = "queued" | "processing" | "ready" | "expired";

export type ExportRequestRow = {
  id: string;
  requestedAt: string;
  format: ExportFormat;
  status: ExportRequestStatus;
  scopeLabel: string;
  downloadLabel?: string;
};

export type ExportScopeRow = {
  id: string;
  label: string;
  description: string;
  included: boolean;
};

export const DEFAULT_EXPORT_SCOPES: ExportScopeRow[] = [
  {
    id: "profile",
    label: "Operator profile",
    description: "Name, email, locale, and appearance preferences.",
    included: true,
  },
  {
    id: "projects",
    label: "Projects & missions",
    description: "Project metadata, stages, and mission summaries.",
    included: true,
  },
  {
    id: "audit",
    label: "Audit & trace events",
    description: "LiNKbrain event ledger entries tied to your workspace.",
    included: true,
  },
  {
    id: "billing",
    label: "Billing records",
    description: "Invoices, payment method labels, and subscription history.",
    included: true,
  },
  {
    id: "secrets",
    label: "Integration secrets",
    description: "Secret slugs and providers only — values are never exported.",
    included: true,
  },
];

const STORAGE_KEY = "linkaios-data-export-requests-v1";
export const EVENT_DATA_EXPORT_CHANGED = "linkaios-data-export-changed";

export function readExportRequests(): ExportRequestRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ExportRequestRow[];
  } catch {
    return [];
  }
}

export function writeExportRequests(rows: ExportRequestRow[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event(EVENT_DATA_EXPORT_CHANGED));
}

export function queueExportRequest(format: ExportFormat): ExportRequestRow {
  const row: ExportRequestRow = {
    id: `exp_${Date.now()}`,
    requestedAt: new Date().toISOString(),
    format,
    status: "queued",
    scopeLabel: "Full workspace export",
  };
  const next = [row, ...readExportRequests()];
  writeExportRequests(next);
  return row;
}

export function exportSummaryLine(rows: ExportRequestRow[]): string {
  const latest = rows[0];
  if (!latest) return "No exports requested yet";
  const date = latest.requestedAt.replace("T", " ").slice(0, 16);
  return `Last export — ${latest.status} (${date})`;
}
