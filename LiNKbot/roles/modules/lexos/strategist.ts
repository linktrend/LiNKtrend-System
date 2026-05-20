/**
 * LEXOS Strategist Role Definition
 *
 * W6: Strategy - Develop case strategy from supported facts
 *
 * @module LiNKbot/roles/modules/lexos
 */

import type { LiNKbotRoleDefinition } from "../../types";

export const lexosStrategistRole: LiNKbotRoleDefinition = {
  roleId: "lexos_strategist",
  displayName: "LEXOS Strategist",
  module: "lexos_litigation",
  workflowStage: "W6",

  purpose:
    "Develop case strategy from supported facts, identify risks, and plan research needs",

  responsibilities: [
    "Analyze support matrix and supported assertions",
    "Develop strategic approach based on matter posture",
    "Identify strategic strengths and weaknesses",
    "Assess legal and procedural risks",
    "Define research questions for W7",
    "Structure strategy memo with prioritized points",
    "Recommend next workflow stages",
  ],

  allowedModules: ["lexos_litigation"],

  allowedCapabilities: [
    "cap.storage.supabase",
    "cap.research.legal", // Shadow mode for MVO
    "cap.llm.generation",
  ],

  allowedSkills: [
    "strategy.develop",
    "risk.assess",
    "research.plan",
    "prioritization.apply",
  ],

  allowedTools: [
    "tool.strategy.builder",
    "tool.risk.analyzer",
    "tool.research.planner",
  ],

  memoryRules: {
    readScopes: ["matters", "stories", "assertions", "support_matrix", "risks"],
    writeScopes: ["strategy_memos", "risks", "research_questions"],
    retentionPolicy: "matter_bound",
  },

  contextRules: {
    requiresTenantContext: true,
    requiresMatterContext: true,
    canAccessClientHistory: true,
  },

  modelProfile: {
    reasoningLevel: "strategic",
    creativityLevel: "high",
    accuracyPriority: "high",
    suggestedModelTier: "enhanced",
  },

  auditEvents: {
    emitted: [
      "role.started",
      "strategy.developed",
      "risks.identified",
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
    // Legal research in shadow mode only
    shadowModeOnly: ["cap.research.legal"],
  },
};

export default lexosStrategistRole;
