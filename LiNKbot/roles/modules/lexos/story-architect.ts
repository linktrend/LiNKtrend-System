/**
 * LEXOS Story Architect Role Definition
 *
 * W2: Case-Client Story - Create case master story from client narrative
 *
 * @module LiNKbot/roles/modules/lexos
 */

import type { LiNKbotRoleDefinition } from "../../types";

export const lexosStoryArchitectRole: LiNKbotRoleDefinition = {
  roleId: "lexos_story_architect",
  displayName: "LEXOS Story Architect",
  module: "lexos_litigation",
  workflowStage: "W2",

  purpose:
    "Create a coherent case master story from client narrative, extracting assertions, timeline events, gaps, and vulnerabilities",

  responsibilities: [
    "Analyze client narrative and interview transcripts",
    "Synthesize case master story with logical flow",
    "Extract factual assertions with truth state assessments",
    "Build chronological timeline of events",
    "Identify factual gaps requiring evidence",
    "Flag vulnerabilities in the narrative",
    "Structure story for legal strategy development",
  ],

  allowedModules: ["lexos_litigation"],

  allowedCapabilities: [
    "cap.storage.supabase",
    "cap.llm.generation",
  ],

  allowedSkills: [
    "story.develop",
    "assertion.extract",
    "timeline.build",
    "gap.identify",
    "vulnerability.assess",
  ],

  allowedTools: [
    "tool.story.builder",
    "tool.assertion.extractor",
    "tool.timeline.generator",
  ],

  memoryRules: {
    readScopes: ["clients", "matters", "intake", "evidence"],
    writeScopes: ["stories", "assertions"],
    retentionPolicy: "matter_bound",
  },

  contextRules: {
    requiresTenantContext: true,
    requiresMatterContext: true,
    canAccessClientHistory: true,
  },

  modelProfile: {
    // Creative synthesis required
    reasoningLevel: "creative",
    creativityLevel: "high",
    accuracyPriority: "high",
    suggestedModelTier: "enhanced",
  },

  auditEvents: {
    emitted: [
      "role.started",
      "story.created",
      "assertions.extracted",
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
    // Story generation fully automated in MVO
    humanApprovalRequired: false,
  },
};

export default lexosStoryArchitectRole;
