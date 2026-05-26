"use client";

import type { WorkAlert } from "@/lib/work-alerts";

export type LinkskillsRequestKind = "skill" | "tool" | "capability";

export type LinkskillsCatalogRequest = {
  id: string;
  kind: LinkskillsRequestKind;
  title: string;
  summary: string;
  detail: string;
  requestedBy: string;
  createdAt: string;
  status: "open" | "resolved";
};

export const LINKSKILLS_REQUESTS_STORAGE_KEY = "linkaios.linkskills-requests.v1";

export function readLinkskillsRequests(): LinkskillsCatalogRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LINKSKILLS_REQUESTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is LinkskillsCatalogRequest => {
      return Boolean(x && typeof x === "object" && typeof (x as LinkskillsCatalogRequest).id === "string");
    });
  } catch {
    return [];
  }
}

export function writeLinkskillsRequests(rows: LinkskillsCatalogRequest[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LINKSKILLS_REQUESTS_STORAGE_KEY, JSON.stringify(rows));
}

export function submitLinkskillsRequest(input: {
  kind: LinkskillsRequestKind;
  title: string;
  summary: string;
  detail: string;
  requestedBy?: string;
}): LinkskillsCatalogRequest {
  const row: LinkskillsCatalogRequest = {
    id: `lsr-${crypto.randomUUID()}`,
    kind: input.kind,
    title: input.title.trim(),
    summary: input.summary.trim(),
    detail: input.detail.trim(),
    requestedBy: input.requestedBy?.trim() || "Licensee user",
    createdAt: new Date().toISOString(),
    status: "open",
  };
  const next = [row, ...readLinkskillsRequests()];
  writeLinkskillsRequests(next);
  window.dispatchEvent(new CustomEvent("linkaios-linkskills-requests-changed"));
  return row;
}

export function linkskillsRequestToWorkAlert(r: LinkskillsCatalogRequest): WorkAlert {
  const kindLabel = r.kind === "capability" ? "Capability" : r.kind === "tool" ? "Tool" : "Skill";
  return {
    id: r.id,
    title: `${kindLabel} request · ${r.title}`,
    severity: "info",
    summary: r.summary,
    detail: `${r.detail}\n\nRequested by: ${r.requestedBy}\nKind: ${kindLabel}`,
    source: "LiNKskills catalogue",
    createdAt: r.createdAt,
  };
}

export const LINKSKILLS_CAPABILITY_CATALOG_STORAGE_KEY = "linkaios.licensor-capability-catalog.v1";

export type RegisteredCapabilityRow = {
  id: string;
  name: string;
  capabilityScope: string;
  status: "implemented" | "declared" | "pending";
  targetSoftware: string;
  usedBy: string;
  repoSlug: string;
  registeredAt: string;
};

export function readRegisteredCapabilities(): RegisteredCapabilityRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LINKSKILLS_CAPABILITY_CATALOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as RegisteredCapabilityRow[]) : [];
  } catch {
    return [];
  }
}

export function registerCapabilityRow(row: RegisteredCapabilityRow) {
  if (typeof window === "undefined") return;
  const existing = readRegisteredCapabilities();
  if (existing.some((r) => r.id === row.id)) return;
  writeRegisteredCapabilities([row, ...existing]);
  window.dispatchEvent(new CustomEvent("linkaios-capability-catalog-changed"));
}

function writeRegisteredCapabilities(rows: RegisteredCapabilityRow[]) {
  window.localStorage.setItem(LINKSKILLS_CAPABILITY_CATALOG_STORAGE_KEY, JSON.stringify(rows));
}

export function archiveRegisteredCapability(id: string) {
  const next = readRegisteredCapabilities().filter((r) => r.id !== id);
  writeRegisteredCapabilities(next);
  window.dispatchEvent(new CustomEvent("linkaios-capability-catalog-changed"));
}
