import type {
  SupportTicket,
  SupportTicketPriority,
  SupportTicketSource,
  SupportTicketStatus,
} from "@/lib/support-tickets";

export type SupportTicketsQueueMode = "shadow" | "live";

export type SupportTicketsLoadResult = {
  tickets: SupportTicket[];
  mode: SupportTicketsQueueMode;
  tableReady: boolean;
  loadError: string | null;
  chatwootSyncReady: boolean;
  chatwootSyncError: string | null;
};

export type SupportTicketCreateInput = {
  licenseeId: string;
  companyId?: string | null;
  brandId?: string | null;
  subject: string;
  description: string;
  pagePath: string;
  requestedBy?: string;
  source?: SupportTicketSource;
  priority?: SupportTicketPriority;
  aiAttemptSummary?: string | null;
  tenantId?: string | null;
  externalRef?: string | null;
};

type SupportTicketRow = {
  id: string;
  licensee_id: string;
  company_id: string | null;
  brand_id: string | null;
  subject: string;
  description: string;
  page_path: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  source: SupportTicketSource;
  requested_by: string;
  created_at: string;
  updated_at: string;
  external_ref: string | null;
  ai_attempt_summary: string | null;
};

export function isMissingSupportTicketsTableError(message: string, code?: string): boolean {
  const lower = message.toLowerCase();
  return (
    code === "42P01" ||
    code === "PGRST205" ||
    lower.includes("support_tickets") ||
    lower.includes("does not exist") ||
    lower.includes("could not find the table")
  );
}

/** Map a database row to the shared SupportTicket shape. */
export function mapSupportTicketRow(row: SupportTicketRow): SupportTicket {
  return {
    id: String(row.id),
    licenseeId: row.licensee_id,
    companyId: row.company_id,
    brandId: row.brand_id,
    subject: row.subject,
    description: row.description,
    pagePath: row.page_path,
    status: row.status,
    priority: row.priority,
    source: row.source,
    requestedBy: row.requested_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    externalRef: row.external_ref,
    aiAttemptSummary: row.ai_attempt_summary,
  };
}

export function supportTicketIdForWorkAlert(ticketId: string): string {
  return ticketId.startsWith("support-") ? ticketId : `support-${ticketId}`;
}

/** Merge database tickets with browser-submitted tickets (dedupe by id, prefer DB). Shadow mode only. */
export function mergeSupportTicketSources(
  dbTickets: SupportTicket[],
  localTickets: SupportTicket[],
): SupportTicket[] {
  const byId = new Map<string, SupportTicket>();
  for (const t of localTickets) byId.set(t.id, t);
  for (const t of dbTickets) byId.set(t.id, t);
  return [...byId.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
