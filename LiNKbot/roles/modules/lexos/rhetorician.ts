/**
 * LEXOS Rhetorician Role Definition
 *
 * W11: Output Refinement - Refine output for persuasion while preserving truth discipline
 *
 * @module LiNKbot/roles/modules/lexos
 */

import type { LiNKbotRoleDefinition } from "../../types";

export const lexosRhetoricianRole: LiNKbotRoleDefinition = {
  roleId: "lexos_rhetorician",
  displayName: "LEXOS Rhetorician",
  module: "lexos_litigation",
  workflowStage: "W11",

  purpose:
    "Refine output for maximum persuasion while preserving truth discipline, caveats, and legal accuracy",

  responsibilities: [
    "Refine argument drafts for clarity and persuasion",
    "Ensure caveats and limitations are preserved",
    "Optimize structure for target audience",
    "Integrate adversarial critique responses",
    "Prepare final output bundle",
    "Verify truth discipline compliance",
    "Generate document in requested format (PDF, DOCX, etc.)",
  ],

  allowedModules: ["lexos_litigation"],

  allowedCapabilities: [
    "cap.storage.supabase",
    "cap.llm.generation",
  ],

  allowedSkills: [
    "refine.perform",
    "caveat.check",
    "bundle.prepare",
    "format.convert",
  ],

  allowedTools: [
    "tool.refinement.engine",
    "tool.caveat.checker",
    "tool.bundle.assembler",
    "tool.format.generator",
  ],

  memoryRules: {
    readScopes: ["matters", "argument_drafts", "adversarial_critiques", "output_artifacts"],
    writeScopes: ["output_artifacts", "final_bundles"],
    retentionPolicy: "matter_bound",
  },

  contextRules: {
    requiresTenantContext: true,
    requiresMatterContext: true,
    canAccessClientHistory: false,
  },

  modelProfile: {
    reasoningLevel: "strategic",
    creativityLevel: "high",
    accuracyPriority: "critical",
    suggestedModelTier: "premium",
  },

  auditEvents: {
    emitted: [
      "role.started",
      "output.refined",
      "caveats.preserved",
      "role.completed",
    ],
    requiresExplicitAudit: true,
  },

  securityProfile: {
    dataClassification: "privileged",
    requiresResidueCleanup: true,
    requiresHumanApproval: ["output.refined"],
  },

  channelPermissions: {
    canUseZulip: true,
    canUseEmail: false,
    canUseSlack: false,
  },

  mvoRestrictions: {
    // Human approval required for final output
    humanApprovalRequiredForOutput: true,
  },
};

export default lexosRhetoricianRole;
