import 'dotenv/config';

const CANONICAL_CODES = {
  dispatch: "KERNEL_DISPATCH_FAILED",
  persistence: "KERNEL_PERSISTENCE_FAILED",
} as const;

const REQUIRED_SUCCESS_AUDIT_COUNTS = {
  "run.started": 1,
  "crm.upserted": 1,
  "plane.project.created": 1,
  "plane.task.created": 1,
  "preview.published": 1,
  "run.completed": 1,
} as const;

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
  
  while (runStatus === "running" || runStatus === "awaiting_approval") {
    const execRes = await fetch(`${baseUrl}/run/${runId}/execute`, {
      method: "POST",
      headers: { "Authorization": authHeader },
    });

    if (!execRes.ok) throw new Error(`Execute failed: ${execRes.status} ${await execRes.text()}`);

    const execData = await execRes.json();
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
  const previewOutputActionCounts = new Map<string, number>();
  for (const row of auditRows) {
    const action = row?.action as string | undefined;
    if (!action) continue;
    previewOutputActionCounts.set(action, (previewOutputActionCounts.get(action) || 0) + 1);
  }
  for (const [action, expectedCount] of Object.entries(REQUIRED_SUCCESS_AUDIT_COUNTS)) {
    const actualCount = previewOutputActionCounts.get(action) || 0;
    if (actualCount !== expectedCount) {
      fail(
        CANONICAL_CODES.persistence,
        `PreviewOutput audit refs missing or duplicated required action ${action}: expected ${expectedCount}, got ${actualCount}`,
      );
    }
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

  const runScopedActionCounts = new Map<string, number>();
  for (const row of Array.isArray(runAuditRows) ? runAuditRows : []) {
    const action = row?.action as string | undefined;
    if (!action) continue;
    runScopedActionCounts.set(action, (runScopedActionCounts.get(action) || 0) + 1);
  }

  for (const [action, expectedCount] of Object.entries(REQUIRED_SUCCESS_AUDIT_COUNTS)) {
    const actualCount = runScopedActionCounts.get(action) || 0;
    if (actualCount !== expectedCount) {
      fail(
        CANONICAL_CODES.persistence,
        `Required LiNKbrain audit action count mismatch for ${action}: expected ${expectedCount}, got ${actualCount}`,
      );
    }
  }

  console.log("\n4. Assertions passed");
  console.log(`Preview URL: ${previewOutput.preview_url || "undefined"}`);
  console.log(`preview_artifact_ref: ${previewOutput.preview_artifact_ref}`);
  console.log(`lease_ids: ${leaseIds.length}`);
  console.log(`workflow_run_ids: ${workflowRunIds.length}`);
  console.log(`audit_event_ids: ${auditEventIds.length}`);
  console.log(`verified_required_audit_counts: ${JSON.stringify(REQUIRED_SUCCESS_AUDIT_COUNTS)}`);
}

main().catch((err) => {
  const mapped = parseCanonicalFailure(err);
  console.error(`[${mapped.code}] ${mapped.message}`);
  process.exitCode = 1;
});
