/**
 * LinkSites Capability Connectors Manifest
 *
 * Per CONTRACTS_MVO.md §0.A.5 - Required capability plugins for LinkSites v2 MVO.
 * Each connector declares its contract surface without inventing target-software internals.
 */

import type { CapabilityConnectorManifest } from "../types.js";

export const linksitesCapabilityManifests: CapabilityConnectorManifest[] = [
  {
    capability_id: "cap.crm.odoo_shadow",
    plugin_kind: "capability",
    target_software: "odoo",
    allowed_operations: ["lead.read_mock", "lead.status.set_ready_to_contact", "odoo.readiness.probe"],
    auth_requirements: ["crm.provider", "crm.mock_table_ref", "odoo.base_url", "odoo.credential_ref"],
    mode_flags: ["development", "shadow"], // live disabled by default in MVO
    lease_requirements: ["crm.lead.read", "crm.lead.status.write", "crm.odoo.readiness.check"],
    idempotency_rules: "(tenant_id, lead_id, target_status, run_id) for status writes; (tenant_id, probe_window) for readiness",
    audit_events: [
      "capability.requested",
      "capability.executed",
      "crm.lead.status.updated",
      "crm.odoo.readiness.checked",
      "capability.failed",
    ],
    allowed_callers: ["vertical_plugin", "linkautowork"],
    failure_mapping: {
      readiness_connectivity: "INTEGRATION_UNAVAILABLE",
      auth: "INTEGRATION_AUTH_FAILED",
      policy_kill_switch: "LEASE_DENIED",
      invalid_lease_input: "LEASE_REQUEST_INVALID",
      timeout: "INTEGRATION_TIMEOUT",
      idempotency_conflict: "LEASE_IDEMPOTENCY_CONFLICT",
    },
    not_configured: [
      "Odoo chart of accounts",
      "accounting rules",
      "CRM stage/taxonomy design",
      "business master data",
    ],
  },
  {
    capability_id: "cap.payload.local_sync",
    plugin_kind: "capability",
    target_software: "payload_cms",
    allowed_operations: ["content.upsert_local", "preview.publish_local", "sync.status.read"],
    auth_requirements: ["payload.base_url", "payload.space_ref", "payload.credential_ref", "payload.schema_source_ref"],
    mode_flags: ["development", "shadow"],
    lease_requirements: ["payload.content.write", "payload.preview.publish", "payload.sync.read"],
    idempotency_rules: "(tenant_id, site_id, site_generation_run_id, content_checksum)",
    audit_events: [
      "capability.requested",
      "capability.executed",
      "payload.content.upserted",
      "payload.preview.updated",
      "payload.sync.checked",
      "capability.failed",
    ],
    allowed_callers: ["linkautowork", "vertical_plugin"],
    failure_mapping: {
      missing_schema_mapping: "MANIFEST_INVALID",
      connectivity: "INTEGRATION_UNAVAILABLE",
      auth: "INTEGRATION_AUTH_FAILED",
      invalid_lease_input: "LEASE_REQUEST_INVALID",
      timeout: "INTEGRATION_TIMEOUT",
      idempotency_conflict: "LEASE_IDEMPOTENCY_CONFLICT",
    },
    not_configured: [
      "Payload collection/schema design",
      "field modeling",
      "locale strategy",
      "editorial workflow policy",
    ],
  },
  {
    capability_id: "cap.supabase.mirror_content",
    plugin_kind: "capability",
    target_software: "supabase",
    allowed_operations: ["site_content.upsert", "asset_refs.upsert", "mirror.status.read"],
    auth_requirements: ["supabase.project_ref", "supabase.schema_ref", "supabase.credential_ref"],
    mode_flags: ["development", "shadow"],
    lease_requirements: ["supabase.mirror.write", "supabase.mirror.read"],
    idempotency_rules: "(tenant_id, site_id, site_generation_run_id, payload_version)",
    audit_events: [
      "capability.requested",
      "capability.executed",
      "supabase.mirror.content.upserted",
      "supabase.mirror.asset_refs.upserted",
      "capability.failed",
    ],
    allowed_callers: ["linkautowork", "vertical_plugin"],
    failure_mapping: {
      schema_missing: "MANIFEST_INVALID",
      rls_auth: "INTEGRATION_AUTH_FAILED",
      connectivity: "INTEGRATION_UNAVAILABLE",
      invalid_lease_input: "LEASE_REQUEST_INVALID",
      timeout: "INTEGRATION_TIMEOUT",
      idempotency_conflict: "LEASE_IDEMPOTENCY_CONFLICT",
    },
    not_configured: [
      "Supabase mirror table/column invention",
      "non-mirror business schema design",
    ],
  },
  {
    capability_id: "cap.zulip.run_messaging",
    plugin_kind: "capability",
    target_software: "zulip",
    allowed_operations: ["run.notify", "channel.message.mock_send", "connectivity.probe"],
    auth_requirements: ["zulip.base_url", "zulip.bot_email_ref", "zulip.api_key_ref", "zulip.stream_ref", "zulip.topic_template"],
    mode_flags: ["mock", "shadow"], // mock default for outbound
    lease_requirements: ["zulip.run.notify", "zulip.channel.message.send", "zulip.connectivity.probe"],
    idempotency_rules: "(tenant_id, run_id, stage_id, message_purpose)",
    audit_events: [
      "capability.requested",
      "lease.executed",
      "capability.executed",
      "zulip.notification.queued",
      "zulip.connectivity.checked",
      "capability.failed",
    ],
    allowed_callers: ["linkaios", "vertical_plugin", "linkbot", "linkautowork"],
    failure_mapping: {
      stream_topic_config: "MANIFEST_INVALID",
      auth: "INTEGRATION_AUTH_FAILED",
      connectivity: "INTEGRATION_UNAVAILABLE",
      policy_disabled: "LEASE_DENIED",
      timeout: "INTEGRATION_TIMEOUT",
      idempotency_conflict: "LEASE_IDEMPOTENCY_CONFLICT",
    },
    not_configured: [
      "Zulip org stream taxonomy design",
      "community/public broadcast policy",
    ],
  },
  {
    capability_id: "cap.research.public_web",
    plugin_kind: "capability",
    target_software: "public_web",
    allowed_operations: ["search.query", "page.fetch", "citation.extract"],
    auth_requirements: ["research.provider", "research.api_key_ref", "research.allow_domains", "research.blocked_domains"],
    mode_flags: ["development", "shadow", "live"], // reads only, so live is safe
    lease_requirements: ["research.public.read"],
    idempotency_rules: "(tenant_id, run_id, query_hash, provider)",
    audit_events: [
      "capability.requested",
      "capability.executed",
      "research.query.performed",
      "research.citation.recorded",
      "capability.failed",
    ],
    allowed_callers: ["linkbot", "vertical_plugin", "linkautowork"],
    failure_mapping: {
      provider_quota: "INTEGRATION_UNAVAILABLE",
      blocked_domain_policy: "LEASE_DENIED",
      malformed_query: "LEASE_REQUEST_INVALID",
      timeout: "INTEGRATION_TIMEOUT",
      idempotency_conflict: "LEASE_IDEMPOTENCY_CONFLICT",
    },
    not_configured: [
      "Target-site account setup",
      "outreach actions",
      "any write/submit side effect on external sites",
    ],
  },
  {
    capability_id: "cap.asset.generation",
    plugin_kind: "capability",
    target_software: "asset_generation_provider",
    allowed_operations: ["image.generate", "video.generate", "asset.metadata.record"],
    auth_requirements: ["asset.provider", "asset.model_profile", "asset.output_path_template", "asset.credential_ref"],
    mode_flags: ["development", "shadow"], // mock default
    lease_requirements: ["asset.generate.image", "asset.generate.video", "asset.metadata.write"],
    idempotency_rules: "(tenant_id, site_id, site_generation_run_id, asset_prompt_hash, asset_kind)",
    audit_events: [
      "capability.requested",
      "capability.executed",
      "asset.generated",
      "asset.provenance.recorded",
      "capability.failed",
    ],
    allowed_callers: ["linkbot", "vertical_plugin", "linkautowork"],
    failure_mapping: {
      provider_connectivity: "INTEGRATION_UNAVAILABLE",
      provider_auth: "INTEGRATION_AUTH_FAILED",
      moderation_block: "LEASE_DENIED",
      invalid_lease_input: "LEASE_REQUEST_INVALID",
      timeout: "INTEGRATION_TIMEOUT",
      idempotency_conflict: "LEASE_IDEMPOTENCY_CONFLICT",
    },
    not_configured: [
      "Brand guideline authoring",
      "DAM taxonomy design",
      "external CDN publishing",
      "production media rights policy",
    ],
  },
  {
    capability_id: "cap.plane.execution_tracking",
    plugin_kind: "capability",
    target_software: "plane",
    allowed_operations: ["project.ensure_mock", "task.ensure_mock", "readiness.probe"],
    auth_requirements: ["plane.base_url", "plane.workspace_ref", "plane.api_key_ref", "plane.project_template_ref"],
    mode_flags: ["mock", "shadow"], // mock default
    lease_requirements: ["plane.project.write", "plane.task.write", "plane.readiness.check"],
    idempotency_rules: "(tenant_id, run_id, execution_scope, normalized_title)",
    audit_events: [
      "capability.requested",
      "lease.executed",
      "capability.executed",
      "plane.project.upserted",
      "plane.task.upserted",
      "plane.readiness.checked",
      "capability.failed",
    ],
    allowed_callers: ["vertical_plugin", "linkautowork", "linkaios"],
    failure_mapping: {
      workspace_connectivity: "INTEGRATION_UNAVAILABLE",
      auth: "INTEGRATION_AUTH_FAILED",
      invalid_lease_input: "LEASE_REQUEST_INVALID",
      policy_disabled: "LEASE_DENIED",
      timeout: "INTEGRATION_TIMEOUT",
      idempotency_conflict: "LEASE_IDEMPOTENCY_CONFLICT",
    },
    not_configured: [
      "Plane workspace structure policy",
      "sprint/workflow state taxonomy",
      "client-facing project governance",
    ],
  },
];

export function getLinksitesCapabilityManifest(capabilityId: string): CapabilityConnectorManifest | undefined {
  return linksitesCapabilityManifests.find(m => m.capability_id === capabilityId);
}

export function getAllLinksitesCapabilityIds(): string[] {
  return linksitesCapabilityManifests.map(m => m.capability_id);
}
