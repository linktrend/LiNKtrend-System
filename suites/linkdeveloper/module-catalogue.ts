/**
 * Module catalogue hook — points LiNKaios Admin at the external LiNKdeveloper manifest.
 *
 * @module suites/linkdeveloper
 */

/** Canonical GitHub URL for the LiNKdeveloper implementation repo. */
export const LINKDEVELOPER_EXTERNAL_REPO =
  "https://github.com/linktrend/LiNKdeveloper";

/** Local checkout path used in studio development. */
export const LINKDEVELOPER_EXTERNAL_REPO_LOCAL =
  "/Users/linktrend/Projects/LiNKdeveloper";

/** Relative path to the loadable suite manifest inside LiNKdeveloper. */
export const LINKDEVELOPER_SUITE_MANIFEST_PATH =
  "manifest/linkdeveloper.suite.json";

/** Relative path to the manifest loader used by LiNKdeveloper CI and orchestrator. */
export const LINKDEVELOPER_MANIFEST_LOADER_PATH = "suite/load-manifest.mjs";

/** Relative path to the Zod schema for manifest validation. */
export const LINKDEVELOPER_MANIFEST_SCHEMA_PATH = "suite/schema.mjs";

/** Implementation package entry document (version and reading order). */
export const LINKDEVELOPER_IMPLEMENTATION_PACKAGE_REF =
  "docs/IMPLEMENTATION_PACKAGE_INDEX.md";

/** Human-readable suite map source. */
export const LINKDEVELOPER_SUITE_MAP_REF = "docs/LINKDEVELOPER_AS_SUITE_MAP.md";

/** Module keys aligned with `manifest/linkdeveloper.suite.json` (LD-16 validated). */
export const LINKDEVELOPER_MODULE_KEYS = [
  "module_01_opportunity_intake",
  "module_02_market_feasibility",
  "module_03_product_blueprint",
  "module_04_architecture_reuse",
  "module_05_implementation_planning",
  "module_06_development_execution",
  "module_07_continuous_validation",
  "module_08_release_readiness",
  "module_09_launch_operations",
  "module_10_continuous_improvement",
] as const;

export type LinkDeveloperModuleKey = (typeof LINKDEVELOPER_MODULE_KEYS)[number];

export type LinkDeveloperModuleCatalogueHook = {
  suiteId: "linkdeveloper";
  visibility: "client_entitled";
  entitledTenantSlugs: readonly string[];
  adminCrossTenantSupport: boolean;
  externalRepo: string;
  externalRepoLocal: string;
  suiteManifestPath: string;
  manifestLoaderPath: string;
  manifestSchemaPath: string;
  implementationPackageRef: string;
  suiteMapRef: string;
  moduleKeys: readonly LinkDeveloperModuleKey[];
  moduleCount: number;
  manifestVersion: string;
};

/** Stable hook object consumed by Admin catalogue fixtures and LD-18 API wiring. */
export const LINKDEVELOPER_MODULE_CATALOGUE_HOOK: LinkDeveloperModuleCatalogueHook =
  {
    suiteId: "linkdeveloper",
    visibility: "client_entitled",
    entitledTenantSlugs: ["linktrend"],
    adminCrossTenantSupport: true,
    externalRepo: LINKDEVELOPER_EXTERNAL_REPO,
    externalRepoLocal: LINKDEVELOPER_EXTERNAL_REPO_LOCAL,
    suiteManifestPath: LINKDEVELOPER_SUITE_MANIFEST_PATH,
    manifestLoaderPath: LINKDEVELOPER_MANIFEST_LOADER_PATH,
    manifestSchemaPath: LINKDEVELOPER_MANIFEST_SCHEMA_PATH,
    implementationPackageRef: LINKDEVELOPER_IMPLEMENTATION_PACKAGE_REF,
    suiteMapRef: LINKDEVELOPER_SUITE_MAP_REF,
    moduleKeys: LINKDEVELOPER_MODULE_KEYS,
    moduleCount: LINKDEVELOPER_MODULE_KEYS.length,
    manifestVersion: "1.0.0",
  };

export type ModuleCatalogueResolveOptions = {
  /** When true (default), prefer the studio local checkout path. */
  preferLocal?: boolean;
};

/**
 * Resolve the filesystem or URL base plus manifest path for the module catalogue.
 */
export function resolveModuleCatalogueManifestRef(
  options: ModuleCatalogueResolveOptions = {},
): { base: string; manifestPath: string; ref: string } {
  const preferLocal = options.preferLocal !== false;
  const base = preferLocal
    ? LINKDEVELOPER_EXTERNAL_REPO_LOCAL
    : LINKDEVELOPER_EXTERNAL_REPO;
  const manifestPath = LINKDEVELOPER_SUITE_MANIFEST_PATH;
  return {
    base,
    manifestPath,
    ref: `${base}/${manifestPath}`,
  };
}
