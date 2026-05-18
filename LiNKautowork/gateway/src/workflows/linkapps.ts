/**
 * LiNKapps App Factory LiNKautowork Workflow Hooks
 *
 * Deterministic workflow handlers for linkapps.app_factory vertical plugin.
 * Per WP-208 and LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md §4.
 *
 * Workflow Handles:
 * - autowork.linkapps.create_repo (Stage 5.2)
 * - autowork.linkapps.provision_services (Stage 5.3)
 * - autowork.linkapps.build_iteration (Stage 5.4)
 * - autowork.linkapps.release_readiness (Stage 5.5)
 * - autowork.linkapps.deploy (Stage 5.6)
 * - autowork.linkapps.compile_handoff (Stage 5.7)
 */

import { createHash, randomUUID } from "node:crypto";
import type { WorkflowInvokeRequest } from "@linktrend/linklogic-sdk";
import type { AuditEmitter } from "../lib/audit-emitter.js";
import type { WorkflowHandler } from "../types/index.js";

// Workflow handle constants per LINKAPPS_CAPABILITY_REQUIREMENTS.md
export const CREATE_REPO_HANDLE = "autowork.linkapps.create_repo";
export const PROVISION_SERVICES_HANDLE = "autowork.linkapps.provision_services";
export const BUILD_ITERATION_HANDLE = "autowork.linkapps.build_iteration";
export const RELEASE_READINESS_HANDLE = "autowork.linkapps.release_readiness";
export const DEPLOY_HANDLE = "autowork.linkapps.deploy";
export const COMPILE_HANDOFF_HANDLE = "autowork.linkapps.compile_handoff";

// In-memory stores for development-mode stub behavior
const repoStore = new Map<string, Record<string, unknown>>();
const serviceStore = new Map<string, Record<string, unknown>>();
const buildStore = new Map<string, Record<string, unknown>>();
const validationStore = new Map<string, Record<string, unknown>>();
const deployStore = new Map<string, Record<string, unknown>>();
const handoffStore = new Map<string, Record<string, unknown>>();

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

/**
 * Create handler for autowork.linkapps.create_repo
 * Stage 5.2: Repository generation from starter kit template
 * Requires lease_id for repository side effects
 */
export function createRepoHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      // Fail closed for missing lease on side-effecting operation
      const leaseCheck = requireLeaseId(request);
      if (!leaseCheck.ok) return { failure: leaseCheck.failure };

      // Validate required inputs per LINKAPPS_CAPABILITY_REQUIREMENTS.md §4.1
      const appSlug = asString(request, "app_slug");
      const appName = asString(request, "app_name");
      const prdRef = asString(request, "prd_ref");
      const templateRef = asString(request, "template_ref") ?? "linkdev-starter-kit";

      if (!appSlug || !appName || !prdRef) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required inputs: app_slug, app_name, prd_ref") };
      }

      // Validate slug format (kebab-case)
      const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
      if (!slugPattern.test(appSlug)) {
        return { failure: fail("LEASE_REQUEST_INVALID", `Invalid app_slug format: ${appSlug}. Must be kebab-case.`) };
      }

      // Reject in production (development-mode only per MVO)
      if (process.env.NODE_ENV === "production") {
        return { failure: fail("WORKFLOW_STEP_FAILED", "create_repo is development-only") };
      }

      const repoId = randomUUID();
      const now = new Date().toISOString();
      const initialCommitSha = `mock-${digest({ appSlug, templateRef, timestamp: now }).slice(0, 12)}`;

      // Generate deterministic repo refs
      const repoUrl = `https://github.com/mock-org/${appSlug}`;
      const cloneUrl = `https://github.com/mock-org/${appSlug}.git`;
      const appRepoRef = `repo:${request.tenant_id}:${appSlug}:${repoId}`;

      // Store repo record
      repoStore.set(appRepoRef, {
        repo_id: repoId,
        app_repo_ref: appRepoRef,
        tenant_id: request.tenant_id,
        app_slug: appSlug,
        app_name: appName,
        template_ref: templateRef,
        prd_ref: prdRef,
        repo_url: repoUrl,
        clone_url: cloneUrl,
        default_branch: "main",
        initial_commit_sha: initialCommitSha,
        lease_id: leaseCheck.leaseId,
        created_at: now,
        run_id: request.run_id,
        stage_id: request.stage_id,
      });

      return {
        outputs: {
          app_repo_ref: appRepoRef,
          repo_url: repoUrl,
          clone_url: cloneUrl,
          default_branch: "main",
          initial_commit_sha: initialCommitSha,
          created_at: now,
        },
      };
    });
  };
}

/**
 * Create handler for autowork.linkapps.provision_services
 * Stage 5.3: Service provisioning (Supabase, Stripe, etc.)
 * Requires lease_id for service provisioning side effects
 */
export function createProvisionServicesHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      const leaseCheck = requireLeaseId(request);
      if (!leaseCheck.ok) return { failure: leaseCheck.failure };

      const appRepoRef = asString(request, "app_repo_ref");
      const provisioningProfileRef = asString(request, "provisioning_profile_ref");

      if (!appRepoRef) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required input: app_repo_ref") };
      }

      // Reject in production (development-mode only)
      if (process.env.NODE_ENV === "production") {
        return { failure: fail("WORKFLOW_STEP_FAILED", "provision_services is development-only") };
      }

      // Check repo exists
      const repo = repoStore.get(appRepoRef);
      if (!repo) {
        return { failure: fail("WORKFLOW_STEP_FAILED", `Repository not found: ${appRepoRef}`) };
      }

      const now = new Date().toISOString();
      const serviceId = randomUUID();

      // Generate deterministic service stubs per LINKAPPS_CAPABILITY_REQUIREMENTS.md §2
      const supabaseProjectRef = `supabase-mock-${digest({ appRepoRef, tenant: request.tenant_id }).slice(0, 16)}`;
      const stripeProductIdsRef = `stripe-products-mock-${serviceId}`;
      const serviceCredentialsRef = `creds:${request.tenant_id}:${repo.app_slug}:${serviceId}`;

      // Store service record
      serviceStore.set(serviceCredentialsRef, {
        service_id: serviceId,
        service_credentials_ref: serviceCredentialsRef,
        tenant_id: request.tenant_id,
        app_repo_ref: appRepoRef,
        app_slug: repo.app_slug,
        supabase_project_ref: supabaseProjectRef,
        stripe_product_ids_ref: stripeProductIdsRef,
        provisioning_profile_ref: provisioningProfileRef ?? "default-mvo-profile",
        lease_id: leaseCheck.leaseId,
        provisioned_at: now,
        run_id: request.run_id,
        stage_id: request.stage_id,
        // Stub credentials (never real secrets in MVO)
        stub_config: {
          supabase_url: `https://${supabaseProjectRef}.supabase.co`,
          supabase_anon_key: `mock-anon-key-${digest({ serviceId, key: "anon" }).slice(0, 32)}`,
          stripe_publishable_key: `mock-pk-${digest({ serviceId, key: "stripe" }).slice(0, 24)}`,
        },
      });

      return {
        outputs: {
          service_credentials_ref: serviceCredentialsRef,
          supabase_project_ref: supabaseProjectRef,
          stripe_product_ids_ref: stripeProductIdsRef,
          provisioned_at: now,
        },
      };
    });
  };
}

/**
 * Create handler for autowork.linkapps.build_iteration
 * Stage 5.4: AI-assisted implementation iteration
 * Requires lease_id for build side effects
 */
export function createBuildIterationHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      const leaseCheck = requireLeaseId(request);
      if (!leaseCheck.ok) return { failure: leaseCheck.failure };

      const appRepoRef = asString(request, "app_repo_ref");
      const buildConfigRef = asString(request, "build_config_ref");
      const iterationNum = Number(readInput(request, "iteration_num")) || 1;

      if (!appRepoRef) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required input: app_repo_ref") };
      }

      // Reject in production
      if (process.env.NODE_ENV === "production") {
        return { failure: fail("WORKFLOW_STEP_FAILED", "build_iteration is development-only") };
      }

      const now = new Date().toISOString();
      const buildId = randomUUID();

      // Generate deterministic build outputs
      const buildOutputRef = `build:${request.tenant_id}:${appRepoRef}:${iterationNum}:${buildId}`;
      const filesChangedManifestRef = `manifest:${buildOutputRef}:files`;

      // Mock check results per release-readiness.sh deterministic posture
      const checkResults = {
        lint_passed: true,
        typecheck_passed: true,
        tests_passed: iterationNum > 1, // First iteration may have failing tests
        build_passed: true,
        security_scan_passed: true,
        checks_timestamp: now,
      };

      // Store build record
      buildStore.set(buildOutputRef, {
        build_id: buildId,
        build_output_ref: buildOutputRef,
        tenant_id: request.tenant_id,
        app_repo_ref: appRepoRef,
        iteration_num: iterationNum,
        build_config_ref: buildConfigRef ?? "default-build-config",
        files_changed_manifest_ref: filesChangedManifestRef,
        check_results: checkResults,
        lease_id: leaseCheck.leaseId,
        built_at: now,
        run_id: request.run_id,
        stage_id: request.stage_id,
      });

      return {
        outputs: {
          build_output_ref: buildOutputRef,
          files_changed_manifest_ref: filesChangedManifestRef,
          check_results: checkResults,
          iteration_num: iterationNum,
          built_at: now,
        },
      };
    });
  };
}

/**
 * Create handler for autowork.linkapps.release_readiness
 * Stage 5.5: Quality validation gates
 * Requires lease_id for validation side effects
 */
export function createReleaseReadinessHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      const leaseCheck = requireLeaseId(request);
      if (!leaseCheck.ok) return { failure: leaseCheck.failure };

      const appRepoRef = asString(request, "app_repo_ref");
      const testMatrixRef = asString(request, "test_matrix_ref");

      if (!appRepoRef) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required input: app_repo_ref") };
      }

      // Reject in production
      if (process.env.NODE_ENV === "production") {
        return { failure: fail("WORKFLOW_STEP_FAILED", "release_readiness is development-only") };
      }

      const now = new Date().toISOString();
      const validationId = randomUUID();

      // Find latest build for this repo
      const builds = Array.from(buildStore.values()).filter(
        (b) => b.app_repo_ref === appRepoRef && b.tenant_id === request.tenant_id
      );

      if (builds.length === 0) {
        return { failure: fail("WORKFLOW_STEP_FAILED", `No builds found for repo: ${appRepoRef}`) };
      }

      const latestBuild = builds.sort((a, b) =>
        new Date(b.built_at as string).getTime() - new Date(a.built_at as string).getTime()
      )[0];

      // Run deterministic validation checks
      const checkResults = latestBuild.check_results as Record<string, boolean>;
      const allChecksPassed = Object.values(checkResults).every((v) => v === true);

      const validationReportRef = `validation:${request.tenant_id}:${appRepoRef}:${validationId}`;

      // Store validation record
      validationStore.set(validationReportRef, {
        validation_id: validationId,
        validation_report_ref: validationReportRef,
        tenant_id: request.tenant_id,
        app_repo_ref: appRepoRef,
        test_matrix_ref: testMatrixRef ?? "default-test-matrix",
        build_output_ref: latestBuild.build_output_ref,
        checks_passed: allChecksPassed,
        check_results: checkResults,
        lease_id: leaseCheck.leaseId,
        validated_at: now,
        run_id: request.run_id,
        stage_id: request.stage_id,
      });

      return {
        outputs: {
          validation_report_ref: validationReportRef,
          checks_passed: allChecksPassed,
          check_results: checkResults,
          validated_at: now,
        },
      };
    });
  };
}

/**
 * Create handler for autowork.linkapps.deploy
 * Stage 5.6: Deployment to hosting (development mode)
 * Requires lease_id for deployment side effects
 */
export function createDeployHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      const leaseCheck = requireLeaseId(request);
      if (!leaseCheck.ok) return { failure: leaseCheck.failure };

      const appRepoRef = asString(request, "app_repo_ref");
      const deploymentTargetRef = asString(request, "deployment_target_ref");
      const validationReportRef = asString(request, "validation_report_ref");

      if (!appRepoRef || !validationReportRef) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required inputs: app_repo_ref, validation_report_ref") };
      }

      // Validate checks passed before deployment
      const validation = validationStore.get(validationReportRef);
      if (!validation) {
        return { failure: fail("WORKFLOW_STEP_FAILED", `Validation report not found: ${validationReportRef}`) };
      }

      if (!validation.checks_passed) {
        return {
          failure: fail(
            "POLICY_REQUIRES_APPROVAL",
            "Cannot deploy: validation checks did not pass. Override requires explicit approval.",
            false
          ),
        };
      }

      // Reject in production
      if (process.env.NODE_ENV === "production") {
        return { failure: fail("WORKFLOW_STEP_FAILED", "deploy is development-only") };
      }

      const now = new Date().toISOString();
      const deployId = randomUUID();

      // Get repo for slug
      const repo = repoStore.get(appRepoRef);
      const appSlug = repo ? (repo.app_slug as string) : "unknown";

      // Generate deterministic deployment refs (mock only in MVO)
      const deploymentRef = `deploy:${request.tenant_id}:${appRepoRef}:${deployId}`;
      const previewUrl = `https://${appSlug}-preview-mock.vercel.app`;

      // Store deployment record
      deployStore.set(deploymentRef, {
        deploy_id: deployId,
        deployment_ref: deploymentRef,
        tenant_id: request.tenant_id,
        app_repo_ref: appRepoRef,
        app_slug: appSlug,
        deployment_target_ref: deploymentTargetRef ?? "vercel-mock",
        preview_url: previewUrl,
        validation_report_ref: validationReportRef,
        lease_id: leaseCheck.leaseId,
        deployed_at: now,
        run_id: request.run_id,
        stage_id: request.stage_id,
        deployment_status: "success",
      });

      return {
        outputs: {
          deployment_refs: [deploymentRef],
          preview_urls: [previewUrl],
          deployed_at: now,
          deployment_status: "success",
        },
      };
    });
  };
}

/**
 * Create handler for autowork.linkapps.compile_handoff
 * Stage 5.7: Handoff package compilation
 * Requires lease_id for handoff side effects
 */
export function createCompileHandoffHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      const leaseCheck = requireLeaseId(request);
      if (!leaseCheck.ok) return { failure: leaseCheck.failure };

      const appRepoRef = asString(request, "app_repo_ref");
      const serviceRefs = asStringArray(request, "service_refs");
      const deploymentRefs = asStringArray(request, "deployment_refs");

      if (!appRepoRef) {
        return { failure: fail("WORKFLOW_STEP_FAILED", "Missing required input: app_repo_ref") };
      }

      // Reject in production
      if (process.env.NODE_ENV === "production") {
        return { failure: fail("WORKFLOW_STEP_FAILED", "compile_handoff is development-only") };
      }

      const now = new Date().toISOString();
      const handoffId = randomUUID();

      // Get repo info
      const repo = repoStore.get(appRepoRef);

      // Validate service refs exist
      const services = serviceRefs.map((ref) => serviceStore.get(ref)).filter(Boolean);
      const deployments = deploymentRefs.map((ref) => deployStore.get(ref)).filter(Boolean);

      // Generate handoff package
      const handoffPackageRef = `handoff:${request.tenant_id}:${appRepoRef}:${handoffId}`;

      // Store handoff record
      handoffStore.set(handoffPackageRef, {
        handoff_id: handoffId,
        handoff_package_ref: handoffPackageRef,
        tenant_id: request.tenant_id,
        app_repo_ref: appRepoRef,
        app_slug: repo?.app_slug ?? "unknown",
        app_name: repo?.app_name ?? "Unknown App",
        service_refs: serviceRefs,
        deployment_refs: deploymentRefs,
        services_included: services.length,
        deployments_included: deployments.length,
        lease_id: leaseCheck.leaseId,
        compiled_at: now,
        run_id: request.run_id,
        stage_id: request.stage_id,
        handoff_status: "ready",
        package_contents: {
          source_repo: appRepoRef,
          service_credentials: serviceRefs,
          deployment_urls: deployments.map((d) => d.preview_url),
          documentation_bundle_ref: `docs:${handoffPackageRef}`,
        },
      });

      return {
        outputs: {
          handoff_package_ref: handoffPackageRef,
          compiled_at: now,
          handoff_status: "ready",
          package_contents_summary: {
            services_included: services.length,
            deployments_included: deployments.length,
          },
        },
      };
    });
  };
}

// Export store getters for testing and debugging
export function getRepo(appRepoRef: string): Record<string, unknown> | undefined {
  return repoStore.get(appRepoRef);
}

export function getService(serviceCredentialsRef: string): Record<string, unknown> | undefined {
  return serviceStore.get(serviceCredentialsRef);
}

export function getBuild(buildOutputRef: string): Record<string, unknown> | undefined {
  return buildStore.get(buildOutputRef);
}

export function getValidation(validationReportRef: string): Record<string, unknown> | undefined {
  return validationStore.get(validationReportRef);
}

export function getDeploy(deploymentRef: string): Record<string, unknown> | undefined {
  return deployStore.get(deploymentRef);
}

export function getHandoff(handoffPackageRef: string): Record<string, unknown> | undefined {
  return handoffStore.get(handoffPackageRef);
}

// Export store listers for testing
export function listRepos(): Array<[string, Record<string, unknown>]> {
  return Array.from(repoStore.entries());
}

export function listServices(): Array<[string, Record<string, unknown>]> {
  return Array.from(serviceStore.entries());
}

export function listBuilds(): Array<[string, Record<string, unknown>]> {
  return Array.from(buildStore.entries());
}

export function listValidations(): Array<[string, Record<string, unknown>]> {
  return Array.from(validationStore.entries());
}

export function listDeployments(): Array<[string, Record<string, unknown>]> {
  return Array.from(deployStore.entries());
}

export function listHandoffs(): Array<[string, Record<string, unknown>]> {
  return Array.from(handoffStore.entries());
}

/**
 * Clear all LiNKapps stores (useful for testing)
 */
export function clearLinkappsStores(): void {
  repoStore.clear();
  serviceStore.clear();
  buildStore.clear();
  validationStore.clear();
  deployStore.clear();
  handoffStore.clear();
}
