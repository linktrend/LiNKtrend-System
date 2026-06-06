/**
 * LiNKsuitegen suite manifest — Admin-only declaration (STUDIO_FORWARD_PLAN Wave 6.3).
 *
 * Factory runtime lives in the external LiNKsuitegen repo; LiNKaios Admin owns handoff + publish.
 */

import type { SuiteManifest } from "../suite-registry";

export const LINKSUITEGEN_SUITE_ID = "linksuitegen";
export const LINKSUITEGEN_VERSION = "1.0.0";
export const LINKSUITEGEN_EXTERNAL_REPO = "https://github.com/linktrend/LiNKsuitegen";

/** Admin-only — never client marketplace. */
export const LINKSUITEGEN_VISIBILITY = "admin_only" as const;

export const LinkSuitegenManifest: SuiteManifest = {
  suiteId: LINKSUITEGEN_SUITE_ID,
  version: LINKSUITEGEN_VERSION,
  displayName: "LiNKsuitegen",
  description: "Autonomous suite factory — discovery, generation, validation, and Admin handoff.",
  status: "active",
  workRequestTypes: [
    "linksuitegen.discovery.tick",
    "linksuitegen.factory.generate",
    "linksuitegen.handoff.import",
    "linksuitegen.machine_review.run",
    "linksuitegen.publish.candidate",
  ],
  requiredRoles: [
    "suitegen_orchestrator_linkbot",
    "handoff_coordinator_linkbot",
    "discovery_analyst_linkbot",
    "bop_architect_linkbot",
    "validation_qa_linkbot",
  ],
  requiredCapabilities: [
    "cap.llm_council.deliberation",
    "cap.crm.odoo_shadow",
    "cap.stripe.product_management",
  ],
  requiredWorkflowHandles: [
    "autowork.linksuitegen.discovery_collect",
    "autowork.linksuitegen.ranking_persist",
    "autowork.linksuitegen.factory_export",
  ],
  uiPanels: ["admin.linksuitegen"],
  supportedModes: ["shadow", "live"],
  defaultMode: "shadow",
  externalRepo: LINKSUITEGEN_EXTERNAL_REPO,
  dependencies: ["linkskills", "linkbrain", "linkautowork", "linkbot"],
};
