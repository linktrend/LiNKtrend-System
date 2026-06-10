import { loadEnv } from "@linktrend/shared-config";
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

const SUPPORT_TICKET_SELECT =
  "id, licensee_id, company_id, brand_id, subject, description, page_path, status, priority, source, requested_by, created_at, updated_at, external_ref, ai_attempt_summary";

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

function supportTicketsQuery(supabase: SupabaseClient) {
  return supabase.schema("linkaios").from("support_tickets");
}

/**
 * Load support tickets from linkaios.support_tickets when migration 038 is applied.
 * Returns shadow mode with an empty list when the table is not yet available.
 */
async function querySupportTickets(
  supabase: SupabaseClient,
  opts?: { licenseeId?: string; openOnly?: boolean },
) {
  let query = supportTicketsQuery(supabase)
    .select(SUPPORT_TICKET_SELECT)
    .order("created_at", { ascending: false })
    .limit(500);

  if (opts?.licenseeId) {
    query = query.eq("licensee_id", opts.licenseeId);
  }
  if (opts?.openOnly) {
    query = query.neq("status", "resolved");
  }

  return query;
}

export async function loadSupportTicketsFromDb(
  supabase: SupabaseClient,
  opts?: { licenseeId?: string; openOnly?: boolean },
): Promise<SupportTicketsLoadResult> {
  const { data, error } = await querySupportTickets(supabase, opts);

  if (error) {
    if (isMissingSupportTicketsTableError(error.message, error.code)) {
      return {
        tickets: [],
        mode: "shadow",
        tableReady: false,
        loadError: null,
        chatwootSyncReady: false,
        chatwootSyncError: null,
      };
    }
    return {
      tickets: [],
      mode: "shadow",
      tableReady: false,
      loadError: error.message,
      chatwootSyncReady: false,
      chatwootSyncError: null,
    };
  }

  const env = loadEnv();
  const { resolveChatwootSupportSyncState, syncChatwootConversationsToDb } = await import(
    "@/lib/chatwoot-support-sync"
  );
  const chatwootState = await resolveChatwootSupportSyncState(env);
  if (chatwootState.ready) {
    const syncResult = await syncChatwootConversationsToDb(supabase, env);
    if (syncResult.error) {
      return {
        tickets: (data ?? []).map((row) => mapSupportTicketRow(row as SupportTicketRow)),
        mode: "live",
        tableReady: true,
        loadError: null,
        chatwootSyncReady: false,
        chatwootSyncError: syncResult.error,
      };
    }

    const { data: syncedData, error: syncedError } = await querySupportTickets(supabase, opts);
    if (syncedError) {
      return {
        tickets: (data ?? []).map((row) => mapSupportTicketRow(row as SupportTicketRow)),
        mode: "live",
        tableReady: true,
        loadError: null,
        chatwootSyncReady: true,
        chatwootSyncError: syncedError.message,
      };
    }

    return {
      tickets: (syncedData ?? []).map((row) => mapSupportTicketRow(row as SupportTicketRow)),
      mode: "live",
      tableReady: true,
      loadError: null,
      chatwootSyncReady: true,
      chatwootSyncError: null,
    };
  }

  const tickets = (data ?? []).map((row) => mapSupportTicketRow(row as SupportTicketRow));
  return {
    tickets,
    mode: "live",
    tableReady: true,
    loadError: null,
    chatwootSyncReady: false,
    chatwootSyncError: chatwootState.error,
  };
}

/** Probe whether migration 038 has been applied. */
export async function probeSupportTicketsTable(supabase: SupabaseClient): Promise<boolean> {
  const { error } = await supportTicketsQuery(supabase).select("id").limit(1);
  if (!error) return true;
  if (isMissingSupportTicketsTableError(error.message, error.code)) return false;
  return false;
}

/** Insert a support ticket row; returns null when the table is missing. */
export async function insertSupportTicketInDb(
  supabase: SupabaseClient,
  input: SupportTicketCreateInput,
): Promise<{ ticket: SupportTicket | null; tableReady: boolean; error: string | null }> {
  const now = new Date().toISOString();
  const { data, error } = await supportTicketsQuery(supabase)
    .insert({
      tenant_id: input.tenantId ?? null,
      licensee_id: input.licenseeId,
      company_id: input.companyId ?? null,
      brand_id: input.brandId ?? null,
      subject: input.subject.trim(),
      description: input.description.trim(),
      page_path: input.pagePath,
      status: "open",
      priority: input.priority ?? "normal",
      source: input.source ?? "manual",
      requested_by: input.requestedBy?.trim() || "Licensee user",
      external_ref: input.externalRef ?? null,
      ai_attempt_summary: input.aiAttemptSummary ?? null,
      created_at: now,
      updated_at: now,
    })
    .select(SUPPORT_TICKET_SELECT)
    .single();

  if (error) {
    if (isMissingSupportTicketsTableError(error.message, error.code)) {
      return { ticket: null, tableReady: false, error: null };
    }
    return { ticket: null, tableReady: true, error: error.message };
  }

  return {
    ticket: mapSupportTicketRow(data as SupportTicketRow),
    tableReady: true,
    error: null,
  };
}

/** Update ticket status; returns null when the table is missing or row not found. */
export async function updateSupportTicketStatusInDb(
  supabase: SupabaseClient,
  id: string,
  status: SupportTicketStatus,
): Promise<{ ticket: SupportTicket | null; tableReady: boolean; error: string | null }> {
  const { data, error } = await supportTicketsQuery(supabase)
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(SUPPORT_TICKET_SELECT)
    .maybeSingle();

  if (error) {
    if (isMissingSupportTicketsTableError(error.message, error.code)) {
      return { ticket: null, tableReady: false, error: null };
    }
    return { ticket: null, tableReady: true, error: error.message };
  }

  if (!data) {
    return { ticket: null, tableReady: true, error: "Ticket not found." };
  }

  return {
    ticket: mapSupportTicketRow(data as SupportTicketRow),
    tableReady: true,
    error: null,
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
