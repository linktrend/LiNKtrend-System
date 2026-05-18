/**
 * LinkSites Template Registry Discovery (WP-093)
 *
 * Surfaces the LiNKsites template registry to the WebsiteBuilderBot reasoning path.
 * This is connector/discovery work only - does not modify LiNKsites.
 *
 * Discovery modes:
 * - dynamic: Attempts to read from LiNKsites registry.ts at LINKSITES_REGISTRY_PATH
 * - static: Falls back to bundled static registry data (default when dynamic unavailable)
 *
 * Per WP-042 discovery, the LiNKsites registry exports:
 * - getTemplateModule(templateId): TemplateModule
 * - DEFAULT_TEMPLATE_ID: TemplateId
 * - TemplateId: string type alias
 * - TemplateModule: { id, name, PageRenderer }
 */

import { existsSync } from "fs";
import { resolve } from "path";
import type { Env } from "@linktrend/shared-config";

/**
 * Template identifier type matching LiNKsites TemplateId.
 */
export type TemplateId = string;

/**
 * Minimal template metadata for WebsiteBuilderBot reasoning.
 * Mirrors LiNKsites TemplateModule structure without React dependency.
 */
export interface TemplateMetadata {
  id: TemplateId;
  name: string;
  description?: string;
  industry_tags?: string[];
}

/**
 * Template registry discovery result.
 */
export interface TemplateRegistryDiscoveryResult {
  /** Available template IDs for selection */
  available_template_ids: TemplateId[];
  /** Default template ID to use when none specified */
  default_template_id: TemplateId;
  /** Full template metadata map */
  templates: Record<TemplateId, TemplateMetadata>;
  /** Discovery mode used */
  discovery_mode: "dynamic" | "static" | "unavailable";
  /** Path checked for dynamic discovery (if attempted) */
  checked_path?: string;
  /** Error if discovery failed */
  error?: string;
}

export interface LinkBotTemplateContext {
  available_template_ids: TemplateId[];
  default_template_id: TemplateId;
  template_metadata: Record<TemplateId, TemplateMetadata>;
  discovery_mode: TemplateRegistryDiscoveryResult["discovery_mode"];
}

/**
 * Static fallback registry data.
 * Copied from LiNKsites WP-042 discovery.
 * This is the canonical MVO template set when LiNKsites is not accessible.
 */
const STATIC_TEMPLATE_REGISTRY: Record<TemplateId, TemplateMetadata> = {
  "marketing-smb-v1": {
    id: "marketing-smb-v1",
    name: "Marketing SMB v1",
    description:
      "A versatile marketing template for small and medium businesses. " +
      "Includes hero, about, services, testimonials, and contact sections.",
    industry_tags: ["marketing", "smb", "services", "professional"],
  },
};

const DEFAULT_STATIC_TEMPLATE_ID: TemplateId = "marketing-smb-v1";

/**
 * Resolve the LinkSites registry path from environment.
 */
function resolveRegistryPath(env: Env): string | null {
  const configuredPath = env.LINKSITES_REGISTRY_PATH;
  if (!configuredPath) return null;
  try {
    return resolve(configuredPath);
  } catch {
    return null;
  }
}

/**
 * Check if dynamic discovery is enabled via environment.
 */
function isDynamicDiscoveryEnabled(env: Env): boolean {
  const mode = env.LINKSITES_TEMPLATE_DISCOVERY_MODE;
  return !mode || mode === "dynamic";
}

/**
 * Attempt dynamic discovery from LiNKsites registry.ts.
 *
 * This uses a Node.js require/import to load the actual registry module.
 * If the registry cannot be loaded, returns null to trigger static fallback.
 */
async function attemptDynamicDiscovery(
  registryPath: string,
): Promise<TemplateRegistryDiscoveryResult | null> {
  const registryTsPath = resolve(registryPath, "src/templates/registry.ts");
  const registryJsPath = resolve(registryPath, "dist/templates/registry.js");

  // Prefer compiled JS if available (faster, no TS compilation needed)
  const targetPath = existsSync(registryJsPath)
    ? registryJsPath
    : existsSync(registryTsPath)
      ? registryTsPath
      : null;

  if (!targetPath) {
    return null;
  }

  try {
    // Dynamic import of the registry module
    // Use file URL for cross-platform compatibility
    const moduleUrl = new URL(`file://${targetPath}`).href;
    const registryModule = await import(moduleUrl);

    // Extract expected exports per WP-042 discovery
    const getTemplateModule = registryModule.getTemplateModule;
    const defaultTemplateId = registryModule.DEFAULT_TEMPLATE_ID;
    const templates = registryModule.TEMPLATES;

    if (!getTemplateModule || !defaultTemplateId) {
      return null;
    }

    // Build template metadata from discovered registry
    const discoveredTemplates: Record<TemplateId, TemplateMetadata> = {};
    const availableIds: TemplateId[] = [];

    // If TEMPLATES record is exported, use it directly
    if (templates && typeof templates === "object") {
      for (const [id, mod] of Object.entries(templates)) {
        const templateMod = mod as { id?: string; name?: string };
        discoveredTemplates[id] = {
          id,
          name: templateMod.name || id,
        };
        availableIds.push(id);
      }
    }

    // If no templates found via TEMPLATES, use getTemplateModule with default
    if (availableIds.length === 0 && defaultTemplateId) {
      try {
        const defaultMod = getTemplateModule(defaultTemplateId);
        if (defaultMod) {
          discoveredTemplates[defaultTemplateId] = {
            id: defaultTemplateId,
            name: defaultMod.name || defaultTemplateId,
          };
          availableIds.push(defaultTemplateId);
        }
      } catch {
        // Failed to get default template
      }
    }

    if (availableIds.length === 0) {
      return null;
    }

    return {
      available_template_ids: availableIds,
      default_template_id: defaultTemplateId || availableIds[0],
      templates: discoveredTemplates,
      discovery_mode: "dynamic",
      checked_path: targetPath,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Get static fallback registry.
 */
function getStaticRegistry(): TemplateRegistryDiscoveryResult {
  return {
    available_template_ids: Object.keys(STATIC_TEMPLATE_REGISTRY),
    default_template_id: DEFAULT_STATIC_TEMPLATE_ID,
    templates: { ...STATIC_TEMPLATE_REGISTRY },
    discovery_mode: "static",
  };
}

/**
 * Discover available templates from LinkSites registry.
 *
 * Per WP-093 requirements:
 * 1. Implement a local discovery mechanism that surfaces registry.ts template slugs
 * 2. Make available template_ids accessible to WebsiteBuilderBot
 * 3. Validate that WebsiteBuilderBot output template_id matches an existing slug
 *
 * @param env - Environment configuration
 * @returns Discovery result with available templates and metadata
 */
export async function discoverTemplateRegistry(
  env: Env,
): Promise<TemplateRegistryDiscoveryResult> {
  const registryPath = resolveRegistryPath(env);
  const dynamicEnabled = isDynamicDiscoveryEnabled(env);

  // Attempt dynamic discovery if enabled and path configured
  if (dynamicEnabled && registryPath) {
    const dynamicResult = await attemptDynamicDiscovery(registryPath);
    if (dynamicResult) {
      return dynamicResult;
    }
  }

  // Fall back to static registry
  const staticResult = getStaticRegistry();
  return {
    ...staticResult,
    checked_path: registryPath || undefined,
    error:
      dynamicEnabled && registryPath
        ? `Dynamic discovery failed for path: ${registryPath}. Using static fallback.`
        : undefined,
  };
}

/**
 * Validate that a template_id matches an available template slug.
 *
 * @param templateId - The template ID to validate
 * @param registry - The discovered registry result
 * @returns true if valid, false otherwise
 */
export function isValidTemplateId(
  templateId: unknown,
  registry: TemplateRegistryDiscoveryResult,
): boolean {
  if (typeof templateId !== "string") return false;
  return registry.available_template_ids.includes(templateId);
}

/**
 * Get template metadata by ID.
 *
 * @param templateId - The template ID
 * @param registry - The discovered registry result
 * @returns TemplateMetadata or null if not found
 */
export function getTemplateMetadata(
  templateId: TemplateId,
  registry: TemplateRegistryDiscoveryResult,
): TemplateMetadata | null {
  return registry.templates[templateId] || null;
}

/**
 * Build template context for WebsiteBuilderBot reasoning input.
 *
 * Per WP-093, this feeds available template IDs into WebsiteBuilderBot
 * inputs during its reasoning dispatch.
 *
 * @param registry - The discovered registry result
 * @returns Context object suitable for LiNKbot inputs
 */
export function buildTemplateContextForLiNKbot(
  registry: TemplateRegistryDiscoveryResult,
): LinkBotTemplateContext {
  return {
    available_template_ids: registry.available_template_ids,
    default_template_id: registry.default_template_id,
    template_metadata: registry.templates,
    discovery_mode: registry.discovery_mode,
  };
}

/**
 * Get the default template ID.
 *
 * @param registry - The discovered registry result
 * @returns Default template ID
 */
export function getDefaultTemplateId(
  registry: TemplateRegistryDiscoveryResult,
): TemplateId {
  return registry.default_template_id;
}

/**
 * Create a mock registry for testing.
 * Exported for test use only.
 */
export function createMockRegistry(
  overrides?: Partial<TemplateRegistryDiscoveryResult>,
): TemplateRegistryDiscoveryResult {
  return {
    available_template_ids: ["marketing-smb-v1", "test-template"],
    default_template_id: "marketing-smb-v1",
    templates: {
      "marketing-smb-v1": {
        id: "marketing-smb-v1",
        name: "Marketing SMB v1",
        description: "Test marketing template",
      },
      "test-template": {
        id: "test-template",
        name: "Test Template",
        description: "Another test template",
      },
    },
    discovery_mode: "static",
    ...overrides,
  };
}
