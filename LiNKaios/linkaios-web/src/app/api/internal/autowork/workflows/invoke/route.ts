import { NextResponse } from "next/server";
import type { WorkflowInvokeRequest } from "@linktrend/linklogic-sdk";
import { loadEnv } from "@linktrend/shared-config";
import { ensureLinkAutoworkWorkflows, invokeLinkAutoworkWorkflow } from "@/lib/kernel/linkautowork-runtime";

function authorize(request: Request): boolean {
  const expected =
    process.env.LINKAUTOWORK_INVOKE_SECRET?.trim() ||
    process.env.BOT_KERNEL_API_SECRET?.trim();
  if (!expected) return false;
  const header = request.headers.get("x-linkautowork-invoke-secret");
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return header === expected || bearer === expected;
}

export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: WorkflowInvokeRequest;
  try {
    body = (await request.json()) as WorkflowInvokeRequest;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.workflow_handle || !body.tenant_id || !body.run_id || !body.idempotency_key) {
    return NextResponse.json(
      { error: "workflow_handle, tenant_id, run_id, and idempotency_key are required" },
      { status: 400 },
    );
  }

  const env = loadEnv();
  await ensureLinkAutoworkWorkflows(env);
  const result = await invokeLinkAutoworkWorkflow(env, {
    tenant_id: body.tenant_id,
    run_id: body.run_id,
    stage_id: body.stage_id ?? body.workflow_handle,
    workflow_handle: body.workflow_handle,
    inputs: body.inputs ?? {},
    lease_id: body.lease_id,
    idempotency_key: body.idempotency_key,
  });

  return NextResponse.json(result, { status: result.status === "succeeded" ? 200 : 422 });
}
