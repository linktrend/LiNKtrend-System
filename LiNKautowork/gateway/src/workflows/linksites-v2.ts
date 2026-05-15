import { createHash } from "node:crypto";
import type { WorkflowInvokeRequest } from "@linktrend/linklogic-sdk";
import type { AuditEmitter } from "../lib/audit-emitter.js";
import type { WorkflowHandler } from "../types/index.js";

export const ARTIFACT_WRITE_LOCAL_HANDLE = "autowork.linksites.artifact_write_local";
export const SUPABASE_MIRROR_UPSERT_HANDLE = "autowork.linksites.supabase_mirror_upsert";
export const PAYLOAD_SYNC_LOCAL_HANDLE = "autowork.linksites.payload_sync_local";
export const PREVIEW_READINESS_CHECK_HANDLE = "autowork.linksites.preview_readiness_check";
export const CRM_READY_TO_CONTACT_MARK_HANDLE = "autowork.linksites.crm_ready_to_contact_mark";

const artifactWrites = new Map<string, Record<string, unknown>>();
const mirrorWrites = new Map<string, Record<string, unknown>>();
const payloadSyncs = new Map<string, Record<string, unknown>>();
const crmMarks = new Map<string, Record<string, unknown>>();

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

function fail(
  code: string,
  message: string,
  retryable = false,
): { code: string; message: string; retryable: boolean } {
  return { code, message, retryable };
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

export function createArtifactWriteLocalHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      if (process.env.NODE_ENV === "production") {
        return { failure: fail("WORKFLOW_STEP_FAILED", "artifact_write_local is development-only") };
      }

      const siteId = asString(request, "site_id");
      const siteGenerationRunId = asString(request, "site_generation_run_id");
      const artifactBundleRef = asString(request, "artifact_bundle_ref");
      const artifactRootPath = asString(request, "artifact_root_path");
      if (!siteId || !siteGenerationRunId || !artifactBundleRef || !artifactRootPath) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required artifact_write_local inputs") };
      }

      const artifactRef = `artifact_local:${request.tenant_id}:${siteId}:${siteGenerationRunId}:${request.idempotency_key}`;
      const artifactManifestRef = `${artifactRef}:manifest`;
      const writtenFilesCount = 3;
      const artifactDigest = digest({ artifactRef, artifactBundleRef, artifactRootPath });

      artifactWrites.set(artifactRef, {
        artifact_ref: artifactRef,
        artifact_manifest_ref: artifactManifestRef,
        artifact_root_path: artifactRootPath,
        written_files_count: writtenFilesCount,
        artifact_digest: artifactDigest,
      });

      return {
        outputs: {
          artifact_ref: artifactRef,
          artifact_manifest_ref: artifactManifestRef,
          artifact_root_path: artifactRootPath,
          written_files_count: writtenFilesCount,
          artifact_digest: artifactDigest,
        },
      };
    });
  };
}

export function createSupabaseMirrorUpsertHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      const siteId = asString(request, "site_id");
      const siteGenerationRunId = asString(request, "site_generation_run_id");
      const artifactRef = asString(request, "artifact_ref");
      const mirrorPayloadRef = asString(request, "mirror_payload_ref");
      if (!siteId || !siteGenerationRunId || !artifactRef || !mirrorPayloadRef) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required supabase_mirror_upsert inputs") };
      }

      const mirrorWriteRef = `supabase_mirror:${request.tenant_id}:${siteId}:${siteGenerationRunId}`;
      const mirrorRevisionRef = `${mirrorWriteRef}:${request.idempotency_key}`;
      const mirrorDigest = digest({ mirrorWriteRef, mirrorPayloadRef, artifactRef });
      const upsertedRecordsCount = 4;

      mirrorWrites.set(mirrorWriteRef, {
        mirror_write_ref: mirrorWriteRef,
        mirror_revision_ref: mirrorRevisionRef,
        upserted_records_count: upsertedRecordsCount,
        mirror_digest: mirrorDigest,
      });

      return {
        outputs: {
          mirror_write_ref: mirrorWriteRef,
          mirror_revision_ref: mirrorRevisionRef,
          upserted_records_count: upsertedRecordsCount,
          mirror_digest: mirrorDigest,
        },
      };
    });
  };
}

export function createPayloadSyncLocalHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      const siteId = asString(request, "site_id");
      const siteGenerationRunId = asString(request, "site_generation_run_id");
      const mirrorWriteRef = asString(request, "mirror_write_ref");
      const payloadTargetRef = asString(request, "payload_target_ref");
      if (!siteId || !siteGenerationRunId || !mirrorWriteRef || !payloadTargetRef) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required payload_sync_local inputs") };
      }

      const payloadSyncRef = `payload_sync:${request.tenant_id}:${siteId}:${siteGenerationRunId}`;
      const payloadDocumentRefs = [
        `${payloadTargetRef}:home`,
        `${payloadTargetRef}:about`,
        `${payloadTargetRef}:contact`,
      ];

      payloadSyncs.set(payloadSyncRef, {
        payload_sync_ref: payloadSyncRef,
        payload_document_refs: payloadDocumentRefs,
        payload_sync_status: "succeeded",
      });

      return {
        outputs: {
          payload_sync_ref: payloadSyncRef,
          payload_document_refs: payloadDocumentRefs,
          payload_sync_status: "succeeded",
        },
      };
    });
  };
}

export function createPreviewReadinessCheckHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      const payloadSyncRef = asString(request, "payload_sync_ref");
      const previewUrl = asString(request, "preview_url");
      const requiredPages = asStringArray(request, "required_pages");
      const requiredNavigationItems = asStringArray(request, "required_navigation_items");
      const requiredContentBlocks = asStringArray(request, "required_content_blocks");
      const requiredMediaRefs = asStringArray(request, "required_media_refs");

      if (!payloadSyncRef || !previewUrl) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required preview_readiness_check inputs") };
      }

      const missingRequirements: string[] = [];
      if (requiredPages.length === 0) missingRequirements.push("required_pages");
      if (requiredNavigationItems.length === 0) missingRequirements.push("required_navigation_items");
      if (requiredContentBlocks.length === 0) missingRequirements.push("required_content_blocks");
      if (requiredMediaRefs.length === 0) missingRequirements.push("required_media_refs");

      if (missingRequirements.length > 0) {
        return {
          outputs: {
            checks_passed: false,
            check_report_ref: `readiness_report:${request.tenant_id}:${request.run_id}:${request.idempotency_key}`,
            failed_checks: missingRequirements,
            preview_readiness_status: "failed",
          },
        };
      }

      return {
        outputs: {
          checks_passed: true,
          check_report_ref: `readiness_report:${request.tenant_id}:${request.run_id}:${request.idempotency_key}`,
          failed_checks: [],
          preview_readiness_status: "ready",
        },
      };
    });
  };
}

export function createCrmReadyToContactMarkHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      const leadId = asString(request, "lead_id");
      const siteId = asString(request, "site_id");
      const siteGenerationRunId = asString(request, "site_generation_run_id");
      const checksPassed = readInput(request, "checks_passed") === true;
      const checkReportRef = asString(request, "check_report_ref");

      if (!leadId || !siteId || !siteGenerationRunId || !checkReportRef) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required crm_ready_to_contact_mark inputs") };
      }

      if (!checksPassed) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Cannot mark CRM lead ready_to_contact when checks_passed is false") };
      }

      const statusUpdatedAt = new Date().toISOString();
      const crmRecordId = `crm_record:${request.tenant_id}:${leadId}`;

      crmMarks.set(crmRecordId, {
        crm_record_id: crmRecordId,
        lead_status: "ready_to_contact",
        status_updated_at: statusUpdatedAt,
      });

      return {
        outputs: {
          crm_record_id: crmRecordId,
          lead_status: "ready_to_contact",
          status_updated_at: statusUpdatedAt,
        },
      };
    });
  };
}

export function getArtifactWrite(ref: string): Record<string, unknown> | undefined {
  return artifactWrites.get(ref);
}

export function clearLinksitesStores(): void {
  artifactWrites.clear();
  mirrorWrites.clear();
  payloadSyncs.clear();
  crmMarks.clear();
}
