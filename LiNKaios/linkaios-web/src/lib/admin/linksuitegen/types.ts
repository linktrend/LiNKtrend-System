/** LiNKsuitegen Admin candidate lifecycle — mirrors linkaios_admin.generated_suite_candidates. */

export const CANDIDATE_STATUSES = [
  "handoff_received",
  "schema_check_running",
  "schema_check_failed",
  "admin_draft_installed",
  "machine_review_required",
  "machine_review_running",
  "machine_review_failed",
  "machine_review_passed",
  "human_review_required",
  "human_review_failed",
  "human_review_approved",
  "commerce_setup_required",
  "commerce_setup_failed",
  "publish_ready",
  "published",
  "rejected",
  "retired",
  "superseded",
] as const;

export type CandidateStatus = (typeof CANDIDATE_STATUSES)[number];

export type GeneratedSuiteCandidate = {
  candidate_id: string;
  suite_id: string;
  suite_family: string;
  suite_version: string;
  display_name: string;
  status: CandidateStatus;
  audience: "linkaios_admin_only" | "linkaios_client_marketplace";
  bundle_id: string;
  bundle_uri: string;
  validation_status: string;
  admin_only: boolean;
  client_marketplace_visible: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  handoff_id?: string;
  validation_score?: number;
};

export type MachineReviewRecord = {
  machine_review_id: string;
  candidate_id: string;
  status: "pending" | "running" | "passed" | "failed" | "cancelled";
  run_refs: Array<Record<string, unknown>>;
  report_json: Record<string, unknown>;
  started_at?: string;
  completed_at?: string;
  created_at: string;
};

export type HumanReviewRecord = {
  human_review_id: string;
  candidate_id: string;
  reviewer_id: string;
  decision: "approved" | "changes_requested" | "rejected" | "requires_domain_review" | "requires_more_machine_review";
  decision_notes: string;
  created_at: string;
};

export type HandoffImportBody = {
  handoff_id: string;
  schema_version: string;
  suite_id: string;
  suite_family: string;
  suite_version: string;
  bundle_path: string;
  validation_status: "validated" | "failed" | "pending";
  display_name?: string;
  target_context?: Record<string, unknown>;
  admin_install_target?: { admin_only_source_suite?: boolean };
};
