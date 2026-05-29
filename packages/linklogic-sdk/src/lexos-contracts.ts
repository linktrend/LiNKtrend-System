/**
 * LEXOS Litigation Module Contract Types
 *
 * Canonical source: `dev-swarm/command-center/LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md`
 * Contract patterns: `dev-swarm/command-center/CONTRACTS_MVO.md`
 *
 * These types define the work request/response contracts for the LEXOS litigation
 * module. They follow the same patterns as the LinkSites contracts
 * in `contracts-mvo.ts`.
 */

import { z } from "zod";
import type {
  LexosClient,
  LexosMatter,
  LexosIntakeRecord,
  LexosEvidence,
  LexosEvidenceExtraction,
  LexosAssertion,
  LexosSupportMatrixItem,
  LexosCaseStory,
} from "@linktrend/db/types/lexos/database";

/* -------------------------------------------------------------------------- */
/* §1 LEXOS Work Request Types                                                */
/* -------------------------------------------------------------------------- */

export const LexosWorkRequestTypeSchema = z.enum([
  "lexos.intake.new",
  "lexos.matter.create",
  "lexos.story.develop",
  "lexos.evidence.ingest",
  "lexos.assertions.extract",
  "lexos.support.map",
  "lexos.strategy.develop",
  "lexos.research.conduct",
  "lexos.argument.draft",
  "lexos.adversarial.review",
  "lexos.output.generate",
]);

export type LexosWorkRequestType = z.infer<typeof LexosWorkRequestTypeSchema>;

/* -------------------------------------------------------------------------- */
/* §2 LEXOS Plugin Manifest Constants                                         */
/* -------------------------------------------------------------------------- */

export const LEXOS_PLUGIN_ID = "lexos_litigation";
export const LEXOS_PLUGIN_NAME = "LEXOS Litigation";
export const LEXOS_PLUGIN_VERSION = "1.0.0-mvo";

export const LEXOS_WORKFLOW_STAGES = [
  "W0",
  "W1",
  "W2",
  "W3",
  "W4",
  "W5",
  "W6",
  "W7",
  "W8",
  "W9",
  "W10",
  "W11",
] as const;

export type LexosWorkflowStage = (typeof LEXOS_WORKFLOW_STAGES)[number];

export const LEXOS_STAGE_DISPLAY_NAMES: Record<LexosWorkflowStage, string> = {
  W0: "Client Onboarding",
  W1: "Client Master Record",
  W2: "Case-Client Story",
  W3: "Opposing File Reconciliation",
  W4: "Evidence Intake",
  W5: "Support Matrix",
  W6: "Strategy",
  W7: "Legal Research",
  W8: "Argument Drafting",
  W9: "Adversarial Review",
  W10: "Visual Exhibits",
  W11: "Output Refinement",
};

/* -------------------------------------------------------------------------- */
/* §3 LEXOS LiNKbot Role IDs                                                  */
/* -------------------------------------------------------------------------- */

export const LexosRoleIdSchema = z.enum([
  "lexos_intake_agent",
  "lexos_custodian_agent",
  "lexos_story_architect",
  "lexos_evidence_archivist",
  "lexos_analyst",
  "lexos_strategist",
  "lexos_librarian",
  "lexos_advocate",
  "lexos_adversary",
  "lexos_rhetorician",
]);

export type LexosRoleId = z.infer<typeof LexosRoleIdSchema>;

export const LEXOS_ROLE_DISPLAY_NAMES: Record<LexosRoleId, string> = {
  lexos_intake_agent: "Intake Agent",
  lexos_custodian_agent: "Custodian Agent",
  lexos_story_architect: "Story Architect",
  lexos_evidence_archivist: "Evidence Archivist",
  lexos_analyst: "Analyst",
  lexos_strategist: "Strategist",
  lexos_librarian: "Librarian",
  lexos_advocate: "Advocate",
  lexos_adversary: "Adversary",
  lexos_rhetorician: "Rhetorician",
};

/* -------------------------------------------------------------------------- */
/* §4 LEXOS Capability Connector IDs                                          */
/* -------------------------------------------------------------------------- */

export const LexosCapabilityIdSchema = z.enum([
  "cap.storage.supabase",
  "cap.storage.evidence",
  "cap.extraction.parser",
  "cap.extraction.ocr",
  "cap.extraction.qa",
  "cap.research.legal",
  "cap.research.public_web",
  "cap.llm.generation",
  "cap.crm.mock",
  "cap.plane.mock",
]);

export type LexosCapabilityId = z.infer<typeof LexosCapabilityIdSchema>;

/* -------------------------------------------------------------------------- */
/* §5 LEXOS LiNKautowork Workflow Handles                                     */
/* -------------------------------------------------------------------------- */

export const LexosWorkflowHandleSchema = z.enum([
  "autowork.lexos.evidence_ingest",
  "autowork.lexos.extraction_run",
  "autowork.lexos.assertion_sync",
  "autowork.lexos.artifact_generate",
  "autowork.lexos.crm_sync",
]);

export type LexosWorkflowHandle = z.infer<typeof LexosWorkflowHandleSchema>;

/* -------------------------------------------------------------------------- */
/* §6 LEXOS Audit Event Types                                                 */
/* -------------------------------------------------------------------------- */

export const LexosAuditEventTypeSchema = z.enum([
  // Core events
  "run.started",
  "run.completed",
  "run.failed",
  "run.cancelled",
  "stage.started",
  "stage.completed",
  "stage.failed",
  "stage.awaiting_approval",
  "lease.requested",
  "lease.granted",
  "lease.executed",
  "lease.denied",
  "workflow.invoked",
  "workflow.completed",
  "workflow.failed",

  // LEXOS-specific events
  "intake.processed",
  "conflict.checked",
  "client.accepted",
  "story.created",
  "assertions.extracted",
  "evidence.ingested",
  "extraction.completed",
  "support.mapped",
  "contradictions.found",
  "strategy.developed",
  "research.performed",
  "argument.drafted",
  "critique.completed",
  "output.refined",

  // Role lifecycle
  "role.started",
  "role.completed",
  "role.failed",
]);

export type LexosAuditEventType = z.infer<typeof LexosAuditEventTypeSchema>;

/* -------------------------------------------------------------------------- */
/* §7 Work Request Payloads                                                   */
/* -------------------------------------------------------------------------- */

/**
 * W0: New client/matter intake
 * Request: lexos.intake.new
 */
export const LexosIntakeNewRequestSchema = z.object({
  tenant_id: z.string().uuid(),
  source: z.enum(["manual", "web_form", "referral", "import"]),
  intake_type: z.string().optional(),
  urgency_level: z.string().optional(),
  prospective_client: z.object({
    name: z.string(),
    client_type: z.string().optional(),
    contact_details: z.record(z.string()).optional(),
  }).optional(),
  prospective_matter: z.object({
    proposed_name: z.string(),
    matter_type: z.string().optional(),
    posture: z.enum(["plaintiff", "defence", "defense", "regulatory", "criminal_defence", "commercial_dispute", "advisory", "internal", "unknown"]).optional(),
    jurisdiction: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
  idempotency_key: z.string().optional(),
});

export type LexosIntakeNewRequest = z.infer<typeof LexosIntakeNewRequestSchema>;

export const LexosIntakeNewResultSchema = z.object({
  intake_id: z.string().uuid(),
  intake_status: z.enum(["new", "in_progress", "waiting_for_information", "conflict_check_pending", "accepted", "rejected"]),
  client_candidate_id: z.string().uuid().optional(),
  matter_candidate_id: z.string().uuid().optional(),
  conflict_status: z.enum(["unknown", "pending", "clear", "potential_conflict", "conflict_identified"]).optional(),
  kyc_status: z.enum(["unknown", "not_required", "pending", "in_progress", "passed", "failed"]).optional(),
});

export type LexosIntakeNewResult = z.infer<typeof LexosIntakeNewResultSchema>;

/**
 * W1: Create matter for existing client
 * Request: lexos.matter.create
 */
export const LexosMatterCreateRequestSchema = z.object({
  tenant_id: z.string().uuid(),
  client_id: z.string().uuid(),
  matter_name: z.string(),
  matter_type: z.string().optional(),
  posture: z.enum(["plaintiff", "defence", "defense", "regulatory", "criminal_defence", "commercial_dispute", "advisory", "internal", "unknown"]).optional(),
  jurisdiction: z.string().optional(),
  description: z.string().optional(),
  intake_id: z.string().uuid().optional(),
  idempotency_key: z.string().optional(),
});

export type LexosMatterCreateRequest = z.infer<typeof LexosMatterCreateRequestSchema>;

export const LexosMatterCreateResultSchema = z.object({
  matter_id: z.string().uuid(),
  client_id: z.string().uuid(),
  matter_name: z.string(),
  status: z.enum(["draft", "active", "paused", "blocked", "under_review", "closed", "archived"]),
  current_workflow: z.enum(["W0", "W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11"]).optional(),
});

export type LexosMatterCreateResult = z.infer<typeof LexosMatterCreateResultSchema>;

/**
 * W2: Develop case story
 * Request: lexos.story.develop
 */
export const LexosStoryDevelopRequestSchema = z.object({
  tenant_id: z.string().uuid(),
  matter_id: z.string().uuid(),
  client_narrative: z.string().optional(),
  interview_transcript: z.string().optional(),
  existing_documents: z.array(z.string().uuid()).optional(),
  story_prompt_template: z.string().optional(),
  model_routing_profile: z.string().optional(),
});

export type LexosStoryDevelopRequest = z.infer<typeof LexosStoryDevelopRequestSchema>;

export const LexosStoryDevelopResultSchema = z.object({
  case_story_id: z.string().uuid(),
  matter_id: z.string().uuid(),
  title: z.string(),
  content_markdown: z.string(),
  assertions_extracted: z.number().int(),
  timeline_events: z.array(z.object({
    date: z.string(),
    description: z.string(),
    significance: z.string().optional(),
  })).optional(),
  gaps: z.array(z.string()).optional(),
  vulnerabilities: z.array(z.string()).optional(),
  model_run_id: z.string().optional(),
});

export type LexosStoryDevelopResult = z.infer<typeof LexosStoryDevelopResultSchema>;

/**
 * W4: Ingest and process evidence
 * Request: lexos.evidence.ingest
 */
export const LexosEvidenceIngestRequestSchema = z.object({
  tenant_id: z.string().uuid(),
  matter_id: z.string().uuid(),
  client_id: z.string().uuid(),
  source_id: z.string().uuid().optional(),
  files: z.array(z.object({
    file_name: z.string(),
    file_type: z.string(),
    file_uri: z.string(),
    file_hash: z.string().optional(),
  })),
  evidence_labels: z.array(z.string()).optional(),
  extraction_required: z.boolean().default(true),
  extraction_types: z.array(z.enum(["text_document", "scanned_document", "image_with_text", "audio_transcript", "video_transcript", "metadata_only"])).optional(),
  legal_hold: z.boolean().default(false),
  confidentiality_status: z.enum(["unknown", "public", "internal", "confidential", "highly_confidential", "restricted"]).optional(),
  privilege_status: z.enum(["unknown", "not_privileged", "potentially_privileged", "privileged", "work_product", "restricted"]).optional(),
});

export type LexosEvidenceIngestRequest = z.infer<typeof LexosEvidenceIngestRequestSchema>;

export const LexosEvidenceIngestResultSchema = z.object({
  evidence_ids: z.array(z.string().uuid()),
  extractions: z.array(z.object({
    evidence_id: z.string().uuid(),
    extraction_id: z.string().uuid(),
    extraction_type: z.string(),
    extraction_quality_status: z.enum(["accepted", "qa_flagged", "failed", "human_review_required"]),
    human_review_required: z.boolean(),
  })),
  processing_status: z.enum(["uploaded", "queued", "processing", "processed", "qa_flagged", "failed", "requires_human_review"]),
});

export type LexosEvidenceIngestResult = z.infer<typeof LexosEvidenceIngestResultSchema>;

/**
 * W5: Extract assertions from story/evidence
 * Request: lexos.assertions.extract
 */
export const LexosAssertionsExtractRequestSchema = z.object({
  tenant_id: z.string().uuid(),
  matter_id: z.string().uuid(),
  case_story_id: z.string().uuid().optional(),
  evidence_ids: z.array(z.string().uuid()).optional(),
  extraction_id: z.string().uuid().optional(),
  extraction_mode: z.enum(["from_story", "from_evidence", "combined"]),
  assertion_types: z.array(z.string()).optional(),
  model_routing_profile: z.string().optional(),
});

export type LexosAssertionsExtractRequest = z.infer<typeof LexosAssertionsExtractRequestSchema>;

export const LexosAssertionsExtractResultSchema = z.object({
  assertions_created: z.number().int(),
  assertion_ids: z.array(z.string().uuid()),
  by_truth_state: z.record(z.number().int()).optional(),
  model_run_id: z.string().optional(),
});

export type LexosAssertionsExtractResult = z.infer<typeof LexosAssertionsExtractResultSchema>;

/**
 * W5: Map evidence support to assertions
 * Request: lexos.support.map
 */
export const LexosSupportMapRequestSchema = z.object({
  tenant_id: z.string().uuid(),
  matter_id: z.string().uuid(),
  assertion_ids: z.array(z.string().uuid()).optional(),
  evidence_ids: z.array(z.string().uuid()).optional(),
  auto_map: z.boolean().default(true),
  model_routing_profile: z.string().optional(),
});

export type LexosSupportMapRequest = z.infer<typeof LexosSupportMapRequestSchema>;

export const LexosSupportMapResultSchema = z.object({
  support_matrix_items_created: z.number().int(),
  support_matrix_item_ids: z.array(z.string().uuid()),
  supported_count: z.number().int(),
  partially_supported_count: z.number().int(),
  unsupported_count: z.number().int(),
  contradictions_found: z.number().int(),
  contradictions: z.array(z.object({
    assertion_id: z.string().uuid(),
    conflicting_evidence_ids: z.array(z.string().uuid()),
    contradiction_summary: z.string(),
  })).optional(),
});

export type LexosSupportMapResult = z.infer<typeof LexosSupportMapResultSchema>;

/**
 * W6: Develop case strategy
 * Request: lexos.strategy.develop
 */
export const LexosStrategyDevelopRequestSchema = z.object({
  tenant_id: z.string().uuid(),
  matter_id: z.string().uuid(),
  case_story_id: z.string().uuid().optional(),
  supported_assertion_ids: z.array(z.string().uuid()).optional(),
  posture: z.enum(["plaintiff", "defence", "defense", "regulatory", "criminal_defence", "commercial_dispute", "advisory", "internal", "unknown"]),
  jurisdiction: z.string().optional(),
  model_routing_profile: z.string().optional(),
});

export type LexosStrategyDevelopRequest = z.infer<typeof LexosStrategyDevelopRequestSchema>;

export const LexosStrategyDevelopResultSchema = z.object({
  strategy_memo_id: z.string().uuid(),
  strategy_points: z.array(z.object({
    point_id: z.string(),
    title: z.string(),
    description: z.string(),
    priority: z.enum(["low", "moderate", "high", "critical"]),
    supported_by_assertions: z.array(z.string().uuid()),
  })),
  research_questions: z.array(z.string()),
  risks: z.array(z.object({
    risk_title: z.string(),
    risk_type: z.string(),
    severity: z.enum(["low", "moderate", "high", "critical"]),
    description: z.string(),
  })),
  model_run_id: z.string().optional(),
});

export type LexosStrategyDevelopResult = z.infer<typeof LexosStrategyDevelopResultSchema>;

/**
 * W7: Conduct legal research
 * Request: lexos.research.conduct
 */
export const LexosResearchConductRequestSchema = z.object({
  tenant_id: z.string().uuid(),
  matter_id: z.string().uuid(),
  research_questions: z.array(z.string()),
  strategy_points: z.array(z.string()).optional(),
  jurisdiction: z.string().optional(),
  research_depth: z.enum(["quick", "standard", "deep"]).default("standard"),
  model_routing_profile: z.string().optional(),
});

export type LexosResearchConductRequest = z.infer<typeof LexosResearchConductRequestSchema>;

export const LexosResearchConductResultSchema = z.object({
  research_memo_id: z.string().uuid(),
  legal_authorities: z.array(z.object({
    citation: z.string(),
    title: z.string(),
    jurisdiction: z.string().optional(),
    date: z.string().optional(),
    relevance_score: z.number().optional(),
    holding_summary: z.string(),
  })),
  adverse_authority: z.array(z.object({
    citation: z.string(),
    title: z.string(),
    risk_level: z.enum(["low", "moderate", "high", "critical"]),
    mitigation: z.string().optional(),
  })).optional(),
  citation_confidence: z.number().optional(),
  model_run_id: z.string().optional(),
});

export type LexosResearchConductResult = z.infer<typeof LexosResearchConductResultSchema>;

/**
 * W8: Draft legal argument
 * Request: lexos.argument.draft
 */
export const LexosArgumentDraftRequestSchema = z.object({
  tenant_id: z.string().uuid(),
  matter_id: z.string().uuid(),
  strategy_memo_id: z.string().uuid().optional(),
  research_memo_id: z.string().uuid().optional(),
  argument_type: z.enum(["motion", "brief", "memorandum", "letter", "pleading", "opening_statement", "closing_argument"]),
  target_audience: z.string().optional(),
  tone: z.enum(["formal", "persuasive", "neutral", "aggressive"]).default("formal"),
  max_length_words: z.number().int().optional(),
  model_routing_profile: z.string().optional(),
});

export type LexosArgumentDraftRequest = z.infer<typeof LexosArgumentDraftRequestSchema>;

export const LexosArgumentDraftResultSchema = z.object({
  argument_draft_id: z.string().uuid(),
  title: z.string(),
  content_markdown: z.string(),
  argument_nodes: z.array(z.object({
    node_id: z.string(),
    node_type: z.enum(["premise", "fact", "law", "inference", "conclusion"]),
    content: z.string(),
    parent_node_id: z.string().optional(),
    supporting_evidence_ids: z.array(z.string().uuid()).optional(),
  })),
  unsupported_claims: z.array(z.object({
    claim_text: z.string(),
    reason: z.string(),
  })).optional(),
  model_run_id: z.string().optional(),
});

export type LexosArgumentDraftResult = z.infer<typeof LexosArgumentDraftResultSchema>;

/**
 * W9: Perform adversarial critique
 * Request: lexos.adversarial.review
 */
export const LexosAdversarialReviewRequestSchema = z.object({
  tenant_id: z.string().uuid(),
  matter_id: z.string().uuid(),
  argument_draft_id: z.string().uuid(),
  critique_depth: z.enum(["surface", "moderate", "stress_test"]).default("moderate"),
  adversary_profile: z.enum(["opposing_counsel", "judicial_skeptic", "expert_challenger"]).default("opposing_counsel"),
  model_routing_profile: z.string().optional(),
});

export type LexosAdversarialReviewRequest = z.infer<typeof LexosAdversarialReviewRequestSchema>;

export const LexosAdversarialReviewResultSchema = z.object({
  adversarial_critique_id: z.string().uuid(),
  attack_matrix: z.array(z.object({
    target_node_id: z.string(),
    attack_vector: z.string(),
    severity: z.enum(["low", "moderate", "high", "critical"]),
    suggested_response: z.string().optional(),
  })),
  weakness_register: z.array(z.object({
    weakness_id: z.string(),
    category: z.enum(["factual", "legal", "logical", "procedural", "evidentiary"]),
    description: z.string(),
    severity: z.enum(["low", "moderate", "high", "critical"]),
  })),
  revision_checklist: z.array(z.string()),
  model_run_id: z.string().optional(),
});

export type LexosAdversarialReviewResult = z.infer<typeof LexosAdversarialReviewResultSchema>;

/**
 * W11: Generate final output artifact
 * Request: lexos.output.generate
 */
export const LexosOutputGenerateRequestSchema = z.object({
  tenant_id: z.string().uuid(),
  matter_id: z.string().uuid(),
  argument_draft_id: z.string().uuid(),
  adversarial_critique_id: z.string().uuid().optional(),
  output_format: z.enum(["pdf", "docx", "markdown", "html"]).default("pdf"),
  include_exhibits: z.boolean().default(true),
  include_cover_page: z.boolean().default(true),
  include_table_of_authorities: z.boolean().default(true),
  model_routing_profile: z.string().optional(),
});

export type LexosOutputGenerateRequest = z.infer<typeof LexosOutputGenerateRequestSchema>;

export const LexosOutputGenerateResultSchema = z.object({
  output_artifact_id: z.string().uuid(),
  matter_id: z.string().uuid(),
  artifact_type: z.string(),
  artifact_uri: z.string(),
  file_format: z.enum(["pdf", "docx", "markdown", "html"]),
  file_size_bytes: z.number().int().optional(),
  caveat_preservation_check: z.object({
    caveats_preserved: z.boolean(),
    missing_caveats: z.array(z.string()).optional(),
  }),
  model_run_id: z.string().optional(),
});

export type LexosOutputGenerateResult = z.infer<typeof LexosOutputGenerateResultSchema>;

/* -------------------------------------------------------------------------- */
/* §8 Union Types for Work Requests and Results                               */
/* -------------------------------------------------------------------------- */

export const LexosWorkRequestPayloadSchema = z.union([
  LexosIntakeNewRequestSchema,
  LexosMatterCreateRequestSchema,
  LexosStoryDevelopRequestSchema,
  LexosEvidenceIngestRequestSchema,
  LexosAssertionsExtractRequestSchema,
  LexosSupportMapRequestSchema,
  LexosStrategyDevelopRequestSchema,
  LexosResearchConductRequestSchema,
  LexosArgumentDraftRequestSchema,
  LexosAdversarialReviewRequestSchema,
  LexosOutputGenerateRequestSchema,
]);

export type LexosWorkRequestPayload = z.infer<typeof LexosWorkRequestPayloadSchema>;

export const LexosWorkResultSchema = z.union([
  LexosIntakeNewResultSchema,
  LexosMatterCreateResultSchema,
  LexosStoryDevelopResultSchema,
  LexosEvidenceIngestResultSchema,
  LexosAssertionsExtractResultSchema,
  LexosSupportMapResultSchema,
  LexosStrategyDevelopResultSchema,
  LexosResearchConductResultSchema,
  LexosArgumentDraftResultSchema,
  LexosAdversarialReviewResultSchema,
  LexosOutputGenerateResultSchema,
]);

export type LexosWorkResult = z.infer<typeof LexosWorkResultSchema>;

/* -------------------------------------------------------------------------- */
/* §9 LEXOS Work Request Type Discriminator                                   */
/* -------------------------------------------------------------------------- */

export interface LexosWorkRequest {
  work_request_id: string;
  tenant_id: string;
  plugin_id: typeof LEXOS_PLUGIN_ID;
  work_request_type: LexosWorkRequestType;
  payload: LexosWorkRequestPayload;
  requested_by: {
    actor_kind: "user" | "system" | "bot";
    actor_id: string;
  };
  created_at: string;
  idempotency_key: string;
}

/* -------------------------------------------------------------------------- */
/* §10 LEXOS Domain Object References                                         */
/* -------------------------------------------------------------------------- */

export interface LexosMatterRef {
  matter_id: string;
  client_id: string;
  tenant_id: string;
  matter_name: string;
}

export interface LexosClientRef {
  client_id: string;
  tenant_id: string;
  client_name: string;
}

export interface LexosIntakeRef {
  intake_id: string;
  tenant_id: string;
  intake_status: string;
}

/* -------------------------------------------------------------------------- */
/* §11 LEXOS Run Output (analogous to PreviewOutput)                          */
/* -------------------------------------------------------------------------- */

export const LexosRunOutputStatusSchema = z.enum([
  "succeeded",
  "partial",
  "failed",
  "awaiting_approval",
]);

export type LexosRunOutputStatus = z.infer<typeof LexosRunOutputStatusSchema>;

export interface LexosRunOutput {
  run_id: string;
  tenant_id: string;
  plugin_id: typeof LEXOS_PLUGIN_ID;
  work_request_type: LexosWorkRequestType;

  // Domain object references
  matter_id: string | null;
  client_id: string | null;
  intake_id: string | null;

  // Result payload
  result: LexosWorkResult | null;

  // Cross-plane refs
  lease_ids: string[];
  workflow_run_ids: string[];
  audit_event_ids: string[];

  status: LexosRunOutputStatus;
  finalized_at?: string;
}

/* -------------------------------------------------------------------------- */
/* §12 LEXOS Capability Lease Arguments/Results                               */
/* -------------------------------------------------------------------------- */

export const LexosCapabilityLeaseArgsSchema = {
  "cap.storage.supabase": z.object({
    tenant_id: z.string().uuid(),
    operation: z.enum(["file.upload", "file.download", "query.execute", "row.upsert"]),
    table: z.string().optional(),
    payload: z.record(z.unknown()).optional(),
  }),

  "cap.storage.evidence": z.object({
    tenant_id: z.string().uuid(),
    operation: z.enum(["evidence.store", "original.preserve", "derivative.store"]),
    evidence_id: z.string().uuid(),
    file_uri: z.string(),
  }),

  "cap.extraction.parser": z.object({
    tenant_id: z.string().uuid(),
    operation: z.enum(["document.parse", "markdown.extract", "json.extract"]),
    evidence_id: z.string().uuid(),
    file_uri: z.string(),
  }),

  "cap.extraction.ocr": z.object({
    tenant_id: z.string().uuid(),
    operation: z.enum(["text.extract", "confidence.score"]),
    evidence_id: z.string().uuid(),
    image_uri: z.string(),
  }),

  "cap.extraction.qa": z.object({
    tenant_id: z.string().uuid(),
    operation: z.enum(["extraction.compare", "quality.assess", "flag.generate"]),
    evidence_id: z.string().uuid(),
    extraction_ids: z.array(z.string().uuid()),
  }),

  "cap.research.legal": z.object({
    tenant_id: z.string().uuid(),
    operation: z.enum(["authority.search", "citation.verify", "jurisdiction.check"]),
    query: z.string(),
    jurisdiction: z.string().optional(),
  }),

  "cap.research.public_web": z.object({
    tenant_id: z.string().uuid(),
    operation: z.enum(["search.query", "page.fetch", "citation.extract"]),
    query: z.string(),
  }),

  "cap.llm.generation": z.object({
    tenant_id: z.string().uuid(),
    operation: z.enum(["text.generate", "structured.generate", "embeddings.create"]),
    prompt: z.string(),
    model_profile: z.string().optional(),
  }),

  "cap.crm.mock": z.object({
    tenant_id: z.string().uuid(),
    operation: z.enum(["lead.read_mock", "lead.status.update"]),
    lead_id: z.string(),
  }),

  "cap.plane.mock": z.object({
    tenant_id: z.string().uuid(),
    operation: z.enum(["project.ensure_mock", "task.ensure_mock"]),
    project_name: z.string(),
  }),
};

export type LexosCapabilityLeaseArgs = {
  [K in keyof typeof LexosCapabilityLeaseArgsSchema]: z.infer<(typeof LexosCapabilityLeaseArgsSchema)[K]>;
};
