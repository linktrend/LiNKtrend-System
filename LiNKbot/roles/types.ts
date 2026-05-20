/**
 * LiNKbot Role Definition Types
 *
 * Type definitions for LiNKbot role contracts.
 *
 * @module LiNKbot/roles
 */

/**
 * Data classification levels for security profiles
 */
export type DataClassification =
  | "public"
  | "internal"
  | "confidential"
  | "privileged"
  | "highly_confidential"
  | "pii_sensitive";

/**
 * Model reasoning levels
 */
export type ReasoningLevel =
  | "none"
  | "analytical"
  | "creative"
  | "strategic"
  | "critical";

/**
 * Model creativity levels
 */
export type CreativityLevel =
  | "none"
  | "low"
  | "constrained"
  | "high";

/**
 * Model tiers for cost/quality tradeoffs
 */
export type ModelTier =
  | "economy"
  | "standard"
  | "enhanced"
  | "premium";

/**
 * Memory retention policies
 */
export type RetentionPolicy =
  | "session_bound"
  | "workflow_bound"
  | "matter_bound"
  | "persistent";

/**
 * Security profile for a role
 */
export interface SecurityProfile {
  /** Data classification for this role's access */
  dataClassification: DataClassification;
  /** Whether residue cleanup is required after sessions */
  requiresResidueCleanup: boolean;
  /** Audit events that require human approval */
  requiresHumanApproval: string[];
}

/**
 * Memory access rules for a role
 */
export interface MemoryRules {
  /** Scopes the role can read from */
  readScopes: string[];
  /** Scopes the role can write to */
  writeScopes: string[];
  /** Data retention policy */
  retentionPolicy: RetentionPolicy;
}

/**
 * Context requirements for a role
 */
export interface ContextRules {
  /** Whether tenant context is required */
  requiresTenantContext: boolean;
  /** Whether matter context is required */
  requiresMatterContext: boolean;
  /** Whether role can access client history */
  canAccessClientHistory: boolean;
}

/**
 * Model/runtime profile for a role
 */
export interface ModelProfile {
  /** Reasoning capability required */
  reasoningLevel: ReasoningLevel;
  /** Creativity level appropriate */
  creativityLevel: CreativityLevel;
  /** Accuracy priority (higher = more critical) */
  accuracyPriority: "low" | "medium" | "high" | "critical";
  /** Suggested model tier for cost/quality */
  suggestedModelTier: ModelTier;
}

/**
 * Audit event configuration
 */
export interface AuditEvents {
  /** Events this role emits */
  emitted: string[];
  /** Whether explicit audit is required for all actions */
  requiresExplicitAudit: boolean;
}

/**
 * Channel permissions for a role
 */
export interface ChannelPermissions {
  /** Can use Zulip messaging */
  canUseZulip: boolean;
  /** Can use email */
  canUseEmail: boolean;
  /** Can use Slack */
  canUseSlack: boolean;
}

/**
 * MVO-specific restrictions
 */
export interface MvoRestrictions {
  /** Capabilities that must be mocked */
  mockCapabilitiesOnly?: string[];
  /** Whether human approval is required for acceptance */
  humanApprovalRequiredForAcceptance?: boolean;
  /** Whether human approval is required generally */
  humanApprovalRequired?: boolean;
  /** Capabilities in shadow mode only */
  shadowModeOnly?: string[];
  /** Whether only local extraction allowed */
  localExtractionOnly?: boolean;
  /** Whether human review required for flags */
  humanReviewForFlags?: boolean;
  /** Whether to simulate research */
  simulatedResearch?: boolean;
  /** Whether human review is recommended */
  humanReviewRecommended?: boolean;
  /** Whether human approval required for output */
  humanApprovalRequiredForOutput?: boolean;
  /** Whether external KYC is disabled */
  noExternalKyc?: boolean;
  /** Whether automated in MVO */
  automatedInMvo?: boolean;
  /** Whether human review is optional */
  humanReviewOptional?: boolean;
}

/**
 * Complete LiNKbot role definition
 */
export interface LiNKbotRoleDefinition {
  /** Unique role ID */
  roleId: string;
  /** Human-readable display name */
  displayName: string;
  /** Module this role belongs to */
  module: string;
  /** Workflow stage this role primarily handles */
  workflowStage?: string;
  /** Purpose statement */
  purpose: string;
  /** List of responsibilities */
  responsibilities: string[];
  /** Modules this role can access */
  allowedModules: string[];
  /** Capability connectors this role can use */
  allowedCapabilities: string[];
  /** Skills this role can apply */
  allowedSkills: string[];
  /** Tools this role can invoke */
  allowedTools: string[];
  /** Memory access rules */
  memoryRules: MemoryRules;
  /** Context requirements */
  contextRules: ContextRules;
  /** Model/runtime profile */
  modelProfile: ModelProfile;
  /** Audit event configuration */
  auditEvents: AuditEvents;
  /** Security profile */
  securityProfile: SecurityProfile;
  /** Channel permissions */
  channelPermissions: ChannelPermissions;
  /** MVO restrictions */
  mvoRestrictions: MvoRestrictions;
}
