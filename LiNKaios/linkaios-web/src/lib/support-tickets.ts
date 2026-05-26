"use client";

import type { WorkAlert } from "@/lib/work-alerts";

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
export type SupportTicketSource = "page_help" | "settings" | "manual";

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

function readAll(): SupportTicket[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SUPPORT_TICKETS_STORAGE_KEY);
    if (!raw) return seedDemoTickets();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return seedDemoTickets();
    return parsed as SupportTicket[];
  } catch {
    return seedDemoTickets();
  }
}

function writeAll(rows: SupportTicket[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SUPPORT_TICKETS_STORAGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new CustomEvent(EVENT_SUPPORT_TICKETS_CHANGED));
}

function seedDemoTickets(): SupportTicket[] {
  const now = new Date().toISOString();
  return [
    {
      id: "st-demo-001",
      licenseeId: "xyz-marketing",
      companyId: "xyz-marketing",
      brandId: "xyz-main",
      subject: "LinkSites preview publish stuck",
      description: "Preview site generation completed but publish button stays disabled.",
      pagePath: "/projects",
      status: "open",
      priority: "high",
      source: "page_help",
      requestedBy: "Licensee admin",
      createdAt: now,
      updatedAt: now,
      externalRef: null,
      aiAttemptSummary: "Suggested checking project phase and capability lease — user escalated.",
    },
  ];
}

export function readSupportTickets(): SupportTicket[] {
  return readAll();
}

export function readSupportTicketsForLicensee(licenseeId: string): SupportTicket[] {
  return readAll().filter((t) => t.licenseeId === licenseeId);
}

export function readOpenSupportTicketsForLicensor(): SupportTicket[] {
  return readAll().filter((t) => t.status !== "resolved");
}

export function createSupportTicket(input: {
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
  writeAll([ticket, ...readAll()]);
  return ticket;
}

export function updateSupportTicketStatus(id: string, status: SupportTicketStatus): SupportTicket | null {
  let updated: SupportTicket | null = null;
  const next = readAll().map((t) => {
    if (t.id !== id) return t;
    updated = { ...t, status, updatedAt: new Date().toISOString() };
    return updated;
  });
  if (!updated) return null;
  writeAll(next);
  return updated;
}

export function supportTicketToWorkAlert(t: SupportTicket, licenseeName: string): WorkAlert {
  const severity = t.priority === "high" ? "warning" : "info";
  return {
    id: t.id,
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
