/**
 * Template Registry Discovery Tests (WP-093)
 *
 * Focused tests for:
 * - Template discovery from static fallback
 * - Template ID validation
 * - LinkBot context building
 * - Dynamic discovery unavailable handling
 */

import { describe, it, expect } from "vitest";
import {
  discoverTemplateRegistry,
  isValidTemplateId,
  getTemplateMetadata,
  buildTemplateContextForLinkBot,
  getDefaultTemplateId,
  createMockRegistry,
  type TemplateRegistryDiscoveryResult,
} from "./template-registry-discovery";
import type { Env } from "@linktrend/shared-config";

/**
 * Create minimal env for testing.
 */
function createTestEnv(overrides: Partial<Env> = {}): Env {
  return {
    NEXT_PUBLIC_SUPABASE_URL: "",
    SUPABASE_SECRET_KEY: "",
    BOT_KERNEL_API_SECRET: "",
    ...overrides,
  } as Env;
}

describe("template-registry-discovery", () => {
  describe("discoverTemplateRegistry", () => {
    it("returns static registry when no LINKSITES_REGISTRY_PATH configured", async () => {
      const env = createTestEnv();
      const result = await discoverTemplateRegistry(env);

      expect(result.discovery_mode).toBe("static");
      expect(result.available_template_ids).toContain("marketing-smb-v1");
      expect(result.default_template_id).toBe("marketing-smb-v1");
      expect(result.templates["marketing-smb-v1"]).toBeDefined();
    });

    it("returns static registry when LINKSITES_TEMPLATE_DISCOVERY_MODE=static", async () => {
      const env = createTestEnv({
        LINKSITES_TEMPLATE_DISCOVERY_MODE: "static",
      });
      const result = await discoverTemplateRegistry(env);

      expect(result.discovery_mode).toBe("static");
      expect(result.available_template_ids.length).toBeGreaterThan(0);
    });

    it("attempts dynamic discovery when LINKSITES_TEMPLATE_DISCOVERY_MODE=dynamic", async () => {
      // Use a non-existent path to force fallback to static
      const env = createTestEnv({
        LINKSITES_REGISTRY_PATH: "/nonexistent/path",
        LINKSITES_TEMPLATE_DISCOVERY_MODE: "dynamic",
      });
      const result = await discoverTemplateRegistry(env);

      // Should fallback to static when dynamic fails
      expect(result.discovery_mode).toBe("static");
      expect(result.checked_path).toBeDefined();
      expect(result.error).toContain("Dynamic discovery failed");
    });

    it("includes template metadata with required fields", async () => {
      const env = createTestEnv();
      const result = await discoverTemplateRegistry(env);

      const template = result.templates["marketing-smb-v1"];
      expect(template).toBeDefined();
      expect(template.id).toBe("marketing-smb-v1");
      expect(template.name).toBeDefined();
      expect(template.name.length).toBeGreaterThan(0);
    });
  });

  describe("isValidTemplateId", () => {
    it("returns true for valid template ID", () => {
      const registry = createMockRegistry();
      expect(isValidTemplateId("marketing-smb-v1", registry)).toBe(true);
    });

    it("returns false for invalid template ID", () => {
      const registry = createMockRegistry();
      expect(isValidTemplateId("invalid-template", registry)).toBe(false);
    });

    it("returns false for non-string template ID", () => {
      const registry = createMockRegistry();
      expect(isValidTemplateId(null, registry)).toBe(false);
      expect(isValidTemplateId(undefined, registry)).toBe(false);
      expect(isValidTemplateId(123, registry)).toBe(false);
      expect(isValidTemplateId({}, registry)).toBe(false);
    });

    it("returns false for empty string template ID", () => {
      const registry = createMockRegistry();
      expect(isValidTemplateId("", registry)).toBe(false);
    });
  });

  describe("getTemplateMetadata", () => {
    it("returns metadata for existing template", () => {
      const registry = createMockRegistry();
      const metadata = getTemplateMetadata("marketing-smb-v1", registry);

      expect(metadata).not.toBeNull();
      expect(metadata?.id).toBe("marketing-smb-v1");
      expect(metadata?.name).toBe("Marketing SMB v1");
    });

    it("returns null for non-existing template", () => {
      const registry = createMockRegistry();
      const metadata = getTemplateMetadata("nonexistent", registry);

      expect(metadata).toBeNull();
    });
  });

  describe("buildTemplateContextForLinkBot", () => {
    it("includes all required fields for LinkBot reasoning", () => {
      const registry = createMockRegistry();
      const context = buildTemplateContextForLinkBot(registry);

      expect(context.available_template_ids).toEqual(
        registry.available_template_ids,
      );
      expect(context.default_template_id).toBe(registry.default_template_id);
      expect(context.template_metadata).toEqual(registry.templates);
      expect(context.discovery_mode).toBe(registry.discovery_mode);
    });

    it("returns array of available template IDs", () => {
      const registry = createMockRegistry();
      const context = buildTemplateContextForLinkBot(registry);

      expect(Array.isArray(context.available_template_ids)).toBe(true);
      expect(context.available_template_ids.length).toBeGreaterThan(0);
    });

    it("returns record of template metadata", () => {
      const registry = createMockRegistry();
      const context = buildTemplateContextForLinkBot(registry);

      expect(typeof context.template_metadata).toBe("object");
      expect(context.template_metadata).toHaveProperty("marketing-smb-v1");
    });
  });

  describe("getDefaultTemplateId", () => {
    it("returns the default template ID from registry", () => {
      const registry = createMockRegistry();
      const defaultId = getDefaultTemplateId(registry);

      expect(defaultId).toBe("marketing-smb-v1");
    });

    it("returns valid template ID that exists in available templates", () => {
      const registry = createMockRegistry();
      const defaultId = getDefaultTemplateId(registry);

      expect(registry.available_template_ids).toContain(defaultId);
    });
  });

  describe("static registry fallback", () => {
    it("contains marketing-smb-v1 template", async () => {
      const env = createTestEnv();
      const result = await discoverTemplateRegistry(env);

      expect(result.templates["marketing-smb-v1"]).toBeDefined();
      expect(result.templates["marketing-smb-v1"].id).toBe(
        "marketing-smb-v1",
      );
      expect(result.templates["marketing-smb-v1"].name).toBe(
        "Marketing SMB v1",
      );
    });

    it("has marketing-smb-v1 as default", async () => {
      const env = createTestEnv();
      const result = await discoverTemplateRegistry(env);

      expect(result.default_template_id).toBe("marketing-smb-v1");
    });

    it("includes industry tags for marketing-smb-v1", async () => {
      const env = createTestEnv();
      const result = await discoverTemplateRegistry(env);

      const template = result.templates["marketing-smb-v1"];
      expect(template.industry_tags).toBeDefined();
      expect(template.industry_tags).toContain("marketing");
      expect(template.industry_tags).toContain("smb");
    });
  });

  describe("createMockRegistry", () => {
    it("creates registry with default values", () => {
      const registry = createMockRegistry();

      expect(registry.available_template_ids).toHaveLength(2);
      expect(registry.default_template_id).toBe("marketing-smb-v1");
      expect(registry.discovery_mode).toBe("static");
    });

    it("applies overrides correctly", () => {
      const customRegistry: Partial<TemplateRegistryDiscoveryResult> = {
        default_template_id: "custom-template",
        discovery_mode: "dynamic",
      };
      const registry = createMockRegistry(customRegistry);

      expect(registry.default_template_id).toBe("custom-template");
      expect(registry.discovery_mode).toBe("dynamic");
    });
  });

  describe("WP-093 requirements compliance", () => {
    it("surfaces available template IDs for WebsiteBuilderBot", async () => {
      const env = createTestEnv();
      const result = await discoverTemplateRegistry(env);

      // Requirement 1: Discover and surface template slugs
      expect(result.available_template_ids.length).toBeGreaterThan(0);
      expect(result.available_template_ids).toContain("marketing-smb-v1");
    });

    it("provides default template ID", async () => {
      const env = createTestEnv();
      const result = await discoverTemplateRegistry(env);

      // Requirement 2: Feed default template_id to WebsiteBuilderBot
      expect(result.default_template_id).toBeDefined();
      expect(result.available_template_ids).toContain(
        result.default_template_id,
      );
    });

    it("validates template_id against available slugs", () => {
      const registry = createMockRegistry();

      // Requirement 3: Validate WebsiteBuilderBot output template_id
      expect(isValidTemplateId("marketing-smb-v1", registry)).toBe(true);
      expect(isValidTemplateId("invalid-template", registry)).toBe(false);
    });

    it("provides complete template context for LinkBot inputs", () => {
      const registry = createMockRegistry();
      const context = buildTemplateContextForLinkBot(registry);

      // Verify context has all fields needed for reasoning
      expect(context).toHaveProperty("available_template_ids");
      expect(context).toHaveProperty("default_template_id");
      expect(context).toHaveProperty("template_metadata");
      expect(context).toHaveProperty("discovery_mode");
    });
  });
});
