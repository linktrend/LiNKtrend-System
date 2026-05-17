/**
 * LEXOS LiNKautowork Workflow Hooks
 *
 * Deterministic workflow handlers for LEXOS litigation vertical plugin.
 * Per WP-105 and LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md §4.
 *
 * Workflow Handles:
 * - autowork.lexos.evidence_ingest (W4)
 * - autowork.lexos.extraction_run (W4)
 * - autowork.lexos.assertion_sync (W5)
 * - autowork.lexos.artifact_generate (W10/W11)
 * - autowork.lexos.crm_sync (W0)
 */

import { createHash, randomUUID } from "node:crypto";
import type { WorkflowInvokeRequest } from "@linktrend/linklogic-sdk";
import type { AuditEmitter } from "../lib/audit-emitter.js";
import type { WorkflowHandler, WorkflowContext } from "../types/index.js";

// Workflow handle constants per lexos-contracts.ts
export const EVIDENCE_INGEST_HANDLE = "autowork.lexos.evidence_ingest";
export const EXTRACTION_RUN_HANDLE = "autowork.lexos.extraction_run";
export const ASSERTION_SYNC_HANDLE = "autowork.lexos.assertion_sync";
export const ARTIFACT_GENERATE_HANDLE = "autowork.lexos.artifact_generate";
export const CRM_SYNC_HANDLE = "autowork.lexos.crm_sync";

// In-memory stores for development-mode stub behavior
const evidenceStore = new Map<string, Record<string, unknown>>();
const extractionStore = new Map<string, Record<string, unknown>>();
const assertionSyncStore = new Map<string, Record<string, unknown>>();
const artifactStore = new Map<string, Record<string, unknown>>();
const crmSyncStore = new Map<string, Record<string, unknown>>();

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function readInput(request: WorkflowInvokeRequest, key: string): unknown {
  return (request.inputs as Record<string, unknown>)[key];
}

function asString(request: WorkflowInvokeRequest, key: string): string | undefined {
  const value = readInput(request, key);
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asStringArray(request: WorkflowInvokeRequest, key: string): string[] {
  const value = readInput(request, key);
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

function asBoolean(request: WorkflowInvokeRequest, key: string, defaultValue = false): boolean {
  const value = readInput(request, key);
  return typeof value === "boolean" ? value : defaultValue;
}

function fail(
  code: string,
  message: string,
  retryable = false,
): { code: string; message: string; retryable: boolean } {
  return { code, message, retryable };
}

function requireLeaseId(request: WorkflowInvokeRequest):
  | { ok: true; leaseId: string }
  | { ok: false; failure: { code: string; message: string; retryable: boolean } } {
  if (!request.lease_id || request.lease_id.trim().length === 0) {
    return {
      ok: false,
      failure: fail("LEASE_REQUEST_INVALID", "Missing required lease_id for side-effecting workflow"),
    };
  }
  return { ok: true, leaseId: request.lease_id };
}

async function withAudit(
  request: WorkflowInvokeRequest,
  workflow_run_id: string,
  auditEmitter: AuditEmitter,
  run: (invokedEventId: string) => Promise<
    | { outputs: Record<string, unknown> }
    | { failure: { code: string; message: string; retryable: boolean } }
  >,
): Promise<
  | { outputs: Record<string, unknown>; audit_event_ids: string[] }
  | { failure: { code: string; message: string; retryable: boolean }; audit_event_ids: string[] }
> {
  const invokedEventId = await auditEmitter.emitInvoked(request, workflow_run_id);
  const result = await run(invokedEventId);

  if ("failure" in result) {
    const failedEventId = await auditEmitter.emitFailed(
      request,
      workflow_run_id,
      result.failure,
      invokedEventId,
    );
    return { failure: result.failure, audit_event_ids: [invokedEventId, failedEventId] };
  }

  const completedEventId = await auditEmitter.emitCompleted(
    request,
    workflow_run_id,
    result.outputs,
    invokedEventId,
  );
  return { outputs: result.outputs, audit_event_ids: [invokedEventId, completedEventId] };
}

/**
 * Create handler for autowork.lexos.evidence_ingest
 * W4: Ingest evidence files, trigger extraction
 * Requires lease_id for storage side effects
 */
export function createEvidenceIngestHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      // Fail closed for missing lease on side-effecting operation
      const leaseCheck = requireLeaseId(request);
      if (!leaseCheck.ok) return { failure: leaseCheck.failure };

      // Validate required inputs
      const tenantId = asString(request, "tenant_id");
      const matterId = asString(request, "matter_id");
      const clientId = asString(request, "client_id");
      const files = readInput(request, "files") as Array<{
        file_name: string;
        file_type: string;
        file_uri: string;
        file_hash?: string;
      }> | undefined;

      if (!tenantId || !matterId || !clientId) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required inputs: tenant_id, matter_id, client_id") };
      }

      if (!files || !Array.isArray(files) || files.length === 0) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required input: files array") };
      }

      // Validate each file has required fields
      for (const file of files) {
        if (!file.file_name || !file.file_type || !file.file_uri) {
          return { failure: fail("WORKFLOW_STEP_FAILED", "Each file must have file_name, file_type, and file_uri") };
        }
      }

      // Reject in production (development-mode only)
      if (process.env.NODE_ENV === "production") {
        return { failure: fail("WORKFLOW_STEP_FAILED", "evidence_ingest is development-only") };
      }

      // Generate deterministic evidence IDs
      const evidenceIds: string[] = [];
      const extractions: Array<{
        evidence_id: string;
        extraction_id: string;
        extraction_type: string;
        extraction_quality_status: "accepted" | "qa_flagged" | "failed" | "human_review_required";
        human_review_required: boolean;
      }> = [];

      for (const file of files) {
        const evidenceId = randomUUID();
        evidenceIds.push(evidenceId);

        const extractionId = randomUUID();
        const extractionType = determineExtractionType(file.file_type);
        const requiresHumanReview = file.file_type.includes("scan") || file.file_type.includes("image");

        extractions.push({
          evidence_id: evidenceId,
          extraction_id: extractionId,
          extraction_type: extractionType,
          extraction_quality_status: requiresHumanReview ? "human_review_required" : "accepted",
          human_review_required: requiresHumanReview,
        });

        // Store evidence record
        evidenceStore.set(evidenceId, {
          evidence_id: evidenceId,
          tenant_id: tenantId,
          matter_id: matterId,
          client_id: clientId,
          file_name: file.file_name,
          file_type: file.file_type,
          file_uri: file.file_uri,
          file_hash: file.file_hash ?? null,
          lease_id: leaseCheck.leaseId,
          ingested_at: new Date().toISOString(),
        });
      }

      // Determine overall processing status
      const allRequireReview = extractions.every(e => e.human_review_required);
      const anyRequireReview = extractions.some(e => e.human_review_required);
      const processingStatus = allRequireReview
        ? "requires_human_review"
        : anyRequireReview
          ? "qa_flagged"
          : "processed";

      return {
        outputs: {
          evidence_ids: evidenceIds,
          extractions,
          processing_status: processingStatus,
          ingested_count: files.length,
          matter_id: matterId,
          lease_id: leaseCheck.leaseId,
        },
      };
    });
  };
}

function determineExtractionType(fileType: string): string {
  const type = fileType.toLowerCase();
  if (type.includes("pdf") || type.includes("doc") || type.includes("txt")) {
    return "text_document";
  }
  if (type.includes("scan") || type.includes("tiff")) {
    return "scanned_document";
  }
  if (type.includes("jpg") || type.includes("png") || type.includes("image")) {
    return "image_with_text";
  }
  if (type.includes("mp3") || type.includes("wav") || type.includes("audio")) {
    return "audio_transcript";
  }
  if (type.includes("mp4") || type.includes("mov") || type.includes("video")) {
    return "video_transcript";
  }
  return "metadata_only";
}

/**
 * Create handler for autowork.lexos.extraction_run
 * W4: Run extraction pipeline (OCR, parser, QA)
 * Requires lease_id for processing side effects
 */
export function createExtractionRunHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      // Fail closed for missing lease on side-effecting operation
      const leaseCheck = requireLeaseId(request);
      if (!leaseCheck.ok) return { failure: leaseCheck.failure };

      // Reject in production (development-mode only) - check early
      if (process.env.NODE_ENV === "production") {
        return { failure: fail("WORKFLOW_STEP_FAILED", "extraction_run is development-only") };
      }

      // Validate required inputs
      const evidenceId = asString(request, "evidence_id");
      const extractionTypes = asStringArray(request, "extraction_types");

      if (!evidenceId) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required input: evidence_id") };
      }

      // Check evidence exists
      const evidence = evidenceStore.get(evidenceId);
      if (!evidence) {
        return { failure: fail("WORKFLOW_STEP_FAILED", `Evidence not found: ${evidenceId}`) };
      }

      const extractionId = randomUUID();
      const now = new Date().toISOString();

      // Generate deterministic stub outputs
      const markdownOutput = generateMockMarkdownOutput(evidence);
      const jsonOutput = generateMockJsonOutput(evidence);

      // Quality flags based on extraction type
      const qualityFlags: string[] = [];
      if (!extractionTypes.includes("text_document")) {
        qualityFlags.push("non_standard_extraction");
      }
      if (evidence.file_type?.includes("scan")) {
        qualityFlags.push("ocr_applied");
        qualityFlags.push("confidence_review_recommended");
      }

      // Store extraction record
      extractionStore.set(extractionId, {
        extraction_id: extractionId,
        evidence_id: evidenceId,
        tenant_id: evidence.tenant_id,
        matter_id: evidence.matter_id,
        lease_id: leaseCheck.leaseId,
        extraction_types: extractionTypes.length > 0 ? extractionTypes : ["text_document"],
        markdown_output: markdownOutput,
        json_output: jsonOutput,
        quality_flags: qualityFlags,
        extraction_complete: true,
        extracted_at: now,
      });

      return {
        outputs: {
          extraction_id: extractionId,
          evidence_id: evidenceId,
          extraction_complete: true,
          quality_flags: qualityFlags,
          markdown_output: markdownOutput,
          json_output: jsonOutput,
          lease_id: leaseCheck.leaseId,
        },
      };
    });
  };
}

function generateMockMarkdownOutput(evidence: Record<string, unknown>): string {
  return `# Extracted Content: ${evidence.file_name}

## Document Information
- **File**: ${evidence.file_name}
- **Type**: ${evidence.file_type}
- **Extracted**: ${new Date().toISOString()}

## Content
This is a mock extraction output for development mode. In production, this would contain the actual extracted text content from the document.

## Metadata
- Evidence ID: ${evidence.evidence_id}
- Matter ID: ${evidence.matter_id}

---
*Extracted by LEXOS Evidence Archivist (development mode)*
`;
}

function generateMockJsonOutput(evidence: Record<string, unknown>): Record<string, unknown> {
  return {
    document_info: {
      file_name: evidence.file_name,
      file_type: evidence.file_type,
      evidence_id: evidence.evidence_id,
    },
    extracted_fields: {
      title: "Mock Document Title",
      date: new Date().toISOString().split("T")[0],
      author: "Unknown",
    },
    entities: [],
    confidence_scores: {
      text_extraction: 0.95,
      entity_recognition: 0.0,
    },
    extraction_mode: "development_stub",
  };
}

/**
 * Create handler for autowork.lexos.assertion_sync
 * W5: Sync assertion support states
 * Requires lease_id for database side effects
 */
export function createAssertionSyncHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      // Fail closed for missing lease on side-effecting operation
      const leaseCheck = requireLeaseId(request);
      if (!leaseCheck.ok) return { failure: leaseCheck.failure };

      // Validate required inputs
      const tenantId = asString(request, "tenant_id");
      const matterId = asString(request, "matter_id");
      const assertionIds = asStringArray(request, "assertion_ids");
      const evidenceIds = asStringArray(request, "evidence_ids");

      if (!tenantId || !matterId) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required inputs: tenant_id, matter_id") };
      }

      // Reject in production (development-mode only)
      if (process.env.NODE_ENV === "production") {
        return { failure: fail("WORKFLOW_STEP_FAILED", "assertion_sync is development-only") };
      }

      const syncId = randomUUID();
      const now = new Date().toISOString();

      // Generate deterministic mock assertion updates
      const assertionUpdates: Array<{
        assertion_id: string;
        support_state: "supported" | "partially_supported" | "unsupported" | "contradicted";
        supporting_evidence: string[];
        confidence: number;
      }> = [];

      // If no assertions provided, create mock ones
      const targetAssertionIds = assertionIds.length > 0
        ? assertionIds
        : [randomUUID(), randomUUID(), randomUUID()];

      for (const assertionId of targetAssertionIds) {
        const supportState: "supported" | "partially_supported" | "unsupported" | "contradicted" =
          evidenceIds.length > 0 ? "supported" : "partially_supported";

        assertionUpdates.push({
          assertion_id: assertionId,
          support_state: supportState,
          supporting_evidence: evidenceIds.slice(0, 2), // Up to 2 supporting evidence items
          confidence: evidenceIds.length > 0 ? 0.85 : 0.5,
        });
      }

      // Store sync record
      assertionSyncStore.set(syncId, {
        sync_id: syncId,
        tenant_id: tenantId,
        matter_id: matterId,
        lease_id: leaseCheck.leaseId,
        assertion_updates: assertionUpdates,
        support_matrix_version: `v1-${now}`,
        synced_at: now,
      });

      return {
        outputs: {
          sync_id: syncId,
          assertion_updates: assertionUpdates,
          support_matrix_version: `v1-${now}`,
          updated_count: assertionUpdates.length,
          lease_id: leaseCheck.leaseId,
        },
      };
    });
  };
}

/**
 * Create handler for autowork.lexos.artifact_generate
 * W10/W11: Generate output artifacts
 * Requires lease_id for artifact generation side effects
 */
export function createArtifactGenerateHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      // Fail closed for missing lease on side-effecting operation
      const leaseCheck = requireLeaseId(request);
      if (!leaseCheck.ok) return { failure: leaseCheck.failure };

      // Validate required inputs
      const tenantId = asString(request, "tenant_id");
      const matterId = asString(request, "matter_id");
      const artifactType = asString(request, "artifact_type");
      const outputFormat = asString(request, "output_format") ?? "pdf";

      if (!tenantId || !matterId || !artifactType) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required inputs: tenant_id, matter_id, artifact_type") };
      }

      // Validate output format
      const validFormats = ["pdf", "docx", "markdown", "html"];
      if (!validFormats.includes(outputFormat)) {
        return { failure: fail("WORKFLOW_STEP_FAILED", `Invalid output_format: ${outputFormat}. Must be one of: ${validFormats.join(", ")}`) };
      }

      // Reject in production (development-mode only)
      if (process.env.NODE_ENV === "production") {
        return { failure: fail("WORKFLOW_STEP_FAILED", "artifact_generate is development-only") };
      }

      const artifactId = randomUUID();
      const now = new Date().toISOString();

      // Generate deterministic artifact reference
      const artifactRef = `lexos_artifact:${tenantId}:${matterId}:${artifactType}:${artifactId}`;
      const artifactVersion = `v1.0-${now}`;

      // Calculate mock file size based on format
      const fileSizeBytes = outputFormat === "pdf"
        ? 245760 // 240KB
        : outputFormat === "docx"
          ? 131072 // 128KB
          : outputFormat === "html"
            ? 65536 // 64KB
            : 32768; // 32KB for markdown

      // Store artifact record
      artifactStore.set(artifactRef, {
        artifact_id: artifactId,
        artifact_ref: artifactRef,
        tenant_id: tenantId,
        matter_id: matterId,
        artifact_type: artifactType,
        file_format: outputFormat,
        file_size_bytes: fileSizeBytes,
        artifact_version: artifactVersion,
        lease_id: leaseCheck.leaseId,
        generated_at: now,
        caveat_preservation_check: {
          caveats_preserved: true,
          missing_caveats: [],
        },
      });

      return {
        outputs: {
          artifact_id: artifactId,
          artifact_ref: artifactRef,
          artifact_type: artifactType,
          artifact_version: artifactVersion,
          file_format: outputFormat,
          file_size_bytes: fileSizeBytes,
          caveat_preservation_check: {
            caveats_preserved: true,
            missing_caveats: [],
          },
          lease_id: leaseCheck.leaseId,
        },
      };
    });
  };
}

/**
 * Create handler for autowork.lexos.crm_sync
 * W0: Sync client/matter to mock CRM
 * Requires lease_id for CRM side effects
 */
export function createCrmSyncHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      // Fail closed for missing lease on side-effecting operation
      const leaseCheck = requireLeaseId(request);
      if (!leaseCheck.ok) return { failure: leaseCheck.failure };

      // Validate required inputs
      const tenantId = asString(request, "tenant_id");
      const clientId = asString(request, "client_id");
      const matterId = asString(request, "matter_id");
      const syncType = asString(request, "sync_type") ?? "client_matter";

      if (!tenantId || !clientId) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required inputs: tenant_id, client_id") };
      }

      // Reject in production (development-mode only)
      if (process.env.NODE_ENV === "production") {
        return { failure: fail("WORKFLOW_STEP_FAILED", "crm_sync is development-only") };
      }

      const crmRecordId = `lexos_crm:${tenantId}:${clientId}`;
      const now = new Date().toISOString();

      // Generate deterministic sync status
      const syncStatus = "synced";

      // Store CRM sync record
      crmSyncStore.set(crmRecordId, {
        crm_record_id: crmRecordId,
        tenant_id: tenantId,
        client_id: clientId,
        matter_id: matterId ?? null,
        sync_type: syncType,
        sync_status: syncStatus,
        lease_id: leaseCheck.leaseId,
        synced_at: now,
        source_system: "lexos_litigation",
      });

      return {
        outputs: {
          crm_record_id: crmRecordId,
          client_id: clientId,
          matter_id: matterId ?? null,
          sync_status: syncStatus,
          sync_type: syncType,
          synced_at: now,
          lease_id: leaseCheck.leaseId,
        },
      };
    });
  };
}

// Export store getters for testing and debugging
export function getEvidence(evidenceId: string): Record<string, unknown> | undefined {
  return evidenceStore.get(evidenceId);
}

export function getExtraction(extractionId: string): Record<string, unknown> | undefined {
  return extractionStore.get(extractionId);
}

export function getAssertionSync(syncId: string): Record<string, unknown> | undefined {
  return assertionSyncStore.get(syncId);
}

export function getArtifact(artifactRef: string): Record<string, unknown> | undefined {
  return artifactStore.get(artifactRef);
}

export function getCrmSync(crmRecordId: string): Record<string, unknown> | undefined {
  return crmSyncStore.get(crmRecordId);
}

// Export store listers for testing
export function listEvidence(): Array<[string, Record<string, unknown>]> {
  return Array.from(evidenceStore.entries());
}

export function listExtractions(): Array<[string, Record<string, unknown>]> {
  return Array.from(extractionStore.entries());
}

export function listAssertionSyncs(): Array<[string, Record<string, unknown>]> {
  return Array.from(assertionSyncStore.entries());
}

export function listArtifacts(): Array<[string, Record<string, unknown>]> {
  return Array.from(artifactStore.entries());
}

export function listCrmSyncs(): Array<[string, Record<string, unknown>]> {
  return Array.from(crmSyncStore.entries());
}

/**
 * Clear all LEXOS stores (useful for testing)
 */
export function clearLexosStores(): void {
  evidenceStore.clear();
  extractionStore.clear();
  assertionSyncStore.clear();
  artifactStore.clear();
  crmSyncStore.clear();
}
