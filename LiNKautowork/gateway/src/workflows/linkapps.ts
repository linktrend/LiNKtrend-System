/**
 * LiNKapps App Factory Workflow Pack
 *
 * Deterministic workflow handlers for Linkapps Phase 5 stages.
 * Per CONTRACTS_MVO.md and LINKAPPS_CAPABILITY_REQUIREMENTS.md.
 *
 * All operations are development-mode stubs - no live external writes.
 *
 * Workflow handles:
 * - autowork.linkapps.create_repo (Stage 5.2)
 * - autowork.linkapps.provision_services (Stage 5.3)
 * - autowork.linkapps.build_iteration (Stage 5.4)
 * - autowork.linkapps.release_readiness (Stage 5.5)
 * - autowork.linkapps.deploy (Stage 5.6)
 * - autowork.linkapps.compile_handoff (Stage 5.7)
 */

import { createHash } from "node:crypto";
import type { WorkflowInvokeRequest } from "@linktrend/linklogic-sdk";
import type { AuditEmitter } from "../lib/audit-emitter.js";
import type { WorkflowHandler } from "../types/index.js";

// Workflow handle constants per manifest.yaml required_workflow_hooks
export const CREATE_REPO_HANDLE = "autowork.linkapps.create_repo";
export const PROVISION_SERVICES_HANDLE = "autowork.linkapps.provision_services";
export const BUILD_ITERATION_HANDLE = "autowork.linkapps.build_iteration";
export const RELEASE_READINESS_HANDLE = "autowork.linkapps.release_readiness";
export const DEPLOY_HANDLE = "autowork.linkapps.deploy";
export const COMPILE_HANDOFF_HANDLE = "autowork.linkapps.compile_handoff";

// In-memory stores for idempotency and testing (MVO development mode)
const repoCreations = new Map<string, Record<string, unknown>>();
const serviceProvisions = new Map<string, Record<string, unknown>>();
const buildIterations = new Map<string, Record<string, unknown>>();
const releaseReadiness = new Map<string, Record<string, unknown>>();
const deployments = new Map<string, Record<string, unknown>>();
const handoffPackages = new Map<string, Record<string, unknown>>();

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

function asRecord(request: WorkflowInvokeRequest, key: string): Record<string, unknown> | undefined {
  const value = readInput(request, key);
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
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

function requireIdempotencyKey(request: WorkflowInvokeRequest):
  | { ok: true; idempotencyKey: string }
  | { ok: false; failure: { code: string; message: string; retryable: boolean } } {
  if (!request.idempotency_key || request.idempotency_key.trim().length === 0) {
    return {
      ok: false,
      failure: fail("LEASE_IDEMPOTENCY_CONFLICT", "Missing required idempotency_key"),
    };
  }
  return { ok: true, idempotencyKey: request.idempotency_key };
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
 * Stage 5.2: Repository Generation
 * Corresponds to linkapps.phase5.repo_generation in manifest.yaml
 *
 * Side-effect: YES (requires lease)
 * Capability: cap.github.repo_management (mock mode only)
 */
export function createRepoHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      // Fail closed: lease and idempotency required
      const leaseCheck = requireLeaseId(request);
      if (!leaseCheck.ok) return { failure: leaseCheck.failure };

      const idempotencyCheck = requireIdempotencyKey(request);
      if (!idempotencyCheck.ok) return { failure: idempotencyCheck.failure };

      // Reject live mode attempts
      const mode = readInput(request, "mode");
      if (mode === "live") {
        return {
          failure: fail(
            "LEASE_DENIED",
            "Live mode not supported in development. Use mock mode only.",
            false,
          ),
        };
      }

      const appSlug = asString(request, "app_slug");
      const appName = asString(request, "app_name");
      const blueprintRef = asString(request, "blueprint_ref");
      const prdRef = asString(request, "prd_ref");

      if (!appSlug || !appName || !blueprintRef) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required create_repo inputs: app_slug, app_name, blueprint_ref") };
      }

      // Validate app_slug format (kebab-case)
      if (!/^[a-z][a-z0-9-]*$/.test(appSlug)) {
        return {
          failure: fail(
            "LEASE_REQUEST_INVALID",
            `Invalid app_slug format: ${appSlug}. Must be kebab-case starting with lowercase letter.`,
          ),
        };
      }

      // Idempotency check: return existing if same key
      const existing = repoCreations.get(idempotencyCheck.idempotencyKey);
      if (existing) {
        return { outputs: existing };
      }

      // Mock repo creation (development mode - no real GitHub writes)
      const now = new Date().toISOString();
      const initialCommitSha = `mock-${digest(`${request.tenant_id}:${appSlug}:${now}`).slice(0, 40)}`;

      const outputs = {
        app_repo_ref: {
          repo_url: `mock://github.com/${request.tenant_id}/${appSlug}`,
          clone_url: `mock://github.com/${request.tenant_id}/${appSlug}.git`,
          default_branch: "main",
          initial_commit_sha: initialCommitSha,
        },
        git_commit_sha: initialCommitSha,
        created_at: now,
        lease_id: leaseCheck.leaseId,
        idempotency_key: idempotencyCheck.idempotencyKey,
        mode: "mock",
      };

      repoCreations.set(idempotencyCheck.idempotencyKey, outputs);
      return { outputs };
    });
  };
}

/**
 * Stage 5.3: Service Provisioning
 * Corresponds to linkapps.phase5.service_provisioning in manifest.yaml
 *
 * Side-effect: YES (requires lease)
 * Capabilities: cap.supabase.provisioning, cap.stripe.product_management (mock mode)
 */
export function provisionServicesHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      const leaseCheck = requireLeaseId(request);
      if (!leaseCheck.ok) return { failure: leaseCheck.failure };

      const idempotencyCheck = requireIdempotencyKey(request);
      if (!idempotencyCheck.ok) return { failure: idempotencyCheck.failure };

      const mode = readInput(request, "mode");
      if (mode === "live") {
        return {
          failure: fail(
            "LEASE_DENIED",
            "Live mode not supported in development. Use mock mode only.",
            false,
          ),
        };
      }

      const appRepoRef = asRecord(request, "app_repo_ref");
      const tenantId = asString(request, "tenant_id");
      const provisioningProfileRef = asString(request, "provisioning_profile_ref");

      if (!appRepoRef || !tenantId) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required provision_services inputs: app_repo_ref, tenant_id") };
      }

      // Idempotency check
      const existing = serviceProvisions.get(idempotencyCheck.idempotencyKey);
      if (existing) {
        return { outputs: existing };
      }

      // Mock service provisioning (development mode)
      const now = new Date().toISOString();
      const appSlug = asString(request, "app_slug") ?? "unknown";

      const outputs = {
        service_credentials_ref: `credentials:${tenantId}:${appSlug}:${digest(now).slice(0, 16)}`,
        supabase_project_ref: `mock-supabase-${tenantId}-${appSlug}`,
        stripe_product_ids_ref: {
          free: `mock_price_free_${appSlug}`,
          pro: `mock_price_pro_${appSlug}`,
          business: `mock_price_business_${appSlug}`,
        },
        provisioned_at: now,
        lease_id: leaseCheck.leaseId,
        idempotency_key: idempotencyCheck.idempotencyKey,
        mode: "mock",
      };

      serviceProvisions.set(idempotencyCheck.idempotencyKey, outputs);
      return { outputs };
    });
  };
}

/**
 * Stage 5.4: AI Implementation Iterations (Build)
 * Corresponds to linkapps.phase5.ai_implementation in manifest.yaml
 *
 * Side-effect: NO (deterministic build, no lease required for build itself)
 * Note: File writes during build iteration would require lease if they touch external systems
 */
export function buildIterationHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      // Build iteration is deterministic, but any external writes require lease
      const idempotencyCheck = requireIdempotencyKey(request);
      if (!idempotencyCheck.ok) return { failure: idempotencyCheck.failure };

      const appRepoRef = asRecord(request, "app_repo_ref");
      const prdRef = asString(request, "prd_ref");
      const squadConfig = asRecord(request, "squad_config");

      if (!appRepoRef || !prdRef) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required build_iteration inputs: app_repo_ref, prd_ref") };
      }

      // Idempotency check
      const existing = buildIterations.get(idempotencyCheck.idempotencyKey);
      if (existing) {
        return { outputs: existing };
      }

      // Mock build iteration (development mode - local deterministic operations only)
      const now = new Date().toISOString();
      const iterationNum = typeof readInput(request, "iteration_num") === "number"
        ? readInput(request, "iteration_num") as number
        : 1;

      const outputs = {
        implementation_bundle_ref: `bundle:${context.workflow_run_id}:${iterationNum}`,
        built_app_bundle: {
          bundle_ref: `built:${context.workflow_run_id}:${iterationNum}`,
          build_status: "succeeded",
          files_changed_count: 0, // Would be populated by actual build
        },
        files_changed_manifest_ref: `manifest:${context.workflow_run_id}:${iterationNum}`,
        iteration_num: iterationNum,
        build_completed_at: now,
        idempotency_key: idempotencyCheck.idempotencyKey,
        mode: "mock",
      };

      buildIterations.set(idempotencyCheck.idempotencyKey, outputs);
      return { outputs };
    });
  };
}

/**
 * Stage 5.5: Quality Validation / Release Readiness
 * Corresponds to linkapps.phase5.quality_validation in manifest.yaml
 *
 * Side-effect: YES (requires lease for validation execution)
 * Capabilities: test_execution leases
 */
export function releaseReadinessHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      const leaseCheck = requireLeaseId(request);
      if (!leaseCheck.ok) return { failure: leaseCheck.failure };

      const idempotencyCheck = requireIdempotencyKey(request);
      if (!idempotencyCheck.ok) return { failure: idempotencyCheck.failure };

      const appRepoRef = asRecord(request, "app_repo_ref");
      const testMatrixRef = asString(request, "test_matrix_ref");

      if (!appRepoRef) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required release_readiness inputs: app_repo_ref") };
      }

      // Idempotency check
      const existing = releaseReadiness.get(idempotencyCheck.idempotencyKey);
      if (existing) {
        return { outputs: existing };
      }

      // Mock quality validation (development mode)
      const now = new Date().toISOString();

      const outputs = {
        validation_report_ref: `validation:${context.workflow_run_id}`,
        checks_passed: true, // Deterministic success in mock mode
        test_results: {
          unit_tests: { passed: true, count: 0 },
          integration_tests: { passed: true, count: 0 },
          e2e_tests: { passed: true, count: 0 },
        },
        validated_at: now,
        lease_id: leaseCheck.leaseId,
        idempotency_key: idempotencyCheck.idempotencyKey,
        mode: "mock",
      };

      releaseReadiness.set(idempotencyCheck.idempotencyKey, outputs);
      return { outputs };
    });
  };
}

/**
 * Stage 5.6: Deployment
 * Corresponds to linkapps.phase5.deployment in manifest.yaml
 *
 * Side-effect: YES (requires lease)
 * Capability: cap.vercel.deployment (mock mode only)
 */
export function deployHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      const leaseCheck = requireLeaseId(request);
      if (!leaseCheck.ok) return { failure: leaseCheck.failure };

      const idempotencyCheck = requireIdempotencyKey(request);
      if (!idempotencyCheck.ok) return { failure: idempotencyCheck.failure };

      const mode = readInput(request, "mode");
      if (mode === "live") {
        return {
          failure: fail(
            "LEASE_DENIED",
            "Live mode not supported in development. Use mock mode only.",
            false,
          ),
        };
      }

      const appRepoRef = asRecord(request, "app_repo_ref");
      const deploymentTargetRef = asString(request, "deployment_target_ref");

      if (!appRepoRef) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required deploy inputs: app_repo_ref") };
      }

      // Idempotency check
      const existing = deployments.get(idempotencyCheck.idempotencyKey);
      if (existing) {
        return { outputs: existing };
      }

      // Mock deployment (development mode - no real Vercel writes)
      const now = new Date().toISOString();
      const appSlug = asString(request, "app_slug") ?? "unknown";
      const tenantId = request.tenant_id;

      const outputs = {
        deployment_refs: [`deploy:${tenantId}:${appSlug}:${digest(now).slice(0, 12)}`],
        preview_urls: [
          `http://localhost:3001/preview/${tenantId}/${appSlug}`,
        ],
        deployed_at: now,
        lease_id: leaseCheck.leaseId,
        idempotency_key: idempotencyCheck.idempotencyKey,
        mode: "mock",
      };

      deployments.set(idempotencyCheck.idempotencyKey, outputs);
      return { outputs };
    });
  };
}

/**
 * Stage 5.7: Handoff Package Compilation
 * Corresponds to linkapps.phase5.handoff_pack in manifest.yaml
 *
 * Side-effect: YES (requires lease for creating handoff artifacts)
 */
export function compileHandoffHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      const leaseCheck = requireLeaseId(request);
      if (!leaseCheck.ok) return { failure: leaseCheck.failure };

      const idempotencyCheck = requireIdempotencyKey(request);
      if (!idempotencyCheck.ok) return { failure: idempotencyCheck.failure };

      const appRepoRef = asRecord(request, "app_repo_ref");
      const serviceRefs = asRecord(request, "service_refs");
      const deploymentRefs = asStringArray(request, "deployment_refs");

      if (!appRepoRef) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required compile_handoff inputs: app_repo_ref") };
      }

      // Idempotency check
      const existing = handoffPackages.get(idempotencyCheck.idempotencyKey);
      if (existing) {
        return { outputs: existing };
      }

      // Mock handoff package creation (development mode)
      const now = new Date().toISOString();

      const outputs = {
        handoff_package_ref: `handoff:${context.workflow_run_id}`,
        audit_event_ids: [`audit:${context.workflow_run_id}:handoff`],
        package_contents: {
          repo_ref: appRepoRef,
          service_refs: serviceRefs ?? {},
          deployment_refs: deploymentRefs,
          documentation_refs: [],
        },
        compiled_at: now,
        lease_id: leaseCheck.leaseId,
        idempotency_key: idempotencyCheck.idempotencyKey,
        mode: "mock",
      };

      handoffPackages.set(idempotencyCheck.idempotencyKey, outputs);
      return { outputs };
    });
  };
}

// Getter functions for testing and verification
export function getRepoCreation(idempotencyKey: string): Record<string, unknown> | undefined {
  return repoCreations.get(idempotencyKey);
}

export function getServiceProvision(idempotencyKey: string): Record<string, unknown> | undefined {
  return serviceProvisions.get(idempotencyKey);
}

export function getBuildIteration(idempotencyKey: string): Record<string, unknown> | undefined {
  return buildIterations.get(idempotencyKey);
}

export function getReleaseReadiness(idempotencyKey: string): Record<string, unknown> | undefined {
  return releaseReadiness.get(idempotencyKey);
}

export function getDeployment(idempotencyKey: string): Record<string, unknown> | undefined {
  return deployments.get(idempotencyKey);
}

export function getHandoffPackage(idempotencyKey: string): Record<string, unknown> | undefined {
  return handoffPackages.get(idempotencyKey);
}

export function listAllRepoCreations(): Array<{ key: string; value: Record<string, unknown> }> {
  return Array.from(repoCreations.entries()).map(([key, value]) => ({ key, value }));
}

/**
 * Clear all in-memory stores.
 * Used for testing isolation between test runs.
 */
export function clearLinkappsStores(): void {
  repoCreations.clear();
  serviceProvisions.clear();
  buildIterations.clear();
  releaseReadiness.clear();
  deployments.clear();
  handoffPackages.clear();
}

/**
 * Get all workflow handle names defined in this pack.
 * Used for verification and documentation.
 */
export function getWorkflowHandles(): string[] {
  return [
    CREATE_REPO_HANDLE,
    PROVISION_SERVICES_HANDLE,
    BUILD_ITERATION_HANDLE,
    RELEASE_READINESS_HANDLE,
    DEPLOY_HANDLE,
    COMPILE_HANDOFF_HANDLE,
  ];
}
