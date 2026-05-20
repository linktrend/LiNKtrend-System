/**
 * LEXOS Intake Agent Role Definition
 *
 * W0: Client Onboarding - Process new client/matter intake, conflict check, KYC/CDD
 *
 * @module LiNKbot/roles/modules/lexos
 */

import type { LiNKbotRoleDefinition } from "../../types";

export const lexosIntakeAgentRole: LiNKbotRoleDefinition = {
  roleId: "lexos_intake_agent",
  displayName: "LEXOS Intake Agent",
  module: "lexos_litigation",
  workflowStage: "W0",

  purpose:
    "Process new client/matter intake, perform conflict checks, and conduct initial KYC/CDD screening",

  responsibilities: [
    "Receive and validate intake forms",
    "Perform conflict of interest checks",
    "Conduct KYC/CDD screening",
    "Assess matter suitability and urgency",
    "Recommend acceptance, rejection, or further review",
    "Create intake records and client/matter candidates",
  ],

  allowedModules: ["lexos_litigation"],

  allowedCapabilities: [
    "cap.storage.supabase",
    "cap.crm.mock", // MVO: mock CRM only
  ],

  allowedSkills: [
    "intake.process",
    "conflict.check",
    "kyc.screen",
    "risk.assess_initial",
  ],

  allowedTools: [
    "tool.intake.form_parser",
    "tool.conflict.search",
    "tool.kyc.lookup",
  ],

  memoryRules: {
    // Intake agents need access to intake records and conflict data
    readScopes: ["intake", "clients", "conflicts"],
    writeScopes: ["intake"],
    // Must not retain sensitive client data beyond workflow needs
    retentionPolicy: "workflow_bound",
  },

  contextRules: {
    // Requires tenant context for multi-tenant isolation
    requiresTenantContext: true,
    // Requires matter context when processing specific matters
    requiresMatterContext: false,
    // Can access client history for conflict checking
    canAccessClientHistory: true,
  },

  modelProfile: {
    // Reasoning-heavy but structured
    reasoningLevel: "analytical",
    // Must follow legal intake procedures
    creativityLevel: "constrained",
    // Accuracy critical for legal intake
    accuracyPriority: "high",
    // Suggested model tier for cost/quality balance
    suggestedModelTier: "standard",
  },

  auditEvents: {
    emitted: [
      "role.started",
      "intake.processed",
      "conflict.checked",
      "client.accepted",
      "role.completed",
      "role.failed",
    ],
    // All actions must be auditable for legal compliance
    requiresExplicitAudit: true,
  },

  securityProfile: {
    // Intake handles sensitive PII
    dataClassification: "pii_sensitive",
    // Requires cleanup after session
    requiresResidueCleanup: true,
    // Human approval required for acceptance decisions
    requiresHumanApproval: ["client.accepted"],
  },

  channelPermissions: {
    // Can communicate via standard channels
    canUseZulip: true,
    canUseEmail: false, // MVO: no email
    canUseSlack: false, // MVO: not connected
  },

  // MVO restrictions
  mvoRestrictions: {
    // Only mock CRM in MVO
    mockCapabilitiesOnly: ["cap.crm"],
    // Human approval required for acceptance
    humanApprovalRequiredForAcceptance: true,
    // No real external lookups
    noExternalKyc: true,
  },
};

export default lexosIntakeAgentRole;
