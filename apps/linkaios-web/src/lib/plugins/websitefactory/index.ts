/**
 * WebsiteFactory Plugin for LiNKaios
 *
 * The first vertical plugin exercising the LiNKaios kernel extension points.
 * Implements the lead-to-preview-site flow per CONTRACTS_MVO.md.
 *
 * Architecture:
 * - Plugin declares manifest with stages, capabilities, workflows, audit events
 * - Plugin implements stage-handler glue that delegates to correct planes
 * - Plugin provides thin preview panel display (no business logic)
 * - Kernel owns: orchestration, approvals, trace, run state
 * - LinkBot owns: reasoning stages
 * - LinkSkills owns: capability leases, side effects
 * - LiNKautowork owns: deterministic workflows
 * - LiNKbrain owns: audit events, memory persistence
 *
 * Per ARCHITECTURE_RULES.md and CONTRACTS_MVO.md §12.2:
 * - Plugin does NOT own approvals, trace, run state, leases, memory, workflows, secrets
 * - Plugin only declares and delegates
 */

// Import from submodules (for internal use and re-export)
import {
  WEBSITE_FACTORY_MANIFEST,
  getWebsiteFactoryManifest,
  getStageDefinition,
  isCapabilityStage,
  isReasoningStage,
  isWorkflowStage,
  mapStageToCapability,
  mapStageToWorkflowHandle,
  mapStageToReasoningKind,
} from "./manifest";

import {
  executeWebsiteFactoryStage,
  stageRequiresApproval,
  getStageRetryConfig,
} from "./stage-handlers";

import {
  buildPreviewPanelView,
  generatePreviewRoute,
  validatePreviewOutput,
  buildIframeSrc,
  getPreviewPanelConfig,
  formatTraceRefsForDisplay,
} from "./preview-panel";

import {
  discoverTemplateRegistry,
  isValidTemplateId,
  getTemplateMetadata,
  buildTemplateContextForLinkBot,
  getDefaultTemplateId,
  createMockRegistry,
} from "./template-registry-discovery";

// Re-export manifest items
export {
  WEBSITE_FACTORY_MANIFEST,
  getWebsiteFactoryManifest,
  getStageDefinition,
  isCapabilityStage,
  isReasoningStage,
  isWorkflowStage,
  mapStageToCapability,
  mapStageToWorkflowHandle,
  mapStageToReasoningKind,
};

// Type re-exports from SDK
export type {
  PluginManifest,
  PluginManifestStage,
} from "@linktrend/linklogic-sdk";

// Re-export stage handlers
export {
  executeWebsiteFactoryStage,
  stageRequiresApproval,
  getStageRetryConfig,
};

export type {
  StageContext,
} from "./stage-handlers";

// Re-export preview panel
export {
  buildPreviewPanelView,
  generatePreviewRoute,
  validatePreviewOutput,
  buildIframeSrc,
  getPreviewPanelConfig,
  formatTraceRefsForDisplay,
};

export type {
  PreviewPanelView,
  PreviewPanelConfig,
} from "./preview-panel";

// Re-export template registry discovery (WP-093)
export {
  discoverTemplateRegistry,
  isValidTemplateId,
  getTemplateMetadata,
  buildTemplateContextForLinkBot,
  getDefaultTemplateId,
  createMockRegistry,
};

export type {
  TemplateId,
  TemplateMetadata,
  TemplateRegistryDiscoveryResult,
} from "./template-registry-discovery";

/**
 * Plugin metadata for kernel registration.
 */
export const PLUGIN_ID = "websitefactory";
export const PLUGIN_VERSION = "0.1.0-mvo";
export const WORK_REQUEST_TYPE = "websitefactory.lead_to_preview";

/**
 * Initialize the WebsiteFactory plugin.
 *
 * Called by kernel at boot to register the plugin manifest.
 * Returns the canonical manifest for validation and storage.
 */
export function initializeWebsiteFactoryPlugin() {
  const manifest = getWebsiteFactoryManifest();

  return {
    plugin_id: PLUGIN_ID,
    version: PLUGIN_VERSION,
    manifest,
    // Extension point handlers
    handlers: {
      executeStage: executeWebsiteFactoryStage,
    },
    // UI surfaces
    ui: {
      panels: ["intake_form", "stage_timeline", "preview_panel"],
      readViews: ["run_detail", "preview_artifact"],
    },
  };
}
