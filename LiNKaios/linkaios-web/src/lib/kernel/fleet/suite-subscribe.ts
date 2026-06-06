/**
 * Suite subscribe — module entitlements + OpenClaw head slot allocation (Wave 5.3).
 *
 * Kernel rejects over-cap subscribe attempts before side effects.
 */

import type { FleetOpenClawSlot } from "./tenant-provision";

export type SuiteSubscribeInput = {
  tenantId: string;
  tenantKind: "admin" | "client";
  suiteId: string;
  moduleIds: string[];
  existingBindings: FleetOpenClawSlot[];
};

export type SuiteSubscribeResult =
  | {
      ok: true;
      suiteId: string;
      moduleIds: string[];
      newBindings: FleetOpenClawSlot[];
      allBindings: FleetOpenClawSlot[];
    }
  | { ok: false; code: "SUITE_NOT_ALLOWED" | "FLEET_OVER_CAP" | "UNKNOWN_SUITE"; message: string };

/** Global gateway cap — five OpenClaw profiles on fleet v1 gateway. */
export const FLEET_V1_GATEWAY_OPENCLAW_CAP = 5;

/** Suite head slots allocated on subscribe (excluding CEO binding from provision). */
const SUITE_HEAD_SLOTS: Record<
  string,
  { tenantKinds: Array<"admin" | "client">; slots: FleetOpenClawSlot[] }
> = {
  linksites: {
    tenantKinds: ["client"],
    slots: [
      {
        openclawAgentId: "linksites-head",
        slotKind: "suite_head",
        suiteId: "linksites",
        roleId: "outreach_bot",
      },
    ],
  },
  linkdeveloper: {
    tenantKinds: ["client"],
    slots: [
      {
        openclawAgentId: "linkdeveloper-orchestrator",
        slotKind: "suite_head",
        suiteId: "linkdeveloper",
        roleId: "suite_orchestrator_linkbot",
      },
      {
        openclawAgentId: "linkdeveloper-steward",
        slotKind: "suite_role",
        suiteId: "linkdeveloper",
        roleId: "product_steward_linkbot",
      },
    ],
  },
  linksuitegen: {
    tenantKinds: ["admin"],
    slots: [],
  },
};

export function suiteHeadSlotsForSubscribe(
  suiteId: string,
  tenantKind: "admin" | "client",
): FleetOpenClawSlot[] {
  const def = SUITE_HEAD_SLOTS[suiteId];
  if (!def || !def.tenantKinds.includes(tenantKind)) return [];
  return def.slots.map((s) => ({ ...s }));
}

export function countDistinctOpenClawAgents(bindings: FleetOpenClawSlot[]): number {
  return new Set(bindings.map((b) => b.openclawAgentId)).size;
}

export function subscribeSuiteFleet(input: SuiteSubscribeInput): SuiteSubscribeResult {
  const def = SUITE_HEAD_SLOTS[input.suiteId];
  if (!def) {
    return { ok: false, code: "UNKNOWN_SUITE", message: `Unknown suite: ${input.suiteId}` };
  }

  if (!def.tenantKinds.includes(input.tenantKind)) {
    return {
      ok: false,
      code: "SUITE_NOT_ALLOWED",
      message: `Suite ${input.suiteId} is not available for ${input.tenantKind} tenants`,
    };
  }

  const newBindings = suiteHeadSlotsForSubscribe(input.suiteId, input.tenantKind);
  const existingAgents = new Set(input.existingBindings.map((b) => b.openclawAgentId));
  const toAdd = newBindings.filter((b) => !existingAgents.has(b.openclawAgentId));

  const merged = [...input.existingBindings];
  for (const slot of toAdd) {
    merged.push(slot);
  }

  if (countDistinctOpenClawAgents(merged) > FLEET_V1_GATEWAY_OPENCLAW_CAP) {
    return {
      ok: false,
      code: "FLEET_OVER_CAP",
      message: `Subscribe would exceed gateway OpenClaw cap (${FLEET_V1_GATEWAY_OPENCLAW_CAP})`,
    };
  }

  return {
    ok: true,
    suiteId: input.suiteId,
    moduleIds: input.moduleIds,
    newBindings: toAdd,
    allBindings: merged,
  };
}

/** Module entitlement record shape for tenant_suite_entitlements table. */
export function suiteEntitlementRow(input: {
  tenantId: string;
  suiteId: string;
  moduleIds: string[];
}): Record<string, unknown> {
  return {
    tenant_id: input.tenantId,
    suite_id: input.suiteId,
    module_ids: input.moduleIds,
    enabled: true,
  };
}
