/**
 * Shared helpers for LinkSkills integration-style tests (fixtures + audit introspection).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { resetSafetyKillSwitch, tripSafetyKillSwitch } from "../safety.js";
import type { IntegrationCapturedEnvelope } from "./audit-sink.js";
import { capturedBrainAuditEvents } from "./audit-sink.js";
import type { LinkskillsIntegrationHarness } from "./supabase-harness.js";

export function createTestTenant(): string {
  return "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
}

/** Echo capability registered by default on {@link LinkskillsIntegrationHarness}. */
export function createTestCapability(): string {
  return "cap.test.echo";
}

export function waitForLeaseExpiry(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getCapturedAuditEvents(): IntegrationCapturedEnvelope[] {
  return capturedBrainAuditEvents;
}

export async function resetKillSwitchForTests(
  client: SupabaseClient,
  harness: LinkskillsIntegrationHarness,
  capabilityId: string,
  tenantId: string,
): Promise<void> {
  harness.rpcCapabilityTrips.delete(`${tenantId}|${capabilityId}`);
  harness.rpcCapabilityTrips.delete(`null|${capabilityId}`);
  await resetSafetyKillSwitch(client, {
    tenant_id: tenantId,
    capability: capabilityId,
    actor_id: "integration-test",
  });
  await resetSafetyKillSwitch(client, {
    tenant_id: null,
    capability: null,
    actor_id: "integration-test",
  });
}

export async function tripGlobalHalt(client: SupabaseClient): Promise<void> {
  await tripSafetyKillSwitch(client, {
    tenant_id: null,
    capability: null,
    reason: "integration_global_halt",
    actor_id: "integration-test",
  });
}
