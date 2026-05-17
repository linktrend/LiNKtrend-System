import { beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { AuditEvent, WorkflowInvokeRequest } from "@linktrend/linklogic-sdk";
import {
  bootstrapWebsiteFactoryWorkflows,
  clearIdempotencyCache,
  clearWorkflowRegistry,
  clearLinksitesStores,
  invokeWorkflow,
  LINKSITES_ARTIFACT_WRITE_LOCAL_HANDLE,
  LINKSITES_SUPABASE_MIRROR_UPSERT_HANDLE,
  LINKSITES_PAYLOAD_SYNC_LOCAL_HANDLE,
  LINKSITES_PREVIEW_READINESS_CHECK_HANDLE,
  LINKSITES_CRM_READY_TO_CONTACT_MARK_HANDLE,
} from "../index.js";

function createMockAuditWriter() {
  const events: AuditEvent[] = [];
  return {
    write: async (event: AuditEvent) => {
      events.push(event);
      return { event_id: event.event_id };
    },
    clear: () => {
      events.length = 0;
    },
    getEvents: () => events.slice(),
  };
}

describe("LiNKautowork LinkSites v2 Workflows", () => {
  const auditWriter = createMockAuditWriter();

  beforeEach(() => {
    clearIdempotencyCache();
    clearWorkflowRegistry();
    clearLinksitesStores();
    auditWriter.clear();
    bootstrapWebsiteFactoryWorkflows({ writeAuditEvent: auditWriter.write });
  });

  it("runs the five LinkSites handles with deterministic replay", async () => {
    const artifactRootPath = await mkdtemp(path.join(os.tmpdir(), "linksites-artifacts-"));
    const artifactRequest: WorkflowInvokeRequest = {
      tenant_id: "tenant-1",
      run_id: "run-1",
      stage_id: "artifact_write",
      workflow_handle: LINKSITES_ARTIFACT_WRITE_LOCAL_HANDLE,
      inputs: {
        site_id: "site-1",
        site_generation_run_id: "gen-1",
        artifact_bundle_ref: "bundle:1",
        artifact_root_path: artifactRootPath,
      },
      idempotency_key: "artifact-1",
    };

    try {
      const artifactResult = await invokeWorkflow(artifactRequest, { writeAuditEvent: auditWriter.write });
      const artifactReplay = await invokeWorkflow(artifactRequest, { writeAuditEvent: auditWriter.write });

      expect(artifactResult.status).toBe("succeeded");
      expect(artifactReplay.workflow_run_id).toBe(artifactResult.workflow_run_id);
      expect(artifactResult.outputs?.artifact_ref).toBeDefined();

      const manifestRef = artifactResult.outputs?.artifact_manifest_ref;
      expect(typeof manifestRef).toBe("string");
      const manifestPath = path.join(artifactRootPath, String(manifestRef));
      const manifestJson = JSON.parse(await readFile(manifestPath, "utf8")) as Record<string, unknown>;
      expect(manifestJson.tenant_id).toBe("tenant-1");
      expect(manifestJson.run_id).toBe("run-1");
      expect(manifestJson.site_id).toBe("site-1");
      expect(manifestJson.site_generation_run_id).toBe("gen-1");
      expect(manifestJson.artifact_bundle_ref).toBe("bundle:1");
      expect(manifestJson.artifact_digest).toBe(artifactResult.outputs?.artifact_digest);
      expect(Array.isArray(manifestJson.written_files)).toBe(true);

      const mirrorRequest: WorkflowInvokeRequest = {
      tenant_id: "tenant-1",
      run_id: "run-1",
      stage_id: "mirror_upsert",
      workflow_handle: LINKSITES_SUPABASE_MIRROR_UPSERT_HANDLE,
      lease_id: "lease-mirror-1",
      inputs: {
        site_id: "site-1",
        site_generation_run_id: "gen-1",
        artifact_ref: artifactResult.outputs?.artifact_ref,
        mirror_payload_ref: "payload:mirror-1",
      },
      idempotency_key: "mirror-1",
      };

      const mirrorResult = await invokeWorkflow(mirrorRequest, { writeAuditEvent: auditWriter.write });
      expect(mirrorResult.status).toBe("succeeded");

      const payloadRequest: WorkflowInvokeRequest = {
      tenant_id: "tenant-1",
      run_id: "run-1",
      stage_id: "payload_sync",
      workflow_handle: LINKSITES_PAYLOAD_SYNC_LOCAL_HANDLE,
      lease_id: "lease-payload-1",
      inputs: {
        site_id: "site-1",
        site_generation_run_id: "gen-1",
        mirror_write_ref: mirrorResult.outputs?.mirror_write_ref,
        payload_target_ref: "payload-local:site-1",
      },
      idempotency_key: "payload-1",
      };

      const payloadResult = await invokeWorkflow(payloadRequest, { writeAuditEvent: auditWriter.write });
      expect(payloadResult.status).toBe("succeeded");

      const readinessRequest: WorkflowInvokeRequest = {
      tenant_id: "tenant-1",
      run_id: "run-1",
      stage_id: "readiness_check",
      workflow_handle: LINKSITES_PREVIEW_READINESS_CHECK_HANDLE,
      inputs: {
        site_id: "site-1",
        site_generation_run_id: "gen-1",
        payload_sync_ref: payloadResult.outputs?.payload_sync_ref,
        preview_url: "/preview/tenant-1/run-1/index.html",
        required_pages: ["home", "about", "contact"],
        required_navigation_items: ["home", "services", "contact"],
        required_content_blocks: ["hero", "features"],
        required_media_refs: ["asset-1", "asset-2"],
      },
      idempotency_key: "readiness-1",
      };

      const readinessResult = await invokeWorkflow(readinessRequest, { writeAuditEvent: auditWriter.write });
      expect(readinessResult.status).toBe("succeeded");
      expect(readinessResult.outputs?.checks_passed).toBe(true);
      expect(auditWriter.getEvents().some((event) => event.action === "preview.readiness.checked")).toBe(true);

      const crmRequest: WorkflowInvokeRequest = {
      tenant_id: "tenant-1",
      run_id: "run-1",
      stage_id: "crm_mark",
      workflow_handle: LINKSITES_CRM_READY_TO_CONTACT_MARK_HANDLE,
      lease_id: "lease-crm-1",
      inputs: {
        lead_id: "lead-1",
        site_id: "site-1",
        site_generation_run_id: "gen-1",
        checks_passed: readinessResult.outputs?.checks_passed,
        check_report_ref: readinessResult.outputs?.check_report_ref,
      },
      idempotency_key: "crm-1",
      };

      const crmResult = await invokeWorkflow(crmRequest, { writeAuditEvent: auditWriter.write });
      expect(crmResult.status).toBe("succeeded");
      expect(crmResult.outputs?.lead_status).toBe("ready_to_contact");
    } finally {
      await rm(artifactRootPath, { recursive: true, force: true });
    }
  });

  it("fails closed when lease is missing on write handles", async () => {
    const request: WorkflowInvokeRequest = {
      tenant_id: "tenant-1",
      run_id: "run-1",
      stage_id: "mirror_upsert",
      workflow_handle: LINKSITES_SUPABASE_MIRROR_UPSERT_HANDLE,
      inputs: {
        site_id: "site-1",
        site_generation_run_id: "gen-1",
        artifact_ref: "artifact:1",
        mirror_payload_ref: "payload:1",
      },
      idempotency_key: "missing-lease-1",
    };

    const result = await invokeWorkflow(request, { writeAuditEvent: auditWriter.write });
    expect(result.status).toBe("failed");
    expect(result.failure?.code).toBe("LEASE_REQUEST_INVALID");
  });

  it("returns readiness failure output when required checks are missing", async () => {
    const request: WorkflowInvokeRequest = {
      tenant_id: "tenant-1",
      run_id: "run-1",
      stage_id: "readiness_check",
      workflow_handle: LINKSITES_PREVIEW_READINESS_CHECK_HANDLE,
      inputs: {
        site_id: "site-1",
        site_generation_run_id: "gen-1",
        payload_sync_ref: "payload_sync:1",
        preview_url: "/preview/tenant-1/run-1/index.html",
        required_pages: [],
        required_navigation_items: ["home"],
        required_content_blocks: [],
        required_media_refs: [],
      },
      idempotency_key: "readiness-fail-1",
    };

    const result = await invokeWorkflow(request, { writeAuditEvent: auditWriter.write });
    expect(result.status).toBe("succeeded");
    expect(result.outputs?.checks_passed).toBe(false);
    expect(result.outputs?.preview_readiness_status).toBe("failed");
    expect((result.outputs?.failed_checks as string[]).length).toBeGreaterThan(0);
    const actions = auditWriter.getEvents().map((event) => event.action);
    expect(actions).toContain("preview.readiness.checked");
    expect(actions).toContain("preview.readiness.failed");
  });

  it("fails safely when artifact_root_path is invalid", async () => {
    const request: WorkflowInvokeRequest = {
      tenant_id: "tenant-1",
      run_id: "run-1",
      stage_id: "artifact_write",
      workflow_handle: LINKSITES_ARTIFACT_WRITE_LOCAL_HANDLE,
      inputs: {
        site_id: "site-1",
        site_generation_run_id: "gen-1",
        artifact_bundle_ref: "bundle:1",
        artifact_root_path: "./relative-path-not-allowed",
      },
      idempotency_key: "artifact-invalid-root",
    };

    const result = await invokeWorkflow(request, { writeAuditEvent: auditWriter.write });
    expect(result.status).toBe("failed");
    expect(result.failure?.code).toBe("WORKFLOW_STEP_FAILED");
    expect(result.failure?.message).toContain("artifact_root_path");
  });

  it("fails safely when artifact path identifiers contain traversal", async () => {
    const artifactRootPath = await mkdtemp(path.join(os.tmpdir(), "linksites-artifacts-"));
    const request: WorkflowInvokeRequest = {
      tenant_id: "tenant-1",
      run_id: "run-1",
      stage_id: "artifact_write",
      workflow_handle: LINKSITES_ARTIFACT_WRITE_LOCAL_HANDLE,
      inputs: {
        site_id: "../escaped-site",
        site_generation_run_id: "gen-1",
        artifact_bundle_ref: "bundle:1",
        artifact_root_path: artifactRootPath,
      },
      idempotency_key: "artifact-invalid-segment",
    };

    try {
      const result = await invokeWorkflow(request, { writeAuditEvent: auditWriter.write });
      expect(result.status).toBe("failed");
      expect(result.failure?.code).toBe("WORKFLOW_STEP_FAILED");
      expect(result.failure?.message).toContain("site_id");
    } finally {
      await rm(artifactRootPath, { recursive: true, force: true });
    }
  });
});
