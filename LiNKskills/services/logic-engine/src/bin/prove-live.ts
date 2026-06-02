/**
 * Prove LinkSkills lease + audit for Plane and Zulip connectivity probes.
 *
 * Usage (from logic-engine package, repo .env via DOTENV_CONFIG_PATH):
 *   LINKSKILLS_LIVE_OPS=1 pnpm prove:live
 */

import { createSupabaseServiceClient } from "@linktrend/db";
import { loadEnv } from "@linktrend/shared-config";
import { executeGrantedLease, grantLease, requestLease } from "../index.js";

async function proveCapability(
  env: ReturnType<typeof loadEnv>,
  params: {
    tenant_id: string;
    run_id: string;
    capability: string;
    arguments: Record<string, unknown>;
  },
): Promise<{ lease_id: string; ok: boolean; detail: string }> {
  const client = createSupabaseServiceClient(env);
  const stage_id = `prove-${params.capability.replace(/\./g, "-")}`;

  const requested = await requestLease(client, env, {
    tenant_id: params.tenant_id,
    run_id: params.run_id,
    stage_id,
    capability: params.capability,
    arguments: params.arguments,
    idempotency_key: `${params.run_id}:${stage_id}:${params.capability}`,
    actor: { actor_kind: "plugin", actor_id: "prove-linkskills" },
  });

  if (requested.status !== "granted" && requested.status !== "requires_approval") {
    if (requested.status === "requested") {
      await grantLease(client, requested.lease_id, "granted", "proof script auto-grant", 300);
    } else {
      return {
        lease_id: requested.lease_id,
        ok: false,
        detail: requested.failure?.message ?? `status=${requested.status}`,
      };
    }
  }

  if (requested.status === "requires_approval") {
    await grantLease(client, requested.lease_id, "granted", "proof script approval", 300);
  }

  const exec = await executeGrantedLease(env, {
    lease_id: requested.lease_id,
    idempotency_key: `${params.run_id}:${stage_id}:${params.capability}`,
  });

  if (exec.failure) {
    return { lease_id: requested.lease_id, ok: false, detail: exec.failure.message };
  }

  return {
    lease_id: requested.lease_id,
    ok: true,
    detail: JSON.stringify(exec.result).slice(0, 400),
  };
}

async function resolveTenantId(
  env: ReturnType<typeof loadEnv>,
  client: ReturnType<typeof createSupabaseServiceClient>,
): Promise<string> {
  const fromEnv =
    env.CALUSA_TENANT_ID?.trim() || process.env.MVO_E2E_TENANT_ID?.trim();
  if (fromEnv) return fromEnv;

  const { data: existing, error: lookupErr } = await client
    .schema("linkaios_kernel")
    .from("tenants")
    .select("tenant_id")
    .eq("slug", "calusa")
    .maybeSingle();
  if (!lookupErr && existing?.tenant_id) {
    return existing.tenant_id as string;
  }

  const { data, error } = await client.schema("linkaios_kernel").rpc("seed_demo_tenant", {
    p_slug: "calusa",
    p_display_name: "Calusa Tenant",
  });
  if (error || !data?.length) {
    throw new Error(`Failed to resolve Calusa tenant: ${error?.message ?? "empty result"}`);
  }
  const row = data[0] as { tenant_id?: string };
  if (!row.tenant_id) {
    throw new Error("seed_demo_tenant returned no tenant_id for Calusa");
  }
  return row.tenant_id;
}

async function main() {
  const env = loadEnv();
  const client = createSupabaseServiceClient(env);
  const tenant_id = await resolveTenantId(env, client);
  const idem = `prove-${Date.now()}`;
  const { data: wrRows, error: wrErr } = await client.schema("linkaios_kernel").rpc("create_work_request", {
    p_tenant_id: tenant_id,
    p_plugin_id: "websitefactory",
    p_work_request_type: "prove_linkskills",
    p_payload: { purpose: "linkskills_live_proof" },
    p_requested_by_actor_kind: "system",
    p_requested_by_actor_id: "prove-linkskills",
    p_idempotency_key: idem,
  });
  if (wrErr || !wrRows?.length) {
    throw new Error(`create_work_request failed: ${wrErr?.message ?? "empty"}`);
  }
  const work_request_id = (wrRows[0] as { work_request_id: string }).work_request_id;

  const { data: runRows, error: runErr } = await client.schema("linkaios_kernel").rpc("create_run", {
    p_work_request_id: work_request_id,
    p_tenant_id: tenant_id,
    p_plugin_id: "websitefactory",
  });
  if (runErr || !runRows?.length) {
    throw new Error(`create_run failed: ${runErr?.message ?? "empty"}`);
  }
  const run_id = (runRows[0] as { run_id: string }).run_id;

  console.log("LinkSkills live lease proof");
  console.log(`tenant_id=${tenant_id}`);
  console.log(`run_id=${run_id}`);
  console.log(`LINKSKILLS_LIVE_OPS=${env.LINKSKILLS_LIVE_OPS ?? "(unset)"}`);

  const zulip = await proveCapability(env, {
    tenant_id,
    run_id,
    capability: "cap.zulip.run_messaging",
    arguments: { operation: "connectivity.probe", mode: "shadow" },
  });

  const plane = await proveCapability(env, {
    tenant_id,
    run_id,
    capability: "cap.plane.execution_tracking",
    arguments: { operation: "readiness.probe", mode: "shadow" },
  });

  console.log("\n--- Results ---");
  console.log(`Zulip lease_id=${zulip.lease_id} ok=${zulip.ok}`);
  console.log(zulip.detail);
  console.log(`Plane lease_id=${plane.lease_id} ok=${plane.ok}`);
  console.log(plane.detail);

  if (!zulip.ok || !plane.ok) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
