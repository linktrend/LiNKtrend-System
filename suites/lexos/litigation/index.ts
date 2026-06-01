/**
 * LEXOS Litigation Module
 *
 * Legal case management with evidence-based assertion tracking
 * for litigation matters. Implements the W0-W11 legal cognition workflow.
 *
 * @packageDocumentation
 */

// Manifest
export {
  LEXOS_LITIGATION_MODULE_ID,
  LEXOS_LITIGATION_VERSION,
  LEXOS_WORKFLOW_STAGES,
  LEXOS_WORK_REQUEST_TYPES,
  LEXOS_ROLE_IDS,
  LEXOS_REQUIRED_CAPABILITIES,
  LEXOS_WORKFLOW_HANDLES,
  LEXOS_UI_PANELS,
  LEXOS_STAGE_DISPLAY_NAMES,
  LexosLitigationManifest,
  getStageDefinition,
  stageRequiresLease,
  getPrimaryRoleForStage,
} from "./manifest";

// Type exports
export type {
  LexosWorkflowStage,
  LexosWorkRequestType,
  LexosRoleId,
  LexosCapabilityId,
  LexosWorkflowHandle,
} from "./manifest";

// Module version
export const VERSION = "1.0.0-mvo";
