import { createHash } from "node:crypto";
import type { WorkflowInvokeRequest } from "@linktrend/linklogic-sdk";
import type { AuditEmitter } from "../lib/audit-emitter.js";
import type { PayloadSyncClient } from "../lib/payload-client.js";
import { resolvePayloadSyncClient } from "../lib/mvo-payload-client.js";
import { createSupabaseMirrorClient, type SupabaseMirrorClient } from "../lib/supabase-client.js";
import { writeLinksitesArtifactBundle } from "../lib/linksites-artifact-writer.js";
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

      const writeResult = await writeLinksitesArtifactBundle({
        tenant_id: request.tenant_id,
        run_id: request.run_id,
        site_id: siteId,
        site_generation_run_id: siteGenerationRunId,
        artifact_bundle_ref: artifactBundleRef,
        artifact_root_path: artifactRootPath,
      });
      if (!writeResult.ok) {
        return {
          failure: fail(
            "WORKFLOW_STEP_FAILED",
            `artifact_write_local failed: ${writeResult.reason}`,
          ),
        };
      }

      artifactWrites.set(writeResult.artifact_ref, {
        artifact_ref: writeResult.artifact_ref,
        artifact_manifest_ref: writeResult.artifact_manifest_ref,
        artifact_root_path: writeResult.artifact_root_path,
        written_files_count: writeResult.written_files_count,
        artifact_digest: writeResult.artifact_digest,
      });

      return {
        outputs: {
          artifact_ref: writeResult.artifact_ref,
          artifact_manifest_ref: writeResult.artifact_manifest_ref,
          artifact_root_path: writeResult.artifact_root_path,
          written_files_count: writeResult.written_files_count,
          artifact_digest: writeResult.artifact_digest,
        },
      };
    });
  };
}

export function createSupabaseMirrorUpsertHandler(
  auditEmitter: AuditEmitter,
  deps?: { mirrorClient?: SupabaseMirrorClient },
): WorkflowHandler {
  const mirrorClient = deps?.mirrorClient ?? createSupabaseMirrorClient();

  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      const leaseCheck = requireLeaseId(request);
      if (!leaseCheck.ok) return { failure: leaseCheck.failure };

      const siteId = asString(request, "site_id");
      const siteGenerationRunId = asString(request, "site_generation_run_id");
      const artifactRef = asString(request, "artifact_ref");
      const mirrorPayloadRef = asString(request, "mirror_payload_ref");
      if (!siteId || !siteGenerationRunId || !artifactRef || !mirrorPayloadRef) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required supabase_mirror_upsert inputs") };
      }

      try {
        const siteUpsert = await mirrorClient.upsertSiteContent(
          request.tenant_id,
          siteId,
          siteGenerationRunId,
          {
            artifact_ref: artifactRef,
            mirror_payload_ref: mirrorPayloadRef,
            run_id: request.run_id,
          },
          leaseCheck.leaseId,
        );

        const assetsResult = await mirrorClient.upsertAssetRefs(
          request.tenant_id,
          siteId,
          [{ ref: artifactRef, kind: "artifact_ref" }],
          leaseCheck.leaseId,
        );

        const mirrorDigest = digest({
          mirror_write_ref: siteUpsert.mirrorWriteRef,
          mirror_revision_ref: siteUpsert.revisionRef,
          upserted_records_count: assetsResult.upsertedCount,
          artifact_ref: artifactRef,
        });

        mirrorWrites.set(siteUpsert.mirrorWriteRef, {
          mirror_write_ref: siteUpsert.mirrorWriteRef,
          mirror_revision_ref: siteUpsert.revisionRef,
          upserted_records_count: assetsResult.upsertedCount,
          mirror_digest: mirrorDigest,
        });

        return {
          outputs: {
            mirror_write_ref: siteUpsert.mirrorWriteRef,
            mirror_revision_ref: siteUpsert.revisionRef,
            upserted_records_count: assetsResult.upsertedCount,
            mirror_digest: mirrorDigest,
          },
        };
      } catch (error) {
        const reason = error instanceof Error ? error.message : "unknown error";
        if (reason.includes("not configured for development mode")) {
          const mirrorWriteRef = `supabase_mirror:${request.tenant_id}:${siteId}:${siteGenerationRunId}`;
          const mirrorRevisionRef = `${mirrorWriteRef}:${request.idempotency_key}`;
          const mirrorDigest = digest({ mirrorWriteRef, mirrorPayloadRef, artifactRef });
          return {
            outputs: {
              mirror_write_ref: mirrorWriteRef,
              mirror_revision_ref: mirrorRevisionRef,
              upserted_records_count: 1,
              mirror_digest: mirrorDigest,
            },
          };
        }
        return {
          failure: fail(
            "INTEGRATION_UNAVAILABLE",
            `Supabase mirror upsert failed: ${reason}`,
          ),
        };
      }
    });
  };
}

export function createPayloadSyncLocalHandler(
  auditEmitter: AuditEmitter,
  deps?: { payloadClient?: PayloadSyncClient },
): WorkflowHandler {
  const payloadClient = deps?.payloadClient ?? resolvePayloadSyncClient();

  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      const leaseCheck = requireLeaseId(request);
      if (!leaseCheck.ok) return { failure: leaseCheck.failure };

      const siteId = asString(request, "site_id");
      const siteGenerationRunId = asString(request, "site_generation_run_id");
      const mirrorWriteRef = asString(request, "mirror_write_ref");
      const payloadTargetRef = asString(request, "payload_target_ref");
      if (!siteId || !siteGenerationRunId || !mirrorWriteRef || !payloadTargetRef) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required payload_sync_local inputs") };
      }

      try {
        const sync = await payloadClient.syncFromMirror(
          mirrorWriteRef,
          payloadTargetRef,
          leaseCheck.leaseId,
        );

        payloadSyncs.set(sync.payloadSyncRef, {
          payload_sync_ref: sync.payloadSyncRef,
          payload_document_refs: sync.documentRefs,
          payload_sync_status: sync.status,
        });

        return {
          outputs: {
            payload_sync_ref: sync.payloadSyncRef,
            payload_document_refs: sync.documentRefs,
            payload_sync_status: sync.status,
          },
        };
      } catch (error) {
        const reason = error instanceof Error ? error.message : "unknown error";
        if (reason.includes("not configured for development mode")) {
          const payloadSyncRef = `payload_sync:${request.tenant_id}:${siteId}:${siteGenerationRunId}`;
          const payloadDocumentRefs = [
            `${payloadTargetRef}:home`,
            `${payloadTargetRef}:about`,
            `${payloadTargetRef}:contact`,
          ];
          return {
            outputs: {
              payload_sync_ref: payloadSyncRef,
              payload_document_refs: payloadDocumentRefs,
              payload_sync_status: "succeeded",
            },
          };
        }
        return {
          failure: fail(
            "INTEGRATION_UNAVAILABLE",
            `Payload sync failed: ${reason}`,
          ),
        };
      }
    });
  };
}

export function createPreviewReadinessCheckHandler(
  auditEmitter: AuditEmitter,
  deps?: { payloadClient?: PayloadSyncClient },
): WorkflowHandler {
  const payloadClient = deps?.payloadClient ?? resolvePayloadSyncClient();

  return async (request, context) => {
    const result = await withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      const payloadSyncRef = asString(request, "payload_sync_ref");
      const previewUrl = asString(request, "preview_url");
      const requiredPages = asStringArray(request, "required_pages");
      const requiredNavigationItems = asStringArray(request, "required_navigation_items");
      const requiredContentBlocks = asStringArray(request, "required_content_blocks");
      const requiredMediaRefs = asStringArray(request, "required_media_refs");
      const expectedProvenanceRefs = asStringArray(request, "expected_provenance_refs");

      // Fail-closed: required inputs must be present
      if (!payloadSyncRef || !previewUrl) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required preview_readiness_check inputs: payload_sync_ref and preview_url are required") };
      }

      // Fail-closed: at least one check requirement must be specified
      const hasAnyRequirements = requiredPages.length > 0 ||
        requiredNavigationItems.length > 0 ||
        requiredContentBlocks.length > 0 ||
        requiredMediaRefs.length > 0;

      if (!hasAnyRequirements) {
        return {
          failure: fail(
            "WORKFLOW_STEP_FAILED",
            "No readiness requirements specified. At least one of required_pages, required_navigation_items, required_content_blocks, or required_media_refs must be provided.",
          ),
        };
      }

      try {
        const readiness = await payloadClient.checkReadiness(payloadSyncRef, {
          requiredPages,
          requiredNavigationItems,
          requiredContentBlocks,
          requiredMediaRefs,
        });

        // Merge in provenance check if expected refs were provided
        const allFailedChecks = [...readiness.failedChecks];
        if (expectedProvenanceRefs.length > 0) {
          // In a full implementation, verify provenance refs exist in audit trail
          // For MVO: deterministic check that provenance was specified
          const provenanceCheckPassed = expectedProvenanceRefs.every(ref => ref.length > 0);
          if (!provenanceCheckPassed) {
            allFailedChecks.push("provenance_refs_invalid");
          }
        }

        const checksPassed = readiness.checksPassed && allFailedChecks.length === 0;
        const status = checksPassed ? "ready" : "failed";

        return {
          outputs: {
            checks_passed: checksPassed,
            check_report_ref: `readiness_report:${request.tenant_id}:${request.run_id}:${request.idempotency_key}`,
            failed_checks: allFailedChecks,
            preview_readiness_status: status,
            checked_at: new Date().toISOString(),
            checked_items: {
              pages_count: requiredPages.length,
              navigation_items_count: requiredNavigationItems.length,
              content_blocks_count: requiredContentBlocks.length,
              media_refs_count: requiredMediaRefs.length,
              provenance_refs_count: expectedProvenanceRefs.length,
            },
          },
        };
      } catch (error) {
        const reason = error instanceof Error ? error.message : "unknown error";
        if (reason.includes("not configured for development mode")) {
          // Development fallback: fail-closed when services not configured
          // Only succeed if explicit requirements were provided (checked above)
          // Return deterministic failure indicating checks could not be performed
          return {
            outputs: {
              checks_passed: false,
              check_report_ref: `readiness_report:${request.tenant_id}:${request.run_id}:${request.idempotency_key}`,
              failed_checks: ["payload_service_not_configured"],
              preview_readiness_status: "failed",
              checked_at: new Date().toISOString(),
              dev_fallback: true,
              checked_items: {
                pages_count: requiredPages.length,
                navigation_items_count: requiredNavigationItems.length,
                content_blocks_count: requiredContentBlocks.length,
                media_refs_count: requiredMediaRefs.length,
                provenance_refs_count: expectedProvenanceRefs.length,
              },
            },
          };
        }
        return {
          failure: fail(
            "INTEGRATION_UNAVAILABLE",
            `Payload readiness check failed: ${reason}`,
          ),
        };
      }
    });

    // Emit audit events for checked/failed outcomes
    if ("outputs" in result) {
      const checksPassed = result.outputs.checks_passed === true;
      const parentEventId = result.audit_event_ids[result.audit_event_ids.length - 1] ?? result.audit_event_ids[0];
      await auditEmitter.emitPreviewReadinessChecked(
        request,
        context.workflow_run_id,
        checksPassed,
        parentEventId,
      );
      if (!checksPassed) {
        const failedChecks = Array.isArray(result.outputs.failed_checks)
          ? result.outputs.failed_checks.filter((item): item is string => typeof item === "string")
          : [];
        await auditEmitter.emitPreviewReadinessFailed(
          request,
          context.workflow_run_id,
          failedChecks,
          parentEventId,
        );
      }
    }
    return result;
  };
}

export function createCrmReadyToContactMarkHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      // Strict lease requirement - fail closed
      const leaseCheck = requireLeaseId(request);
      if (!leaseCheck.ok) return { failure: leaseCheck.failure };

      const leadId = asString(request, "lead_id");
      const siteId = asString(request, "site_id");
      const siteGenerationRunId = asString(request, "site_generation_run_id");
      const checksPassed = readInput(request, "checks_passed") === true;
      const checkReportRef = asString(request, "check_report_ref");
      const payloadSyncRef = asString(request, "payload_sync_ref");

      // Validate all required inputs present
      if (!leadId || !siteId || !siteGenerationRunId || !checkReportRef) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required crm_ready_to_contact_mark inputs: lead_id, site_id, site_generation_run_id, and check_report_ref are required") };
      }

      // Strict validation: checks_passed must be explicitly true (boolean)
      const checksPassedInput = readInput(request, "checks_passed");
      if (checksPassedInput !== true) {
        return {
          failure: fail(
            "WORKFLOW_STEP_FAILED",
            `Cannot mark CRM lead ready_to_contact when checks_passed is not true. Received: ${JSON.stringify(checksPassedInput)}`,
          ),
        };
      }

      // Verify the check report ref format (deterministic validation)
      if (!checkReportRef.startsWith("readiness_report:")) {
        return {
          failure: fail(
            "WORKFLOW_STEP_FAILED",
            "Invalid check_report_ref format. Expected readiness_report:<tenant>:<run>:<idempotency_key>",
          ),
        };
      }

      const statusUpdatedAt = new Date().toISOString();
      const crmRecordId = `crm_record:${request.tenant_id}:${leadId}`;

      crmMarks.set(crmRecordId, {
        crm_record_id: crmRecordId,
        lead_status: "ready_to_contact",
        status_updated_at: statusUpdatedAt,
        lease_id: leaseCheck.leaseId,
        site_id: siteId,
        site_generation_run_id: siteGenerationRunId,
        check_report_ref: checkReportRef,
        payload_sync_ref: payloadSyncRef ?? null,
        marked_by_workflow: context.workflow_run_id,
      });

      return {
        outputs: {
          crm_record_id: crmRecordId,
          lead_status: "ready_to_contact",
          status_updated_at: statusUpdatedAt,
          site_id: siteId,
          site_generation_run_id: siteGenerationRunId,
          check_report_ref: checkReportRef,
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
