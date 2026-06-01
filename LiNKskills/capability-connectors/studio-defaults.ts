import { getLinksitesCapabilityManifest } from "./linksites/manifest.js";
import type {
  CapabilityAuditEvent,
  CapabilityConnectorManifest,
  CapabilityConnectorRuntime,
  CapabilityContext,
  CapabilityExecutionResult,
  PluginMode,
} from "./types.js";

export const STUDIO_DEFAULT_CAPABILITY_IDS = [
  "cap.zulip.run_messaging",
  "cap.plane.execution_tracking",
] as const;

export type StudioDefaultCapabilityId = typeof STUDIO_DEFAULT_CAPABILITY_IDS[number];

export interface GsmSecretReference {
  provider: "google_secret_manager";
  secret_name: string;
  version: "latest";
}

export interface StudioDefaultCapabilitySecretRefs {
  zulip: {
    bot_email_ref: GsmSecretReference;
    api_key_ref: GsmSecretReference;
  };
  plane: {
    api_key_ref: GsmSecretReference;
  };
}

type OperationSpec = {
  leasePermission: string;
  auditAction: string;
  defaultMode: Extract<PluginMode, "mock" | "shadow">;
};

const STUDIO_DEFAULT_SECRET_REFS: StudioDefaultCapabilitySecretRefs = {
  zulip: {
    bot_email_ref: {
      provider: "google_secret_manager",
      secret_name: "LINKTREND_AIOS_PROD_ZULIP_BOT_EMAIL",
      version: "latest",
    },
    api_key_ref: {
      provider: "google_secret_manager",
      secret_name: "LINKTREND_AIOS_PROD_ZULIP_API_KEY",
      version: "latest",
    },
  },
  plane: {
    api_key_ref: {
      provider: "google_secret_manager",
      secret_name: "LINKTREND_AIOS_PROD_PLANE_API_KEY",
      version: "latest",
    },
  },
};

const OPERATION_SPECS: Record<StudioDefaultCapabilityId, Record<string, OperationSpec>> = {
  "cap.zulip.run_messaging": {
    "run.notify": {
      leasePermission: "zulip.run.notify",
      auditAction: "zulip.notification.queued",
      defaultMode: "mock",
    },
    "channel.message.mock_send": {
      leasePermission: "zulip.channel.message.send",
      auditAction: "zulip.notification.queued",
      defaultMode: "mock",
    },
    "connectivity.probe": {
      leasePermission: "zulip.connectivity.probe",
      auditAction: "zulip.connectivity.checked",
      defaultMode: "shadow",
    },
  },
  "cap.plane.execution_tracking": {
    "project.ensure_mock": {
      leasePermission: "plane.project.write",
      auditAction: "plane.project.upserted",
      defaultMode: "mock",
    },
    "task.ensure_mock": {
      leasePermission: "plane.task.write",
      auditAction: "plane.task.upserted",
      defaultMode: "mock",
    },
    "readiness.probe": {
      leasePermission: "plane.readiness.check",
      auditAction: "plane.readiness.checked",
      defaultMode: "shadow",
    },
  },
};

/**
 * Return studio-owned secret references for default capabilities.
 *
 * References intentionally omit Google project IDs and always target
 * `versions/latest`, allowing deployment configuration to provide the project.
 */
export function getStudioDefaultCapabilitySecretRefs(): StudioDefaultCapabilitySecretRefs {
  return STUDIO_DEFAULT_SECRET_REFS;
}

/**
 * Build a mock/shadow runtime for a studio default capability.
 *
 * The runtime verifies LinkSkills lease context, emits deterministic audit
 * records, and never calls Zulip or Plane directly. Live execution remains
 * fail-closed until a separate approved connector enables it.
 */
export function createStudioDefaultCapabilityRuntime(
  capabilityId: StudioDefaultCapabilityId,
): CapabilityConnectorRuntime {
  const manifest = getRequiredManifest(capabilityId);
  const operationSpecs = OPERATION_SPECS[capabilityId];

  return {
    manifest,
    async isReady(tenantId: string) {
      return tenantId.trim().length > 0 && hasValidSecretRefs(capabilityId);
    },
    async execute(operation: string, args: Record<string, unknown>, context: CapabilityContext) {
      const requested = createAuditEvent("capability.requested", manifest, operation, context, {
        args,
      }, 0);
      const operationSpec = operationSpecs[operation];

      if (!operationSpec || !manifest.allowed_operations.includes(operation)) {
        return failureResult(manifest, operation, context, [requested], {
          code: "OPERATION_NOT_ALLOWED",
          message: `Operation ${operation} is not allowed for ${capabilityId}.`,
          retryable: false,
        });
      }

      if (!context.lease_id.trim()) {
        return failureResult(manifest, operation, context, [requested], {
          code: "LEASE_REQUIRED",
          message: "A LinkSkills lease_id is required before capability execution.",
          retryable: false,
        });
      }

      if (context.mode === "live") {
        return failureResult(manifest, operation, context, [requested], {
          code: "LIVE_MODE_DISABLED",
          message: "Studio default capabilities only execute mock or shadow operations in MVO.",
          retryable: false,
        });
      }

      const mode = normalizeExecutionMode(context.mode, operationSpec.defaultMode);
      const leaseExecuted = createAuditEvent("lease.executed", manifest, operation, context, {
        lease_permission: operationSpec.leasePermission,
        mode,
      }, 1);
      const operationAudit = createAuditEvent(operationSpec.auditAction, manifest, operation, context, {
        mode,
        external_side_effect: "none",
      }, 2);
      const capabilityExecuted = createAuditEvent("capability.executed", manifest, operation, context, {
        mode,
        audit_actions: [operationSpec.auditAction],
      }, 3);
      const auditEvents = [requested, leaseExecuted, operationAudit, capabilityExecuted];

      return {
        success: true,
        result: {
          capability_id: capabilityId,
          operation,
          mode,
          external_side_effect: "none",
          lease_id: context.lease_id,
          idempotency_key: context.idempotency_key,
          audit_event_ids: auditEvents.map(event => event.event_id),
          credential_refs: credentialRefsFor(capabilityId),
          output_ref: `${context.tenant_id}:${context.run_id}:${operation}:${context.idempotency_key}`,
        },
        audit_events: auditEvents,
      } satisfies CapabilityExecutionResult;
    },
  };
}

function getRequiredManifest(capabilityId: StudioDefaultCapabilityId): CapabilityConnectorManifest {
  const manifest = getLinksitesCapabilityManifest(capabilityId);
  if (!manifest) {
    throw new Error(`Missing studio default capability manifest: ${capabilityId}`);
  }

  return manifest;
}

function hasValidSecretRefs(capabilityId: StudioDefaultCapabilityId): boolean {
  return Object.values(credentialRefsFor(capabilityId)).every(ref =>
    ref.provider === "google_secret_manager"
    && ref.version === "latest"
    && /^LINKTREND_[A-Z0-9_]+$/.test(ref.secret_name)
  );
}

function credentialRefsFor(capabilityId: StudioDefaultCapabilityId): Record<string, GsmSecretReference> {
  if (capabilityId === "cap.zulip.run_messaging") {
    return STUDIO_DEFAULT_SECRET_REFS.zulip;
  }

  return STUDIO_DEFAULT_SECRET_REFS.plane;
}

function normalizeExecutionMode(
  requestedMode: PluginMode,
  defaultMode: Extract<PluginMode, "mock" | "shadow">,
): Extract<PluginMode, "mock" | "shadow"> {
  if (requestedMode === "shadow") {
    return "shadow";
  }

  if (requestedMode === "mock" || requestedMode === "development") {
    return "mock";
  }

  return defaultMode;
}

function failureResult(
  manifest: CapabilityConnectorManifest,
  operation: string,
  context: CapabilityContext,
  auditEvents: CapabilityAuditEvent[],
  error: CapabilityExecutionResult["error"],
): CapabilityExecutionResult {
  return {
    success: false,
    error,
    audit_events: [
      ...auditEvents,
      createAuditEvent("capability.failed", manifest, operation, context, {
        error_code: error?.code,
      }, auditEvents.length),
    ],
  };
}

function createAuditEvent(
  action: string,
  manifest: CapabilityConnectorManifest,
  operation: string,
  context: CapabilityContext,
  payload: Record<string, unknown>,
  sequence: number,
): CapabilityAuditEvent {
  return {
    event_id: [
      "audit",
      context.tenant_id,
      context.run_id,
      context.stage_id,
      manifest.capability_id,
      operation,
      context.idempotency_key,
      String(sequence),
    ].join(":").replace(/[^a-zA-Z0-9_.:-]/g, "_"),
    tenant_id: context.tenant_id,
    run_id: context.run_id,
    stage_id: context.stage_id,
    plane: "linkskills",
    actor: context.actor,
    action,
    subject: {
      capability_id: manifest.capability_id,
      operation,
      lease_id: context.lease_id || undefined,
      idempotency_key: context.idempotency_key,
    },
    payload,
    schema_version: "linkskills.capability.audit.v1",
  };
}
