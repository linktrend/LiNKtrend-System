/**
 * LiNKapps Workflow Pack Tests
 *
 * Tests success paths, missing lease/idempotency failures, and live-mode rejection.
 * Per CONTRACTS_MVO.md §6.4 and LINKAPPS_CAPABILITY_REQUIREMENTS.md §5.4 failure taxonomy.
 */

import { describe, it, expect, beforeEach } from "vitest";
import type { WorkflowInvokeRequest, WorkflowContext } from "@linktrend/linklogic-sdk";
import {
  createRepoHandler,
  provisionServicesHandler,
  buildIterationHandler,
  releaseReadinessHandler,
  deployHandler,
  compileHandoffHandler,
  CREATE_REPO_HANDLE,
  PROVISION_SERVICES_HANDLE,
  BUILD_ITERATION_HANDLE,
  RELEASE_READINESS_HANDLE,
  DEPLOY_HANDLE,
  COMPILE_HANDOFF_HANDLE,
  getRepoCreation,
  getServiceProvision,
  getBuildIteration,
  getReleaseReadiness,
  getDeployment,
  getHandoffPackage,
  listAllRepoCreations,
  clearLinkappsStores,
  getWorkflowHandles,
} from "./linkapps.js";

// Mock audit emitter
function createMockAuditEmitter() {
  let eventCounter = 0;
  return {
    emitInvoked: async () => `event-invoked-${++eventCounter}`,
    emitCompleted: async () => `event-completed-${++eventCounter}`,
    emitFailed: async () => `event-failed-${++eventCounter}`,
    emitCompensated: async () => `event-compensated-${++eventCounter}`,
    emitPreviewReadinessChecked: async () => `event-readiness-checked-${++eventCounter}`,
    emitPreviewReadinessFailed: async () => `event-readiness-failed-${++eventCounter}`,
  };
}

function createMockRequest(overrides: Partial<WorkflowInvokeRequest> = {}): WorkflowInvokeRequest {
  return {
    tenant_id: "test-tenant",
    run_id: "test-run-001",
    stage_id: "test-stage",
    workflow_handle: CREATE_REPO_HANDLE,
    inputs: {},
    idempotency_key: `idem-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ...overrides,
  } as WorkflowInvokeRequest;
}

function createMockContext(overrides: Partial<WorkflowContext> = {}): WorkflowContext {
  return {
    env: {},
    tenant_id: "test-tenant",
    run_id: "test-run-001",
    stage_id: "test-stage",
    workflow_run_id: `wf-${Date.now()}`,
    idempotency_key: `idem-${Date.now()}`,
    ...overrides,
  } as WorkflowContext;
}

describe("LiNKapps Workflow Pack", () => {
  beforeEach(() => {
    clearLinkappsStores();
  });

  describe("workflow handles", () => {
    it("should expose all 6 workflow handles", () => {
      const handles = getWorkflowHandles();
      expect(handles).toHaveLength(6);
      expect(handles).toContain(CREATE_REPO_HANDLE);
      expect(handles).toContain(PROVISION_SERVICES_HANDLE);
      expect(handles).toContain(BUILD_ITERATION_HANDLE);
      expect(handles).toContain(RELEASE_READINESS_HANDLE);
      expect(handles).toContain(DEPLOY_HANDLE);
      expect(handles).toContain(COMPILE_HANDOFF_HANDLE);
    });

    it("should use correct handle naming convention", () => {
      const handles = getWorkflowHandles();
      for (const handle of handles) {
        expect(handle).toMatch(/^autowork\.linkapps\.[a-z_]+$/);
      }
    });
  });

  describe("autowork.linkapps.create_repo", () => {
    it("should succeed with valid inputs and lease", async () => {
      const handler = createRepoHandler(createMockAuditEmitter());
      const request = createMockRequest({
        workflow_handle: CREATE_REPO_HANDLE,
        lease_id: "lease-test-001",
        inputs: {
          app_slug: "test-app",
          app_name: "Test Application",
          blueprint_ref: "blueprint://test-001",
          prd_ref: "prd://test-001",
        },
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("outputs" in result).toBe(true);
      if ("outputs" in result) {
        expect(result.outputs.app_repo_ref).toBeDefined();
        expect(result.outputs.app_repo_ref.repo_url).toMatch(/^mock:\/\//);
        expect(result.outputs.git_commit_sha).toMatch(/^mock-/);
        expect(result.outputs.lease_id).toBe("lease-test-001");
        expect(result.outputs.mode).toBe("mock");
        expect(result.audit_event_ids).toHaveLength(2);
      }
    });

    it("should fail without lease_id (fail-closed)", async () => {
      const handler = createRepoHandler(createMockAuditEmitter());
      const request = createMockRequest({
        workflow_handle: CREATE_REPO_HANDLE,
        lease_id: undefined,
        inputs: {
          app_slug: "test-app",
          app_name: "Test Application",
          blueprint_ref: "blueprint://test-001",
        },
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("LEASE_REQUEST_INVALID");
        expect(result.failure.message).toContain("lease_id");
        expect(result.failure.retryable).toBe(false);
      }
    });

    it("should fail without idempotency_key", async () => {
      const handler = createRepoHandler(createMockAuditEmitter());
      const request = createMockRequest({
        workflow_handle: CREATE_REPO_HANDLE,
        lease_id: "lease-test-001",
        idempotency_key: "",
        inputs: {
          app_slug: "test-app",
          app_name: "Test Application",
          blueprint_ref: "blueprint://test-001",
        },
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("LEASE_IDEMPOTENCY_CONFLICT");
        expect(result.failure.message).toContain("idempotency_key");
      }
    });

    it("should reject live mode attempts", async () => {
      const handler = createRepoHandler(createMockAuditEmitter());
      const request = createMockRequest({
        workflow_handle: CREATE_REPO_HANDLE,
        lease_id: "lease-test-001",
        inputs: {
          app_slug: "test-app",
          app_name: "Test Application",
          blueprint_ref: "blueprint://test-001",
          mode: "live",
        },
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("LEASE_DENIED");
        expect(result.failure.message).toContain("Live mode not supported");
        expect(result.failure.retryable).toBe(false);
      }
    });

    it("should validate app_slug format", async () => {
      const handler = createRepoHandler(createMockAuditEmitter());
      const request = createMockRequest({
        workflow_handle: CREATE_REPO_HANDLE,
        lease_id: "lease-test-001",
        inputs: {
          app_slug: "Invalid_Slug", // invalid: uppercase and underscore
          app_name: "Test Application",
          blueprint_ref: "blueprint://test-001",
        },
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("LEASE_REQUEST_INVALID");
        expect(result.failure.message).toContain("app_slug");
      }
    });

    it("should fail with missing required inputs", async () => {
      const handler = createRepoHandler(createMockAuditEmitter());
      const request = createMockRequest({
        workflow_handle: CREATE_REPO_HANDLE,
        lease_id: "lease-test-001",
        inputs: {
          // missing app_slug, app_name, blueprint_ref
        },
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("WORKFLOW_STEP_FAILED");
        expect(result.failure.message).toContain("Missing required");
      }
    });

    it("should return same result on idempotent replay", async () => {
      const handler = createRepoHandler(createMockAuditEmitter());
      const idempotencyKey = "test-idem-replay";
      const request = createMockRequest({
        workflow_handle: CREATE_REPO_HANDLE,
        lease_id: "lease-test-001",
        idempotency_key: idempotencyKey,
        inputs: {
          app_slug: "test-app",
          app_name: "Test Application",
          blueprint_ref: "blueprint://test-001",
        },
      });
      const context = createMockContext();

      const result1 = await handler(request, context);
      const result2 = await handler(request, context);

      expect("outputs" in result1).toBe(true);
      expect("outputs" in result2).toBe(true);
      if ("outputs" in result1 && "outputs" in result2) {
        expect(result2.outputs.git_commit_sha).toBe(result1.outputs.git_commit_sha);
        expect(result2.outputs.created_at).toBe(result1.outputs.created_at);
      }
    });
  });

  describe("autowork.linkapps.provision_services", () => {
    it("should succeed with valid inputs and lease", async () => {
      const handler = provisionServicesHandler(createMockAuditEmitter());
      const request = createMockRequest({
        workflow_handle: PROVISION_SERVICES_HANDLE,
        lease_id: "lease-test-002",
        inputs: {
          app_repo_ref: { repo_url: "mock://test" },
          tenant_id: "test-tenant",
          app_slug: "test-app",
          provisioning_profile_ref: "profile://default",
        },
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("outputs" in result).toBe(true);
      if ("outputs" in result) {
        expect(result.outputs.service_credentials_ref).toMatch(/^credentials:/);
        expect(result.outputs.supabase_project_ref).toMatch(/^mock-supabase-/);
        expect(result.outputs.stripe_product_ids_ref).toBeDefined();
        expect(result.outputs.stripe_product_ids_ref.free).toMatch(/^mock_price_free_/);
        expect(result.outputs.mode).toBe("mock");
      }
    });

    it("should fail without lease_id", async () => {
      const handler = provisionServicesHandler(createMockAuditEmitter());
      const request = createMockRequest({
        workflow_handle: PROVISION_SERVICES_HANDLE,
        lease_id: undefined,
        inputs: {
          app_repo_ref: { repo_url: "mock://test" },
          tenant_id: "test-tenant",
        },
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("LEASE_REQUEST_INVALID");
      }
    });

    it("should reject live mode attempts", async () => {
      const handler = provisionServicesHandler(createMockAuditEmitter());
      const request = createMockRequest({
        workflow_handle: PROVISION_SERVICES_HANDLE,
        lease_id: "lease-test-002",
        inputs: {
          app_repo_ref: { repo_url: "mock://test" },
          tenant_id: "test-tenant",
          mode: "live",
        },
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("LEASE_DENIED");
      }
    });
  });

  describe("autowork.linkapps.build_iteration", () => {
    it("should succeed with valid inputs (no lease required)", async () => {
      const handler = buildIterationHandler(createMockAuditEmitter());
      const request = createMockRequest({
        workflow_handle: BUILD_ITERATION_HANDLE,
        // no lease_id - build_iteration doesn't require one
        inputs: {
          app_repo_ref: { repo_url: "mock://test" },
          prd_ref: "prd://test-001",
          squad_config: { roles: ["frontend_specialist"] },
          iteration_num: 1,
        },
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("outputs" in result).toBe(true);
      if ("outputs" in result) {
        expect(result.outputs.implementation_bundle_ref).toMatch(/^bundle:/);
        expect(result.outputs.built_app_bundle.build_status).toBe("succeeded");
        expect(result.outputs.iteration_num).toBe(1);
        expect(result.outputs.mode).toBe("mock");
      }
    });

    it("should fail without idempotency_key", async () => {
      const handler = buildIterationHandler(createMockAuditEmitter());
      const request = createMockRequest({
        workflow_handle: BUILD_ITERATION_HANDLE,
        idempotency_key: "",
        inputs: {
          app_repo_ref: { repo_url: "mock://test" },
          prd_ref: "prd://test-001",
        },
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("LEASE_IDEMPOTENCY_CONFLICT");
      }
    });
  });

  describe("autowork.linkapps.release_readiness", () => {
    it("should succeed with valid inputs and lease", async () => {
      const handler = releaseReadinessHandler(createMockAuditEmitter());
      const request = createMockRequest({
        workflow_handle: RELEASE_READINESS_HANDLE,
        lease_id: "lease-test-003",
        inputs: {
          app_repo_ref: { repo_url: "mock://test" },
          test_matrix_ref: "matrix://default",
        },
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("outputs" in result).toBe(true);
      if ("outputs" in result) {
        expect(result.outputs.validation_report_ref).toMatch(/^validation:/);
        expect(result.outputs.checks_passed).toBe(true);
        expect(result.outputs.lease_id).toBe("lease-test-003");
        expect(result.outputs.mode).toBe("mock");
      }
    });

    it("should fail without lease_id", async () => {
      const handler = releaseReadinessHandler(createMockAuditEmitter());
      const request = createMockRequest({
        workflow_handle: RELEASE_READINESS_HANDLE,
        lease_id: undefined,
        inputs: {
          app_repo_ref: { repo_url: "mock://test" },
        },
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("LEASE_REQUEST_INVALID");
      }
    });
  });

  describe("autowork.linkapps.deploy", () => {
    it("should succeed with valid inputs and lease", async () => {
      const handler = deployHandler(createMockAuditEmitter());
      const request = createMockRequest({
        workflow_handle: DEPLOY_HANDLE,
        lease_id: "lease-test-004",
        inputs: {
          app_repo_ref: { repo_url: "mock://test" },
          deployment_target_ref: "target://preview",
          app_slug: "test-app",
        },
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("outputs" in result).toBe(true);
      if ("outputs" in result) {
        expect(result.outputs.deployment_refs).toBeInstanceOf(Array);
        expect(result.outputs.deployment_refs[0]).toMatch(/^deploy:/);
        expect(result.outputs.preview_urls[0]).toMatch(/^http:\/\/localhost/);
        expect(result.outputs.lease_id).toBe("lease-test-004");
        expect(result.outputs.mode).toBe("mock");
      }
    });

    it("should fail without lease_id", async () => {
      const handler = deployHandler(createMockAuditEmitter());
      const request = createMockRequest({
        workflow_handle: DEPLOY_HANDLE,
        lease_id: undefined,
        inputs: {
          app_repo_ref: { repo_url: "mock://test" },
        },
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("LEASE_REQUEST_INVALID");
      }
    });

    it("should reject live mode attempts", async () => {
      const handler = deployHandler(createMockAuditEmitter());
      const request = createMockRequest({
        workflow_handle: DEPLOY_HANDLE,
        lease_id: "lease-test-004",
        inputs: {
          app_repo_ref: { repo_url: "mock://test" },
          mode: "live",
        },
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("LEASE_DENIED");
      }
    });
  });

  describe("autowork.linkapps.compile_handoff", () => {
    it("should succeed with valid inputs and lease", async () => {
      const handler = compileHandoffHandler(createMockAuditEmitter());
      const request = createMockRequest({
        workflow_handle: COMPILE_HANDOFF_HANDLE,
        lease_id: "lease-test-005",
        inputs: {
          app_repo_ref: { repo_url: "mock://test" },
          service_refs: { supabase: "mock-ref" },
          deployment_refs: ["deploy://test"],
        },
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("outputs" in result).toBe(true);
      if ("outputs" in result) {
        expect(result.outputs.handoff_package_ref).toMatch(/^handoff:/);
        expect(result.outputs.package_contents).toBeDefined();
        expect(result.outputs.lease_id).toBe("lease-test-005");
        expect(result.outputs.mode).toBe("mock");
      }
    });

    it("should fail without lease_id", async () => {
      const handler = compileHandoffHandler(createMockAuditEmitter());
      const request = createMockRequest({
        workflow_handle: COMPILE_HANDOFF_HANDLE,
        lease_id: undefined,
        inputs: {
          app_repo_ref: { repo_url: "mock://test" },
        },
      });
      const context = createMockContext();

      const result = await handler(request, context);

      expect("failure" in result).toBe(true);
      if ("failure" in result) {
        expect(result.failure.code).toBe("LEASE_REQUEST_INVALID");
      }
    });
  });

  describe("store management", () => {
    it("should retrieve stored repo creations", async () => {
      const handler = createRepoHandler(createMockAuditEmitter());
      const idempotencyKey = "test-store-retrieve";
      const request = createMockRequest({
        workflow_handle: CREATE_REPO_HANDLE,
        lease_id: "lease-test-001",
        idempotency_key: idempotencyKey,
        inputs: {
          app_slug: "test-app",
          app_name: "Test Application",
          blueprint_ref: "blueprint://test-001",
        },
      });
      const context = createMockContext();

      await handler(request, context);

      const stored = getRepoCreation(idempotencyKey);
      expect(stored).toBeDefined();
      expect(stored?.app_repo_ref).toBeDefined();
    });

    it("should clear all stores", async () => {
      // Create some entries
      const repoHandler = createRepoHandler(createMockAuditEmitter());
      const deployHandler2 = deployHandler(createMockAuditEmitter());

      await repoHandler(createMockRequest({
        workflow_handle: CREATE_REPO_HANDLE,
        lease_id: "lease-1",
        idempotency_key: "key-1",
        inputs: { app_slug: "app1", app_name: "App 1", blueprint_ref: "b://1" },
      }), createMockContext());

      await deployHandler2(createMockRequest({
        workflow_handle: DEPLOY_HANDLE,
        lease_id: "lease-2",
        idempotency_key: "key-2",
        inputs: { app_repo_ref: {} },
      }), createMockContext());

      // Verify stores have entries
      expect(listAllRepoCreations()).toHaveLength(1);

      // Clear stores
      clearLinkappsStores();

      // Verify stores are empty
      expect(getRepoCreation("key-1")).toBeUndefined();
      expect(getDeployment("key-2")).toBeUndefined();
    });
  });
});
