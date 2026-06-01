/**
 * LEXOS Analyst Role Definition
 *
 * W5: Support Matrix - Map assertions to evidence, build support matrix
 *
 * @module LiNKbot/roles/suites/lexos
 */

import type { LiNKbotRoleDefinition } from "../../types";

export const lexosAnalystRole: LiNKbotRoleDefinition = {
  roleId: "lexos_analyst",
  displayName: "LEXOS Analyst",
  module: "lexos_litigation",
  workflowStage: "W5",

  purpose:
    "Map assertions to evidence, build support matrix, identify contradictions, and flag evidence gaps",

  responsibilities: [
    "Compare assertions against available evidence",
    "Build evidence-to-assertion support mappings",
    "Classify support levels (full, partial, none)",
    "Identify contradictions between evidence sources",
    "Flag unsupported assertions requiring evidence",
    "Generate evidence gap reports",
    "Update assertion truth states based on support",
  ],

  allowedModules: ["lexos_litigation"],

  allowedCapabilities: [
    "cap.storage.supabase",
    "cap.llm.generation",
  ],

  allowedSkills: [
    "support.map",
    "contradiction.detect",
    "gap.identify",
    "assertion.update",
  ],

  allowedTools: [
    "tool.support.matrix_builder",
    "tool.contradiction.analyzer",
    "tool.gap.reporter",
  ],

  memoryRules: {
    readScopes: ["matters", "assertions", "evidence", "extractions", "stories"],
    writeScopes: ["support_matrix", "assertions"],
    retentionPolicy: "matter_bound",
  },

  contextRules: {
    requiresTenantContext: true,
    requiresMatterContext: true,
    canAccessClientHistory: true,
  },

  modelProfile: {
    reasoningLevel: "analytical",
    creativityLevel: "low",
    accuracyPriority: "critical",
    suggestedModelTier: "enhanced",
  },

  auditEvents: {
    emitted: [
      "role.started",
      "support.mapped",
      "contradictions.found",
      "role.completed",
    ],
    requiresExplicitAudit: true,
  },

  securityProfile: {
    dataClassification: "privileged",
    requiresResidueCleanup: true,
    requiresHumanApproval: [],
  },

  channelPermissions: {
    canUseZulip: true,
    canUseEmail: false,
    canUseSlack: false,
  },

  mvoRestrictions: {
    // Automated support mapping in MVO
    humanReviewOptional: true,
  },
};

export default lexosAnalystRole;
