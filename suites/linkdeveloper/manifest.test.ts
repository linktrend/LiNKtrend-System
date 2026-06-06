import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
  LINKDEVELOPER_MODULE_CATALOGUE_HOOK,
  LINKDEVELOPER_MODULE_KEYS,
  resolveModuleCatalogueManifestRef,
} from "./module-catalogue";
import {
  LINKDEVELOPER_ADMIN_CROSS_TENANT_SUPPORT,
  LINKDEVELOPER_ENTITLED_TENANT_SLUGS,
  LINKDEVELOPER_SUITE_ID,
  LINKDEVELOPER_VISIBILITY,
  LinkDeveloperManifest,
} from "./manifest";

const here = dirname(fileURLToPath(import.meta.url));

describe("linkdeveloper suite registry (LD-17 / Wave 0.4)", () => {
  it("registers client_entitled manifest with external repo pointer", () => {
    expect(LinkDeveloperManifest.suiteId).toBe(LINKDEVELOPER_SUITE_ID);
    expect(LinkDeveloperManifest.visibility).toBe(LINKDEVELOPER_VISIBILITY);
    expect(LinkDeveloperManifest.visibility).toBe("client_entitled");
    expect(LinkDeveloperManifest.entitledTenantSlugs).toEqual(["linktrend"]);
    expect(LinkDeveloperManifest.entitledTenantSlugs).toEqual([
      ...LINKDEVELOPER_ENTITLED_TENANT_SLUGS,
    ]);
    expect(LinkDeveloperManifest.adminCrossTenantSupport).toBe(
      LINKDEVELOPER_ADMIN_CROSS_TENANT_SUPPORT,
    );
    expect(LinkDeveloperManifest.externalRepo).toBe(
      "https://github.com/linktrend/LiNKdeveloper",
    );
    expect(LinkDeveloperManifest.implementationPackageRef).toBe(
      "docs/IMPLEMENTATION_PACKAGE_INDEX.md",
    );
    expect(LinkDeveloperManifest.moduleCatalogueManifest).toBe(
      "manifest/linkdeveloper.suite.json",
    );
  });

  it("exposes module catalogue hook with ten modules", () => {
    expect(LINKDEVELOPER_MODULE_CATALOGUE_HOOK.suiteId).toBe("linkdeveloper");
    expect(LINKDEVELOPER_MODULE_CATALOGUE_HOOK.visibility).toBe(
      "client_entitled",
    );
    expect(LINKDEVELOPER_MODULE_CATALOGUE_HOOK.entitledTenantSlugs).toEqual([
      "linktrend",
    ]);
    expect(LINKDEVELOPER_MODULE_CATALOGUE_HOOK.adminCrossTenantSupport).toBe(
      true,
    );
    expect(LINKDEVELOPER_MODULE_KEYS).toHaveLength(10);
    expect(LINKDEVELOPER_MODULE_CATALOGUE_HOOK.moduleCount).toBe(10);
    expect(LinkDeveloperManifest.workflowStages).toHaveLength(10);
  });

  it("resolves local and remote catalogue manifest refs", () => {
    const local = resolveModuleCatalogueManifestRef({ preferLocal: true });
    expect(local.ref).toContain("/Users/linktrend/Projects/LiNKdeveloper/");
    expect(local.ref).toContain("manifest/linkdeveloper.suite.json");

    const remote = resolveModuleCatalogueManifestRef({ preferLocal: false });
    expect(remote.ref).toBe(
      "https://github.com/linktrend/LiNKdeveloper/manifest/linkdeveloper.suite.json",
    );
  });

  it("workflow.md documents ten-module spine and Client Linktrend posture", () => {
    const md = readFileSync(join(here, "workflow.md"), "utf8");
    expect(md).toMatch(/ten-module/i);
    expect(md).toMatch(/Client.*Linktrend/i);
    expect(md).toContain("module_01_opportunity_intake");
    expect(md).toContain("module_10_continuous_improvement");
  });

  it("manifest.yaml declares client_entitled visibility and linktrend slug", () => {
    const yaml = readFileSync(join(here, "manifest.yaml"), "utf8");
    expect(yaml).toContain("visibility: client_entitled");
    expect(yaml).toContain("entitled_tenant_slugs:");
    expect(yaml).toContain("- linktrend");
    expect(yaml).toContain("admin_cross_tenant_support: true");
    expect(yaml).toContain("github.com/linktrend/LiNKdeveloper");
    expect(yaml).toContain(
      "module_catalogue_manifest: manifest/linkdeveloper.suite.json",
    );
  });
});
