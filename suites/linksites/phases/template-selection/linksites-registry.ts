/**
 * LiNKsites external template registry discovery (LTS-103).
 *
 * Templates are owned by the LiNKsites repo — this module discovers slugs from
 * `apps/web-master/src/templates/registry.ts` when LINKSITES_REGISTRY_PATH is set,
 * otherwise uses a static snapshot synced from LiNKsites WP-042 discovery.
 */

import { existsSync } from "node:fs";
import { resolve } from "node:path";

export type LinksitesTemplateId = string;

export type LinksitesTemplateMetadata = {
  id: LinksitesTemplateId;
  name: string;
  description?: string;
  industry_tags?: string[];
};

export type LinksitesRegistrySnapshot = {
  source: "linksites_external";
  discovery_mode: "dynamic" | "static";
  default_template_id: LinksitesTemplateId;
  templates: Record<LinksitesTemplateId, LinksitesTemplateMetadata>;
  checked_path?: string;
};

/** Static snapshot from LiNKsites WP-042 — not invented in monorepo. */
const STATIC_LINKSITES_REGISTRY: LinksitesRegistrySnapshot = {
  source: "linksites_external",
  discovery_mode: "static",
  default_template_id: "marketing-smb-v1",
  templates: {
    "marketing-smb-v1": {
      id: "marketing-smb-v1",
      name: "Marketing SMB v1",
      description:
        "Versatile marketing template for SMBs — hero, about, services, testimonials, contact.",
      industry_tags: ["marketing", "smb", "services", "professional", "dental", "local_service"],
    },
  },
};

function resolveLinksitesRegistryRoot(): string | null {
  const configured = process.env.LINKSITES_REGISTRY_PATH?.trim();
  if (!configured) return null;
  try {
    return resolve(configured);
  } catch {
    return null;
  }
}

export async function discoverLinksitesTemplateRegistry(): Promise<LinksitesRegistrySnapshot> {
  const root = resolveLinksitesRegistryRoot();
  if (!root) {
    return { ...STATIC_LINKSITES_REGISTRY, templates: { ...STATIC_LINKSITES_REGISTRY.templates } };
  }

  const registryTs = resolve(root, "src/templates/registry.ts");
  const registryJs = resolve(root, "dist/templates/registry.js");
  const target = existsSync(registryJs) ? registryJs : existsSync(registryTs) ? registryTs : null;

  if (!target) {
    return {
      ...STATIC_LINKSITES_REGISTRY,
      templates: { ...STATIC_LINKSITES_REGISTRY.templates },
      checked_path: root,
    };
  }

  try {
    const moduleUrl = new URL(`file://${target}`).href;
    const mod = await import(moduleUrl);
    const defaultId: string = mod.DEFAULT_TEMPLATE_ID ?? "marketing-smb-v1";
    const templates: Record<string, LinksitesTemplateMetadata> = {};

    if (mod.TEMPLATES && typeof mod.TEMPLATES === "object") {
      for (const [id, entry] of Object.entries(mod.TEMPLATES as Record<string, { name?: string }>)) {
        templates[id] = { id, name: entry?.name ?? id };
      }
    }

    if (Object.keys(templates).length === 0 && typeof mod.getTemplateModule === "function") {
      const fallback = mod.getTemplateModule(defaultId);
      if (fallback) {
        templates[defaultId] = { id: defaultId, name: fallback.name ?? defaultId };
      }
    }

    if (Object.keys(templates).length === 0) {
      return {
        ...STATIC_LINKSITES_REGISTRY,
        templates: { ...STATIC_LINKSITES_REGISTRY.templates },
        checked_path: target,
      };
    }

    return {
      source: "linksites_external",
      discovery_mode: "dynamic",
      default_template_id: defaultId,
      templates,
      checked_path: target,
    };
  } catch {
    return {
      ...STATIC_LINKSITES_REGISTRY,
      templates: { ...STATIC_LINKSITES_REGISTRY.templates },
      checked_path: target,
    };
  }
}

export function matchTemplateFromRegistry(params: {
  registry: LinksitesRegistrySnapshot;
  industry: string;
  business_type?: string;
}): LinksitesTemplateId {
  const normalizedIndustry = params.industry.toLowerCase().replace(/\s+/g, "_");
  const entries = Object.values(params.registry.templates);

  for (const template of entries) {
    const tags = (template.industry_tags ?? []).map((t) => t.toLowerCase());
    if (tags.includes(normalizedIndustry)) {
      return template.id;
    }
  }

  if (params.business_type === "local_service") {
    const localMatch = entries.find((t) =>
      (t.industry_tags ?? []).some((tag) => tag.includes("local")),
    );
    if (localMatch) return localMatch.id;
  }

  return params.registry.default_template_id;
}

export function isKnownLinksitesTemplateId(
  templateId: string,
  registry: LinksitesRegistrySnapshot,
): boolean {
  return templateId in registry.templates;
}
