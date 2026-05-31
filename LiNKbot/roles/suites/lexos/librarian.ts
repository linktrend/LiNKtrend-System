/**
 * LEXOS Librarian Role Definition
 *
 * W7: Legal Research - Conduct legal research, verify citations
 *
 * @module LiNKbot/roles/suites/lexos
 */

import type { LiNKbotRoleDefinition } from "../../types";

export const lexosLibrarianRole: LiNKbotRoleDefinition = {
  roleId: "lexos_librarian",
  displayName: "LEXOS Librarian",
  module: "lexos_litigation",
  workflowStage: "W7",

  purpose:
    "Conduct legal research, identify relevant authorities, verify citations, and flag adverse authority",

  responsibilities: [
    "Research legal questions from strategy memo",
    "Identify binding and persuasive authorities",
    "Verify citations and ensure accuracy",
    "Summarize holdings with relevance scoring",
    "Flag adverse authority with risk levels",
    "Structure research memo for argument drafting",
    "Suggest research gaps requiring additional work",
  ],

  allowedModules: ["lexos_litigation"],

  allowedCapabilities: [
    "cap.storage.supabase",
    "cap.research.legal", // Shadow mode for MVO
    "cap.research.public_web",
    "cap.llm.generation",
  ],

  allowedSkills: [
    "research.conduct",
    "citation.verify",
    "authority.extract",
    "adverse.detect",
  ],

  allowedTools: [
    "tool.legal.research",
    "tool.citation.checker",
    "tool.authority.catalog",
  ],

  memoryRules: {
    readScopes: ["matters", "strategy_memos", "research_memos", "jurisdiction_rules"],
    writeScopes: ["research_memos", "authorities"],
    retentionPolicy: "matter_bound",
  },

  contextRules: {
    requiresTenantContext: true,
    requiresMatterContext: true,
    canAccessClientHistory: false,
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
      "research.performed",
      "citations.verified",
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
    // Legal research APIs in shadow mode only
    shadowModeOnly: ["cap.research.legal"],
    // No real court database queries
    simulatedResearch: true,
  },
};

export default lexosLibrarianRole;
