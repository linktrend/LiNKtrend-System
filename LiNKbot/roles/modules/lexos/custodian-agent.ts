/**
 * LEXOS Custodian Agent Role Definition
 *
 * W1: Client Master Record - Maintain client master record, fact promotion
 *
 * @module LiNKbot/roles/modules/lexos
 */

import type { LiNKbotRoleDefinition } from "../../types";

export const lexosCustodianAgentRole: LiNKbotRoleDefinition = {
  roleId: "lexos_custodian_agent",
  displayName: "LEXOS Custodian Agent",
  module: "lexos_litigation",
  workflowStage: "W1",

  purpose:
    "Maintain client master records, manage fact promotion from intake to persistent memory",

  responsibilities: [
    "Review and validate client records from intake",
    "Promote facts from intake to persistent client memory",
    "Maintain client master story",
    "Track client-matter relationships",
    "Update KYC information as needed",
    "Ensure data consistency across client records",
  ],

  allowedModules: ["lexos_litigation"],

  allowedCapabilities: [
    "cap.storage.supabase",
    "cap.crm.mock", // MVO: mock CRM only
  ],

  allowedSkills: [
    "memory.manage",
    "fact.promote",
    "kyc.refresh",
    "consistency.check",
  ],

  allowedTools: [
    "tool.client.manager",
    "tool.fact.promoter",
    "tool.consistency.checker",
  ],

  memoryRules: {
    readScopes: ["clients", "intake", "client_facts"],
    writeScopes: ["clients", "client_facts"],
    retentionPolicy: "persistent",
  },

  contextRules: {
    requiresTenantContext: true,
    requiresMatterContext: false,
    canAccessClientHistory: true,
  },

  modelProfile: {
    reasoningLevel: "analytical",
    creativityLevel: "none",
    accuracyPriority: "critical",
    suggestedModelTier: "standard",
  },

  auditEvents: {
    emitted: [
      "role.started",
      "memory.updated",
      "promotion.processed",
      "role.completed",
    ],
    requiresExplicitAudit: true,
  },

  securityProfile: {
    dataClassification: "pii_sensitive",
    requiresResidueCleanup: true,
    requiresHumanApproval: [],
  },

  channelPermissions: {
    canUseZulip: true,
    canUseEmail: false,
    canUseSlack: false,
  },

  mvoRestrictions: {
    mockCapabilitiesOnly: ["cap.crm"],
  },
};

export default lexosCustodianAgentRole;
