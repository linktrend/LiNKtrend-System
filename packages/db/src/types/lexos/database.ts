/**
 * LEXOS Database Types
 *
 * Generated from WP-094 adapted schema migrations:
 * - 001_identity_intake_clients_matters.sql
 * - 002_evidence_and_extractions.sql
 * - 003_assertions_support_risks.sql
 *
 * These types represent the adapted LEXOS schema for LiNKaios vertical plugin.
 * All tables are prefixed with `lexos_` and include tenant_id for multi-tenancy.
 */

/* -------------------------------------------------------------------------- */
/* §1 Common Enums and Shared Types                                         */
/* -------------------------------------------------------------------------- */

export type LexosUserRole =
  | "admin"
  | "operator"
  | "reviewer"
  | "read_only"
  | "system_agent";

export type LexosUserStatus = "active" | "inactive" | "suspended";

export type LexosIntakeStatus =
  | "new"
  | "in_progress"
  | "waiting_for_information"
  | "conflict_check_pending"
  | "kyc_pending"
  | "engagement_pending"
  | "lead_attorney_review"
  | "accepted"
  | "rejected"
  | "abandoned"
  | "archived";

export type LexosConflictStatus =
  | "unknown"
  | "pending"
  | "clear"
  | "potential_conflict"
  | "conflict_identified"
  | "waiver_required"
  | "blocked";

export type LexosKycStatus =
  | "unknown"
  | "not_required"
  | "pending"
  | "in_progress"
  | "passed"
  | "failed"
  | "requires_review";

export type LexosEngagementStatus =
  | "not_started"
  | "pending"
  | "sent"
  | "signed"
  | "declined"
  | "not_required"
  | "blocked";

export type LexosConfidentialityStatus =
  | "unknown"
  | "public"
  | "internal"
  | "confidential"
  | "highly_confidential"
  | "restricted";

export type LexosPrivilegeStatus =
  | "unknown"
  | "not_privileged"
  | "potentially_privileged"
  | "privileged"
  | "work_product"
  | "restricted";

export type LexosPosture =
  | "plaintiff"
  | "defence"
  | "defense"
  | "regulatory"
  | "criminal_defence"
  | "commercial_dispute"
  | "advisory"
  | "internal"
  | "unknown";

export type LexosMatterStatus =
  | "draft"
  | "active"
  | "paused"
  | "blocked"
  | "under_review"
  | "closed"
  | "archived";

export type LexosWorkflowStage =
  | "W0"
  | "W1"
  | "W2"
  | "W3"
  | "W4"
  | "W5"
  | "W6"
  | "W7"
  | "W8"
  | "W9"
  | "W10"
  | "W11";

export type LexosTaskStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled"
  | "needs_review";

export type LexosEvidenceMediaType =
  | "pdf"
  | "docx"
  | "txt"
  | "markdown"
  | "image"
  | "screenshot"
  | "audio"
  | "video"
  | "spreadsheet"
  | "email_export"
  | "message_export"
  | "unknown";

export type LexosProcessingStatus =
  | "uploaded"
  | "queued"
  | "processing"
  | "processed"
  | "qa_flagged"
  | "failed"
  | "requires_human_review"
  | "superseded"
  | "requires_reupload"
  | "archived";

export type LexosExtractionType =
  | "text_document"
  | "scanned_document"
  | "image_with_text"
  | "image_without_text"
  | "audio_transcript"
  | "video_transcript"
  | "video_visual_timeline"
  | "metadata_only"
  | "manual_extraction";

export type LexosExtractionQualityStatus =
  | "accepted"
  | "qa_flagged"
  | "failed"
  | "human_review_required";

export type LexosCaseStoryStatus =
  | "draft"
  | "under_review"
  | "approved_internal"
  | "final_internal"
  | "superseded"
  | "archived";

export type LexosTruthState =
  | "verified"
  | "client_confirmed"
  | "opposing_party_alleged"
  | "partially_supported"
  | "pending_verification"
  | "unsupported"
  | "contradicted"
  | "rejected"
  | "superseded";

export type LexosSupportState =
  | "supported"
  | "partially_supported"
  | "unsupported"
  | "contradicted"
  | "pending";

export type LexosAssertionUseStatus =
  | "usable"
  | "use_with_caution"
  | "do_not_use"
  | "pending_review"
  | "superseded";

export type LexosRiskSeverity = "low" | "moderate" | "high" | "critical";

export type LexosRiskStatus = "open" | "mitigated" | "accepted" | "closed" | "superseded";

/* -------------------------------------------------------------------------- */
/* §2 JSON/Metadata Types                                                     */
/* -------------------------------------------------------------------------- */

export interface LexosContactDetails {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface LexosAdverseParty {
  name: string;
  type?: string;
  role?: string;
  contact?: LexosContactDetails;
}

export interface LexosDeadlineFlag {
  type: string;
  date: string;
  description: string;
  urgent: boolean;
}

export interface LexosQualityFlag {
  flag_type: string;
  severity: "low" | "moderate" | "high";
  description: string;
  location?: string;
}

export interface LexosTimecodedSegment {
  start_time: string;
  end_time: string;
  text: string;
  speaker?: string;
}

export interface LexosFrameReference {
  timestamp: string;
  frame_number: number;
  description: string;
}

/* -------------------------------------------------------------------------- */
/* §3 Core Identity Tables (Migration 001)                                  */
/* -------------------------------------------------------------------------- */

export interface LexosUserProfile {
  id: string;
  tenant_id: string;
  email: string | null;
  display_name: string | null;
  role: LexosUserRole | null;
  status: LexosUserStatus | null;
  created_at: string;
  updated_at: string;
}

export interface LexosUserProfileInsert {
  id: string;
  tenant_id: string;
  email?: string | null;
  display_name?: string | null;
  role?: LexosUserRole | null;
  status?: LexosUserStatus | null;
  created_at?: string;
  updated_at?: string;
}

export interface LexosUserProfileUpdate {
  email?: string | null;
  display_name?: string | null;
  role?: LexosUserRole | null;
  status?: LexosUserStatus | null;
  updated_at?: string;
}

export interface LexosIntakeRecord {
  id: string;
  tenant_id: string;
  intake_type: string | null;
  intake_status: LexosIntakeStatus | null;
  source: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  assigned_operator: string | null;
  urgency_level: string | null;
  conflict_status: LexosConflictStatus | null;
  kyc_status: LexosKycStatus | null;
  engagement_status: LexosEngagementStatus | null;
  lead_attorney_review_status: string | null;
  handoff_status: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  abandoned_at: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
}

export interface LexosIntakeRecordInsert {
  id?: string;
  tenant_id: string;
  intake_type?: string | null;
  intake_status?: LexosIntakeStatus | null;
  source?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  assigned_operator?: string | null;
  urgency_level?: string | null;
  conflict_status?: LexosConflictStatus | null;
  kyc_status?: LexosKycStatus | null;
  engagement_status?: LexosEngagementStatus | null;
  lead_attorney_review_status?: string | null;
  handoff_status?: string | null;
  accepted_at?: string | null;
  rejected_at?: string | null;
  abandoned_at?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface LexosIntakeRecordUpdate {
  intake_type?: string | null;
  intake_status?: LexosIntakeStatus | null;
  source?: string | null;
  updated_at?: string;
  updated_by?: string | null;
  assigned_operator?: string | null;
  urgency_level?: string | null;
  conflict_status?: LexosConflictStatus | null;
  kyc_status?: LexosKycStatus | null;
  engagement_status?: LexosEngagementStatus | null;
  lead_attorney_review_status?: string | null;
  handoff_status?: string | null;
  accepted_at?: string | null;
  rejected_at?: string | null;
  abandoned_at?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface LexosIntakeGroup {
  id: string;
  tenant_id: string;
  intake_id: string | null;
  relationship_type: string | null;
  shared_matter_candidate_id: string | null;
  joint_representation_flag: boolean;
  potential_internal_conflict_flag: boolean;
  group_conflict_status: string | null;
  group_consent_status: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
}

export interface LexosIntakeGroupInsert {
  id?: string;
  tenant_id: string;
  intake_id?: string | null;
  relationship_type?: string | null;
  shared_matter_candidate_id?: string | null;
  joint_representation_flag?: boolean;
  potential_internal_conflict_flag?: boolean;
  group_conflict_status?: string | null;
  group_consent_status?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface LexosClientCandidate {
  id: string;
  tenant_id: string;
  intake_id: string | null;
  intake_group_id: string | null;
  name: string | null;
  client_type: string | null;
  contact_details: LexosContactDetails | null;
  identity_status: string | null;
  kyc_status: LexosKycStatus | null;
  conflict_status: LexosConflictStatus | null;
  authority_status: string | null;
  representative_status: string | null;
  engagement_status: LexosEngagementStatus | null;
  consent_status: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
}

export interface LexosClientCandidateInsert {
  id?: string;
  tenant_id: string;
  intake_id?: string | null;
  intake_group_id?: string | null;
  name?: string | null;
  client_type?: string | null;
  contact_details?: LexosContactDetails | null;
  identity_status?: string | null;
  kyc_status?: LexosKycStatus | null;
  conflict_status?: LexosConflictStatus | null;
  authority_status?: string | null;
  representative_status?: string | null;
  engagement_status?: LexosEngagementStatus | null;
  consent_status?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface LexosMatterCandidate {
  id: string;
  tenant_id: string;
  intake_id: string | null;
  intake_group_id: string | null;
  proposed_matter_name: string | null;
  matter_type: string | null;
  posture: LexosPosture | null;
  jurisdiction: string | null;
  adverse_parties: LexosAdverseParty[] | null;
  related_parties: LexosAdverseParty[] | null;
  deadline_flags: LexosDeadlineFlag[] | null;
  urgency_level: string | null;
  engagement_status: LexosEngagementStatus | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
}

export interface LexosMatterCandidateInsert {
  id?: string;
  tenant_id: string;
  intake_id?: string | null;
  intake_group_id?: string | null;
  proposed_matter_name?: string | null;
  matter_type?: string | null;
  posture?: LexosPosture | null;
  jurisdiction?: string | null;
  adverse_parties?: LexosAdverseParty[] | null;
  related_parties?: LexosAdverseParty[] | null;
  deadline_flags?: LexosDeadlineFlag[] | null;
  urgency_level?: string | null;
  engagement_status?: LexosEngagementStatus | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface LexosIntakeTask {
  id: string;
  tenant_id: string;
  intake_id: string | null;
  intake_group_id: string | null;
  client_candidate_id: string | null;
  matter_candidate_id: string | null;
  assigned_agent: string | null;
  assigned_user_id: string | null;
  task_type: string | null;
  status: LexosTaskStatus | null;
  result_summary: string | null;
  risk_id: string | null;
  created_at: string;
  updated_at: string;
  due_at: string | null;
  completed_at: string | null;
  metadata: Record<string, unknown> | null;
}

export interface LexosIntakeTaskInsert {
  id?: string;
  tenant_id: string;
  intake_id?: string | null;
  intake_group_id?: string | null;
  client_candidate_id?: string | null;
  matter_candidate_id?: string | null;
  assigned_agent?: string | null;
  assigned_user_id?: string | null;
  task_type?: string | null;
  status?: LexosTaskStatus | null;
  result_summary?: string | null;
  risk_id?: string | null;
  created_at?: string;
  updated_at?: string;
  due_at?: string | null;
  completed_at?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface LexosClient {
  id: string;
  tenant_id: string;
  client_name: string;
  client_type: string | null;
  primary_contact: LexosContactDetails | null;
  jurisdiction: string | null;
  status: LexosUserStatus | null;
  client_master_story: string | null;
  created_from_intake_id: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  confidentiality_status: LexosConfidentialityStatus | null;
  privilege_status: LexosPrivilegeStatus | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
}

export interface LexosClientInsert {
  id?: string;
  tenant_id: string;
  client_name: string;
  client_type?: string | null;
  primary_contact?: LexosContactDetails | null;
  jurisdiction?: string | null;
  status?: LexosUserStatus | null;
  client_master_story?: string | null;
  created_from_intake_id?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  confidentiality_status?: LexosConfidentialityStatus | null;
  privilege_status?: LexosPrivilegeStatus | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface LexosClientUpdate {
  client_name?: string;
  client_type?: string | null;
  primary_contact?: LexosContactDetails | null;
  jurisdiction?: string | null;
  status?: LexosUserStatus | null;
  client_master_story?: string | null;
  updated_at?: string;
  updated_by?: string | null;
  confidentiality_status?: LexosConfidentialityStatus | null;
  privilege_status?: LexosPrivilegeStatus | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface LexosMatter {
  id: string;
  tenant_id: string;
  client_id: string;
  matter_name: string;
  matter_type: string | null;
  posture: LexosPosture | null;
  jurisdiction: string | null;
  status: LexosMatterStatus | null;
  current_workflow: LexosWorkflowStage | null;
  created_from_intake_id: string | null;
  created_from_matter_candidate_id: string | null;
  opened_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  confidentiality_status: LexosConfidentialityStatus | null;
  privilege_status: LexosPrivilegeStatus | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
}

export interface LexosMatterInsert {
  id?: string;
  tenant_id: string;
  client_id: string;
  matter_name: string;
  matter_type?: string | null;
  posture?: LexosPosture | null;
  jurisdiction?: string | null;
  status?: LexosMatterStatus | null;
  current_workflow?: LexosWorkflowStage | null;
  created_from_intake_id?: string | null;
  created_from_matter_candidate_id?: string | null;
  opened_at?: string | null;
  closed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  confidentiality_status?: LexosConfidentialityStatus | null;
  privilege_status?: LexosPrivilegeStatus | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface LexosMatterUpdate {
  matter_name?: string;
  matter_type?: string | null;
  posture?: LexosPosture | null;
  jurisdiction?: string | null;
  status?: LexosMatterStatus | null;
  current_workflow?: LexosWorkflowStage | null;
  opened_at?: string | null;
  closed_at?: string | null;
  updated_at?: string;
  updated_by?: string | null;
  confidentiality_status?: LexosConfidentialityStatus | null;
  privilege_status?: LexosPrivilegeStatus | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
}

/* -------------------------------------------------------------------------- */
/* §4 Evidence Tables (Migration 002)                                       */
/* -------------------------------------------------------------------------- */

export interface LexosSource {
  id: string;
  tenant_id: string;
  client_id: string;
  matter_id: string;
  source_name: string | null;
  source_type: string | null;
  provided_by: string | null;
  received_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  confidentiality_status: LexosConfidentialityStatus | null;
  privilege_status: LexosPrivilegeStatus | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
}

export interface LexosSourceInsert {
  id?: string;
  tenant_id: string;
  client_id: string;
  matter_id: string;
  source_name?: string | null;
  source_type?: string | null;
  provided_by?: string | null;
  received_at?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  confidentiality_status?: LexosConfidentialityStatus | null;
  privilege_status?: LexosPrivilegeStatus | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface LexosEvidence {
  id: string;
  tenant_id: string;
  client_id: string;
  matter_id: string;
  source_id: string | null;
  evidence_label: string | null;
  file_name: string | null;
  file_type: string | null;
  evidence_media_type: LexosEvidenceMediaType | null;
  source_type: string | null;
  language: string | null;
  original_file_uri: string | null;
  original_file_hash: string | null;
  processing_status: LexosProcessingStatus | null;
  extraction_status: string | null;
  quality_status: string | null;
  human_review_required: boolean;
  uploaded_by: string | null;
  uploaded_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  confidentiality_status: LexosConfidentialityStatus | null;
  privilege_status: LexosPrivilegeStatus | null;
  legal_hold: boolean;
  notes: string | null;
  metadata_json: Record<string, unknown> | null;
}

export interface LexosEvidenceInsert {
  id?: string;
  tenant_id: string;
  client_id: string;
  matter_id: string;
  source_id?: string | null;
  evidence_label?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  evidence_media_type?: LexosEvidenceMediaType | null;
  source_type?: string | null;
  language?: string | null;
  original_file_uri?: string | null;
  original_file_hash?: string | null;
  processing_status?: LexosProcessingStatus | null;
  extraction_status?: string | null;
  quality_status?: string | null;
  human_review_required?: boolean;
  uploaded_by?: string | null;
  uploaded_at?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  confidentiality_status?: LexosConfidentialityStatus | null;
  privilege_status?: LexosPrivilegeStatus | null;
  legal_hold?: boolean;
  notes?: string | null;
  metadata_json?: Record<string, unknown> | null;
}

export interface LexosEvidenceExtraction {
  id: string;
  tenant_id: string;
  evidence_id: string;
  client_id: string;
  matter_id: string;
  extraction_type: LexosExtractionType | null;
  markdown_uri: string | null;
  markdown_text: string | null;
  json_uri: string | null;
  json_content: Record<string, unknown> | null;
  transcript_uri: string | null;
  transcript_json: Record<string, unknown> | null;
  visual_description: string | null;
  ocr_text: string | null;
  timecoded_segments: LexosTimecodedSegment[] | null;
  frame_references: LexosFrameReference[] | null;
  extraction_tool: string | null;
  extraction_model: string | null;
  qa_model: string | null;
  extraction_quality_score: number | null;
  extraction_quality_status: LexosExtractionQualityStatus | null;
  quality_flags: LexosQualityFlag[] | null;
  human_review_required: boolean;
  is_current: boolean;
  supersedes_extraction_id: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  confidentiality_status: LexosConfidentialityStatus | null;
  privilege_status: LexosPrivilegeStatus | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
}

export interface LexosEvidenceExtractionInsert {
  id?: string;
  tenant_id: string;
  evidence_id: string;
  client_id: string;
  matter_id: string;
  extraction_type?: LexosExtractionType | null;
  markdown_uri?: string | null;
  markdown_text?: string | null;
  json_uri?: string | null;
  json_content?: Record<string, unknown> | null;
  transcript_uri?: string | null;
  transcript_json?: Record<string, unknown> | null;
  visual_description?: string | null;
  ocr_text?: string | null;
  timecoded_segments?: LexosTimecodedSegment[] | null;
  frame_references?: LexosFrameReference[] | null;
  extraction_tool?: string | null;
  extraction_model?: string | null;
  qa_model?: string | null;
  extraction_quality_score?: number | null;
  extraction_quality_status?: LexosExtractionQualityStatus | null;
  quality_flags?: LexosQualityFlag[] | null;
  human_review_required?: boolean;
  is_current?: boolean;
  supersedes_extraction_id?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  confidentiality_status?: LexosConfidentialityStatus | null;
  privilege_status?: LexosPrivilegeStatus | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
}

/* -------------------------------------------------------------------------- */
/* §5 Assertions and Support Matrix (Migration 003)                       */
/* -------------------------------------------------------------------------- */

export interface LexosCaseStory {
  id: string;
  tenant_id: string;
  client_id: string;
  matter_id: string;
  title: string | null;
  content_markdown: string | null;
  version: number;
  status: LexosCaseStoryStatus | null;
  workflow_origin: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  model_used: string | null;
  prompt_version: string | null;
  confidentiality_status: LexosConfidentialityStatus | null;
  privilege_status: LexosPrivilegeStatus | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
}

export interface LexosCaseStoryInsert {
  id?: string;
  tenant_id: string;
  client_id: string;
  matter_id: string;
  title?: string | null;
  content_markdown?: string | null;
  version?: number;
  status?: LexosCaseStoryStatus | null;
  workflow_origin?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  model_used?: string | null;
  prompt_version?: string | null;
  confidentiality_status?: LexosConfidentialityStatus | null;
  privilege_status?: LexosPrivilegeStatus | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface LexosAssertion {
  id: string;
  tenant_id: string;
  client_id: string;
  matter_id: string;
  case_story_id: string | null;
  assertion_text: string;
  assertion_type: string | null;
  truth_state: LexosTruthState | null;
  support_state: LexosSupportState | null;
  use_status: LexosAssertionUseStatus | null;
  contradiction_flag: boolean;
  confidence: number | null;
  source_ids: string[] | null;
  evidence_ids: string[] | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  confidentiality_status: LexosConfidentialityStatus | null;
  privilege_status: LexosPrivilegeStatus | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
}

export interface LexosAssertionInsert {
  id?: string;
  tenant_id: string;
  client_id: string;
  matter_id: string;
  case_story_id?: string | null;
  assertion_text: string;
  assertion_type?: string | null;
  truth_state?: LexosTruthState | null;
  support_state?: LexosSupportState | null;
  use_status?: LexosAssertionUseStatus | null;
  contradiction_flag?: boolean;
  confidence?: number | null;
  source_ids?: string[] | null;
  evidence_ids?: string[] | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  confidentiality_status?: LexosConfidentialityStatus | null;
  privilege_status?: LexosPrivilegeStatus | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface LexosSupportMatrixItem {
  id: string;
  tenant_id: string;
  client_id: string;
  matter_id: string;
  assertion_id: string;
  evidence_id: string | null;
  extraction_id: string | null;
  support_state: LexosSupportState | null;
  support_explanation: string | null;
  evidence_excerpt: string | null;
  page_reference: string | null;
  timecode_reference: string | null;
  frame_reference: string | null;
  risk_level: LexosRiskSeverity | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  confidentiality_status: LexosConfidentialityStatus | null;
  privilege_status: LexosPrivilegeStatus | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
}

export interface LexosSupportMatrixItemInsert {
  id?: string;
  tenant_id: string;
  client_id: string;
  matter_id: string;
  assertion_id: string;
  evidence_id?: string | null;
  extraction_id?: string | null;
  support_state?: LexosSupportState | null;
  support_explanation?: string | null;
  evidence_excerpt?: string | null;
  page_reference?: string | null;
  timecode_reference?: string | null;
  frame_reference?: string | null;
  risk_level?: LexosRiskSeverity | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  confidentiality_status?: LexosConfidentialityStatus | null;
  privilege_status?: LexosPrivilegeStatus | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface LexosRisk {
  id: string;
  tenant_id: string;
  client_id: string | null;
  matter_id: string | null;
  risk_title: string | null;
  risk_type: string | null;
  severity: LexosRiskSeverity | null;
  status: LexosRiskStatus | null;
  linked_object_type: string | null;
  linked_object_id: string | null;
  description: string | null;
  mitigation: string | null;
  owner_user_id: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  confidentiality_status: LexosConfidentialityStatus | null;
  privilege_status: LexosPrivilegeStatus | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
}

export interface LexosRiskInsert {
  id?: string;
  tenant_id: string;
  client_id?: string | null;
  matter_id?: string | null;
  risk_title?: string | null;
  risk_type?: string | null;
  severity?: LexosRiskSeverity | null;
  status?: LexosRiskStatus | null;
  linked_object_type?: string | null;
  linked_object_id?: string | null;
  description?: string | null;
  mitigation?: string | null;
  owner_user_id?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  confidentiality_status?: LexosConfidentialityStatus | null;
  privilege_status?: LexosPrivilegeStatus | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
}

/* -------------------------------------------------------------------------- */
/* §6 Database Table Name Constants                                           */
/* -------------------------------------------------------------------------- */

export const LEXOS_TABLES = {
  // Core identity
  USER_PROFILES: "lexos_user_profiles",
  INTAKE_RECORDS: "lexos_intake_records",
  INTAKE_GROUPS: "lexos_intake_groups",
  CLIENT_CANDIDATES: "lexos_client_candidates",
  MATTER_CANDIDATES: "lexos_matter_candidates",
  INTAKE_TASKS: "lexos_intake_tasks",
  CLIENTS: "lexos_clients",
  MATTERS: "lexos_matters",

  // Evidence
  SOURCES: "lexos_sources",
  EVIDENCE: "lexos_evidence",
  EVIDENCE_EXTRACTIONS: "lexos_evidence_extractions",

  // Assertions and support
  CASE_STORIES: "lexos_case_stories",
  ASSERTIONS: "lexos_assertions",
  SUPPORT_MATRIX_ITEMS: "lexos_support_matrix_items",
  RISKS: "lexos_risks",
} as const;

/* -------------------------------------------------------------------------- */
/* §7 Type Helpers                                                            */
/* -------------------------------------------------------------------------- */

export type LexosTableName = (typeof LEXOS_TABLES)[keyof typeof LEXOS_TABLES];

export interface LexosDbRowMap {
  [LEXOS_TABLES.USER_PROFILES]: LexosUserProfile;
  [LEXOS_TABLES.INTAKE_RECORDS]: LexosIntakeRecord;
  [LEXOS_TABLES.INTAKE_GROUPS]: LexosIntakeGroup;
  [LEXOS_TABLES.CLIENT_CANDIDATES]: LexosClientCandidate;
  [LEXOS_TABLES.MATTER_CANDIDATES]: LexosMatterCandidate;
  [LEXOS_TABLES.INTAKE_TASKS]: LexosIntakeTask;
  [LEXOS_TABLES.CLIENTS]: LexosClient;
  [LEXOS_TABLES.MATTERS]: LexosMatter;
  [LEXOS_TABLES.SOURCES]: LexosSource;
  [LEXOS_TABLES.EVIDENCE]: LexosEvidence;
  [LEXOS_TABLES.EVIDENCE_EXTRACTIONS]: LexosEvidenceExtraction;
  [LEXOS_TABLES.CASE_STORIES]: LexosCaseStory;
  [LEXOS_TABLES.ASSERTIONS]: LexosAssertion;
  [LEXOS_TABLES.SUPPORT_MATRIX_ITEMS]: LexosSupportMatrixItem;
  [LEXOS_TABLES.RISKS]: LexosRisk;
}
