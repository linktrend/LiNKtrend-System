/**
 * LLM Council capability connector manifest (Wave 3).
 */

import type { CapabilityConnectorManifest } from "../types.js";

export const llmCouncilCapabilityManifests: CapabilityConnectorManifest[] = [
  {
    capability_id: "cap.llm_council.deliberation",
    plugin_kind: "capability",
    target_software: "link_llm_council",
    allowed_operations: ["gate.deliberate", "connectivity.probe"],
    auth_requirements: ["llm_council.base_url", "openrouter.api_key_ref"],
    mode_flags: ["mock", "shadow", "live"],
    lease_requirements: ["llm_council.gate.deliberate"],
    idempotency_rules:
      "(tenant_id, run_id, stage_id, gate, program_id) for gate.deliberate; (tenant_id, probe_window) for connectivity",
    audit_events: [
      "capability.requested",
      "capability.executed",
      "llm_council.deliberation.completed",
      "llm_council.deliberation.failed",
      "capability.failed",
    ],
    allowed_callers: ["linkaios", "vertical_plugin", "linkbot", "linkautowork"],
    failure_mapping: {
      entitlement_missing: "LEASE_DENIED",
      service_unavailable: "INTEGRATION_UNAVAILABLE",
      auth: "INTEGRATION_AUTH_FAILED",
      invalid_gate: "LEASE_REQUEST_INVALID",
      policy_kill_switch: "LEASE_DENIED",
      timeout: "INTEGRATION_TIMEOUT",
      idempotency_conflict: "LEASE_IDEMPOTENCY_CONFLICT",
    },
    not_configured: [
      "Gate business rules (G1–G5 criteria)",
      "Principal go/no-go decisions",
      "Suite-specific approval workflows",
    ],
  },
];
