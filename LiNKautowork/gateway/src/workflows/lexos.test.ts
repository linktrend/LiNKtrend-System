/**
 * LEXOS Workflow Handler Tests
 *
 * Tests for WP-105 LEXOS LiNKautowork workflow hooks.
 *
 * Coverage:
 * - Successful stub paths for all 5 workflow handles
 * - Missing lease/idempotency failures (fail-closed behavior)
 * - Live-mode rejection (development-only)
 * - Missing input validation
 * - Store state verification
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { randomUUID } from "node:crypto";
import type { WorkflowInvokeRequest, AuditEvent } from "@linktrend/linklogic-sdk";
import { createAuditEmitter } from "../lib/audit-emitter.js";
import {
  createEvidenceIngestHandler,
  createExtractionRunHandler,
  createAssertionSyncHandler,
  createArtifactGenerateHandler,
  createCrmSyncHandler,
  EVIDENCE_INGEST_HANDLE,
  EXTRACTION_RUN_HANDLE,
  ASSERTION_SYNC_HANDLE,
  ARTIFACT_GENERATE_HANDLE,
  CRM_SYNC_HANDLE,
  getEvidence,
  getExtraction,
  getAssertionSync,
  getArtifact,
  getCrmSync,
  clearLexosStores,
  listEvidence,
  listExtractions,
} from "./lexos.js";

// Mock audit event writer
function createMockAuditWriter(): {
  events: AuditEvent[];
  writeEvent: (event: AuditEvent) => Promise<{ event_id: string }>;
} {
  const events: AuditEvent[] = [];
  return {
    events,
    writeEvent: async (event: AuditEvent) => {
      events.push(event);
      return { event_id: event.event_id };
    },
  };
}

// Create a mock workflow context
function createMockContext(): {
  env: unknown;
  tenant_id: string;
  run_id: string;
  stage_id: string;
  workflow_run_id: string;
  lease_id?: string;
  idempotency_key: string;
} {
  return {
    env: {},
    tenant_id: randomUUID(),
    run_id: randomUUID(),
    stage_id: "test_stage",
    workflow_run_id: randomUUID(),
    idempotency_key: `test:${Date.now()}:lexos`,
  };
}

describe("LEXOS Workflow Handlers", () => {
  beforeEach(() => {
    clearLexosStores();
    // Ensure we're not in production mode for tests
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    clearLexosStores();
  });

  describe("autowork.lexos.evidence_ingest", () => {
    const createMockRequest = (overrides: Partial<WorkflowInvokeRequest> = {}): WorkflowInvokeRequest => ({
      tenant_id: randomUUID(),
      run_id: randomUUID(),
      stage_id: "W4_evidence_intake",
      workflow_handle: EVIDENCE_INGEST_HANDLE,
      inputs: {
        tenant_id: randomUUID(),
        matter_id: randomUUID(),
        client_id: randomUUID(),
        files: [
          { file_name: "contract.pdf", file_type: "application/pdf", file_uri: "s3://bucket/contract.pdf" },
          { file_name: "scan.tiff", file_type: "image/tiff", file_uri: "s3://bucket/scan.tiff" },
        ],
      },
      lease_id: randomUUID(),
      idempotency_key: `test:${Date.now()}:evidence_ingest`,
      ...overrides,
    });

    it("should succeed with valid inputs and lease_id", async () => {
      const { writeEvent, events } = createMockAuditWriter();
      const auditEmitter = createAuditEmitter(writeEvent);
      const handler = createEvidenceIngestHandler(auditEmitter);
      const request = createMockRequest();
      const context = createMockContext();

      const result = await handler(request, context);

      expect("outputs" in result).toBe(true);
      if ("outputs" in result) {
        const evidenceIds = result.outputs.evidence_ids as string[];
        expect(evidenceIds).toHaveLength(2);
        expect(result.outputs.extractions).toHaveLength(2);
        expect(result.outputs.processing_status).toBe("qa_flagged"); // One requires human review
        expect(result.outputs.ingested_count).toBe(2);
        expect(result.outputs.lease_id).toBe(request.lease_id);
        expect(result.audit_event_ids).toHaveLength(2); // invoked + completed

        // Verify evidence stored
        const evidence0 = getEvidence(evidenceIds[0]);
        expect(evidence0).toBeDefined();
        expect(evidence0?.file_name).toBe("contract.pdf");
      }
    });

    it("should fail closed when lease_id is missing", async () => {
      const { writeEvent } = createMockAuditWriter();
      const auditEmitter = createAuditEmitter(writeEvent);
      const handler = createEvidenceIngestHandler(auditEmitter);
      const request = createMockRequest({ lease_id: undefined });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("LEASE_REQUEST_INVALID");
        expect(result.failure.message).toContain("Missing required lease_id");
        expect(result.failure.retryable).toBe(false);
      }
    });

    it("should fail when required inputs are missing", async () => {
      const { writeEvent } = createMockAuditWriter();
      const auditEmitter = createAuditEmitter(writeEvent);
      const handler = createEvidenceIngestHandler(auditEmitter);
      const request = createMockRequest({
        inputs: { tenant_id: randomUUID() }, // Missing matter_id, client_id, files
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("WORKFLOW_STEP_FAILED");
        expect(result.failure.message).toContain("Missing required inputs");
      }
    });

    it("should fail when files array is empty", async () => {
      const { writeEvent } = createMockAuditWriter();
      const auditEmitter = createAuditEmitter(writeEvent);
      const handler = createEvidenceIngestHandler(auditEmitter);
      const request = createMockRequest({
        inputs: {
          tenant_id: randomUUID(),
          matter_id: randomUUID(),
          client_id: randomUUID(),
          files: [],
        },
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("WORKFLOW_STEP_FAILED");
        expect(result.failure.message).toContain("Missing required input: files array");
      }
    });

    it("should mark scanned documents for human review", async () => {
      const { writeEvent } = createMockAuditWriter();
      const auditEmitter = createAuditEmitter(writeEvent);
      const handler = createEvidenceIngestHandler(auditEmitter);
      const request = createMockRequest({
        inputs: {
          tenant_id: randomUUID(),
          matter_id: randomUUID(),
          client_id: randomUUID(),
          files: [
            { file_name: "scan.tiff", file_type: "image/tiff", file_uri: "s3://bucket/scan.tiff" },
          ],
        },
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("outputs" in result).toBe(true);
      if ("outputs" in result) {
        expect(result.outputs.processing_status).toBe("requires_human_review");
        const extractions = result.outputs.extractions as Array<{
          human_review_required: boolean;
          extraction_quality_status: string;
        }>;
        expect(extractions[0]?.human_review_required).toBe(true);
        expect(extractions[0]?.extraction_quality_status).toBe("human_review_required");
      }
    });

    it("should reject in production mode", async () => {
      process.env.NODE_ENV = "production";
      const { writeEvent } = createMockAuditWriter();
      const auditEmitter = createAuditEmitter(writeEvent);
      const handler = createEvidenceIngestHandler(auditEmitter);
      const request = createMockRequest();
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("WORKFLOW_STEP_FAILED");
        expect(result.failure.message).toContain("development-only");
      }
    });
  });

  describe("autowork.lexos.extraction_run", () => {
    const createMockRequest = (overrides: Partial<WorkflowInvokeRequest> = {}): WorkflowInvokeRequest => {
      // First ingest some evidence to extract
      const evidenceId = randomUUID();
      const tenantId = randomUUID();
      const matterId = randomUUID();

      return {
        tenant_id: tenantId,
        run_id: randomUUID(),
        stage_id: "W4_extraction",
        workflow_handle: EXTRACTION_RUN_HANDLE,
        inputs: {
          evidence_id: evidenceId,
          extraction_types: ["text_document"],
        },
        lease_id: randomUUID(),
        idempotency_key: `test:${Date.now()}:extraction_run`,
        ...overrides,
      };
    };

    it("should fail closed when lease_id is missing", async () => {
      const { writeEvent } = createMockAuditWriter();
      const auditEmitter = createAuditEmitter(writeEvent);
      const handler = createExtractionRunHandler(auditEmitter);
      const request = createMockRequest({ lease_id: undefined });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("LEASE_REQUEST_INVALID");
      }
    });

    it("should fail when evidence_id is missing", async () => {
      const { writeEvent } = createMockAuditWriter();
      const auditEmitter = createAuditEmitter(writeEvent);
      const handler = createExtractionRunHandler(auditEmitter);
      const request = createMockRequest({
        inputs: { extraction_types: ["text_document"] },
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("WORKFLOW_STEP_FAILED");
        expect(result.failure.message).toContain("evidence_id");
      }
    });

    it("should fail when evidence does not exist", async () => {
      const { writeEvent } = createMockAuditWriter();
      const auditEmitter = createAuditEmitter(writeEvent);
      const handler = createExtractionRunHandler(auditEmitter);
      const request = createMockRequest();
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("WORKFLOW_STEP_FAILED");
        expect(result.failure.message).toContain("Evidence not found");
      }
    });

    it("should reject in production mode", async () => {
      process.env.NODE_ENV = "production";
      const { writeEvent } = createMockAuditWriter();
      const auditEmitter = createAuditEmitter(writeEvent);
      const handler = createExtractionRunHandler(auditEmitter);
      const request = createMockRequest();
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("WORKFLOW_STEP_FAILED");
        expect(result.failure.message).toContain("development-only");
      }
    });
  });

  describe("autowork.lexos.assertion_sync", () => {
    const createMockRequest = (overrides: Partial<WorkflowInvokeRequest> = {}): WorkflowInvokeRequest => ({
      tenant_id: randomUUID(),
      run_id: randomUUID(),
      stage_id: "W5_assertion_sync",
      workflow_handle: ASSERTION_SYNC_HANDLE,
      inputs: {
        tenant_id: randomUUID(),
        matter_id: randomUUID(),
        assertion_ids: [randomUUID(), randomUUID()],
        evidence_ids: [randomUUID()],
      },
      lease_id: randomUUID(),
      idempotency_key: `test:${Date.now()}:assertion_sync`,
      ...overrides,
    });

    it("should succeed with valid inputs and lease_id", async () => {
      const { writeEvent } = createMockAuditWriter();
      const auditEmitter = createAuditEmitter(writeEvent);
      const handler = createAssertionSyncHandler(auditEmitter);
      const request = createMockRequest();
      const context = createMockContext();

      const result = await handler(request, context);

      expect("outputs" in result).toBe(true);
      if ("outputs" in result) {
        expect(result.outputs.sync_id).toBeDefined();
        expect(result.outputs.assertion_updates).toHaveLength(2);
        expect(result.outputs.support_matrix_version).toMatch(/^v1-/);
        expect(result.outputs.updated_count).toBe(2);
        expect(result.outputs.lease_id).toBe(request.lease_id);

        // Verify sync stored
        const sync = getAssertionSync(result.outputs.sync_id as string);
        expect(sync).toBeDefined();
        expect(sync?.assertion_updates).toHaveLength(2);
      }
    });

    it("should fail closed when lease_id is missing", async () => {
      const { writeEvent } = createMockAuditWriter();
      const auditEmitter = createAuditEmitter(writeEvent);
      const handler = createAssertionSyncHandler(auditEmitter);
      const request = createMockRequest({ lease_id: undefined });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("LEASE_REQUEST_INVALID");
      }
    });

    it("should create mock assertions when none provided", async () => {
      const { writeEvent } = createMockAuditWriter();
      const auditEmitter = createAuditEmitter(writeEvent);
      const handler = createAssertionSyncHandler(auditEmitter);
      const request = createMockRequest({
        inputs: {
          tenant_id: randomUUID(),
          matter_id: randomUUID(),
          // No assertion_ids provided
        },
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("outputs" in result).toBe(true);
      if ("outputs" in result) {
        expect(result.outputs.assertion_updates).toHaveLength(3); // Default mock count
        expect(result.outputs.updated_count).toBe(3);
      }
    });

    it("should mark assertions as supported when evidence provided", async () => {
      const { writeEvent } = createMockAuditWriter();
      const auditEmitter = createAuditEmitter(writeEvent);
      const handler = createAssertionSyncHandler(auditEmitter);
      const evidenceId = randomUUID();
      const request = createMockRequest({
        inputs: {
          tenant_id: randomUUID(),
          matter_id: randomUUID(),
          assertion_ids: [randomUUID()],
          evidence_ids: [evidenceId],
        },
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("outputs" in result).toBe(true);
      if ("outputs" in result) {
        const assertionUpdates = result.outputs.assertion_updates as Array<{
          support_state: string;
          supporting_evidence: string[];
          confidence: number;
        }>;
        expect(assertionUpdates[0]?.support_state).toBe("supported");
        expect(assertionUpdates[0]?.supporting_evidence).toContain(evidenceId);
        expect(assertionUpdates[0]?.confidence).toBe(0.85);
      }
    });

    it("should reject in production mode", async () => {
      process.env.NODE_ENV = "production";
      const { writeEvent } = createMockAuditWriter();
      const auditEmitter = createAuditEmitter(writeEvent);
      const handler = createAssertionSyncHandler(auditEmitter);
      const request = createMockRequest();
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("WORKFLOW_STEP_FAILED");
        expect(result.failure.message).toContain("development-only");
      }
    });
  });

  describe("autowork.lexos.artifact_generate", () => {
    const createMockRequest = (overrides: Partial<WorkflowInvokeRequest> = {}): WorkflowInvokeRequest => ({
      tenant_id: randomUUID(),
      run_id: randomUUID(),
      stage_id: "W11_output_generation",
      workflow_handle: ARTIFACT_GENERATE_HANDLE,
      inputs: {
        tenant_id: randomUUID(),
        matter_id: randomUUID(),
        artifact_type: "legal_brief",
        output_format: "pdf",
      },
      lease_id: randomUUID(),
      idempotency_key: `test:${Date.now()}:artifact_generate`,
      ...overrides,
    });

    it("should succeed with valid inputs and lease_id", async () => {
      const { writeEvent } = createMockAuditWriter();
      const auditEmitter = createAuditEmitter(writeEvent);
      const handler = createArtifactGenerateHandler(auditEmitter);
      const request = createMockRequest();
      const context = createMockContext();

      const result = await handler(request, context);

      expect("outputs" in result).toBe(true);
      if ("outputs" in result) {
        const caveatCheck = result.outputs.caveat_preservation_check as {
          caveats_preserved: boolean;
        };
        expect(result.outputs.artifact_id).toBeDefined();
        expect(result.outputs.artifact_ref).toMatch(/^lexos_artifact:/);
        expect(result.outputs.artifact_type).toBe("legal_brief");
        expect(result.outputs.file_format).toBe("pdf");
        expect(result.outputs.file_size_bytes).toBe(245760); // PDF size
        expect(result.outputs.artifact_version).toMatch(/^v1.0-/);
        expect(caveatCheck.caveats_preserved).toBe(true);
        expect(result.outputs.lease_id).toBe(request.lease_id);

        // Verify artifact stored
        const artifact = getArtifact(result.outputs.artifact_ref as string);
        expect(artifact).toBeDefined();
        expect(artifact?.artifact_type).toBe("legal_brief");
      }
    });

    it("should fail closed when lease_id is missing", async () => {
      const { writeEvent } = createMockAuditWriter();
      const auditEmitter = createAuditEmitter(writeEvent);
      const handler = createArtifactGenerateHandler(auditEmitter);
      const request = createMockRequest({ lease_id: undefined });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("LEASE_REQUEST_INVALID");
      }
    });

    it("should fail when required inputs are missing", async () => {
      const { writeEvent } = createMockAuditWriter();
      const auditEmitter = createAuditEmitter(writeEvent);
      const handler = createArtifactGenerateHandler(auditEmitter);
      const request = createMockRequest({
        inputs: { tenant_id: randomUUID() }, // Missing matter_id, artifact_type
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("WORKFLOW_STEP_FAILED");
        expect(result.failure.message).toContain("Missing required inputs");
      }
    });

    it("should fail for invalid output format", async () => {
      const { writeEvent } = createMockAuditWriter();
      const auditEmitter = createAuditEmitter(writeEvent);
      const handler = createArtifactGenerateHandler(auditEmitter);
      const request = createMockRequest({
        inputs: {
          tenant_id: randomUUID(),
          matter_id: randomUUID(),
          artifact_type: "legal_brief",
          output_format: "invalid_format",
        },
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("WORKFLOW_STEP_FAILED");
        expect(result.failure.message).toContain("Invalid output_format");
      }
    });

    it("should generate different file sizes based on format", async () => {
      const formats: Array<{ format: string; expectedSize: number }> = [
        { format: "pdf", expectedSize: 245760 },
        { format: "docx", expectedSize: 131072 },
        { format: "html", expectedSize: 65536 },
        { format: "markdown", expectedSize: 32768 },
      ];

      for (const { format, expectedSize } of formats) {
        clearLexosStores();
        const { writeEvent } = createMockAuditWriter();
        const auditEmitter = createAuditEmitter(writeEvent);
        const handler = createArtifactGenerateHandler(auditEmitter);
        const request = createMockRequest({
          inputs: {
            tenant_id: randomUUID(),
            matter_id: randomUUID(),
            artifact_type: "legal_brief",
            output_format: format,
          },
        });
        const context = createMockContext();

        const result = await handler(request, context);

        expect("outputs" in result).toBe(true);
        if ("outputs" in result) {
          expect(result.outputs.file_size_bytes).toBe(expectedSize);
        }
      }
    });

    it("should reject in production mode", async () => {
      process.env.NODE_ENV = "production";
      const { writeEvent } = createMockAuditWriter();
      const auditEmitter = createAuditEmitter(writeEvent);
      const handler = createArtifactGenerateHandler(auditEmitter);
      const request = createMockRequest();
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("WORKFLOW_STEP_FAILED");
        expect(result.failure.message).toContain("development-only");
      }
    });
  });

  describe("autowork.lexos.crm_sync", () => {
    const createMockRequest = (overrides: Partial<WorkflowInvokeRequest> = {}): WorkflowInvokeRequest => ({
      tenant_id: randomUUID(),
      run_id: randomUUID(),
      stage_id: "W0_crm_sync",
      workflow_handle: CRM_SYNC_HANDLE,
      inputs: {
        tenant_id: randomUUID(),
        client_id: randomUUID(),
        matter_id: randomUUID(),
        sync_type: "client_matter",
      },
      lease_id: randomUUID(),
      idempotency_key: `test:${Date.now()}:crm_sync`,
      ...overrides,
    });

    it("should succeed with valid inputs and lease_id", async () => {
      const { writeEvent } = createMockAuditWriter();
      const auditEmitter = createAuditEmitter(writeEvent);
      const handler = createCrmSyncHandler(auditEmitter);
      const request = createMockRequest();
      const context = createMockContext();

      const result = await handler(request, context);

      expect("outputs" in result).toBe(true);
      if ("outputs" in result) {
        expect(result.outputs.crm_record_id).toMatch(/^lexos_crm:/);
        expect(result.outputs.client_id).toBe(request.inputs.client_id);
        expect(result.outputs.matter_id).toBe(request.inputs.matter_id);
        expect(result.outputs.sync_status).toBe("synced");
        expect(result.outputs.sync_type).toBe("client_matter");
        expect(result.outputs.synced_at).toBeDefined();
        expect(result.outputs.lease_id).toBe(request.lease_id);

        // Verify CRM record stored
        const crmRecord = getCrmSync(result.outputs.crm_record_id as string);
        expect(crmRecord).toBeDefined();
        expect(crmRecord?.sync_status).toBe("synced");
        expect(crmRecord?.source_system).toBe("lexos_litigation");
      }
    });

    it("should fail closed when lease_id is missing", async () => {
      const { writeEvent } = createMockAuditWriter();
      const auditEmitter = createAuditEmitter(writeEvent);
      const handler = createCrmSyncHandler(auditEmitter);
      const request = createMockRequest({ lease_id: undefined });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("LEASE_REQUEST_INVALID");
      }
    });

    it("should fail when client_id is missing", async () => {
      const { writeEvent } = createMockAuditWriter();
      const auditEmitter = createAuditEmitter(writeEvent);
      const handler = createCrmSyncHandler(auditEmitter);
      const request = createMockRequest({
        inputs: { tenant_id: randomUUID() }, // Missing client_id
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("WORKFLOW_STEP_FAILED");
        expect(result.failure.message).toContain("client_id");
      }
    });

    it("should work without matter_id (client-only sync)", async () => {
      const { writeEvent } = createMockAuditWriter();
      const auditEmitter = createAuditEmitter(writeEvent);
      const handler = createCrmSyncHandler(auditEmitter);
      const clientId = randomUUID();
      const request = createMockRequest({
        inputs: {
          tenant_id: randomUUID(),
          client_id: clientId,
          sync_type: "client_only",
        },
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("outputs" in result).toBe(true);
      if ("outputs" in result) {
        expect(result.outputs.matter_id).toBeNull();
        expect(result.outputs.sync_type).toBe("client_only");
        expect(result.outputs.crm_record_id).toContain(clientId);
      }
    });

    it("should reject in production mode", async () => {
      process.env.NODE_ENV = "production";
      const { writeEvent } = createMockAuditWriter();
      const auditEmitter = createAuditEmitter(writeEvent);
      const handler = createCrmSyncHandler(auditEmitter);
      const request = createMockRequest();
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("WORKFLOW_STEP_FAILED");
        expect(result.failure.message).toContain("development-only");
      }
    });
  });

  describe("clearLexosStores", () => {
    it("should clear all stores", async () => {
      const { writeEvent } = createMockAuditWriter();
      const auditEmitter = createAuditEmitter(writeEvent);

      // Create some evidence
      const evidenceHandler = createEvidenceIngestHandler(auditEmitter);
      await evidenceHandler({
        tenant_id: randomUUID(),
        run_id: randomUUID(),
        stage_id: "test",
        workflow_handle: EVIDENCE_INGEST_HANDLE,
        inputs: {
          tenant_id: randomUUID(),
          matter_id: randomUUID(),
          client_id: randomUUID(),
          files: [{ file_name: "test.pdf", file_type: "pdf", file_uri: "s3://test.pdf" }],
        },
        lease_id: randomUUID(),
        idempotency_key: "test:clear:evidence",
      }, createMockContext());

      expect(listEvidence()).toHaveLength(1);

      // Clear stores
      clearLexosStores();

      expect(listEvidence()).toHaveLength(0);
      expect(listExtractions()).toHaveLength(0);
    });
  });
});
