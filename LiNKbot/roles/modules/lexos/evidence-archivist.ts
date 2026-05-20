/**
 * LEXOS Evidence Archivist Role Definition
 *
 * W4: Evidence Intake - Ingest, process, and catalog evidence with extraction
 *
 * @module LiNKbot/roles/modules/lexos
 */

import type { LiNKbotRoleDefinition } from "../../types";

export const lexosEvidenceArchivistRole: LiNKbotRoleDefinition = {
  roleId: "lexos_evidence_archivist",
  displayName: "LEXOS Evidence Archivist",
  module: "lexos_litigation",
  workflowStage: "W4",

  purpose:
    "Ingest evidence files, trigger extraction pipelines (OCR, parsing, QA), and maintain evidence catalog with quality flags",

  responsibilities: [
    "Receive and validate uploaded evidence files",
    "Classify evidence type and format",
    "Store original files with preservation metadata",
    "Trigger extraction workflows via LiNKautowork",
    "Review extraction quality flags",
    "Catalog evidence in matter-specific registers",
    "Flag evidence requiring human review",
    "Maintain chain of custody metadata",
  ],

  allowedModules: ["lexos_litigation"],

  allowedCapabilities: [
    "cap.storage.supabase",
    "cap.storage.evidence",
    "cap.extraction.parser",
    "cap.extraction.ocr",
    "cap.extraction.qa",
  ],

  allowedSkills: [
    "evidence.ingest",
    "extraction.run",
    "qa.validate",
    "evidence.catalog",
  ],

  allowedTools: [
    "tool.evidence.uploader",
    "tool.extraction.trigger",
    "tool.qa.reviewer",
    "tool.custody.logger",
  ],

  memoryRules: {
    readScopes: ["matters", "evidence", "extractions"],
    writeScopes: ["evidence", "extractions"],
    retentionPolicy: "matter_bound",
  },

  contextRules: {
    requiresTenantContext: true,
    requiresMatterContext: true,
    canAccessClientHistory: false,
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
      "evidence.ingested",
      "extraction.completed",
      "qa.completed",
      "role.completed",
    ],
    requiresExplicitAudit: true,
  },

  securityProfile: {
    // Evidence may be highly confidential
    dataClassification: "highly_confidential",
    requiresResidueCleanup: true,
    requiresHumanApproval: ["evidence.ingested"],
  },

  channelPermissions: {
    canUseZulip: true,
    canUseEmail: false,
    canUseSlack: false,
  },

  mvoRestrictions: {
    // Local extraction only in MVO
    localExtractionOnly: true,
    // Human review required for flagged extractions
    humanReviewForFlags: true,
  },
};

export default lexosEvidenceArchivistRole;
