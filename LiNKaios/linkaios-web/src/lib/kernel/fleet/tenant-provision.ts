/**
 * Tenant fleet provision — CEO profile + council flag (Wave 5.2).
 *
 * @see docs/ecosystem/FLEET_AND_RUNTIME_POLICY.md §3
 */

export type TenantKind = "admin" | "client";

export type FleetOpenClawSlot = {
  openclawAgentId: string;
  slotKind: "ceo" | "suite_head" | "suite_role";
  suiteId?: string;
  roleId?: string;
};

export type TenantFleetProvisionInput = {
  tenantId: string;
  slug: string;
  displayName: string;
  tenantKind: TenantKind;
  /** Base Client subscription includes LLM Council (Wave 3.5). */
  llmCouncilEntitled?: boolean;
};

export type TenantFleetProvisionResult = {
  tenantId: string;
  tenantKind: TenantKind;
  llmCouncilEntitled: boolean;
  bindings: FleetOpenClawSlot[];
};

/** Deterministic fleet bindings applied on tenant create. */
export function buildTenantFleetProvision(
  input: TenantFleetProvisionInput,
): TenantFleetProvisionResult {
  const llmCouncilEntitled =
    input.tenantKind === "client" ? (input.llmCouncilEntitled ?? true) : (input.llmCouncilEntitled ?? false);

  const bindings: FleetOpenClawSlot[] =
    input.tenantKind === "admin"
      ? [
          {
            openclawAgentId: "admin-openclaw",
            slotKind: "ceo",
            roleId: "admin_openclaw_linkbot",
          },
        ]
      : [
          {
            openclawAgentId: "ceo-client",
            slotKind: "ceo",
            roleId: "ceo_client_linkbot",
          },
        ];

  return {
    tenantId: input.tenantId,
    tenantKind: input.tenantKind,
    llmCouncilEntitled,
    bindings,
  };
}

/** JSON config fragment stored in tenants.config_json.fleet. */
export function tenantFleetConfigJson(result: TenantFleetProvisionResult): Record<string, unknown> {
  return {
    fleet: {
      tenant_kind: result.tenantKind,
      llm_council_entitled: result.llmCouncilEntitled,
      openclaw_bindings: result.bindings.map((b) => ({
        openclaw_agent_id: b.openclawAgentId,
        slot_kind: b.slotKind,
        suite_id: b.suiteId ?? null,
        role_id: b.roleId ?? null,
      })),
    },
  };
}
