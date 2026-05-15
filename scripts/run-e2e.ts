import 'dotenv/config';

const CANONICAL_CODES = {
  dispatch: "KERNEL_DISPATCH_FAILED",
  persistence: "KERNEL_PERSISTENCE_FAILED",
} as const;

const REQUIRED_V2_STAGE_IDS = [
  "lead_intake",
  "research_enrichment",
  "website_package_generation",
  "artifact_write_local",
  "supabase_mirror_upsert",
  "payload_sync_local",
  "preview_readiness_check",
  "crm_ready_to_contact_mark",
  "plane_execution_tracking",
  "zulip_run_notify",
  "record_run",
] as const;
const STAGES_REQUIRING_AUDIT_REFS = [
  "research_enrichment",
  "website_package_generation",
  "artifact_write_local",
  "supabase_mirror_upsert",
  "payload_sync_local",
  "preview_readiness_check",
  "crm_ready_to_contact_mark",
  "plane_execution_tracking",
  "zulip_run_notify",
] as const;
const STAGES_REQUIRING_WORKFLOW_REFS = [
  "artifact_write_local",
  "supabase_mirror_upsert",
  "payload_sync_local",
  "preview_readiness_check",
  "crm_ready_to_contact_mark",
] as const;
const STAGES_REQUIRING_LEASE_IDS = [
  "research_enrichment",
  "website_package_generation",
  "supabase_mirror_upsert",
  "payload_sync_local",
  "crm_ready_to_contact_mark",
  "plane_execution_tracking",
  "zulip_run_notify",
] as const;
const FORBIDDEN_STAGE_IDS = ["lead_scout", "outreach", "publish_live", "deploy_vps"] as const;

type CanonicalCode = (typeof CANONICAL_CODES)[keyof typeof CANONICAL_CODES];

function fail(code: CanonicalCode, message: string): never {
  throw new Error(`[${code}] ${message}`);
}

function parseCanonicalFailure(err: unknown): { code: CanonicalCode; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  const msg = raw.toLowerCase();

  if (
    msg.includes("missing required env") ||
    msg.includes("supabase") ||
    msg.includes("database") ||
    msg.includes("enotfound") ||
    msg.includes("getaddrinfo")
  ) {
    return { code: CANONICAL_CODES.persistence, message: raw };
  }

  if (
    msg.includes("econnrefused") ||
    msg.includes("fetch failed") ||
    msg.includes("unauthorized") ||
    msg.includes("work request failed") ||
    msg.includes("execute failed")
  ) {
    return { code: CANONICAL_CODES.dispatch, message: raw };
  }

  return { code: CANONICAL_CODES.dispatch, message: raw };
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    fail(CANONICAL_CODES.dispatch, `Missing required env: ${name}`);
  }
  return value;
}

async function fetchJsonOrFail(url: string, init?: RequestInit): Promise<any> {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`${init?.method || "GET"} ${url} failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function main() {
  const appBaseUrl = process.env.MVO_E2E_BASE_URL?.trim() || "http://localhost:3000";
  const baseUrl = `${appBaseUrl}/api/kernel`;
  const authHeader = `Bearer ${requireEnv("BOT_KERNEL_API_SECRET")}`;
  const tenantId = process.env.MVO_E2E_TENANT_ID?.trim() || "e976eb75-1aff-4ca1-ad0d-5c940c343434";
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseServiceKey = requireEnv("SUPABASE_SECRET_KEY");

  console.log("1. Submitting Work Request...");
  const wrPayload = {
    plugin_id: "websitefactory",
    work_request_type: "websitefactory.lead_to_preview",
    tenant_id: tenantId,
    lead_input: {
      tenant_id: tenantId,
      source: "manual",
      business_name: "Acme Widgets",
      industry: "Manufacturing",
      contact: {
        name: "Wile E. Coyote",
        email: "wile@acme.com",
        phone: "+18005551234"
      },
      client_idempotency_key: "test-run-" + Date.now()
    }
  };

  const wrData = await fetchJsonOrFail(`${baseUrl}/work-request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": authHeader,
    },
    body: JSON.stringify(wrPayload),
  });
  const runId = wrData.run_id;
  if (!runId) {
    fail(CANONICAL_CODES.dispatch, "Kernel did not return run_id");
  }
  console.log(`✅ Created run: ${runId}`);
  
  console.log("\n2. Executing Run Loop...");
  let runStatus = "running";
  let finalOutputs: Record<string, unknown> = {};
  
  while (runStatus === "running" || runStatus === "awaiting_approval") {
    const execRes = await fetch(`${baseUrl}/run/${runId}/execute`, {
      method: "POST",
      headers: { "Authorization": authHeader },
    });

    if (!execRes.ok) throw new Error(`Execute failed: ${execRes.status} ${await execRes.text()}`);

    const execData = await execRes.json();
    finalOutputs = (execData?.outputs || {}) as Record<string, unknown>;
    runStatus = execData.status;
    console.log(`⏳ Execute returned status: ${runStatus}`);
    
    if (runStatus === "awaiting_approval") {
      console.log("   Fetching pending approvals...");
      const approvalsData = await fetchJsonOrFail(`${baseUrl}/approvals?tenant_id=${tenantId}`, {
        headers: { "Authorization": authHeader },
      });
      console.log("Approvals data:", JSON.stringify(approvalsData, null, 2));
      
      if (!approvalsData.approvals) {
        throw new Error("Missing approvals array in response");
      }
      
      const myApprovals = approvalsData.approvals.filter((a: any) => a.run_id === runId);
      if (myApprovals.length === 0) {
        console.log("No pending approvals found for this run, but status is awaiting_approval!");
        break;
      }
      
      for (const a of myApprovals) {
        console.log(`   Approving ${a.capability_id} (ID: ${a.approval_id})...`);
        const approveRes = await fetch(`${baseUrl}/approvals?approval_id=${a.approval_id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": authHeader,
          },
          body: JSON.stringify({ decision: "granted", reason: "E2E Demo Approval" }),
        });
        if (!approveRes.ok) throw new Error(`Approval failed: ${approveRes.status} ${await approveRes.text()}`);
      }
      // Loop continues, will call execute again
    } else if (runStatus !== "running") {
      break;
    }
  }
  
  console.log(`\n✅ Run finished with status: ${runStatus}`);
  if (runStatus !== "succeeded") {
    fail(CANONICAL_CODES.dispatch, `Run status must be succeeded, got ${runStatus}`);
  }
  
  console.log("\n3. Trace Data:");
  const traceData = await fetchJsonOrFail(`${baseUrl}/run/${runId}/trace`, {
    headers: { "Authorization": authHeader },
  });
  console.log(JSON.stringify(traceData, null, 2));
  const stages = Array.isArray(traceData?.stages) ? traceData.stages : [];

  if (stages.length === 0) {
    fail(CANONICAL_CODES.dispatch, "Trace missing stages");
  }

  const stageById = new Map<string, any>();
  for (const stage of stages) {
    if (stage?.stage_id) {
      stageById.set(stage.stage_id, stage);
    }
  }

  for (const stageId of REQUIRED_V2_STAGE_IDS) {
    if (!stageById.has(stageId)) {
      fail(CANONICAL_CODES.dispatch, `Missing required v2 stage in trace: ${stageId}`);
    }
  }

  for (const stageId of FORBIDDEN_STAGE_IDS) {
    if (stageById.has(stageId)) {
      fail(CANONICAL_CODES.dispatch, `Forbidden stage appeared in run trace: ${stageId}`);
    }
  }

  for (const stageId of STAGES_REQUIRING_AUDIT_REFS) {
    const stage = stageById.get(stageId);
    if (!stage) continue;
    if (stage.status !== "succeeded") {
      fail(CANONICAL_CODES.dispatch, `Stage must succeed: ${stageId} (got ${stage.status})`);
    }
    const refs = stage.refs || {};
    const auditEventIdsForStage = Array.isArray(refs.audit_event_ids) ? refs.audit_event_ids : [];
    if (auditEventIdsForStage.length === 0) {
      fail(CANONICAL_CODES.dispatch, `Stage ${stageId} must have non-empty audit_event_ids`);
    }
  }

  for (const stageId of STAGES_REQUIRING_WORKFLOW_REFS) {
    const stage = stageById.get(stageId);
    if (!stage) continue;
    const refs = stage.refs || {};
    const workflowRunIdsForStage = Array.isArray(refs.workflow_run_ids) ? refs.workflow_run_ids : [];
    if (workflowRunIdsForStage.length === 0) {
      fail(CANONICAL_CODES.dispatch, `Stage ${stageId} must have non-empty workflow_run_ids`);
    }
  }

  for (const stageId of STAGES_REQUIRING_LEASE_IDS) {
    const stage = stageById.get(stageId);
    if (!stage) continue;
    const refs = stage.refs || {};
    const leaseIdsForStage = Array.isArray(refs.lease_ids) ? refs.lease_ids : [];
    if (leaseIdsForStage.length === 0) {
      fail(CANONICAL_CODES.dispatch, `Stage ${stageId} must have non-empty lease_ids`);
    }
  }

  const previewOutput = traceData?.preview_output;
  if (!previewOutput) {
    fail(CANONICAL_CODES.dispatch, "Trace missing preview_output");
  }

  if (!previewOutput.preview_artifact_ref) {
    fail(CANONICAL_CODES.dispatch, "preview_artifact_ref is missing");
  }

  const leaseIds = Array.isArray(previewOutput.lease_ids) ? previewOutput.lease_ids : [];
  const workflowRunIds = Array.isArray(previewOutput.workflow_run_ids) ? previewOutput.workflow_run_ids : [];
  const auditEventIds = Array.isArray(previewOutput.audit_event_ids) ? previewOutput.audit_event_ids : [];

  if (leaseIds.length === 0) fail(CANONICAL_CODES.dispatch, "lease_ids must be non-empty");
  if (workflowRunIds.length === 0) fail(CANONICAL_CODES.dispatch, "workflow_run_ids must be non-empty");
  if (auditEventIds.length === 0) fail(CANONICAL_CODES.dispatch, "audit_event_ids must be non-empty");
  if (previewOutput.status !== "succeeded") {
    fail(CANONICAL_CODES.dispatch, `preview_output.status must be succeeded, got ${previewOutput.status}`);
  }
  if (typeof previewOutput.preview_url !== "string" || !previewOutput.preview_url.startsWith("http")) {
    fail(CANONICAL_CODES.dispatch, "preview_output.preview_url must be an absolute http(s) URL");
  }
  if (previewOutput.preview_url.includes("digitalocean") || previewOutput.preview_url.includes("https://")) {
    fail(
      CANONICAL_CODES.dispatch,
      `preview_output.preview_url indicates non-local or hosted mode: ${previewOutput.preview_url}`,
    );
  }
  if (!finalOutputs.lead_research_bundle) {
    fail(CANONICAL_CODES.dispatch, "Run outputs missing lead_research_bundle");
  }
  if (!finalOutputs.website_package) {
    fail(CANONICAL_CODES.dispatch, "Run outputs missing website_package");
  }
  if (finalOutputs.lead_status !== "ready_to_contact") {
    fail(
      CANONICAL_CODES.dispatch,
      `Run outputs lead_status must be ready_to_contact, got ${String(finalOutputs.lead_status)}`,
    );
  }

  const eventIdCsv = auditEventIds.join(",");
  const auditRows = await fetchJsonOrFail(
    `${supabaseUrl}/rest/v1/audit_events?select=event_id,action,subject&event_id=in.(${eventIdCsv})`,
    {
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Accept-Profile": "linkbrain",
      },
    },
  );

  if (!Array.isArray(auditRows) || auditRows.length === 0) {
    fail(CANONICAL_CODES.persistence, "No LiNKbrain audit events resolved from audit_event_ids");
  }
  const runAuditRows = await fetchJsonOrFail(
    `${supabaseUrl}/rest/v1/audit_events?select=event_id,action,subject&subject->>run_id=eq.${runId}`,
    {
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Accept-Profile": "linkbrain",
      },
    },
  );

  if (!Array.isArray(runAuditRows) || runAuditRows.length === 0) {
    fail(CANONICAL_CODES.persistence, "No run-scoped LiNKbrain audit rows resolved");
  }

  console.log("\n4. Assertions passed");
  console.log(`Preview URL: ${previewOutput.preview_url || "undefined"}`);
  console.log(`preview_artifact_ref: ${previewOutput.preview_artifact_ref}`);
  console.log(`lease_ids: ${leaseIds.length}`);
  console.log(`workflow_run_ids: ${workflowRunIds.length}`);
  console.log(`audit_event_ids: ${auditEventIds.length}`);
  console.log(`required_v2_stages_verified: ${REQUIRED_V2_STAGE_IDS.length}`);
  console.log(`crm_ready_to_contact_verified: ${finalOutputs.lead_status === "ready_to_contact"}`);
  console.log("run_scoped_audit_rows_verified: true");
}

main().catch((err) => {
  const mapped = parseCanonicalFailure(err);
  console.error(`[${mapped.code}] ${mapped.message}`);
  process.exitCode = 1;
});
