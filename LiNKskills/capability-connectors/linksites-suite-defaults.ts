/**
 * LinkSites suite capability runtimes (MVO mock/shadow).
 * Studio defaults (Zulip, Plane) live in studio-defaults.ts.
 */
import { getLinksitesCapabilityManifest } from "./linksites/manifest.js";
import type {
  CapabilityAuditEvent,
  CapabilityConnectorManifest,
  CapabilityConnectorRuntime,
  CapabilityContext,
  CapabilityExecutionResult,
  PluginMode,
} from "./types.js";

export const LINKSITES_SUITE_CAPABILITY_IDS = [
  "cap.crm.odoo_shadow",
  "cap.payload.local_sync",
  "cap.supabase.mirror_content",
  "cap.research.public_web",
  "cap.asset.generation",
] as const;

export type LinksitesSuiteCapabilityId = typeof LINKSITES_SUITE_CAPABILITY_IDS[number];

type OperationSpec = {
  leasePermission: string;
  auditAction: string;
  defaultMode: Extract<PluginMode, "mock" | "shadow" | "development">;
};

const OPERATION_SPECS: Record<LinksitesSuiteCapabilityId, Record<string, OperationSpec>> = {
  "cap.crm.odoo_shadow": {
    "lead.read_mock": { leasePermission: "crm.lead.read", auditAction: "crm.lead.status.updated", defaultMode: "shadow" },
    "lead.status.set_ready_to_contact": { leasePermission: "crm.lead.status.write", auditAction: "crm.lead.status.updated", defaultMode: "shadow" },
    "odoo.readiness.probe": { leasePermission: "crm.odoo.readiness.check", auditAction: "crm.odoo.readiness.checked", defaultMode: "shadow" },
  },
  "cap.payload.local_sync": {
    "content.upsert_local": { leasePermission: "payload.content.write", auditAction: "payload.content.upserted", defaultMode: "shadow" },
    "preview.publish_local": { leasePermission: "payload.preview.publish", auditAction: "payload.preview.updated", defaultMode: "shadow" },
    "sync.status.read": { leasePermission: "payload.sync.read", auditAction: "payload.sync.checked", defaultMode: "shadow" },
  },
  "cap.supabase.mirror_content": {
    "site_content.upsert": { leasePermission: "supabase.mirror.write", auditAction: "supabase.mirror.content.upserted", defaultMode: "shadow" },
    "asset_refs.upsert": { leasePermission: "supabase.mirror.write", auditAction: "supabase.mirror.asset_refs.upserted", defaultMode: "shadow" },
    "mirror.status.read": { leasePermission: "supabase.mirror.read", auditAction: "supabase.mirror.content.upserted", defaultMode: "shadow" },
  },
  "cap.research.public_web": {
    "search.query": { leasePermission: "research.public.read", auditAction: "research.query.performed", defaultMode: "shadow" },
    "page.fetch": { leasePermission: "research.public.read", auditAction: "research.citation.recorded", defaultMode: "shadow" },
    "citation.extract": { leasePermission: "research.public.read", auditAction: "research.citation.recorded", defaultMode: "shadow" },
  },
  "cap.asset.generation": {
    "image.generate": { leasePermission: "asset.generate.image", auditAction: "asset.generated", defaultMode: "shadow" },
    "video.generate": { leasePermission: "asset.generate.video", auditAction: "asset.generated", defaultMode: "shadow" },
    "asset.metadata.record": { leasePermission: "asset.metadata.write", auditAction: "asset.provenance.recorded", defaultMode: "shadow" },
  },
};

/** Build mock/shadow runtime for a LinkSites suite capability. */
export function createLinksitesSuiteCapabilityRuntime(
  capabilityId: LinksitesSuiteCapabilityId,
): CapabilityConnectorRuntime {
  const manifest = getRequiredManifest(capabilityId);
  const operationSpecs = OPERATION_SPECS[capabilityId];

  return {
    manifest,
    async isReady(tenantId: string) {
      return tenantId.trim().length > 0;
    },
    async execute(operation: string, args: Record<string, unknown>, context: CapabilityContext) {
      const requested = auditEvent("capability.requested", manifest, operation, context, { args }, 0);
      const operationSpec = operationSpecs[operation];

      if (!operationSpec || !manifest.allowed_operations.includes(operation)) {
        return fail(manifest, operation, context, [requested], {
          code: "OPERATION_NOT_ALLOWED",
          message: `Operation ${operation} is not allowed for ${capabilityId}.`,
          retryable: false,
        });
      }

      if (!context.lease_id.trim()) {
        return fail(manifest, operation, context, [requested], {
          code: "LEASE_REQUIRED",
          message: "A LinkSkills lease_id is required before capability execution.",
          retryable: false,
        });
      }

      if (context.mode === "live" && capabilityId !== "cap.research.public_web") {
        return fail(manifest, operation, context, [requested], {
          code: "LIVE_MODE_DISABLED",
          message: "LinkSites suite connectors only execute mock/shadow operations in MVO (except read-only research).",
          retryable: false,
        });
      }

      const mode = normalizeMode(context.mode, operationSpec.defaultMode);
      const leaseExecuted = auditEvent("lease.executed", manifest, operation, context, {
        lease_permission: operationSpec.leasePermission,
        mode,
      }, 1);
      const operationAudit = auditEvent(operationSpec.auditAction, manifest, operation, context, {
        mode,
        external_side_effect: capabilityId === "cap.research.public_web" && mode === "live" ? "read_only" : "none",
      }, 2);
      const capabilityExecuted = auditEvent("capability.executed", manifest, operation, context, {
        mode,
        audit_actions: [operationSpec.auditAction],
      }, 3);

      return {
        success: true,
        result: {
          capability_id: capabilityId,
          operation,
          mode,
          external_side_effect: capabilityId === "cap.research.public_web" && mode === "live" ? "read_only" : "none",
          lease_id: context.lease_id,
          idempotency_key: context.idempotency_key,
          audit_event_ids: [requested, leaseExecuted, operationAudit, capabilityExecuted].map((e) => e.event_id),
          output_ref: `${context.tenant_id}:${context.run_id}:${operation}:${context.idempotency_key}`,
        },
        audit_events: [requested, leaseExecuted, operationAudit, capabilityExecuted],
      } satisfies CapabilityExecutionResult;
    },
  };
}

function getRequiredManifest(capabilityId: LinksitesSuiteCapabilityId): CapabilityConnectorManifest {
  const manifest = getLinksitesCapabilityManifest(capabilityId);
  if (!manifest) throw new Error(`Missing LinkSites capability manifest: ${capabilityId}`);
  return manifest;
}

function normalizeMode(
  requested: PluginMode,
  defaultMode: Extract<PluginMode, "mock" | "shadow" | "development">,
): PluginMode {
  if (requested === "live") return "live";
  if (requested === "shadow") return "shadow";
  if (requested === "mock" || requested === "development") return "mock";
  return defaultMode === "development" ? "mock" : defaultMode;
}

function fail(
  manifest: CapabilityConnectorManifest,
  operation: string,
  context: CapabilityContext,
  events: CapabilityAuditEvent[],
  error: NonNullable<CapabilityExecutionResult["error"]>,
): CapabilityExecutionResult {
  return {
    success: false,
    error,
    audit_events: [
      ...events,
      auditEvent("capability.failed", manifest, operation, context, { error_code: error.code }, events.length),
    ],
  };
}

function auditEvent(
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
