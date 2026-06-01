/**
 * LinkSites template selection phase helpers (LTS-103).
 * Templates come from LiNKsites external registry — not invented in monorepo.
 */

import type { LinksitesQualificationRecord } from "../qualification/qualification.js";
import {
  discoverLinksitesTemplateRegistry,
  matchTemplateFromRegistry,
  type LinksitesRegistrySnapshot,
  type LinksitesTemplateId,
} from "./linksites-registry.js";

export const LINKSITES_REGISTRY_SOURCE = "linksites_external" as const;

export type TemplateSelectionRecord = {
  run_id: string;
  tenant_id: string;
  template_id: LinksitesTemplateId;
  template_name: string;
  registry_source: typeof LINKSITES_REGISTRY_SOURCE;
  discovery_mode: LinksitesRegistrySnapshot["discovery_mode"];
  selected_at: string;
  audit_event_ref?: string;
};

export type TemplateSelectionInput = {
  tenant_id: string;
  run_id: string;
  industry: string;
  qualification?: Pick<LinksitesQualificationRecord, "business_type" | "industry">;
  registry?: LinksitesRegistrySnapshot;
};

export async function selectTemplateFromRegistry(
  params: TemplateSelectionInput,
): Promise<TemplateSelectionRecord> {
  const registry = params.registry ?? (await discoverLinksitesTemplateRegistry());
  return selectTemplateFromRegistrySnapshot({ ...params, registry });
}

export function selectTemplateFromRegistrySnapshot(
  params: TemplateSelectionInput & { registry: LinksitesRegistrySnapshot },
): TemplateSelectionRecord {
  const industrySignal = params.qualification?.industry ?? params.industry;
  const templateId = matchTemplateFromRegistry({
    registry: params.registry,
    industry: industrySignal,
    business_type: params.qualification?.business_type,
  });
  const templateMeta = params.registry.templates[templateId];

  return {
    tenant_id: params.tenant_id,
    run_id: params.run_id,
    template_id: templateId,
    template_name: templateMeta?.name ?? templateId,
    registry_source: LINKSITES_REGISTRY_SOURCE,
    discovery_mode: params.registry.discovery_mode,
    selected_at: new Date().toISOString(),
  };
}
