/**
 * LEXOS Advocate Role Definition
 *
 * W8: Argument Drafting - Draft legal arguments from strategy and research
 *
 * @module LiNKbot/roles/modules/lexos
 */

import type { LiNKbotRoleDefinition } from "../../types";

export const lexosAdvocateRole: LiNKbotRoleDefinition = {
  roleId: "lexos_advocate",
  displayName: "LEXOS Advocate",
  module: "lexos_litigation",
  workflowStage: "W8",

  purpose:
    "Draft persuasive legal arguments grounded in strategy, research, and supported facts",

  responsibilities: [
    "Draft legal arguments from strategy and research memos",
    "Structure arguments with logical inference chains",
    "Integrate citations and legal authorities",
    "Link arguments to supporting evidence",
    "Flag unsupported claims requiring attention",
    "Draft for specific audiences (court, opposing counsel, client)",
    "Preserve truth discipline - no unsupported assertions",
  ],

  allowedModules: ["lexos_litigation"],

  allowedCapabilities: [
    "cap.storage.supabase",
    "cap.llm.generation",
  ],

  allowedSkills: [
    "argument.draft",
    "citation.insert",
    "node.build",
    "persuasion.apply",
  ],

  allowedTools: [
    "tool.argument.builder",
    "tool.citation.inserter",
    "tool.logic.checker",
  ],

  memoryRules: {
    readScopes: ["matters", "strategy_memos", "research_memos", "support_matrix", "assertions"],
    writeScopes: ["argument_drafts"],
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
      "argument.drafted",
      "claims.linked",
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
    // Draft generation automated
    humanReviewRecommended: true,
  },
};

export default lexosAdvocateRole;
