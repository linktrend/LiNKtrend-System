/**
 * LEXOS Litigation Module Manifest
 *
 * This module provides legal case management with evidence-based assertion tracking
 * for litigation matters. It implements the W0-W11 legal cognition workflow.
 *
 * @module modules/lexos/litigation
 * @see {@link ../../../dev-swarm/command-center/LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md}
 */

import type { ModuleManifest } from "../../module-registry";

export const LEXOS_LITIGATION_MODULE_ID = "lexos_litigation";
export const LEXOS_LITIGATION_VERSION = "1.0.0-mvo";

/**
 * LEXOS Litigation workflow stages (W0-W11)
 */
export const LEXOS_WORKFLOW_STAGES = [
  "W0", // Client Onboarding
  "W1", // Client Master Record
  "W2", // Case-Client Story
  "W3", // Opposing File Reconciliation
  "W4", // Evidence Intake
  "W5", // Support Matrix
  "W6", // Strategy
  "W7", // Legal Research
  "W8", // Argument Drafting
  "W9", // Adversarial Review
  "W10", // Visual Exhibits
  "W11", // Output Refinement
] as const;

export type LexosWorkflowStage = (typeof LEXOS_WORKFLOW_STAGES)[number];

/**
 * Display names for workflow stages
 */
export const LEXOS_STAGE_DISPLAY_NAMES: Record<LexosWorkflowStage, string> = {
  W0: "Client Onboarding",
  W1: "Client Master Record",
  W2: "Case-Client Story",
  W3: "Opposing File Reconciliation",
  W4: "Evidence Intake",
  W5: "Support Matrix",
  W6: "Strategy",
  W7: "Legal Research",
  W8: "Argument Drafting",
  W9: "Adversarial Review",
  W10: "Visual Exhibits",
  W11: "Output Refinement",
};

/**
 * Work request types supported by LEXOS Litigation
 */
export const LEXOS_WORK_REQUEST_TYPES = [
  "lexos.intake.new",
  "lexos.matter.create",
  "lexos.story.develop",
  "lexos.evidence.ingest",
  "lexos.assertions.extract",
  "lexos.support.map",
  "lexos.strategy.develop",
  "lexos.research.conduct",
  "lexos.argument.draft",
  "lexos.adversarial.review",
  "lexos.output.generate",
] as const;

export type LexosWorkRequestType = (typeof LEXOS_WORK_REQUEST_TYPES)[number];

/**
 * Role IDs used by LEXOS Litigation
 */
export const LEXOS_ROLE_IDS = [
  "lexos_intake_agent",
  "lexos_custodian_agent",
  "lexos_story_architect",
  "lexos_evidence_archivist",
  "lexos_analyst",
  "lexos_strategist",
  "lexos_librarian",
  "lexos_advocate",
  "lexos_adversary",
  "lexos_rhetorician",
] as const;

export type LexosRoleId = (typeof LEXOS_ROLE_IDS)[number];

/**
 * Required capability connectors for LEXOS Litigation
 */
export const LEXOS_REQUIRED_CAPABILITIES = [
  "cap.storage.supabase",
  "cap.storage.evidence",
  "cap.extraction.parser",
  "cap.extraction.ocr",
  "cap.extraction.qa",
  "cap.research.legal",
  "cap.research.public_web",
  "cap.llm.generation",
  "cap.crm.mock",
  "cap.plane.mock",
] as const;

export type LexosCapabilityId = (typeof LEXOS_REQUIRED_CAPABILITIES)[number];

/**
 * LiNKautowork workflow handles used by LEXOS
 */
export const LEXOS_WORKFLOW_HANDLES = [
  "autowork.lexos.evidence_ingest",
  "autowork.lexos.extraction_run",
  "autowork.lexos.assertion_sync",
  "autowork.lexos.artifact_generate",
  "autowork.lexos.crm_sync",
] as const;

export type LexosWorkflowHandle = (typeof LEXOS_WORKFLOW_HANDLES)[number];

/**
 * UI panel routes for LEXOS Litigation workspaces
 */
export const LEXOS_UI_PANELS = {
  // Matter workspace panels
  matterOverview: "/matters/[matterId]/overview",
  storyWorkspace: "/matters/[matterId]/story",
  evidenceWorkspace: "/matters/[matterId]/evidence",
  assertionsWorkspace: "/matters/[matterId]/assertions",
  supportWorkspace: "/matters/[matterId]/support",
  strategyWorkspace: "/matters/[matterId]/strategy",
  researchWorkspace: "/matters/[matterId]/research",
  argumentWorkspace: "/matters/[matterId]/argument",
  adversarialWorkspace: "/matters/[matterId]/adversarial",
  outputWorkspace: "/matters/[matterId]/output",
  risksWorkspace: "/matters/[matterId]/risks",

  // Intake panels
  intakeList: "/intake",
  intakeWorkspace: "/intake/[intakeId]",

  // Client panels
  clientsList: "/clients",
  clientDetail: "/clients/[clientId]",
} as const;

/**
 * LEXOS Litigation module manifest
 */
export const LexosLitigationManifest: ModuleManifest = {
  moduleId: LEXOS_LITIGATION_MODULE_ID,
  version: LEXOS_LITIGATION_VERSION,
  displayName: "LEXOS Litigation",
  description:
    "Legal case management with evidence-based assertion tracking for litigation matters",
  status: "active_discovery",

  // Work request types this module handles
  workRequestTypes: [...LEXOS_WORK_REQUEST_TYPES],

  // Workflow stages
  workflowStages: [...LEXOS_WORKFLOW_STAGES],

  // Required roles
  requiredRoles: [...LEXOS_ROLE_IDS],

  // Required capability connectors
  requiredCapabilities: [...LEXOS_REQUIRED_CAPABILITIES],

  // Required workflow handles
  requiredWorkflowHandles: [...LEXOS_WORKFLOW_HANDLES],

  // UI panels provided
  uiPanels: Object.keys(LEXOS_UI_PANELS),

  // MVO mode restrictions
  supportedModes: ["development"],
  defaultMode: "development",

  // External source repo reference
  externalRepo: "/Users/linktrend/Projects/LiNKtrend-LEXOS",

  // Dependencies on other modules (none for MVO)
  dependencies: [],

  // Plane project/task expectations
  planeExpectations: {
    projectTemplate: "lexos-litigation-matter",
    defaultTaskStates: [
      "intake",
      "story_development",
      "evidence_gathering",
      "assertion_mapping",
      "strategy",
      "research",
      "argument_drafting",
      "adversarial_review",
      "output_generation",
      "completed",
    ],
  },

  // LiNKbrain audit event categories
  auditEventCategories: [
    "intake",
    "conflict",
    "client",
    "story",
    "assertions",
    "evidence",
    "extraction",
    "support",
    "contradictions",
    "strategy",
    "research",
    "argument",
    "critique",
    "output",
  ],

  // Schema references (to be implemented in WP-094, WP-095, WP-096)
  schemaReferences: {
    coreTables: [
      "clients",
      "client_facts",
      "matters",
      "intake_records",
    ],
    evidenceTables: [
      "evidence",
      "evidence_extractions",
      "evidence_originals",
    ],
    assertionTables: [
      "assertions",
      "support_matrix_items",
    ],
    artifactTables: [
      "case_stories",
      "strategy_memos",
      "research_memos",
      "argument_drafts",
      "adversarial_critiques",
      "output_artifacts",
    ],
    workflowTables: [
      "workflow_states",
      "risks",
      "audit_events",
      "tool_model_logs",
    ],
  },
};

/**
 * Get the stage definition for a given workflow stage
 */
export function getStageDefinition(
  stage: LexosWorkflowStage
): {
  stage: LexosWorkflowStage;
  displayName: string;
  responsiblePlane: "LINKBOT" | "LINKAUTOWORK" | "LINKSKILLS" | "LINKAIOS";
  requiresSideEffects: boolean;
  primaryRole: LexosRoleId | null;
} {
  const stageMap: Record<
    LexosWorkflowStage,
    {
      displayName: string;
      responsiblePlane: "LINKBOT" | "LINKAUTOWORK" | "LINKSKILLS" | "LINKAIOS";
      requiresSideEffects: boolean;
      primaryRole: LexosRoleId | null;
    }
  > = {
    W0: {
      displayName: "Client Onboarding",
      responsiblePlane: "LINKBOT",
      requiresSideEffects: true,
      primaryRole: "lexos_intake_agent",
    },
    W1: {
      displayName: "Client Master Record",
      responsiblePlane: "LINKBOT",
      requiresSideEffects: false,
      primaryRole: "lexos_custodian_agent",
    },
    W2: {
      displayName: "Case-Client Story",
      responsiblePlane: "LINKBOT",
      requiresSideEffects: false,
      primaryRole: "lexos_story_architect",
    },
    W3: {
      displayName: "Opposing File Reconciliation",
      responsiblePlane: "LINKBOT",
      requiresSideEffects: false,
      primaryRole: null, // Defense-side only
    },
    W4: {
      displayName: "Evidence Intake",
      responsiblePlane: "LINKAUTOWORK",
      requiresSideEffects: true,
      primaryRole: "lexos_evidence_archivist",
    },
    W5: {
      displayName: "Support Matrix",
      responsiblePlane: "LINKBOT",
      requiresSideEffects: true,
      primaryRole: "lexos_analyst",
    },
    W6: {
      displayName: "Strategy",
      responsiblePlane: "LINKBOT",
      requiresSideEffects: false,
      primaryRole: "lexos_strategist",
    },
    W7: {
      displayName: "Legal Research",
      responsiblePlane: "LINKBOT",
      requiresSideEffects: false,
      primaryRole: "lexos_librarian",
    },
    W8: {
      displayName: "Argument Drafting",
      responsiblePlane: "LINKBOT",
      requiresSideEffects: false,
      primaryRole: "lexos_advocate",
    },
    W9: {
      displayName: "Adversarial Review",
      responsiblePlane: "LINKBOT",
      requiresSideEffects: false,
      primaryRole: "lexos_adversary",
    },
    W10: {
      displayName: "Visual Exhibits",
      responsiblePlane: "LINKAUTOWORK",
      requiresSideEffects: true,
      primaryRole: null,
    },
    W11: {
      displayName: "Output Refinement",
      responsiblePlane: "LINKBOT",
      requiresSideEffects: false,
      primaryRole: "lexos_rhetorician",
    },
  };

  const def = stageMap[stage];
  return {
    stage,
    ...def,
  };
}

/**
 * Check if a stage requires a capability lease
 */
export function stageRequiresLease(stage: LexosWorkflowStage): boolean {
  const def = getStageDefinition(stage);
  return def.requiresSideEffects;
}

/**
 * Get the primary role for a stage
 */
export function getPrimaryRoleForStage(
  stage: LexosWorkflowStage
): LexosRoleId | null {
  const def = getStageDefinition(stage);
  return def.primaryRole;
}

/**
 * Module manifest export
 */
export default LexosLitigationManifest;
