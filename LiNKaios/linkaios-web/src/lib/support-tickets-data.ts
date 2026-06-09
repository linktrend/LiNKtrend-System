import type { SupabaseClient } from "@supabase/supabase-js";

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

function isMissingTableError(message: string, code?: string): boolean {
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

/**
 * Load support tickets from linkaios.support_tickets when migration 038 is applied.
 * Returns shadow mode with an empty list when the table is not yet available.
 */
export async function loadSupportTicketsFromDb(
  supabase: SupabaseClient,
): Promise<SupportTicketsLoadResult> {
  const { data, error } = await supabase
    .schema("linkaios")
    .from("support_tickets")
    .select(
      "id, licensee_id, company_id, brand_id, subject, description, page_path, status, priority, source, requested_by, created_at, updated_at, external_ref, ai_attempt_summary",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    if (isMissingTableError(error.message, error.code)) {
      return { tickets: [], mode: "shadow", tableReady: false, loadError: null };
    }
    return {
      tickets: [],
      mode: "shadow",
      tableReady: false,
      loadError: error.message,
    };
  }

  const tickets = (data ?? []).map((row) => mapSupportTicketRow(row as SupportTicketRow));
  return {
    tickets,
    mode: "live",
    tableReady: true,
    loadError: null,
  };
}

/** Merge database tickets with browser-submitted tickets (dedupe by id, prefer DB). */
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
