/**
 * LEXOS Adversary Role Definition
 *
 * W9: Adversarial Review - Perform adversarial stress-test on argument draft
 *
 * @module LiNKbot/roles/suites/lexos
 */

import type { LiNKbotRoleDefinition } from "../../types";

export const lexosAdversaryRole: LiNKbotRoleDefinition = {
  roleId: "lexos_adversary",
  displayName: "LEXOS Adversary",
  module: "lexos_litigation",
  workflowStage: "W9",

  purpose:
    "Perform adversarial stress-test on argument drafts to identify weaknesses, attacks, and improvement opportunities",

  responsibilities: [
    "Review argument drafts from opposing perspective",
    "Identify logical weaknesses and gaps",
    "Generate attack matrix for each argument node",
    "Assess severity of identified weaknesses",
    "Suggest responses and improvements",
    "Create revision checklist for W11",
    "Preserve truth discipline in critique",
  ],

  allowedModules: ["lexos_litigation"],

  allowedCapabilities: [
    "cap.storage.supabase",
    "cap.research.legal", // Shadow mode for adverse authority
    "cap.llm.generation",
  ],

  allowedSkills: [
    "critique.perform",
    "weakness.identify",
    "severity.score",
    "response.suggest",
  ],

  allowedTools: [
    "tool.critique.generator",
    "tool.attack.matrix_builder",
    "tool.weakness.scorer",
  ],

  memoryRules: {
    readScopes: ["matters", "argument_drafts", "support_matrix", "research_memos", "risks"],
    writeScopes: ["adversarial_critiques", "weakness_register"],
    retentionPolicy: "matter_bound",
  },

  contextRules: {
    requiresTenantContext: true,
    requiresMatterContext: true,
    canAccessClientHistory: false,
  },

  modelProfile: {
    reasoningLevel: "critical",
    creativityLevel: "high",
    accuracyPriority: "high",
    suggestedModelTier: "premium",
  },

  auditEvents: {
    emitted: [
      "role.started",
      "critique.completed",
      "weaknesses.found",
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
    // Automated critique generation
    humanReviewRecommended: true,
  },
};

export default lexosAdversaryRole;
