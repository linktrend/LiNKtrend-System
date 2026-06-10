"use client";

import {
  createSupportTicketAction,
  listSupportTicketsAction,
  updateSupportTicketStatusAction,
} from "@/lib/support-tickets-actions";
import { supportTicketIdForWorkAlert } from "@/lib/support-tickets-data";
import type { WorkAlert } from "@/lib/work-alerts";

export { supportTicketIdForWorkAlert } from "@/lib/support-tickets-data";

/**
 * Canonical support backend — Chatwoot fork at `/Users/linktrend/Projects/link-chatwoot`.
 * Governed via LinkSkills `cap.chatwoot.customer_support`. MVO uses local queue until live.
 */
export const SUPPORT_BACKEND_ID = "chatwoot" as const;
export const SUPPORT_BACKEND_LABEL = "Chatwoot";
export const SUPPORT_BACKEND_REPO = "link-chatwoot";
export const SUPPORT_BACKEND_REPO_PATH = "/Users/linktrend/Projects/link-chatwoot";
export const SUPPORT_CAPABILITY_SCOPE = "cap.chatwoot.customer_support";

export type SupportTicketStatus = "open" | "in_progress" | "resolved";
export type SupportTicketPriority = "low" | "normal" | "high";
export type SupportTicketSource = "page_help" | "settings" | "manual" | "chatwoot_sync";

export type SupportTicket = {
  id: string;
  licenseeId: string;
  companyId: string | null;
  brandId: string | null;
  subject: string;
  description: string;
  pagePath: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  source: SupportTicketSource;
  requestedBy: string;
  createdAt: string;
  updatedAt: string;
  /** Placeholder for Chatwoot conversation id when connector is live. */
  externalRef: string | null;
  aiAttemptSummary: string | null;
};

export const SUPPORT_TICKETS_STORAGE_KEY = "linkaios.support-tickets.v1";
export const EVENT_SUPPORT_TICKETS_CHANGED = "linkaios-support-tickets-changed";

let persistenceEnabled = false;
let liveTicketCache: SupportTicket[] = [];

function dispatchChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT_SUPPORT_TICKETS_CHANGED));
}

function readAllLocal(): SupportTicket[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SUPPORT_TICKETS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as SupportTicket[];
  } catch {
    return [];
  }
}

function writeAllLocal(rows: SupportTicket[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SUPPORT_TICKETS_STORAGE_KEY, JSON.stringify(rows));
  dispatchChanged();
}

/** Hydrate client cache from a server render when migration 038 is applied. */
export function hydrateSupportTicketsState(opts: { tableReady: boolean; tickets?: SupportTicket[] }) {
  persistenceEnabled = opts.tableReady;
  if (opts.tableReady) {
    liveTicketCache = opts.tickets ?? [];
  }
}

export function isSupportTicketsPersistenceEnabled(): boolean {
  return persistenceEnabled;
}

export function setLiveSupportTicketsCache(tickets: SupportTicket[]) {
  liveTicketCache = tickets;
}

export function readSupportTickets(): SupportTicket[] {
  return persistenceEnabled ? liveTicketCache : readAllLocal();
}

export function readSupportTicketsForLicensee(licenseeId: string): SupportTicket[] {
  return readSupportTickets().filter((t) => t.licenseeId === licenseeId);
}

export function readOpenSupportTicketsForLicensor(): SupportTicket[] {
  return readSupportTickets().filter((t) => t.status !== "resolved");
}

export async function refreshSupportTicketsFromServer(opts?: {
  licenseeId?: string;
  openOnly?: boolean;
}): Promise<SupportTicket[]> {
  const result = await listSupportTicketsAction(opts);
  if (result.tableReady) {
    persistenceEnabled = true;
    if (opts?.licenseeId) {
      liveTicketCache = result.tickets;
    } else {
      liveTicketCache = result.tickets;
    }
    dispatchChanged();
    return result.tickets;
  }
  persistenceEnabled = false;
  return readAllLocal();
}

function createSupportTicketLocal(input: {
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
}): SupportTicket {
  const now = new Date().toISOString();
  const ticket: SupportTicket = {
    id: `st-${crypto.randomUUID()}`,
    licenseeId: input.licenseeId,
    companyId: input.companyId ?? null,
    brandId: input.brandId ?? null,
    subject: input.subject.trim(),
    description: input.description.trim(),
    pagePath: input.pagePath,
    status: "open",
    priority: input.priority ?? "normal",
    source: input.source ?? "manual",
    requestedBy: input.requestedBy?.trim() || "Licensee user",
    createdAt: now,
    updatedAt: now,
    externalRef: null,
    aiAttemptSummary: input.aiAttemptSummary ?? null,
  };
  writeAllLocal([ticket, ...readAllLocal()]);
  return ticket;
}

/** Create a ticket — persists to AdminDB when migration 038 is applied, else browser session. */
export async function createSupportTicket(input: {
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
}): Promise<SupportTicket> {
  const result = await createSupportTicketAction(input);
  if (result.tableReady && result.ok && result.ticket) {
    persistenceEnabled = true;
    liveTicketCache = [result.ticket, ...liveTicketCache.filter((t) => t.id !== result.ticket!.id)];
    dispatchChanged();
    return result.ticket;
  }
  if (result.tableReady && !result.ok) {
    throw new Error(result.error ?? "Could not create support ticket.");
  }
  return createSupportTicketLocal(input);
}

/** Update ticket status — writes to AdminDB when migration 038 is applied. */
export async function updateSupportTicketStatus(
  id: string,
  status: SupportTicketStatus,
): Promise<SupportTicket | null> {
  const result = await updateSupportTicketStatusAction(id, status);
  if (result.tableReady && result.ok && result.ticket) {
    persistenceEnabled = true;
    liveTicketCache = liveTicketCache.map((t) => (t.id === id ? result.ticket! : t));
    dispatchChanged();
    return result.ticket;
  }
  if (result.tableReady && !result.ok) {
    throw new Error(result.error ?? "Could not update support ticket.");
  }

  let updated: SupportTicket | null = null;
  const next = readAllLocal().map((t) => {
    if (t.id !== id) return t;
    updated = { ...t, status, updatedAt: new Date().toISOString() };
    return updated;
  });
  if (!updated) return null;
  writeAllLocal(next);
  return updated;
}

export function supportTicketToWorkAlert(t: SupportTicket, licenseeName: string): WorkAlert {
  const severity = t.priority === "high" ? "warning" : "info";
  return {
    id: supportTicketIdForWorkAlert(t.id),
    title: `Support · ${t.subject}`,
    severity,
    summary: t.description.slice(0, 160) + (t.description.length > 160 ? "…" : ""),
    detail: `${t.description}\n\nLicensee: ${licenseeName}\nPage: ${t.pagePath}\nRequested by: ${t.requestedBy}\nStatus: ${t.status}${
      t.aiAttemptSummary ? `\n\nAI attempt:\n${t.aiAttemptSummary}` : ""
    }`,
    source: `${SUPPORT_BACKEND_LABEL} queue`,
    createdAt: t.createdAt,
  };
}
