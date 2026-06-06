/**
 * LiNKdeveloper suite manifest — declaration-only registry entry (LD-17).
 *
 * Runtime implementation and module catalogue JSON live in the external LiNKdeveloper repo.
 *
 * @module suites/linkdeveloper
 * @see {@link ../../../LiNKdeveloper/docs/LINKDEVELOPER_AS_SUITE_MAP.md}
 */

import type { SuiteManifest } from "../suite-registry";

import {
  LINKDEVELOPER_EXTERNAL_REPO,
  LINKDEVELOPER_EXTERNAL_REPO_LOCAL,
  LINKDEVELOPER_IMPLEMENTATION_PACKAGE_REF,
  LINKDEVELOPER_MODULE_CATALOGUE_HOOK,
  LINKDEVELOPER_SUITE_MANIFEST_PATH,
} from "./module-catalogue";

export const LINKDEVELOPER_SUITE_ID = "linkdeveloper";
export const LINKDEVELOPER_VERSION = "1.0.0";

/**
 * Client entitlement — Linktrend studio tenant v1; not general client marketplace.
 * @see LiNKdev/product/reports/linktrend-system/STUDIO_FORWARD_PLAN.md Wave 0.4
 */
export const LINKDEVELOPER_VISIBILITY = "client_entitled" as const;

/** Tenant slugs entitled to subscribe in v1 (studio first). */
export const LINKDEVELOPER_ENTITLED_TENANT_SLUGS = ["linktrend"] as const;

/** Admin may expose cross-tenant support API routes for vendor operators. */
export const LINKDEVELOPER_ADMIN_CROSS_TENANT_SUPPORT = true;

export type LinkDeveloperVisibility = typeof LINKDEVELOPER_VISIBILITY;

/** Ten lifecycle modules (see external manifest for phases and issue templates). */
export const LINKDEVELOPER_WORKFLOW_MODULES = [
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

export const LINKDEVELOPER_WORK_REQUEST_TYPES = [
  "linkdeveloper.product_run.create",
  "linkdeveloper.product_run.start",
  "linkdeveloper.issue.dispatch",
  "linkdeveloper.issue.validate",
  "linkdeveloper.issue.approve",
  "linkdeveloper.issue.create_repair",
  "linkdeveloper.approval.review",
  "linkdeveloper.executor.monitor",
  "linkdeveloper.release_readiness.check",
] as const;

export const LINKDEVELOPER_ROLE_IDS = [
  "suite_orchestrator_linkbot",
  "product_steward_linkbot",
  "market_linkbot",
  "requirements_linkbot",
  "architecture_linkbot",
  "qa_linkbot",
  "security_linkbot",
  "devops_linkbot",
] as const;

export const LINKDEVELOPER_REQUIRED_CAPABILITIES = [
  "cap.plane.execution_tracking",
  "cap.zulip.run_messaging",
  "cap.linkdeveloper.executor_dispatch",
  "cap.linkdeveloper.validation_run",
  "cap.linkdeveloper.artifact_persist",
] as const;

export const LINKDEVELOPER_WORKFLOW_HANDLES = [
  "autowork.linkdeveloper.product_run_bootstrap",
  "autowork.linkdeveloper.issue_dispatch",
  "autowork.linkdeveloper.validation_record",
  "autowork.linkdeveloper.artifact_write",
] as const;

/** Admin UI surfaces per LINKAIOS_ADMIN_INTEGRATION_SPEC.md. */
export const LINKDEVELOPER_UI_PANELS = [
  "linkdeveloper.product_runs",
  "linkdeveloper.work_graph",
  "linkdeveloper.artifacts",
  "linkdeveloper.approvals",
  "linkdeveloper.executor_runs",
  "linkdeveloper.validation_results",
  "linkdeveloper.release_readiness",
] as const;

export type LinkDeveloperExtendedManifest = SuiteManifest & {
  visibility: LinkDeveloperVisibility;
  entitledTenantSlugs: readonly string[];
  adminCrossTenantSupport: boolean;
  implementationPackageRef: string;
  moduleCatalogueManifest: string;
  moduleCatalogueHook: typeof LINKDEVELOPER_MODULE_CATALOGUE_HOOK;
  firstProofTarget: string;
};

/**
 * LiNKdeveloper suite manifest for LiNKtrend-System registry.
 */
export const LinkDeveloperManifest: LinkDeveloperExtendedManifest = {
  suiteId: LINKDEVELOPER_SUITE_ID,
  version: LINKDEVELOPER_VERSION,
  displayName: "LiNKdeveloper Software Development Lifecycle Suite",
  description:
    "Governed software product lifecycle from opportunity intake through launch and continuous improvement. LiNKaios Client (Linktrend v1); Product Steward memory; Suite Orchestrator control.",
  status: "active_discovery",

  visibility: LINKDEVELOPER_VISIBILITY,
  entitledTenantSlugs: [...LINKDEVELOPER_ENTITLED_TENANT_SLUGS],
  adminCrossTenantSupport: LINKDEVELOPER_ADMIN_CROSS_TENANT_SUPPORT,
  implementationPackageRef: LINKDEVELOPER_IMPLEMENTATION_PACKAGE_REF,
  moduleCatalogueManifest: LINKDEVELOPER_SUITE_MANIFEST_PATH,
  moduleCatalogueHook: LINKDEVELOPER_MODULE_CATALOGUE_HOOK,
  firstProofTarget: "linksuitegen",

  workRequestTypes: [...LINKDEVELOPER_WORK_REQUEST_TYPES],
  workflowStages: [...LINKDEVELOPER_WORKFLOW_MODULES],
  requiredRoles: [...LINKDEVELOPER_ROLE_IDS],
  requiredCapabilities: [...LINKDEVELOPER_REQUIRED_CAPABILITIES],
  requiredWorkflowHandles: [...LINKDEVELOPER_WORKFLOW_HANDLES],
  uiPanels: [...LINKDEVELOPER_UI_PANELS],

  supportedModes: ["development"],
  defaultMode: "development",

  externalRepo: LINKDEVELOPER_EXTERNAL_REPO,

  dependencies: [],

  planeExpectations: {
    projectTemplate: "linkdeveloper-product-run",
    defaultTaskStates: [
      "intake",
      "validation",
      "blueprint",
      "architecture",
      "planning",
      "development",
      "continuous_validation",
      "release_readiness",
      "launch",
      "improvement",
      "completed",
    ],
  },

  auditEventCategories: [
    "product_run",
    "issue",
    "validation",
    "approval",
    "executor",
  ],
};

/** Local checkout path for studio operators (not part of SuiteManifest contract). */
export const LINKDEVELOPER_EXTERNAL_REPO_LOCAL_PATH =
  LINKDEVELOPER_EXTERNAL_REPO_LOCAL;

export default LinkDeveloperManifest;
